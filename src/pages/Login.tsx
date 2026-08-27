import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '../components/ui/Loader';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/ToastProvider';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { PinInput } from '../components/ui/PinInput';
import {
  Lock,
  Mail,
  User,
  Key,
  Stethoscope,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

type AuthTab = 'login' | 'register';
type RegisterType = 'paciente' | 'fisio';

export function Login() {
  const { signIn, linkTokenToEmail, signUpFisio, loading, error, clearError } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [registerType, setRegisterType] = useState<RegisterType>('paciente');

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
  const [showPatientPassword, setShowPatientPassword] = useState(false);

  // Form Fields - Register Fisioterapeuta
  const [fisioName, setFisioName] = useState('');
  const [fisioEmail, setFisioEmail] = useState('');
  const [fisioPassword, setFisioPassword] = useState('');
  const [fisioCedula, setFisioCedula] = useState('');
  const [fisioUniversidad, setFisioUniversidad] = useState('');
  const [fisioEspecialidad, setFisioEspecialidad] = useState('');
  const [showFisioPassword, setShowFisioPassword] = useState(false);

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
      toast.error(err || 'Credenciales no válidas');
    }
  };

  const handleRegisterPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = patientToken.trim();
    if (!cleanToken) {
      toast.error('Por favor ingresa el token de 6 dígitos emitido por tu fisioterapeuta');
      return;
    }
    if (!patientEmail.trim() || !patientPassword.trim()) {
      toast.error('Completa tu correo electrónico y define una contraseña');
      return;
    }
    if (patientPassword !== confirmPatientPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (patientPassword.length < 6) {
      toast.error('La contraseña debe contener al menos 6 caracteres');
      return;
    }

    const ok = await linkTokenToEmail(
      cleanToken,
      patientEmail.trim(),
      patientPassword,
      patientName.trim() || undefined
    );

    if (ok) {
      toast.success('¡Cuenta activada y vinculada exitosamente! Bienvenido.');
    } else {
      const err = useAuthStore.getState().error;
      toast.error(err || 'No se pudo activar el token. Verifica que sea válido.');
    }
  };

  const handleRegisterFisioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fisioName.trim() || !fisioEmail.trim() || !fisioPassword.trim()) {
      toast.error('Completa los campos obligatorios del registro profesional');
      return;
    }
    if (fisioPassword.length < 6) {
      toast.error('La contraseña debe contener al menos 6 caracteres');
      return;
    }

    const ok = await signUpFisio(fisioEmail.trim(), fisioPassword, fisioName.trim(), {
      cedula: fisioCedula.trim() || 'Pendiente',
      colegiadoId: fisioCedula.trim() || 'Pendiente',
      universidad: fisioUniversidad.trim() || 'Colegiado Nacional',
      especialidades: fisioEspecialidad ? [fisioEspecialidad.trim()] : ['Fisioterapia y Rehabilitación'],
    });

    if (ok) {
      toast.success('¡Registro clínico completado! Bienvenido.');
    } else {
      const err = useAuthStore.getState().error;
      toast.error(err || 'Error al crear la cuenta clínica.');
    }
  };

  const handleDemoFisio = async () => {
    await signIn('fisio@demo.com', 'demo1234');
    toast.success('Acceso Demo Fisioterapeuta');
  };

  const handleDemoPatient = async () => {
    await signIn('paciente@demo.com', 'demo1234');
    toast.success('Acceso Demo Paciente');
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
        description: 'Revisa tu bandeja de entrada o spam.',
      });
      setShowResetModal(false);
      setResetEmail('');
    } catch {
      toast.info('Instrucciones enviadas', {
        description: 'Si el correo está registrado, recibirás un enlace de acceso.',
      });
      setShowResetModal(false);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Dynamic Background Ambient Light */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-800/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-md sm:max-w-lg z-10 my-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-3 relative"
          >
            <div className="absolute inset-0 rounded-full bg-teal-500/25 blur-xl pointer-events-none" />
            <img src="/logo.png" alt="FisioMirror" className="w-full h-full object-contain relative z-10 drop-shadow-md select-none" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FisioMirror
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/80 mt-1 font-medium">
            Rehabilitación Inteligente con Espejo AR & Asistencia Clínica
          </p>
        </div>

        {/* Tab Selector (Glassmorphic) */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-teal-500/25 mb-5 shadow-lg backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              clearError();
            }}
            className={cn(
              'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5',
              activeTab === 'login'
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-900/40'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Lock className="size-3.5" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              clearError();
            }}
            className={cn(
              'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5',
              activeTab === 'register'
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-900/40'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Key className="size-3.5" />
            <span>Registro / Activar Token</span>
          </button>
        </div>

        {/* Card Body Panel */}
        <div className="bg-slate-900/90 border border-teal-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              /* ─── TAB 1: INICIAR SESIÓN (Email & Password) ─── */
              <motion.form
                key="login-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
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
                      placeholder="usuario@correo.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:bg-slate-800"
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
                      className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium"
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
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-teal-400 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label="Ver contraseña"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm transition-all shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {loading ? <Spinner size={18} /> : <span>Ingresar al Sistema</span>}
                </button>

                {/* Separator */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
                      Acceso Rápido de Evaluación
                    </span>
                  </div>
                </div>

                {/* Demo Quick Access */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDemoFisio}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-teal-500/20 text-teal-300 hover:text-teal-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 hover:border-teal-500/40"
                  >
                    <Stethoscope className="size-3.5" />
                    <span>Demo Terapeuta</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoPatient}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 hover:border-cyan-500/40"
                  >
                    <User className="size-3.5" />
                    <span>Demo Paciente</span>
                  </button>
                </div>
              </motion.form>
            ) : (
              /* ─── TAB 2: REGISTRO / ACTIVAR TOKEN ─── */
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Sub-Role Selector */}
                <div className="flex p-1 bg-slate-800/90 rounded-xl border border-slate-700/80 gap-1">
                  <button
                    type="button"
                    onClick={() => setRegisterType('paciente')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                      registerType === 'paciente'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <Key className="size-3.5" />
                    <span>Soy Paciente (Tengo Token)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterType('fisio')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                      registerType === 'fisio'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <Stethoscope className="size-3.5" />
                    <span>Soy Profesional</span>
                  </button>
                </div>

                {registerType === 'paciente' ? (
                  /* Formulario Paciente con Token */
                  <form onSubmit={handleRegisterPatientSubmit} className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200/90">
                      <p className="font-semibold text-teal-100 flex items-center gap-1.5">
                        <Key className="size-3.5 text-teal-400" />
                        Activación con Llave de 6 Dígitos
                      </p>
                      <p className="text-[11px] text-teal-200/70 mt-0.5 leading-relaxed">
                        Ingresa el código proporcionado por tu fisioterapeuta para vincular tu expediente clínico.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Token de Acceso (6 Dígitos)
                      </label>
                      <PinInput
                        value={patientToken}
                        onChange={setPatientToken}
                        length={6}
                        boxClassName="!h-12 !w-10 !text-xl !bg-slate-800/90 !border-slate-700 text-teal-300 focus:!border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Nombre Completo (Opcional)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Tu nombre y apellido"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                          type="email"
                          required
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                          <input
                            type={showPatientPassword ? 'text' : 'password'}
                            required
                            value={patientPassword}
                            onChange={(e) => setPatientPassword(e.target.value)}
                            placeholder="Mín. 6 caracteres"
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPatientPassword(!showPatientPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          >
                            {showPatientPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Confirmar
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                          <input
                            type={showPatientPassword ? 'text' : 'password'}
                            required
                            value={confirmPatientPassword}
                            onChange={(e) => setConfirmPatientPassword(e.target.value)}
                            placeholder="Repite la clave"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm transition-all shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-2"
                    >
                      {loading ? <Spinner size={18} /> : <span>Activar y Vincular Cuenta</span>}
                    </button>
                  </form>
                ) : (
                  /* Formulario Registro Profesional Fisioterapeuta */
                  <form onSubmit={handleRegisterFisioSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Nombre del Profesional
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                          type="text"
                          required
                          value={fisioName}
                          onChange={(e) => setFisioName(e.target.value)}
                          placeholder="Dr(a). Nombre y Apellido"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Correo Profesional
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                          type="email"
                          required
                          value={fisioEmail}
                          onChange={(e) => setFisioEmail(e.target.value)}
                          placeholder="doctor@clinica.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Cédula / Colegiado
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                          <input
                            type="text"
                            value={fisioCedula}
                            onChange={(e) => setFisioCedula(e.target.value)}
                            placeholder="Nº Colegiado"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Especialidad
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                          <input
                            type="text"
                            value={fisioEspecialidad}
                            onChange={(e) => setFisioEspecialidad(e.target.value)}
                            placeholder="Traumatología, etc."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                          type={showFisioPassword ? 'text' : 'password'}
                          required
                          value={fisioPassword}
                          onChange={(e) => setFisioPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFisioPassword(!showFisioPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showFisioPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm transition-all shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-2"
                    >
                      {loading ? <Spinner size={18} /> : <span>Registrar Cuenta Clínica</span>}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Recuperar Contraseña</h3>
              <p className="text-xs text-slate-400">
                Ingresa tu correo registrado y te enviaremos las instrucciones de restablecimiento.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
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
export default Login;
