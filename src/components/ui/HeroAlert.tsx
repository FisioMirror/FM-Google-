import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    default: 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-on-surface',
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
    default: <Info className="size-4 text-on-surface-variant" />,
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
  return <p className={cn('text-xs sm:text-xs opacity-85 mt-0.5 leading-relaxed', className)}>{children}</p>;
}

export function AlertCloseButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { onClose } = useContext(AlertContext);
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick || onClose}
      className={cn(
        'size-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0',
        className
      )}
      aria-label={t('haCloseAlert')}
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
  const { t } = useTranslation();
  return (
    <div className="grid w-full max-w-xl gap-3.5">
      <Alert status="accent">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t('haTitle1')}</Alert.Title>
          <Alert.Description>
            {t('haDesc1')}
          </Alert.Description>
        </Alert.Content>
        <Alert.CloseButton />
      </Alert>

      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t('haTitle2')}</Alert.Title>
          <Alert.Description>
            {t('haDesc2')}
          </Alert.Description>
        </Alert.Content>
        <button className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm shrink-0 active:scale-95">
          {t('common.retry')}
        </button>
      </Alert>

      <Alert status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t('haTitle3')}</Alert.Title>
          <Alert.Description>{t('haDesc3')}</Alert.Description>
        </Alert.Content>
        <Alert.CloseButton />
      </Alert>

      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t('haTitle4')}</Alert.Title>
          <Alert.Description>{t('haDesc4')}</Alert.Description>
        </Alert.Content>
        <Alert.CloseButton />
      </Alert>
    </div>
  );
}
