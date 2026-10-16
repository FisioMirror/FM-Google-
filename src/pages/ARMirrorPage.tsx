import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/ToastProvider';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { celebrateSession } from '../lib/confetti';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { isValidUUID, cn } from '../lib/utils';
import { speakHumanVoice } from '../lib/humanVoice';
import { notifySessionCompleted, createNotification } from '../lib/notificationService';
import { updatePresenceStatus } from '../lib/presenceService';
import { isSpiritualModeEnabled, getVersiculoContextual, type Versiculo } from '../lib/versiculosService';
import { BookOpen } from 'lucide-react';
import { Popover } from '../components/ui/Popover';
import { Modal } from '../components/ui/Modal';
import { PulsatingButton } from '../components/ui/PulsatingButton';
import { BiomechanicalAngleGauge } from '../components/ui/BiomechanicalAngleGauge';
import { RepetitionCounterSpring } from '../components/ui/RepetitionCounterSpring';
import { RehabEnergyBar } from '../components/ui/RehabEnergyBar';
import { CompensationAlertBanner } from '../components/ui/CompensationAlertBanner';
import {
  PoseConfidenceLiveIndicator,
  VoiceFeedbackWaveHUD,
  RepCadenceMetronome,
  SessionQualityScoreTile,
} from '../components/ui/RealTimeMetricsSuite';
import { AudioMuteFloatingPill } from '../components/ui/FloatingControlsSuite';
import { ARModel3DOverlayPiP } from '../components/rehabilitation/ARModel3DOverlayPiP';

// Rep completion particle burst
function repParticleBurst() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = (canvas as HTMLCanvasElement).getContext('2d');
  if (!ctx) return;
  const c = canvas as HTMLCanvasElement;
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const particles: Array<{x:number;y:number;vx:number;vy:number;life:number;color:string}> = [];
  const colors = ['#22c55e', '#06B6D4', '#0D9488', '#eab308'];
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24;
    const speed = 3 + Math.random() * 4;
    particles.push({
      x: c.width / 2,
      y: c.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.02;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    frame++;
    if (alive && frame < 80) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, c.width, c.height);
  };
  animate();
}
import { AnimatedCountdown } from '../components/ui/AnimatedCountdown';
import { TypewriterText } from '../components/ui/TypewriterText';
import MascotAnimation from '../components/ui/MascotAnimation';

type SessionState = 'active' | 'paused' | 'rest' | 'finished';

const TARGET_REPS = 15;
const TOTAL_SETS = 3;
const REST_DURATION = 15;

