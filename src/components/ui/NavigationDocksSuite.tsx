import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  LayoutGrid,
  Users,
  ChevronRight,
  LifeBuoy,
  Hand,
  Video,
  Sparkles,
  CheckCircle2,
  Phone,
  MessageSquare,
} from 'lucide-react';

/* 41. CurvedMobileDock */
export interface CurvedMobileDockProps {
  className?: string;
  onScanClick?: () => void;
  onExercisesClick?: () => void;
  onProgressClick?: () => void;
  currentTab?: 'ejercicios' | 'scan' | 'progreso';
}

export const CurvedMobileDock: React.FC<CurvedMobileDockProps> = ({
  className,
  onScanClick,
  onExercisesClick,
  onProgressClick,
  currentTab,
}) => {
  const { t } = useTranslation();
  const [internalTab, setInternalTab] = useState<'ejercicios' | 'scan' | 'progreso'>('scan');
  const activeTab = currentTab || internalTab;

  return (
    <div
      className={cn(
        "relative p-2 px-6 rounded-3xl bg-white/95 dark:bg-slate-950/95 text-on-surface dark:text-white border border-teal-500/25 dark:border-teal-500/30 shadow-elevated backdrop-blur-2xl flex items-center justify-between gap-6 transition-colors",
        className
      )}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setInternalTab('ejercicios');
          onExercisesClick?.();
        }}
        className={cn(
          "text-xs font-bold transition-colors py-1 cursor-pointer",
          activeTab === 'ejercicios'
            ? "text-teal-600 dark:text-teal-400 font-black"
            : "text-on-surface-variant hover:text-teal-700 dark:hover:text-white"
        )}
      >
        {t('navigation.exercises')}
      </motion.button>

      {/* Central Action Button con ondas expansivas */}
      <div className="relative -mt-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setInternalTab('scan');
            onScanClick?.();
          }}
          className="size-14 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-elevated shadow-teal-500/40 border-2 border-white dark:border-slate-950 cursor-pointer"
          title={t('fnds.startScan')}
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </motion.button>
        <span className="absolute -inset-1 rounded-2xl border border-teal-400/40 animate-ping pointer-events-none" />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setInternalTab('progreso');
          onProgressClick?.();
        }}
        className={cn(
          "text-xs font-bold transition-colors py-1 cursor-pointer",
          activeTab === 'progreso'
            ? "text-teal-600 dark:text-teal-400 font-black"
            : "text-on-surface-variant hover:text-teal-700 dark:hover:text-white"
        )}
      >
        {t('patients.progress')}
      </motion.button>
    </div>
  );
};

/* 42. TherapistSidebarMini */
export interface TherapistSidebarMiniProps {
  className?: string;
  activeId?: string;
  onSelect?: (id: string) => void;
}

export const TherapistSidebarMini: React.FC<TherapistSidebarMiniProps> = ({
  className,
  activeId = 'grid',
  onSelect,
}) => {
  const { t } = useTranslation();
  const [internalActive, setInternalActive] = useState(activeId);
  const active = activeId || internalActive;

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-2 p-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-teal-500/25 dark:border-teal-500/30 shadow-card backdrop-blur-2xl transition-colors",
        className
      )}
    >
      {[
        { id: 'grid', icon: LayoutGrid, label: 'Dashboard' },
        { id: 'users', icon: Users, label: t('navigation.patients') },
        { id: 'video', icon: Video, label: t('fnds.teletherapy') },
      ].map((item) => {
        const isCurrent = active === item.id;
        const IconComponent = item.icon;
        return (
          <motion.button
            key={item.id}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setInternalActive(item.id);
              onSelect?.(item.id);
            }}
            className={cn(
              "p-2.5 rounded-xl transition-all relative group cursor-pointer",
              isCurrent
                ? "bg-primary text-on-primary shadow-sm shadow-teal-600/30"
                : "text-on-surface-variant hover:text-on-surface dark:text-on-surface-variant dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            )}
            title={item.label}
          >
            <IconComponent className="w-4 h-4" />
          </motion.button>
        );
      })}
    </div>
  );
};

/* 43. QuickPatientSwitcherBar */
export interface PatientSwitcherItem {
  id: string;
  name: string;
}

export interface QuickPatientSwitcherBarProps {
  patients?: (string | PatientSwitcherItem)[];
  activePatient?: string;
  onSelect?: (p: string) => void;
  className?: string;
}

