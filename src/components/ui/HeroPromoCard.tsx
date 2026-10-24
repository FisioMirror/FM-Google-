import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface PromoCardProps {
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  tag?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function PromoCardDemo({
  imageSrc = '/physi.png',
  imageAlt,
  title,
  description,
  tag,
  ctaText,
  onCtaClick,
  className = '',
}: PromoCardProps) {
  const { t } = useTranslation();
  const finalImageAlt = imageAlt ?? t('hpc.fisioMirrorAiBanner');
  const finalTitle = title ?? t('hpc.newAiModule');
  const finalDescription = description ?? t('hpc.description');
  const finalTag = tag ?? t('hpc.systemUpdate');
  const finalCtaText = ctaText ?? t('hpc.exploreModule');
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'relative flex flex-col sm:flex-row h-auto min-h-[152px] p-4.5 rounded-3xl bg-white dark:bg-[#0e141d] border border-outline-variant/60 dark:border-outline-variant/40 shadow-sm group overflow-hidden transition-all duration-300 hover:shadow-elevated',
        className
      )}
    >
      {/* Background ambient light */}
      <div className="absolute top-0 right-1/4 w-36 h-36 bg-teal-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

      {/* Media Box */}
      <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[130px] bg-gradient-to-tr from-teal-900 to-slate-900 flex items-center justify-center border border-teal-500/20">
        <img
          alt={finalImageAlt}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          src={imageSrc}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/logo.png';
          }}
        />
        <div className="absolute top-2 left-2 p-1 rounded-lg bg-teal-500/30 backdrop-blur-md text-white">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 pt-3 sm:pt-0 sm:pl-4 justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm sm:text-base font-extrabold text-on-surface tracking-tight">
              {finalTitle}
            </h4>
            <button
              onClick={() => setVisible(false)}
              aria-label={t('hpc.closeBanner')}
              className="p-1 rounded-xl text-on-surface-variant hover:text-on-surface-variant dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {finalDescription}
          </p>
        </div>

        <div className="mt-2 flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
            {finalTag}
          </span>
          <Button size="sm" variant="glow" glowEffect onClick={onCtaClick} icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
            {finalCtaText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PromoCardDemo;
