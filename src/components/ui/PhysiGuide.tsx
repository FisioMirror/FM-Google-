import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, RotateCcw, Volume2, VolumeX, Sparkles, User, Mic } from 'lucide-react';
import {
  PHYSI_FAQS,
  matchFAQ as matchGlobalFAQ,
  matchFollowUp,
  type FAQ,
  type FollowUp,
} from '../../data/physiFAQs';
import { useAuthStore } from '../../stores/authStore';
import { runAIJob } from '../../lib/ai';
import { humanVoice, getVoiceGender, setVoiceGender, type VoiceGender } from '../../lib/humanVoice';
import { QuickVoiceSelector } from './QuickVoiceSelector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
  /** Ramas condicionales del árbol de decisiones (solo en respuestas de FAQ) */
  options?: FollowUp[];
}

const WELCOME =
  '¡Hola! Soy Physi, tu asistente y guía interactivo en FisioMirror. Puedes hacerme cualquier consulta sobre tus ejercicios, pacientes, análisis biomecánico o la plataforma. ¡Te responderé con voz alta natural y en tiempo real!';

const NO_MATCH =
  'No he entendido tu pregunta. Prueba con términos como paciente, rutina, rango articular o contacta a soporte: fisiomirror@proton.me';

/** Preguntas frecuentes según la ruta actual */
function getFAQs(pathname: string): string[] {
  if (pathname.includes('dashboard')) {
    return ['¿Cómo veo mis pacientes activos?', '¿Qué significa cada color en el dashboard?'];
  }
  if (pathname.includes('exercise')) {
    return ['¿Cómo creo una rutina de ejercicios?', '¿Cómo asigno ejercicios a un paciente?'];
  }
  if (pathname.includes('setting')) {
    return ['¿Cómo cambio mi contraseña?', '¿Cómo activo el modo oscuro?'];
  }
  if (pathname.includes('assistant')) {
    return ['¿Cómo uso las herramientas de IA?', '¿Cómo calibro el rango articular?'];
  }
  if (pathname.includes('mirror')) {
    return ['¿Cómo uso el modo espejo AR?', '¿Qué hago si la cámara no detecta articulaciones?'];
  }
  return ['¿Qué puedo hacer en FisioMirror?', '¿Cómo contacto a soporte?'];
}

/** Quita acentos y pasa a minúsculas para comparar de forma tolerante. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca el FAQ que mejor encaja con el texto del usuario.
 */