export const QuickPatientSwitcherBar: React.FC<QuickPatientSwitcherBarProps> = ({
  patients,
  activePatient,
  onSelect,
  className,
}) => {
  const { t } = useTranslation();
  const defaultPatients = [t('fnds.carlosLive'), 'Lucía M.', 'Andrés G.', 'Sofía V.'];
  const patientList = patients ?? defaultPatients;
  const [active, setActive] = useState(activePatient ?? t('fnds.carlosLive'));

  useEffect(() => {
    setActive(activePatient ?? t('fnds.carlosLive'));
  }, [activePatient, t]);

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto p-1 hide-scrollbar", className)}>
      {patientList.map((item, idx) => {
        const name = typeof item === 'string' ? item : item.name;
        const value = typeof item === 'string' ? item : item.id;
        const isCurrent = active === name || active === value;
        const itemKey = typeof item === 'object' && item.id ? item.id : `${name}-${idx}`;
        return (
          <motion.button
            key={itemKey}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setActive(name);
              onSelect?.(name);
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer",
              isCurrent
                ? "bg-primary text-on-primary border-teal-600 shadow-sm shadow-teal-600/30"
                : "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-on-surface-variant hover:text-on-surface dark:hover:text-white hover:border-teal-500/40"
            )}
          >
            {isCurrent && <span className="size-1.5 rounded-full bg-lime-300 animate-ping" />}
            <span>{name}</span>
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
  onStepClick?: (step: number) => void;
}

export const SessionStateBreadcrumb: React.FC<SessionStateBreadcrumbProps> = ({
  currentStep = 1,
  className,
  onStepClick,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(currentStep);
  const steps = [t('fnds.stepCalibration'), t('fnds.stepGuidedRoutine'), t('fnds.stepClinicalReport')];

  useEffect(() => {
    setStep(currentStep);
  }, [currentStep]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 p-2 px-3 rounded-2xl bg-white/95 dark:bg-slate-800/90 border border-teal-500/25 text-xs font-bold shadow-sm transition-colors",
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
              onClick={() => {
                setStep(idx);
                onStepClick?.(idx);
              }}
              className={cn(
                "flex items-center gap-1 transition-colors cursor-pointer",
                isCurrent
                  ? "text-teal-600 dark:text-teal-400 font-black"
                  : isDone
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-on-surface-variant hover:text-on-surface-variant dark:hover:text-slate-200"
              )}
            >
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{s}</span>
            </button>
            {idx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-on-surface-variant" />}
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
  const { t } = useTranslation();
  const [val, setVal] = useState(mode);

  useEffect(() => {
    setVal(mode);
  }, [mode]);

  return (
    <div
      className={cn(
        "inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-teal-500/20 dark:border-teal-500/30 text-xs font-bold shadow-sm transition-colors",
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
              "px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer",
              isSelected
                ? "bg-primary text-on-primary shadow-sm shadow-teal-600/30 font-extrabold"
                : "text-on-surface-variant hover:text-on-surface dark:text-on-surface-variant dark:hover:text-white"
            )}
          >
            {m === 'front' ? 'Frontal 2D' : m === 'side' ? t('fnds.sagittalView') : 'Dual Split'}
          </motion.button>
        );
      })}
    </div>
  );
};

/* 46. FloatingHelpBeacon */
export interface FloatingHelpBeaconProps {
  className?: string;
  onClick?: () => void;
}

export const FloatingHelpBeacon: React.FC<FloatingHelpBeaconProps> = ({ className, onClick }) => {
  const { t } = useTranslation();
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 p-2.5 px-4 rounded-2xl bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/35 text-xs font-bold hover:bg-teal-500/25 transition-all shadow-sm cursor-pointer",
        className
      )}
    >
      <LifeBuoy className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" style={{ animationDuration: '10s' }} />
      <span>{t('fnds.guidedClinical')}</span>
      <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
    </motion.button>
  );
};

/* 47. ErgonomicHandModeSwitcher */
export interface ErgonomicHandModeSwitcherProps {
  hand?: 'right' | 'left';
  onChange?: (hand: 'right' | 'left') => void;
  className?: string;
}

export const ErgonomicHandModeSwitcher: React.FC<ErgonomicHandModeSwitcherProps> = ({
  hand = 'right',
  onChange,
  className,
}) => {
  const { t } = useTranslation();
  const [currentHand, setCurrentHand] = useState(hand);

  useEffect(() => {
    setCurrentHand(hand);
  }, [hand]);

  const toggleHand = () => {
    const next = currentHand === 'right' ? 'left' : 'right';
    setCurrentHand(next);
    onChange?.(next);
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={toggleHand}
      className={cn(
        "inline-flex items-center gap-2.5 p-2 px-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-teal-500/30 text-xs font-bold text-on-surface shadow-sm cursor-pointer transition-colors",
        className
      )}
      title={t('fnds.toggleHand')}
    >
      <Hand className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      <span>{t('fnds.handMode', { hand: currentHand === 'right' ? t('fnds.rightHanded') : t('fnds.leftHanded') })}</span>
    </motion.button>
  );
};

