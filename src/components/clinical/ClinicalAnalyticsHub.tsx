import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  Layers,
  Sparkles,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../ui/Glass';
import { useNavigate } from 'react-router-dom';

interface RomJointData {
  joint: string;
  actual: number;
  ideal: number;
  deficit: number;
  percent: number;
  unit: string;
  clinicalNote: string;
  status: 'optimal' | 'recovering' | 'needs_work';
}

const ROM_DATA: RomJointData[] = [
  {
    joint: 'Flexión Hombro',
    actual: 148,
    ideal: 180,
    deficit: 32,
    percent: 82,
    unit: '°',
    clinicalNote: 'Buena progresión escapulohumeral sin compensación de trapecio superior.',
    status: 'recovering',
  },
  {
    joint: 'Extensión Rodilla',
    actual: 125,
    ideal: 135,
    deficit: 10,
    percent: 93,
    unit: '°',
    clinicalNote: 'Extensión terminal completa recuperada. Sin retraso de cuádriceps.',
    status: 'optimal',
  },
  {
    joint: 'Abducción Cadera',
    actual: 36,
    ideal: 45,
    deficit: 9,
    percent: 80,
    unit: '°',
    clinicalNote: 'Fortalecimiento de glúteo medio en curso. Estable en apoyo monopodal.',
    status: 'recovering',
  },
  {
    joint: 'Flexión Codo',
    actual: 134,
    ideal: 145,
    deficit: 11,
    percent: 92,
    unit: '°',
    clinicalNote: 'Arco funcional óptimo para actividades de la vida diaria (AVD).',
    status: 'optimal',
  },
  {
    joint: 'Rotación Externa',
    actual: 68,
    ideal: 90,
    deficit: 22,
    percent: 75,
    unit: '°',
    clinicalNote: 'Leve tirantez capsular posterior. Se aconseja estiramiento suave.',
    status: 'needs_work',
  },
  {
    joint: 'Dorsiflexión Tobillo',
    actual: 16,
    ideal: 20,
    deficit: 4,
    percent: 80,
    unit: '°',
    clinicalNote: 'Suficiente para marcha sin claudicación. Continuar propiocepción.',
    status: 'recovering',
  },
];

// Correlación Precisión vs Dolor (VAS / EVA)
interface VasCorrelationPoint {
  session: string;
  precision: number;
  vasPain: number;
  fatigue: number;
  load: string;
}

const VAS_CORRELATION_DATA: VasCorrelationPoint[] = [
  { session: 'S1', precision: 54, vasPain: 7.5, fatigue: 8.0, load: 'Inicial' },
  { session: 'S2', precision: 62, vasPain: 6.8, fatigue: 7.2, load: 'Adaptación' },
  { session: 'S3', precision: 71, vasPain: 5.5, fatigue: 6.0, load: 'Moderada' },
  { session: 'S4', precision: 78, vasPain: 4.2, fatigue: 5.1, load: 'Terapéutica' },
  { session: 'S5', precision: 84, vasPain: 3.1, fatigue: 4.2, load: 'Terapéutica' },
  { session: 'S6', precision: 90, vasPain: 2.2, fatigue: 3.5, load: 'Consolidación' },
  { session: 'S7', precision: 93, vasPain: 1.8, fatigue: 2.9, load: 'Consolidación' },
  { session: 'S8', precision: 96, vasPain: 1.0, fatigue: 2.1, load: 'Óptima' },
];

// Cohortes Clínicos
interface ClinicalCohort {
  name: string;
  patientsCount: number;
  adherence: number;
  avgQuality: number;
  dischargeForecast: string;
  color: string;
}

const CLINICAL_COHORTS: ClinicalCohort[] = [
  {
    name: 'Postoperatorio LCA / Rodilla',
    patientsCount: 18,
    adherence: 94,
    avgQuality: 91,
    dischargeForecast: '3-4 semanas',
    color: '#0d9488', // teal-600
  },
  {
    name: 'Lumbalgia & Columna Funcional',
    patientsCount: 26,
    adherence: 88,
    avgQuality: 85,
    dischargeForecast: '5-6 semanas',
    color: '#06b6d4', // cyan-500
  },
  {
    name: 'Manguito Rotador / Hombro',
    patientsCount: 14,
    adherence: 78,
    avgQuality: 80,
    dischargeForecast: '6-8 semanas',
    color: '#3b82f6', // blue-500
  },
  {
    name: 'Geriatría & Prevención de Caídas',
    patientsCount: 12,
    adherence: 84,
    avgQuality: 86,
    dischargeForecast: 'Mantenimiento continuo',
    color: '#10b981', // emerald-500
  },
  {
    name: 'Cervicalgia & Ergonomía',
    patientsCount: 9,
    adherence: 82,
    avgQuality: 84,
    dischargeForecast: '2-3 semanas',
    color: '#8b5cf6', // purple-500
  },
];

