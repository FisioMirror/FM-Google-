import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from './toastApi';
import { useTranslation } from 'react-i18next';
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Stethoscope } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { useFocusTrap } from "../../hooks/useFocusTrap";

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

  const setIsOpen = useCallback((nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }, [isControlled, onOpenChange]);

  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  // Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

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
    return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
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
  const trapRef = useFocusTrap<HTMLDivElement>();

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
      ref={trapRef}
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
          return React.cloneElement(child as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
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
export interface DrawerClinicalDemoProps {
  patientId?: string;
  patientName?: string;
}

/**
 * Ajustes clinicos de sesion persistidos en public.session_adjustments.
 * Sin paciente seleccionado no permite guardar (no inventa datos).
 */
export function DrawerClinicalDemo({ patientId, patientName }: DrawerClinicalDemoProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [tolerance, setTolerance] = useState(8);
  const [maxReps, setMaxReps] = useState(12);
  const [focus, setFocus] = useState<'movilidad' | 'fuerza' | 'control' | 'dolor'>('movilidad');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastAt, setLastAt] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !patientId) return;
    let alive = true;
    supabase
      .from('session_adjustments')
      .select('tolerancia_grados, repeticiones_max, foco, notas, creado_en')
      .eq('paciente_id', patientId)
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive || !data) return;
        setTolerance(data.tolerancia_grados ?? 8);
        setMaxReps(data.repeticiones_max ?? 12);
        setFocus((data.foco as typeof focus) ?? 'movilidad');
        setNotes(data.notas ?? '');
        setLastAt(data.creado_en ?? null);
      });
    return () => {
      alive = false;
    };
  }, [open, patientId]);

  const handleSave = async () => {
    if (!patientId || !user) return;
    setSaving(true);
    const { error } = await supabase.from('session_adjustments').insert({
      paciente_id: patientId,
      fisio_id: user.id,
      tolerancia_grados: tolerance,
      repeticiones_max: maxReps,
      foco: focus,
      notas: notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      console.error('session_adjustments insert', error);
      toast.error(t('sa.error'));
      return;
    }
    setLastAt(new Date().toISOString());
    toast.success(t('sa.saved'));
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <Drawer placement="right" isOpen={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <Button
            variant="secondary"
            disabled={!patientId}
            title={patientId ? undefined : t('sa.noPatient')}
            className="gap-2 shadow-xs border-primary/20 hover:border-primary/50"
          >
            <SlidersHorizontal className="size-4 text-primary" />
            <span>{t('sa.open')}</span>
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
                    <Drawer.Heading>{t('sa.title')}</Drawer.Heading>
                    <p className="text-xs text-muted">{patientName || t('sa.subtitle')}</p>
                  </div>
                </div>
                <Drawer.CloseTrigger />
              </Drawer.Header>

              <Drawer.Body className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-on-surface">{t('sa.tolerance')}</label>
                    <span className="text-xs font-mono font-black text-primary">{tolerance}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={45}
                    step={1}
                    value={tolerance}
                    aria-label={t('sa.tolerance')}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <p className="text-[11px] text-muted">{t('sa.toleranceHint')}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-on-surface">{t('sa.reps')}</label>
                    <span className="text-xs font-mono font-black text-primary">{maxReps}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={maxReps}
                    aria-label={t('sa.reps')}
                    onChange={(e) => setMaxReps(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface block mb-2">{t('sa.focus')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['movilidad', 'fuerza', 'control', 'dolor'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFocus(f)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          focus === f
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-surface border-outline/20 text-on-surface hover:border-teal-500/40'
                        }`}
                      >
                        {t(`sa.focus_${f}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface block mb-2">{t('sa.notes')}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('sa.notesPlaceholder')}
                    rows={3}
                    className="w-full rounded-xl bg-surface border border-outline/20 px-3 py-2 text-sm text-on-surface"
                  />
                </div>

                {lastAt && (
                  <p className="text-[11px] text-muted">
                    {t('sa.lastSaved', { date: new Date(lastAt).toLocaleDateString() })}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSave} disabled={saving || !patientId}>
                    {saving ? t('sa.saving') : t('sa.save')}
                  </Button>
                </div>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Container>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
