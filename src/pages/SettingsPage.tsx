import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, FileText, Shield, Code2, Palette, Heart, BookOpen, Smartphone, MessageCircle, Phone, Globe } from 'lucide-react';
import { useTheme, FONT_SIZE_LEVELS } from '../context/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { changeAppLanguage } from '../i18n';
import { talkBack } from '../lib/talkback';
import { speakHumanVoice, stopHumanVoice, getVoiceMode, setVoiceMode, type VoiceMode } from '../lib/humanVoice';
import { GlassPanel } from '../components/ui/Glass';
import { Icon } from '../components/ui/Icon';
import { AnimatedTabs } from '../components/ui/AnimatedTabs';
import { useToast } from '../components/ui/Toast';
import { HelpSection } from '../components/ui/HelpSection';
import { IOSInstallModal } from '../components/ui/IOSInstallModal';
import { EmailSystemStatusCard } from '../components/ui/EmailSystemStatusCard';
import { cn } from '../lib/utils';
import { supabaseUrl } from '../lib/supabase';
import { setSpiritualModeEnabled, SPIRITUAL_SETTING_KEY } from '../lib/versiculosService';
import {
  ErgonomicHandModeSwitcher,
  SplitViewPerspectiveToggle,
} from '../components/ui/NavigationDocksSuite';

/* ── localStorage helpers ─────────────────────────────────────── */
function usePersistentBool(key: string, defaultValue: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return stored === 'true';
  });
  useEffect(() => {
    localStorage.setItem(key, String(value));
  }, [key, value]);
  return [value, setValue] as const;
}

/* ── Toggle component ─────────────────────────────────────────── */
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn('relative w-14 h-8 rounded-full transition-colors duration-300', value ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600')}
      aria-label={label}
      aria-checked={value}
      role="switch"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn('absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm', value ? 'left-7' : 'left-1')}
      />
    </button>
  );
}

