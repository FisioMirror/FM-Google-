import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { GlassModal } from './GlassModal';

function buildFAQS(t: (k: string) => string): Record<string, { q: string; a: string }[]> {
  return {
    '/dashboard-fisio': [
      { q: t('hg.faqPatientDetailQ'), a: t('hg.faqPatientDetailA') },
      { q: t('hg.faqTokenQ'), a: t('hg.faqTokenA') },
      { q: t('hg.faqAdvancedStatsQ'), a: t('hg.faqAdvancedStatsA') },
    ],
    '/patients': [
      { q: t('hg.faqNewPatientQ'), a: t('hg.faqNewPatientA') },
      { q: t('hg.faqFilterTagQ'), a: t('hg.faqFilterTagA') },
    ],
    '/tools': [
      { q: t('hg.faqOcrQ'), a: t('hg.faqOcrA') },
      { q: t('hg.faqExportPdfQ'), a: t('hg.faqExportPdfA') },
    ],
    '/dashboard-paciente': [
      { q: t('hg.faqStartRoutineQ'), a: t('hg.faqStartRoutineA') },
      { q: t('hg.faqArModeQ'), a: t('hg.faqArModeA') },
    ],
    '/exercises': [
      { q: t('hg.faqDemo3dQ'), a: t('hg.faqDemo3dA') },
      { q: t('hg.faqRepsQ'), a: t('hg.faqRepsA') },
    ],
    '/stats': [
      { q: t('hg.faqProgressQ'), a: t('hg.faqProgressA') },
      { q: t('hg.faqStreakQ'), a: t('hg.faqStreakA') },
    ],
    '/profile': [
      { q: t('hg.faqProfileQ'), a: t('hg.faqProfileA') },
      { q: t('hg.faqPrivacyQ'), a: t('hg.faqPrivacyA') },
    ],
    '/settings': [
      { q: t('hg.faqLanguageQ'), a: t('hg.faqLanguageA') },
      { q: t('hg.faqTalkbackQ'), a: t('hg.faqTalkbackA') },
    ],
  };
}

function buildDefaultFAQs(t: (k: string) => string): { q: string; a: string }[] {
  return [
    { q: t('hg.faqContactQ'), a: t('hg.faqContactA') },
    { q: t('hg.faqPainQ'), a: t('hg.faqPainA') },
    { q: t('hg.faqDataSafeQ'), a: t('hg.faqDataSafeA') },
  ];
}

interface HelpGuideButtonProps {
  onStartTour?: () => void;
}

export function HelpGuideButton({ onStartTour }: HelpGuideButtonProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const faqs = buildFAQS(t)[location.pathname] || buildDefaultFAQs(t);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full glass-panel text-primary hover:text-primary-600 transition-colors shadow-xs"
        aria-label={t('hg.ariaHelp')}
      >
        <Icon name="help" size={20} />
      </motion.button>

      <GlassModal isOpen={open} onClose={() => setOpen(false)} size="md">
        <div className="w-full max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
              <Icon name="help" size={20} className="text-primary" />
              {t('hg.title')}
            </h3>
          </div>

          {onStartTour && (
            <button
              onClick={() => {
                setOpen(false);
                onStartTour();
              }}
              className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary transition-transform hover:scale-[1.01]"
            >
              <Icon name="tour" size={16} />
              {t('hg.startTour')}
            </button>
          )}

          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <p className="font-semibold text-on-surface text-xs mb-1">{faq.q}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassModal>
    </>
  );
}
