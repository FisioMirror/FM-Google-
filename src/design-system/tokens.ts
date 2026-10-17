/**
 * Contrato de Diseño Único de FisioMirror (Design Tokens & Utility Classes)
 *
 * Estandariza la jerarquía visual de componentes heterogéneos provenientes de Bolt,
 * Google Stitch, Deepcheck y fragmentos manuales bajo una identidad premium unificada.
 */

export const FISIO_DESIGN_CONTRACT = {
  // 1. Jerarquía Estricta de Radios de Borde (Border Radius)
  radius: {
    /** Contenedores principales, paneles de página, modales flotantes y layout wrappers */
    container: 'rounded-3xl', // 24px - 32px
    /** Tarjetas de métricas, widgets de ejercicios, diálogos y popovers */
    card: 'rounded-2xl', // 16px - 20px
    /** Elementos interactivos internos: botones, inputs, chips, avatares, badges */
    element: 'rounded-xl', // 12px
    /** Píldoras de estado o tags minimalistas */
    pill: 'rounded-full',
  },

  // 2. Superficies y Glassmorphism Sutil (Material 3 + iOS Clinical)
  surface: {
    /** Fondo estándar para tarjetas interactivas con glassmorphism sutil */
    glassCard: 'bg-surface/85 dark:bg-surface-container-low/80 backdrop-blur-md border border-outline/15 dark:border-white/10 shadow-xs hover:border-teal-500/30',
    /** Paneles contenedores profundos */
    panel: 'bg-surface-container-lowest/90 dark:bg-surface-container-low/60 border border-outline/10 shadow-2xs',
    /** Superficie elevada para modales y dropdowns flotantes */
    modal: 'bg-surface/95 dark:bg-surface-container/95 backdrop-blur-xl border border-outline/20 dark:border-white/15 shadow-elevated',
    /** Superficie interna anidada (inputs, áreas de mensaje secundarias) */
    subtle: 'bg-surface-container/50 dark:bg-surface-container-high/40 border border-outline/10',
  },

  // 3. Paleta Semántica & Contraste Accesible (WCAG AAA)
  colors: {
    brandTeal: {
      light: '#00504d',
      primary: '#0D9488',
      accent: '#14B8A6',
      subtle: 'rgba(13, 148, 136, 0.12)',
    },
    text: {
      primary: 'text-on-surface',
      secondary: 'text-on-surface-variant',
      muted: 'text-outline',
      brand: 'text-teal-600 dark:text-teal-400',
    },
    border: {
      subtle: 'border-outline/15 dark:border-white/10',
      active: 'border-teal-500/40 dark:border-teal-400/40',
    },
  },

  // 4. Sombras Estandarizadas
  shadows: {
    card: 'shadow-xs hover:shadow-md transition-shadow duration-300',
    floating: 'shadow-card dark:shadow-elevated dark:shadow-black/40',
    subtle: 'shadow-2xs',
  },

  // 5. Microinteracciones y Duraciones
  motion: {
    transition: 'transition-all duration-300 ease-out',
    pressScale: 'active:scale-[0.97] transition-transform duration-150',
    hoverScale: 'hover:scale-[1.02] transition-transform duration-200',
    spring: {
      type: 'spring',
      stiffness: 380,
      damping: 28,
    },
  },
} as const;

/**
 * Mapeo de reemplazo rápido para migrar clases disonantes de Bolt / Stitch a FisioMirror
 */
export const TAILWIND_HARMONIZATION_MAP: Record<string, string> = {
  // Discrepancias de Radios
  'rounded-none': 'rounded-xl',
  'rounded-sm': 'rounded-xl',
  'rounded-md': 'rounded-xl',
  'rounded-lg': 'rounded-2xl',
  
  // Discrepancias de Fondo / Modo Oscuro
  'bg-white': 'bg-surface/90 dark:bg-surface-container-low/80',
  'bg-gray-50': 'bg-surface-container-lowest dark:bg-surface-container-lowest',
  'bg-gray-100': 'bg-surface-container/60 dark:bg-surface-container/40',
  'bg-gray-800': 'bg-surface-container-high dark:bg-surface-container-high',
  'bg-gray-900': 'bg-surface-container-highest dark:bg-surface-container-highest',
  'bg-black': 'bg-surface-container-lowest dark:bg-surface-container-lowest',

  // Discrepancias de Bordes
  'border-gray-200': 'border-outline/15 dark:border-white/10',
  'border-gray-300': 'border-outline/25 dark:border-white/15',
  'border-slate-200': 'border-outline/15 dark:border-white/10',

  // Discrepancias de Sombras Excesivas
  'shadow-elevated': 'shadow-md dark:shadow-black/30',
  'shadow-elevated': 'shadow-sm dark:shadow-black/20',

  // Discrepancias de Transición
  'duration-100': 'duration-300',
  'duration-300': 'duration-300',
};
