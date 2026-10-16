import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Send,
  X,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useToast } from './ToastProvider';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { notifyTokenCreated } from '../../lib/notificationService';

export interface SendTokenModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  token: string;
  recipientName?: string | null;
  patientName?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
}

export function SendTokenModal({
  open,
  isOpen,
  onClose,
  token,
  recipientName: propRecipientName,
  patientName: propPatientName,
  recipientEmail: initialEmail = '',
  recipientPhone: initialPhone = '',
}: SendTokenModalProps) {
  const isModalOpen = open ?? isOpen ?? false;
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'sms'>('email');
  const [recipientName, setRecipientName] = useState(
    propRecipientName || propPatientName || 'Paciente'
  );
  const [email, setEmail] = useState(initialEmail || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [therapistPhone, setTherapistPhone] = useState(
    (user as any)?.telefono || (user as any)?.phone || ''
  );
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Load therapist's phone and patient's data from Supabase if not prefilled
  const fetchAssociatedData = useCallback(async () => {
    try {
      // 1. Fetch therapist phone if missing
      if (user?.id && !therapistPhone) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('telefono, email, full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (prof?.telefono) {
          setTherapistPhone(prof.telefono);
        }
      }

      // 2. Fetch patient info if email/phone are missing
      if (token && (!email || !phone)) {
        const { data: tokData } = await supabase
          .from('activation_tokens')
          .select('paciente_id')
          .eq('token', token)
          .maybeSingle();

        if (tokData?.paciente_id) {
          const { data: patProf } = await supabase
            .from('profiles')
            .select('full_name, email, telefono')
            .eq('id', tokData.paciente_id)
            .maybeSingle();

          if (patProf) {
            if (!recipientName || recipientName === 'Paciente') {
              setRecipientName(patProf.full_name || 'Paciente');
            }
            if (!email && patProf.email && !patProf.email.includes('@fisiomirror.paciente')) {
              setEmail(patProf.email);
            }
            if (!phone && patProf.telefono) {
              setPhone(patProf.telefono);
            }
          }
        }
      }
    } catch {
      // silent background lookup
    }
  }, [user?.id, therapistPhone, token, email, phone, recipientName]);

  useEffect(() => {
    if (isModalOpen) {
      fetchAssociatedData();
    }
  }, [isModalOpen, fetchAssociatedData]);

  // Sync state whenever props change
  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail);
    if (initialPhone && !phone) setPhone(initialPhone);
    if ((propRecipientName || propPatientName) && recipientName === 'Paciente') {
      setRecipientName(propRecipientName || propPatientName || 'Paciente');
    }
  }, [initialEmail, initialPhone, propRecipientName, propPatientName, email, phone, recipientName]);

  const activationLink = `${window.location.origin}/registro-paciente?token=${encodeURIComponent(token)}`;
  const senderName = user?.full_name || 'Fisioterapeuta';
  const senderEmail = user?.email || '';
  const effectiveSenderPhone = therapistPhone || (user as any)?.telefono || '';

  const emailSubject = `FisioMirror — Token de acceso para tu rehabilitación (${token})`;
  const messageBody = `Hola ${recipientName || 'paciente'},

Tu fisioterapeuta ${senderName} te ha asignado un plan de rehabilitación personalizado en FisioMirror.

--------------------------------------------------
TU TOKEN DE ACTIVACIÓN: ${token}
--------------------------------------------------

Instrucciones para comenzar:
1. Entra a este enlace: ${activationLink}
2. Ingresa tu token (${token}) para vincular tu expediente.
3. Configura tu acceso y comienza tus ejercicios guiados por biofeedback en tiempo real.

Datos del Profesional Tratante:
• Fisioterapeuta: ${senderName}
${senderEmail ? `• Correo de contacto: ${senderEmail}\n` : ''}${effectiveSenderPhone ? `• Teléfono de consulta: ${effectiveSenderPhone}\n` : ''}
Saludos cordiales,
Equipo FisioMirror`;

  const smsText = `FisioMirror: Hola ${recipientName || 'paciente'}, ${senderName} te asigno tu rutina. Tu TOKEN es: ${token}. Activa tu plan en: ${activationLink} ${effectiveSenderPhone ? `(Contacto Dr: ${effectiveSenderPhone})` : ''}`;

  const triggerLink = (url: string, target = '_self') => {
    try {
      const a = document.createElement('a');
      a.href = url;
      if (target === '_blank') a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 500);
    } catch {
      window.location.href = url;
    }
  };

  const handleCopy = () => {
    const textToCopy = channel === 'sms' ? smsText : messageBody;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Mensaje copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Abrir en gestor de correo del dispositivo (mailto:)
  const handleOpenNativeMail = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Por favor ingresa un correo electrónico válido para el paciente');
      return;
    }

    const ccParam = senderEmail ? `&cc=${encodeURIComponent(senderEmail)}` : '';
    const mailtoUrl = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(
      emailSubject
    )}${ccParam}&body=${encodeURIComponent(messageBody)}`;

    triggerLink(mailtoUrl);

    toast.success(`Abriendo aplicación de correo para ${email}`, {
      description: 'Se preparó el mensaje con el token y las instrucciones de acceso.',
    });
    onClose();
  };

  // 2. Envío Automático Inteligente (Resend Dominio Verificado -> Respaldo SMTP)
  const handleSendUnifiedEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Por favor ingresa un correo electrónico válido para el paciente');
      return;
    }

    setSendingEmail(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // Registrar notificación interna en Supabase si el paciente ya tiene cuenta
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (prof?.id) {
          await supabase.from('notifications').insert({
            user_id: prof.id,
            title: 'Nuevo Token de Rehabilitación',
            message: `Tu fisioterapeuta ${senderName} te ha enviado el token ${token} para tu tratamiento.`,
            type: 'sistema',
            link: `/registro-paciente?token=${token}`,
            read: false,
          });
        }
      } catch (err) {
        console.warn('Notification insert notice:', err);
      }

      let delivered = false;
      let errorReason = '';

      // Paso A: Intentar envío directo con Resend (Dominio verificado fisiomirror.me)
      try {
        const res = await fetch('/api/send-token-resend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            name: recipientName || 'Paciente',
            token,
            therapistName: senderName,
            therapistEmail: senderEmail,
            therapistPhone: effectiveSenderPhone,
            activationLink,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          delivered = true;
        } else {
          errorReason = data.error || '';
        }
      } catch (resendErr: any) {
        errorReason = resendErr?.message || '';
      }

      // Paso B: Si falló Resend, intentar automáticamente por el canal SMTP de respaldo
      if (!delivered) {
        try {
          const res = await fetch('/api/send-patient-invite-smtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              token,
              patientName: recipientName || 'Paciente',
              therapistName: senderName,
              therapistEmail: senderEmail,
              therapistPhone: effectiveSenderPhone,
              activationLink,
            }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            delivered = true;
          } else {
            errorReason = data.error || errorReason || 'Fallo de entrega';
          }
        } catch (smtpErr: any) {
          errorReason = smtpErr?.message || errorReason;
        }
      }

      // Resultado al usuario
      if (delivered) {
        if (user?.id) {
          notifyTokenCreated({
            therapistId: user.id,
            patientName: recipientName || 'Paciente',
            token,
          }).catch(() => {});
        }

        toast.success(`¡Invitación enviada a ${cleanEmail}!`, {
          description: 'Se enviaron las credenciales. Indica al paciente que revise su bandeja principal o carpeta de spam si no lo ve de inmediato.',
        });
        onClose();
      } else {
        toast.error(`No se pudo completar el envío automático`, {
          description: errorReason
            ? `${errorReason}. Puedes usar el botón "Abrir en mi app de correo" o WhatsApp para enviarlo de inmediato.`
            : 'Puedes abrir tu aplicación de correo o compartir el mensaje por WhatsApp.',
        });
      }
    } catch {
      toast.error('Error de conexión', {
        description: 'Puedes utilizar la opción "Abrir en mi app de correo" o copiar el mensaje.',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // 3. Enviar por WhatsApp
  const handleSendWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageBody)}`
      : `https://wa.me/?text=${encodeURIComponent(messageBody)}`;
    triggerLink(waUrl, '_blank');
    toast.success('Abriendo WhatsApp con el mensaje estructurado');
    onClose();
  };

  // 4. Enviar por SMS nativo
  const handleSendSMS = () => {
    if (!phone.trim()) {
      toast.error('Por favor ingresa un número de teléfono para el paciente');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const sep = isIOS ? '&' : '?';
    const smsUrl = `sms:${cleanPhone}${sep}body=${encodeURIComponent(smsText)}`;

    triggerLink(smsUrl);
    toast.success(`Abriendo aplicación de SMS para ${phone}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/50 dark:border-teal-800/50">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Enviar Llave de Acceso
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Token:{' '}
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400 tracking-wider">
                      {token}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Cerrar ventana"
              >
                <X size={18} />
              </button>
            </div>

            {/* Remitente y Destinatario Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40">
                <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  <Stethoscope size={13} />
                  <span>Fisio Remitente</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-white truncate">{senderName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {senderEmail || 'Email registrado'}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Phone size={10} className="text-teal-600" />
                  <input
                    type="tel"
                    value={therapistPhone}
                    onChange={(e) => setTherapistPhone(e.target.value)}
                    placeholder="Teléfono del fisio"
                    className="w-full text-[10px] bg-transparent border-b border-teal-300 dark:border-teal-700 font-mono text-teal-700 dark:text-teal-300 outline-none placeholder:text-teal-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  <UserCheck size={13} />
                  <span>Paciente Destinatario</span>
                </div>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nombre del paciente"
                  className="font-bold text-slate-800 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 outline-none w-full truncate"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {channel === 'email' ? email || 'Ingresa el correo' : phone || 'Ingresa el teléfono'}
                </p>
                <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded font-semibold">
                  Vinculación directa
                </span>
              </div>
            </div>

            {/* Channels Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  channel === 'email'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail size={15} />
                <span>Correo Email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  channel === 'whatsapp'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare size={15} />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  channel === 'sms'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone size={15} />
                <span>SMS</span>
              </button>
            </div>

            {/* Channel: EMAIL */}
            {channel === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correo electrónico del paciente
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="paciente@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                    />
                  </div>
                </div>

                {/* Spam Reminder & Feature Box */}
                <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200">
                    <Sparkles size={14} className="text-teal-600 dark:text-teal-400" />
                    <span>Envío Oficial FisioMirror</span>
                  </div>
                  <p className="text-[11px] text-teal-800/90 dark:text-teal-300/90 leading-relaxed">
                    El paciente recibirá una plantilla profesional con su token de acceso rápido y botón de activación directa.
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug pt-1 border-t border-teal-200/50 dark:border-teal-800/40">
                    Incluye recordatorio automático para revisar la carpeta de <em>Spam / Correo no deseado</em>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vista previa del mensaje
                  </label>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[11px] font-mono leading-relaxed text-slate-700 dark:text-slate-300 max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {messageBody}
                  </div>
                </div>
              </div>
            )}

            {/* Channel: WHATSAPP */}
            {channel === 'whatsapp' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono de WhatsApp del paciente
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+34 612 345 678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vista previa de mensaje estructurado
                  </label>
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-mono leading-relaxed text-emerald-950 dark:text-emerald-200 max-h-28 overflow-y-auto whitespace-pre-wrap">
                    {messageBody}
                  </div>
                </div>
              </div>
            )}

            {/* Channel: SMS */}
            {channel === 'sms' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Número telefónico registrado del paciente
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+34 612 345 678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Texto del SMS (conciso)
                  </label>
                  <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-[11px] font-mono leading-relaxed text-blue-950 dark:text-blue-200 max-h-28 overflow-y-auto whitespace-pre-wrap">
                    {smsText}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {channel === 'email' && (
                <>
                  <button
                    type="button"
                    onClick={handleSendUnifiedEmail}
                    disabled={sendingEmail}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 disabled:opacity-60"
                  >
                    {sendingEmail ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>{sendingEmail ? 'Enviando invitación...' : 'Enviar Correo de Invitación'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenNativeMail}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>Abrir en mi gestor de correo</span>
                  </button>
                </>
              )}

              {channel === 'whatsapp' && (
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <ExternalLink size={14} />
                  <span>Abrir en WhatsApp</span>
                </button>
              )}

              {channel === 'sms' && (
                <button
                  type="button"
                  onClick={handleSendSMS}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Send size={14} />
                  <span>Enviar por SMS</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Mensaje Completo'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
