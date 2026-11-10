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
  versiculo?: { cita: string; texto: string };
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
const PENDING_KEY = 'fisiomirror-pending-achievement';
const PRACTICED_KEY = 'fisiomirror-practiced-exercises';
const SESSION_ACHIEVEMENTS = new Set(['first_session', 'three_sessions', 'five_sessions', 'ten_sessions']);

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
  { id: 'first_session', title: 'Primer Paso', description: 'Completa tu primera sesión de rehabilitación', tier: 'bronce', icon: 'directions_walk', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1, versiculo: { cita: 'Salmos 139:14', texto: 'Te alabaré; porque formidables, maravillosas son tus obras.' } },
  { id: 'three_sessions', title: 'Constancia', description: 'Completa 3 sesiones de rehabilitación', tier: 'plata', icon: 'repeat', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 3, versiculo: { cita: 'Gálatas 6:9', texto: 'No nos cansemos, pues, de hacer el bien; porque a su tiempo segaremos, si no desmayamos.' } },
  { id: 'five_sessions', title: 'Dedicación', description: 'Completa 5 sesiones de rehabilitación', tier: 'oro', icon: 'self_improvement', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 5, versiculo: { cita: 'Proverbios 16:3', texto: 'Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.' } },
  { id: 'ten_sessions', title: 'Guerrero de la Recuperación', description: 'Completa 10 sesiones de rehabilitación', tier: 'diamante', icon: 'emoji_events', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 10, versiculo: { cita: 'Isaías 40:31', texto: 'Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán.' } },
  { id: 'streak_3', title: 'Racha de 3 Días', description: ' Practica 3 días seguidos sin interrupciones', tier: 'bronce', icon: 'local_fire_department', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 3, versiculo: { cita: 'Josué 1:9', texto: 'Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo.' } },
  { id: 'streak_7', title: 'Racha de 7 Días', description: 'Practica 7 días seguidos sin interrupciones', tier: 'oro', icon: 'whatshot', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 7, versiculo: { cita: 'Deuteronomio 31:6', texto: 'Esforzaos y cobrad ánimo; no temáis, porque Jehová tu Dios es el que va contigo.' } },
  { id: 'perfect_form', title: 'Forma Perfecta', description: 'Alcanza el rango óptimo en un ejercicio', tier: 'plata', icon: 'verified', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1, versiculo: { cita: 'Filipenses 4:13', texto: 'Todo lo puedo en Cristo que me fortalece.' } },
  { id: 'night_owl', title: 'Lechuza Nocturna', description: 'Completa una sesión después de las 8 PM', tier: 'bronce', icon: 'nights_stay', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1, versiculo: { cita: 'Salmos 4:8', texto: 'En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me haces vivir confiado.' } },
  { id: 'early_bird', title: 'Madrugador', description: 'Completa una sesión antes de las 7 AM', tier: 'bronce', icon: 'wb_sunny', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1, versiculo: { cita: 'Salmos 143:8', texto: 'Hazme oír por la mañana tu misericordia, porque en ti he confiado.' } },
  { id: 'all_exercises', title: 'Explorador', description: 'Practica 5 ejercicios distintos al menos una vez', tier: 'oro', icon: 'explore', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 5, versiculo: { cita: 'Colosenses 3:23', texto: 'Y todo lo que hagáis, hacedlo de corazón, como para el Señor.' } },
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

function loadPendingIds(): string[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
    return [raw];
  } catch {
    return [];
  }
}

