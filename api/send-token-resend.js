const DEFAULT_RESEND_KEY = process.env.RESEND_API_KEY || '';
const DEFAULT_RESEND_FROM = "FisioMirror <notificaciones@fisiomirror.me>";
const RESEND_ACCOUNT_OWNER = "fisiomirror@proton.me";

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
    const { email, name, token, therapistName, therapistEmail, therapistPhone, activationLink } = req.body || {};

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Email de paciente inválido o no especificado' });
    }

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token de activación no especificado' });
    }

    const resendApiKey = (process.env.RESEND_API_KEY || DEFAULT_RESEND_KEY).trim();
    const fromSender = (process.env.RESEND_FROM || DEFAULT_RESEND_FROM).trim();
    const docName = therapistName || 'Tu Fisioterapeuta';
    const patientName = name || 'Paciente';
    const targetLink = activationLink || `https://fisiomirror.app/registro-paciente?token=${encodeURIComponent(token)}`;

    const htmlContent = `
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
          <strong>${docName}</strong> ha configurado tu plan de rehabilitación personalizado en FisioMirror. A continuación tienes tu código de activación exclusivo de 6 dígitos:
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
        <div style="margin-top: 24px; padding: 14px 16px; background-color: #f0fdfa; border-radius: 12px; border-left: 4px solid #0d9488; font-size: 12px; line-height: 1.5; color: #134e4a;">
          <strong>Nota:</strong> Si no encuentras este correo en tu bandeja principal, por favor revisa tu carpeta de <em>Spam</em> o <em>Correo no deseado</em> y márcalo como seguro.
        </div>
        <div style="margin-top: 20px; padding: 18px 20px; background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">Profesional a Cargo:</div>
          <div>• Fisioterapeuta: <strong>${docName}</strong></div>
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

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromSender,
        to: [cleanEmail],
        subject: `FisioMirror — Token de acceso para tu rehabilitación (${token})`,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      const msg = resendData.message || resendData.error || 'Error al enviar correo por Resend';
      const isSandboxRestriction =
        resendRes.status === 403 &&
        (msg.includes('testing emails') || msg.includes('own email address') || msg.includes('resend.com/domains'));

      if (isSandboxRestriction) {
        return res.status(403).json({
          success: false,
          code: 'RESEND_SANDBOX_RESTRICTION',
          accountEmail: RESEND_ACCOUNT_OWNER,
          error: `Resend está en modo prueba/sandbox asociado a ${RESEND_ACCOUNT_OWNER}. Para enviar a pacientes reales (${cleanEmail}), debes agregar y verificar un dominio en resend.com/domains y configurar la variable RESEND_FROM. Puedes usar el canal SMTP o la App de Correo Nativa para enviar de inmediato.`,
          details: resendData,
        });
      }

      return res.status(resendRes.status).json({
        success: false,
        code: 'RESEND_API_ERROR',
        status: resendRes.status,
        error: msg,
        details: resendData,
      });
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      email: cleanEmail,
      token,
      method: 'resend',
    });
  } catch (error) {
    console.error('Error sending token with Resend:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error interno al enviar por Resend' });
  }
}
