import React from 'react';
import { motion } from 'framer-motion';
import { Timer, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { RepPhase, TrafficLightState } from '@/hooks/usePoseDetection';

export interface ClinicalCadenceAnalyzerProps {
  lastRepDurationSeconds?: number;
  isMoving?: boolean;
  repPhase?: RepPhase;
  trafficLight?: TrafficLightState;
  className?: string;
}

export const ClinicalCadenceAnalyzer: React.FC<ClinicalCadenceAnalyzerProps> = ({
  lastRepDurationSeconds = 2.4,
  isMoving = false,
  repPhase,
  trafficLight,
  className,
}) => {
  const { t } = useTranslation();

  // Clinical cadence guidelines:
  // < 1.4s: Too fast (inadequate eccentric control)
  // 1.4s - 4.2s: Optimal physiological tempo
  // > 4.2s: Prolonged isometric pause / slow execution
  const duration = Math.max(0.5, lastRepDurationSeconds);

  let status: {
    label: string;
    description: string;
    color: string;
    badgeBg: string;
    icon: typeof CheckCircle;
  };

  if (duration < 1.4) {
    status = {
      label: t('ar.cadenceFast'),
      description: t('ar.cadenceFastDesc'),
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
    };
  } else if (duration > 4.2) {
    status = {
      label: t('ar.cadenceSlow'),
      description: t('ar.cadenceSlowDesc'),
      color: 'text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      icon: Activity,
    };
  } else {
    status = {
      label: t('ar.cadenceOptimal'),
      description: t('ar.cadenceOptimalDesc'),
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle,
    };
  }

  const StatusIcon = status.icon;

  const phaseText =
    repPhase === 'hold'
      ? t('ar.phaseHold')
      : repPhase === 'concentric'
      ? t('ar.phaseConcentric')
      : repPhase === 'eccentric'
      ? t('ar.phaseEccentric')
      : repPhase === 'neutral'
      ? t('ar.phaseNeutral')
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border text-white shadow-2xl space-y-2.5 transition-colors duration-300',
        trafficLight === 'green'
          ? 'border-emerald-400/50'
          : trafficLight === 'yellow'
          ? 'border-amber-400/45'
          : trafficLight === 'red'
          ? 'border-rose-500/45'
          : 'border-teal-500/35',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 shrink-0">
            <Timer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider block truncate">
              {t('ar.cadenceTitle')}
            </span>
            <span className="text-[10px] text-teal-300/80 font-mono block truncate">
              {phaseText || t('ar.cadenceTempo')}
            </span>
          </div>
        </div>

        <div
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0',
            status.badgeBg
          )}
        >
          <StatusIcon className="w-3 h-3" />
          <span>{status.label}</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black font-mono text-white tabular-nums">
            {duration.toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-teal-300/80">s / rep</span>
        </div>

        {/* Dynamic tempo wave */}
        <div className="flex items-center gap-1">
          {[0.2, 0.5, 0.8, 0.4].map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                scaleY: isMoving ? [0.4, 1.2, 0.4] : 0.4,
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: idx * 0.15,
                ease: 'easeInOut',
              }}
              className="w-1 h-4 bg-teal-400 rounded-full origin-bottom"
            />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-white/70 font-medium leading-tight">
        {status.description}
      </p>
    </motion.div>
  );
};
