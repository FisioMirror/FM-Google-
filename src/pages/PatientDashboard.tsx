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
import { BorderBeam } from '../components/ui/BorderBeam';
import { MascotAnimation } from '../components/ui/MascotAnimation';
import { AuroraText } from '../components/ui/AuroraText';
import { HelpGuideButton } from '../components/ui/HelpGuideButton';
import { PatientRecoveryHub } from '../components/patient/PatientRecoveryHub';
import {
  Flame,
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  Activity,
  Bot,
  User,
} from 'lucide-react';

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
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<PatientKpi>(emptyKpi);
  const [exercises, setExercises] = useState<AssignedExercise[]>([]);
  const [therapist, setTherapist] = useState<string | null>(null);
  const [weekActivity, setWeekActivity] = useState<WeekActivity[]>(weekDays.map((d) => ({ day: d, minutes: 0 })));
  const [allSessionDates, setAllSessionDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [evolution] = useState<EvolutionWeek[] | null>([
    { label: 'Semana 1', pct: 45 },
    { label: 'Semana 2', pct: 58 },
    { label: 'Semana 3', pct: 67 },
    { label: 'Semana 4', pct: 78 },
  ]);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);
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
            name: ex.ejercicio_nombre || 'Ejercicio de Rehabilitación',
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
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-12">
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
            <h2 className="font-display font-headline-lg text-headline-lg-mobile lg:text-headline-lg gradient-text-living">
              {greeting}, <AuroraText>{user?.full_name?.split(' ')[0] || 'Paciente'}</AuroraText>
            </h2>
            <p className="text-outline font-title-md text-title-md">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="ml-auto">
            <HelpGuideButton />
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/10 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Racha Activa</p>
            <p className="text-2xl font-extrabold text-on-surface">{kpi.streak} <span className="text-xs font-normal text-outline">días</span></p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/10 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Sesiones Totales</p>
            <p className="text-2xl font-extrabold text-on-surface">{kpi.totalSessions} <span className="text-xs font-normal text-outline">completadas</span></p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/10 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Minutos Esta Semana</p>
            <p className="text-2xl font-extrabold text-on-surface">{kpi.weeklyMinutes} <span className="text-xs font-normal text-outline">min</span></p>
          </div>
        </div>
      </div>

      {/* Patient Recovery & Wellness Hub */}
      <PatientRecoveryHub />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Routine & Primary Action */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured AR Session Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-surface/90 dark:bg-surface-container-low/80 border border-outline/15 shadow-sm">
            <BorderBeam size={120} duration={8} colorFrom="#14b8a6" colorTo="#38bdf8" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-md">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 border border-teal-500/20">
                  Sesión Guiada AR
                </span>
                <h3 className="text-xl font-bold text-on-surface">Rutina de Hoy</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {exercises.length > 0
                    ? `${exercises[0].name} con corrección de postura en tiempo real por visión computacional.`
                    : 'Inicia el seguimiento guiado con tu cámara para registrar ángulos articulares.'}
                </p>
              </div>

              <button
                onClick={() => navigate('/calibration')}
                className="px-6 py-4 rounded-2xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 shrink-0"
              >
                <Play className="size-4 fill-current" />
                <span>Comenzar Sesión</span>
              </button>
            </div>
          </div>

          {/* Assigned Exercises List */}
          <CollapsibleSection title="Mis Ejercicios Asignados" icon="assignment" defaultOpen>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-on-surface-variant">Rutina prescrita por tu fisioterapeuta</p>
              <button
                onClick={() => navigate('/exercises')}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Ver todos
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : exercises.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exercises.map((ex, i) => (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3 }}
                    onClick={() => navigate('/calibration')}
                    className="p-4 rounded-2xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/10 hover:border-teal-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
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
                    <div className="size-8 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      <Play className="size-3.5 fill-current" />
                    </div>
                  </motion.div>
                ))}
              </div>
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
          <CollapsibleSection title="Actividad Semanal" icon="trending_up" defaultOpen>
            <SimpleCalendar markedDates={allSessionDates} />

            <div className="p-5 rounded-2xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/10 mt-4">
              <div className="flex justify-between items-center text-xs mb-3 text-on-surface-variant">
                <span className="font-semibold">Minutos diarios</span>
                <span>Objetivo: 15 min/día</span>
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
                    <span className="text-[10px] font-bold text-outline uppercase">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {therapist && (
              <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/15 flex items-center gap-3 mt-4">
                <div className="size-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-outline">Fisioterapeuta Asignado</p>
                  <p className="text-xs font-bold text-on-surface">{therapist}</p>
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* AI Physi Recommendation Card */}
          <div className="p-6 rounded-3xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/10 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                <Bot className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Copiloto Physi</h4>
                <p className="text-[11px] text-outline">Consejo kinesiológico personalizado</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container/50 text-xs text-on-surface-variant leading-relaxed italic border border-outline/5">
              {recLoading ? (
                <span className="flex items-center gap-2">
                  <Activity className="size-3.5 animate-spin text-primary" /> Analizando tu progreso biomecánico...
                </span>
              ) : recommendation ? (
                recommendation
              ) : (
                kpi.streak >= 3
                  ? `¡Excelente trabajo! Llevas ${kpi.streak} días consecutivos. Tu adherencia al tratamiento reduce el tiempo de recuperación.`
                  : 'Completa al menos una sesión hoy para mantener la movilidad articular y evitar rigidez.'
              )}
            </div>

            <button
              onClick={async () => {
                if (!recommendation && !recLoading) {
                  setRecLoading(true);
                  try {
                    const result = await runAIJob('insights', {
                      userPrompt: `Genera un consejo clínico breve y motivador para un paciente con ${kpi.totalSessions} sesiones y ${kpi.streak} días de racha. Máximo 2 frases. Responde en español.`,
                    });
                    if (result.success && result.result) {
                      setRecommendation(result.result);
                      toast.success('Consejo clínico actualizado');
                    }
                  } catch {
                    toast.error('No se pudo conectar con Physi');
                  } finally {
                    setRecLoading(false);
                  }
                } else {
                  navigate('/calibration');
                }
              }}
              disabled={recLoading}
              className="w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="size-3.5" />
              <span>{recommendation ? 'Iniciar sesión recomendada' : 'Consultar a Physi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gamification Achievements Section */}
      <CollapsibleSection title="Logros y Metas de Recuperación" icon="emoji_events">
        <div className="p-6 rounded-3xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/10">
          <div className="flex justify-between items-center text-xs mb-4">
            <span className="text-on-surface-variant">{gamification.unlockedCount} de {gamification.achievements.length} medallas</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{Math.round(gamification.totalProgress * 100)}% desbloqueado</span>
          </div>
          <AchievementShowcase achievements={gamification.achievements} compact={false} />
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default PatientDashboard;
