import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, FileText, HeartPulse, ScrollText, Lock, Stethoscope, Camera, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { GlassModal } from './GlassModal';

export type LegalDocType = 'privacy' | 'terms' | 'consent';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LegalDocType;
}

/* ------------------------------------------------------------------ */
/*  Legal text content — Spanish, physiotherapy-specific              */
/* ------------------------------------------------------------------ */

type TFn = (key: string) => string;

type LegalSection = {
  heading: string;
  body: string[];
};

interface LegalDoc {
  title: string;
  subtitle: string;
  lastUpdated: string;
  icon: typeof ShieldCheck;
  sections: LegalSection[];
}

const getPrivacyDoc = (t: TFn): LegalDoc => ({
  title: t('layout.privacyPolicy'),
  subtitle: t('lm.privacySubtitle'),
  lastUpdated: 'Julio 2025',
  icon: ShieldCheck,
  sections: [
    {
      heading: t('lm.privacy1Heading'),
      body: [
        t('lm.privacy1Body1'),
        t('lm.privacy1Body2'),
      ],
    },
    {
      heading: t('lm.privacy2Heading'),
      body: [
        t('lm.privacy2Body1'),
        t('lm.privacy2Body2'),
        t('lm.privacy2Body3'),
        t('lm.privacy2Body4'),
      ],
    },
    {
      heading: t('lm.privacy3Heading'),
      body: [
        t('lm.privacy3Body1'),
        t('lm.privacy3Body2'),
        t('lm.privacy3Body3'),
      ],
    },
    {
      heading: t('lm.privacy4Heading'),
      body: [
        t('lm.privacy4Body1'),
        t('lm.privacy4Body2'),
        t('lm.privacy4Body3'),
        t('lm.privacy4Body4'),
      ],
    },
    {
      heading: t('lm.privacy5Heading'),
      body: [
        t('lm.privacy5Body1'),
        t('lm.privacy5Body2'),
        t('lm.privacy5Body3'),
      ],
    },
    {
      heading: t('lm.privacy6Heading'),
      body: [
        t('lm.privacy6Body1'),
        t('lm.privacy6Body2'),
        t('lm.privacy6Body3'),
      ],
    },
    {
      heading: t('lm.privacy7Heading'),
      body: [
        t('lm.privacy7Body1'),
        t('lm.privacy7Body2'),
      ],
    },
    {
      heading: t('lm.privacy8Heading'),
      body: [
        t('lm.privacy8Body1'),
        t('lm.privacy8Body2'),
        t('lm.privacy8Body3'),
        t('lm.privacy8Body4'),
        t('lm.privacy8Body5'),
        t('lm.privacy8Body6'),
      ],
    },
    {
      heading: t('lm.privacy9Heading'),
      body: [
        t('lm.privacy9Body1'),
        t('lm.privacy9Body2'),
      ],
    },
    {
      heading: t('lm.privacy10Heading'),
      body: [
        t('lm.privacy10Body1'),
        t('lm.privacy10Body2'),
      ],
    },
  ],
});

const getTermsDoc = (t: TFn): LegalDoc => ({
  title: t('layout.termsOfService'),
  subtitle: t('lm.termsSubtitle'),
  lastUpdated: 'Julio 2025',
  icon: FileText,
  sections: [
    {
      heading: t('lm.terms1Heading'),
      body: [
        t('lm.terms1Body1'),
        t('lm.terms1Body2'),
      ],
    },
    {
      heading: t('lm.terms2Heading'),
      body: [
        t('lm.terms2Body1'),
        t('lm.terms2Body2'),
      ],
    },
    {
      heading: t('lm.terms3Heading'),
      body: [
        t('lm.terms3Body1'),
        t('lm.terms3Body2'),
        t('lm.terms3Body3'),
      ],
    },
    {
      heading: t('lm.terms4Heading'),
      body: [
        t('lm.terms4Body1'),
        t('lm.terms4Body2'),
        t('lm.terms4Body3'),
      ],
    },
    {
      heading: t('lm.terms5Heading'),
      body: [
        t('lm.terms5Body1'),
        t('lm.terms5Body2'),
        t('lm.terms5Body3'),
      ],
    },
    {
      heading: t('lm.terms6Heading'),
      body: [
        t('lm.terms6Body1'),
        t('lm.terms6Body2'),
        t('lm.terms6Body3'),
      ],
    },
    {
      heading: t('lm.terms7Heading'),
      body: [
        t('lm.terms7Body1'),
        t('lm.terms7Body2'),
        t('lm.terms7Body3'),
      ],
    },
    {
      heading: t('lm.terms8Heading'),
      body: [
        t('lm.terms8Body1'),
        t('lm.terms8Body2'),
      ],
    },
    {
      heading: t('lm.terms9Heading'),
      body: [
        t('lm.terms9Body1'),
        t('lm.terms9Body2'),
        t('lm.terms9Body3'),
      ],
    },
    {
      heading: t('lm.terms10Heading'),
      body: [
        t('lm.terms10Body1'),
        t('lm.terms10Body2'),
      ],
    },
    {
      heading: t('lm.terms11Heading'),
      body: [
        t('lm.terms11Body1'),
        t('lm.terms11Body2'),
      ],
    },
  ],
});

