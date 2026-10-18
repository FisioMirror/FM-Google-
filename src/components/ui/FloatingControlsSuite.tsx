import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Compass,
  Pin,
  ClipboardPen,
  Tag,
  Timer,
  ChevronDown,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldAlert,
} from 'lucide-react';

/* 21. JointAnatomyTooltip */
export interface JointAnatomyTooltipProps {
  jointName?: string;
  agonists?: string;
  precautions?: string;
  className?: string;
}

export const JointAnatomyTooltip: React.FC<JointAnatomyTooltipProps> = ({
  jointName,
  agonists,
  precautions,
  className,
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const joint = jointName ?? t('ffcs.patellarTendon');
  const agonistList = agonists ?? t('ffcs.agonistsDefault');
  const precautionText = precautions ?? t('ffcs.precautionsDefault');

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setVisible(!visible)}
        onMouseEnter={() => setVisible(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs font-bold text-on-surface shadow-sm hover:border-teal-500/50 transition-all cursor-pointer"
      >
        <span className="p-1 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
          <HelpCircle className="w-3.5 h-3.5" />
        </span>
        <span>{t('ffcs.anatomyLabel', { name: joint })}</span>
      </motion.button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 bottom-full mb-2.5 z-50 w-72 p-4 rounded-3xl bg-white/95 dark:bg-slate-950/95 text-on-surface dark:text-white border border-teal-500/30 dark:border-teal-500/40 shadow-elevated text-xs space-y-2 backdrop-blur-2xl transition-colors"
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
              <span className="font-black text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {joint}
              </span>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="text-on-surface-variant hover:text-on-surface dark:hover:text-white text-2xs cursor-pointer"
              >
                {t('common.close')}
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">{t('ffcs.agonistMuscles')}</strong> {agonistList}
            </p>
            <div className="p-2 rounded-xl bg-warning/15 border border-warning/30 text-2xs text-warning flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-warning mt-0.5" />
              <span>{precautionText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* 22. ARCameraFilterDropdown */
export interface ARCameraFilterDropdownProps {
  currentFilter?: string;
  onFilterChange?: (filter: string) => void;
  className?: string;
}

export const ARCameraFilterDropdown: React.FC<ARCameraFilterDropdownProps> = ({
  currentFilter,
  onFilterChange,
  className,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentFilter ?? t('ffcs.mesh3d'));
  const filters = [
    { id: t('ffcs.mesh3d'), desc: t('ffcs.mesh3dDesc') },
    { id: t('ffcs.skeletonMinimal'), desc: t('ffcs.skeletonMinimalDesc') },
    { id: t('ffcs.jointPoints'), desc: '33 landmarks MediaPipe' },
    { id: t('ffcs.clinicalSilhouette'), desc: t('ffcs.clinicalSilhouetteDesc') },
  ];

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-info/30 text-xs font-bold text-on-surface shadow-sm hover:border-info/50 transition-all"
      >
        <span className="p-1 rounded-lg bg-info/20 text-info dark:text-info">
          <Eye className="w-3.5 h-3.5" />
        </span>
        <span>{selected}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-on-surface-variant transition-transform", open && "rotate-180")} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 w-60 p-2 rounded-2xl bg-surface/95 dark:bg-slate-900/95 border border-info/30 shadow-elevated backdrop-blur-2xl space-y-1"
          >
            {filters.map((f) => {
              const isCurrent = selected === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelected(f.id);
                    onFilterChange?.(f.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between",
                    isCurrent
                      ? "bg-info text-white shadow-sm"
                      : "hover:bg-black/5 dark:hover:bg-white/5 text-on-surface"
                  )}
                >
                  <div>
                    <span className="block font-bold">{f.id}</span>
                    <span className={cn("text-2xs", isCurrent ? "text-white/80" : "text-on-surface-variant")}>
                      {f.desc}
                    </span>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* 23. RapidToleranceAdjuster */
export interface RapidToleranceAdjusterProps {
  toleranceDegrees?: number;
  onToleranceChange?: (val: number) => void;
  className?: string;
}

export const RapidToleranceAdjuster: React.FC<RapidToleranceAdjusterProps> = ({
  toleranceDegrees = 8,
  onToleranceChange,
  className,
}) => {
  const { t } = useTranslation();
  const [val, setVal] = useState(toleranceDegrees);

  const getModeLabel = () => {
    if (val <= 4) return { text: t('arMirror.strict'), color: 'text-danger bg-danger/10 border-danger/20' };
    if (val <= 8) return { text: t('arMirror.clinicalStandard'), color: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20' };
    return { text: t('arMirror.permissive'), color: 'text-warning bg-warning/10 border-warning/20' };
  };

  const mode = getModeLabel();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 p-2 px-3 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs shadow-sm",
        className
      )}
    >
      <div className="p-1 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
        <SlidersHorizontal className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="text-2xs font-bold text-on-surface-variant uppercase tracking-wider block">{t('ffcs.toleranceRom')}</span>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xs font-bold px-1.5 py-0.2 rounded border", mode.color)}>
            {mode.text}
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-on-surface">
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                const next = Math.max(2, val - 1);
                setVal(next);
                onToleranceChange?.(next);
              }}
              className="size-5 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors"
            >
              -
            </motion.button>
            <span className="w-8 text-center tabular-nums">±{val}°</span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                const next = Math.min(20, val + 1);
                setVal(next);
                onToleranceChange?.(next);
              }}
              className="size-5 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors"
            >
              +
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 24. AudioMuteFloatingPill */
export interface AudioMuteFloatingPillProps {
  initialMuted?: boolean;
  onToggle?: (muted: boolean) => void;
  className?: string;
}

export const AudioMuteFloatingPill: React.FC<AudioMuteFloatingPillProps> = ({
  initialMuted = false,
  onToggle,
  className,
}) => {
  const { t } = useTranslation();
  const [muted, setMuted] = useState(initialMuted);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        const next = !muted;
        setMuted(next);
        onToggle?.(next);
      }}
      className={cn(
        "inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all shadow-sm select-none",
        muted
          ? "bg-danger/15 text-danger border-danger/30"
          : "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
        className
      )}
    >
      <div className={cn("p-1 rounded-lg", muted ? "bg-danger/20" : "bg-teal-500/20")}>
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </div>
      <span>{muted ? t('ffcs.audioMuted') : t('ffcs.biofeedbackActive')}</span>
      {!muted && (
        <span className="size-2 rounded-full bg-emerald-500 animate-ping ml-1" />
      )}
    </motion.button>
  );
};

