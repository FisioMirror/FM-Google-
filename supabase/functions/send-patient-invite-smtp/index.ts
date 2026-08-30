import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InvitePayload {
  email: string;
  token: string;
  patientName?: string;
  therapistName?: string;
  therapistEmail?: string;
  therapistPhone?: string;
  activationLink?: string;
}

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
    const body: InvitePayload = await req.json();
    const {
      email,
      token,
      patientName = "Paciente",
      therapistName = "Tu Fisioterapeuta",
      therapistEmail,
      therapistPhone,
      activationLink,
    } = body;

    const cleanEmail = email ? email.trim().toLowerCase() : "";
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Dirección de correo electrónico inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "El token de activación es obligatorio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuración de servidor Supabase incompleta (SUPABASE_SERVICE_ROLE_KEY)",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const fallbackLink =
      activationLink ||
      `${new URL(req.url).origin}/registro-paciente?token=${encodeURIComponent(token)}`;

    // 1. Send email through Supabase Auth (which uses the configured SMTP)
    let emailSent = false;
    let authErrorMsg = "";

    try {
      const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: fallbackLink,
          data: {
            token,
            patient_name: patientName,
            therapist_name: therapistName,
            therapist_email: therapistEmail,
            therapist_phone: therapistPhone,
            role: "paciente",
          },
        },
      });

      if (!otpError) {
        emailSent = true;
      } else {
        authErrorMsg = otpError.message;
        console.warn("[send-patient-invite-smtp] signInWithOtp notice:", otpError.message);
      }
    } catch (e: any) {
      authErrorMsg = e.message;
      console.warn("[send-patient-invite-smtp] Error triggering SMTP via Auth:", e);
    }

    // 2. Register in database notifications table if patient profile exists
    try {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (prof?.id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: prof.id,
          title: `Llave de Acceso y Token: ${token}`,
          message: `${therapistName} te ha enviado tu token de rehabilitación ${token}. Puedes ingresar directamente para activar tu plan.`,
          type: "rutina",
          link: fallbackLink,
          read: false,
        });
      }
    } catch (dbErr) {
      console.warn("[send-patient-invite-smtp] Notice creating notification record:", dbErr);
    }

    if (emailSent) {
      return new Response(
        JSON.stringify({
          success: true,
          method: "supabase_smtp",
          message: `Enlace y token enviados con éxito a ${cleanEmail} mediante el servidor SMTP de Supabase.`,
          email: cleanEmail,
          token,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error al enviar correo por SMTP de Supabase: ${authErrorMsg || "No se pudo procesar"}`,
          fallbackAvailable: true,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
