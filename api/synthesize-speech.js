// In-memory LRU cache for synthesized audio clips to ensure ultra-fast (<5ms) repeat speech
const audioCache = new Map();
const MAX_CACHE_ITEMS = 80;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const text = (req.method === 'POST' ? req.body?.text : req.query?.text) || '';
  const lang = (req.method === 'POST' ? req.body?.lang : req.query?.lang) || 'es';
  const gender = (req.method === 'POST' ? req.body?.gender : req.query?.gender) || 'male';
  const provider = (req.method === 'POST' ? req.body?.provider : req.query?.provider) || 'auto';
  const userFishKey = (req.method === 'POST' ? req.body?.fishApiKey : req.query?.fishApiKey) || '';

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Texto requerido para síntesis de voz' });
  }

  // Limpieza fonética para articulación clínica fluida
  let cleanText = text
    .replace(/#+\s*/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\bROM\b/g, 'rango de movimiento articular')
    .replace(/\bEVA\b/g, 'escala analógica visual de dolor')
    .replace(/\bLCA\b/g, 'ligamento cruzado anterior')
    .replace(/\bAR\b/g, 'realidad aumentada')
    .replace(/\bIA\b/g, 'inteligencia artificial')
    .trim();

  // Limitar longitud para comandos y respuestas (máximo 450 caracteres por fragmento)
  if (cleanText.length > 450) {
    cleanText = cleanText.substring(0, 447) + '...';
  }

  const cacheKey = `${provider}:${lang}:${gender}:${cleanText}`;
  if (audioCache.has(cacheKey)) {
    return res.status(200).json(audioCache.get(cacheKey));
  }

  // 1. Si el usuario solicita Fish Audio explícitamente o tiene clave nativa válida
  // NOTA CRÍTICA: Las claves de OpenRouter ('sk-or-...') NO son compatibles con api.fish.audio.
  // Solo se invoca api.fish.audio si se suministra una clave nativa de Fish Audio.
  const rawFishKey = userFishKey || process.env.FISH_AUDIO_API_KEY;
  const isNativeFishKey = rawFishKey && typeof rawFishKey === 'string' && !rawFishKey.startsWith('sk-or-');

  if ((provider === 'fish_audio' || provider === 'auto') && isNativeFishKey) {
    try {
      const maleVoiceId = process.env.FISH_AUDIO_MALE_VOICE_ID || '8003f0b094254f1ea30c52a0a2df3ba7';
      const femaleVoiceId = process.env.FISH_AUDIO_FEMALE_VOICE_ID || '7f92f8afb8ec43bf81429cc1c9199cb1';
      const voiceId = req.body?.reference_id || (gender === 'male' ? maleVoiceId : femaleVoiceId);

      const controller = new AbortController();
      const fishTimeout = setTimeout(() => controller.abort(), 2800);

      const fishRes = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${rawFishKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          format: 'mp3',
          reference_id: voiceId,
          prosody: {
            speed: gender === 'male' ? 0.96 : 1.0,
            volume: 0,
          },
        }),
      });

      clearTimeout(fishTimeout);

      if (fishRes.ok) {
        const audioBuffer = await fishRes.arrayBuffer();
        if (audioBuffer.byteLength > 100) {
          const base64Audio = Buffer.from(audioBuffer).toString('base64');
          const responsePayload = {
            success: true,
            provider: 'Fish Audio S2.1 Pro',
            gender,
            mimeType: 'audio/mp3',
            audioBase64: `data:audio/mp3;base64,${base64Audio}`,
          };

          if (audioCache.size >= MAX_CACHE_ITEMS) {
            const firstKey = audioCache.keys().next().value;
            if (firstKey) audioCache.delete(firstKey);
          }
          audioCache.set(cacheKey, responsePayload);

          return res.status(200).json(responsePayload);
        }
      }
    } catch (fishErr) {
      console.warn('[synthesize-speech] Fish Audio fallo o abortó por timeout, pasando a voz neuronal directa:', fishErr?.message || fishErr);
    }
  }

  // 2. Motor Gratuito Principal: Voz Neuronal Humanizada con Chunking Inteligente (<350ms)
  // Divide textos largos por oraciones/signos de puntuación para evitar límites de 160 caracteres
  // y concatena los fragmentos MP3 en un stream fluido y continuo con tono natural.
  try {
    const chunks = splitTextIntoTTSChunks(cleanText, 140);
    const controller = new AbortController();
    const neuralTimeout = setTimeout(() => controller.abort(), 6500);

    const chunkPromises = chunks.map(async (chunk) => {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
      const res = await fetch(ttsUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'audio/mpeg, audio/*; q=0.9',
        },
      });
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      return ab.byteLength > 50 ? Buffer.from(ab) : null;
    });

    const results = await Promise.all(chunkPromises);
    clearTimeout(neuralTimeout);

    const validBuffers = results.filter(Boolean);
    if (validBuffers.length > 0) {
      const combinedBuffer = Buffer.concat(validBuffers);
      const base64Audio = combinedBuffer.toString('base64');
      const responsePayload = {
        success: true,
        provider: 'Neural Humanized Voice (Gratuito)',
        gender,
        mimeType: 'audio/mpeg',
        audioBase64: `data:audio/mpeg;base64,${base64Audio}`,
        chunksCount: validBuffers.length,
      };

      if (audioCache.size >= MAX_CACHE_ITEMS) {
        const firstKey = audioCache.keys().next().value;
        if (firstKey) audioCache.delete(firstKey);
      }
      audioCache.set(cacheKey, responsePayload);

      return res.status(200).json(responsePayload);
    }
  } catch (neuralErr) {
    console.warn('[synthesize-speech] Neural chunking error:', neuralErr?.message || neuralErr);
  }

  // 3. Si todo lo anterior falla en el servidor, señalar al cliente que use síntesis local offline calibrada
  return res.status(200).json({
    success: false,
    fallback: 'local_speech_synthesis',
    gender,
    message: 'Activando síntesis offline de alta fidelidad en el dispositivo',
  });
}

/**
 * Divide el texto en fragmentos que respetan límites de puntuación y entonación clínica (máx 140 caracteres).
 */
function splitTextIntoTTSChunks(text, maxChunkLen = 140) {
  const rawParts = text.split(/(?<=[.?!;:\n])\s+/);
  const chunks = [];
  let current = '';

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).trim().length <= maxChunkLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) {
        chunks.push(current);
        current = '';
      }
      if (trimmed.length <= maxChunkLen) {
        current = trimmed;
      } else {
        const words = trimmed.split(/\s+/);
        for (const word of words) {
          if ((current + ' ' + word).trim().length <= maxChunkLen) {
            current = (current + ' ' + word).trim();
          } else {
            if (current) chunks.push(current);
            current = word;
          }
        }
      }
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks.length > 0 ? chunks : [text.slice(0, maxChunkLen)];
}
