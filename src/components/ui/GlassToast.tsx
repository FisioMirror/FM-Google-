import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

type GlassToastType = 'success' | 'error' | 'info' | 'warning';

interface GlassToastItem {
  id: number;
  message: string;
  type: GlassToastType;
}

interface GlassToastApi {
  show: (message: string, type?: GlassToastType) => void;
}

const GlassToastContext = createContext<GlassToastApi | null>(null);

export function GlassToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<GlassToastItem[]>([]);

  const show = useCallback((message: string, type: GlassToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const iconMap: Record<GlassToastType, string> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  return (
    <GlassToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[250] flex flex-col-reverse gap-2.5 items-end pointer-events-none w-full max-w-sm px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 80) dismiss(toast.id);
              }}
              className={cn(
                'flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl backdrop-blur-2xl',
                'shadow-2xl shadow-black/40 min-w-[280px] max-w-[380px] w-full pointer-events-auto',
                'bg-slate-900/95 dark:bg-slate-950/95 text-white border border-white/10',
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-xl shrink-0 border flex items-center justify-center',
                  toast.type === 'success' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                  toast.type === 'error' && 'bg-red-500/15 text-red-400 border-red-500/30',
                  toast.type === 'warning' && 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                  toast.type === 'info' && 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
                )}
              >
                <span
                  className="material-symbols-outlined text-lg leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {iconMap[toast.type]}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug text-white">
                {toast.message}
              </span>
              <button
                onClick={() => dismiss(toast.id)}
                className="size-6 rounded-lg shrink-0 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar notificación"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassToastContext.Provider>
  );
}

export function useGlassToast(): GlassToastApi {
  const ctx = useContext(GlassToastContext);
  if (!ctx) throw new Error('useGlassToast debe usarse dentro de GlassToastProvider');
  return ctx;
}
