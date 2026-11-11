import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle, ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [corrected, setCorrected] = useState(false);

  const getSeverityStyles = () => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-slate-950/95',
          border: 'border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.4)]',
          iconColor: 'text-rose-400',
          badge: 'bg-rose-500/30 text-rose-200 border border-rose-400/60',
          label: 'Compensación Severa',
        };
      case 'mild':
        return {
          bg: 'bg-slate-950/95',
          border: 'border-2 border-teal-400/80 shadow-[0_0_25px_rgba(45,212,191,0.4)]',
          iconColor: 'text-teal-300',
          badge: 'bg-teal-500/30 text-teal-200 border border-teal-400/60',
          label: 'Ajuste Leve Sugerido',
        };
      default:
        return {
          bg: 'bg-slate-950/95',
          border: 'border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.4)]',
          iconColor: 'text-amber-400',
          badge: 'bg-amber-500/30 text-amber-200 border border-amber-400/60',
          label: 'Compensación Detectada',
        };
    }
  };

  const style = getSeverityStyles();

  if (corrected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/95 border-2 border-emerald-400 text-emerald-300 shadow-2xl"
      >
        <div className="flex items-center gap-2 text-sm font-bold">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>¡Postura corregida con éxito! Articulación alineada con MediaPipe.</span>
        </div>
        <button
          onClick={() => setCorrected(false)}
          className="text-xs text-white/70 hover:text-white underline font-semibold"
        >{t('tr.reiniciar')}</button>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-2xl shadow-2xl',
        style.bg,
        style.border,
        className
      )}
    >
      <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn('p-2.5 rounded-xl bg-white/10 shrink-0 mt-0.5 border border-white/15', style.iconColor)}>
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn('text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs', style.badge)}>
                {style.label}
              </span>
              <span className="text-xs sm:text-sm font-bold text-teal-300 drop-shadow-sm">
                {deviationJoint}
              </span>
            </div>
            <p className="text-sm sm:text-base text-white font-bold leading-snug drop-shadow-sm">
              {detectedIssue}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition-colors"
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
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {recommendedCorrection}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Ignorar
              </button>
              <button
                type="button"
                onClick={() => {
                  setCorrected(true);
                  onApplyCorrection?.();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 shadow-sm active:scale-95"
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
