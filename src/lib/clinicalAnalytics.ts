/**
 * Derivaciones clínicas a partir de `sesiones_completadas`.
 *
 * Todo lo que devuelve este módulo sale de filas reales de Supabase:
 * no hay valores de ejemplo ni pronósticos inventados. Cuando no hay
 * muestra suficiente, la función devuelve una lista vacía y la UI
 * muestra un estado explícito.
 */

/** Reglas de clasificación por zona corporal, compartidas con el catálogo. */
export const BODY_ZONE_RULES: { zone: string; keywords: string[] }[] = [
  { zone: 'Hombro', keywords: ['hombro', 'escapul', 'deltoid', 'glenohumeral', 'supraespinoso', 'manguito', 'rotador', 'abduccion', 'abducción', 'flexion de hombro', 'flexión de hombro'] },
  { zone: 'Codo', keywords: ['codo', 'biceps', 'bíceps', 'triceps', 'tríceps', 'antebrazo', 'braquial'] },
  { zone: 'Muñeca y mano', keywords: ['muñeca', 'muneca', 'mano', 'dedo', 'carpo', 'pulgar', 'falange'] },
  { zone: 'Cadera', keywords: ['cadera', 'gluteo', 'glúteo', 'psoas', 'iliaco', 'ilíaco', 'piriforme', 'adductor'] },
  { zone: 'Rodilla', keywords: ['rodilla', 'cuadriceps', 'cuádriceps', 'isquio', 'menisco', 'rotula', 'rótula', 'poplíteo', 'extension de rodilla', 'extensión de rodilla'] },
  { zone: 'Tobillo y pie', keywords: ['tobillo', 'pie', 'pantorrilla', 'gemelo', 'aquiles', 'soleo', 'sóleo', 'metatarso'] },
  { zone: 'Cuello', keywords: ['cuello', 'cervical', 'trapecio', 'escaleno', 'suboccipital'] },
  { zone: 'Columna y core', keywords: ['columna', 'lumbar', 'dorsal', 'espalda', 'core', 'abdominal', 'torso', 'pelvis', 'sacro'] },
];

/** Clasifica un nombre/descripción de ejercicio en una zona corporal. */
export function classifyBodyZone(...sources: (string | null | undefined)[]): string {
  const haystack = sources.filter(Boolean).join(' ').toLowerCase();
  for (const rule of BODY_ZONE_RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) return rule.zone;
  }
  return 'General';
}

/**
 * Rango articular objetivo de referencia adulta (grados). Se usa solo como
 * meta de comparación visual; no es un diagnóstico ni una prescripción.
 */
export const ZONE_ROM_TARGETS: Record<string, number> = {
  'Hombro': 180,
  'Codo': 145,
  'Muñeca y mano': 70,
  'Cadera': 120,
  'Rodilla': 135,
  'Tobillo y pie': 50,
  'Cuello': 80,
  'Columna y core': 60,
  'General': 120,
};

export interface AnalyticsSession {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  ejercicio: string;
  zona: string;
  calidad: number | null;
  dolor: number | null;
  avgAngle: number | null;
  maxAngle: number | null;
  compensaciones: string[];
  fecha: string;
}

export interface AnalyticsRow {
  id: string;
  paciente_id: string;
  ejercicio_nombre: string | null;
  calidad_ejecucion: number | null;
  dolor_reportado: number | null;
  metricas: Record<string, unknown> | null;
  compensaciones_detectadas: unknown;
  fecha: string;
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

const normCompensaciones = (v: unknown): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  if (typeof v === 'string') return v.trim() ? v.split(/[,;|]/).map((s) => s.trim()).filter(Boolean) : [];
  return [];
};

export function toAnalyticsSession(row: AnalyticsRow, nombre: string): AnalyticsSession {
  const m = row.metricas ?? {};
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    pacienteNombre: nombre,
    ejercicio: row.ejercicio_nombre ?? '',
    zona: classifyBodyZone(row.ejercicio_nombre),
    calidad: num(row.calidad_ejecucion),
    dolor: num(row.dolor_reportado),
    avgAngle: num(m.avg_angle),
    maxAngle: num(m.max_angle),
    compensaciones: normCompensaciones(row.compensaciones_detectadas),
    fecha: row.fecha,
  };
}

