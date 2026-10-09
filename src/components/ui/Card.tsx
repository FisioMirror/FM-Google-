import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glassEffect?: boolean
  hoverEffect?: boolean
  animated?: boolean
  variant?: "default" | "glass" | "gradient" | "bordered" | "kinetic" | "aurora"
  padding?: "none" | "sm" | "md" | "lg"
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glassEffect, hoverEffect, animated, variant = "default", padding = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-surface text-on-surface border border-outline-variant/25 dark:border-white/10 dark:bg-surface-container/70",
      glass: "glass-card bg-surface/85 dark:bg-surface-container/60 backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 text-on-surface",
      gradient: "bg-gradient-to-br from-primary/10 via-surface to-secondary/10 border border-outline-variant/20 dark:border-white/10 text-on-surface",
      bordered: "bg-surface dark:bg-surface-container border border-outline-variant/40 dark:border-white/15 text-on-surface",
      kinetic: "bg-gradient-to-r from-kinetic/10 to-primary/10 border border-kinetic/30 text-on-surface",
      aurora: "bg-gradient-to-r from-primary/10 via-kinetic/10 to-secondary/10 border border-outline-variant/20 dark:border-white/10 text-on-surface",
    }

    const paddings = {
      none: "",
      sm: "p-3 md:p-4",
      md: "p-5 md:p-6",
      lg: "p-6 md:p-8",
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl shadow-sm transition-all duration-300",
          variants[variant],
          paddings[padding],
          hoverEffect && "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 dark:hover:border-white/20",
          glassEffect && "backdrop-blur-xl",
          className
        )}
        initial={animated ? { opacity: 0, y: 16 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={animated ? { duration: 0.3, ease: [0.16, 1, 0.3, 1] } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = "Card"

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-1.5 pb-4", className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-lg md:text-xl font-bold tracking-tight text-on-surface", className)}>{children}</h3>
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-on-surface-variant font-normal leading-relaxed", className)}>{children}</p>
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("pt-2", className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center pt-4 border-t border-outline-variant/15 dark:border-white/5", className)}>{children}</div>
}

// Card con imagen
export function CardWithImage({
  image,
  title,
  description,
  actions,
  className,
}: {
  image: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <Card glassEffect hoverEffect animated className={className}>
      <div className="aspect-video overflow-hidden rounded-xl mb-4 border border-outline-variant/15 dark:border-white/10">
        {image}
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {actions && <CardFooter>{actions}</CardFooter>}
    </Card>
  )
}

// Card de estadísticas
export function StatCard({
  icon,
  value,
  label,
  trend,
  className,
}: {
  icon: ReactNode
  value: string | number
  label: string
  trend?: ReactNode
  className?: string
}) {
  return (
    <Card glassEffect className={cn("text-center", className)}>
      <CardContent className="pt-6">
        <div className="flex justify-center mb-4">
          {icon}
        </div>
        <div className="text-3xl font-bold mb-2">{value}</div>
        <div className="text-sm text-muted-foreground mb-2">{label}</div>
        {trend && <div className="text-xs text-kinetic">{trend}</div>}
      </CardContent>
    </Card>
  )
}
