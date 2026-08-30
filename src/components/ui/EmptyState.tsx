import { motion } from 'framer-motion';
import { Icon } from './Icon';

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
    color: 'text-primary',
  },
  exercises: {
    icon: 'self_improvement',
    title: 'Sin ejercicios asignados',
    message: 'Aún no hay ejercicios registrados. ¡Es un buen momento para empezar tu recuperación!',
    color: 'text-tertiary',
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
    message: 'Cuando completes tu primera sesión, aparecerá aquí tu historial de progreso.',
    color: 'text-primary',
  },
  tokens: {
    icon: 'vpn_key',
    title: 'No has generado tokens',
    message: 'Genera tu primer token de activación para vincular un paciente a tu clínica.',
    color: 'text-tertiary',
  },
  achievements: {
    icon: 'emoji_events',
    title: 'Aún no has desbloqueado logros',
    message: 'Completa tus primeras sesiones y mantén la constancia para empezar a ganar insignias. ¡Cada paso te acerca a un nuevo logro!',
    color: 'text-primary',
  },
  generic: {
    icon: 'inbox',
    title: 'Sin resultados',
    message: 'No se encontraron elementos para mostrar.',
    color: 'text-on-surface-variant',
  },
};

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center gap-4 ${className}`}
    >
      <div className="empty-state-premium">
        <div className="empty-icon animate-breathe-icon">
          <Icon name={finalIcon} size={36} className={finalColor} />
        </div>
      </div>
      <h3 className="font-title-md text-title-md text-on-surface">{finalTitle}</h3>
      <p className="text-on-surface-variant text-sm max-w-md leading-relaxed">{finalMessage}</p>
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="premium-btn mt-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 breathe-teal"
        >
          {actionLabel}
          <Icon name="arrow_forward" size={18} />
        </motion.button>
      )}
    </motion.div>
  );
}
