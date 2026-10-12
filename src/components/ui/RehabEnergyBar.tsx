import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BatteryCharging, Flame, Zap, ShieldAlert } from 'lucide-react';

export interface RehabEnergyBarProps {
  currentEnergy: number; // 0 to 100
  fatigueScore?: number; // 0 to 10 (elevated means patient needs rest)
  repsCompleted?: number;
  totalTargetReps?: number;
  className?: string;
  onRestAdvised?: () => void;
}

export const RehabEnergyBar: React.FC<RehabEnergyBarProps> = ({
  currentEnergy = 85,
  fatigueScore = 2.4,
  repsCompleted = 14,
  totalTargetReps = 20,
  className,
}) => {
  const clampedEnergy = Math.max(0, Math.min(100, currentEnergy));
  const isLowEnergy = clampedEnergy < 30;
  const isHighFatigue = fatigueScore >= 7;

  // Determination of color tone
  const getGradient = () => {
    if (isLowEnergy || isHighFatigue) {
      return 'from-rose-500 via-amber-500 to-rose-600';
    }
    if (clampedEnergy < 60) {
      return 'from-amber-400 via-teal-500 to-teal-400';
    }
    return 'from-teal-500 via-cyan-400 to-[#c1ff72]';
  };

  return (
    <div
      className={cn(
        'flex flex-col p-5 rounded-2xl border transition-all duration-300',
        'bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl',
        'border-outline-variant/30 dark:border-white/10 shadow-sm',
        isHighFatigue && 'ring-2 ring-rose-500/40 border-rose-500/50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-xl border',
            isLowEnergy
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              : 'bg-primary/10 text-primary border-primary/20'
          )}>
            {isLowEnergy ? <BatteryCharging className="w-4 h-4 animate-pulse" /> : <Zap className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-on-surface dark:text-white flex items-center gap-1.5">
              Energía Muscular de Rehabilitación
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {repsCompleted} de {totalTargetReps} repeticiones completadas
            </p>
          </div>
        </div>

        {/* Energy Number Badge */}
        <div className="text-right">
          <div className="text-xl font-bold font-mono tabular-nums text-on-surface dark:text-white">
            {Math.round(clampedEnergy)}%
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            {isLowEnergy ? 'Fatiga Alta' : clampedEnergy < 60 ? 'Moderada' : 'Óptima'}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-4 rounded-full bg-slate-200/80 dark:bg-slate-800/80 overflow-hidden p-0.5 border border-slate-300/40 dark:border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedEnergy}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r relative overflow-hidden shadow-inner',
            getGradient()
          )}
        >
          {/* Animated Sheen / Wave overlay */}
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"
          />
        </motion.div>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-outline-variant/15 dark:border-white/5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Índice de Fatiga:</span>
          <span className="font-mono font-bold text-on-surface dark:text-white">{fatigueScore.toFixed(1)} / 10</span>
        </div>

        <div className="flex items-center justify-end gap-1.5 text-slate-600 dark:text-slate-300">
          {isHighFatigue ? (
            <span className="flex items-center gap-1 text-rose-500 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              Recomendado descansar
            </span>
          ) : (
            <span className="text-emerald-500 font-medium">Ritmo muscular seguro</span>
          )}
        </div>
      </div>
    </div>
  );
};
