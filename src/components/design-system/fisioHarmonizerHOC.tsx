import React, { forwardRef } from 'react';
import { FISIO_DESIGN_CONTRACT } from '../../design-system/tokens';

export interface HarmonizeOptions {
  radius?: 'card' | 'container' | 'element';
  surface?: 'glass' | 'solid' | 'subtle';
  padded?: boolean;
}

/**
 * HOC que envuelve componentes legados o heterogéneos (provenientes de Bolt, Google Stitch o Deepcheck)
 * para normalizar sus bordes, fondos y modo oscuro bajo el estándar de FisioMirror.
 */
export function withFisioHarmonization<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: HarmonizeOptions = {}
) {
  const { radius = 'card', surface = 'glass', padded = true } = options;

  const radiusClass =
    radius === 'container'
      ? FISIO_DESIGN_CONTRACT.radius.container
      : radius === 'element'
      ? FISIO_DESIGN_CONTRACT.radius.element
      : FISIO_DESIGN_CONTRACT.radius.card;

  const surfaceClass =
    surface === 'solid'
      ? 'bg-surface dark:bg-surface-container border border-outline/15 shadow-2xs'
      : surface === 'subtle'
      ? FISIO_DESIGN_CONTRACT.surface.subtle
      : FISIO_DESIGN_CONTRACT.surface.glassCard;

  const paddingClass = padded ? 'p-5 sm:p-6' : '';

  const HarmonizedComponent = forwardRef<HTMLDivElement, P & { wrapperClassName?: string }>(
    ({ wrapperClassName = '', ...props }, ref) => {
      return (
        <div
          ref={ref}
          className={`${radiusClass} ${surfaceClass} ${paddingClass} ${FISIO_DESIGN_CONTRACT.motion.transition} ${wrapperClassName}`}
        >
          <WrappedComponent {...(props as P)} />
        </div>
      );
    }
  );

  HarmonizedComponent.displayName = `withFisioHarmonization(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return HarmonizedComponent;
}
