import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '../components/ui/Loader';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/ToastProvider';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import {
  Lock,
  Mail,
  User,
  Key,
  Stethoscope,
  Eye,
  EyeOff,
} from 'lucide-react';

type AuthMode = 'login' | 'register';
type RegisterRole = 'paciente' | 'fisioterapeuta';

export function Login() {
  const { signIn, linkTokenToEmail, signUpFisio, loading, error, clearError } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [registerRole, setRegisterRole] = useState<RegisterRole>('paciente');

  // Form Fields - Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields - Register Paciente (Token + Email + Password)
  const [patientToken, setPatientToken] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [confirmPatientPassword, setConfirmPatientPassword] = useState('');

  // Form Fields - Register Fisioterapeuta
  const [fisioName, setFisioName] = useState('');
  const [fisioEmail, setFisioEmail] = useState('');
  const [fisioPassword, setFisioPassword] = useState('');
  const [fisioCedula, setFisioCedula] = useState('');
  const [fisioUniversidad, setFisioUniversidad] = useState('');
  const [fisioEspecialidad, setFisioEspecialidad] = useState('');

  // Reset Password Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'fisioterapeuta' ? '/dashboard-fisio' : '/dashboard-paciente', {
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Por favor ingresa tu correo y contraseña');
      return;
    }

    const ok = await signIn(email.trim(), password);
    if (ok) {
      toast.success('Bienvenido a FisioMirror');
    } else {
      const err = useAuthStore.getState().error;
      toast.error(err || 'Error al iniciar sesión');
    }
  };

  const handleRegisterPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = patientToken.trim();
    if (!cleanToken) {
      toast.error('Ingresa el token de 6 dígitos asignado por tu terapeuta');
      return;
    }
    if (!patientEmail.trim() || !patientPassword.trim()) {
      toast.error('Completa tu correo y contraseña');
      return;
    }
    if (patientPassword !== confirmPatientPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const ok = await linkTokenToEmail(
      cleanToken,
      patientEmail.trim(),
      patientPassword,
      patientName.trim() || undefined
    );

    if (ok) {
      toast.success('¡Cuenta activada con éxito! Bienvenido.');
    } else {
      const err = useAuthStore.getState().error;
      toast.error(err || 'Error al activar token');
    }
  };

  const handleRegisterFisioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fisioName.trim() || !fisioEmail.trim() || !fisioPassword.trim()) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    const ok = await signUpFisio(fisioEmail.trim(), fisioPassword, fisioName.trim(), {
      cedula: fisioCedula.trim(),
      colegiadoId: fisioCedula.trim(),
      universidad: fisioUniversidad.trim(),
      especialidades: fisioEspecialidad ? [fisioEspecialidad.trim()] : ['Fisioterapia General'],
    });

    if (ok) {
      toast.success('¡Registro clínico completado!');
    } else {
      const err = useAuthStore.getState().error;
      toast.error(err || 'Error al registrar fisioterapeuta');
    }
  };

  const handleDemoFisio = async () => {
    await signIn('fisio@demo.com', 'demo1234');
    toast.success('Acceso Demo Fisioterapeuta activado');
  };

  const handleDemoPatient = async () => {
    await signIn('paciente@demo.com', 'demo1234');
    toast.success('Acceso Demo Paciente activado');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }
    setResetLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
      toast.success('Enlace de recuperación enviado', {
        description: 'Revisa tu bandeja de entrada o carpeta de spam.',
      });
      setShowResetModal(false);
      setResetEmail('');
    } catch {
      toast.info('Instrucciones enviadas', {
        description: 'Si la cuenta existe, recibirás un enlace de recuperación.',
      });
      setShowResetModal(false);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md sm:max-w-lg z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-teal-500/15 border border-teal-400/30 p-2 shadow-xl shadow-teal-900/40 mb-3">
            <img src="/logo.png" alt="FisioMirror" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FisioMirror
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/70 mt-1">
            Plataforma de Fisioterapia & Rehabilitación con IA y AR
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-teal-500/20 mb-6 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              clearError();
            }}
            className={cn(
              'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200',
              mode === 'login'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              clearError();
            }}
            className={cn(
              'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200',
              mode === 'register'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Registro / Activar Token
          </button>
        </div>

        {/* Card Panel */}
        <div className="bg-slate-900/90 border border-teal-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {mode === 'login' ? (
            /* --- LOGIN FORM: Solo Correo y Contraseña --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm transition-all shadow-lg shadow-teal-700/30 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Spinner size={18} /> : <span>Ingresar al Sistema</span>}
              </button>
            </form>
          ) : (
            /* --- REGISTRATION / TOKEN ACTIVATION --- */
            <div className="space-y-4">
              {/* Role selector for registration */}
              <div className="flex gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setRegisterRole('paciente')}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-bold transition-all',
                    registerRole === 'paciente'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Soy Paciente (con Token)
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('fisioterapeuta')}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-bold transition-all',
                    registerRole === 'fisioterapeuta'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Soy Fisioterapeuta
                </button>
              </div>

              {registerRole === 'paciente' ? (
                /* Patient Registration via Token + Email + Password */
                <form onSubmit={handleRegisterPatientSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
                    Ingresa el <strong>token de 6 dígitos</strong> que te entregó tu fisioterapeuta para vincular tu expediente.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Token de Activación (6 Dígitos) *
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400 size-4" />
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={patientToken}
                        onChange={(e) => setPatientToken(e.target.value.toUpperCase())}
                        placeholder="Ej: 482910"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-teal-500/40 focus:border-teal-400 text-sm font-mono tracking-widest text-teal-300 placeholder:text-slate-500 outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Carlos Mendoza"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        required
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Confirmar *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPatientPassword}
                        onChange={(e) => setConfirmPatientPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm transition-all shadow-lg shadow-teal-700/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Spinner size={18} /> : <span>Activar y Registrarme</span>}
                  </button>
                </form>
              ) : (
                /* Therapist Registration */
                <form onSubmit={handleRegisterFisioSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={fisioName}
                      onChange={(e) => setFisioName(e.target.value)}
                      placeholder="Dr(a). Alejandro Vega"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={fisioEmail}
                      onChange={(e) => setFisioEmail(e.target.value)}
                      placeholder="terapeuta@clinica.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={fisioPassword}
                      onChange={(e) => setFisioPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Cédula / Colegiado
                      </label>
                      <input
                        type="text"
                        value={fisioCedula}
                        onChange={(e) => setFisioCedula(e.target.value)}
                        placeholder="Nº Colegiado"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Universidad
                      </label>
                      <input
                        type="text"
                        value={fisioUniversidad}
                        onChange={(e) => setFisioUniversidad(e.target.value)}
                        placeholder="Universidad"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm transition-all shadow-lg shadow-teal-700/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Spinner size={18} /> : <span>Crear Cuenta Profesional</span>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/80" />
            </div>
            <span className="relative px-3 bg-slate-900 text-slate-400 text-xs font-bold uppercase tracking-wider">
              Acceso Rápido Demo
            </span>
          </div>

          {/* 1-Click Demo Access */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDemoFisio}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-teal-500/30 hover:border-teal-400 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Stethoscope className="size-4 text-teal-400" />
              <span>Demo Fisioterapeuta</span>
            </button>

            <button
              type="button"
              onClick={handleDemoPatient}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-cyan-500/30 hover:border-cyan-400 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <User className="size-4 text-cyan-400" />
              <span>Demo Paciente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-1">Recuperar Contraseña</h3>
              <p className="text-xs text-slate-400 mb-4">
                Ingresa tu correo para recibir un enlace de restablecimiento.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-teal-400"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    {resetLoading ? <Spinner size={14} /> : <span>Enviar Enlace</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
