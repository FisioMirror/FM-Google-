import nodemailer from 'nodemailer';
import crypto from 'crypto';
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

  try {
    const { email } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Correo electrónico inválido o no proporcionado' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mnkqfrulcpxpwaftokdi.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3FmcnVsY3B4cHdhZnRva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5OTAsImV4cCI6MjA5NzY0Njk5MH0.lsbk4vs8F3uvp4gOqs0Ydz7V7zh04MJqWC919KssRQ0';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Buscar si el usuario existe en profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('email', cleanEmail)
      .maybeSingle();

    // Generar código numérico de 6 dígitos y token criptográfico
    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hexToken = crypto.randomBytes(24).toString('hex');
    const resetToken = `RST-${pinCode}-${hexToken.slice(0, 12)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    // 2. Almacenar el token en activation_tokens para validación atómica
    const { error: tokenInsertError } = await supabase.from('activation_tokens').insert({
      token: resetToken,
      diagnostico: `PASSWORD_RESET:${cleanEmail}:${pinCode}`,
      is_used: false,
      expires_at: expiresAt,
      terapeuta_id: profile?.id || null,
    });

    if (tokenInsertError) {
      console.warn('Notice inserting reset token to activation_tokens:', tokenInsertError.message);
    }

    // 3. Si el usuario existe, registrar notificación interna de seguridad
    if (profile?.id) {
      try {
        await supabase.from('notifications').insert({
          user_id: profile.id,
          title: 'Solicitud de recuperación de contraseña',
          message: `Se ha solicitado restablecer la contraseña de tu cuenta. Si fuiste tú, utiliza el código ${pinCode} o el enlace enviado a tu correo.`,
          type: 'seguridad',
          read: false,
          link: `/reset-password?email=${encodeURIComponent(cleanEmail)}&token=${encodeURIComponent(resetToken)}`,
        });
      } catch (notifErr) {
        console.warn('Notice inserting reset security notification:', notifErr);
      }
    }

    // 4. Construir URL de restablecimiento
    const origin = req.headers.origin || req.headers.referer
      ? new URL(req.headers.origin || req.headers.referer).origin
      : 'https://fisiomirror.app';
    const resetLink = `${origin}/reset-password?email=${encodeURIComponent(cleanEmail)}&token=${encodeURIComponent(resetToken)}`;

    // 5. Configurar transporte SMTP directo (Gmail u otro)
    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const rawPass = (process.env.SMTP_PASS || '').trim();
    const smtpPass = rawPass.replace(/\s+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    const smtpFrom = (process.env.SMTP_FROM || `FisioMirror <${smtpUser || 'notificaciones@fisiomirror.me'}>`).trim();

    const userName = profile?.full_name || 'Estimado/a usuario';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña — FisioMirror</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    <!-- Header -->
    <tr>
      <td style="padding: 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">FisioMirror</h1>
        <p style="margin: 6px 0 0 0; color: #ccfbf1; font-size: 13px; font-weight: 500;">Plataforma de Tele-Rehabilitación Clínica</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 36px 32px;">
        <div style="display: inline-block; padding: 5px 12px; background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; color: #0f766e; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">
          Seguridad de la Cuenta
        </div>

        <h2 style="margin: 0 0 14px 0; color: #0f172a; font-size: 19px; font-weight: 700;">
          Hola, ${userName}
        </h2>

        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
          Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta de FisioMirror (<strong>${cleanEmail}</strong>).
        </p>

        <!-- PIN Box -->
        <div style="margin: 24px 0; padding: 22px; background-color: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1; text-align: center;">
          <span style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
            Código de Verificación (PIN)
          </span>
          <span style="font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 6px; color: #0f766e; display: inline-block;">
            ${pinCode}
          </span>
          <span style="font-size: 11px; color: #94a3b8; display: block; margin-top: 8px;">
            Válido durante 15 minutos
          </span>
        </div>

        <!-- Direct CTA Button -->
        <div style="text-align: center; margin: 28px 0 20px 0;">
          <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);">
            Restablecer Mi Contraseña
          </a>
        </div>

        <!-- Spam Reminder Box -->
        <div style="margin: 24px 0; padding: 14px 16px; background-color: #f0fdfa; border-radius: 12px; border-left: 4px solid #0d9488; font-size: 12px; line-height: 1.5; color: #134e4a;">
          <strong>Nota:</strong> Si no visualizas este mensaje en tu bandeja de entrada principal, por favor revisa tu carpeta de <em>Spam</em> o <em>Correo no deseado</em> y márcalo como seguro.
        </div>

        <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.5; color: #64748b; text-align: center;">
          O copia y pega el siguiente enlace en tu navegador:<br>
          <a href="${resetLink}" style="color: #0d9488; word-break: break-all; font-size: 11px;">${resetLink}</a>
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; line-height: 1.5; color: #94a3b8;">
          <strong>Aviso de seguridad:</strong> Si tú no solicitaste este cambio de contraseña, ignora este mensaje. Tu cuenta permanece protegida y nadie puede acceder sin tu contraseña actual.
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
        FisioMirror &bull; Sistema de Notificaciones Clínicas y Seguridad &bull; Mensaje generado automáticamente
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 6. Intentar enviar primero por Resend (Dominio verificado fisiomirror.me)
    const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
    const resendFrom = (process.env.RESEND_FROM || 'FisioMirror <notificaciones@fisiomirror.me>').trim();

    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: resendFrom,
            to: [cleanEmail],
            subject: `FisioMirror — Código para restablecer tu contraseña (${pinCode})`,
            html: htmlContent,
          }),
        });

        const resendData = await resendRes.json();
        if (resendRes.ok && resendData.id) {
          return res.status(200).json({
            success: true,
            method: 'resend_verified',
            message: `Código y enlace de recuperación enviados a ${cleanEmail}`,
            messageId: resendData.id,
            email: cleanEmail,
          });
        } else {
          console.warn('Resend send warning for reset password:', resendData);
        }
      } catch (resendErr) {
        console.warn('Notice: Resend call failed, trying SMTP:', resendErr);
      }
    }

    // 7. Enviar correo vía SMTP como respaldo
    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000,
        });

        const info = await transporter.sendMail({
          from: smtpFrom,
          to: cleanEmail,
          subject: `FisioMirror — Código para restablecer tu contraseña (${pinCode})`,
          html: htmlContent,
        });

        return res.status(200).json({
          success: true,
          method: 'direct_smtp',
          message: `Código y enlace de recuperación enviados a ${cleanEmail}`,
          messageId: info.messageId,
          email: cleanEmail,
        });
      } catch (smtpErr) {
        console.warn('Notice: direct SMTP send failed for reset password:', smtpErr.message);
      }
    }

    // 7. Fallback: Supabase Auth mailer si estuviera activo
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: resetLink,
      });
    } catch (sbErr) {
      console.warn('Notice: supabase resetPasswordForEmail fallback:', sbErr);
    }

    return res.status(200).json({
      success: true,
      method: 'supabase_fallback',
      message: `Instrucciones de recuperación enviadas a ${cleanEmail}`,
      email: cleanEmail,
    });
  } catch (error) {
    console.warn('Error handling send password reset:', error.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno al procesar el restablecimiento',
    });
  }
}
