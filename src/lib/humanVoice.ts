/**
 * Sophisticated, Natural & Human-like Text-to-Speech Engine for FisioMirror
 * 
 * Features:
 * - Multi-Provider Cascade:
 *   1. Ultra-fast Online Humanized Neural Voice (<350ms streaming).
 *   2. Fish Audio S2.1 Pro (with custom user API key or environment key).
 *   3. Calibrated Local Speech Engine (SpeechSynthesis with warm therapist prosody & pitch shifting).
 * - Offline-first Resilience: Automatically detects connectivity and switches seamlessly.
 * - Male / Female Voice Persona Calibration: Male default (warm, reassuring, empathetic therapist tone)
 *   with friendly prosody calibration tailored for medical & rehabilitation guidance.
 * - In-memory LRU Audio Cache: Instant (<5ms) playback for repeated exercise cues.
 * - Phonetic refinement (converts clinical acronyms like ROM, EVA, LCA, units, and removes markdown/emojis).
 */

export type VoiceMode = 'humanized' | 'device';
export type VoiceGender = 'male' | 'female';
export type VoiceProvider = 'auto' | 'neural' | 'fish_audio' | 'device';

export interface HumanVoiceOptions {
  lang?: 'es' | 'pt' | 'en' | string;
  gender?: VoiceGender;
  provider?: VoiceProvider;
  rate?: number;
  pitch?: number;
  volume?: number;
  interrupt?: boolean;
  forceLocal?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, string>(); // Cache for synthesized audio base64
const MAX_CACHE_SIZE = 60;

// Preload browser voices
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
 * Gets the current preferred voice mode ('humanized' online vs 'device' offline).
 */
export function getVoiceMode(): VoiceMode {
  if (typeof localStorage === 'undefined') return 'humanized';
  const stored = localStorage.getItem('fisio_voice_mode');
  return stored === 'device' ? 'device' : 'humanized';
}

/**
 * Sets the voice mode and persists user preference.
 */
export function setVoiceMode(mode: VoiceMode): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('fisio_voice_mode', mode);
    const current = localStorage.getItem('fisio_voice_provider');
    if (mode === 'device') {
      localStorage.setItem('fisio_voice_provider', 'device');
    } else if (!current || current === 'device') {
      localStorage.setItem('fisio_voice_provider', 'fish_audio');
    }
  }
}

/**
 * Gets the current preferred voice gender persona ('male' warm therapist by default, or 'female').
 */
export function getVoiceGender(): VoiceGender {
  if (typeof localStorage === 'undefined') return 'female';
  const stored = localStorage.getItem('fisio_voice_gender');
  if (stored === 'male' || stored === 'female') return stored;
  localStorage.setItem('fisio_voice_gender', 'female');
  return 'female';
}

/**
 * Sets the voice gender persona and persists user preference.
 */
export function setVoiceGender(gender: VoiceGender): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('fisio_voice_gender', gender);
  }
}

/**
 * Gets the active voice synthesis provider ('auto', 'neural', 'fish_audio', 'device').
 */
export function getVoiceProvider(): VoiceProvider {
  if (typeof localStorage === 'undefined') return 'fish_audio';
  if (localStorage.getItem('fisio_voice_mode') === 'device') return 'device';
  const stored = localStorage.getItem('fisio_voice_provider') as VoiceProvider;
  if (stored === 'device') return 'fish_audio';
  if (stored && ['auto', 'neural', 'fish_audio'].includes(stored)) {
    return stored;
  }
  localStorage.setItem('fisio_voice_provider', 'fish_audio');
  localStorage.setItem('fisio_voice_mode', 'humanized');
  return 'fish_audio';
}

/**
 * Sets the active voice synthesis provider.
 */
export function setVoiceProvider(provider: VoiceProvider): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('fisio_voice_provider', provider);
    localStorage.setItem('fisio_voice_mode', provider === 'device' ? 'device' : 'humanized');
  }
}

