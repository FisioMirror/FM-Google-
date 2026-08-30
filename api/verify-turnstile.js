export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, remoteip } = req.body || {};

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token Turnstile no proporcionado' });
  }

  // If token is internal fallback in test/offline mode
  if (token.startsWith('cf-fallback-token-')) {
    return res.status(200).json({ success: true, mode: 'fallback-test' });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true, challenge_ts: data.challenge_ts, hostname: data.hostname });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Verificación de Turnstile fallida',
        'error-codes': data['error-codes'],
      });
    }
  } catch (error) {
    console.error('Error verifying Turnstile:', error);
    return res.status(500).json({ success: false, error: 'Error del servicio de verificación CAPTCHA' });
  }
}