/* 25. ExerciseSwitchFloatingMenu */
export interface ExerciseSwitchFloatingMenuProps {
  exercises?: string[];
  currentExercise?: string;
  onSelect?: (ex: string) => void;
  className?: string;
}

export const ExerciseSwitchFloatingMenu: React.FC<ExerciseSwitchFloatingMenuProps> = ({
  exercises,
  currentExercise,
  onSelect,
  className,
}) => {
  const { t } = useTranslation();
  const [active, setActive] = useState(currentExercise ?? t('ffcs.assistedSquat'));
  const exerciseOptions = exercises ?? [t('ffcs.assistedSquat'), t('ffcs.gluteBridge'), t('ffcs.lateralRaise')];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 p-1.5 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 shadow-sm",
        className
      )}
    >
      {exerciseOptions.map((ex) => {
        const isCurrent = active === ex;
        return (
          <motion.button
            key={ex}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setActive(ex);
              onSelect?.(ex);
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              isCurrent
                ? "bg-primary text-on-primary shadow-sm shadow-teal-600/30"
                : "text-on-surface-variant hover:text-on-surface dark:hover:text-white"
            )}
          >
            {ex}
          </motion.button>
        );
      })}
    </div>
  );
};

/* 26. PhysioNoteAnnotationBubble */
export interface PhysioNoteAnnotationBubbleProps {
  author?: string;
  noteText?: string;
  className?: string;
}

