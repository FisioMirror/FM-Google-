import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Rocket } from "@gravity-ui/icons";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface ModalContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  setIsOpen: () => {},
  open: () => {},
  close: () => {},
});

export interface ModalProps {
  children: React.ReactNode;
  isOpen?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Modal({ children, isOpen: controlledIsOpen, open: controlledOpenAlias, defaultOpen = false, onOpenChange }: ModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const controlledOpen = controlledIsOpen !== undefined ? controlledIsOpen : controlledOpenAlias;
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <ModalContext.Provider value={{ isOpen, setIsOpen, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

export function ModalTrigger({
  children,
  className,
  asChild,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const { open } = useContext(ModalContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: (e: React.MouseEvent) => {
        (children.props as { onClick?: (e: React.MouseEvent) => void })?.onClick?.(e);
        open();
      },
    });
  }

  return (
    <span onClick={open} className={cn("inline-flex cursor-pointer", className)}>
      {children}
    </span>
  );
}

export function ModalBackdrop({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen } = useContext(ModalContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn("fixed inset-0 z-50 overflow-y-auto", className)}>
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export function ModalContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const { close } = useContext(ModalContext);

  return (
    <div className={cn("min-h-screen px-4 flex items-center justify-center relative", className)}>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={close}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export function ModalDialog({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "relative w-full max-w-lg z-10 p-6 md:p-8 rounded-2xl md:rounded-3xl",
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
        "border border-slate-200/80 dark:border-slate-800/80",
        "shadow-2xl shadow-primary/10 dark:shadow-teal-950/40 text-foreground",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function ModalCloseTrigger({ className }: { className?: string }) {
  const { close } = useContext(ModalContext);

  return (
    <button
      type="button"
      onClick={close}
      className={cn(
        "absolute top-5 right-5 p-2 rounded-xl text-muted hover:text-foreground",
        "bg-surface/60 dark:bg-slate-800/60 hover:bg-surface dark:hover:bg-slate-800",
        "border border-border/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40",
        className
      )}
      aria-label="Cerrar modal"
    >
      <X className="size-4.5" />
    </button>
  );
}

export function ModalHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3.5 mb-4 pr-8", className)}>
      {children}
    </div>
  );
}

export function ModalIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center size-11 rounded-xl shrink-0",
        "bg-primary/10 text-primary border border-primary/20 shadow-xs",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ModalHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg md:text-xl font-bold tracking-tight text-on-surface", className)}>
      {children}
    </h3>
  );
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 space-y-3", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { close } = useContext(ModalContext);

  // If children has slot="close", attach close action
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-border/40", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.props as { slot?: string })?.slot === "close") {
          return React.cloneElement(child as React.ReactElement<{ onClick?: () => void }>, {
            onClick: (e: React.MouseEvent) => {
              (child.props as { onClick?: (e: React.MouseEvent) => void })?.onClick?.(e);
              close();
            },
          });
        }
        return child;
      })}
    </div>
  );
}

// Attach subcomponents for compound syntax: Modal.Backdrop, Modal.Dialog, etc.
Modal.Trigger = ModalTrigger;
Modal.Backdrop = ModalBackdrop;
Modal.Container = ModalContainer;
Modal.Dialog = ModalDialog;
Modal.CloseTrigger = ModalCloseTrigger;
Modal.Header = ModalHeader;
Modal.Icon = ModalIcon;
Modal.Heading = ModalHeading;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

/**
 * CustomModalDemo con lógica interactiva real
 */
export function CustomModalDemo() {
  const [sensitivity, setSensitivity] = useState(85);
  const [arOverlays, setArOverlays] = useState(true);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSave = () => {
    setSavedStatus(`Parámetros calibrados: Sensibilidad ${sensitivity}%, AR ${arOverlays ? "Activado" : "Desactivado"}`);
    setTimeout(() => setSavedStatus(null), 3500);
  };

  return (
    <div className="space-y-3">
      <Modal>
        <Modal.Trigger asChild>
          <Button variant="secondary" className="shadow-xs hover:border-primary/50">
            Abrir Modal de Configuración
          </Button>
        </Modal.Trigger>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[420px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-primary/10 text-primary">
                  <Rocket className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Configuración de FisioMirror</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Ajusta los parámetros del análisis biomecánico en tiempo real y la sensibilidad de la cámara para la sesión activa.
                </p>

                <div className="p-3.5 rounded-xl bg-surface/80 dark:bg-slate-800/60 border border-border/60 space-y-3 mt-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-on-surface">
                      <span>Sensibilidad MediaPipe</span>
                      <span className="text-primary font-bold">{sensitivity}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={sensitivity}
                      onChange={(e) => setSensitivity(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <label className="flex items-center justify-between cursor-pointer pt-1">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Superposición de Malla Biomecánica
                    </span>
                    <input
                      type="checkbox"
                      checked={arOverlays}
                      onChange={(e) => setArOverlays(e.target.checked)}
                      className="rounded text-primary focus:ring-primary/40 size-4 cursor-pointer"
                    />
                  </label>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" slot="close" onClick={handleSave}>
                  Guardar Cambios
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {savedStatus && (
        <div className="text-xs px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium animate-fadeIn">
          ✓ {savedStatus}
        </div>
      )}
    </div>
  );
}
