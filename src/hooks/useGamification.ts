import { useState, useEffect, useCallback, useRef } from 'react';
import { celebrateAchievement } from '../lib/confetti';

export type AchievementTier = 'bronce' | 'plata' | 'oro' | 'diamante';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
}

export interface PlayerLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  badgeColor: string;
}

export const PLAYER_LEVELS: PlayerLevel[] = [
  { level: 1, title: 'Novato del Movimiento', minPoints: 0, maxPoints: 150, badgeColor: '#3a5f94' },
  { level: 2, title: 'Explorador Cinético', minPoints: 150, maxPoints: 400, badgeColor: '#21b5af' },
  { level: 3, title: 'Guerrero Constante', minPoints: 400, maxPoints: 800, badgeColor: '#E2725B' },
  { level: 4, title: 'Atleta en Recuperación', minPoints: 800, maxPoints: 1500, badgeColor: '#15803d' },
  { level: 5, title: 'Maestro Biomecánico', minPoints: 1500, maxPoints: 3000, badgeColor: '#d97706' },
];

const STORAGE_KEY = 'fisiomirror-achievements';
const ONBOARDING_KEY = 'fisiomirror-onboarding-done';
const POINTS_KEY = 'fisiomirror-fisiocoins';

const TIER_META: Record<AchievementTier, { color: string; glow: string; label: string }> = {
  bronce: { color: '#CD7F32', glow: 'rgba(205,127,50,0.5)', label: 'Bronce' },
  plata: { color: '#C0C0C0', glow: 'rgba(192,192,192,0.5)', label: 'Plata' },
  oro: { color: '#FFD700', glow: 'rgba(255,215,0,0.5)', label: 'Oro' },
  diamante: { color: '#67E8F9', glow: 'rgba(103,232,249,0.5)', label: 'Diamante' },
};

export function getTierMeta(tier: AchievementTier) {
  return TIER_META[tier];
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_session', title: 'Primer Paso', description: 'Completa tu primera sesión de rehabilitación', tier: 'bronce', icon: 'directions_walk', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1 },
  { id: 'three_sessions', title: 'Constancia', description: 'Completa 3 sesiones de rehabilitación', tier: 'plata', icon: 'repeat', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 3 },
  { id: 'five_sessions', title: 'Dedicación', description: 'Completa 5 sesiones de rehabilitación', tier: 'oro', icon: 'self_improvement', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 5 },
  { id: 'ten_sessions', title: 'Guerrero de la Recuperación', description: 'Completa 10 sesiones de rehabilitación', tier: 'diamante', icon: 'emoji_events', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 10 },
  { id: 'streak_3', title: 'Racha de 3 Días', description: ' Practica 3 días seguidos sin interrupciones', tier: 'bronce', icon: 'local_fire_department', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 3 },
  { id: 'streak_7', title: 'Racha de 7 Días', description: 'Practica 7 días seguidos sin interrupciones', tier: 'oro', icon: 'whatshot', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 7 },
  { id: 'perfect_form', title: 'Forma Perfecta', description: 'Alcanza el rango óptimo en un ejercicio', tier: 'plata', icon: 'verified', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1 },
  { id: 'night_owl', title: 'Lechuza Nocturna', description: 'Completa una sesión después de las 8 PM', tier: 'bronce', icon: 'nights_stay', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1 },
  { id: 'early_bird', title: 'Madrugador', description: 'Completa una sesión antes de las 7 AM', tier: 'bronce', icon: 'wb_sunny', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1 },
  { id: 'all_exercises', title: 'Explorador', description: 'Practica todos tus ejercicios asignados al menos una vez', tier: 'oro', icon: 'explore', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 5 },
];

function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACHIEVEMENTS;
    const stored = JSON.parse(raw) as Achievement[];
    const merged = DEFAULT_ACHIEVEMENTS.map(def => {
      const found = stored.find(s => s.id === def.id);
      return found ? { ...def, unlocked: found.unlocked, unlockedAt: found.unlockedAt, progress: Math.max(found.progress, def.progress) } : def;
    });
    return merged;
  } catch {
    return DEFAULT_ACHIEVEMENTS;
  }
}

function saveAchievements(achievements: Achievement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch {
    // ignore
  }
}

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

function loadPoints(): number {
  try {
    const raw = localStorage.getItem(POINTS_KEY);
    if (!raw) return 120; // Initial welcome FisioCoins
    const val = parseInt(raw, 10);
    return isNaN(val) ? 120 : val;
  } catch {
    return 120;
  }
}

function savePoints(pts: number) {
  try {
    localStorage.setItem(POINTS_KEY, String(pts));
  } catch {
    // ignore
  }
}

