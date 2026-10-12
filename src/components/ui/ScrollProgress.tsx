import React from "react"
import { motion, useScroll, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ScrollProgressProps
  extends Omit<HTMLMotionProps<"div">, "ref"> {
  container?: React.RefObject<HTMLElement>
  ref?: React.Ref<HTMLDivElement>
}

export const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(
  ({ className, container, style, ...props }, ref) => {
    const { scrollYProgress } = useScroll(container ? { container } : undefined)

    return (
      <motion.div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-teal-600 via-cyan-400 to-[#c1ff72] shadow-sm shadow-teal-500/20",
          className
        )}
        style={{
          scaleX: scrollYProgress,
          ...style,
        }}
        {...props}
      />
    )
  }
)

ScrollProgress.displayName = "ScrollProgress"
