import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, HeartHandshake, User, ArrowRight } from 'lucide-react';
import { ComingSoonModal } from './ui/ComingSoonModal';
import { PinInput } from './ui/PinInput';
import { SparkleEffect } from './auth/SparkleEffect';

type Role = 'paciente' | 'fisioterapeuta';
type Mode = 'login' | 'register';
type FormState = 'idle' | 'typing' | 'loading' | 'error' | 'success';
type GlowPhase = 'pulse' | 'settled' | 'error';

interface InteractiveLoginProps {
  onLogin: (role: Role, emailOrToken: string, password?: string) => Promise<void>;
  onLoginSuccess?: () => void;
  errorMessage?: string;
}

const COLORS = {
  teal: '0, 80, 77',
  cyan: '6, 182, 212',
  coral: '234, 88, 12',
  red: '239, 68, 68',
};

function CharacterGlow({
  side,
  colorRgb,
  phase,
}: {
  side: 'left' | 'right';
  colorRgb: string;
  phase: GlowPhase;
}) {
  const variants = {
    pulse: {
      opacity: [0.25, 0.75, 0.25, 0.75, 0.35],
      transition: { duration: 1, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' as const },
    },
    settled: {
      opacity: 0.35,
      transition: { duration: 0.5, ease: 'easeInOut' as const },
    },
    error: {
      opacity: [0.35, 0.9, 0.35, 0.9, 0.35],
      transition: { duration: 1, ease: 'easeInOut' as const },
    },
  };

  return (
    <motion.div
      className={`pointer-events-none absolute top-0 h-full w-1/2 ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
      initial={{ opacity: 0 }}
      animate={variants[phase]}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${
            side === 'left' ? '65%' : '35%'
          } 55%, rgba(${colorRgb}, 0.55) 0%, rgba(${colorRgb}, 0.25) 35%, rgba(${colorRgb}, 0) 70%)`,
          filter: 'blur(32px)',
        }}
      />
      <div
        className="absolute"
        style={{
          [side]: '8%',
          top: '30%',
          width: '55%',
          height: '55%',
          borderRadius: '9999px',
          boxShadow: `0 0 80px 40px rgba(${colorRgb}, 0.35)`,
        } as React.CSSProperties}
      />
    </motion.div>
  );
}