export function ARMirrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  const exerciseName = searchParams.get('ejercicio') || 'Sesión AR';

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
  } = usePoseDetection();
  const vRef = videoRef as React.RefObject<HTMLVideoElement>;
  const cRef = canvasRef as React.RefObject<HTMLCanvasElement>;

  const [state, setState] = useState<SessionState>('active');
  const [isMirrored, setIsMirrored] = useState(true);
  const [timer, setTimer] = useState(0);
  const [bpm] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restCountdown, setRestCountdown] = useState(REST_DURATION);
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
  const [hudVisible, setHudVisible] = useState(true);
  const [hudMode, setHudMode] = useState<'full' | 'minimal' | 'camera'>('full');
  const [showModel3D, setShowModel3D] = useState<boolean>(true);
  const aiFeedbackRef = useRef<string>('Buen ritmo. Mantén la postura erguida y completa el rango de movimiento.');
  const lastSpokenRef = useRef<number>(0);

  const speak = (text: string) => {
    if (volumeLevel === 'muted') return;
    const now = Date.now();
    if (now - lastSpokenRef.current < 2500) return;
    lastSpokenRef.current = now;
    
    speakHumanVoice(text, {
      rate: volumeLevel === 'low' ? 0.94 : 1.0,
      volume: volumeLevel === 'low' ? 0.5 : 1.0,
      pitch: 1.02,
      interrupt: true,
    });
  };

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'active') setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // Set default target angle for exoskeleton color coding
  useEffect(() => {
    setTargetAngle(90); // Default 90° target; could be fetched from exercise config
  }, []);

  // Read calibration state from localStorage (set by CalibrationPage).
  useEffect(() => {
    try {
      setCalibrated(localStorage.getItem('calibrationCompleted') === 'true');
    } catch {
      setCalibrated(false);
    }
  }, []);

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
    if (cameraStarted) setSessionStarted(true);
  }, [cameraStarted]);

  // Quality score from pose data + compensation detection
  useEffect(() => {
    if (poseData?.isTracking && poseData.landmarks) {
      setQualityScore(poseData.postureScore);

      // Compensation detection: check hip and torso alignment
      const leftHip = poseData.landmarks[23];
      const rightHip = poseData.landmarks[24];
      const leftShoulder = poseData.landmarks[11];
      const rightShoulder = poseData.landmarks[12];

      let detectedCompensation: string | null = null;

      if (leftHip && rightHip && leftShoulder && rightShoulder) {
        const hipTilt = Math.abs(leftHip.y - rightHip.y);
        const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
        const torsoLean = Math.abs(((leftShoulder.x + rightShoulder.x) / 2) - ((leftHip.x + rightHip.x) / 2));

        if (hipTilt > 0.08) {
          detectedCompensation = 'Compensación detectada: cadera desalineada. Nivela las caderas.';
          speak('Nivela las caderas');
        } else if (shoulderTilt > 0.08) {
          detectedCompensation = 'Compensación detectada: hombros desalineados. Mantén los hombros nivelados.';
          speak('Mantén los hombros nivelados');
        } else if (torsoLean > 0.15) {
          detectedCompensation = 'Compensación detectada: torso inclinado. Mantén el torso erguido.';
          speak('Mantén el torso erguido');
        }
      }

      setCompensation(detectedCompensation);

      if (!detectedCompensation) {
        if (poseData.postureScore > 80) {
          aiFeedbackRef.current = 'Excelente postura. Mantén la alineación corporal.';
        } else if (poseData.postureScore > 50) {
          aiFeedbackRef.current = 'Buen esfuerzo. Intenta extender más los brazos para mejor detección.';
        } else {
          aiFeedbackRef.current = 'No detecto tu cuerpo claramente. Asegúrate de estar a 2 metros de la cámara.';
        }
      } else {
        aiFeedbackRef.current = detectedCompensation;
      }
    }
  }, [poseData, volumeLevel]);

  // Rep completion → rest or finish
  useEffect(() => {
    if (state !== 'active') return;
    if (repCount >= TARGET_REPS) {
      if (currentSet < TOTAL_SETS) {
        setState('rest');
        setRestCountdown(REST_DURATION);
        toast.success(`Serie ${currentSet} completada!`);
        repParticleBurst();
        speak('Serie completada. Descansa.');
      } else {
        setState('finished');
        setShowPainReport(true);
        celebrateSession();
        repParticleBurst();
        speak('Sesión completada. Excelente trabajo.');
      }
    }
  }, [repCount, state, currentSet, volumeLevel]);

  // Rest countdown
  useEffect(() => {
    if (state === 'rest' && restCountdown > 0) {
      const t = setTimeout(() => setRestCountdown(restCountdown - 1), 1000);
      return () => clearTimeout(t);
    }
    if (state === 'rest' && restCountdown === 0) {
      setCurrentSet((s) => s + 1);
      setState('active');
      resetReps();
      toast.info('Serie reanudada');
      speak('Comienza la siguiente serie.');
    }
  }, [state, restCountdown, resetReps]);

  const saveSession = async (reportData?: { dolor_antes: number; dolor_despues: number; fatiga: number; comentario: string }) => {
    if (!user?.id) return;
    try {
      sessionStorage.setItem('ar_session_backup', JSON.stringify({
        exerciseName, timer, repCount, qualityScore, currentSet,
      }));

      const ejerciciosData = [{
        nombre: exerciseName,
        series: currentSet,
        repeticiones: repCount,
        duracion_segundos: timer,
        calidad_promedio: qualityScore,
      }];

      // Calculate adherence: completed reps vs target reps (TARGET_REPS * TOTAL_SETS)
      const targetTotal = TARGET_REPS * TOTAL_SETS;
      const adherencia = targetTotal > 0 ? Math.min(100, Math.round((repCount * currentSet / targetTotal) * 100)) : 0;

      const isRealUser = isValidUUID(user.id);

      if (isRealUser) {
        const { data: sessionData, error: sessionError } = await supabase.from('sesiones_completadas').insert({
          paciente_id: user.id,
          ejercicio_nombre: exerciseName,
          duracion_segundos: timer,
          repeticiones: repCount,
          calidad_ejecucion: qualityScore,
          calidad_promedio: qualityScore,
          ejercicios: ejerciciosData,
          adherencia: adherencia,
          notas: aiFeedbackRef.current,
          compensaciones_detectadas: compensation ? { tipo: compensation } : null,
          dolor_reportado: reportData?.dolor_despues ?? null,
        }).select('id').single();

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

        // Notificar en tiempo real al terapeuta asignado
        try {
          const { data: link } = await supabase
            .from('pacientes_terapeutas')
            .select('terapeuta_id')
            .eq('paciente_id', user.id)
            .maybeSingle();

          if (link?.terapeuta_id) {
            notifySessionCompleted({
              therapistId: link.terapeuta_id,
              patientName: user.full_name || 'Paciente',
              exerciseTitle: exerciseName,
              precision: qualityScore,
              durationSeconds: timer,
            });
          }

          // Notificación de logro y reconocimiento al paciente
          if (qualityScore >= 70) {
            createNotification({
              userId: user.id,
              type: 'logro',
              title: '¡Sesión de rehabilitación completada!',
              message: `Lograste ${Math.round(qualityScore)}% de precisión en "${exerciseName}" con ${repCount} repeticiones completadas.`,
              link: '/stats',
            });
          }
        } catch {
          // Ignorar fallo de notificación
        }
      } else {
        // Modo demostración: guardar la sesión localmente sin error de UUID
        try {
          const demoSessionRecord = {
            id: `demo-session-${Date.now()}`,
            paciente_id: user.id,
            fecha: new Date().toISOString(),
            ejercicio_nombre: exerciseName,
            duracion_segundos: timer,
            repeticiones: repCount,
            calidad_ejecucion: qualityScore,
            calidad_promedio: qualityScore,
            ejercicios: ejerciciosData,
            adherencia: adherencia,
            notas: aiFeedbackRef.current,
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

      toast.success('Sesión guardada correctamente');
      sessionStorage.removeItem('ar_session_backup');
      setShowPainReport(false);
      setShowFinishModal(true);
    } catch (e) {
      console.error('Error saving session:', (e as Error).message);
      toast.error('Error al guardar la sesión: ' + (e as Error).message);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const currentAngle = poseData ? Math.max(poseData.leftElbowAngle, poseData.rightElbowAngle) : 0;

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
      toast.error('No se pudo cambiar a pantalla completa');
    }
  };

  const handleRestart = () => {
    setState('active');
    resetReps();
    setCurrentSet(1);
    setTimer(0);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#001514] flex flex-col overflow-hidden">
      {/* Particle canvas for rep completion bursts */}
      <canvas id="particle-canvas" className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }} />

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

      {/* Barra Superior Flotante Unificada de Micro-Métricas (Mobile First & Desktop) */}
      {sessionStarted && !error && (
        <header className="fixed top-2 sm:top-3 left-2 right-2 sm:left-4 sm:right-4 z-[35] flex items-center justify-between gap-1.5 sm:gap-3 pointer-events-none select-none">
          {/* Lado Izquierdo: Salir y Estado de Detección */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
            <button
              onClick={() => navigate('/dashboard-paciente')}
              title="Volver al panel"
              aria-label="Volver al panel de paciente"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white/80 hover:text-white flex items-center justify-center border border-white/15 backdrop-blur-xl transition-all shadow-md active:scale-95"
            >
              <Icon name="arrow_back" size={18} />
            </button>

            <div
              className="rounded-full px-2 sm:px-2.5 py-1 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xl border border-white/15 shadow-md"
              title={poseData?.isTracking ? 'Seguimiento corporal activo' : 'Buscando postura corporal'}
            >
              <span className={`w-2 h-2 rounded-full ${poseData?.isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider hidden xs:inline">
                {poseData?.isTracking ? 'AR' : 'Buscando'}
              </span>
            </div>
          </div>

          {/* Centro: Cápsula de Micro-Métricas Unificadas (Ejercicio, Reps, Series, Ángulo y Tiempo) */}
          <div className="pointer-events-auto min-w-0 max-w-full">
            <div
              className="rounded-2xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/90 backdrop-blur-2xl border border-teal-500/35 shadow-xl text-white"
            >
              {/* Nombre de Ejercicio con truncado inteligente */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 hidden sm:inline-block" />
                <span className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate max-w-[80px] xs:max-w-[110px] sm:max-w-[170px]">
                  {exerciseName}
                </span>
              </div>

              <div className="w-px h-3.5 bg-white/20 shrink-0" />

              {/* Repeticiones */}
              <div className="flex items-baseline gap-0.5 shrink-0" title={`Repeticiones: ${repCount} de ${TARGET_REPS}`}>
                <span className="text-teal-300 font-black text-xs sm:text-sm md:text-base leading-none">{repCount}</span>
                <span className="text-white/40 text-[9px] sm:text-[10px]">/{TARGET_REPS}</span>
              </div>

              <div className="w-px h-3.5 bg-white/20 shrink-0" />

              {/* Serie Actual */}
              <span className="text-white/80 font-bold text-[10px] sm:text-xs shrink-0" title={`Serie ${currentSet} de ${TOTAL_SETS}`}>
                S{currentSet}/{TOTAL_SETS}
              </span>

              <div className="w-px h-3.5 bg-white/20 shrink-0" />

              {/* Ángulo Biomecánico en Tiempo Real */}
              <div
                className="font-mono text-[10px] sm:text-xs font-bold text-teal-300 bg-teal-500/20 px-1.5 py-0.5 rounded flex items-center shrink-0 border border-teal-500/30"
                title={`Ángulo articular actual: ${currentAngle}°`}
              >
                <span>{currentAngle}°</span>
              </div>

              <div className="w-px h-3.5 bg-white/20 shrink-0 hidden xs:block" />

              {/* Cronómetro de Sesión */}
              <span className="font-mono text-[10px] sm:text-xs text-white/90 font-medium shrink-0 hidden xs:inline" title="Tiempo transcurrido">
                {formatTime(timer)}
              </span>
            </div>
          </div>

          {/* Lado Derecho: Controles Rápidos de Cámara y Modo HUD */}
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
            <button
              onClick={toggleFacingMode}
              title={facingMode === 'user' ? 'Cámara trasera' : 'Cámara frontal'}
              aria-label="Alternar cámara"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white/80 hover:text-white flex items-center justify-center border border-white/15 backdrop-blur-xl transition-all shadow-md active:scale-95"
            >
              <Icon name="flip_camera_ios" size={17} />
            </button>
            <button
              onClick={() => setIsMirrored((prev) => !prev)}
              title={isMirrored ? 'Desactivar efecto espejo' : 'Activar efecto espejo'}
              aria-label="Modo espejo"
              className={cn(
                'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 flex items-center justify-center border backdrop-blur-xl transition-all shadow-md active:scale-95',
                isMirrored ? 'text-teal-300 border-teal-500/50' : 'text-white/60 border-white/15'
              )}
            >
              <Icon name="sync_alt" size={17} />
            </button>
            <button
              onClick={() => setHudMode((prev) => (prev === 'full' ? 'minimal' : 'full'))}
              title={hudMode === 'minimal' ? 'Modo Esencial Activo. Toca para Modo Completo.' : 'Modo Completo. Toca para Modo Esencial.'}
              aria-label={hudMode === 'minimal' ? 'Cambiar a modo completo' : 'Cambiar a modo esencial'}
              className={cn(
                'px-2.5 sm:px-3 h-8 sm:h-9 rounded-full flex items-center gap-1 border backdrop-blur-xl transition-all shadow-md active:scale-95 text-[10px] sm:text-xs font-bold uppercase tracking-wider',
                hudMode === 'minimal'
                  ? 'bg-amber-500/30 text-amber-300 border-amber-400/50 shadow-amber-500/20'
                  : 'bg-slate-900/80 text-white/80 border-white/15 hover:text-white'
              )}
            >
              <Icon name={hudMode === 'minimal' ? 'auto_awesome' : 'visibility'} size={16} />
              <span className="hidden sm:inline">{hudMode === 'minimal' ? 'Esencial' : 'Completo'}</span>
            </button>
          </div>
        </header>
      )}

      {/* Badge discreto si el modo simulación biomecánica está activo */}
      {isSimulated && isReady && (
        <div className="fixed top-12 sm:top-14 left-1/2 -translate-x-1/2 z-[34] flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-xl text-amber-200 text-[10px] sm:text-xs font-semibold shadow-lg">
          <Icon name="sensors" size={13} className="text-amber-400 shrink-0" />
          <span>Simulación Biomecánica</span>
          <button
            onClick={reconnectCamera}
            className="ml-1 px-1.5 py-0.5 rounded bg-amber-400/30 hover:bg-amber-400/50 text-white font-bold uppercase tracking-wider text-[9px] transition-colors cursor-pointer"
          >
            Reconectar
          </button>
        </div>
      )}

      {/* Camera loading / scanning state — escaneando.webp durante calibración AR */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <MascotAnimation type="scanning" size="md" />
          <p className="text-white/60 text-sm">Inicializando cámara y MediaPipe...</p>
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
              Reintentar Cámara
            </button>
            <button
              onClick={() => navigate('/dashboard-paciente')}
              className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-semibold text-sm cursor-pointer"
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {/* Pre-session instruction overlay (before camera activation) */}
      {!sessionStarted && !error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <MascotAnimation type="greeting" size="md" />
          <TypewriterText
            text="Ajusta tu postura frente a la cámara..."
            className="text-white text-lg md:text-xl font-medium max-w-md"
          />
          {!calibrated && (
            <div className="mt-2 max-w-md rounded-2xl bg-amber-500/15 border border-amber-400/40 px-4 py-3 text-amber-200 text-sm flex items-center gap-2">
              <Icon name="warning" filled size={18} />
              <span>Modo sin calibrar: la precisión del seguimiento puede ser menor.</span>
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
              Descanso
            </motion.h2>
            <motion.span
              key={restCountdown}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-black text-white"
            >
              {restCountdown}
            </motion.span>
            <p className="text-white/60 mt-4">Serie {currentSet} completada</p>
            <button onClick={() => setRestCountdown(0)} className="mt-8 px-6 py-3 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 active:scale-95 transition-all">
              Saltar descanso
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Model Picture-in-Picture Exercise Demonstrator (Elemento Esencial y Clínico) */}
      <AnimatePresence>
        {showModel3D && state !== 'finished' && (
          <div className="absolute top-14 sm:top-16 md:top-20 right-2 sm:right-4 md:right-6 z-30 pointer-events-none">
            <ARModel3DOverlayPiP
              exerciseName={exerciseName}
              targetAngle={90}
              isOpen={showModel3D}
              onClose={() => setShowModel3D(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* HUD — Espacio central despejado en móvil; widgets adaptativos en escritorio */}
      <div className="relative z-20 flex flex-col h-full pt-12 sm:pt-14 pb-3 sm:pb-5 px-2.5 sm:px-4 md:px-8 pointer-events-none transition-opacity duration-300">
        {/* Espacio Central: En móvil 100% libre para el paciente; en escritorio muestra paneles laterales discretos */}
        <div className="flex-1 flex items-center justify-between transition-all duration-300">
          {hudMode === 'full' ? (
            <>
              {/* Escritorio Izquierda: Series y Cadencia (Oculto en móvil para no tapar el cuerpo) */}
              <div className="hidden md:block space-y-3 pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl p-3.5 w-48 bg-slate-900/80 backdrop-blur-xl border border-white/15 text-white shadow-xl"
                >
                  <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mb-1">Series del Ejercicio</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-3xl font-black">{currentSet}</span>
                    <span className="text-white/40 text-base">/ {TOTAL_SETS}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-white/60">Repeticiones</span>
                    <span className="text-teal-300 font-bold">{repCount} / {TARGET_REPS}</span>
                  </div>
                </motion.div>

                <div className="w-48">
                  <RepCadenceMetronome
                    targetCadenceBpm={42}
                    className="w-full bg-slate-900/80 backdrop-blur-xl border-white/15 text-white"
                  />
                </div>
              </div>

              {/* Escritorio Derecha: Medidor Biomecánico (Solo si el modelo 3D no está activo para no recargar) */}
              <div className="hidden md:block pointer-events-auto">
                {!showModel3D && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <BiomechanicalAngleGauge
                      currentAngle={currentAngle}
                      targetAngle={90}
                      jointName={exerciseName}
                      safeTolerance={10}
                      size={140}
                      className="bg-slate-900/80 backdrop-blur-xl border-white/15 text-white shadow-2xl"
                    />
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full" />
          )}
        </div>

        {/* Zona Inferior: Alertas, Feedback por Voz y Dock Ergonómico */}
        <div className="space-y-2 pointer-events-auto flex flex-col items-center w-full max-w-2xl mx-auto">
          {/* Banner de Compensación Postural */}
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
                onDismiss={() => {}}
              />
            </motion.div>
          )}

          {/* Banner de Feedback por Voz — Píldora ultra-compacta no invasiva */}
          {hudMode === 'full' && !compensation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full px-2 max-w-lg"
            >
              <VoiceFeedbackWaveHUD
                isSpeaking={Boolean(aiFeedbackRef.current)}
                instructionText={aiFeedbackRef.current || 'Postura adecuada. Mantén la velocidad y respira naturalmente.'}
                className="bg-slate-900/85 backdrop-blur-xl border-white/15 text-white py-1.5 px-3 text-xs"
              />
            </motion.div>
          )}

          {/* Dock de Controles Inferior Unificado (Mobile First, Touch Targets >= 44px) */}
          <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-full overflow-x-auto">
            {state === 'active' && (
              <>
                {/* Pausar */}
                <button
                  onClick={() => setState('paused')}
                  className="rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                  aria-label="Pausar ejercicio"
                >
                  <Icon name="pause" size={18} />
                  <span>Pausar</span>
                </button>

                {/* Finalizar */}
                <button
                  onClick={() => { setState('finished'); setShowPainReport(true); }}
                  className="rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500/80 hover:bg-red-500 text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                  aria-label="Finalizar ejercicio"
                >
                  <Icon name="stop" size={18} />
                  <span>Finalizar</span>
                </button>

                <div className="w-px h-6 bg-white/15 my-auto" />

                {/* Botón Particular Modelo 3D (Elemento Esencial y Clínico) */}
                <button
                  onClick={() => setShowModel3D((prev) => !prev)}
                  aria-label={showModel3D ? 'Ocultar modelo 3D demostrador' : 'Mostrar modelo 3D demostrador'}
                  className={cn(
                    "rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[40px] sm:min-h-[44px]",
                    showModel3D
                      ? "bg-teal-500/30 text-teal-300 border border-teal-400/50 shadow-md shadow-teal-500/20"
                      : "bg-white/5 text-white/70 hover:text-white"
                  )}
                  title={showModel3D ? 'Guía 3D Activa (Toca para ocultar)' : 'Mostrar Guía 3D de ejercicio'}
                >
                  <Icon name="view_in_ar" size={18} />
                  <span className="text-xs font-bold hidden sm:inline">
                    {showModel3D ? 'Guía 3D ON' : 'Guía 3D'}
                  </span>
                </button>

                {/* Modo Esencial / Completo */}
                <button
                  onClick={() => setHudMode((prev) => (prev === 'full' ? 'minimal' : 'full'))}
                  aria-label={hudMode === 'minimal' ? 'Cambiar a modo completo' : 'Cambiar a modo esencial'}
                  className={cn(
                    "rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[40px] sm:min-h-[44px]",
                    hudMode === 'minimal'
                      ? "bg-amber-500/25 text-amber-300 border border-amber-400/50"
                      : "bg-white/5 text-white/70 hover:text-white"
                  )}
                  title={hudMode === 'minimal' ? 'Modo Esencial Activo' : 'Modo Completo Activo'}
                >
                  <Icon name={hudMode === 'minimal' ? 'auto_awesome' : 'dashboard'} size={18} />
                  <span className="text-xs font-bold hidden sm:inline">
                    {hudMode === 'minimal' ? 'Esencial' : 'Completo'}
                  </span>
                </button>

                {/* Pantalla completa (oculto en móviles estrechos) */}
                <button
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                  className="rounded-xl p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer hidden xs:flex items-center justify-center min-h-[40px] sm:min-h-[44px] min-w-[40px]"
                >
                  <Icon name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'} size={18} />
                </button>

                {/* Volumen */}
                <button
                  onClick={() => {
                    const states: Array<'high' | 'low' | 'muted'> = ['high', 'low', 'muted'];
                    const idx = states.indexOf(volumeLevel);
                    setVolumeLevel(states[(idx + 1) % 3]);
                  }}
                  className="rounded-xl p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center min-h-[40px] sm:min-h-[44px] min-w-[40px]"
                  aria-label="Cambiar volumen de audio"
                  title={`Volumen: ${volumeLevel}`}
                >
                  <Icon name={volumeLevel === 'muted' ? 'volume_off' : volumeLevel === 'low' ? 'volume_down' : 'volume_up'} size={18} />
                </button>

                {/* Configuración */}
                <button
                  onClick={() => setShowSettings(true)}
                  aria-label="Abrir ajustes"
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
                  <Icon name="play_arrow" size={18} /> Reanudar
                </PulsatingButton>
                <button
                  onClick={handleRestart}
                  className="rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                >
                  <Icon name="refresh" size={18} /> Reiniciar
                </button>
                <button
                  onClick={() => { setState('finished'); setShowPainReport(true); }}
                  className="rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500/80 hover:bg-red-500 text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs sm:text-sm min-h-[40px] sm:min-h-[44px]"
                >
                  <Icon name="stop" size={18} /> Abandonar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings modal accesible con HeroUI Modal */}
      <Modal open={showSettings} onOpenChange={setShowSettings}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[360px] bg-slate-900/95 border border-white/20 text-white shadow-2xl backdrop-blur-2xl">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-teal-500/20 text-teal-300">
                  <Icon name="settings" size={20} />
                </Modal.Icon>
                <Modal.Heading className="text-white">Configuración del Espejo</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setVolumeLevel(volumeLevel === 'muted' ? 'high' : 'muted'); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">Audio de Guía</span>
                  <Icon name={volumeLevel !== 'muted' ? 'toggle_on' : 'toggle_off'} size={28} className={volumeLevel !== 'muted' ? 'text-teal-300' : 'text-white/40'} />
                </button>
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">Cámara ({facingMode === 'user' ? 'Frontal' : 'Trasera'})</span>
                  <Icon name="flip_camera_ios" size={20} className="text-[#8ad3cf]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMirrored((prev) => !prev)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">Modo Espejo Invertido</span>
                  <Icon name={isMirrored ? 'toggle_on' : 'toggle_off'} size={28} className={isMirrored ? 'text-teal-300' : 'text-white/40'} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowModel3D((prev) => !prev)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">Demostrador 3D en Vivo (PiP)</span>
                  <Icon name={showModel3D ? 'toggle_on' : 'toggle_off'} size={28} className={showModel3D ? 'text-teal-300' : 'text-white/40'} />
                </button>
                <button
                  type="button"
                  onClick={() => { handleRestart(); setShowSettings(false); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <span className="text-sm font-semibold">Reiniciar sesión actual</span>
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
                  Listo
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
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <h2 className="text-white text-2xl font-bold mb-2">Reporte Post-Sesión</h2>
              <p className="text-white/60 text-sm mb-4">Tu fisioterapeuta necesita esta información para ajustar tu rutina.</p>

              <SessionQualityScoreTile
                score={Math.min(99, Math.max(76, Math.round(85 + (repCount >= TARGET_REPS ? 10 : 0) - (compensation ? 8 : 0))))}
                className="bg-slate-900/80 border-white/15 text-white mb-5"
              />

              <div className="space-y-5">
                <div>
                  <label className="text-white/80 text-sm font-bold">Dolor antes de la sesión (0-10)</label>
                  <input type="range" min={0} max={10} value={painBefore} onChange={(e) => setPainBefore(Number(e.target.value))} className="w-full mt-2 accent-[#8ad3cf]" />
                  <div className="flex justify-between text-white/40 text-xs mt-1"><span>0</span><span className="text-white font-bold text-base">{painBefore}</span><span>10</span></div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-bold">Dolor después de la sesión (0-10)</label>
                  <input type="range" min={0} max={10} value={painAfter} onChange={(e) => setPainAfter(Number(e.target.value))} className="w-full mt-2 accent-[#8ad3cf]" />
                  <div className="flex justify-between text-white/40 text-xs mt-1"><span>0</span><span className="text-white font-bold text-base">{painAfter}</span><span>10</span></div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-bold">Nivel de fatiga (1-5)</label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setFatigueLevel(n)} className={`flex-1 py-2 rounded-xl font-bold transition-all ${fatigueLevel === n ? 'bg-[#8ad3cf] text-[#001514]' : 'bg-white/10 text-white/60'}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-bold">Comentario (opcional)</label>
                  <textarea value={painComment} onChange={(e) => setPainComment(e.target.value)} placeholder="Describe cómo te sentiste durante la sesión..." className="w-full mt-2 p-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-[#8ad3cf] outline-none resize-none" rows={2} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => saveSession({ dolor_antes: painBefore, dolor_despues: painAfter, fatiga: fatigueLevel, comentario: painComment })} className="premium-btn flex-1 py-4 bg-[#8ad3cf] text-[#001514] rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all">
                  Enviar Reporte
                </button>
                <button onClick={() => {
                  setShowPainReport(false);
                  saveSession();
                }} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all">
                  Omitir
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
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 lg:w-[120px] lg:h-[120px] flex items-center justify-center mx-auto mb-4"
              >
                <MascotAnimation type="success" size="md" className="w-full h-full" />
              </motion.div>
              <h2 className="text-white text-3xl font-bold mb-2">¡Sesión Completada!</h2>
              <p className="text-white/60 mb-6">Has completado {currentSet} series con {repCount} repeticiones.</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div><p className="text-white/40 text-xs">Tiempo</p><p className="text-white text-xl font-bold">{formatTime(timer)}</p></div>
                <div><p className="text-white/40 text-xs">Repeticiones</p><p className="text-white text-xl font-bold">{repCount}</p></div>
                <div><p className="text-white/40 text-xs">Calidad</p><p className="text-white text-xl font-bold">{qualityScore}%</p></div>
              </div>

              {isSpiritualModeEnabled() && finishVerse && (
                <div className="mb-6 p-4 rounded-2xl bg-white/10 border border-white/15 text-left">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-300">
                    <BookOpen className="size-3.5" />
                    <span>Palabra de Sanidad & Fortaleza</span>
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
                <button onClick={() => navigate('/stats')} className="premium-btn flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all">
                  Ver Progreso
                </button>
                <button onClick={() => navigate('/dashboard-paciente')} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all">
                  Inicio
                </button>
              </div>
            </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
