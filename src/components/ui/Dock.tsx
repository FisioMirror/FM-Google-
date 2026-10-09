import React, { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '../../lib/utils';

interface DockProps {
  children: ReactNode;
  className?: string;
  magnification?: number;
  distance?: number;
}

export function Dock({
  children,
  className,
  magnification = 60,
  distance = 140,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'mx-auto flex h-16 items-center gap-3 rounded-3xl border border-outline/15 bg-surface/80 px-4 backdrop-blur-xl shadow-xl dark:border-outline/10',
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            mouseX,
            magnification,
            distance,
          } as any);
        }
        return child;
      })}
    </motion.div>
  );
}

interface DockIconProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  tooltip?: string;
  mouseX?: MotionValue;
  magnification?: number;
  distance?: number;
}

export function DockIcon({
  children,
  className,
  onClick,
  tooltip,
  mouseX,
  magnification = 60,
  distance = 140,
}: DockIconProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const defaultMouseX = useMotionValue(Infinity);
  const effectiveMouseX = mouseX || defaultMouseX;

  const distanceCalc = useTransform(effectiveMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [40, magnification, 40]
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <div className="relative group">
      <motion.button
        ref={ref}
        style={{ width, height: width }}
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'flex aspect-square items-center justify-center rounded-2xl bg-surface-container-high text-on-surface hover:bg-teal-500 hover:text-white transition-colors shadow-sm',
          className
        )}
      >
        {children}
      </motion.button>

      {tooltip && (
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-zinc-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100 whitespace-nowrap z-30">
          {tooltip}
        </span>
      )}
    </div>
  );
}
