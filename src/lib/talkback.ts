/**
 * TalkBack Accessibility Service for FisioMirror
 * Uses the Web Speech API (SpeechSynthesis) to voice element labels,
 * button roles, navigation headings, and live screen announcements.
 */

class TalkBackService {
  private enabled = false;
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private lastSpokenText = '';
  private debounceTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const lang = localStorage.getItem('fisio_language') || 'es';
    const targetPrefix = lang === 'pt' ? 'pt' : lang === 'en' ? 'en' : 'es';
    this.voice =
      voices.find((v) => v.lang.startsWith(targetPrefix)) ||
      voices.find((v) => v.lang.startsWith('es')) ||
      voices[0] ||
      null;
  }

  public init() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('fisio-talkback') === 'true';
    this.setEnabled(stored);
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fisio-talkback', String(val));
      if (val) {
        document.documentElement.classList.add('talkback');
        this.attachGlobalListeners();
        this.speak('TalkBack activado. Modo de lectura de pantalla interactivo listo.');
      } else {
        document.documentElement.classList.remove('talkback');
        this.detachGlobalListeners();
        this.stop();
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public speak(text: string, interrupt = true) {
    if (!this.enabled || !this.synth || !text.trim()) return;
    if (interrupt) {
      this.synth.cancel();
    }
    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText || cleanText === this.lastSpokenText) return;

    this.lastSpokenText = cleanText;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    this.synth.speak(utterance);

    // Reset last text memory after 3s
    if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      this.lastSpokenText = '';
    }, 3000);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  private handleFocusOrHover = (e: Event) => {
    if (!this.enabled) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if target or ancestor is interactive/accessible
    const interactive = target.closest(
      'button, a, input, select, textarea, [role="button"], [role="switch"], [role="tab"], h1, h2, h3, [data-talkback]'
    ) as HTMLElement | null;

    if (!interactive) return;

    let textToSpeak =
      interactive.getAttribute('aria-label') ||
      interactive.getAttribute('data-talkback') ||
      interactive.title ||
      '';

    if (!textToSpeak) {
      if (interactive.tagName === 'INPUT') {
        const input = interactive as HTMLInputElement;
        textToSpeak = `${input.placeholder || 'Campo de texto'}, ${input.type}: ${input.value || 'vacío'}`;
      } else if (interactive.tagName === 'BUTTON' || interactive.getAttribute('role') === 'button') {
        textToSpeak = `Botón: ${interactive.innerText || 'sin texto'}`;
      } else if (interactive.tagName === 'A') {
        textToSpeak = `Enlace: ${interactive.innerText || 'ir a destino'}`;
      } else {
        textToSpeak = interactive.innerText?.slice(0, 100) || '';
      }
    }

    if (textToSpeak) {
      this.speak(textToSpeak, true);
    }
  };

  private attachGlobalListeners() {
    window.addEventListener('focusin', this.handleFocusOrHover, true);
    window.addEventListener('mouseover', this.handleFocusOrHover, true);
  }

  private detachGlobalListeners() {
    window.removeEventListener('focusin', this.handleFocusOrHover, true);
    window.removeEventListener('mouseover', this.handleFocusOrHover, true);
  }
}

export const talkBack = new TalkBackService();