export function useGamification() {
  const [points, setPoints] = useState<number>(() => loadPoints());
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const loaded = loadAchievements();
    return loaded.map((achievement) => ({ ...achievement, progress: achievement.unlocked ? achievement.maxProgress : 0 }));
  });
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const prevUnlockedRef = useRef<Set<string>>(new Set(achievements.filter(a => a.unlocked).map(a => a.id)));

  useEffect(() => {
    savePoints(points);
  }, [points]);

  const addPoints = useCallback((amount: number) => {
    setPoints((prev) => {
      const next = prev + amount;
      savePoints(next);
      return next;
    });
  }, []);

  const currentLevel = (() => {
    for (let i = PLAYER_LEVELS.length - 1; i >= 0; i--) {
      if (points >= PLAYER_LEVELS[i].minPoints) {
        return PLAYER_LEVELS[i];
      }
    }
    return PLAYER_LEVELS[0];
  })();

  const nextLevel = PLAYER_LEVELS.find((l) => l.level === currentLevel.level + 1) || null;
  const levelProgressPercent = nextLevel
    ? Math.min(100, Math.max(0, Math.round(((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)))
    : 100;

  useEffect(() => {
    saveAchievements(achievements);
    const currentUnlocked = new Set(achievements.filter(a => a.unlocked).map(a => a.id));
    const newly = achievements.find(a => a.unlocked && !prevUnlockedRef.current.has(a.id));
    if (newly) {
      setNewlyUnlocked(newly);
      addPoints(100); // 100 FisioCoins for each achievement!
    }
    prevUnlockedRef.current = currentUnlocked;
  }, [achievements, addPoints]);

  const recordSession = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastSessionDate = localStorage.getItem('fisiomirror-last-session-date');
    if (lastSessionDate === today) return;
    localStorage.setItem('fisiomirror-last-session-date', today);
    addPoints(50); // 50 FisioCoins for session!

    setAchievements(prev => {
      const updated = [...prev];
      const newUnlocks: Achievement[] = [];
      updated.forEach((ach, idx) => {
        if (ach.unlocked) return;
        if (ach.id === 'first_session' || ach.id === 'three_sessions' || ach.id === 'five_sessions' || ach.id === 'ten_sessions') {
          const newProgress = ach.progress + 1;
          if (newProgress >= ach.maxProgress) {
            updated[idx] = { ...ach, progress: newProgress, unlocked: true, unlockedAt: new Date().toISOString() };
            newUnlocks.push(updated[idx]);
          } else {
            updated[idx] = { ...ach, progress: newProgress };
          }
        }
      });
      if (newUnlocks.length > 0) {
        celebrateAchievement();
      }
      return updated;
    });
  }, [addPoints]);

  const recordStreak = useCallback((days: number) => {
    addPoints(15 * days); // Bonus FisioCoins for streaks
    setAchievements(prev => {
      const updated = [...prev];
      const newUnlocks: Achievement[] = [];
      updated.forEach((ach, idx) => {
        if (ach.unlocked) return;
        if (ach.id === 'streak_3' && days >= 3) {
          updated[idx] = { ...ach, progress: 3, unlocked: true, unlockedAt: new Date().toISOString() };
          newUnlocks.push(updated[idx]);
        } else if (ach.id === 'streak_7' && days >= 7) {
          updated[idx] = { ...ach, progress: 7, unlocked: true, unlockedAt: new Date().toISOString() };
          newUnlocks.push(updated[idx]);
        } else if (ach.id.startsWith('streak_') && !ach.unlocked) {
          updated[idx] = { ...ach, progress: Math.min(days, ach.maxProgress) };
        }
      });
      if (newUnlocks.length > 0) {
        celebrateAchievement();
      }
      return updated;
    });
  }, [addPoints]);

  const unlockSpecial = useCallback((achievementId: string) => {
    addPoints(75);
    setAchievements(prev => {
      const idx = prev.findIndex(a => a.id === achievementId);
      if (idx === -1 || prev[idx].unlocked) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], unlocked: true, progress: updated[idx].maxProgress, unlockedAt: new Date().toISOString() };
      celebrateAchievement();
      return updated;
    });
  }, [addPoints]);

  const dismissUnlock = useCallback(() => setNewlyUnlocked(null), []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalProgress = achievements.reduce((sum, a) => sum + (a.unlocked ? 1 : a.progress / a.maxProgress), 0) / achievements.length;

  return {
    achievements,
    newlyUnlocked,
    dismissUnlock,
    recordSession,
    recordStreak,
    unlockSpecial,
    unlockedCount,
    totalProgress,
    points,
    addPoints,
    currentLevel,
    nextLevel,
    levelProgressPercent,
  };
}
