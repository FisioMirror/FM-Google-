import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    email,
    token,
    patientName = 'Paciente',
    therapistName = 'Tu Fisioterapeuta',
    therapistEmail,
    therapistPhone,
    activationLink,
    smtpConfig,
  } = req.body || {};

  const cleanEmail = email ? email.trim().toLowerCase() : '';
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ success: false, error: 'Email de paciente inválido o no especificado' });
  }

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token de activación no especificado' });
  }

  const targetLink =
    activationLink ||
    `https://fisiomirror.app/registro-paciente?token=${encodeURIComponent(token)}`;

  // Priority 1: Check if direct SMTP configuration is provided in env or request
  const smtpHost = (process.env.SMTP_HOST || smtpConfig?.host || '').trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || smtpConfig?.port || '587', 10);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpConfig?.secure === true || smtpPort === 465;
  const smtpUser = (process.env.SMTP_USER || smtpConfig?.user || '').trim();
  const rawPass = (process.env.SMTP_PASS || smtpConfig?.pass || '').trim();
  // Sanitize password: strip all spaces, tabs and zero-width chars (Google App Passwords are 16 characters displayed with spaces)
  const smtpPass = rawPass.replace(/\s+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  const smtpFrom = (process.env.SMTP_FROM || smtpConfig?.from || `FisioMirror <${smtpUser || 'notificaciones@fisiomirror.app'}>`).trim();

  const hasDirectSmtp = Boolean(smtpHost && smtpUser && smtpPass);

  // Template HTML para el correo del paciente
  const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso FisioMirror</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 16px; color: #1e293b;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    <tr>
      <td style="padding: 36px 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">FisioMirror</h1>
        <p style="margin: 6px 0 0 0; color: #ccfbf1; font-size: 13px; font-weight: 500;">Tele-rehabilitación con Biofeedback y Visión Artificial</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px 32px;">
        <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">¡Hola, ${patientName}!</h2>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
          Tu fisioterapeuta <strong>${therapistName}</strong> ha configurado tu plan de rehabilitación personalizado en FisioMirror. A continuación tienes tu código de activación exclusivo de 6 dígitos:
        </p>
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto; width: 100%; max-width: 380px;">
          <tr>
            <td style="background-color: #f0fdfa; border: 2px dashed #0d9488; border-radius: 18px; padding: 22px; text-align: center;">
              <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0f766e; letter-spacing: 1.5px; margin-bottom: 6px;">TU TOKEN DE ACTIVACIÓN</span>
              <span style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 800; color: #0f766e; letter-spacing: 6px; display: inline-block;">${token}</span>
            </td>
          </tr>
        </table>
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto; text-align: center;">
          <tr>
            <td align="center" style="border-radius: 14px; background-color: #0d9488;">
              <a href="${targetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 14px;">
                Activar Mi Plan en FisioMirror →
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 12px 0; font-size: 13px; line-height: 1.5; color: #64748b;">
          <strong>Pasos sencillos:</strong><br>
          1. Haz clic en el botón de arriba o ingresa a FisioMirror.<br>
          2. Completa tu nombre y contraseña para vincular tu expediente médico.<br>
          3. Sigue los ejercicios guiados por la cámara con corrección de postura en tiempo real.
        </p>
        <div style="margin-top: 28px; padding: 18px 20px; background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">Profesional a Cargo:</div>
          <div>• Fisioterapeuta: <strong>${therapistName}</strong></div>
          ${therapistEmail ? `<div>• Correo: <a href="mailto:${therapistEmail}" style="color: #0d9488; text-decoration: none;">${therapistEmail}</a></div>` : ''}
          ${therapistPhone ? `<div>• Teléfono: <strong>${therapistPhone}</strong></div>` : ''}
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          Este es un correo seguro de FisioMirror. Si no solicitaste este tratamiento, puedes ignorar este mensaje.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Try Direct SMTP first if configured
  if (hasDirectSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: cleanEmail,
        subject: `FisioMirror — Token de acceso para tu rehabilitación (${token})`,
        html: emailHtml,
      });

      // Notificación en Supabase BD
      try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mnkqfrulcpxpwaftokdi.supabase.co';
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3FmcnVsY3B4cHdhZnRva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5OTAsImV4cCI6MjA5NzY0Njk5MH0.lsbk4vs8F3uvp4gOqs0Ydz7V7zh04MJqWC919KssRQ0';
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: prof } = await supabase.from('profiles').select('id').eq('email', cleanEmail).maybeSingle();
        if (prof?.id) {
          await supabase.from('notifications').insert({
            user_id: prof.id,
            title: `Llave de Acceso: ${token}`,
            message: `${therapistName} te ha enviado tu clave de tratamiento (${token}). Haz clic para comenzar tu rehabilitación en FisioMirror.`,
            type: 'rutina',
            link: targetLink,
            read: false,
          });
        }
      } catch {
        // non-blocking
      }

      return res.status(200).json({
        success: true,
        method: 'direct_smtp',
        message: `Correo enviado exitosamente a ${cleanEmail} vía SMTP (${smtpHost}:${smtpPort})`,
        messageId: info.messageId,
        email: cleanEmail,
        token,
      });
    } catch (smtpErr) {
      console.warn('Direct SMTP notice (intentando canal de respaldo):', smtpErr.message || smtpErr);
      // Si falla SMTP directo (ej. timeout o error de servidor), no crasheamos; continuamos a los canales de respaldo.
    }
  }

  // Priority 2: Try Resend fallback if available
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'FisioMirror <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: `FisioMirror — Token de acceso para tu rehabilitación (${token})`,
          html: emailHtml,
        }),
      });

      if (resendRes.ok) {
        const resendData = await resendRes.json();
        return res.status(200).json({
          success: true,
          method: 'resend_fallback',
          message: `Correo enviado exitosamente a ${cleanEmail} vía Resend.`,
          messageId: resendData.id,
          email: cleanEmail,
          token,
        });
      }
    } catch (resendFallbackErr) {
      console.warn('Resend fallback notice:', resendFallbackErr.message || resendFallbackErr);
    }
  }

  // Priority 3: Try Supabase Auth Mailer
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mnkqfrulcpxpwaftokdi.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3FmcnVsY3B4cHdhZnRva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5OTAsImV4cCI6MjA5NzY0Njk5MH0.lsbk4vs8F3uvp4gOqs0Ydz7V7zh04MJqWC919KssRQ0';

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let authSent = false;
    let authError = null;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: targetLink,
          data: {
            token,
            patient_name: patientName,
            therapist_name: therapistName,
            therapist_email: therapistEmail,
            therapist_phone: therapistPhone,
            role: 'paciente',
          },
        },
      });

      if (!error) {
        authSent = true;
      } else {
        authError = error.message;
      }
    } catch (otpErr) {
      authError = otpErr.message;
    }

    if (authSent) {
      return res.status(200).json({
        success: true,
        method: 'supabase_smtp',
        message: `Correo enviado a ${cleanEmail} mediante el servidor SMTP de Supabase.`,
        email: cleanEmail,
        token,
      });
    }

    // Both direct SMTP was missing and Supabase Auth failed
    return res.status(400).json({
      success: false,
      code: 'SMTP_CONFIG_REQUIRED',
      error: `No hay credenciales SMTP directas en el servidor y el SMTP de Supabase retornó: "${authError || 'Error sending confirmation email'}". Puedes configurar SMTP_HOST, SMTP_USER y SMTP_PASS en las variables de entorno, o usar el botón "App de Correo Nativa" (mailto:) para enviar de inmediato desde tu dispositivo.`,
      details: { supabaseError: authError },
    });
  } catch (error) {
    console.warn('Notice handling SMTP send:', error.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error del servicio SMTP',
    });
  }
}