function matchFAQ(input: string): FAQ | null {
  const normalized = normalize(input);
  if (!normalized) return null;

  const tokens = new Set(normalized.split(/\s+/).filter((t) => t.length > 1));

  let best: FAQ | null = null;
  let bestScore = 0;

  for (const faq of PHYSI_FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      const nkw = normalize(kw);
      if (!nkw) continue;
      if (normalized.includes(nkw)) {
        score += nkw.includes(' ') ? 3 : 2;
        continue;
      }
      if (!nkw.includes(' ') && tokens.has(nkw)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  return bestScore > 0 ? best : null;
}

/** Renderiza texto con formato markdown básico (bullet points, encabezados, negritas) */
function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let listItems: ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={key} className="list-disc pl-4 space-y-1 my-1.5 text-xs text-on-surface">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(
        <li key={`li-${index}`} className="leading-relaxed">
          {trimmed.slice(2)}
        </li>
      );
    } else {
      flushList(`ul-${index}`);
      if (trimmed) {
        blocks.push(
          <p key={`p-${index}`} className="my-1 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    }
  });

  flushList(`ul-end`);
  return <div className="space-y-1">{blocks}</div>;
}

export interface PhysiGuideProps {
  className?: string;
  controlledOpen?: boolean;
  onControlledClose?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'floating' | 'header';
}

export function PhysiGuide({
  className,
  controlledOpen,
  onControlledClose,
  isOpen,
  onClose,
  variant,
}: PhysiGuideProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isFisio = user?.role === 'fisioterapeuta';

  const isControlled = controlledOpen !== undefined || isOpen !== undefined;
  const open = controlledOpen ?? isOpen ?? internalOpen;

  const setOpen = useCallback(
    (v: boolean) => {
      if (!v) {
        humanVoice.stop();
        setSpeakingMsgId(null);
      }
      if (isControlled) {
        if (!v) {
          onControlledClose?.();
          onClose?.();
        }
      } else {
        setInternalOpen(v);
      }
    },
    [isControlled, onControlledClose, onClose]
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: WELCOME,
      timestamp: 'Ahora',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoVoice, setAutoVoice] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('fisio_guide_autovoice');
      return stored !== 'false';
    }
    return true;
  });
  const [voiceGender, setVoiceGenderState] = useState<VoiceGender>(() => humanVoice.getVoiceGender());
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const faqs = getFAQs(location.pathname);
  const showFAQs = messages.length <= 1 && !loading;

  // Persistir preferencia de autoVoice
  const toggleAutoVoice = () => {
    const nextVal = !autoVoice;
    setAutoVoice(nextVal);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fisio_guide_autovoice', String(nextVal));
    }
    if (!nextVal) {
      humanVoice.stop();
      setSpeakingMsgId(null);
    }
  };

  // Alternar entre voz masculina cálida y femenina
  const toggleVoiceGender = () => {
    const nextGender: VoiceGender = voiceGender === 'male' ? 'female' : 'male';
    setVoiceGenderState(nextGender);
    humanVoice.setVoiceGender(nextGender);
  };

  // Hablar o detener un mensaje específico
  const toggleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      humanVoice.stop();
      setSpeakingMsgId(null);
    } else {
      humanVoice.stop();
      setSpeakingMsgId(msgId);
      humanVoice.speak(text, {
        gender: voiceGender,
        onEnd: () => setSpeakingMsgId(null),
        onError: () => setSpeakingMsgId(null),
      });
    }
  };

  // Auto-scroll al final del chat
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  // Cerrar con tecla Escape y detener voz
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  // Enfocar el textarea al abrir
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Auto-resize del textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`;
  }, [input]);

  // Respuesta offline/online combinada con salida a voz alta
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      const localMatch = matchFAQ(trimmed);
      const roleMatch = matchGlobalFAQ(trimmed, isFisio);
      const faqAnswer = roleMatch?.answer || localMatch?.answer || null;

      const finishAndSpeak = (replyText: string, options?: FollowUp[]) => {
        const assistantId = `a-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            options: options && options.length > 0 ? options : undefined,
          },
        ]);
        setLoading(false);

        if (autoVoice) {
          setSpeakingMsgId(assistantId);
          humanVoice.speak(replyText, {
            gender: voiceGender,
            onEnd: () => setSpeakingMsgId(null),
            onError: () => setSpeakingMsgId(null),
          });
        }
      };

      if (navigator.onLine) {
        try {
          const aiJobPromise = runAIJob('text_generation', {
            userPrompt: `Eres Physi, la guía rápida interactiva de la aplicación FisioMirror. Responde de forma clara, directa y estructurada a la siguiente consulta sobre la plataforma o rehabilitación: "${trimmed}". Si hay pasos concretos, usa listas cortas.`,
            context: { role: isFisio ? 'Fisioterapeuta' : 'Paciente' },
          });

          const timeoutPromise = new Promise<{ result?: string }>((resolve) =>
            setTimeout(() => resolve({}), 3500)
          );

          const res = await Promise.race([aiJobPromise, timeoutPromise]);
          if (res && 'result' in res && res.result && res.result.trim()) {
            finishAndSpeak(res.result.trim());
            return;
          }
        } catch {
          // fallback a FAQ
        }
      }

      setTimeout(() => {
        const replyText = faqAnswer || NO_MATCH;
        finishAndSpeak(replyText, roleMatch?.followUps || localMatch?.followUps);
      }, 350);
    },
    [loading, isFisio, autoVoice, voiceGender]
  );

  const handleSend = () => sendMessage(input);

  /** Navega una rama del árbol de decisiones sin pasar por la IA. */
  const handleOption = useCallback(
    (label: string, tree: FollowUp[]) => {
      if (loading) return;
      const node = matchFollowUp(label, tree);
      if (!node) return;

      const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const assistantId = `a-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'user', text: label, timestamp: now },
        {
          id: assistantId,
          role: 'assistant',
          text: node.answer,
          timestamp: now,
          options: node.followUps && node.followUps.length > 0 ? node.followUps : undefined,
        },
      ]);

      if (autoVoice) {
        setSpeakingMsgId(assistantId);
        humanVoice.speak(node.answer, {
          gender: voiceGender,
          onEnd: () => setSpeakingMsgId(null),
          onError: () => setSpeakingMsgId(null),
        });
      }
    },
    [loading, autoVoice, voiceGender]
  );

  const resetChat = () => {
    humanVoice.stop();
    setSpeakingMsgId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: WELCOME,
        timestamp: 'Ahora',
      },
    ]);
    setInput('');
  };

  const controlled = isControlled && variant !== 'floating';

  return (
    <div className={className}>
      {/* Botón flotante — esquina inferior izquierda */}
      {!controlled && (
        <motion.button
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          aria-label={open ? 'Cerrar guía de Physi' : 'Abrir guía de Physi'}
          aria-expanded={open}
          className="fixed bottom-24 left-4 lg:bottom-8 lg:left-8 z-[120] flex items-center justify-center w-14 h-14 rounded-full min-h-[56px] min-w-[56px] touch-manipulation active:scale-95 pb-[env(safe-area-inset-bottom)] relative group cursor-pointer"
        >
          {!open && (
            <motion.span
              className="absolute inset-0 rounded-full bg-teal-500/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <motion.span
            className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 shadow-xl shadow-teal-900/30 border border-teal-400/30"
            animate={{ scale: open ? 0.95 : 1 }}
          />
          {!open && (
            <span className="absolute -top-1 -right-1 bg-kinetic text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10">
              IA
            </span>
          )}
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center relative z-10 text-white"
          >
            {open ? <X size={24} /> : <Bot size={28} />}
          </motion.div>
        </motion.button>
      )}

      {/* Ventana flotante de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-24 left-4 right-4 sm:right-auto sm:left-4 sm:w-96 lg:left-8 lg:bottom-28 z-[120] w-[calc(100vw-2rem)] max-h-[62vh] flex flex-col rounded-3xl border border-teal-500/25 bg-surface/95 dark:bg-surface-container/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-on-surface"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 dark:border-white/10 shrink-0 bg-teal-500/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/25 flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-on-surface truncate">
                      Physi IA
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300">
                      {voiceGender === 'male' ? 'Voz Masculina' : 'Voz Femenina'}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    Asistente clínico y bio-feedback
                  </p>
                </div>
              </div>

              {/* Botones de acción en cabecera: Selector de Voz, Toggle AutoVoice, Reset, Cerrar */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Selector rápido multi-proveedor y tono */}
                <QuickVoiceSelector
                  compact
                  onVoiceChange={(newG) => {
                    setVoiceGenderState(newG);
                    setVoiceGender(newG);
                  }}
                />

                {/* Toggle de AutoVoice */}
                <button
                  onClick={toggleAutoVoice}
                  aria-label={autoVoice ? 'Silenciar voz' : 'Activar voz automática'}
                  title={autoVoice ? 'Voz automática activada' : 'Voz silenciada'}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer border ${
                    autoVoice
                      ? 'bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-300'
                      : 'bg-surface-container border-outline-variant/20 text-on-surface-variant'
                  }`}
                >
                  {autoVoice ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                {/* Reset Chat */}
                <button
                  onClick={resetChat}
                  aria-label="Reiniciar conversación"
                  title="Reiniciar chat"
                  className="text-on-surface-variant hover:text-teal-600 transition-colors p-1.5 rounded-xl hover:bg-surface-container-high cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>

                {/* Cerrar */}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar ventana"
                  title="Cerrar"
                  className="text-on-surface-variant hover:text-rose-500 transition-colors p-1.5 rounded-xl hover:bg-rose-500/10 cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin"
            >
              {messages.map((msg) => {
                const isSpeaking = speakingMsgId === msg.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`size-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          msg.role === 'user'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/25'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <span className="text-[10px] font-bold">Tú</span>
                        ) : (
                          <Bot size={15} />
                        )}
                      </div>

                      {/* Burbuja */}
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                          msg.role === 'user'
                            ? 'bg-teal-600 text-white rounded-tr-none font-medium'
                            : 'bg-surface dark:bg-surface-container-low border border-outline-variant/25 dark:border-white/10 text-on-surface rounded-tl-none'
                        }`}
                      >
                        {msg.role === 'assistant' ? renderMarkdown(msg.text) : msg.text}

                        {/* Botón de reproducción de voz para respuestas de Physi */}
                        {msg.role === 'assistant' && (
                          <div className="mt-2.5 pt-2 border-t border-outline-variant/15 dark:border-white/5 flex items-center justify-between text-[11px] text-on-surface-variant">
                            <span className="text-[10px] opacity-75">{msg.timestamp || 'Ahora'}</span>
                            <button
                              onClick={() => toggleSpeakMessage(msg.id, msg.text)}
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                isSpeaking
                                  ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/40 animate-pulse'
                                  : 'hover:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                              }`}
                              title={isSpeaking ? 'Detener voz' : 'Escuchar respuesta en voz alta'}
                            >
                              {isSpeaking ? (
                                <>
                                  <VolumeX size={13} className="text-rose-500" />
                                  <span className="text-rose-600 dark:text-rose-400 font-bold">Detener</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 size={13} />
                                  <span>Escuchar</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Árbol de decisiones: ramas condicionales */}
                        {msg.role === 'assistant' && msg.options && msg.options.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.options.map((opt) => (
                              <button
                                key={opt.label}
                                onClick={() => handleOption(opt.label, msg.options ?? [])}
                                className="px-2.5 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 text-[11px] font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-500/20 active:scale-[0.98] transition-all cursor-pointer text-left"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Indicador de escritura */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5 items-center">
                    <div className="size-7 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0 border border-teal-500/25">
                      <Bot size={15} className="text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="p-3 rounded-2xl bg-surface dark:bg-surface-container-low border border-outline-variant/25 rounded-tl-none">
                      <div className="flex gap-1.5 items-center">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.18,
                            }}
                            className="w-2 h-2 bg-teal-600 dark:bg-teal-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sugerencias frecuentes según la ruta */}
            {showFAQs && (
              <div className="px-3.5 pb-2 shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 flex items-center gap-1">
                  <Sparkles size={11} className="text-teal-500" />
                  <span>Sugerencias para empezar</span>
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-thin">
                  {faqs.map((faq, i) => (
                    <motion.button
                      key={faq}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendMessage(faq)}
                      className="px-2.5 py-1.5 rounded-xl border border-teal-500/25 bg-teal-500/10 text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-500/20 transition-all cursor-pointer"
                    >
                      {faq}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Entrada de texto */}
            <div className="p-3 border-t border-outline-variant/20 dark:border-white/10 shrink-0 bg-surface/50">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Pregúntale a Physi..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-outline-variant/30 dark:border-white/10 bg-surface/90 dark:bg-surface-container/60 px-3 py-2 text-xs sm:text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all placeholder:text-on-surface-variant/50 max-h-24"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="size-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-teal-900/15 cursor-pointer"
                  aria-label="Enviar mensaje"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhysiGuide;
