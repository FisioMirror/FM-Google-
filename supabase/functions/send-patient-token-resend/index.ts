import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email, name, token, therapistName, therapistEmail, therapistPhone, activationLink } = await req.json();

    if (!email || !token) {
      return new Response(JSON.stringify({ success: false, error: "Email y token son requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY") || DEFAULT_RESEND_KEY;
    const fromSender = Deno.env.get("RESEND_FROM") || "FisioMirror <onboarding@resend.dev>";
    const docName = therapistName || "Tu Fisioterapeuta";
    const patientName = name || "Paciente";
    const targetLink = activationLink || `https://fisiomirror.app/registro-paciente?token=${token}`;

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
    <!-- Header -->
    <tr>
      <td style="padding: 36px 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">FisioMirror</h1>
        <p style="margin: 6px 0 0 0; color: #ccfbf1; font-size: 13px; font-weight: 500;">Tele-rehabilitación con Biofeedback y Visión Artificial</p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 36px 32px;">
        <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">¡Hola, ${patientName}!</h2>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
          <strong>${docName}</strong> ha configurado tu plan de rehabilitación personalizado en FisioMirror. A continuación tienes tu código de activación exclusivo de 6 dígitos:
        </p>

        <!-- Token Box -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto; width: 100%; max-width: 380px;">
          <tr>
            <td style="background-color: #f0fdfa; border: 2px dashed #0d9488; border-radius: 18px; padding: 22px; text-align: center;">
              <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0f766e; letter-spacing: 1.5px; margin-bottom: 6px;">TU TOKEN DE ACTIVACIÓN</span>
              <span style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 800; color: #0f766e; letter-spacing: 6px; display: inline-block;">${token}</span>
            </td>
          </tr>
        </table>

        <!-- Action Button -->
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
          2. Completa tu nombre y correo para vincular tu expediente.<br>
          3. Sigue los ejercicios guiados por la cámara con corrección de postura en tiempo real.
        </p>

        <!-- Therapist Info Box -->
        <div style="margin-top: 28px; padding: 18px 20px; background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">Profesional a Cargo:</div>
          <div>• Fisioterapeuta: <strong>${docName}</strong></div>
          ${therapistEmail ? `<div>• Correo: <a href="mailto:${therapistEmail}" style="color: #0d9488; text-decoration: none;">${therapistEmail}</a></div>` : ''}
          ${therapistPhone ? `<div>• Teléfono: <strong>${therapistPhone}</strong></div>` : ''}
        </div>
      </td>
    </tr>

    <!-- Footer -->
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

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromSender,
        to: [email.trim().toLowerCase()],
        subject: `FisioMirror — Token de acceso para tu rehabilitación (${token})`,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      const msg = resendData.message || resendData.error || "Error al enviar correo por Resend";
      const isSandboxRestriction =
        resendRes.status === 403 &&
        (msg.includes("testing emails") || msg.includes("own email address") || msg.includes("resend.com/domains"));

      return new Response(JSON.stringify({
        success: false,
        code: isSandboxRestriction ? "RESEND_SANDBOX_RESTRICTION" : "RESEND_ERROR",
        status: resendRes.status,
        error: isSandboxRestriction
          ? "Resend está en modo prueba. Para enviar a pacientes reales, verifica un dominio en resend.com/domains y define RESEND_FROM."
          : msg,
        details: resendData,
      }), {
        status: resendRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      id: resendData.id,
      email: email.trim().toLowerCase(),
      token,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
