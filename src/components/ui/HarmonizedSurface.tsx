import { forwardRef, type ComponentType, type HTMLAttributes } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { CLINICAL_PASTELS } from "@/lib/designTokens"

export type HarmonizedSurfaceVariant =
  | "panel"
  | "card"
  | "subcontainer"
  | "pastel-sky"
  | "pastel-mint"
  | "pastel-lavender"
  | "pastel-gradient"

export type HarmonizedGlassTone =
  | "subtle"
  | "prominent"
  | "flat"
  | "pastel-sky"
  | "pastel-mint"
  | "pastel-lavender"
  | "pastel-gradient"

export interface HarmonizedSurfaceProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode
  variant?: HarmonizedSurfaceVariant
  glass?: HarmonizedGlassTone
  interactive?: boolean
  glow?: "none" | "teal" | "kinetic" | "azure" | "sky" | "mint" | "lavender"
  padding?: "none" | "sm" | "md" | "lg"
  className?: string
}

const variantStyles: Record<HarmonizedSurfaceVariant, string> = {
  // Contenedor principal de pantalla / sección / modal: rounded-3xl
  panel: "rounded-3xl border border-outline-variant/30 dark:border-outline-variant/60 shadow-sm",
  // Contenedor modular interactivo / tarjeta: rounded-2xl
  card: "rounded-2xl border border-outline-variant/25 dark:border-outline-variant/60 shadow-sm",
  // Elemento interno anidado / subcontenedor: rounded-xl
  subcontainer: "rounded-xl border border-outline-variant/15 dark:border-outline-variant/40",
  // Variantes Pastel Clínicas (Soft Sky, Mint/Teal, Lavender Blue)
  "pastel-sky": `rounded-2xl ${CLINICAL_PASTELS.sky.card}`,
  "pastel-mint": `rounded-2xl ${CLINICAL_PASTELS.mint.card}`,
  "pastel-lavender": `rounded-2xl ${CLINICAL_PASTELS.lavender.card}`,
  "pastel-gradient":
    "rounded-2xl bg-gradient-to-br from-teal-50/70 via-sky-50/50 to-indigo-50/40 dark:from-teal-950/25 dark:via-sky-950/20 dark:to-indigo-950/20 border border-teal-200/50 dark:border-teal-500/25 shadow-sm",
}

const glassStyles: Record<HarmonizedGlassTone, string> = {
  subtle: "bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl text-on-surface",
  prominent:
    "bg-surface/90 dark:bg-surface-container/90 backdrop-blur-2xl border-white/40 dark:border-outline-variant/60 text-on-surface shadow-sm",
  flat: "bg-surface dark:bg-surface-container text-on-surface",
  "pastel-sky":
    "bg-sky-50/75 dark:bg-sky-950/25 backdrop-blur-xl border border-sky-200/60 dark:border-sky-500/30 text-sky-950 dark:text-sky-100",
  "pastel-mint":
    "bg-teal-50/80 dark:bg-teal-950/30 backdrop-blur-xl border border-teal-200/60 dark:border-teal-500/30 text-teal-950 dark:text-teal-100",
  "pastel-lavender":
    "bg-secondary/70 dark:bg-secondary/25 backdrop-blur-xl border border-secondary/50 dark:border-secondary/25 text-secondary dark:text-secondary",
  "pastel-gradient":
    "bg-gradient-to-br from-teal-50/70 via-sky-50/60 to-indigo-50/50 dark:from-teal-950/25 dark:via-sky-950/20 dark:to-indigo-950/20 backdrop-blur-2xl border border-teal-200/50 dark:border-teal-500/25 text-on-surface",
}

const glowStyles: Record<NonNullable<HarmonizedSurfaceProps["glow"]>, string> = {
  none: "",
  teal: "hover:shadow-[0_8px_30px_rgba(0,80,77,0.12)] hover:border-primary/40 dark:hover:border-primary/50",
  kinetic: "hover:shadow-[0_8px_30px_rgba(193,255,114,0.18)] hover:border-kinetic/50",
  azure: "hover:shadow-[0_8px_30px_rgba(58,95,148,0.15)] hover:border-secondary/40",
  sky: "hover:shadow-[0_8px_30px_rgba(14,165,233,0.18)] hover:border-sky-400/50",
  mint: "hover:shadow-[0_8px_30px_rgba(20,184,166,0.18)] hover:border-teal-400/50",
  lavender: "hover:shadow-[0_8px_30px_rgba(99,102,241,0.18)] hover:border-secondary/50",
}

