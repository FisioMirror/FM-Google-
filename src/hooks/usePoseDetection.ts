import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseTrackingRule, MovementPattern } from '../data/exercisePresets';

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

export type TrafficLightState = 'red' | 'yellow' | 'green';
export type RepPhase = 'neutral' | 'concentric' | 'hold' | 'eccentric';

export interface PoseData {
  landmarks: PoseLandmark[];
  /** Ángulo de hombro (cadera-hombro-codo) de cada lado. */
  leftArmAngle: number;
  rightArmAngle: number;
  /** Ángulo de codo (hombro-codo-muñeca) de cada lado. */
  leftElbowAngle: number;
  rightElbowAngle: number;
  /** Ángulo de rodilla (cadera-rodilla-tobillo) de cada lado. */
  leftKneeAngle?: number;
  rightKneeAngle?: number;
  /** Ángulo de cadera (hombro-cadera-rodilla) de cada lado. */
  leftHipAngle?: number;
  rightHipAngle?: number;
  /** Inclinación de hombros en grados (desbalance horizontal) */
  shoulderTiltDeg?: number;
  /** Inclinación pélvica en grados */
  hipTiltDeg?: number;
  /** Inclinación lateral de columna en grados */
  lateralLeanDeg?: number;
  /** Alerta de compensación postural detectada en tiempo real */
  compensationIssue?: string | null;
  /** Código de compensación i18n-friendly para feedback de voz/HUD */
  compensationCode?: 'shoulder_tilt' | 'hip_tilt' | 'lateral_lean' | null;
  /** Índice del landmark de la articulación objetivo monitorizada */
  trackedJointIndex?: number;
  /** Lado anatómico actualmente monitorizado */
  trackedSide?: 'left' | 'right';
  /** Ángulo clínico de la articulación que cuenta repeticiones para el ejercicio actual. */
  primaryAngle: number;
  /** Objetivo clínico configurado para esa articulación. */
  targetAngle: number;
  /** Calidad (0-100) de la última repetición completada. */
  lastRepQuality: number | null;
  /** Rango articular recorrido en la última repetición, en grados. */
  lastRepRange: number;
  /** Estado del semáforo visual de postura/captura */
  trafficLight: TrafficLightState;
  /** Fase actual del movimiento dentro de la repetición */
  repPhase: RepPhase;
  /** Milisegundos restantes de mantenimiento isométrico en pico articular */
  holdRemainingMs: number;
  /** Porcentaje de ROM alcanzado hacia el objetivo (0-100) */
  romPercent: number;
  /** Diferencia angular absoluta respecto al ángulo objetivo */
  angleErrorDeg: number;
  postureScore: number;
  isTracking: boolean;
  /** Número real de landmarks visibles (>0.45) en el cuadro actual */
  visibleLandmarksCount?: number;
  /** Confianza media real (0-100) de los landmarks clave detectados */
  confidencePercent?: number;
}

export type RepJoint = 'elbow' | 'knee' | 'shoulder' | 'hip' | 'ankle' | 'cervical' | 'scapula';

export interface UsePoseDetectionOptions {
  /** Joint used to count repetitions. Defaults to inferred from articulacion/exerciseName. */
  repJoint?: RepJoint;
  /** Exercise name used to infer the rep joint when repJoint is omitted. */
  exerciseName?: string;
  /** Articulación clínica explícita del preset/rutina */
  articulacion?: string;
  /** Lado prescrito ('bilateral' | 'derecho' | 'izquierdo') */
  lado?: 'bilateral' | 'derecho' | 'izquierdo' | string;
  /** Si es false, pausa el conteo de repeticiones manteniendo cámara y esqueleto visibles */
  enabled?: boolean;
  /** Duración de retención isométrica recomendada en segundos */
  holdDurationSec?: number;
  /** Ángulo neutro inicial según preset clínico */
  neutralAngle?: number;
  /** Ángulo objetivo pico según preset clínico */
  targetAngle?: number;
  /** Si el video/canvas está en modo espejo CSS (-scale-x-100) */
  isMirrored?: boolean;
  /** Patrón biomecánico específico del ejercicio (p.ej. rotación externa, flexión cervical, equilibrio) */
  movementPattern?: MovementPattern;
  /** Reglas biomecánicas resueltas específicamente para el ejercicio actual */
  trackingRule?: Partial<ExerciseTrackingRule>;
  /**
   * Complejidad del modelo MediaPipe: 0 lite, 1 full, 2 heavy.
   * Si se omite se elige según el hardware (2 en equipos capaces, 1 en móvil).
   */
  modelComplexity?: 0 | 1 | 2;
  /** Techo de análisis por segundo (ahorra batería y reduce latencia percibida). */
  maxFps?: number;
}

function inferRepJoint(exerciseName?: string, articulacion?: string): RepJoint {
  const art = (articulacion || '').toLowerCase().trim();
  if (art.includes('tobillo') || art.includes('ankle')) return 'ankle';
  if (art.includes('cervical') || art.includes('cuello')) return 'cervical';
  if (art.includes('escapul') || art.includes('escápul')) return 'scapula';
  if (art.includes('rodilla') || art.includes('knee')) return 'knee';
  if (art.includes('hombro') || art.includes('shoulder')) return 'shoulder';
  if (art.includes('cadera') || art.includes('hip')) return 'hip';
  if (art.includes('codo') || art.includes('elbow')) return 'elbow';

  const name = (exerciseName || '').toLowerCase();
  if (/(tobillo|ankle|dorsiflexi|plantar|pie|foot)/.test(name)) return 'ankle';
  if (/(cervical|cuello|neck|menton|mentón|chin|trapecio)/.test(name)) return 'cervical';
  if (/(escapul|escápul|scapul|postural|retracci|romboid)/.test(name)) return 'scapula';
  if (/(sentadilla|squat|rodilla|knee|prensa|leg press|zancada|lunge)/.test(name)) return 'knee';
  if (/(codo|elbow|bicep|bícep|tricep|trícep|curl)/.test(name)) return 'elbow';
  if (/(hombro|shoulder|elevaci|abducci|press militar|overhead|rotación externa|rotacion externa)/.test(name)) return 'shoulder';
  if (/(cadera|hip|puente|bridge|gluteo|glúteo|pelvis|equilibrio)/.test(name)) return 'hip';
  return 'shoulder';
}

/**
 * Rango articular esperado (en grados) para una repetición completa.
 */