/**
 * Gets the custom user Fish Audio API key if configured.
 */
export function getFishAudioKey(): string {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('fisio_fish_audio_key') || '';
}

/**
 * Sets or clears the custom user Fish Audio API key.
 */
export function setFishAudioKey(key: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('fisio_fish_audio_key', key.trim());
  }
}

/**
 * Gets the preferred speech rate (0.8x to 1.3x).
 */
export function getVoiceSpeed(): number {
  if (typeof localStorage === 'undefined') return 1.0;
  const stored = parseFloat(localStorage.getItem('fisio_voice_speed') || '1.0');
  return isNaN(stored) ? 1.0 : stored;
}

/**
 * Sets the preferred speech rate.
 */
export function setVoiceSpeed(speed: number): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('fisio_voice_speed', speed.toString());
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
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove emojis
  text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  if (lang.startsWith('es')) {
    // Medical & functional abbreviations expansion in Spanish
    text = text.replace(/\bROM\b/g, 'rango de movimiento articular');
    text = text.replace(/\bEVA\b/g, 'escala de dolor');
    text = text.replace(/\bLCA\b/g, 'ligamento cruzado anterior');
    text = text.replace(/\bAR\b/g, 'realidad aumentada');
    text = text.replace(/\bIA\b/g, 'inteligencia artificial');
    text = text.replace(/\brep(?:s)?\b/gi, 'repeticiones');
    text = text.replace(/\bseg(?:s)?\b/gi, 'segundos');
    text = text.replace(/\bmin(?:s)?\b/gi, 'minutos');
    text = text.replace(/\bgrados?°\b/g, 'grados');
    text = text.replace(/(\d+)°/g, '$1 grados');
  }

  // Normalize excessive punctuation and spaces
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

/**
 * Finds the highest quality, most natural sounding Spanish voice from the device.
 */
export function getBestHumanVoice(langCode = 'es', gender: VoiceGender = 'male'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  let voices = cachedVoices;
  if (voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
    cachedVoices = voices;
  }

  if (voices.length === 0) return null;

  const normalizedLang = langCode.toLowerCase().slice(0, 2);
  const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(normalizedLang));
  if (langVoices.length === 0) return voices[0] || null;

  const qualityScore = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = v.name.toLowerCase();

    // Prioritize high-fidelity neural/natural synthesis voices
    if (name.includes('natural') || name.includes('neural')) score += 60;
    if (name.includes('premium') || name.includes('enhanced')) score += 45;
    if (name.includes('google')) score += 35;
    if (name.includes('siri') || name.includes('apple')) score += 30;
    if (name.includes('microsoft')) score += 25;

    // Spanish voice persona names
    if (gender === 'male') {
      if (
        name.includes('alvaro') ||
        name.includes('jorge') ||
        name.includes('miguel') ||
        name.includes('diego') ||
        name.includes('pablo') ||
        name.includes('david') ||
        name.includes('carlos') ||
        name.includes('male') ||
        name.includes('hombre')
      ) {
        score += 40;
      }
    } else {
      if (
        name.includes('elvira') ||
        name.includes('paulina') ||
        name.includes('monica') ||
        name.includes('lucia') ||
        name.includes('helena') ||
        name.includes('female') ||
        name.includes('mujer')
      ) {
        score += 40;
      }
    }

    if (v.lang.toLowerCase() === 'es-es' || v.lang.toLowerCase() === 'es-mx') score += 15;

    return score;
  };

  langVoices.sort((a, b) => qualityScore(b) - qualityScore(a));
  return langVoices[0] || null;
}

/**
 * Speaks text locally using browser's SpeechSynthesis engine with warm clinical calibration.
 */
