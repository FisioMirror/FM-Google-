import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface AlertDialogContextType {
  open: boolean;
  setOpen: (val: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType>({
  open: false,
  setOpen: () => {},
});

export function AlertDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = useContext(AlertDialogContext);

  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(true),
    });
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function AlertDialogBackdrop({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useContext(AlertDialogContext);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export function AlertDialogContainer({ children }: { children: React.ReactNode }) {
  return <div className="relative z-10 w-full flex justify-center">{children}</div>;
}

export function AlertDialogDialog({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 16 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={cn(
        'relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-4',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function AlertDialogCloseTrigger({ className }: { className?: string }) {
  const { setOpen } = useContext(AlertDialogContext);

  return (
    <button
      onClick={() => setOpen(false)}
      className={cn(
        'absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
        className
      )}
      aria-label="Cerrar diálogo"
    >
      <X className="w-4 h-4" />
    </button>
  );
}

export function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-start gap-3.5', className)}>{children}</div>;
}

export function AlertDialogIcon({ status = 'danger' }: { status?: 'danger' | 'warning' | 'info' }) {
  return (
    <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-500/20 shrink-0">
      <ShieldAlert className="size-6" />
    </div>
  );
}

export function AlertDialogHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-bold text-slate-900 dark:text-white', className)}>{children}</h3>;
}

export function AlertDialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-xs text-slate-600 dark:text-slate-400 leading-relaxed', className)}>{children}</div>;
}

export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  const { setOpen } = useContext(AlertDialogContext);

  return (
    <div className={cn('flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.props as { slot?: string }).slot === 'close') {
          return React.cloneElement(child as React.ReactElement<{ onClick?: () => void }>, {
            onClick: () => {
              (child.props as { onClick?: () => void }).onClick?.();
              setOpen(false);
            },
          });
        }
        return child;
      })}
    </div>
  );
}

AlertDialog.Backdrop = AlertDialogBackdrop;
AlertDialog.Container = AlertDialogContainer;
AlertDialog.Dialog = AlertDialogDialog;
AlertDialog.CloseTrigger = AlertDialogCloseTrigger;
AlertDialog.Header = AlertDialogHeader;
AlertDialog.Icon = AlertDialogIcon;
AlertDialog.Heading = AlertDialogHeading;
AlertDialog.Body = AlertDialogBody;
AlertDialog.Footer = AlertDialogFooter;

export function DeleteProjectDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" icon={<AlertCircle className="w-4 h-4" />}>
          Eliminar Registro Clínico
        </Button>
      </AlertDialogTrigger>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[420px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <div>
                <AlertDialog.Heading>¿Eliminar este registro permanentemente?</AlertDialog.Heading>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Operación Irreversible</span>
              </div>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Esta acción eliminará todos los datos asociados de la base de datos de Supabase y de la memoria local, incluyendo métricas biomecánicas y notas médicas.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="outline" size="sm">
                Cancelar
              </Button>
              <Button slot="close" variant="destructive" size="sm">
                Confirmar y Eliminar
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
