import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Mail,
  Server,
  ShieldCheck,
  ExternalLink,
  Send,
  Info,
} from 'lucide-react';
import { useToast } from './ToastProvider';

interface DiagnosticState {
  timestamp?: string;
  resend?: {
    configured: boolean;
    apiKeyValid: boolean;
    mode: string;
    accountOwner?: string;
    from?: string;
    message: string;
    lastMessageId?: string;
  };
  smtp?: {
    configured: boolean;
    host?: string | null;
    port?: string | number;
    secure?: boolean;
    user?: string | null;
    connectionOk: boolean;
    error?: string | null;
    message: string;
  };
  supabaseAuth?: {
    configured: boolean;
    url: string;
    status: string;
    message: string;
  };
}

export function EmailSystemStatusCard() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticState | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const fetchDiagnostics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/email-diagnostics');
      const data = await res.json();
      setDiagnostics(data);
    } catch {
      toast.error('No se pudo obtener el diagnóstico del servidor de correo');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDiagnostics();
  }, [fetchDiagnostics]);

  const handleSendTest = async (channel: 'resend' | 'smtp' | 'security') => {
    const target = testEmail.trim() || 'fisiomirror@proton.me';
    setSendingTest(true);
    try {
      let res;
      if (channel === 'resend') {
        res = await fetch('/api/send-token-resend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: target,
            name: 'Usuario de Prueba',
            token: '123456',
            therapistName: 'FisioMirror Diagnóstico',
            activationLink: window.location.origin + '/auth?token=123456',
          }),
        });
      } else if (channel === 'smtp') {
        res = await fetch('/api/send-patient-invite-smtp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: target,
            patientName: 'Usuario de Prueba',
            token: '123456',
            therapistName: 'FisioMirror Diagnóstico',
            activationLink: window.location.origin + '/auth?token=123456',
          }),
        });
      } else {
        res = await fetch('/api/send-security-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: target,
            event: 'test_alert',
            details: 'Prueba de alerta de seguridad ejecutada manualmente desde Configuración.',
          }),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`¡Prueba enviada a ${target}!`, {
          description: data.details || 'Revisa tu bandeja de entrada o carpeta de spam.',
        });
      } else {
        toast.error(`Error en la prueba: ${data.error || 'Fallo desconocido'}`, {
          description: data.details || 'Revisa el reporte de diagnóstico a continuación.',
        });
      }
      fetchDiagnostics();
    } catch (err: any) {
      toast.error('Error de red al enviar prueba: ' + err.message);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Diagnóstico de Correo y Notificaciones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estado en tiempo real de Resend, servidor SMTP y notificaciones de seguridad.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchDiagnostics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar Diagnóstico</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Resend API (En pausa hasta verificar dominio) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5 opacity-90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Resend API</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
              <AlertTriangle size={11} /> Pendiente Dominio
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Configuración intacta en backend. Pendiente de verificación de registros DNS del dominio para habilitar envíos a cualquier destinatario.
          </p>

          <div className="text-[10px] text-slate-500 font-mono pt-1">
            Cuenta: {diagnostics?.resend?.accountOwner || 'fisiomirror@proton.me'}
          </div>
        </div>

        {/* 2. Servidor SMTP */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Servidor SMTP</span>
            </div>
            {diagnostics?.smtp?.connectionOk ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={11} /> Conectado
              </span>
            ) : diagnostics?.smtp?.configured ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                <AlertTriangle size={11} /> Error de conexión
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Info size={11} /> Vía Supabase
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {diagnostics?.smtp?.message || 'Verificando variables SMTP...'}
          </p>

          <div className="text-[10px] text-slate-500 font-mono pt-1">
            Host: {diagnostics?.smtp?.host || 'Supabase Auth (Por defecto)'}
          </div>
        </div>

        {/* 3. Seguridad y Auditoría */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Alertas de Seguridad</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 size={11} /> Activo
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Notificaciones de cambio de contraseña, tokens de sesión y recuperación registradas con hash SHA-256 en base de datos.
          </p>

          <div className="text-[10px] text-slate-500 font-mono pt-1">
            Tabla: notifications (Real-time sync)
          </div>
        </div>
      </div>

      {/* Manual Test Box */}
      <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 space-y-3">
        <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-2">
          <Send size={14} />
          <span>Realizar Envío de Prueba</span>
        </h4>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="fisiomirror@proton.me (o correo de prueba)"
            className="w-full sm:flex-1 px-3.5 py-2 rounded-xl text-xs border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={sendingTest}
              onClick={() => handleSendTest('smtp')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
            >
              {sendingTest ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Server size={13} />
              )}
              <span>Test SMTP Directo</span>
            </button>
            <button
              type="button"
              disabled={sendingTest}
              onClick={() => handleSendTest('security')}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <ShieldCheck size={13} />
              <span>Test Alerta</span>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-teal-800 dark:text-teal-300">
          Tip: Si usas Resend en modo Sandbox, debes ingresar <strong>fisiomirror@proton.me</strong> para recibir el correo exitosamente. Para otros correos, configura tu dominio en Resend o ingresa credenciales SMTP.
        </p>
      </div>

      {/* Resend Domain Verification Helper Guide */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white">
            ¿Cómo habilitar envíos masivos a cualquier paciente?
          </span>
          <a
            href="https://resend.com/domains"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400 hover:underline"
          >
            <span>Verificar Dominio en Resend</span>
            <ExternalLink size={12} />
          </a>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <li>Entra a <strong>resend.com/domains</strong> con tu cuenta (fisiomirror@proton.me).</li>
          <li>Agrega tu dominio propio (ej: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">fisiomirror.com</code>) y copia los registros DNS (TXT, MX).</li>
          <li>Una vez verificado, define <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">RESEND_FROM=FisioMirror &lt;soporte@tudominio.com&gt;</code> en tu archivo de variables de entorno.</li>
          <li>Alternativamente, agrega tus credenciales de correo institucional en <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">SMTP_HOST</code>, <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">SMTP_USER</code> y <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">SMTP_PASS</code>.</li>
        </ol>
      </div>
    </div>
  );
}
