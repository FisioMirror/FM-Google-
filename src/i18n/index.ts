import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { es } from './es';
import { en } from './en';
import { pt } from './pt';

export type SupportedLanguage = 'es' | 'en' | 'pt';

export function normalizeLanguage(code?: string | null): SupportedLanguage {
  if (!code) return 'es';
  const lower = code.toLowerCase().trim();
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('pt')) return 'pt';
  return 'es';
}

const savedLanguage = typeof window !== 'undefined'
  ? normalizeLanguage(localStorage.getItem('fisio_language') || navigator.language)
  : 'es';

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        es: { translation: es },
        en: { translation: en },
        pt: { translation: pt },
      },
      lng: savedLanguage,
      fallbackLng: 'es',
      load: 'languageOnly',
      compatibilityJSON: 'v4',
      returnNull: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
      },
    });
}

export function changeAppLanguage(lang: SupportedLanguage) {
  const normalized = normalizeLanguage(lang);
  i18n.changeLanguage(normalized);
  if (typeof window !== 'undefined') {
    localStorage.setItem('fisio_language', normalized);
    document.documentElement.lang = normalized;
    window.dispatchEvent(
      new CustomEvent('fisio_language_changed', { detail: { lang: normalized } })
    );
  }
}

export default i18n;
