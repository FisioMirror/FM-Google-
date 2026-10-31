import { type ReactNode, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "./Button"
import { buttonVariants } from "./buttonVariants"
import { DialogContext } from "./dialogContext"
import type { VariantProps } from "class-variance-authority"
import { useFocusTrap } from "@/hooks/useFocusTrap"

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  size?: "sm" | "md" | "lg" | "full"
  dismissable?: boolean
  glassEffect?: boolean
  showCloseButton?: boolean
}

export function Dialog({
  open,
  onOpenChange,
  children,
  size = "md",
  dismissable = true,
  glassEffect = true,
  showCloseButton = true,
}: DialogProps) {
  const maxWidth = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-4xl",
  }[size]

  const trapRef = useFocusTrap<HTMLDivElement>(open)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <DialogContext.Provider value={{ onOpenChange }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dismissable && onOpenChange(false)}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={trapRef}
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={cn(
                "relative w-full rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl",
                "bg-surface/95 dark:bg-surface-container/95 border border-outline-variant/30 dark:border-white/10 text-on-surface",
                glassEffect && "backdrop-blur-2xl",
                maxWidth
              )}
            >
              {showCloseButton && (
                <button
                  type="button"
                  className="absolute top-5 right-5 p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  onClick={() => onOpenChange(false)}
                  aria-label="Cerrar modal"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </DialogContext.Provider>
      )}
    </AnimatePresence>
  )
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-1.5 pb-4 pr-8", className)}>{children}</div>
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-lg sm:text-xl font-bold tracking-tight text-on-surface", className)}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs sm:text-sm text-on-surface-variant leading-relaxed", className)}>{children}</p>
}

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("py-4", className)}>{children}</div>
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-end space-x-2.5 pt-4 border-t border-outline-variant/20 dark:border-white/5", className)}>{children}</div>
}

type ButtonVariantType = VariantProps<typeof buttonVariants>["variant"]

// Dialog de confirmación listo para usar con lógica completa
export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmar",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  confirmVariant = "default",
  cancelVariant = "outline",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  confirmVariant?: ButtonVariantType
  cancelVariant?: ButtonVariantType
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <DialogFooter>
        <Button variant={cancelVariant} onClick={() => onCancel ? onCancel() : onOpenChange(false)}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
