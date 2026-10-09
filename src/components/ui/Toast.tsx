import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useId,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "secondary";

export interface ToastOptions {
  description?: ReactNode;
  timeout?: number;
  duration?: number;
  indicator?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: ToastVariant;
}

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastFunction {
  (message: ReactNode, options?: ToastOptions): string;
  success: (message: ReactNode, options?: ToastOptions) => string;
  error: (message: ReactNode, options?: ToastOptions) => string;
  warning: (message: ReactNode, options?: ToastOptions) => string;
  info: (message: ReactNode, options?: ToastOptions) => string;
  close: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<{
  addToast: (message: ReactNode, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
} | null>(null);

let globalToastHandler: ((message: ReactNode, options?: ToastOptions) => string) | null = null;
let globalCloseHandler: ((id: string) => void) | null = null;
let globalClearHandler: (() => void) | null = null;

/**
 * Función canónica `toast()` estilo HeroUI / Sonner
 * Permite sintaxis directa:
 *   toast("Paciente registrado con éxito")
 *   toast("Cambios guardados", { description: "...", indicator: <Star /> })
 *   toast.success("Ángulo calibrado a 120°")
 */
export const toast: ToastFunction = Object.assign(
  (message: ReactNode, options?: ToastOptions): string => {
    if (globalToastHandler) {
      return globalToastHandler(message, options);
    }
    console.warn("toast() llamado sin <ToastProvider /> montado.");
    return "";
  },
  {
    success: (message: ReactNode, options?: ToastOptions): string => {
      return toast(message, { ...options, variant: "success" });
    },
    error: (message: ReactNode, options?: ToastOptions): string => {
      return toast(message, { ...options, variant: "error" });
    },
    warning: (message: ReactNode, options?: ToastOptions): string => {
      return toast(message, { ...options, variant: "warning" });
    },
    info: (message: ReactNode, options?: ToastOptions): string => {
      return toast(message, { ...options, variant: "info" });
    },
    close: (id: string) => {
      if (globalCloseHandler) globalCloseHandler(id);
    },
    clear: () => {
      if (globalClearHandler) globalClearHandler();
    },
  }
);

interface ToastProviderProps {
  children: ReactNode;
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
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

  // Asignar manejadores globales
  globalToastHandler = addToast;
  globalCloseHandler = removeToast;
  globalClearHandler = clearToasts;

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
          "fixed z-[300] pointer-events-none flex gap-2.5 max-w-full px-4 sm:px-0",
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
          "bg-slate-900/95 dark:bg-slate-950/95 text-white",
          "backdrop-blur-2xl border",
          "shadow-2xl shadow-black/40",
          "min-w-[280px] max-w-[390px] w-full",
          getBorderAndBg()
        )}
      >
        <div className="p-2 rounded-xl shrink-0 mt-0.5 border bg-white/5 border-white/10 flex items-center justify-center">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs sm:text-sm font-bold text-white leading-snug">
            {item.message}
          </p>
          {item.description && (
            <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              {item.description}
            </p>
          )}
          {item.action && (
            <button
              type="button"
              onClick={item.action.onClick}
              className="mt-2 text-xs font-semibold text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors"
            >
              {item.action.label}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="size-6 rounded-lg shrink-0 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </motion.div>
    );
  }
);
ToastItemComponent.displayName = "ToastItemComponent";

/**
 * Hook para acceso dentro de componentes React
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Retornamos la API canónica global como fallback seguro
    return {
      toast,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      close: toast.close,
      clear: toast.clear,
    };
  }

  return {
    toast,
    success: (msg: ReactNode, opts?: ToastOptions) => ctx.addToast(msg, { ...opts, variant: "success" }),
    error: (msg: ReactNode, opts?: ToastOptions) => ctx.addToast(msg, { ...opts, variant: "error" }),
    warning: (msg: ReactNode, opts?: ToastOptions) => ctx.addToast(msg, { ...opts, variant: "warning" }),
    info: (msg: ReactNode, opts?: ToastOptions) => ctx.addToast(msg, { ...opts, variant: "info" }),
    close: ctx.removeToast,
    clear: ctx.clearToasts,
  };
}

export default ToastProvider;
