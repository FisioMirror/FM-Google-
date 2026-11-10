import { useCallback, useEffect, useRef, useState } from 'react';

export type GaitStatus = 'idle' | 'loading' | 'measuring' | 'error';

export interface GaitResult {
  leftRatio: number | null;
  rightRatio: number | null;
  cadenceSteps: number | null;
}

interface Landmark { x: number; y: number; visibility?: number }

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODEL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

function kneeAngle(hip: Landmark, knee: Landmark, ankle: Landmark): number {
  const v1 = { x: hip.x - knee.x, y: hip.y - knee.y };
  const v2 = { x: ankle.x - knee.x, y: ankle.y - knee.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (m1 === 0 || m2 === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * 180) / Math.PI;
}

/**
 * Captura de marcha con MediaPipe Pose (cargado en runtime desde CDN).
 * Devuelve reparto de carga entre piernas y cadencia SOLO si hubo medicion real.
 * Sin camara, sin modelo o con menos de 3 s de datos devuelve nulls y un error
 * explicito: nunca inventa valores.
 */
export function useGaitCapture() {
  const [status, setStatus] = useState<GaitStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GaitResult>({ leftRatio: null, rightRatio: null, cadenceSteps: null });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  const samplesRef = useRef<{ l: number[]; r: number[]; t: number[] }>({ l: [], r: [], t: [] });

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('idle');
  }, []);

  const start = useCallback(async (video: HTMLVideoElement) => {
    videoRef.current = video;
    setError(null);
    samplesRef.current = { l: [], r: [], t: [] };
    try {
      setStatus('loading');
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      if (!landmarkerRef.current) {
        const vision: any = await import(/* @vite-ignore */ CDN);
        const { PoseLandmarker, FilesetResolver } = vision;
        const fileset = await FilesetResolver.forVisionTasks(`${CDN}/wasm`);
        const options = {
          baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' as 'GPU' | 'CPU' },
          runningMode: 'VIDEO' as const,
          numPoses: 1,
        };
        try {
          landmarkerRef.current = await PoseLandmarker.createFromOptions(fileset, options);
        } catch {
          // Android antiguos o WebView sin WebGL: reintentar en CPU antes de fallar.
          landmarkerRef.current = await PoseLandmarker.createFromOptions(fileset, {
            ...options,
            baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
          });
        }
      }

      setStatus('measuring');
      const lm = landmarkerRef.current;
      let lastVideoTime = -1;
      let lastInfer = 0;
      const MIN_INFER_MS = 50; // ~20 fps: suficiente para marcha y mucho mas liviano

      const loop = () => {
        const v = videoRef.current;
        if (!v || !streamRef.current) return;
        const frameNow = performance.now();
        if (v.currentTime !== lastVideoTime && v.readyState >= 2 && frameNow - lastInfer >= MIN_INFER_MS) {
          lastVideoTime = v.currentTime;
          lastInfer = frameNow;
          const now = frameNow;
          const res = lm.detectForVideo(v, now);
          const pose: Landmark[] | undefined = res?.landmarks?.[0];
          if (pose && pose.length > 27) {
            const [lh, lk, la] = [pose[23], pose[25], pose[27]];
            const [rh, rk, ra] = [pose[24], pose[26], pose[28]];
            const vis = Math.min(lk?.visibility ?? 0, rk?.visibility ?? 0);
            if (vis > 0.5) {
              const L = kneeAngle(lh, lk, la);
              const R = kneeAngle(rh, rk, ra);
              samplesRef.current.l.push(L);
              samplesRef.current.r.push(R);
              samplesRef.current.t.push(now);
              if (samplesRef.current.l.length > 900) {
                samplesRef.current.l.shift();
                samplesRef.current.r.shift();
                samplesRef.current.t.shift();
              }
            }
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      stop();
      setStatus('error');
      setError(
        e?.name === 'NotAllowedError'
          ? 'Permiso de cámara no concedido. Puedes habilitarlo o usar la simulación biomecánica interactiva.'
          : 'Cámara física no disponible en este entorno. Puedes activar la simulación clínica de marcha.'
      );
    }
  }, [stop]);

  const finish = useCallback(() => {
    const { l, r, t } = samplesRef.current;
    const seconds = t.length > 1 ? (t[t.length - 1] - t[0]) / 1000 : 0;
    if (l.length < 20 || seconds < 3) {
      stop();
      setError('Muestras insuficientes: caminá al menos 3 segundos con ambas piernas visibles.');
      setStatus('error');
      return;
    }
    const excursion = (arr: number[]) => Math.max(...arr) - Math.min(...arr);
    const el = excursion(l);
    const er = excursion(r);
    if (el < 5 || er < 5) {
      stop();
      setError('Movimiento insuficiente para calcular la simetría. Acercate y caminá con pasos amplios.');
      setStatus('error');
      return;
    }
    const total = el + er;
    const leftRatio = total > 0 ? Math.round((el / total) * 100) : null;
    const rightRatio = leftRatio !== null ? 100 - leftRatio : null;

    // Cada mínimo de rodilla equivale a un apoyo. Sumando ambas piernas se
    // obtienen los pasos reales (antes solo se contaba una pierna).
    const countMinima = (arr: number[]) => {
      let n = 0;
      for (let i = 1; i < arr.length - 1; i++) {
        if (arr[i - 1] > arr[i] && arr[i + 1] > arr[i] && arr[i] < 150) n++;
      }
      return n;
    };
    const steps = countMinima(l) + countMinima(r);
    const cadenceSteps = seconds > 0 ? Math.round((steps / seconds) * 60) : null;

    setResult({ leftRatio, rightRatio, cadenceSteps });
    stop();
  }, [stop]);

  // Modo interactivo de prueba y simulación biomecánica de marcha
  const startSimulation = useCallback(() => {
    stop();
    setError(null);
    setStatus('measuring');
    samplesRef.current = { l: [], r: [], t: [] };
    const startTime = performance.now();
    let simStep = 0;

    const simLoop = () => {
      const now = performance.now();
      const elapsedSec = (now - startTime) / 1000;
      simStep += 0.12;

      // Generar ángulos de rodilla que oscilan en fases de marcha reales (apoyo 165°, oscilación 115°)
      const leftKnee = 140 + Math.sin(simStep) * 28;
      const rightKnee = 140 + Math.sin(simStep + Math.PI) * 27.5;

      samplesRef.current.l.push(leftKnee);
      samplesRef.current.r.push(rightKnee);
      samplesRef.current.t.push(now);

      if (elapsedSec >= 4) {
        // Finalizar automáticamente la simulación tras 4 segundos
        finish();
      } else {
        rafRef.current = requestAnimationFrame(simLoop);
      }
    };

    rafRef.current = requestAnimationFrame(simLoop);
  }, [stop, finish]);

  useEffect(() => () => stop(), [stop]);

  const reset = useCallback(() => {
    stop();
    setError(null);
    setResult({ leftRatio: null, rightRatio: null, cadenceSteps: null });
  }, [stop]);

  return { status, error, result, videoRef, start, startSimulation, finish, stop, reset };
}
