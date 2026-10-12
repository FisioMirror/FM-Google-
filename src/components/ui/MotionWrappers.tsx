import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springBouncy } from '@/lib/motionVariants';

/**
 * MotionBlurFade (Reusable Wrapper Component)
 * Revela suavemente elementos con desenfoque dinámico y física de resorte.
 */
export interface MotionBlurFadeProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
  className?: string;
}

export function MotionBlurFade({
  children,
  delay = 0,
  duration = 0.4,
  yOffset = 12,
  inView = true,
  className,
  ...props
}: MotionBlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: yOffset, filter: 'blur(6px)' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * TactileFeedback (Reusable Touch & Tap Wrapper)
 * Añade respuesta háptica visual inmediata a cualquier botón, tarjeta o elemento interactivo.
 */
export interface TactileFeedbackProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  scaleDown?: number;
  className?: string;
}

export function TactileFeedback({
  children,
  scaleDown = 0.965,
  className,
  ...props
}: TactileFeedbackProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: scaleDown }}
      transition={springBouncy}
      className={cn('cursor-pointer select-none inline-block', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * InViewStaggerContainer (Reusable Stagger Wrapper)
 * Anima hijos automáticamente al entrar en el viewport con retardo progresivo.
 */
export interface InViewStaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function InViewStaggerContainer({
  children,
  className,
  staggerDelay = 0.04,
}: InViewStaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
