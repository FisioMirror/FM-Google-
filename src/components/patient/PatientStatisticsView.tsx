import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Icon } from '../ui/Icon';
import { MedicalIcon } from '../ui/MedicalIcon';
import { currentLocale } from '../../lib/format';
import { useTranslation } from 'react-i18next';

interface SessionData {
  id: string;
  fecha: string;
  ejercicio_nombre: string | null;
  duracion_segundos: number | null;
  repeticiones: number | null;
  calidad_ejecucion: number | null;
  notas: string | null;
  compensaciones_detectadas?: unknown;
  adherencia?: number | null;
  rom_alcanzado?: number;
}

interface ExerciseData {
  id: string;
  ejercicio_nombre: string | null;
  series: number | null;
  repeticiones: number | null;
}

interface PatientStatisticsViewProps {
  patientName: string;
  targetRom?: string | null;
  affectedLimb?: string | null;
  sessions: SessionData[];
  exercises: ExerciseData[];
}

export function PatientStatisticsView({
  patientName,
  targetRom,
  affectedLimb,
  sessions,
  exercises,
}: PatientStatisticsViewProps) {
  const { t } = useTranslation();
  // Aggregate calculations
  const totalSessions = sessions.length;
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duracion_segundos || 0), 0) / 60);
  const avgQuality = totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.calidad_ejecucion || 0), 0) / totalSessions) : 0;
  
  // Peak ROM: solo dato real registrado por el sensor (sin estimaciones).
  const peakRom = useMemo(() => {
    let max = 0;
    sessions.forEach((s) => {
      if (typeof s.rom_alcanzado === 'number' && s.rom_alcanzado > max) max = s.rom_alcanzado;
    });
    return max;
  }, [sessions]);

  // Adherencia real: null cuando no hay dato (se muestra '—', no se estima).
  const avgAdherence = useMemo<number | null>(() => {
    const withAdh = sessions.filter((s) => typeof s.adherencia === 'number');
    if (withAdh.length === 0) return null;
    return Math.round(withAdh.reduce((sum, s) => sum + (s.adherencia as number), 0) / withAdh.length);
  }, [sessions]);

  // Evolution Data for Chart (Sorted chronologically)
  const evolutionData = useMemo(() => {
    const chronoSessions = [...sessions].reverse();
    if (chronoSessions.length === 0) return [];
    return chronoSessions.map((s, idx) => {
      const d = new Date(s.fecha);
      const dateLabel = isNaN(d.getTime()) ? `S${idx + 1}` : d.toLocaleDateString(currentLocale(), { day: '2-digit', month: 'short' });
      return {
        sesion: `#${idx + 1}`,
        date: dateLabel,
        calidad: typeof s.calidad_ejecucion === 'number' ? s.calidad_ejecucion : null,
        rom: typeof s.rom_alcanzado === 'number' ? s.rom_alcanzado : null,
        ejercicio: s.ejercicio_nombre || 'Sesión',
        duracionMin: Math.round((s.duracion_segundos || 0) / 60),
      };
    });
  }, [sessions]);

  // Exercise distribution data
  const exerciseStatsData = useMemo(() => {
    const exMap: Record<string, { count: number; totalMinutes: number; totalReps: number; avgQuality: number }> = {};
    
    sessions.forEach((s) => {
      const name = s.ejercicio_nombre || 'Ejercicio General';
      if (!exMap[name]) {
        exMap[name] = { count: 0, totalMinutes: 0, totalReps: 0, avgQuality: 0 };
      }
      exMap[name].count += 1;
      exMap[name].totalMinutes += Math.round((s.duracion_segundos || 0) / 60);
      exMap[name].totalReps += s.repeticiones || 0;
      exMap[name].avgQuality += s.calidad_ejecucion || 0;
    });

    const result = Object.entries(exMap).map(([name, data]) => ({
      name: name.length > 18 ? `${name.substring(0, 16)}...` : name,
      fullName: name,
      minutos: data.totalMinutes,
      repeticiones: data.totalReps,
      calidad: Math.round(data.avgQuality / data.count),
    }));

    return result;
  }, [sessions]);

  // Detected compensations: agregado real de compensaciones_detectadas (sin diagnosticos inferidos).
  const compensationsSummary = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s) => {
      const raw = s.compensaciones_detectadas;
      const items = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [raw] : [];
      items.forEach((item) => {
        const tipo =
          typeof item === 'string'
            ? item
            : item && typeof item === 'object' && 'tipo' in item
            ? String((item as { tipo?: unknown }).tipo ?? '')
            : item && typeof item === 'object' && 'type' in item
            ? String((item as { type?: unknown }).type ?? '')
            : '';
        if (tipo.trim()) map.set(tipo.trim(), (map.get(tipo.trim()) ?? 0) + 1);
      });
    });
    return [...map.entries()].map(([title, count]) => ({
      title,
      desc: 'Detectada por el sensor de cámara durante las sesiones registradas.',
      count,
    }));
  }, [sessions]);

  return (
    <div className="space-y-6 w-full">
      {/* ── KPI Clinical Metrics (Solid bold numbers, zero gradients on text) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Sessions */}
        <div className="ios-glass-heavy refraction-border p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 sm:size-11 bg-teal-500/10 text-teal-700 dark:text-teal-300 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Icon name="check_circle" size={22} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300">
              {avgAdherence != null ? `${avgAdherence}% adh.` : '— adh.'}
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1 line-clamp-1">
              Sesiones Totales
            </p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
              {totalSessions}
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-1">{t('psv.recordedWithAi')}</p>
          </div>
        </div>

        {/* Metric 2: Therapeutic Time */}
        <div className="ios-glass-heavy refraction-border p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 sm:size-11 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Icon name="timer" size={22} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300">
              ~{Math.round(totalMinutes / (totalSessions || 1))} min/ses
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1 line-clamp-1">
              Minutos Acumulados
            </p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
              {totalMinutes} <span className="text-sm font-bold text-on-surface-variant">{t('tr.min')}</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-1">{t('psv.activeTime')}</p>
          </div>
        </div>

        {/* Metric 3: Quality Score */}
        <div className="ios-glass-heavy refraction-border p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 sm:size-11 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Icon name="target" size={22} />
            </div>
            <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
              avgQuality >= 85 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}>
              {avgQuality >= 85 ? 'Excelente' : 'Aceptable'}
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1 line-clamp-1">{t('psv.biomechQuality')}</p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
              {avgQuality > 0 ? `${avgQuality}%` : '—'}
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-1">{t('psv.trajectoryAccuracy')}</p>
          </div>
        </div>

        {/* Metric 4: Peak ROM */}
        <div className="ios-glass-heavy refraction-border p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 sm:size-11 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Icon name="straighten" size={22} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
              {targetRom ? `Meta ${targetRom.split(' ')[0]}` : 'Sin meta'}
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1 line-clamp-1">{t('psv.maxRom')}</p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
              {peakRom > 0 ? `${peakRom}°` : '—'}
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-1">{affectedLimb || 'Articulación principal'}</p>
          </div>
        </div>
      </div>

      {/* ── Visual Biomechanical Analytics (Charts) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Evolution of Quality & ROM session by session */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="ios-glass-heavy refraction-border p-5 sm:p-6 rounded-3xl space-y-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Icon name="show_chart" size={20} className="text-teal-600 dark:text-teal-400" />{t('psv.evolution')}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Progreso angular y precisión motora en cada sesión realizada por {patientName}
              </p>
            </div>
          </div>

          {evolutionData.length === 0 ? (
            <div className="h-64 sm:h-72 w-full flex items-center justify-center text-sm text-on-surface-variant px-4 text-center">
              {t('psv.noSessions')}
            </div>
          ) : (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="sesion" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 180]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                          <p className="font-bold text-teal-300">{data.ejercicio} ({data.date})</p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-300">{t('tr.calidad_motora')}</span>
                            <span className="font-bold text-teal-400">{data.calidad != null ? `${data.calidad}%` : '—'}</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-300">{t('tr.rango_articular')}</span>
                            <span className="font-bold text-sky-400">{data.rom != null ? `${data.rom}°` : '—'}</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-300">{t('psv.duration')}</span>
                            <span className="font-bold text-slate-200">{data.duracionMin} min</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  formatter={(value) => (value === 'calidad' ? 'Calidad de Ejecución (%)' : 'Rango Articular ROM (°)')}
                />
                <Area
                  type="monotone"
                  dataKey="calidad"
                  name="calidad"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorQuality)"
                />
                <Area
                  type="monotone"
                  dataKey="rom"
                  name="rom"
                  stroke="#0284c7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorRom)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          )}
        </motion.div>

        {/* Chart 2: Volume & Time Per Prescribed Exercise */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="ios-glass-heavy refraction-border p-5 sm:p-6 rounded-3xl space-y-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Icon name="bar_chart" size={20} className="text-blue-600 dark:text-blue-400" />{t('psv.volumePerExercise')}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{t('psv.loadDist')}</p>
            </div>
          </div>

          {exerciseStatsData.length === 0 ? (
            <div className="h-64 sm:h-72 w-full flex items-center justify-center text-sm text-on-surface-variant px-4 text-center">
              {t('psv.noSessions')}
            </div>
          ) : (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                          <p className="font-bold text-teal-300">{d.fullName}</p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-300">{t('tr.minutos_invertidos')}</span>
                            <span className="font-bold text-teal-400">{d.minutos} min</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-300">{t('tr.repeticiones_totales')}</span>
                            <span className="font-bold text-sky-400">{d.repeticiones} reps</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-300">{t('tr.calidad_promedio')}</span>
                            <span className="font-bold text-emerald-400">{d.calidad}%</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  formatter={(val) => (val === 'minutos' ? 'Minutos Totales' : 'Repeticiones Acumuladas')}
                />
                <Bar dataKey="minutos" name="minutos" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="repeticiones" name="repeticiones" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </motion.div>
      </div>

      {/* ── Motor Control & Compensations Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 ios-glass-heavy refraction-border p-5 sm:p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Icon name="tune" size={20} className="text-teal-600 dark:text-teal-400" />{t('psv.compensationPatterns')}</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Sensor AR Mirror
            </span>
          </div>

          <div className="space-y-3">
            {compensationsSummary.length === 0 && (
              <p className="text-sm text-on-surface-variant">Sin compensaciones registradas por el sensor en las sesiones de este paciente.</p>
            )}
            {compensationsSummary.map((comp) => (
              <div
                key={comp.title}
                className="p-3.5 sm:p-4 rounded-2xl bg-surface-container/40 border border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <MedicalIcon name="skeleton" size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{comp.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">{comp.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                    {comp.count} {comp.count === 1 ? 'registro' : 'registros'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Assessment Box */}
        <div className="ios-glass-heavy refraction-border p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 mb-2">
              <Icon name="assessment" size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider">{t('psv.clinicalAssessment')}</h3>
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              {totalSessions === 0 ? 'Sin datos suficientes' : avgQuality >= 85 ? 'Calidad motriz alta' : 'Calidad motriz en seguimiento'}
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {totalSessions === 0
                ? `Todavía no hay sesiones registradas para ${patientName}. La evaluación se completará cuando existan datos reales de cámara.`
                : `${patientName} registra ${totalSessions} sesión${totalSessions === 1 ? '' : 'es'}, con una calidad motriz promedio de ${avgQuality}%. Adherencia: ${avgAdherence != null ? `${avgAdherence}%` : 'sin datos'}. Arco articular pico: ${peakRom > 0 ? `${peakRom}°` : 'sin registro'}.`}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/15 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Ejercicios prescritos</span>
              <span className="text-teal-700 dark:text-teal-300 tabular-nums">{exercises.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Sesiones con sensor</span>
              <span className="text-teal-700 dark:text-teal-300 tabular-nums">{totalSessions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detailed Telemetry Log Table ── */}
      <div className="ios-glass-heavy refraction-border p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Icon name="history" size={20} className="text-teal-600 dark:text-teal-400" />{t('psv.sessionHistory')}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{t('psv.sessionHistoryDesc')}</p>
          </div>
          <span className="text-xs font-bold text-on-surface-variant">
            {sessions.length} registro(s)
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant text-sm">{t('psv.noSessions')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline/10 text-on-surface-variant font-semibold">
                  <th className="py-3 px-3">{t('tr.fecha_hora')}</th>
                  <th className="py-3 px-3">{t('psv.prescribedExercise')}</th>
                  <th className="py-3 px-3">{t('psv.durationLabel')}</th>
                  <th className="py-3 px-3">{t('tr.reps')}</th>
                  <th className="py-3 px-3">{t('tr.calidad_biomecanica')}</th>
                  <th className="py-3 px-3">{t('psv.maxRomLabel')}</th>
                  <th className="py-3 px-3">{t('tr.observaciones_notas')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 text-slate-800 dark:text-slate-200">
                {sessions.map((s, idx) => {
                  const d = new Date(s.fecha);
                  const formattedDate = isNaN(d.getTime())
                    ? s.fecha
                    : d.toLocaleDateString(currentLocale(), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  const romVal = typeof s.rom_alcanzado === 'number' ? `${s.rom_alcanzado}°` : '—';
                  const durMin = Math.round((s.duracion_segundos || 0) / 60);
                  const durSec = (s.duracion_segundos || 0) % 60;

                  return (
                    <tr key={s.id || idx} className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-3 px-3 font-medium whitespace-nowrap text-on-surface-variant">{formattedDate}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{s.ejercicio_nombre || 'Sesión Terapéutica'}</td>
                      <td className="py-3 px-3 whitespace-nowrap tabular-nums">{durMin}m {durSec > 0 ? `${durSec}s` : ''}</td>
                      <td className="py-3 px-3 tabular-nums font-bold">{s.repeticiones || 0}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold tabular-nums ${
                          (s.calidad_ejecucion || 0) >= 85
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : (s.calidad_ejecucion || 0) >= 70
                            ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        }`}>
                          {s.calidad_ejecucion || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold tabular-nums text-sky-700 dark:text-sky-300">{romVal}</td>
                      <td className="py-3 px-3 text-on-surface-variant max-w-xs truncate">{s.notas || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