function expectedRangeFor(joint: RepJoint, targetAngle: number, neutralAngle?: number): number {
  if (neutralAngle != null && Number.isFinite(neutralAngle) && Number.isFinite(targetAngle)) {
    const delta = Math.abs(targetAngle - neutralAngle);
    if (delta >= 20) return delta;
  }
  switch (joint) {
    case 'elbow':
      return Math.max(45, Math.min(140, targetAngle || 120));
    case 'shoulder':
      return Math.max(45, Math.min(160, targetAngle || 90));
    case 'hip':
      return Math.max(25, Math.min(90, targetAngle || 45));
    case 'knee':
      return Math.max(45, Math.min(100, targetAngle > 0 ? Math.max(60, targetAngle) : 75));
    case 'ankle':
      return Math.max(18, Math.min(60, targetAngle || 25));
    case 'cervical':
      return Math.max(18, Math.min(50, targetAngle || 30));
    case 'scapula':
      return Math.max(20, Math.min(60, targetAngle || 40));
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
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
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
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
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

// Dynamic posture semáforo colors: red (erroneous/poor capture), yellow (medium alignment), green (correct)
const COLOR_BAD = '#ef4444';
const COLOR_NEAR = '#eab308';
const COLOR_GOOD = '#22c55e';

function trafficLightToColor(tl: TrafficLightState): string {
  if (tl === 'green') return COLOR_GOOD;
  if (tl === 'yellow') return COLOR_NEAR;
  return COLOR_BAD;
}

/**
 * Evalúa el semáforo visual de postura y captura biomecánica en 3 niveles claros:
 * - Rojo ('red'): cuerpo o articulación fuera de encuadre, pocos landmarks o compensación severa (< 55)
 * - Amarillo ('yellow'): captura parcial o desalineación leve/moderada (55..77 o compensación moderada)
 * - Verde ('green'): captura nítida, buena alineación postural y ejecución segura (>= 78 sin compensación)
 */
function evaluateTrafficLight(
  isTracking: boolean,
  sideVisible: boolean,
  minSideVisibility: number,
  postureScore: number,
  compensationCode: PoseData['compensationCode'],
  severeCompensation: boolean
): TrafficLightState {
  if (!isTracking || !sideVisible || postureScore < 55 || severeCompensation) return 'red';
  if (compensationCode !== null || postureScore < 78 || minSideVisibility < 0.56) return 'yellow';
  return 'green';
}

/** Convierte ángulo interno geométrico de 3 puntos a convención goniométrica clínica */
function toClinicalAngle(joint: RepJoint, innerAngle: number): number {
  switch (joint) {
    case 'elbow':
    case 'knee':
    case 'hip':
      return Math.max(0, Math.min(175, Math.round(180 - innerAngle)));
    case 'ankle':
      return Math.max(0, Math.min(70, Math.round(Math.abs(95 - innerAngle))));
    case 'cervical':
      return Math.max(0, Math.min(65, Math.round(Math.abs(90 - innerAngle))));
    case 'shoulder':
    case 'scapula':
    default:
      return Math.max(0, Math.min(180, Math.round(innerAngle)));
  }
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

  const repPhaseRef = useRef<RepPhase>('neutral');
  const repAngleSmoothRef = useRef<number | null>(null);
  const lastRepTsRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(options.targetAngle ?? 90);
  const neutralAngleRef = useRef<number | undefined>(options.neutralAngle);
  const enabledRef = useRef<boolean>(options.enabled ?? true);
  const ladoRef = useRef<string | undefined>(options.lado);
  const isMirroredRef = useRef<boolean>(options.isMirrored ?? true);
  const holdDurationRef = useRef<number>(Math.max(1, options.holdDurationSec ?? 2));
  const movementPatternRef = useRef<MovementPattern | undefined>(options.movementPattern);
  const trackingRuleRef = useRef<Partial<ExerciseTrackingRule> | undefined>(options.trackingRule);
  const lastRepQualityRef = useRef<number | null>(null);
  const lastRepRangeRef = useRef<number>(0);

  if (options.targetAngle !== undefined && Number.isFinite(options.targetAngle)) {
    targetAngleRef.current = options.targetAngle;
  }
  neutralAngleRef.current = options.neutralAngle;
  enabledRef.current = options.enabled ?? true;
  ladoRef.current = options.lado;
  isMirroredRef.current = options.isMirrored ?? true;
  holdDurationRef.current = Math.max(1, options.holdDurationSec ?? 2);
  movementPatternRef.current = options.movementPattern;
  trackingRuleRef.current = options.trackingRule;

  const repTrackRef = useRef({
    phase: 'neutral' as RepPhase,
    startAngle: 0,
    peakExcursion: 0,
    min: 0,
    max: 0,
    startTs: 0,
    holdEnterTs: 0,
    holdCompleted: false,
    lastRest: 0,
    restInitialized: false,
    neutralFrames: 0,
    baselineScale: 0,
    startScale: 0,
    prevAngle: 0,
  });
  const repJointRef = useRef<RepJoint>(options.repJoint ?? inferRepJoint(options.exerciseName, options.articulacion));
  repJointRef.current = options.repJoint ?? inferRepJoint(options.exerciseName, options.articulacion);

  const resetReps = useCallback(() => {
    setRepCount(0);
    repPhaseRef.current = 'neutral';
    repAngleSmoothRef.current = null;
    lastRepTsRef.current = 0;
    lastRepQualityRef.current = null;
    lastRepRangeRef.current = 0;
    repTrackRef.current = {
      phase: 'neutral',
      startAngle: 0,
      peakExcursion: 0,
      min: 0,
      max: 0,
      startTs: 0,
      holdEnterTs: 0,
      holdCompleted: false,
      lastRest: 0,
      restInitialized: false,
      neutralFrames: 0,
      baselineScale: 0,
      startScale: 0,
      prevAngle: 0,
    };
  }, []);

  // Reset tracking cycle cleanly if exercise preset or movement pattern changes
  const exerciseSig = `${options.exerciseName ?? ''}|${options.articulacion ?? ''}|${options.movementPattern ?? ''}|${options.targetAngle ?? ''}|${options.neutralAngle ?? ''}`;
  const prevExerciseSigRef = useRef<string>(exerciseSig);
  useEffect(() => {
    if (prevExerciseSigRef.current !== exerciseSig) {
      prevExerciseSigRef.current = exerciseSig;
      repPhaseRef.current = 'neutral';
      repAngleSmoothRef.current = null;
      repTrackRef.current = {
        phase: 'neutral',
        startAngle: 0,
        peakExcursion: 0,
        min: 0,
        max: 0,
        startTs: 0,
        holdEnterTs: 0,
        holdCompleted: false,
        lastRest: 0,
        restInitialized: false,
        neutralFrames: 0,
        baselineScale: 0,
        startScale: 0,
        prevAngle: 0,
      };
    }
  }, [exerciseSig]);

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

    // Helper to draw skeleton & joints on canvas with clinical high contrast and sharpness
    const drawOverlay = (
      ctx: CanvasRenderingContext2D,
      landmarks: PoseLandmark[],
      postureColor: string,
      w: number,
      h: number,
      activeJointIdx?: number,
      primaryAngle?: number
    ) => {
      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // 1) Vertical plumb-line reference from neck to pelvis (faint clinical spinal guideline)
      const lSh = landmarks[LM.LEFT_SHOULDER];
      const rSh = landmarks[LM.RIGHT_SHOULDER];
      const lHip = landmarks[LM.LEFT_HIP];
      const rHip = landmarks[LM.RIGHT_HIP];
      if (lSh && rSh && lHip && rHip && (lSh.visibility ?? 0) > 0.4 && (rSh.visibility ?? 0) > 0.4) {
        const neckX = ((lSh.x + rSh.x) / 2) * w;
        const neckY = ((lSh.y + rSh.y) / 2) * h;
        const pelvisX = ((lHip.x + rHip.x) / 2) * w;
        const pelvisY = ((lHip.y + rHip.y) / 2) * h;

        ctx.save();
        // Dark contrast backline
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY - 15);
        ctx.lineTo(pelvisX, pelvisY + 25);
        ctx.stroke();

        // High contrast dashed line following traffic-light tone
        ctx.strokeStyle = postureColor === COLOR_GOOD ? 'rgba(34, 197, 94, 0.72)' : postureColor === COLOR_NEAR ? 'rgba(234, 179, 8, 0.72)' : 'rgba(239, 68, 68, 0.72)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(neckX, neckY - 15);
        ctx.lineTo(pelvisX, pelvisY + 25);
        ctx.stroke();
        ctx.restore();
      }

      // 2) Subtle dark contrast backing (prevents lines from disappearing over white clothing)
      ctx.strokeStyle = 'rgba(0, 21, 20, 0.58)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const [a, b] of POSE_CONNECTIONS) {
        const pa = landmarks[a];
        const pb = landmarks[b];
        if (pa && pb && (pa.visibility ?? 0) > 0.35 && (pb.visibility ?? 0) > 0.35) {
          ctx.beginPath();
          ctx.moveTo(pa.x * w, pa.y * h);
          ctx.lineTo(pb.x * w, pb.y * h);
          ctx.stroke();
        }
      }

      // 3) Semáforo Visual Skeleton Lines (Red / Yellow / Green)
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 10;
      for (const [a, b] of POSE_CONNECTIONS) {
        const pa = landmarks[a];
        const pb = landmarks[b];
        if (pa && pb && (pa.visibility ?? 0) > 0.35 && (pb.visibility ?? 0) > 0.35) {
          const isActiveBone = activeJointIdx != null && (a === activeJointIdx || b === activeJointIdx);
          ctx.strokeStyle = postureColor;
          ctx.shadowColor = postureColor;
          ctx.lineWidth = isActiveBone ? 4.4 : 3.2;
          ctx.beginPath();
          ctx.moveTo(pa.x * w, pa.y * h);
          ctx.lineTo(pb.x * w, pb.y * h);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // 4) Luminous Medical Joint Nodes tinted with semáforo state
      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        if (!lm || (lm.visibility ?? 0) <= 0.35) continue;
        const x = lm.x * w;
        const y = lm.y * h;
        const isTarget = activeJointIdx === i;

        // Joint Node Body
        ctx.beginPath();
        ctx.arc(x, y, isTarget ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = postureColor;
        ctx.fill();

        // Thin high-contrast rim
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.stroke();

        // Crisp inner white specular core
        ctx.beginPath();
        ctx.arc(x, y, isTarget ? 3.2 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // 5) Pass 4: Active Tracked Joint HUD Target Reticle & Floating Angle Readout
      if (activeJointIdx != null && landmarks[activeJointIdx] && (landmarks[activeJointIdx].visibility ?? 0) > 0.4) {
        const targetLm = landmarks[activeJointIdx];
        const jx = targetLm.x * w;
        const jy = targetLm.y * h;

        // Pulsating reticle circle in semáforo color
        const pulse = (Math.sin(performance.now() / 200) + 1) * 3;
        ctx.strokeStyle = postureColor;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(jx, jy, 16 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Corner brackets / tick marks for clinical target lock
        const bracketR = 19 + pulse;
        for (let a = 0; a < 4; a++) {
          const theta = (Math.PI / 2) * a + Math.PI / 4;
          const bx = jx + Math.cos(theta) * bracketR;
          const by = jy + Math.sin(theta) * bracketR;
          ctx.beginPath();
          ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = postureColor;
          ctx.fill();
        }

        // Floating Angle Readout Badge (counter-mirrored only when mirrored so text stays upright)
        if (primaryAngle != null && Number.isFinite(primaryAngle)) {
          ctx.save();
          const badgeOffsetX = isMirroredRef.current ? 26 : -26;
          const badgeOffsetY = -24;
          ctx.translate(jx + badgeOffsetX, jy + badgeOffsetY);
          if (isMirroredRef.current) {
            ctx.scale(-1, 1);
          }

          const angleText = `${Math.round(primaryAngle)}°`;
          ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
          const textMetrics = ctx.measureText(angleText);
          const padX = 8;
          const bW = Math.max(40, textMetrics.width + padX * 2);
          const bH = 22;

          ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
          ctx.strokeStyle = postureColor;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(-bW / 2, -bH / 2, bW, bH, 6);
          } else {
            ctx.rect(-bW / 2, -bH / 2, bW, bH);
          }
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(angleText, 0, 1);

          ctx.restore();
        }
      }

      ctx.restore();
    };

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    /**
     * Detector biomecánico estricto por excursión completa en dirección al objetivo,
     * reglas particulares de cada ejercicio (rango, zona muerta, duración mínima y sostén isométrico),
     * estabilidad de escala y retorno controlado.
     */
    const trackAngle = (
      clinicalAngle: number,
      expectedRange: number,
      postureScore: number,
      allowCount: boolean,
      scaleMetric = 0.25,
      jointVis = 0.9
    ) => {
      const now = performance.now();
      const prevSmooth = repAngleSmoothRef.current;
      const alpha = prevSmooth === null ? 1 : 0.38;
      const angle = prevSmooth === null ? clinicalAngle : prevSmooth + alpha * (clinicalAngle - prevSmooth);
      repAngleSmoothRef.current = angle;

      const track = repTrackRef.current;
      const rule = trackingRuleRef.current;
      const holdMsTarget = holdDurationRef.current * 1000;
      const targetAngle = targetAngleRef.current;
      const neutralCfg = neutralAngleRef.current;
      const usesDeltaFromRest = Boolean(rule?.usesDeltaFromRest);
      const isDescending = !usesDeltaFromRest && neutralCfg != null && targetAngle < neutralCfg;

      const minExcursionRatio = rule?.minExcursionRatio ?? 0.72;
      const startThresholdRatio = rule?.startThresholdRatio ?? 0.24;
      const returnToleranceRatio = rule?.returnToleranceRatio ?? 0.24;
      const minDurationMs = rule?.minDurationMs ?? 1200;
      const requiresHoldCompletion = Boolean(rule?.requiresHoldCompletion);

      const resetToNeutral = (keepRest = false) => {
        track.phase = 'neutral';
        track.startAngle = 0;
        track.peakExcursion = 0;
        track.min = 0;
        track.max = 0;
        track.startTs = 0;
        track.holdEnterTs = 0;
        track.holdCompleted = false;
        track.neutralFrames = 0;
        track.prevAngle = angle;
        if (!keepRest) {
          track.lastRest = angle;
          track.restInitialized = true;
          track.baselineScale = scaleMetric;
        }
      };

      if (!allowCount) {
        const displayAngle = usesDeltaFromRest ? Math.max(0, Math.round(angle - track.lastRest)) : angle;
        return {
          angle: displayAngle,
          counted: false,
          quality: null as number | null,
          range: 0,
          phase: track.phase,
          holdRemainingMs: 0,
          romPercent: 0,
        };
      }

      if (track.phase === 'neutral') {
        if (!track.restInitialized) {
          track.lastRest = angle;
          track.restInitialized = true;
          track.baselineScale = scaleMetric;
          track.neutralFrames = 1;
          track.prevAngle = angle;
          return {
            angle: usesDeltaFromRest ? 0 : angle,
            counted: false,
            quality: null as number | null,
            range: 0,
            phase: 'neutral' as RepPhase,
            holdRemainingMs: 0,
            romPercent: 0,
          };
        }

        const scaleDelta = Math.abs(scaleMetric - track.baselineScale) / Math.max(0.05, track.baselineScale);
        if (scaleDelta > 0.28 || jointVis < 0.5) {
          track.baselineScale += 0.25 * (scaleMetric - track.baselineScale);
          track.lastRest += 0.25 * (angle - track.lastRest);
          track.neutralFrames = 0;
          track.prevAngle = angle;
          return {
            angle: usesDeltaFromRest ? 0 : angle,
            counted: false,
            quality: null as number | null,
            range: 0,
            phase: 'neutral' as RepPhase,
            holdRemainingMs: 0,
            romPercent: 0,
          };
        }

        track.neutralFrames += 1;
        const restDeltaImmediate = Math.abs(angle - track.lastRest);
        if (restDeltaImmediate < 10) {
          track.lastRest += 0.10 * (angle - track.lastRest);
          track.baselineScale += 0.10 * (scaleMetric - track.baselineScale);
        }

        const restAnchor = isDescending
          ? Math.max(track.lastRest, neutralCfg ?? track.lastRest)
          : track.lastRest;

        const targetSpan = usesDeltaFromRest
          ? Math.max(12, targetAngle || expectedRange)
          : isDescending
          ? Math.max(15, restAnchor - targetAngle)
          : targetAngle > restAnchor + 10
          ? Math.max(15, targetAngle - restAnchor)
          : Math.max(15, expectedRange);

        const signedExcursion = usesDeltaFromRest
          ? Math.max(0, angle - restAnchor)
          : isDescending
          ? restAnchor - angle
          : angle - restAnchor;
        const deadzone = rule?.restDeadzoneDeg ?? (targetSpan <= 35 ? 4 : 7);
        const effectiveExcursion = signedExcursion <= deadzone ? 0 : signedExcursion;
        const romPercent = clamp(Math.round((effectiveExcursion / Math.max(1, targetSpan)) * 100), 0, 100);

        const startThreshold = Math.max(6, targetSpan * startThresholdRatio);
        if (track.neutralFrames >= 6 && jointVis >= 0.50 && signedExcursion > startThreshold) {
          track.phase = 'concentric';
          track.startAngle = restAnchor;
          track.peakExcursion = signedExcursion;
          track.min = angle;
          track.max = angle;
          track.startTs = now;
          track.holdEnterTs = 0;
          track.holdCompleted = false;
          track.startScale = track.baselineScale || scaleMetric;
        }
        track.prevAngle = angle;
        const displayAngle = usesDeltaFromRest ? Math.max(0, Math.round(angle - restAnchor)) : angle;
        return {
          angle: displayAngle,
          counted: false,
          quality: null as number | null,
          range: 0,
          phase: track.phase,
          holdRemainingMs: 0,
          romPercent,
        };
      }

      const activeScaleDrift = Math.abs(scaleMetric - track.startScale) / Math.max(0.05, track.startScale);
      const singleFrameJump = Math.abs(angle - track.prevAngle);
      track.prevAngle = angle;

      if (activeScaleDrift > 0.35 || singleFrameJump > 48 || jointVis < 0.42) {
        resetToNeutral(false);
        return {
          angle: usesDeltaFromRest ? 0 : angle,
          counted: false,
          quality: null as number | null,
          range: 0,
          phase: 'neutral' as RepPhase,
          holdRemainingMs: 0,
          romPercent: 0,
        };
      }

      track.min = Math.min(track.min, angle);
      track.max = Math.max(track.max, angle);
      const elapsed = now - track.startTs;

      const targetSpan = usesDeltaFromRest
        ? Math.max(12, targetAngle || expectedRange)
        : isDescending
        ? Math.max(15, track.startAngle - targetAngle)
        : targetAngle > track.startAngle + 10
        ? Math.max(15, targetAngle - track.startAngle)
        : Math.max(15, expectedRange);

      const signedExcursion = usesDeltaFromRest
        ? Math.max(0, angle - track.startAngle)
        : isDescending
        ? track.startAngle - angle
        : angle - track.startAngle;
      const curExcursion = Math.max(0, signedExcursion);
      track.peakExcursion = Math.max(track.peakExcursion, curExcursion);

      const romPercent = clamp(Math.round((curExcursion / Math.max(1, targetSpan)) * 100), 0, 100);
      const minRequiredExcursion = Math.max(11, targetSpan * minExcursionRatio);
      const returnTolerance = Math.max(5, targetSpan * returnToleranceRatio);

      let holdRemainingMs = 0;
      const holdEntryPct = requiresHoldCompletion ? 68 : 78;
      if (romPercent >= holdEntryPct) {
        if (track.phase === 'concentric') {
          track.phase = 'hold';
          track.holdEnterTs = now;
        }
        if (track.phase === 'hold') {
          const heldFor = now - track.holdEnterTs;
          holdRemainingMs = Math.max(0, Math.round(holdMsTarget - heldFor));
          if (heldFor >= holdMsTarget * 0.72) {
            track.holdCompleted = true;
          }
        }
      } else if (track.phase === 'hold' && romPercent < holdEntryPct - 14) {
        track.phase = 'eccentric';
      } else if (
        track.phase === 'concentric' &&
        track.peakExcursion >= minRequiredExcursion &&
        curExcursion < track.peakExcursion * 0.70
      ) {
        track.phase = 'eccentric';
      }

      const holdSatisfied = !requiresHoldCompletion || track.holdCompleted;

      if (
        track.peakExcursion >= minRequiredExcursion &&
        holdSatisfied &&
        elapsed >= minDurationMs &&
        curExcursion <= returnTolerance &&
        now - lastRepTsRef.current >= 550
      ) {
        const rangeScore = clamp((track.peakExcursion / Math.max(1, targetSpan)) * 100, 0, 100);
        const seconds = elapsed / 1000;
        const tempoScore = seconds < 0.9 ? 55 : seconds < 1.2 ? 75 : seconds <= 12.0 ? 100 : 80;
        const heldFraction =
          track.holdEnterTs > 0
            ? clamp((now - track.holdEnterTs) / Math.max(500, holdMsTarget * 0.5), 0.5, 1)
            : 0.7;
        const quality = Math.round(rangeScore * 0.62 + tempoScore * 0.2 + postureScore * 0.1 + heldFraction * 8);
        const finalRange = Math.round(track.peakExcursion);

        resetToNeutral(false);
        lastRepQualityRef.current = clamp(quality, 0, 100);
        lastRepRangeRef.current = finalRange;
        return {
          angle: usesDeltaFromRest ? 0 : angle,
          counted: true,
          quality: lastRepQualityRef.current,
          range: finalRange,
          phase: 'neutral' as RepPhase,
          holdRemainingMs: 0,
          romPercent: 0,
        };
      }

      const maxCycleMs = Math.max(14000, holdMsTarget + 9000);
      if (elapsed > maxCycleMs) {
        resetToNeutral(false);
      }

      const displayAngle = usesDeltaFromRest ? Math.max(0, Math.round(angle - track.startAngle)) : angle;
      return {
        angle: displayAngle,
        counted: false,
        quality: null as number | null,
        range: Math.round(track.peakExcursion),
        phase: track.phase,
        holdRemainingMs,
        romPercent,
      };
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

        // Oscilar el ángulo simulado entre el neutro y objetivo propios del ejercicio activo
        const simNeutral = neutralAngleRef.current ?? 0;
        const simTarget = targetAngleRef.current ?? 90;
        const angleCycle = (Math.sin(simTick * 1.4) + 1) / 2; // 0 to 1
        const clinicalSimAngle = Math.round(simNeutral + angleCycle * (simTarget - simNeutral));
        const innerSimAngle = Math.max(45, 180 - Math.abs(clinicalSimAngle));
        const leftAngle = Math.round(simNeutral);

        const simPostureScore = 92;
        const simTrafficLight: TrafficLightState = 'green';
        const simColor = trafficLightToColor(simTrafficLight);

        const simExpRange = expectedRangeFor(repJointRef.current, targetAngleRef.current, neutralAngleRef.current);
        const simTrack = trackAngle(clinicalSimAngle, simExpRange, simPostureScore, enabledRef.current);
        if (simTrack.counted) setRepCount((r) => r + 1);
        repPhaseRef.current = simTrack.phase;

        // Build 33 landmarks for skeleton overlay
        const rad = (innerSimAngle * Math.PI) / 180;
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

        const canvas = canvasRef.current;
        if (canvas) {
          const cCtx = canvas.getContext('2d');
          if (cCtx) {
            const w = canvas.width || 640;
            const h = canvas.height || 480;
            if (canvas.width !== 640) canvas.width = 640;
            if (canvas.height !== 480) canvas.height = 480;
            drawOverlay(cCtx, simulatedLandmarks, simColor, w, h, LM.RIGHT_ELBOW, clinicalSimAngle);
          }
        }

        setPoseData({
          landmarks: simulatedLandmarks,
          leftArmAngle: leftAngle,
          rightArmAngle: clinicalSimAngle,
          leftElbowAngle: leftAngle,
          rightElbowAngle: clinicalSimAngle,
          leftKneeAngle: 175,
          rightKneeAngle: 175,
          leftHipAngle: 175,
          rightHipAngle: 175,
          shoulderTiltDeg: 0,
          hipTiltDeg: 0,
          lateralLeanDeg: 0,
          compensationIssue: null,
          compensationCode: null,
          trackedJointIndex: LM.RIGHT_ELBOW,
          trackedSide: 'right',
          primaryAngle: Math.round(simTrack.angle),
          targetAngle: targetAngleRef.current,
          lastRepQuality: lastRepQualityRef.current,
          lastRepRange: lastRepRangeRef.current,
          trafficLight: simTrafficLight,
          repPhase: simTrack.phase,
          holdRemainingMs: simTrack.holdRemainingMs,
          romPercent: simTrack.romPercent,
          angleErrorDeg: Math.abs(Math.round(simTrack.angle - targetAngleRef.current)),
          postureScore: simPostureScore,
          isTracking: true,
          visibleLandmarksCount: 33,
          confidencePercent: 95,
        });
        setIsReady(true);
      }, 33);
    };

    let videoEl: HTMLVideoElement | null = null;
    const syncCanvasToVideo = () => {
      const vid = videoRef.current;
      const cvs = canvasRef.current;
      if (!vid || !cvs) return;
      const vw = vid.videoWidth;
      const vh = vid.videoHeight;
      if (vw > 0 && vh > 0 && (cvs.width !== vw || cvs.height !== vh)) {
        cvs.width = vw;
        cvs.height = vh;
      }
    };

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

        // 2) Attach stream to <video> element and sync canvas dimensions across orientation changes
        const video = videoRef.current;
        videoEl = video;
        if (video) {
          video.addEventListener('loadedmetadata', syncCanvasToVideo);
          video.addEventListener('resize', syncCanvasToVideo);
          video.srcObject = stream;
          await video.play().catch(() => {
            /* autoplay might require user gesture on some browsers; ignore */
          });
          syncCanvasToVideo();
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
            // CRÍTICO: selfieMode: false garantiza que las coordenadas del esqueleto no sufran
            // una doble inversión horizontal cuando el <video> y <canvas> ya tienen la clase CSS -scale-x-100.
            // De este modo el esqueleto se mueve en el mismo exacto sentido que la persona pixel por pixel.
            selfieMode: false,
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

              // Filtro EMA adaptativo dual: elimina temblores en reposo y responde sin lag a movimientos rápidos
              if (lastLandmarksRef.current) {
                landmarks = landmarks.map((lm, i) => {
                  const prev = lastLandmarksRef.current![i];
                  if (!prev) return lm;
                  const dist = Math.sqrt((lm.x - prev.x) ** 2 + (lm.y - prev.y) ** 2);
                  const alpha = dist > 0.04 ? 0.92 : dist > 0.015 ? 0.70 : 0.40;
                  return {
                    x: prev.x + alpha * (lm.x - prev.x),
                    y: prev.y + alpha * (lm.y - prev.y),
                    z: prev.z + alpha * (lm.z - prev.z),
                    visibility: lm.visibility,
                  };
                });
              }
              lastLandmarksRef.current = landmarks;

              // Cálculo robusto de ángulos articulares en 3D
              const angleOf = (a: number, b: number, c: number): number | null => {
                const la = landmarks[a];
                const lb = landmarks[b];
                const lc = landmarks[c];
                if (!la || !lb || !lc) return null;
                if ((la.visibility ?? 0) < 0.4 || (lb.visibility ?? 0) < 0.4 || (lc.visibility ?? 0) < 0.4) {
                  return null;
                }
                return calculateAngle(la, lb, lc);
              };

              const leftShoulderAngle = angleOf(LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW);
              const rightShoulderAngle = angleOf(LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW);
              const leftElbowAngle = angleOf(LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST);
              const rightElbowAngle = angleOf(LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST);
              const leftKneeAngle = angleOf(LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE);
              const rightKneeAngle = angleOf(LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE);
              const leftHipAngle = angleOf(LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE);
              const rightHipAngle = angleOf(LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_KNEE);

              const visibleCount = landmarks.filter((lm) => (lm.visibility ?? 0) > 0.45).length;
              const lSh = landmarks[LM.LEFT_SHOULDER];
              const rSh = landmarks[LM.RIGHT_SHOULDER];
              const lHip = landmarks[LM.LEFT_HIP];
              const rHip = landmarks[LM.RIGHT_HIP];
              const shoulderVisible = (lSh?.visibility ?? 0) > 0.4 || (rSh?.visibility ?? 0) > 0.4;
              const hipVisible = (lHip?.visibility ?? 0) > 0.4 || (rHip?.visibility ?? 0) > 0.4;
              const isTracking = visibleCount >= 12 && shoulderVisible && hipVisible;

              const coreLandmarks = [
                landmarks[LM.NOSE],
                lSh,
                rSh,
                landmarks[LM.LEFT_ELBOW],
                landmarks[LM.RIGHT_ELBOW],
                lHip,
                rHip,
              ].filter(Boolean);
              const coreVisAvg =
                coreLandmarks.length > 0
                  ? coreLandmarks.reduce((acc, lm) => acc + clamp(lm.visibility ?? 0, 0, 1), 0) / coreLandmarks.length
                  : 0;
              const confidencePercent = Math.round(coreVisAvg * 100);

              // Articulación y geometría particular según el movimiento del ejercicio
              const repJoint = repJointRef.current;
              const pattern = movementPatternRef.current;
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
                ankle: [
                  [LM.LEFT_KNEE, LM.LEFT_ANKLE, LM.LEFT_FOOT_INDEX],
                  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE, LM.RIGHT_FOOT_INDEX],
                ],
                cervical: [
                  [LM.LEFT_SHOULDER, LM.NOSE, LM.RIGHT_SHOULDER],
                  [LM.LEFT_EAR, LM.NOSE, LM.RIGHT_EAR],
                ],
                scapula: [
                  [LM.LEFT_ELBOW, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
                  [LM.RIGHT_ELBOW, LM.RIGHT_SHOULDER, LM.LEFT_SHOULDER],
                ],
              };
              const visibilityOf = (triplet: [number, number, number]): number => {
                const vis = triplet.map((i) => landmarks[i]?.visibility ?? 0);
                return Math.min(...vis);
              };
              const triplets = sideTriplets[repJoint] ?? sideTriplets.shoulder;
              const prescribedSide = (ladoRef.current || '').toLowerCase();
              let chosenIdx = visibilityOf(triplets[1]) > visibilityOf(triplets[0]) ? 1 : 0;
              if (prescribedSide === 'izquierdo' && visibilityOf(triplets[0]) >= 0.35) {
                chosenIdx = 0;
              } else if (prescribedSide === 'derecho' && visibilityOf(triplets[1]) >= 0.35) {
                chosenIdx = 1;
              }
              const bestTriplet = triplets[chosenIdx];
              const trackedSide: 'left' | 'right' = chosenIdx === 0 ? 'left' : 'right';
              const rawInnerAngle = angleOf(bestTriplet[0], bestTriplet[1], bestTriplet[2]);
              let minSideVisibility = visibilityOf(bestTriplet);
              let activeJointIdx = bestTriplet[1];

              // Detección clínica de compensaciones posturales y puntuación biomecánica
              let postureScore = Math.round(clamp((visibleCount / 22) * 50 + coreVisAvg * 50, 0, 100));
              let detectedCompensation: string | null = null;
              let compensationCode: PoseData['compensationCode'] = null;
              let severeCompensation = false;
              let shoulderTiltDeg = 0;
              let hipTiltDeg = 0;
              let lateralLeanDeg = 0;
              let scaleMetric = 0.25;

              if (
                (lSh?.visibility ?? 0) > 0.4 && (rSh?.visibility ?? 0) > 0.4 &&
                (lHip?.visibility ?? 0) > 0.4 && (rHip?.visibility ?? 0) > 0.4
              ) {
                const shoulderSpanNorm = Math.abs(rSh.x - lSh.x);
                const hipSpanNorm = Math.abs(rHip.x - lHip.x);
                const isFrontalView = shoulderSpanNorm > 0.08;

                if (isFrontalView) {
                  const dySh = Math.abs(rSh.y - lSh.y) * h;
                  const dxSh = Math.max(1e-3, shoulderSpanNorm * w);
                  shoulderTiltDeg = Math.round((Math.atan2(dySh, dxSh) * 180) / Math.PI);
                }

                if (hipSpanNorm > 0.06) {
                  const dyHip = Math.abs(rHip.y - lHip.y) * h;
                  const dxHip = Math.max(1e-3, hipSpanNorm * w);
                  hipTiltDeg = Math.round((Math.atan2(dyHip, dxHip) * 180) / Math.PI);
                }

                const midShoulderX = (lSh.x + rSh.x) / 2;
                const midShoulderY = (lSh.y + rSh.y) / 2;
                const midHipX = (lHip.x + rHip.x) / 2;
                const midHipY = (lHip.y + rHip.y) / 2;
                const torsoLenPx = Math.hypot((midShoulderX - midHipX) * w, (midShoulderY - midHipY) * h) || 1;
                const lateralLean = Math.abs((midShoulderX - midHipX) * w) / torsoLenPx;
                lateralLeanDeg = Math.round(Math.asin(Math.min(1, lateralLean)) * (180 / Math.PI));

                scaleMetric = isFrontalView
                  ? Math.hypot(rSh.x - lSh.x, rSh.y - lSh.y)
                  : Math.hypot(midShoulderX - midHipX, midShoulderY - midHipY);

                const shoulderTiltLimit = repJoint === 'shoulder' || repJoint === 'scapula' ? 14 : 11;
                const hipTiltLimit = 10;
                const lateralLeanLimit = 12;

                if (shoulderTiltDeg > shoulderTiltLimit) {
                  compensationCode = 'shoulder_tilt';
                  detectedCompensation = 'Nivela tus hombros: evita elevar un lado más que el otro.';
                } else if (hipTiltDeg > hipTiltLimit) {
                  compensationCode = 'hip_tilt';
                  detectedCompensation = 'Equilibra tus caderas: apoya el peso simétricamente.';
                } else if (lateralLeanDeg > lateralLeanLimit) {
                  compensationCode = 'lateral_lean';
                  detectedCompensation = 'Tronco inclinado: mantén la columna vertical y erguida.';
                }

                severeCompensation = shoulderTiltDeg > 20 || hipTiltDeg > 18 || lateralLeanDeg > 20;

                const alignmentPenalty = Math.min(
                  58,
                  Math.max(0, shoulderTiltDeg - 5) * 3.0 +
                    Math.max(0, hipTiltDeg - 5) * 3.0 +
                    Math.max(0, lateralLeanDeg - 6) * 3.2
                );
                const frameScore = clamp((visibleCount / 18) * 100, 0, 100);
                const captureQuality = frameScore * 0.45 + coreVisAvg * 100 * 0.55;
                postureScore = Math.round(
                  clamp(captureQuality * 0.35 + (100 - alignmentPenalty) * 0.65, 0, 100)
                );
              }

              // Cálculo especializado de ángulo clínico para patrones que no son un ángulo plano de 3 puntos
              let patternClinicalAngle: number | null = null;
              const computePatternClinicalAngle = (): number | null => {
                if (pattern === 'shoulder_external_rotation') {
                  const shIdx = chosenIdx === 0 ? LM.LEFT_SHOULDER : LM.RIGHT_SHOULDER;
                  const elIdx = chosenIdx === 0 ? LM.LEFT_ELBOW : LM.RIGHT_ELBOW;
                  const wrIdx = chosenIdx === 0 ? LM.LEFT_WRIST : LM.RIGHT_WRIST;
                  const sh = landmarks[shIdx];
                  const el = landmarks[elIdx];
                  const wr = landmarks[wrIdx];
                  if (!sh || !el || !wr) return null;
                  const vis = Math.min(sh.visibility ?? 0, el.visibility ?? 0, wr.visibility ?? 0);
                  minSideVisibility = vis;
                  activeJointIdx = wrIdx;
                  if (vis < 0.4) return null;
                  // Longitud de referencia antebrazo/brazo para proyectar apertura lateral del antebrazo
                  const upperArmLen = Math.hypot((el.x - sh.x) * w, (el.y - sh.y) * h);
                  const forearmLen = Math.hypot((wr.x - el.x) * w, (wr.y - el.y) * h, ((wr.z ?? 0) - (el.z ?? 0)) * w);
                  const refSpan = Math.max(24, upperArmLen * 0.92, forearmLen);
                  const lateralOutward = Math.abs((wr.x - el.x) * w);
                  const ratio = clamp(lateralOutward / refSpan, 0, 1);
                  return Math.round((Math.asin(ratio) * 180) / Math.PI);
                }

                if (pattern === 'cervical_lateral_flexion') {
                  const nose = landmarks[LM.NOSE];
                  if (!nose || !lSh || !rSh) return null;
                  const vis = Math.min(nose.visibility ?? 0, lSh.visibility ?? 0, rSh.visibility ?? 0);
                  minSideVisibility = vis;
                  activeJointIdx = LM.NOSE;
                  if (vis < 0.4) return null;
                  const midShX = (lSh.x + rSh.x) / 2;
                  const midShY = (lSh.y + rSh.y) / 2;
                  const headDx = Math.abs(nose.x - midShX) * w;
                  const headDy = Math.max(12, (midShY - nose.y) * h);
                  const rawTilt = (Math.atan2(headDx, headDy) * 180) / Math.PI;
                  return Math.round(clamp(rawTilt, 0, 60));
                }

                if (pattern === 'cervical_rotation') {
                  const nose = landmarks[LM.NOSE];
                  const lEar = landmarks[LM.LEFT_EAR];
                  const rEar = landmarks[LM.RIGHT_EAR];
                  if (!nose || !lSh || !rSh) return null;
                  const vis = Math.min(nose.visibility ?? 0, lSh.visibility ?? 0, rSh.visibility ?? 0);
                  minSideVisibility = vis;
                  activeJointIdx = LM.NOSE;
                  if (vis < 0.4) return null;
                  const useEars = lEar && rEar && (lEar.visibility ?? 0) > 0.35 && (rEar.visibility ?? 0) > 0.35;
                  const midX = useEars ? (lEar.x + rEar.x) / 2 : (lSh.x + rSh.x) / 2;
                  const halfSpan = Math.max(
                    0.03,
                    useEars ? Math.abs(lEar.x - rEar.x) * 0.55 : Math.abs(lSh.x - rSh.x) * 0.28
                  );
                  const shiftRatio = clamp(Math.abs(nose.x - midX) / halfSpan, 0, 1);
                  return Math.round((Math.asin(shiftRatio) * 180) / Math.PI);
                }

                if (pattern === 'cervical_flexion') {
                  const nose = landmarks[LM.NOSE];
                  if (!nose || !lSh || !rSh) return null;
                  const vis = Math.min(nose.visibility ?? 0, lSh.visibility ?? 0, rSh.visibility ?? 0);
                  minSideVisibility = vis;
                  activeJointIdx = LM.NOSE;
                  if (vis < 0.4) return null;
                  const midShY = (lSh.y + rSh.y) / 2;
                  const shSpan = Math.max(0.05, Math.abs(lSh.x - rSh.x));
                  // Al acercar el mentón al esternón, disminuye la altura vertical nariz-hombros normalizada
                  const normHeight = clamp((midShY - nose.y) / shSpan, 0.05, 1.4);
                  // Mapeamos descenso vertical respecto a postura alta para obtener grados crecientes
                  return Math.round(clamp((1.4 - normHeight) * 65, 0, 75));
                }

                if (pattern === 'scapular_retraction') {
                  if (!lSh || !rSh || !lHip || !rHip) return null;
                  const vis = Math.min(lSh.visibility ?? 0, rSh.visibility ?? 0, lHip.visibility ?? 0, rHip.visibility ?? 0);
                  minSideVisibility = vis;
                  activeJointIdx = LM.RIGHT_SHOULDER;
                  if (vis < 0.4) return null;
                  const shSpan = Math.hypot((rSh.x - lSh.x) * w, (rSh.y - lSh.y) * h);
                  const torsoH = Math.max(20, Math.hypot(((lSh.x + rSh.x) / 2 - (lHip.x + rHip.x) / 2) * w, ((lSh.y + rSh.y) / 2 - (lHip.y + rHip.y) / 2) * h));
                  const lEl = landmarks[LM.LEFT_ELBOW];
                  const rEl = landmarks[LM.RIGHT_ELBOW];
                  const elbowSpan = lEl && rEl && (lEl.visibility ?? 0) > 0.35 && (rEl.visibility ?? 0) > 0.35
                    ? Math.hypot((rEl.x - lEl.x) * w, (rEl.y - lEl.y) * h)
                    : shSpan;
                  // Retracción/apertura torácica combina ancho escapular normalizado y apertura de codos atrás
                  const openingIndex = (shSpan + elbowSpan * 0.45) / torsoH;
                  return Math.round(clamp(openingIndex * 55, 0, 140));
                }

                if (pattern === 'hip_abduction') {
                  const hipIdx = chosenIdx === 0 ? LM.LEFT_HIP : LM.RIGHT_HIP;
                  const kneeIdx = chosenIdx === 0 ? LM.LEFT_KNEE : LM.RIGHT_KNEE;
                  const hip = landmarks[hipIdx];
                  const knee = landmarks[kneeIdx];
                  if (!hip || !knee) return null;
                  const vis = Math.min(hip.visibility ?? 0, knee.visibility ?? 0);
                  minSideVisibility = vis;
                  activeJointIdx = hipIdx;
                  if (vis < 0.4) return null;
                  const dx = Math.abs(knee.x - hip.x) * w;
                  const dy = Math.max(12, (knee.y - hip.y) * h);
                  return Math.round(clamp((Math.atan2(dx, dy) * 180) / Math.PI, 0, 80));
                }

                if (pattern === 'isometric_balance') {
                  const lKneeCl = leftKneeAngle != null ? toClinicalAngle('knee', leftKneeAngle) : 0;
                  const rKneeCl = rightKneeAngle != null ? toClinicalAngle('knee', rightKneeAngle) : 0;
                  const lVis = visibilityOf(sideTriplets.knee[0]);
                  const rVis = visibilityOf(sideTriplets.knee[1]);
                  if (prescribedSide === 'izquierdo' && lVis >= 0.35) {
                    minSideVisibility = lVis;
                    activeJointIdx = LM.LEFT_KNEE;
                    return lKneeCl;
                  }
                  if (prescribedSide === 'derecho' && rVis >= 0.35) {
                    minSideVisibility = rVis;
                    activeJointIdx = LM.RIGHT_KNEE;
                    return rKneeCl;
                  }
                  const useLeft = lKneeCl >= rKneeCl;
                  minSideVisibility = useLeft ? lVis : rVis;
                  activeJointIdx = useLeft ? LM.LEFT_KNEE : LM.RIGHT_KNEE;
                  return Math.max(lKneeCl, rKneeCl);
                }

                return null;
              };

              patternClinicalAngle = computePatternClinicalAngle();
              const sideVisible = minSideVisibility >= 0.42;

              const trafficLight = evaluateTrafficLight(
                isTracking,
                sideVisible,
                minSideVisibility,
                postureScore,
                compensationCode,
                severeCompensation
              );
              const postureColor = trafficLightToColor(trafficLight);

              let primaryAngle = 0;
              let repPhase: RepPhase = repPhaseRef.current;
              let holdRemainingMs = 0;
              let romPercent = 0;

              const resolvedClinical =
                patternClinicalAngle !== null
                  ? patternClinicalAngle
                  : rawInnerAngle !== null
                  ? toClinicalAngle(repJoint, rawInnerAngle)
                  : null;

              if (isTracking && resolvedClinical !== null && sideVisible) {
                const expRange = expectedRangeFor(repJoint, targetAngleRef.current, neutralAngleRef.current);
                const tracked = trackAngle(
                  resolvedClinical,
                  expRange,
                  postureScore,
                  enabledRef.current,
                  scaleMetric,
                  minSideVisibility
                );
                primaryAngle = tracked.angle;
                repPhase = tracked.phase;
                repPhaseRef.current = tracked.phase;
                holdRemainingMs = tracked.holdRemainingMs;
                romPercent = tracked.romPercent;
                if (tracked.counted) {
                  lastRepTsRef.current = performance.now();
                  setRepCount((r) => r + 1);
                }
              } else if (resolvedClinical !== null) {
                primaryAngle = resolvedClinical;
              }

              // Renderizado HUD de alta nitidez y semáforo visual (Rojo / Amarillo / Verde) en el canvas
              drawOverlay(
                ctx,
                landmarks,
                postureColor,
                canvas.width,
                canvas.height,
                activeJointIdx,
                primaryAngle
              );

              setPoseData({
                landmarks,
                leftArmAngle: leftShoulderAngle ?? 0,
                rightArmAngle: rightShoulderAngle ?? 0,
                leftElbowAngle: leftElbowAngle != null ? toClinicalAngle('elbow', leftElbowAngle) : 0,
                rightElbowAngle: rightElbowAngle != null ? toClinicalAngle('elbow', rightElbowAngle) : 0,
                leftKneeAngle: leftKneeAngle != null ? toClinicalAngle('knee', leftKneeAngle) : 0,
                rightKneeAngle: rightKneeAngle != null ? toClinicalAngle('knee', rightKneeAngle) : 0,
                leftHipAngle: leftHipAngle != null ? toClinicalAngle('hip', leftHipAngle) : 0,
                rightHipAngle: rightHipAngle != null ? toClinicalAngle('hip', rightHipAngle) : 0,
                shoulderTiltDeg,
                hipTiltDeg,
                lateralLeanDeg,
                compensationIssue: detectedCompensation,
                compensationCode,
                trackedJointIndex: activeJointIdx,
                trackedSide,
                primaryAngle: Math.round(primaryAngle),
                targetAngle: targetAngleRef.current,
                lastRepQuality: lastRepQualityRef.current,
                lastRepRange: lastRepRangeRef.current,
                trafficLight,
                repPhase,
                holdRemainingMs,
                romPercent,
                angleErrorDeg: Math.abs(Math.round(primaryAngle - targetAngleRef.current)),
                postureScore,
                isTracking,
                visibleLandmarksCount: visibleCount,
                confidencePercent,
              });
            } else {
              lastLandmarksRef.current = null;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              setPoseData((prev) =>
                prev
                  ? { ...prev, isTracking: false, trafficLight: 'red', visibleLandmarksCount: 0, confidencePercent: 0 }
                  : null
              );
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
        videoEl.removeEventListener('loadedmetadata', syncCanvasToVideo);
        videoEl.removeEventListener('resize', syncCanvasToVideo);
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
