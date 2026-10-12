import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, RotateCcw, CheckCircle2, ChevronUp } from 'lucide-react';

export interface RepetitionCounterSpringProps {
  currentReps: number;
  targetReps: number;
  cadenceSeconds?: number; // seconds per repetition
  className?: string;
  onIncrement?: () => void;
  onReset?: () => void;
}

export const RepetitionCounterSpring: React.FC<RepetitionCounterSpringProps> = ({
  currentReps,
  targetReps,
  cadenceSeconds = 3.5,
  className,
  onIncrement,
  onReset,
}) => {
  const [pulseKey, setPulseKey] = useState(0);
  const isGoalReached = currentReps >= targetReps;
  const progressPercent = Math.min(100, Math.round((currentReps / targetReps) * 100));

  const handleIncrement = () => {
    setPulseKey((k) => k + 1);
    onIncrement?.();
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center p-6 rounded-3xl border transition-all duration-300',
        'bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl',
        'border-outline-variant/30 dark:border-white/10 shadow-lg',
        isGoalReached && 'ring-2 ring-emerald-500/40 border-emerald-500/50',
        className
      )}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Contador de Repeticiones AR
        </span>
        <span className="text-xs font-mono font-bold text-primary dark:text-teal-400">
          Cadencia: {cadenceSeconds}s
        </span>
      </div>

      {/* Spring Number Center */}
      <div className="relative flex items-center justify-center my-2">
        {/* Glow effect on completion */}
        <AnimatePresence>
          {isGoalReached && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-emerald-500 filter blur-2xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        <motion.div
          key={pulseKey}
          initial={{ scale: 0.85, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="flex items-baseline font-mono select-none"
        >
          <span className="text-7xl font-black text-on-surface dark:text-white tabular-nums tracking-tighter">
            {currentReps}
          </span>
          <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500 ml-1">
            /{targetReps}
          </span>
        </motion.div>
      </div>

      {/* Cadence Indicator */}
      <div className="w-full mt-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span>Progreso de la Serie</span>
          <span className="font-mono font-bold text-on-surface dark:text-white">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
            className={cn(
              'h-full rounded-full transition-colors',
              isGoalReached ? 'bg-emerald-500' : 'bg-primary'
            )}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="w-full grid grid-cols-2 gap-3 mt-6">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-outline-variant/30 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={handleIncrement}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-md transition-all',
            isGoalReached
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-primary hover:bg-primary/90'
          )}
        >
          {isGoalReached ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Completado</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>+1 Rep (MediaPipe)</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
