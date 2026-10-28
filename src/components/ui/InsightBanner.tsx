import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { BorderBeam } from './BorderBeam';
import { cn } from '../../lib/utils';

interface InsightBannerProps {
  title: string;
  description: string;
  icon?: ReactNode;
  onDismiss?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

/**
 * InsightBanner (Elevated with Magic UI BorderBeam & Glassmorphism)
 */
export function InsightBanner({
  title,
  description,
  icon,
  onDismiss,
  variant = 'primary',
  className,
}: InsightBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className={cn(
            'relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-teal-500/25 bg-gradient-to-r from-teal-950/80 via-slate-900/90 to-teal-950/80 text-white shadow-xl backdrop-blur-xl',
            variant === 'secondary' && 'border-cyan-500/25 from-cyan-950/80 via-slate-900/90 to-cyan-950/80',
            className
          )}
        >
          <BorderBeam size={80} duration={8} colorFrom="#14b8a6" colorTo="#0ea5e9" />

          <div className="relative z-10 flex items-start sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-4 min-w-0">
              <div className="size-9 sm:size-12 rounded-xl sm:rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-sm">
                {icon || <Sparkles className="size-4 sm:size-5 text-teal-300 animate-pulse" />}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h4 className="text-xs sm:text-base font-extrabold text-white tracking-tight truncate">
                    {title}
                  </h4>
                  <span className="hidden xs:inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-teal-300 bg-teal-500/20 px-1.5 sm:px-2 py-0.5 rounded-full border border-teal-500/30 shrink-0">
                    <span className="size-1 rounded-full bg-teal-400 animate-pulse" /> IA Clínica
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm text-teal-100/80 leading-snug sm:leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-none">
                  {description}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="size-7 sm:size-8 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Cerrar notificación"
            >
              <X className="size-3.5 sm:size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
