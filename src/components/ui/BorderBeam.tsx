import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  reverse?: boolean;
  initialOffset?: number;
  borderWidth?: number;
  /** Disables the beam completely (also used to opt out per surface). */
  disabled?: boolean;
  /** Honors prefers-reduced-motion by not rendering the animation. */
  respectReducedMotion?: boolean;
  /** Pauses the animation when the host is outside the viewport. */
  pauseOffscreen?: boolean;
}

export function BorderBeam({
  size = 50,
  duration = 6,
  delay = 0,
  colorFrom = '#14b8a6',
  colorTo = '#22d3ee',
  className,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
  disabled = false,
  respectReducedMotion = true,
  pauseOffscreen = true,
}: BorderBeamProps) {
  const prefersReducedMotion = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!pauseOffscreen || !hostRef.current || typeof IntersectionObserver === 'undefined') return;
    const host = hostRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px', threshold: 0.01 }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [pauseOffscreen]);

  if (disabled || (respectReducedMotion && prefersReducedMotion)) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-clip:padding-box,border-box] [mask-composite:exclude]"
    >
      {inView && (
        <motion.div
          className={cn('absolute aspect-square bg-gradient-to-l', className)}
          style={{
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
            backgroundImage: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
            borderWidth,
          } as React.CSSProperties}
          initial={{ offsetDistance: `${initialOffset}%` }}
          animate={{
            offsetDistance: reverse
              ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
              : [`${initialOffset}%`, `${100 + initialOffset}%`],
          }}
          transition={{ repeat: Infinity, ease: 'linear', duration, delay: -delay }}
        />
      )}
    </div>
  );
}
