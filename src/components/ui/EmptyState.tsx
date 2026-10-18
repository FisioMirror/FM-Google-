import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  type?: 'patients' | 'exercises' | 'notifications' | 'sessions' | 'tokens' | 'achievements' | 'generic' | string;
  icon?: string;
  title?: string;
  message?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const CONFIG: Record<string, { icon: string; title: string; message: string; color: string }> = {
  patients: {
    icon: 'group',
    title: 'empty.noPatientsYet',
    message: 'empty.patientsMessage',
    color: 'text-teal-600 dark:text-teal-400',
  },
  exercises: {
    icon: 'fitness_center',
    title: 'empty.noExercisesAssigned',
    message: 'empty.exercisesMessage',
    color: 'text-info dark:text-info',
  },
  notifications: {
    icon: 'notifications_none',
    title: 'empty.allCaughtUp',
    message: 'empty.notificationsMessage',
    color: 'text-secondary',
  },
  sessions: {
    icon: 'event_busy',
    title: 'dashboard.noSessions',
    message: 'empty.sessionsMessage',
    color: 'text-teal-600 dark:text-teal-400',
  },
  tokens: {
    icon: 'key',
    title: 'empty.noTokens',
    message: 'empty.tokensMessage',
    color: 'text-warning',
  },
  achievements: {
    icon: 'emoji_events',
    title: 'empty.noAchievements',
    message: 'empty.achievementsMessage',
    color: 'text-teal-500',
  },
  generic: {
    icon: 'inbox',
    title: 'empty.noResults',
    message: 'empty.noItemsFound',
    color: 'text-on-surface-variant',
  },
};

/**
 * EmptyState (Elevated with Magic UI dot-grid & floating kinetics)
 */
export function EmptyState({
  type = 'generic',
  icon,
  title,
  message,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const config = (type && CONFIG[type]) ? CONFIG[type] : CONFIG.generic;
  const { t } = useTranslation();
  const finalIcon = icon || config.icon;
  const finalTitle = title || t(config.title);
  const finalMessage = description || message || t(config.message);
  const finalColor = config.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-outline/15 bg-surface/60 p-8 md:p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm backdrop-blur-sm',
        className
      )}
    >
      {/* Magic UI Subtle Dot Pattern Canvas in background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(#14b8a6 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      {/* Floating Animated Icon Container with Glow */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="size-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-card shadow-teal-500/10">
          <Icon name={finalIcon} size={32} className={finalColor} />
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-teal-500/10 blur-xl -z-10" />
      </motion.div>

      <div className="max-w-md space-y-1 z-10">
        <h3 className="text-base md:text-lg font-bold text-on-surface tracking-tight">
          {finalTitle}
        </h3>
        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
          {finalMessage}
        </p>
      </div>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="z-10 mt-2 inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="size-3.5" />
        </motion.button>
      )}
    </motion.div>
  );
}
