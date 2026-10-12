import type { Variants } from 'framer-motion';

/**
 * Standardized Spring & Motion configurations for FisioMirror.
 * Inspired by tactile micro-interaction systems (Magic UI, Canva, 21st.dev).
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

/** Bottom Sheet gesture spring (organic drag & settle physics) */
export const springBottomSheet = {
  type: 'spring' as const,
  damping: 28,
  stiffness: 320,
  mass: 0.9,
};

/** Bouncy tactile feedback for buttons and badges */
export const springBouncy = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 18,
  mass: 0.7,
};

/** Snappy micro-interaction for tabs, switches, and toggles */
export const springSnappy = {
  type: 'spring' as const,
  stiffness: 480,
  damping: 26,
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

/** Ultra-dense mobile stagger container */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.01,
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

/** Blur-Fade Entrance Variant (Ultra-premium glassmorphic reveal) */
export const blurFadeVariant: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: 'blur(8px)',
  },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
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
