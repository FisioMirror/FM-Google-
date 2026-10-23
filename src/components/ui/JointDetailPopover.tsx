import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Crosshair, Info, TrendingUp, AlertTriangle, X } from 'lucide-react';

export interface JointMetrics {
  jointName: string;
  currentRom: number;
  maxHistoricalRom: number;
  angularVelocity: number; // deg/s
  asymmetryPercentage: number; // vs contralateral joint
  status: 'normal' | 'warning' | 'alert';
}

export interface JointDetailPopoverProps {
  metrics?: JointMetrics;
  className?: string;
  triggerLabel?: string;
}

export const JointDetailPopover: React.FC<JointDetailPopoverProps> = ({
  metrics: metricsProp,
  className,
  triggerLabel: triggerLabelProp,
}) => {
  const { t } = useTranslation();
  const metrics = metricsProp ?? {
    jointName: t('shw.rightKneeFlexion'),
    currentRom: 124,
    maxHistoricalRom: 135,
    angularVelocity: 42,
    asymmetryPercentage: 8,
    status: 'normal' as const,
  };
  const triggerLabel = triggerLabelProp ?? t('jdp.inspectJoint');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 select-none border',
          isOpen
            ? 'bg-primary text-on-primary border-primary shadow-sm'
            : 'bg-surface/90 dark:bg-slate-800/90 text-on-surface dark:text-slate-200 border-outline-variant/30 dark:border-outline-variant/60 hover:border-primary/50'
        )}
        aria-expanded={isOpen}
      >
        <Crosshair className="w-4 h-4 text-primary dark:text-teal-400" />
        <span>{triggerLabel}</span>
      </button>

      {/* Floating Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute left-0 top-full mt-2 z-50 w-80 p-5 rounded-2xl border shadow-elevated backdrop-blur-2xl',
              'bg-surface/95 dark:bg-slate-900/95',
              'border-outline-variant/30 dark:border-outline-variant/60'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15 dark:border-outline-variant/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface dark:text-white">
                    {metrics.jointName}
                  </h4>
                  <span className="text-2xs text-on-surface-variant">{t('jdp.mediaPipeTelemetry')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-on-surface-variant hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 py-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-black/5 dark:border-outline-variant/40">
                <span className="text-2xs uppercase font-bold text-on-surface-variant block mb-0.5">
                  {t('jdp.currentRom')}
                </span>
                <span className="text-xl font-bold font-mono text-on-surface dark:text-white tabular-nums">
                  {metrics.currentRom}°
                </span>
                <span className="text-2xs text-emerald-500 block">
                  {t('jdp.goal', { value: metrics.maxHistoricalRom })}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-black/5 dark:border-outline-variant/40">
                <span className="text-2xs uppercase font-bold text-on-surface-variant block mb-0.5">
                  {t('jdp.angularVelocity')}
                </span>
                <span className="text-xl font-bold font-mono text-on-surface dark:text-white tabular-nums">
                  {metrics.angularVelocity}
                  <span className="text-xs text-on-surface-variant ml-0.5 font-normal">°/s</span>
                </span>
                <span className="text-2xs text-on-surface-variant block">{t('jdp.smoothMotorControl')}</span>
              </div>
            </div>

            {/* Asymmetry Bar */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-black/5 dark:border-outline-variant/40">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-on-surface-variant">{t('jdp.contralateralAsymmetry')}</span>
                <span className="font-mono font-bold text-on-surface dark:text-white">
                  {metrics.asymmetryPercentage}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    metrics.asymmetryPercentage > 15 ? 'bg-danger' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(100, metrics.asymmetryPercentage * 3)}%` }}
                />
              </div>
              <span className="text-2xs text-on-surface-variant mt-1 block">
                {metrics.asymmetryPercentage <= 10 ? t('jdp.balanceNormal') : t('jdp.requiresAdjustment')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
