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
  Server,
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
  // Modo de envío de correo: 'smtp' (servidor SMTP directo) o 'native' (mailto: app local)
  // 'resend' se mantiene en el backend y funciones, pero se oculta de la interfaz hasta configurar dominio
  const [emailSubMode, setEmailSubMode] = useState<'smtp' | 'native' | 'resend'>('smtp');

  const [recipientName, setRecipientName] = useState(
    propRecipientName || propPatientName || 'Paciente'
  );
  const [email, setEmail] = useState(initialEmail || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [therapistPhone, setTherapistPhone] = useState(
    (user as any)?.telefono || (user as any)?.phone || ''
  );
  const [copied, setCopied] = useState(false);
  const [sendingResend, setSendingResend] = useState(false);
  const [sendingSmtp, setSendingSmtp] = useState(false);

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

  // 1. Enviar mediante cliente de correo nativo (mailto:)
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
      description: 'Se preparó el mensaje en tu cliente nativo con todos los datos autorrellenados.',
    });
    onClose();
  };

  // 2. Enviar directamente vía API de Resend (Edge function / API)
  const handleSendResend = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Por favor ingresa un correo electrónico válido para el paciente');
      return;
    }

    setSendingResend(true);
    try {
      // Registrar notificación interna en BD
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.trim().toLowerCase())
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

      // Intentar primero con Edge Function de Supabase
      let success = false;
      let errorDesc = '';

      try {
        const { data, error } = await supabase.functions.invoke('send-patient-token-resend', {
          body: {
            email: email.trim().toLowerCase(),
            name: recipientName || 'Paciente',
            token,
            therapistName: senderName,
            therapistEmail: senderEmail,
            therapistPhone: effectiveSenderPhone,
            activationLink,
          },
        });

        if (!error && data?.success) {
          success = true;
        } else if (error) {
          errorDesc = error.message;
        }
      } catch (invokeErr: any) {
        errorDesc = invokeErr.message;
      }

      // Fallback a API local proxy (/api/send-token-resend)
      if (!success) {
        const res = await fetch('/api/send-token-resend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
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
          success = true;
        } else {
          errorDesc = data.error || errorDesc || 'Error al procesar con Resend';
        }
      }

      if (success) {
        toast.success(`¡Correo enviado a ${email} vía Resend!`, {
          description: 'El paciente recibió su token de 6 dígitos con diseño profesional.',
        });
        onClose();
      } else {
        if (errorDesc.toLowerCase().includes('verified') || errorDesc.includes('testing')) {
          toast.error('Resend modo prueba (emails verificados)', {
            description:
              'En modo prueba de Resend el destinatario debe estar verificado. Utiliza la opción "SMTP Supabase" o "App de Correo Nativa" para enviar de inmediato.',
          });
          setEmailSubMode('smtp');
        } else {
          toast.error(errorDesc || 'No se pudo enviar por Resend');
        }
      }
    } catch {
      toast.error('Error de conexión con Resend', {
        description: 'Puedes usar el botón "SMTP Supabase" o "App de Correo Nativa".',
      });
    } finally {
      setSendingResend(false);
    }
  };

  // 3. Enviar mediante SMTP configurado en Supabase (Edge function / API)
  const handleSendSmtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Por favor ingresa un correo electrónico válido para el paciente');
      return;
    }

    setSendingSmtp(true);
    try {
      let success = false;
      let errorDesc = '';

      // Intentar primero con Edge Function de Supabase
      try {
        const { data, error } = await supabase.functions.invoke('send-patient-invite-smtp', {
          body: {
            email: email.trim().toLowerCase(),
            token,
            patientName: recipientName || 'Paciente',
            therapistName: senderName,
            therapistEmail: senderEmail,
            therapistPhone: effectiveSenderPhone,
            activationLink,
          },
        });

        if (!error && data?.success) {
          success = true;
        } else if (error) {
          errorDesc = error.message;
        }
      } catch (edgeErr: any) {
        errorDesc = edgeErr.message;
      }

      // Fallback a API local proxy (/api/send-patient-invite-smtp)
      if (!success) {
        const res = await fetch('/api/send-patient-invite-smtp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
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
          success = true;
        } else {
          errorDesc = data.error || errorDesc || 'Error al procesar con SMTP';
        }
      }

      if (success) {
        if (user?.id) {
          notifyTokenCreated({
            therapistId: user.id,
            patientName: recipientName || 'Paciente',
            token,
          }).catch(() => {});
        }
        toast.success(`¡Enlace y token enviados por SMTP a ${email}!`, {
          description: 'El paciente recibió las instrucciones a través del servidor de correo seguro.',
        });
        onClose();
      } else {
        toast.error(`No se pudo enviar por SMTP: ${errorDesc}`, {
          description: 'Puedes utilizar la opción "App de Correo Nativa" para enviarlo de inmediato desde tu dispositivo.',
        });
      }
    } catch {
      toast.error('Error al contactar con el servicio SMTP', {
        description: 'Usa la "App de Correo Nativa" para enviar desde tu cliente de correo predeterminado.',
      });
    } finally {
      setSendingSmtp(false);
    }
  };

  // 4. Enviar por WhatsApp
  const handleSendWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageBody)}`
      : `https://wa.me/?text=${encodeURIComponent(messageBody)}`;
    triggerLink(waUrl, '_blank');
    toast.success('Abriendo WhatsApp con el mensaje estructurado');
    onClose();
  };

  // 5. Enviar por SMS nativo
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

                {/* Email Delivery Options Selector */}
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Canal de envío por correo:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setEmailSubMode('smtp')}
                      className={`p-2 rounded-xl text-center font-semibold transition-all flex flex-col items-center justify-center ${
                        emailSubMode === 'smtp'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50'
                      }`}
                    >
                      <Server size={14} className="mb-0.5" />
                      <span>Envío Directo (SMTP)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailSubMode('native')}
                      className={`p-2 rounded-xl text-center font-semibold transition-all flex flex-col items-center justify-center ${
                        emailSubMode === 'native'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50'
                      }`}
                    >
                      <ExternalLink size={14} className="mb-0.5" />
                      <span>App del Dispositivo</span>
                    </button>
                  </div>

                  {/* Contextual helper badge without emojis */}
                  <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                    {emailSubMode === 'smtp' && (
                      <span>
                        <strong>Servidor SMTP Directo:</strong> Envío seguro automatizado con diseño HTML institucional directo a la bandeja del paciente.
                      </span>
                    )}
                    {emailSubMode === 'native' && (
                      <span>
                        <strong>App del Dispositivo:</strong> Abre tu gestor de correo predeterminado (Gmail, Outlook, Apple Mail) con el mensaje preparado.
                      </span>
                    )}
                  </div>
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
                    Teléfono de WhatsApp del paciente (con código de país ej: +34, +58, +52, +57)
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
                  {emailSubMode === 'resend' && (
                    <button
                      type="button"
                      onClick={handleSendResend}
                      disabled={sendingResend}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 disabled:opacity-60"
                    >
                      {sendingResend ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      <span>Enviar por Resend (Edge Function)</span>
                    </button>
                  )}

                  {emailSubMode === 'smtp' && (
                    <button
                      type="button"
                      onClick={handleSendSmtp}
                      disabled={sendingSmtp}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 disabled:opacity-60"
                    >
                      {sendingSmtp ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Server size={14} />
                      )}
                      <span>Enviar vía Servidor SMTP Directo</span>
                    </button>
                  )}

                  {emailSubMode === 'native' && (
                    <button
                      type="button"
                      onClick={handleOpenNativeMail}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
                    >
                      <Mail size={14} />
                      <span>Abrir App de Correo del Dispositivo</span>
                    </button>
                  )}
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
                  <span>Enviar por App de SMS del Dispositivo</span>
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
