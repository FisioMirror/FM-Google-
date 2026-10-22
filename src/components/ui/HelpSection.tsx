import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ChevronDown, HelpCircle, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'patient' | 'fisio' | 'ar' | 'security';
  routes?: string[];
}

function buildFAQDatabase(t: (k: string) => string): FAQItem[] {
  return [
  {
    id: 'faq-1',
    question: t('hs.faqArSessionQ'),
    answer: t('hs.faqArSessionA'),
    category: 'ar',
    routes: ['/dashboard-paciente', '/exercises', '/ar-mirror'],
  },
  {
    id: 'faq-2',
    question: t('hs.faqAssignRoutineQ'),
    answer: t('hs.faqAssignRoutineA'),
    category: 'fisio',
    routes: ['/dashboard-fisio', '/patients', '/fisio-exercises'],
  },
  {
    id: 'faq-3',
    question: t('hs.faqOfflineQ'),
    answer: t('hs.faqOfflineA'),
    category: 'general',
  },
  {
    id: 'faq-4',
    question: t('hs.faqCameraDataQ'),
    answer: t('hs.faqCameraDataA'),
    category: 'security',
  },
  {
    id: 'faq-5',
    question: t('hs.faqContactDirectQ'),
    answer: t('hs.faqContactDirectA'),
    category: 'patient',
    routes: ['/dashboard-paciente', '/profile'],
  },
  {
    id: 'faq-6',
    question: t('hs.faqMediapipeQ'),
    answer: t('hs.faqMediapipeA'),
    category: 'ar',
    routes: ['/settings', '/fisio-settings', '/ar-mirror'],
  },
  ];
}

export function HelpSection({ className }: { className?: string }) {
  const location = useLocation();
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqDatabase = useMemo(() => buildFAQDatabase(t), [t]);

  const currentRoute = location.pathname;

  const filteredFAQs = useMemo(() => {
    return faqDatabase.filter((item) => {
      const matchSearch =
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory, faqDatabase]);

  const contextualSuggestions = useMemo(() => {
    return faqDatabase.filter((item) => item.routes && item.routes.some((r) => currentRoute.startsWith(r)));
  }, [currentRoute, faqDatabase]);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Cabecera & Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            {t('hs.title')}
          </h2>
          <p className="text-xs text-on-surface-variant">{t('hs.subtitle')}</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('hs.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-surface-container-high border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Sugerencias contextuales de la ruta actual */}
      {contextualSuggestions.length > 0 && !search && selectedCategory === 'all' && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" />
            {t('hs.suggestionsTitle')}
          </div>
          <div className="flex flex-wrap gap-2">
            {contextualSuggestions.map((item) => (
              <button
                key={`sugg-${item.id}`}
                onClick={() => setOpenId(item.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-primary/20 text-on-surface hover:border-primary hover:text-primary transition-all text-left"
              >
                {item.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros de Categoría */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: t('tools.tabAll') },
          { id: 'general', label: t('hs.catGeneral') },
          { id: 'ar', label: t('navigation.arMirror') },
          { id: 'fisio', label: t('common.therapist') },
          { id: 'patient', label: t('common.patient') },
          { id: 'security', label: t('set.security') },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
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
              className="rounded-2xl border border-outline/15 bg-surface overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-surface-container-low transition-colors"
              >
                <span className="font-semibold text-sm text-on-surface">{item.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-outline shrink-0"
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
                    <div className="px-4 pb-4 pt-1 text-sm text-on-surface-variant leading-relaxed border-t border-outline/15 bg-surface-container-lowest/50">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-8 text-sm text-outline">
            {t('hs.emptyState')}
          </div>
        )}
      </div>
    </div>
  );
}

export default HelpSection;
