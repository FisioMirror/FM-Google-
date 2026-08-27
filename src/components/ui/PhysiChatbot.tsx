import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  User,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAccessibility } from '../../hooks/useAccessibility';
import { runAIJob } from '../../lib/ai';
import { PHYSI_FAQS_FISIO, PHYSI_FAQS_PATIENT, matchFAQ } from '../../data/physiFAQs';
import { cn } from '../../lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{ label: string; route?: string }>;
}

/** Renderiza negritas inline de manera segura */
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-teal-900 dark:text-teal-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/** Renderiza markdown estructurado con soporte de encabezados, listas y viñetas */
function renderMarkdownContent(text: string): ReactNode {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let listItems: ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={key} className="space-y-1.5 my-2 pl-1.5 text-xs">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      flushList(`list-${lineIndex}`);
      blocks.push(
        <h4 key={lineIndex} className="font-bold text-xs uppercase tracking-wider text-teal-700 dark:text-teal-400 mt-2 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList(`list-${lineIndex}`);
      blocks.push(
        <h3 key={lineIndex} className="font-bold text-xs text-teal-900 dark:text-teal-200 mt-2 mb-1">
          {renderInline(trimmed.replace(/^#+\s/, ''))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const cleanLine = trimmed.replace(/^[-*•]\s+/, '');
      listItems.push(
        <li key={lineIndex} className="flex items-start gap-2 text-slate-800 dark:text-slate-200 text-xs">
          <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0 mt-0.5">•</span>
          <span className="flex-1 leading-relaxed">{renderInline(cleanLine)}</span>
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        listItems.push(
          <li key={lineIndex} className="flex items-start gap-2 text-slate-800 dark:text-slate-200 text-xs">
            <span className="text-teal-600 dark:text-teal-400 font-bold text-[11px] shrink-0 mt-0.5">{match[1]}.</span>
            <span className="flex-1 leading-relaxed">{renderInline(match[2])}</span>
          </li>
        );
      }
    } else if (trimmed === '') {
      flushList(`list-${lineIndex}`);
      blocks.push(<div key={`space-${lineIndex}`} className="h-1.5" />);
    } else {
      flushList(`list-${lineIndex}`);
      blocks.push(
        <p key={lineIndex} className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  flushList('list-end');
  return <div className="space-y-1">{blocks}</div>;
}

interface PhysiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhysiChatbot({ isOpen, onClose }: PhysiChatbotProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isFisio = user?.role === 'fisioterapeuta';
  const { speak, stopSpeaking } = useAccessibility();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: isFisio
        ? '¡Hola! Soy **Physi**, tu **Copiloto Clínico y Guía** en FisioMirror.\n\nPuedo orientarte con:\n- Dosificación de ejercicios y análisis de ROM\n- Prescripción y escaneo OCR de recetas\n- Gestión clínica y tokens de vinculación\n- Navegación rápida por todas las herramientas.'
        : '¡Hola! Soy **Physi**, tu **Guía de Rehabilitación** en FisioMirror.\n\nEstoy aquí para ayudarte de forma inmediata con:\n- Tu rutina diaria de ejercicios asignada\n- Consejos para calibrar la cámara del Espejo AR\n- Qué hacer si sientes dolor o fatiga\n- Consultar tu racha y contactar a tu terapeuta.',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestions = isFisio
    ? [
        '¿Cómo cargo un nuevo paciente con OCR?',
        '¿Cómo gestiono los tokens de acceso?',
        '¿Qué ejercicios prescribir para lumbalgia?',
        '¿Cómo exporto el reporte clínico en PDF?',
        '¿Cómo funciona el biofeedback del Espejo AR?',
      ]
    : [
        '¿Dónde está mi rutina de ejercicios de hoy?',
        '¿Cómo coloco mi cámara para el Espejo AR?',
        '¿Qué hago si siento dolor durante el ejercicio?',
        '¿Cómo consulto mi racha y progreso?',
        '¿Cómo contacto a mi fisioterapeuta?',
      ];

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => textareaRef.current?.focus(), 150);
    } else {
      stopSpeaking();
      setSpeakingId(null);
    }
  }, [isOpen, messages, loading, scrollToBottom, stopSpeaking]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      stopSpeaking();
      setSpeakingId(id);
      speak(text);
    }
  };

  const startVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('La entrada por voz está optimizada para Google Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      // 1. RUTA PACIENTE: Respuestas Predeterminadas (Sin consumo de tokens IA)
      if (!isFisio) {
        // Simular un brevísimo retardo natural de respuesta fluida (150ms)
        await new Promise((r) => setTimeout(r, 150));

        const matched = matchFAQ(textToSend, false);
        let patientResponse = '';

        if (matched) {
          patientResponse = matched.answer;
        } else {
          // Búsqueda contextual inteligente en preguntas de paciente
          const lower = textToSend.toLowerCase();
          if (lower.includes('hola') || lower.includes('buenos') || lower.includes('buenas')) {
            patientResponse = `¡Hola ${user?.full_name?.split(' ')[0] || ''}! ¿En qué ejercicio o sección te puedo orientar hoy? Puedes pulsar una de las sugerencias rápidas abajo.`;
          } else if (lower.includes('dolor') || lower.includes('molestia') || lower.includes('duele')) {
            patientResponse = `**Tu seguridad es la prioridad:**\n\n1. Si sientes dolor agudo o punzante, detén el ejercicio de inmediato.\n2. Al finalizar tu sesión califica el dolor del 0 al 10.\n3. Puedes avisar a tu terapeuta mediante el botón de contacto en tu Inicio.`;
          } else if (lower.includes('rutina') || lower.includes('ejercicio') || lower.includes('hacer')) {
            patientResponse = `Puedes ver tu rutina en la pestaña **"Mi Rutina"** en el menú inferior, o pulsar **"Iniciar Sesión de Hoy"** en tu pantalla de Inicio.`;
          } else if (lower.includes('ar') || lower.includes('camara') || lower.includes('espejo')) {
            patientResponse = `Para el **Espejo AR**, coloca tu dispositivo a 2 metros de distancia con buena iluminación donde se vea tu cuerpo completo para que el sensor trace tus articulaciones.`;
          } else {
            patientResponse = `Para consultar tu tratamiento:\n- **Mi Rutina**: Revisa tus ejercicios y animaciones 3D.\n- **Iniciar Sesión**: Entrena con biofeedback y contador de repeticiones.\n- **Progreso**: Revisa tus estadísticas y racha de días.\n\n¿Deseas saber más sobre alguno de estos puntos?`;
          }
        }

        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: patientResponse,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // 2. RUTA FISIOTERAPEUTA: IA Clínica Activa (con fallback a FAQs locales)
      const faqMatch = matchFAQ(textToSend, true);

      const systemContext = `Eres Physi, el copiloto clínico y chatbot de FisioMirror para fisioterapeutas profesionales.
El usuario es un FISIOTERAPEUTA (${user?.full_name || 'Colega Fisioterapeuta'}).
Responde de forma concisa, profesional y estructurada en viñetas o pasos si corresponde.`;

      const aiResponse = await runAIJob(
        'text_generation',
        {
          userPrompt: `Pregunta: ${textToSend}\n\nContexto: ${systemContext}`,
          systemPrompt: systemContext,
          temperature: 0.5,
          maxTokens: 1500,
        },
        18000
      );

      let responseText = '';
      if (aiResponse.success && aiResponse.result && aiResponse.result.trim().length > 10) {
        responseText = aiResponse.result.trim();
      } else if (faqMatch) {
        responseText = faqMatch.answer;
      } else {
        responseText = `Puedes gestionar este módulo desde la plataforma:\n- **Pacientes**: Directorio clínico y gestión de tokens pendientes.\n- **Cargar Paciente (OCR)**: Procesamiento inteligente de recetas e informes.\n- **Ejercicios**: Protocolos y biblioteca con ángulos biomecánicos.\n- **Estadísticas**: Análisis de adherencia y reportes en PDF.\n\n¿En qué aspecto específico requieres apoyo?`;
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMatch = matchFAQ(textToSend, isFisio);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: fallbackMatch
          ? fallbackMatch.answer
          : isFisio
          ? 'He registrado tu consulta. Puedes utilizar el menú lateral para acceder a la herramienta deseada o consultar las opciones de soporte.'
          : '¡Entendido! Recuerda seguir las indicaciones de tu fisioterapeuta y consultar tu sección de ejercicios.',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setSpeakingId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: isFisio
          ? 'Conversación reiniciada. ¿En qué caso clínico o función de la plataforma te puedo asistir?'
          : 'Conversación reiniciada. ¿Cómo te sientes hoy o qué duda tienes sobre tu sesión de rehabilitación?',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Glass */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-[140]"
          />

          {/* Chat Floating Container - Glassmorphic Bubble */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed right-3 sm:right-6 bottom-3 sm:bottom-6 z-[150] w-[calc(100vw-1.5rem)] sm:w-[410px] h-[550px] max-h-[85vh] flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[28px] border border-white/40 dark:border-teal-500/25 shadow-2xl shadow-teal-950/20 overflow-hidden"
          >
            {/* Top Bar Header - Glass Frosted */}
            <div className="px-4 py-3 bg-gradient-to-r from-teal-700/95 via-teal-800/95 to-slate-900/95 backdrop-blur-md text-white flex items-center justify-between shrink-0 border-b border-white/10 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-lg border border-white/30 flex items-center justify-center text-teal-100 shrink-0 shadow-inner">
                  <Bot size={20} className="animate-pulse" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-teal-900" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-white tracking-wide truncate">
                      Physi Guía
                    </h3>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-teal-50 border border-white/20">
                      {isFisio ? 'IA Copilot' : 'Guía Rápida'}
                    </span>
                  </div>
                  <p className="text-[10px] text-teal-100/80 truncate">
                    {isFisio ? 'Asesoría clínica & plataforma' : 'Respuestas instantáneas 24/7'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleResetChat}
                  title="Reiniciar chat"
                  aria-label="Reiniciar chat"
                  className="p-1.5 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={onClose}
                  title="Cerrar"
                  aria-label="Cerrar chat"
                  className="p-1.5 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-950/30"
            >
              {messages.map((msg) => {
                const isAsst = msg.role === 'assistant';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex flex-col gap-1', isAsst ? 'items-start' : 'items-end')}
                  >
                    <div
                      className={cn(
                        'max-w-[88%] rounded-2xl p-3 shadow-xs text-xs leading-relaxed relative group',
                        isAsst
                          ? 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-teal-100/80 dark:border-slate-700/70 rounded-tl-xs backdrop-blur-md'
                          : 'bg-teal-700 text-white rounded-tr-xs shadow-teal-700/20'
                      )}
                    >
                      {isAsst ? renderMarkdownContent(msg.text) : <p>{msg.text}</p>}

                      {/* Action buttons on assistant message */}
                      {isAsst && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{msg.timestamp}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSpeak(msg.id, msg.text)}
                              title={speakingId === msg.id ? 'Detener lectura' : 'Leer en voz alta'}
                              className={cn(
                                'p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
                                speakingId === msg.id && 'text-teal-600 dark:text-teal-400 font-bold'
                              )}
                            >
                              {speakingId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                            </button>
                            <button
                              onClick={() => handleCopy(msg.id, msg.text)}
                              title="Copiar texto"
                              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              {copiedId === msg.id ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl rounded-tl-xs border border-teal-100 dark:border-slate-700 shadow-xs w-fit"
                >
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-medium text-teal-700 dark:text-teal-300 ml-1">
                    {isFisio ? 'Physi procesando...' : 'Buscando respuesta...'}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-3 py-1.5 border-t border-teal-100/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              <Sparkles size={11} className="text-teal-600 dark:text-teal-400 shrink-0 mr-0.5" />
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  disabled={loading}
                  className="text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded-full bg-teal-50/80 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/50 dark:border-teal-800/40 transition-colors shrink-0 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input & Action Footer */}
            <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="flex-1 relative flex items-center">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isFisio ? "Pregunta a Physi (IA o Guía)..." : "Pregunta sobre tu recuperación o rutina..."}
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200/70 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none max-h-20 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={startVoiceInput}
                    title={isListening ? 'Escuchando...' : 'Entrada por voz'}
                    aria-label="Entrada por voz"
                    className={cn(
                      'absolute right-2 p-1 rounded-md text-slate-500 hover:text-teal-600 dark:hover:text-teal-300 transition-colors',
                      isListening && 'text-red-500 animate-pulse'
                    )}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Enviar mensaje"
                  className="w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center transition-all shadow-sm shadow-teal-600/20 shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
