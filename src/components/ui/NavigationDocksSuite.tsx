import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Compass,
  LayoutGrid,
  Users,
  ChevronRight,
  Split,
  LifeBuoy,
  Hand,
  Video,
  Film,
  Sparkles,
  Search,
  Mic,
  Camera,
  Play,
  Pause,
  Maximize2,
  Info,
  CheckCircle2,
} from 'lucide-react';

/* 41. CurvedMobileDock */
export interface CurvedMobileDockProps {
  className?: string;
  onScanClick?: () => void;
}

export const CurvedMobileDock: React.FC<CurvedMobileDockProps> = ({
  className,
  onScanClick,
}) => {
  const [activeTab, setActiveTab] = useState<'ejercicios' | 'scan' | 'progreso'>('scan');

  return (
    <div
      className={cn(
        "relative p-2 px-6 rounded-3xl bg-slate-950/95 text-white border border-teal-500/30 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-6",
        className
      )}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setActiveTab('ejercicios')}
        className={cn(
          "text-xs font-bold transition-colors py-1",
          activeTab === 'ejercicios' ? "text-teal-400" : "text-slate-400 hover:text-white"
        )}
      >
        Ejercicios
      </motion.button>

      {/* Central Action Button con ondas expansivas */}
      <div className="relative -mt-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setActiveTab('scan');
            onScanClick?.();
          }}
          className="size-14 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-teal-500/40 border-2 border-slate-950"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </motion.button>
        <span className="absolute -inset-1 rounded-2xl border border-teal-400/40 animate-ping pointer-events-none" />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setActiveTab('progreso')}
        className={cn(
          "text-xs font-bold transition-colors py-1",
          activeTab === 'progreso' ? "text-teal-400" : "text-slate-400 hover:text-white"
        )}
      >
        Progreso
      </motion.button>
    </div>
  );
};

/* 42. TherapistSidebarMini */
export interface TherapistSidebarMiniProps {
  className?: string;
}

export const TherapistSidebarMini: React.FC<TherapistSidebarMiniProps> = ({ className }) => {
  const [active, setActive] = useState('grid');

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-2 p-2 rounded-2xl bg-surface/90 dark:bg-slate-900/90 border border-teal-500/30 shadow-lg backdrop-blur-2xl",
        className
      )}
    >
      {[
        { id: 'grid', icon: LayoutGrid, label: 'Dashboard' },
        { id: 'users', icon: Users, label: 'Pacientes' },
        { id: 'video', icon: Video, label: 'Teleterapia' },
      ].map((item) => {
        const isCurrent = active === item.id;
        const IconComponent = item.icon;
        return (
          <motion.button
            key={item.id}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActive(item.id)}
            className={cn(
              "p-2.5 rounded-xl transition-all relative group",
              isCurrent
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <IconComponent className="w-4 h-4" />
          </motion.button>
        );
      })}
    </div>
  );
};

/* 43. QuickPatientSwitcherBar */
export interface QuickPatientSwitcherBarProps {
  patients?: string[];
  activePatient?: string;
  onSelect?: (p: string) => void;
  className?: string;
}

