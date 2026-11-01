import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  buildAlerts,
  buildCohorts,
  buildRomPoints,
  buildVasSeries,
  toAnalyticsSession,
  type AlertItem,
  type AnalyticsRow,
  type AnalyticsSession,
  type CohortPoint,
  type RomPoint,
  type VasPoint,
} from '../lib/clinicalAnalytics';

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
}

const displayName = (p: ProfileRow | undefined, fallback: string): string => {
  if (!p) return fallback;
  const full = p.full_name?.trim();
  if (full) return full;
  const mail = p.email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  return mail || fallback;
};

export interface ClinicalAnalyticsState {
  loading: boolean;
  error: string | null;
  sessions: AnalyticsSession[];
  rom: RomPoint[];
  vas: VasPoint[];
  cohorts: CohortPoint[];
  alerts: AlertItem[];
  refresh: () => void;
}

/**
 * Carga `sesiones_completadas` reales y deriva ROM, VAS, cohortes y triage.
 * No rellena con datos de ejemplo: si la consulta vuelve vacía, las listas
 * quedan vacías y la UI muestra su estado correspondiente.
 */
export function useClinicalAnalytics(limit = 500): ClinicalAnalyticsState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AnalyticsSession[]>([]);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: queryError } = await supabase
          .from('sesiones_completadas')
          .select('id,paciente_id,ejercicio_nombre,calidad_ejecucion,dolor_reportado,metricas,compensaciones_detectadas,fecha')
          .order('fecha', { ascending: false })
          .limit(limit);

        if (queryError) throw new Error(queryError.message);
        if (cancelled) return;

        const rows = (data ?? []) as unknown as AnalyticsRow[];
        const ids = [...new Set(rows.map((r) => r.paciente_id).filter(Boolean))];

        let names = new Map<string, string>();
        if (ids.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id,full_name,email')
            .in('id', ids);
          if (profiles) {
            names = new Map(
              (profiles as unknown as ProfileRow[]).map((p) => [p.id, displayName(p, 'Paciente')]),
            );
          }
        }
        if (cancelled) return;

        setSessions(
          rows.map((r) => toAnalyticsSession(r, names.get(r.paciente_id) ?? 'Paciente')),
        );
      } catch (err) {
        if (cancelled) return;
        setSessions([]);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las sesiones');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [limit, tick]);

  return {
    loading,
    error,
    sessions,
    rom: buildRomPoints(sessions),
    vas: buildVasSeries(sessions),
    cohorts: buildCohorts(sessions),
    alerts: buildAlerts(sessions),
    refresh,
  };
}