/* 48. CompactTelehealthBar */
export interface CompactTelehealthBarProps {
  therapistName?: string;
  status?: string;
  latencyMs?: number;
  onQuickCall?: () => void;
  onQuickMessage?: () => void;
  className?: string;
}

export const CompactTelehealthBar: React.FC<CompactTelehealthBarProps> = ({
  therapistName,
  status,
  latencyMs = 38,
  onQuickCall,
  onQuickMessage,
  className,
}) => {
  const { t } = useTranslation();
  const therapist = therapistName ?? t('fnds.therapistLive');
  return (
    <div
      className={cn(
        "p-3 px-4 rounded-2xl bg-white/90 dark:bg-slate-950/95 text-on-surface dark:text-white border border-teal-500/25 dark:border-teal-500/30 shadow-elevated flex items-center justify-between gap-4 text-xs backdrop-blur-2xl transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="size-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
        <div className="truncate">
          <p className="font-bold truncate text-on-surface">{therapist}</p>
          {status && <p className="text-2xs text-on-surface-variant truncate">{status}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-2xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-500/15 border border-teal-500/25 px-2 py-0.5 rounded-full">
          {latencyMs} ms
        </span>

        {onQuickCall && (
          <button
            type="button"
            onClick={onQuickCall}
            aria-label={t('fnds.callTherapist')}
            className="p-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            title={t('fnds.directCall')}
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
        )}

        {onQuickMessage && (
          <button
            type="button"
            onClick={onQuickMessage}
            aria-label={t('fnds.messageAssistant')}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-500/20 text-on-surface transition-all border border-slate-200 dark:border-white/10 active:scale-95 cursor-pointer"
            title={t('fnds.clinicalChat')}
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          </button>
        )}
      </div>
    </div>
  );
};

/* 49. ExerciseTimelineScrubber */
export interface ExerciseTimelineScrubberProps {
  totalSeconds?: number;
  currentSecond?: number;
  onSeek?: (seconds: number) => void;
  className?: string;
}

export const ExerciseTimelineScrubber: React.FC<ExerciseTimelineScrubberProps> = ({
  totalSeconds = 60,
  currentSecond = 24,
  onSeek,
  className,
}) => {
  const [sec, setSec] = useState(currentSecond);

  useEffect(() => {
    setSec(currentSecond);
  }, [currentSecond]);

  const formatMinSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div className={cn("space-y-1.5 w-full select-none", className)}>
      <div className="flex justify-between text-2xs font-mono font-bold text-on-surface-variant">
        <span className="text-teal-600 dark:text-teal-400">{formatMinSec(sec)}</span>
        <span>{formatMinSec(totalSeconds)} Total</span>
      </div>
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const newSec = Math.round(ratio * totalSeconds);
          setSec(newSec);
          onSeek?.(newSec);
        }}
        className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden cursor-pointer p-0.5 border border-slate-300/40 dark:border-white/5"
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
  fps?: number;
  gpuPercent?: number;
  latencyMs?: number;
  landmarksCount?: number;
  className?: string;
}

export const ContextualActionIsland: React.FC<ContextualActionIslandProps> = ({
  message,
  fps = 60,
  gpuPercent = 14,
  latencyMs = 18,
  landmarksCount = 33,
  className,
}) => {
  const { t } = useTranslation();
  const messageText = message ?? t('fnds.calibrationOptimal');
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "inline-flex flex-col rounded-3xl bg-white/95 dark:bg-slate-950/95 text-on-surface dark:text-white border border-teal-500/30 dark:border-teal-500/40 shadow-elevated text-xs font-semibold cursor-pointer select-none backdrop-blur-2xl transition-all",
        expanded ? "p-3 px-5 gap-2" : "p-2 px-4 flex-row items-center gap-2.5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-teal-500 animate-ping" />
        <span className="font-bold text-on-surface">{messageText}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 text-2xs font-mono text-on-surface-variant border-t border-slate-200 dark:border-white/10 pt-2"
          >
            <span>{t('fnds.latencyLabel', { n: latencyMs })}</span>
            <span>FPS: {fps}</span>
            <span>GPU: {gpuPercent}%</span>
            <span>Landmarks: {landmarksCount}/33</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
