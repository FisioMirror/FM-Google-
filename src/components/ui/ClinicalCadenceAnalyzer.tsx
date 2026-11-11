import React from 'react';
import { motion } from 'framer-motion';
import { Timer, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClinicalCadenceAnalyzerProps {
  lastRepDurationSeconds?: number;
  isMoving?: boolean;
  className?: string;
}

export const ClinicalCadenceAnalyzer: React.FC<ClinicalCadenceAnalyzerProps> = ({
  lastRepDurationSeconds = 2.4,
  isMoving = false,
  className,
}) => {
  // Clinical cadence guidelines:
  // < 1.3s: Too fast (inadequate eccentric control)
  // 1.8s - 3.8s: Optimal physiological tempo
  // > 4.5s: Prolonged isometric pause / slow execution
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
      label: 'Demasiado Rápido',
      description: 'Controla la fase de descenso (2-3s)',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
    };
  } else if (duration > 4.2) {
    status = {
      label: 'Ritmo Pausado',
      description: 'Mantén fluidez sin sobrecargar',
      color: 'text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      icon: Activity,
    };
  } else {
    status = {
      label: 'Cadencia Óptima',
      description: 'Excelente control neuromuscular',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle,
    };
  }

  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-teal-500/35 text-white shadow-2xl space-y-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
              Cadencia Clínica
            </span>
            <span className="text-[10px] text-teal-300/80 font-mono">
              Tempo articular
            </span>
          </div>
        </div>

        <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", status.badgeBg)}>
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
          {[0.2, 0.5, 0.8, 0.4].map((h, idx) => (
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
