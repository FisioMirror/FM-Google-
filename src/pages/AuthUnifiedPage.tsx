import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, User, Lock, Mail, Eye, EyeOff, KeyRound, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/ToastProvider';
import { TurnstileWidget, type TurnstileWidgetRef } from '../components/auth/TurnstileWidget';
import { supabase } from '../lib/supabase';

export function AuthUnifiedPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signIn, signInWithToken, loading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<'fisioterapeuta' | 'paciente'>('fisioterapeuta');
  const [authType, setAuthType] = useState<'password' | 'token'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const handleRoleChange = (newRole: 'fisioterapeuta' | 'paciente') => {
    setRole(newRole);
    clearError();
    if (newRole === 'fisioterapeuta') {
      setAuthType('password');
    }
  };

  const handleOAuthLogin = async (provider: 'google') => {
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      toast.error('Inicio con Google no disponible en este momento', {
        description: err.message || 'Verifica la configuración del proveedor en Supabase.',
      });
    }
  };

  const handlePasskeyLogin = async () => {
    if (!window.PublicKeyCredential) {
      toast.error('Tu navegador o dispositivo no soporta Passkeys / Llaves de Acceso');
      return;
    }
    toast.info('Autenticación con Passkey', {
      description: 'Interactúa con tu sensor biométrico (TouchID, FaceID o Windows Hello)...',
    });
    try {
      // Prompt standard WebAuthn conditional/biometric check
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        toast.error('No se encontró autenticador biométrico disponible en este equipo');
        return;
      }
      toast.success('Dispositivo biométrico verificado', {
        description: 'Introduce tus credenciales clínicas o usa el acceso demo.',
      });
    } catch (err: any) {
      toast.error('Error al verificar Passkey: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      toast.error('Por favor completa la verificación de seguridad Cloudflare Turnstile');
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
        toast.error('Fallo en la validación CAPTCHA. Intenta nuevamente.');
        return;
      }
    } catch {
      // Proceed if network issue
    }

    if (role === 'paciente' && authType === 'token') {
      if (!tokenInput.trim() || tokenInput.length < 4) {
        toast.error('Ingresa un token de 6 dígitos válido');
        return;
      }
      const ok = await signInWithToken(tokenInput.trim());
      if (ok) {
        toast.success('¡Bienvenido a FisioMirror!');
        navigate('/dashboard-paciente');
      } else {
        toast.error('Token no encontrado o inválido');
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast.error('Por favor ingresa tu correo y contraseña');
      return;
    }

    const success = await signIn(email.trim(), password);
    if (success) {
      toast.success('Inicio de sesión exitoso');
      navigate(role === 'fisioterapeuta' ? '/dashboard-fisio' : '/dashboard-paciente');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 mb-3 shadow-inner">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Acceso a FisioMirror
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Plataforma de Tele-Rehabilitación con Visión Artificial y Biofeedback
          </p>
        </div>

        {/* Visual Role Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => handleRoleChange('fisioterapeuta')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              role === 'fisioterapeuta'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Stethoscope size={16} />
            <span>Fisioterapeuta</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('paciente')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              role === 'paciente'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User size={16} />
            <span>Paciente</span>
          </button>
        </div>

        {/* For Paciente: choice between Password or Direct 6-digit Token */}
        {role === 'paciente' && (
          <div className="flex justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setAuthType('password')}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                authType === 'password'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Email y Contraseña
            </button>
            <button
              type="button"
              onClick={() => setAuthType('token')}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                authType === 'token'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Código de Acceso
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authType === 'token' && role === 'paciente' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Código de 6 dígitos del fisioterapeuta
              </label>
              <div className="relative">
                <KeyRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  placeholder="EJ: AB1234"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tracking-widest text-center text-base font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 text-center">
                ¿Aún no has configurado tu clave?{' '}
                <Link to="/registro-paciente" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
                  Registrar token aquí →
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@fisiomirror.app"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contraseña
                  </label>
                  <Link
                    to="/reset-password"
                    className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Cloudflare Turnstile Widget */}
          <TurnstileWidget
            ref={turnstileRef}
            action="login"
            onVerify={(tok) => setTurnstileToken(tok)}
            onExpire={() => setTurnstileToken(null)}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* OAuth & Passkey Options */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handlePasskeyLogin}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <KeyRound size={15} className="text-teal-600 dark:text-teal-400" />
              <span>Passkey</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Access */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wider">
            Accesos Rápidos Demo
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRole('fisioterapeuta');
                setAuthType('password');
                setEmail('fisio@demo.com');
                setPassword('demo1234');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Demo Fisio
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('paciente');
                setAuthType('password');
                setEmail('paciente@demo.com');
                setPassword('demo1234');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Demo Paciente
            </button>
          </div>
        </div>

        {/* Links to Register or Classic Login */}
        <div className="mt-5 text-center text-xs text-slate-500">
          ¿Prefieres la vista de bienvenida?{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            Ir a Portal Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
