import React from "react";
import { cn } from "../../lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  isLoaded?: boolean;
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
  animation?: "shimmer" | "pulse" | "wave" | "none";
  disableAnimation?: boolean;
}

/**
 * Skeleton - Componente de carga progresiva armonizado con tokens de FisioMirror
 * Soporta modo contenedor (children con isLoaded) y modo placeholder individual.
 * Efectos de animación: 'shimmer', 'pulse', 'wave'.
 */
export function Skeleton({
  children,
  isLoaded = false,
  className,
  variant = "rect",
  width,
  height,
  animation = "shimmer",
  disableAnimation = false,
  style,
  ...props
}: SkeletonProps) {
  if (isLoaded && children) {
    return <>{children}</>;
  }

  const radiusClass =
    variant === "circle"
      ? "rounded-full"
      : variant === "text"
      ? "rounded-md"
      : "rounded-2xl";

  const animationClass = disableAnimation
    ? ""
    : animation === "pulse"
    ? "animate-pulse"
    : animation === "shimmer"
    ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/10 before:to-transparent"
    : animation === "wave"
    ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.4s_cubic-bezier(0.4,0,0.2,1)_infinite] before:bg-gradient-to-r before:from-transparent before:via-teal-400/15 before:to-transparent"
    : "";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-slate-200/80 dark:bg-slate-800/80 select-none",
        radiusClass,
        animationClass,
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props}
    >
      {/* Si tiene children pero no ha cargado, mantiene las dimensiones naturales de los hijos ocultándolos */}
      {children && <div className="opacity-0 pointer-events-none select-none">{children}</div>}
    </div>
  );
}

/**
 * Demos de Skeletons especializados para vistas clínicas de FisioMirror
 */
export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={14} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <Skeleton variant="text" width="90%" height={12} />
      <Skeleton variant="text" width="75%" height={12} />
      <div className="flex gap-2 pt-1">
        <Skeleton variant="rect" width={80} height={28} className="rounded-xl" />
        <Skeleton variant="rect" width={80} height={28} className="rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="glass-card p-5 space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
      <Skeleton variant="circle" width={32} height={32} />
      <Skeleton variant="text" width="50%" height={12} />
      <Skeleton variant="text" width="70%" height={24} />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl"
        >
          <Skeleton variant="circle" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="55%" height={14} />
            <Skeleton variant="text" width="35%" height={12} />
          </div>
          <Skeleton variant="rect" width={60} height={24} className="rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
