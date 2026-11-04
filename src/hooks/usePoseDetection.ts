import { useEffect, useRef, useState, useCallback } from 'react';

// MediaPipe Pose is loaded via CDN <script> tags in index.html, which exposes window.Pose.
declare global {
  interface Window {
    Pose?: any;
    Camera?: any;
  }
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseData {
  landmarks: PoseLandmark[];
  /** Ángulo de hombro (cadera-hombro-codo) de cada lado. */
  leftArmAngle: number;
  rightArmAngle: number;
  /** Ángulo de codo (hombro-codo-muñeca) de cada lado. */
  leftElbowAngle: number;
  rightElbowAngle: number;
  /** Ángulo de la articulación que cuenta repeticiones para el ejercicio actual. */
  primaryAngle: number;
  /** Objetivo clínico configurado para esa articulación. */
  targetAngle: number;
  /** Calidad (0-100) de la última repetición completada. */
  lastRepQuality: number | null;
  /** Rango articular recorrido en la última repetición, en grados. */
  lastRepRange: number;
  postureScore: number;
  isTracking: boolean;
}

export type RepJoint = 'elbow' | 'knee' | 'shoulder' | 'hip';

export interface UsePoseDetectionOptions {
  /** Joint used to count repetitions. Defaults to elbow. */
  repJoint?: RepJoint;
  /** Exercise name used to infer the rep joint when repJoint is omitted. */
  exerciseName?: string;
  /**
   * Complejidad del modelo MediaPipe: 0 lite, 1 full, 2 heavy.
   * Si se omite se elige según el hardware (2 en equipos capaces, 1 en móvil).
   */
  modelComplexity?: 0 | 1 | 2;
  /** Techo de análisis por segundo (ahorra batería y reduce latencia percibida). */
  maxFps?: number;
}

function inferRepJoint(exerciseName?: string): RepJoint {
  const name = (exerciseName || '').toLowerCase();
  if (/(sentadilla|squat|rodilla|knee|prensa|leg press|zancada|lunge)/.test(name)) return 'knee';
  if (/(hombro|shoulder|elevaci|abducci|press militar|overhead)/.test(name)) return 'shoulder';
  if (/(cadera|hip|puente|bridge|gluteo|glúteo)/.test(name)) return 'hip';
  return 'elbow';
}

/**
 * Rango articular esperado (en grados) para una repetición completa.
 * Los presets clínicos expresan flexión/elevación/abducción; la rodilla usa
 * extensión (target 0), por eso su rango se deja en un valor funcional.
 */
function expectedRangeFor(joint: RepJoint, targetAngle: number): number {
  switch (joint) {
    case 'elbow':
      return Math.max(45, Math.min(140, targetAngle || 110));
    case 'shoulder':
      return Math.max(45, Math.min(160, targetAngle || 90));
    case 'hip':
      return Math.max(25, Math.min(90, targetAngle || 45));
    case 'knee':
      return Math.max(45, Math.min(100, targetAngle > 0 ? Math.max(70, targetAngle) : 70));
    default:
      return 70;
  }
}

export interface UsePoseDetectionResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  poseData: PoseData | null;
  isReady: boolean;
  error: string | null;
  repCount: number;
  resetReps: () => void;
  startCamera: () => void;
  cameraStarted: boolean;
  setTargetAngle: (angle: number) => void;
  facingMode: 'user' | 'environment';
  toggleFacingMode: () => void;
  isSimulated: boolean;
  reconnectCamera: () => void;
}

// MediaPipe pose landmark indices
const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// Skeleton connections drawn on the canvas
const POSE_CONNECTIONS: [number, number][] = [
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
  [LM.LEFT_ELBOW, LM.LEFT_WRIST],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
  [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
  [LM.LEFT_SHOULDER, LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.LEFT_KNEE],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],
  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
];

// Dynamic posture colors: red (bad), yellow (near), green (correct)
const COLOR_BAD = '#ef4444';
const COLOR_NEAR = '#eab308';
const COLOR_GOOD = '#22c55e';

