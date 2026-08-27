import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Mic,
  MicOff,
  Image as ImageIcon,
  Send,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { runAIJob, normalizeBase64, inferMimeType } from '../lib/ai';
import { useToast } from '../components/ui/ToastProvider';
import { humanVoice } from '../lib/humanVoice';
import { formatAIReport } from '../lib/formatReport';
import { LoadingText } from '../components/ui/LoadingText';
import { MascotAnimation } from '../components/ui/MascotAnimation';
import { isValidUUID } from '../lib/utils';
import { PRIMARY_DEMO_PATIENT } from '../data/unifiedDemoData';

// Minimal Web Speech API typings
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResultLike {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}
interface SpeechRecognitionResultListLike {
  readonly length: number;
  item(index: number): SpeechRecognitionResultLike;
  [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  images?: string[];
  timestamp?: string;
}

export function AIAssistantPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      text: '¡Hola! Soy Physi, tu asistente personal de rehabilitación en FisioMirror. Estoy aquí para acompañar tu recuperación, resolver dudas sobre tus ejercicios asignados y analizar tu progreso. ¿Cómo te sientes hoy?',
      timestamp: 'Ahora',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadConversation();
  }, [user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const loadConversation = async () => {
    if (!user?.id || !isValidUUID(user.id)) return;
    try {
      const { data } = await supabase
        .from('ai_conversations')
        .select('role, content, images, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(30);

      if (data && data.length > 0) {
        setMessages(
          data.map((d, i) => ({
            id: `db-${i}`,
            role: d.role as 'user' | 'assistant',
            text: d.content,
            images: d.images ?? undefined,
            timestamp: d.created_at
              ? new Date(d.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              : undefined,
          }))
        );
      }
    } catch {
      // keep default message
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Mensaje copiado');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakToggle = (id: string, text: string) => {
    if (currentlySpeakingId === id) {
      humanVoice.stop();
      setCurrentlySpeakingId(null);
    } else {
      humanVoice.stop();
      setCurrentlySpeakingId(id);
      humanVoice.speak(text, {
        onEnd: () => setCurrentlySpeakingId(null),
        onError: () => setCurrentlySpeakingId(null),
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      stopRecording();
      humanVoice.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const transcribeWithWebSpeech = (): boolean => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return false;
    const recognition = new Ctor();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: SpeechRecognitionEventLike) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        setInput((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      return true;
    } catch {
      return false;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopRecording();
      setIsRecording(false);
    } else {
      const started = transcribeWithWebSpeech();
      if (!started) {
        toast.info('Reconocimiento de voz no disponible en este navegador');
      }
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const messageText = (overrideText || input).trim();
    if ((!messageText && images.length === 0) || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      images: images.length > 0 ? [...images] : undefined,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const sentImages = [...images];
    setImages([]);
    setLoading(true);

    const isRealUser = user?.id && isValidUUID(user.id);

    try {
      if (isRealUser) {
        await supabase.from('ai_conversations').insert({
          user_id: user.id,
          role: 'user',
          content: messageText,
          images: sentImages.length > 0 ? sentImages : null,
        });
      }

      let inputContext: Record<string, any> = {};
      let contextStr = '';

      if (isRealUser) {
        const [profileRes, statsRes, routinesRes] = await Promise.allSettled([
          supabase.from('profiles').select('full_name, diagnostico, notas_medicas').eq('id', user.id).single(),
          supabase.from('patient_stats').select('adherencia, racha_dias, precision_promedio').eq('patient_id', user.id).single(),
          supabase.from('patient_routines').select('name, exercises').eq('patient_id', user.id).eq('active', true),
        ]);

        const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
        const stats = statsRes.status === 'fulfilled' ? statsRes.value.data : null;
        const routines = routinesRes.status === 'fulfilled' ? routinesRes.value.data : null;

        inputContext = { profile, stats, routines };
        contextStr = [
          profile?.full_name ? `Paciente: ${profile.full_name}` : '',
          profile?.diagnostico ? `Diagnóstico: ${profile.diagnostico}` : '',
          stats?.racha_dias ? `Racha de rehabilitación: ${stats.racha_dias} días consecutivos` : '',
          stats?.adherencia ? `Adherencia: ${stats.adherencia}%` : '',
        ].filter(Boolean).join('. ');
      } else {
        inputContext = { demo: PRIMARY_DEMO_PATIENT };
        contextStr = `Paciente Demo: ${PRIMARY_DEMO_PATIENT.name}. Diagnóstico: ${PRIMARY_DEMO_PATIENT.condition}. Racha: 4 días. Progreso: ${PRIMARY_DEMO_PATIENT.recoveryProgress}%.`;
      }

      const promptSystem = `Eres Physi, un asistente virtual de fisioterapia empático, profesional y motivador en la app FisioMirror.
Responde de forma estructurada, clara y cálida. Si sugieres ejercicios, recuerda siempre indicar la importancia de la postura y no sobrepasar el umbral de dolor. Responde SIEMPRE en español.`;

      const fullPrompt = `${promptSystem}

Contexto del paciente: ${contextStr}

Pregunta del paciente: ${messageText}`;

      const hasImages = sentImages.length > 0;
      const aiResult = hasImages
        ? await runAIJob('image_analysis', {
            userPrompt: fullPrompt,
            imageBase64: sentImages.map((img) => normalizeBase64(img)).join(','),
            mimeType: sentImages.map((img) => inferMimeType(img, 'image/jpeg')).join(','),
            context: { patientData: inputContext, contextSummary: contextStr },
          })
        : await runAIJob('text_generation', {
            userPrompt: fullPrompt,
            context: { patientData: inputContext, contextSummary: contextStr },
          });

      let assistantText: string;
      if (aiResult.success && aiResult.result) {
        assistantText = aiResult.result;
        try {
          const parsed = JSON.parse(assistantText);
          if (parsed.hallazgos || parsed.recomendaciones || parsed.evaluacion_clinica) {
            assistantText = `${parsed.evaluacion_clinica || parsed.hallazgos || ''}\n\n${parsed.recomendaciones || ''}`;
          }
        } catch {
          // Normal text
        }
      } else {
        assistantText =
          'He revisado tu consulta. Recuerda mantener un rango de movimiento suave y constante sin forzar la articulación. Para recomendaciones específicas sobre tu plan, consulta la sección de ejercicios asignados.';
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (autoVoice) {
        setCurrentlySpeakingId(assistantMsg.id);
        humanVoice.speak(assistantText, {
          onEnd: () => setCurrentlySpeakingId(null),
          onError: () => setCurrentlySpeakingId(null),
        });
      }

      if (isRealUser) {
        await supabase.from('ai_conversations').insert({
          user_id: user?.id,
          role: 'assistant',
          content: assistantText,
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'No pude conectar en este momento. Por favor intenta nuevamente.',
          timestamp: 'Ahora',
        },
      ]);
      toast.error('Error al consultar a Physi');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: '¿Qué ejercicios me tocan hoy?', prompt: '¿Cuáles son mis ejercicios recomendados para el día de hoy?' },
    { label: '¿Cómo va mi progreso?', prompt: 'Explícame mi progreso de recuperación actual y qué debo seguir reforzando.' },
    { label: 'Consejos para aliviar dolor', prompt: 'Siento ligera molestia tras la sesión, ¿qué consejos de autocuidado puedo aplicar de forma segura?' },
    { label: 'Mejorar postura en AR', prompt: '¿Qué recomendaciones me das para calibrar y ejecutar mejor mis ejercicios frente a la cámara?' },
  ];

  return (
    <div className="h-full flex flex-col gap-3 sm:gap-4 overflow-hidden min-h-0 pb-2">
      {/* Patient Recovery Context Card */}
      <div className="p-3 sm:p-4 rounded-3xl bg-surface/80 dark:bg-surface-container-low/70 border border-teal-500/20 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <MascotAnimation type="greeting" size="xs" className="breathe-blue shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-on-surface">Physi Asistente IA</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
                <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
                Guía de Rehabilitación
              </span>
            </div>
            <p className="text-xs text-on-surface-variant line-clamp-1">
              Acompañamiento biomecánico inteligente personalizado para tu terapia.
            </p>
          </div>
        </div>

        {/* Voice Autoplay Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAutoVoice(!autoVoice);
              if (autoVoice) humanVoice.stop();
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              autoVoice
                ? 'bg-teal-500/15 border-teal-500/30 text-teal-700 dark:text-teal-300'
                : 'bg-surface-container border-outline/15 text-outline'
            }`}
          >
            {autoVoice ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            <span>{autoVoice ? 'Voz Humana Activada' : 'Voz Silenciada'}</span>
          </button>
        </div>
      </div>

      {/* Chat messages viewport */}
      <div
        ref={scrollRef}
        className="glass-panel rounded-3xl p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 card-glow-hover relative section-bg-blue min-h-0"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[88%] sm:max-w-[80%] ${msg.role === 'user' ? '' : 'flex gap-3 items-start'}`}>
              {msg.role === 'assistant' && (
                <div className="mt-1 shrink-0">
                  <MascotAnimation
                    type={currentlySpeakingId === msg.id ? 'speaking' : 'idle'}
                    size="xs"
                    className="breathe-blue"
                  />
                </div>
              )}
              <div className="space-y-1.5 flex-1 min-w-0">
                {msg.images && msg.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.images.map((img, i) => (
                      <img key={i} src={img} alt="Adjunto" className="w-24 h-24 rounded-2xl object-cover border border-outline/15" />
                    ))}
                  </div>
                )}

                <div
                  className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none font-medium ml-auto'
                      : 'bg-surface/90 dark:bg-surface-container-low/90 border border-teal-500/20 text-on-surface rounded-tl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-3">
                      {formatAIReport(msg.text)}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  )}

                  {/* Actions for assistant message */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-3 border-t border-outline/10 flex items-center justify-between text-outline text-[11px]">
                      <span className="italic">{msg.timestamp || 'Hoy'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpeakToggle(msg.id, msg.text)}
                          className="p-1.5 rounded-xl hover:bg-teal-500/10 text-teal-600 dark:text-teal-400 transition-colors flex items-center gap-1 font-semibold"
                          title="Escuchar mensaje con voz humana"
                        >
                          {currentlySpeakingId === msg.id ? (
                            <>
                              <VolumeX className="size-3.5" />
                              <span>Detener</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="size-3.5" />
                              <span>Escuchar</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="p-1.5 rounded-xl hover:bg-surface-container text-outline hover:text-on-surface transition-colors flex items-center gap-1 font-semibold"
                          title="Copiar texto"
                        >
                          {copiedId === msg.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                          <span>{copiedId === msg.id ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-start max-w-[85%]">
              <MascotAnimation type="loading" size="xs" className="breathe-blue shrink-0 mt-1" />
              <div className="p-4 rounded-3xl bg-surface/90 dark:bg-surface-container-low/90 border border-teal-500/20 text-on-surface rounded-tl-none shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">
                  <Sparkles className="size-3.5 animate-spin" />
                  <span>Physi está analizando tu consulta...</span>
                </div>
                <LoadingText context="ai" className="block text-xs text-on-surface-variant italic" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 shrink-0 min-h-0">
        {quickPrompts.map((item, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sendMessage(item.prompt)}
            className="px-3 py-1.5 rounded-2xl bg-surface/70 dark:bg-surface-container-low/60 hover:bg-teal-500/10 border border-outline/15 hover:border-teal-500/30 text-xs font-medium text-on-surface transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <span>{item.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Image preview */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 shrink-0 min-h-0">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="" className="w-14 h-14 rounded-2xl object-cover border border-teal-500/30" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 size-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex gap-2 items-end shrink-0 min-h-0 bg-surface/70 dark:bg-surface-container-low/70 p-2 rounded-3xl border border-outline/15">
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Adjuntar imagen de ejercicio o molestia"
          className="size-11 rounded-2xl hover:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center transition-all shrink-0"
        >
          <ImageIcon className="size-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        <button
          onClick={toggleRecording}
          type="button"
          aria-label={isRecording ? 'Detener dictado de voz' : 'Dictar mensaje por voz'}
          className={`size-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
            isRecording
              ? 'bg-red-500/15 border border-red-500/40 text-red-600 animate-pulse'
              : 'hover:bg-teal-500/10 text-teal-600 dark:text-teal-400'
          }`}
        >
          {isRecording ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Escribe tu consulta a Physi (o presiona el micrófono)..."
          rows={1}
          className="flex-1 px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none resize-none text-on-surface placeholder:text-outline"
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || (!input.trim() && images.length === 0)}
          aria-label="Enviar mensaje a Physi"
          className="size-11 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shrink-0 shadow-sm"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
