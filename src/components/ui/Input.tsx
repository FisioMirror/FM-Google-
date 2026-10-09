import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  glassEffect?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, glassEffect, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium">{label}</label>}
        <motion.div
          className={cn(
            "relative",
            error && "has-error"
          )}
          whileFocus={{ scale: 1.01 }}
        >
          <input
            type={type}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm",
              "transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              glassEffect && "glass-panel border-0",
              error
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-input focus:border-ring",
              className
            )}
            {...props}
          />
        </motion.div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
