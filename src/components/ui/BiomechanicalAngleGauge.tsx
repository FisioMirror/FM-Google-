import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface BiomechanicalAngleGaugeProps {
  currentAngle: number;
  targetAngle: number;
  minAngle?: number;
  maxAngle?: number;
  safeTolerance?: number; // +/- degrees
  jointName?: string;
  unit?: string;
  size?: number; // px diameter
  className?: string;
  onAngleClick?: () => void;
}

export const BiomechanicalAngleGauge: React.FC<BiomechanicalAngleGaugeProps> = ({
  currentAngle,
  targetAngle,
  minAngle = 0,
  maxAngle = 180,
  safeTolerance = 10,
  jointName = 'Rodilla Derecha',
  unit = '°',
  size = 220,
  className,
  onAngleClick,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;

  // Arc range: 240 degrees total (from 150deg to 390deg)
  const totalArc = 240;
  const startAngleOffset = 150;

  // Normalize angle to [0, 1]
  const clampedAngle = Math.max(minAngle, Math.min(maxAngle, currentAngle));
  const progressRatio = (clampedAngle - minAngle) / (maxAngle - minAngle);
  const targetRatio = (Math.max(minAngle, Math.min(maxAngle, targetAngle)) - minAngle) / (maxAngle - minAngle);

  // Circumference of full circle
  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalArc / 360) * circumference;
  const strokeDashoffset = arcLength - progressRatio * arcLength;

  // Status calculation
  const delta = Math.abs(currentAngle - targetAngle);
  const status = useMemo(() => {
    if (delta <= safeTolerance) return { label: 'Rango Óptimo', color: 'emerald', hex: '#10b981' };
    if (delta <= safeTolerance * 2) return { label: 'Compensación Leve', color: 'amber', hex: '#f59e0b' };
    return { label: 'Fuera de Rango', color: 'rose', hex: '#f43f5e' };
  }, [delta, safeTolerance]);

  return (
    <div
      onClick={onAngleClick}
      className={cn(
        'relative flex flex-col items-center justify-center p-5 rounded-3xl',
        'bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl',
        'border border-outline-variant/30 dark:border-white/10 shadow-sm transition-all duration-300',
        'hover:shadow-[0_8px_30px_rgba(0,80,77,0.12)] hover:border-primary/40',
        className
      )}
      style={{ width: size + 40 }}
      role="region"
      aria-label={`Medidor biomecánico para ${jointName}`}
    >
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant dark:text-slate-300">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="truncate max-w-[130px]">{jointName}</span>
        </div>
        <span
          className={cn(
            'text-[10px] font-medium px-2 py-0.5 rounded-full border',
            status.color === 'emerald' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            status.color === 'amber' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            status.color === 'rose' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          )}
        >
          {status.label}
        </span>
      </div>

      {/* SVG Arc Gauge */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#c1ff72" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            className="text-slate-200 dark:text-slate-800"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${startAngleOffset}deg)`,
            }}
          />

          {/* Active Progress Arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin: 'center',
              transform: `rotate(${startAngleOffset}deg)`,
              filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.35))',
            }}
          />
        </svg>

        {/* Center Display with Springs */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            key={currentAngle}
            initial={{ scale: 0.92, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className="text-4xl font-extrabold font-mono tracking-tight text-on-surface dark:text-white tabular-nums flex items-baseline justify-center">
              <span>{Math.round(currentAngle)}</span>
              <span className="text-xl font-normal text-slate-400 ml-0.5">{unit}</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Objetivo: <span className="font-mono font-bold text-primary dark:text-teal-400">{targetAngle}{unit}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Target Marker & Min/Max Footnote */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 px-3 mt-1">
        <span>{minAngle}{unit}</span>
        <div className="flex items-center gap-1 text-[11px]">
          {status.color === 'emerald' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="font-sans">Δ {delta > 0 ? `+${Math.round(delta)}` : 0}{unit}</span>
        </div>
        <span>{maxAngle}{unit}</span>
      </div>
    </div>
  );
};
