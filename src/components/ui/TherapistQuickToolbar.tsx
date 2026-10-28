import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles, ClipboardList, Dumbbell } from 'lucide-react';

export interface TherapistQuickToolbarProps {
  className?: string;
  /** Pausa/reanuda la sesión activa. Si no se pasa, el botón no se muestra. */
  onPauseToggle?: (isPaused: boolean) => void;
  /** Abre el expediente/rutina del paciente. */
  onOpenRoutine?: () => void;
  /** Abre una nueva sesión clínica. */
  onNewSession?: () => void;
  /** Abre el copiloto clínico con contexto del paciente. */
  onAssessWithAi?: () => void;
}

/**
 * Barra rápida del terapeuta.
 *
 * Regla de diseño: sólo se renderizan acciones que tienen una consecuencia real.
 * Se eliminaron micrófono, "freeze frame" y ajuste de ROM porque no había captura
 * ni grabación detrás: mostraban un toast y no guardaban nada.
 */
export const TherapistQuickToolbar: React.FC<TherapistQuickToolbarProps> = ({
  className,
  onPauseToggle,
  onOpenRoutine,
  onNewSession,
  onAssessWithAi,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useTranslation();

  const handlePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    onPauseToggle?.(next);
  };

  const hasActions = Boolean(onPauseToggle || onOpenRoutine || onNewSession || onAssessWithAi);
  if (!hasActions) return null;

  const iconBtn =
    'p-2 rounded-xl text-on-surface-variant hover:bg-on-surface/5 dark:hover:bg-on-surface/10 transition-colors';

  return (
    <aside
      aria-label={t('tqt.physioControlToolbar')}
      className={cn(
        'relative inline-flex items-center rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-elevated',
        'bg-surface/95 dark:bg-surface-container/95 border-outline-variant/40 p-1.5',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={iconBtn}
        aria-label={isExpanded ? t('tqt.collapseBar') : t('tqt.expandBar')}
        aria-expanded={isExpanded}
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-1.5 pl-1 overflow-hidden"
          >
            {onPauseToggle && (
              <button
                type="button"
                onClick={handlePause}
                aria-pressed={isPaused}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                  isPaused
                    ? 'bg-warning/15 text-warning border border-warning/30'
                    : 'bg-primary/10 text-primary dark:text-teal-300 hover:bg-primary/20'
                )}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? t('arm.resume') : t('arm.pause')}</span>
              </button>
            )}

            {onOpenRoutine && (
              <button type="button" onClick={onOpenRoutine} className={iconBtn} title={t('tqt.openRoutine')}>
                <ClipboardList className="w-4 h-4" />
              </button>
            )}

            {onNewSession && (
              <button type="button" onClick={onNewSession} className={iconBtn} title={t('tqt.newSession')}>
                <Dumbbell className="w-4 h-4" />
              </button>
            )}

            {onAssessWithAi && (
              <button
                type="button"
                onClick={onAssessWithAi}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span>{t('tqt.assessWithAi')}</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