export default function InteractiveLogin({
  onLogin,
  onLoginSuccess,
  errorMessage,
}: InteractiveLoginProps) {
  const [role, setRole] = useState<Role>('paciente');
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [glowPhase, setGlowPhase] = useState<GlowPhase>('pulse');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const imageControls = useAnimation();
  const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelectRole = (nextRole: Role) => {
    setRole(nextRole);
    setFormState('idle');
    setGlowPhase('pulse');
    if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
    glowTimeoutRef.current = setTimeout(() => setGlowPhase('settled'), 1000);
  };

  useEffect(() => {
    if (!errorMessage) return;

    setFormState('error');
    setGlowPhase('error');

    void imageControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    });

    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      setGlowPhase('settled');
      setFormState('idle');
    }, 1000);

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [errorMessage, imageControls]);

  useEffect(() => {
    return () => {
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const markTyping = () => {
    if (formState === 'idle' || formState === 'typing') {
      setFormState('typing');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    markTyping();
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    markTyping();
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    markTyping();
  };

  const handleTokenChange = (digits: string) => {
    setToken(digits);
    markTyping();
  };

  const isFormValid =
    mode === 'login'
      ? email.trim().length > 0 && password.trim().length > 0
      : role === 'paciente'
      ? token.length >= 4 && email.trim().length > 0 && password.trim().length >= 6 && password === confirmPassword
      : email.trim().length > 0 && password.trim().length >= 6 && password === confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role || !isFormValid || formState === 'loading') return;

    setFormState('loading');
    try {
      if (mode === 'register' && role === 'paciente') {
        await onLogin(role, token, password);
      } else {
        await onLogin(role, email, password);
      }
      setFormState('success');
      setGlowPhase('settled');
      onLoginSuccess?.();
    } catch {
      setFormState('idle');
    }
  };

  const breathingAnimation =
    formState === 'typing'
      ? { scale: [1, 1.01, 1] }
      : { scale: [1, 1.02, 1] };
  const breathingDuration = formState === 'typing' ? 3 : 5;
  const isLoading = formState === 'loading';

  const glowColorRgb =
    glowPhase === 'error'
      ? COLORS.red
      : role === 'fisioterapeuta'
      ? COLORS.teal
      : COLORS.coral;

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] font-sans">
      {/* ── LEFT PANEL — FORM ── */}
      <div className="relative flex w-full items-center justify-center px-6 py-12 md:w-2/5">
        {/* Mesh gradient background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(at 0% 0%, rgba(0,80,77,0.10) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(6,182,212,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(234,88,12,0.06) 0px, transparent 60%)',
          }}
        />
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[#00504d]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-32 w-32 rounded-full bg-[#06B6D4]/15 blur-3xl" />

        <div className="relative w-full max-w-[480px]">
          <div className="rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:p-10">
            {/* Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-2 flex items-center gap-2.5">
                <img src="/logo.png" alt="FisioMirror" className="h-12 w-auto shrink-0" />
                <h1 className="font-extrabold text-3xl tracking-tight text-[#00504d]">
                  FisioMirror
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Seleccioná tu rol para comenzar
              </p>
            </div>

            {/* Segmented control with sliding indicator */}
            <div className="relative mb-6 flex items-center rounded-2xl bg-slate-200/50 p-1.5 shadow-inner">
              <motion.div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-white shadow-md"
                animate={{ left: role === 'fisioterapeuta' ? 'calc(50% + 0px)' : '6px' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              />
              <button
                type="button"
                onClick={() => handleSelectRole('paciente')}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
                  role === 'paciente' ? 'text-[#00504d]' : 'text-slate-600'
                }`}
              >
                <User className="h-4 w-4" />
                Paciente
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('fisioterapeuta')}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
                  role === 'fisioterapeuta' ? 'text-[#00504d]' : 'text-slate-600'
                }`}
              >
                <HeartHandshake className="h-4 w-4" />
                Fisioterapeuta
              </button>
            </div>

            {/* Role Title in Montserrat font-extrabold and green/teal text */}
            <div className="mb-5 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#00504d]">
                {role === 'paciente'
                  ? mode === 'register'
                    ? 'Registro de Paciente'
                    : 'Comienza tu recuperación hoy'
                  : mode === 'register'
                  ? 'Registro Profesional'
                  : 'Gestión Clínica de Alto Rendimiento'}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                {role === 'paciente'
                  ? mode === 'register'
                    ? 'Ingresa tu código de acceso para vincularlo a tu nueva cuenta.'
                    : 'Ingresa con tu correo y contraseña para acceder a tus terapias.'
                  : mode === 'register'
                  ? 'Crea tu cuenta clínica para gestionar pacientes.'
                  : 'Accede a tu panel de control clínico.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient Register: Token PinInput */}
              {role === 'paciente' && mode === 'register' && (
                <div>
                  <label className="mb-2 block text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Código de acceso (6 dígitos)
                  </label>
                  <PinInput
                    value={token}
                    onChange={handleTokenChange}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={role === 'fisioterapeuta' ? 'Correo profesional' : 'Correo electrónico'}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-shadow focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 shadow-sm"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder={mode === 'register' ? 'Crear contraseña' : 'Contraseña'}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition-shadow focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Confirm Password (Registration mode) */}
              {mode === 'register' && (
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirmar contraseña"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition-shadow focus:border-[#00504d] focus:ring-2 focus:ring-[#00504d]/20 shadow-sm"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-[#00504d] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <AnimatePresence>
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-600 border border-red-200"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={!isFormValid || isLoading}
                whileTap={isFormValid && !isLoading ? { scale: 0.97 } : undefined}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all shadow-md ${
                  isFormValid && !isLoading
                    ? 'bg-[#00504d] shadow-teal-900/20 hover:bg-[#0c403d]'
                    : 'cursor-not-allowed bg-slate-300'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : mode === 'register' ? (
                  <>
                    Crear Cuenta <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Iniciar Sesión <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

              <div className="pt-2 text-center text-xs text-slate-600">
                {mode === 'login' ? (
                  <p>
                    {role === 'paciente'
                      ? '¿Tienes un código de tu fisioterapeuta? '
                      : '¿Nuevo en FisioMirror? '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-bold text-[#00504d] hover:underline"
                    >
                      {role === 'paciente' ? 'Registrarse / Vincular Token' : 'Crear Cuenta'}
                    </button>
                  </p>
                ) : (
                  <p>
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-bold text-[#00504d] hover:underline"
                    >
                      Iniciar Sesión
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — IMAGE & AMBIENT EFFECTS (NO MASCOT) ── */}
      <div className="relative hidden overflow-hidden bg-slate-900 md:flex md:w-3/5 md:items-center md:justify-center">
        <motion.div
          className="relative flex h-full w-full items-center justify-center"
          animate={imageControls}
        >
          <motion.div
            className="h-full w-full"
            animate={breathingAnimation}
            transition={{
              duration: breathingDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img
              src="/login.png"
              alt="Rehabilitación interactiva"
              className="h-full w-full object-cover object-center brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00504d]/30 via-transparent to-black/40 pointer-events-none" />
          </motion.div>

          <SparkleEffect active={true} color={role === 'paciente' ? 'coral' : 'teal'} />
          <CharacterGlow
            side={role === 'fisioterapeuta' ? 'left' : 'right'}
            colorRgb={glowColorRgb}
            phase={glowPhase}
          />

          {/* Floating Pill */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none">
            <span className="rounded-full bg-white/80 px-6 py-2.5 text-xs font-bold text-[#00504d] shadow-xl backdrop-blur-md border border-white/50">
              {role === 'paciente' ? 'Tu recuperación empieza aquí' : 'Gestión clínica de alto rendimiento'}
            </span>
          </div>

          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/60 backdrop-blur-sm z-30"
              >
                <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
                <p className="font-bold text-sm text-white">
                  Preparando tu espacio...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <ComingSoonModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Recuperación de Contraseña"
        description="Si olvidaste tu contraseña, te enviaremos las instrucciones de recuperación por correo."
      />
    </div>
  );
}
