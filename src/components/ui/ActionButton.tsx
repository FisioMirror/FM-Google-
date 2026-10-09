import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Icon } from './Icon';
import { Spinner } from './Loader';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'shimmer';

interface ActionButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'onClick'> {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  icon?: string;
  iconFilled?: boolean;
  iconSize?: number;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-md shadow-teal-700/20 border border-teal-400/20',
  secondary:
    'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline/10',
  outline:
    'border border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10',
  ghost:
    'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface',
  danger:
    'bg-error/10 text-error hover:bg-error/20 border border-error/20',
  shimmer:
    'bg-gradient-to-r from-teal-700 via-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-900/20 relative overflow-hidden',
};

/**
 * ActionButton (Elevated with Shadcn UI & Magic UI aesthetics)
 * Tactile spring feedback, responsive hover elevation, and clinical polish.
 */
export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  className,
  icon,
  iconFilled = false,
  iconSize = 18,
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}: ActionButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', damping: 20, stiffness: 350 }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 select-none cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {/* Moving shimmer light streak for primary and shimmer variants */}
      {(variant === 'primary' || variant === 'shimmer') && (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:animate-shine-sweep bg-gradient-to-r from-transparent via-white/20 to-transparent"
          aria-hidden="true"
        />
      )}

      {loading ? (
        <Spinner size={iconSize} className="text-current shrink-0" />
      ) : (
        icon && <Icon name={icon} filled={iconFilled} size={iconSize} className="shrink-0 transition-transform group-hover:scale-110" />
      )}
      <span className="truncate">{children}</span>
    </motion.button>
  );
}
