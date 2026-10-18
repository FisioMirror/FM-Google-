import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Minus, 
  Plus, 
  Check, 
  Activity, 
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { springSnappy, springBouncy } from '@/lib/motionVariants';
import { CLINICAL_PASTELS } from '@/lib/designTokens';

export interface CompactJointOption {
  id: string;
  name: string;
  category: 'superior' | 'inferior' | 'axial';
  defaultRom: number;
}

export const CLINICAL_JOINTS: CompactJointOption[] = [
  { id: 'hombro', name: 'Hombro', category: 'superior', defaultRom: 135 },
  { id: 'codo', name: 'Codo', category: 'superior', defaultRom: 90 },
  { id: 'rodilla', name: 'Rodilla', category: 'inferior', defaultRom: 120 },
  { id: 'tobillo', name: 'Tobillo', category: 'inferior', defaultRom: 45 },
  { id: 'cadera', name: 'Cadera', category: 'inferior', defaultRom: 110 },
  { id: 'cervical', name: 'Cuello', category: 'axial', defaultRom: 40 },
];

/**
 * 1. CompactJointSelector:
 * Selector segmentado horizontal deslizable para pantallas móviles.
 * Elimina la necesidad de dropdowns lentos con un diseño de un solo toque.
 */
export function CompactJointSelector({
  selectedJoint,
  onSelectJoint,
  className,
}: {
  selectedJoint: string;
  onSelectJoint: (jointId: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">
          {t('joints.targetJoint')}
        </span>
        <span className="text-2xs font-mono text-teal-600 dark:text-teal-400 font-bold">
          1-Tap
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
        {CLINICAL_JOINTS.map((joint) => {
          const isSelected = selectedJoint.toLowerCase() === joint.id.toLowerCase();
          return (
            <button
              key={joint.id}
              type="button"
              onClick={() => onSelectJoint(joint.id)}
              className={cn(
                'relative px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all snap-start select-none border',
                isSelected
                  ? 'bg-primary text-on-primary border-teal-600 shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-on-surface-variant border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-joint-indicator"
                  transition={springSnappy}
                  className="absolute inset-0 bg-teal-600 rounded-xl -z-10"
                />
              )}
              <span>{t(`joints.${joint.id}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 2. CompactRomStepper:
 * Stepper táctil ultra-compacto (+ / -) con respuesta de resorte para ajustar
 * grados de flexión o repeticiones sin desplegar el teclado virtual.
 */
export function CompactRomStepper({
  value,
  onChange,
  min = 10,
  max = 180,
  step = 5,
  unit = '°',
  label,
  className,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const increment = () => onChange(Math.min(max, value + step));
  const decrement = () => onChange(Math.max(min, value - step));

  return (
    <div
      className={cn(
        'p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3',
        className
      )}
    >
      <div className="min-w-0">
        <span className="text-2xs uppercase font-bold text-on-surface-variant block leading-tight truncate">
          {label || t('cqs.romGoal')}
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-xl sm:text-2xl font-black text-on-surface tabular-nums tracking-tight">
            {value}
          </span>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
            {unit}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <motion.button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          whileTap={{ scale: 0.9 }}
          transition={springBouncy}
          aria-label={t('cqs.decreaseValue')}
          className="size-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-on-surface flex items-center justify-center font-bold shadow-xs disabled:opacity-30 disabled:pointer-events-none active:bg-slate-100 dark:active:bg-slate-600"
        >
          <Minus className="size-4" />
        </motion.button>

        <motion.button
          type="button"
          onClick={increment}
          disabled={value >= max}
          whileTap={{ scale: 0.9 }}
          transition={springBouncy}
          aria-label={t('cqs.increaseValue')}
          className="size-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-xs shadow-teal-600/30 disabled:opacity-30 disabled:pointer-events-none active:bg-teal-700"
        >
          <Plus className="size-4" />
        </motion.button>
      </div>
    </div>
  );
}

/**
 * 3. CompactToleranceDropdown:
 * Popover selector compacto para la tolerancia biomecánica de la IA
 * (Estricta ±3°, Estándar ±7°, Terapéutica Asistida ±12°).
 */
export function CompactToleranceDropdown({
  tolerance,
  onChange,
  className,
}: {
  tolerance: 'strict' | 'standard' | 'relaxed';
  onChange: (t: 'strict' | 'standard' | 'relaxed') => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const options = [
    {
      id: 'strict' as const,
      label: t('cqs.toleranceStrict'),
      desc: t('cqs.strictDesc'),
      badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'standard' as const,
      label: t('cqs.toleranceStandard'),
      desc: t('cqs.standardDesc'),
      badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    },
    {
      id: 'relaxed' as const,
      label: t('cqs.toleranceRelaxed'),
      desc: t('cqs.relaxedDesc'),
      badge: 'bg-info/15 text-info dark:text-info border-info/30',
    },
  ];

  const current = options.find((o) => o.id === tolerance) || options[1];

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-xs text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <span className="text-2xs uppercase font-bold text-on-surface-variant block leading-none">
              {t('cqs.aiTolerance')}
            </span>
            <span className="text-xs font-bold text-on-surface truncate block mt-0.5">
              {current.label}
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            'size-4 text-on-surface-variant transition-transform duration-200 shrink-0',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={springSnappy}
              className="absolute top-full left-0 right-0 mt-1.5 z-40 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-elevated backdrop-blur-xl space-y-1"
            >
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors',
                    tolerance === opt.id
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">{opt.label}</p>
                    <p className="text-2xs text-on-surface-variant truncate">
                      {opt.desc}
                    </p>
                  </div>
                  {tolerance === opt.id && (
                    <Check className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
