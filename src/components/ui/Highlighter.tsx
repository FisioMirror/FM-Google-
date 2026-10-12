import { useLayoutEffect, useRef, useState, useEffect } from "react"
import type React from "react"
import { useInView } from "framer-motion"
import { annotate } from "rough-notation"
import type { RoughAnnotation } from "rough-notation/lib/model"
import { cn } from "@/lib/utils"

export type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket"

export interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
  className?: string
}

export function Highlighter({
  children,
  action = "highlight",
  color = "rgba(76, 218, 210, 0.4)",
  strokeWidth = 2,
  animationDuration = 700,
  iterations = 2,
  padding = 3,
  multiline = true,
  isView = false,
  className,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  })
  const shouldShow = !isView || isInView

  // Use layout effect for client-side drawing
  useLayoutEffect(() => {
    const element = elementRef.current
    let annotation: RoughAnnotation | null = null
    let resizeObserver: ResizeObserver | null = null

    if (shouldShow && element) {
      const annotationConfig = {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
      }
      const currentAnnotation = annotate(element, annotationConfig)
      annotation = currentAnnotation
      currentAnnotation.show()

      resizeObserver = new ResizeObserver(() => {
        currentAnnotation.hide()
        currentAnnotation.show()
      })
      resizeObserver.observe(element)
      if (document.body) {
        resizeObserver.observe(document.body)
      }
    }

    return () => {
      annotation?.remove()
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ])

  return (
    <span
      ref={elementRef}
      className={cn("relative inline-block bg-transparent font-medium", className)}
    >
      {children}
    </span>
  )
}

/**
 * Preset clínico con variantes semánticas listas para diagnósticos de FisioMirror:
 * - 'warning': Alertas biomecánicas y dolor
 * - 'success': Objetivos superados y rangos fisiológicos
 * - 'accent': Diagnósticos y patologías clave
 */
export function ClinicalHighlighter({
  children,
  variant = "accent",
  action = "highlight",
  className,
}: {
  children: React.ReactNode
  variant?: "warning" | "success" | "accent" | "info"
  action?: AnnotationAction
  className?: string
}) {
  const colors: Record<string, string> = {
    warning: "rgba(245, 158, 11, 0.35)",
    success: "rgba(16, 185, 129, 0.35)",
    accent: "rgba(76, 218, 210, 0.45)",
    info: "rgba(56, 189, 248, 0.35)",
  }

  return (
    <Highlighter
      action={action}
      color={colors[variant]}
      strokeWidth={action === "highlight" ? 1.5 : 2}
      className={className}
    >
      {children}
    </Highlighter>
  )
}
