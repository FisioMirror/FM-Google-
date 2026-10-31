import { createContext, useContext } from 'react'

/**
 * Tipos, constantes, contexto y hooks de tema sin componentes.
 * `ThemeContext.tsx` solo exporta el provider (react-refresh).
 */

export type Theme = 'light' | 'dark'
export type Handedness = 'right' | 'left'

export const ZOOM_LEVELS = [80, 90, 100, 110, 120] as const
export const FONT_SIZE_LEVELS = [14, 16, 18, 20] as const

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  zoom: number
  setZoom: (zoom: number) => void
  fontSize: number
  setFontSize: (fontSize: number) => void
  resetDefaults: () => void
  handedness: Handedness
  setHandedness: (h: Handedness) => void
  toggleHandedness: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

export function useThemeSafe() {
  return useContext(ThemeContext)
}
