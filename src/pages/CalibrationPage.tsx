import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/ToastProvider';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { PulsatingButton } from '../components/ui/PulsatingButton';
import { SparklesText } from '../components/ui/SparklesText';
import { CalibrationCompass } from '../components/ui/FloatingControlsSuite';
import {
  PoseConfidenceLiveIndicator,
} from '../components/ui/RealTimeMetricsSuite';

type CalibState = 'idle' | 'detecting' | 'calibrating' | 'success' | 'error';

const STORAGE_KEY = 'calibrationCompleted';
const SKIP_KEY = 'calibrationSkipped';
const DETECT_TIMEOUT = 15;
const COUNTDOWN_FROM = 3;

export function CalibrationPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { videoRef, canvasRef, poseData, isReady, error, startCamera, isSimulated, reconnectCamera } = usePoseDetection();
  const vRef = videoRef as React.RefObject<HTMLVideoElement>;
  const cRef = canvasRef as React.RefObject<HTMLCanvasElement>;

  const [state, setState] = useState<CalibState>('idle');
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [detectElapsed, setDetectElapsed] = useState(0);
  const [handRaisedDetected, setHandRaisedDetected] = useState(false);

  const detectStartRef = useRef<number>(0);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCountingDownRef = useRef<boolean>(false);
  const countdownValRef = useRef<number>(COUNTDOWN_FROM);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (isReady && !error && state === 'idle') {
      setState('detecting');
      detectStartRef.current = Date.now();
      setDetectElapsed(0);
    }
  }, [isReady, error, state]);

  useEffect(() => {
    if (state !== 'detecting') return;
    if (poseData?.isTracking) {
      setState('calibrating');
    }
  }, [poseData, state]);

  useEffect(() => {
    if (state !== 'detecting') return;
    errorTimerRef.current = setTimeout(() => {
      setState((s) => (s === 'detecting' ? 'error' : s));
    }, DETECT_TIMEOUT * 1000);
    elapsedTimerRef.current = setInterval(() => {
      setDetectElapsed(Math.floor((Date.now() - detectStartRef.current) / 1000));
    }, 1000);
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      errorTimerRef.current = null;
      elapsedTimerRef.current = null;
    };
  }, [state]);

  // Calibration pose detection & countdown handling
  useEffect(() => {
    if (state !== 'calibrating') {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      isCountingDownRef.current = false;
      return;
    }

    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }

    const lm = poseData?.landmarks;
    if (!lm) {
      setHandRaisedDetected(false);
      return;
    }

    const rightWrist = lm[16];
    const rightShoulder = lm[12];
    const leftWrist = lm[15];
    const leftShoulder = lm[11];

    const isHandRaised = Boolean(
      (rightWrist && rightShoulder && rightWrist.y < rightShoulder.y && rightWrist.visibility > 0.4) ||
      (leftWrist && leftShoulder && leftWrist.y < leftShoulder.y && leftWrist.visibility > 0.4)
    );

    setHandRaisedDetected(isHandRaised);

    if (isHandRaised) {
      if (!isCountingDownRef.current) {
        isCountingDownRef.current = true;
        countdownValRef.current = COUNTDOWN_FROM;
        setCountdown(COUNTDOWN_FROM);

        countdownTimerRef.current = setInterval(() => {
          countdownValRef.current -= 1;
          const currentVal = countdownValRef.current;
          setCountdown(currentVal);

          if (currentVal <= 0) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            isCountingDownRef.current = false;
            try {
              localStorage.setItem(STORAGE_KEY, 'true');
              localStorage.removeItem(SKIP_KEY);
            } catch { /* storage fallback */ }
            toast.success(t('cal.done'));
            setState('success');
          }
        }, 1000);
      }
    } else {
      // Hand lowered before countdown finished
      if (isCountingDownRef.current) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        isCountingDownRef.current = false;
        countdownValRef.current = COUNTDOWN_FROM;
        setCountdown(COUNTDOWN_FROM);
      }
    }
  }, [state, poseData, toast]);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      isCountingDownRef.current = false;
    };
  }, []);

  const goAR = () => navigate('/ar-mirror');

  const handleSkip = () => {
    try {
      localStorage.setItem(SKIP_KEY, 'true');
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* */ }
    setShowSkipConfirm(false);
    goAR();
  };

  const retry = () => {
    setCountdown(COUNTDOWN_FROM);
    countdownValRef.current = COUNTDOWN_FROM;
    isCountingDownRef.current = false;
    setDetectElapsed(0);
    setState('detecting');
    detectStartRef.current = Date.now();
  };

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col overflow-hidden select-none">
      <video ref={vRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted style={{ zIndex: 1 }} />
      <canvas ref={cRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" style={{ zIndex: 2 }} />

      {/* Header Compacto y Translúcido */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 bg-slate-950/60 backdrop-blur-md border-b border-white/10">
        <button
          onClick={() => navigate('/dashboard-paciente')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label={t('common.back')}
        >
          <Icon name="arrow_back" size={20} className="text-white" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-sm sm:text-base tracking-wide">{t('cal.title')}</h1>
          <span className="text-2xs text-teal-300 font-semibold uppercase tracking-wider">{t('cal.camAlign')}</span>
        </div>
        <div className="flex items-center gap-2">
          <PoseConfidenceLiveIndicator
            confidence={isReady && poseData?.isTracking ? 95 : 30}
            className="bg-slate-900/70 border-white/20 text-white text-2xs sm:text-xs py-1 px-2.5"
          />
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="text-xs font-bold text-white/70 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition-colors sm:hidden"
          >
            {t('cal.skipStep')}
          </button>
        </div>
      </header>

      {/* Sutiles Guías de Encuadre en las Esquinas (sin obstruir el cuerpo) */}
      <div className="absolute inset-4 sm:inset-10 pointer-events-none z-10">
        <div className="w-full h-full relative rounded-3xl border border-white/10">
          {/* Esquina Superior Izquierda */}
          <div className="absolute top-0 left-0 w-6 sm:w-10 h-6 sm:h-10 border-t-2 border-l-2 border-teal-400/70 rounded-tl-xl" />
          {/* Esquina Superior Derecha */}
          <div className="absolute top-0 right-0 w-6 sm:w-10 h-6 sm:h-10 border-t-2 border-r-2 border-teal-400/70 rounded-tr-xl" />
          {/* Esquina Inferior Izquierda */}
          <div className="absolute bottom-0 left-0 w-6 sm:w-10 h-6 sm:h-10 border-b-2 border-l-2 border-teal-400/70 rounded-bl-xl" />
          {/* Esquina Inferior Derecha */}
          <div className="absolute bottom-0 right-0 w-6 sm:w-10 h-6 sm:h-10 border-b-2 border-r-2 border-teal-400/70 rounded-br-xl" />
        </div>
      </div>

      {/* Indicador Flotante Superior de Detección */}
      {isReady && !error && state !== 'idle' && state !== 'success' && (
        <div className="absolute top-14 sm:top-16 left-3 sm:left-6 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-card">
          <span className={`w-2 h-2 rounded-full ${poseData?.isTracking ? 'bg-teal-400 animate-pulse' : 'bg-warning'}`} />
          <span className="text-white text-2xs sm:text-xs font-bold uppercase tracking-wider">
            {poseData?.isTracking ? (isSimulated ? t('cal.liveSim') : t('cal.bodyInFrame')) : t('cal.searching')}
          </span>
        </div>
      )}

      {/* Banner de Modo Simulación cuando la cámara física no está accesible */}
      {isSimulated && isReady && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-warning/20 border border-warning/40 backdrop-blur-md px-3 py-1.5 rounded-full text-warning text-xs sm:text-xs font-medium shadow-sm">
          <Icon name="sensors" size={14} className="text-warning shrink-0" />
          <span>Modo Simulación Biomecánica</span>
          <button
            onClick={reconnectCamera}
            className="ml-1 px-2 py-0.5 rounded-full bg-warning/30 hover:bg-warning/50 text-white text-2xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Reconectar
          </button>
        </div>
      )}

      {/* Brújula y Sensor de Nivel Espacial (Desktop) */}
      <div className="absolute top-16 right-6 z-20 pointer-events-auto hidden md:block">
        <CalibrationCompass pitch={3} roll={-1} className="bg-slate-900/80 backdrop-blur-md border-white/20 text-white" />
      </div>

      {/* Cuenta atrás sutil flotante en modo calibrando */}
      {state === 'calibrating' && countdown > 0 && (
        <div className="absolute top-14 sm:top-16 right-3 sm:right-6 z-20 pointer-events-none">
          <motion.div
            key={countdown}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-teal-500/90 text-on-surface font-black text-xl sm:text-2xl flex items-center justify-center shadow-card shadow-teal-500/30 border-2 border-white/40"
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {/* Estado: Inicializando Cámara */}
      {state === 'idle' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md gap-4">
          <div className="w-14 h-14 rounded-full border-3 border-teal-400 border-t-transparent animate-spin" />
          <p className="text-white/80 text-sm font-medium">Inicializando cámara y sensor corporal...</p>
        </div>
      )}

      {/* Estado: Error */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md gap-4 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center border border-danger/30">
            <Icon name="videocam_off" filled size={36} className="text-danger" />
          </div>
          <p className="text-danger text-sm max-w-sm">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={reconnectCamera}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold transition-all text-sm cursor-pointer shadow-card shadow-teal-500/25 active:scale-95"
            >
              Reintentar Cámara
            </button>
            <button
              onClick={() => navigate('/dashboard-paciente')}
              className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors text-sm"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}

      {/* PANEL INFERIOR COLAPSABLE TIPO TARJETA FLOTANTE (Preferido por el usuario) */}
      {!error && (state === 'detecting' || state === 'calibrating') && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-30 pointer-events-auto"
        >
          <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-elevated overflow-hidden transition-all duration-300">
            {/* Cabecera de la tarjeta con botón colapsar */}
            <div
              onClick={() => setIsPanelCollapsed((prev) => !prev)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/10 select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${poseData?.isTracking ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]' : 'bg-warning'}`} />
                <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
                  {state === 'calibrating' ? t('cal.step2') : t('cal.step1')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs text-white/50 hidden xs:inline">
                  {isPanelCollapsed ? t('cal.expand') : t('cal.minimize')}
                </span>
                <button
                  type="button"
                  aria-label={isPanelCollapsed ? t('cal.expand') : t('cal.minimize')}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-all"
                >
                  <Icon name={isPanelCollapsed ? 'expand_less' : 'expand_more'} size={18} />
                </button>
              </div>
            </div>

            {/* Contenido expandible de la tarjeta */}
            <AnimatePresence>
              {!isPanelCollapsed ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3.5 sm:p-4 space-y-3"
                >
                  {state === 'detecting' ? (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                          <Icon name="accessibility_new" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs sm:text-sm font-semibold leading-snug">
                            t('cal.standFront')
                          </p>
                          <p className="text-white/60 text-xs sm:text-xs mt-0.5 leading-relaxed">
                            t('cal.standFrontDesc')
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                        <span className="text-white/50">{t('cal.time')} {detectElapsed}s / {DETECT_TIMEOUT}s</span>
                        <button
                          onClick={() => setShowSkipConfirm(true)}
                          className="text-teal-300 hover:text-teal-200 font-semibold transition-colors"
                        >
                          t('cal.skipStep')
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                          handRaisedDetected
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'bg-warning/20 text-warning border-warning/40 animate-pulse'
                        }`}>
                          <Icon name={handRaisedDetected ? 'check_circle' : 'pan_tool'} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-bold leading-snug ${handRaisedDetected ? 'text-teal-300' : 'text-white'}`}>
                            {handRaisedDetected ? t('cal.handDetected') : t('cal.raiseOverShoulder')}
                          </p>
                          <p className="text-white/60 text-xs sm:text-xs mt-0.5 leading-relaxed">
                            {handRaisedDetected
                              ? t('cal.holdHand', { s: countdown })
                              : t('cal.raiseHand')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                        <span className="text-teal-300/80 font-medium">{t('cal.countdown')} {countdown}s</span>
                        <button
                          onClick={() => setShowSkipConfirm(true)}
                          className="text-white/50 hover:text-white transition-colors"
                        >
                          Continuar sin calibrar
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <div className="px-4 py-2 flex items-center justify-between text-xs text-white/70">
                  <span className="truncate pr-2">
                    {state === 'calibrating'
                      ? (handRaisedDetected ? t('cal.holdPose', { s: countdown }) : t('cal.raiseOverShoulder'))
                      : t('cal.getInFrame')}
                  </span>
                  <span className="text-teal-300 font-semibold shrink-0">
                    {state === 'calibrating' ? `${countdown}s` : `${detectElapsed}s`}
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Modal de Calibración Exitosa */}
      <AnimatePresence>
        {state === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md gap-5 p-6 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-teal-500 flex items-center justify-center shadow-elevated shadow-teal-500/40"
            >
              <Icon name="check" size={56} className="text-white" />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <SparklesText
                sparklesCount={6}
                colors={{ first: '#2dd4bf', second: '#c1ff72' }}
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
              >
                t('cal.successTitle')
              </SparklesText>
              <p className="text-white/70 text-sm max-w-sm">{t('cal.successDesc')}</p>
            </motion.div>
            <PulsatingButton
              variant="ripple"
              pulseColor="rgba(45, 212, 191, 0.6)"
              onClick={goAR}
              className="mt-3 px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-bold flex items-center gap-2 shadow-card shadow-teal-500/30 text-sm sm:text-base cursor-pointer"
            >
              <Icon name="play_arrow" size={20} /> {t('cal.continueAR')}
            </PulsatingButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Fallo de Detección con Reintentar */}
      <AnimatePresence>
        {state === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md gap-4 p-6 text-center select-none"
          >
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center border border-warning/40">
              <Icon name="warning" filled size={36} className="text-warning" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t('cal.notDetected')}</h2>
            <p className="text-white/70 text-sm max-w-sm">
              Verifica que haya suficiente iluminación y que tu torso y ambos brazos queden dentro del encuadre.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-3 w-full max-w-xs">
              <button
                onClick={retry}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold flex items-center gap-2 justify-center transition-all cursor-pointer text-sm shadow-card shadow-teal-500/25 active:scale-95"
              >
                <Icon name="refresh" size={18} /> {t('cal.retry')}
              </button>
              <button
                onClick={() => setShowSkipConfirm(true)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold flex items-center gap-2 justify-center transition-all cursor-pointer text-sm"
              >
                {t('cal.skipStep')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowSkipConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="rounded-3xl p-6 max-w-md w-full text-center border border-white/10" style={{ background: 'rgba(22,35,34,0.95)', backdropFilter: 'blur(24px)' }}>
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="warning" filled size={32} className="text-warning" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">{t('cal.continueWithout')}?</h3>
              <p className="text-white/70 text-sm mb-6">La precision del seguimiento puede verse afectada sin calibrar. Deseas continuar?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowSkipConfirm(false)} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors">Cancelar</button>
                <button onClick={handleSkip} className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform">Continuar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
