import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[250] flex flex-col-reverse gap-2.5 items-end pointer-events-none w-full sm:max-w-sm px-0">
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
                'flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl backdrop-blur-xl',
                'shadow-elevated shadow-black/25 min-w-[280px] max-w-[380px] w-full pointer-events-auto',
                'glass-toast text-on-surface',
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-xl shrink-0 border flex items-center justify-center border-outline-variant/40 dark:border-outline-variant/60',
                  toast.type === 'success' && 'bg-success/15 text-success border-success/30',
                  toast.type === 'error' && 'bg-danger/15 text-danger border-danger/30',
                  toast.type === 'warning' && 'bg-warning/15 text-warning border-warning/30',
                  toast.type === 'info' && 'bg-info/15 text-info border-info/30',
                )}
              >
                <span
                  className="material-symbols-outlined text-lg leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {iconMap[toast.type]}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug text-on-surface">
                {toast.message}
              </span>
              <button
                onClick={() => dismiss(toast.id)}
                className="size-8 min-h-[44px] min-w-[44px] rounded-lg shrink-0 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-on-surface/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={t('uix.gtCloseNotification')}
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
