import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ClinicalSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  icon?: React.ReactNode;
  ticks?: number[];
  className?: string;
  helperText?: string;
}

/**
 * ClinicalSlider (Inspired by Shadcn UI & HeroUI)
 * High precision medical slider with tick markers, live angle/intensity readout,
 * and tactile spring thumb motion. Perfect for ROM angle calibration and pain score (EVA).
 */
export function ClinicalSlider({
  value,
  onChange,
  min = 0,
  max = 180,
  step = 1,
  label = 'Rango Articular (ROM)',
  unit = '°',
  icon,
  ticks = [0, 45, 90, 135, 180],
  className,
  helperText,
}: ClinicalSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('w-full space-y-3 select-none', className)}>
      {/* Header with Title and Big Readout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-teal-600 dark:text-teal-400">{icon}</span>}
          <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-1 rounded-xl bg-teal-500/10 px-3 py-1 border border-teal-500/20 text-teal-700 dark:text-teal-300">
          <span className="text-base font-black tabular-nums">{value}</span>
          <span className="text-xs font-semibold">{unit}</span>
        </div>
      </div>

      {/* Slider Track Container */}
      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />

        {/* Custom Track */}
        <div className="relative h-3 w-full rounded-full bg-surface-container-high overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-500 rounded-full"
            style={{ width: `${percentage}%` }}
            transition={{ ease: 'easeOut', duration: 0.1 }}
          />
        </div>

        {/* Custom Thumb */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${percentage}%` }}
        >
          <motion.div
            animate={{ scale: isDragging ? 1.25 : 1 }}
            className="size-6 rounded-full bg-white border-2 border-teal-600 shadow-lg shadow-teal-900/30 flex items-center justify-center ring-4 ring-teal-500/20"
          >
            <div className="size-2 rounded-full bg-teal-600" />
          </motion.div>
        </div>
      </div>

      {/* Tick Marks & Scale */}
      {ticks && ticks.length > 0 && (
        <div className="flex justify-between px-1 text-[10px] font-semibold text-outline">
          {ticks.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              className={cn(
                'hover:text-teal-600 transition-colors',
                value === t && 'text-teal-600 dark:text-teal-400 font-bold'
              )}
            >
              {t}{unit}
            </button>
          ))}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          {helperText}
        </p>
      )}
    </div>
  );
}
