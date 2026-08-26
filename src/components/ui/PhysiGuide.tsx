import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Send, RotateCcw, Compass, ExternalLink } from 'lucide-react';
import { PHYSI_FAQS_FISIO, PHYSI_FAQS_PATIENT, matchFAQ } from '../../data/physiFAQs';
import { useAuthStore } from '../../stores/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const NO_MATCH_FISIO =
  'No encontré esa sección exacta. Prueba preguntando por **pacientes**, **tokens**, **rutinas**, **reportes PDF** o **estadísticas avanzadas**.\n\nSoporte técnico: **fisioMirror@proton.me**';

const NO_MATCH_PATIENT =
  'No encontré esa opción en la guía. Prueba preguntando por **mi rutina**, **espejo AR**, **demostración 3D**, **contactar terapeuta** o **progreso**.\n\nSoporte: **fisioMirror@proton.me**';

/** Renderiza **negritas** inline */
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-on-surface">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/** Renderiza texto con formato markdown básico (bullet points, numerados, negritas) */
function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let listItems: ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={key} className="space-y-1.5 my-1.5 pl-2 text-xs">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(
        <li key={lineIndex} className="flex items-start gap-1.5 text-on-surface-variant">
          <span className="text-primary font-bold mt-0.5">•</span>
          <span className="flex-1">{renderInline(trimmed.slice(2))}</span>
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        listItems.push(
          <li key={lineIndex} className="flex items-start gap-1.5 text-on-surface-variant">
            <span className="text-primary font-bold text-[11px] shrink-0 mt-0.5">{match[1]}.</span>
            <span className="flex-1">{renderInline(match[2])}</span>
          </li>
        );
      }
    } else if (trimmed === '') {
      flushList(`list-${lineIndex}`);
      blocks.push(<div key={`space-${lineIndex}`} className="h-1" />);
    } else {
      flushList(`list-${lineIndex}`);
      blocks.push(
        <p key={lineIndex} className="text-on-surface text-xs leading-relaxed">
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  flushList('list-end');
  return <div className="space-y-1">{blocks}</div>;
}

interface PhysiGuideProps {
  variant?: 'floating' | 'header';
}

export function PhysiGuide({ variant = 'floating' }: PhysiGuideProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isFisio = user?.role === 'fisioterapeuta';

  const initialGreeting = isFisio
    ? '¡Hola Fisioterapeuta! Soy **Physi - Guía de la App**. Te ayudo a navegar por FisioMirror, gestionar pacientes, tokens, rutinas y reportes.'
    : '¡Hola! Soy **Physi - Guía de la App**. Te oriento para encontrar tu rutina diaria, iniciar el Espejo AR, ver tu progreso y contactar a tu terapeuta.';

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: initialGreeting },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Suggestions depending on role
  const suggestions = isFisio
    ? [
        '¿Cómo agrego o cargo un nuevo paciente?',
        '¿Cómo genero y gestiono tokens?',
        '¿Cómo creo o asigno una rutina?',
        '¿Dónde consulto las estadísticas y ROM?',
        '¿Cómo exporto un informe PDF?',
      ]
    : [
        '¿Dónde está mi rutina de hoy?',
        '¿Cómo inicio una sesión con el Espejo AR?',
        '¿Cómo veo la demostración 3D?',
        '¿Cómo me comunico con mi fisioterapeuta?',
        '¿Qué hago si siento dolor?',
      ];

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [open]);

  // Actualizar saludo si cambia el rol
  useEffect(() => {
    setMessages([{ id: '1', role: 'assistant', text: initialGreeting }]);
  }, [isFisio, initialGreeting]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: String(Date.now()), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const match = matchFAQ(trimmed, isFisio);
      let reply: string;
      if (match) {
        reply = match.answer;
      } else {
        reply = isFisio ? NO_MATCH_FISIO : NO_MATCH_PATIENT;
      }

      setMessages((prev) => [...prev, { id: String(Date.now() + 1), role: 'assistant', text: reply }]);
      setLoading(false);
    }, 400);
  };

  const resetChat = () => {
    setMessages([{ id: String(Date.now()), role: 'assistant', text: initialGreeting }]);
    setInput('');
  };

  return (
    <div className="relative">
      {/* Botón activador */}
      {variant === 'header' ? (
        <button
          onClick={() => setOpen((prev) => !prev)}
          title="Guía de Navegación"
          aria-label="Abrir guía de navegación de la aplicación"
          aria-expanded={open}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border border-primary/20 text-xs font-semibold text-on-surface hover:text-primary transition-all duration-200"
        >
          <Compass size={16} className="text-primary animate-pulse" />
          <span className="hidden sm:inline">Guía de la App</span>
        </button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Abrir guía de navegación de la aplicación"
          aria-expanded={open}
          className="fixed bottom-24 left-4 lg:bottom-8 lg:left-8 z-[120] flex items-center justify-center w-13 h-13 rounded-full min-h-[52px] min-w-[52px] touch-manipulation active:scale-95 shadow-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white border-2 border-white/20"
        >
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {open ? <X size={22} /> : <Compass size={24} />}
          </motion.div>
        </motion.button>
      )}

      {/* Modal flotante */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[125]"
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className={`fixed z-[130] w-[calc(100vw-2rem)] max-w-sm sm:max-w-md flex flex-col bg-surface rounded-3xl border border-primary/20 shadow-2xl overflow-hidden ${
                variant === 'header'
                  ? 'top-20 right-4 sm:right-6 max-h-[75vh]'
                  : 'bottom-24 left-4 sm:left-8 max-h-[70vh]'
              }`}
            >
              {/* Cabecera limpia sin tag 'IA' */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-outline-variant/30 shrink-0 bg-surface-container-low">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <Compass size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-on-surface truncate">
                        Physi - Guía de la App
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                        {isFisio ? 'Fisioterapeuta' : 'Paciente'}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      Orientación de navegación y uso del sistema
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={resetChat}
                    aria-label="Reiniciar chat"
                    title="Reiniciar chat"
                    className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container-high"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar guía"
                    title="Cerrar"
                    className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-error/10"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Mensajes */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin max-h-[42vh]"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[92%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          msg.role === 'user'
                            ? 'bg-primary text-white text-[10px]'
                            : 'bg-primary/15 text-primary'
                        }`}
                      >
                        {msg.role === 'user' ? 'Tú' : <Compass size={13} />}
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-primary text-white rounded-tr-xs'
                            : 'bg-surface-container-high text-on-surface rounded-tl-xs border border-outline-variant/30'
                        }`}
                      >
                        {msg.role === 'assistant' ? renderMarkdown(msg.text) : msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 items-center text-xs text-on-surface-variant">
                      <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                        <Compass size={13} className="animate-spin" />
                      </div>
                      <span>Buscando en la guía...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sugerencias de navegación según el rol */}
              <div className="px-3 py-2 border-t border-outline-variant/20 bg-surface-container-low shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Preguntas Frecuentes ({isFisio ? 'Fisioterapeuta' : 'Paciente'})
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(sug)}
                      className="px-2.5 py-1 text-[11px] rounded-full bg-surface border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary transition-all text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-3 border-t border-outline-variant/30 shrink-0 bg-surface">
                <div className="flex gap-2 items-center">
                  <input
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    placeholder="Escribe una pregunta sobre la app..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 outline-none focus:border-primary text-xs text-on-surface placeholder:text-on-surface-variant/60"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    aria-label="Enviar"
                    className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
