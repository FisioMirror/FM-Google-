import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  Gauge,
  LineChart,
  AudioLines,
  Scan,
  Timer,
  Bot,
  UserCheck,
  Clock,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Zap,
} from 'lucide-react';

/* 11. PoseConfidenceLiveIndicator */
export interface PoseConfidenceLiveIndicatorProps {
  confidencePercent?: number; // e.g. 96
  visibleLandmarksCount?: number; // out of 33
  className?: string;
}

export const PoseConfidenceLiveIndicator: React.FC<PoseConfidenceLiveIndicatorProps> = ({
  confidencePercent = 96,
  visibleLandmarksCount = 33,
  className,
}) => {
  const [jitter, setJitter] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setJitter((Math.random() - 0.5) * 1.5);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const displayConfidence = Math.min(100, Math.max(90, Math.round((confidencePercent + jitter) * 10) / 10));

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/25 dark:border-teal-500/35 shadow-lg overflow-hidden flex items-center justify-between gap-3 group",
        className
      )}
    >
      <div className="absolute -top-10 -right-10 size-24 rounded-full bg-teal-500/10 blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition-colors" />

      <div className="flex items-center gap-3">
        <div className="relative p-2.5 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
          <ShieldCheck className="w-5 h-5" />
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            className="absolute inset-0 rounded-2xl border-2 border-teal-400 pointer-events-none"
          />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            Certidumbre MediaPipe AR
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {visibleLandmarksCount}/33 puntos anatómicos rastreados a 60 FPS
          </span>
        </div>
      </div>

      <div className="text-right">
        <motion.span
          key={displayConfidence}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 tabular-nums block"
        >
          {displayConfidence}%
        </motion.span>
        <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Lock Cinemático
        </span>
      </div>
    </motion.div>
  );
};

/* 12. AngularVelocityStreamGauge */
export interface AngularVelocityStreamGaugeProps {
  velocityDegSec?: number; // e.g. 54 deg/s
  maxSafeVelocity?: number;
  className?: string;
}

