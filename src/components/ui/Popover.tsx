import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { Activity, Info, CheckCircle2 } from "lucide-react";

interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  placement: "top" | "bottom" | "left" | "right";
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = createContext<PopoverContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
  close: () => {},
  placement: "bottom",
  triggerRef: { current: null },
});

export interface PopoverProps {
  children: React.ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: "top" | "bottom" | "left" | "right";
}

export function Popover({
  children,
  isOpen: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  // Esc key and click outside listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Separate trigger child and content child
  // If first child is not Popover.Trigger, treat it as trigger
  let triggerChild: React.ReactNode = null;
  let contentChild: React.ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === PopoverTrigger) {
        triggerChild = child;
      } else if (child.type === PopoverContent) {
        contentChild = child;
      } else if (!triggerChild) {
        triggerChild = child;
      } else {
        contentChild = child;
      }
    }
  });

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, toggle, close, placement, triggerRef }}>
      <div ref={triggerRef} className="relative inline-block text-left">
        {triggerChild && (
          <div onClick={toggle} className="cursor-pointer inline-flex">
            {triggerChild}
          </div>
        )}
        <AnimatePresence>{isOpen && contentChild}</AnimatePresence>
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { toggle } = useContext(PopoverContext);
  return (
    <div onClick={toggle} className={cn("inline-flex cursor-pointer select-none", className)}>
      {children}
    </div>
  );
}

export function PopoverContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { placement } = useContext(PopoverContext);

  const placementStyles: Record<string, string> = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: placement === "bottom" ? -4 : 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: placement === "bottom" ? -4 : 4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "absolute z-50 min-w-[240px] max-w-xs",
        placementStyles[placement],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function PopoverDialog({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tooltip"
      className={cn(
        "p-4 rounded-xl md:rounded-2xl shadow-xl shadow-slate-950/10 dark:shadow-teal-950/20",
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
        "border border-slate-200/90 dark:border-slate-800/90",
        "text-on-surface",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PopoverHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 font-bold text-sm text-on-surface tracking-tight", className)}>
      <Activity className="size-4 text-primary shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// Compound attachment
Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Dialog = PopoverDialog;
Popover.Heading = PopoverHeading;

/**
 * PopoverMetricDemo con ángulo articular dinámico y semáforo biomecánico
 */
export function PopoverMetricDemo() {
  const [selectedJoint, setSelectedJoint] = useState<"rodilla" | "hombro" | "codo">("rodilla");

  const jointData = {
    rodilla: {
      name: "Flexión de Rodilla",
      currentAngle: "88°",
      optimalRange: "85° - 90°",
      status: "Excelente",
      badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Postura correcta detectada por MediaPipe. Distribución simétrica de carga patelar.",
    },
    hombro: {
      name: "Abducción Escapular",
      currentAngle: "112°",
      optimalRange: "110° - 120°",
      status: "En Rango",
      badgeColor: "text-teal-500 bg-teal-500/10 border-teal-500/20",
      description: "Compensación de trapecio mínima. Rango biomecánico fisiológico alcanzado.",
    },
    codo: {
      name: "Extensión de Codo",
      currentAngle: "172°",
      optimalRange: "175° - 180°",
      status: "Ligero Déficit",
      badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Ligera flexión residual de 8°. Realizar fase excéntrica con ritmo controlado.",
    },
  };

  const current = jointData[selectedJoint];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-1.5 p-1 bg-surface dark:bg-slate-800/60 rounded-xl border border-border/50 text-xs">
        {(["rodilla", "hombro", "codo"] as const).map((joint) => (
          <button
            key={joint}
            onClick={() => setSelectedJoint(joint)}
            className={cn(
              "px-3 py-1.5 rounded-lg capitalize font-medium transition-all duration-200",
              selectedJoint === joint
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            )}
          >
            {joint}
          </button>
        ))}
      </div>

      <Popover>
        <Button variant="secondary" className="gap-2 shadow-xs border-primary/20 hover:border-primary/50">
          <Activity className="size-4 text-primary" />
          <span>Ver Ángulo ({current.currentAngle})</span>
        </Button>
        <Popover.Content className="w-72">
          <Popover.Dialog>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
              <Popover.Heading>{current.name}</Popover.Heading>
              <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full border", current.badgeColor)}>
                {current.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Ángulo actual:</span>
                <span className="font-bold text-on-surface text-sm">{current.currentAngle}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Rango óptimo:</span>
                <span className="font-semibold text-primary">{current.optimalRange}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-border/40">
                {current.description}
              </p>
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}
