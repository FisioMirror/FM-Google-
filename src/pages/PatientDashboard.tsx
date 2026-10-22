import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SkeletonCard } from '../components/ui/Skeleton';
import { SimpleCalendar } from '../components/ui/SimpleCalendar';
import { MedicalIcon } from '../components/ui/MedicalIcon';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { runAIJob } from '../lib/ai';
import { OnboardingGuide } from '../components/OnboardingGuide';
import { useToast } from '../components/ui/ToastProvider';
import { useGamification } from '../hooks/useGamification';
import { AchievementShowcase, AchievementUnlockModal } from '../components/AchievementShowcase';
import { CollapsibleSection } from '../components/ui/CollapsibleSection';
import { PRIMARY_DEMO_PATIENT } from '../data/unifiedDemoData';
import { isValidUUID } from '../lib/utils';
import { isDemoAccount } from '../lib/demoAuth';
import { BorderBeam } from '../components/ui/BorderBeam';
import { CardSpotlight } from '../components/ui/CardSpotlight';
import { PulsatingButton } from '../components/ui/PulsatingButton';
import { SparklesText } from '../components/ui/SparklesText';
import { MascotAnimation } from '../components/ui/MascotAnimation';
import { HelpGuideButton } from '../components/ui/HelpGuideButton';
import { PatientRecoveryHub } from '../components/patient/PatientRecoveryHub';
import { VersiculoCard } from '../components/spiritual/VersiculoCard';
import {
  StreakFlameCounter,
  MobilityQuestCard,
  DailyHealthPointsWidget,
  LevelProgressRibbon,
  VirtualTrophyCabinet,
  CheerReactionButton,
} from '../components/ui/GamificationSuite';
import { PainScaleInteractiveCard } from '../components/ui/ActivityCardsSuite';
import { GamifiedBadgeCard } from '../components/ui/GamifiedBadgeCard';
import {
  ExerciseTimelineScrubber,
  CompactTelehealthBar,
} from '../components/ui/NavigationDocksSuite';
import { HarmonizedSurface } from '../components/ui/HarmonizedSurface';
import {
  Flame,
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  Activity,
  Bot,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { humanVoice, isHumanVoiceSpeaking, stopHumanVoice } from '../lib/humanVoice';
import { staggerContainer, staggerItem, springTactile } from '../lib/motionVariants';
import { useTranslation } from 'react-i18next';
import { formatLongDate } from '../lib/format';

interface PatientKpi {
  streak: number;
  totalSessions: number;
  weeklyMinutes: number;
  isDemo: boolean;
}

const emptyKpi: PatientKpi = { streak: 0, totalSessions: 0, weeklyMinutes: 0, isDemo: false };

interface AssignedExercise {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
}

interface WeekActivity {
  day: string;
  minutes: number;
}

interface EvolutionWeek {
  label: string;
  pct: number;
}

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function PatientDashboard() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<PatientKpi>(emptyKpi);
  const [exercises, setExercises] = useState<AssignedExercise[]>([]);
  const [therapist, setTherapist] = useState<string | null>(null);
  const [weekActivity, setWeekActivity] = useState<WeekActivity[]>(weekDays.map((d) => ({ day: d, minutes: 0 })));
  const [allSessionDates, setAllSessionDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [evolution, setEvolution] = useState<EvolutionWeek[] | null>(null); // TODO: conectar con evolución/ROM real del paciente
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [isSpeakingCopilot, setIsSpeakingCopilot] = useState(false);
  const toast = useToast();
  const gamification = useGamification();

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const isRealUser = isValidUUID(user.id);

      if (!isRealUser) {
        // Cargar sesiones demo desde local storage + datos de demostración
        const existingDemoRaw = localStorage.getItem('fisiomirror_demo_sessions');
        const localDemoSessions: Array<{ fecha: string; duracion_segundos?: number }> = existingDemoRaw ? JSON.parse(existingDemoRaw) : [];
        const combinedSessions = [...localDemoSessions, ...PRIMARY_DEMO_PATIENT.sessions];

        const streak = computeStreak(combinedSessions.map((s) => s.fecha));
        const allDates = combinedSessions.map((s) => new Date(s.fecha)).filter((d) => !isNaN(d.getTime()));
        setAllSessionDates(allDates);

        const dayMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          const key = d.toISOString().split('T')[0];
          dayMap.set(key, 0);
        }

        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const recent = combinedSessions.filter((s) => new Date(s.fecha) >= weekAgo);
        const weeklyMin = recent.reduce((sum, s) => sum + (s.duracion_segundos ?? 0), 0) / 60;

        recent.forEach((s) => {
          const key = new Date(s.fecha).toISOString().split('T')[0];
          if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + (s.duracion_segundos ?? 0) / 60);
        });

        const activity: WeekActivity[] = [];
        const keys = Array.from(dayMap.keys());
        keys.forEach((k, idx) => {
          activity.push({ day: weekDays[idx], minutes: Math.round(dayMap.get(k) || 0) });
        });
        setWeekActivity(activity);

        setTherapist('Dr. Roberto Silva');
        setKpi({
          streak: Math.max(streak, 4),
          totalSessions: combinedSessions.length,
          weeklyMinutes: Math.round(weeklyMin) || 52,
          isDemo: true,
        });

        setExercises(
          PRIMARY_DEMO_PATIENT.exercises.map((ex) => ({
            id: ex.id,
            name: ex.ejercicio_nombre,
            subtitle: `${ex.series} series · ${ex.repeticiones} reps`,
            icon: 'self_improvement',
          }))
        );

        setLoading(false);
        return;
      }

      const { count: sessions } = await supabase
        .from('sesiones_completadas')
        .select('*', { count: 'exact', head: true })
        .eq('paciente_id', user.id);

      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: recentSessions } = await supabase
        .from('sesiones_completadas')
        .select('duracion_segundos, fecha')
        .eq('paciente_id', user.id)
        .gte('fecha', weekAgo);

      const weeklyMin = (recentSessions?.reduce((sum, s) => sum + (s.duracion_segundos ?? 0), 0) ?? 0) / 60 || 0;

      const { data: allSessions } = await supabase
        .from('sesiones_completadas')
        .select('fecha')
        .eq('paciente_id', user.id)
        .order('fecha', { ascending: false });

      const streak = computeStreak(allSessions?.map((s) => s.fecha) || []);
      setAllSessionDates((allSessions ?? []).map((s) => new Date(s.fecha)).filter((d) => !isNaN(d.getTime())));

      const dayMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().split('T')[0];
        dayMap.set(key, 0);
      }
      recentSessions?.forEach((s) => {
        const key = new Date(s.fecha).toISOString().split('T')[0];
        if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + (s.duracion_segundos ?? 0) / 60);
      });
      const activity: WeekActivity[] = [];
      const keys = Array.from(dayMap.keys());
      keys.forEach((k, idx) => {
        activity.push({ day: weekDays[idx], minutes: Math.round(dayMap.get(k) || 0) });
      });
      setWeekActivity(activity);

      const { data: patientExercises } = await supabase
        .from('patient_exercises')
        .select('id, ejercicio_nombre, series, repeticiones')
        .eq('paciente_id', user.id);

      const { data: therapistLink } = await supabase
        .from('pacientes_terapeutas')
        .select('terapeuta_id')
        .eq('paciente_id', user.id)
        .maybeSingle();

      let therapistName: string | null = null;
      if (therapistLink?.terapeuta_id) {
        const { data: therapistProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', therapistLink.terapeuta_id)
          .maybeSingle();
        therapistName = therapistProfile?.full_name ?? null;
      }
      setTherapist(therapistName);

      setKpi({
        streak,
        totalSessions: sessions ?? 0,
        weeklyMinutes: Math.round(weeklyMin),
        isDemo: false,
      });

      if (patientExercises && patientExercises.length > 0) {
        setExercises(
          patientExercises.map((ex) => ({
            id: ex.id,
            name: ex.ejercicio_nombre || t('patientDashboard.exerciseDefault'),
            subtitle: `${ex.series || 3} series · ${ex.repeticiones || 10} reps`,
            icon: 'self_improvement',
          }))
        );
      }

      // Si no hay datos reales (cuenta demo), inyectar datos ficticios
      const isEmpty = (sessions ?? 0) === 0 && weeklyMin === 0 && streak === 0;
      if (isEmpty) {
        setKpi({
          streak: 4,
          totalSessions: PRIMARY_DEMO_PATIENT.sessionsCompleted,
          weeklyMinutes: 52,
          isDemo: true,
        });
        setWeekActivity([
          { day: 'L', minutes: 14 },
          { day: 'M', minutes: 12 },
          { day: 'X', minutes: 18 },
          { day: 'J', minutes: 0 },
          { day: 'V', minutes: 15 },
          { day: 'S', minutes: 12 },
          { day: 'D', minutes: 0 },
        ]);
        setExercises(
          PRIMARY_DEMO_PATIENT.exercises.map((ex) => ({
            id: ex.id,
            name: ex.ejercicio_nombre,
            subtitle: `${ex.series} series · ${ex.repeticiones} reps`,
            icon: 'self_improvement',
          }))
        );
        setAllSessionDates(PRIMARY_DEMO_PATIENT.sessions.map((s) => new Date(s.fecha)));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const computeStreak = (dates: string[]) => {
    if (!dates || dates.length === 0) return 0;
    const uniqueDays = Array.from(new Set(dates.map((d) => d.split('T')[0]))).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

    let checkDate = new Date(uniqueDays[0]);
    for (const d of uniqueDays) {
      const cur = new Date(d);
      const diff = Math.round((checkDate.getTime() - cur.getTime()) / 86400000);
      if (diff <= 1) {
        streak++;
        checkDate = cur;
      } else {
        break;
      }
    }
    return streak;
  };

  const maxMinutes = Math.max(...weekActivity.map((d) => d.minutes), 1);
  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('dashboard.greetingMorning', 'Buenos días')
    : hour < 19
    ? t('dashboard.greetingAfternoon', 'Buenas tardes')
    : t('dashboard.greetingEvening', 'Buenas noches');

  return (
    <div className="fm-page pb-12">
      <OnboardingGuide />

      {/* Achievement Unlock Modal */}
      <AchievementUnlockModal
        achievement={gamification.newlyUnlocked}
        role="patient"
        onClose={gamification.dismissUnlock}
      />

      {/* Welcome Header */}
      <div className="relative">
        <div className="blob-teal w-40 h-40 -top-10 -left-10 opacity-60 pointer-events-none" />
        <div className="flex items-center gap-4 relative">
          <MascotAnimation type="greeting" size="md" />
          <div>
            <SparklesText
              sparklesCount={4}
              colors={{ first: '#0d9488', second: '#c1ff72' }}
              className="font-display fm-title gradient-text-living"
            >
              {greeting}, {user?.full_name?.split(' ')[0] || t('common.patientDefault')}
            </SparklesText>
            <p className="text-outline fm-section-title">
              {formatLongDate(new Date())}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <CheerReactionButton />
            <HelpGuideButton />
          </div>
        </div>

        {/* Telehealth Status Bar */}
        <HarmonizedSurface variant="mint" className="mt-4 p-1 rounded-2xl">
          <CompactTelehealthBar
            therapistName={therapist || t('demo.physiName2')}
            status="En línea · Fisioterapeuta asignada"
            onQuickCall={() => {
              window.location.href = 'tel:+34900123456';
            }}
            onQuickMessage={() => navigate('/ai-assistant')}
          />
        </HarmonizedSurface>
      </div>

      {/* Main KPI Row con acentos pastel clínicos */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-2.5 sm:gap-4"
      >
        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="h-full"
        >
          <CardSpotlight
            color="rgba(245, 158, 11, 0.16)"
            className="p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between cursor-default shadow-sm hover:shadow-card transition-all h-full bg-gradient-to-br from-warning/75 via-surface/90 to-warning/30 dark:from-warning/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-warning/50 dark:border-warning/25"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-warning/15 text-warning dark:text-warning flex items-center justify-center shrink-0 border border-warning/20">
                <Flame className="size-4 sm:size-5" />
              </div>
              <span className="text-2xs sm:text-xs font-bold text-warning dark:text-warning uppercase tracking-wider hidden xs:inline">{t('dashboard.streak', 'Racha')}</span>
            </div>
            <div>
              <p className="text-2xs sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider line-clamp-1 xs:hidden">{t('dashboard.streak', 'Racha')}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-on-surface tabular-nums tracking-tight">
                {kpi.streak} <span className="text-2xs sm:text-xs font-semibold text-on-surface-variant">{t('common.days', 'días')}</span>
              </p>
            </div>
          </CardSpotlight>
        </motion.div>

        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="h-full"
        >
          <CardSpotlight
            color="rgba(20, 184, 166, 0.16)"
            className="p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between cursor-default shadow-sm hover:shadow-card transition-all h-full bg-gradient-to-br from-teal-50/80 via-surface/90 to-emerald-50/40 dark:from-teal-950/30 dark:via-surface-container/80 dark:to-slate-900/90 border border-teal-200/60 dark:border-teal-500/30"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/25">
                <CheckCircle2 className="size-4 sm:size-5" />
              </div>
              <span className="text-2xs sm:text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider hidden xs:inline">{t('dashboard.totalSessions', 'Sesiones')}</span>
            </div>
            <div>
              <p className="text-2xs sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider line-clamp-1 xs:hidden">{t('dashboard.totalSessions', 'Sesiones')}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-teal-700 dark:text-teal-300 tabular-nums tracking-tight">
                {kpi.totalSessions} <span className="text-2xs sm:text-xs font-semibold text-on-surface-variant">{t('common.all', 'total')}</span>
              </p>
            </div>
          </CardSpotlight>
        </motion.div>

        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="h-full"
        >
          <CardSpotlight
            color="rgba(14, 165, 233, 0.16)"
            className="p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between cursor-default shadow-sm hover:shadow-card transition-all h-full bg-gradient-to-br from-info/75 via-surface/90 to-info/40 dark:from-info/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-info/60 dark:border-info/30"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-info/15 text-info dark:text-info flex items-center justify-center shrink-0 border border-info/25">
                <Clock className="size-4 sm:size-5" />
              </div>
              <span className="text-2xs sm:text-xs font-bold text-info dark:text-info uppercase tracking-wider hidden xs:inline">{t('dashboard.totalMinutes', 'Minutos')}</span>
            </div>
            <div>
              <p className="text-2xs sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider line-clamp-1 xs:hidden">{t('dashboard.totalMinutes', 'Minutos')}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-on-surface tabular-nums tracking-tight">
                {kpi.weeklyMinutes} <span className="text-2xs sm:text-xs font-semibold text-on-surface-variant">{t('common.minutes', 'min')}</span>
              </p>
            </div>
          </CardSpotlight>
        </motion.div>
      </motion.div>

      {/* Palabra de Fortaleza & Fe (Reflexión Bíblica Contextual) */}
      <VersiculoCard
        categoriaInicial={kpi.streak >= 3 ? 'racha' : kpi.totalSessions > 0 ? 'fortaleza' : 'sanidad'}
      />

      {/* Patient Recovery & Wellness Hub */}
      <PatientRecoveryHub />

        {/* Gamificación Interactiva & Registro del Umbral de Dolor */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-surface/80 dark:bg-surface-container/60 border border-outline/15 shadow-sm">
            {gamification.currentLevel ? (
              <LevelProgressRibbon
                currentLevel={gamification.currentLevel.level}
                currentXp={gamification.points}
                nextLevelXp={gamification.nextLevel ? gamification.nextLevel.minPoints : gamification.currentLevel.maxPoints}
                className="w-full sm:w-auto"
              />
            ) : (
              <LevelProgressRibbon className="w-full sm:w-auto" />
            )}
            {gamification.currentLevel && (
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {gamification.currentLevel.title} • {t('common.level', 'Nivel')} {gamification.currentLevel.level}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <StreakFlameCounter streakDays={kpi.streak || 0} />
            </div>
            <div>
              <MobilityQuestCard
                questTitle={t('gamification.mobilityQuest')}
                progressText={
                  isDemoAccount(user)
                    ? '1 / 2'
                    : `0 / ${exercises.length || 0}`
                }
                xpReward={isDemoAccount(user) ? 120 : 0}
              />
            </div>
            <div>
              {/* DailyHealthPointsWidget solo acepta `points`: el objetivo y el multiplicador los calcula internamente */}
              <DailyHealthPointsWidget points={gamification.points} />
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Routine & Primary Action */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured AR Session Card con fondo pastel menta/celeste clínico */}
          <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-teal-50/80 via-surface/95 to-info/60 dark:from-teal-950/30 dark:via-surface-container/85 dark:to-info/20 border border-teal-200/60 dark:border-teal-500/30 shadow-card">
            <BorderBeam size={120} duration={8} colorFrom="#14b8a6" colorTo="#38bdf8" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-md">
                <span className="inline-flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  {t('dashboard.sessionGuidedAR')}
                </span>
                <h3 className="text-xl font-black text-on-surface">{t('dashboard.todaySession', 'Rutina de Hoy')}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  {exercises.length > 0
                    ? t('dashboard.routineTitleDesc', { name: exercises[0].name })
                    : t('dashboard.routineEmptyDesc')}
                </p>
              </div>

              <PulsatingButton
                onClick={() => navigate('/calibration')}
                variant="pulse"
                pulseColor="rgba(13, 148, 136, 0.6)"
                className="px-6 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card shadow-teal-700/25 shrink-0 bg-teal-600 hover:bg-teal-500"
              >
                <Play className="size-4 fill-current" />
                <span>{t('patientDashboard.startSessionAR')}</span>
              </PulsatingButton>
            </div>
          </div>

          {/* Assigned Exercises List */}
          <CollapsibleSection title={t('patientDashboard.todayExercises', 'Mis Ejercicios Asignados')} icon="assignment" defaultOpen>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-on-surface-variant">{t('patientDashboard.routinePrescribed')}</p>
              <button
                onClick={() => navigate('/exercises')}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Ver todos
              </button>
            </div>

            {/* Cronograma visual interactivo de la rutina */}
            <div className="mb-4">
              <ExerciseTimelineScrubber />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : exercises.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {exercises.map((ex) => (
                  <motion.div
                    key={ex.id}
                    variants={staggerItem}
                    whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/calibration')}
                    className="p-4 rounded-2xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/15 hover:border-teal-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <MedicalIcon name="exercise" size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                          {ex.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant">{ex.subtitle}</p>
                      </div>
                    </div>
                    <div className="size-8 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                      <Play className="size-3.5 fill-current" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-surface/40 border border-dashed border-outline/20">
                <MedicalIcon name="clipboard" size={40} className="mx-auto text-primary/40 mb-2" />
                <p className="text-xs text-on-surface-variant">
                  Tu fisioterapeuta configurará tus ejercicios personalizados en tu próxima consulta.
                </p>
              </div>
            )}
          </CollapsibleSection>
        </div>

        {/* Right Col: Weekly Progress & Physi Assistant */}
        <div className="space-y-6">
          {/* Activity Graph */}
          <CollapsibleSection title={t('patientDashboard.weeklyActivity')} icon="trending_up" defaultOpen>
            <SimpleCalendar markedDates={allSessionDates} />

            <div className="p-5 rounded-2xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/15 mt-4">
              <div className="flex justify-between items-center text-xs mb-3 text-on-surface-variant">
                <span className="font-semibold">{t('patientDashboard.dailyMinutes')}</span>
                <span>{t('patientDashboard.dailyGoal')}</span>
              </div>
              <div className="h-32 flex items-end justify-between gap-2 pt-4">
                {weekActivity.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((d.minutes / maxMinutes) * 100, 8)}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className={`w-full rounded-t-lg transition-all ${
                        d.minutes > 0
                          ? 'bg-gradient-to-t from-teal-600 to-teal-400 shadow-xs'
                          : 'bg-surface-container-highest/60'
                      }`}
                    />
                    <span className="text-2xs font-bold text-outline uppercase">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {evolution && (
              <div className="p-4 rounded-2xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/15 mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-on-surface-variant mb-1">
                  <span className="font-semibold">{t('patientDashboard.romEvolution')}</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    +{evolution[evolution.length - 1].pct - evolution[0].pct}% global
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {evolution.map((w, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${w.pct}%` }} />
                      </div>
                      <span className="text-2xs text-outline block">{w.label}</span>
                      <span className="text-xs font-bold text-on-surface block">{w.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {therapist && (
              <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/15 flex items-center gap-3 mt-4">
                <div className="size-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-2xs uppercase font-bold text-outline">{t('patientDashboard.assignedTherapist')}</p>
                  <p className="text-xs font-bold text-on-surface">{therapist}</p>
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* Registro del Umbral de Dolor — TODO: conectar con el registro de dolor real del paciente */}
          <PainScaleInteractiveCard initialPain={isDemoAccount(user) ? 2 : undefined} />

          {/* AI Physi Recommendation Card */}
          <div className="p-6 rounded-3xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/15 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                <Bot className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">{t('patientDashboard.physiCopilot')}</h4>
                <p className="text-xs text-outline">{t('patientDashboard.kinesiologyTip')}</p>
              </div>
              <span className={`ml-auto rounded-md px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wider ${
                recommendation
                  ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
                  : 'bg-surface-variant/25 text-on-surface-variant'
              }`}>
                {recommendation ? 'IA' : 'Consejo local'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container/50 text-xs text-on-surface-variant leading-relaxed italic border border-outline/5">
              {recLoading ? (
                <span className="flex items-center gap-2">
                  <Activity className="size-3.5 animate-spin text-primary" /> {t('patientDashboard.analyzingProgress')}
                </span>
              ) : recommendation ? (
                recommendation
              ) : (
                kpi.streak >= 3
                  ? t('patientDashboard.tipStreak', { d: kpi.streak })
                  : t('patientDashboard.tipRest')
              )}
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => {
                  if (isSpeakingCopilot || isHumanVoiceSpeaking()) {
                    stopHumanVoice();
                    setIsSpeakingCopilot(false);
                  } else {
                    const textToSpeak =
                      recommendation ||
                      (kpi.streak >= 3
                        ? t('patientDashboard.tipStreak', { d: kpi.streak })
                        : t('patientDashboard.tipRest'));
                    setIsSpeakingCopilot(true);
                    humanVoice.speak(textToSpeak, {
                      onEnd: () => setIsSpeakingCopilot(false),
                      onError: () => setIsSpeakingCopilot(false),
                    });
                  }
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSpeakingCopilot
                    ? 'bg-teal-500 text-white shadow-xs animate-pulse border-teal-400'
                    : 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/20'
                }`}
                title={t('patientDashboard.listenTipHuman')}
              >
                {isSpeakingCopilot ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                <span>{isSpeakingCopilot ? t('patientDashboard.stopVoice') : t('patientDashboard.listenTip')}</span>
              </button>

              <button
                onClick={async () => {
                  if (!recommendation && !recLoading) {
                    setRecLoading(true);
                    try {
                      const result = await runAIJob('insights', {
                        userPrompt: `Genera un consejo clínico breve y motivador para un paciente con ${kpi.totalSessions} sesiones y ${kpi.streak} días de racha. Máximo 2 frases. Responde en el idioma del usuario (${i18n.language}).`,
                      });
                      if (result.success && result.result) {
                        setRecommendation(result.result);
                        toast.success(t('patientDashboard.tipUpdated'));
                      }
                    } catch {
                      toast.error(t('patientDashboard.physiConnectFail'));
                    } finally {
                      setRecLoading(false);
                    }
                  } else {
                    navigate('/calibration');
                  }
                }}
                disabled={recLoading}
                className="flex-1 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>{recommendation ? t('patientDashboard.startSessionShort') : t('common.consult')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Achievements Section */}
      <CollapsibleSection title={t('patientDashboard.recoveryGoals')} icon="emoji_events">
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/15">
            <div className="flex justify-between items-center text-xs mb-4">
              <span className="text-on-surface-variant">{t('patientDashboard.medalsFraction', { a: gamification.unlockedCount, b: gamification.achievements.length })}</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{t('patientDashboard.progressUnlocked', { v: Math.round(gamification.totalProgress * 100) })}</span>
            </div>
            <AchievementShowcase achievements={gamification.achievements} compact={false} />

            {/* Medallas 3D Gamificadas de FisioMirror */}
            {/* TODO: conectar xpPoints con los logros reales; progressPct de precisión con forma/ROM real */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-outline/15">
              <GamifiedBadgeCard
                title={t('gamification.badgeStreakTitle')}
                description={t('gamification.badgeStreakDesc')}
                tier="gold"
                xpPoints={isDemoAccount(user) ? 250 : 0}
                progressPct={Math.min(100, Math.round(((kpi.streak || 0) / 5) * 100))}
              />
              <GamifiedBadgeCard
                title={t('gamification.badgePrecisionTitle')}
                description={t('gamification.badgePrecisionDesc')}
                tier="diamond"
                xpPoints={isDemoAccount(user) ? 500 : 0}
                progressPct={isDemoAccount(user) ? 88 : 0}
              />
            </div>
          </div>
          <VirtualTrophyCabinet />
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default PatientDashboard;
