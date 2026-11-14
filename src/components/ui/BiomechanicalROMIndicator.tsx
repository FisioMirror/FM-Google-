import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Check, Target, CircleDot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { RepPhase, TrafficLightState } from '@/hooks/usePoseDetection';

export interface BiomechanicalROMIndicatorProps {
  currentAngle: number;
  targetAngle: number;
  neutralAngle?: number;
  romPercent?: number;
  trafficLight?: TrafficLightState;
  repPhase?: RepPhase;
  holdRemainingMs?: number;
  className?: string;
}

export const BiomechanicalROMIndicator: React.FC<BiomechanicalROMIndicatorProps> = ({
  currentAngle,
  targetAngle,
  neutralAngle = 0,
  romPercent,
  trafficLight,
  repPhase,
  holdRemainingMs = 0,
  className,
}) => {
  const { t } = useTranslation();
  const safeSpan = Math.max(1, Math.abs(targetAngle - neutralAngle));
  const fallbackPercent = Math.round((Math.abs(currentAngle - neutralAngle) / safeSpan) * 100);
  const percent =
    typeof romPercent === 'number' && Number.isFinite(romPercent)
      ? Math.min(100, Math.max(0, Math.round(romPercent)))
      : Math.min(100, Math.max(0, fallbackPercent));

  // El estado de Rango Objetivo se evalúa únicamente por el recorrido articular real (% ROM),
  // independiente del semáforo postural (verde/amarillo/rojo del esqueleto).
  const isGoalReached = percent >= 80;
  const isApproaching = percent >= 40 && percent < 80;
  const holdSeconds = repPhase === 'hold' && holdRemainingMs > 0 ? Math.ceil(holdRemainingMs / 1000) : 0;

  return (
    <aside
      className={cn(
        'flex flex-col items-center gap-2.5 select-none pointer-events-auto',
        className
      )}
      aria-label={t('ar.romRangeLabel')}
    >
      {/* Target Marker Chip */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-xl border text-[10px] sm:text-xs font-bold shadow-xl transition-colors duration-300',
          isGoalReached
            ? 'border-emerald-400/65 text-emerald-300'
            : isApproaching
            ? 'border-amber-400/60 text-amber-300'
            : trafficLight === 'red'
            ? 'border-rose-500/50 text-slate-300'
            : 'border-teal-500/45 text-teal-200'
        )}
      >
        <Target className="w-3 h-3 shrink-0" />
        <span className="hidden sm:inline">{t('ar.romRangeLabel')}</span>
        <span className="font-mono text-white tabular-nums">{percent}%</span>
      </div>

      {/* Hold timer indicator during isometric peak */}
      {holdSeconds > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/70 text-emerald-200 text-[10px] font-black uppercase tracking-wider tabular-nums shadow-lg"
        >
          {t('ar.holdSeconds', { sec: holdSeconds })}
        </motion.div>
      )}

      {/* Vertical Range Intensity Capsule */}
      <div
        className={cn(
          'ar-rom-capsule w-10 sm:w-12 h-52 sm:h-60 rounded-full bg-slate-950/90 backdrop-blur-2xl border flex flex-col items-center justify-end p-1.5 relative overflow-hidden shadow-2xl transition-colors duration-300',
          isGoalReached
            ? 'border-emerald-400/65'
            : isApproaching
            ? 'border-amber-400/60'
            : 'border-teal-500/40'
        )}
      >
        {/* Target Range Threshold Line (80%+ target peak zone) */}
        <div
          className="absolute inset-x-2 border-t-2 border-dashed border-white/60 z-20 pointer-events-none"
          style={{ bottom: '85%' }}
        />

        {/* Dynamic ROM Progress Bar */}
        <motion.div
          animate={{ height: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className={cn(
            'w-full rounded-full transition-colors duration-300 relative',
            isGoalReached
              ? 'bg-gradient-to-t from-emerald-700 via-emerald-500 to-green-300 shadow-[0_0_16px_rgba(34,197,94,0.8)]'
              : isApproaching
              ? 'bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_14px_rgba(234,179,8,0.6)]'
              : 'bg-gradient-to-t from-teal-700 via-teal-500 to-cyan-300 shadow-[0_0_10px_rgba(45,212,191,0.45)]'
          )}
        >
          {/* Top Edge Glow */}
          {percent > 4 && <div className="absolute top-0 inset-x-0 h-1.5 rounded-full bg-white/90 shadow-sm" />}
        </motion.div>

        {/* Floating Direction Icon */}
        <div className="relative z-10 mb-1.5 text-white/90">
          {isGoalReached ? (
            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
          ) : isApproaching ? (
            <ChevronUp className="w-4 h-4 animate-bounce text-amber-200 stroke-[2.5]" />
          ) : (
            <CircleDot className="w-3.5 h-3.5 text-teal-300/80 stroke-[2.2]" />
          )}
        </div>
      </div>

      {/* Status Badge (strictly reflects ROM excursion toward peak target) */}
      <div
        className={cn(
          'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border backdrop-blur-xl flex items-center gap-1 transition-colors duration-300',
          isGoalReached
            ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/60'
            : isApproaching
            ? 'bg-amber-500/25 text-amber-200 border-amber-400/60'
            : 'bg-slate-900/90 text-teal-200/90 border-teal-500/40'
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isGoalReached ? 'bg-emerald-400' : isApproaching ? 'bg-amber-400' : 'bg-teal-400'
          )}
        />
        <span>{isGoalReached ? t('ar.inRange') : isApproaching ? t('ar.nearRange') : t('ar.startingRange')}</span>
      </div>
    </aside>
  );
};
