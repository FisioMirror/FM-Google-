import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  HeartPulse,
  ShieldCheck,
  Flame,
  SunMedium,
  HeartHandshake,
  RefreshCw,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import {
  getVersiculoContextual,
  isSpiritualModeEnabled,
  CATEGORIAS_METADATA,
  type Versiculo,
  type VersiculoCategoria,
} from '../../lib/versiculosService';
import { useToast } from '../ui/ToastProvider';
import { cn } from '../../lib/utils';

interface VersiculoCardProps {
  categoriaInicial?: VersiculoCategoria;
  contextTitle?: string;
  className?: string;
  allowCategoryChange?: boolean;
}

export function VersiculoCard({
  categoriaInicial = 'general',
  contextTitle,
  className,
  allowCategoryChange = true,
}: VersiculoCardProps) {
  const [enabled, setEnabled] = useState(() => isSpiritualModeEnabled());
  const [versiculo, setVersiculo] = useState<Versiculo | null>(null);
  const [categoria, setCategoria] = useState<VersiculoCategoria>(categoriaInicial);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [minimized, setMinimized] = useState(() => {
    try {
      return sessionStorage.getItem('fisio-versiculo-minimized') === 'true';
    } catch {
      return false;
    }
  });

  const toast = useToast();

  useEffect(() => {
    const handleStorageChange = () => {
      setEnabled(isSpiritualModeEnabled());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    cargarVersiculo(categoria);
  }, [categoria, enabled]);

  const cargarVersiculo = async (cat: VersiculoCategoria) => {
    setLoading(true);
    try {
      const v = await getVersiculoContextual(cat);
      setVersiculo(v);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!versiculo) return;
    try {
      await navigator.clipboard.writeText(`"${versiculo.texto}" — ${versiculo.cita}`);
      setCopied(true);
      toast.success('Versículo copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el texto');
    }
  };

  const handleDismiss = () => {
    setMinimized(true);
    try {
      sessionStorage.setItem('fisio-versiculo-minimized', 'true');
    } catch {
      // ignore
    }
  };

  const handleRestore = () => {
    setMinimized(false);
    try {
      sessionStorage.removeItem('fisio-versiculo-minimized');
    } catch {
      // ignore
    }
  };

  if (!enabled) return null;

  if (minimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('flex justify-end', className)}
      >
        <button
          onClick={handleRestore}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 transition-all hover:scale-[1.02]"
        >
          <BookOpen className="size-3.5" />
          <span>Palabra de Fortaleza & Fe</span>
        </button>
      </motion.div>
    );
  }

  const categoryIcon = (cat: VersiculoCategoria) => {
    switch (cat) {
      case 'sanidad':
        return <HeartPulse className="size-4" />;
      case 'fortaleza':
        return <ShieldCheck className="size-4" />;
      case 'racha':
        return <Flame className="size-4" />;
      case 'dolor':
        return <HeartHandshake className="size-4" />;
      case 'esperanza':
        return <SunMedium className="size-4" />;
      default:
        return <BookOpen className="size-4" />;
    }
  };

  const categoriasList: VersiculoCategoria[] = [
    'general',
    'sanidad',
    'fortaleza',
    'racha',
    'dolor',
    'esperanza',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-3xl p-6 lg:p-7 bg-surface/90 dark:bg-surface-container-low/75 border border-teal-500/20 shadow-sm',
        className
      )}
    >
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
            {categoryIcon(categoria)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">
                {contextTitle || 'Palabra de Fortaleza & Fe'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-bold">
                <Sparkles className="size-2.5" />
                {CATEGORIAS_METADATA[categoria]?.label || 'Reflexión'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Aliento e inspiración para tu recuperación física y bienestar.
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={!versiculo}
            className="size-8 rounded-xl bg-surface-container/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
            title="Copiar versículo"
            aria-label="Copiar versículo"
          >
            {copied ? <Check className="size-4 text-teal-600" /> : <Copy className="size-4" />}
          </button>

          <button
            onClick={() => cargarVersiculo(categoria)}
            disabled={loading}
            className="size-8 rounded-xl bg-surface-container/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
            title="Recibir otra palabra"
            aria-label="Recibir otra palabra"
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin text-teal-600')} />
          </button>

          <button
            onClick={handleDismiss}
            className="size-8 rounded-xl bg-surface-container/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
            title="Minimizar por ahora"
            aria-label="Minimizar por ahora"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Category Pills (Optional switch) */}
      {allowCategoryChange && (
        <div className="relative z-10 flex items-center gap-1.5 flex-wrap mb-4 pb-1 border-b border-outline/10">
          {categoriasList.map((cat) => {
            const isSelected = categoria === cat;
            const meta = CATEGORIAS_METADATA[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={cn(
                  'px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-surface-container-low/80 text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                )}
              >
                {cat === 'general' ? 'General' : meta?.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Verse Content */}
      <div className="relative z-10 my-2">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center text-xs text-outline flex items-center justify-center gap-2"
            >
              <RefreshCw className="size-3.5 animate-spin text-teal-600" />
              <span>Buscando palabra de fortaleza...</span>
            </motion.div>
          ) : versiculo ? (
            <motion.div
              key={versiculo.cita}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <blockquote className="text-sm md:text-base text-on-surface font-medium leading-relaxed italic relative pl-4 border-l-2 border-teal-500/40">
                «{versiculo.texto}»
              </blockquote>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs font-bold text-teal-700 dark:text-teal-300 tracking-wide font-mono">
                  — {versiculo.cita}
                </p>
                {versiculo.tema && (
                  <span className="text-[11px] text-outline italic">
                    {versiculo.tema}
                  </span>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer bar */}
      <div className="relative z-10 mt-4 pt-3 border-t border-outline/10 flex items-center justify-between">
        <p className="text-[11px] text-on-surface-variant">
          Persevera con fe: cada repetición y cada esfuerzo renuevan tu salud.
        </p>
        <button
          onClick={() => cargarVersiculo(categoria)}
          disabled={loading}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 transition-colors inline-flex items-center gap-1 shrink-0 ml-3"
        >
          <span>Renovar reflexión</span>
          <RefreshCw className={cn('size-3', loading && 'animate-spin')} />
        </button>
      </div>
    </motion.div>
  );
}

export default VersiculoCard;