export const QuickPatientSwitcherBar: React.FC<QuickPatientSwitcherBarProps> = ({
  patients = ['Carlos R. (En vivo)', 'Lucía M.', 'Andrés G.', 'Sofía V.'],
  activePatient = 'Carlos R. (En vivo)',
  onSelect,
  className,
}) => {
  const [active, setActive] = useState(activePatient);

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto p-1", className)}>
      {patients.map((p) => {
        const isCurrent = active === p;
        return (
          <motion.button
            key={p}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setActive(p);
              onSelect?.(p);
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5",
              isCurrent
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30"
                : "bg-surface/80 dark:bg-slate-800/80 border-outline-variant/30 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {isCurrent && <span className="size-1.5 rounded-full bg-lime-300 animate-ping" />}
            <span>{p}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

/* 44. SessionStateBreadcrumb */
export interface SessionStateBreadcrumbProps {
  currentStep?: number;
  className?: string;
}

export const SessionStateBreadcrumb: React.FC<SessionStateBreadcrumbProps> = ({
  currentStep = 1,
  className,
}) => {
  const [step, setStep] = useState(currentStep);
  const steps = ['Calibración Inicial', 'Rutina AR Guiada', 'Reporte Clínico'];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 p-2 px-3 rounded-2xl bg-surface/90 dark:bg-slate-800/90 border border-teal-500/25 text-xs font-bold shadow-md",
        className
      )}
    >
      {steps.map((s, idx) => {
        const isDone = idx < step;
        const isCurrent = idx === step;
        return (
          <React.Fragment key={s}>
            <button
              type="button"
              onClick={() => setStep(idx)}
              className={cn(
                "flex items-center gap-1 transition-colors",
                isCurrent
                  ? "text-teal-600 dark:text-teal-400 font-black"
                  : isDone
                  ? "text-emerald-500 font-semibold"
                  : "text-slate-400"
              )}
            >
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{s}</span>
            </button>
            {idx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* 45. SplitViewPerspectiveToggle */
export interface SplitViewPerspectiveToggleProps {
  mode?: 'front' | 'side' | 'split';
  onChange?: (mode: 'front' | 'side' | 'split') => void;
  className?: string;
}

export const SplitViewPerspectiveToggle: React.FC<SplitViewPerspectiveToggleProps> = ({
  mode = 'front',
  onChange,
  className,
}) => {
  const [val, setVal] = useState(mode);

  return (
    <div
      className={cn(
        "inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-teal-500/30 text-xs font-bold shadow-md",
        className
      )}
    >
      {(['front', 'side', 'split'] as const).map((m) => {
        const isSelected = val === m;
        return (
          <motion.button
            key={m}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setVal(m);
              onChange?.(m);
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all capitalize",
              isSelected
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {m === 'front' ? 'Frontal 2D' : m === 'side' ? 'Sagital 90°' : 'Dual Split'}
          </motion.button>
        );
      })}
    </div>
  );
};

/* 46. FloatingHelpBeacon */
export interface FloatingHelpBeaconProps {
  className?: string;
}

export const FloatingHelpBeacon: React.FC<FloatingHelpBeaconProps> = ({ className }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-2.5 p-2.5 px-4 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/35 text-xs font-bold hover:bg-teal-500/25 transition-all shadow-md",
        className
      )}
    >
      <LifeBuoy className="w-4 h-4 animate-spin text-teal-500" style={{ animationDuration: '10s' }} />
      <span>Guía Clínica Asistida</span>
      <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
    </motion.button>
  );
};

/* 47. ErgonomicHandModeSwitcher */
export interface ErgonomicHandModeSwitcherProps {
  hand?: 'right' | 'left';
  className?: string;
}

export const ErgonomicHandModeSwitcher: React.FC<ErgonomicHandModeSwitcherProps> = ({
  hand = 'right',
  className,
}) => {
  const [currentHand, setCurrentHand] = useState(hand);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={() => setCurrentHand(currentHand === 'right' ? 'left' : 'right')}
      className={cn(
        "inline-flex items-center gap-2.5 p-2 px-3.5 rounded-2xl bg-gradient-to-r from-surface/90 via-surface-container/90 to-surface/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-teal-500/30 text-xs font-bold shadow-md",
        className
      )}
    >
      <Hand className="w-4 h-4 text-primary" />
      <span>Modo {currentHand === 'right' ? 'Diestro' : 'Zurdo'}</span>
    </motion.button>
  );
};

/* 48. CompactTelehealthBar */
export interface CompactTelehealthBarProps {
  therapistName?: string;
  latencyMs?: number;
  className?: string;
}

export const CompactTelehealthBar: React.FC<CompactTelehealthBarProps> = ({
  therapistName = 'Dra. Ramos (En línea)',
  latencyMs = 38,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-3 px-4 rounded-2xl bg-slate-950/95 text-white border border-teal-500/30 shadow-xl flex items-center justify-between gap-4 text-xs backdrop-blur-2xl",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-bold">{therapistName}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded-full">
          {latencyMs} ms
        </span>
      </div>
    </div>
  );
};

/* 49. ExerciseTimelineScrubber */
export interface ExerciseTimelineScrubberProps {
  totalSeconds?: number;
  currentSecond?: number;
  className?: string;
}

export const ExerciseTimelineScrubber: React.FC<ExerciseTimelineScrubberProps> = ({
  totalSeconds = 60,
  currentSecond = 24,
  className,
}) => {
  const [sec, setSec] = useState(currentSecond);

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
        <span className="text-teal-600 dark:text-teal-400">00:{sec < 10 ? `0${sec}` : sec}</span>
        <span>01:00 Total</span>
      </div>
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          setSec(Math.round(ratio * totalSeconds));
        }}
        className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden cursor-pointer p-0.5"
      >
        <motion.div
          animate={{ width: `${(sec / totalSeconds) * 100}%` }}
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
        />
      </div>
    </div>
  );
};

/* 50. ContextualActionIsland */
export interface ContextualActionIslandProps {
  message?: string;
  className?: string;
}

export const ContextualActionIsland: React.FC<ContextualActionIslandProps> = ({
  message = 'MediaPipe: Calibración Óptima a 60 FPS',
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "inline-flex flex-col rounded-3xl bg-slate-950/95 text-white border border-teal-500/40 shadow-2xl text-xs font-semibold cursor-pointer select-none backdrop-blur-2xl transition-all",
        expanded ? "p-3 px-5 gap-2" : "p-2 px-4 flex-row items-center gap-2.5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-teal-400 animate-ping" />
        <span className="font-bold">{message}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 text-[10px] font-mono text-slate-400 border-t border-white/10 pt-2"
          >
            <span>Latencia: 18ms</span>
            <span>GPU: 14%</span>
            <span>Landmarks: 33/33</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