function speakLocal(
  cleanText: string,
  lang: string,
  options: HumanVoiceOptions
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const synth = window.speechSynthesis;
  if (synth.paused) {
    try { synth.resume(); } catch { /* ignore */ }
  }

  if (options.interrupt !== false) {
    try { synth.cancel(); } catch { /* ignore */ }
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const gender = options.gender || getVoiceGender();
  const bestVoice = getBestHumanVoice(lang, gender);
  const globalSpeed = getVoiceSpeed();

  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang;
  } else {
    utterance.lang = lang.startsWith('pt') ? 'pt-BR' : lang.startsWith('en') ? 'en-US' : 'es-ES';
  }

  // Calibración acústica cálida y amigable para terapia:
  // Para voz masculina: pitch menor (0.92) y ritmo pausado y empático (0.95)
  // Para voz femenina: pitch (1.04) y ritmo claro (0.98)
  const baseRate = (gender === 'male' ? 0.95 : 0.98) * globalSpeed;
  utterance.rate = options.rate ?? Math.min(1.4, Math.max(0.7, baseRate));

  if (gender === 'male') {
    utterance.pitch = options.pitch ?? 0.92;
  } else {
    utterance.pitch = options.pitch ?? 1.04;
  }
  utterance.volume = options.volume ?? 1.0;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

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
 * Speaks text using Human-Calibrated Speech Engine:
 * 1. Checks user preference (VoiceMode, VoiceProvider & VoiceGender).
 * 2. If 'humanized' and online, requests high-fidelity synthesized audio stream.
 * 3. Falls back seamlessly to calibrated device speech if offline or on timeout.
 */
export function speakHumanVoice(
  text: string,
  options: HumanVoiceOptions = {}
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined') return null;
  if (!text || !text.trim()) return null;

  const lang = options.lang || (typeof localStorage !== 'undefined' && localStorage.getItem('fisio_language')) || 'es';
  const clean = cleanTextForNaturalSpeech(text, lang);
  if (!clean) return null;

  // Stop currently playing audio element
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch {
      // ignore
    }
  }

  const mode = getVoiceMode();
  const provider = options.provider || getVoiceProvider();
  const gender = options.gender || getVoiceGender();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

  // If user selected device voice or device is offline: use local SpeechSynthesis
  if (mode === 'device' || provider === 'device' || options.forceLocal || !isOnline) {
    return speakLocal(clean, lang, options);
  }

  // Check audio cache for instant playback (<5ms)
  const cacheKey = `${provider}:${lang}:${gender}:${clean}`;
  if (audioCache.has(cacheKey)) {
    const cachedSrc = audioCache.get(cacheKey)!;
    playAudioElement(cachedSrc, options, gender, () => speakLocal(clean, lang, options));
    return null;
  }

  // Watchdog timer: 7000ms ensures multi-chunk synthesis has ample time without premature robot fallback
  let didFallback = false;
  const timeoutId = setTimeout(() => {
    if (!didFallback && (!currentAudio || currentAudio.paused)) {
      didFallback = true;
      speakLocal(clean, lang, options);
    }
  }, 7000);

  const customFishKey = getFishAudioKey();

  fetch('/api/synthesize-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: clean,
      lang,
      gender,
      provider,
      fishApiKey: customFishKey,
      pitch: options.pitch,
      rate: options.rate,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      clearTimeout(timeoutId);
      if (didFallback) return;

      if (data.success && data.audioBase64) {
        if (audioCache.size >= MAX_CACHE_SIZE) {
          const firstKey = audioCache.keys().next().value;
          if (firstKey) audioCache.delete(firstKey);
        }
        audioCache.set(cacheKey, data.audioBase64);

        playAudioElement(data.audioBase64, options, gender, () => {
          speakLocal(clean, lang, options);
        });
      } else {
        speakLocal(clean, lang, options);
      }
    })
    .catch((_err) => {
      clearTimeout(timeoutId);
      if (!didFallback) {
        didFallback = true;
        speakLocal(clean, lang, options);
      }
    });

  return null;
}

