import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Video, Square, RotateCcw } from 'lucide-react';
import { GaitSymmetryCard } from '../ui/ActivityCardsSuite';
import { useGaitCapture } from '../../hooks/useGaitCapture';

/** Captura real de marcha (MediaPipe) que alimenta GaitSymmetryCard. */
export function GaitCapturePanel({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { status, error, result, start, finish, reset } = useGaitCapture();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const measuring = status === 'measuring' || status === 'loading';
  const hasResult = result.leftRatio !== null;

  return (
    <div className={className}>
      {measuring && (
        <div className="mb-3 rounded-2xl overflow-hidden bg-black/80 aspect-video relative">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-error text-white px-2 py-1 rounded-full">
            {status === 'loading' ? (t('gait.loading') || 'Cargando modelo...') : (t('gait.recording') || 'Midiendo')}
          </span>
        </div>
      )}

      <GaitSymmetryCard
        leftRatio={result.leftRatio ?? undefined}
        rightRatio={result.rightRatio ?? undefined}
        cadenceSteps={result.cadenceSteps ?? undefined}
      />

      {error && (
        <p className="mt-3 text-xs text-error bg-error/10 border border-error/20 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!measuring && !hasResult && (
          <button
            onClick={() => videoRef.current && start(videoRef.current)}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Video size={16} />
            {t('gait.start') || 'Iniciar captura de marcha'}
          </button>
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
            {t('gait.reset') || 'Nueva medicion'}
          </button>
        )}
      </div>
    </div>
  );
}
