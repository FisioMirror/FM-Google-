import React, { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

/**
 * SpotlightCard (Inspired by Aceternity UI & 21st.dev)
 * Creates a subtle, radial gradient spotlight that follows the user's cursor
 * over the card surface, providing ultra-tactile depth for clinical interfaces.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(20, 184, 166, 0.15)',
  borderColor = 'rgba(20, 184, 166, 0.3)',
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-outline/15 bg-surface p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-outline/10',
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
        aria-hidden="true"
      />
      
      {/* Subtle border highlight following cursor */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 40%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
