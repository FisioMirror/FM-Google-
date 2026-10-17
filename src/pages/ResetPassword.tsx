import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastProvider';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const toast = useToast();

  const tokenParam = searchParams.get('token') || searchParams.get('code') || searchParams.get('pin') || '';
  const emailParam = searchParams.get('email') || '';

  // Mode: 'request' (solicitar enlace/PIN) | 'reset' (ingresar PIN/token y nueva clave)
  const [mode, setMode] = useState<'request' | 'reset'>(tokenParam ? 'reset' : 'request');
  const [email, setEmail] = useState(emailParam);
  const [tokenOrCode, setTokenOrCode] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cooldownRef = useRef<any>(null);

  useEffect(() => {
    if (tokenParam) {
      setTokenOrCode(tokenParam);
      setMode('reset');
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [tokenParam, emailParam]);

  // Escuchar eventos de sesión de recuperación si Supabase Auth redirigió
  useEffect(() => {
    let isMounted = true;
    async function checkExistingSession() {
      try {
        const hash = window.location.hash;
        if (hash.includes('access_token') || hash.includes('type=recovery) {
          if (isMounted) setMode('reset');
        }
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.email && isMounted) {
          setEmail((prev) => prev || data.session.user.email || '');
          if (hash.includes('recovery) {
            setMode('reset');
          }
        }
      } catch {
        // non-blocking
      }
    }
    checkExistingSession();

    return () => {
      isMounted = false;
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = (seconds = 60) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1. Solicitar enlace y código de recuperación por correo
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@) {
      toast.error(t('reset.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      // Llamar al endpoint dedicado con transporte SMTP verificado
      const res = await fetch('/api/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t('reset.sendMailFailed'));
      }

      setRequestSent(true);
      startCooldown(60);
      toast.success(t('reset.emailSentTitle'), {
        description: t('reset.emailSentDesc', { email: cleanEmail }),
      });
    } catch (err: any) {
      setErrorMessage(err.message || t('reset.processError'));
      toast.error(t('reset.requestError') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Procesar cambio de contraseña con token o PIN de 6 dígitos
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = tokenOrCode.trim();

    if (!cleanEmail || !cleanEmail.includes('@) {
      toast.error(t('reset.specifyEmail'));
      return;
    }

    if (!cleanToken) {
      toast.error(t('reset.missingCode'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('auth.minPassword8'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      // 1. Llamar al servicio seguro de procesamiento en backend
      const res = await fetch('/api/process-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          tokenOrCode: cleanToken,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t('reset.verifyFailed'));
      }

      // 2. Si hay sesión Supabase activa en el navegador, sincronizar updateUser
      try {
        await supabase.auth.updateUser({ password });
      } catch {
        // non-blocking
      }

      setIsCompleted(true);
      toast.success(t('reset.updatedOk'), {
        description: t('reset.newCredsOk'),
      });

      // Redirigir al login después de 2.5 segundos
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || t('reset.updateError2'));
      toast.error(err.message || t('reset.genericError'));
    } finally {
      setLoading(false);
    }
  };

  // Validación de seguridad de la contraseña
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const strengthScore = [hasMinLength, hasNumber, hasUpper, hasLower].filter(Boolean).length;

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Subtle Blurs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-elevated border border-slate-200 dark:border-slate-800 relative z-10"
      >
        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 mb-3 shadow-inner">
            {isCompleted ? (
              <CheckCircle2 size={28} className="text-teal-600" />
            ) : mode === 'reset' ? (
              <KeyRound size={28} />
            ) : (
              <Mail size={28} />
            )}
          </div>
          <h1 className="fm-title text-on-surface">
            {isCompleted
              ? t('reset.titleComplete')
              : mode === 'reset'
              ? t('reset.titleReset')
              : t('reset.titleRequest')}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {isCompleted
              ? t('reset.subComplete')
              : mode === 'reset'
              ? t('reset.subReset')
              : t('reset.subRequest')}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isCompleted ? (
            /* ══════════════════════════════════════════════════════════
               PANTALLA DE CONFIRMACIÓN EXITOSA
               ══════════════════════════════════════════════════════════ */
            <motion.div
              key="completed-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 text-center py-2"
            >
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center mx-auto shadow-sm shadow-teal-600/20">
                  <Check size={26} />
                </div>
                <h3 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                  t('reset.completedBanner')
                </h3>
                <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
                  {t('reset.comprobante')}{' '}
                  <strong>{email}</strong>.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 active:scale-98 text-on-primary font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20"
              >
                <span>{t('reset.loginNow')}</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : mode === 'request' ? (
            /* ══════════════════════════════════════════════════════════
               MODO 1: SOLICITAR ENLACE Y CÓDIGO
               ══════════════════════════════════════════════════════════ */
            <motion.div
              key="request-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {requestSent ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center mx-auto shadow-sm shadow-teal-600/20">
                      <CheckCircle2 size={22} />
                    </div>
                    <h3 className="text-sm font-bold text-teal-900 dark:text-teal-200">
                      {t('reset.sentBanner')}
                    </h3>
                    <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
                      {t('reset.directLink')}{' '}
                      <strong className="underline">{email}</strong>. {t('reset.valid15')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <KeyRound size={14} />
                      <span>{t('reset.enterPin')}</span>
                    </button>

                    <button
                      type="button"
                      disabled={cooldown > 0 || loading}
                      onClick={handleRequestReset}
                      className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-on-surface text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                      {cooldown > 0 ? `{t('reset.resendIn', { s: cooldown })}` : t('reset.resendEmail')}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">
                      {t('reset.accountEmail')}
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.emailPlaceholder')}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 active:scale-98 text-on-primary font-bold text-xs shadow-sm shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{t('reset.sendLink')}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
                    >
                      {t('reset.havePin')}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : (
            /* ══════════════════════════════════════════════════════════
               MODO 2: INGRESAR PIN/TOKEN Y DEFINIR NUEVA CONTRASEÑA
               ══════════════════════════════════════════════════════════ */
            <motion.div
              key="reset-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('reset.pinOrToken')}
                  </label>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="text"
                      required
                      value={tokenOrCode}
                      onChange={(e) => setTokenOrCode(e.target.value)}
                      placeholder={t('reset.pinPlaceholder')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface font-mono outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('reset.newPassword')}
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('reset.min8Chars')}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface-variant dark:hover:text-slate-200 p-1"
                      aria-label={showPassword ? t('common.hide') : t('common.show')}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Indicador de Seguridad */}
                  {password.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            strengthScore <= 1
                              ? 'w-1/4 bg-red-500'
                              : strengthScore === 2
                              ? 'w-2/4 bg-amber-500'
                              : strengthScore === 3
                              ? 'w-3/4 bg-blue-500'
                              : 'w-full bg-teal-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-2xs text-on-surface-variant font-medium">
                        <span>{t('reset.strength')}{strengthScore <= 1 ? strengthScore <= 3 ? t('reset.pwMed') : t('reset.pwHigh')}</span>
                        <span>{hasMinLength ? t('reset.meets8') : t('reset.min8')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('reset.confirmNewPassword')}
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('reset.repeatPassword')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-2xs text-red-500 mt-1">{t('auth.passwordMismatch')}</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-2xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
                      <ShieldCheck size={11} /> {t('reset.matching')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || password.length < 8 || password !== confirmPassword || !tokenOrCode.trim()}
                  className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 active:scale-98 text-on-primary font-bold text-xs shadow-sm shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('reset.saveNew')}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('request')}
                    className="text-xs text-on-surface-variant hover:text-on-surface dark:hover:text-slate-300 font-semibold"
                  >
                    {t('reset.returnRequest')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-teal-600 dark:hover:text-teal-400 font-bold transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{t('reset.backToLogin')}</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
