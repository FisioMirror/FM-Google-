import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, useReducedMotion } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { Spinner } from '../components/ui/Loader';
import { PinInput } from '../components/ui/PinInput';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/themeApi';
import { useToast } from '../components/ui/toastApi';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { SparkleEffect } from '../components/auth/SparkleEffect';
import { TurnstileWidget, type TurnstileWidgetRef } from '../components/auth/TurnstileWidget';
import { AuroraText } from '../components/ui/AuroraText';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useAuthValidation, createPatientLoginData, createPatientRegisterData, createFisioLoginData, createFisioRegisterData } from '../hooks/useAuthValidation';
import { PLACEHOLDERS } from '../lib/validation';

type AuthMode = 'login' | 'register';
type LoginRole = 'paciente' | 'fisioterapeuta';
type FisioStep = 1 | 2;
type ImageState = 'idle' | 'typing' | 'loading' | 'error';
type GlowPhase = 'pulse' | 'settled' | 'error';

interface EspecialidadRow {
  id: string;
  nombre: string;
}

const DEFAULT_ESPECIALIDADES = [
  'Fisioterapia Deportiva',
  'Rehabilitación Traumatológica',
  'Fisioterapia Neurológica',
  'Rehabilitación Postquirúrgica',
  'Fisioterapia Geriátrica',
  'Terapia Manual Ortopédica',
  'Fisioterapia Pediátrica',
  'Fisioterapia Cardiorrespiratoria',
  'Fisioterapia en Suelo Pélvico',
  'Ergonomía y Salud Laboral',
];

const LOGIN_BG_URL = '/login.png';

