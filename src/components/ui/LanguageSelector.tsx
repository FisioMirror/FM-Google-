import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { changeAppLanguage } from '../../i18n';
import { cn } from '../../lib/utils';

export type SupportedLanguage = 'es' | 'en' | 'pt';

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'es', label: 'Español', nativeName: 'Español (ES)', flag: '🇪🇸' },
  { code: 'en', label: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', nativeName: 'Português (BR)', flag: '🇧🇷' },
];

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
  dropdownAlign?: 'left' | 'right';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
  dropdownAlign = 'right',
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalizar código de idioma activo
  const activeCode: SupportedLanguage = (() => {
    const raw = (i18n.language || (typeof localStorage !== 'undefined' && localStorage.getItem('fisio_language')) || 'es').toLowerCase();
    if (raw.startsWith('en')) return 'en';
    if (raw.startsWith('pt')) return 'pt';
    return 'es';
  })();

  const currentLang = LANGUAGES.find((l) => l.code === activeCode) || LANGUAGES[0];

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Sincronizar evento global si cambia externamente
  useEffect(() => {
    const handleLangEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: SupportedLanguage }>;
      if (customEvent.detail?.lang && customEvent.detail.lang !== i18n.language) {
        i18n.changeLanguage(customEvent.detail.lang);
      }
    };
    window.addEventListener('fisio_language_changed', handleLangEvent);
    return () => window.removeEventListener('fisio_language_changed', handleLangEvent);
  }, [i18n]);

  const handleSelect = (code: SupportedLanguage) => {
    changeAppLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block select-none', className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border transition-all duration-200 cursor-pointer text-xs font-semibold',
          'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-teal-500/30 dark:border-white/10',
          'text-slate-800 dark:text-slate-100 hover:border-teal-500/60 hover:bg-teal-50/40 dark:hover:bg-slate-800/80 shadow-xs',
          compact ? 'px-2 py-1.5' : 'px-2.5 sm:px-3 py-1.5'
        )}
        aria-label="Seleccionar idioma / Select language"
        title={`Idioma actual: ${currentLang.nativeName}`}
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none shrink-0" role="img" aria-label={currentLang.label}>
          {currentLang.flag}
        </span>
        <span className="uppercase tracking-wider font-bold text-[11px] text-teal-700 dark:text-teal-300">
          {currentLang.code}
        </span>
        <ChevronDown
          size={12}
          className={cn(
            'text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180 text-teal-600 dark:text-teal-400'
          )}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute top-full mt-1.5 z-50 w-44 rounded-2xl p-1.5 shadow-2xl',
              'bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-teal-500/20 dark:border-white/10 text-slate-800 dark:text-slate-100',
              dropdownAlign === 'right' ? 'right-0' : 'left-0'
            )}
            role="menu"
          >
            <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <Globe size={11} className="text-teal-500" />
              <span>Idioma / Language</span>
            </div>

            <div className="pt-1 space-y-0.5">
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === activeCode;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    role="menuitem"
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left',
                      isSelected
                        ? 'bg-teal-500/15 text-teal-800 dark:text-teal-200 font-bold border border-teal-500/30'
                        : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-none">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
