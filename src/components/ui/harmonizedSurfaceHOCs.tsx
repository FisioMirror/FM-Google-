import { forwardRef, type ComponentType } from "react";
import { HarmonizedSurface, type HarmonizedSurfaceProps } from "./HarmonizedSurface";

export function withHarmonizedSurface<P extends object>(
  WrappedComponent: ComponentType<P>,
  defaultOptions: Partial<HarmonizedSurfaceProps> = {}
) {
  const HarmonizedComponent = forwardRef<HTMLDivElement, P & { surfaceProps?: Partial<HarmonizedSurfaceProps> }>(
    ({ surfaceProps, ...componentProps }, ref) => {
      const mergedOptions = { ...defaultOptions, ...surfaceProps }

      return (
        <HarmonizedSurface ref={ref} {...mergedOptions}>
          <WrappedComponent {...(componentProps as P)} />
        </HarmonizedSurface>
      )
    }
  )

  HarmonizedComponent.displayName = `withHarmonizedSurface(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return HarmonizedComponent
}

export function withHarmonizedCard<P extends object>(
  WrappedComponent: ComponentType<P>,
  defaultOptions: Partial<HarmonizedSurfaceProps> = {}
) {
  return withHarmonizedSurface(WrappedComponent, {
    variant: "card",
    interactive: true,
    padding: "md",
    glass: "subtle",
    ...defaultOptions,
  })
}
