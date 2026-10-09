import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertStatus = 'default' | 'accent' | 'danger' | 'success' | 'warning';

interface AlertContextType {
  status: AlertStatus;
  onClose?: () => void;
}

const AlertContext = createContext<AlertContextType>({ status: 'default' });

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: AlertStatus;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function Alert({ status = 'default', children, className, onClose, ...props }: AlertProps) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  const statusStyles: Record<AlertStatus, string> = {
    default: 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100',
    accent: 'bg-teal-500/10 border-teal-500/25 text-teal-950 dark:text-teal-200',
    success: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-950 dark:text-emerald-200',
    warning: 'bg-amber-500/10 border-amber-500/25 text-amber-950 dark:text-amber-200',
    danger: 'bg-rose-500/10 border-rose-500/25 text-rose-950 dark:text-rose-200',
  };

  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  return (
    <AlertContext.Provider value={{ status, onClose: handleClose }}>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={cn(
          'relative flex items-start gap-3.5 p-4 rounded-2xl border shadow-sm transition-all',
          statusStyles[status],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    </AlertContext.Provider>
  );
}

export function AlertIndicator({ className }: { className?: string }) {
  const { status } = useContext(AlertContext);

  const iconMap: Record<AlertStatus, React.ReactNode> = {
    default: <Info className="size-4 text-slate-500" />,
    accent: <Info className="size-4 text-teal-600 dark:text-teal-400" />,
    success: <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />,
    warning: <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />,
    danger: <AlertCircle className="size-4 text-rose-600 dark:text-rose-400" />,
  };

  const bgMap: Record<AlertStatus, string> = {
    default: 'bg-slate-200/50 dark:bg-slate-700/50',
    accent: 'bg-teal-500/20',
    success: 'bg-emerald-500/20',
    warning: 'bg-amber-500/20',
    danger: 'bg-rose-500/20',
  };

  return (
    <div className={cn('size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', bgMap[status], className)}>
      {iconMap[status]}
    </div>
  );
}

export function AlertContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 min-w-0 pr-2', className)}>{children}</div>;
}

export function AlertTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h4 className={cn('text-xs sm:text-sm font-bold tracking-tight', className)}>{children}</h4>;
}

export function AlertDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-[11px] sm:text-xs opacity-85 mt-0.5 leading-relaxed', className)}>{children}</p>;
}

export function AlertCloseButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { onClose } = useContext(AlertContext);

  return (
    <button
      onClick={onClick || onClose}
      className={cn(
        'size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0',
        className
      )}
      aria-label="Cerrar aviso"
    >
      <X className="size-4" />
    </button>
  );
}

Alert.Indicator = AlertIndicator;
Alert.Content = AlertContent;
Alert.Title = AlertTitle;
Alert.Description = AlertDescription;
Alert.CloseButton = AlertCloseButton;

export function BasicAlertsDemo() {
  return (
    <div className="grid w-full max-w-xl gap-3.5">
      <Alert status="accent">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Nuevas funciones disponibles</Alert.Title>
          <Alert.Description>
            Consulta nuestras últimas actualizaciones incluyendo soporte para modo oscuro y accesibilidad mejorada en FisioMirror.
          </Alert.Description>
        </Alert.Content>
        <Alert.CloseButton />
      </Alert>

      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>No se pudo conectar al servidor</Alert.Title>
          <Alert.Description>
            Tenemos problemas de sincronización con Supabase. Por favor verifica tu conexión de red o continúa en modo offline.
          </Alert.Description>
        </Alert.Content>
        <button className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm shrink-0 active:scale-95">
          Reintentar
        </button>
      </Alert>

      <Alert status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Perfil clínico actualizado con éxito</Alert.Title>
          <Alert.Description>Todos los cambios en tu rutina fueron guardados y cifrados localmente.</Alert.Description>
        </Alert.Content>
        <Alert.CloseButton />
      </Alert>

      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Aviso de Iluminación para Cámara AR</Alert.Title>
          <Alert.Description>Para una detección de articulaciones precisa a 30 FPS, asegúrate de buena iluminación frontal.</Alert.Description>
        </Alert.Content>
        <Alert.CloseButton />
      </Alert>
    </div>
  );
}
