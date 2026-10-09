import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Spinner } from "./Spinner"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive: "bg-error text-white hover:bg-error/90 shadow-sm",
        outline: "border border-outline-variant/40 dark:border-white/15 bg-transparent hover:bg-surface-container text-on-surface hover:text-on-surface",
        secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-sm",
        ghost: "hover:bg-surface-container text-on-surface-variant hover:text-on-surface",
        link: "underline-offset-4 hover:underline text-primary dark:text-primary-300",
        // 🌟 VARIANTES PREMIUM FISIOMIRROR
        glow: "relative overflow-hidden bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5",
        glass: "bg-surface/70 dark:bg-white/10 backdrop-blur-xl border border-outline-variant/30 dark:border-white/20 text-on-surface hover:bg-surface/90 dark:hover:bg-white/20 shadow-sm",
        gradient: "bg-gradient-to-r from-teal-700 via-teal-600 to-secondary text-white hover:from-teal-600 hover:to-secondary/90 shadow-md shadow-teal-900/15",
        kinetic: "bg-kinetic text-slate-950 font-bold hover:bg-kinetic-light shadow-md shadow-kinetic/20 hover:shadow-kinetic/40",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 rounded-lg text-xs",
        lg: "h-12 px-6 rounded-xl text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  glowEffect?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, icon, iconPosition = "left", glowEffect, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={loading || props.disabled}
        whileHover={glowEffect ? { scale: 1.02 } : undefined}
        whileTap={glowEffect ? { scale: 0.98 } : undefined}
        {...props}
      >
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}

        {variant === "glow" && (
          <motion.span
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: -100 }}
            animate={{ x: 100 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

// Variantes específicas
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, icon, ...props }, ref) => (
    <Button ref={ref} variant="ghost" size="icon" className={cn("hover:bg-muted", className)} {...props}>
      {icon}
    </Button>
  )
)
IconButton.displayName = "IconButton"

export const BackButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="ghost" size="default" className={cn("hover:bg-surface-variant/30", className)} {...props}>
      {props.children}
    </Button>
  )
)
BackButton.displayName = "BackButton"
