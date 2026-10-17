import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
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
import { Button } from '../components/ui/Button';
import { OtpInput } from '../components/ui/OtpInput';

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
  const { t } = useTranslation();
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  // Validate Token against Supabase activation_tokens table
  const validateToken = useCallback(async (tokenToTest: string) => {
    const clean = tokenToTest.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setTokenError(t('reg.tokenTooShort'));
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
          toast.success(t('reg.demoTokenOk'));
          return;
        }
        setTokenError(t('reg.tokenInvalid'));
        setTokenValidated(false);
        return;
      }

      if (tokenData.used) {
        setTokenError(t('reg.tokenUsed'));
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
          setTherapistName(tProfile.full_name || t('reg.defaultTherapist'));
          if (tProfile.email) setTherapistEmail(tProfile.email);
        }
      }

      setTokenValidated(true);
      toast.success(t('reg.tokenVerified'));
    } catch (err: any) {
      console.warn('Error validating token:', err);
      // If table missing or offline, offer fallback
      setTokenError(t('reg.tokenServerError'));
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
      toast.error(t('reg.validateFirst'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('auth.minPassword6'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    if (!turnstileToken) {
      toast.error(t('reg.captchaRequired'));
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
        toast.error(t('reg.captchaFailed'));
        return;
      }
    } catch {
      // Allow fallback if network drops
    }

    const cleanToken = token.trim().toUpperCase();
    const ok = await signUpPaciente(email.trim(), password, fullName.trim(), cleanToken);

    if (ok) {
      toast.success(t('reg.registeredOk'));
      navigate('/dashboard-paciente');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-elevated border border-slate-200/80 dark:border-slate-800 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 mb-3 shadow-inner">
            <UserCheck size={28} />
          </div>
          <h1 className="fm-title text-on-surface">
            {t('reg.title')}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {t('reg.subtitle')}
          </p>
        </div>

        {/* Step 1: Token Input & Verification */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              {t('reg.accessCode')}
            </label>
            {tokenValidated && (
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 flex items-center gap-1">
                <CheckCircle2 size={12} /> {t('reg.validated')}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex justify-center flex-1">
              <OtpInput
                length={6}
                value={token}
                disabled={tokenValidated}
                onChange={(val) => {
                  setToken(val);
                  setTokenError(null);
                }}
                onComplete={(fullCode) => {
                  validateToken(fullCode);
                }}
                error={Boolean(tokenError)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!tokenValidated ? (
                <Button
                  type="button"
                  variant="glow"
                  glowEffect
                  loading={tokenValidating}
                  disabled={tokenValidating || token.length < 4}
                  onClick={() => validateToken(token)}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Verificar
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTokenValidated(false);
                    setFullName('');
                    setEmail('');
                    setDiagnostico('');
                  }}
                  className="w-full sm:w-auto"
                >
                  Cambiar
                </Button>
              )}
            </div>
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
                <span>{t('reg.linkedOk')}</span>
              </div>
              {therapistName && (
                <p className="text-xs text-teal-700 dark:text-teal-300 pl-5">
                  {t('reg.prescribedBy')} <strong>{therapistName}</strong>
                  {therapistEmail ? ` (${therapistEmail})` : ''}
                </p>
              )}
              {diagnostico && (
                <p className="text-xs text-teal-700 dark:text-teal-300 pl-5">
                  {t('reg.plan')} <strong>{diagnostico}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Patient Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              {t('reg.fullName')}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('reg.namePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              {t('reg.emailLabel')}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('reg.emailPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('reset.min6Chars')}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface-variant p-1"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                {t('reg.confirmPassword')}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('reg.repeatPassword')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-on-surface outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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

          <Button
            type="submit"
            variant="glow"
            glowEffect
            loading={loading}
            disabled={loading || !tokenValidated}
            size="lg"
            className="w-full text-sm font-bold"
            icon={<ArrowRight size={17} />}
            iconPosition="right"
          >
            {t('reg.submitBtn')}
          </Button>
        </form>

        <div className="mt-5 text-center text-xs text-on-surface-variant">
          {t('reg.haveAccount')}{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
