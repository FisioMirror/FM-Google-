import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Check, ExternalLink } from 'lucide-react';
import { generateGoogleCalendarUrl } from '../../lib/calendarExport';
import { cn } from '../../lib/utils';

interface ExportCalendarButtonProps {
  title?: string;
  description?: string;
  startDate?: Date;
  durationMinutes?: number;
  location?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function ExportCalendarButton({
  title,
  description,
  startDate,
  durationMinutes = 30,
  location,
  className,
  variant = 'secondary',
  size = 'md',
}: ExportCalendarButtonProps) {
  const [exported, setExported] = useState(false);
  const { t } = useTranslation();
  const eventTitle = title ?? t('uix.ecbEventTitle');
  const eventDesc = description ?? t('uix.ecbEventDesc');
  const eventLocation = location ?? t('uix.ecbLocation');

  const handleExport = () => {
    const sessionDate = startDate || new Date(Date.now() + 1000 * 60 * 60 * 24); // Mañana por defecto si no se pasa
    const url = generateGoogleCalendarUrl({
      title: eventTitle,
      description: eventDesc,
      startDate: sessionDate,
      durationMinutes,
      location: eventLocation,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
    setExported(true);
    setTimeout(() => setExported(false), 3500);
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-3.5 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-base gap-2.5 rounded-2xl',
  };

  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-primary-dark shadow-sm hover:shadow active:scale-95',
    secondary: 'bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 border border-primary/20',
    outline: 'border border-outline/30 text-on-surface hover:bg-surface-container-high active:scale-95',
    ghost: 'text-on-surface-variant hover:text-primary hover:bg-primary/10 active:scale-95',
  };

  return (
    <button
      onClick={handleExport}
      type="button"
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title={t('uix.ecbTitle')}
    >
      {exported ? (
        <>
          <Check className="size-4 text-emerald-500" />
          <span>{t('uix.ecbScheduled')}</span>
        </>
      ) : (
        <>
          <Calendar className="size-4" />
          <span>Google Calendar</span>
          <ExternalLink className="size-3 opacity-60 ml-0.5" />
        </>
      )}
    </button>
  );
}

export default ExportCalendarButton;
