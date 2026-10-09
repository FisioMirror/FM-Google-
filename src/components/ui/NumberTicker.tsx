import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  decimalPlaces?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * NumberTicker (Inspired by Magic UI)
 * Smoothly animates numbers upwards or downwards using spring mechanics.
 * Perfect for biomechanical ROM angles, adherence percentages, reps, and patient statistics.
 */
export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  decimalPlaces = 0,
  className,
  prefix = '',
  suffix = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 120,
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === 'down' ? 0 : value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Intl.NumberFormat('es-ES', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(latest.toFixed(decimalPlaces)))}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [springValue, decimalPlaces, prefix, suffix]);

  return (
    <span
      ref={ref}
      className={cn('inline-block tabular-nums font-mono tracking-tight text-on-surface', className)}
    >
      {prefix}{Intl.NumberFormat('es-ES', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(direction === 'down' ? value : 0)}{suffix}
    </span>
  );
}