export const AngularVelocityStreamGauge: React.FC<AngularVelocityStreamGaugeProps> = ({
  velocityDegSec = 48,
  maxSafeVelocity = 90,
  className,
}) => {
  const [vel, setVel] = useState(velocityDegSec);
  const percent = Math.min(100, (vel / maxSafeVelocity) * 100);

  const simulateAcceleration = () => {
    setVel(72);
    setTimeout(() => setVel(35), 1000);
    setTimeout(() => setVel(velocityDegSec), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-cyan-500/25 dark:border-cyan-500/35 shadow-lg overflow-hidden space-y-2.5 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
            <Gauge className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              Velocidad Angular en Vivo
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Control motriz articular
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={simulateAcceleration}
          className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full hover:bg-cyan-500/25 transition-colors cursor-pointer"
        >
          {vel} °/s
        </button>
      </div>

      <div className="relative w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-black/5 dark:border-white/5">
        <motion.div
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-lime-300 rounded-full shadow-sm"
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 font-mono font-semibold">
        <span>0 °/s</span>
        <span className="text-teal-600 dark:text-teal-400">Zona de Control Óptimo</span>
        <span>{maxSafeVelocity} °/s</span>
      </div>
    </motion.div>
  );
};

/* 13. ROMDeviationLiveChart */
export interface ROMDeviationLiveChartProps {
  className?: string;
}

export const ROMDeviationLiveChart: React.FC<ROMDeviationLiveChartProps> = ({ className }) => {
  const [activeCurve, setActiveCurve] = useState<'both' | 'real' | 'ideal'>('both');

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/25 dark:border-teal-500/35 shadow-lg overflow-hidden space-y-2 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              Trayectoria Real vs. Ideal
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Osciloscopio ROM</span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
          Δ 2.4° (98% Match)
        </span>
      </div>

      <div className="h-16 w-full flex items-center justify-center p-2 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 relative overflow-hidden transition-colors">
        <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00A389" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#c1ff72" />
            </linearGradient>
          </defs>

          {/* Cuadrícula de referencia */}
          <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />

          {/* Curva ideal */}
          {(activeCurve === 'both' || activeCurve === 'ideal') && (
            <path
              d="M 0 35 Q 50 5, 100 20 T 200 10"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Curva real del paciente animada */}
          {(activeCurve === 'both' || activeCurve === 'real') && (
            <motion.path
              d="M 0 34 Q 48 7, 102 22 T 200 12"
              fill="none"
              stroke="url(#chartGrad)"
              strokeWidth="2.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            />
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-teal-400" /> Paciente Real
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-slate-400 inline-block border-b border-dashed" /> Plantilla Clínica
        </span>
      </div>
    </motion.div>
  );
};

/* 14. VoiceFeedbackWaveHUD */
export interface VoiceFeedbackWaveHUDProps {
  isSpeaking?: boolean;
  instructionText?: string;
  className?: string;
}

export const VoiceFeedbackWaveHUD: React.FC<VoiceFeedbackWaveHUDProps> = ({
  isSpeaking = true,
  instructionText = 'Excelente extensión articular. Sostén 2 segundos arriba.',
  className,
}) => {
  const [playing, setPlaying] = useState(isSpeaking);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/25 dark:border-teal-500/35 shadow-lg overflow-hidden flex items-center gap-3.5 group",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setPlaying(!playing)}
        className="p-3 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-600 dark:text-teal-400 border border-teal-500/30 shrink-0 transition-colors shadow-xs"
      >
        <Volume2 className={cn("w-5 h-5", playing && "animate-pulse")} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider">
            Biofeedback Auditivo Physi IA
          </span>
          {/* Ondas sonoras animadas */}
          <div className="flex items-center gap-0.5 h-3">
            {[8, 14, 20, 12, 16, 10].map((h, i) => (
              <motion.div
                key={i}
                animate={playing ? { height: [4, h, 4] } : { height: 4 }}
                transition={playing ? { repeat: Infinity, duration: 0.6 + i * 0.1 } : { duration: 0.2 }}
                className="w-1 rounded-full bg-teal-500"
              />
            ))}
          </div>
        </div>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
          &ldquo;{instructionText}&rdquo;
        </p>
      </div>
    </motion.div>
  );
};

/* 15. CameraFramingGuideHUD */
export interface CameraFramingGuideHUDProps {
  framingStatus?: 'ok' | 'too_close' | 'too_far' | 'tilt';
  className?: string;
}

export const CameraFramingGuideHUD: React.FC<CameraFramingGuideHUDProps> = ({
  framingStatus = 'ok',
  className,
}) => {
  const [status, setStatus] = useState(framingStatus);

  const cycleStatus = () => {
    const list: ('ok' | 'too_close' | 'too_far')[] = ['ok', 'too_close', 'too_far'];
    const next = list[(list.indexOf(status as any) + 1) % list.length];
    setStatus(next);
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-cyan-500/25 dark:border-cyan-500/35 shadow-lg overflow-hidden flex items-center justify-between gap-3 group cursor-pointer",
        className
      )}
      onClick={cycleStatus}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
          <Scan className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
            Encuadre Óptimo AR
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Distancia ideal: 2.1 metros
          </span>
        </div>
      </div>

      <span
        className={cn(
          "text-xs font-bold px-3 py-1 rounded-full border shadow-xs flex items-center gap-1.5",
          status === 'ok'
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
        )}
      >
        <span className={cn("size-1.5 rounded-full", status === 'ok' ? "bg-emerald-500" : "bg-amber-500 animate-ping")} />
        {status === 'ok' ? 'Cuerpo Completo OK' : 'Ajustar Posición'}
      </span>
    </motion.div>
  );
};

/* 16. RepCadenceMetronome */
export interface RepCadenceMetronomeProps {
  phase?: 'concentric' | 'isometric' | 'eccentric';
  durationSeconds?: number;
  className?: string;
}

export const RepCadenceMetronome: React.FC<RepCadenceMetronomeProps> = ({
  phase = 'concentric',
  durationSeconds = 2.0,
  className,
}) => {
  const [currentPhase, setCurrentPhase] = useState(phase);

  const getPhaseData = () => {
    switch (currentPhase) {
      case 'concentric':
        return { name: 'Fase Concéntrica (Subida)', time: 2, color: 'from-teal-500 to-cyan-400' };
      case 'isometric':
        return { name: 'Fase Isométrica (Pausa)', time: 1, color: 'from-amber-400 to-orange-400' };
      case 'eccentric':
        return { name: 'Fase Excéntrica (Bajada Controlada)', time: 3, color: 'from-emerald-400 to-teal-500' };
    }
  };

  const nextPhase = () => {
    if (currentPhase === 'concentric') setCurrentPhase('isometric');
    else if (currentPhase === 'isometric') setCurrentPhase('eccentric');
    else setCurrentPhase('concentric');
  };

  const data = getPhaseData();

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/25 dark:border-teal-500/35 shadow-lg overflow-hidden space-y-2.5 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              Metrónomo de Cadencia
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Ritmo 2-1-3</span>
          </div>
        </div>
        <button
          type="button"
          onClick={nextPhase}
          className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full hover:bg-teal-500/25 transition-colors"
        >
          {data.time}s • Cambiar
        </button>
      </div>

      <motion.div
        key={currentPhase}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={cn(
          "p-2.5 rounded-2xl bg-gradient-to-r text-white text-xs font-bold text-center shadow-md",
          data.color
        )}
      >
        {data.name}
      </motion.div>
    </motion.div>
  );
};

