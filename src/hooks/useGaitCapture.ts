import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type GaitStatus = 'idle' | 'loading' | 'measuring' | 'error';

export interface GaitResult {
  leftRatio: number | null;
  rightRatio: number | null;
  cadenceSteps: number | null;
}

export interface LiveGaitTelemetry extends GaitResult {
  stepsCount: number;
  elapsedSec: number;
  bodyDetected: boolean;
  feetVisible: boolean;
  sampleCount: number;
}

interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

const MEDIAPIPE_POSE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404';

const EMPTY_LIVE: LiveGaitTelemetry = {
  leftRatio: null,
  rightRatio: null,
  cadenceSteps: null,
  stepsCount: 0,
  elapsedSec: 0,
  bodyDetected: false,
  feetVisible: false,
  sampleCount: 0,
};

function clamp(min: number, max: number, v: number): number {
  return Math.max(min, Math.min(max, v));
}

function kneeAngle(hip: Landmark, knee: Landmark, ankle?: Landmark): number {
  if (!ankle) return 170;
  const v1 = { x: hip.x - knee.x, y: hip.y - knee.y };
  const v2 = { x: ankle.x - knee.x, y: ankle.y - knee.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (m1 === 0 || m2 === 0) return 170;
  return (Math.acos(clamp(-1, 1, dot / (m1 * m2))) * 180) / Math.PI;
}

function avgAnchor(points: Array<Landmark | undefined>, fallback: Landmark): { x: number; y: number } {
  const valid = points.filter((p): p is Landmark => Boolean(p && (p.visibility ?? 0) >= 0.25));
  if (valid.length === 0) return { x: fallback.x, y: fallback.y };
  const sum = valid.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / valid.length, y: sum.y / valid.length };
}

async function ensureMediaPipePose(): Promise<any> {
  if (typeof window === 'undefined') throw new Error('No window context');
  if (window.Pose) return window.Pose;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-mp-pose="gait"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed loading MediaPipe Pose')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = `${MEDIAPIPE_POSE_CDN}/pose.js`;
    script.crossOrigin = 'anonymous';
    script.dataset.mpPose = 'gait';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed loading MediaPipe Pose'));
    document.head.appendChild(script);
  });

  if (!window.Pose) throw new Error('MediaPipe Pose unavailable');
  return window.Pose;
}

