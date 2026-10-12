/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FISIOMIRROR DESIGN SYSTEM TOKENS & HARMONIZATION CONTRACT
 * ═══════════════════════════════════════════════════════════════════════════
 * Guía de Tokens y Clases Utilitarias Estándar para normalizar componentes
 * procedentes de Bolt, Google Stitch, Deepcheck y fragmentos manuales.
 */

export const FM_DESIGN_SYSTEM = {
  radii: {
    /** Contenedores de vistas principales, modales estructurales y paneles: rounded-3xl (24px) */
    panel: "rounded-3xl",
    /** Tarjetas interactivas, bloques modulares y widgets: rounded-2xl (16px) */
    card: "rounded-2xl",
    /** Elementos anidados, botones, inputs, badges y subcontenedores: rounded-xl (12px) */
    inner: "rounded-xl",
    /** Pills, chips de estado y switches: rounded-full */
    pill: "rounded-full",
  },

  shadows: {
    /** Sombra clínica estándar suave para tarjetas de baja elevación */
    subtle: "shadow-sm hover:shadow-md",
    /** Sombra para paneles destacados y modales interactivos */
    elevated: "shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
    /** Glow sutil con el verde azulado de identidad médica */
    tealGlow: "shadow-[0_8px_30px_rgba(0,80,77,0.12)] hover:shadow-[0_12px_40px_rgba(0,80,77,0.2)]",
    /** Glow cinético para estados activos o logros alcanzados */
    kineticGlow: "shadow-[0_8px_25px_rgba(193,255,114,0.2)]",
  },

  surfaces: {
    /** Glassmorphism premium translúcido con alto contraste accesible */
    glass: "bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl border border-outline-variant/30 dark:border-white/10",
    /** Panel prominente blanco/carbón */
    solid: "bg-white dark:bg-slate-900 border border-outline-variant/20 dark:border-white/10",
    /** Subsuperficie anidada para inputs y listas de datos */
    innerSurface: "bg-surface-container-low/40 dark:bg-slate-800/40 border border-outline-variant/20 dark:border-white/5",
  },

  transitions: {
    /** Microinteracciones fluidas y unificadas de Tailwind */
    standard: "transition-all duration-300 ease-out",
    tactile: "transition-transform duration-200 active:scale-[0.98]",
  },

  colors: {
    primaryTeal: "#006965",
    deepTeal: "#00504d",
    kineticLime: "#c1ff72",
    accentCyan: "#06b6d4",
    clinicalAzure: "#3a5f94",
  },
} as const;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLINICAL PASTELS: Acabados cromáticos pastel de alta gama médica
 * ═══════════════════════════════════════════════════════════════════════════
 * Reemplaza los fondos blancos planos y grises aburridos por acentos suaves
 * en celeste pastel (soft sky), menta/turquesa suave (mint/teal) y azul lavanda sutil.
 */
export const CLINICAL_PASTELS = {
  sky: {
    card: "bg-gradient-to-br from-sky-50/75 via-surface/90 to-sky-50/40 dark:from-sky-950/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-sky-200/60 dark:border-sky-500/30 text-sky-950 dark:text-sky-100 shadow-sm hover:shadow-sky-500/10",
    solid: "bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-500/30 text-sky-950 dark:text-sky-100",
    badge: "bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300 font-bold",
    avatar: "bg-sky-500/20 text-sky-700 dark:text-sky-300 ring-2 ring-sky-400/40",
    glow: "shadow-[0_8px_30px_rgba(14,165,233,0.12)] hover:shadow-[0_12px_36px_rgba(14,165,233,0.2)]",
    textPrimary: "text-sky-900 dark:text-sky-100",
    textMuted: "text-sky-600 dark:text-sky-400",
  },
  mint: {
    card: "bg-gradient-to-br from-teal-50/80 via-surface/90 to-emerald-50/50 dark:from-teal-950/30 dark:via-surface-container/80 dark:to-slate-900/90 border border-teal-200/60 dark:border-teal-500/30 text-teal-950 dark:text-teal-100 shadow-sm hover:shadow-teal-500/10",
    solid: "bg-teal-50/85 dark:bg-teal-950/35 border border-teal-200/70 dark:border-teal-500/30 text-teal-950 dark:text-teal-100",
    badge: "bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-bold",
    avatar: "bg-teal-500/20 text-teal-700 dark:text-teal-300 ring-2 ring-teal-400/40",
    glow: "shadow-[0_8px_30px_rgba(20,184,166,0.12)] hover:shadow-[0_12px_36px_rgba(20,184,166,0.2)]",
    textPrimary: "text-teal-950 dark:text-teal-100",
    textMuted: "text-teal-600 dark:text-teal-400",
  },
  lavender: {
    card: "bg-gradient-to-br from-indigo-50/70 via-surface/90 to-purple-50/40 dark:from-indigo-950/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-indigo-200/50 dark:border-indigo-500/25 text-indigo-950 dark:text-indigo-100 shadow-sm hover:shadow-indigo-500/10",
    solid: "bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-500/25 text-indigo-950 dark:text-indigo-100",
    badge: "bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold",
    avatar: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/40",
    glow: "shadow-[0_8px_30px_rgba(99,102,241,0.12)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.2)]",
    textPrimary: "text-indigo-950 dark:text-indigo-100",
    textMuted: "text-indigo-600 dark:text-indigo-400",
  },
} as const;

/**
 * Retorna clases de contenedor armonizadas según la variante deseada.
 */
export function getHarmonizedContainerClasses(
  variant: 'panel' | 'card' | 'subcontainer' | 'pastel-sky' | 'pastel-mint' | 'pastel-lavender' = 'card'
) {
  if (variant === 'panel') {
    return "rounded-3xl bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 shadow-sm transition-all duration-300";
  }
  if (variant === 'subcontainer') {
    return "rounded-xl bg-surface-container-low/40 dark:bg-slate-800/40 border border-outline-variant/20 dark:border-white/5 transition-all duration-300";
  }
  if (variant === 'pastel-sky') {
    return `rounded-2xl ${CLINICAL_PASTELS.sky.card} backdrop-blur-xl transition-all duration-300`;
  }
  if (variant === 'pastel-mint') {
    return `rounded-2xl ${CLINICAL_PASTELS.mint.card} backdrop-blur-xl transition-all duration-300`;
  }
  if (variant === 'pastel-lavender') {
    return `rounded-2xl ${CLINICAL_PASTELS.lavender.card} backdrop-blur-xl transition-all duration-300`;
  }
  return "rounded-2xl bg-surface/80 dark:bg-surface-container/60 backdrop-blur-lg border border-outline-variant/25 dark:border-white/10 shadow-sm transition-all duration-300";
}
