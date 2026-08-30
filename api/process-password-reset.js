import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SALT = 'fisiomirror-salt-2024';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

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
    const { email, tokenOrCode, newPassword } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanToken = (tokenOrCode || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Correo electrónico inválido' });
    }

    if (!cleanToken) {
      return res.status(400).json({ success: false, error: 'Código o token de recuperación requerido' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mnkqfrulcpxpwaftokdi.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3FmcnVsY3B4cHdhZnRva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5OTAsImV4cCI6MjA5NzY0Njk5MH0.lsbk4vs8F3uvp4gOqs0Ydz7V7zh04MJqWC919KssRQ0';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Obtener usuario de profiles
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (profError || !profile) {
      return res.status(404).json({ success: false, error: 'No se encontró ninguna cuenta con este correo electrónico' });
    }

    // 2. Validar token en activation_tokens
    const now = new Date().toISOString();
    const { data: tokens, error: tokenError } = await supabase
      .from('activation_tokens')
      .select('*')
      .eq('is_used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (tokenError) {
      console.warn('Error fetching tokens:', tokenError.message);
    }

    // Buscar coincidencia por token exacto o por PIN de 6 dígitos
    const matchedToken = (tokens || []).find((t) => {
      if (t.token === cleanToken) return true;
      if (t.diagnostico && t.diagnostico.includes(cleanEmail)) {
        const parts = t.diagnostico.split(':');
        const pinInRecord = parts[2];
        if (pinInRecord && pinInRecord === cleanToken) return true;
      }
      return false;
    });

    if (!matchedToken) {
      return res.status(400).json({
        success: false,
        error: 'El código de verificación o enlace ha expirado o no es válido. Por favor solicita uno nuevo.',
      });
    }

    // 3. Marcar token como utilizado
    await supabase
      .from('activation_tokens')
      .update({ is_used: true, used_at: now, used_by: profile.id })
      .eq('id', matchedToken.id);

    // 4. Actualizar hash de contraseña en profiles
    const passwordHash = hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        password_hash: passwordHash,
        updated_at: now,
      })
      .eq('id', profile.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: `Error al actualizar la contraseña: ${updateError.message}`,
      });
    }

    // 4b. Sincronizar también con Supabase Auth si service_role key está disponible
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        await adminSupabase.auth.admin.updateUserById(profile.id, { password: newPassword });
      } catch (authAdminErr) {
        console.warn('Notice updating auth user via admin API:', authAdminErr.message);
      }
    }

    // 5. Registrar notificación en la base de datos
    try {
      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: 'Contraseña restablecida',
        message: 'Tu contraseña de FisioMirror se ha actualizado correctamente. Si no realizaste este cambio, contacta a soporte de inmediato.',
        type: 'seguridad',
        read: false,
      });
    } catch (notifErr) {
      console.warn('Notice inserting security notification:', notifErr);
    }

    // 6. Enviar correo de confirmación de seguridad vía SMTP
    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const rawPass = (process.env.SMTP_PASS || '').trim();
    const smtpPass = rawPass.replace(/\s+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    const smtpFrom = (process.env.SMTP_FROM || `FisioMirror <${smtpUser || 'seguridad@fisiomirror.app'}>`).trim();

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

        const confirmHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Contraseña actualizada — FisioMirror</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0;">
    <tr>
      <td style="padding: 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">FisioMirror</h1>
        <p style="margin: 6px 0 0 0; color: #ccfbf1; font-size: 13px;">Aviso de Seguridad de Cuenta</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px 32px;">
        <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
          Contraseña actualizada con éxito
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
          Hola, <strong>${profile.full_name || cleanEmail}</strong>. Te confirmamos que la contraseña de tu cuenta de FisioMirror ha sido modificada satisfactoriamente.
        </p>
        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #64748b;">
          Fecha y hora de actualización: <strong>${new Date().toLocaleString('es-ES', { timeZone: 'UTC' })} UTC</strong>
        </p>
        <div style="padding: 16px; background-color: #fef2f2; border-radius: 12px; border: 1px solid #fecaca; font-size: 12px; line-height: 1.5; color: #991b1b;">
          <strong>¿No realizaste este cambio?</strong> Si tú no solicitaste ni aprobaste este cambio, responde de inmediato a este correo para suspender temporalmente el acceso por precaución.
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 18px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
        FisioMirror &bull; Plataforma de Tele-Rehabilitación Clínica
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        await transporter.sendMail({
          from: smtpFrom,
          to: cleanEmail,
          subject: 'FisioMirror — Tu contraseña ha sido actualizada',
          html: confirmHtml,
        });
      } catch (confirmMailErr) {
        console.warn('Notice: confirmation email error (ignoring):', confirmMailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    console.warn('Error processing password reset:', error.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno al procesar el cambio de contraseña',
    });
  }
}
