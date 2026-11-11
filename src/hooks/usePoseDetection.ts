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
  if (/(hombro|shoulder|elevaci|abducci|press militar|overhead)/.test(name)) return 'shoulder';
  if (/(cadera|hip|puente|bridge|gluteo|glúteo|pelvis|equilibrio)/.test(name)) return 'hip';
  return 'elbow';
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
 * - Rojo ('red'): cuerpo fuera de encuadre, pocos landmarks o compensación severa (< 55)
 * - Amarillo ('yellow'): captura parcial o desalineación leve/moderada (55..77 o compensación moderada)
 * - Verde ('green'): captura nítida, buena alineación postural y ejecución segura (>= 78 sin compensación)
 */
function evaluateTrafficLight(
  isTracking: boolean,
  postureScore: number,
  compensationCode: PoseData['compensationCode']
): TrafficLightState {
  if (!isTracking || postureScore < 55) return 'red';
  if (compensationCode !== null || postureScore < 78) return 'yellow';
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
  const targetAngleRef = useRef<number>(90);
  const neutralAngleRef = useRef<number | undefined>(options.neutralAngle);
  const enabledRef = useRef<boolean>(options.enabled ?? true);
  const ladoRef = useRef<string | undefined>(options.lado);
  const holdDurationRef = useRef<number>(Math.max(1, options.holdDurationSec ?? 2));
  const lastRepQualityRef = useRef<number | null>(null);
  const lastRepRangeRef = useRef<number>(0);

  neutralAngleRef.current = options.neutralAngle;
  enabledRef.current = options.enabled ?? true;
  ladoRef.current = options.lado;
  holdDurationRef.current = Math.max(1, options.holdDurationSec ?? 2);

  const repTrackRef = useRef({
    phase: 'neutral' as RepPhase,
    startAngle: 0,
    min: 0,
    max: 0,
    startTs: 0,
    holdEnterTs: 0,
    lastRest: 0,
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
      min: 0,
      max: 0,
      startTs: 0,
      holdEnterTs: 0,
      lastRest: 0,
    };
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

        // Floating Angle Readout Badge (counter-mirrored so text stays upright)
        if (primaryAngle != null && Number.isFinite(primaryAngle)) {
          ctx.save();
          const badgeOffsetX = 26;
          const badgeOffsetY = -24;
          ctx.translate(jx + badgeOffsetX, jy + badgeOffsetY);
          ctx.scale(-1, 1);

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
     * Detector biomecánico por excursión, fase clínica y mantenimiento isométrico.
     * Soporta tanto flexión ascendente (0 -> 120°) como extensión hacia 0° (90° -> 0°).
     */
    const trackAngle = (clinicalAngle: number, expectedRange: number, postureScore: number, allowCount: boolean) => {
      const now = performance.now();
      const prevSmooth = repAngleSmoothRef.current;
      const alpha = prevSmooth === null ? 1 : 0.42;
      const angle = prevSmooth === null ? clinicalAngle : prevSmooth + alpha * (clinicalAngle - prevSmooth);
      repAngleSmoothRef.current = angle;

      const track = repTrackRef.current;
      const holdMsTarget = holdDurationRef.current * 1000;

      if (!allowCount) {
        return {
          angle,
          counted: false,
          quality: null as number | null,
          range: 0,
          phase: track.phase,
          holdRemainingMs: 0,
          romPercent: 0,
        };
      }

      if (track.phase === 'neutral') {
        if (track.lastRest === 0) track.lastRest = angle;
        track.lastRest += 0.08 * (angle - track.lastRest);
        const startDelta = Math.max(12, expectedRange * 0.18);
        const curExcursion = Math.abs(angle - track.lastRest);
        const romPercent = clamp(Math.round((curExcursion / Math.max(1, expectedRange)) * 100), 0, 100);
        if (curExcursion > startDelta) {
          track.phase = 'concentric';
          track.startAngle = track.lastRest;
          track.min = angle;
          track.max = angle;
          track.startTs = now;
          track.holdEnterTs = 0;
        }
        return {
          angle,
          counted: false,
          quality: null as number | null,
          range: 0,
          phase: track.phase,
          holdRemainingMs: 0,
          romPercent,
        };
      }

      track.min = Math.min(track.min, angle);
      track.max = Math.max(track.max, angle);
      const range = track.max - track.min;
      const elapsed = now - track.startTs;
      const curExcursion = Math.abs(angle - track.startAngle);
      const romPercent = clamp(Math.round((curExcursion / Math.max(1, expectedRange)) * 100), 0, 100);
      const minRange = Math.max(20, expectedRange * 0.5);
      const returnTolerance = Math.max(10, expectedRange * 0.2);

      // Fase isométrica en el pico (>= 75% de ROM esperado)
      let holdRemainingMs = 0;
      if (romPercent >= 75) {
        if (track.phase === 'concentric') {
          track.phase = 'hold';
          track.holdEnterTs = now;
        }
        if (track.phase === 'hold') {
          const heldFor = now - track.holdEnterTs;
          holdRemainingMs = Math.max(0, Math.round(holdMsTarget - heldFor));
        }
      } else if (track.phase === 'hold' && romPercent < 62) {
        track.phase = 'eccentric';
      } else if (track.phase === 'concentric' && range >= minRange && curExcursion < range * 0.72) {
        track.phase = 'eccentric';
      }

      if (range >= minRange && elapsed >= 850 && Math.abs(angle - track.startAngle) <= returnTolerance) {
        const rangeScore = clamp((range / Math.max(1, expectedRange)) * 100, 0, 100);
        const seconds = elapsed / 1000;
        const tempoScore = seconds < 0.8 ? 45 : seconds < 1.2 ? 70 : seconds <= 6.5 ? 100 : seconds <= 9 ? 78 : 55;
        const heldFraction = track.holdEnterTs > 0 ? clamp((now - track.holdEnterTs) / Math.max(500, holdMsTarget * 0.5), 0.5, 1) : 0.7;
        const quality = Math.round(rangeScore * 0.62 + tempoScore * 0.2 + postureScore * 0.1 + heldFraction * 8);
        track.phase = 'neutral';
        track.startAngle = 0;
        track.min = 0;
        track.max = 0;
        track.startTs = 0;
        track.holdEnterTs = 0;
        track.lastRest = angle;
        lastRepQualityRef.current = clamp(quality, 0, 100);
        lastRepRangeRef.current = Math.round(range);
        return {
          angle,
          counted: true,
          quality: lastRepQualityRef.current,
          range: Math.round(range),
          phase: 'neutral' as RepPhase,
          holdRemainingMs: 0,
          romPercent: 0,
        };
      }

      // Movimiento inconcluso (pérdida de encuadre o pausa larga): reiniciar ciclo.
      if (elapsed > 12000) {
        track.phase = 'neutral';
        track.startAngle = 0;
        track.min = 0;
        track.max = 0;
        track.startTs = 0;
        track.holdEnterTs = 0;
        track.lastRest = angle;
      }

      return {
        angle,
        counted: false,
        quality: null as number | null,
        range: Math.round(range),
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

        // Oscillate anatomical clinical angle from 10° to 125° smoothly
        const angleCycle = (Math.sin(simTick * 1.4) + 1) / 2; // 0 to 1
        const clinicalSimAngle = Math.round(10 + angleCycle * 115);
        const innerSimAngle = Math.max(45, 180 - clinicalSimAngle);
        const leftAngle = 15;

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
              const isTracking = visibleCount >= 14 && shoulderVisible && hipVisible;

              // Detección clínica de compensaciones posturales y puntuación biomecánica
              let postureScore = Math.round(clamp((visibleCount / 33) * 100, 0, 100));
              let detectedCompensation: string | null = null;
              let compensationCode: PoseData['compensationCode'] = null;
              let shoulderTiltDeg = 0;
              let hipTiltDeg = 0;
              let lateralLeanDeg = 0;

              if (
                (lSh?.visibility ?? 0) > 0.4 && (rSh?.visibility ?? 0) > 0.4 &&
                (lHip?.visibility ?? 0) > 0.4 && (rHip?.visibility ?? 0) > 0.4
              ) {
                const dySh = (rSh.y - lSh.y) * h;
                const dxSh = (rSh.x - lSh.x) * w;
                shoulderTiltDeg = Math.abs(Math.round((Math.atan2(dySh, dxSh) * 180) / Math.PI));

                const dyHip = (rHip.y - lHip.y) * h;
                const dxHip = (rHip.x - lHip.x) * w;
                hipTiltDeg = Math.abs(Math.round((Math.atan2(dyHip, dxHip) * 180) / Math.PI));

                const midShoulderX = (lSh.x + rSh.x) / 2;
                const midShoulderY = (lSh.y + rSh.y) / 2;
                const midHipX = (lHip.x + rHip.x) / 2;
                const midHipY = (lHip.y + rHip.y) / 2;
                const torsoLength = Math.hypot(midShoulderX - midHipX, midShoulderY - midHipY) || 0.1;
                const lateralLean = Math.abs(midShoulderX - midHipX) / torsoLength;
                lateralLeanDeg = Math.round(Math.asin(Math.min(1, lateralLean)) * (180 / Math.PI));

                if (shoulderTiltDeg > 8) {
                  compensationCode = 'shoulder_tilt';
                  detectedCompensation = 'Nivela tus hombros: evita elevar un lado más que el otro.';
                } else if (hipTiltDeg > 7) {
                  compensationCode = 'hip_tilt';
                  detectedCompensation = 'Equilibra tus caderas: apoya el peso simétricamente.';
                } else if (lateralLeanDeg > 9) {
                  compensationCode = 'lateral_lean';
                  detectedCompensation = 'Tronco inclinado: mantén la columna vertical y erguida.';
                }

                const alignmentPenalty = Math.min(
                  58,
                  Math.max(0, shoulderTiltDeg - 2) * 3.4 +
                    Math.max(0, hipTiltDeg - 2) * 3.4 +
                    Math.max(0, lateralLeanDeg - 4) * 3.8
                );
                const visibilityScore = clamp((visibleCount / 26) * 100, 0, 100);
                postureScore = Math.round(
                  clamp(visibilityScore * 0.4 + (100 - alignmentPenalty) * 0.6, 0, 100)
                );
              }

              const trafficLight = evaluateTrafficLight(isTracking, postureScore, compensationCode);
              const postureColor = trafficLightToColor(trafficLight);

              // Articulación objetivo de recuento de repeticiones (respeta lado prescrito si visible)
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
              const triplets = sideTriplets[repJoint] ?? sideTriplets.elbow;
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
              const sideVisible = visibilityOf(bestTriplet) >= 0.42;
              const activeJointIdx = bestTriplet[1];

              let primaryAngle = 0;
              let repPhase: RepPhase = repPhaseRef.current;
              let holdRemainingMs = 0;
              let romPercent = 0;

              if (isTracking && rawInnerAngle !== null && sideVisible) {
                const clinicalAngle = toClinicalAngle(repJoint, rawInnerAngle);
                const expRange = expectedRangeFor(repJoint, targetAngleRef.current, neutralAngleRef.current);
                const tracked = trackAngle(clinicalAngle, expRange, postureScore, enabledRef.current);
                primaryAngle = tracked.angle;
                repPhase = tracked.phase;
                repPhaseRef.current = tracked.phase;
                holdRemainingMs = tracked.holdRemainingMs;
                romPercent = tracked.romPercent;
                if (tracked.counted) {
                  lastRepTsRef.current = performance.now();
                  setRepCount((r) => r + 1);
                }
              } else if (rawInnerAngle !== null) {
                primaryAngle = toClinicalAngle(repJoint, rawInnerAngle);
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
              });
            } else {
              lastLandmarksRef.current = null;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              setPoseData((prev) => (prev ? { ...prev, isTracking: false, trafficLight: 'red' } : null));
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
