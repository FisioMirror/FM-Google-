import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SparkleProps {
  active: boolean;
  color: 'teal' | 'blue';
}

interface SparkItem {
  x: string;
  y: string;
  size: number;
  duration: number;
  delay: number;
  type?: 'star' | 'dot';
}

const sparks: SparkItem[] = [
  // ── Upper section (sky, lighting, header area) ──
  { x: '14%', y: '10%', size: 14, duration: 2.4, delay: 0.1, type: 'star' },
  { x: '32%', y: '8%', size: 18, duration: 2.7, delay: 0.8, type: 'star' },
  { x: '52%', y: '12%', size: 12, duration: 2.1, delay: 0.3, type: 'star' },
  { x: '72%', y: '9%', size: 16, duration: 2.5, delay: 1.1, type: 'star' },
  { x: '88%', y: '14%', size: 11, duration: 2.0, delay: 0.5, type: 'dot' },

  // ── Upper-middle section (around heads, shoulders, ambient room) ──
  { x: '8%', y: '26%', size: 13, duration: 2.2, delay: 0.6, type: 'star' },
  { x: '24%', y: '22%', size: 16, duration: 2.6, delay: 1.3, type: 'star' },
  { x: '42%', y: '28%', size: 10, duration: 1.9, delay: 0.2, type: 'dot' },
  { x: '64%', y: '20%', size: 18, duration: 2.8, delay: 0.9, type: 'star' },
  { x: '84%', y: '27%', size: 14, duration: 2.3, delay: 1.4, type: 'star' },

  // ── Center section (mid torso, interactive equipment, mirror area) ──
  { x: '16%', y: '44%', size: 15, duration: 2.5, delay: 0.7, type: 'star' },
  { x: '36%', y: '48%', size: 11, duration: 2.0, delay: 0.4, type: 'dot' },
  { x: '50%', y: '42%', size: 17, duration: 2.6, delay: 1.0, type: 'star' },
  { x: '68%', y: '46%', size: 13, duration: 2.2, delay: 0.15, type: 'star' },
  { x: '86%', y: '45%', size: 15, duration: 2.4, delay: 0.85, type: 'star' },

  // ── Lower-middle section (hands, rehabilitation bar, mat area) ──
  { x: '10%', y: '64%', size: 16, duration: 2.5, delay: 1.2, type: 'star' },
  { x: '28%', y: '62%', size: 12, duration: 2.1, delay: 0.5, type: 'star' },
  { x: '48%', y: '66%', size: 14, duration: 2.3, delay: 1.5, type: 'dot' },
  { x: '66%', y: '64%', size: 16, duration: 2.7, delay: 0.35, type: 'star' },
  { x: '82%', y: '60%', size: 12, duration: 2.0, delay: 1.05, type: 'star' },

  // ── Bottom section (feet, floor reflections, base area) ──
  { x: '18%', y: '80%', size: 15, duration: 2.4, delay: 0.9, type: 'star' },
  { x: '38%', y: '82%', size: 11, duration: 1.9, delay: 0.3, type: 'dot' },
  { x: '56%', y: '78%', size: 17, duration: 2.8, delay: 0.6, type: 'star' },
  { x: '78%', y: '82%', size: 14, duration: 2.2, delay: 1.25, type: 'star' },
];

export const SparkleEffect: React.FC<SparkleProps> = ({ active, color }) => {
  const glowColor =
    color === 'teal' ? 'rgba(16, 185, 129, 0.65)' : 'rgba(14, 165, 233, 0.65)';
  const sparkColor = color === 'teal' ? '#34D399' : '#38BDF8';
  const sparkGlowShadow =
    color === 'teal'
      ? 'drop-shadow(0 0 5px rgba(52, 211, 153, 0.8))'
      : 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.8))';

  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
          {sparks.map((s, i) => {
            if (s.type === 'dot') {
              return (
                <motion.span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: s.x,
                    top: s.y,
                    width: s.size,
                    height: s.size,
                    borderRadius: '9999px',
                    backgroundColor: sparkColor,
                    boxShadow: `0 0 8px 2px ${glowColor}`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.3, 0.8, 0],
                    opacity: [0, 0.9, 0.6, 0],
                  }}
                  transition={{
                    duration: s.duration,
                    repeat: Infinity,
                    delay: s.delay,
                    ease: 'easeInOut',
                  }}
                />
              );
            }

            return (
              <motion.svg
                key={i}
                viewBox="0 0 24 24"
                style={{
                  position: 'absolute',
                  left: s.x,
                  top: s.y,
                  width: s.size,
                  height: s.size,
                  fill: sparkColor,
                  filter: sparkGlowShadow,
                }}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.25, 0.9, 0],
                  opacity: [0, 1, 0.7, 0],
                  rotate: [0, 45, 90, 135],
                }}
                transition={{
                  duration: s.duration,
                  repeat: Infinity,
                  delay: s.delay,
                  ease: 'easeInOut',
                }}
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </motion.svg>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
};