const getConsentDoc = (t: TFn): LegalDoc => ({
  title: t('layout.informedConsent'),
  subtitle: t('lm.consentSubtitle'),
  lastUpdated: 'Julio 2025',
  icon: HeartPulse,
  sections: [
    {
      heading: t('lm.consent1Heading'),
      body: [
        t('lm.consent1Body1'),
        t('lm.consent1Body2'),
      ],
    },
    {
      heading: t('lm.consent2Heading'),
      body: [
        t('lm.consent2Body1'),
        t('lm.consent2Body2'),
        t('lm.consent2Body3'),
      ],
    },
    {
      heading: t('lm.consent3Heading'),
      body: [
        t('lm.consent3Body1'),
        t('lm.consent3Body2'),
        t('lm.consent3Body3'),
        t('lm.consent3Body4'),
      ],
    },
    {
      heading: t('lm.consent4Heading'),
      body: [
        t('lm.consent4Body1'),
        t('lm.consent4Body2'),
        t('lm.consent4Body3'),
        t('lm.consent4Body4'),
      ],
    },
    {
      heading: t('lm.consent5Heading'),
      body: [
        t('lm.consent5Body1'),
        t('lm.consent5Body2'),
      ],
    },
    {
      heading: t('lm.consent6Heading'),
      body: [
        t('lm.consent6Body1'),
        t('lm.consent6Body2'),
      ],
    },
  ],
});

const DOCS: Record<LegalDocType, (t: TFn) => LegalDoc> = {
  privacy: getPrivacyDoc,
  terms: getTermsDoc,
  consent: getConsentDoc,
};

/* ------------------------------------------------------------------ */
/*  Visual helpers                                                     */
/* ------------------------------------------------------------------ */

function DocHeader({ doc }: { doc: LegalDoc }) {
  const { t } = useTranslation();
  const Icon = doc.icon;
  return (
    <div className="flex flex-col items-center text-center mb-6 pb-6 border-b divider-teal">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        className="w-16 h-16 rounded-2xl bg-primary-container/40 flex items-center justify-center mb-4 ring-1 ring-primary/20 glow-teal breathe-teal"
      >
        <Icon size={32} className="text-primary animate-breathe-icon" />
      </motion.div>
      <h2 className="fm-title text-on-surface font-bold">
        {doc.title}
      </h2>
      <p className="text-sm text-on-surface-variant mt-1">{doc.subtitle}</p>
      <div className="flex items-center gap-2 mt-3 text-xs text-outline">
        <ScrollText size={14} />
        <span>{t('lm.lastUpdated')}: {doc.lastUpdated}</span>
      </div>
    </div>
  );
}

/* Small icon legend shown at the top of consent doc */
function ConsentLegend() {
  const { t } = useTranslation();
  const items = [
    { icon: Brain, label: t('shw.artificialIntelligence') },
    { icon: Lock, label: t('lm.healthData') },
    { icon: Camera, label: t('lm.cameraAr') },
    { icon: Stethoscope, label: t('lm.therapeuticScope') },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 mb-6">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low/60 border divider-teal"
        >
          <it.icon size={16} className="text-primary shrink-0" />
          <span className="text-xs font-medium text-on-surface-variant">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const { t } = useTranslation();
  const doc = DOCS[type](t);
  const showConsentLegend = type === 'consent';

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} size="lg" dismissable>
      <div className="pr-2">
        <DocHeader doc={doc} />
        {showConsentLegend && <ConsentLegend />}

        <div className="space-y-6">
          {doc.sections.map((section, sIdx) => (
            <motion.section
              key={sIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.05, duration: 0.3 }}
            >
              <h3 className="fm-section-title font-bold mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                {section.heading}
              </h3>
              <div className="space-y-2 pl-1">
                {section.body.map((para, pIdx) => (
                  <p key={pIdx} className="text-sm text-on-surface-variant leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-6 pt-4 border-t divider-teal flex items-start gap-2">
          <XCircle size={16} className="text-outline shrink-0 mt-0.5" />
          <p className="text-xs text-outline leading-relaxed">
            {t('lm.footerNote')}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl bg-primary text-on-primary font-bold hover:scale-[0.98] active:scale-95 transition-all glow-teal breathe-teal"
        >
          {t('common.close')}
        </button>
      </div>
    </GlassModal>
  );
}
