import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { es } from './es';
import { en } from './en';
import { pt } from './pt';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('fisio_language') || 'es' : 'es';

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: savedLanguage,
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export function changeAppLanguage(lang: 'es' | 'en' | 'pt') {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('fisio_language', lang);
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('fisio_language_changed', { detail: { lang } }));
  }
}

export default i18n;
