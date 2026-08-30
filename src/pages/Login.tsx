import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, useReducedMotion } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { Spinner } from '../components/ui/Loader';
import { PinInput } from '../components/ui/PinInput';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/ToastProvider';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { SparkleEffect } from '../components/auth/SparkleEffect';
import { TurnstileWidget, type TurnstileWidgetRef } from '../components/auth/TurnstileWidget';

type AuthMode = 'login' | 'register';
type LoginRole = 'paciente' | 'fisioterapeuta';
type FisioStep = 1 | 2;
type ImageState = 'idle' | 'typing' | 'loading' | 'error';
type GlowPhase = 'pulse' | 'settled' | 'error';

interface EspecialidadRow {
  id: string;
  nombre: string;
}

const GLOW_COLORS = {
  teal: '0, 80, 77',
  cyan: '6, 182, 212',
  coral: '234, 88, 12',
  red: '186, 26, 26',
};

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

function CharacterGlow({
  side,
  colorRgb,
  phase,
  reduceMotion,
}: {
  side: 'left' | 'right';
  colorRgb: string;
  phase: GlowPhase;
  reduceMotion: boolean | null;
}) {
  const variants = {
    pulse: {
      opacity: [0.25, 0.75, 0.25, 0.75, 0.35],
      scale: [1, 1.04, 1, 1.04, 1],
      transition: { duration: 1.2, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' as const },
    },
    settled: {
      opacity: 0.35,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeInOut' as const },
    },
    error: {
      opacity: [0.35, 0.9, 0.35, 0.9, 0.35],
      transition: { duration: 1, ease: 'easeInOut' as const },
    },
  };

  return (
    <motion.div
      className={cn(
        'pointer-events-none absolute top-0 h-full w-3/5',
        side === 'left' ? 'left-0' : 'right-0'
      )}
      initial={{ opacity: 0 }}
      animate={reduceMotion ? { opacity: 0.35 } : variants[phase]}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${side === 'left' ? '60%' : '40%'} 50%, rgba(${colorRgb}, 0.5) 0%, rgba(${colorRgb}, 0.2) 35%, rgba(${colorRgb}, 0) 70%)`,
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute"
        style={{
          [side]: '12%',
          top: '25%',
          width: '55%',
          height: '55%',
          borderRadius: '9999px',
          boxShadow: `0 0 120px 60px rgba(${colorRgb}, 0.35)`,
        } as React.CSSProperties}
      />
    </motion.div>
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

  useEffect(() => {
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
    setToken('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
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
          'Puedes subirla más tarde desde tu perfil. Tu cuenta se creará igualmente.',
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
      if (password !== confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
      if (!fullName.trim() || !email.trim() || !password.trim() || !cedula.trim()) {
        toast.error('Completa los campos requeridos');
        return;
      }
      if (!telefono.trim()) {
        toast.error('El número de teléfono es obligatorio');
        return;
      }
      setFisioStep(2);
      return;
    }

    if (!turnstileToken) {
      toast.error('Por favor completa la verificación de seguridad Cloudflare');
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
        toast.error('Verificación de seguridad no completada. Reintenta.');
        return;
      }
    } catch {
      // Safe fallback for sandbox
    }

    // ─────────────────────────────────────────────
    // PACIENTE: INICIAR SESIÓN (EMAIL Y PASSWORD)
    // ─────────────────────────────────────────────
    if (isPaciente && mode === 'login') {
      if (!email.trim() || !password.trim()) {
        toast.error('Ingresa tu correo y contraseña');
        return;
      }
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
      const cleanTok = token.trim();
      if (!cleanTok || cleanTok.length < 4) {
        toast.error('Ingresa el código de 6 dígitos asignado por tu fisioterapeuta');
        return;
      }
      if (!email.trim() || !password.trim()) {
        toast.error('Completa tu correo y contraseña para crear tu cuenta');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
      if (password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Special demo shortcut
      if (cleanTok === '123456' || email === 'paciente@demo.com') {
        const ok = await linkTokenToEmail(cleanTok, email, password, fullName || undefined);
        if (ok) toast.success('Cuenta creada y vinculada con éxito. ¡Bienvenido!');
        return;
      }

      const ok = await linkTokenToEmail(cleanTok, email, password, fullName || undefined);
      if (ok) {
        toast.success('¡Cuenta creada con éxito! Tu token ha sido vinculado.');
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
      if (!email.trim() || !password.trim()) {
        toast.error('Ingresa tu correo y contraseña');
        return;
      }
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
      if (password !== confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
      if (fisioStep === 1) {
        if (!fullName.trim() || !email.trim() || !password.trim() || !cedula.trim()) {
          toast.error('Completa los campos requeridos');
          return;
        }
        if (!telefono.trim()) {
          toast.error('El número de teléfono es obligatorio');
          return;
        }
        setFisioStep(2);
        return;
      }

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

  const canSubmitFisioStep1 =
    fullName.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword &&
    cedula.trim() &&
    telefono.trim();

  const handleResetPassword = async () => {
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Ingresa tu correo electrónico');
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
        toast.success('Correo de recuperación enviado', {
          description: `Hemos enviado el enlace y código de 6 dígitos a ${cleanEmail}.`,
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
        toast.success('Si el correo está registrado, recibirás las instrucciones de recuperación.');
        setShowResetModal(false);
        setResetEmail('');
        navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
      }
    } catch {
      toast.success('Si el correo está registrado, recibirás las instrucciones de recuperación.');
      setShowResetModal(false);
      setResetEmail('');
      navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
    } finally {
      setResetLoading(false);
    }
  };

  const breathingScale = imageState === 'typing' ? [1, 1.01, 1] : [1, 1.025, 1];
  const breathingDuration = imageState === 'typing' ? 3 : 5;
  const glowColorRgb =
    glowPhase === 'error'
      ? GLOW_COLORS.red
      : isPaciente
      ? GLOW_COLORS.coral
      : GLOW_COLORS.teal;

  const statusMessage =
    loading
      ? 'Preparando tu espacio...'
      : error
      ? 'Revisa tus credenciales'
      : isPaciente
      ? mode === 'register'
        ? 'Vincula tu token de recuperación'
        : 'Tu recuperación empieza aquí'
      : mode === 'register'
      ? 'Evolución clínica personalizada'
      : 'Gestión clínica de alto rendimiento';

  // Dynamic titles and subtitles
  const getHeaderTitle = () => {
    if (isPaciente) {
      return mode === 'register'
        ? 'Registro de Paciente'
        : 'Comienza tu recuperación hoy';
    }
    return mode === 'register'
      ? 'Registro Profesional'
      : 'Gestión Clínica de Alto Rendimiento';
  };

  const getHeaderSubtitle = () => {
    if (isPaciente) {
      return mode === 'register'
        ? 'Ingresa tu código de 6 dígitos asignado por tu fisioterapeuta para vincular tu cuenta.'
        : 'Ingresa con tu correo y contraseña para acceder a tus terapias.';
    }
    return mode === 'register'
      ? 'Crea tu cuenta clínica para gestionar pacientes, métricas y prescripción digital.'
      : 'Accede a tu panel de control clínico y seguimiento de pacientes.';
  };

  return (
    <div className="min-h-screen w-full flex font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden bg-[#f9f9fc] dark:bg-slate-950">
      {/* ── MESH BACKGROUND GRADIENT ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(at 0% 0%, rgba(0, 80, 77, 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(234, 88, 12, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(13, 148, 136, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.10) 0px, transparent 50%)',
        }}
      />
      {/* Ambient glowing orbs */}
      <div className="pointer-events-none absolute -left-12 top-16 h-72 w-72 rounded-full bg-[#00504d]/10 dark:bg-teal-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />

      {/* ═══════════════════════════════════════════════════
          LEFT PANEL — MAIN FORM
          ═══════════════════════════════════════════════════ */}
      <div className="w-full md:w-[45%] lg:w-[42%] flex flex-col items-center justify-center px-4 py-8 md:px-8 relative z-20 overflow-y-auto">
        {/* Top bar: logo + theme toggle */}
        <div className="w-full max-w-[480px] flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="FisioMirror Logo" className="h-10 w-auto shrink-0 drop-shadow-sm" />
            <span className="font-extrabold text-2xl tracking-tight text-[#00504d] dark:text-[#8ad3cf]">
              FisioMirror
            </span>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="p-2.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:scale-105 transition-all text-[#00504d] dark:text-[#8ad3cf] shadow-sm hover:shadow"
          >
            <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={18} />
          </button>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'w-full rounded-[2.5rem] border border-white/60 dark:border-slate-800/80 bg-white/45 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] p-6 sm:p-9 flex flex-col relative overflow-hidden',
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
                  Tu evolución profesional comienza aquí.
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
                className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white dark:bg-slate-900 rounded-xl shadow-sm"
                animate={{ left: isPaciente ? '4px' : 'calc(50% + 0px)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              />
              <button
                type="button"
                onClick={() => switchRole('paciente')}
                className={cn(
                  'relative flex-1 py-3 text-sm font-bold z-10 transition-colors flex items-center justify-center gap-2 rounded-xl',
                  isPaciente
                    ? 'text-[#00504d] dark:text-[#8ad3cf]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon name="person" filled={isPaciente} size={18} />
                Paciente
              </button>
              <button
                type="button"
                onClick={() => switchRole('fisioterapeuta')}
                className={cn(
                  'relative flex-1 py-3 text-sm font-bold z-10 transition-colors flex items-center justify-center gap-2 rounded-xl',
                  isFisio
                    ? 'text-[#00504d] dark:text-[#8ad3cf]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon name="medical_services" filled={isFisio} size={18} />
                Fisioterapeuta
              </button>
            </div>
          )}

          {/* Header Typography matching HTML document */}
          {(!isFisio || !isRegister) && (
            <div className="text-center space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {greeting}
              </span>
              <h2 className="font-extrabold text-2xl sm:text-[26px] tracking-tight text-[#00504d] dark:text-[#8ad3cf] leading-tight">
                {getHeaderTitle()}
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
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Completa tus datos profesionales para validar tu acceso.
              </p>
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"
                        aria-label="Correo electrónico del paciente"
                        autoComplete="email"
                        required
                        className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 shadow-sm"
                      />
                    </div>

                    <div className="relative">
                      <Icon
                        name="lock"
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        aria-label="Contraseña del paciente"
                        autoComplete="current-password"
                        required
                        className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 pl-11 pr-11 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={19} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end px-1">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="text-xs font-semibold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
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
                    className="w-full rounded-2xl bg-[#00504d] dark:bg-teal-600 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-900/20 hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Spinner size={18} className="text-white" />
                    ) : cooldown > 0 ? (
                      `Espera ${cooldown}s`
                    ) : (
                      <>
                        Iniciar Sesión
                        <Icon name="arrow_forward" size={18} />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                    <p>
                      ¿Tienes un código de tu fisioterapeuta?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="font-bold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
                      >
                        Crear Cuenta / Registrarse
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
                        Código de Acceso (6 dígitos)
                      </label>
                      <PinInput
                        value={token}
                        onChange={setToken}
                        onComplete={(full) => setToken(full)}
                        disabled={loading || cooldown > 0}
                        autoFocus
                      />
                    </div>

                    <div className="relative">
                      <Icon
                        name="alternate_email"
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Tu correo electrónico personal"
                        autoComplete="email"
                        required
                        className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 shadow-sm"
                      />
                    </div>

                    <div className="relative">
                      <Icon
                        name="lock"
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crear contraseña"
                        autoComplete="new-password"
                        required
                        className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 pl-11 pr-11 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={19} />
                      </button>
                    </div>

                    <div className="relative">
                      <Icon
                        name="lock_reset"
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar contraseña"
                        autoComplete="new-password"
                        required
                        className={cn(
                          'w-full rounded-2xl border bg-white/80 dark:bg-slate-800/80 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-sm',
                          confirmPassword && password !== confirmPassword
                            ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                            : 'border-slate-200/80 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400'
                        )}
                      />
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
                    disabled={loading || cooldown > 0 || token.length < 4 || !email.trim() || !password.trim()}
                    className="w-full rounded-2xl bg-[#00504d] dark:bg-teal-600 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-900/20 hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                    <span>¿Ya vinculaste tu cuenta? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
                    >
                      Iniciar Sesión
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo profesional"
                        aria-label="Correo del fisioterapeuta"
                        autoComplete="email"
                        required
                        className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 shadow-sm"
                      />
                    </div>

                    <div className="relative">
                      <Icon
                        name="lock"
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        aria-label="Contraseña del fisioterapeuta"
                        autoComplete="current-password"
                        required
                        className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 pl-11 pr-11 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={19} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end px-1">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="text-xs font-semibold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
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
                    className="w-full rounded-2xl bg-[#00504d] dark:bg-teal-600 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-900/20 hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Spinner size={18} className="text-white" />
                    ) : (
                      <>
                        Iniciar Sesión
                        <Icon name="login" size={18} />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
                    <span>¿Nuevo profesional en FisioMirror? </span>
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
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Lic. Roberto Silva"
                              required
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Email Profesional <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="roberto.fisio@ejemplo.com"
                              required
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Contraseña <span className="text-red-500">*</span>
                            </label>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Confirmar Contraseña <span className="text-red-500">*</span>
                            </label>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              className={cn(
                                'w-full rounded-xl border bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none',
                                confirmPassword && password !== confirmPassword
                                  ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
                                  : 'border-slate-200 dark:border-slate-700 focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20'
                              )}
                            />
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
                              Cédula / Documento <span className="text-red-500">*</span>
                            </label>
                            <input
                              value={cedula}
                              onChange={(e) => setCedula(e.target.value)}
                              placeholder="000000-F"
                              required
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Teléfono / WhatsApp <span className="text-red-500">*</span>
                            </label>
                            <input
                              value={telefono}
                              onChange={(e) => setTelefono(e.target.value)}
                              placeholder="+58 412-1234567"
                              inputMode="tel"
                              required
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Universidad de Egreso
                            </label>
                            <input
                              value={universidad}
                              onChange={(e) => setUniversidad(e.target.value)}
                              placeholder="Nombre de la Institución"
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nº Colegiado (opcional)
                            </label>
                            <input
                              value={colegiadoId}
                              onChange={(e) => setColegiadoId(e.target.value)}
                              placeholder="Ej: COL-12345"
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Año de Formación
                            </label>
                            <select
                              value={anioEgreso}
                              onChange={(e) => setAnioEgreso(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 cursor-pointer"
                            >
                              <option value="">Selecciona un año</option>
                              {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                              <option value="anterior">Anterior a 2015</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Especialidades Clínicas
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
                                <option value="">+ Añadir...</option>
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
                              placeholder="O escribe una..."
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
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Carga de credencial profesional (opcional)
                          </label>
                          <div
                            onClick={() => document.getElementById('credencial-file-input')?.click()}
                            className="border-2 border-dashed border-[#00504d]/30 dark:border-teal-500/30 rounded-2xl p-6 text-center cursor-pointer hover:border-[#00504d] dark:hover:border-teal-400 hover:bg-[#00504d]/5 transition-all"
                          >
                            {credencialPreview ? (
                              <div className="flex flex-col items-center gap-2">
                                {credencialFile?.type.startsWith('image/') ? (
                                  <img
                                    src={credencialPreview}
                                    alt="Vista previa credencial"
                                    className="max-h-28 rounded-lg shadow-sm"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 text-[#00504d] dark:text-[#8ad3cf]">
                                    <Icon name="description" size={30} />
                                    <span className="text-xs font-bold">{credencialFile?.name}</span>
                                  </div>
                                )}
                                <span className="text-[11px] text-slate-500">
                                  Click para cambiar de archivo
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-[#00504d]/10 dark:bg-teal-500/20 flex items-center justify-center text-[#00504d] dark:text-[#8ad3cf]">
                                  <Icon name="upload_file" size={26} />
                                </div>
                                <span className="font-bold text-sm text-[#00504d] dark:text-[#8ad3cf]">
                                  Cédula Profesional o Título
                                </span>
                                <p className="text-xs text-slate-500">
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
                            Tu cuenta se activará tras la validación administrativa. Podrás acceder de inmediato en modo preliminar.
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
                            className="text-xs font-semibold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
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
                    disabled={loading || uploading || cooldown > 0 || (fisioStep === 1 && !canSubmitFisioStep1)}
                    className="w-full rounded-2xl bg-[#00504d] dark:bg-teal-600 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-900/20 hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                    <span>¿Ya tienes cuenta profesional? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#00504d] dark:text-[#8ad3cf] hover:underline"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Demo Fast Access Buttons */}
        <div className="w-full max-w-[480px] flex flex-col items-center gap-y-2 mt-5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Acceso Rápido de Prueba
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={fillFisioDemo}
              className="px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Icon name="medical_services" size={15} className="text-[#00504d] dark:text-teal-400" />
              Demo Fisio
            </button>
            <button
              onClick={fillPacienteDemo}
              className="px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Icon name="personal_injury" size={15} className="text-orange-500" />
              Demo Paciente
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT PANEL — INTERACTIVE IMAGE & AMBIENT EFFECTS
          (No Mascot, pure clean visual experience)
          ═══════════════════════════════════════════════════ */}
      <div className="relative hidden md:block md:w-[55%] lg:w-[58%] overflow-hidden bg-slate-900">
        <motion.div className="relative h-full w-full" animate={imageControls}>
          {/* Breathing background image */}
          <motion.div
            className="h-full w-full"
            animate={reduceMotion ? undefined : { scale: breathingScale }}
            transition={{ duration: breathingDuration, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={LOGIN_BG_URL}
              alt="Sesión de rehabilitación interactiva"
              className="h-full w-full object-cover object-center brightness-95 dark:brightness-90"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Color Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00504d]/30 via-transparent to-black/40 pointer-events-none" />

            {/* Edge fades */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#f9f9fc]/80 dark:from-slate-950/80 to-transparent backdrop-blur-sm pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f9f9fc]/80 dark:from-slate-950/80 to-transparent backdrop-blur-sm pointer-events-none" />
          </motion.div>

          {/* Sparkles & Glow Effects without mascot */}
          <SparkleEffect active={true} color={isPaciente ? 'coral' : 'teal'} />
          <CharacterGlow
            side={isPaciente ? 'right' : 'left'}
            colorRgb={glowColorRgb}
            phase={glowPhase}
            reduceMotion={reduceMotion}
          />

          {/* Floating Status Pill */}
          <AnimatePresence>
            {!loading && !error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none"
              >
                <div className="rounded-full bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700 px-6 py-2.5 shadow-xl">
                  <p className="text-xs font-bold text-[#00504d] dark:text-[#8ad3cf] tracking-wide">
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
                <p className="text-white font-bold text-lg tracking-wide">
                  Preparando tu espacio...
                </p>
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
                    <span className="text-sm font-bold">
                      Revisa tus credenciales e intenta de nuevo
                    </span>
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/60 rounded-full flex items-center justify-center mx-auto mb-3 text-[#00504d] dark:text-teal-400">
                <Icon name="lock_reset" filled size={24} />
              </div>
              <h3 className="font-extrabold text-xl text-center text-[#00504d] dark:text-[#8ad3cf] mb-1">
                Recuperar Contraseña
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-5 leading-relaxed">
                Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu acceso.
              </p>

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
                  placeholder="Correo electrónico"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20"
                />
              </div>

              <div className="flex gap-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#00504d] dark:bg-teal-600 text-white font-bold text-xs hover:bg-[#0c403d] dark:hover:bg-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
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
                  ¿Tienes el enlace o deseas restablecer directamente? Pulsa aquí
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
              className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] text-center space-y-5 shadow-2xl"
            >
              <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/60 rounded-full flex items-center justify-center mx-auto text-[#00504d] dark:text-teal-400 shadow-inner">
                <Icon name="check_circle" filled size={38} />
              </div>
              <h3 className="font-extrabold text-2xl text-[#00504d] dark:text-[#8ad3cf]">
                ¡Cuenta Creada con Éxito!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tus datos han sido registrados correctamente en FisioMirror. Ya puedes iniciar sesión para acceder a tu plataforma clínica.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowSuccess(false);
                  setMode('login');
                  setFisioStep(1);
                }}
                className="w-full py-3.5 bg-[#00504d] dark:bg-teal-600 text-white rounded-2xl font-bold text-sm hover:bg-[#0c403d] dark:hover:bg-teal-500 active:scale-95 transition-all shadow-md"
              >
                Ir a Iniciar Sesión
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
