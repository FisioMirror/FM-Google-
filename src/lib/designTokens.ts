/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FISIOMIRROR DESIGN SYSTEM — TOKENS, MAPPING & HARMONIZATION CONTRACT
 * ═══════════════════════════════════════════════════════════════════════════
 * Motor de Estandarización Global para unificar componentes provenientes de
 * Bolt, Google Stitch, Deepcheck y fragmentos manuales bajo un contrato único.
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

  typography: {
    /** Familia Sans principal */
    fontFamily: "font-sans",
    /** Display para títulos editoriales */
    fontDisplay: "font-display",
    /** Mono para métricas y datos articulares */
    fontMono: "font-mono tabular-nums",
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
 * GUÍA DE REEMPLAZO Y MAPEO DIRECTO (FIND & REPLACE CHEAT SHEET)
 * ═══════════════════════════════════════════════════════════════════════════
 * Úsalo para corregir discrepancias entre fuentes en lotes o revisiones rápidas:
 */
export const TAILWIND_HARMONIZATION_MAP = [
  // 1. Radios de borde (Border-radius)
  {
    category: "Radios - Contenedores principales (Modales, Paneles)",
    find: "rounded-lg | rounded-xl | rounded-none",
    replaceWith: "rounded-3xl",
    rationale: "Unifica la envoltura estructural exterior bajo el estándar editorial de FisioMirror.",
  },
  {
    category: "Radios - Tarjetas y Módulos de contenido",
    find: "rounded-lg | rounded-md | rounded-3xl",
    replaceWith: "rounded-2xl",
    rationale: "Garantiza consistencia visual matemática: r_inner = r_outer - padding.",
  },
  {
    category: "Radios - Elementos interactivos internos (Botones, Inputs, Dropdowns)",
    find: "rounded-md | rounded-lg | rounded-none",
    replaceWith: "rounded-xl",
    rationale: "Proporciona ergonomía táctil moderna sin caer en píldoras genéricas.",
  },

  // 2. Sombras y Elevaciones
  {
    category: "Sombras - Tarjetas regulares",
    find: "shadow-md | shadow-lg | shadow-xl | shadow",
    replaceWith: "shadow-sm hover:shadow-md",
    rationale: "Evita la pesadez de sombras artificiales oscuras en fondos clínicos.",
  },
  {
    category: "Sombras - Modales y Diálogos",
    find: "shadow-2xl | shadow-[...]",
    replaceWith: "shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
    rationale: "Profundidad sutil sin halos opacos no controlados.",
  },

  // 3. Bordes y Delimitadores
  {
    category: "Bordes - Superficies generales",
    find: "border-gray-200 | border-slate-200 | border-neutral-300",
    replaceWith: "border-outline-variant/30 dark:border-white/10",
    rationale: "Adapta automáticamente el borde entre modo claro y oscuro con variables semánticas.",
  },

  // 4. Fondos y Glassmorphism
  {
    category: "Fondos - Tarjetas y Paneles",
    find: "bg-white | bg-slate-50 | bg-gray-50",
    replaceWith: "bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl",
    rationale: "Implementa el glassmorphism clínico sin perder legibilidad ni contraste WCAG AA.",
  },

  // 5. Transiciones y Duraciones
  {
    category: "Microinteracciones",
    find: "transition | transition-colors | duration-150 | duration-200 | duration-500",
    replaceWith: "transition-all duration-300 ease-out",
    rationale: "Curva de amortiguación clínica orgánica idéntica en toda la aplicación.",
  },

  // 6. Tipografía y Textos
  {
    category: "Color de texto principal",
    find: "text-gray-900 | text-black | text-slate-900",
    replaceWith: "text-on-surface",
    rationale: "Respeta el modo oscuro automático sin necesidad de dark:text-white repetitivo.",
  },
  {
    category: "Color de texto secundario/muted",
    find: "text-gray-500 | text-slate-500 | text-gray-400",
    replaceWith: "text-on-surface-variant",
    rationale: "Garantiza contraste mínimo 4.5:1 en ambos esquemas de color.",
  },
  {
    category: "Cifras numéricas y métricas clínicas",
    find: "font-bold text-...",
    replaceWith: "font-mono tabular-nums font-bold text-...",
    rationale: "Evita fluctuaciones de ancho al renderizar ángulos y tiempos biomecánicos.",
  },
] as const;

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
