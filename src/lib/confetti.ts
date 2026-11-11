import confetti from 'canvas-confetti';

const FISIO_COLORS = ['#00504d', '#156966', '#8ad3cf', '#14b8a6', '#fbbf24', '#34d399'];

export function celebrateSession() {
  try {
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: FISIO_COLORS,
      disableForReducedMotion: true,
    });
    setTimeout(() => {
      try {
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.7 },
          colors: FISIO_COLORS,
          disableForReducedMotion: true,
        });
      } catch { /* ignore */ }
    }, 180);
  } catch {
    // Fallback if canvas-confetti fails or is unavailable
  }
}

export function celebrateToken() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: FISIO_COLORS,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
  } catch {
    // ignore
  }
}

export function celebrateStreak() {
  try {
    confetti({
      particleCount: 40,
      angle: 90,
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
      colors: FISIO_COLORS,
      scalar: 1.1,
      disableForReducedMotion: true,
    });
  } catch {
    // ignore
  }
}

export function celebrateAchievement() {
  try {
    confetti({
      particleCount: 60,
      spread: 90,
      origin: { y: 0.5 },
      colors: FISIO_COLORS,
      shapes: ['circle'],
      scalar: 1.0,
      disableForReducedMotion: true,
    });
  } catch {
    // ignore
  }
}

