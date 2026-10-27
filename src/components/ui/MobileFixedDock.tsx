import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Sparkles, 
  Dumbbell, 
  Camera, 
  BarChart3, 
  User, 
  Plus,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { springSnappy, springBouncy } from '@/lib/motionVariants';

export interface MobileDockTab {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export interface MobileFixedDockProps {
  role?: 'fisioterapeuta' | 'paciente';
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
}

/**
 * MobileFixedDock:
 * Barra de navegación inferior fija pegada rígidamente al borde inferior en pantallas móviles.
 * Agrupa las acciones ergonómicas de pulgar, pastilla deslizante activa con resorte,
 * botón central prominente de acción AR / Clínica y acabado en glassmorphism refinado.
 */
export function MobileFixedDock({
  role = 'fisioterapeuta',
  onActionClick,
  actionLabel,
  className,
}: MobileFixedDockProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Rutas adaptadas según el rol del usuario
  const fisioTabs: MobileDockTab[] = [
    { id: 'home', label: 'Inicio', path: '/dashboard-fisio', icon: Home },
    { id: 'patients', label: 'Pacientes', path: '/patients', icon: Users },
    { id: 'exercises', label: 'Ejercicios', path: '/exercises', icon: Dumbbell },
    { id: 'reports', label: 'Estadísticas', path: '/stats', icon: BarChart3 },
    { id: 'ai', label: 'Physi IA', path: '/ai-assistant', icon: Sparkles },
  ];

  const patientTabs: MobileDockTab[] = [
    { id: 'home', label: 'Inicio', path: '/patient-dashboard', icon: Home },
    { id: 'exercises', label: 'Rutina', path: '/patient-exercises', icon: Dumbbell },
    { id: 'progress', label: 'Progreso', path: '/stats', icon: BarChart3 },
    { id: 'ai', label: 'Asistente', path: '/ai-assistant', icon: Sparkles },
    { id: 'profile', label: 'Mi Perfil', path: '/paciente-perfil', icon: User },
  ];

  const tabs = role === 'paciente' ? patientTabs : fisioTabs;

  // Centro de acción rápida (AR Mirror o Calibración)
  const defaultActionRoute = role === 'paciente' ? '/calibration' : '/ar-mirror';
  const defaultActionText = actionLabel || (role === 'paciente' ? 'Sesión AR' : 'Espejo AR');

  const handleHeroAction = () => {
    if (onActionClick) {
      onActionClick();
    } else {
      navigate(defaultActionRoute);
    }
  };

  const isCurrentActive = (path: string) => {
    if (path === '/dashboard-fisio' || path === '/patient-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      aria-label="Navegación móvil fija"
      className={cn(
        'dock-anchor lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.4)] select-none pb-safe',
        className
      )}
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around relative">
        {tabs.slice(0, 2).map((tab) => {
          const active = isCurrentActive(tab.path);
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className="relative flex-1 py-1 flex flex-col items-center justify-center gap-0.5 text-center group transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="active-mobile-dock-pill"
                  transition={springSnappy}
                  className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/20 rounded-2xl -z-10"
                />
              )}
              <div
                className={cn(
                  'size-6 flex items-center justify-center transition-transform group-active:scale-90',
                  active
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                <IconComponent className={cn('size-5', active && 'stroke-[2.5]')} />
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold tracking-tight leading-none',
                  active
                    ? 'text-teal-700 dark:text-teal-300 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Hero Central Action Button (Prominent AR Mirror Trigger) */}
        <div className="relative px-2 flex items-center justify-center">
          <motion.button
            type="button"
            onClick={handleHeroAction}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={springBouncy}
            aria-label={defaultActionText}
            className="size-12 -mt-5 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-sky-400 text-white shadow-lg shadow-teal-600/35 border-2 border-white dark:border-slate-900 flex flex-col items-center justify-center gap-0.5"
          >
            <Camera className="size-5" />
            <span className="text-[8px] font-black uppercase tracking-wider leading-none">
              AR
            </span>
          </motion.button>
        </div>

        {tabs.slice(2, 4).map((tab) => {
          const active = isCurrentActive(tab.path);
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className="relative flex-1 py-1 flex flex-col items-center justify-center gap-0.5 text-center group transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="active-mobile-dock-pill"
                  transition={springSnappy}
                  className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/20 rounded-2xl -z-10"
                />
              )}
              <div
                className={cn(
                  'size-6 flex items-center justify-center transition-transform group-active:scale-90',
                  active
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                <IconComponent className={cn('size-5', active && 'stroke-[2.5]')} />
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold tracking-tight leading-none',
                  active
                    ? 'text-teal-700 dark:text-teal-300 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
