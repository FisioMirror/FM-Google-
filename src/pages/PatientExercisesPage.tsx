import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { GlassPanel } from '../components/ui/Glass';
import { GlassModal } from '../components/ui/GlassModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastProvider';
import { ExerciseImage } from '../components/ui/ExerciseImage';
import { getExerciseImage } from '../data/exerciseImages';
import { SkeletonDemo } from '../components/rehabilitation/SkeletonDemo';
import { buildExerciseDefinition, getExerciseDescription } from '../data/exercisePresets';
import { saveExercises, getExercises } from '../lib/offlineDB';
import { buildGoogleCalendarUrl, buildIcsFileContent, type CalendarExercise } from '../lib/calendarExport';
import { Play, BookOpen, Layers, Calendar, Download } from 'lucide-react';

interface AssignedExercise {
  id: string;
  ejercicio_nombre: string | null;
  ejercicio_id: string | null;
  ejercicio_detailed_description: string | null;
  series: number | null;
  repeticiones: number | null;
  frecuencia_semana: number | null;
  notas: string | null;
  activo: boolean | null;
  fecha_asignacion: string | null;
}

const DEFAULT_FALLBACK_EXERCISES: AssignedExercise[] = [
  {
    id: 'demo-ex-1',
    ejercicio_nombre: 'Flexión de hombro',
    ejercicio_id: 'flexion-hombro',
    ejercicio_detailed_description:
      'Comienza de pie con los brazos a los lados y la espalda recta. Eleva lentamente el brazo hacia adelante hasta alcanzar los 90° (paralelo al suelo). Mantén la posición 3 segundos con control neuromuscular y desciende suavemente.',
    series: 3,
    repeticiones: 12,
    frecuencia_semana: 4,
    notas: 'Mantener el torso recto y la escápula estable durante todo el arco de movimiento.',
    activo: true,
    fecha_asignacion: new Date().toISOString(),
  },
  {
    id: 'demo-ex-2',
    ejercicio_nombre: 'Rotación externa con banda',
    ejercicio_id: 'rotacion-externa',
    ejercicio_detailed_description:
      'Codo flexionado a 90° pegado al costado del tronco. Rota el antebrazo hacia afuera manteniendo el eje del codo alineado y sin arquear la zona lumbar.',
    series: 3,
    repeticiones: 15,
    frecuencia_semana: 4,
    notas: 'No despegar el codo del torso y controlar la fase excéntrica.',
    activo: true,
    fecha_asignacion: new Date().toISOString(),
  },
  {
    id: 'demo-ex-3',
    ejercicio_nombre: 'Circunducción escapular',
    ejercicio_id: 'circunduccion',
    ejercicio_detailed_description:
      'Realiza círculos controlados con ambos hombros hacia atrás y hacia adelante para mejorar la movilidad glenohumeral.',
    series: 2,
    repeticiones: 10,
    frecuencia_semana: 3,
    notas: 'Movimiento lento sin forzar rangos dolorosos ni generar tensión en el cuello.',
    activo: true,
    fecha_asignacion: new Date().toISOString(),
  },
  {
    id: 'demo-ex-4',
    ejercicio_nombre: 'Estiramiento de trapecio superior',
    ejercicio_id: 'estiramiento-trapecio',
    ejercicio_detailed_description:
      'Inclina suavemente la cabeza hacia el lado opuesto y mantén la tensión durante 20 segundos acompañando con respiración profunda.',
    series: 2,
    repeticiones: 4,
    frecuencia_semana: 5,
    notas: 'Respiración diafragmática continua sin rebotes.',
    activo: true,
    fecha_asignacion: new Date().toISOString(),
  },
];

