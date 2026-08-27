import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useLoadingMessages, type LoadingContext } from '../../hooks/useLoadingMessages';

interface LoaderProps {
  size?: number;
  className?: string;
  context?: LoadingContext;
}

export function Spinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('inline-block animate-spin', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="opacity-20"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function DotLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full bg-current"
          style={{
            animation: 'dotBounce 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function BarLoader({ className }: { className?: string }) {
  return (
    <div className={cn('w-32 h-1 rounded-full overflow-hidden bg-primary/10', className)}>
      <div
        className="h-full rounded-full bg-primary"
        style={{ animation: 'barSlide 1.2s ease-in-out infinite' }}
      />
      <style>{`
        @keyframes barSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

/**
 * Premium logo-based loader.
 *
 * Renders the FisioMirror logo as the centerpiece inside a softly breathing
 * glass disc, wrapped by a teal conic-gradient ring that spins smoothly via
 * framer-motion. Two staggered pulse rings emanate outward for a refined,
 * clinical feel that matches the app's teal aesthetic.
 */
export function LogoLoader({ size = 110, className }: { size?: number; className?: string }) {
  const logoSize = Math.round(size * 0.72);

  return (
    <div
      className={cn('relative flex flex-col items-center justify-center gap-4', className)}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      {/* Ambient halo behind the logo */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-60 pointer-events-none scale-150"
          style={{
            background:
              'radial-gradient(circle, rgba(21,105,102,0.4) 0%, rgba(34,211,238,0.2) 65%, transparent 80%)',
          }}
        />

        {/* Breathing Logo */}
        <motion.div
          animate={{
            scale: [1, 1.07, 1],
            filter: [
              'drop-shadow(0 4px 14px rgba(21,105,102,0.25))',
              'drop-shadow(0 8px 28px rgba(21,105,102,0.45))',
              'drop-shadow(0 4px 14px rgba(21,105,102,0.25))',
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center"
          style={{ width: logoSize, height: logoSize }}
        >
          <img
            src="/logo.png"
            alt="FisioMirror"
            className="w-full h-full object-contain select-none"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* 3 Animated Bouncing Dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{
              scale: [0.8, 1.35, 0.8],
              opacity: [0.35, 1, 0.35],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
            className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-teal-400 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}

export function FullLoader({ size = 96, className, context = 'general' }: LoaderProps) {
  const message = useLoadingMessages(context);
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <LogoLoader size={size} className={className} />
      <motion.p
        className="text-sm text-on-surface-variant font-medium"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {message}
      </motion.p>
    </div>
  );
}

export function ButtonLoader({ size = 18 }: { size?: number }) {
  return <Spinner size={size} className="text-current" />;
}
