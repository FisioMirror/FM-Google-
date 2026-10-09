import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * Toggle (Elevated with HeroUI & iOS fluid tactile physics)
 */
export function Toggle({ checked, onChange, label, description, icon, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center justify-between w-full gap-3 group text-left p-1 rounded-2xl transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none cursor-pointer'
      )}
    >
      {(label || description) && (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && (
            <div className="size-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            {label && (
              <p className="text-xs sm:text-sm font-bold text-on-surface truncate">{label}</p>
            )}
            {description && (
              <p className="text-[11px] sm:text-xs text-on-surface-variant line-clamp-1">{description}</p>
            )}
          </div>
        </div>
      )}
      <div
        className={cn(
          'relative shrink-0 w-12 h-7 rounded-full transition-colors duration-300 p-0.5',
          checked
            ? 'bg-teal-600 shadow-md shadow-teal-600/30 ring-2 ring-teal-500/20'
            : 'bg-surface-container-highest border border-outline/20'
        )}
      >
        <motion.div
          className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 350 }}
        >
          {checked ? (
            <Check className="size-3 text-teal-600 stroke-[3]" />
          ) : (
            <div className="size-1.5 rounded-full bg-outline/40" />
          )}
        </motion.div>
      </div>
    </button>
  );
}
