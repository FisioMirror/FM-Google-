import React, { useRef, type MouseEvent } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number;
  color?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * CardSpotlight (Inspirado en Aceternity UI)
 * Tarjeta interactiva con efecto de foco de luz radial que sigue al cursor suavemente.
 * Diseñado con alto rendimiento para dispositivos de recursos modestos:
 * utiliza motion values de Framer Motion en propiedades de transform y background
 * sin causar re-renders del DOM React en cada movimiento del mouse.
 */
export function CardSpotlight({
  children,
  radius = 280,
  color = 'rgba(20, 184, 166, 0.12)', // Verde azulado clínico (Teal)
  className,
  ...props
}: CardSpotlightProps) {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 80%)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(-1000);
        mouseY.set(-1000);
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-outline/15 bg-surface-container-low/70 transition-all duration-300 hover:border-outline/30 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {/* Luz focal animada en hover */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: spotlightBackground,
        }}
      />
      {/* Contenido de la tarjeta */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

export default CardSpotlight;
