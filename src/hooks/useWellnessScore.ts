import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Bienestar funcional del paciente, calculado solo con datos reales.
 *
 * Formula aprobada (pesos renormalizados si falta una fuente):
 *   - 40% adherencia  : sesiones de los ultimos 7 dias / objetivo semanal
 *   - 25% progreso ROM: mejora del angulo maximo (ultimas 5 vs 5 anteriores)
 *   - 20% control dolor: promedio de dolor reciente invertido
 *   - 15% constancia  : dias distintos con sesion en los ultimos 7 dias
 *
 * Si no hay ninguna fuente utilizable, score = null (empty state honesto).
 */

const WEEK_TARGET_SESSIONS = 3; // objetivo semanal de referencia clinica
const ROM_TARGET_GAIN = 0.10; // +10% de ROM = 100% del componente

interface SessionRow {
  fecha: string;
  calidad_ejecucion: number | null;
  dolor_reportado: number | null;
  metricas: Record<string, unknown> | null;
}

interface PainRow {
  nivel: number;
  creado_en: string;
}

export interface WellnessPart {
  key: 'adherence' | 'rom' | 'pain' | 'consistency';
  value: number; // 0..1
  weight: number;
}

export interface WellnessResult {
  score: number | null;
  parts: WellnessPart[];
  streak: number;
  sessionsLast7: number;
  painTrendDown: boolean;
  loading: boolean;
}

function maxAngleOf(row: SessionRow): number | null {
  const m = row.metricas;
  if (!m) return null;
  const raw = m.max_angle ?? m.maxAngle ?? m.angulo_maximo;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function useWellnessScore(patientId?: string | null): WellnessResult {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [pains, setPains] = useState<PainRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const since = new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString();
    Promise.all([
      supabase
        .from('sesiones_completadas')
        .select('fecha, calidad_ejecucion, dolor_reportado, metricas')
        .eq('paciente_id', patientId)
        .gte('fecha', since)
        .order('fecha', { ascending: false })
        .limit(60),
      supabase
        .from('pain_reports')
        .select('nivel, creado_en')
        .eq('paciente_id', patientId)
        .order('creado_en', { ascending: false })
        .limit(5),
    ]).then(([s, pr]) => {
      if (!alive) return;
      setSessions((s.data as SessionRow[] | null) ?? []);
      setPains((pr.data as PainRow[] | null) ?? []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [patientId]);

  return useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 3600 * 1000;
    const last7 = sessions.filter((s) => now - new Date(s.fecha).getTime() <= 7 * dayMs);
    const days = new Set(last7.map((s) => new Date(s.fecha).toISOString().slice(0, 10)));
    const streak = computeStreak(sessions, dayMs);

    const parts: WellnessPart[] = [];

    if (sessions.length > 0 || last7.length > 0) {
      parts.push({ key: 'adherence', value: clamp01(last7.length / WEEK_TARGET_SESSIONS), weight: 0.4 });
      parts.push({ key: 'consistency', value: clamp01(days.size / 7), weight: 0.15 });
    }

    // ROM: ultimas 5 mediciones validas vs las 5 anteriores
    const angles = sessions.map(maxAngleOf).filter((v): v is number => v !== null);
    if (angles.length >= 2) {
      const recent = angles.slice(0, Math.min(5, Math.floor(angles.length / 2)));
      const prev = angles.slice(recent.length, recent.length + recent.length);
      if (recent.length && prev.length) {
        const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
        const gain = (avg(recent) - avg(prev)) / Math.max(avg(prev), 1);
        parts.push({ key: 'rom', value: clamp01(gain / ROM_TARGET_GAIN), weight: 0.25 });
      }
    }

    // Dolor: pain_reports nuevos; si no hay, dolor_reportado de sesiones
    const painValues = pains.length
      ? pains.map((p) => p.nivel)
      : sessions.map((s) => s.dolor_reportado).filter((v): v is number => typeof v === 'number');
    const painTrendDown =
      painValues.length >= 2 && painValues[0] < painValues[painValues.length - 1];
    if (painValues.length) {
      const avgPain = painValues.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, painValues.length);
      parts.push({ key: 'pain', value: clamp01((10 - avgPain) / 10), weight: 0.2 });
    }

    const weightSum = parts.reduce((a, p) => a + p.weight, 0);
    const score = weightSum > 0
      ? Math.round((parts.reduce((a, p) => a + p.value * p.weight, 0) / weightSum) * 100)
      : null;

    return {
      score,
      parts,
      streak,
      sessionsLast7: last7.length,
      painTrendDown,
      loading,
    };
  }, [sessions, pains, loading]);
}

function computeStreak(rows: SessionRow[], dayMs: number): number {
  if (!rows.length) return 0;
  const days = new Set(rows.map((r) => new Date(r.fecha).toISOString().slice(0, 10)));
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 60; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    cursor = new Date(cursor.getTime() - dayMs);
  }
  return streak;
}
