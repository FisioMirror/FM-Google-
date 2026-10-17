/**
 * Helpers de formato internacional (fecha/hora/relativo) coherentes con i18n.
 * Reemplaza los hardcodes `es-ES` existentes en toda la app.
 */
import i18n from '../i18n';

const LOCALES = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' } as const;

export type SupportedLang = keyof typeof LOCALES;

export function currentLocale(): string {
  const lang = i18n.language as SupportedLang | undefined;
  return LOCALES[lang ?? 'es'] ?? LOCALES.es;
}

/** Fecha larga corta: 17 oct 2026 */
export function formatDate(value: Date | string | number): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(currentLocale(), { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

/** Fecha y hora: 17 oct 2026, 14:32 */
export function formatDateTime(value: Date | string | number): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(currentLocale(), {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

/** Hora corta: 14:32 */
export function formatTime(value: Date | string | number): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(currentLocale(), { hour: '2-digit', minute: '2-digit' }).format(d);
}

/** Día y mes: 17 de oct / Oct 17 */
export function formatDayMonth(value: Date | string | number): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(currentLocale(), { day: '2-digit', month: 'short' }).format(d);
}

/** Fecha larga: "miércoles 5 de octubre de 2026" / "Wednesday, October 5, 2026". */
export function formatLongDate(value: Date | string | number): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(currentLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** Etiquetas de los 7 días con lunes como primer día (Lun..Dom / Mon..Sun / Seg..Dom). */
export function weekdayShortLabels(): string[] {
  const fmt = new Intl.DateTimeFormat(currentLocale(), { weekday: 'short' });
  // 2026-10-05 es lunes
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const base = new Date(2026, 9, 5 + i);
    return fmt.format(base).replace('.', '').toUpperCase().slice(0, 3);
  });
}

/** Mes corto de un año dado en minúsculas: oct, nov… */
export function monthShortLabel(monthIndexZeroBased: number): string {
  const fmt = new Intl.DateTimeFormat(currentLocale(), { month: 'short' });
  return fmt.format(new Date(2026, monthIndexZeroBased, 1)).replace('.', '').toLowerCase();
}

/** "hace 5 min", "hace 2 h", "hace 3 d" según idioma activo. */
export function formatRelative(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat(currentLocale(), { numeric: 'auto' });
  if (Math.abs(mins) < 60) return rtf.format(-mins, 'minute');
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(-days, 'day');
  return rtf.format(-Math.round(days / 30), 'month');
}