const avg = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

export interface RomPoint {
  joint: string;
  actual: number;
  ideal: number;
  deficit: number;
  percent: number;
  unit: string;
  status: 'optimal' | 'recovering' | 'needs_work';
  samples: number;
}

/** ROM real por zona: promedio de la mejor medición (`max_angle`) disponible. */
export function buildRomPoints(sessions: AnalyticsSession[]): RomPoint[] {
  const byZone = new Map<string, number[]>();
  for (const s of sessions) {
    if (s.maxAngle === null || s.maxAngle <= 0) continue;
    const list = byZone.get(s.zona) ?? [];
    list.push(s.maxAngle);
    byZone.set(s.zona, list);
  }

  const points: RomPoint[] = [];
  for (const [zone, values] of byZone) {
    const ideal = ZONE_ROM_TARGETS[zone] ?? ZONE_ROM_TARGETS.General;
    const actual = Math.round(avg(values));
    const percent = Math.min(100, Math.round((actual / ideal) * 100));
    points.push({
      joint: zone,
      actual,
      ideal,
      deficit: Math.max(0, ideal - actual),
      percent,
      unit: '°',
      status: percent >= 90 ? 'optimal' : percent >= 70 ? 'recovering' : 'needs_work',
      samples: values.length,
    });
  }
  return points.sort((a, b) => b.samples - a.samples || a.joint.localeCompare(b.joint));
}

export interface VasPoint {
  session: string;
  precision: number;
  vasPain: number;
}

/** Serie temporal por semana ISO a partir de sesiones reales (máx. 8 semanas). */
export function buildVasSeries(sessions: AnalyticsSession[], maxWeeks = 8): VasPoint[] {
  const buckets = new Map<string, { quality: number[]; pain: number[] }>();
  for (const s of sessions) {
    const d = new Date(s.fecha);
    if (Number.isNaN(d.getTime())) continue;
    const key = weekKey(d);
    const bucket = buckets.get(key) ?? { quality: [], pain: [] };
    if (s.calidad !== null) bucket.quality.push(s.calidad > 1 ? s.calidad : s.calidad * 100);
    if (s.dolor !== null) bucket.pain.push(s.dolor);
    buckets.set(key, bucket);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxWeeks)
    .map(([key, v]) => ({
      session: key,
      precision: Math.round(avg(v.quality)),
      vasPain: Number(avg(v.pain).toFixed(1)),
    }))
    .filter((p) => p.precision > 0 || p.vasPain > 0);
}

function weekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `S${String(week).padStart(2, '0')}`;
}

export interface CohortPoint {
  name: string;
  patientsCount: number;
  adherence: number;
  avgQuality: number;
  color: string;
}

const COHORT_COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

/** Cohortes = zonas reales con actividad: pacientes, adherencia 7d y calidad media. */
export function buildCohorts(sessions: AnalyticsSession[], now = new Date()): CohortPoint[] {
  const cutoff = now.getTime() - 7 * 86400000;
  const byZone = new Map<string, AnalyticsSession[]>();
  for (const s of sessions) {
    const list = byZone.get(s.zona) ?? [];
    list.push(s);
    byZone.set(s.zona, list);
  }

  const cohorts: CohortPoint[] = [];
  let i = 0;
  for (const [zone, list] of byZone) {
    const patients = new Set(list.map((s) => s.pacienteId));
    const activePatients = new Set(
      list.filter((s) => new Date(s.fecha).getTime() >= cutoff).map((s) => s.pacienteId),
    );
    const qualities = list.map((s) => s.calidad).filter((q): q is number => q !== null)
      .map((q) => (q > 1 ? q : q * 100));
    cohorts.push({
      name: zone,
      patientsCount: patients.size,
      adherence: patients.size === 0 ? 0 : Math.round((activePatients.size / patients.size) * 100),
      avgQuality: Math.round(avg(qualities)),
      color: COHORT_COLORS[i++ % COHORT_COLORS.length],
    });
  }
  return cohorts.sort((a, b) => b.patientsCount - a.patientsCount);
}

