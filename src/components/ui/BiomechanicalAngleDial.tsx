import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BiomechanicalAngleDialProps {
  currentAngle: number;
  targetAngle: number;
  tolerance?: number;
  size?: number;
  className?: string;
}

export const BiomechanicalAngleDial: React.FC<BiomechanicalAngleDialProps> = ({
  currentAngle,
  targetAngle,
  tolerance = 8,
  size = 220,
  className,
}) => {
  const safeTarget = Math.max(1, targetAngle);
  const roundedAngle = Math.round(currentAngle);
  const isTargetAchieved = Math.abs(currentAngle - targetAngle) <= tolerance;

  // Arc calculation (2 * PI * radius)
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1.2, Math.max(0, currentAngle / safeTarget));
  const strokeDashoffset = circumference - ratio * (circumference * 0.75); // 270 degree sweep

  return (
    <div
      className={cn(
        "relative rounded-full bg-slate-950/90 backdrop-blur-2xl border border-teal-500/40 p-6 flex flex-col items-center justify-center shadow-2xl select-none pointer-events-auto",
        className
      )}
      style={{ width: size, height: size }}
      role="region"
      aria-label="Medidor de ángulo biomecánico circular"
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
          stroke={isTargetAchieved ? "#34d399" : "#8ad3cf"}
          strokeWidth="7"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          strokeLinecap="round"
          style={{
            filter: isTargetAchieved
              ? 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.8))'
              : 'drop-shadow(0 0 8px rgba(138, 211, 207, 0.6))',
          }}
        />
      </svg>

      {/* Center Readout */}
      <div className="z-10 text-center flex flex-col items-center">
        <p className="text-teal-300/80 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-1">
          Ángulo
        </p>
        <h2 className="text-white text-4xl sm:text-5xl font-black leading-none tabular-nums drop-shadow-md">
          {roundedAngle}°
        </h2>
        <div className="h-[1px] w-12 bg-white/25 my-2" />
        <p className="text-white/80 text-xs sm:text-sm font-semibold">
          Objetivo: <span className="text-teal-300 font-bold">{targetAngle}°</span>
        </p>
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
