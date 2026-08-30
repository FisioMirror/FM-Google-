import type { Variants } from 'framer-motion';

/**
 * Standardized Spring & Motion configurations for FisioMirror.
 * Inspired by tactile micro-interaction systems (Canva, Instagram, Meta Horizon).
 */

export const springTactile = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 24,
  mass: 0.8,
};

export const springSmooth = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 22,
};

export const springGentle = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

/** Stagger Container for list & grid views */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

/** Stagger Item with fluid vertical entry and soft spring settle */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};

/** Stagger Item with horizontal slide (for lists, timelines) */
export const staggerItemHorizontal: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: springSmooth,
  },
};

/** Interactive Card Gestures */
export const cardHoverMotion = {
  whileHover: {
    y: -3,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  whileTap: {
    scale: 0.98,
    transition: { type: 'spring', stiffness: 600, damping: 30 },
  },
};

/** Button Tactile Motion */
export const buttonTapMotion = {
  whileHover: {
    scale: 1.015,
    transition: { type: 'spring', stiffness: 450, damping: 25 },
  },
  whileTap: {
    scale: 0.965,
    transition: { type: 'spring', stiffness: 600, damping: 30 },
  },
};