export interface AlertItem {
  id: string;
  patientName: string;
  patientId: string;
  type: 'overload' | 'pain_spike' | 'dropout_risk' | 'milestone_ready';
  /** Clave i18n del título. */
  titleKey: string;
  /** Clave i18n de la descripción. */
  descriptionKey: string;
  metric: string;
  hoursAgo: number;
  daysAgo: number;
}

/**
 * Triage real: dolor alto reciente, compensaciones detectadas, riesgo de
 * abandono (sin sesiones hace >7 días) y hitos de ROM. Máximo 4 tarjetas,
 * ordenadas por severidad.
 */
export function buildAlerts(sessions: AnalyticsSession[], now = new Date()): AlertItem[] {
  const nowMs = now.getTime();
  const hours = (iso: string) => Math.max(0, Math.round((nowMs - new Date(iso).getTime()) / 3600000));

  const latestByPatient = new Map<string, AnalyticsSession>();
  for (const s of sessions) {
    const prev = latestByPatient.get(s.pacienteId);
    if (!prev || new Date(s.fecha) > new Date(prev.fecha)) latestByPatient.set(s.pacienteId, s);
  }

  const alerts: AlertItem[] = [];

  const painCases = [...latestByPatient.values()]
    .filter((s) => s.dolor !== null && s.dolor >= 7 && hours(s.fecha) <= 24 * 7)
    .sort((a, b) => (b.dolor ?? 0) - (a.dolor ?? 0));
  for (const s of painCases) {
    alerts.push({
      id: `pain-${s.id}`,
      patientName: s.pacienteNombre,
      patientId: s.pacienteId,
      type: 'pain_spike',
      titleKey: 'cah.acutePainSpike',
      descriptionKey: 'cah.painReportedInSession',
      metric: `EVA ${s.dolor}/10`,
      hoursAgo: hours(s.fecha),
      daysAgo: 0,
    });
  }

  const overload = [...latestByPatient.values()]
    .filter((s) => s.compensaciones.length > 0 && hours(s.fecha) <= 24 * 14)
    .sort((a, b) => hours(a.fecha) - hours(b.fecha));
  for (const s of overload) {
    alerts.push({
      id: `comp-${s.id}`,
      patientName: s.pacienteNombre,
      patientId: s.pacienteId,
      type: 'overload',
      titleKey: 'cah.biomechanicalCompensationDetected',
      descriptionKey: 'cah.compensationInExercise',
      metric: s.compensaciones.slice(0, 2).join(', '),
      hoursAgo: hours(s.fecha),
      daysAgo: 0,
    });
  }

  const dropouts = [...latestByPatient.values()]
    .filter((s) => hours(s.fecha) > 24 * 7)
    .sort((a, b) => hours(b.fecha) - hours(a.fecha));
  for (const s of dropouts) {
    alerts.push({
      id: `drop-${s.id}`,
      patientName: s.pacienteNombre,
      patientId: s.pacienteId,
      type: 'dropout_risk',
      titleKey: 'cah.therapyDropoutRisk',
      descriptionKey: 'cah.noSessionsRecently',
      metric: `${Math.round(hours(s.fecha) / 24)} d`,
      hoursAgo: hours(s.fecha),
      daysAgo: Math.round(hours(s.fecha) / 24),
    });
  }

  const milestones = [...latestByPatient.values()]
    .filter((s) => {
      if (s.maxAngle === null) return false;
      const target = ZONE_ROM_TARGETS[s.zona] ?? ZONE_ROM_TARGETS.General;
      return s.maxAngle >= target * 0.9;
    })
    .sort((a, b) => hours(a.fecha) - hours(b.fecha));
  for (const s of milestones) {
    const target = ZONE_ROM_TARGETS[s.zona] ?? ZONE_ROM_TARGETS.General;
    alerts.push({
      id: `mile-${s.id}`,
      patientName: s.pacienteNombre,
      patientId: s.pacienteId,
      type: 'milestone_ready',
      titleKey: 'cah.loadProgressionCandidate',
      descriptionKey: 'cah.reachedPhysiologicalRom',
      metric: `${s.maxAngle}° / ${target}°`,
      hoursAgo: hours(s.fecha),
      daysAgo: 0,
    });
  }

  return alerts.slice(0, 4);
}
