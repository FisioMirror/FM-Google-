import React, { useState } from 'react';
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
  jointName = 'Tendón Rotuliano',
  agonists = 'Cuádriceps femoral, Vasto medial y lateral',
  precautions = 'Evitar flexión forzada > 90° en fase inflamatoria aguda',
  className,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setVisible(!visible)}
        onMouseEnter={() => setVisible(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-md hover:border-teal-500/50 transition-all cursor-pointer"
      >
        <span className="p-1 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
          <HelpCircle className="w-3.5 h-3.5" />
        </span>
        <span>Anatomía: {jointName}</span>
      </motion.button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 bottom-full mb-2.5 z-50 w-72 p-4 rounded-3xl bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-white border border-teal-500/30 dark:border-teal-500/40 shadow-elevated text-xs space-y-2 backdrop-blur-2xl transition-colors"
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
              <span className="font-black text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {jointName}
              </span>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Músculos Agonistas:</strong> {agonists}
            </p>
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-2xs text-amber-300 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
              <span>{precautions}</span>
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
  currentFilter = 'Malla 3D Completa',
  onFilterChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentFilter);
  const filters = [
    { id: 'Malla 3D Completa', desc: 'Superficie volumétrica AR' },
    { id: 'Esqueleto Minimalista', desc: 'Líneas biomecánicas puras' },
    { id: 'Puntos Articulares', desc: '33 landmarks MediaPipe' },
    { id: 'Silueta Clínica', desc: 'Contraste alto para postura' },
  ];

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-cyan-500/30 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-md hover:border-cyan-500/50 transition-all"
      >
        <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
          <Eye className="w-3.5 h-3.5" />
        </span>
        <span>{selected}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 w-60 p-2 rounded-2xl bg-surface/95 dark:bg-slate-900/95 border border-cyan-500/30 shadow-elevated backdrop-blur-2xl space-y-1"
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
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <div>
                    <span className="block font-bold">{f.id}</span>
                    <span className={cn("text-2xs", isCurrent ? "text-cyan-100" : "text-slate-400")}>
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
  const [val, setVal] = useState(toleranceDegrees);

  const getModeLabel = () => {
    if (val <= 4) return { text: 'Estricto', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
    if (val <= 8) return { text: 'Estándar Clínico', color: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20' };
    return { text: 'Permisivo', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  };

  const mode = getModeLabel();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 p-2 px-3 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs shadow-md",
        className
      )}
    >
      <div className="p-1 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
        <SlidersHorizontal className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Tolerancia ROM</span>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xs font-bold px-1.5 py-0.2 rounded border", mode.color)}>
            {mode.text}
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-white">
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
        "inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all shadow-md select-none",
        muted
          ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
          : "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
        className
      )}
    >
      <div className={cn("p-1 rounded-lg", muted ? "bg-rose-500/20" : "bg-teal-500/20")}>
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </div>
      <span>{muted ? 'Audio Silenciado' : 'Biofeedback Activo'}</span>
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
  exercises = ['Sentadilla Asistida', 'Puente Glúteo', 'Elevación Lateral'],
  currentExercise = 'Sentadilla Asistida',
  onSelect,
  className,
}) => {
  const [active, setActive] = useState(currentExercise);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 p-1.5 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 shadow-md",
        className
      )}
    >
      {exercises.map((ex) => {
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
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
  noteText = 'Vigilar no compensar con basculación pélvica lateral en el descenso.',
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "inline-flex items-center gap-2.5 p-2.5 px-4 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-900 dark:text-amber-100 text-xs shadow-md",
        className
      )}
    >
      <div className="p-1 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
        <Pin className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="font-bold text-amber-600 dark:text-amber-400 block">{author}:</span>
        <span className="truncate max-w-[220px] font-medium">{noteText}</span>
      </div>
    </motion.div>
  );
};

/* 27. QuickPrescriptionModalButton */
export interface QuickPrescriptionModalButtonProps {
  className?: string;
}

export const QuickPrescriptionModalButton: React.FC<QuickPrescriptionModalButtonProps> = ({ className }) => {
  const [series, setSeries] = useState(3);
  const [reps, setReps] = useState(12);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 p-2 px-3.5 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs shadow-md",
        className
      )}
    >
      <div className="p-1 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
        <ClipboardPen className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Prescripción Rápida</span>
        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
          {series} Series × {reps} Repeticiones
        </span>
      </div>
      <button
        type="button"
        onClick={() => setReps((r) => (r >= 20 ? 8 : r + 2))}
        className="text-2xs font-bold text-primary hover:underline ml-1"
      >
        Ajustar
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
  tags = ['LCA', 'Menisco', 'Post-Op', 'Cadena Cerrada', 'Propiocepción'],
  className,
}) => {
  const [selected, setSelected] = useState<string[]>(['LCA', 'Post-Op']);

  const toggle = (t: string) => {
    setSelected((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((t) => {
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
                : "bg-surface/50 border-outline-variant/30 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs shadow-md",
        className
      )}
    >
      <div className="relative p-1.5 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
        <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
      </div>
      <div>
        <span className="font-bold text-slate-800 dark:text-white block">Giroscopio Sagital AR</span>
        <span className="text-2xs text-teal-600 dark:text-teal-400 font-mono font-bold">
          Pitch: {pitch}° • Roll: {roll}° (Nivelado)
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
  const [seconds, setSeconds] = useState(45);
  const [active, setActive] = useState(false);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs shadow-md",
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
        <span className="text-2xs uppercase font-bold text-slate-400 block tracking-wider">Descanso Restante</span>
        <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
          00:{seconds < 10 ? `0${seconds}` : seconds}s
        </span>
      </div>
      <button
        type="button"
        onClick={() => setSeconds(45)}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
