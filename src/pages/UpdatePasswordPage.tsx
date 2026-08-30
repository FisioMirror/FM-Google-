import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../stores/authStore';
import { useToast } from '../components/ui/ToastProvider';
import { TurnstileWidget, type TurnstileWidgetRef } from '../components/auth/TurnstileWidget';

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  useEffect(() => {
    // 1. Handle PKCE code if present
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data?.session) {
          toast.info('Sesión de recuperación verificada');
        }
      });
    }

    // 2. Check if session or recovery token is detected in URL
    const checkSession = async () => {
      await supabase.auth.getSession();
    };
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        toast.info('Sesión de recuperación detectada', {
          description: 'Puedes definir tu nueva contraseña ahora.',
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setLoading(true);
    setStatusMsg(null);

    try {
      // 1. Verify Turnstile
      const cfRes = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const cfData = await cfRes.json();
      if (!cfRes.ok || !cfData.success) {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        toast.error('Verificación de seguridad fallida. Reintenta.');
        setLoading(false);
        return;
      }

      // 2. Call supabase.auth.updateUser
      const { data: authData, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      // 3. Update profiles table and send security notification
      const userEmail = authData?.user?.email;
      if (userEmail) {
        try {
          const computedHash = await hashPassword(password);
          await supabase
            .from('profiles')
            .update({ password_hash: computedHash, updated_at: new Date().toISOString() })
            .eq('email', userEmail.toLowerCase());

          const { data: prof } = await supabase.from('profiles').select('id').eq('email', userEmail.toLowerCase()).maybeSingle();
          if (prof?.id) {
            await supabase.from('notifications').insert({
              user_id: prof.id,
              title: 'Contraseña actualizada',
              message: `Tu contraseña ha sido restablecida el ${new Date().toLocaleString()}. Si no fuiste tú, contacta inmediatamente a soporte.`,
              type: 'seguridad',
              read: false,
            });
          }

          // Trigger security email alert
          await fetch('/api/send-security-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, event: 'password_updated' }),
          });
        } catch (postErr) {
          console.warn('Post-password update notification notice:', postErr);
        }
      }

      toast.success('¡Contraseña actualizada exitosamente!', {
        description: 'Ya puedes acceder con tu nueva contraseña.',
      });

      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } catch (err: any) {
      console.error('Password update error:', err);
      toast.error('No se pudo actualizar la contraseña: ' + (err.message || 'Error desconocido'));
      setStatusMsg(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 mb-3 shadow-inner">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Restablecer Contraseña
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ingresa tu nueva contraseña para acceder a FisioMirror
          </p>
        </div>

        {statusMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <TurnstileWidget
            ref={turnstileRef}
            action="update_password"
            onVerify={(tok) => setTurnstileToken(tok)}
            onExpire={() => setTurnstileToken(null)}
          />

          <button
            type="submit"
            disabled={loading || password.length < 6}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Guardar Nueva Contraseña</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          ¿Recordaste tu clave?{' '}
          <Link to="/auth" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
