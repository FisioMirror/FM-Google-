import { forwardRef, type HTMLAttributes, type ComponentType } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export type HarmonizedSurfaceVariant = "panel" | "card" | "subcontainer"
export type HarmonizedGlassTone = "subtle" | "prominent" | "flat"

export interface HarmonizedSurfaceProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode
  variant?: HarmonizedSurfaceVariant
  glass?: HarmonizedGlassTone
  interactive?: boolean
  glow?: "none" | "teal" | "kinetic" | "azure"
  padding?: "none" | "sm" | "md" | "lg"
  className?: string
}

const variantStyles: Record<HarmonizedSurfaceVariant, string> = {
  // Contenedor principal de pantalla / sección: rounded-3xl
  panel: "rounded-3xl border border-outline-variant/30 dark:border-white/10 shadow-sm",
  // Contenedor modular interactivo / tarjeta: rounded-2xl
  card: "rounded-2xl border border-outline-variant/25 dark:border-white/10 shadow-sm",
  // Elemento interno anidado: rounded-xl
  subcontainer: "rounded-xl border border-outline-variant/15 dark:border-white/5",
}

const glassStyles: Record<HarmonizedGlassTone, string> = {
  subtle: "bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl text-on-surface",
  prominent: "bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border-white/40 dark:border-white/15 text-on-surface shadow-md",
  flat: "bg-surface dark:bg-surface-container text-on-surface",
}

const glowStyles: Record<NonNullable<HarmonizedSurfaceProps["glow"]>, string> = {
  none: "",
  teal: "hover:shadow-[0_8px_30px_rgba(0,80,77,0.12)] hover:border-primary/40 dark:hover:border-primary/50",
  kinetic: "hover:shadow-[0_8px_30px_rgba(193,255,114,0.18)] hover:border-kinetic/50",
  azure: "hover:shadow-[0_8px_30px_rgba(58,95,148,0.15)] hover:border-secondary/40",
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
 * (Bolt, Google Stitch, Deepcheck) bajo un único contrato visual:
 * - Radios matemáticos estrictos: Panel (rounded-3xl), Card (rounded-2xl), Inner (rounded-xl)
 * - Glassmorphism clínico calibrado con alto contraste accesible en Dark Mode
 * - Transiciones fluidas estandarizadas a duration-300
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
    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { y: -2, scale: 1.005 } : undefined}
        whileTap={interactive ? { scale: 0.995 } : undefined}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "transition-colors duration-300",
          variantStyles[variant],
          glassStyles[glass],
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
