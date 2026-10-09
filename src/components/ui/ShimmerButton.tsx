import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ShimmerButtonProps extends HTMLMotionProps<'button'> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: ReactNode;
}

export function ShimmerButton({
  shimmerColor = '#2dd4bf',
  shimmerSize = '0.1em',
  shimmerDuration = '3s',
  borderRadius = '1rem',
  background = 'rgba(0, 80, 77, 1)',
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        } as React.CSSProperties
      }
      className={cn(
        'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-teal-500/30 px-6 py-3 font-semibold text-white [border-radius:var(--radius)]',
        'transform-gpu transition-transform duration-200 ease-in-out active:translate-y-px shadow-lg shadow-teal-900/20',
        className
      )}
      {...props}
    >
      {/* Spark container */}
      <div
        className={cn(
          '-z-30 blur-[2px]',
          'absolute inset-0 overflow-visible [container-type:size]'
        )}
      >
        {/* Spark */}
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          {/* Spark before */}
          <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      {children}

      {/* Backdrop */}
      <div
        className={cn(
          'absolute [border-radius:var(--radius)] [inset:var(--cut)]',
          '-z-20 [background:var(--bg)] group-hover:brightness-110 transition-all'
        )}
      />
    </motion.button>
  );
}
