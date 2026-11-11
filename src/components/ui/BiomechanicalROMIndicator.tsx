import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Check, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BiomechanicalROMIndicatorProps {
  currentAngle: number;
  targetAngle: number;
  className?: string;
}

export const BiomechanicalROMIndicator: React.FC<BiomechanicalROMIndicatorProps> = ({
  currentAngle,
  targetAngle,
  className,
}) => {
  const safeTarget = Math.max(1, targetAngle);
  const percent = Math.min(100, Math.max(0, Math.round((currentAngle / safeTarget) * 100)));
  const isOptimal = percent >= 88 && percent <= 112;
  const isNear = percent >= 65 && !isOptimal;

  return (
    <aside
      className={cn(
        "flex flex-col items-center gap-3 select-none pointer-events-auto",
        className
      )}
      aria-label="Indicador vertical de excursión articular ROM"
    >
      {/* Target Marker Chip */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-xl border border-teal-500/40 text-[10px] sm:text-xs font-bold text-teal-300 shadow-xl">
        <Target className="w-3 h-3 text-teal-400" />
        <span className="hidden sm:inline">Rango:</span>
        <span className="font-mono text-white">{percent}%</span>
      </div>

      {/* Vertical Range Intensity Capsule */}
      <div className="w-10 sm:w-12 h-56 sm:h-64 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-teal-500/40 flex flex-col items-center justify-end p-1.5 relative overflow-hidden shadow-2xl">
        {/* Target Range Threshold Line */}
        <div
          className="absolute inset-x-2 border-t-2 border-dashed border-teal-300/80 z-20 pointer-events-none"
          style={{ bottom: '90%' }}
        />

        {/* Dynamic Gradient Bar */}
        <motion.div
          animate={{ height: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className={cn(
            "w-full rounded-full transition-colors duration-300 relative",
            isOptimal
              ? "bg-gradient-to-t from-teal-700 via-teal-400 to-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
              : isNear
              ? "bg-gradient-to-t from-teal-800 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(45,212,191,0.6)]"
              : "bg-gradient-to-t from-slate-800 via-teal-700 to-teal-500"
          )}
        >
          {/* Top Edge Glow */}
          <div className="absolute top-0 inset-x-0 h-1.5 rounded-full bg-white/90 shadow-sm" />
        </motion.div>

        {/* Floating Direction Icon */}
        <div className="relative z-10 mb-1.5 text-white/90">
          {isOptimal ? (
            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
          ) : (
            <ChevronUp className="w-4 h-4 animate-bounce text-teal-200 stroke-[2.5]" />
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={cn(
          "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border backdrop-blur-xl",
          isOptimal
            ? "bg-emerald-500/25 text-emerald-200 border-emerald-400/60"
            : isNear
            ? "bg-teal-500/25 text-teal-200 border-teal-400/60"
            : "bg-slate-900/90 text-slate-300 border-white/20"
        )}
      >
        {isOptimal ? 'En Rango' : isNear ? 'Cercano' : 'Iniciando'}
      </div>
    </aside>
  );
};
