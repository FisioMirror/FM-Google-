import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { RepPhase, TrafficLightState } from '@/hooks/usePoseDetection';

export interface BiomechanicalAngleDialProps {
  currentAngle: number;
  targetAngle: number;
  neutralAngle?: number;
  tolerance?: number;
  size?: number;
  trafficLight?: TrafficLightState;
  repPhase?: RepPhase;
  romPercent?: number;
  className?: string;
}

export const BiomechanicalAngleDial: React.FC<BiomechanicalAngleDialProps> = ({
  currentAngle,
  targetAngle,
  neutralAngle = 0,
  tolerance = 8,
  size = 220,
  trafficLight,
  repPhase,
  romPercent,
  className,
}) => {
  const { t } = useTranslation();
  const safeSpan = Math.max(1, Math.abs(targetAngle - neutralAngle));
  const roundedAngle = Math.round(currentAngle);
  const hasValidRom = typeof romPercent === 'number' && Number.isFinite(romPercent);
  const computedPercent = hasValidRom
    ? Math.min(105, Math.max(0, romPercent!))
    : Math.min(105, Math.max(0, Math.round((Math.abs(currentAngle - neutralAngle) / safeSpan) * 100)));

  const isTargetAchieved = hasValidRom
    ? romPercent! >= 82
    : computedPercent >= 82 || (Math.abs(currentAngle - targetAngle) <= tolerance && Math.abs(currentAngle - neutralAngle) >= 15);

  // Arc calculation (2 * PI * radius) supporting both flexion (targetAngle > neutralAngle) and extension (targetAngle < neutralAngle)
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1.05, Math.max(0, computedPercent / 100));
  const strokeDashoffset = circumference - ratio * (circumference * 0.75); // 270 degree sweep

  const strokeColor =
    trafficLight === 'green'
      ? '#22c55e'
      : trafficLight === 'yellow'
      ? '#eab308'
      : trafficLight === 'red'
      ? '#ef4444'
      : isTargetAchieved
      ? '#34d399'
      : '#8ad3cf';

  const glowFilter =
    trafficLight === 'green'
      ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))'
      : trafficLight === 'yellow'
      ? 'drop-shadow(0 0 9px rgba(234, 179, 8, 0.7))'
      : trafficLight === 'red'
      ? 'drop-shadow(0 0 9px rgba(239, 68, 68, 0.7))'
      : isTargetAchieved
      ? 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.8))'
      : 'drop-shadow(0 0 8px rgba(138, 211, 207, 0.6))';

  const phaseLabel =
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
    <div
      className={cn(
        'relative rounded-full bg-slate-950/90 backdrop-blur-2xl border p-6 flex flex-col items-center justify-center shadow-2xl select-none pointer-events-auto transition-colors duration-300',
        trafficLight === 'green'
          ? 'border-emerald-400/60'
          : trafficLight === 'yellow'
          ? 'border-amber-400/55'
          : trafficLight === 'red'
          ? 'border-rose-500/55'
          : 'border-teal-500/40',
        className
      )}
      style={{ width: size, height: size }}
      role="region"
      aria-label={t('ar.angleLabel')}
    >
      {/* Background & Progress Rings */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-135 pointer-events-none"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />

        {/* Dynamic Glowing Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth="7"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          strokeLinecap="round"
          style={{ filter: glowFilter }}
        />
      </svg>

      {/* Center Readout */}
      <div className="z-10 text-center flex flex-col items-center">
        <p className="text-teal-300/80 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-1">
          {t('ar.angleLabel')}
        </p>
        <h2 className="text-white text-4xl sm:text-5xl font-black leading-none tabular-nums drop-shadow-md">
          {roundedAngle}°
        </h2>
        <div className="h-[1px] w-12 bg-white/25 my-2" />
        <p className="text-white/80 text-xs sm:text-sm font-semibold tabular-nums">
          {t('ar.targetShort')}{' '}
          <span className="text-teal-300 font-bold">{targetAngle}°</span>
        </p>
        {phaseLabel && (
          <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/65">
            {phaseLabel}
          </span>
        )}
      </div>

      {/* Target Verified Glow Anchor */}
      {isTargetAchieved && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-slate-950 border border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.9)]"
        >
          <CheckCircle2 className="w-5 h-5 fill-emerald-500/30" />
        </motion.div>
      )}
    </div>
  );
};
