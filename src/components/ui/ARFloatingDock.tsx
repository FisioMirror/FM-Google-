import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Camera,
  Volume2,
  VolumeX,
  RotateCcw,
  Target,
  Maximize2,
  Sparkles,
  Sliders,
} from 'lucide-react';

export interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
  badge?: string | number;
}

export interface ARFloatingDockProps {
  items?: DockItem[];
  className?: string;
  onCalibrate?: () => void;
  onToggleAudio?: (muted: boolean) => void;
  onSelectJoint?: (joint: string) => void;
  currentJoint?: string;
}

export const ARFloatingDock: React.FC<ARFloatingDockProps> = ({
  className,
  onCalibrate,
  onToggleAudio,
  onSelectJoint,
  currentJoint = 'Rodilla',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [activeJoint, setActiveJoint] = useState(currentJoint);

  const defaultItems: DockItem[] = [
    {
      id: 'calibrate',
      label: 'Calibrar Cámara',
      icon: <Camera className="w-5 h-5" />,
      onClick: () => {
        onCalibrate?.();
      },
    },
    {
      id: 'target',
      label: `Articulación: ${activeJoint}`,
      icon: <Target className="w-5 h-5 text-teal-400" />,
      isActive: true,
      onClick: () => {
        const next = activeJoint === 'Rodilla' ? 'Hombro' : activeJoint === 'Hombro' ? 'Cadera' : 'Rodilla';
        setActiveJoint(next);
        onSelectJoint?.(next);
      },
      badge: activeJoint,
    },
    {
      id: 'audio',
      label: audioMuted ? 'Activar Voz IA' : 'Silenciar Voz IA',
      icon: audioMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />,
      onClick: () => {
        const next = !audioMuted;
        setAudioMuted(next);
        onToggleAudio?.(next);
      },
    },
    {
      id: 'reset',
      label: 'Reiniciar Repeticiones',
      icon: <RotateCcw className="w-5 h-5" />,
      onClick: () => {},
    },
    {
      id: 'biofeedback',
      label: 'Filtro Biomecánico',
      icon: <Sparkles className="w-5 h-5 text-lime-400" />,
      onClick: () => {},
    },
    {
      id: 'settings',
      label: 'Sensibilidad MediaPipe',
      icon: <Sliders className="w-5 h-5" />,
      onClick: () => {},
    },
  ];

  return (
    <nav
      aria-label="Controles rápidos de realidad aumentada"
      className={cn(
        'relative inline-flex items-center gap-2 p-2 rounded-2xl',
        'bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-2xl',
        'border border-white/15 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)]',
        'select-none',
        className
      )}
    >
      {defaultItems.map((item, idx) => {
        const isHovered = hoveredIndex === idx;

        return (
          <div key={item.id} className="relative flex flex-col items-center">
            {/* Tooltip flotante */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: -36, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute pointer-events-none z-50 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/20 text-white text-xs font-medium whitespace-nowrap shadow-xl"
                >
                  {item.label}
                  <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-b border-r border-white/20" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon Button */}
            <motion.button
              type="button"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={item.onClick}
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-200',
                item.isActive
                  ? 'bg-primary/25 text-primary border border-primary/40'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 border border-transparent hover:border-white/10'
              )}
              aria-label={item.label}
            >
              {item.icon}

              {/* Indicador de activo */}
              {item.isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-slate-900" />
              )}
            </motion.button>
          </div>
        );
      })}
    </nav>
  );
};
