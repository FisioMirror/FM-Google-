import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trophy, Award, Sparkles, Check, Lock } from 'lucide-react';

export interface GamifiedBadgeCardProps {
  title: string;
  category: string;
  description: string;
  level?: number;
  xpPoints?: number;
  unlocked?: boolean;
  unlockedDate?: string;
  iconName?: 'trophy' | 'award' | 'sparkles';
  className?: string;
  onClaimReward?: () => void;
}

export const GamifiedBadgeCard: React.FC<GamifiedBadgeCardProps> = ({
  title,
  category,
  description,
  level = 3,
  xpPoints = 250,
  unlocked = true,
  unlockedDate = 'Hoy',
  iconName = 'trophy',
  className,
  onClaimReward,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [claimed, setClaimed] = useState(false);

  // 3D Tilt calculation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const renderIcon = () => {
    switch (iconName) {
      case 'award':
        return <Award className="w-8 h-8 text-warning" />;
      case 'sparkles':
        return <Sparkles className="w-8 h-8 text-[#c1ff72]" />;
      default:
        return <Trophy className="w-8 h-8 text-teal-400" />;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: unlocked ? rotateX : 0,
        rotateY: unlocked ? rotateY : 0,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative flex flex-col p-6 rounded-3xl transition-all duration-300 cursor-pointer select-none',
        'bg-surface/85 dark:bg-surface-container/65 backdrop-blur-xl',
        'border border-outline-variant/30 dark:border-outline-variant/40 shadow-card',
        unlocked
          ? 'hover:shadow-[0_16px_40px_rgba(0,80,77,0.2)] hover:border-primary/50'
          : 'opacity-65 filter grayscale-[40%]',
        className
      )}
    >
      {/* Holographic light sheen */}
      {unlocked && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/5 to-teal-500/10 pointer-events-none" />
      )}

      {/* Top Tag and XP */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-teal-400 bg-primary/10 dark:bg-teal-400/10 px-2.5 py-1 rounded-full border border-primary/20">
          {category}
        </span>
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-warning dark:text-warning">
          <span>+{xpPoints} XP</span>
        </div>
      </div>

      {/* Centered Hologram Emblem */}
      <div className="flex flex-col items-center justify-center my-3 py-2">
        <div
          className={cn(
            'relative flex items-center justify-center w-20 h-20 rounded-2xl p-4 border transition-transform duration-300',
            unlocked
              ? 'bg-gradient-to-br from-teal-500/20 via-info/20 to-emerald-500/20 border-teal-500/30 shadow-[0_0_25px_rgba(13,148,136,0.25)]'
              : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
          )}
        >
          {unlocked ? renderIcon() : <Lock className="w-8 h-8 text-on-surface-variant" />}

          {/* Level Badge */}
          {unlocked && (
            <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-2xs font-black uppercase bg-primary text-on-primary shadow-sm">
              Nivel {level}
            </span>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="text-center mt-2">
        <h4 className="text-base font-bold text-on-surface dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Action / Status Footer */}
      <div className="mt-5 pt-3 border-t border-outline-variant/15 dark:border-white/5 flex items-center justify-between">
        <span className="text-xs text-on-surface-variant">
          {unlocked ? `Desbloqueado: ${unlockedDate}` : 'Bloqueado'}
        </span>

        {unlocked && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setClaimed(true);
              onClaimReward?.();
            }}
            disabled={claimed}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200',
              claimed
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm active:scale-95'
            )}
          >
            {claimed ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Reclamado
              </>
            ) : (
              'Reclamar'
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};
