/**
 * Configuración Central de UI para FisioMirror
 * 
 * Este archivo centraliza la configuración de colores, animaciones y estilos
 * para mantener la coherencia visual en toda la aplicación.
 * 
 * Basado en el sistema de diseño actual:
 * - Primary: Teal (00504D - Medical Teal)
 * - Secondary: Azure Blue (3A5F94 - Clinical Blue)
 * - Kinetic: Lime (C1FF72 - Energy)
 * - Neutral: Surface colors
 */

// ============================================================================
// CONFIGURACIÓN DE COLORES ARMONIZADOS
// ============================================================================

/**
 * Paleta de colores principal de FisioMirror
 * Basada en el sistema Material Design 3 con adaptaciones médicas
 */
export const fisioColors = {
  // Primary: Teal (Medical/Clinical)
  primary: {
    50: '#E6F7F6',
    100: '#CCEEEC',
    200: '#99DCD9',
    300: '#66CBC7',
    400: '#21B5AF',
    500: '#158F8A',
    600: '#156966',
    700: '#00504D',  // Principal
    800: '#003735',
    900: '#00231F',
  },
  
  // Secondary: Azure Blue (Clinical)
  secondary: {
    50: '#EEF3FB',
    100: '#D6E3F5',
    200: '#ADC6FF',
    300: '#7DD3FC',
    400: '#3A5F94',  // Principal
    500: '#2A4F84',
    600: '#1A3F74',
    700: '#102F64',
    800: '#0A1F54',
    900: '#051044',
  },
  
  // Kinetic: Lime (Energy/Success)
  kinetic: {
    light: '#D4FF8A',
    DEFAULT: '#C1FF72',
    dim: '#A8E55F',
    dark: '#8FC946',
  },
  
  // Terracotta: Warm accent
  terracotta: {
    DEFAULT: '#E2725B',
    light: '#F0A088',
    dim: '#D55E45',
    dark: '#B84A33',
  },
  
  // Surface colors
  surface: {
    light: '#FFFFFF',
    DEFAULT: '#FFFFFF',
    dim: '#F8F9FA',
    variant: '#E8EAF6',
    container: '#F0F2F5',
  },
  
  // Glass effect
  glass: {
    light: 'rgba(255, 255, 255, 0.12)',
    DEFAULT: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(21, 61, 107, 0.45)',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #00504D 0%, #156966 100%)',
    secondary: 'linear-gradient(135deg, #3A5F94 0%, #6B9ADB 100%)',
    kinetic: 'linear-gradient(135deg, #8AD3CF 0%, #C1FF72 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    aurora: {
      teal: 'linear-gradient(135deg, #00504D 0%, #21B5AF 50%, #C1FF72 100%)',
      blue: 'linear-gradient(135deg, #3A5F94 0%, #7DD3FC 100%)',
      mixed: 'linear-gradient(135deg, #00504D 0%, #3A5F94 50%, #C1FF72 100%)',
    },
  },
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// ============================================================================
// CONFIGURACIÓN DE ANIMACIONES
// ============================================================================

export const fisioAnimations = {
  // Durations
  durations: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
    slowest: 1.2,
  },
  
  // Easing
  easing: {
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0.25, 0.46, 0.45, 0.94],
    easeIn: [0.4, 0, 1, 1],
    smooth: [0.16, 1, 0.3, 1],
    elastic: [0.34, 1.56, 0.64, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
  
  // Presets
  presets: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    breathe: {
      animate: {
        scale: [1, 1.02, 1],
        transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
      },
    },
    shimmer: {
      animate: {
        backgroundPosition: ['-200% 0', '200% 0'],
        transition: { duration: 1.5, repeat: Infinity },
      },
    },
    glow: {
      animate: {
        boxShadow: [
          '0 0 20px rgba(0, 80, 77, 0.15)',
          '0 0 30px rgba(0, 80, 77, 0.3)',
          '0 0 20px rgba(0, 80, 77, 0.15)',
        ],
        transition: { duration: 2, repeat: Infinity },
      },
    },
  },
};

// ============================================================================
// CONFIGURACIÓN DE ESTILOS GLOBALES
// ============================================================================

export const fisioStyles = {
  // Glass effect
  glass: {
    base: 'bg-white/10 backdrop-blur-xl',
    card: 'bg-white/80 backdrop-blur-lg border border-white/20',
    modal: 'bg-white/90 backdrop-blur-md border border-white/30',
  },
  
  // Shadows
  shadows: {
    soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
    card: '0 4px 12px rgba(0, 0, 0, 0.06)',
    elevated: '0 8px 32px rgba(0, 0, 0, 0.08)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.04)',
    primary: '0 4px 12px rgba(0, 80, 77, 0.15)',
    kinetic: '0 0 20px rgba(193, 255, 114, 0.3)',
  },
  
  // Typography
  typography: {
    display: 'font-display font-bold',
    headline: 'font-headline font-bold',
    title: 'font-title font-semibold',
    body: 'font-body font-normal',
    label: 'font-label font-medium',
  },
  
  // Border radius (using string keys to avoid TS issues with numeric prefixes)
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
  },
};

// ============================================================================
// CONFIGURACIÓN DE COMPONENTES EXTERNOS
// ============================================================================

/**
 * Configuración para librerías externas
 * Asegura que los componentes de Magic UI, Aceternity, etc.
 * usen la paleta de FisioMirror
 */
export const externalLibConfig = {
  // Magic UI
  magicUI: {
    colors: {
      primary: fisioColors.primary[700],
      secondary: fisioColors.secondary[400],
      accent: fisioColors.kinetic.DEFAULT,
    },
  },
  
  // Aceternity UI
  aceternity: {
    colors: {
      primary: fisioColors.primary[700],
      secondary: fisioColors.secondary[400],
      accent: fisioColors.kinetic.DEFAULT,
    },
  },
  
  // HeroUI
  heroUI: {
    theme: {
      colors: {
        primary: fisioColors.primary[700],
        secondary: fisioColors.secondary[400],
        success: fisioColors.success,
        warning: fisioColors.warning,
        danger: fisioColors.error,
      },
    },
  },
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  colors: fisioColors,
  animations: fisioAnimations,
  styles: fisioStyles,
  externalLib: externalLibConfig,
};
