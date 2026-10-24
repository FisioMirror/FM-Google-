import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export type PixelGrid = {
  rows: number
  cols: number
}

const DEFAULT_GRIDS: Record<string, PixelGrid> = {
  "6x4": { rows: 4, cols: 6 },
  "8x8": { rows: 8, cols: 8 },
  "8x3": { rows: 3, cols: 8 },
  "4x6": { rows: 6, cols: 4 },
  "3x8": { rows: 8, cols: 3 },
}

export type PredefinedGridKey = keyof typeof DEFAULT_GRIDS

export interface PixelImageProps {
  src: string
  alt?: string
  grid?: PredefinedGridKey
  customGrid?: PixelGrid
  grayscaleAnimation?: boolean
  pixelFadeInDuration?: number
  maxAnimationDelay?: number
  colorRevealDelay?: number
  className?: string
  imageClassName?: string
  onAnimationComplete?: () => void
}

export const PixelImage = ({
  src,
  alt = "Pixel image",
  grid = "6x4",
  grayscaleAnimation = true,
  pixelFadeInDuration = 900,
  maxAnimationDelay = 1000,
  colorRevealDelay = 1100,
  customGrid,
  className,
  imageClassName,
  onAnimationComplete,
}: PixelImageProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [showColor, setShowColor] = useState(false)

  const MIN_GRID = 1
  const MAX_GRID = 16

  const { rows, cols } = useMemo(() => {
    const isValidGrid = (g?: PixelGrid) => {
      if (!g) return false
      const { rows: r, cols: c } = g
      return (
        Number.isInteger(r) &&
        Number.isInteger(c) &&
        r >= MIN_GRID &&
        c >= MIN_GRID &&
        r <= MAX_GRID &&
        c <= MAX_GRID
      )
    }
    return isValidGrid(customGrid) ? customGrid! : DEFAULT_GRIDS[grid] || DEFAULT_GRIDS["6x4"]
  }, [customGrid, grid])

  useEffect(() => {
    setIsVisible(false)
    setShowColor(false)

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    const colorTimeout = setTimeout(() => {
      setShowColor(true)
      onAnimationComplete?.()
    }, colorRevealDelay)

    return () => {
      clearTimeout(timer)
      clearTimeout(colorTimeout)
    }
  }, [src, colorRevealDelay, onAnimationComplete])

  const pieces = useMemo(() => {
    const total = rows * cols
    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const clipPath = `polygon(
        ${col * (100 / cols)}% ${row * (100 / rows)}%,
        ${(col + 1) * (100 / cols)}% ${row * (100 / rows)}%,
        ${(col + 1) * (100 / cols)}% ${(row + 1) * (100 / rows)}%,
        ${col * (100 / cols)}% ${(row + 1) * (100 / rows)}%
      )`
      const delay = Math.random() * maxAnimationDelay
      return {
        clipPath,
        delay,
      }
    })
  }, [rows, cols, maxAnimationDelay])

  return (
    <div
      className={cn(
        "relative h-64 w-64 md:h-80 md:w-80 select-none overflow-hidden rounded-3xl shadow-sm border border-outline-variant/30 dark:border-outline-variant/40",
        className
      )}
    >
      {pieces.map((piece, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity ease-out",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          style={{
            clipPath: piece.clipPath,
            transitionDelay: `${piece.delay}ms`,
            transitionDuration: `${pixelFadeInDuration}ms`,
          }}
        >
          <img
            src={src}
            alt={`${alt} ${index + 1}`}
            className={cn(
              "h-full w-full object-cover rounded-3xl",
              grayscaleAnimation && (showColor ? "grayscale-0" : "grayscale"),
              imageClassName
            )}
            style={{
              transition: grayscaleAnimation
                ? `filter ${pixelFadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : "none",
            }}
            draggable={false}
          />
        </div>
      ))}
    </div>
  )
}
