import { useTranslation } from 'react-i18next';
import { Video, Square, RotateCcw, Activity, RefreshCw, Footprints } from 'lucide-react';
import { GaitSymmetryCard } from '../ui/ActivityCardsSuite';
import { useGaitCapture } from '../../hooks/useGaitCapture';
import { cn } from '@/lib/utils';

export interface GaitCapturePanelProps {
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

/** Captura real de marcha y apoyo plantar (MediaPipe) con canvas en tiempo real y simulación interactiva. */
export function GaitCapturePanel({ className, layout = 'vertical' }: GaitCapturePanelProps) {
  const { t } = useTranslation();
  const {
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
    reset,
  } = useGaitCapture();

  const measuring = status === 'measuring' || status === 'loading';
  const hasResult = result.leftRatio !== null;
  const activeLeftRatio = measuring ? live.leftRatio : result.leftRatio;
  const activeRightRatio = measuring ? live.rightRatio : result.rightRatio;
  const activeCadence = measuring ? live.cadenceSteps : result.cadenceSteps;
  const isMirrored = facingMode === 'user';

  const formatElapsed = (sec: number) => {
    const s = Math.floor(sec);
    return `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const viewportBlock = (
    <div
      className={cn(
        'rounded-2xl overflow-hidden bg-slate-950 relative border border-slate-800 transition-all duration-300',
        measuring ? 'aspect-video min-h-[220px]' : layout === 'horizontal' ? 'h-56 sm:h-64' : 'h-40 sm:h-44'
      )}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isMirrored && '-scale-x-100',
          measuring ? 'opacity-100' : 'opacity-25'
        )}
      />
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 w-full h-full object-cover pointer-events-none',
          isMirrored && '-scale-x-100'
        )}
      />

      {!measuring && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white/75 px-4 text-center pointer-events-none">
          <Video size={26} className="text-teal-400" />
          <span className="text-[11px] font-semibold max-w-sm leading-snug">
            {t('gait.previewHint')}
          </span>
        </div>
      )}

      {measuring && (
        <>
          <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-teal-600/95 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-md tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>
                {status === 'loading'
                  ? t('gait.loading')
                  : `${t('gait.recording')} · ${formatElapsed(live.elapsedSec)}`}
              </span>
            </div>

            {status === 'measuring' && (
              <div
                className={cn(
                  'flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border shadow-sm',
                  live.bodyDetected
                    ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-100'
                    : 'bg-amber-500/25 border-amber-400/60 text-amber-100'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    live.bodyDetected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  )}
                />
                <span>{live.bodyDetected ? t('gait.feetDetected') : t('gait.alignLegs')}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFacingMode}
            title={t('gait.toggleCamera')}
            aria-label={t('gait.toggleCamera')}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>

          {status === 'measuring' && live.bodyDetected && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-slate-950/85 text-teal-200 border border-teal-500/35 px-2.5 py-1 rounded-full backdrop-blur-md tabular-nums">
                <Footprints size={12} className="text-teal-400" />
                {t('gait.stepsCount', { count: live.stepsCount })}
              </span>

              {live.leftRatio !== null && live.rightRatio !== null && (
                <span className="text-[11px] font-mono font-bold bg-slate-950/85 text-white border border-white/15 px-2.5 py-1 rounded-full backdrop-blur-md tabular-nums">
                  L {live.leftRatio}% · R {live.rightRatio}%
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const controlsBlock = (
    <>
      <GaitSymmetryCard
        leftRatio={activeLeftRatio ?? undefined}
        rightRatio={activeRightRatio ?? undefined}
        cadenceSteps={activeCadence ?? undefined}
      />

      {error && (
        <div className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>{error}</span>
          {!measuring && !hasResult && (
            <button
              onClick={startSimulation}
              className="px-3 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold shrink-0 hover:bg-teal-700 transition-colors"
            >
              {t('tl.testSimulation')}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!measuring && !hasResult && (
          <>
            <button
              onClick={() => videoRef.current && start(videoRef.current)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
            >
              <Video size={16} />
              {t('gait.start')}
            </button>
            <button
              onClick={startSimulation}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Activity size={16} className="text-teal-600 dark:text-teal-400" />
              {t('tl.simGait4s')}
            </button>
          </>
        )}
        {status === 'measuring' && (
          <button
            onClick={finish}
            className="px-4 py-2.5 rounded-xl bg-error text-white text-xs font-bold flex items-center gap-2 hover:bg-error/90 transition-colors cursor-pointer"
          >
            <Square size={16} />
            {t('gait.finish')}
          </button>
        )}
        {(hasResult || error) && (
          <button
            onClick={reset}
            className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline/10 text-xs font-bold flex items-center gap-2 hover:bg-surface-container/70 transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
            {t('gait.reset')}
          </button>
        )}
      </div>
    </>
  );

  if (layout === 'horizontal') {
    return (
      <div className={cn('grid grid-cols-1 lg:grid-cols-12 gap-5 items-center', className)}>
        <div className="lg:col-span-7">{viewportBlock}</div>
        <div className="lg:col-span-5 flex flex-col justify-between">{controlsBlock}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-3">{viewportBlock}</div>
      {controlsBlock}
    </div>
  );
}
