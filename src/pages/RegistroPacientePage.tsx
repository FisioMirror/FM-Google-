import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  KeyRound,
  UserCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/ToastProvider';
import { TurnstileWidget, type TurnstileWidgetRef } from '../components/auth/TurnstileWidget';

export function RegistroPacientePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { signUpPaciente, loading } = useAuthStore();

  const queryToken = searchParams.get('token') || '';

  const [token, setToken] = useState(queryToken.toUpperCase());
  const [tokenValidating, setTokenValidating] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Patient and Therapist Data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [diagnostico, setDiagnostico] = useState('');
  const [therapistName, setTherapistName] = useState('');
  const [therapistEmail, setTherapistEmail] = useState('');

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  // Validate Token against Supabase activation_tokens table
  const validateToken = useCallback(async (tokenToTest: string) => {
    const clean = tokenToTest.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setTokenError('El código debe contener al menos 4 caracteres');
      return;
    }

    setTokenValidating(true);
    setTokenError(null);

    try {
      // 1. Query activation token
      const { data: tokenData, error: tokErr } = await supabase
        .from('activation_tokens')
        .select('*')
        .eq('token', clean)
        .maybeSingle();

      if (tokErr) throw tokErr;

      if (!tokenData) {
        // Check demo fallback
        if (clean === 'DEMO12' || clean === 'PAC123' || clean === '123456') {
          setTokenValidated(true);
          setFullName('Carlos Mendoza');
          setEmail('carlos.mendoza@paciente.fisiomirror.app');
          setDiagnostico('Rehabilitación de hombro manguito rotador');
          setTherapistName('Dra. Elena Ramos');
          toast.success('Token de prueba validado correctamente');
          return;
        }
        setTokenError('El código de acceso no existe o es inválido');
        setTokenValidated(false);
        return;
      }

      if (tokenData.used) {
        setTokenError('Este código de acceso ya fue utilizado anteriormente');
        setTokenValidated(false);
        return;
      }

      // If token has an associated patient or therapist
      if (tokenData.paciente_id) {
        const { data: pProfile } = await supabase
          .from('profiles')
          .select('full_name, email, diagnostico, patologia')
          .eq('id', tokenData.paciente_id)
          .maybeSingle();

        if (pProfile) {
          if (pProfile.full_name) setFullName(pProfile.full_name);
          if (pProfile.email && !pProfile.email.includes('@fisiomirror.paciente')) {
            setEmail(pProfile.email);
          }
          if (pProfile.diagnostico || pProfile.patologia) {
            setDiagnostico(pProfile.diagnostico || pProfile.patologia);
          }
        }
      }

      if (tokenData.terapeuta_id) {
        const { data: tProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', tokenData.terapeuta_id)
          .maybeSingle();

        if (tProfile) {
          setTherapistName(tProfile.full_name || 'Tu Fisioterapeuta');
          if (tProfile.email) setTherapistEmail(tProfile.email);
        }
      }

      setTokenValidated(true);
      toast.success('¡Código de invitación verificado!');
    } catch (err: any) {
      console.warn('Error validating token:', err);
      // If table missing or offline, offer fallback
      setTokenError('No se pudo verificar el código en el servidor. Intenta de nuevo.');
    } finally {
      setTokenValidating(false);
    }
  }, [toast]);

  useEffect(() => {
    if (queryToken && queryToken.length >= 4) {
      validateToken(queryToken);
    }
  }, [queryToken, validateToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenValidated) {
      toast.error('Primero debes validar un código de acceso válido');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!turnstileToken) {
      toast.error('Por favor completa la verificación de seguridad Cloudflare');
      return;
    }

    // Verify Turnstile
    try {
      const res = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        toast.error('Validación CAPTCHA fallida. Intenta nuevamente.');
        return;
      }
    } catch {
      // Allow fallback if network drops
    }

    const cleanToken = token.trim().toUpperCase();
    const ok = await signUpPaciente(email.trim(), password, fullName.trim(), cleanToken);

    if (ok) {
      toast.success('¡Registro completado con éxito! Bienvenido a tu plan.');
      navigate('/dashboard-paciente');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 mb-3 shadow-inner">
            <UserCheck size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Activar Cuenta de Paciente
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ingresa el código proporcionado por tu fisioterapeuta para vincular tu expediente
          </p>
        </div>

        {/* Step 1: Token Input & Verification */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Código de Acceso (Token de 6 dígitos)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={token}
                disabled={tokenValidated}
                onChange={(e) => {
                  setToken(e.target.value.toUpperCase());
                  setTokenError(null);
                }}
                placeholder="EJ: 938472"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono tracking-widest text-base font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            {!tokenValidated ? (
              <button
                type="button"
                onClick={() => validateToken(token)}
                disabled={tokenValidating || token.length < 4}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {tokenValidating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Verificar'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTokenValidated(false);
                  setFullName('');
                  setEmail('');
                  setDiagnostico('');
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Cambiar
              </button>
            )}
          </div>

          {tokenError && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle size={14} />
              <span>{tokenError}</span>
            </div>
          )}

          {tokenValidated && (
            <div className="mt-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400" />
                <span>Expediente clínico vinculado correctamente</span>
              </div>
              {therapistName && (
                <p className="text-[11px] text-teal-700 dark:text-teal-300 pl-5">
                  Prescrito por: <strong>{therapistName}</strong>
                  {therapistEmail ? ` (${therapistEmail})` : ''}
                </p>
              )}
              {diagnostico && (
                <p className="text-[11px] text-teal-700 dark:text-teal-300 pl-5">
                  Plan: <strong>{diagnostico}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Patient Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre y apellido"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico (para tu cuenta)
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@correo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu clave"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Cloudflare Turnstile */}
          <TurnstileWidget
            ref={turnstileRef}
            action="register_paciente"
            onVerify={(tok) => setTurnstileToken(tok)}
            onExpire={() => setTurnstileToken(null)}
          />

          <button
            type="submit"
            disabled={loading || !tokenValidated}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Completar Registro y Empezar Terapia</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          ¿Ya tienes cuenta activa?{' '}
          <Link to="/auth" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
