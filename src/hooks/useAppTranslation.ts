import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { changeAppLanguage, normalizeLanguage, type SupportedLanguage } from '../i18n';

export function useAppTranslation() {
  const { t, i18n } = useTranslation();

  const currentLanguage: SupportedLanguage = normalizeLanguage(
    i18n.language || (typeof window !== 'undefined' ? localStorage.getItem('fisio_language') : 'es')
  );

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    changeAppLanguage(lang);
  }, []);

  return {
    t,
    i18n,
    language: currentLanguage,
    setLanguage,
    isEs: currentLanguage === 'es',
    isEn: currentLanguage === 'en',
    isPt: currentLanguage === 'pt',
  };
}

export default useAppTranslation;
