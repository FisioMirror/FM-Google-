import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/toastApi';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { celebrateSession } from '../lib/confetti';
import { usePoseDetection, type TrafficLightState } from '../hooks/usePoseDetection';
import { useGamification } from '../hooks/useGamification';
import { isValidUUID, cn } from '../lib/utils';
import { speakHumanVoice, stopHumanVoice } from '../lib/humanVoice';
import { notifySessionCompleted, createNotification } from '../lib/notificationService';
import { updatePresenceStatus } from '../lib/presenceService';
import { isSpiritualModeEnabled, getVersiculoContextual, type Versiculo } from '../lib/versiculosService';
import { BookOpen } from 'lucide-react';

import { Modal } from '../components/ui/Modal';
import { PulsatingButton } from '../components/ui/PulsatingButton';
import { BiomechanicalAngleDial } from '../components/ui/BiomechanicalAngleDial';
import { BiomechanicalROMIndicator } from '../components/ui/BiomechanicalROMIndicator';
import { ClinicalCadenceAnalyzer } from '../components/ui/ClinicalCadenceAnalyzer';
import { CompensationAlertBanner } from '../components/ui/CompensationAlertBanner';
import { SessionQualityScoreTile } from '../components/ui/RealTimeMetricsSuite';

import { ARModel3DOverlayPiP } from '../components/rehabilitation/ARModel3DOverlayPiP';
import { getExercisePreset } from '../data/exercisePresets';
import { TypewriterText } from '../components/ui/TypewriterText';
import MascotAnimation from '../components/ui/MascotAnimation';

// Rep completion particle burst
function repParticleBurst() {
  const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = [];
  const colors = ['#22c55e', '#8ad3cf', '#2dd4bf', '#eab308'];
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    const speed = 2.5 + Math.random() * 3.5;
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= 0.025;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    frame++;
    if (alive && frame < 45) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  animate();
}

type SessionState = 'active' | 'paused' | 'rest' | 'finished';
type VoiceCategory = 'correction' | 'rep' | 'phase' | 'system';