export function PatientExercisesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const [exercises, setExercises] = useState<AssignedExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Separate states for Text Description and 3D Demo Modals
  const [descriptionExercise, setDescriptionExercise] = useState<AssignedExercise | null>(null);
  const [demo3DExercise, setDemo3DExercise] = useState<AssignedExercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, [user?.id]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(false);

      if (!user?.id || user.id.startsWith('demo') || user.email === 'paciente@demo.com') {
        setExercises(DEFAULT_FALLBACK_EXERCISES);
        saveExercises(DEFAULT_FALLBACK_EXERCISES as unknown as Record<string, unknown>[]);
        setIsOffline(false);
        setLoading(false);
        return;
      }

      const { data, error: sbError } = await supabase
        .from('patient_exercises')
        .select('id, ejercicio_nombre, ejercicio_id, series, repeticiones, frecuencia_semana, notas, activo, fecha_asignacion, ejercicio:exercises(detailed_description)')
        .eq('paciente_id', user.id)
        .eq('activo', true)
        .order('fecha_asignacion', { ascending: false });

      if (sbError) {
        throw sbError;
      }

      const normalized = (data || []).map((row: Record<string, unknown>) => ({
        ...row,
        ejercicio_detailed_description: (row.ejercicio as Record<string, unknown> | null)?.detailed_description ?? null,
      })) as AssignedExercise[];

      if (normalized.length === 0) {
        // Fallback for new patients
        setExercises(DEFAULT_FALLBACK_EXERCISES);
        saveExercises(DEFAULT_FALLBACK_EXERCISES as unknown as Record<string, unknown>[]);
      } else {
        setExercises(normalized);
        saveExercises(normalized as unknown as Record<string, unknown>[]);
      }
      setIsOffline(false);
    } catch {
      const cached = await getExercises<AssignedExercise>();
      if (cached.length > 0) {
        setExercises(cached);
        setIsOffline(true);
      } else {
        setExercises(DEFAULT_FALLBACK_EXERCISES);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Mi Rutina de Rehabilitación
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Ejercicios personalizados prescritos por tu fisioterapeuta con control biomecánico.
          </p>
        </div>

        {/* Export Calendar Actions */}
        {exercises.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const calExercises: CalendarExercise[] = exercises.map((ex) => ({
                  nombre: ex.ejercicio_nombre || 'Ejercicio',
                  series: ex.series,
                  repeticiones: ex.repeticiones,
                  frecuencia_semana: ex.frecuencia_semana,
                }));
                const url = buildGoogleCalendarUrl(calExercises, user?.full_name || 'Paciente');
                if (url) window.open(url, '_blank');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest transition-all text-xs font-semibold"
            >
              <Calendar size={14} className="text-primary" />
              <span>Google Calendar</span>
            </button>
            <button
              onClick={() => {
                const calExercises: CalendarExercise[] = exercises.map((ex) => ({
                  nombre: ex.ejercicio_nombre || 'Ejercicio',
                  series: ex.series,
                  repeticiones: ex.repeticiones,
                  frecuencia_semana: ex.frecuencia_semana,
                }));
                const ics = buildIcsFileContent(calExercises, user?.full_name || 'Paciente');
                if (!ics) return;
                const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'rutina-fisiomirror.ics';
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Calendario descargado');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest transition-all text-xs font-semibold"
            >
              <Download size={14} className="text-primary" />
              <span>Descargar .ics</span>
            </button>
          </div>
        )}
      </div>

      {isOffline && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-medium">
          <Icon name="cloud_off" size={16} />
          <span>Modo sin conexión — usando rutina local almacenada</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exercises.map((ex, i) => (
            <motion.div
              key={ex.id || i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassPanel className="p-5 sm:p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-full group hover:shadow-lg transition-all">
                <div>
                  <ExerciseImage
                    src={getExerciseImage(ex.ejercicio_id)}
                    name={ex.ejercicio_nombre || 'Ejercicio asignado'}
                  />
                  {ex.notas && (
                    <p className="text-xs text-on-surface-variant mt-2 mb-3 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
                      <span className="font-bold text-primary mr-1">Indicación:</span>
                      {ex.notas}
                    </p>
                  )}

                  {/* Prescription Parameters */}
                  <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-outline-variant/20 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant">Series</p>
                      <span className="font-extrabold text-base text-on-surface">{ex.series ?? 3}</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant">Repeticiones</p>
                      <span className="font-extrabold text-base text-on-surface">{ex.repeticiones ?? 12}</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant">Frecuencia</p>
                      <span className="font-extrabold text-base text-on-surface">{ex.frecuencia_semana ?? 4}x/sem</span>
                    </div>
                  </div>
                </div>

                {/* Separated Actions: 1. Text Description, 2. 3D Demo, 3. AR Mirror */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Botón 1: Descripción en Texto */}
                    <button
                      onClick={() => setDescriptionExercise(ex)}
                      className="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <BookOpen size={14} className="text-teal-600 dark:text-teal-400" />
                      <span>Descripción</span>
                    </button>

                    {/* Botón 2: Demostración 3D Biomecánica Separada */}
                    <button
                      onClick={() => setDemo3DExercise(ex)}
                      className="py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Layers size={14} className="text-teal-600 dark:text-teal-400" />
                      <span>Demostración 3D</span>
                    </button>
                  </div>

                  {/* Botón 3: Iniciar Sesión con Espejo AR */}
                  <button
                    onClick={() =>
                      navigate(`/ar-mirror?ejercicio=${encodeURIComponent(ex.ejercicio_nombre || 'Ejercicio')}`)
                    }
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold text-xs transition-all shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Iniciar en Espejo AR</span>
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal 1: Solo Descripción Clínica en Texto */}
      <GlassModal isOpen={!!descriptionExercise} onClose={() => setDescriptionExercise(null)} size="md">
        {descriptionExercise && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <h3 className="font-bold text-base text-on-surface">
                {descriptionExercise.ejercicio_nombre || 'Ejercicio asignado'}
              </h3>
            </div>

            <ExerciseImage
              src={getExerciseImage(descriptionExercise.ejercicio_id)}
              name={descriptionExercise.ejercicio_nombre || 'Ejercicio asignado'}
              heightClass="h-40"
            />

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Instrucciones de Ejecución
                </p>
                <p className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap">
                  {descriptionExercise.ejercicio_detailed_description ||
                    getExerciseDescription(descriptionExercise.ejercicio_nombre || '')}
                </p>
              </div>

              {descriptionExercise.notas && (
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <p className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                    Nota del Terapeuta:
                  </p>
                  <p className="text-xs text-on-surface mt-0.5">{descriptionExercise.notas}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDescriptionExercise(null)}
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Modal 2: Solo Demostración 3D de Avatar / Esqueleto Biomecánico */}
      <GlassModal isOpen={!!demo3DExercise} onClose={() => setDemo3DExercise(null)} size="lg">
        {demo3DExercise && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  Demostración Biomecánica 3D
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  {demo3DExercise.ejercicio_nombre}
                </p>
              </div>
            </div>

            <div className="flex justify-center py-2 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <SkeletonDemo
                exercise={buildExerciseDefinition(
                  demo3DExercise.ejercicio_id || demo3DExercise.id,
                  demo3DExercise.ejercicio_nombre || 'Ejercicio',
                  demo3DExercise.series ?? 3,
                  demo3DExercise.repeticiones ?? 10,
                  undefined,
                  undefined,
                  undefined,
                  demo3DExercise.ejercicio_detailed_description
                )}
                userRole="patient"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-on-surface-variant">
                Observa los ángulos articulares y la postura corporal recomendada.
              </span>
              <button
                onClick={() => setDemo3DExercise(null)}
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Cerrar Visor 3D
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
