import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Flame,
  Medal,
  PartyPopper,
  Compass,
  Trophy,
  Coins,
  Shield,
  ThumbsUp,
  Award,
  Lock,
  Sparkles,
  Check,
  Star,
  Gift,
  Share2,
} from 'lucide-react';

/* 31. StreakFlameCounter */
export interface StreakFlameCounterProps {
  streakDays?: number;
  className?: string;
}

export const StreakFlameCounter: React.FC<StreakFlameCounterProps> = ({
  streakDays = 7,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-amber-500/20 via-surface/90 to-orange-500/10 dark:from-amber-500/20 dark:via-slate-900/90 dark:to-orange-500/10 border border-amber-500/40 shadow-elevated overflow-hidden flex items-center gap-4 group",
        className
      )}
    >
      <div className="absolute -top-12 -right-12 size-36 rounded-full bg-amber-500/15 blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />

      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 text-amber-500 border border-amber-500/40 shadow-card flex items-center justify-center shrink-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Flame className="w-8 h-8 fill-amber-500" />
        </motion.div>
        <span className="absolute -bottom-1.5 text-2xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm">
          Racha
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black font-mono text-on-surface tabular-nums">
            {streakDays}
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Días Consecutivos
          </span>
        </div>
        <p className="text-xs text-on-surface-variant font-medium">
          ¡Constancia clínica ejemplar! Multiplicador de XP <strong className="text-amber-500">x1.5 activo</strong>.
        </p>
      </div>
    </motion.div>
  );
};

/* 32. LevelProgressRibbon */
export interface LevelProgressRibbonProps {
  currentLevel?: number;
  currentXp?: number;
  nextLevelXp?: number;
  className?: string;
}

export const LevelProgressRibbon: React.FC<LevelProgressRibbonProps> = ({
  currentLevel = 5,
  currentXp = 480,
  nextLevelXp = 600,
  className,
}) => {
  const [xp, setXp] = useState(currentXp);
  const percent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  const addBonusXP = () => {
    setXp((prev) => Math.min(nextLevelXp, prev + 30));
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/25 dark:border-teal-500/35 shadow-card overflow-hidden space-y-3 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <Medal className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface dark:text-white block">
              Nivel Terapéutico
            </span>
            <span className="text-2xs text-on-surface-variant">Rango de rehabilitación</span>
          </div>
        </div>
        <button
          type="button"
          onClick={addBonusXP}
          className="text-xs font-black px-3 py-1 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 hover:bg-teal-500/25 transition-colors cursor-pointer"
        >
          Nivel {currentLevel} • +XP
        </button>
      </div>

      <div className="relative w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-black/5 dark:border-white/5">
        <motion.div
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-lime-300 rounded-full shadow-sm"
        />
      </div>

      <div className="flex justify-between text-xs text-on-surface-variant font-mono font-semibold">
        <span>{xp} XP</span>
        <span className="text-teal-600 dark:text-teal-400">{percent}% completado</span>
        <span>{nextLevelXp} XP</span>
      </div>
    </motion.div>
  );
};

/* 33. MilestoneCelebrationModal */
export interface MilestoneCelebrationModalProps {
  milestoneTitle?: string;
  className?: string;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  milestoneTitle = '¡Meta de 135° de Flexión Superada!',
  className,
}) => {
  const [celebrated, setCelebrated] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-surface/90 to-teal-500/10 dark:from-emerald-500/20 dark:via-slate-900/90 dark:to-teal-500/10 border border-emerald-500/40 shadow-elevated text-center space-y-2.5 overflow-hidden group",
        className
      )}
    >
      <div className="relative size-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center shadow-card">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <PartyPopper className="w-7 h-7" />
        </motion.div>
      </div>

      <div>
        <h4 className="text-sm font-black text-on-surface">{milestoneTitle}</h4>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto mt-0.5">
          Tu fisioterapeuta ha sido notificado del avance clínico en el portal.
        </p>
      </div>

      <div className="pt-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => setCelebrated(!celebrated)}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{celebrated ? '¡XP Reclamada!' : 'Reclamar +250 XP'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

/* 34. MobilityQuestCard */
export interface MobilityQuestCardProps {
  questTitle?: string;
  progressText?: string;
  xpReward?: number;
  className?: string;
}

export const MobilityQuestCard: React.FC<MobilityQuestCardProps> = ({
  questTitle = 'Misión Diaria: 3 series con cadencia perfecta',
  progressText = '2 / 3 Completadas',
  xpReward = 120,
  className,
}) => {
  const [completed, setCompleted] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/25 dark:border-teal-500/35 shadow-card overflow-hidden flex items-center justify-between gap-3 group",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => setCompleted(!completed)}
          className={cn(
            "p-2.5 rounded-2xl border transition-all shrink-0",
            completed
              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30"
              : "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30"
          )}
        >
          {completed ? <Check className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
        </motion.button>
        <div>
          <h4 className={cn("text-xs font-bold text-on-surface dark:text-white", completed && "line-through text-on-surface-variant")}>
            {questTitle}
          </h4>
          <span className="text-xs text-on-surface-variant font-mono">
            {completed ? '3 / 3 Completada' : progressText}
          </span>
        </div>
      </div>
      <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
        +{xpReward} XP
      </span>
    </motion.div>
  );
};

/* 35. VirtualTrophyCabinet */
export interface VirtualTrophyCabinetProps {
  trophiesCount?: number;
  className?: string;
}