export function ARMirrorPage() {
  const gamification = useGamification();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  const exerciseName = searchParams.get('ejercicio') || 'Sesión AR';
  const articulacion = searchParams.get('articulacion') || undefined;
  const lado = searchParams.get('lado') || undefined;
  const targetReps = Math.max(1, Number(searchParams.get('repeticiones') || searchParams.get('reps')) || 15);
  const totalSets = Math.max(1, Number(searchParams.get('series')) || 3);
  const restDuration = Math.max(5, Number(searchParams.get('descanso')) || 15);
  const urlTargetAngle = Number(searchParams.get('angulo')) || undefined;

  const preset = useMemo(
    () => getExercisePreset(exerciseName, articulacion, lado, urlTargetAngle),
    [exerciseName, articulacion, lado, urlTargetAngle]
  );
  const presetTargetAngle =
    urlTargetAngle && urlTargetAngle > 0
      ? urlTargetAngle
      : (preset.targetJoints[0]?.targetAngle ?? 90);
  const presetNeutralAngle = preset.targetJoints[0]?.neutralAngle ?? 0;

  const [state, setState] = useState<SessionState>('active');

  const {
    videoRef,
    canvasRef,
    poseData,
    isReady,
    error,
    repCount,
    resetReps,
    startCamera,
    cameraStarted,
    setTargetAngle,
    facingMode,
    toggleFacingMode,
    isSimulated,
    reconnectCamera,
  } = usePoseDetection({
    exerciseName,
    articulacion,
    lado,
    enabled: state === 'active',
    holdDurationSec: preset.holdDurationSec,
    neutralAngle: presetNeutralAngle,
  });
  const vRef = videoRef as React.RefObject<HTMLVideoElement>;
  const cRef = canvasRef as React.RefObject<HTMLCanvasElement>;

  const [isMirrored, setIsMirrored] = useState(true);
  const [timer, setTimer] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restCountdown, setRestCountdown] = useState(restDuration);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishVerse, setFinishVerse] = useState<Versiculo | null>(null);

  useEffect(() => {
    if (showFinishModal && isSpiritualModeEnabled()) {
      getVersiculoContextual('sanidad').then(setFinishVerse);
    }
  }, [showFinishModal]);

  const [qualityScore, setQualityScore] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compensation, setCompensation] = useState<string | null>(null);
  const [showPainReport, setShowPainReport] = useState(false);
  const [painBefore, setPainBefore] = useState(0);
  const [painAfter, setPainAfter] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState(3);
  const [painComment, setPainComment] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [calibrated, setCalibrated] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<'high' | 'low' | 'muted'>('high');
  const [hudMode, setHudMode] = useState<'full' | 'minimal' | 'camera'>('full');
  const [showModel3D, setShowModel3D] = useState<boolean>(true);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const aiFeedbackRef = useRef<string>('');

  const lastSpokenByCatRef = useRef<Record<VoiceCategory, number>>({
    correction: 0,
    rep: 0,
    phase: 0,
    system: 0,
  });
  const holdEnteredRef = useRef<boolean>(false);
  const peakAngleRef = useRef(0);
  const angleSumRef = useRef(0);
  const angleSamplesRef = useRef(0);
  const repQualitySumRef = useRef(0);
  const repQualityCountRef = useRef(0);
  const lastQualityRepRef = useRef(0);
  const lastQualityUpdateRef = useRef(0);
  const lostTrackingNotifiedRef = useRef(false);

  const speak = useCallback(
    (text: string, category: VoiceCategory = 'system') => {
      if (volumeLevel === 'muted' || !text) return;
      const now = Date.now();
      const cooldowns: Record<VoiceCategory, number> = {
        correction: 3400,
        rep: 1100,
        phase: 1600,
        system: 400,
      };
      if (now - lastSpokenByCatRef.current[category] < cooldowns[category]) return;
      lastSpokenByCatRef.current[category] = now;

      speakHumanVoice(text, {
        lang: i18n.language,
        rate: volumeLevel === 'low' ? 0.94 : 1.0,
        volume: volumeLevel === 'low' ? 0.5 : 1.0,
        pitch: 1.02,
        interrupt: category === 'system' || category === 'rep',
      });
    },
    [volumeLevel, i18n.language]
  );

  // Stop voice output when paused, muted, or navigating away
  useEffect(() => {
    if (state === 'paused' || volumeLevel === 'muted') {
      stopHumanVoice();
    }
  }, [state, volumeLevel]);

  useEffect(() => {
    return () => {
      stopHumanVoice();
    };
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'active') setTimer((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    setTargetAngle(presetTargetAngle);
  }, [presetTargetAngle, setTargetAngle]);

  // Verificación estricta: nunca iniciar AR sin calibración previa en esta sesión
  useEffect(() => {
    try {
      const isCalibrated = sessionStorage.getItem('fisiomirror-calibrated-session') === 'true';
      if (!isCalibrated) {
        const returnPath = window.location.pathname + window.location.search;
        navigate(`/calibration?next=${encodeURIComponent(returnPath)}`, { replace: true });
        return;
      }
      setCalibrated(true);
    } catch {
      setCalibrated(false);
    }
  }, [navigate]);

  // Medición de cadencia y tiempo por repetición (segundos / rep)
  const [lastRepDuration, setLastRepDuration] = useState<number>(2.4);
  const repStartTimeRef = useRef<number>(Date.now());
  const prevRepCountRef = useRef<number>(0);

  useEffect(() => {
    if (repCount > prevRepCountRef.current) {
      const now = Date.now();
      const dur = Math.max(0.6, (now - repStartTimeRef.current) / 1000);
      setLastRepDuration(dur);
      repStartTimeRef.current = now;
      prevRepCountRef.current = repCount;

      if (dur < 1.3) {
        speak(t('ar.voiceSlowDown'), 'rep');
      } else if (dur > 4.5) {
        speak(t('ar.voiceGoodPace'), 'rep');
      }
    } else if (repCount < prevRepCountRef.current) {
      prevRepCountRef.current = repCount;
      repStartTimeRef.current = Date.now();
    }
  }, [repCount, speak, t]);

  // Announce peak isometric hold entry cleanly once per hold phase
  useEffect(() => {
    if (!sessionStarted || state !== 'active' || !poseData?.isTracking) {
      holdEnteredRef.current = false;
      return;
    }
    if (poseData.repPhase === 'hold') {
      if (!holdEnteredRef.current && preset.holdDurationSec >= 2) {
        holdEnteredRef.current = true;
        speak(t('ar.voiceHoldPeak', { sec: preset.holdDurationSec }), 'phase');
      }
    } else {
      holdEnteredRef.current = false;
    }
  }, [poseData?.repPhase, poseData?.isTracking, sessionStarted, state, preset.holdDurationSec, speak, t]);

  // Start the camera automatically on mount so pose detection begins.
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Actualizar presencia: paciente realizando sesión de ejercicios
  useEffect(() => {
    updatePresenceStatus('en_ejercicio', window.location.pathname);
    return () => {
      updatePresenceStatus('online', '/');
    };
  }, []);

  // Mark session as started once the camera is live
  useEffect(() => {
    if (cameraStarted) {
      setSessionStarted(true);
      peakAngleRef.current = 0;
      angleSumRef.current = 0;
      angleSamplesRef.current = 0;
      repQualitySumRef.current = 0;
      repQualityCountRef.current = 0;
      lastQualityRepRef.current = 0;
      repStartTimeRef.current = Date.now();
    }
  }, [cameraStarted]);

  // Calidad real por repetición y feedback de voz según el rango logrado.
  useEffect(() => {
    if (repCount < lastQualityRepRef.current) {
      lastQualityRepRef.current = repCount;
      return;
    }
    if (repCount === lastQualityRepRef.current) return;
    lastQualityRepRef.current = repCount;

    const q = poseData?.lastRepQuality;
    if (q == null) return;
    repQualitySumRef.current += q;
    repQualityCountRef.current += 1;
    const base = poseData?.postureScore ?? 0;
    const avg = repQualitySumRef.current / repQualityCountRef.current;
    setQualityScore(Math.round(base * 0.45 + avg * 0.55));

    if (sessionStarted && state === 'active' && !isSimulated) {
      if (q < 55) speak(t('ar.voiceWidenRange'), 'rep');
      else if (q < 72) speak(t('ar.voiceControlSpeed'), 'rep');
      else if (q >= 92) speak(t('ar.voiceGreatRep'), 'rep');
    }
  }, [repCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Aviso único si el paciente sale del encuadre.
  useEffect(() => {
    if (!sessionStarted || state !== 'active' || !poseData) return;
    if (!poseData.isTracking) {
      if (!lostTrackingNotifiedRef.current) {
        lostTrackingNotifiedRef.current = true;
        speak(t('ar.voiceNotVisible'), 'correction');
      }
    } else {
      lostTrackingNotifiedRef.current = false;
    }
  }, [poseData?.isTracking, sessionStarted, state, speak, t]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (poseData?.isTracking && poseData.landmarks) {
      const now = Date.now();
      if (now - lastQualityUpdateRef.current > 350) {
        lastQualityUpdateRef.current = now;
        const base = poseData.postureScore;
        const avg =
          repQualityCountRef.current > 0
            ? repQualitySumRef.current / repQualityCountRef.current
            : null;
        const blended = avg != null ? Math.round(base * 0.45 + avg * 0.55) : base;
        setQualityScore((prev) => (Math.abs(prev - blended) >= 1 ? blended : prev));
      }

      // Compensation detection & localized voice feedback
      let detectedCompensation: string | null = null;
      if (poseData.compensationCode === 'shoulder_tilt') {
        detectedCompensation = t('ar.voiceLevelShoulders');
        if (state === 'active') speak(t('ar.voiceLevelShoulders'), 'correction');
      } else if (poseData.compensationCode === 'hip_tilt') {
        detectedCompensation = t('ar.voiceBalanceHips');
        if (state === 'active') speak(t('ar.voiceBalanceHips'), 'correction');
      } else if (poseData.compensationCode === 'lateral_lean') {
        detectedCompensation = t('ar.voiceKeepTrunkUpright');
        if (state === 'active') speak(t('ar.voiceKeepTrunkUpright'), 'correction');
      } else if (poseData.compensationIssue) {
        detectedCompensation = poseData.compensationIssue;
      }

      setCompensation(detectedCompensation);

      const nextFeedback = detectedCompensation
        ? detectedCompensation
        : poseData.trafficLight === 'green'
        ? t('ar.voiceFeedbackGood')
        : poseData.trafficLight === 'yellow'
        ? t('ar.voiceFeedbackMedium')
        : t('ar.voiceFeedbackAdjust');

      aiFeedbackRef.current = nextFeedback;
      setAiFeedback((prev) => (prev === nextFeedback ? prev : nextFeedback));
    }
  }, [poseData, state, speak, t]);

  // Rep completion -> rest or finish
  useEffect(() => {
    if (state !== 'active') return;
    if (repCount >= targetReps) {
      if (currentSet < totalSets) {
        setState('rest');
        setRestCountdown(restDuration);
        toast.success(t('ar.setCompleted', { set: currentSet }));
        repParticleBurst();
        speak(t('ar.voiceSetDone', { set: currentSet }), 'system');
      } else {
        setState('finished');
        setShowPainReport(true);
        celebrateSession();
        repParticleBurst();
        speak(t('ar.voiceSessionDone'), 'system');
      }
    }
  }, [repCount, targetReps, totalSets, restDuration, state, currentSet, speak, toast, t]);

  // Rest countdown
  useEffect(() => {
    if (state === 'rest' && restCountdown > 0) {
      const timerId = setTimeout(() => setRestCountdown(restCountdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
    if (state === 'rest' && restCountdown === 0) {
      setCurrentSet((s) => s + 1);
      setState('active');
      resetReps();
      speak(t('ar.voiceNextSet'), 'system');
    }
  }, [state, restCountdown, resetReps, speak, t]);

  const completedRepsTotal = Math.min(
    targetReps * totalSets,
    (currentSet - 1) * targetReps + repCount
  );

  const saveSession = async (reportData?: {
    dolor_antes: number;
    dolor_despues: number;
    fatiga: number;
    comentario: string;
  }) => {
    if (!user?.id) return;
    try {
      const completedReps = completedRepsTotal;
      sessionStorage.setItem(
        'ar_session_backup',
        JSON.stringify({
          exerciseName,
          timer,
          repCount: completedReps,
          qualityScore,
          currentSet,
        })
      );

      const ejerciciosData = [
        {
          nombre: exerciseName,
          series: currentSet,
          repeticiones: completedReps,
          duracion_segundos: timer,
          calidad_promedio: qualityScore,
        },
      ];

      const targetTotal = targetReps * totalSets;
      const adherencia =
        targetTotal > 0 ? Math.min(100, Math.round((completedReps / targetTotal) * 100)) : 0;

      const metricas = {
        max_angle: Math.round(peakAngleRef.current),
        avg_angle:
          angleSamplesRef.current > 0
            ? Math.round(angleSumRef.current / angleSamplesRef.current)
            : null,
        samples: angleSamplesRef.current,
      };

      const isRealUser = isValidUUID(user.id);

      if (isRealUser) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('sesiones_completadas')
          .insert({
            paciente_id: user.id,
            ejercicio_nombre: exerciseName,
            duracion_segundos: timer,
            repeticiones: completedReps,
            calidad_ejecucion: qualityScore,
            calidad_promedio: qualityScore,
            ejercicios: ejerciciosData,
            adherencia,
            notas: aiFeedbackRef.current,
            metricas,
            compensaciones_detectadas: compensation ? { tipo: compensation } : null,
            dolor_reportado: reportData?.dolor_despues ?? null,
          })
          .select('id')
          .single();

        if (sessionError) throw sessionError;

        if (reportData && sessionData?.id) {
          const { error: reportError } = await supabase.from('post_session_reports').insert({
            paciente_id: user.id,
            sesion_id: sessionData.id,
            dolor_antes: reportData.dolor_antes,
            dolor_despues: reportData.dolor_despues,
            fatiga_nivel: reportData.fatiga,
            comentario: reportData.comentario || null,
          });
          if (reportError) console.error('Error saving pain report:', reportError.message);
        }

        try {
          const { data: link } = await supabase
            .from('pacientes_terapeutas')
            .select('terapeuta_id')
            .eq('paciente_id', user.id)
            .maybeSingle();

          if (link?.terapeuta_id) {
            notifySessionCompleted({
              therapistId: link.terapeuta_id,
              patientId: user.id,
              patientName: user.full_name || 'Paciente',
              exerciseTitle: exerciseName,
              precision: qualityScore,
              durationSeconds: timer,
            });
          }

          if (qualityScore >= 70) {
            createNotification({
              userId: user.id,
              type: 'logro',
              title: t('ar.sessionComplete'),
              message: `${Math.round(qualityScore)}% · "${exerciseName}" (${completedReps} ${t('ar.repsLabel')})`,
              link: '/stats',
            });
          }
        } catch {
          // Ignorar fallo de notificación
        }
      } else {
        try {
          const demoSessionRecord = {
            id: `demo-session-${Date.now()}`,
            paciente_id: user.id,
            fecha: new Date().toISOString(),
            ejercicio_nombre: exerciseName,
            duracion_segundos: timer,
            repeticiones: completedReps,
            calidad_ejecucion: qualityScore,
            calidad_promedio: qualityScore,
            ejercicios: ejerciciosData,
            adherencia,
            notas: aiFeedbackRef.current,
            metricas,
            compensaciones_detectadas: compensation ? { tipo: compensation } : null,
            dolor_reportado: reportData?.dolor_despues ?? null,
          };
          const existingDemoRaw = localStorage.getItem('fisiomirror_demo_sessions');
          const existingDemo = existingDemoRaw ? JSON.parse(existingDemoRaw) : [];
          existingDemo.unshift(demoSessionRecord);
          localStorage.setItem('fisiomirror_demo_sessions', JSON.stringify(existingDemo));
        } catch {
          // Ignorar fallo de almacenamiento local
        }
      }

      const earnedXp = currentSet * 15 + 50 + (qualityScore >= 80 ? 25 : 0);
      gamification.addPoints(earnedXp);
      gamification.recordSession({ quality: qualityScore, exerciseName });
      toast.success(`+${earnedXp} XP`);
      sessionStorage.removeItem('ar_session_backup');
      setShowPainReport(false);
      setShowFinishModal(true);
    } catch (e) {
      console.error('Error saving session:', (e as Error).message);
      toast.error((e as Error).message);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const currentAngle = poseData?.primaryAngle ?? 0;

  // ROM real: pico y promedio de ángulo medido por el sensor durante la sesión.
  useEffect(() => {
    if (!sessionStarted || state !== 'active' || !poseData?.isTracking) return;
    const a = poseData.primaryAngle || 0;
    if (!Number.isFinite(a) || a <= 0) return;
    peakAngleRef.current = Math.max(peakAngleRef.current, a);
    angleSumRef.current += a;
    angleSamplesRef.current += 1;
  }, [poseData, sessionStarted, state]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Ignore fullscreen denial in embedded iframe
    }
  };

  const handleRestart = () => {
    setState('active');
    resetReps();
    setCurrentSet(1);
    setTimer(0);
    peakAngleRef.current = 0;
    angleSumRef.current = 0;
    angleSamplesRef.current = 0;
    repQualitySumRef.current = 0;
    repQualityCountRef.current = 0;
    lastQualityRepRef.current = 0;
  };

  const effectiveTrafficLight: TrafficLightState = poseData?.isTracking
    ? poseData.trafficLight
    : 'red';

  const trafficMeta =
    effectiveTrafficLight === 'green'
      ? {
          label: t('ar.trafficGreen'),
          border: 'border-emerald-400/60',
          badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
        }
      : effectiveTrafficLight === 'yellow'
      ? {
          label: t('ar.trafficYellow'),
          border: 'border-amber-400/60',
          badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
        }
      : {
          label: t('ar.trafficRed'),
          border: 'border-rose-500/60',
          badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-500/50',
        };

  const sideBadgeLabel =
    lado?.toLowerCase() === 'izquierdo'
      ? t('ar.leftSide')
      : lado?.toLowerCase() === 'derecho'
      ? t('ar.rightSide')
      : lado?.toLowerCase() === 'bilateral'
      ? t('ar.bilateralSide')
      : null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#001514] flex flex-col overflow-hidden">
      {/* Particle canvas for rep completion bursts */}
      <canvas
        id="particle-canvas"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 25 }}
      />

      {/* Video as real background + canvas overlay on top */}
      <video
        ref={vRef}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-transform duration-200',
          isMirrored && '-scale-x-100'
        )}
        style={{ zIndex: 1, filter: 'brightness(0.75) contrast(1.15)' }}
        muted
        playsInline
        autoPlay
      />
      <canvas
        ref={cRef}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-transform duration-200',
          isMirrored && '-scale-x-100'
        )}
        style={{ zIndex: 2 }}
      />

      {/* Barra Superior Flotante Unificada de Micro-Métricas */}
      {sessionStarted && !error && (
        <header className="fixed top-2 sm:top-3.5 left-2 right-2 sm:left-4 sm:right-4 z-[35] flex items-center justify-between gap-1.5 sm:gap-3 pointer-events-none select-none">
          {/* Lado Izquierdo: Salir + Estado AR + Semáforo Visual Postural (3 luces reales) */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
            <button
              onClick={() => navigate('/dashboard-paciente')}
              title={t('ar.backToPanel')}
              aria-label={t('ar.backToPatientPanel')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/90 hover:bg-slate-900 text-white flex items-center justify-center border border-teal-500/35 backdrop-blur-2xl transition-all shadow-xl hover:border-teal-400 active:scale-95"
            >
              <Icon name="arrow_back" size={19} />
            </button>

            <div
              className={cn(
                'rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-2 bg-slate-950/90 backdrop-blur-2xl border shadow-xl transition-colors duration-300',
                trafficMeta.border
              )}
              title={`${t('ar.trafficLightTitle')}: ${trafficMeta.label}`}
            >
              {/* 3-bulb Semáforo Visual indicator */}
              <div className="flex items-center gap-1" aria-label={t('ar.trafficLightTitle')}>
                <span
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    effectiveTrafficLight === 'red'
                      ? 'bg-red-500 scale-115 shadow-[0_0_8px_rgba(239,68,68,0.95)]'
                      : 'bg-red-500/20'
                  )}
                />
                <span
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    effectiveTrafficLight === 'yellow'
                      ? 'bg-amber-400 scale-115 shadow-[0_0_8px_rgba(234,179,8,0.95)]'
                      : 'bg-amber-400/20'
                  )}
                />
                <span
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    effectiveTrafficLight === 'green'
                      ? 'bg-emerald-400 scale-115 shadow-[0_0_8px_rgba(34,197,94,0.95)]'
                      : 'bg-emerald-400/20'
                  )}
                />
              </div>

              <span className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
                {poseData?.isTracking ? trafficMeta.label : t('ar.searching')}
              </span>
              <span className="text-white text-[10px] font-bold uppercase tracking-wider hidden xs:inline sm:hidden">
                {poseData?.isTracking ? t('ar.arActive') : t('ar.searching')}
              </span>
            </div>
          </div>

          {/* Centro: Cápsula de Micro-Métricas Unificadas */}
          <div className="pointer-events-auto min-w-0 max-w-full">
            <div className="rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 bg-slate-950/95 backdrop-blur-2xl border border-teal-500/40 shadow-2xl text-white">
              {/* Nombre de Ejercicio + Lado */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0 hidden sm:inline-block shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[180px] tracking-tight">
                  {exerciseName}
                </span>
                {sideBadgeLabel && (
                  <span className="hidden lg:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-teal-200">
                    {sideBadgeLabel}
                  </span>
                )}
              </div>

              <div className="w-px h-4 bg-teal-500/25 shrink-0" />

              {/* Repeticiones */}
              <div className="flex items-baseline gap-0.5 shrink-0">
                <span className="text-teal-300 font-black text-xs sm:text-base md:text-lg leading-none tabular-nums drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
                  {repCount}
                </span>
                <span className="text-white/50 text-[10px] sm:text-xs tabular-nums">/{targetReps}</span>
              </div>

              <div className="w-px h-4 bg-teal-500/25 shrink-0" />

              {/* Serie Actual */}
              <span className="text-white/90 font-bold text-[11px] sm:text-xs shrink-0 tracking-wide tabular-nums">
                S{currentSet}/{totalSets}
              </span>

              <div className="w-px h-4 bg-teal-500/25 shrink-0" />

              {/* Ángulo Biomecánico en Tiempo Real (con borde semáforo) */}
              <div
                className={cn(
                  'font-mono text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg flex items-center shrink-0 border tabular-nums transition-colors duration-300',
                  effectiveTrafficLight === 'green'
                    ? 'text-emerald-200 bg-emerald-500/25 border-emerald-400/55'
                    : effectiveTrafficLight === 'yellow'
                    ? 'text-amber-200 bg-amber-500/25 border-amber-400/55'
                    : 'text-rose-200 bg-rose-500/25 border-rose-500/55'
                )}
                title={`${t('ar.angleLabel')}: ${currentAngle}° (${t('ar.targetShort')} ${presetTargetAngle}°)`}
              >
                <span>{currentAngle}°</span>
              </div>

              <div className="w-px h-4 bg-teal-500/25 shrink-0 hidden xs:block" />

              {/* Cronómetro de Sesión */}
              <span className="font-mono text-xs text-white/90 font-semibold shrink-0 hidden xs:inline tabular-nums">
                {formatTime(timer)}
              </span>
            </div>
          </div>

          {/* Lado Derecho: Controles Rápidos de Cámara y Modo HUD */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
            <button
              onClick={toggleFacingMode}
              title={facingMode === 'user' ? t('ar.rearCamera') : t('ar.frontCamera')}
              aria-label={t('ar.toggleCamera')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/90 hover:bg-slate-900 text-white flex items-center justify-center border border-teal-500/35 backdrop-blur-2xl transition-all shadow-xl hover:border-teal-400 active:scale-95"
            >
              <Icon name="flip_camera_ios" size={18} />
            </button>
            <button
              onClick={() => setIsMirrored((prev) => !prev)}
              title={t('ar.mirrorMode')}
              aria-label={t('ar.mirrorMode')}
              className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/90 hover:bg-slate-900 flex items-center justify-center border backdrop-blur-2xl transition-all shadow-xl active:scale-95',
                isMirrored
                  ? 'text-teal-300 border-teal-400/60 shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                  : 'text-white/60 border-white/20'
              )}
            >
              <Icon name="sync_alt" size={18} />
            </button>
            <button
              onClick={() => setHudMode((prev) => (prev === 'full' ? 'minimal' : 'full'))}
              title={hudMode === 'minimal' ? t('ar.essentialMode') : t('ar.fullMode')}
              aria-label={hudMode === 'minimal' ? t('ar.fullMode') : t('ar.essentialMode')}
              className={cn(
                'px-2.5 sm:px-3 h-8 sm:h-10 rounded-full flex items-center gap-1.5 border backdrop-blur-2xl transition-all shadow-xl active:scale-95 text-[10px] sm:text-xs font-bold uppercase tracking-wider',
                hudMode === 'minimal'
                  ? 'bg-amber-500/25 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-950/90 text-white/90 border-teal-500/35 hover:text-white hover:border-teal-400'
              )}
            >
              <Icon name={hudMode === 'minimal' ? 'auto_awesome' : 'visibility'} size={17} />
              <span className="hidden sm:inline">
                {hudMode === 'minimal' ? t('ar.essentialMode') : t('ar.fullMode')}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Badge discreto si el modo simulación biomecánica está activo */}
      {isSimulated && isReady && (
        <div className="fixed top-12 sm:top-14 left-1/2 -translate-x-1/2 z-[34] flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-xl text-amber-200 text-[10px] sm:text-xs font-semibold shadow-lg">
          <Icon name="sensors" size={13} className="text-amber-400 shrink-0" />
          <span>{t('ar.simMode')}</span>
          <button
            onClick={reconnectCamera}
            className="ml-1 px-1.5 py-0.5 rounded bg-amber-400/30 hover:bg-amber-400/50 text-white font-bold uppercase tracking-wider text-[9px] transition-colors cursor-pointer"
          >
            {t('ar.reconnectBtn')}
          </button>
        </div>
      )}

      {/* Camera loading / scanning state */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <MascotAnimation type="scanning" size="md" />
          <p className="text-white/60 text-sm">{t('ar.initializing')}</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center z-40 bg-slate-950/90 backdrop-blur-md">
          <MascotAnimation type="error" size="md" />
          <p className="text-white/80 text-center max-w-sm">{error}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={reconnectCamera}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold transition-all text-sm cursor-pointer shadow-lg shadow-teal-500/25 active:scale-95"
            >
              {t('ar.retryCamera')}
            </button>
            <button
              onClick={() => navigate('/dashboard-paciente')}
              className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-semibold text-sm cursor-pointer"
            >
              {t('ar.backBtn')}
            </button>
          </div>
        </div>
      )}

      {/* Pre-session instruction overlay (before camera activation) */}
      {!sessionStarted && !error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <MascotAnimation type="greeting" size="md" />
          <TypewriterText
            text={t('ar.preSessionPrompt')}
            className="text-white text-lg md:text-xl font-medium max-w-md"
          />
          {!calibrated && (
            <div className="mt-2 max-w-md rounded-2xl bg-amber-500/15 border border-amber-400/40 px-4 py-3 text-amber-200 text-sm flex items-center gap-2">
              <Icon name="warning" filled size={18} />
              <span>{t('ar.noCalibWarning')}</span>
            </div>
          )}
        </div>
      )}

      {/* Rest overlay */}
      <AnimatePresence>
        {state === 'rest' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-30"
          >
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-white text-4xl font-bold mb-4"
            >
              {t('ar.restTitle')}
            </motion.h2>
            <motion.span
              key={restCountdown}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-black text-white tabular-nums"
            >
              {restCountdown}
            </motion.span>
            <p className="text-white/60 mt-4">{t('ar.setCompleted', { set: currentSet })}</p>
            <button
              onClick={() => setRestCountdown(0)}
              className="mt-8 px-6 py-3 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 active:scale-95 transition-all"
            >
              {t('ar.skipRestBtn')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Model Picture-in-Picture Exercise Demonstrator */}
      <AnimatePresence>
        {showModel3D && state !== 'finished' && (
          <div className="absolute top-14 sm:top-16 md:top-20 right-2 sm:right-4 md:right-6 z-30 pointer-events-auto">
            <ARModel3DOverlayPiP
              exerciseName={exerciseName}
              articulacion={articulacion}
              targetAngle={presetTargetAngle}
              isOpen={showModel3D}
              onClose={() => setShowModel3D(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* HUD — Espacio central despejado en móvil; widgets adaptativos en escritorio y tablet */}
      <div className="relative z-20 flex flex-col h-full pt-14 sm:pt-16 pb-3 sm:pb-5 px-3 sm:px-6 md:px-8 pointer-events-none transition-opacity duration-300">
        <div className="flex-1 flex items-center justify-between transition-all duration-300">
          {hudMode === 'full' ? (
            <>
              {/* Lado Izquierdo: Series, Repeticiones y Cadencia Clínica */}
              <div className="flex flex-col gap-3 pointer-events-auto">
                {/* En móvil: Tarjeta compacta de micro-métricas */}
                <div className="md:hidden rounded-2xl p-3 bg-slate-950/90 backdrop-blur-2xl border border-teal-500/40 text-white shadow-2xl flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">
                      {t('ar.setsLabel')}
                    </span>
                    <span className="text-xl font-black text-white tabular-nums">
                      {currentSet}{' '}
                      <span className="text-xs text-white/50 font-normal">/ {totalSets}</span>
                    </span>
                  </div>
                  <div className="w-px h-7 bg-teal-500/30" />
                  <div>
                    <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">
                      {t('ar.repsLabel')}
                    </span>
                    <span className="text-2xl font-black text-teal-300 tabular-nums">
                      {repCount}{' '}
                      <span className="text-xs text-white/50 font-normal">/ {targetReps}</span>
                    </span>
                  </div>
                </div>

                {/* En Tablet y Escritorio: Paneles grandes HUD clínico */}
                <div className="hidden md:flex flex-col gap-3">
                  {/* Tarjeta de Series */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl p-5 w-48 lg:w-56 text-center bg-slate-950/90 backdrop-blur-2xl border border-teal-500/35 text-white shadow-2xl"
                  >
                    <p className="text-teal-300/80 text-xs font-bold uppercase tracking-[0.2em] mb-1.5">
                      {t('ar.setsLabel')}
                    </p>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-white text-4xl lg:text-5xl font-black tabular-nums">
                        {currentSet}
                      </span>
                      <span className="text-white/40 text-xl font-medium tabular-nums">
                        / {totalSets}
                      </span>
                    </div>
                  </motion.div>

                  {/* Tarjeta de Repeticiones */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl p-5 w-48 lg:w-56 text-center bg-slate-950/90 backdrop-blur-2xl border border-teal-500/40 text-white shadow-2xl"
                  >
                    <p className="text-teal-300/80 text-xs font-bold uppercase tracking-[0.2em] mb-1.5">
                      {t('ar.repetitionsLabel')}
                    </p>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <motion.span
                        key={repCount}
                        initial={{ scale: 1.25 }}
                        animate={{ scale: 1 }}
                        className="text-5xl lg:text-7xl font-black tabular-nums text-teal-300 drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]"
                      >
                        {repCount}
                      </motion.span>
                      <span className="text-white/40 text-2xl font-bold tabular-nums">
                        / {targetReps}
                      </span>
                    </div>
                  </motion.div>

                  {/* Analizador de Cadencia Clínica */}
                  <div className="w-48 lg:w-56">
                    <ClinicalCadenceAnalyzer
                      lastRepDurationSeconds={lastRepDuration}
                      isMoving={poseData?.isTracking}
                      repPhase={poseData?.repPhase}
                      trafficLight={effectiveTrafficLight}
                    />
                  </div>
                </div>
              </div>

              {/* Lado Derecho: Medidor Circular + Indicador Vertical ROM Semáforo */}
              <div className="flex items-center gap-3 sm:gap-5 pointer-events-auto">
                <div className="hidden md:block">
                  {!showModel3D && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <BiomechanicalAngleDial
                        currentAngle={currentAngle}
                        targetAngle={presetTargetAngle}
                        romPercent={poseData?.romPercent}
                        trafficLight={effectiveTrafficLight}
                        repPhase={poseData?.repPhase}
                        size={180}
                      />
                    </motion.div>
                  )}
                </div>

                <BiomechanicalROMIndicator
                  currentAngle={currentAngle}
                  targetAngle={presetTargetAngle}
                  romPercent={poseData?.romPercent}
                  trafficLight={effectiveTrafficLight}
                  repPhase={poseData?.repPhase}
                  holdRemainingMs={poseData?.holdRemainingMs}
                />
              </div>
            </>
          ) : (
            <div className="w-full" />
          )}
        </div>

        {/* Zona Inferior: Alertas, Feedback por Voz y Dock Ergonómico */}
        <div className="space-y-2 pointer-events-auto flex flex-col items-center w-full max-w-2xl mx-auto">
          {compensation && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full px-2"
            >
              <CompensationAlertBanner
                deviationJoint={exerciseName}
                detectedIssue={compensation}
                severity="moderate"
                onDismiss={() => setCompensation(null)}
              />
            </motion.div>
          )}

          {/* Banner de Feedback Clínico + Semáforo */}
          {hudMode === 'full' && !compensation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full px-2 max-w-xl"
            >
              <div
                className={cn(
                  'w-full px-4 py-2.5 rounded-2xl bg-slate-950/92 backdrop-blur-2xl border text-white shadow-2xl flex items-center gap-3 transition-colors duration-300',
                  trafficMeta.border
                )}
              >
                <div className="flex items-center gap-1 shrink-0">
                  {[0.2, 0.6, 0.9, 0.4, 0.7].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scaleY: poseData?.isTracking ? [0.3, 1.3, 0.3] : 0.3,
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.1,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                      }}
                      className={cn(
                        'w-1 h-4 rounded-full origin-center',
                        effectiveTrafficLight === 'green'
                          ? 'bg-emerald-400'
                          : effectiveTrafficLight === 'yellow'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      )}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                      {t('ar.aiClinicalAssistant')}
                    </span>
                    <span
                      className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider',
                        trafficMeta.badgeBg
                      )}
                    >
                      {trafficMeta.label}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white font-medium truncate sm:whitespace-normal drop-shadow-sm">
                    “{aiFeedback || t('ar.defaultFeedback')}”
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dock de Controles Inferior Unificado */}
          <div className="bg-slate-950/95 backdrop-blur-2xl border border-teal-500/40 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-full overflow-x-auto">
            {state === 'active' && (
              <>
                <button
                  onClick={() => setState('paused')}
                  className="rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs sm:text-sm min-h-[44px]"
                  aria-label={t('ar.pauseExercise')}
                >
                  <Icon name="pause" size={19} />
                  <span>{t('ar.pauseBtn')}</span>
                </button>

                <button
                  onClick={() => {
                    setState('finished');
                    setShowPainReport(true);
                  }}
                  className="rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs sm:text-sm min-h-[44px] shadow-lg shadow-rose-600/30"
                  aria-label={t('ar.finishExercise')}
                >
                  <Icon name="stop" size={19} />
                  <span>{t('ar.finishBtn')}</span>
                </button>

                <div className="w-px h-6 bg-teal-500/30 my-auto shrink-0" />

                <button
                  onClick={() => setShowModel3D((prev) => !prev)}
                  aria-label={showModel3D ? t('ar.guide3dOn') : t('ar.guide3d')}
                  className={cn(
                    'rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[44px]',
                    showModel3D
                      ? 'bg-teal-500/30 text-teal-300 border border-teal-400/60 shadow-lg shadow-teal-500/25 font-bold'
                      : 'bg-white/10 text-white/80 hover:text-white'
                  )}
                  title={showModel3D ? t('ar.guide3dOn') : t('ar.guide3d')}
                >
                  <Icon name="view_in_ar" size={19} />
                  <span className="text-xs font-bold hidden sm:inline">
                    {showModel3D ? t('ar.guide3dOn') : t('ar.guide3d')}
                  </span>
                </button>

                <button
                  onClick={() => setHudMode((prev) => (prev === 'full' ? 'minimal' : 'full'))}
                  aria-label={hudMode === 'minimal' ? t('ar.fullMode') : t('ar.essentialMode')}
                  className={cn(
                    'rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[44px]',
                    hudMode === 'minimal'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-400/60 shadow-lg shadow-amber-500/25 font-bold'
                      : 'bg-white/10 text-white/80 hover:text-white'
                  )}
                  title={hudMode === 'minimal' ? t('ar.essentialMode') : t('ar.fullMode')}
                >
                  <Icon name={hudMode === 'minimal' ? 'auto_awesome' : 'dashboard'} size={19} />
                  <span className="text-xs font-bold hidden sm:inline">
                    {hudMode === 'minimal' ? t('ar.essentialMode') : t('ar.fullMode')}
                  </span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                  className="rounded-xl p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer hidden xs:flex items-center justify-center min-h-[40px] sm:min-h-[44px] min-w-[40px]"
                >
                  <Icon name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'} size={18} />
                </button>

                <button
                  onClick={() => {
                    const states: Array<'high' | 'low' | 'muted'> = ['high', 'low', 'muted'];
                    const idx = states.indexOf(volumeLevel);
                    setVolumeLevel(states[(idx + 1) % 3]);
                  }}
                  className="rounded-xl p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center min-h-[40px] sm:min-h-[44px] min-w-[40px]"
                  aria-label={t('ar.changeVolume')}
                  title={t('ar.changeVolume')}
                >
                  <Icon
                    name={
                      volumeLevel === 'muted'
                        ? 'volume_off'
                        : volumeLevel === 'low'
                        ? 'volume_down'
                        : 'volume_up'
                    }
                    size={18}
                  />
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  aria-label={t('ar.openSettings')}
                  className="rounded-xl p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center min-h-[40px] sm:min-h-[44px] min-w-[40px]"
                >
                  <Icon name="settings" size={18} />
                </button>
              </>
            )}

            {state === 'paused' && (
              <>
                <PulsatingButton
                  variant="pulse"
                  pulseColor="rgba(45, 212, 191, 0.6)"
                  onClick={() => setState('active')}
                  className="bg-teal-600 hover:bg-teal-500 rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 text-white flex items-center gap-2 cursor-pointer font-bold text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                >
                  <Icon name="play_arrow" size={18} /> {t('ar.resumeBtn')}
                </PulsatingButton>
                <button
                  onClick={handleRestart}
                  className="rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                >
                  <Icon name="refresh" size={18} />
                  {t('tr.reiniciar')}
                </button>
                <button
                  onClick={() => {
                    setState('finished');
                    setShowPainReport(true);
                  }}
                  className="rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500/80 hover:bg-red-500 text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                >
                  <Icon name="stop" size={18} /> {t('ar.abandonBtn')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings modal */}
      <Modal open={showSettings} onOpenChange={setShowSettings}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[360px] bg-slate-900/95 border border-white/20 text-white shadow-2xl backdrop-blur-2xl">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-teal-500/20 text-teal-300">
                  <Icon name="settings" size={20} />
                </Modal.Icon>
                <Modal.Heading className="text-white">{t('ar.mirrorConfig')}</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="space-y-3">
                <button
                  type="button"
                  onClick={() => setVolumeLevel(volumeLevel === 'muted' ? 'high' : 'muted')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">{t('ar.guideAudio')}</span>
                  <Icon
                    name={volumeLevel !== 'muted' ? 'toggle_on' : 'toggle_off'}
                    size={28}
                    className={volumeLevel !== 'muted' ? 'text-teal-300' : 'text-white/40'}
                  />
                </button>
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">
                    {facingMode === 'user' ? t('ar.frontCamera') : t('ar.rearCamera')}
                  </span>
                  <Icon name="flip_camera_ios" size={20} className="text-[#8ad3cf]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMirrored((prev) => !prev)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">{t('ar.mirroredMode')}</span>
                  <Icon
                    name={isMirrored ? 'toggle_on' : 'toggle_off'}
                    size={28}
                    className={isMirrored ? 'text-teal-300' : 'text-white/40'}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setShowModel3D((prev) => !prev)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">{t('ar.liveDemo3d')}</span>
                  <Icon
                    name={showModel3D ? 'toggle_on' : 'toggle_off'}
                    size={28}
                    className={showModel3D ? 'text-teal-300' : 'text-white/40'}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRestart();
                    setShowSettings(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">{t('ar.restartSession')}</span>
                  <Icon name="refresh" size={20} className="text-teal-300" />
                </button>
              </Modal.Body>
              <Modal.Footer>
                <button
                  type="button"
                  slot="close"
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-500/25 hover:bg-teal-500/35 text-teal-200 font-bold border border-teal-500/40 transition-colors"
                >
                  {t('ar.doneBtn')}
                </button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Pain report modal */}
      <AnimatePresence>
        {showPainReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-modal glass-panel rounded-3xl p-6 md:p-8 max-w-md w-full"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <h2 className="text-white text-2xl font-bold mb-2">{t('ar.postSessionReport')}</h2>
              <p className="text-white/60 text-sm mb-4">{t('ar.postSessionDesc')}</p>

              <SessionQualityScoreTile
                score={Math.round(qualityScore)}
                className="bg-slate-900/80 border-white/15 text-white mb-5"
              />

              <div className="space-y-5">
                <div>
                  <label className="text-white/80 text-sm font-bold">{t('ar.painBefore')}</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={painBefore}
                    onChange={(e) => setPainBefore(Number(e.target.value))}
                    className="w-full mt-2 accent-[#8ad3cf]"
                  />
                  <div className="flex justify-between text-white/40 text-xs mt-1 tabular-nums">
                    <span>0</span>
                    <span className="text-white font-bold text-base">{painBefore}</span>
                    <span>10</span>
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-bold">{t('ar.painAfter')}</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={painAfter}
                    onChange={(e) => setPainAfter(Number(e.target.value))}
                    className="w-full mt-2 accent-[#8ad3cf]"
                  />
                  <div className="flex justify-between text-white/40 text-xs mt-1 tabular-nums">
                    <span>0</span>
                    <span className="text-white font-bold text-base">{painAfter}</span>
                    <span>10</span>
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-bold">{t('ar.fatigueLevel')}</label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFatigueLevel(n)}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                          fatigueLevel === n
                            ? 'bg-[#8ad3cf] text-[#001514]'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-bold">
                    {t('ar.optionalComment')}
                  </label>
                  <textarea
                    value={painComment}
                    onChange={(e) => setPainComment(e.target.value)}
                    placeholder={t('ar.notesPlaceholder')}
                    className="w-full mt-2 p-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-[#8ad3cf] outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() =>
                    saveSession({
                      dolor_antes: painBefore,
                      dolor_despues: painAfter,
                      fatiga: fatigueLevel,
                      comentario: painComment,
                    })
                  }
                  className="premium-btn flex-1 py-4 bg-[#8ad3cf] text-[#001514] rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {t('ar.sendReport')}
                </button>
                <button
                  onClick={() => {
                    setShowPainReport(false);
                    saveSession();
                  }}
                  className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
                >
                  {t('ar.skipBtn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish modal */}
      <AnimatePresence>
        {showFinishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-modal glass-panel rounded-3xl p-8 md:p-10 max-w-md text-center mx-4"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 lg:w-[120px] lg:h-[120px] flex items-center justify-center mx-auto mb-4"
              >
                <MascotAnimation type="success" size="md" className="w-full h-full" />
              </motion.div>
              <h2 className="text-white text-3xl font-bold mb-2">{t('ar.sessionComplete')}</h2>
              <p className="text-white/60 mb-6">
                {t('ar.summaryText', { sets: currentSet, reps: completedRepsTotal })}
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-white/40 text-xs">{t('ar.timeLabel')}</p>
                  <p className="text-white text-xl font-bold tabular-nums">{formatTime(timer)}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">{t('ar.repetitionsLabel')}</p>
                  <p className="text-white text-xl font-bold tabular-nums">{completedRepsTotal}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">{t('tr.calidad')}</p>
                  <p className="text-white text-xl font-bold tabular-nums">{qualityScore}%</p>
                </div>
              </div>

              {isSpiritualModeEnabled() && finishVerse && (
                <div className="mb-6 p-4 rounded-2xl bg-white/10 border border-white/15 text-left">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-300">
                    <BookOpen className="size-3.5" />
                    <span>{t('ar.wordOfHealing')}</span>
                  </div>
                  <p className="text-xs text-white/95 italic font-medium leading-relaxed">
                    «{finishVerse.texto}»
                  </p>
                  <p className="text-[10px] font-bold text-teal-300 text-right mt-1.5 font-mono">
                    — {finishVerse.cita}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/stats')}
                  className="premium-btn flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {t('ar.viewProgress')}
                </button>
                <button
                  onClick={() => navigate('/dashboard-paciente')}
                  className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
                >
                  {t('ar.homeBtn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
