import { createContext, useContext } from "react"

export const DialogContext = createContext<{ onOpenChange: (open: boolean) => void } | null>(null)

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) throw new Error("useDialog must be used within a Dialog")
  return context
}
