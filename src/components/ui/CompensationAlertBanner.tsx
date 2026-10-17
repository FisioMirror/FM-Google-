import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle, ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';

export interface CompensationAlertBannerProps {
  deviationJoint?: string;
  detectedIssue?: string;
  recommendedCorrection?: string;
  severity?: 'mild' | 'moderate' | 'high';
  className?: string;
  onDismiss?: () => void;
  onApplyCorrection?: () => void;
}

export const CompensationAlertBanner: React.FC<CompensationAlertBannerProps> = ({
  deviationJoint = 'Hombro Izquierdo',
  detectedIssue = 'Elevación compensatoria durante la flexión de codo',
  recommendedCorrection = 'Mantén la escápula retraída y desciende el trapecio antes de iniciar el movimiento.',
  severity = 'moderate',
  className,
  onDismiss,
  onApplyCorrection,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [corrected, setCorrected] = useState(false);

  const getSeverityStyles = () => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-950/40',
          border: 'border-rose-500/30',
          iconColor: 'text-rose-500',
          badge: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
          label: 'Compensación Severa',
        };
      case 'mild':
        return {
          bg: 'bg-teal-500/10 dark:bg-teal-950/40',
          border: 'border-teal-500/30',
          iconColor: 'text-teal-500',
          badge: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
          label: 'Ajuste Leve Sugerido',
        };
      default:
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/40',
          border: 'border-amber-500/30',
          iconColor: 'text-amber-500',
          badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
          label: 'Compensación Moderada',
        };
    }
  };

  const style = getSeverityStyles();

  if (corrected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>¡Postura corregida con éxito! Articulación alineada con MediaPipe.</span>
        </div>
        <button
          onClick={() => setCorrected(false)}
          className="text-xs text-on-surface-variant hover:underline"
        >
          Reiniciar
        </button>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-xl',
        style.bg,
        style.border,
        className
      )}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-xl bg-white/40 dark:bg-black/20 shrink-0 mt-0.5', style.iconColor)}>
            <AlertCircle className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', style.badge)}>
                {style.label}
              </span>
              <span className="text-xs font-semibold text-on-surface dark:text-white">
                {deviationJoint}
              </span>
            </div>
            <p className="text-sm text-on-surface font-medium">
              {detectedIssue}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-on-surface-variant transition-colors"
          aria-label="Expandir sugerencia correctiva"
        >
          <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>
      </div>

      {/* Expanded Recommendation */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 pt-1 border-t border-black/5 dark:border-white/5"
          >
            <div className="p-3 rounded-xl bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/10 mb-3">
              <span className="text-xs font-semibold text-primary dark:text-teal-400 block mb-1">
                Guía Biomecánica Inmediata:
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {recommendedCorrection}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface dark:hover:text-slate-200"
              >
                Ignorar
              </button>
              <button
                type="button"
                onClick={() => {
                  setCorrected(true);
                  onApplyCorrection?.();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>Confirmar Corrección</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
