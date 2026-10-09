import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Stethoscope, ChevronRight, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export type DrawerPlacement = "left" | "right" | "top" | "bottom";

interface DrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  placement: DrawerPlacement;
}

const DrawerContext = createContext<DrawerContextType>({
  isOpen: false,
  setIsOpen: () => {},
  open: () => {},
  close: () => {},
  placement: "right",
});

export interface DrawerProps {
  children: React.ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DrawerPlacement;
}

export function Drawer({
  children,
  isOpen: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = "right",
}: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
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

  // Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <DrawerContext.Provider value={{ isOpen, setIsOpen, open, close, placement }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerTrigger({
  children,
  className,
  asChild,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const { open } = useContext(DrawerContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: (e: React.MouseEvent) => {
        (children.props as { onClick?: (e: React.MouseEvent) => void })?.onClick?.(e);
        open();
      },
    });
  }

  return (
    <span onClick={open} className={cn("inline-flex cursor-pointer select-none", className)}>
      {children}
    </span>
  );
}

export function DrawerBackdrop({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen, close } = useContext(DrawerContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn("fixed inset-0 z-50 overflow-hidden", className)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export function DrawerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const { placement } = useContext(DrawerContext);

  const containerPlacements: Record<DrawerPlacement, string> = {
    right: "inset-y-0 right-0 flex pl-10 max-w-full justify-end",
    left: "inset-y-0 left-0 flex pr-10 max-w-full justify-start",
    top: "inset-x-0 top-0 flex pb-10 max-h-full justify-start",
    bottom: "inset-x-0 bottom-0 flex pt-10 max-h-full justify-end",
  };

  return (
    <div className={cn("fixed z-50 pointer-events-none", containerPlacements[placement], className)}>
      {children}
    </div>
  );
}

export function DrawerDialog({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { placement } = useContext(DrawerContext);

  const slideVariants = {
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    top: { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
    bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  };

  const roundedClasses: Record<DrawerPlacement, string> = {
    right: "rounded-l-2xl md:rounded-l-3xl border-l",
    left: "rounded-r-2xl md:rounded-r-3xl border-r",
    top: "rounded-b-2xl md:rounded-b-3xl border-b",
    bottom: "rounded-t-2xl md:rounded-t-3xl border-t",
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={slideVariants[placement].initial}
      animate={slideVariants[placement].animate}
      exit={slideVariants[placement].exit}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "pointer-events-auto relative w-screen max-w-md h-full flex flex-col",
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl",
        "border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-950/20",
        roundedClasses[placement],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function DrawerCloseTrigger({ className }: { className?: string }) {
  const { close } = useContext(DrawerContext);

  return (
    <button
      type="button"
      onClick={close}
      className={cn(
        "p-2 rounded-xl text-muted hover:text-foreground",
        "bg-surface/60 dark:bg-slate-800/60 hover:bg-surface dark:hover:bg-slate-800",
        "border border-border/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40",
        className
      )}
      aria-label="Cerrar panel lateral"
    >
      <X className="size-4.5" />
    </button>
  );
}

export function DrawerHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-6 border-b border-border/40 flex items-center justify-between gap-4", className)}>
      {children}
    </div>
  );
}

export function DrawerIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center size-10 rounded-xl shrink-0",
        "bg-primary/10 text-primary border border-primary/20",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DrawerHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg font-bold tracking-tight text-on-surface flex-1", className)}>
      {children}
    </h3>
  );
}

export function DrawerBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-6 flex-1 overflow-y-auto space-y-4 text-sm text-neutral-600 dark:text-neutral-300", className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { close } = useContext(DrawerContext);

  return (
    <div className={cn("p-6 border-t border-border/40 flex items-center justify-end gap-3 bg-surface/30 dark:bg-slate-900/30", className)}>
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

// Attach subcomponents
Drawer.Trigger = DrawerTrigger;
Drawer.Backdrop = DrawerBackdrop;
Drawer.Container = DrawerContainer;
Drawer.Dialog = DrawerDialog;
Drawer.CloseTrigger = DrawerCloseTrigger;
Drawer.Header = DrawerHeader;
Drawer.Icon = DrawerIcon;
Drawer.Heading = DrawerHeading;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;

/**
 * DrawerClinicalDemo con formulario clínico y métricas de fisioterapia en tiempo real
 */
export function DrawerClinicalDemo() {
  const [toleranceLevel, setToleranceLevel] = useState("Media");
  const [maxReps, setMaxReps] = useState(12);
  const [notes, setNotes] = useState("Paciente con buena evolución en rotación externa. Evitar abducción superior a 110° sin apoyo.");
  const [alertSaved, setAlertSaved] = useState(false);

  const handleSave = () => {
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 3000);
  };

  return (
    <div className="space-y-3">
      <Drawer placement="right">
        <Drawer.Trigger asChild>
          <Button variant="secondary" className="gap-2 shadow-xs border-primary/20 hover:border-primary/50">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>Abrir Ajustes Clínicos (Drawer)</span>
          </Button>
        </Drawer.Trigger>
        <Drawer.Backdrop>
          <Drawer.Container>
            <Drawer.Dialog className="max-w-md">
              <Drawer.Header>
                <div className="flex items-center gap-3">
                  <Drawer.Icon>
                    <Stethoscope className="size-5" />
                  </Drawer.Icon>
                  <div>
                    <Drawer.Heading>Ajustes de Sesión</Drawer.Heading>
                    <p className="text-xs text-muted">Protocolo de Rehabilitación Hombro</p>
                  </div>
                </div>
                <Drawer.CloseTrigger />
              </Drawer.Header>

              <Drawer.Body>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs">
                    <span className="font-bold text-teal-700 dark:text-teal-300 block mb-1">
                      Paciente Vinculado: Carlos Mendoza (ID: #FM-4029)
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Sesión 6 de 14. Diagnóstico: Tendinopatía supraespinosa derecha con limitación articular leve.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-2">
                      Tolerancia al Esfuerzo Biomecánico
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Baja", "Media", "Alta"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setToleranceLevel(level)}
                          className={cn(
                            "py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-200",
                            toleranceLevel === level
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-surface dark:bg-slate-800 border-border/60 text-muted hover:text-foreground"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-on-surface mb-2">
                      <span>Repeticiones Objetivo por Serie</span>
                      <span className="text-primary font-bold">{maxReps} reps</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="20"
                      value={maxReps}
                      onChange={(e) => setMaxReps(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Observaciones Clínicas del Terapeuta
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-xl bg-surface/70 dark:bg-slate-800/70 border border-border/60 text-xs text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </Drawer.Body>

              <Drawer.Footer>
                <Button slot="close" className="w-full" onClick={handleSave}>
                  Aplicar Parámetros a la Sesión
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Container>
        </Drawer.Backdrop>
      </Drawer>

      {alertSaved && (
        <div className="text-xs px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium animate-fadeIn">
          ✓ Parámetros actualizados: {maxReps} repeticiones, tolerancia {toleranceLevel}.
        </div>
      )}
    </div>
  );
}
