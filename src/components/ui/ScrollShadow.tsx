import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";

export interface ScrollShadowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: "vertical" | "horizontal";
  hideScrollBar?: boolean;
  offset?: number;
  size?: number;
  className?: string;
  shadowColor?: string;
}

/**
 * ScrollShadow - Contenedor accesible con sombras de desbordamiento automáticas
 * Avisa visualmente al usuario cuando hay contenido clínico oculto por scroll superior/inferior o lateral.
 * Estandarizado para FisioMirror con soporte Dark Mode y transiciones suaves.
 */
export const ScrollShadow = React.forwardRef<HTMLDivElement, ScrollShadowProps>(
  (
    {
      children,
      orientation = "vertical",
      hideScrollBar = false,
      offset = 0,
      size = 40,
      className,
      shadowColor,
      onScroll,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [hasStartShadow, setHasStartShadow] = useState(false);
    const [hasEndShadow, setHasEndShadow] = useState(false);

    const updateShadows = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;

      if (orientation === "vertical") {
        const { scrollTop, scrollHeight, clientHeight } = el;
        const maxScroll = scrollHeight - clientHeight;
        setHasStartShadow(scrollTop > offset);
        setHasEndShadow(scrollTop < maxScroll - offset - 1);
      } else {
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxScroll = scrollWidth - clientWidth;
        setHasStartShadow(scrollLeft > offset);
        setHasEndShadow(scrollLeft < maxScroll - offset - 1);
      }
    }, [orientation, offset]);

    useEffect(() => {
      updateShadows();
      const el = containerRef.current;
      if (!el) return;

      const resizeObserver = new ResizeObserver(() => {
        updateShadows();
      });
      resizeObserver.observe(el);

      return () => resizeObserver.disconnect();
    }, [updateShadows, children]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      updateShadows();
      if (onScroll) onScroll(e);
    };

    return (
      <div className={cn("relative overflow-hidden group", className)}>
        {/* Sombra Superior / Izquierda */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute z-10 transition-opacity duration-300 ease-out",
            orientation === "vertical"
              ? "inset-x-0 top-0 h-10 bg-gradient-to-b from-white dark:from-[#0b1017] to-transparent"
              : "inset-y-0 left-0 w-10 bg-gradient-to-r from-white dark:from-[#0b1017] to-transparent",
            hasStartShadow ? "opacity-100" : "opacity-0"
          )}
          style={{
            height: orientation === "vertical" ? `${size}px` : undefined,
            width: orientation === "horizontal" ? `${size}px` : undefined,
          }}
        />

        {/* Contenedor scrolleable */}
        <div
          ref={(node) => {
            containerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          onScroll={handleScroll}
          className={cn(
            "relative w-full h-full",
            orientation === "vertical"
              ? "overflow-y-auto overflow-x-hidden"
              : "overflow-x-auto overflow-y-hidden",
            hideScrollBar && "no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}
          {...props}
        >
          {children}
        </div>

        {/* Sombra Inferior / Derecha */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute z-10 transition-opacity duration-300 ease-out",
            orientation === "vertical"
              ? "inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-[#0b1017] to-transparent"
              : "inset-y-0 right-0 w-10 bg-gradient-to-l from-white dark:from-[#0b1017] to-transparent",
            hasEndShadow ? "opacity-100" : "opacity-0"
          )}
          style={{
            height: orientation === "vertical" ? `${size}px` : undefined,
            width: orientation === "horizontal" ? `${size}px` : undefined,
          }}
        />
      </div>
    );
  }
);

ScrollShadow.displayName = "ScrollShadow";

export default ScrollShadow;
