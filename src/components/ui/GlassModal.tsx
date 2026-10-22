import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFocusTrap } from '../../hooks/useFocusTrap';

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
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

  const { t } = useTranslation();
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
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
          {/* Aceternity blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismissable && onClose()}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal content dialog */}
          <motion.div
            ref={trapRef}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative w-full max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-t-3xl sm:rounded-3xl border border-outline-variant/60 bg-surface/95 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-8 sm:pb-8 shadow-elevated backdrop-blur-xl z-10 dark:border-outline-variant/60',
              sizeClasses[size]
            )}
          >
            {dismissable && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                aria-label={t('uix.glassCloseModal')}
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
