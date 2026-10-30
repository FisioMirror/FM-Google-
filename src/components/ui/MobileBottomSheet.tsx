import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springBottomSheet } from '@/lib/motionVariants';


export type BottomSheetSnapPoint = 'peek' | 'medium' | 'full';

export interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  snapPoint?: BottomSheetSnapPoint;
  onSnapPointChange?: (snap: BottomSheetSnapPoint) => void;
  allowedSnapPoints?: BottomSheetSnapPoint[];
  variant?: 'default' | 'pastel-sky' | 'pastel-mint' | 'pastel-lavender';
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
}

const snapHeights: Record<BottomSheetSnapPoint, string> = {
  peek: 'max-h-[38vh] min-h-[260px]',
  medium: 'max-h-[68vh] min-h-[460px]',
  full: 'max-h-[92vh] min-h-[85vh]',
};

/**
 * MobileBottomSheet:
 * Cajón inferior deslizable ultra-fluido para sustituir el scroll infinito en móviles.
 * Cuenta con niveles de altura interactivos (snap points), arrastre gestual con físicas de resorte,
 * soporte de modo oscuro y armonización con la paleta pastel clínica de FisioMirror.
 */
export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  snapPoint: controlledSnap,
  onSnapPointChange,
  allowedSnapPoints = ['peek', 'medium', 'full'],
  variant = 'default',
  children,
  footerActions,
  className,
}: MobileBottomSheetProps) {
  const [internalSnap, setInternalSnap] = useState<BottomSheetSnapPoint>(
    controlledSnap || (allowedSnapPoints.includes('medium') ? 'medium' : allowedSnapPoints[0])
  );
  const activeSnap = controlledSnap !== undefined ? controlledSnap : internalSnap;
  const sheetRef = useRef<HTMLDivElement>(null);

  // Sync internal state when controlled changes
  useEffect(() => {
    if (controlledSnap) setInternalSnap(controlledSnap);
  }, [controlledSnap]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const changeSnap = (newSnap: BottomSheetSnapPoint) => {
    setInternalSnap(newSnap);
    onSnapPointChange?.(newSnap);
  };

  const cycleSnap = (direction: 'up' | 'down') => {
    const order: BottomSheetSnapPoint[] = ['peek', 'medium', 'full'].filter((s) =>
      allowedSnapPoints.includes(s as BottomSheetSnapPoint)
    ) as BottomSheetSnapPoint[];
    const currentIndex = order.indexOf(activeSnap);
    if (direction === 'up' && currentIndex < order.length - 1) {
      changeSnap(order[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      changeSnap(order[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex === 0) {
      onClose();
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offsetThreshold = 120;
    const velocityThreshold = 400;

    // Arrastre rápido hacia abajo -> cerrar o bajar snap
    if (info.velocity.y > velocityThreshold || info.offset.y > offsetThreshold) {
      if (activeSnap === 'full' && allowedSnapPoints.includes('medium')) {
        changeSnap('medium');
      } else if (activeSnap === 'medium' && allowedSnapPoints.includes('peek')) {
        changeSnap('peek');
      } else {
        onClose();
      }
    }
    // Arrastre rápido hacia arriba -> subir snap
    else if (info.velocity.y < -velocityThreshold || info.offset.y < -offsetThreshold) {
      if (activeSnap === 'peek' && allowedSnapPoints.includes('medium')) {
        changeSnap('medium');
      } else if (activeSnap === 'medium' && allowedSnapPoints.includes('full')) {
        changeSnap('full');
      }
    }
  };

  const variantStyles = {
    default: 'bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800',
    'pastel-sky': cn('bg-gradient-to-b from-sky-50/95 via-white/95 to-white/95 dark:from-sky-950/80 dark:via-slate-900/95 dark:to-slate-900/95 border-sky-300/50 dark:border-sky-500/30'),
    'pastel-mint': cn('bg-gradient-to-b from-teal-50/95 via-white/95 to-white/95 dark:from-teal-950/80 dark:via-slate-900/95 dark:to-slate-900/95 border-teal-300/50 dark:border-teal-500/30'),
    'pastel-lavender': cn('bg-gradient-to-b from-indigo-50/95 via-white/95 to-white/95 dark:from-indigo-950/80 dark:via-slate-900/95 dark:to-slate-900/95 border-indigo-300/50 dark:border-indigo-500/30'),
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop Glassmorphic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 dark:bg-black/65 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Bottom Sheet Surface */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springBottomSheet}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative z-10 w-full max-w-2xl mx-auto rounded-t-[2.5rem] border-t border-x shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden transition-[max-height] duration-300 ease-out pb-safe',
              snapHeights[activeSnap],
              variantStyles[variant],
              className
            )}
          >
            {/* Drag Handle Bar */}
            <div
              className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none group touch-none"
              onClick={() => cycleSnap('up')}
            >
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-teal-500 transition-colors" />
            </div>

            {/* Header */}
            {(title || icon) && (
              <div className="px-5 sm:px-6 pt-1 pb-3 flex items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="size-10 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/25">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Snap point controls */}
                  {allowedSnapPoints.length > 1 && (
                    <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => cycleSnap('up')}
                        disabled={activeSnap === 'full'}
                        aria-label="Expandir cajón"
                        className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => cycleSnap('down')}
                        aria-label="Reducir cajón"
                        className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar cajón"
                    className="size-8 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 overscroll-contain">
              {children}
            </div>

            {/* Optional Sticky Footer Actions */}
            {footerActions && (
              <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
                {footerActions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
