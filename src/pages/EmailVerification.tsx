import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/themeApi';
import { useToast } from '../components/ui/toastApi';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { Icon } from '../components/ui/Icon';
import { Spinner } from '../components/ui/Loader';
import { cn } from '../lib/utils';
import { SparkleEffect } from '../components/auth/SparkleEffect';

export function EmailVerification() {
  const { user, resendVerificationEmail, checkEmailVerification, signOut, initialized } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailFromParams, setEmailFromParams] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const email = emailFromParams || user?.email || '';

  useEffect(() => {
    const paramEmail = searchParams.get('email');
    if (paramEmail) {
      setEmailFromParams(paramEmail.toLowerCase().trim());
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCheckVerification = useCallback(async () => {
    if (!email) return;
    setIsChecking(true);
    try {
      const verified = await checkEmailVerification(email);
      if (verified) {
        toast.success(t('auth.emailVerified', '¡Correo verificado correctamente!'));
        setShowSuccess(true);
        setTimeout(() => {
          signOut();
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        toast.info(t('auth.emailNotVerifiedYet', 'El correo aún no ha sido verificado. Revisa tu bandeja de entrada.'));
      }
    } catch {
      toast.error(t('auth.verificationCheckFailed', 'Error al verificar el estado'));
    } finally {
      setIsChecking(false);
    }
  }, [email, checkEmailVerification, toast, t, signOut, navigate]);

  const handleResendEmail = useCallback(async () => {
    if (!email || isResending) return;
    setIsResending(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        toast.success(t('auth.verificationResent', 'Email de verificación reenviado'));
        setResendCooldown(60);
      } else {
        toast.error(result.error || t('auth.resendFailed', 'Error al reenviar el email'));
      }
    } catch {
      toast.error(t('auth.resendError', 'Error de conexión'));
    } finally {
      setIsResending(false);
    }
  }, [email, resendVerificationEmail, toast, t, isResending]);

  const handleBackToLogin = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen w-full flex font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden bg-[#f9f9fc] dark:bg-slate-950">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(at 0% 0%, rgba(0, 80, 77, 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.09) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(13, 148, 136, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.10) 0px, transparent 50%)',
        }}
      />
      <div className="pointer-events-none absolute -left-12 top-16 h-72 w-72 rounded-full bg-[#00504d]/10 dark:bg-teal-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />

      <SparkleEffect active={true} color="teal" />

      {/* Main Content */}
      <div className="w-full flex flex-col items-center justify-center px-4 py-8 md:px-8 relative z-20">
        <div className="w-full max-w-md">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
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

          {/* Verification Card */}
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                key="verification-pending"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2.5rem] border border-white/60 dark:border-slate-800/80 bg-white/45 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] p-8 space-y-6"
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Icon name="mark_email_read" size={32} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                  <h1 className="font-extrabold text-2xl sm:text-[26px] tracking-tight text-slate-900 dark:text-slate-100">
                    {t('auth.verifyEmailTitle', 'Verifica tu correo electrónico')}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Hemos enviado un enlace de confirmación a tu correo. Por favor verifícalo para ingresar a FisioMirror.
                    <br />
                    <span className="font-semibold text-slate-900 dark:text-slate-100 break-all">{email}</span>
                    <br />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t('auth.verifyEmailInstruction', 'Revisa tu bandeja de entrada (y carpeta de spam) y haz clic en el enlace para activar tu cuenta.')}</span>
                  </p>
                </div>

                {/* Email display */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{t('auth.currentEmail', 'Correo actual:')}</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100 break-all max-w-[200px]">{email}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleCheckVerification}
                    disabled={isChecking || !email}
                    className={cn(
                      'group relative w-full h-12 rounded-2xl bg-gradient-to-b from-[#00726c] to-[#003f3c] text-sm font-bold text-white shadow-lg shadow-teal-900/25 border border-teal-300/25 transition-all duration-300 hover:from-[#00837c] hover:to-[#004c48] hover:shadow-xl hover:shadow-teal-900/35 active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 dark:focus-visible:ring-offset-slate-900'
                    )}
                  >
                    {isChecking ? (
                      <Spinner size={18} className="text-white" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="refresh" size={18} className="animate-spin" />
                        {t('auth.checkVerification', 'He verificado mi correo')}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleResendEmail}
                    disabled={isResending || resendCooldown > 0 || !email}
                    className={cn(
                      'group relative w-full h-12 rounded-2xl border-2 border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm font-bold text-[#00504d] dark:text-[#8ad3cf] shadow-sm transition-all duration-300 hover:bg-white dark:hover:bg-slate-900 hover:border-[#00504d]/50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00504d]/40 dark:focus-visible:ring-teal-400/50'
                    )}
                  >
                    {resendCooldown > 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="timer" size={18} />
                        {t('auth.resendIn', 'Reenviar en')} {resendCooldown}s
                      </span>
                    ) : isResending ? (
                      <Spinner size={18} className="text-[#00504d] dark:text-[#8ad3cf]" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="send" size={18} />
                        {t('auth.resendEmail', 'Reenviar email de verificación')}
                      </span>
                    )}
                  </button>
                </div>

                {/* Help text */}
                <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <p>{t('auth.didNotReceive', '¿No recibiste el email?')}</p>
                  <p className="text-slate-500 dark:text-slate-500">
                    {t('auth.checkSpam', 'Revisa tu carpeta de spam o promociones.')}
                  </p>
                  <p className="text-slate-500 dark:text-slate-500">
                    {t('auth.contactSupport', 'Si el problema persiste, contacta a soporte.')}
                  </p>
                </div>

                {/* Back to login */}
                <button
                  onClick={handleBackToLogin}
                  className="w-full mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
                >
                  {t('auth.backToLogin', 'Volver al inicio de sesión')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="verification-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[2.5rem] border border-white/60 dark:border-slate-800/80 bg-white/45 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] p-8 space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Icon name="check_circle" size={32} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="font-extrabold text-2xl tracking-tight text-emerald-700 dark:text-emerald-300">
                    {t('auth.verifiedSuccess', '¡Correo verificado!')}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t('auth.verifiedDesc', 'Tu cuenta ha sido activada correctamente. Redirigiendo al inicio de sesión...')}
                  </p>
                </div>

                <Spinner size={24} className="mx-auto text-emerald-600 dark:text-emerald-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}