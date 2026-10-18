import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'sms'>('email');
  const [recipientName, setRecipientName] = useState(
    propRecipientName || propPatientName || t('common.patient')
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
            if (!recipientName || recipientName === t('common.patient')) {
              setRecipientName(patProf.full_name || t('common.patient'));
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
    if ((propRecipientName || propPatientName) && recipientName === t('common.patient')) {
      setRecipientName(propRecipientName || propPatientName || t('common.patient'));
    }
  }, [initialEmail, initialPhone, propRecipientName, propPatientName, email, phone, recipientName]);

  const activationLink = `${window.location.origin}/registro-paciente?token=${encodeURIComponent(token)}`;
  const senderName = user?.full_name || t('common.therapist');
  const senderEmail = user?.email || '';
  const effectiveSenderPhone = therapistPhone || (user as any)?.telefono || '';

  const emailSubject = t('stm.emailSubject', { token });
  const contactLines = (senderEmail ? t('stm.contactEmail', { email: senderEmail }) + '\n' : '') + (effectiveSenderPhone ? t('stm.contactPhone', { phone: effectiveSenderPhone }) + '\n' : '');
  const messageBody = t('stm.mailBody', {
    name: recipientName || t('common.patient'),
    sender: senderName,
    token,
    link: activationLink,
    contactLines,
    nl: '\n',
  });

  const smsText = t('stm.smsBody', {
    name: recipientName || t('common.patient'),
    sender: senderName,
    token,
    link: activationLink,
    contact: effectiveSenderPhone ? t('stm.smsContact', { phone: effectiveSenderPhone }) : '',
  });

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
    toast.success(t('stm.messageCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Abrir en gestor de correo del dispositivo (mailto:)
  const handleOpenNativeMail = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error(t('stm.invalidPatientEmail'));
      return;
    }

    const ccParam = senderEmail ? `&cc=${encodeURIComponent(senderEmail)}` : '';
    const mailtoUrl = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(
      emailSubject
    )}${ccParam}&body=${encodeURIComponent(messageBody)}`;

    triggerLink(mailtoUrl);

    toast.success(t('stm.openingMailApp', { email }), {
      description: t('stm.mailMessageReady'),
    });
    onClose();
  };

  // 2. Envío Automático Inteligente (Resend Dominio Verificado -> Respaldo SMTP)
  const handleSendUnifiedEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error(t('stm.invalidPatientEmail'));
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
            name: recipientName || t('common.patient'),
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
              patientName: recipientName || t('common.patient'),
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
            errorReason = data.error || errorReason || t('stm.deliveryFailed');
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
            patientName: recipientName || t('common.patient'),
            token,
          }).catch(() => {});
        }

        toast.success(t('stm.invitationSent', { email: cleanEmail }), {
          description: t('stm.invitationSentDesc'),
        });
        onClose();
      } else {
        toast.error(t('stm.autoSendFailed'), {
          description: errorReason
            ? t('stm.sendFailedDetail', { error: errorReason })
            : t('stm.sendFailedManual'),
        });
      }
    } catch {
      toast.error(t('common.connError'), {
        description: t('stm.copyOrMailHint'),
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
    toast.success(t('stm.whatsappOpening'));
    onClose();
  };

  // 4. Enviar por SMS nativo
  const handleSendSMS = () => {
    if (!phone.trim()) {
      toast.error(t('stm.invalidPatientPhone'));
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const sep = isIOS ? '&' : '?';
    const smsUrl = `sms:${cleanPhone}${sep}body=${encodeURIComponent(smsText)}`;

    triggerLink(smsUrl);
    toast.success(t('stm.smsOpening', { phone }));
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
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-elevated border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-on-surface max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/50 dark:border-teal-800/50">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-on-surface">
                    {t('stm.title')}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Token:{' '}
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400 tracking-wider">
                      {token}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface-variant hover:text-on-surface-variant dark:hover:text-slate-200 transition-colors"
                aria-label={t('stm.closeWindow')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Remitente y Destinatario Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40">
                <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider text-2xs mb-1">
                  <Stethoscope size={13} />
                  <span>{t('stm.therapistSender')}</span>
                </div>
                <p className="font-bold text-on-surface dark:text-white truncate">{senderName}</p>
                <p className="text-xs text-on-surface-variant truncate">
                  {senderEmail || t('stm.emailRegistered')}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Phone size={10} className="text-teal-600" />
                  <input
                    type="tel"
                    value={therapistPhone}
                    onChange={(e) => setTherapistPhone(e.target.value)}
                    placeholder={t('stm.therapistPhonePlaceholder')}
                    className="w-full text-2xs bg-transparent border-b border-teal-300 dark:border-teal-700 font-mono text-teal-700 dark:text-teal-300 outline-none placeholder:text-teal-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-on-surface-variant font-bold uppercase tracking-wider text-2xs mb-1">
                  <UserCheck size={13} />
                  <span>{t('stm.patientRecipient')}</span>
                </div>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={t('stm.patientNamePlaceholder')}
                  className="font-bold text-on-surface dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 outline-none w-full truncate"
                />
                <p className="text-xs text-on-surface-variant truncate">
                  {channel === 'email' ? email || t('stm.enterEmail') : phone || t('stm.enterPhone')}
                </p>
                <span className="inline-block mt-0.5 text-2xs px-1.5 py-0.2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded font-semibold">
                  {t('stm.directLink')}
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
                    : 'text-on-surface-variant hover:text-on-surface dark:hover:text-white'
                }`}
              >
                <Mail size={15} />
                <span>{t('stm.emailChannel')}</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  channel === 'whatsapp'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface dark:hover:text-white'
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
                    : 'text-on-surface-variant hover:text-on-surface dark:hover:text-white'
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
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('stm.patientEmailLabel')}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('stm.emailPlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-on-surface outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                    />
                  </div>
                </div>

                {/* Spam Reminder & Feature Box */}
                <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200">
                    <Sparkles size={14} className="text-teal-600 dark:text-teal-400" />
                    <span>{t('stm.officialSend')}</span>
                  </div>
                  <p className="text-xs text-teal-800/90 dark:text-teal-300/90 leading-relaxed">
                    {t('stm.emailTemplateDesc')}
                  </p>
                  <p className="text-2xs text-on-surface-variant leading-snug pt-1 border-t border-teal-200/50 dark:border-teal-800/40">
                    {t('stm.spamReminderPrefix')} <em>{t('stm.spamFolder')}</em>{t('stm.spamReminderSuffix')}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('stm.messagePreview')}
                  </label>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-mono leading-relaxed text-on-surface max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {messageBody}
                  </div>
                </div>
              </div>
            )}

            {/* Channel: WHATSAPP */}
            {channel === 'whatsapp' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('stm.whatsappPhoneLabel')}
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+34 612 345 678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-on-surface outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('stm.structuredPreview')}
                  </label>
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-mono leading-relaxed text-emerald-950 dark:text-emerald-200 max-h-28 overflow-y-auto whitespace-pre-wrap">
                    {messageBody}
                  </div>
                </div>
              </div>
            )}

            {/* Channel: SMS */}
            {channel === 'sms' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('stm.smsNumberLabel')}
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+34 612 345 678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-on-surface outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('stm.smsTextLabel')}
                  </label>
                  <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-xs font-mono leading-relaxed text-blue-950 dark:text-blue-200 max-h-28 overflow-y-auto whitespace-pre-wrap">
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
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 active:scale-98 text-on-primary font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20 disabled:opacity-60"
                  >
                    {sendingEmail ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>{sendingEmail ? t('stm.sendingInvitation') : t('stm.sendInvitationEmail')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenNativeMail}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-on-surface font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>{t('stm.openInMailApp')}</span>
                  </button>
                </>
              )}

              {channel === 'whatsapp' && (
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                >
                  <ExternalLink size={14} />
                  <span>{t('stm.openInWhatsApp')}</span>
                </button>
              )}

              {channel === 'sms' && (
                <button
                  type="button"
                  onClick={handleSendSMS}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/20"
                >
                  <Send size={14} />
                  <span>{t('stm.sendBySms')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-on-surface-variant font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? t('stm.copiedToClipboard') : t('stm.copyFullMessage')}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