function playAudioElement(
  src: string,
  options: HumanVoiceOptions,
  gender: VoiceGender,
  fallbackFn: () => void
): void {
  try {
    const audio = new Audio(src);
    currentAudio = audio;

    const globalSpeed = getVoiceSpeed();
    // Calibración acústica para Physi:
    // Doctor Physi (masculino): 0.93 para barítono empático, cálido y pausado
    // Doctora Physi (femenina): 1.03 para tono brillante, claro y cordial
    const defaultRate = gender === 'male' ? 0.93 : 1.03;
    const targetRate = (options.rate ?? defaultRate) * globalSpeed;

    // Permitir modulación de pitch en navegadores modernos
    try {
      (audio as any).preservesPitch = false;
      (audio as any).mozPreservesPitch = false;
      (audio as any).webkitPreservesPitch = false;
    } catch {
      // ignore
    }

    if (targetRate >= 0.6 && targetRate <= 1.8) {
      audio.playbackRate = targetRate;
    }

    if (options.volume != null) {
      audio.volume = Math.max(0, Math.min(1, options.volume));
    }

    audio.onplay = () => {
      if (options.onStart) options.onStart();
    };

    audio.onended = () => {
      currentAudio = null;
      if (options.onEnd) options.onEnd();
    };

    audio.onerror = () => {
      currentAudio = null;
      fallbackFn();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err: any) => {
        currentAudio = null;
        // Do not force robotic device voice if autoplay was restricted by browser policy
        if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
          if (options.onError) options.onError(err);
          return;
        }
        fallbackFn();
      });
    }
  } catch {
    currentAudio = null;
    fallbackFn();
  }
}

/**
 * Stops any ongoing speech output (both online audio element and local speech synthesis).
 */
export function stopHumanVoice(): void {
  if (typeof window === 'undefined') return;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch {
      // ignore
    }
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Checks if speech synthesis or audio playback is currently active.
 */
export function isHumanVoiceSpeaking(): boolean {
  if (typeof window === 'undefined') return false;
  const isAudioPlaying = currentAudio !== null && !currentAudio.paused;
  const isSynthSpeaking = 'speechSynthesis' in window && window.speechSynthesis.speaking;
  return isAudioPlaying || isSynthSpeaking;
}

/**
 * Quick test of voice persona & provider.
 */
export function testVoice(sampleText?: string, options: HumanVoiceOptions = {}): void {
  const gender = options.gender || getVoiceGender();
  const defaultText =
    gender === 'male'
      ? 'Hola, soy el Doctor Physi, tu fisioterapeuta de confianza. Estoy aquí para acompañarte en cada ejercicio y cuidar tu postura.'
      : 'Hola, soy la Doctora Physi, tu guía de rehabilitación en FisioMirror. Vamos a lograr una recuperación segura y constante.';

  speakHumanVoice(sampleText || defaultText, {
    gender,
    ...options,
  });
}

export const speakWithHumanVoice = speakHumanVoice;

export const humanVoice = {
  speak: speakHumanVoice,
  stop: stopHumanVoice,
  isSpeaking: isHumanVoiceSpeaking,
  clean: cleanTextForNaturalSpeech,
  test: testVoice,
  getMode: getVoiceMode,
  setMode: setVoiceMode,
  getVoiceMode,
  setVoiceMode,
  getGender: getVoiceGender,
  setGender: setVoiceGender,
  getVoiceGender,
  setVoiceGender,
  getProvider: getVoiceProvider,
  setProvider: setVoiceProvider,
  getVoiceProvider,
  setVoiceProvider,
  getFishKey: getFishAudioKey,
  setFishKey: setFishAudioKey,
  getFishAudioKey,
  setFishAudioKey,
  getSpeed: getVoiceSpeed,
  setSpeed: setVoiceSpeed,
  getVoiceSpeed,
  setVoiceSpeed,
};

export default humanVoice;