/* ── Confirmation modal ───────────────────────────────────────── */
export function SettingsPage() {
  const { theme, toggleTheme, resetDefaults, handedness, toggleHandedness } = useTheme();
  const { user, signOut } = useAuthStore();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<string>(() => i18n.language || (typeof window !== 'undefined' ? localStorage.getItem('fisio_language') : 'es') || 'es');

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: string }>;
      if (customEvent.detail?.lang) {
        setCurrentLang(customEvent.detail.lang);
      }
    };
    window.addEventListener('fisio_language_changed', handleLangChange);
    return () => window.removeEventListener('fisio_language_changed', handleLangChange);
  }, []);

  /* ── Persistent settings ────────────────────────────────────── */
  const [reduceMotion, setReduceMotion] = usePersistentBool('fisio-reduce-motion', false);
  const [highContrast, setHighContrast] = usePersistentBool('fisio-high-contrast', false);
  const [talkback, setTalkback] = usePersistentBool('fisio-talkback', false);
  const [easyReading, setEasyReading] = usePersistentBool('fisio-easy-reading', false);
  const [largeTouch, setLargeTouch] = usePersistentBool('fisio-large-touch', false);
  const [glassmorphism, setGlassmorphism] = usePersistentBool('fisio-glassmorphism', true);
  const [spiritualMode, setSpiritualMode] = usePersistentBool(SPIRITUAL_SETTING_KEY, true);
  const [notifEmail, setNotifEmail] = usePersistentBool('fisio-notif-email', true);
  const [notifPush, setNotifPush] = usePersistentBool('fisio-notif-push', true);
  const [notifSound, setNotifSound] = usePersistentBool('fisio-notif-sound', true);
  const [voiceMode, setLocalVoiceMode] = useState<VoiceMode>(() => getVoiceMode());
  const [testingVoice, setTestingVoice] = useState(false);

  const handleVoiceModeChange = (mode: VoiceMode) => {
    setLocalVoiceMode(mode);
    setVoiceMode(mode);
    toast.success(
      mode === 'humanized' ? t('set.voiceHumaTitle') : t('set.voiceDevTitle'),
      {
        description: mode === 'humanized' ? t('set.voiceHumaMsg') : t('set.voiceDevMsg'),
      }
    );
  };

  const handleTestVoice = () => {
    if (testingVoice) {
      stopHumanVoice();
      setTestingVoice(false);
      return;
    }
    setTestingVoice(true);
    speakHumanVoice(t('set.testVoiceHello'), {
      onEnd: () => setTestingVoice(false),
      onError: () => setTestingVoice(false),
    });
  };

  /* ── Confirmation modal state ───────────────────────────────── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showLicModal, setShowLicModal] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Apply classes to <html> ────────────────────────────────── */
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (reduceMotion) { cl.add('reduce-motion'); } else { cl.remove('reduce-motion'); }
  }, [reduceMotion]);

  useEffect(() => {
    const cl = document.documentElement.classList;
    if (highContrast) { cl.add('high-contrast'); } else { cl.remove('high-contrast'); }
  }, [highContrast]);

  useEffect(() => {
    const cl = document.documentElement.classList;
    if (glassmorphism) { cl.remove('no-glass'); } else { cl.add('no-glass'); }
  }, [glassmorphism]);

  useEffect(() => {
    const cl = document.documentElement.classList;
    if (talkback) {
      cl.add('talkback');
      talkBack.setEnabled(true);
    } else {
      cl.remove('talkback');
      talkBack.setEnabled(false);
    }
  }, [talkback]);

  useEffect(() => {
    const cl = document.documentElement.classList;
    if (easyReading) { cl.add('easy-reading'); } else { cl.remove('easy-reading'); }
  }, [easyReading]);

  useEffect(() => {
    const cl = document.documentElement.classList;
    if (largeTouch) { cl.add('large-touch'); } else { cl.remove('large-touch'); }
  }, [largeTouch]);

  

  /* ── Handlers ───────────────────────────────────────────────── */
  const handlePasswordChange = async () => {
    if (!pwCurrent || !pwNew || !pwConfirm) { toast.warning(t('common.requiredFields')); return; }
    if (pwNew !== pwConfirm) { toast.error(t('reg.pwMismatch')); return; }
    if (pwNew.length < 6) { toast.warning(t('auth.minPassword6Ref')); return; }
    setPwLoading(true);
    try {
      const result = await useAuthStore.getState().updatePassword(pwCurrent, pwNew);
      if (!result.success) {
        toast.error(result.error || t('set.pwChangeError'));
        return;
      }
      toast.success(t('set.pwChangedOk'));
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
      setShowPasswordModal(false);
    } catch {
      toast.error(t('set.pwChangeConn'));
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { toast.warning(t('set.delPwRequired')); return; }
    setDeleteLoading(true);
    try {
      const fnUrl = `${supabaseUrl}/functions/v1`;
      const res = await fetch(`${fnUrl}/auth-delete-account`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, password: deletePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) { toast.error(data.error || t('set.delAccountError')); return; }
      toast.success(t('set.delAccountOk'));
      signOut();
    } catch { toast.error(t('common.connError')); } finally { setDeleteLoading(false); }
  };

  /* ══════════════════════════════════════════════════════════════
     APARIENCIA
     ══════════════════════════════════════════════════════════════ */
  const AparienciaTab: ReactNode = (
    <div className="space-y-4">
      {/* Tema claro / oscuro */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-teal absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', theme === 'light' ? 'bg-warning/15' : 'bg-slate-800')}>
              <Icon name={theme === 'light' ? 'light_mode' : 'dark_mode'} size={24} className={theme === 'light' ? 'text-warning' : 'text-slate-300'} />
            </div>
            <div>
              <p className="font-semibold text-on-surface">{theme === 'light' ? t('pf.lightMode') : t('pf.darkMode')}</p>
              <p className="text-sm text-on-surface-variant">{t('pf.themeToggleDesc')}</p>
            </div>
          </div>
          <Toggle value={theme === 'dark'} onChange={toggleTheme} label={t('pf.changeTheme')} />
        </div>
      </GlassPanel>

      {/* Mano dominante (espeja la interfaz) */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-emerald absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Icon name="swipe" size={24} className="icon-accent-emerald" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-on-surface">{t('set.handedness')}</p>
              <p className="text-sm text-on-surface-variant">{t('set.handednessDesc')}</p>
            </div>
          </div>
          <Toggle value={handedness === 'left'} onChange={toggleHandedness} label={t('set.handedness')} />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-cyan absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative">
          <h3 className="font-semibold text-on-surface mb-2">{t('set.uiZoom')}</h3>
          <p className="text-sm text-on-surface-variant mb-4">{t('set.uiZoomDesc')}</p>
          <button
            onClick={resetDefaults}
            className="w-full py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-colors border border-outline-variant/20 flex items-center justify-center gap-2"
          >
            <Icon name="restart_alt" size={18} /> {t('set.resetDefaults')}
          </button>
        </div>
      </GlassPanel>

      {/* Glassmorfismo */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-emerald absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Icon name="gradient" size={24} className="icon-accent-emerald" />
            </div>
            <div>
              <p className="font-semibold text-on-surface">{t('set.glassmorphism')}</p>
              <p className="text-sm text-on-surface-variant">{t('set.glassDesc')}</p>
            </div>
          </div>
          <Toggle value={glassmorphism} onChange={setGlassmorphism} label={t('set.glassmorphism')} />
        </div>
      </GlassPanel>

      {/* Palabra de Fortaleza & Fe (Inspiración Bíblica) */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-teal absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <BookOpen size={24} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="font-semibold text-on-surface">{t('set.faithWord')}</p>
              <p className="text-sm text-on-surface-variant">
                Muestra versículos de sanidad, constancia y perseverancia en tu recuperación
              </p>
            </div>
          </div>
          <Toggle
            value={spiritualMode}
            onChange={(v) => {
              setSpiritualMode(v);
              setSpiritualModeEnabled(v);
              toast.success(v ? t('set.faithOn') : t('set.faithOff'));
            }}
            label={t('set.faithWord')}
          />
        </div>
      </GlassPanel>

      {/* Idioma / Language */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-blue absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <Globe size={24} className="text-info" />
            </div>
            <div>
              <p className="font-semibold text-on-surface">{t('settings.language', 'Idioma / Language')}</p>
              <p className="text-sm text-on-surface-variant">{t('settings.languageDesc', 'Selecciona tu idioma preferido para la interfaz')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { code: 'es', label: t('settings.spanish', 'Español'), badge: 'ES' },
              { code: 'en', label: t('settings.english', 'English'), badge: 'EN' },
              { code: 'pt', label: t('settings.portuguese', 'Português'), badge: 'PT' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeAppLanguage(lang.code as 'es' | 'en' | 'pt');
                  setCurrentLang(lang.code);
                  toast.success(t('settings.languageChanged'));
                }}
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border cursor-pointer',
                  currentLang.startsWith(lang.code)
                    ? 'bg-primary text-on-primary border-primary shadow-glow-primary'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
                )}
              >
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider',
                  currentLang.startsWith(lang.code) ? 'bg-on-primary/20 text-on-primary' : 'bg-primary/10 text-primary'
                )}>
                  {lang.badge}
                </span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </GlassPanel>

    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     ACCESIBILIDAD
     ══════════════════════════════════════════════════════════════ */
  const AccesibilidadTab: ReactNode = (
    <div className="space-y-4">
      {[
        {
          key: 'motion',
          icon: 'animation',
          color: 'text-primary',
          bg: 'bg-primary/10',
          titleKey: 'set.a11yMotion',
          descKey: 'set.a11yMotionDesc',
          value: reduceMotion,
          onChange: setReduceMotion,
          blob: 'blob-teal',
        },
        {
          key: 'contrast',
          icon: 'contrast',
          color: 'text-secondary',
          bg: 'bg-secondary-container/20',
          titleKey: 'set.a11yContrast',
          descKey: 'set.a11yContrastDesc',
          value: highContrast,
          onChange: setHighContrast,
          blob: 'blob-blue',
        },
        {
          key: 'talkback',
          icon: 'record_voice_over',
          color: 'icon-accent-cyan',
          bg: 'bg-info/10',
          titleKey: 'set.a11yTalkback',
          descKey: 'set.a11yTalkbackDesc',
          value: talkback,
          onChange: setTalkback,
          blob: 'blob-cyan',
        },
        {
          key: 'easyReading',
          icon: 'menu_book',
          color: 'icon-accent-emerald',
          bg: 'bg-emerald-500/10',
          titleKey: 'set.a11yEasyRead',
          descKey: 'set.a11yEasyReadDesc',
          value: easyReading,
          onChange: setEasyReading,
          blob: 'blob-emerald',
        },
        {
          key: 'largeTouch',
          icon: 'touch_app',
          color: 'text-primary',
          bg: 'bg-primary/10',
          titleKey: 'set.a11yLargeTouch',
          descKey: 'set.a11yLargeTouchDesc',
          value: largeTouch,
          onChange: setLargeTouch,
          blob: 'blob-teal',
        },
      ].map((item) => (
        <GlassPanel key={item.key} className="p-6 rounded-2xl relative overflow-hidden">
          <div className={`${item.blob} absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none`} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                <Icon name={item.icon} size={24} className={item.color} />
              </div>
              <div>
                <p className="font-semibold text-on-surface">{t(item.titleKey)}</p>
                <p className="text-sm text-on-surface-variant">{t(item.descKey)}</p>
              </div>
            </div>
            <Toggle value={item.value} onChange={item.onChange} label={t(item.titleKey)} />
          </div>
        </GlassPanel>
      ))}

      {/* ── Motor de Voz de Retroalimentación en Vivo (Fish Audio / Neural / Offline) ── */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden border border-teal-500/20 bg-surface/80">
        <div className="blob-teal absolute -top-12 -right-12 w-40 h-40 opacity-20 pointer-events-none" />
        <div className="relative space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Icon name="graphic_eq" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-on-surface">{t('set.ttsEngine')}</p>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300">
                    {voiceMode === 'humanized' ? t('set.fishBadge') : t('set.deviceBadge')}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">
                  {voiceMode === 'humanized'
                    ? t('set.ttsHumaDesc')
                    : t('set.ttsDevDesc')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestVoice}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto",
                testingVoice
                  ? "bg-danger text-white shadow-sm animate-pulse"
                  : "bg-primary hover:bg-primary/90 text-on-primary shadow-sm hover:shadow"
              )}
            >
              <Icon name={testingVoice ? "stop" : "volume_up"} size={16} />
              <span>{testingVoice ? t('set.stopTest') : t('set.testVoice')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleVoiceModeChange('humanized')}
              className={cn(
                "p-3.5 rounded-xl border text-left transition-all flex items-start gap-3",
                voiceMode === 'humanized'
                  ? "border-teal-500 bg-teal-500/10 shadow-sm"
                  : "border-outline-variant/40 bg-surface hover:border-outline-variant"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center",
                voiceMode === 'humanized' ? "border-teal-600 bg-teal-600" : "border-outline"
              )}>
                {voiceMode === 'humanized' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">{t('set.voiceHumaClinic')}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t('set.voiceHumaClinicDesc')}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleVoiceModeChange('device')}
              className={cn(
                "p-3.5 rounded-xl border text-left transition-all flex items-start gap-3",
                voiceMode === 'device'
                  ? "border-teal-500 bg-teal-500/10 shadow-sm"
                  : "border-outline-variant/40 bg-surface hover:border-outline-variant"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center",
                voiceMode === 'device' ? "border-teal-600 bg-teal-600" : "border-outline"
              )}>
                {voiceMode === 'device' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">{t('set.voiceDevOffline')}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t('set.voiceDevOfflineDesc')}
                </p>
              </div>
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     NOTIFICACIONES
     ══════════════════════════════════════════════════════════════ */
  const NotificacionesTab: ReactNode = (
    <div className="space-y-6">
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-cyan absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative space-y-5">
          <h3 className="font-semibold text-on-surface gradient-text-cyan">{t('set.notifPrefs')}</h3>
          {[
            { icon: 'mail', color: 'text-primary', bg: 'bg-primary/10', titleKey: 'set.nEmail', descKey: 'set.nEmailDesc', value: notifEmail, onChange: setNotifEmail },
            { icon: 'notifications_active', color: 'text-secondary', bg: 'bg-secondary-container/20', titleKey: 'set.nPush', descKey: 'set.nPushDesc', value: notifPush, onChange: setNotifPush },
            { icon: 'volume_up', color: 'icon-accent-cyan', bg: 'bg-info/10', titleKey: 'set.nSound', descKey: 'set.nSoundDesc', value: notifSound, onChange: setNotifSound },
          ].map((item) => (
            <div key={item.titleKey} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <Icon name={item.icon} size={22} className={item.color} />
                </div>
                <div>
                  <p className="font-medium text-on-surface">{t(item.titleKey)}</p>
                  <p className="text-sm text-on-surface-variant">{t(item.descKey)}</p>
                </div>
              </div>
              <Toggle value={item.value} onChange={item.onChange} label={t(item.titleKey)} />
            </div>
          ))}
        </div>
      </GlassPanel>

      <EmailSystemStatusCard />
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     CUENTA
     ══════════════════════════════════════════════════════════════ */
  const CuentaTab: ReactNode = (
    <div className="space-y-4">
      {/* Información de cuenta */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-teal absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative">
          <h3 className="font-semibold text-on-surface gradient-text-teal mb-4">{t('set.accountInfo')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60">
              <div className="flex items-center gap-2 text-on-surface-variant"><Icon name="alternate_email" size={18} /><span className="text-sm">Email</span></div>
              <span className="font-medium text-on-surface text-sm">{user?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60">
              <div className="flex items-center gap-2 text-on-surface-variant"><Icon name="badge" size={18} /><span className="text-sm">{t('common.role')}</span></div>
              <span className="font-medium text-on-surface text-sm capitalize">{user?.role || '—'}</span>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Seguridad */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-blue absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative">
          <h3 className="font-semibold text-on-surface gradient-text-blue mb-4">{t('set.security')}</h3>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="premium-btn w-full bg-primary text-on-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Icon name="lock_reset" size={20} /> {t('profile.changePassword')}
          </button>
        </div>
      </GlassPanel>

      {/* Zona de peligro */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden border border-error/20">
        <div className="blob-warm absolute -top-12 -right-12 w-32 h-32 opacity-15 pointer-events-none" />
        <div className="relative">
          <h3 className="font-semibold text-error mb-2">{t('set.dangerZone')}</h3>
          <p className="text-sm text-on-surface-variant mb-4">{t('set.dangerDesc')}</p>
          <div className="space-y-3">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="premium-btn w-full bg-error/10 text-error py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-error/20 transition-colors border border-error/20"
            >
              <Icon name="delete_forever" size={20} /> {t('set.deleteAccount')}
            </button>
            <button
              onClick={() => signOut()}
              className="premium-btn w-full bg-surface-container-low text-on-surface-variant py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="logout" size={20} /> {t('common.logout')}
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     ACERCA DE
     ══════════════════════════════════════════════════════════════ */
  const AcercaDeTab: ReactNode = (
    <div className="space-y-4">
      {/* Versión */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-teal absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center breathe-teal">
            <Icon name="favorite" size={28} className="text-primary" filled />
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface">FisioMirror</h3>
            <p className="text-sm text-on-surface-variant">{t('set.version')}: <span className="font-semibold text-primary">1.0</span></p>
          </div>
        </div>
      </GlassPanel>

      {/* Créditos del equipo */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-cyan absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative">
          <h3 className="font-semibold text-on-surface gradient-text-cyan mb-4">{t('set.credits')}</h3>
          <div className="space-y-3">
            {[
              { icon: Code2, color: 'text-primary', bg: 'bg-primary/10', labelKey: 'set.devTeam', valueKey: 'set.devTeamVal' },
              { icon: Palette, color: 'text-info', bg: 'bg-info/10', labelKey: 'set.designTeam', valueKey: 'set.designTeamVal' },
              { icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-500/10', labelKey: 'set.clinicTeam', valueKey: 'set.clinicTeamVal' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/60">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-on-surface text-sm">{t(item.labelKey)}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{t(item.valueKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>

      {/* Enlaces */}
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-emerald absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative space-y-3">
          <h3 className="font-semibold text-on-surface gradient-text-emerald mb-2">{t('set.resources')}</h3>
          <button
            onClick={() => setShowDocModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-high transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText size={20} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-on-surface text-sm">{t('set.techDoc')}</p>
                <p className="text-xs text-on-surface-variant">{t('set.techDocDesc')}</p>
              </div>
            </div>
            <Icon name="chevron_right" size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={() => setShowLicModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-high transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <Shield size={20} className="text-info" />
              </div>
              <div className="text-left">
                <p className="font-medium text-on-surface text-sm">{t('set.ossLicenses')}</p>
                <p className="text-xs text-on-surface-variant">{t('set.ossLicensesDesc')}</p>
              </div>
            </div>
            <Icon name="chevron_right" size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </button>
        </div>
      </GlassPanel>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     AYUDA & FAQ
     ══════════════════════════════════════════════════════════════ */
  const AyudaTab: ReactNode = (
    <div className="space-y-4">
      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
            <Smartphone size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-on-surface">{t('set.installIOS')}</h4>
            <p className="text-xs text-on-surface-variant">{t('set.installIOSDesc')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowIOSModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-sm transition-all"
        >
          Ver Instrucciones iOS
        </button>
      </GlassPanel>

      <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
        <div className="blob-teal absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
        <div className="relative">
          <HelpSection />
        </div>
      </GlassPanel>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     CONTACTO
     ══════════════════════════════════════════════════════════════ */
  const ContactoTab: ReactNode = (
    <GlassPanel className="p-6 rounded-2xl relative overflow-hidden">
      <div className="blob-teal absolute -top-12 -right-12 w-32 h-32 opacity-20 pointer-events-none" />
      <div className="relative">
        <h3 className="font-semibold text-on-surface gradient-text-teal mb-2">{t('set.contactChannels')}</h3>
        <p className="text-sm text-on-surface-variant mb-6">
          Comunícate con soporte clínico o con tu fisioterapeuta a través de cualquiera de nuestros canales oficiales:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <a
            href="https://wa.me/584124081077?text=Hola%20FisioMirror,%20necesito%20asistencia%20cl%C3%ADnica"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">{t('set.whatsappDirect')}</p>
              <p className="text-xs opacity-80">+58 412 4081077</p>
            </div>
          </a>

          <a
            href="tel:+584124081077"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-950 dark:text-teal-200 hover:bg-teal-500/20 transition-all hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">{t('set.phoneCall')}</p>
              <p className="text-xs opacity-80">+58 412 4081077</p>
            </div>
          </a>
        </div>

        <a
          href="mailto:fisioMirror@proton.me"
          className="premium-btn inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-glow-primary breathe-teal"
        >
          <Mail size={22} />
          Enviar Correo Electrónico
        </a>
        <div className="mt-6 p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Icon name="mail" size={18} />
            <span className="text-sm">fisioMirror@proton.me</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );

  const tabs = [
    { id: 'apariencia', label: t('set.tabAppearance'), content: AparienciaTab },
    { id: 'accesibilidad', label: t('pf.tabAccessibility'), content: AccesibilidadTab },
    { id: 'ayuda', label: t('set.tabHelp'), content: AyudaTab },
    { id: 'notificaciones', label: t('st.pushNotifs'), content: NotificacionesTab },
    { id: 'cuenta', label: t('set.tabAccount'), content: CuentaTab },
    { id: 'acerca-de', label: t('set.tabAbout'), content: AcercaDeTab },
    { id: 'contacto', label: t('set.tabContact'), content: ContactoTab },
  ];

  return (
    <div className="fm-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center breathe-teal">
          <Icon name="settings" size={28} className="text-primary animate-breathe-icon" />
        </div>
        <div>
          <h1 className="fm-title gradient-text-editorial">{t('st.settings')}</h1>
          <p className="text-on-surface-variant text-sm">{t('set.tagline')}</p>
        </div>
      </motion.div>

      <AnimatedTabs tabs={tabs} />

      {/* Modales de confirmación */}
      {/* Modal: Cambiar contraseña */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-elevated border border-outline-variant/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-on-surface mb-4">{t('profile.changePassword')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-on-surface-variant mb-1 block">{t('set.pwCurrent')}</label>
                  <input
                    type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface-variant mb-1 block">{t('reset.newPw')}</label>
                  <input
                    type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    placeholder={t('common.minPassword6')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface-variant mb-1 block">{t('reset.confirmNewPw')}</label>
                  <input
                    type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface-variant font-semibold hover:bg-surface-container-high transition-colors">{t('common.cancel')}</button>
                <button onClick={handlePasswordChange} disabled={pwLoading} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">{pwLoading ? t('st.generating') : t('common.save')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Eliminar cuenta */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-elevated border border-error/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                  <Icon name="warning" size={24} className="text-error" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-error">{t('set.deleteAccount')}</h3>
                  <p className="text-sm text-on-surface-variant">{t('set.cannotUndo')}</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">{t('set.delWarn')}</p>
              <div>
                <label className="text-sm font-medium text-on-surface-variant mb-1 block">{t('set.confirmWithPw')}</label>
                <input
                  type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-error transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface-variant font-semibold hover:bg-surface-container-high transition-colors">{t('common.cancel')}</button>
                <button onClick={handleDeleteAccount} disabled={deleteLoading} className="flex-1 py-3 rounded-xl bg-error text-white font-semibold hover:bg-error/90 transition-colors disabled:opacity-50">{deleteLoading ? t('common.deleting') : t('set.deleteForever')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Documentación técnica */}
      <AnimatePresence>
        {showDocModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl p-6 w-full max-w-2xl shadow-elevated border border-outline-variant/20 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">{t('set.techDoc')}</h3>
              </div>
              <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                <div>
                  <h4 className="font-semibold text-on-surface mb-1">{t('set.sysArch')}</h4>
                  <p>{t('set.sysArchBody')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface mb-1">{t('set.coreTech')}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('set.techReact')}</li>
                    <li>{t('set.techTailwind')}</li>
                    <li>{t('set.techSupabase')}</li>
                    <li>{t('set.techMediaPipe')}</li>
                    <li>{t('set.techFramer')}</li>
                    <li>{t('set.techHtml2')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface mb-1">{t('set.mainFlows')}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('set.flowAuth')}</li>
                    <li>{t('set.flowCalibration')}</li>
                    <li>{t('set.flowArMirror')}</li>
                    <li>{t('set.flowReports')}</li>
                  </ul>
                </div>
              </div>
              <button onClick={() => setShowDocModal(false)} className="w-full mt-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors">{t('common.close')}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Licencias */}
      <AnimatePresence>
        {showLicModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowLicModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl p-6 w-full max-w-2xl shadow-elevated border border-outline-variant/20 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Shield size={24} className="text-info" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">{t('set.ossLicenses')}</h3>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'React', version: '18.3.1', license: 'MIT' },
                  { name: 'TypeScript', version: '5.5.3', license: 'Apache 2.0' },
                  { name: 'Vite', version: '5.4.0', license: 'MIT' },
                  { name: 'Tailwind CSS', version: '3.4.0', license: 'MIT' },
                  { name: 'Supabase JS', version: '2.45.0', license: 'MIT' },
                  { name: 'MediaPipe Tasks Vision', version: '0.10.0', license: 'Apache 2.0' },
                  { name: 'Framer Motion', version: '11.3.0', license: 'MIT' },
                  { name: 'Lucide React', version: '0.400.0', license: 'ISC' },
                  { name: 'jsPDF', version: '2.5.1', license: 'MIT' },
                  { name: 'HTML2Canvas', version: '1.4.1', license: 'MIT' },
                  { name: 'Recharts', version: '2.12.0', license: 'MIT' },
                  { name: 'Zustand', version: '4.5.0', license: 'MIT' },
                  { name: 'Canvas Confetti', version: '1.9.0', license: 'ISC' },
                ].map((lib) => (
                  <div key={lib.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60">
                    <div className="flex items-center gap-3">
                      <Code2 size={18} className="text-on-surface-variant" />
                      <div>
                        <p className="font-medium text-on-surface text-sm">{lib.name}</p>
                        <p className="text-xs text-on-surface-variant">v{lib.version}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">{lib.license}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowLicModal(false)} className="w-full mt-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors">{t('common.close')}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Instalación en iOS */}
      <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </div>
  );
}
