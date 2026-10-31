import { useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import { ThemeContext, ZOOM_LEVELS, FONT_SIZE_LEVELS, type Theme, type Handedness } from './themeApi'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('fisio-theme') as Theme | null
    if (stored) return stored
    return 'light'
  })

  const [zoom, setZoomState] = useState<number>(() => {
    if (typeof window === 'undefined') return 100
    const stored = localStorage.getItem('fisio-zoom')
    if (stored) {
      const val = parseInt(stored, 10)
      if (ZOOM_LEVELS.includes(val as any)) return val
    }
    return 100
  })

  const [handedness, setHandednessState] = useState<Handedness>(() => {
    if (typeof window === 'undefined') return 'right'
    return (localStorage.getItem('fisio-handedness') as Handedness) || 'right'
  })

  const [fontSize, setFontSizeState] = useState<number>(() => {
    if (typeof window === 'undefined') return 16
    const stored = localStorage.getItem('fisio-font-size')
    if (stored) {
      const val = parseInt(stored, 10)
      if (FONT_SIZE_LEVELS.includes(val as any)) return val
    }
    return 16
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    requestAnimationFrame(() => {
      root.classList.add(theme)
      root.style.colorScheme = theme
    })
    localStorage.setItem('fisio-theme', theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--app-scale', String(zoom / 100))
    localStorage.setItem('fisio-zoom', String(zoom))
  }, [zoom])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--font-size-base', `${fontSize}px`)
    localStorage.setItem('fisio-font-size', String(fontSize))
  }, [fontSize])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-hand', handedness)
    localStorage.setItem('fisio-handedness', handedness)
  }, [handedness])

  const toggleHandedness = useCallback(() => {
    setHandednessState(prev => prev === 'right' ? 'left' : 'right')
  }, [])

  const setHandedness = useCallback((h: Handedness) => setHandednessState(h), [])

  const resetDefaults = useCallback(() => {
    setZoomState(100)
    setFontSizeState(16)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const setTheme = useCallback((newTheme: Theme) => setThemeState(newTheme), [])
  const setZoom = useCallback((newZoom: number) => setZoomState(newZoom), [])
  const setFontSize = useCallback((newFontSize: number) => setFontSizeState(newFontSize), [])

  const value = useMemo(() => ({ theme, toggleTheme, setTheme, zoom, setZoom, fontSize, setFontSize, resetDefaults, handedness, setHandedness, toggleHandedness }), [theme, toggleTheme, setTheme, zoom, setZoom, fontSize, setFontSize, resetDefaults, handedness, setHandedness, toggleHandedness])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
