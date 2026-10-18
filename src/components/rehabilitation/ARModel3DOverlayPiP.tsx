import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Stethoscope,
  Maximize2,
  Minimize2,
  RotateCw,
  Play,
  Pause,
  Eye,
  EyeOff,
  Sparkles,
  Compass,
  Gauge,
  Activity,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react';
import { PhysioModel3D } from '../characters3d/PhysioModel3D';
import { KidModel3D } from '../characters3d/KidModel3D';
import { buildExerciseDefinition } from '../../data/exercisePresets';
import type { CharacterRole, JointRotationAxis, ExerciseDefinition } from '../../types/character.types';

export interface ARModel3DOverlayPiPProps {
  exerciseName: string;
  targetAngle?: number;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  defaultPerspective?: 'front' | 'diagonal' | 'side';
}

type PerspectiveAngle = 'front' | 'diagonal' | 'side';

export const ARModel3DOverlayPiP: React.FC<ARModel3DOverlayPiPProps> = ({
  exerciseName,
  targetAngle = 90,
  isOpen = true,
  onClose,
  className = '',
  defaultPerspective = 'diagonal',
}) => {
  // Estados de control de la ventana PiP
  const [isMinimized, setIsMinimized] = useState(false);
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [characterRole, setCharacterRole] = useState<CharacterRole>('physio');
  const [perspective, setPerspective] = useState<PerspectiveAngle>(defaultPerspective);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [phaseText, setPhaseText] = useState<'concentric' | 'hold' | 'eccentric' | 'neutral'>('neutral');
  const phaseLabel = { concentric: t('apip.phaseConcentric'), hold: t('apip.phaseHold'), eccentric: t('apip.phaseEccentric'), neutral: t('apip.phaseNeutral') }[phaseText];

  // Construir definición clínica real del ejercicio basada en el nombre
  const exerciseDef = useMemo<ExerciseDefinition>(() => {
    return buildExerciseDefinition(
      'ar-exercise-pip',
      exerciseName || t('apip.defaultExercise'),
      3,
      12,
      undefined,
      undefined,
      targetAngle
    );
  }, [exerciseName, targetAngle, t]);

  // Generar mapa de rotaciones y ejes articulares
  const jointAxes = useMemo<Partial<Record<string, JointRotationAxis>>>(() => {
    return exerciseDef.targetJoints.reduce((acc, j) => {
      acc[j.joint] = j.axis ?? 'x';
      return acc;
    }, {} as Partial<Record<string, JointRotationAxis>>);
  }, [exerciseDef.targetJoints]);

  // Animación del ciclo biomecánico (Concéntrico -> Hold -> Excéntrico -> Neutro)
  const animRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const directionRef = useRef(1);
  const holdCounterRef = useRef(0);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        // Si estamos en pausa isométrica (Hold en pico de rango)
        if (holdCounterRef.current > 0) {
          holdCounterRef.current -= dt * playbackSpeed;
          setPhaseText('hold');
        } else {
          const step = (dt * 0.45 * playbackSpeed) * directionRef.current;
          progressRef.current += step;

          if (progressRef.current >= 1) {
            progressRef.current = 1;
            directionRef.current = -1;
            holdCounterRef.current = 1.0; // 1 segundo de contracción isométrica
            setPhaseText('hold');
          } else if (progressRef.current <= 0) {
            progressRef.current = 0;
            directionRef.current = 1;
            holdCounterRef.current = 0.5; // Breve pausa antes de la siguiente rep
            setPhaseText('neutral');
          } else {
            setPhaseText(directionRef.current > 0 ? 'concentric' : 'eccentric');
          }
          setProgress(progressRef.current);
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Calcular ángulos articulares para el frame actual
  const currentJointAngles = useMemo<Record<string, number>>(() => {
    const angles: Record<string, number> = {};
    exerciseDef.targetJoints.forEach((j) => {
      const neutral = j.neutralAngle ?? 0;
      const target = j.targetAngle;
      // Interpolación senoidal suave
      const smoothProgress = (1 - Math.cos(progress * Math.PI)) / 2;
      angles[j.joint] = neutral + (target - neutral) * smoothProgress;
    });
    return angles;
  }, [exerciseDef.targetJoints, progress]);

  // Color de retroalimentación biomecánica
  const statusColor = useMemo(() => {
    if (progress >= 0.85) return '#10B981'; // Rango verde alcanzado
    if (progress >= 0.4) return '#0EA5E9'; // Fase intermedia azul
    return '#64748B'; // Posición base
  }, [progress]);

  // Ángulo primario de referencia mostrado al paciente
  const primaryJointAngle = useMemo(() => {
    const primary = exerciseDef.targetJoints[0];
    if (!primary) return Math.round(progress * targetAngle);
    const neutral = primary.neutralAngle ?? 0;
    const target = primary.targetAngle;
    const smoothProgress = (1 - Math.cos(progress * Math.PI)) / 2;
    return Math.round(neutral + (target - neutral) * smoothProgress);
  }, [exerciseDef.targetJoints, progress, targetAngle]);

  if (!isOpen) return null;

  // Vista Minimizada (Píldora flotante compacta)
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85 }}
        className={`pointer-events-auto z-40 ${className}`}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-xl border border-teal-500/40 text-white shadow-elevated hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          title={t('apip.restoreViewer')}
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="absolute w-4 h-4 rounded-full bg-teal-400/30 animate-ping" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide text-teal-300">{t('apip.guide3d')}</span>
              <span className="text-2xs text-white/60 font-mono">{primaryJointAngle}°</span>
            </div>
            <p className="text-2xs text-white/70 max-w-[120px] truncate">{exerciseName}</p>
          </div>
          <Maximize2 className="size-3.5 text-white/60 group-hover:text-white transition-colors ml-1" />
        </button>
      </motion.div>
    );
  }

  // Vista Completa / Ventana PiP
  const pipWidth = isExpanded ? 'w-[260px] xs:w-[300px] sm:w-80 md:w-96' : 'w-[165px] xs:w-[195px] sm:w-60 md:w-72';
  const pipHeight = isExpanded ? 'h-[310px] sm:h-[370px] md:h-[420px]' : 'h-[220px] xs:h-[245px] sm:h-[290px] md:h-[330px]';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={`pointer-events-auto z-40 flex flex-col ${pipWidth} ${pipHeight} rounded-2xl overflow-hidden bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-teal-500/35 shadow-elevated transition-all duration-300 select-none ${className}`}
    >
      {/* Encabezado del PiP */}
      <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-slate-950/70 border-b border-white/10 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="size-5 sm:size-6 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
            <Sparkles className="size-3 sm:size-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-2xs sm:text-2xs font-black uppercase tracking-wider text-teal-400">{t('apip.guide3d')}</span>
              <span className="text-2xs sm:text-2xs px-1 py-0.1 rounded-full bg-white/10 text-white/80 font-mono">
                {phaseLabel}
              </span>
            </div>
            <h4 className="text-xs sm:text-xs font-bold text-white truncate leading-tight" title={exerciseName}>
              {exerciseName}
            </h4>
          </div>
        </div>

        {/* Acciones de ventana */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isExpanded ? t('apip.compactSize') : t('apip.expandWindow')}
          >
            {isExpanded ? <Minimize2 className="size-3 sm:size-3.5" /> : <Maximize2 className="size-3 sm:size-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={t('apip.minimizeToPill')}
          >
            <ChevronDown className="size-3.5 sm:size-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/60 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              title={t('apip.hideModel3d')}
            >
              <X className="size-3.5 sm:size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Área del Modelo 3D Interactivo */}
      <div className="relative flex-1 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/80 overflow-hidden group">
        {/* Renderizado de Three.js (Avatar Fisioterapeuta o Paciente) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {characterRole === 'physio' ? (
            <PhysioModel3D
              jointAngles={currentJointAngles}
              jointAxes={jointAxes}
              statusColor={statusColor}
              autoAnimate={false}
              className="w-full h-full"
            />
          ) : (
            <KidModel3D
              jointAngles={currentJointAngles}
              jointAxes={jointAxes}
              statusColor={statusColor}
              autoAnimate={false}
              position={exerciseDef.position}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Overlay informativo HUD dentro del PiP */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5 sm:gap-1 pointer-events-none">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white">
            <Gauge className="size-2.5 sm:size-3 text-teal-400" />
            <span className="text-2xs sm:text-xs font-mono font-bold">{primaryJointAngle}°</span>
            <span className="text-2xs sm:text-2xs text-white/50">/{targetAngle}°</span>
          </div>
          <div className="px-1.5 py-0.5 rounded bg-teal-500/20 backdrop-blur-md text-2xs sm:text-2xs font-bold text-teal-300 w-fit">
            {Math.round(progress * 100)}% ROM
          </div>
        </div>

        {/* Indicador de arrastre táctil / 3D orbit */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-2xs px-1.5 py-0.5 rounded bg-black/70 text-white/70 backdrop-blur-sm border border-white/10 flex items-center gap-1">
            <Compass className="size-2 sm:size-2.5" /> 360°
          </span>
        </div>

        {/* Barra de progreso de fase biomecánica */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 transition-all duration-75"
            style={{ width: `${Math.max(5, progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Barra de Controles Rápidos y Perspectivas */}
      <div className="p-1.5 sm:p-2 bg-slate-950/90 border-t border-white/10 space-y-1 sm:space-y-1.5">
        {/* Controles de reproducción y velocidad */}
        <div className="flex items-center justify-between gap-1">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-2xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title={isPlaying ? t('apip.pauseDemo') : t('apip.resume')}
          >
            {isPlaying ? <Pause className="size-2.5 sm:size-3" /> : <Play className="size-2.5 sm:size-3" />}
            <span className="hidden xs:inline">{isPlaying ? t('apip.pauseShort') : 'Play'}</span>
          </button>

          {/* Selector de Velocidad */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0">
            {[0.5, 1.0].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded text-2xs sm:text-2xs font-bold transition-all cursor-pointer ${
                  playbackSpeed === speed
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {speed === 0.5 ? '0.5x' : '1x'}
              </button>
            ))}
          </div>

          {/* Selector de Avatar (Fisio vs Paciente) */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0">
            <button
              onClick={() => setCharacterRole('physio')}
              className={`p-1 rounded transition-all cursor-pointer ${
                characterRole === 'physio'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title={t('apip.avatarPhysio')}
            >
              <Stethoscope className="size-3" />
            </button>
            <button
              onClick={() => setCharacterRole('patient')}
              className={`p-1 rounded transition-all cursor-pointer ${
                characterRole === 'patient'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title={t('apip.avatarPatient')}
            >
              <User className="size-3" />
            </button>
          </div>
        </div>

        {/* Guía rápida de postura */}
        <div className="text-2xs text-white/60 flex items-center justify-between px-1">
          <span className="truncate">{t('apip.followMovement')}</span>
          <span className="text-teal-400 font-bold shrink-0">{t('apip.live')}</span>
        </div>
      </div>
    </motion.div>
  );
};
