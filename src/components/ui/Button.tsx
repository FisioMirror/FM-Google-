import { forwardRef, type ButtonHTMLAttributes } from "react"
import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from "./buttonVariants"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Spinner } from "./Spinner"

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration">, VariantProps<typeof buttonVariants> {
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
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        {icon && iconPosition === "left" && <span className="mr-2 shrink-0">{icon}</span>}
        {children}
        {icon && iconPosition === "right" && <span className="ml-2 shrink-0">{icon}</span>}

        {variant === "glow" && (
          <motion.span
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
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
    <Button ref={ref} variant="ghost" size="icon" className={cn("hover:bg-surface-container text-on-surface", className)} {...props}>
      {icon}
    </Button>
  )
)
IconButton.displayName = "IconButton"

export const BackButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="ghost" size="default" className={cn("hover:bg-surface-variant/30 text-on-surface", className)} {...props}>
      {props.children}
    </Button>
  )
)
BackButton.displayName = "BackButton"
