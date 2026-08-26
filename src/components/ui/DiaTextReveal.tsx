import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

const DEFAULT_COLORS = ['#14b8a6', '#22d3ee', '#10b981', '#2dd4bf', '#0ea5e9'];
const BAND_HALF = 17;

export interface DiaTextRevealProps {
  text: string | string[];
  colors?: string[];
  duration?: number;
  delay?: number;
  repeat?: boolean;
  repeatDelay?: number;
  className?: string;
}

export function DiaTextReveal({
  text,
  colors = DEFAULT_COLORS,
  duration = 1.5,
  delay = 0,
  repeat = false,
  repeatDelay = 0.5,
  className,
}: DiaTextRevealProps) {
  const texts = Array.isArray(text) ? text : [text];
  const sweepPos = useMotionValue(-BAND_HALF);
  const prefersReducedMotion = useReducedMotion();

  const backgroundImage = useTransform(sweepPos, (pos) => {
    const bandStart = pos - BAND_HALF;
    const bandEnd = pos + BAND_HALF;
    if (bandStart >= 100) return `linear-gradient(90deg, currentColor, currentColor)`;
    const parts: string[] = [];
    if (bandStart > 0) parts.push(`currentColor 0%`, `currentColor ${bandStart}%`);
    colors.forEach((c, i) => parts.push(`${c} ${(bandStart + (i / (colors.length - 1)) * BAND_HALF * 2).toFixed(2)}%`));
    if (bandEnd < 100) parts.push(`transparent ${bandEnd}%`, `transparent 100%`);
    return `linear-gradient(90deg, ${parts.join(', ')})`;
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      sweepPos.set(100 + BAND_HALF);
      return;
    }
    const controls = animate(sweepPos, 100 + BAND_HALF, {
      duration,
      delay,
      ease: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
      onComplete: () => {
        if (repeat) {
          setTimeout(() => sweepPos.set(-BAND_HALF), repeatDelay * 1000);
        }
      },
    });
    return () => controls.stop();
  }, [prefersReducedMotion, sweepPos, duration, delay, repeat, repeatDelay]);

  return (
    <motion.span
      className={cn('align-bottom leading-[100%] text-transparent bg-clip-text font-bold', className)}
      style={{ backgroundImage }}
    >
      {texts[0]}
    </motion.span>
  );
}

export default DiaTextReveal;
