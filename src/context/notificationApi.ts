import { createContext, useContext } from 'react'

/**
 * Tipos, contexto y hook de notificaciones sin componentes (react-refresh).
 * `NotificationContext.tsx` solo exporta el provider.
 */

export type NotificationType = 'success' | 'warning' | 'error' | 'info'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  time: string
}

export interface NotificationContextType {
  notifications: Notification[]
  addNotification: (type: NotificationType, title: string, message: string) => void
  clearAll: () => void
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}
