import { useTranslation } from 'react-i18next';
import { Video, Square, RotateCcw, Activity } from 'lucide-react';
import { GaitSymmetryCard } from '../ui/ActivityCardsSuite';
import { useGaitCapture } from '../../hooks/useGaitCapture';

/** Captura real de marcha (MediaPipe) que alimenta GaitSymmetryCard con soporte para simulación interactiva. */
export function GaitCapturePanel({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { status, error, result, videoRef, start, startSimulation, finish, reset } = useGaitCapture();
  const measuring = status === 'measuring' || status === 'loading';
  const hasResult = result.leftRatio !== null;

  return (
    <div className={className}>
      <div className="mb-3 rounded-2xl overflow-hidden bg-slate-950 aspect-video relative border border-slate-800">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${measuring ? 'opacity-100' : 'opacity-25'}`}
        />
        {!measuring && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 px-4 text-center pointer-events-none">
            <Video size={30} className="text-teal-400" />
            <span className="text-[11px] font-semibold">
              {t('gait.previewHint', 'Captura goniométrica por visión computacional o simulación en tiempo real')}
            </span>
          </div>
        )}
        {measuring && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white px-2.5 py-1 rounded-full shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{status === 'loading' ? (t('gait.loading') || 'Cargando modelo...') : (t('gait.recording') || 'Midiendo Marcha')}</span>
          </div>
        )}
      </div>

      <GaitSymmetryCard
        leftRatio={result.leftRatio ?? undefined}
        rightRatio={result.rightRatio ?? undefined}
        cadenceSteps={result.cadenceSteps ?? undefined}
      />

      {error && (
        <div className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>{error}</span>
          {!measuring && !hasResult && (
            <button
              onClick={startSimulation}
              className="px-3 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold shrink-0 hover:bg-teal-700 transition-colors"
            >
              Probar Simulación
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!measuring && !hasResult && (
          <>
            <button
              onClick={() => videoRef.current && start(videoRef.current)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Video size={16} />
              {t('gait.start') || 'Iniciar cámara'}
            </button>
            <button
              onClick={startSimulation}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Activity size={16} className="text-teal-600 dark:text-teal-400" />
              Simulación de Marcha (4s)
            </button>
          </>
        )}
        {status === 'measuring' && (
          <button
            onClick={finish}
            className="px-4 py-2.5 rounded-xl bg-error text-white text-xs font-bold flex items-center gap-2 hover:bg-error/90 transition-colors"
          >
            <Square size={16} />
            {t('gait.finish') || 'Finalizar y calcular'}
          </button>
        )}
        {(hasResult || error) && (
          <button
            onClick={() => { reset(); }}
            className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline/10 text-xs font-bold flex items-center gap-2 hover:bg-surface-container/70 transition-colors"
          >
            <RotateCcw size={16} />
            {t('gait.reset') || 'Nueva medición'}
          </button>
        )}
      </div>
    </div>
  );
}
