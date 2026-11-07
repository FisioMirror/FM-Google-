import { useTranslation } from 'react-i18next';
import { Video, Square, RotateCcw } from 'lucide-react';
import { GaitSymmetryCard } from '../ui/ActivityCardsSuite';
import { useGaitCapture } from '../../hooks/useGaitCapture';

/** Captura real de marcha (MediaPipe) que alimenta GaitSymmetryCard. */
export function GaitCapturePanel({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { status, error, result, videoRef, start, finish, reset } = useGaitCapture();
  const measuring = status === 'measuring' || status === 'loading';
  const hasResult = result.leftRatio !== null;

  return (
    <div className={className}>
      {/* El video debe existir siempre: el botón de inicio le pasa su ref a la
          cámara. Antes solo se montaba en estado "measuring", así que la ref era
          null y la captura no arrancaba nunca. */}
      {/* El video queda montado y visible siempre. Si estuviera en display:none,
          algunos WebViews no reproducen el stream y la captura nunca arranca. */}
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
            <Video size={30} />
            <span className="text-[11px] font-semibold">
              {t('gait.previewHint', 'La cámara se activará al iniciar la captura')}
            </span>
          </div>
        )}
        {measuring && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-error text-white px-2 py-1 rounded-full">
            {status === 'loading' ? (t('gait.loading') || 'Cargando modelo...') : (t('gait.recording') || 'Midiendo')}
          </span>
        )}
      </div>

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