/* 17. AIBiomechanicalSummaryBadge */
export interface AIBiomechanicalSummaryBadgeProps {
  score?: number;
  summaryText?: string;
  className?: string;
}

export const AIBiomechanicalSummaryBadge: React.FC<AIBiomechanicalSummaryBadgeProps> = ({
  score = 94,
  summaryText = 'Excelente control lumbopélvico con 0 compensaciones escapulares durante las 3 series.',
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-teal-500/15 via-surface to-cyan-500/10 border border-teal-500/30 shadow-lg space-y-2 group overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
            <Bot className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-bold text-primary block">
              Evaluación Rápida Physi IA
            </span>
            <span className="text-[10px] text-slate-400">Análisis cinemático automático</span>
          </div>
        </div>
        <span className="text-xs font-mono font-black text-teal-600 dark:text-teal-400 bg-teal-500/15 border border-teal-500/30 px-3 py-1 rounded-full">
          {score}/100 Score
        </span>
      </div>
      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        {summaryText}
      </p>
    </motion.div>
  );
};

/* 18. SkeletonJointSelectorHUD */
export interface SkeletonJointSelectorHUDProps {
  selectedJoint?: string;
  onSelect?: (joint: string) => void;
  className?: string;
}

export const SkeletonJointSelectorHUD: React.FC<SkeletonJointSelectorHUDProps> = ({
  selectedJoint = 'Rodilla',
  onSelect,
  className,
}) => {
  const [active, setActive] = useState(selectedJoint);
  const joints = [
    { name: 'Hombro', rom: '165°' },
    { name: 'Codo', rom: '145°' },
    { name: 'Cadera', rom: '115°' },
    { name: 'Rodilla', rom: '135°' },
    { name: 'Tobillo', rom: '45°' },
  ];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/25 dark:border-teal-500/35 shadow-lg overflow-hidden space-y-2 group",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
        <UserCheck className="w-4 h-4 text-primary" />
        <span>Articulación Focal MediaPipe</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {joints.map((j) => {
          const isSelected = active === j.name;
          return (
            <motion.button
              key={j.name}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActive(j.name);
                onSelect?.(j.name);
              }}
              className={cn(
                "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                isSelected
                  ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30"
                  : "bg-surface/60 dark:bg-slate-800/60 border-outline-variant/30 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>{j.name}</span>
              <span className={cn("text-[9px] font-mono", isSelected ? "text-teal-200" : "text-slate-400")}>
                {j.rom}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

/* 19. HoldDurationTimerRing */
export interface HoldDurationTimerRingProps {
  secondsLeft?: number;
  totalSeconds?: number;
  className?: string;
}

export const HoldDurationTimerRing: React.FC<HoldDurationTimerRingProps> = ({
  secondsLeft = 5,
  totalSeconds = 10,
  className,
}) => {
  const [seconds, setSeconds] = useState(secondsLeft);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return totalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, totalSeconds]);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-amber-500/25 dark:border-amber-500/35 shadow-lg overflow-hidden flex items-center justify-between gap-3 group",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setRunning(!running)}
          className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-white block">
            Sostenimiento Isométrico
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {running ? 'Contando contracción fija...' : 'Toca para iniciar cuenta'}
          </span>
        </div>
      </div>
      <div className="text-2xl font-black font-mono text-amber-500 tabular-nums">
        00:0{seconds}s
      </div>
    </motion.div>
  );
};

/* 20. SessionQualityScoreTile */
export interface SessionQualityScoreTileProps {
  score?: number; // 0 - 100
  className?: string;
}

export const SessionQualityScoreTile: React.FC<SessionQualityScoreTileProps> = ({
  score = 92,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-3xl bg-gradient-to-br from-surface/95 via-surface-container/85 to-surface/95 dark:from-surface-container/80 dark:via-slate-900/90 dark:to-surface-container/80 backdrop-blur-2xl border border-teal-500/25 dark:border-teal-500/35 shadow-lg overflow-hidden flex items-center justify-between gap-3 group",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-white block">
            Índice de Calidad Biomecánica
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Simetría 94% • Cadencia 92% • Rango 90%
          </span>
        </div>
      </div>
      <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 tabular-nums">
        {score}%
      </div>
    </motion.div>
  );
};
