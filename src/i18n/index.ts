import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { es } from './es';
import { en } from './en';
import { pt } from './pt';
import { translationAdditions, withAdditions } from './additions';

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
        es: { translation: withAdditions(es, translationAdditions.es) },
        en: { translation: withAdditions(en, translationAdditions.en) },
        pt: { translation: withAdditions(pt, translationAdditions.pt) },
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

  // Intelligent translation wrapper:
  // When a key or Spanish default string is requested in EN or PT,
  // resolve via phrase dictionary even if the key is untranslated or passed as raw text.
  const originalT = i18n.t.bind(i18n);
  (i18n as any).t = function (key: any, ...args: any[]): any {
    const res = (originalT as any)(key, ...args);
    const currentLang = normalizeLanguage(i18n.language);
    if (currentLang !== 'es' && typeof key === 'string') {
      const defaultVal =
        typeof args[0] === 'string'
          ? args[0]
          : args[0] && typeof args[0] === 'object'
          ? args[0].defaultValue
          : null;
      if (res === key || (defaultVal && res === defaultVal)) {
        const phraseKey = (defaultVal || key).trim();
        const dict = currentLang === 'en' ? (en as Record<string, unknown>) : (pt as Record<string, unknown>);
        const translated = dict[phraseKey];
        if (typeof translated === 'string') return translated;
      }
    }
    return res;
  };
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

export const t = i18n.t.bind(i18n);

export default i18n;
