import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background select-none active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md",
        primary: "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive: "bg-error text-white hover:bg-error/90 shadow-sm",
        outline: "border border-outline-variant/40 dark:border-white/15 bg-transparent hover:bg-surface-container text-on-surface hover:text-on-surface",
        secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-sm",
        ghost: "hover:bg-surface-container text-on-surface-variant hover:text-on-surface",
        link: "underline-offset-4 hover:underline text-primary dark:text-primary-300",
        // 🌟 VARIANTES PREMIUM FISIOMIRROR
        glow: "relative overflow-hidden bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5",
        glass: "bg-surface/70 dark:bg-white/10 backdrop-blur-xl border border-outline-variant/30 dark:border-white/20 text-on-surface hover:bg-surface/90 dark:hover:bg-white/20 shadow-sm",
        gradient: "bg-gradient-to-r from-teal-700 via-teal-600 to-secondary text-white hover:from-teal-600 hover:to-secondary/90 shadow-md shadow-teal-900/15",
        kinetic: "bg-kinetic text-slate-950 font-bold hover:bg-kinetic-light shadow-md shadow-kinetic/20 hover:shadow-kinetic/40",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 rounded-xl text-xs",
        lg: "h-12 px-6 rounded-xl text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
