import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Camera,
  Mic,
  Sliders,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';

export interface TherapistQuickToolbarProps {
  className?: string;
  onPauseToggle?: (isPaused: boolean) => void;
  onSnapshot?: () => void;
  onVoiceNote?: () => void;
  onAdjustTargetAngle?: () => void;
}

export const TherapistQuickToolbar: React.FC<TherapistQuickToolbarProps> = ({
  className,
  onPauseToggle,
  onSnapshot,
  onVoiceNote,
  onAdjustTargetAngle,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { t } = useTranslation();
  const [isPaused, setIsPaused] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const handlePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    onPauseToggle?.(next);
  };

  const handleVoice = () => {
    setIsRecordingVoice(!isRecordingVoice);
    onVoiceNote?.();
  };

  return (
    <aside
      aria-label={t('tqt.physioControlToolbar')}
      className={cn(
        'relative inline-flex items-center rounded-2xl border transition-all duration-300 backdrop-blur-2xl shadow-elevated',
        'bg-surface/90 dark:bg-slate-900/90 border-outline-variant/30 dark:border-white/10 p-1.5',
        className
      )}
    >
      {/* Toggle Expand Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 rounded-xl text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label={isExpanded ? t('tqt.collapseBar') : t('tqt.expandBar')}
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 pl-1 overflow-hidden"
          >
            {/* Play/Pause */}
            <button
              type="button"
              onClick={handlePause}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                isPaused
                  ? 'bg-warning/15 text-warning border border-warning/30'
                  : 'bg-primary/10 text-primary dark:text-teal-300 hover:bg-primary/20'
              )}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? t('arm.resume') : t('arm.pause')}</span>
            </button>

            {/* Instant Snapshot */}
            <button
              type="button"
              onClick={onSnapshot}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={t('tqt.freezeFrame')}
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Voice Notes */}
            <button
              type="button"
              onClick={handleVoice}
              className={cn(
                'p-2 rounded-xl transition-colors',
                isRecordingVoice
                  ? 'bg-danger/20 text-danger animate-pulse'
                  : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/10'
              )}
              title={t('tqt.dictateVoiceNote')}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Adjust Angle */}
            <button
              type="button"
              onClick={onAdjustTargetAngle}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={t('tqt.adjustLiveRomTarget')}
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* AI Assistant Prescription */}
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300 hover:bg-teal-500/20 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>{t('tqt.assessWithAi')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
