import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Activity,
  Smile,
  Meh,
  Frown,
  Footprints,
  Waves,
  Crosshair,
  HeartPulse,
  Milestone,
  Check,
  ChevronRight,
  TrendingUp,
  Calendar,
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
  Play,
  RotateCcw,
} from 'lucide-react';

/* 1. MuscleTargetRadarCard */
export interface MuscleTargetRadarCardProps {
  className?: string;
  targets?: { muscle: string; activation: number; color?: string }[];
}

export const MuscleTargetRadarCard: React.FC<MuscleTargetRadarCardProps> = ({
  className,
  targets,
}) => {
  const { t } = useTranslation();
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const radarTargets = targets ?? [
    { muscle: t('facs.quadriceps'), activation: 88, color: '#00A389' },
    { muscle: t('facs.hamstrings'), activation: 65, color: '#06b6d4' },
    { muscle: t('facs.gluteusMaximus'), activation: 74, color: '#8b5cf6' },
    { muscle: t('facs.calves'), activation: 52, color: '#f59e0b' },
    { muscle: t('facs.coreAbdominal'), activation: 82, color: '#10b981' },
  ];
  const size = 190;
  const center = size / 2;
  const radius = 68;
  const total = radarTargets.length;

  const getCoordinates = (index: number, val: number) => {
    const angle = ((Math.PI * 2) / total) * index - Math.PI / 2;
    const r = (val / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = radarTargets
    .map((t, i) => {
      const { x, y } = getCoordinates(i, t.activation);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/20 dark:border-teal-500/30 shadow-card hover:shadow-teal-500/10 transition-all overflow-hidden group",
        className
      )}
    >
      {/* Glow ambiental de fondo */}
      <div className="absolute -top-12 -right-12 size-36 rounded-full bg-teal-500/10 blur-3xl pointer-events-none group-hover:bg-teal-500/20 transition-all duration-300" />
      <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-info/10 blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              {t('facs.muscleActivation')}
            </h4>
            <span className="text-2xs text-on-surface-variant">{t('facs.emgEffortMap')}</span>
          </div>
        </div>
        <span className="text-2xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-teal-500 animate-ping" />
          {t('facs.estimatedEmg')}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-2">
        <div className="relative">
          <svg width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A389" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Círculos concéntricos guía */}
            {[0.33, 0.66, 1].map((rFactor, idx) => (
              <polygon
                key={idx}
                points={radarTargets
                  .map((_, i) => {
                    const { x, y } = getCoordinates(i, rFactor * 100);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-200/80 dark:text-on-surface/80"
                strokeDasharray={idx < 2 ? '3 3' : 'none'}
              />
            ))}

            {/* Radios desde el centro */}
            {radarTargets.map((_, i) => {
              const { x, y } = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.75"
                  className="text-slate-300/60 dark:text-on-surface/60"
                />
              );
            })}

            {/* Polígono dinámico con animación */}
            <motion.polygon
              points={points}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: [1, 1.015, 1],
              }}
              transition={{
                scale: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                opacity: { duration: 0.6 },
              }}
              fill="url(#radarGrad)"
              stroke="#00A389"
              strokeWidth="2.5"
              filter="url(#glow)"
            />

            {/* Nodos de activación interactivos */}
            {radarTargets.map((t, i) => {
              const { x, y } = getCoordinates(i, t.activation);
              const isSelected = selectedMuscle === t.muscle;
              return (
                <g key={t.muscle} className="cursor-pointer" onClick={() => setSelectedMuscle(isSelected ? null : t.muscle)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 4}
                    fill={t.color || '#c1ff72'}
                    stroke="#00A389"
                    strokeWidth="2"
                    className="transition-all hover:scale-125"
                  />
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="9"
                      fill="none"
                      stroke="#00A389"
                      strokeWidth="1.5"
                      className="animate-ping opacity-75"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-1.5 w-full sm:w-auto text-xs min-w-[130px]">
          {radarTargets.map((t) => {
            const isSelected = selectedMuscle === t.muscle;
            return (
              <button
                key={t.muscle}
                type="button"
                onClick={() => setSelectedMuscle(isSelected ? null : t.muscle)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-2 py-1 rounded-xl transition-all text-left",
                  isSelected
                    ? "bg-teal-500/20 border border-teal-500/40 text-teal-800 dark:text-teal-200 font-bold"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-on-surface-variant"
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: t.color || '#00A389' }} />
                  <span className="truncate max-w-[95px]">{t.muscle}</span>
                </div>
                <span className="font-mono font-bold tabular-nums text-on-surface">
                  {t.activation}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

/* 2. PainScaleInteractiveCard */
export interface PainScaleInteractiveCardProps {
  initialPain?: number; // 0 - 10
  className?: string;
  onPainChange?: (pain: number) => void;
}

export const PainScaleInteractiveCard: React.FC<PainScaleInteractiveCardProps> = ({
  initialPain = 3,
  className,
  onPainChange,
}) => {
  const { t } = useTranslation();
  const [pain, setPain] = useState(initialPain);

  const getFace = () => {
    if (pain === 0) return <Smile className="w-8 h-8 text-emerald-400 animate-pulse" />;
    if (pain <= 3) return <Smile className="w-8 h-8 text-teal-400" />;
    if (pain <= 6) return <Meh className="w-8 h-8 text-warning animate-wiggle" />;
    return <Frown className="w-8 h-8 text-danger" />;
  };

  const getLabel = () => {
    if (pain === 0) return t('facs.painNone');
    if (pain <= 3) return t('facs.painMild');
    if (pain <= 6) return t('facs.painModerate');
    if (pain <= 8) return t('facs.painSevere');
    return t('facs.painMax');
  };

  const getAccentGradient = () => {
    if (pain <= 3) return 'from-teal-500/20 via-emerald-500/10 to-surface';
    if (pain <= 6) return 'from-warning/20 via-warning/10 to-surface';
    return 'from-danger/20 via-danger/10 to-surface';
  };

  const getBadgeColor = () => {
    if (pain <= 3) return 'text-teal-600 dark:text-teal-400 bg-teal-500/15 border-teal-500/30';
    if (pain <= 6) return 'text-warning dark:text-warning bg-warning/15 border-warning/30';
    return 'text-danger dark:text-danger bg-danger/15 border-danger/30';
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br backdrop-blur-2xl border border-outline-variant/30 dark:border-outline-variant/60 shadow-card overflow-hidden transition-all",
        getAccentGradient(),
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-on-surface">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {t('facs.vasTitle')}
          </span>
        </div>
        <motion.span
          key={pain}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={cn("text-xs font-mono font-black px-3 py-1 rounded-full border shadow-xs", getBadgeColor())}
        >
          {t('facs.vasScore', { n: pain })}
        </motion.span>
      </div>

      <div className="flex items-center gap-4 py-2">
        <motion.div
          key={pain}
          initial={{ scale: 0.7, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="p-3.5 rounded-2xl bg-surface/90 dark:bg-slate-800/90 shadow-sm border border-black/5 dark:border-outline-variant/60 shrink-0"
        >
          {getFace()}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-on-surface mb-0.5 truncate">{getLabel()}</div>
          <p className="text-xs text-on-surface-variant">
            {t('facs.painHint')}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="10"
            value={pain}
            onChange={(e) => {
              const val = Number(e.target.value);
              setPain(val);
              onPainChange?.(val);
            }}
            className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
          />
        </div>
        <div className="flex justify-between text-2xs font-mono font-bold text-on-surface-variant">
          <span className="text-emerald-500">{t('facs.painScale0')}</span>
          <span className="text-warning">{t('facs.painScale5')}</span>
          <span className="text-danger">{t('facs.painScale10')}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* 3. GaitSymmetryCard */
export interface GaitSymmetryCardProps {
  leftRatio?: number; // e.g. 52
  rightRatio?: number; // e.g. 48
  cadenceSteps?: number;
  className?: string;
}

export const GaitSymmetryCard: React.FC<GaitSymmetryCardProps> = ({
  leftRatio = 51,
  rightRatio = 49,
  cadenceSteps = 108,
  className,
}) => {
  const { t } = useTranslation();
  const [isSimulating, setIsSimulating] = useState(false);
  const [left, setLeft] = useState(leftRatio);
  const [right, setRight] = useState(rightRatio);
  const isSymmetric = Math.abs(left - right) <= 4;

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      setLeft(54);
      setRight(46);
    } else {
      setLeft(leftRatio);
      setRight(rightRatio);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-info/20 dark:border-info/30 shadow-card overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-info/15 text-info dark:text-info">
            <Footprints className="w-4 h-4 animate-pulse" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {t('facs.gaitSymmetry')}
          </h4>
        </div>
        <span
          className={cn(
            "text-2xs font-bold px-2.5 py-0.5 rounded-full border shadow-xs flex items-center gap-1",
            isSymmetric
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-warning/15 text-warning dark:text-warning border-warning/30"
          )}
        >
          <span className={cn("size-1.5 rounded-full", isSymmetric ? "bg-emerald-500" : "bg-warning animate-ping")} />
          {isSymmetric ? t('facs.gaitBalanced') : t('facs.gaitAsymmetry')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="p-3 rounded-2xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20 text-center">
          <span className="text-2xs uppercase font-bold text-teal-600 dark:text-teal-400 block mb-0.5">{t('facs.leftFoot')}</span>
          <span className="text-2xl font-black font-mono text-on-surface tabular-nums">{left}%</span>
        </div>
        <div className="p-3 rounded-2xl bg-info/10 dark:bg-info/15 border border-info/20 text-center">
          <span className="text-2xs uppercase font-bold text-info dark:text-info block mb-0.5">{t('facs.rightFoot')}</span>
          <span className="text-2xl font-black font-mono text-on-surface tabular-nums">{right}%</span>
        </div>
      </div>

      <div className="relative w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex my-2 p-0.5 border border-black/5 dark:border-outline-variant/40">
        <motion.div
          animate={{ width: `${left}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-l-full"
        />
        <motion.div
          animate={{ width: `${right}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="h-full bg-gradient-to-r from-info to-info rounded-r-full"
        />
        {/* Marcador central */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white shadow-sm z-10 -translate-x-1/2" />
      </div>

      <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2">
        <span className="flex items-center gap-1">
          {t('facs.cadenceValue', { n: cadenceSteps })}
        </span>
        <button
          type="button"
          onClick={toggleSimulation}
          className="text-2xs font-bold text-info dark:text-info hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          {isSimulating ? t('facs.restore') : t('facs.simulateLoad')}
        </button>
      </div>
    </motion.div>
  );
};

/* 4. TremorFrequencyCard */
export interface TremorFrequencyCardProps {
  frequencyHz?: number;
  amplitudeMm?: number;
  className?: string;
}

export const TremorFrequencyCard: React.FC<TremorFrequencyCardProps> = ({
  frequencyHz = 2.8,
  amplitudeMm = 0.9,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-info/20 dark:border-info/30 shadow-card overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-info/15 text-info dark:text-info">
            <Waves className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {t('facs.isometricStability')}
          </h4>
        </div>
        <span className="text-2xs font-mono font-bold text-info dark:text-info bg-info/15 border border-info/30 px-2.5 py-0.5 rounded-full">
          {t('facs.frequencyHz', { n: frequencyHz })}
        </span>
      </div>

      <div className="py-2">
        <div className="h-16 flex items-center justify-center gap-1.5 px-2 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-outline-variant/40 transition-colors">
          {[4, 9, 15, 7, 13, 24, 11, 18, 9, 5, 20, 10, 14, 7, 12, 18, 8].map((val, idx) => (
            <motion.div
              key={idx}
              animate={{
                height: [val * 1.5, val * 0.6 + 6, val * 1.5],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.1 + (idx % 3) * 0.2,
                delay: idx * 0.05,
                ease: 'easeInOut',
              }}
              className="w-1.5 rounded-full bg-gradient-to-t from-teal-600 via-info to-kinetic shadow-sm"
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-black/5 dark:border-outline-variant/40">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          {t('facs.microOscillations')}
        </span>
        <span className="font-mono font-bold text-on-surface">{t('facs.amplitudeMm', { n: amplitudeMm })}</span>
      </div>
    </motion.div>
  );
};

/* 5. PostureStabilityCard */
export interface PostureStabilityCardProps {
  balanceScore?: number;
  centerShiftX?: number;
  centerShiftY?: number;
  className?: string;
}

export const PostureStabilityCard: React.FC<PostureStabilityCardProps> = ({
  balanceScore = 92,
  centerShiftX = 2,
  centerShiftY = -3,
  className,
}) => {
  const { t } = useTranslation();
  const [shiftX, setShiftX] = useState(centerShiftX);
  const [shiftY, setShiftY] = useState(centerShiftY);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-emerald-500/20 dark:border-emerald-500/30 shadow-card overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '16s' }} />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {t('facs.centerOfPressure')}
          </h4>
        </div>
        <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          {balanceScore}/100 Score
        </span>
      </div>

      <div className="flex items-center justify-center my-2">
        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round(((e.clientX - rect.left) / rect.width - 0.5) * 16);
            const y = Math.round(((e.clientY - rect.top) / rect.height - 0.5) * 16);
            setShiftX(x);
            setShiftY(y);
          }}
          onMouseLeave={() => {
            setShiftX(centerShiftX);
            setShiftY(centerShiftY);
          }}
          className="relative w-28 h-28 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-50/60 dark:bg-slate-950/60 shadow-inner cursor-crosshair overflow-hidden transition-colors"
        >
          {/* Anillos concéntricos de tolerancia */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute inset-2 rounded-full border border-emerald-400/30"
          />
          <div className="w-16 h-16 rounded-full border border-emerald-500/40" />
          <div className="w-8 h-8 rounded-full border border-teal-400/60 bg-teal-500/15" />

          {/* Ejes transversales */}
          <div className="absolute inset-x-0 h-[1px] bg-emerald-500/30" />
          <div className="absolute inset-y-0 w-[1px] bg-emerald-500/30" />

          {/* Punto cinemático del paciente */}
          <motion.div
            animate={{ x: shiftX * 2.2, y: shiftY * 2.2 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute size-4 rounded-full bg-gradient-to-r from-teal-400 to-kinetic ring-4 ring-emerald-500/40 shadow-card shadow-teal-500/50 flex items-center justify-center"
          >
            <span className="size-1 rounded-full bg-slate-900" />
          </motion.div>
        </div>
      </div>

      <p className="text-xs text-center text-on-surface-variant">
        {t('facs.coronalDeviation')} <strong className="font-mono text-emerald-500">{shiftX}°</strong> | {t('facs.sagittal')}{' '}
        <strong className="font-mono text-emerald-500">{shiftY}°</strong>
      </p>
    </motion.div>
  );
};

/* 6. CardioEffortPillCard */
export interface CardioEffortPillCardProps {
  borgLevel?: number; // 6 to 20
  heartRateEstimated?: number;
  className?: string;
}

export const CardioEffortPillCard: React.FC<CardioEffortPillCardProps> = ({
  borgLevel = 12,
  heartRateEstimated = 104,
  className,
}) => {
  const { t } = useTranslation();
  const percent = Math.min(100, Math.max(0, ((borgLevel - 6) / 14) * 100));

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-danger/20 dark:border-danger/30 shadow-card overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.25, 1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="p-1.5 rounded-xl bg-danger/15 text-danger"
          >
            <HeartPulse className="w-4 h-4" />
          </motion.div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {t('facs.cardioEffort')}
          </h4>
        </div>
        <span className="text-2xs font-mono font-bold text-danger dark:text-danger bg-danger/15 border border-danger/30 px-2.5 py-0.5 rounded-full">
          RPE {borgLevel} / 20
        </span>
      </div>

      <div className="flex items-baseline justify-between my-2">
        <div>
          <span className="text-3xl font-black font-mono text-on-surface tabular-nums">
            {heartRateEstimated}
          </span>
          <span className="text-xs font-semibold text-danger ml-1.5">BPM est.</span>
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {t('facs.aerobicZone')}
        </span>
      </div>

      <div className="relative w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden my-2">
        <motion.div
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-emerald-500 via-warning to-danger rounded-full shadow-sm"
        />
      </div>

      <div className="flex justify-between text-2xs font-mono text-on-surface-variant">
        <span>{t('facs.borgRepose')}</span>
        <span>{t('facs.borgModerate')}</span>
        <span>{t('facs.borgMax')}</span>
      </div>
    </motion.div>
  );
};

/* 7. RehabPhaseStepCard */
export interface RehabPhaseStepCardProps {
  currentPhaseIndex?: number;
  className?: string;
}

export const RehabPhaseStepCard: React.FC<RehabPhaseStepCardProps> = ({
  currentPhaseIndex = 1,
  className,
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(currentPhaseIndex);
  const phases = [
    { title: t('facs.phase1Title'), detail: t('facs.phase1Detail') },
    { title: t('facs.phase2Title'), detail: t('facs.phase2Detail') },
    { title: t('facs.phase3Title'), detail: t('facs.phase3Detail') },
  ];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-primary/20 dark:border-primary/30 shadow-card overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/15 text-primary">
            <Milestone className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {t('facs.clinicalRecoveryPhase')}
          </h4>
        </div>
        <span className="text-2xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
          {t('facs.stepOf', { n: activeStep + 1 })}
        </span>
      </div>

      <div className="space-y-2">
        {phases.map((p, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <motion.div
              key={p.title}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveStep(idx)}
              className={cn(
                "p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2",
                isCurrent
                  ? "bg-teal-500/15 border-teal-500/40 text-teal-900 dark:text-teal-100 shadow-sm"
                  : isDone
                  ? "bg-slate-100/60 dark:bg-slate-800/40 border-black/5 dark:border-outline-variant/40 text-on-surface-variant"
                  : "bg-transparent border-dashed border-slate-300 dark:border-slate-800 text-on-surface-variant opacity-60"
              )}
            >
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>{p.title}</span>
                  {isCurrent && (
                    <span className="text-2xs uppercase font-black tracking-wider bg-teal-500 text-white px-1.5 py-0.2 rounded-full">
                      {t('facs.inProgress')}
                    </span>
                  )}
                </div>
                <p className="text-2xs text-on-surface-variant mt-0.5">{p.detail}</p>
              </div>

              {isDone && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
              {isCurrent && <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* 8. EdemaAssessmentCard */
export interface EdemaAssessmentCardProps {
  foveaGrade?: number;
  perimeterMm?: number;
  className?: string;
}

export const EdemaAssessmentCard: React.FC<EdemaAssessmentCardProps> = ({
  foveaGrade = 1,
  perimeterMm = 38.5,
  className,
}) => {
  const { t } = useTranslation();
  const [grade, setGrade] = useState(foveaGrade);
  const [tested, setTested] = useState(false);

  const runGodetTest = () => {
    setTested(true);
    setTimeout(() => setTested(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/20 dark:border-teal-500/30 shadow-card overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
          {t('facs.edemaTitle')}
        </h4>
        <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
          {t('facs.edemaGrade', { n: grade })}
        </span>
      </div>

      <div className="my-2 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-on-surface-variant">{t('facs.jointPerimeter')}</span>
        <span className="font-mono font-bold text-on-surface text-sm">{perimeterMm} cm</span>
      </div>

      <div className="flex items-center gap-2 my-2">
        <button
          type="button"
          onClick={runGodetTest}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border shadow-xs flex items-center justify-center gap-1.5",
            tested
              ? "bg-emerald-500 text-white border-emerald-500 animate-pulse"
              : "bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 border-teal-500/30"
          )}
        >
          <Play className="w-3 h-3" />
          {tested ? t('facs.edemaElastic') : t('facs.godetTest')}
        </button>
      </div>

      <p className="text-xs text-on-surface-variant">
        {t('facs.edemaHint')}
      </p>
    </motion.div>
  );
};

/* 9. StrengthProgressionCard */
export interface StrengthProgressionCardProps {
  estimated1RMKg?: number;
  velocityMs?: number;
  className?: string;
}

export const StrengthProgressionCard: React.FC<StrengthProgressionCardProps> = ({
  estimated1RMKg = 42.5,
  velocityMs = 0.68,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-primary/20 dark:border-primary/30 shadow-card overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/15 text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {t('facs.vbtTitle')}
          </h4>
        </div>
        <span className="text-2xs font-mono text-primary bg-primary/15 border border-primary/30 px-2.5 py-0.5 rounded-full font-bold">
          {velocityMs} m/s
        </span>
      </div>

      <div className="my-2 flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-black font-mono text-on-surface tabular-nums">
            {estimated1RMKg}
          </span>
          <span className="text-xs text-on-surface-variant ml-1 font-bold">kg 1RM Est.</span>
        </div>
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
          {t('facs.optimalVelocity')}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{t('facs.strengthGain')}</span>
      </div>
    </motion.div>
  );
};

/* 10. PatientAdherenceHeatmapCard */
export interface PatientAdherenceHeatmapCardProps {
  className?: string;
}

export const PatientAdherenceHeatmapCard: React.FC<PatientAdherenceHeatmapCardProps> = ({
  className,
}) => {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const days = [t('facs.mon'), t('facs.tue'), t('facs.wed'), t('facs.thu'), t('facs.fri'), t('facs.sat'), t('facs.sun')];
  const adherence = [2, 3, 3, 1, 3, 2, 0];
  const minutes = [25, 40, 45, 15, 45, 30, 0];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/20 dark:border-teal-500/30 shadow-card overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <Calendar className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {t('shw.weeklyAdherence')}
          </h4>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
          <Flame className="w-3.5 h-3.5 text-warning fill-warning" />
          <span>{t('facs.compliancePct', { n: 86 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {days.map((d, i) => {
          const val = adherence[i];
          const isSelected = selectedDay === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDay(isSelected ? null : i)}
              className="space-y-1.5 group/day"
            >
              <span className="text-2xs text-on-surface-variant font-bold block">{d}</span>
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "h-9 rounded-xl transition-all flex items-center justify-center font-mono text-2xs font-bold",
                  val === 3 && "bg-teal-500 text-white shadow-sm shadow-teal-500/30",
                  val === 2 && "bg-teal-500/70 text-white",
                  val === 1 && "bg-teal-500/30 text-teal-900 dark:text-teal-200",
                  val === 0 && "bg-slate-200 dark:bg-slate-800 text-on-surface-variant",
                  isSelected && "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900"
                )}
              >
                {val > 0 ? `${minutes[i]}m` : '—'}
              </motion.div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-on-surface-variant flex items-center justify-between"
          >
            <span>{t('facs.dayLabel')} {days[selectedDay]}: <strong>{minutes[selectedDay]} {t('common.minutes')}</strong> {t('facs.ofRoutine')}</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{t('facs.postureValidated')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
