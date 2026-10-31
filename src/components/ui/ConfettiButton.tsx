import { forwardRef, useCallback, type ButtonHTMLAttributes, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { cn } from '../../lib/utils';

export interface ConfettiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  /** Colores personalizados para los confettis. Por defecto, paleta teal/app. */
  colors?: string[];
  /** Número de partículas a lanzar. */
  particleCount?: number;
  /** Dispersión inicial del confetti. */
  spread?: number;
  /** Velocidad inicial de las partículas. */
  startVelocity?: number;
}

const DEFAULT_COLORS = ['#14b8a6', '#8ad3cf', '#156966', '#34d399', '#ffffff'];

/**
 * Botón que dispara confetti desde su propio centro al hacer clic.
 * Útil para celebraciones: completar un reto, guardar un logro, etc.
 *
 * Acepta todas las props nativas de `<button>`, incluido `onClick` (se invoca
 * después de lanzar el confetti).
 */
export const ConfettiButton = forwardRef<HTMLButtonElement, ConfettiButtonProps>(
  (
    {
      children,
      className,
      colors = DEFAULT_COLORS,
      particleCount = 90,
      spread = 70,
      startVelocity = 35,
      onClick,
      ...buttonProps
    },
    ref,
  ) => {
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        const defaults = {
          origin: { x, y },
          colors,
          particleCount,
          spread,
          startVelocity,
          scalar: 0.9,
          ticks: 220,
          zIndex: 9999,
        };

        // Tres ráfagas a distintos ángulos para un efecto más festivo.
        confetti({ ...defaults, angle: 60 });
        confetti({ ...defaults, angle: 120 });
        confetti({
          ...defaults,
          angle: 90,
          particleCount: Math.round(particleCount / 2),
          scalar: 1.2,
        });

        onClick?.(event);
      },
      [colors, particleCount, spread, startVelocity, onClick],
    );

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2',
          'text-sm font-medium transition-transform active:scale-95',
          'bg-primary text-white hover:bg-primary/90 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary/40',
          className,
        )}
        onClick={handleClick}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);

ConfettiButton.displayName = 'ConfettiButton';

export const ConfettiStars = forwardRef<HTMLButtonElement, ConfettiButtonProps>(
  (
    {
      children,
      className,
      colors = ['#fbbf24', '#f59e0b', '#fb7185', '#14b8a6', '#60a5fa'],
      particleCount = 50,
      spread = 80,
      startVelocity = 40,
      onClick,
      ...buttonProps
    },
    ref,
  ) => {
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
          origin: { x, y },
          colors,
          particleCount,
          spread,
          startVelocity,
          shapes: ['star'],
          scalar: 1.2,
          ticks: 200,
          zIndex: 9999,
        });

        onClick?.(event);
      },
      [colors, particleCount, spread, startVelocity, onClick],
    );

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2',
          'text-sm font-medium transition-transform active:scale-95',
          'bg-amber-500 text-white hover:bg-amber-600 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-amber-400/40 shadow-sm',
          className,
        )}
        onClick={handleClick}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);

ConfettiStars.displayName = 'ConfettiStars';

/**
 * Dispara confeti continuo desde ambos laterales (cañones laterales) durante una duración dada.
 * Calibrado con la paleta de FisioMirror (teal, kinetic lime, cian y esmeralda).
 */
function fireSideCannons(options?: {
  durationMs?: number;
  colors?: string[];
}) {
  const duration = options?.durationMs ?? 3000;
  const colors = options?.colors ?? ['#006965', '#00504d', '#4cdad2', '#c1ff72', '#14b8a6', '#38bdf8'];
  const end = Date.now() + duration;

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: colors,
      zIndex: 9999,
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: colors,
      zIndex: 9999,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

export interface ConfettiSideCannonsProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  durationMs?: number;
  colors?: string[];
  children?: ReactNode;
}

/**
 * ConfettiSideCannons: Botón interactivo que lanza ráfagas de cañones laterales continuas.
 * Ideal para celebrar metas de rehabilitación, altas de pacientes o completar retos semanales.
 */
export const ConfettiSideCannons = forwardRef<HTMLButtonElement, ConfettiSideCannonsProps>(
  ({ children, className, durationMs = 2500, colors, onClick, ...buttonProps }, ref) => {
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        fireSideCannons({ durationMs, colors });
        onClick?.(event);
      },
      [durationMs, colors, onClick],
    );

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5',
          'text-sm font-semibold transition-all duration-300 active:scale-95',
          'bg-gradient-to-r from-teal-600 via-primary to-emerald-600 text-white',
          'shadow-md hover:shadow-lg hover:brightness-105 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary/40',
          className,
        )}
        onClick={handleClick}
        {...buttonProps}
      >
        {children ?? 'Disparar Celebración'}
      </button>
    );
  },
);

ConfettiSideCannons.displayName = 'ConfettiSideCannons';

