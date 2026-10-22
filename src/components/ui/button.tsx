import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary/90 shadow-sm hover:shadow-card",
        primary: "bg-primary text-on-primary hover:bg-primary/90 shadow-sm hover:shadow-card",
        outline:
          "border-outline-variant/40 dark:border-white/15 bg-transparent hover:bg-surface-container text-on-surface hover:text-on-surface",
        secondary:
          "bg-secondary text-white hover:bg-secondary/90 shadow-sm",
        ghost:
          "hover:bg-surface-container text-on-surface-variant hover:text-on-surface",
        destructive:
          "bg-error text-white hover:bg-error/90 shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "relative overflow-hidden bg-primary text-on-primary shadow-sm shadow-primary/20 hover:shadow-card hover:shadow-primary/35 hover:-translate-y-0.5",
        glass: "bg-surface/70 dark:bg-white/10 backdrop-blur-xl border border-outline-variant/30 dark:border-white/20 text-on-surface hover:bg-surface/90 dark:hover:bg-white/20 shadow-sm",
        kinetic: "bg-kinetic text-on-surface font-bold hover:bg-kinetic-light shadow-sm shadow-kinetic/20 hover:shadow-kinetic/40",
      },
      size: {
        default: "h-11 gap-2 px-4 text-sm rounded-xl min-h-[44px]",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs min-h-[44px]",
        sm: "h-9 gap-1.5 rounded-xl px-3 text-xs min-h-[44px]",
        lg: "h-12 gap-2 px-6 text-base rounded-xl",
        icon: "size-11 rounded-xl min-h-[44px] min-w-[44px]",
        "icon-xs": "size-7 rounded-lg min-h-[44px] min-w-[44px]",
        "icon-sm": "size-9 rounded-xl min-h-[44px] min-w-[44px]",
        "icon-lg": "size-12 rounded-xl min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
