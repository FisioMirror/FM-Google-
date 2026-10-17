import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { FISIO_DESIGN_CONTRACT } from '../../design-system/tokens';

/* ==========================================================================
   1. FisioCard: Contenedor Estándar de Tarjetas con Glassmorphism Sutil
   ========================================================================== */

export interface FisioCardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'solid' | 'subtle' | 'elevated';
  interactive?: boolean;
  padded?: boolean;
  children?: React.ReactNode;
}

export const FisioCard = forwardRef<HTMLDivElement, FisioCardProps>(
  (
    {
      variant = 'glass',
      interactive = false,
      padded = true,
      className = '',
      children,
      ...motionProps
    },
    ref
  ) => {
    let surfaceClass = FISIO_DESIGN_CONTRACT.surface.glassCard;

    if (variant === 'solid') {
      surfaceClass = 'bg-surface dark:bg-surface-container border border-outline/15 shadow-2xs';
    } else if (variant === 'subtle') {
      surfaceClass = FISIO_DESIGN_CONTRACT.surface.subtle;
    } else if (variant === 'elevated') {
      surfaceClass = FISIO_DESIGN_CONTRACT.surface.modal;
    }

    const interactiveClass = interactive
      ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] transition-all duration-300'
      : '';

    const paddingClass = padded ? 'p-5 sm:p-6' : '';

    return (
      <motion.div
        ref={ref}
        className={`rounded-2xl ${surfaceClass} ${interactiveClass} ${paddingClass} ${className}`}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);
FisioCard.displayName = 'FisioCard';

/* ==========================================================================
   2. FisioPanel: Contenedor de Secciones Principales y Dashboards
   ========================================================================== */

export interface FisioPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  header?: React.ReactNode;
  action?: React.ReactNode;
}

export const FisioPanel = forwardRef<HTMLDivElement, FisioPanelProps>(
  ({ header, action, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-3xl ${FISIO_DESIGN_CONTRACT.surface.panel} p-6 sm:p-8 backdrop-blur-sm ${className}`}
        {...props}
      >
        {(header || action) && (
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-outline/10">
            {header && (
              <div className="text-lg font-bold text-on-surface tracking-tight">
                {header}
              </div>
            )}
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);
FisioPanel.displayName = 'FisioPanel';

/* ==========================================================================
   3. FisioButton: Botón de Acción Quirúrgico y Accesible
   ========================================================================== */

export interface FisioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const FisioButton = forwardRef<HTMLButtonElement, FisioButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      loading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    }[size];

    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses =
          'bg-primary hover:bg-primary/90 active:bg-teal-800 text-white shadow-xs hover:shadow-teal-500/20';
        break;
      case 'secondary':
        variantClasses =
          'bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/25';
        break;
      case 'glass':
        variantClasses =
          'bg-surface/80 dark:bg-surface-container/70 backdrop-blur-md border border-outline/15 text-on-surface hover:bg-surface-container';
        break;
      case 'ghost':
        variantClasses =
          'bg-transparent hover:bg-surface-container/60 text-on-surface-variant hover:text-on-surface';
        break;
      case 'danger':
        variantClasses =
          'bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/20';
        break;
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {loading ? (
          <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);
FisioButton.displayName = 'FisioButton';

/* ==========================================================================
   4. withFisioHarmonization: Higher-Order Component para Componentes Heterogéneos
   ========================================================================== */

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
