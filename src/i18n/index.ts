import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { es } from './es';
import { en } from './en';
import { pt } from './pt';

export type AppLanguage = 'es' | 'en' | 'pt';

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return 'es';
  try {
    const raw = localStorage.getItem('fisio_language');
    if (raw) {
      const code = raw.slice(0, 2).toLowerCase();
      if (code === 'en' || code === 'pt' || code === 'es') return code;
    }
    const navLang = (navigator.language || navigator.languages?.[0] || 'es').slice(0, 2).toLowerCase();
    if (navLang === 'en' || navLang === 'pt') return navLang;
  } catch {
    // fallback
  }
  return 'es';
};

const initialLang = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: initialLang,
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
  },
});

// Sync HTML lang attribute immediately on boot
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export interface CustomTranslationItem {
  es: string;
  en: string;
  pt: string;
}

export type CustomTranslationsStore = Record<string, Record<string, CustomTranslationItem>>;

const CUSTOM_TRANSLATIONS_KEY = 'fisio_custom_translations';

export function getCustomTranslations(): CustomTranslationsStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOM_TRANSLATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadCustomTranslations(): void {
  if (typeof window === 'undefined') return;
  try {
    const custom = getCustomTranslations();
    for (const [ns, keys] of Object.entries(custom)) {
      for (const [key, val] of Object.entries(keys)) {
        if (val.es) i18n.addResource('es', 'translation', `${ns}.${key}`, val.es);
        if (val.en) i18n.addResource('en', 'translation', `${ns}.${key}`, val.en);
        if (val.pt) i18n.addResource('pt', 'translation', `${ns}.${key}`, val.pt);
      }
    }
  } catch (e) {
    console.warn('[i18n] Failed to load custom translations:', e);
  }
}

// Initial merge of any stored custom translations
loadCustomTranslations();

export function addCustomTranslation(
  namespace: string,
  key: string,
  values: CustomTranslationItem
): void {
  const store = getCustomTranslations();
  if (!store[namespace]) store[namespace] = {};
  store[namespace][key] = values;

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_TRANSLATIONS_KEY, JSON.stringify(store));
    }
    // Update live i18n instance immediately
    if (values.es) i18n.addResource('es', 'translation', `${namespace}.${key}`, values.es);
    if (values.en) i18n.addResource('en', 'translation', `${namespace}.${key}`, values.en);
    if (values.pt) i18n.addResource('pt', 'translation', `${namespace}.${key}`, values.pt);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('fisio_custom_translation_added', {
          detail: { namespace, key, values },
        })
      );
    }
  } catch (err) {
    console.error('[i18n] Failed to persist custom translation:', err);
  }
}

export function clearCustomTranslations(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CUSTOM_TRANSLATIONS_KEY);
      window.dispatchEvent(new CustomEvent('fisio_custom_translation_cleared'));
    }
  } catch (err) {
    console.error('[i18n] Failed to clear custom translations:', err);
  }
}

export function getAllTranslationValues(lang: AppLanguage = (i18n.language as AppLanguage) || 'es'): Set<string> {
  const set = new Set<string>();
  try {
    const bundle = (i18n.getResourceBundle(lang, 'translation') || {}) as Record<string, any>;
    function extract(obj: Record<string, any>) {
      for (const val of Object.values(obj)) {
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed) set.add(trimmed.toLowerCase());
        } else if (val && typeof val === 'object') {
          extract(val);
        }
      }
    }
    extract(bundle);

    // Also include other languages' values so if text is already in EN or PT it can be recognized
    ['es', 'en', 'pt'].forEach((l) => {
      if (l !== lang) {
        const otherBundle = (i18n.getResourceBundle(l, 'translation') || {}) as Record<string, any>;
        extract(otherBundle);
      }
    });
  } catch (e) {
    console.warn('[i18n] Error collecting translation values:', e);
  }
  return set;
}

export async function changeAppLanguage(lang: AppLanguage): Promise<AppLanguage> {
  const target: AppLanguage = ['es', 'en', 'pt'].includes(lang) ? lang : 'es';
  try {
    await i18n.changeLanguage(target);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fisio_language', target);
      document.documentElement.lang = target;
      window.dispatchEvent(
        new CustomEvent('fisio_language_changed', { detail: { lang: target } })
      );
    }
  } catch (err) {
    console.error('[i18n] Error changing language:', err);
  }
  return target;
}

export default i18n;

