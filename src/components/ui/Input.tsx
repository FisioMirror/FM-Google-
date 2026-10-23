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
  ({ className, type, label, error, hint, glassEffect = false, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs sm:text-sm font-semibold text-on-surface">
            {label}
          </label>
        )}
        <motion.div
          className={cn(
            "relative w-full",
            error && "has-error"
          )}
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <input
            type={type}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border px-3.5 py-2 text-base text-on-surface",
              "bg-surface/90 dark:bg-surface-container/60 border-outline-variant/30 dark:border-outline-variant/60",
              "placeholder:text-on-surface-variant/50",
              "transition-all duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              glassEffect && "bg-surface/75 dark:bg-surface-container/40 backdrop-blur-xl border-outline-variant/40 dark:border-outline-variant/60",
              error
                ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
                : "",
              className
            )}
            {...props}
          />
        </motion.div>
        {error && (
          <p className="text-xs font-medium text-destructive dark:text-danger mt-0.5">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-on-surface-variant/80 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