function savePendingIds(ids: string[]) {
  try {
    if (ids.length === 0) localStorage.removeItem(PENDING_KEY);
    else localStorage.setItem(PENDING_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
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
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadAchievements());
  const [pendingIds, setPendingIds] = useState<string[]>(() => loadPendingIds());
  const newlyUnlocked = achievements.find((a) => a.id === pendingIds[0] && a.unlocked) ?? null;
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
    const newly = achievements.filter(a => a.unlocked && !prevUnlockedRef.current.has(a.id));
    if (newly.length > 0) {
      // Filtrar para evitar que salten bronce, plata y oro seguidos si se alcanzan varias metas juntas:
      // Solo encolamos para el modal el nivel más alto de cada familia progresiva.
      const tieredFamilies = [
        ['first_session', 'three_sessions', 'five_sessions', 'ten_sessions'],
        ['streak_3', 'streak_7'],
      ];

      const filteredForModal = newly.filter((ach) => {
        for (const family of tieredFamilies) {
          if (family.includes(ach.id)) {
            const unlockedInFamily = family.filter(id => newly.some(n => n.id === id));
            const highestId = unlockedInFamily[unlockedInFamily.length - 1];
            return ach.id === highestId;
          }
        }
        return true;
      });

      setPendingIds((prev) => {
        const merged = [...prev, ...filteredForModal.map((a) => a.id).filter((id) => !prev.includes(id))];
        savePendingIds(merged);
        return merged;
      });
      addPoints(100 * newly.length); // FisioCoins otorgados por cada logro real
      celebrateAchievement();
    }
    prevUnlockedRef.current = currentUnlocked;
  }, [achievements, addPoints]);

  // Descarta IDs pendientes que ya no estén desbloqueados (datos viejos).
  useEffect(() => {
    setPendingIds((prev) => {
      const next = prev.filter((id) => achievements.some((a) => a.id === id && a.unlocked));
      if (next.length === prev.length) return prev;
      savePendingIds(next);
      return next;
    });
  }, [achievements]);

  const recordSession = useCallback((options?: { quality?: number; exerciseName?: string; at?: Date }) => {
    const now = options?.at ?? new Date();
    const today = now.toISOString().split('T')[0];
    const lastSessionDate = localStorage.getItem('fisiomirror-last-session-date');
    if (lastSessionDate !== today) {
      localStorage.setItem('fisiomirror-last-session-date', today);
      addPoints(50); // 50 FisioCoins por día con sesión
    }

    // Ejercicios distintos practicados (para el logro Explorador).
    let practicedCount = 0;
    if (options?.exerciseName) {
      try {
        const raw = localStorage.getItem(PRACTICED_KEY);
        const names: string[] = raw ? JSON.parse(raw) : [];
        if (!names.includes(options.exerciseName)) {
          names.push(options.exerciseName);
          localStorage.setItem(PRACTICED_KEY, JSON.stringify(names));
        }
        practicedCount = names.length;
      } catch {
        practicedCount = 1;
      }
    }

    const hour = now.getHours();
    const quality = options?.quality ?? 0;

    setAchievements(prev => {
      const updated = [...prev];

      updated.forEach((ach, idx) => {
        if (ach.unlocked) return;

        if (SESSION_ACHIEVEMENTS.has(ach.id)) {
          const newProgress = ach.progress + 1;
          updated[idx] = newProgress >= ach.maxProgress
            ? { ...ach, progress: ach.maxProgress, unlocked: true, unlockedAt: new Date().toISOString() }
            : { ...ach, progress: newProgress };
          return;
        }

        if (ach.id === 'night_owl' && hour >= 20) {
          updated[idx] = { ...ach, progress: ach.maxProgress, unlocked: true, unlockedAt: new Date().toISOString() };
          return;
        }

        if (ach.id === 'early_bird' && hour < 7) {
          updated[idx] = { ...ach, progress: ach.maxProgress, unlocked: true, unlockedAt: new Date().toISOString() };
          return;
        }

        if (ach.id === 'perfect_form' && quality >= 90) {
          updated[idx] = { ...ach, progress: ach.maxProgress, unlocked: true, unlockedAt: new Date().toISOString() };
          return;
        }

        if (ach.id === 'all_exercises' && practicedCount > 0) {
          updated[idx] = practicedCount >= ach.maxProgress
            ? { ...ach, progress: ach.maxProgress, unlocked: true, unlockedAt: new Date().toISOString() }
            : { ...ach, progress: practicedCount };
        }
      });

      return updated;
    });
  }, [addPoints]);

  const recordStreak = useCallback((days: number) => {
    setAchievements(prev => {
      const updated = [...prev];
      updated.forEach((ach, idx) => {
        if (ach.unlocked || !ach.id.startsWith('streak_')) return;
        const target = ach.id === 'streak_3' ? 3 : 7;
        if (days >= target) {
          updated[idx] = { ...ach, progress: ach.maxProgress, unlocked: true, unlockedAt: new Date().toISOString() };
        } else {
          updated[idx] = { ...ach, progress: Math.max(ach.progress, Math.min(days, ach.maxProgress)) };
        }
      });
      return updated;
    });
  }, []);

  // Sincroniza el progreso con el total real de sesiones (sin duplicar al guardar).
  const syncSessionProgress = useCallback((total: number) => {
    if (!Number.isFinite(total) || total <= 0) return;
    setAchievements(prev => {
      const updated = [...prev];
      updated.forEach((ach, idx) => {
        if (ach.unlocked || !SESSION_ACHIEVEMENTS.has(ach.id)) return;
        const progress = Math.max(ach.progress, Math.min(total, ach.maxProgress));
        if (total >= ach.maxProgress) {
          updated[idx] = { ...ach, progress: ach.maxProgress, unlocked: true, unlockedAt: new Date().toISOString() };
        } else {
          updated[idx] = { ...ach, progress };
        }
      });
      return updated;
    });
  }, []);

  const unlockSpecial = useCallback((achievementId: string) => {
    if (achievements.find((a) => a.id === achievementId)?.unlocked) return;
    addPoints(75);
    setAchievements(prev => {
      const idx = prev.findIndex(a => a.id === achievementId);
      if (idx === -1 || prev[idx].unlocked) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], unlocked: true, progress: updated[idx].maxProgress, unlockedAt: new Date().toISOString() };
      return updated;
    });
  }, [achievements, addPoints]);

  const dismissUnlock = useCallback(() => {
    setPendingIds((prev) => {
      const next = prev.slice(1);
      savePendingIds(next);
      return next;
    });
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalProgress = achievements.reduce((sum, a) => sum + (a.unlocked ? 1 : a.progress / a.maxProgress), 0) / achievements.length;

  return {
    achievements,
    newlyUnlocked,
    dismissUnlock,
    recordSession,
    recordStreak,
    syncSessionProgress,
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