function drawPlantarOverlay(
  canvas: HTMLCanvasElement | null,
  video: HTMLVideoElement | null,
  lm: Landmark[] | undefined,
  leftPct: number,
  rightPct: number,
  bodyDetected: boolean
) {
  if (!canvas) return;
  const targetW = video?.videoWidth && video.videoWidth > 0 ? video.videoWidth : 640;
  const targetH = video?.videoHeight && video.videoHeight > 0 ? video.videoHeight : 480;
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, targetW, targetH);

  if (!lm || lm.length < 27 || !bodyDetected) {
    // Draw subtle lower-limb alignment guide frame when searching
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(targetW * 0.22, targetH * 0.14, targetW * 0.56, targetH * 0.78);
    ctx.setLineDash([]);
    return;
  }

  const px = (p: Landmark) => p.x * targetW;
  const py = (p: Landmark) => p.y * targetH;

  const drawSeg = (aIdx: number, bIdx: number, color: string, width = 4) => {
    const a = lm[aIdx];
    const b = lm[bIdx];
    if (!a || !b) return;
    if ((a.visibility ?? 0.8) < 0.2 || (b.visibility ?? 0.8) < 0.2) return;
    ctx.beginPath();
    ctx.moveTo(px(a), py(a));
    ctx.lineTo(px(b), py(b));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  // Pelvis & torso reference
  drawSeg(11, 12, 'rgba(148, 163, 184, 0.65)', 3);
  drawSeg(11, 23, 'rgba(148, 163, 184, 0.55)', 3);
  drawSeg(12, 24, 'rgba(148, 163, 184, 0.55)', 3);
  drawSeg(23, 24, '#2dd4bf', 4);

  // Left leg & foot (Teal #14b8a6)
  drawSeg(23, 25, '#14b8a6', 5);
  drawSeg(25, 27, '#14b8a6', 5);
  drawSeg(27, 29, '#14b8a6', 4);
  drawSeg(29, 31, '#2dd4bf', 4);
  drawSeg(27, 31, '#2dd4bf', 3);

  // Right leg & foot (Cyan #06b6d4)
  drawSeg(24, 26, '#06b6d4', 5);
  drawSeg(26, 28, '#06b6d4', 5);
  drawSeg(28, 30, '#06b6d4', 4);
  drawSeg(30, 32, '#22d3ee', 4);
  drawSeg(28, 32, '#22d3ee', 3);

  // CoM vertical plumb line from pelvic midpoint down toward plantar base
  const hipL = lm[23];
  const hipR = lm[24];
  const footAnchorL = avgAnchor([lm[27], lm[29], lm[31]], lm[25]);
  const footAnchorR = avgAnchor([lm[28], lm[30], lm[32]], lm[26]);
  if (hipL && hipR) {
    const midHipX = ((hipL.x + hipR.x) / 2) * targetW;
    const midHipY = ((hipL.y + hipR.y) / 2) * targetH;
    const baseFootY = Math.max(footAnchorL.y, footAnchorR.y) * targetH;

    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.moveTo(midHipX, midHipY);
    ctx.lineTo(midHipX, baseFootY);
    ctx.strokeStyle = Math.abs(leftPct - rightPct) <= 6 ? '#22c55e' : '#eab308';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Pelvic CoM center node
    ctx.beginPath();
    ctx.arc(midHipX, midHipY, 6, 0, Math.PI * 2);
    ctx.fillStyle = Math.abs(leftPct - rightPct) <= 6 ? '#22c55e' : '#eab308';
    ctx.fill();
  }

  // Draw plantar pressure halos scaled to left/right load ratio
  const drawPlantarHalo = (anchor: { x: number; y: number }, ratio: number, rgb: string) => {
    const cx = anchor.x * targetW;
    const cy = anchor.y * targetH;
    const radius = 14 + (ratio / 100) * 26;

    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
    grad.addColorStop(0, `rgba(${rgb}, 0.85)`);
    grad.addColorStop(0.6, `rgba(${rgb}, 0.35)`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  };

  drawPlantarHalo(footAnchorL, leftPct, '20, 184, 166');
  drawPlantarHalo(footAnchorR, rightPct, '6, 182, 212');

  // Joint nodes (hips, knees)
  [23, 24, 25, 26].forEach((idx) => {
    const p = lm[idx];
    if (!p || (p.visibility ?? 0.8) < 0.25) return;
    ctx.beginPath();
    ctx.arc(px(p), py(p), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = idx % 2 === 1 ? '#14b8a6' : '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();
  });
}

/**
 * Captura biomecánica real de marcha y simetría de apoyo plantar con MediaPipe Pose.
 * Combina proyección lateral del Centro de Masa (pelvis-pies), contacto plantar vertical
 * y cinemática de rodilla/tobillo en tiempo real con visualización sobre canvas.
 */
export function useGaitCapture() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<GaitStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('user');
  const [result, setResult] = useState<GaitResult>({
    leftRatio: null,
    rightRatio: null,
    cadenceSteps: null,
  });
  const [live, setLive] = useState<LiveGaitTelemetry>(EMPTY_LIVE);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const poseRef = useRef<any>(null);
  const inFlightRef = useRef(false);
  const isSimulatingRef = useRef(false);

  // Accumulated capture buffers
  const sessionStartMsRef = useRef<number>(0);
  const samplesRef = useRef<{
    leftWeights: number[];
    rightWeights: number[];
    timestamps: number[];
  }>({ leftWeights: [], rightWeights: [], timestamps: [] });
  const smoothedLeftRef = useRef<number | null>(null);
  const stepsCountRef = useRef<number>(0);
  const stepCooldownRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });
  const prevFootElevRef = useRef<{ diff: number; kneeL: number; kneeR: number; dominant: 'L' | 'R' | null }>({
    diff: 0,
    kneeL: 170,
    kneeR: 170,
    dominant: null,
  });
  const lastUiSyncRef = useRef<number>(0);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const stop = useCallback(() => {
    isSimulatingRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
    }
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    inFlightRef.current = false;
    clearCanvas();
    setStatus('idle');
  }, [clearCanvas]);

  const handleLandmarks = useCallback(
    (lm: Landmark[] | undefined) => {
      const now = performance.now();
      const elapsedSec =
        sessionStartMsRef.current > 0 ? Math.max(0, (now - sessionStartMsRef.current) / 1000) : 0;

      const hipL = lm?.[23];
      const hipR = lm?.[24];
      const kneeL = lm?.[25];
      const kneeR = lm?.[26];
      const ankleL = lm?.[27];
      const ankleR = lm?.[28];
      const heelL = lm?.[29];
      const heelR = lm?.[30];
      const toeL = lm?.[31];
      const toeR = lm?.[32];

      const minLowerVis = Math.min(
        hipL?.visibility ?? 0,
        hipR?.visibility ?? 0,
        kneeL?.visibility ?? 0,
        kneeR?.visibility ?? 0
      );
      const feetVis = Math.min(ankleL?.visibility ?? 0, ankleR?.visibility ?? 0) >= 0.30;
      const bodyDetected = Boolean(lm && lm.length >= 27 && minLowerVis >= 0.30);

      if (!bodyDetected || !hipL || !hipR || !kneeL || !kneeR) {
        drawPlantarOverlay(canvasRef.current, videoRef.current, lm, 50, 50, false);
        if (now - lastUiSyncRef.current > 180) {
          lastUiSyncRef.current = now;
          setLive((prev) => ({
            ...prev,
            elapsedSec: Math.round(elapsedSec * 10) / 10,
            bodyDetected: false,
            feetVisible: false,
          }));
        }
        return;
      }

      // Compute plantar support distribution:
      // 1) CoM pelvic projection between left and right foot anchors
      const anchorL = avgAnchor([ankleL, heelL, toeL], kneeL);
      const anchorR = avgAnchor([ankleR, heelR, toeR], kneeR);
      const pelvisX = (hipL.x + hipR.x) / 2;
      const footSpan = Math.abs(anchorR.x - anchorL.x);

      let comLeftRatio = 0.5;
      if (footSpan > 0.03) {
        const distL = Math.abs(pelvisX - anchorL.x);
        const distR = Math.abs(pelvisX - anchorR.x);
        const denom = distL + distR;
        if (denom > 0.001) {
          // Closer foot to pelvis supports greater share of body weight
          comLeftRatio = clamp(0.15, 0.85, distR / denom);
        }
      }

      // 2) Vertical plantar contact delta (foot closer to bottom/ground bears more stance load)
      let verticalBias = 0;
      const footYDiff = anchorL.y - anchorR.y; // positive => left foot lower (more planted)
      if (feetVis && Math.abs(footYDiff) > 0.015) {
        verticalBias = clamp(-0.32, 0.32, footYDiff * 4.5);
      }

      const rawLeftPct = clamp(12, 88, (comLeftRatio + verticalBias) * 100);
      const smoothedLeft =
        smoothedLeftRef.current == null
          ? rawLeftPct
          : smoothedLeftRef.current * 0.72 + rawLeftPct * 0.28;
      smoothedLeftRef.current = smoothedLeft;

      const leftPct = Math.round(smoothedLeft);
      const rightPct = 100 - leftPct;

      // 3) Step & cadence detection (ankle height alternation OR knee flexion cycle)
      const kAngleL = kneeAngle(hipL, kneeL, ankleL);
      const kAngleR = kneeAngle(hipR, kneeR, ankleR);
      const prev = prevFootElevRef.current;

      if (feetVis) {
        if (footYDiff > 0.032 && prev.dominant !== 'L' && now - stepCooldownRef.current.left > 280) {
          stepsCountRef.current += 1;
          stepCooldownRef.current.left = now;
          prev.dominant = 'L';
        } else if (footYDiff < -0.032 && prev.dominant !== 'R' && now - stepCooldownRef.current.right > 280) {
          stepsCountRef.current += 1;
          stepCooldownRef.current.right = now;
          prev.dominant = 'R';
        }
      } else {
        // Fallback step detection from knee flexion lift if feet are slightly cropped
        if (kAngleL < 152 && prev.kneeL >= 152 && now - stepCooldownRef.current.left > 320) {
          stepsCountRef.current += 1;
          stepCooldownRef.current.left = now;
        }
        if (kAngleR < 152 && prev.kneeR >= 152 && now - stepCooldownRef.current.right > 320) {
          stepsCountRef.current += 1;
          stepCooldownRef.current.right = now;
        }
      }

      prevFootElevRef.current = {
        diff: footYDiff,
        kneeL: kAngleL,
        kneeR: kAngleR,
        dominant: prev.dominant,
      };

      // Record sample
      samplesRef.current.leftWeights.push(leftPct);
      samplesRef.current.rightWeights.push(rightPct);
      samplesRef.current.timestamps.push(now);
      if (samplesRef.current.leftWeights.length > 900) {
        samplesRef.current.leftWeights.shift();
        samplesRef.current.rightWeights.shift();
        samplesRef.current.timestamps.shift();
      }

      // Draw live skeleton + plantar load halos on overlay canvas
      drawPlantarOverlay(canvasRef.current, videoRef.current, lm, leftPct, rightPct, true);

      const liveCadence =
        elapsedSec >= 1.5 && stepsCountRef.current > 0
          ? Math.round((stepsCountRef.current / elapsedSec) * 60)
          : 0;

      if (now - lastUiSyncRef.current > 140) {
        lastUiSyncRef.current = now;
        setLive({
          leftRatio: leftPct,
          rightRatio: rightPct,
          cadenceSteps: liveCadence,
          stepsCount: stepsCountRef.current,
          elapsedSec: Math.round(elapsedSec * 10) / 10,
          bodyDetected: true,
          feetVisible: feetVis,
          sampleCount: samplesRef.current.leftWeights.length,
        });
      }
    },
    []
  );

  const start = useCallback(
    async (video: HTMLVideoElement, preferredFacing?: 'user' | 'environment') => {
      stop();
      videoRef.current = video;
      const targetFacing = preferredFacing ?? facingMode;
      setError(null);
      setResult({ leftRatio: null, rightRatio: null, cadenceSteps: null });
      setLive(EMPTY_LIVE);
      samplesRef.current = { leftWeights: [], rightWeights: [], timestamps: [] };
      smoothedLeftRef.current = null;
      stepsCountRef.current = 0;
      stepCooldownRef.current = { left: 0, right: 0 };
      prevFootElevRef.current = { diff: 0, kneeL: 170, kneeR: 170, dominant: null };

      try {
        setStatus('loading');
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: targetFacing }, width: { ideal: 640 }, height: { ideal: 480 } },
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

        if (!poseRef.current) {
          const PoseCtor = await ensureMediaPipePose();
          const pose = new PoseCtor({
            locateFile: (file: string) => `${MEDIAPIPE_POSE_CDN}/${file}`,
          });
          pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.45,
            minTrackingConfidence: 0.45,
          });
          pose.onResults((res: any) => {
            inFlightRef.current = false;
            handleLandmarks(res?.poseLandmarks);
          });
          poseRef.current = pose;
        } else {
          poseRef.current.onResults((res: any) => {
            inFlightRef.current = false;
            handleLandmarks(res?.poseLandmarks);
          });
        }

        sessionStartMsRef.current = performance.now();
        setStatus('measuring');

        let lastInfer = 0;
        const MIN_INFER_MS = 45; // ~22 fps smooth plantar tracking

        const loop = () => {
          const v = videoRef.current;
          if (!v || !streamRef.current) return;
          const frameNow = performance.now();
          if (v.readyState >= 2 && !inFlightRef.current && frameNow - lastInfer >= MIN_INFER_MS) {
            lastInfer = frameNow;
            inFlightRef.current = true;
            poseRef.current.send({ image: v }).catch(() => {
              inFlightRef.current = false;
            });
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e: any) {
        stop();
        setStatus('error');
        setError(
          e?.name === 'NotAllowedError'
            ? t('gait.errCameraPermission')
            : t('gait.errNoCamera')
        );
      }
    },
    [stop, facingMode, handleLandmarks, t]
  );

  const toggleFacingMode = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    if ((status === 'measuring' || status === 'loading') && videoRef.current) {
      start(videoRef.current, next);
    }
  }, [facingMode, status, start]);

  const finish = useCallback(() => {
    const { leftWeights, timestamps } = samplesRef.current;
    const elapsedFromSamples =
      timestamps.length > 1 ? (timestamps[timestamps.length - 1] - timestamps[0]) / 1000 : 0;
    const totalElapsed = Math.max(
      elapsedFromSamples,
      sessionStartMsRef.current > 0 ? (performance.now() - sessionStartMsRef.current) / 1000 : 0
    );

    if (leftWeights.length < 8 || totalElapsed < 1.5) {
      stop();
      setError(t('gait.errInsufficientSamples', { count: leftWeights.length }));
      setStatus('error');
      return;
    }

    const avgLeft = Math.round(leftWeights.reduce((acc, v) => acc + v, 0) / leftWeights.length);
    const avgRight = 100 - avgLeft;
    const finalCadence =
      stepsCountRef.current > 0 && totalElapsed > 0
        ? Math.round((stepsCountRef.current / totalElapsed) * 60)
        : 0;

    setResult({
      leftRatio: avgLeft,
      rightRatio: avgRight,
      cadenceSteps: finalCadence,
    });
    stop();
  }, [stop, t]);

  // Simulación interactiva con dibujo real de esqueleto plantar en el canvas
  const startSimulation = useCallback(() => {
    stop();
    setError(null);
    setResult({ leftRatio: null, rightRatio: null, cadenceSteps: null });
    setLive(EMPTY_LIVE);
    samplesRef.current = { leftWeights: [], rightWeights: [], timestamps: [] };
    smoothedLeftRef.current = null;
    stepsCountRef.current = 0;
    stepCooldownRef.current = { left: 0, right: 0 };
    prevFootElevRef.current = { diff: 0, kneeL: 170, kneeR: 170, dominant: null };
    isSimulatingRef.current = true;
    sessionStartMsRef.current = performance.now();
    setStatus('measuring');

    let phase = 0;
    const simLoop = () => {
      if (!isSimulatingRef.current) return;
      const now = performance.now();
      const elapsedSec = (now - sessionStartMsRef.current) / 1000;
      phase += 0.11;

      const sway = Math.sin(phase) * 0.035;
      const liftL = Math.max(0, Math.sin(phase)) * 0.055;
      const liftR = Math.max(0, Math.sin(phase + Math.PI)) * 0.055;

      // Synthetic 33-point MediaPipe lower-limb landmarks
      const simLm: Landmark[] = Array.from({ length: 33 }, () => ({
        x: 0.5,
        y: 0.5,
        visibility: 0.9,
      }));
      simLm[11] = { x: 0.42 + sway * 0.4, y: 0.22, visibility: 0.95 };
      simLm[12] = { x: 0.58 + sway * 0.4, y: 0.22, visibility: 0.95 };
      simLm[23] = { x: 0.43 + sway, y: 0.48, visibility: 0.98 };
      simLm[24] = { x: 0.57 + sway, y: 0.48, visibility: 0.98 };
      simLm[25] = { x: 0.43 + sway * 0.5, y: 0.68 - liftL * 0.7, visibility: 0.98 };
      simLm[26] = { x: 0.57 + sway * 0.5, y: 0.68 - liftR * 0.7, visibility: 0.98 };
      simLm[27] = { x: 0.43, y: 0.86 - liftL, visibility: 0.98 };
      simLm[28] = { x: 0.57, y: 0.86 - liftR, visibility: 0.98 };
      simLm[29] = { x: 0.42, y: 0.89 - liftL, visibility: 0.95 };
      simLm[30] = { x: 0.58, y: 0.89 - liftR, visibility: 0.95 };
      simLm[31] = { x: 0.40, y: 0.90 - liftL * 0.8, visibility: 0.95 };
      simLm[32] = { x: 0.60, y: 0.90 - liftR * 0.8, visibility: 0.95 };

      handleLandmarks(simLm);

      if (elapsedSec >= 4.2) {
        finish();
      } else {
        rafRef.current = requestAnimationFrame(simLoop);
      }
    };

    rafRef.current = requestAnimationFrame(simLoop);
  }, [stop, handleLandmarks, finish]);

  useEffect(() => () => stop(), [stop]);

  const reset = useCallback(() => {
    stop();
    setError(null);
    setLive(EMPTY_LIVE);
    setResult({ leftRatio: null, rightRatio: null, cadenceSteps: null });
  }, [stop]);

  return {
    status,
    error,
    result,
    live,
    facingMode,
    toggleFacingMode,
    videoRef,
    canvasRef,
    start,
    startSimulation,
    finish,
    stop,
    reset,
  };
}