const paddingStyles = {
  none: "p-0",
  sm: "p-3 md:p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
}

/**
 * HarmonizedSurface:
 * Contenedor Maestro de FisioMirror para normalizar componentes heterogéneos
 * bajo un único contrato visual y enriquecerlos con tonos pastel clínicos suaves.
 */
export const HarmonizedSurface = forwardRef<HTMLDivElement, HarmonizedSurfaceProps>(
  (
    {
      children,
      variant = "card",
      glass = "subtle",
      interactive = false,
      glow = "none",
      padding = "md",
      className,
      ...motionProps
    },
    ref
  ) => {
    const isPastelVariant = variant.startsWith("pastel-")
    const resolvedGlassStyle = isPastelVariant ? "" : glassStyles[glass]

    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { y: -2, scale: 1.005 } : undefined}
        whileTap={interactive ? { scale: 0.995 } : undefined}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "transition-all duration-300",
          variantStyles[variant],
          resolvedGlassStyle,
          glowStyles[glow],
          paddingStyles[padding],
          interactive && "cursor-pointer select-none",
          className
        )}
        {...motionProps}
      >
        {children}
      </motion.div>
    )
  }
)
HarmonizedSurface.displayName = "HarmonizedSurface"

/**
 * HarmonizedCard: Wrapper directo de nivel tarjeta (rounded-2xl)
 */
export const HarmonizedCard = forwardRef<HTMLDivElement, HarmonizedSurfaceProps>(
  ({ variant = "card", padding = "md", interactive = true, ...props }, ref) => (
    <HarmonizedSurface ref={ref} variant={variant} padding={padding} interactive={interactive} {...props} />
  )
)
HarmonizedCard.displayName = "HarmonizedCard"

/**
 * HarmonizedPanel: Wrapper directo de nivel panel/sección (rounded-3xl)
 */
export const HarmonizedPanel = forwardRef<HTMLDivElement, HarmonizedSurfaceProps>(
  ({ variant = "panel", padding = "lg", interactive = false, ...props }, ref) => (
    <HarmonizedSurface ref={ref} variant={variant} padding={padding} interactive={interactive} {...props} />
  )
)
HarmonizedPanel.displayName = "HarmonizedPanel"

/**
 * HarmonizedSubcontainer: Wrapper directo de nivel subelemento anidado (rounded-xl)
 */
export const HarmonizedSubcontainer = forwardRef<HTMLDivElement, HarmonizedSurfaceProps>(
  ({ variant = "subcontainer", padding = "sm", interactive = false, ...props }, ref) => (
    <HarmonizedSurface ref={ref} variant={variant} padding={padding} interactive={interactive} {...props} />
  )
)
HarmonizedSubcontainer.displayName = "HarmonizedSubcontainer"

/**
 * withHarmonizedSurface (HOC):
 * Envuelve y normaliza cualquier componente heterogéneo para inyectarle
 * automáticamente el contrato de diseño de FisioMirror sin reescribir su lógica interna.
 */
export function withHarmonizedSurface<P extends object>(
  WrappedComponent: ComponentType<P>,
  defaultOptions: Partial<HarmonizedSurfaceProps> = {}
) {
  const HarmonizedComponent = forwardRef<HTMLDivElement, P & { surfaceProps?: Partial<HarmonizedSurfaceProps> }>(
    ({ surfaceProps, ...componentProps }, ref) => {
      const mergedOptions = { ...defaultOptions, ...surfaceProps }

      return (
        <HarmonizedSurface ref={ref} {...mergedOptions}>
          <WrappedComponent {...(componentProps as P)} />
        </HarmonizedSurface>
      )
    }
  )

  HarmonizedComponent.displayName = `withHarmonizedSurface(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return HarmonizedComponent
}

/**
 * withHarmonizedCard (HOC):
 * HOC preconfigurado para tarjetas modulares interactivas.
 */
export function withHarmonizedCard<P extends object>(
  WrappedComponent: ComponentType<P>,
  defaultOptions: Partial<HarmonizedSurfaceProps> = {}
) {
  return withHarmonizedSurface(WrappedComponent, {
    variant: "card",
    interactive: true,
    padding: "md",
    glass: "subtle",
    ...defaultOptions,
  })
}
