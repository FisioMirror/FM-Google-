import { useEffect, useRef, forwardRef, type ComponentPropsWithoutRef } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"
import { currentLocale } from '../../lib/format';

export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
  prefix?: string
  suffix?: string
}

export const NumberTicker = forwardRef<HTMLSpanElement, NumberTickerProps>(
  (
    {
      value,
      startValue = 0,
      direction = "up",
      delay = 0,
      className,
      decimalPlaces = 0,
      prefix = "",
      suffix = "",
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLSpanElement>(null)
    const ref = (forwardedRef as React.RefObject<HTMLSpanElement>) || internalRef
    const motionValue = useMotionValue(direction === "down" ? value : startValue)
    const springValue = useSpring(motionValue, {
      damping: 60,
      stiffness: 100,
    })
    const isInView = useInView(ref, { once: true, margin: "0px" })

    useEffect(() => {
      let timer: ReturnType<typeof setTimeout> | null = null
      if (isInView) {
        timer = setTimeout(() => {
          motionValue.set(direction === "down" ? startValue : value)
        }, delay * 1000)
      }
      return () => {
        if (timer !== null) {
          clearTimeout(timer)
        }
      }
    }, [motionValue, isInView, delay, value, direction, startValue])

    useEffect(
      () =>
        springValue.on("change", (latest) => {
          if (ref.current) {
            const formatted = Intl.NumberFormat(currentLocale(), {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces,
            }).format(Number(latest.toFixed(decimalPlaces)))
            ref.current.textContent = `${prefix}${formatted}${suffix}`
          }
        }),
      [springValue, decimalPlaces, prefix, suffix, ref]
    )

    return (
      <span
        ref={ref}
        className={cn(
          "inline-block tracking-wider text-on-surface tabular-nums font-semibold",
          className
        )}
        {...props}
      >
        {`${prefix}${startValue}${suffix}`}
      </span>
    )
  }
)

NumberTicker.displayName = "NumberTicker"
