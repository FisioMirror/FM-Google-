import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SparklesCore } from './ui/Sparkles';
import { AuroraBackgroundCSS } from './ui/AuroraBackground';
import { fisioColors } from '../lib/ui-config';

export function SplashScreen() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background overflow-hidden pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Aurora Background - Magic UI inspired */}
      <AuroraBackgroundCSS 
        className="z-0" 
        opacity={0.2}
      />

      {/* Sparkles Effect - Custom implementation */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <SparklesCore
          id="splash-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={60}
          className="w-full h-full"
          particleColor={fisioColors.kinetic.DEFAULT}
        />
      </div>

      {/* Main content */}
      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="relative flex flex-col items-center">
          {/* Logo as loader centerpiece — enhanced with glow */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                `0 0 20px ${fisioColors.primary[700]}40`,
                `0 0 40px ${fisioColors.primary[700]}60`,
                `0 0 20px ${fisioColors.primary[700]}40`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-card rounded-full w-40 h-40 md:w-52 md:h-52 flex items-center justify-center shadow-ambient-teal breathe-teal overflow-hidden"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${fisioColors.glass.light} 0%, ${fisioColors.glass.DEFAULT} 100%)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <img src="/logo.png" alt="FisioMirror" className="w-28 h-28 md:w-36 md:h-36 object-contain" />
          </motion.div>

          {/* Branding - Enhanced with animated gradient */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="font-display font-headline-lg text-headline-lg md:text-display-lg tracking-tight mb-3">
              <span 
                className="gradient-text-editorial bg-clip-text text-transparent" 
                style={{
                  backgroundImage: fisioColors.gradients.aurora.mixed,
                }}
              >
                FisioMirror
              </span>
            </h1>
            
            {/* Animated loading dots with primary color */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{
                    scale: [0.4, 1.2, 0.4],
                    opacity: [0.3, 1, 0.3],
                    y: [0, -8, 0],
                  }}
                  transition={{ 
                    duration: 1.4, 
                    repeat: Infinity, 
                    delay: i * 0.15, 
                    ease: 'easeInOut' 
                  }}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: fisioColors.gradients.primary,
                    boxShadow: `0 0 10px ${fisioColors.primary[700]}60`,
                  }}
                />
              ))}
            </div>
            
            {/* Subtitle with fade in */}
            <motion.p
              className="mt-4 text-body-lg text-on-surface-variant/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Plataforma de Rehabilitación Inteligente
            </motion.p>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
