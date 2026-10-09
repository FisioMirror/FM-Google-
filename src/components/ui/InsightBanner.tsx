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
            'relative overflow-hidden rounded-3xl p-5 sm:p-6 border border-teal-500/25 bg-gradient-to-r from-teal-950/80 via-slate-900/90 to-teal-950/80 text-white shadow-xl backdrop-blur-xl',
            variant === 'secondary' && 'border-cyan-500/25 from-cyan-950/80 via-slate-900/90 to-cyan-950/80',
            className
          )}
        >
          <BorderBeam size={100} duration={8} colorFrom="#14b8a6" colorTo="#0ea5e9" />

          <div className="relative z-10 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-11 sm:size-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-sm">
                {icon || <Sparkles className="size-5 text-teal-300 animate-pulse" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    {title}
                  </h4>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/30">
                    <span className="size-1 rounded-full bg-teal-400 animate-pulse" /> IA Clínica
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed max-w-3xl">
                  {description}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="size-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Cerrar notificación"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
