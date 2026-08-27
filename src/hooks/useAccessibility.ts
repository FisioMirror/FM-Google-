import { useCallback, useEffect, useState } from 'react';
import { speakHumanVoice, stopHumanVoice } from '../lib/humanVoice';

export interface AccessibilitySettings {
  talkback: boolean;
  easyReading: boolean;
  highContrast: boolean;
  largeTouchTargets: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'fisiomirror-accessibility';

const DEFAULTS: AccessibilitySettings = {
  talkback: false,
  easyReading: false,
  highContrast: false,
  largeTouchTargets: true,
  reduceMotion: false,
};

function loadSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return DEFAULTS;
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch { /* noop */ }

    const root = document.documentElement;
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('easy-reading', settings.easyReading);
    root.classList.toggle('large-touch', settings.largeTouchTargets);
    root.classList.toggle('talkback', settings.talkback);
    root.classList.toggle('reduce-motion', settings.reduceMotion);
  }, [settings]);

  const update = useCallback((partial: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const speak = useCallback((text: string) => {
    speakHumanVoice(text, {
      rate: 0.98,
      pitch: 1.02,
      interrupt: true,
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    stopHumanVoice();
  }, []);

  return { settings, update, speak, stopSpeaking };
}