// Triage y Prioridades Clínicas
interface ClinicalAlertItem {
  id: string;
  patientName: string;
  patientId: string;
  type: 'overload' | 'pain_spike' | 'dropout_risk' | 'milestone_ready';
  title: string;
  description: string;
  metric: string;
  timeAgo: string;
}

const CLINICAL_ALERTS: ClinicalAlertItem[] = [
  {
    id: 'alt-1',
    patientName: 'Lucía Mendoza',
    patientId: 'demo-3',
    type: 'pain_spike',
    title: 'Pico de Dolor Agudo (EVA 7.0)',
    description: 'Reportó aumento de molestia tras serie de abducción con resistencia elástica.',
    metric: 'EVA 3.0 → 7.0',
    timeAgo: 'Hace 45 min',
  },
  {
    id: 'alt-2',
    patientName: 'Carlos Domínguez',
    patientId: 'demo-2',
    type: 'overload',
    title: 'Compensación Biomecánica Detectada',
    description: 'Visión AR detectó inclinación de tronco >12° durante sentadilla monopodal.',
    metric: 'Ángulo Compensado: 14°',
    timeAgo: 'Hace 2 horas',
  },
  {
    id: 'alt-3',
    patientName: 'Roberto Gómez',
    patientId: 'demo-4',
    type: 'dropout_risk',
    title: 'Riesgo de Abandono Terapéutico',
    description: 'Inactivo durante 6 días consecutivos tras haber completado el 40% del protocolo.',
    metric: 'Adherencia: 42%',
    timeAgo: 'Hace 1 día',
  },
  {
    id: 'alt-4',
    patientName: 'María Fernández',
    patientId: 'demo-1',
    type: 'milestone_ready',
    title: 'Candidata a Progresión de Carga',
    description: 'Alcanzó 93% de ROM fisiológico y dolor 0 en las últimas 5 sesiones consecutivas.',
    metric: 'ROM: 93% (Sin dolor)',
    timeAgo: 'Hoy, 09:15',
  },
];

const customTooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    border: '1px solid rgba(20, 184, 166, 0.3)',
    borderRadius: '16px',
    padding: '12px 16px',
    color: '#f8fafc',
    fontSize: '12px',
    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
  },
  itemStyle: { color: '#f8fafc', fontWeight: 500 },
  labelStyle: { color: '#2dd4bf', fontWeight: 700, marginBottom: '6px' },
};

