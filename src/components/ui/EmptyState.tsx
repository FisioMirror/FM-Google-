import { motion } from 'framer-motion';
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
    title: 'Aún no tienes pacientes',
    message: 'Cada gran recuperación comienza con el primer vínculo terapéutico. Genera un token para invitar a tu primer paciente.',
    color: 'text-teal-600 dark:text-teal-400',
  },
  exercises: {
    icon: 'fitness_center',
    title: 'Sin ejercicios asignados',
    message: 'Aún no hay ejercicios registrados. ¡Es un buen momento para empezar tu recuperación!',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  notifications: {
    icon: 'notifications_none',
    title: 'Estás al día',
    message: 'No tienes notificaciones pendientes. ¡Vuelve pronto!',
    color: 'text-secondary',
  },
  sessions: {
    icon: 'event_busy',
    title: 'Sin sesiones registradas',
    message: 'Cuando completes tu primera sesión, aparecerá aquí tu historial de progreso biomecánico.',
    color: 'text-teal-600 dark:text-teal-400',
  },
  tokens: {
    icon: 'key',
    title: 'No has generado tokens',
    message: 'Genera tu primer token de activación para vincular un paciente a tu clínica.',
    color: 'text-amber-500',
  },
  achievements: {
    icon: 'emoji_events',
    title: 'Aún no has desbloqueado logros',
    message: 'Completa tus primeras sesiones y mantén la constancia para empezar a ganar insignias clínicas.',
    color: 'text-teal-500',
  },
  generic: {
    icon: 'inbox',
    title: 'Sin resultados',
    message: 'No se encontraron elementos para mostrar.',
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
  const finalIcon = icon || config.icon;
  const finalTitle = title || config.title;
  const finalMessage = description || message || config.message;
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
        <div className="size-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-lg shadow-teal-500/10">
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
          className="z-10 mt-2 inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/20 transition-all cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="size-3.5" />
        </motion.button>
      )}
    </motion.div>
  );
}
