import { createContext, type ReactNode, useContext, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "./Button"

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  size?: "sm" | "md" | "lg" | "full"
  dismissable?: boolean
  glassEffect?: boolean
  showCloseButton?: boolean
}

const DialogContext = createContext<{ onOpenChange: (open: boolean) => void } | null>(null)

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) throw new Error("useDialog must be used within a Dialog")
  return context
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
    full: "max-w-full",
  }[size]

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
            className={cn(
              "fixed inset-0 z-50 bg-black/30",
              glassEffect && "backdrop-blur-md"
            )}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "relative w-full rounded-xl bg-background p-6 shadow-xl",
                glassEffect && "glass-modal backdrop-blur-xl",
                maxWidth
              )}
            >
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
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
  return <div className={cn("flex flex-col space-y-1.5 pb-4", className)}>{children}</div>
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
}

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("py-4", className)}>{children}</div>
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-end space-x-2 pt-4", className)}>{children}</div>
}

// Dialog de confirmación listo para usar
export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmar",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  confirmVariant = "primary",
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
  confirmVariant?: any
  cancelVariant?: any
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