export function ClinicalAnalyticsHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedJoint, setSelectedJoint] = useState<string>(ROM_DATA[0].joint);
  const [activeTab, setActiveTab] = useState<'rom' | 'vas' | 'cohorts'>('rom');

  const currentJointData = ROM_DATA.find((j) => j.joint === selectedJoint) || ROM_DATA[0];

  return (
    <div className="space-y-8 w-full">
      {/* Header with Title & Clinical Scope */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
              Módulo de Alta Precisión
            </span>
            <span className="text-xs text-on-surface-variant font-medium">· Biomecánica & Tele-rehabilitación</span>
          </div>
          <h3 className="font-headline-md text-headline-sm lg:text-headline-md text-on-surface">
            Analítica Clínica Avanzada
          </h3>
          <p className="text-xs text-on-surface-variant max-w-2xl">
            Monitoreo cuantitativo del rango articular (ROM), índice de biofeedback vs. umbral de dolor (EVA) y tasa de cumplimiento por cohortes.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-surface-container-highest/60 border border-outline/10 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('rom')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rom'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Activity className="size-3.5" />
            <span>ROM Articular</span>
          </button>
          <button
            onClick={() => setActiveTab('vas')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'vas'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Zap className="size-3.5" />
            <span>Precisión vs. Dolor (EVA)</span>
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cohorts'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Layers className="size-3.5" />
            <span>Cohortes Clínicos</span>
          </button>
        </div>
      </div>

      {/* Tab 1: ROM por Articulación */}
      {activeTab === 'rom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <GlassPanel className="lg:col-span-2 p-6 sm:p-8 rounded-[32px] border-l-4 border-l-teal-500 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Target className="size-4 text-teal-600 dark:text-teal-400" />
                  Rango de Movimiento (ROM): Actual vs. Objetivo Fisiológico
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Valores en grados (°) medidos por cinemática AR y biofeedback
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                  <span className="size-2.5 rounded-full bg-teal-500" /> Ángulo Actual
                </span>
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="size-2.5 rounded-full bg-slate-400 dark:bg-slate-600" /> Objetivo Ideal
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ROM_DATA}
                  margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                  barGap={8}
                >
                  <defs>
                    <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="gradIdeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#64748b" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis
                    dataKey="joint"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    unit="°"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={customTooltipStyle.contentStyle}
                    labelStyle={customTooltipStyle.labelStyle}
                    formatter={(value: number, name: string) => [
                      `${value}°`,
                      name === 'actual' ? 'Ángulo Actual' : 'Objetivo Fisiológico',
                    ]}
                  />
                  <Bar
                    dataKey="actual"
                    name="actual"
                    fill="url(#gradActual)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="ideal"
                    name="ideal"
                    fill="url(#gradIdeal)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick selector chips */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-outline/10">
              {ROM_DATA.map((j) => (
                <button
                  key={j.joint}
                  onClick={() => setSelectedJoint(j.joint)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedJoint === j.joint
                      ? 'bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-500/30'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span>{j.joint}</span>
                  <span className="font-bold text-[10px] opacity-80">{j.percent}%</span>
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* Joint Detail Card */}
          <GlassPanel className="p-6 sm:p-8 rounded-[32px] border border-outline/15 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20">
                  Evaluación Articular
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    currentJointData.status === 'optimal'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : currentJointData.status === 'recovering'
                      ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}
                >
                  {currentJointData.status === 'optimal'
                    ? 'Óptimo'
                    : currentJointData.status === 'recovering'
                    ? 'En recuperación'
                    : 'Requiere atención'}
                </span>
              </div>

              <h4 className="text-lg font-extrabold text-on-surface">{currentJointData.joint}</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {currentJointData.clinicalNote}
              </p>

              {/* Metrics visual */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-teal-900/10 border border-teal-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    Ángulo Logrado
                  </p>
                  <p className="text-2xl font-black text-teal-900 dark:text-teal-100 mt-0.5">
                    {currentJointData.actual}°
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Meta: {currentJointData.ideal}°
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Déficit Residual
                  </p>
                  <p className="text-2xl font-black text-on-surface mt-0.5">
                    -{currentJointData.deficit}°
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    {currentJointData.percent}% alcanzado
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface-variant">Cumplimiento del arco</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">{currentJointData.percent}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-container-highest overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentJointData.percent}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline/10 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant flex items-center gap-1">
                <Info className="size-3.5 text-teal-600" /> Escala Goniométrica
              </span>
              <button
                onClick={() => navigate('/fisio-exercises')}
                className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
              >
                Ajustar Ejercicios <ChevronRight className="size-3.5" />
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Tab 2: Correlación Precisión vs. Dolor (VAS / EVA) */}
      {activeTab === 'vas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassPanel className="lg:col-span-2 p-6 sm:p-8 rounded-[32px] border-l-4 border-l-cyan-500 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Zap className="size-4 text-cyan-600 dark:text-cyan-400" />
                  Correlación Precisión Biomecánica (%) vs. Escala de Dolor (EVA 0-10)
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Comportamiento cinemático de la técnica frente a la fatiga y el umbral de dolor
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                  <span className="size-2.5 rounded-full bg-teal-500" /> Precisión %
                </span>
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="size-2.5 rounded-full bg-amber-500" /> Dolor EVA (0-10)
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={VAS_CORRELATION_DATA}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPrecision" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" unit="%" tick={{ fill: '#64748b', fontSize: 11 }} domain={[40, 100]} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" unit="/10" tick={{ fill: '#f59e0b', fontSize: 11 }} domain={[0, 10]} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={customTooltipStyle.contentStyle}
                    labelStyle={customTooltipStyle.labelStyle}
                    formatter={(value: number, name: string) => [
                      name === 'precision' ? `${value}%` : `${value}/10`,
                      name === 'precision' ? 'Calidad de Ejecución' : 'Nivel de Dolor (EVA)',
                    ]}
                  />
                  <ReferenceArea
                    yAxisId="left"
                    y1={80}
                    y2={100}
                    fill="#10b981"
                    fillOpacity={0.07}
                    label={{ value: 'Zona Terapéutica Óptima', fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="precision"
                    stroke="#0d9488"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPrecision)"
                    name="precision"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="vasPain"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorPain)"
                    name="vasPain"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-outline/10 flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                Zona Óptima: Precisión &gt;80% con EVA &lt; 3.0
              </span>
              <span className="font-semibold text-teal-700 dark:text-teal-300">
                Reducción de dolor: -76% en 8 sesiones
              </span>
            </div>
          </GlassPanel>

          {/* Clinical Interpretation */}
          <GlassPanel className="p-6 sm:p-8 rounded-[32px] border border-outline/15 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <Stethoscope className="size-4" />
                </div>
                <h4 className="font-bold text-sm text-on-surface">Lectura Biomecánica</h4>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-on-surface-variant">
                <p>
                  Existe una <strong>correlación inversa fuerte (r = -0.92)</strong> entre el dolor percibido y la precisión del movimiento guiado.
                </p>
                <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-900 dark:text-teal-200">
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-teal-600" /> Eficiencia Neuromuscular
                  </p>
                  <p>
                    A partir de la <strong>Sesión 4</strong>, la inhibición muscular artrogénica disminuye, permitiendo patrones de movimiento simétricos.
                  </p>
                </div>
                <p className="text-[11px] italic text-outline">
                  * Algoritmo de visión computacional calibrado según la escala goniométrica internacional ISOM.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-outline/10">
              <button
                onClick={() => navigate('/tools')}
                className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Generar Informe de Dolor / ROM</span>
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Tab 3: Cohortes Clínicos */}
      {activeTab === 'cohorts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassPanel className="lg:col-span-2 p-6 sm:p-8 rounded-[32px] border-l-4 border-l-emerald-500 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
                  Adherencia y Calidad por Cohortes Diagnósticas
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Rendimiento terapéutico agrupado por categoría clínica
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                79 Pacientes Totales
              </span>
            </div>

            <div className="space-y-4">
              {CLINICAL_COHORTS.map((cohort) => (
                <div
                  key={cohort.name}
                  className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline/10 hover:border-teal-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-sm text-on-surface">{cohort.name}</span>
                      <span className="text-xs text-on-surface-variant ml-2">
                        ({cohort.patientsCount} pacientes)
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-teal-700 dark:text-teal-300">
                        Adherencia: <strong className="font-bold">{cohort.adherence}%</strong>
                      </span>
                      <span className="text-on-surface-variant">
                        Alta est.: <span className="font-normal text-on-surface">{cohort.dischargeForecast}</span>
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-surface-container-highest overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cohort.adherence}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cohort.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Cohort Insights */}
          <GlassPanel className="p-6 sm:p-8 rounded-[32px] border border-outline/15 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="size-4" />
                </div>
                <h4 className="font-bold text-sm text-on-surface">Factores de Cumplimiento</h4>
              </div>

              <div className="space-y-3.5 text-xs text-on-surface-variant">
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline/10">
                  <p className="font-bold text-on-surface mb-0.5">Postquirúrgicos (LCA)</p>
                  <p className="text-[11px] leading-relaxed">
                    Mayor disciplina de sesiones matutinas (94%). La visualización del ángulo en tiempo real reduce el miedo al movimiento (kinesiofobia).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline/10">
                  <p className="font-bold text-on-surface mb-0.5">Manguito Rotador</p>
                  <p className="text-[11px] leading-relaxed">
                    Requieren recordatorios vespertinos para alcanzar la meta del 85% de adherencia.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-outline/10">
              <button
                onClick={() => navigate('/patients')}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explorar Directorio de Pacientes</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Bottom Row: Clinical Priorities & Early Warning Triage */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            <h4 className="font-bold text-sm text-on-surface">Triage y Alertas Clínicas Tempranas</h4>
          </div>
          <span className="text-xs text-on-surface-variant font-semibold">
            {CLINICAL_ALERTS.length} eventos para revisión
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CLINICAL_ALERTS.map((alert) => {
            const isWarning = alert.type === 'pain_spike' || alert.type === 'overload';
            const isMilestone = alert.type === 'milestone_ready';

            return (
              <motion.div
                key={alert.id}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/paciente/${alert.patientId}`)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isMilestone
                    ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                    : isWarning
                    ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-surface/80 dark:bg-surface-container-low/60 border-outline/15 hover:border-teal-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black text-on-surface truncate">
                      {alert.patientName}
                    </span>
                    <span className="text-[10px] text-outline shrink-0">{alert.timeAgo}</span>
                  </div>

                  <p className={`text-xs font-bold mb-1.5 ${
                    isMilestone
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : isWarning
                      ? 'text-amber-800 dark:text-amber-300'
                      : 'text-teal-700 dark:text-teal-300'
                  }`}>
                    {alert.title}
                  </p>

                  <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                    {alert.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-outline/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface">
                    {alert.metric}
                  </span>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                    Ver <ChevronRight className="size-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
