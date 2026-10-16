import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-outline-variant/30 dark:border-white/10 bg-surface/90 dark:bg-surface-container/60 px-3.5 py-2 text-sm text-on-surface transition-all duration-300 ease-out outline-none placeholder:text-on-surface-variant/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
