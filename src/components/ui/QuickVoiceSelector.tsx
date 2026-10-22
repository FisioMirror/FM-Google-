import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Key,
  Check,
  ChevronDown,
  User,
  Zap,
  Radio,
  Sliders,
  X,
} from 'lucide-react';
import {
  humanVoice,
  getVoiceGender,
  setVoiceGender,
  getVoiceProvider,
  setVoiceProvider,
  getVoiceSpeed,
  setVoiceSpeed,
  getFishAudioKey,
  setFishAudioKey,
  type VoiceGender,
  type VoiceProvider,
} from '@/lib/humanVoice';

interface QuickVoiceSelectorProps {
  compact?: boolean;
  className?: string;
  onVoiceChange?: (gender: VoiceGender, provider: VoiceProvider) => void;
}

export function QuickVoiceSelector({
  compact = false,
  className = '',
  onVoiceChange,
}: QuickVoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [gender, setGenderState] = useState<VoiceGender>('male');
  const [provider, setProviderState] = useState<VoiceProvider>('auto');
  const [speed, setSpeedState] = useState<number>(1.0);
  const [fishKey, setFishKeyState] = useState<string>('');
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    setGenderState(getVoiceGender());
    setProviderState(getVoiceProvider());
    setSpeedState(getVoiceSpeed());
    const storedKey = getFishAudioKey();
    setFishKeyState(storedKey);
    if (storedKey) setShowKeyInput(true);
  }, [isOpen]);

  const handleGenderSelect = (newGender: VoiceGender) => {
    setGenderState(newGender);
    setVoiceGender(newGender);
    onVoiceChange?.(newGender, provider);
  };

  const handleProviderSelect = (newProvider: VoiceProvider) => {
    setProviderState(newProvider);
    setVoiceProvider(newProvider);
    if (newProvider === 'fish_audio') {
      setShowKeyInput(true);
    }
    onVoiceChange?.(gender, newProvider);
  };

  const handleSpeedSelect = (newSpeed: number) => {
    setSpeedState(newSpeed);
    setVoiceSpeed(newSpeed);
  };

  const handleKeySave = (key: string) => {
    setFishKeyState(key);
    setFishAudioKey(key);
  };

  const toggleTestAudio = () => {
    if (isPlayingTest) {
      humanVoice.stop();
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);
    const sample =
      gender === 'male'
        ? t('qvs.maleSample')
        : t('qvs.femaleSample');

    humanVoice.speak(sample, {
      gender,
      provider,
      rate: speed,
      onEnd: () => setIsPlayingTest(false),
      onError: () => setIsPlayingTest(false),
    });
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 rounded-2xl border transition-all duration-300 cursor-pointer shadow-xs ${
          compact
            ? 'px-2.5 py-1 text-xs bg-surface/80 dark:bg-surface-container/70 border-outline-variant/30 hover:border-teal-500/50 hover:bg-teal-500/10 text-on-surface'
            : 'px-3 py-1.5 text-xs bg-surface/90 dark:bg-surface-container/80 border-teal-500/30 hover:border-teal-500/60 hover:bg-teal-500/10 text-on-surface'
        }`}
        title={t('qvs.triggerTitle')}
      >
        <div className="size-5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
          <Volume2 className="size-3.5 group-hover:scale-110 transition-transform" />
        </div>

        <div className="flex items-center gap-1.5 text-left">
          <span className="font-semibold text-on-surface">
            {gender === 'male' ? t('qvs.drMale') : t('qvs.drFemale')}
          </span>
          <span className="hidden sm:inline-block text-2xs px-1.5 py-0.5 rounded-full font-mono bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
            {provider === 'auto'
              ? t('qvs.neuralVoice')
              : provider === 'fish_audio'
              ? 'Fish Audio'
              : provider === 'neural'
              ? 'Neural'
              : t('qvs.localSynthesis')}
          </span>
        </div>

        <ChevronDown className={`size-3 text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu / Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for click outside */}
            <div
              className="fixed inset-0 z-[140]"
              onClick={() => {
                setIsOpen(false);
                if (isPlayingTest) {
                  humanVoice.stop();
                  setIsPlayingTest(false);
                }
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-3xl bg-surface/95 dark:bg-surface-container/95 backdrop-blur-2xl border border-teal-500/30 dark:border-white/10 shadow-elevated p-4 sm:p-5 z-[150] text-on-surface"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">{t('qvs.title')}</h3>
                    <p className="text-xs text-on-surface-variant">{t('qvs.subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high cursor-pointer transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* 1. Perfil / Tono de Voz */}
              <div className="mt-3.5 space-y-2">
                <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <User className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{t('qvs.profileTone')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenderSelect('male')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      gender === 'male'
                        ? 'bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-100 shadow-xs ring-1 ring-teal-500/30'
                        : 'bg-surface-container/50 border-outline-variant/20 hover:border-teal-500/30 text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Dr. Physi</span>
                      {gender === 'male' && <Check className="size-3.5 text-teal-600 dark:text-teal-400" />}
                    </div>
                    <p className="text-2xs text-on-surface-variant leading-tight">
                      {t('qvs.maleDesc')}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenderSelect('female')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      gender === 'female'
                        ? 'bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-100 shadow-xs ring-1 ring-teal-500/30'
                        : 'bg-surface-container/50 border-outline-variant/20 hover:border-teal-500/30 text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Dra. Physi</span>
                      {gender === 'female' && <Check className="size-3.5 text-teal-600 dark:text-teal-400" />}
                    </div>
                    <p className="text-2xs text-on-surface-variant leading-tight">
                      {t('qvs.femaleDesc')}
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. Motor de Síntesis */}
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <Zap className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{t('qvs.engineProvider')}</span>
                </label>
                <div className="space-y-1.5">
                  {/* Auto Neural Free */}
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('auto')}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      provider === 'auto' || provider === 'neural'
                        ? 'bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-100 shadow-xs'
                        : 'bg-surface-container/50 border-outline-variant/20 hover:border-teal-500/30 text-on-surface'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{t('qvs.freeNeuralVoice')}</span>
                        <span className="text-2xs font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          {t('qvs.recommended')}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {t('qvs.neuralDesc')}
                      </p>
                    </div>
                    {(provider === 'auto' || provider === 'neural') && (
                      <Check className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {/* Fish Audio */}
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('fish_audio')}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      provider === 'fish_audio'
                        ? 'bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-100 shadow-xs'
                        : 'bg-surface-container/50 border-outline-variant/20 hover:border-teal-500/30 text-on-surface'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">Fish Audio S2.1 Pro</span>
                        <span className="text-2xs font-bold px-1.5 py-0.2 rounded-full bg-info/20 text-info dark:text-info">
                          {t('qvs.optionalKey')}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {t('qvs.fishDesc')}
                      </p>
                    </div>
                    {provider === 'fish_audio' && (
                      <Check className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {/* Offline */}
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('device')}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      provider === 'device'
                        ? 'bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-100 shadow-xs'
                        : 'bg-surface-container/50 border-outline-variant/20 hover:border-teal-500/30 text-on-surface'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{t('qvs.localSynthesis')}</span>
                        <span className="text-2xs font-bold px-1.5 py-0.2 rounded-full bg-warning/20 text-warning dark:text-warning">
                          {t('qvs.noInternet')}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {t('qvs.deviceDesc')}
                      </p>
                    </div>
                    {provider === 'device' && (
                      <Check className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                </div>

                {/* Custom Fish Audio Key Input */}
                {provider === 'fish_audio' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-2xl bg-surface-container/60 border border-teal-500/20 space-y-1.5"
                  >
                    <label className="text-xs font-semibold text-on-surface flex items-center gap-1">
                      <Key className="size-3 text-teal-600" />
                      <span>{t('qvs.nativeKeyLabel')}</span>
                    </label>
                    <input
                      type="password"
                      placeholder={t('qvs.keyPlaceholder')}
                      value={fishKey}
                      onChange={(e) => handleKeySave(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface border border-outline-variant/30 focus:border-teal-500 focus:outline-hidden text-on-surface"
                    />
                    <p className="text-2xs text-on-surface-variant">
                      {t('qvs.keyFallbackHint')}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* 3. Ritmo y Velocidad */}
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="size-3.5 text-teal-600 dark:text-teal-400" />
                    {t('qvs.articulationRate')}
                  </span>
                  <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                    {speed === 0.9 ? t('qvs.speedSlow') : speed === 1.1 ? t('qvs.speedFast') : t('qvs.speedNormal')}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: 0.9, label: t('qvs.speedTherapy') },
                    { val: 1.0, label: t('qvs.speedStandard') },
                    { val: 1.1, label: t('qvs.speedBrisk') },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => handleSpeedSelect(s.val)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                        speed === s.val
                          ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 font-bold'
                          : 'bg-surface-container/50 border-outline-variant/20 hover:bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Actions: Test audio & Done */}
              <div className="mt-5 pt-3 border-t border-outline-variant/20 dark:border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleTestAudio}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingTest
                      ? 'bg-danger text-white animate-pulse'
                      : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {isPlayingTest ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
                  <span>{isPlayingTest ? t('qvs.stopTest') : t('qvs.testVoice')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (isPlayingTest) {
                      humanVoice.stop();
                      setIsPlayingTest(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-on-primary transition-colors cursor-pointer"
                >
                  {t('qvs.apply')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
