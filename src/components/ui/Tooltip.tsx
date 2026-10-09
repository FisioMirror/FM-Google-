import { type ReactNode, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: "top" | "bottom" | "left" | "right"
  className?: string
  delay?: number
  glassEffect?: boolean
  animated?: boolean
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
}

const arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
  left: "left-full top-1/2 -translate-y-1/2 translate-x-1/2",
  right: "right-full top-1/2 -translate-y-1/2 -translate-x-1/2",
}

export function Tooltip({
  content,
  children,
  side = "top",
  className,
  delay = 300,
  glassEffect = true,
  animated = true,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    const id = setTimeout(() => setVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setVisible(false)
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={animated ? { opacity: 0, scale: 0.9, y: -5 } : false}
            animate={animated ? { opacity: 1, scale: 1, y: 0 } : false}
            exit={animated ? { opacity: 0, scale: 0.9, y: -5 } : false}
            transition={animated ? { duration: 0.15 } : { duration: 0 }}
            className={cn(
              "absolute z-[300] pointer-events-none",
              "px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg",
              glassEffect ? "glass-panel text-on-surface" : "bg-popover text-popover-foreground",
              positionClasses[side],
              className
            )}
          >
            {content}
            <div
              className={cn(
                "absolute w-2 h-2 rotate-45 bg-inherit",
                arrowClasses[side]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
