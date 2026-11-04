import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, HelpCircle, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'patient' | 'fisio' | 'ar' | 'security';
  routes?: string[];
}

const FAQ_ROUTES: Record<string, string[]> = {
  'faq-1': ['/paciente', '/paciente/ejercicios', '/ar-mirror'],
  'faq-2': ['/dashboard', '/pacientes', '/ejercicios'],
  'faq-5': ['/paciente', '/paciente/perfil'],
  'faq-6': ['/configuracion', '/ar-mirror'],
};

const FAQ_CATEGORIES: Record<string, FAQItem['category']> = {
  'faq-1': 'ar',
  'faq-2': 'fisio',
  'faq-3': 'general',
  'faq-4': 'security',
  'faq-5': 'patient',
  'faq-6': 'ar',
};

export function HelpSection({ className }: { className?: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentRoute = location.pathname;

  const faqDatabase = useMemo<FAQItem[]>(
    () =>
      ['1', '2', '3', '4', '5', '6'].map((n) => ({
        id: `faq-${n}`,
        question: t(`helpcenter.faq.q${n}`),
        answer: t(`helpcenter.faq.a${n}`),
        category: FAQ_CATEGORIES[`faq-${n}`],
        routes: FAQ_ROUTES[`faq-${n}`],
      })),
    [t]
  );

  const filteredFAQs = useMemo(() => {
    return faqDatabase.filter((item) => {
      const matchSearch =
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [faqDatabase, search, selectedCategory]);

  const contextualSuggestions = useMemo(() => {
    return faqDatabase.filter((item) => item.routes && item.routes.some((r) => currentRoute.startsWith(r)));
  }, [faqDatabase, currentRoute]);

  const categories = [
    { id: 'all', label: t('helpcenter.categories.all') },
    { id: 'general', label: t('helpcenter.categories.general') },
    { id: 'ar', label: t('helpcenter.categories.ar') },
    { id: 'fisio', label: t('helpcenter.categories.fisio') },
    { id: 'patient', label: t('helpcenter.categories.patient') },
    { id: 'security', label: t('helpcenter.categories.security') },
  ];

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Cabecera & Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="size-5 text-teal-600 dark:text-teal-400" />
            {t('helpcenter.title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('helpcenter.subtitle')}</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('helpcenter.searchPlaceholder')}
            aria-label={t('helpcenter.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Sugerencias contextuales de la ruta actual */}
      {contextualSuggestions.length > 0 && !search && selectedCategory === 'all' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" />
            {t('helpcenter.suggestions')}
          </div>
          <div className="flex flex-wrap gap-2">
            {contextualSuggestions.map((item) => (
              <button
                key={`sugg-${item.id}`}
                onClick={() => setOpenId(item.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-all text-left"
              >
                {item.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros de Categoría */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Lista de Acordeón */}
      <div className="space-y-3">
        {filteredFAQs.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors"
            >
              <button
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span className="font-semibold text-sm text-slate-900 dark:text-white">{item.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400 shrink-0"
                >
                  <ChevronDown className="size-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
            {t('helpcenter.noResults')}
          </div>
        )}
      </div>
    </div>
  );
}

export default HelpSection;
