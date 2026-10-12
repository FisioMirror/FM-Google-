import { forwardRef } from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export const InteractiveHoverButton = forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border border-primary/30 p-2.5 px-6 text-center font-semibold text-sm",
        "bg-surface dark:bg-slate-900 text-on-surface shadow-xs transition-all duration-300 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
      {...props}
    >
      {/* Centered resting state */}
      <div className="flex items-center justify-center gap-2.5">
        <div className="bg-primary h-2 w-2 rounded-full transition-all duration-300 ease-out group-hover:scale-[105]" />
        <span className="inline-block transition-all duration-300 ease-out group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>

      {/* Hover reveal state with forward arrow */}
      <div className="text-white absolute top-0 inset-x-0 z-10 flex h-full w-full translate-x-10 items-center justify-center gap-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
        <span className="font-semibold">{children}</span>
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </button>
  )
})

InteractiveHoverButton.displayName = "InteractiveHoverButton"
