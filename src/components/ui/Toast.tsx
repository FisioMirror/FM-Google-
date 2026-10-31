import React, { useCallback, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { ToastContext, setToastHandlers, type ToastOptions, type ToastItem } from "./toastApi";

export type { ToastVariant, ToastOptions, ToastItem, ToastFunction } from "./toastApi";

export type ToastPlacement =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastProviderProps {
  children: ReactNode;
  placement?: ToastPlacement;
}

export function ToastProvider({ children, placement = "bottom-right" }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (message: ReactNode, options?: ToastOptions): string => {
      const id = "toast-" + Math.random().toString(36).substring(2, 9);
      const variant = options?.variant || "default";
      const item: ToastItem = {
        id,
        variant,
        message,
        description: options?.description,
        indicator: options?.indicator,
        action: options?.action,
      };

      setToasts((prev) => [...prev, item]);

      const timeout = options?.duration || options?.timeout || 4500;
      if (timeout > 0) {
        setTimeout(() => {
          removeToast(id);
        }, timeout);
      }

      return id;
    },
    [removeToast]
  );

  // Conectar la API global (toast.success, etc.) con este provider
  setToastHandlers({ addToast, removeToast, clearToasts });

  const placementClasses: Record<string, string> = {
    "bottom-right": "bottom-5 right-5 sm:bottom-6 sm:right-6 items-end flex-col-reverse",
    "bottom-left": "bottom-5 left-5 sm:bottom-6 sm:left-6 items-start flex-col-reverse",
    "top-right": "top-5 right-5 sm:top-6 sm:right-6 items-end flex-col",
    "top-left": "top-5 left-5 sm:top-6 sm:left-6 items-start flex-col",
    "top-center": "top-5 left-1/2 -translate-x-1/2 items-center flex-col",
    "bottom-center": "bottom-5 left-1/2 -translate-x-1/2 items-center flex-col-reverse",
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearToasts }}>
      {children}
      <div
        aria-live="polite"
        className={cn(
          "toast-anchor fixed z-[300] pointer-events-none flex gap-2.5 max-w-full px-4 sm:px-0",
          placementClasses[placement] || placementClasses["bottom-right"]
        )}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <ToastItemComponent key={item.id} toast={item} onClose={() => removeToast(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export interface ToastItemComponentProps {
  toast: ToastItem;
  onClose: () => void;
}

export const ToastItemComponent = React.forwardRef<HTMLDivElement, ToastItemComponentProps>(
  ({ toast: item, onClose }, ref) => {
    const getIcon = () => {
      if (item.indicator) {
        return item.indicator;
      }
      switch (item.variant) {
        case "success":
          return <CheckCircle2 className="size-4 text-emerald-400" />;
        case "error":
          return <AlertCircle className="size-4 text-red-400" />;
        case "warning":
          return <AlertTriangle className="size-4 text-amber-400" />;
        case "info":
          return <Info className="size-4 text-cyan-400" />;
        case "secondary":
        case "default":
        default:
          return <CheckCircle2 className="size-4 text-teal-400" />;
      }
    };

    const getBorderAndBg = () => {
      switch (item.variant) {
        case "success":
          return "border-emerald-500/30 shadow-emerald-500/10";
        case "error":
          return "border-red-500/30 shadow-red-500/10";
        case "warning":
          return "border-amber-500/30 shadow-amber-500/10";
        case "info":
          return "border-cyan-500/30 shadow-cyan-500/10";
        default:
          return "border-teal-500/30 shadow-teal-500/10";
      }
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 16, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.94, transition: { duration: 0.15 } }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className={cn(
          "pointer-events-auto group relative",
          "flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl",
          "bg-surface/95 dark:bg-surface-container/95 text-on-surface",
          "backdrop-blur-2xl border",
          "shadow-elevated shadow-black/10 dark:shadow-black/40",
          "min-w-[280px] max-w-[390px] w-full",
          getBorderAndBg()
        )}
      >
        <div className="p-2 rounded-xl shrink-0 mt-0.5 border bg-surface-container-high/60 dark:bg-white/5 border-outline-variant/40 dark:border-white/10 flex items-center justify-center">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs sm:text-sm font-bold text-on-surface leading-snug">
            {item.message}
          </p>
          {item.description && (
            <p className="mt-1 text-[11px] sm:text-xs text-on-surface-variant leading-relaxed">
              {item.description}
            </p>
          )}
          {item.action && (
            <button
              type="button"
              onClick={item.action.onClick}
              className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              {item.action.label}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="size-6 rounded-lg shrink-0 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </motion.div>
    );
  }
);
ToastItemComponent.displayName = "ToastItemComponent";
