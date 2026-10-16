import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage, type AppLanguage } from '../../i18n';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LANGUAGES: Array<{ code: AppLanguage; label: string; short: string; flag: string }> = [
  { code: 'es', label: 'Español', short: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', short: 'PT', flag: '🇧🇷' },
];

interface LanguageSelectorProps {
  variant?: 'compact' | 'segmented' | 'dropdown';
  className?: string;
  onLanguageChange?: (code: AppLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
  onLanguageChange,
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Directly derive active code from resolved or base language without stale isolated state
  const rawCode = (i18n.resolvedLanguage || i18n.language || 'es').slice(0, 2).toLowerCase();
  const activeCode: AppLanguage = (['es', 'en', 'pt'].includes(rawCode) ? rawCode : 'es') as AppLanguage;

  // Re-sync listener for any external language switch
  const [, setRerender] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setRerender((c) => c + 1);
    i18n.on('languageChanged', handleUpdate);
    window.addEventListener('fisio_language_changed', handleUpdate);
    return () => {
      i18n.off('languageChanged', handleUpdate);
      window.removeEventListener('fisio_language_changed', handleUpdate);
    };
  }, [i18n]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = async (code: AppLanguage) => {
    setIsOpen(false);
    if (code === activeCode) return;
    await changeAppLanguage(code);
    onLanguageChange?.(code);
  };

  const currentItem = LANGUAGES.find((l) => l.code === activeCode) || LANGUAGES[0];

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container-high/60 dark:bg-surface-container-high/40 border border-outline-variant/30 backdrop-blur-md ${className}`}
        role="group"
        aria-label={t('settings.language') || 'Seleccionar idioma'}
      >
        {LANGUAGES.map((lang) => {
          const isActive = activeCode === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm shadow-primary/20 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              title={lang.label}
              aria-pressed={isActive}
            >
              <span className="text-sm select-none">{lang.flag}</span>
              <span>{lang.short}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact variant with dropdown
  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 shadow-sm"
        title="Cambiar idioma / Change language / Mudar idioma"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-sm leading-none select-none">{currentItem.flag}</span>
        <span className="tracking-wide uppercase font-bold text-[11px] text-on-surface">{currentItem.short}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[9990]"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 mt-2 z-[9999] w-44 rounded-2xl bg-surface/95 dark:bg-surface-container-high/95 backdrop-blur-xl shadow-2xl border border-outline-variant/40 p-1.5 ring-1 ring-black/5"
              role="listbox"
              aria-label="Idiomas disponibles"
            >
              <div className="px-2.5 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-outline border-b border-outline-variant/20">
                {t('settings.language') || 'Idioma / Language'}
              </div>
              {LANGUAGES.map((lang) => {
                const isActive = activeCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                        : 'text-on-surface hover:bg-surface-container hover:text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base leading-none select-none">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
