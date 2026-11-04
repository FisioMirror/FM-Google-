import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { GlassModal } from './GlassModal';

type FaqSection =
  | 'fisioDashboard'
  | 'patients'
  | 'patientDetail'
  | 'tokens'
  | 'fisioExercises'
  | 'fisioStats'
  | 'tools'
  | 'profile'
  | 'settings'
  | 'patientDashboard'
  | 'patientExercises'
  | 'patientStats'
  | 'ar'
  | 'calibration'
  | 'ocr'
  | 'catalog'
  | 'ai'
  | 'general';

function resolveSection(pathname: string): FaqSection {
  if (pathname.startsWith('/paciente/') || pathname.startsWith('/patient/')) return 'patientDetail';
  if (pathname.startsWith('/dashboard-fisio')) return 'fisioDashboard';
  if (pathname.startsWith('/patients')) return 'patients';
  if (pathname.startsWith('/tokens')) return 'tokens';
  if (pathname.startsWith('/fisio-exercises')) return 'fisioExercises';
  if (pathname.startsWith('/fisio-stats')) return 'fisioStats';
  if (pathname.startsWith('/tools')) return 'tools';
  if (pathname.startsWith('/fisio-profile') || pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/fisio-settings') || pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/dashboard-paciente')) return 'patientDashboard';
  if (pathname.startsWith('/exercises')) return 'patientExercises';
  if (pathname.startsWith('/stats')) return 'patientStats';
  if (pathname.startsWith('/ar-mirror')) return 'ar';
  if (pathname.startsWith('/calibration')) return 'calibration';
  if (pathname.startsWith('/ocr-scanner')) return 'ocr';
  if (pathname.startsWith('/ui-catalog') || pathname.startsWith('/catalog')) return 'catalog';
  if (pathname.startsWith('/ai-assistant')) return 'ai';
  return 'general';
}

/** Preguntas contextuales por módulo. Se muestran como tarjeta sólida clínica. */
export function ContextualFAQCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const section = resolveSection(location.pathname);
  const items: { q: string; a: string }[] = [];

  for (let i = 1; i <= 3; i += 1) {
    const q = t(`faqctx.${section}.q${i}`, { defaultValue: '' });
    const a = t(`faqctx.${section}.a${i}`, { defaultValue: '' });
    if (q && a && q !== `faqctx.${section}.q${i}`) items.push({ q, a });
  }

  if (items.length === 0) return null;

  return (
    <section className={className}>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Icon name="help" size={18} className="text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('faqctx.title')}
          </h3>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {t('faqctx.thisSection')}
          </span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((faq, index) => {
            const id = `${section}-${index}`;
            const isOpen = openId === id;
            return (
              <div key={id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{faq.q}</span>
                  <Icon
                    name={isOpen ? 'expand_less' : 'expand_more'}
                    size={16}
                    className="text-slate-400 shrink-0"
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-3 -mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface HelpGuideButtonProps {
  onStartTour?: () => void;
}

export function HelpGuideButton({ onStartTour }: HelpGuideButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const section = resolveSection(location.pathname);
  const faqs: { q: string; a: string }[] = [];

  for (let i = 1; i <= 3; i += 1) {
    const q = t(`faqctx.${section}.q${i}`, { defaultValue: '' });
    const a = t(`faqctx.${section}.a${i}`, { defaultValue: '' });
    if (q && a && q !== `faqctx.${section}.q${i}`) faqs.push({ q, a });
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 hover:border-teal-400 transition-colors shadow-sm"
        aria-label={t('faqctx.openAria')}
        title={t('faqctx.openAria')}
      >
        <Icon name="help" size={20} />
      </motion.button>

      <GlassModal isOpen={open} onClose={() => setOpen(false)} size="md" variant="solid">
        <div className="w-full max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="help" size={20} className="text-teal-600" />
              {t('faqctx.title')}
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t('faqctx.thisSection')}
            </span>
          </div>

          {onStartTour && (
            <button
              onClick={() => {
                setOpen(false);
                onStartTour();
              }}
              className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white transition-transform hover:scale-[1.01]"
            >
              <Icon name="tour" size={16} />
              {t('faqctx.startTour')}
            </button>
          )}

          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs mb-1">{faq.q}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassModal>
    </>
  );
}
