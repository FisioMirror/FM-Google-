import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  dismissable?: boolean;
}

/**
 * GlassModal (Elevated with Shadcn Dialog & HeroUI physics)
 * Accessible, responsive modal with keyboard Escape support, scroll lock, and tactile entrance.
 */
export function GlassModal({
  isOpen,
  onClose,
  children,
  size = 'md',
  dismissable = true,
}: GlassModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissable) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, dismissable, onClose]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-5xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Aceternity blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismissable && onClose()}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal content dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative w-full max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[2rem] border border-outline/20 bg-surface/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl z-10 dark:border-outline/10',
              sizeClasses[size]
            )}
          >
            {dismissable && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 size-9 rounded-2xl bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="size-4" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
