import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
  speed?: number; // duration in seconds
}

/**
 * Marquee (Inspired by Magic UI)
 * Infinite smooth looping carousel with pause-on-hover capability and edge masks.
 * Ideal for rehabilitation achievements, testimonials, and exercise tip highlights.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  vertical = false,
  repeat = 4,
  speed = 35,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] select-none',
        vertical ? 'flex-col' : 'flex-row',
        className
      )}
      style={
        {
          '--duration': `${speed}s`,
        } as React.CSSProperties
      }
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 justify-around [gap:var(--gap)]',
            vertical
              ? 'animate-marquee-vertical flex-col'
              : 'animate-marquee flex-row',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]'
          )}
          style={{
            animationDuration: `${speed}s`,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