export const VirtualTrophyCabinet: React.FC<VirtualTrophyCabinetProps> = ({
  trophiesCount = 6,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-surface/90 to-surface dark:from-amber-500/15 dark:via-slate-900/90 dark:to-surface-container/80 border border-amber-500/35 shadow-card overflow-hidden flex items-center justify-between group",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
          <Trophy className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-on-surface dark:text-white">Vitrina de Trofeos Clínicos</h4>
          <span className="text-xs text-on-surface-variant font-medium">
            {trophiesCount} medallas biomecánicas desbloqueadas
          </span>
        </div>
      </div>
      <button
        type="button"
        className="text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20"
      >
        Explorar (6/12)
      </button>
    </motion.div>
  );
};

/* 36. DailyHealthPointsWidget */
export interface DailyHealthPointsWidgetProps {
  points?: number;
  className?: string;
}

export const DailyHealthPointsWidget: React.FC<DailyHealthPointsWidgetProps> = ({
  points = 840,
  className,
}) => {
  const [pts, setPts] = useState(points);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-surface/90 to-surface dark:from-amber-500/15 dark:via-slate-900/90 dark:to-surface-container/80 border border-amber-500/35 shadow-card overflow-hidden flex items-center justify-between group",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 shrink-0"
        >
          <Coins className="w-6 h-6" />
        </motion.div>
        <div>
          <h4 className="text-xs font-bold text-on-surface dark:text-white">Puntos de Salud</h4>
          <span className="text-xs text-on-surface-variant">Canjeables por consultas prioritarias</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPts((p) => p + 50)}
        className="text-2xl font-black font-mono text-amber-500 hover:scale-105 transition-transform"
      >
        {pts} pts
      </button>
    </motion.div>
  );
};

/* 37. RehabHeroAvatarCard */
export interface RehabHeroAvatarCardProps {
  patientName?: string;
  rankTitle?: string;
  className?: string;
}

export const RehabHeroAvatarCard: React.FC<RehabHeroAvatarCardProps> = ({
  patientName = 'Carlos Rivera',
  rankTitle = 'Guerrero de la Movilidad',
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-3xl bg-gradient-to-br from-teal-500/15 via-surface/90 to-surface dark:from-teal-500/15 dark:via-slate-900/90 dark:to-surface-container/80 border border-teal-500/30 shadow-card overflow-hidden flex items-center gap-3.5 group",
        className
      )}
    >
      <div className="relative size-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-teal-500/30 shrink-0">
        CR
        <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
      </div>
      <div>
        <h4 className="text-sm font-black text-on-surface">{patientName}</h4>
        <span className="text-xs text-primary font-bold">{rankTitle}</span>
        <span className="text-2xs text-on-surface-variant block">Nivel 5 • 86% Adherencia</span>
      </div>
    </motion.div>
  );
};

/* 38. CheerReactionButton */
export interface CheerReactionButtonProps {
  className?: string;
}

export const CheerReactionButton: React.FC<CheerReactionButtonProps> = ({ className }) => {
  const [likes, setLikes] = useState(24);
  const [hearts, setHearts] = useState<number[]>([]);

  const handleCheer = () => {
    setLikes((l) => l + 1);
    setHearts((prev) => [...prev, Date.now()]);
    setTimeout(() => {
      setHearts((prev) => prev.slice(1));
    }, 1000);
  };

  return (
    <div className="relative inline-block">
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleCheer}
        className={cn(
          "inline-flex items-center gap-2 p-2.5 px-4 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 border border-teal-500/35 text-xs font-bold transition-all shadow-md select-none",
          className
        )}
      >
        <ThumbsUp className="w-4 h-4" />
        <span>¡Ánimo! ({likes})</span>
      </motion.button>

      {/* Partículas de ánimo flotantes */}
      {hearts.map((id) => (
        <motion.span
          key={id}
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -30, scale: 1.4 }}
          transition={{ duration: 0.8 }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none text-base"
        >
          <ThumbsUp className="w-4 h-4 text-teal-500" aria-hidden="true" />
        </motion.span>
      ))}
    </div>
  );
};

/* 39. RecoveryRankBadge */
export interface RecoveryRankBadgeProps {
  rank?: string;
  className?: string;
}

export const RecoveryRankBadge: React.FC<RecoveryRankBadgeProps> = ({
  rank = 'Rango: Constante',
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "inline-flex items-center gap-2 p-2.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 border border-teal-500/40 text-xs font-bold text-teal-900 dark:text-teal-100 shadow-md",
        className
      )}
    >
      <Award className="w-4 h-4 text-teal-500" />
      <span>{rank}</span>
      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
    </motion.div>
  );
};

/* 40. UnlockableExerciseLocker */
export interface UnlockableExerciseLockerProps {
  exerciseTitle?: string;
  requirement?: string;
  className?: string;
}

export const UnlockableExerciseLocker: React.FC<UnlockableExerciseLockerProps> = ({
  exerciseTitle = 'Salto Pliométrico Controlado',
  requirement = 'Requiere 130° ROM + 0 dolor en EVA',
  className,
}) => {
  const [jiggling, setJiggling] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => {
        setJiggling(true);
        setTimeout(() => setJiggling(false), 500);
      }}
      className={cn(
        "relative p-5 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-between cursor-pointer group",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={jiggling ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="p-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-on-surface-variant"
        >
          <Lock className="w-5 h-5" />
        </motion.div>
        <div>
          <h4 className="text-xs font-bold text-on-surface">{exerciseTitle}</h4>
          <span className="text-2xs text-on-surface-variant">{requirement}</span>
        </div>
      </div>
      <span className="text-2xs uppercase font-bold text-on-surface-variant bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full">
        85% Bloqueado
      </span>
    </motion.div>
  );
};
