import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_RESEND_KEY = process.env.RESEND_API_KEY || '';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const results = {
    timestamp: new Date().toISOString(),
    resend: {
      configured: false,
      apiKeyValid: false,
      mode: 'desconocido',
      accountOwner: 'fisiomirror@proton.me',
      from: process.env.RESEND_FROM || 'FisioMirror <notificaciones@fisiomirror.me>',
      message: '',
    },
    smtp: {
      configured: false,
      host: process.env.SMTP_HOST || null,
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || null,
      connectionOk: false,
      error: null,
      message: '',
    },
    supabaseAuth: {
      configured: false,
      url: process.env.VITE_SUPABASE_URL || 'https://mnkqfrulcpxpwaftokdi.supabase.co',
      status: 'pending',
      message: '',
    },
  };

  // 1. Diagnóstico de Resend
  const resendApiKey = (process.env.RESEND_API_KEY || DEFAULT_RESEND_KEY).trim();
  results.resend.configured = Boolean(resendApiKey);

  try {
    const testRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FisioMirror <onboarding@resend.dev>',
        to: ['delivered@resend.dev'],
        subject: 'FisioMirror Diagnóstico de Correo',
        text: 'Test de conectividad con la API de Resend.',
      }),
    });

    const testData = await testRes.json();

    if (testRes.ok && testData.id) {
      results.resend.apiKeyValid = true;
      results.resend.lastMessageId = testData.id;

      // Verificar si está restringida al sandbox
      const extRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FisioMirror <onboarding@resend.dev>',
          to: ['paciente.externo.test.9918@gmail.com'],
          subject: 'Sandbox Check',
          text: 'Check',
        }),
      });

      const extData = await extRes.json();
      if (extRes.ok) {
        results.resend.mode = 'production';
        results.resend.message = 'Resend configurado con dominio verificado activo. Puede enviar correos a cualquier paciente.';
      } else if (extData?.message?.includes('only send testing emails') || extData?.name === 'validation_error') {
        results.resend.mode = 'sandbox';
        results.resend.message =
          'La clave API de Resend es 100% válida y operativa en Modo Sandbox. Solo puede enviar correos a su propia cuenta (' +
          results.resend.accountOwner +
          '). Para enviar a pacientes reales (correos externos), debes registrar y verificar tu dominio en resend.com/domains y cambiar el remitente.';
      } else {
        results.resend.mode = 'restringido';
        results.resend.message = extData?.message || 'Resend operativo con restricciones.';
      }
    } else {
      results.resend.apiKeyValid = false;
      results.resend.message = 'La clave API de Resend fue rechazada (HTTP ' + testRes.status + '): ' + (testData.message || '');
    }
  } catch (err) {
    results.resend.message = 'Error de conexión con Resend: ' + err.message;
  }

  // 2. Diagnóstico de SMTP Directo
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || '').trim();
  const smtpPass = rawPass.replace(/\s+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    results.smtp.configured = true;
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 5000,
      });

      await transporter.verify();
      results.smtp.connectionOk = true;
      results.smtp.message = `Conexión SMTP exitosa con ${smtpHost}:${smtpPort} (Usuario: ${smtpUser}). Listo para entregar correos a cualquier destinatario.`;
    } catch (smtpErr) {
      results.smtp.connectionOk = false;
      results.smtp.error = smtpErr.message;
      results.smtp.message = `Fallo al autenticar o conectar con servidor SMTP ${smtpHost}:${smtpPort}. Detalle: ${smtpErr.message}`;
    }
  } else {
    results.smtp.configured = false;
    results.smtp.message = 'No se han definido variables SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) en el archivo de entorno. Puedes agregarlas para tener entrega directa de correo sin restricciones.';
  }

  // 3. Diagnóstico de Supabase Auth
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mnkqfrulcpxpwaftokdi.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3FmcnVsY3B4cHdhZnRva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5OTAsImV4cCI6MjA5NzY0Njk5MH0.lsbk4vs8F3uvp4gOqs0Ydz7V7zh04MJqWC919KssRQ0';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: healthData, error: healthErr } = await supabase.from('profiles').select('id').limit(1);

    if (!healthErr) {
      results.supabaseAuth.configured = true;
      results.supabaseAuth.status = 'connected';
      results.supabaseAuth.message = 'Conexión con Supabase y Base de Datos OK. El servicio SMTP de Supabase depende de la configuración en el Dashboard (Authentication -> SMTP Settings).';
    } else {
      results.supabaseAuth.status = 'error';
      results.supabaseAuth.message = 'Error al consultar Supabase: ' + healthErr.message;
    }
  } catch (sbErr) {
    results.supabaseAuth.status = 'error';
    results.supabaseAuth.message = sbErr.message;
  }

  return res.status(200).json(results);
}
