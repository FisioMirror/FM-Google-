import { createContext, useContext } from 'react';

export type GlassToastType = 'success' | 'error' | 'info' | 'warning';

export interface GlassToastApi {
  show: (message: string, type?: GlassToastType) => void;
}

export const GlassToastContext = createContext<GlassToastApi | null>(null);

export function useGlassToast(): GlassToastApi {
  const ctx = useContext(GlassToastContext);
  if (!ctx) throw new Error('useGlassToast debe usarse dentro de GlassToastProvider');
  return ctx;
}
