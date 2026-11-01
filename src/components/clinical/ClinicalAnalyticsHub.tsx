import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts';
import { Activity, AlertTriangle, ArrowUpRight, CheckCircle2, ChevronRight, Info, Layers, Stethoscope, Target, UserCheck, Zap } from 'lucide-react';
import { GlassPanel } from '../ui/Glass';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../ui/EmptyState';
import { Loader2, RefreshCw } from 'lucide-react';
import { useClinicalAnalytics } from '../../hooks/useClinicalAnalytics';

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
  const { loading, error, sessions, rom, vas, cohorts, alerts, refresh } = useClinicalAnalytics();

  const ROM_DATA = rom.map((point) => ({
    ...point,
    clinicalNote: t('cah.measuredSessions', { count: point.samples }),
  }));
  const VAS_CORRELATION_DATA = vas;
  const CLINICAL_COHORTS = cohorts.map((cohort) => ({
    ...cohort,
    dischargeForecast:
      cohort.avgQuality >= 80 ? t('cah.stableProgress') : t('cah.requiresReview'),
  }));
  const CLINICAL_ALERTS = alerts.map((alert) => ({
    ...alert,
    title: t(alert.titleKey),
    description: t(alert.descriptionKey),
    timeAgo:
      alert.daysAgo > 0
        ? t('cah.daysAgo', { count: alert.daysAgo })
        : t('cah.hoursAgo', { count: Math.max(1, alert.hoursAgo) }),
  }));

  const [selectedJoint, setSelectedJoint] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rom' | 'vas' | 'cohorts'>('rom');

  useEffect(() => {
    if (ROM_DATA.length > 0 && !ROM_DATA.some((j) => j.joint === selectedJoint)) {
      setSelectedJoint(ROM_DATA[0].joint);
    }
  }, [ROM_DATA, selectedJoint]);

  const hasRealData = sessions.length > 0;
  const uniquePatients = new Set(sessions.map((s) => s.pacienteId)).size;

  if (loading) {
    return (
      <div className="flex min-h-[280px] w-full items-center justify-center gap-3 text-sm text-on-surface-variant">
        <Loader2 className="size-4 animate-spin" />
        <span>{t('cah.loadingAnalytics')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 w-full">
        <div className="rounded-3xl border border-warning/30 bg-warning/5 p-6">
          <p className="text-sm font-bold text-on-surface">{t('cah.analyticsError')}</p>
          <p className="mt-1 text-xs text-on-surface-variant break-words">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary"
          >
            <RefreshCw className="size-3.5" />
            {t('cah.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!hasRealData) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                {t('cah.highPrecisionModule')}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">· {t('cah.biomechanicsTeleRehab')}</span>
            </div>
            <h3 className="font-headline-md text-headline-sm lg:text-headline-md text-on-surface">
              {t('cah.advancedClinicalAnalytics')}
            </h3>
            <p className="text-xs text-on-surface-variant max-w-2xl">
              {t('cah.quantitativeMonitoring')}
            </p>
          </div>
        </div>
        <EmptyState
          type="analytics"
          title="Sin datos clínicos reales"
          description="Aún no hay suficientes datos de sesiones, ROM o dolor para generar analíticas clínicas. Completa sesiones con seguimiento para ver evolución real."
          actionLabel="Ir a pacientes"
          onAction={() => navigate('/pacientes')}
        />
      </div>
    );
  }

  const currentJointData = ROM_DATA.find((j) => j.joint === selectedJoint) || ROM_DATA[0];

  return (
    <div className="space-y-8 w-full">
      {/* Header with Title & Clinical Scope */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
              {t('cah.highPrecisionModule')}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">· {t('cah.biomechanicsTeleRehab')}</span>
          </div>
          <h3 className="font-headline-md text-headline-sm lg:text-headline-md text-on-surface">
            {t('cah.advancedClinicalAnalytics')}
          </h3>
          <p className="text-xs text-on-surface-variant max-w-2xl">
            {t('cah.quantitativeMonitoring')}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-surface-container-highest/60 border border-outline/15 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('rom')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rom'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Activity className="size-3.5" />
            <span>{t('cah.jointRom')}</span>
          </button>
          <button
            onClick={() => setActiveTab('vas')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'vas'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Zap className="size-3.5" />
            <span>{t('cah.precisionVsPain')}</span>
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cohorts'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Layers className="size-3.5" />
            <span>{t('cah.clinicalCohorts')}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: ROM por Articulación */}
      {activeTab === 'rom' && (ROM_DATA.length === 0 ? (
        <EmptyState
          type="analytics"
          title={t('cah.noMeasurements')}
          description={t('cah.noMeasurementsDesc')}
          actionLabel={t('cah.retry')}
          onAction={refresh}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <GlassPanel className="lg:col-span-2 p-6 sm:p-8 rounded-3xl border border-outline/15 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Target className="size-4 text-teal-600 dark:text-teal-400" />
                  {t('cah.rangeOfMotionCurrentVsTarget')}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {t('cah.valuesInDegrees')}
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                  <span className="size-2.5 rounded-full bg-teal-500" /> {t('cah.currentAngle')}
                </span>
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="size-2.5 rounded-full bg-slate-400 dark:bg-slate-600" /> {t('cah.idealTarget')}
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
                    formatter={(value, name) => [
                      `${value}°`,
                      name === 'actual' ? t('cah.currentAngle') : t('cah.physiologicalTarget'),
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
            <div className="flex flex-wrap gap-2 pt-4 border-t border-outline/15">
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
                  <span className="font-bold text-2xs opacity-80">{j.percent}%</span>
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* Joint Detail Card */}
          <GlassPanel className="p-6 sm:p-8 rounded-3xl border border-outline/15 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-2xs font-black uppercase px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20">
                  {t('cah.jointAssessment')}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    currentJointData.status === 'optimal'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : currentJointData.status === 'recovering'
                      ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20'
                      : 'bg-warning/10 text-warning border border-warning/20'
                  }`}
                >
                  {currentJointData.status === 'optimal'
                    ? t('cah.optimal')
                    : currentJointData.status === 'recovering'
                    ? t('cah.recovering')
                    : t('cah.needsAttention')}
                </span>
              </div>

              <h4 className="text-lg font-extrabold text-on-surface">{currentJointData.joint}</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {currentJointData.clinicalNote}
              </p>

              {/* Metrics visual */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-teal-900/10 border border-teal-500/20">
                  <p className="text-2xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    {t('cah.achievedAngle')}
                  </p>
                  <p className="text-2xl font-black text-teal-900 dark:text-teal-100 mt-0.5">
                    {currentJointData.actual}°
                  </p>
                  <p className="text-2xs text-on-surface-variant mt-1">
                    {t('cah.goal')}: {currentJointData.ideal}°
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline/15">
                  <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {t('cah.residualDeficit')}
                  </p>
                  <p className="text-2xl font-black text-on-surface mt-0.5">
                    -{currentJointData.deficit}°
                  </p>
                  <p className="text-2xs text-on-surface-variant mt-1">
                    {currentJointData.percent}% {t('cah.reached')}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface-variant">{t('cah.arcCompliance')}</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">{currentJointData.percent}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-container-highest overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentJointData.percent}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-info"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline/15 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant flex items-center gap-1">
                <Info className="size-3.5 text-teal-600" /> {t('cah.goniometricScale')}
              </span>
              <button
                onClick={() => navigate('/fisio-exercises')}
                className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
              >
                {t('cah.adjustExercises')} <ChevronRight className="size-3.5" />
              </button>
            </div>
          </GlassPanel>
        </div>
      ))}

      {/* Tab 2: Correlación Precisión vs. Dolor (VAS / EVA) */}
      {activeTab === 'vas' && (VAS_CORRELATION_DATA.length === 0 ? (
        <EmptyState
          type="analytics"
          title={t('cah.noMeasurements')}
          description={t('cah.noMeasurementsDesc')}
          actionLabel={t('cah.retry')}
          onAction={refresh}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassPanel className="lg:col-span-2 p-6 sm:p-8 rounded-3xl border border-outline/15 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Zap className="size-4 text-info dark:text-info" />
                  {t('cah.biomechanicalPrecisionVsPainScale')}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {t('cah.kinematicBehavior')}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                  <span className="size-2.5 rounded-full bg-teal-500" /> {t('cah.precisionPercent')}
                </span>
                <span className="flex items-center gap-1.5 text-warning">
                  <span className="size-2.5 rounded-full bg-warning" /> {t('cah.painVas')}
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
                    formatter={(value, name) => [
                      name === 'precision' ? `${value}%` : `${value}/10`,
                      name === 'precision' ? t('cah.executionQuality') : t('cah.painLevelVas'),
                    ]}
                  />
                  <ReferenceArea
                    yAxisId="left"
                    y1={80}
                    y2={100}
                    fill="#10b981"
                    fillOpacity={0.07}
                    label={{ value: t('cah.optimalTherapeuticZone'), fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }}
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

            <div className="mt-4 pt-3 border-t border-outline/15 flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                {t('cah.optimalZonePrecision')}
              </span>
              <span className="font-semibold text-teal-700 dark:text-teal-300">
                {t('cah.painReduction')}
              </span>
            </div>
          </GlassPanel>

          {/* Clinical Interpretation */}
          <GlassPanel className="p-6 sm:p-8 rounded-3xl border border-outline/15 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-info/10 text-info dark:text-info">
                  <Stethoscope className="size-4" />
                </div>
                <h4 className="font-bold text-sm text-on-surface">{t('cah.biomechanicalReading')}</h4>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-on-surface-variant">
                <p>
                  {t('cah.corrIntro')} <strong>{t('cah.corrStrong')}</strong> {t('cah.corrOutro')}
                </p>
                <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-900 dark:text-teal-200">
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-teal-600" /> {t('cah.neuromuscularEfficiency')}
                  </p>
                  <p>
                    {t('cah.sessionIntro')} <strong>{t('cah.session4')}</strong>{t('cah.inhibitionOutro')}
                  </p>
                </div>
                <p className="text-xs italic text-outline">
                  {t('cah.isomNote')}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-outline/15">
              <button
                onClick={() => navigate('/tools')}
                className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t('cah.generatePainRomReport')}</span>
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </GlassPanel>
        </div>
      ))}

      {/* Tab 3: Cohortes Clínicos */}
      {activeTab === 'cohorts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassPanel className="lg:col-span-2 p-6 sm:p-8 rounded-3xl border border-outline/15 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
                  {t('cah.adherenceQualityCohorts')}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {t('cah.therapeuticPerformance')}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {uniquePatients} {t('cah.patients')}
              </span>
            </div>

            <div className="space-y-4">
              {CLINICAL_COHORTS.map((cohort) => (
                <div
                  key={cohort.name}
                  className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline/15 hover:border-teal-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-sm text-on-surface">{cohort.name}</span>
                      <span className="text-xs text-on-surface-variant ml-2">
                        ({cohort.patientsCount} {t('cah.patients')})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-teal-700 dark:text-teal-300">
                        {t('cah.adherence')}: <strong className="font-bold">{cohort.adherence}%</strong>
                      </span>
                      <span className="text-on-surface-variant">
                        {t('cah.dischargeEst')}: <span className="font-normal text-on-surface">{cohort.dischargeForecast}</span>
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
          <GlassPanel className="p-6 sm:p-8 rounded-3xl border border-outline/15 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="size-4" />
                </div>
                <h4 className="font-bold text-sm text-on-surface">{t('cah.complianceFactors')}</h4>
              </div>

              <div className="space-y-3.5 text-xs text-on-surface-variant">
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline/15">
                  <p className="font-bold text-on-surface mb-0.5">{t('cah.postoperativeAcl')}</p>
                  <p className="text-xs leading-relaxed">
                    {t('cah.morningDiscipline')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline/15">
                  <p className="font-bold text-on-surface mb-0.5">{t('cah.rotatorCuff')}</p>
                  <p className="text-xs leading-relaxed">
                    {t('cah.eveningReminders')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-outline/15">
              <button
                onClick={() => navigate('/patients')}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t('cah.explorePatientDirectory')}</span>
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
            <AlertTriangle className="size-4 text-warning" />
            <h4 className="font-bold text-sm text-on-surface">{t('cah.triageEarlyAlerts')}</h4>
          </div>
          <span className="text-xs text-on-surface-variant font-semibold">
            {CLINICAL_ALERTS.length} {t('cah.eventsForReview')}
          </span>
        </div>

        {CLINICAL_ALERTS.length === 0 && (
          <p className="rounded-2xl border border-outline/15 bg-surface-container-low/60 p-5 text-xs text-on-surface-variant">
            {t('cah.noAlerts')}
          </p>
        )}
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
                    ? 'bg-warning/5 dark:bg-warning/20 border-warning/30 hover:border-warning/50'
                    : 'bg-surface/80 dark:bg-surface-container-low/60 border-outline/15 hover:border-teal-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black text-on-surface truncate">
                      {alert.patientName}
                    </span>
                    <span className="text-2xs text-outline shrink-0">{alert.timeAgo}</span>
                  </div>

                  <p className={`text-xs font-bold mb-1.5 ${
                    isMilestone
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : isWarning
                      ? 'text-warning dark:text-warning'
                      : 'text-teal-700 dark:text-teal-300'
                  }`}>
                    {alert.title}
                  </p>

                  <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                    {alert.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-outline/15 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface">
                    {alert.metric}
                  </span>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                    {t('common.view')} <ChevronRight className="size-3" />
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