function getPostureColor(score: number): string {
  if (score >= 75) return COLOR_GOOD;
  if (score >= 50) return COLOR_NEAR;
  return COLOR_BAD;
}

/**
 * Ángulo articular en 3D (incluye el eje Z de MediaPipe).
 * En 2D se subestima el rango en planos sagitales (sentadilla de perfil,
 * flexión de hombro, extensión de rodilla), justo donde se mide la repetición.
 */
function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const abx = a.x - b.x, aby = a.y - b.y, abz = (a.z ?? 0) - (b.z ?? 0);
  const cbx = c.x - b.x, cby = c.y - b.y, cbz = (c.z ?? 0) - (b.z ?? 0);
  const dot = abx * cbx + aby * cby + abz * cbz;
  const magA = Math.sqrt(abx * abx + aby * aby + abz * abz);
  const magC = Math.sqrt(cbx * cbx + cby * cby + cbz * cbz);
  if (magA === 0 || magC === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magA * magC)));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

export function usePoseDetection(options: UsePoseDetectionOptions = {}): UsePoseDetectionResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLandmarksRef = useRef<PoseLandmark[] | null>(null);

  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isSimulated, setIsSimulated] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const repPhaseRef = useRef<'up' | 'down'>('down');
  const repAngleSmoothRef = useRef<number | null>(null);
  const lastRepTsRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(90);
  const lastRepQualityRef = useRef<number | null>(null);
  const lastRepRangeRef = useRef<number>(0);
  const repTrackRef = useRef({
    phase: 'idle' as 'idle' | 'moving',
    startAngle: 0,
    min: 0,
    max: 0,
    startTs: 0,
    lastRest: 0,
  });
  const repJointRef = useRef<RepJoint>(options.repJoint ?? inferRepJoint(options.exerciseName));
  repJointRef.current = options.repJoint ?? inferRepJoint(options.exerciseName);

  const resetReps = useCallback(() => {
    setRepCount(0);
    repPhaseRef.current = 'down';
    repAngleSmoothRef.current = null;
    lastRepTsRef.current = 0;
    lastRepQualityRef.current = null;
    lastRepRangeRef.current = 0;
    repTrackRef.current = { phase: 'idle', startAngle: 0, min: 0, max: 0, startTs: 0, lastRest: 0 };
  }, []);

  const toggleFacingMode = useCallback(() => {
    setIsReady(false);
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  const startCamera = useCallback(() => {
    setCameraStarted(true);
  }, []);

  const reconnectCamera = useCallback(() => {
    setIsReady(false);
    setError(null);
    setIsSimulated(false);
    setRetryKey((k) => k + 1);
  }, []);

  const setTargetAngle = useCallback((angle: number) => {
    targetAngleRef.current = angle;
  }, []);

  useEffect(() => {
    if (!cameraStarted) return;
    let mounted = true;
    let isProcessingFrame = false;

    // Helper to draw skeleton & joints on canvas
    const drawOverlay = (
      ctx: CanvasRenderingContext2D,
      landmarks: PoseLandmark[],
      postureColor: string,
      w: number,
      h: number
    ) => {
      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Connections
      ctx.strokeStyle = postureColor;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = postureColor;
      for (const [a, b] of POSE_CONNECTIONS) {
        const pa = landmarks[a];
        const pb = landmarks[b];
        if (pa && pb && pa.visibility > 0.3 && pb.visibility > 0.3) {
          ctx.beginPath();
          ctx.moveTo(pa.x * w, pa.y * h);
          ctx.lineTo(pb.x * w, pb.y * h);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // Joints
      for (const lm of landmarks) {
        if (lm.visibility > 0.3) {
          ctx.beginPath();
          ctx.arc(lm.x * w, lm.y * h, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(lm.x * w, lm.y * h, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = postureColor;
          ctx.fill();
        }
      }
      ctx.restore();
    };

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    /**
     * Detector de repeticiones por excursión articular.
     * Funciona para flexión (el ángulo baja) y para elevación/abducción (sube):
     * registra el extremo de partida, el rango recorrido y cuenta cuando el
     * paciente vuelve cerca del punto inicial con un rango mínimo y un tiempo
     * fisiológicamente plausible. Devuelve la calidad de la repetición.
     */
    const trackAngle = (rawAngle: number, expectedRange: number) => {
      const now = performance.now();
      const prevSmooth = repAngleSmoothRef.current;
      const alpha = prevSmooth === null ? 1 : 0.42;
      const angle = prevSmooth === null ? rawAngle : prevSmooth + alpha * (rawAngle - prevSmooth);
      repAngleSmoothRef.current = angle;

      const track = repTrackRef.current;
      if (track.phase === 'idle') {
        if (track.lastRest === 0) track.lastRest = angle;
        track.lastRest += 0.06 * (angle - track.lastRest);
        const startDelta = Math.max(16, expectedRange * 0.22);
        if (Math.abs(angle - track.lastRest) > startDelta) {
          track.phase = 'moving';
          track.startAngle = track.lastRest;
          track.min = angle;
          track.max = angle;
          track.startTs = now;
        }
        return { angle, counted: false, quality: null as number | null, range: 0 };
      }

      track.min = Math.min(track.min, angle);
      track.max = Math.max(track.max, angle);
      const range = track.max - track.min;
      const elapsed = now - track.startTs;
      const minRange = Math.max(24, expectedRange * 0.5);
      const returnTolerance = Math.max(10, expectedRange * 0.18);

      if (range >= minRange && elapsed >= 900 && Math.abs(angle - track.startAngle) <= returnTolerance) {
        const rangeScore = clamp((range / expectedRange) * 100, 0, 100);
        const seconds = elapsed / 1000;
        const tempoScore = seconds < 0.8 ? 40 : seconds < 1.2 ? 65 : seconds <= 6 ? 100 : seconds <= 8 ? 75 : 55;
        const quality = Math.round(rangeScore * 0.8 + tempoScore * 0.2);
        track.phase = 'idle';
        track.startAngle = 0;
        track.min = 0;
        track.max = 0;
        track.startTs = 0;
        track.lastRest = angle;
        lastRepQualityRef.current = clamp(quality, 0, 100);
        lastRepRangeRef.current = Math.round(range);
        return { angle, counted: true, quality: lastRepQualityRef.current, range };
      }

      // Movimiento inconcluso (pérdida de encuadre, pausa larga): reiniciar.
      if (elapsed > 8000) {
        track.phase = 'idle';
        track.startAngle = 0;
        track.min = 0;
        track.max = 0;
        track.startTs = 0;
        track.lastRest = angle;
      }
      return { angle, counted: false, quality: null as number | null, range: Math.round(range) };
    };

    // Resilient simulated rehabilitation stream for no-camera or busy-camera environments
    const startSimulationMode = () => {
      if (!mounted) return;
      setIsSimulated(true);
      setError(null);

      const simCanvas = document.createElement('canvas');
      simCanvas.width = 640;
      simCanvas.height = 480;
      const sCtx = simCanvas.getContext('2d');

      const video = videoRef.current;
      if (video && typeof (simCanvas as any).captureStream === 'function') {
        try {
          const simStream = (simCanvas as any).captureStream(30);
          streamRef.current = simStream;
          video.srcObject = simStream;
          video.play().catch(() => {});
        } catch {
          // captureStream fallback
        }
      }

      let simTick = 0;
      simIntervalRef.current = setInterval(() => {
        if (!mounted) return;
        simTick += 0.05;

        // Animate medical background on simCanvas
        if (sCtx) {
          sCtx.fillStyle = '#090d16';
          sCtx.fillRect(0, 0, 640, 480);

          // Grid lines
          sCtx.strokeStyle = 'rgba(45, 212, 191, 0.06)';
          sCtx.lineWidth = 1;
          for (let x = 0; x < 640; x += 40) {
            sCtx.beginPath();
            sCtx.moveTo(x, 0);
            sCtx.lineTo(x, 480);
            sCtx.stroke();
          }
          for (let y = 0; y < 480; y += 40) {
            sCtx.beginPath();
            sCtx.moveTo(0, y);
            sCtx.lineTo(640, y);
            sCtx.stroke();
          }

          // Clinical patient avatar silhouette
          sCtx.fillStyle = 'rgba(30, 41, 59, 0.85)';
          // Head
          sCtx.beginPath();
          sCtx.arc(320, 110, 32, 0, Math.PI * 2);
          sCtx.fill();
          // Torso
          sCtx.beginPath();
          sCtx.moveTo(270, 160);
          sCtx.lineTo(370, 160);
          sCtx.lineTo(355, 300);
          sCtx.lineTo(285, 300);
          sCtx.closePath();
          sCtx.fill();
        }

        // Oscillate elbow flexion from 65° to 165° smoothly
        const angleCycle = Math.sin(simTick * 1.5);
        const rightAngle = Math.round(115 + angleCycle * 50);
        const leftAngle = 160;

        // La simulación usa el mismo detector por excursión que la cámara real.
        const simTrack = trackAngle(rightAngle, expectedRangeFor(repJointRef.current, targetAngleRef.current));
        if (simTrack.counted) setRepCount((r) => r + 1);

        // Build 33 landmarks for skeleton overlay
        const rad = (rightAngle * Math.PI) / 180;
        const armLen = 0.16;
        const rElbowX = 0.58;
        const rElbowY = 0.44;
        const rWristX = rElbowX + armLen * Math.cos(rad - 0.5);
        const rWristY = rElbowY - armLen * Math.sin(rad - 0.5);

        const simulatedLandmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
          x: 0.5,
          y: 0.5,
          z: 0,
          visibility: 0.9,
        }));

        simulatedLandmarks[LM.NOSE] = { x: 0.5, y: 0.22, z: 0, visibility: 0.99 };
        simulatedLandmarks[LM.LEFT_SHOULDER] = { x: 0.42, y: 0.33, z: 0, visibility: 0.98 };
        simulatedLandmarks[LM.RIGHT_SHOULDER] = { x: 0.58, y: 0.33, z: 0, visibility: 0.98 };
        simulatedLandmarks[LM.LEFT_ELBOW] = { x: 0.38, y: 0.46, z: 0, visibility: 0.95 };
        simulatedLandmarks[LM.RIGHT_ELBOW] = { x: rElbowX, y: rElbowY, z: 0, visibility: 0.98 };
        simulatedLandmarks[LM.LEFT_WRIST] = { x: 0.36, y: 0.60, z: 0, visibility: 0.92 };
        simulatedLandmarks[LM.RIGHT_WRIST] = { x: rWristX, y: rWristY, z: 0, visibility: 0.98 };
        simulatedLandmarks[LM.LEFT_HIP] = { x: 0.44, y: 0.62, z: 0, visibility: 0.96 };
        simulatedLandmarks[LM.RIGHT_HIP] = { x: 0.56, y: 0.62, z: 0, visibility: 0.96 };
        simulatedLandmarks[LM.LEFT_KNEE] = { x: 0.44, y: 0.78, z: 0, visibility: 0.92 };
        simulatedLandmarks[LM.RIGHT_KNEE] = { x: 0.56, y: 0.78, z: 0, visibility: 0.92 };
        simulatedLandmarks[LM.LEFT_ANKLE] = { x: 0.44, y: 0.93, z: 0, visibility: 0.88 };
        simulatedLandmarks[LM.RIGHT_ANKLE] = { x: 0.56, y: 0.93, z: 0, visibility: 0.88 };

        const postureScore = 92;
        const postureColor = getPostureColor(postureScore);

        const canvas = canvasRef.current;
        if (canvas) {
          const cCtx = canvas.getContext('2d');
          if (cCtx) {
            const w = canvas.width || 640;
            const h = canvas.height || 480;
            if (canvas.width !== 640) canvas.width = 640;
            if (canvas.height !== 480) canvas.height = 480;
            drawOverlay(cCtx, simulatedLandmarks, postureColor, w, h);
          }
        }

        setPoseData({
          landmarks: simulatedLandmarks,
          leftArmAngle: leftAngle,
          rightArmAngle: rightAngle,
          leftElbowAngle: leftAngle,
          rightElbowAngle: rightAngle,
          primaryAngle: rightAngle,
          targetAngle: targetAngleRef.current,
          lastRepQuality: lastRepQualityRef.current,
          lastRepRange: lastRepRangeRef.current,
          postureScore,
          isTracking: true,
        });
        setIsReady(true);
      }, 33);
    };

    let videoEl: HTMLVideoElement | null = null;

    const initPose = async () => {
      // 1) Ensure any previous media tracks are safely stopped and released
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((t) => t.stop());
        } catch {
          /* ignore */
        }
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      let stream: MediaStream | null = null;

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('navigator.mediaDevices.getUserMedia no soportado en este entorno');
        }

        // Try primary camera constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: false,
          });
        } catch (initialErr: any) {
          console.warn('Primary camera constraints failed, attempting fallback constraints...', initialErr);
          // Wait 200ms in case device is releasing from previous component
          await new Promise((r) => setTimeout(r, 200));
          // Try minimal video constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setIsSimulated(false);
        setError(null);

        // 2) Attach stream to <video> element
        const video = videoRef.current;
        videoEl = video;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {
            /* autoplay might require user gesture on some browsers; ignore */
          });
        }

        // 3) Initialize MediaPipe Pose if available
        if (typeof window.Pose !== 'undefined') {
          const pose = new window.Pose({
            locateFile: (file: string) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
          });

          // Complejidad adaptativa: heavy en equipos capaces, full en móvil.
          // El landmark smoothing nativo se mantiene; el EMA manual se afina abajo.
          const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
          const mem = (typeof navigator !== 'undefined' && (navigator as any).deviceMemory) || 4;
          const autoComplexity: 0 | 1 | 2 = options.modelComplexity ?? (cores >= 8 && mem >= 4 ? 2 : 1);

          pose.setOptions({
            modelComplexity: autoComplexity,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.65,
            selfieMode: facingMode === 'user',
          });

          pose.onResults((results: any) => {
            if (!mounted) return;

            const canvas = canvasRef.current;
            const vid = videoRef.current;
            if (!canvas || !vid) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const w = vid.videoWidth || 640;
            const h = vid.videoHeight || 480;
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;

            if (results.poseLandmarks) {
              let landmarks = results.poseLandmarks as PoseLandmark[];

              // Exponential smoothing for stability without lag
              if (lastLandmarksRef.current) {
                landmarks = landmarks.map((lm, i) => {
                  const prev = lastLandmarksRef.current![i];
                  if (!prev) return lm;
                  // EMA adaptativa: sigue rápido los movimientos amplios y
                  // estabiliza cuando el paciente está quieto (menos lag, menos jitter).
                  const dist = Math.sqrt((lm.x - prev.x) ** 2 + (lm.y - prev.y) ** 2);
                  const alpha = dist > 0.04 ? 0.85 : 0.55;
                  return {
                    x: prev.x + alpha * (lm.x - prev.x),
                    y: prev.y + alpha * (lm.y - prev.y),
                    z: prev.z + alpha * (lm.z - prev.z),
                    visibility: lm.visibility,
                  };
                });
              }
              lastLandmarksRef.current = landmarks;

              // Ángulo sólo si los tres puntos son visibles: evita valores
              // basura (0,0) cuando la persona sale del encuadre.
              const angleOf = (a: number, b: number, c: number): number | null => {
                const la = landmarks[a];
                const lb = landmarks[b];
                const lc = landmarks[c];
                if (!la || !lb || !lc) return null;
                if ((la.visibility ?? 0) < 0.5 || (lb.visibility ?? 0) < 0.5 || (lc.visibility ?? 0) < 0.5) {
                  return null;
                }
                return calculateAngle(la, lb, lc);
              };

              // Hombro y codo se miden por separado: antes ambos campos recibían
              // el ángulo de codo y el HUD mostraba un valor incorrecto.
              const leftShoulderAngle = angleOf(LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW);
              const rightShoulderAngle = angleOf(LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW);
              const leftElbowAngle = angleOf(LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST);
              const rightElbowAngle = angleOf(LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST);

              const visibleCount = landmarks.filter((lm) => lm.visibility > 0.5).length;
              const lSh = landmarks[LM.LEFT_SHOULDER];
              const rSh = landmarks[LM.RIGHT_SHOULDER];
              const lHip = landmarks[LM.LEFT_HIP];
              const rHip = landmarks[LM.RIGHT_HIP];
              const shoulderVisible = (lSh?.visibility ?? 0) > 0.4 || (rSh?.visibility ?? 0) > 0.4;
              const hipVisible = (lHip?.visibility ?? 0) > 0.4 || (rHip?.visibility ?? 0) > 0.4;
              const isTracking = visibleCount >= 14 && shoulderVisible && hipVisible;

              // Postura real: visibilidad + alineación de hombros/caderas y
              // verticalidad del torso (antes era solo % de landmarks visibles).
              let postureScore = Math.round(clamp((visibleCount / 33) * 100, 0, 100));
              if (
                (lSh?.visibility ?? 0) > 0.4 && (rSh?.visibility ?? 0) > 0.4 &&
                (lHip?.visibility ?? 0) > 0.4 && (rHip?.visibility ?? 0) > 0.4
              ) {
                const shoulderTilt = Math.abs(lSh.y - rSh.y);
                const hipTilt = Math.abs(lHip.y - rHip.y);
                const midShoulderX = (lSh.x + rSh.x) / 2;
                const midShoulderY = (lSh.y + rSh.y) / 2;
                const midHipX = (lHip.x + rHip.x) / 2;
                const midHipY = (lHip.y + rHip.y) / 2;
                const torsoLength = Math.hypot(midShoulderX - midHipX, midShoulderY - midHipY) || 0.1;
                const lateralLean = Math.abs(midShoulderX - midHipX) / torsoLength;
                const alignmentPenalty = Math.min(
                  55,
                  shoulderTilt * 260 + hipTilt * 260 + Math.max(0, lateralLean - 0.12) * 90
                );
                const visibilityScore = clamp((visibleCount / 33) * 100 * 1.15, 0, 100);
                postureScore = Math.round(
                  clamp(visibilityScore * 0.45 + (100 - alignmentPenalty) * 0.55, 0, 100)
                );
              }
              const postureColor = getPostureColor(postureScore);

              drawOverlay(ctx, landmarks, postureColor, canvas.width, canvas.height);

              // Articulación que cuenta el ejercicio: se elige el lado con mayor
              // visibilidad de los 3 puntos (un brazo quieto no tapa la flexión
              // del otro). El detector por excursión funciona para flexión y
              // elevación, sin umbrales fijos por articulación.
              const repJoint = repJointRef.current;
              const sideTriplets: Record<string, [number, number, number][]> = {
                knee: [
                  [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
                  [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
                ],
                shoulder: [
                  [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
                  [LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
                ],
                hip: [
                  [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE],
                  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_KNEE],
                ],
                elbow: [
                  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST],
                  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
                ],
              };
              const visibilityOf = (triplet: [number, number, number]): number => {
                const vis = triplet.map((i) => landmarks[i]?.visibility ?? 0);
                return Math.min(...vis);
              };
              const triplets = sideTriplets[repJoint] ?? sideTriplets.elbow;
              const bestTriplet = triplets.reduce((best, cur) =>
                visibilityOf(cur) > visibilityOf(best) ? cur : best
              );
              const rawAngle = angleOf(bestTriplet[0], bestTriplet[1], bestTriplet[2]);
              const sideVisible = visibilityOf(bestTriplet) >= 0.5;

              let primaryAngle = 0;
              if (isTracking && rawAngle !== null && sideVisible) {
                const tracked = trackAngle(rawAngle, expectedRangeFor(repJoint, targetAngleRef.current));
                primaryAngle = tracked.angle;
                repPhaseRef.current = repTrackRef.current.phase === 'moving' ? 'up' : 'down';
                if (tracked.counted) {
                  lastRepTsRef.current = performance.now();
                  setRepCount((r) => r + 1);
                }
              }

              setPoseData({
                landmarks,
                leftArmAngle: leftShoulderAngle ?? 0,
                rightArmAngle: rightShoulderAngle ?? 0,
                leftElbowAngle: leftElbowAngle ?? 0,
                rightElbowAngle: rightElbowAngle ?? 0,
                primaryAngle: Math.round(primaryAngle),
                targetAngle: targetAngleRef.current,
                lastRepQuality: lastRepQualityRef.current,
                lastRepRange: lastRepRangeRef.current,
                postureScore,
                isTracking,
              });
            } else {
              lastLandmarksRef.current = null;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              setPoseData((prev) => (prev ? { ...prev, isTracking: false } : null));
            }
          });

          poseRef.current = pose;
        }

        // 4) Direct frame loop (without window.Camera) using requestVideoFrameCallback or requestAnimationFrame
        // This avoids any second getUserMedia call that could cause NotReadableError!
        const maxFps = Math.max(10, options.maxFps ?? 30);
        const minFrameMs = 1000 / maxFps;
        let lastFrameTs = 0;

        const onFrame = async () => {
          if (!mounted) return;
          const vid = videoRef.current;
          const now = performance.now();
          if (vid && vid.readyState >= 2 && !vid.paused && poseRef.current && !isProcessingFrame && now - lastFrameTs >= minFrameMs) {
            lastFrameTs = now;
            isProcessingFrame = true;
            try {
              await poseRef.current.send({ image: vid });
            } catch {
              /* ignore transient frame errors */
            } finally {
              isProcessingFrame = false;
            }
          }

          if (mounted) {
            if (vid && 'requestVideoFrameCallback' in vid) {
              (vid as any).requestVideoFrameCallback(onFrame);
            } else {
              rafRef.current = requestAnimationFrame(onFrame);
            }
          }
        };

        if (video) {
          if ('requestVideoFrameCallback' in video) {
            (video as any).requestVideoFrameCallback(onFrame);
          } else {
            rafRef.current = requestAnimationFrame(onFrame);
          }
        }

        setIsReady(true);
      } catch (e: any) {
        if (!mounted) return;
        const msg = String(e?.message || e?.name || e || '');
        console.warn('Camera feed acquisition notice:', msg);

        // If the camera is busy, locked, or unavailable (NotReadableError, NotFoundError, or headless sandbox)
        // gracefully engage simulation mode so the user is never blocked or crashed!
        if (
          msg.includes('NotReadable') ||
          msg.includes('Could not start video source') ||
          msg.includes('NotFound') ||
          msg.includes('device') ||
          msg.includes('not found')
        ) {
          console.info('Cámara física ocupada o no disponible. Activando simulación biomecánica interactiva.');
          startSimulationMode();
          return;
        }

        if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
          setError('Permiso de cámara denegado. Permite el acceso a la cámara o usa la simulación.');
        } else {
          setError('No se pudo inicializar la cámara: ' + msg);
        }
        setIsReady(true);
      }
    };

    initPose();

    return () => {
      mounted = false;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (simIntervalRef.current != null) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      if (poseRef.current) {
        try {
          poseRef.current.close();
        } catch {
          /* ignore */
        }
        poseRef.current = null;
      }
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((t) => t.stop());
        } catch {
          /* ignore */
        }
        streamRef.current = null;
      }
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [cameraStarted, facingMode, retryKey, options.maxFps, options.modelComplexity]);

  return {
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
  };
}