export const PhysioNoteAnnotationBubble: React.FC<PhysioNoteAnnotationBubbleProps> = ({
  author = 'Dra. Ramos',
  noteText,
  className,
}) => {
  const { t } = useTranslation();
  const note = noteText ?? t('ffcs.noteDefault');
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "inline-flex items-center gap-2.5 p-2.5 px-4 rounded-2xl bg-warning/15 border border-warning/35 text-warning dark:text-warning text-xs shadow-sm",
        className
      )}
    >
      <div className="p-1 rounded-lg bg-warning/20 text-warning shrink-0">
        <Pin className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="font-bold text-warning dark:text-warning block">{author}:</span>
        <span className="truncate max-w-[220px] font-medium">{note}</span>
      </div>
    </motion.div>
  );
};

/* 27. QuickPrescriptionModalButton */
export interface QuickPrescriptionModalButtonProps {
  className?: string;
}

export const QuickPrescriptionModalButton: React.FC<QuickPrescriptionModalButtonProps> = ({ className }) => {
  const { t } = useTranslation();
  const [series, setSeries] = useState(3);
  const [reps, setReps] = useState(12);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 p-2 px-3.5 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs shadow-sm",
        className
      )}
    >
      <div className="p-1 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
        <ClipboardPen className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="text-2xs font-bold text-on-surface-variant uppercase tracking-wider block">{t('ffcs.quickPrescription')}</span>
        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
          {t('ffcs.seriesReps', { series, reps })}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setReps((r) => (r >= 20 ? 8 : r + 2))}
        className="text-2xs font-bold text-primary hover:underline ml-1"
      >
        {t('ffcs.adjust')}
      </button>
    </div>
  );
};

/* 28. BiomechanicalTagSelector */
export interface BiomechanicalTagSelectorProps {
  tags?: string[];
  className?: string;
}

export const BiomechanicalTagSelector: React.FC<BiomechanicalTagSelectorProps> = ({
  tags,
  className,
}) => {
  const { t } = useTranslation();
  const allTags = tags ?? [t('ffcs.acl'), t('ffcs.meniscus'), t('tools.tPostOp'), t('ffcs.closedChain'), t('shw.proprioception')];
  const [selected, setSelected] = useState<string[]>([t('ffcs.acl'), t('tools.tPostOp')]);

  const toggle = (t: string) => {
    setSelected((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {allTags.map((t) => {
        const isSelected = selected.includes(t);
        return (
          <motion.button
            key={t}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(t)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5",
              isSelected
                ? "bg-teal-500/20 text-teal-800 dark:text-teal-200 border-teal-500/50 shadow-sm"
                : "bg-surface/50 border-outline-variant/30 text-on-surface-variant hover:text-on-surface-variant dark:hover:text-slate-200"
            )}
          >
            <Tag className="w-3 h-3 opacity-70" />
            <span>{t}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

/* 29. CalibrationCompass */
export interface CalibrationCompassProps {
  pitch?: number;
  roll?: number;
  className?: string;
}

export const CalibrationCompass: React.FC<CalibrationCompassProps> = ({
  pitch = 0,
  roll = 1,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs shadow-sm",
        className
      )}
    >
      <div className="relative p-1.5 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
        <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
      </div>
      <div>
        <span className="font-bold text-on-surface dark:text-white block">{t('ffcs.gyroscope')}</span>
        <span className="text-2xs text-teal-600 dark:text-teal-400 font-mono font-bold">
          Pitch: {pitch}° • Roll: {roll}° ({t('ffcs.leveled')})
        </span>
      </div>
    </motion.div>
  );
};

/* 30. FloatingMiniStopwatch */
export interface FloatingMiniStopwatchProps {
  className?: string;
}

export const FloatingMiniStopwatch: React.FC<FloatingMiniStopwatchProps> = ({ className }) => {
  const { t } = useTranslation();
  const [seconds, setSeconds] = useState(45);
  const [active, setActive] = useState(false);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs shadow-sm",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setActive(!active)}
        className="p-1.5 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-500/30 transition-colors"
      >
        {active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <div>
        <span className="text-2xs uppercase font-bold text-on-surface-variant block tracking-wider">{t('ffcs.restRemaining')}</span>
        <span className="font-mono font-black text-on-surface text-sm">
          00:{seconds < 10 ? `0${seconds}` : seconds}s
        </span>
      </div>
      <button
        type="button"
        onClick={() => setSeconds(45)}
        className="p-1 text-on-surface-variant hover:text-on-surface-variant dark:hover:text-white"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
