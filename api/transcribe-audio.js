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
    const { audioBase64, mimeType } = req.body || {};

    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'Audio requerido en base64' });
    }

    const detectedMime = mimeType || 'audio/webm';
    const cleanB64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanB64, 'base64');

    // 1. Groq Whisper Large v3 (Más potente y rápido)
    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY2;
    if (groqKey) {
      try {
        const formData = new FormData();
        const ext = detectedMime.includes('mp4') ? 'm4a' : detectedMime.includes('wav') ? 'wav' : 'webm';
        formData.append('file', new Blob([buffer], { type: detectedMime }), `audio.${ext}`);
        formData.append('model', 'whisper-large-v3');
        formData.append('language', 'es');
        formData.append('response_format', 'json');

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${groqKey}` },
          body: formData,
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          if (groqData.text && groqData.text.trim()) {
            return res.status(200).json({ text: groqData.text.trim(), provider: 'Groq Whisper Large v3', success: true });
          }
        }
      } catch (err) {
        console.warn('[transcribe-audio] Groq Whisper error:', err?.message || err);
      }
    }

    // 2. Cloudflare Whisper
    const cfToken = process.env.CF_API_TOKEN;
    const cfAccount = process.env.CF_ACCOUNT_ID;
    if (cfToken && cfAccount) {
      try {
        const formData = new FormData();
        formData.append('audio', new Blob([buffer], { type: detectedMime }));
        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/run/@cf/openai/whisper-large-v3-turbo`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${cfToken}` },
            body: formData,
          }
        );
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          if (cfData.success && cfData.result?.text) {
            return res.status(200).json({ text: cfData.result.text.trim(), provider: 'Cloudflare Whisper', success: true });
          }
        }
      } catch (err) {
        console.warn('[transcribe-audio] Cloudflare error:', err?.message || err);
      }
    }

    // 3. Gemini Multimodal
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash'];
      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
          const gRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { inline_data: { mime_type: detectedMime, data: cleanB64 } },
                  { text: 'Transcribe este audio en español. Devuelve únicamente el texto transcrito sin formato ni notas.' },
                ],
              }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
            }),
          });
          if (gRes.ok) {
            const gData = await gRes.json();
            const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              return res.status(200).json({ text: text.trim(), provider: `Gemini (${model})`, success: true });
            }
          }
        } catch (err) {
          console.warn(`[transcribe-audio] Gemini ${model} error:`, err?.message || err);
        }
      }
    }

    return res.status(502).json({
      success: false,
      error: 'Proveedores de transcripción en cascada no disponibles o sin credenciales activas en entorno local',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Error interno de transcripción' });
  }
}
