import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Flame,
  ArrowRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel } from '../ui/Glass';
import MascotAnimation from '../ui/MascotAnimation';
import { speakHumanVoice, stopHumanVoice, isHumanVoiceSpeaking } from '../../lib/humanVoice';

export function PatientRecoveryHub() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const overallRecovery = 78;

  const handleTogglePhysiVoice = () => {
    if (isPlayingAudio || isHumanVoiceSpeaking()) {
      stopHumanVoice();
      setIsPlayingAudio(false);
      return;
    }

    const message =
      t('prh.physiMessage', { recovery: overallRecovery });

    setIsPlayingAudio(true);
    speakHumanVoice(message, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Recovery Meter Hero Card */}
      <GlassPanel className="p-6 sm:p-10 rounded-3xl border-l-4 border-l-teal-500 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-teal-400/20 to-info/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          {/* Left: Empathetic text and score */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-xs font-bold">
              <Sparkles className="size-3.5" />
              <span>{t('prh.journeyBadge')}</span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
              {t('stats.patientRecoveryMeter')}
            </h3>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('prh.movementP1')}{' '}
              <strong className="text-teal-700 dark:text-teal-300 font-bold">{overallRecovery}%</strong> {t('prh.movementP2')}
            </p>

            {/* Micro badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-teal-500/5 dark:bg-teal-900/20 border border-teal-500/20 text-xs font-semibold text-teal-800 dark:text-teal-200">
                <CheckCircle2 className="size-4 text-teal-600" />
                <span>{t('prh.continuousProgress')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-warning/5 dark:bg-warning/20 border border-warning/20 text-xs font-semibold text-warning dark:text-warning">
                <Flame className="size-4 text-warning" />
                <span>{t('prh.consecutiveDays')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-info/5 dark:bg-info/20 border border-info/20 text-xs font-semibold text-info dark:text-info">
                <Heart className="size-4 text-info" />
                <span>{t('prh.discomfortDecreasing')}</span>
              </div>
            </div>
          </div>

          {/* Right: Circular Gauge */}
          <div className="flex flex-col items-center justify-center relative shrink-0">
            <div className="relative size-44 sm:size-48 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-surface-container-highest"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Animated fill circle */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#meterGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * overallRecovery) / 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeDasharray="314"
                />
                <defs>
                  <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                  {overallRecovery}%
                </span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {t('prh.recovered')}
                </span>
              </div>
            </div>

            <p className="text-xs font-bold text-on-surface mt-2">
              {t('prh.oneStepAway')}
            </p>
          </div>
        </div>
      </GlassPanel>

      {/* Warm Physi Companion Card */}
      <GlassPanel className="p-6 sm:p-8 rounded-3xl border border-outline/15 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="shrink-0">
              <MascotAnimation type={isPlayingAudio ? 'speaking' : 'greeting'} size="md" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-2xs font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  {t('prh.physiTip')}
                </span>
                <span className="text-xs font-semibold text-on-surface">{t('prh.calibratedVoice')}</span>
              </div>
              <h4 className="text-base font-bold text-on-surface">
                {t('prh.consistencyQuote')}
              </h4>
              <p className="text-xs text-on-surface-variant max-w-xl leading-relaxed">
                {t('prh.physiAdvice')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleTogglePhysiVoice}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                isPlayingAudio
                  ? 'bg-warning hover:bg-warning text-white'
                  : 'bg-primary hover:bg-primary/90 text-on-primary'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="size-4" />
                  <span>{t('prh.stopVoice')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="size-4" />
                  <span>{t('prh.listenToPhysi')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/ai-assistant')}
              className="px-4 py-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors flex items-center gap-1.5 border border-outline/15"
            >
              <span>{t('prh.askPhysi')}</span>
              <ArrowRight className="size-3.5 text-teal-600" />
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
