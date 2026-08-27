/**
 * Sophisticated, Natural & Human-like Text-to-Speech Engine for FisioMirror
 * 
 * Features:
 * - Intelligent neural/natural voice scoring (Google, Microsoft Neural, Apple Siri/Natural, Enhanced).
 * - Phonetic refinement (converts clinical acronyms like ROM, EVA, LCA, units, and removes markdown/emojis).
 * - Warm, calm, empathetic prosody calibration (pitch, rate, volume) tailored for medical & rehabilitation guidance.
 * - Anti-stall watchdog for WebKit / Blink speech engines.
 */

export interface HumanVoiceOptions {
  lang?: 'es' | 'pt' | 'en' | string;
  rate?: number;
  pitch?: number;
  volume?: number;
  interrupt?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

// Preload voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Phonetically cleans and humanizes text for natural articulation.
 */
export function cleanTextForNaturalSpeech(rawText: string, lang = 'es'): string {
  if (!rawText) return '';

  let text = rawText;

  // Remove markdown headers, bold, italics, code
  text = text.replace(/#+\s*/g, '');
  text = text.replace(/[*_~`]/g, '');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // links

  // Remove emojis
  text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  if (lang.startsWith('es')) {
    // Medical & functional abbreviations expansion in Spanish
    text = text
      .replace(/\bROM\b/g, 'rango de movimiento articular')
      .replace(/\bEVA\b/g, 'escala de dolor E V A')
      .replace(/\bVAS\b/g, 'escala visual analógica')
      .replace(/\bLCA\b/g, 'ligamento cruzado anterior')
      .replace(/\bAVD\b/g, 'actividades de la vida diaria')
      .replace(/\bAR\b/g, 'visión artificial')
      .replace(/\bIA\b/g, 'inteligencia artificial')
      .replace(/\b(\d+)\s*°/g, '$1 grados')
      .replace(/\b(\d+)\s*%/g, '$1 por ciento')
      .replace(/\b(\d+)\s*min\b/g, '$1 minutos')
      .replace(/\b(\d+)\s*seg\b/g, '$1 segundos')
      .replace(/\b(\d+)\s*reps?\b/g, '$1 repeticiones')
      .replace(/\bDr\.\b/gi, 'Doctor ')
      .replace(/\bDra\.\b/gi, 'Doctora ')
      .replace(/\bej\.\b/gi, 'por ejemplo, ')
      .replace(/\bvs\.?\b/gi, 'frente a ');
  } else if (lang.startsWith('pt')) {
    text = text
      .replace(/\bROM\b/g, 'amplitude de movimento')
      .replace(/\bEVA\b/g, 'escala de dor E V A')
      .replace(/\b(\d+)\s*°/g, '$1 graus')
      .replace(/\b(\d+)\s*%/g, '$1 por cento')
      .replace(/\b(\d+)\s*min\b/g, '$1 minutos')
      .replace(/\b(\d+)\s*reps?\b/g, '$1 repetições');
  } else if (lang.startsWith('en')) {
    text = text
      .replace(/\bROM\b/g, 'range of motion')
      .replace(/\bVAS\b/g, 'visual analog scale')
      .replace(/\b(\d+)\s*°/g, '$1 degrees')
      .replace(/\b(\d+)\s*%/g, '$1 percent')
      .replace(/\b(\d+)\s*min\b/g, '$1 minutes')
      .replace(/\b(\d+)\s*reps?\b/g, '$1 repetitions');
  }

  // Clean extra whitespace and punctuation clusters
  text = text.replace(/[;]/g, ',').replace(/\s+/g, ' ').trim();
  return text;
}

/**
 * Discovers and ranks the highest-quality, most human-sounding neural voice available.
 */
export function getBestHumanVoice(langCode = 'es'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices().length > 0 
    ? window.speechSynthesis.getVoices() 
    : cachedVoices;

  if (!voices || voices.length === 0) return null;

  const targetPrefix = langCode.startsWith('pt') 
    ? 'pt' 
    : langCode.startsWith('en') 
    ? 'en' 
    : 'es';

  // Filter voices matching the target language
  const matchingVoices = voices.filter((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith(targetPrefix)
  );

  const voicePool = matchingVoices.length > 0 ? matchingVoices : voices;

  // Scoring function to prioritize high-fidelity, neural, natural, and friendly voices
  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = v.name.toLowerCase();
    const uri = (v.voiceURI || '').toLowerCase();
    const combined = `${name} ${uri} ${v.lang.toLowerCase()}`;

    // 1. Language accuracy bonus
    if (v.lang.toLowerCase().startsWith(targetPrefix)) {
      score += 150;
      if (targetPrefix === 'es' && (v.lang.includes('ES') || v.lang.includes('MX') || v.lang.includes('419'))) {
        score += 30;
      }
    }

    // 2. High-tier neural / natural badges
    if (combined.includes('natural') || combined.includes('neural') || combined.includes('online')) {
      score += 200;
    }
    if (combined.includes('enhanced') || combined.includes('premium') || combined.includes('high quality')) {
      score += 180;
    }

    // 3. Top-rated voice personas for Spanish / Multilingual
    const premiumPersonas = [
      'helena',
      'jorge',
      'alvaro',
      'sabina',
      'monica',
      'mónica',
      'paulina',
      'lucia',
      'lucía',
      'francisca',
      'paloma',
      'laura',
      'raquel',
      'siri',
      'google',
      'microsoft',
      'apple',
      'penélope',
      'miguel',
      'carmen',
    ];

    for (const persona of premiumPersonas) {
      if (name.includes(persona)) {
        score += 60;
        break;
      }
    }

    // 4. Prefer default system voice if it's natural
    if (v.default) {
      score += 20;
    }

    // 5. Downrank known synthetic/metallic or robotic legacy synthesizers
    if (combined.includes('espeak') || combined.includes('compact') || combined.includes('synth')) {
      score -= 80;
    }

    return score;
  };

  const sorted = [...voicePool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return sorted[0] || null;
}

/**
 * Speaks text using the human-calibrated voice engine.
 */
export function speakHumanVoice(
  text: string,
  options: HumanVoiceOptions = {}
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (!text || !text.trim()) return null;

  const synth = window.speechSynthesis;

  // Unpause engine if stalled
  if (synth.paused) {
    try {
      synth.resume();
    } catch {
      // ignore
    }
  }

  if (options.interrupt !== false) {
    try {
      synth.cancel();
    } catch {
      // ignore
    }
  }

  const lang = options.lang || (typeof localStorage !== 'undefined' && localStorage.getItem('fisio_language')) || 'es';
  const clean = cleanTextForNaturalSpeech(text, lang);
  if (!clean) return null;

  const utterance = new SpeechSynthesisUtterance(clean);
  const bestVoice = getBestHumanVoice(lang);

  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang;
  } else {
    utterance.lang = lang.startsWith('pt') ? 'pt-BR' : lang.startsWith('en') ? 'en-US' : 'es-ES';
  }

  // Human, warm, compassionate prosody settings
  // Slightly relaxed rate (0.97) for maximum intelligibility and reassurance
  utterance.rate = options.rate ?? 0.97;
  // Slightly elevated pitch (1.02) for clear, warm, friendly tone
  utterance.pitch = options.pitch ?? 1.02;
  utterance.volume = options.volume ?? 1.0;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  // Anti-stall safety timer for Chromium browsers
  const resumeInterval = setInterval(() => {
    if (!synth.speaking) {
      clearInterval(resumeInterval);
    } else if (synth.paused) {
      synth.resume();
    }
  }, 3000);

  utterance.addEventListener('end', () => clearInterval(resumeInterval));
  utterance.addEventListener('error', () => clearInterval(resumeInterval));

  try {
    synth.speak(utterance);
    return utterance;
  } catch (err) {
    clearInterval(resumeInterval);
    if (options.onError) options.onError(err);
    return null;
  }
}

/**
 * Stops any ongoing speech output.
 */
export function stopHumanVoice(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

/**
 * Checks if speech synthesis is currently active.
 */
export function isHumanVoiceSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

export const speakWithHumanVoice = speakHumanVoice;

export const humanVoice = {
  speak: speakHumanVoice,
  stop: stopHumanVoice,
  isSpeaking: isHumanVoiceSpeaking,
  cleanText: cleanTextForNaturalSpeech,
};
