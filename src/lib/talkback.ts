/**
 * TalkBack Accessibility Service for FisioMirror
 * Uses the Web Speech API (SpeechSynthesis) to voice element labels,
 * button roles, navigation headings, and live screen announcements.
 */

import { speakHumanVoice, stopHumanVoice, cleanTextForNaturalSpeech } from './humanVoice';

class TalkBackService {
  private enabled = false;
  private lastSpokenText = '';
  private debounceTimer: number | null = null;
  private listenersAttached = false;

  constructor() {}

  public loadVoices() {
    // Handled automatically by humanVoice engine
  }

  public init() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('fisio-talkback') === 'true';
    if (stored) {
      this.setEnabled(true, false);
    }
  }

  public setEnabled(val: boolean, announce = true) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fisio-talkback', String(val));
      if (val) {
        document.documentElement.classList.add('talkback');
        this.attachGlobalListeners();
        if (announce) {
          const lang = localStorage.getItem('fisio_language') || 'es';
          const msg = lang === 'en' 
            ? 'TalkBack enabled. Interactive screen reader mode active.' 
            : lang === 'pt' 
            ? 'TalkBack ativado. Leitor de tela interativo pronto.' 
            : 'TalkBack activado. Modo de lectura de pantalla interactivo listo.';
          this.speak(msg, true);
        }
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
    if (!this.enabled || !text || !text.trim()) return;
    
    const clean = cleanTextForNaturalSpeech(text);
    if (!clean || clean === this.lastSpokenText) return;

    this.lastSpokenText = clean;

    speakHumanVoice(clean, {
      interrupt,
      rate: 1.0,
      pitch: 1.02,
    });

    // Reset last text memory after 2.5s
    if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      this.lastSpokenText = '';
    }, 2500);
  }

  public stop() {
    stopHumanVoice();
  }

  private handleFocusOrHover = (e: Event) => {
    if (!this.enabled) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if target or ancestor is interactive/accessible
    const interactive = target.closest(
      'button, a, input, select, textarea, [role="button"], [role="switch"], [role="tab"], h1, h2, h3, h4, [data-talkback], label'
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
        textToSpeak = `Botón: ${interactive.innerText?.trim() || 'sin texto'}`;
      } else if (interactive.tagName === 'A') {
        textToSpeak = `Enlace: ${interactive.innerText?.trim() || 'ir a enlace'}`;
      } else {
        textToSpeak = interactive.innerText?.trim().slice(0, 120) || '';
      }
    }

    if (textToSpeak) {
      this.speak(textToSpeak, true);
    }
  };

  private attachGlobalListeners() {
    if (this.listenersAttached || typeof window === 'undefined') return;
    window.addEventListener('focusin', this.handleFocusOrHover, true);
    window.addEventListener('mouseover', this.handleFocusOrHover, true);
    window.addEventListener('click', this.handleFocusOrHover, true);
    this.listenersAttached = true;
  }

  private detachGlobalListeners() {
    if (!this.listenersAttached || typeof window === 'undefined') return;
    window.removeEventListener('focusin', this.handleFocusOrHover, true);
    window.removeEventListener('mouseover', this.handleFocusOrHover, true);
    window.removeEventListener('click', this.handleFocusOrHover, true);
    this.listenersAttached = false;
  }
}

export const talkBack = new TalkBackService();