function CharacterSpotlight({
  activeRole,
  phase,
  reduceMotion,
  onSelectRole,
}: {
  activeRole: LoginRole;
  phase: GlowPhase;
  reduceMotion: boolean | null;
  onSelectRole: (role: LoginRole) => void;
}) {
  const { t } = useTranslation();
  const isPaciente = activeRole === 'paciente';
  const isFisio = activeRole === 'fisioterapeuta';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* ── LUMINOUS CHARACTER AURA (mix-blend-mode: screen preserves 100% natural colors, adding only pure light) ── */}
      {/* Fisioterapeuta Spotlight (Left Side) */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full pointer-events-none"
        animate={{
          opacity: isFisio ? (phase === 'pulse' ? 1 : 0.88) : 0.05,
          scale: isFisio ? 1 : 0.96,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ mixBlendMode: 'screen' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 38% 46%, rgba(16, 185, 129, 0.42) 0%, rgba(13, 148, 136, 0.20) 35%, rgba(16, 185, 129, 0.06) 55%, transparent 75%)',
            filter: 'blur(30px)',
          }}
        />
        <div
          className="absolute"
          style={{
            left: '24%',
            top: '30%',
            width: '42%',
            height: '42%',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.30) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      {/* Paciente Spotlight (Right Side) */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        animate={{
          opacity: isPaciente ? (phase === 'pulse' ? 1 : 0.88) : 0.05,
          scale: isPaciente ? 1 : 0.96,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ mixBlendMode: 'screen' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 62% 48%, rgba(14, 165, 233, 0.42) 0%, rgba(2, 132, 199, 0.20) 35%, rgba(14, 165, 233, 0.06) 55%, transparent 75%)',
            filter: 'blur(30px)',
          }}
        />
        <div
          className="absolute"
          style={{
            right: '24%',
            top: '32%',
            width: '42%',
            height: '42%',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.30) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      {/* ── INTERACTIVE CHARACTER HOTSPOTS & HUD BEACONS ── */}
      {/* Left Character: Fisioterapeuta */}
      <div
        onClick={() => onSelectRole('fisioterapeuta')}
        role="button"
        tabIndex={0}
        aria-label={t('auth.selectRoleTherapist')}
        className={cn(
          'absolute top-0 bottom-0 left-0 w-1/2 pointer-events-auto cursor-pointer group flex flex-col justify-center items-center transition-all',
          isFisio ? 'z-20' : 'z-10 hover:bg-emerald-500/[0.02]'
        )}
      >
        {/* Holographic AR Beacon when active */}
        <AnimatePresence>
          {isFisio && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[26%] left-[22%] flex flex-col items-center gap-1.5 pointer-events-none"
            >
              {/* Pulse target ring */}
              <div className="relative flex items-center justify-center">
                {!reduceMotion && (
                  <span className="absolute w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-400/60 animate-ping" />
                )}
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] border-2 border-white dark:border-slate-900" />
              </div>
              {/* Glass status badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-emerald-500/35 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold tracking-tight">
                <Icon name="medical_services" size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>{t('tr.fisioterapeuta')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discreet hover indicator when inactive */}
        {!isFisio && (
          <div className="absolute top-[28%] left-[24%] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform -translate-y-1 group-hover:translate-y-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
              <Icon name="touch_app" size={12} />
              <span>{t('auth.viewTherapist')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Character: Paciente */}
      <div
        onClick={() => onSelectRole('paciente')}
        role="button"
        tabIndex={0}
        aria-label={t('auth.selectRolePatient')}
        className={cn(
          'absolute top-0 bottom-0 right-0 w-1/2 pointer-events-auto cursor-pointer group flex flex-col justify-center items-center transition-all',
          isPaciente ? 'z-20' : 'z-10 hover:bg-sky-500/[0.02]'
        )}
      >
        {/* Biomechanical Recovery Beacon when active */}
        <AnimatePresence>
          {isPaciente && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[30%] right-[22%] flex flex-col items-center gap-1.5 pointer-events-none"
            >
              {/* Pulse target ring */}
              <div className="relative flex items-center justify-center">
                {!reduceMotion && (
                  <span className="absolute w-8 h-8 rounded-full bg-sky-500/25 border border-sky-400/60 animate-ping" />
                )}
                <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-[0_0_12px_#0ea5e9] border-2 border-white dark:border-slate-900" />
              </div>
              {/* Glass status badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-sky-500/35 text-sky-800 dark:text-sky-300 text-xs font-extrabold tracking-tight">
                <Icon name="person" size={13} className="text-sky-600 dark:text-sky-400" />
                <span>{t('tr.paciente')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discreet hover indicator when inactive */}
        {!isPaciente && (
          <div className="absolute top-[32%] right-[24%] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform -translate-y-1 group-hover:translate-y-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
              <Icon name="touch_app" size={12} />
              <span>{t('auth.viewPatient')}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── LUMINOUS BORDER FADES (Desvanecidos Claros y Luminosos) ── */}
      {/* Left border fade: seamlessly bridges illustration with the light login form */}
      <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#f9f9fc] dark:from-slate-950 via-[#f9f9fc]/75 dark:via-slate-950/75 to-transparent pointer-events-none z-10" />

      {/* Top border fade */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#f9f9fc] dark:from-slate-950 via-[#f9f9fc]/60 dark:via-slate-950/60 to-transparent pointer-events-none z-10" />

      {/* Bottom border fade */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f9f9fc] dark:from-slate-950 via-[#f9f9fc]/80 dark:via-slate-950/80 to-transparent pointer-events-none z-10" />

      {/* Right border fade */}
      <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#f9f9fc]/90 dark:from-slate-950/90 via-[#f9f9fc]/40 dark:via-slate-950/40 to-transparent pointer-events-none z-10" />

      {/* Ambient framing perimeter halo */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 transition-colors duration-700"
        style={{
          boxShadow: isPaciente
            ? 'inset 0 0 60px 8px rgba(14, 165, 233, 0.07)'
            : 'inset 0 0 60px 8px rgba(16, 185, 129, 0.07)',
        }}
      />
    </div>
  );
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
  const colors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-teal-600', 'bg-teal-600'];
  return { score, label: labels[score] || 'Muy débil', color: colors[score] || 'bg-red-500' };
}

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function Login() {
  const {
    signIn,
    signInPatientWithEmail,
    linkTokenToEmail,
    signUpFisio,
    loading,
    error,
    clearError,
  } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const imageControls = useAnimation();

  const [mode, setMode] = useState<AuthMode>('login');
  const [loginRole, setLoginRole] = useState<LoginRole>('paciente');
  const [fisioStep, setFisioStep] = useState<FisioStep>(1);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const [fullName, setFullName] = useState('');

  // Physio specific fields
  const [cedula, setCedula] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [colegiadoId, setColegiadoId] = useState('');
  const [telefono, setTelefono] = useState('');
  const [anioEgreso, setAnioEgreso] = useState('');
  const [especialidadesSel, setEspecialidadesSel] = useState<string[]>([]);
  const [especialidadesOpts, setEspecialidadesOpts] = useState<string[]>(DEFAULT_ESPECIALIDADES);
  const [especialidadInput, setEspecialidadInput] = useState('');
  const [credencialFile, setCredencialFile] = useState<File | null>(null);
  const [credencialPreview, setCredencialPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Modals & Feedback
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const [imageState, setImageState] = useState<ImageState>('idle');
  const [glowPhase, setGlowPhase] = useState<GlowPhase>('pulse');
  const [errorShake, setErrorShake] = useState(false);

  const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const isPaciente = loginRole === 'paciente';
  const isFisio = loginRole === 'fisioterapeuta';
  const isRegister = mode === 'register';

  const isTyping = email.length > 0 || password.length > 0 || token.length > 0;
  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);
  const greeting = useMemo(() => getTimeGreeting(), []);

  // Validation hook
  const {
    validatePatientLogin,
    validatePatientRegister,
    validateFisioLogin,
    validateFisioRegister,
    validateFisioStep1,
  } = useAuthValidation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stay') === '1' || params.get('switch') === '1') {
      return;
    }
    if (params.get('logout') === 'true' || params.get('logout') === '1') {
      useAuthStore.getState().signOut();
      return;
    }
    if (user) {
      navigate(user.role === 'fisioterapeuta' ? '/dashboard-fisio' : '/dashboard-paciente', {
        replace: true,
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  useEffect(() => {
    if (loading) {
      setImageState('loading');
      return;
    }
    if (error) {
      setImageState('error');
      setGlowPhase('error');
      setErrorShake(true);
      if (!reduceMotion) {
        void imageControls.start({
          x: [0, -12, 12, -10, 10, 0],
          transition: { duration: 0.6, ease: 'easeInOut' },
        });
      }
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => {
        setGlowPhase('settled');
        setErrorShake(false);
        setImageState(isTyping ? 'typing' : 'idle');
      }, 1500);
      return () => {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      };
    }
    setImageState(isTyping ? 'typing' : 'idle');
  }, [loading, error, isTyping, reduceMotion, imageControls]);

  useEffect(() => {
    return () => {
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const loadEspecialidades = async () => {
    if (especialidadesOpts.length > 0) return;
    try {
      const { data, error: err } = await supabase
        .from('especialidades')
        .select('id, nombre')
        .order('nombre');
      if (err) {
        toast.error('Error cargando especialidades');
        return;
      }
      if (data) setEspecialidadesOpts((data as EspecialidadRow[]).map((e) => e.nombre));
    } catch {
      toast.error('Error cargando especialidades');
    }
  };

  const switchRole = (role: LoginRole) => {
    setLoginRole(role);
    clearError();
    setFormErrors({});
    setToken('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTurnstileToken(null);
    turnstileRef.current?.reset();
    setGlowPhase('pulse');
    if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
    glowTimeoutRef.current = setTimeout(() => setGlowPhase('settled'), 1000);
    if (role === 'fisioterapeuta' && mode === 'register') loadEspecialidades();
    setTimeout(() => {
      if (window.innerWidth >= 768) emailRef.current?.focus();
    }, 300);
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setFisioStep(1);
    clearError();
    setFormErrors({});
    setTurnstileToken(null);
    turnstileRef.current?.reset();
    if (m === 'register' && isFisio) loadEspecialidades();
  };

  const handleCredencialFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCredencialFile(file);
    const reader = new FileReader();
    reader.onload = () => setCredencialPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadCredencial = async (userId: string): Promise<string | null> => {
    if (!credencialFile) return null;
    setUploading(true);
    try {
      const ext = credencialFile.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/credencial-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('credenciales_profesionales')
        .upload(path, credencialFile, { upsert: true });
      if (upErr) throw new Error(upErr.message);
      const { data } = supabase.storage
        .from('credenciales_profesionales')
        .getPublicUrl(path);
      return data.publicUrl;
    } catch {
      toast.warning('No se pudo subir la credencial', {
        description:
          t('auth.uploadLater'),
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    // Physio Step 1 transition doesn't require Turnstile yet
    if (isFisio && mode === 'register' && fisioStep === 1) {
      const step1Data = createFisioRegisterData(
        fullName, email, password, confirmPassword, cedula, telefono,
        universidad, colegiadoId, anioEgreso, especialidadesSel, credencialFile, turnstileToken || ''
      );
      const validation = validateFisioStep1(step1Data);
      if (!validation.success) {
        setFormErrors(validation.errors);
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError || 'Por favor completa todos los campos obligatorios correctamente');
        return;
      }
      setFormErrors({});
      setFisioStep(2);
      return;
    }

    if (!turnstileToken) {
      toast.error(t('auth.errTurnstile'));
      return;
    }

    try {
      const cfRes = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const cfData = await cfRes.json();
      if (!cfRes.ok || !cfData.success) {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        toast.error(t('auth.errTurnstileRetry'));
        return;
      }
    } catch {
      // Safe fallback for sandbox
    }

    // ─────────────────────────────────────────────
    // PACIENTE: INICIAR SESIÓN (EMAIL Y PASSWORD)
    // ─────────────────────────────────────────────
    if (isPaciente && mode === 'login') {
      const loginData = createPatientLoginData(email, password, turnstileToken);
      const validation = validatePatientLogin(loginData);
      if (!validation.success) {
        setFormErrors(validation.errors);
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError || t('auth.errCredentials'));
        return;
      }
      setFormErrors({});
      const ok = await signInPatientWithEmail(email, password);
      if (ok) {
        toast.success('Bienvenido a FisioMirror');
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
          setCooldown(900);
          toast.error('Cuenta bloqueada por 15 minutos.');
        } else if (newAttempts >= 3) {
          setCooldown(60);
          toast.error('Demasiados intentos. Espera 60 segundos.');
        }
      }
      return;
    }

    // ─────────────────────────────────────────────
    // PACIENTE: REGISTRO (TOKEN + EMAIL + PASSWORD)
    // ─────────────────────────────────────────────
    if (isPaciente && mode === 'register') {
      const registerData = createPatientRegisterData(token, email, password, confirmPassword, fullName, turnstileToken);
      const validation = validatePatientRegister(registerData);
      if (!validation.success) {
        setFormErrors(validation.errors);
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError || t('auth.errSignup'));
        return;
      }
      setFormErrors({});

      // Special demo shortcut
      if (token.trim() === '123456' || email === 'paciente@demo.com') {
        const ok = await linkTokenToEmail(token.trim(), email, password, fullName || undefined);
        if (ok) toast.success(t('auth.signupLinked'));
        return;
      }

      const ok = await linkTokenToEmail(token.trim(), email, password, fullName || undefined);
      if (ok) {
        toast.success(t('auth.signupTokenLinked'));
      } else {
        const currentError = useAuthStore.getState().error;
        if (currentError?.includes('Demasiados intentos')) {
          setCooldown(60);
          toast.error('Demasiados intentos. Espera un minuto.');
        }
      }
      return;
    }

    // ─────────────────────────────────────────────
    // FISIOTERAPEUTA: INICIAR SESIÓN (EMAIL Y PASSWORD)
    // ─────────────────────────────────────────────
    if (isFisio && mode === 'login') {
      const loginData = createFisioLoginData(email, password, turnstileToken);
      const validation = validateFisioLogin(loginData);
      if (!validation.success) {
        setFormErrors(validation.errors);
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError || t('auth.errCredentials'));
        return;
      }
      setFormErrors({});
      const ok = await signIn(email, password);
      if (ok) {
        toast.success('Bienvenido a FisioMirror');
      } else {
        const currentError = useAuthStore.getState().error;
        if (currentError?.includes('Demasiados intentos')) {
          setCooldown(60);
          toast.error('Demasiados intentos. Espera un minuto.');
        }
      }
      return;
    }

    // ─────────────────────────────────────────────
    // FISIOTERAPEUTA: REGISTRO PROFESIONAL
    // ─────────────────────────────────────────────
    if (isFisio && mode === 'register') {
      const registerData = createFisioRegisterData(
        fullName, email, password, confirmPassword, cedula, telefono,
        universidad, colegiadoId, anioEgreso, especialidadesSel, credencialFile, turnstileToken
      );
      const validation = validateFisioRegister(registerData);
      if (!validation.success) {
        setFormErrors(validation.errors);
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError || 'Completa los campos requeridos');
        return;
      }
      setFormErrors({});

      const tempId = crypto.randomUUID();
      const url = await uploadCredencial(tempId);
      const ok = await signUpFisio(email, password, fullName, {
        cedula,
        universidad,
        colegiadoId,
        especialidades: especialidadesSel,
        credencialUrl: url ?? undefined,
        anioEgreso: anioEgreso || undefined,
        telefono: telefono.trim(),
      });
      if (ok) {
        setShowSuccess(true);
        toast.success('Cuenta creada. Bienvenido a FisioMirror');
      } else {
        const currentError = useAuthStore.getState().error;
        if (currentError?.includes('Demasiados intentos')) {
          setCooldown(60);
          toast.error('Demasiados intentos. Espera un minuto.');
        }
      }
    }
  };

  const fillFisioDemo = () => {
    switchRole('fisioterapeuta');
    setMode('login');
    setEmail('fisio@demo.com');
    setPassword('demo1234');
    setTurnstileToken('demo-token-bypass');
  };

  const fillPacienteDemo = () => {
    switchRole('paciente');
    setMode('login');
    setEmail('paciente@demo.com');
    setPassword('demo1234');
    setTurnstileToken('demo-token-bypass');
  };

  const addEspecialidad = () => {
    const val = especialidadInput.trim();
    if (val && !especialidadesSel.includes(val)) {
      setEspecialidadesSel([...especialidadesSel, val]);
      setEspecialidadInput('');
    }
  };

  const removeEspecialidad = (esp: string) => {
    setEspecialidadesSel(especialidadesSel.filter((e) => e !== esp));
  };


  const handleResetPassword = async () => {
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error(t('auth.errEmail'));
      return;
    }
    setResetLoading(true);
    try {
      // 1. Enviar código y enlace de restablecimiento vía API directa (SMTP + Supabase)
      const res = await fetch('/api/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(t('auth.resetSent'), {
          description: t('auth.resetSentDesc', { email: cleanEmail }),
        });
        setShowResetModal(false);
        setResetEmail('');
        navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
      } else {
        // Fallback supabase directo
        try {
          await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: `${window.location.origin}/reset-password?email=${encodeURIComponent(cleanEmail)}`,
          });
        } catch {
          // ignore
        }
        toast.success(t('auth.resetGeneric'));
        setShowResetModal(false);
        setResetEmail('');
        navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
      }
    } catch {
      toast.success(t('auth.resetGeneric'));
      setShowResetModal(false);
      setResetEmail('');
      navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
    } finally {
      setResetLoading(false);
    }
  };

  const breathingScale = imageState === 'typing' ? [1, 1.01, 1] : [1, 1.025, 1];
  const breathingDuration = imageState === 'typing' ? 3 : 5;

  const statusMessage =
    loading
      ? 'Preparando tu espacio...'
      : error
      ? 'Revisa tus credenciales'
      : isPaciente
      ? mode === 'register'
        ? t('auth.heroLinkToken')
        : t('auth.heroPatient')
      : mode === 'register'
      ? t('auth.heroPatientSub')
      : t('auth.heroFisioSub');

  // Dynamic titles and subtitles
  const getHeaderTitle = () => {
    if (isPaciente) {
      return mode === 'register'
        ? t('auth.patientRegisterTitle', 'Registro de Paciente')
        : t('auth.patientLoginTitle', 'Comienza tu recuperación hoy');
    }
    return mode === 'register'
      ? t('auth.fisioRegisterTitle', 'Registro Profesional')
      : t('auth.fisioLoginTitle', 'Gestión Clínica de Alto Rendimiento');
  };

  const getHeaderSubtitle = () => {
    if (isPaciente) {
      return mode === 'register'
        ? t('auth.patientRegisterSubtitle', 'Ingresa tu código de 6 dígitos asignado por tu fisioterapeuta para vincular tu cuenta.')
        : t('auth.patientLoginSubtitle', 'Ingresa con tu correo y contraseña para acceder a tus terapias.');
    }
    return mode === 'register'
      ? t('auth.fisioRegisterSubtitle', 'Crea tu cuenta clínica para gestionar pacientes, métricas y prescripción digital.')
      : t('auth.fisioLoginSubtitle', 'Accede a tu panel de control clínico y seguimiento de pacientes.');
  };

  return (
    <div className="min-h-screen w-full flex font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden bg-[#f9f9fc] dark:bg-slate-950">
      {/* ── MESH BACKGROUND GRADIENT ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(at 0% 0%, rgba(0, 80, 77, 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.09) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(13, 148, 136, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.10) 0px, transparent 50%)',
        }}
      />
      {/* Ambient glowing orbs */}
      <div className="pointer-events-none absolute -left-12 top-16 h-72 w-72 rounded-full bg-[#00504d]/10 dark:bg-teal-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />

      {/* ═══════════════════════════════════════════════════
          LEFT PANEL — MAIN FORM
          ═══════════════════════════════════════════════════ */}
      <div className="w-full md:w-[45%] lg:w-[42%] flex flex-col items-center justify-center px-4 py-8 md:px-8 relative z-20 overflow-y-auto">
        {/* Top bar: logo + language + theme toggle */}
        <div className="w-full max-w-[480px] flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="FisioMirror Logo" className="h-10 w-auto shrink-0 drop-shadow-sm" />
            <span className="font-extrabold text-2xl tracking-tight text-[#00504d] dark:text-[#8ad3cf]">
              FisioMirror
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector compact />
            <button
              onClick={toggleTheme}
              aria-label={t('auth.toggleTheme')}
              className="p-2.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:scale-105 transition-all text-[#00504d] dark:text-[#8ad3cf] shadow-sm hover:shadow cursor-pointer"
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={18} />
            </button>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'w-full rounded-[2.5rem] border border-white/60 dark:border-slate-800/80 bg-white/45 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] p-6 sm:p-8 flex flex-col relative overflow-hidden',
            isFisio && isRegister ? 'max-w-2xl gap-y-5' : 'max-w-[480px] gap-y-5'
          )}
        >
          {/* Internal ambient color spots */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-teal-500/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-cyan-500/10 blur-2xl" />

          {/* Registration Progress Indicator (Physio Multi-step) */}
          {isFisio && isRegister && (
            <div className="hidden md:flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
              <div>
                <span className="font-extrabold text-xl text-[#00504d] dark:text-[#8ad3cf]">
                  FisioMirror Profesional
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {t('auth.tagline')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00504d] dark:bg-[#8ad3cf] transition-all duration-500 ease-out"
                    style={{ width: fisioStep === 1 ? '50%' : '100%' }}
                  />
                </div>
                <span className="text-xs font-bold text-[#00504d] dark:text-[#8ad3cf] whitespace-nowrap">
                  Paso {fisioStep}/2
                </span>
              </div>
            </div>
          )}

          {/* Segmented Control / Role Selector */}
          {(!isFisio || !isRegister) && (
            <div className="relative bg-slate-200/50 dark:bg-slate-800/60 p-1 rounded-2xl flex items-center w-full shadow-inner">
              <motion.div
                className={cn(
                  'absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white dark:bg-slate-900 rounded-xl shadow-sm border transition-colors',
                  isPaciente
                    ? 'border-blue-500/30 shadow-blue-500/10'
                    : 'border-teal-600/30 shadow-teal-600/10'
                )}
                animate={{ left: isPaciente ? '4px' : 'calc(50% + 0px)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              />
              <button
                type="button"
                onClick={() => switchRole('paciente')}
                className={cn(
                  'relative flex-1 h-11 text-sm font-bold z-10 transition-colors flex items-center justify-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50',
                  isPaciente
                    ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon name="person" filled={isPaciente} size={18} />
                {t('roles.patient', 'Paciente')}
              </button>
              <button
                type="button"
                onClick={() => switchRole('fisioterapeuta')}
                className={cn(
                  'relative flex-1 h-11 text-sm font-bold z-10 transition-colors flex items-center justify-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50',
                  isFisio
                    ? 'text-[#00504d] dark:text-[#8ad3cf] font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon name="medical_services" filled={isFisio} size={18} />
                {t('roles.physiotherapist', 'Fisioterapeuta')}
              </button>
            </div>
          )}

          {/* Header Typography matching HTML document */}
          {(!isFisio || !isRegister) && (
            <div className="text-center space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                {greeting}
              </span>
              <h2 className="font-extrabold text-2xl sm:text-[26px] tracking-tight leading-tight">
                <AuroraText>{getHeaderTitle()}</AuroraText>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug px-1">
                {getHeaderSubtitle()}
              </p>
            </div>
          )}

          {/* Registration Header (Mobile Only for Fisio) */}
          {isFisio && isRegister && (
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="font-extrabold text-xl text-[#00504d] dark:text-[#8ad3cf]">
                  Registro Profesional
                </h2>
                <span className="px-2.5 py-1 bg-[#00504d]/10 dark:bg-teal-500/20 text-[#00504d] dark:text-[#8ad3cf] rounded-full text-xs font-bold">
                  Etapa {fisioStep}/2
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t('auth.completeProfessionalData')}</p>
            </div>
          )}

          {/* Form Flows */}
          <form onSubmit={handleSubmit} className="relative overflow-hidden min-h-[260px] space-y-4">
            <AnimatePresence mode="wait">
              {/* ─────────────────────────────────────────────────────────────
                  1. PACIENTE — INICIAR SESIÓN (EMAIL Y CONTRASEÑA)
                  ───────────────────────────────────────────────────────────── */}
              {isPaciente && mode === 'login' && (
                <motion.div
                  key="patient-login-flow"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 pt-1"
                >
                  <div className="space-y-3">
                    <div>
                      <div className="relative">
                        <Icon
                          name="alternate_email"
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          ref={emailRef}
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                          }}
                          placeholder={t('auth.email', 'Correo electrónico')}
                          aria-label={t('auth.ariaPatientEmail')}
                          autoComplete="email"
                          required
                          className={cn(
                            'w-full rounded-2xl border bg-white/80 dark:bg-slate-800/80 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-sm',
                            formErrors.email
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                              : 'border-slate-200/80 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20'
                          )}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium pl-1">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Icon
                          name="lock"
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                          }}
                          placeholder={t('auth.password', 'Contraseña')}
                          aria-label={t('auth.ariaPatientPass')}
                          autoComplete="current-password"
                          required
                          className={cn(
                            'w-full rounded-2xl border bg-white/80 dark:bg-slate-800/80 pl-11 pr-11 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-sm',
                            formErrors.password
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                              : 'border-slate-200/80 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                        >
                          <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={19} />
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium pl-1">
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end px-1">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="rounded px-1 -mx-1 text-xs font-semibold text-[#00504d] dark:text-[#8ad3cf] hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                    >
                      {t('auth.forgotPassword', '¿Olvidaste tu contraseña?')}
                    </button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={errorShake ? { x: [-8, 8, -6, 6, 0] } : { y: 0 }}
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-bold text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  <TurnstileWidget
                    ref={turnstileRef}
                    action="patient_login"
                    onVerify={(tok) => setTurnstileToken(tok)}
                    onExpire={() => setTurnstileToken(null)}
                  />

                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className="group relative w-full h-12 rounded-2xl bg-gradient-to-b from-[#00726c] to-[#003f3c] text-sm font-bold text-white shadow-lg shadow-teal-900/25 border border-teal-300/25 transition-all duration-300 hover:from-[#00837c] hover:to-[#004c48] hover:shadow-xl hover:shadow-teal-900/35 active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 dark:focus-visible:ring-offset-slate-900"
                  >
                    {loading ? (
                      <Spinner size={18} className="text-white" />
                    ) : cooldown > 0 ? (
                      `Espera ${cooldown}s`
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {t('auth.signIn', 'Iniciar Sesión')}
                        <Icon name="arrow_forward" size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                    <p>
                      {t('auth.hasCode', '¿Tienes un código de tu fisioterapeuta? ')}{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="rounded px-1 -mx-1 font-bold text-[#00504d] dark:text-[#8ad3cf] hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                      >
                        {t('auth.signUp', 'Crear Cuenta / Registrarse')}
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  2. PACIENTE — REGISTRO (TOKEN + EMAIL + CONTRASEÑA)
                  ───────────────────────────────────────────────────────────── */}
              {isPaciente && mode === 'register' && (
                <motion.div
                  key="patient-register-flow"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 pt-1"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 text-center">
                        {t('auth.accessCode')}
                      </label>
                      <PinInput
                        value={token}
                        onChange={(val) => {
                          setToken(val);
                          if (formErrors.token) setFormErrors((prev) => ({ ...prev, token: '' }));
                        }}
                        onComplete={(full) => {
                          setToken(full);
                          if (formErrors.token) setFormErrors((prev) => ({ ...prev, token: '' }));
                        }}
                        disabled={loading || cooldown > 0}
                        autoFocus
                      />
                      {formErrors.token && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium text-center">
                          {formErrors.token}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Icon
                          name="alternate_email"
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                          }}
                          placeholder={t('auth.phPersonalEmail')}
                          autoComplete="email"
                          required
                          className={cn(
                            'w-full rounded-2xl border bg-white/80 dark:bg-slate-800/80 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-sm',
                            formErrors.email
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                              : 'border-slate-200/80 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20'
                          )}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium pl-1">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Icon
                          name="lock"
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                          }}
                          placeholder={t('auth.phCreatePass')}
                          autoComplete="new-password"
                          required
                          className={cn(
                            'w-full rounded-2xl border bg-white/80 dark:bg-slate-800/80 pl-11 pr-11 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-sm',
                            formErrors.password
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                              : 'border-slate-200/80 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                        >
                          <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={19} />
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium pl-1">
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Icon
                          name="lock_reset"
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                          }}
                          placeholder={t('auth.phConfirmPass')}
                          autoComplete="new-password"
                          required
                          className={cn(
                            'w-full rounded-2xl border bg-white/80 dark:bg-slate-800/80 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-sm',
                            formErrors.confirmPassword || (confirmPassword && password !== confirmPassword)
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                              : 'border-slate-200/80 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400'
                          )}
                        />
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium pl-1">
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {password.length > 0 && (
                      <div className="flex items-center gap-2 px-1">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <motion.div
                            className={cn('h-full rounded-full', pwStrength.color)}
                            initial={{ width: 0 }}
                            animate={{ width: `${(pwStrength.score / 4) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {pwStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={errorShake ? { x: [-8, 8, -6, 6, 0] } : { y: 0 }}
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-bold text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  <TurnstileWidget
                    ref={turnstileRef}
                    action="patient_register"
                    onVerify={(tok) => setTurnstileToken(tok)}
                    onExpire={() => setTurnstileToken(null)}
                  />

                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className="w-full h-12 rounded-2xl bg-[#00504d] dark:bg-teal-600 text-sm font-bold text-white shadow-md shadow-teal-900/20 hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 dark:focus-visible:ring-offset-slate-900"
                  >
                    {loading ? (
                      <Spinner size={18} className="text-white" />
                    ) : (
                      <>
                        Crear Cuenta y Vincular Token
                        <Icon name="arrow_forward" size={18} />
                      </>
                    )}
                  </button>

                  <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span>{t('auth.alreadyLinked')}</span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
                    >
                      {t('auth.signIn')}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  3. FISIOTERAPEUTA — INICIAR SESIÓN (EMAIL Y CONTRASEÑA)
                  ───────────────────────────────────────────────────────────── */}
              {isFisio && mode === 'login' && (
                <motion.div
                  key="physio-login-flow"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 pt-1"
                >
                  <div className="space-y-3">
                    <div>
                      <div className="relative">
                        <Icon
                          name="alternate_email"
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          ref={emailRef}
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                          }}
                          placeholder={t('tr.correo_profesional')}
                          aria-label={t('auth.therapistEmail')}
                          autoComplete="email"
                          required
                          className={cn(
                            'w-full rounded-2xl border bg-white/80 dark:bg-slate-800/80 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-sm',
                            formErrors.email
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                              : 'border-slate-200/80 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20'
                          )}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium pl-1">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Icon
                          name="lock"
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                          }}
                          placeholder={t('auth.password')}
                          aria-label={t('auth.ariaFisioPass')}
                          autoComplete="current-password"
                          required
                          className={cn(
                            'w-full rounded-2xl border bg-white/80 dark:bg-slate-800/80 pl-11 pr-11 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-sm',
                            formErrors.password
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                              : 'border-slate-200/80 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                        >
                          <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={19} />
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium pl-1">
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end px-1">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="rounded px-1 -mx-1 text-xs font-semibold text-[#00504d] dark:text-[#8ad3cf] hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={errorShake ? { x: [-8, 8, -6, 6, 0] } : { y: 0 }}
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-bold text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  <TurnstileWidget
                    ref={turnstileRef}
                    action="physio_login"
                    onVerify={(tok) => setTurnstileToken(tok)}
                    onExpire={() => setTurnstileToken(null)}
                  />

                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className="w-full h-12 rounded-2xl bg-[#00504d] dark:bg-teal-600 text-sm font-bold text-white shadow-md shadow-teal-900/20 hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 dark:focus-visible:ring-offset-slate-900"
                  >
                    {loading ? (
                      <Spinner size={18} className="text-white" />
                    ) : (
                      <>
                        {t('auth.signIn')}
                        <Icon name="login" size={18} />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
                    <span>{t('auth.newPro')}</span>
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-bold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
                    >
                      Crear Cuenta Profesional
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  4. FISIOTERAPEUTA — REGISTRO PROFESIONAL COMPLETO
                  ───────────────────────────────────────────────────────────── */}
              {isFisio && isRegister && (
                <motion.div
                  key="physio-register-flow"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <AnimatePresence mode="wait">
                    {fisioStep === 1 ? (
                      <motion.div
                        key="fisio-step-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-3.5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nombre Completo <span className="text-red-500">*</span>
                            </label>
                            <input
                              value={fullName}
                              onChange={(e) => {
                                setFullName(e.target.value);
                                if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: '' }));
                              }}
                              placeholder={PLACEHOLDERS.fullName}
                              className={cn(
                                'w-full rounded-xl border bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors',
                                formErrors.fullName
                                  ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                                  : 'border-slate-200 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20'
                              )}
                            />
                            {formErrors.fullName && (
                              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                <Icon name="error" size={13} />
                                {formErrors.fullName}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Email Profesional <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                              }}
                              placeholder={PLACEHOLDERS.email}
                              className={cn(
                                'w-full rounded-xl border bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors',
                                formErrors.email
                                  ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                                  : 'border-slate-200 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20'
                              )}
                            />
                            {formErrors.email && (
                              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                <Icon name="error" size={13} />
                                {formErrors.email}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {t('auth.password')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                              }}
                              placeholder={PLACEHOLDERS.password}
                              className={cn(
                                'w-full rounded-xl border bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors',
                                formErrors.password
                                  ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                                  : 'border-slate-200 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20'
                              )}
                            />
                            {formErrors.password && (
                              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                <Icon name="error" size={13} />
                                {formErrors.password}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {t('auth.confirmPassword')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                              }}
                              placeholder={PLACEHOLDERS.confirmPassword}
                              className={cn(
                                'w-full rounded-xl border bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors',
                                formErrors.confirmPassword || (confirmPassword && password !== confirmPassword)
                                  ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                                  : 'border-slate-200 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20'
                              )}
                            />
                            {formErrors.confirmPassword && (
                              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                <Icon name="error" size={13} />
                                {formErrors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>

                        {password.length > 0 && (
                          <div className="flex items-center gap-2 px-1">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <motion.div
                                className={cn('h-full rounded-full', pwStrength.color)}
                                initial={{ width: 0 }}
                                animate={{ width: `${(pwStrength.score / 4) * 100}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              {pwStrength.label}
                            </span>
                          </div>
                        )}

                        <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-1" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {t('auth.idDoc')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              value={cedula}
                              onChange={(e) => {
                                setCedula(e.target.value);
                                if (formErrors.cedula) setFormErrors((prev) => ({ ...prev, cedula: '' }));
                              }}
                              placeholder={PLACEHOLDERS.cedula}
                              className={cn(
                                'w-full rounded-xl border bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors',
                                formErrors.cedula
                                  ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                                  : 'border-slate-200 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20'
                              )}
                            />
                            {formErrors.cedula && (
                              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                <Icon name="error" size={13} />
                                {formErrors.cedula}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {t('auth.phone')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              value={telefono}
                              onChange={(e) => {
                                setTelefono(e.target.value);
                                if (formErrors.telefono) setFormErrors((prev) => ({ ...prev, telefono: '' }));
                              }}
                              placeholder={PLACEHOLDERS.telefono}
                              inputMode="tel"
                              className={cn(
                                'w-full rounded-xl border bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors',
                                formErrors.telefono
                                  ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                                  : 'border-slate-200 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20'
                              )}
                            />
                            {formErrors.telefono && (
                              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                <Icon name="error" size={13} />
                                {formErrors.telefono}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('auth.graduationUniversity')}</label>
                            <input
                              value={universidad}
                              onChange={(e) => {
                                setUniversidad(e.target.value);
                                if (formErrors.universidad) setFormErrors((prev) => ({ ...prev, universidad: '' }));
                              }}
                              placeholder={PLACEHOLDERS.universidad}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                            {formErrors.universidad && (
                              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                <Icon name="error" size={13} />
                                {formErrors.universidad}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nº Colegiado (opcional)
                            </label>
                            <input
                              value={colegiadoId}
                              onChange={(e) => {
                                setColegiadoId(e.target.value);
                                if (formErrors.colegiadoId) setFormErrors((prev) => ({ ...prev, colegiadoId: '' }));
                              }}
                              placeholder={PLACEHOLDERS.colegiadoId}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                            {formErrors.colegiadoId && (
                              <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                <Icon name="error" size={13} />
                                {formErrors.colegiadoId}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {t('auth.gradYear')}
                            </label>
                            <select
                              value={anioEgreso}
                              onChange={(e) => setAnioEgreso(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 cursor-pointer"
                            >
                              <option value="">{t('auth.selectYear')}</option>
                              {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                              <option value="anterior">{t('tr.anterior_a_2015')}</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('auth.specialties')}
                          </label>
                          <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 min-h-[46px] items-center">
                            {especialidadesSel.map((esp) => (
                              <span
                                key={esp}
                                className="bg-[#00504d] text-white flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                {esp}
                                <button
                                  type="button"
                                  onClick={() => removeEspecialidad(esp)}
                                  className="hover:opacity-75"
                                >
                                  <Icon name="close" size={13} />
                                </button>
                              </span>
                            ))}
                            {especialidadesOpts.length > 0 && (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value && !especialidadesSel.includes(e.target.value)) {
                                    setEspecialidadesSel([...especialidadesSel, e.target.value]);
                                  }
                                }}
                                className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                              >
                                <option value="">{t('auth.addOption')}</option>
                                {especialidadesOpts
                                  .filter((o) => !especialidadesSel.includes(o))
                                  .map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                              </select>
                            )}
                            <input
                              value={especialidadInput}
                              onChange={(e) => setEspecialidadInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addEspecialidad();
                                }
                              }}
                              placeholder={t('tr.o_escribe_una')}
                              className="bg-transparent text-xs text-slate-900 dark:text-slate-100 flex-grow min-w-[100px] outline-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="fisio-step-2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{t('auth.uploadCredential')}</label>
                          <div
                            onClick={() => document.getElementById('credencial-file-input')?.click()}
                            className="border-2 border-dashed border-[#00504d]/30 dark:border-teal-500/30 rounded-2xl p-6 text-center cursor-pointer hover:border-[#00504d] dark:hover:border-teal-400 hover:bg-[#00504d]/5 transition-all"
                          >
                            {credencialPreview ? (
                              <div className="flex flex-col items-center gap-2">
                                {credencialFile?.type.startsWith('image/') ? (
                                  <img
                                    src={credencialPreview}
                                    alt={t('tr.vista_previa_credencial')}
                                    className="max-h-28 rounded-lg shadow-sm"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 text-[#00504d] dark:text-[#8ad3cf]">
                                    <Icon name="description" size={30} />
                                    <span className="text-xs font-bold">{credencialFile?.name}</span>
                                  </div>
                                )}
                                <span className="text-[11px] text-slate-600 dark:text-slate-400">{t('auth.clickToChangeFile')}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-[#00504d]/10 dark:bg-teal-500/20 flex items-center justify-center text-[#00504d] dark:text-[#8ad3cf]">
                                  <Icon name="upload_file" size={26} />
                                </div>
                                <span className="font-bold text-sm text-[#00504d] dark:text-[#8ad3cf]">
                                  {t('auth.profLicense')}
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  Arrastra o selecciona un archivo (PDF o Imagen)
                                </p>
                              </div>
                            )}
                            <input
                              id="credencial-file-input"
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleCredencialFile}
                              className="hidden"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200/60 dark:border-teal-800/40">
                          <Icon name="verified_user" filled size={20} className="text-[#00504d] dark:text-teal-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-[#00504d] dark:text-teal-200 leading-relaxed font-medium">
                            {t('auth.pendingValidation')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setFisioStep(1)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                          >
                            <Icon name="arrow_back" size={16} /> Volver
                          </button>

                          <button
                            type="button"
                            disabled={loading || uploading}
                            onClick={async () => {
                              setCredencialFile(null);
                              setCredencialPreview(null);
                              const ok = await signUpFisio(email, password, fullName, {
                                cedula,
                                universidad,
                                colegiadoId,
                                especialidades: especialidadesSel,
                                anioEgreso: anioEgreso || undefined,
                                telefono: telefono.trim(),
                              });
                              if (ok) {
                                setShowSuccess(true);
                                toast.success('Cuenta creada exitosamente');
                              }
                            }}
                            className="rounded px-1 -mx-1 text-xs font-semibold text-[#00504d] dark:text-[#8ad3cf] hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                          >
                            Omitir por ahora →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={errorShake ? { x: [-8, 8, -6, 6, 0] } : { y: 0 }}
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-bold text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  {fisioStep === 2 && (
                    <TurnstileWidget
                      ref={turnstileRef}
                      action="physio_register"
                      onVerify={(tok) => setTurnstileToken(tok)}
                      onExpire={() => setTurnstileToken(null)}
                    />
                  )}

                  <button
                    type="submit"
                    disabled={loading || uploading || cooldown > 0}
                    className="w-full h-12 rounded-2xl bg-[#00504d] dark:bg-teal-600 text-sm font-bold text-white shadow-md shadow-teal-900/20 hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 dark:focus-visible:ring-offset-slate-900"
                  >
                    {loading || uploading ? (
                      <Spinner size={18} className="text-white" />
                    ) : fisioStep === 1 ? (
                      <>
                        Continuar al Paso 2
                        <Icon name="arrow_forward" size={18} />
                      </>
                    ) : (
                      <>
                        Crear Cuenta y Finalizar
                        <Icon name="arrow_forward" size={18} />
                      </>
                    )}
                  </button>

                  <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span>{t('auth.hasAccount')}</span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
                    >
                      {t('auth.signIn')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Demo Fast Access Buttons */}
        <div className="w-full max-w-[480px] flex flex-col items-center gap-y-2 mt-5">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
            {t('auth.quickDemo')}
          </span>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={fillFisioDemo}
              className="h-11 px-4 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#00504d] dark:hover:text-[#8ad3cf] text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
            >
              <Icon name="medical_services" size={15} className="text-[#00504d] dark:text-teal-400" />
              Demo Fisio
            </button>
            <button
              onClick={fillPacienteDemo}
              className="h-11 px-4 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
            >
              <Icon name="person" size={15} className="text-blue-600 dark:text-blue-400" />{t('auth.demoPatient')}</button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT PANEL — INTERACTIVE IMAGE & AMBIENT EFFECTS
          (Pristine image illumination & character spotlight)
          ═══════════════════════════════════════════════════ */}
      <div className="relative hidden md:block md:w-[55%] lg:w-[58%] overflow-hidden bg-[#f9f9fc] dark:bg-slate-950">
        <motion.div className="relative h-full w-full" animate={imageControls}>
          {/* Subtle breathing & optical focus framing on active role */}
          <motion.div
            className="h-full w-full"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: breathingScale,
                    x: isPaciente ? -6 : 6,
                  }
            }
            transition={{
              scale: { duration: breathingDuration, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            <img
              src={LOGIN_BG_URL}
              alt={t('auth.altRehab')}
              className="h-full w-full object-cover object-center"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </motion.div>

          {/* Sparkles with role color (Blue for Paciente, Teal/Green for Fisio) */}
          <SparkleEffect active={true} color={isPaciente ? 'blue' : 'teal'} />

          {/* Interactive Character Spotlight & Illuminations */}
          <CharacterSpotlight
            activeRole={loginRole}
            phase={glowPhase}
            reduceMotion={reduceMotion}
            onSelectRole={switchRole}
          />

          {/* Floating Status Pill */}
          <AnimatePresence>
            {!loading && !error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-9 left-1/2 -translate-x-1/2 pointer-events-none z-20"
              >
                <div
                  className={cn(
                    'rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border px-6 py-2.5 shadow-xl transition-all duration-300 flex items-center gap-2.5',
                    isPaciente
                      ? 'border-blue-200/90 dark:border-blue-800/60 shadow-blue-500/10'
                      : 'border-teal-200/90 dark:border-teal-800/60 shadow-teal-500/10'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full animate-pulse',
                      isPaciente ? 'bg-blue-500' : 'bg-teal-500'
                    )}
                  />
                  <p
                    className={cn(
                      'text-xs font-bold tracking-wide',
                      isPaciente
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-[#00504d] dark:text-[#8ad3cf]'
                    )}
                  >
                    {statusMessage}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/60 backdrop-blur-md z-30"
              >
                <Spinner size={44} className="text-teal-400 animate-spin" />
                <p className="text-white font-bold text-lg tracking-wide">{t('auth.preparingSpace')}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Flash Overlay */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <div className="rounded-2xl bg-red-900/60 backdrop-blur-md px-8 py-4 border border-red-500/40 shadow-2xl">
                  <div className="flex items-center gap-3 text-red-200">
                    <Icon name="error" filled size={24} />
                    <span className="text-sm font-bold">{t('auth.checkCredentials')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PASSWORD RECOVERY MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/60 rounded-full flex items-center justify-center mx-auto mb-3 text-[#00504d] dark:text-teal-400">
                <Icon name="lock_reset" filled size={24} />
              </div>
              <h3 className="font-extrabold text-xl text-center text-[#00504d] dark:text-[#8ad3cf] mb-1">
                {t('auth.recoverPassword')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-5 leading-relaxed">{t('auth.resetDesc')}</p>

              <div className="relative mb-4">
                <Icon
                  name="alternate_email"
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder={t('auth.email')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                />
              </div>

              <div className="flex gap-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                >{t('tr.cancelar')}</button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="flex-1 h-11 rounded-xl bg-[#00504d] dark:bg-teal-600 text-white font-bold text-xs hover:bg-[#0c403d] dark:hover:bg-teal-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50"
                >
                  {resetLoading ? <Spinner size={16} className="text-white" /> : <Icon name="send" size={16} />}
                  {resetLoading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    navigate(`/reset-password?email=${encodeURIComponent(resetEmail.trim().toLowerCase())}`);
                  }}
                  className="text-xs text-primary dark:text-teal-400 hover:underline font-semibold"
                >
                  {t('auth.hasLinkReset')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          SUCCESS MODAL (FOR REGISTRATIONS)
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] text-center space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/60 rounded-full flex items-center justify-center mx-auto text-[#00504d] dark:text-teal-400 shadow-inner">
                <Icon name="check_circle" filled size={38} />
              </div>
              <h3 className="font-extrabold text-2xl text-[#00504d] dark:text-[#8ad3cf]">
                {t('auth.successTitle')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('auth.successBody')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowSuccess(false);
                  setMode('login');
                  setFisioStep(1);
                }}
                className="w-full h-12 bg-[#00504d] dark:bg-teal-600 text-white rounded-2xl font-bold text-sm hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-95 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
              >
                {t('auth.goToLogin')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
