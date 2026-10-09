import React from 'react';
import { Check, AlertTriangle, AlertCircle, Circle, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ChipColor = 'success' | 'warning' | 'danger' | 'primary' | 'neutral';
export type ChipVariant = 'primary' | 'secondary' | 'outline' | 'glass';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ChipColor;
  variant?: ChipVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Chip({ color = 'primary', variant = 'primary', size = 'md', children, className = '', ...props }: ChipProps) {
  const colorStyles: Record<ChipColor, string> = {
    primary: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-full border transition-colors select-none shadow-xs',
        colorStyles[color],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function ChipLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('tracking-tight', className)}>{children}</span>;
}

Chip.Label = ChipLabel;

export function ChipStatusesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Chip color="success" variant="primary">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <Chip.Label>Activo</Chip.Label>
      </Chip>

      <Chip color="warning" variant="primary">
        <AlertTriangle className="size-3" />
        <Chip.Label>Pendiente</Chip.Label>
      </Chip>

      <Chip color="danger" variant="primary">
        <AlertCircle className="size-3" />
        <Chip.Label>Supervisión Requerida</Chip.Label>
      </Chip>

      <Chip color="primary" variant="primary">
        <Sparkles className="size-3" />
        <Chip.Label>Módulo IA Activo</Chip.Label>
      </Chip>

      <Chip color="neutral" variant="primary">
        <Circle className="size-2.5 fill-current opacity-40" />
        <Chip.Label>Alta Médica</Chip.Label>
      </Chip>
    </div>
  );
}

export default ChipStatusesDemo;
