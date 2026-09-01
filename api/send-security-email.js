import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_RESEND_KEY = process.env.RESEND_API_KEY || '';

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

  try {
    const {
      email,
      event = 'password_updated', // 'password_updated', 'recovery_requested', 'login_alert'
      userName = 'Usuario',
      details,
    } = req.body || {};

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Email inválido o no especificado' });
    }

    const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'America/Caracas' });

    let subject = 'FisioMirror — Alerta de Seguridad de Cuenta';
    let titleText = 'Alerta de Seguridad';
    let messageText = '';

    if (event === 'password_updated') {
      subject = 'FisioMirror — Tu contraseña ha sido actualizada';
      titleText = 'Contraseña Actualizada';
      messageText = `Te informamos que la contraseña de tu cuenta en FisioMirror (${cleanEmail}) ha sido modificada exitosamente el ${timestamp}. Si fuiste tú, puedes ignorar este mensaje. Si no realizaste esta acción, te recomendamos cambiar tu contraseña inmediatamente o contactar a soporte.`;
    } else if (event === 'recovery_requested') {
      subject = 'FisioMirror — Solicitud de Restablecimiento de Contraseña';
      titleText = 'Recuperación de Cuenta';
      messageText = `Se ha solicitado restablecer la contraseña de tu cuenta (${cleanEmail}) el ${timestamp}. Si no solicitaste este cambio, tu cuenta sigue estando segura y puedes desestimar esta notificación.`;
    } else {
      subject = 'FisioMirror — Notificación de Seguridad';
      titleText = 'Actividad de Seguridad';
      messageText = details || `Se registró una actividad importante de seguridad en tu cuenta el ${timestamp}.`;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 16px; color: #1e293b;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    <tr>
      <td style="padding: 28px 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">FisioMirror • Seguridad</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <div style="display: inline-block; padding: 6px 12px; background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; color: #0d9488; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">
          ${titleText}
        </div>
        <h2 style="margin: 0 0 14px 0; color: #0f172a; font-size: 18px; font-weight: 700;">Hola, ${userName}</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
          ${messageText}
        </p>
        <div style="padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <strong>Fecha y hora del evento:</strong> ${timestamp}<br>
          <strong>Cuenta afectada:</strong> ${cleanEmail}
        </div>
        <div style="margin-top: 18px; padding: 12px 14px; background-color: #f0fdfa; border-radius: 10px; border-left: 3px solid #0d9488; font-size: 11px; line-height: 1.5; color: #134e4a;">
          <strong>Nota:</strong> Si este correo llegó a tu carpeta de <em>Spam</em> o <em>Correo no deseado</em>, márcalo como 'No es spam' para recibir alertas críticas a tiempo.
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 18px 32px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
        Este es un mensaje de seguridad automático generado por la plataforma FisioMirror.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 1. Guardar notificación interna en Supabase
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mnkqfrulcpxpwaftokdi.supabase.co';
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3FmcnVsY3B4cHdhZnRva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5OTAsImV4cCI6MjA5NzY0Njk5MH0.lsbk4vs8F3uvp4gOqs0Ydz7V7zh04MJqWC919KssRQ0';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (prof?.id) {
        await supabase.from('notifications').insert({
          user_id: prof.id,
          title: titleText,
          message: messageText,
          type: 'seguridad',
          read: false,
        });
      }
    } catch (dbErr) {
      console.warn('Security notification insert notice:', dbErr);
    }

    // 2. Enviar por Resend (Prioridad 1 - Dominio verificado fisiomirror.me)
    const resendApiKey = (process.env.RESEND_API_KEY || DEFAULT_RESEND_KEY).trim();
    const fromSender = (process.env.RESEND_FROM || 'FisioMirror Seguridad <notificaciones@fisiomirror.me>').trim();

    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromSender,
            to: [cleanEmail],
            subject,
            html: htmlContent,
          }),
        });

        const resendData = await resendRes.json();
        if (resendRes.ok && resendData.id) {
          return res.status(200).json({ success: true, method: 'resend_verified', id: resendData.id });
        }
      } catch (resendErr) {
        console.warn('Security email Resend notice:', resendErr);
      }
    }

    // 3. Enviar por SMTP como respaldo si está configurado
    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const rawPass = (process.env.SMTP_PASS || '').trim();
    const smtpPass = rawPass.replace(/\s+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `FisioMirror Seguridad <${smtpUser}>`,
          to: cleanEmail,
          subject,
          html: htmlContent,
        });

        return res.status(200).json({ success: true, method: 'direct_smtp', email: cleanEmail });
      } catch (smtpErr) {
        console.warn('Security email SMTP warning:', smtpErr);
      }
    }

    return res.status(200).json({
      success: true,
      method: 'logged_in_db',
      note: 'Notificación registrada en sistema y base de datos de Supabase',
    });
  } catch (error) {
    console.error('Error in send-security-email:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
