import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { GlassPanel } from '../components/ui/Glass';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastProvider';
import { cn } from '../lib/utils';
import { Spinner } from '../components/ui/Loader';
import { SkeletonCard } from '../components/ui/Skeleton';
import { MedicalIcon } from '../components/ui/MedicalIcon';
import { celebrateAchievement } from '../lib/confetti';
import { GlassModal } from '../components/ui/GlassModal';
import { ExerciseImage } from '../components/ui/ExerciseImage';
import { getExerciseImage } from '../data/exerciseImages';
import { SkeletonDemo } from '../components/rehabilitation/SkeletonDemo';
import { buildExerciseDefinition, getExerciseDescription } from '../data/exercisePresets';
import { UNIFIED_DEMO_PATIENTS } from '../data/unifiedDemoData';

const DEFAULT_CLINICAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    nombre: 'Flexión de Hombro Activa',
    descripcion: 'Elevación anterior del brazo hasta 90° con control postural.',
    detailed_description: 'Comienza con los brazos extendidos a los lados del torso. Eleva el brazo en el plano sagital hasta alcanzar 90 grados manteniendo escápula estable y sin compensación lumbar.',
    articulacion: 'hombro',
    grupo_muscular: 'Deltoides anterior, supraespinoso',
    series: 3,
    repeticiones: 12,
    duracion_segundos: 60,
    angulo_objetivo: 90,
    fase_recuperacion: 'intermedia',
    lado: 'bilateral',
    categoria: 'movilidad',
    complejidad: 'media',
  },
  {
    id: 'ex-2',
    nombre: 'Rotación Externa de Hombro',
    descripcion: 'Fortalecimiento de manguito rotador con codo a 90°.',
    detailed_description: 'Mantén el codo pegado al costado del cuerpo a 90 grados de flexión. Rota externamente el antebrazo hacia afuera de forma suave y controlada sin despegar el codo.',
    articulacion: 'hombro',
    grupo_muscular: 'Infraespinoso, redondo menor',
    series: 3,
    repeticiones: 15,
    duracion_segundos: 45,
    angulo_objetivo: 45,
    fase_recuperacion: 'inicial',
    lado: 'bilateral',
    categoria: 'fuerza',
    complejidad: 'baja',
  },
  {
    id: 'ex-3',
    nombre: 'Extensión Activa de Rodilla',
    descripcion: 'Activación de cuádriceps en cadena abierta sentado.',
    detailed_description: 'Sentado en silla con espalda erguida, extiende la rodilla lentamente hasta la horizontal. Sostén 2 segundos arriba activando el vasto medial y baja despacio.',
    articulacion: 'rodilla',
    grupo_muscular: 'Cuádriceps femoral',
    series: 3,
    repeticiones: 10,
    duracion_segundos: 60,
    angulo_objetivo: 0,
    fase_recuperacion: 'inicial',
    lado: 'bilateral',
    categoria: 'fuerza',
    complejidad: 'baja',
  },
  {
    id: 'ex-4',
    nombre: 'Abducción de Cadera de Pie',
    descripcion: 'Estabilidad pélvica y fortalecimiento de glúteo medio.',
    detailed_description: 'De pie con apoyo unipodal suave, eleva la pierna lateralmente manteniendo la pelvis neutra y sin inclinación del tronco hacia el lado contrario.',
    articulacion: 'piernas',
    grupo_muscular: 'Glúteo medio y menor',
    series: 3,
    repeticiones: 12,
    duracion_segundos: 50,
    angulo_objetivo: 40,
    fase_recuperacion: 'intermedia',
    lado: 'bilateral',
    categoria: 'control motor',
    complejidad: 'alta',
  },
  {
    id: 'ex-5',
    nombre: 'Flexión Cervical Suave',
    descripcion: 'Movilización de columna cervical superior con control.',
    detailed_description: 'Realiza una inclinación anterior suave del mentón hacia el pecho sintiendo una leve elongación suboccipital sin forzar ni provocar mareo.',
    articulacion: 'cuello',
    grupo_muscular: 'Largo del cuello, suboccipitales',
    series: 2,
    repeticiones: 8,
    duracion_segundos: 30,
    angulo_objetivo: 30,
    fase_recuperacion: 'inicial',
    lado: 'bilateral',
    categoria: 'movilidad',
    complejidad: 'baja',
  },
  {
    id: 'ex-6',
    nombre: 'Flexoextensión de Codo',
    descripcion: 'Rango de movimiento y acondicionamiento braquial.',
    detailed_description: 'Flexiona el codo acercando la palma hacia el hombro y extiende completamente de forma controlada sin hiperextender bruscamente.',
    articulacion: 'brazos',
    grupo_muscular: 'Bíceps y tríceps braquial',
    series: 3,
    repeticiones: 15,
    duracion_segundos: 45,
    angulo_objetivo: 130,
    fase_recuperacion: 'inicial',
    lado: 'bilateral',
    categoria: 'fuerza',
    complejidad: 'baja',
  },
];

interface Exercise {
  id: string;
  nombre: string;
  descripcion: string | null;
  detailed_description: string | null;
  articulacion: string | null;
  grupo_muscular: string | null;
  series: number | null;
  repeticiones: number | null;
  duracion_segundos: number | null;
  angulo_objetivo: number | null;
  fase_recuperacion: string | null;
  lado: string | null;
  categoria: string | null;
  complejidad?: 'baja' | 'media' | 'alta' | null;
}



const filters = ['Todos', 'Hombro', 'Rodilla', 'Cuello', 'Brazos', 'Piernas'];

export function ExercisesPage() {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [prevExerciseCount, setPrevExerciseCount] = useState(0);
  const isFisio = user?.role === 'fisioterapeuta';
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [descriptionExercise, setDescriptionExercise] = useState<Exercise | null>(null);
  const [assignExercise, setAssignExercise] = useState<Exercise | null>(null);
  const [patients, setPatients] = useState<{ id: string; nombre: string; apellido: string | null }[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [form, setForm] = useState({
    nombre: '', descripcion: '', detailed_description: '', articulacion: '', grupo_muscular: '',
    series: 3, repeticiones: 10, duracion_segundos: 60, angulo_objetivo: 90,
    fase_recuperacion: 'inicial', lado: 'bilateral', categoria: 'movilidad',
  });

  useEffect(() => {
    loadExercises();
  }, [user?.id]);

  useEffect(() => {
    const milestones = [3, 5, 10, 20];
    if (prevExerciseCount > 0 && exercises.length > prevExerciseCount && milestones.includes(exercises.length)) {
      celebrateAchievement();
    }
    setPrevExerciseCount(exercises.length);
  }, [exercises.length, prevExerciseCount]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      if (isFisio) {
        const { data, error } = await supabase.from('exercises').select('*').order('nombre');
        if (!error && data && data.length > 0) {
          // Merge real with default
          const merged = [...(data as Exercise[])];
          for (const def of DEFAULT_CLINICAL_EXERCISES) {
            if (!merged.some(m => m.nombre.toLowerCase() === def.nombre.toLowerCase())) {
              merged.push(def);
            }
          }
          setExercises(merged);
        } else {
          setExercises(DEFAULT_CLINICAL_EXERCISES);
        }
      } else {
        const { data: assigned, error: assignedError } = await supabase
          .from('patient_exercises')
          .select('id, ejercicio_nombre, series, repeticiones, ejercicio:exercises(detailed_description)')
          .eq('paciente_id', user?.id);
        if (!assignedError && assigned && assigned.length > 0) {
          setExercises(assigned.map((a: any) => ({
            id: a.id,
            nombre: a.ejercicio_nombre || 'Ejercicio',
            descripcion: null,
            detailed_description: a.ejercicio?.detailed_description ?? null,
            articulacion: null,
            grupo_muscular: null,
            series: a.series,
            repeticiones: a.repeticiones,
          })) as Exercise[]);
        } else {
          setExercises(DEFAULT_CLINICAL_EXERCISES.slice(0, 4));
        }
      }
    } catch {
      setExercises(DEFAULT_CLINICAL_EXERCISES);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    const demoPatientOptions = UNIFIED_DEMO_PATIENTS.map(p => ({
      id: p.id,
      nombre: p.name,
      apellido: null,
    }));

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (!error && data && data.length > 0) {
        const real = data.map((p: any) => ({ id: p.id, nombre: p.full_name, apellido: null }));
        const merged = [...real];
        for (const d of demoPatientOptions) {
          if (!merged.some(m => m.nombre.toLowerCase() === d.nombre.toLowerCase())) {
            merged.push(d);
          }
        }
        setPatients(merged);
      } else {
        setPatients(demoPatientOptions);
      }
    } catch {
      setPatients(demoPatientOptions);
    }
  };

  const openAssignModal = (ex: Exercise) => {
    setAssignExercise(ex);
    setSelectedPatientId(null);
    setPatientSearch('');
    loadPatients();
  };

  const handleAssignExercise = async () => {
    if (!assignExercise || !selectedPatientId) {
      toast.error('Selecciona un paciente');
      return;
    }
    setAssigning(true);
    try {
      const { data: activeRoutine } = await supabase
        .from('rutinas')
        .select('id, ejercicios')
        .eq('paciente_id', selectedPatientId)
        .eq('activa', true)
        .maybeSingle();

      if (activeRoutine) {
        const currentExercises = Array.isArray(activeRoutine.ejercicios) ? activeRoutine.ejercicios : [];
        const updatedExercises = [...currentExercises, {
          id: assignExercise.id,
          nombre: assignExercise.nombre,
          series: assignExercise.series ?? 3,
          repeticiones: assignExercise.repeticiones ?? 10,
          duracion_segundos: assignExercise.duracion_segundos ?? 60,
        }];
        const { error: updateErr } = await supabase
          .from('rutinas')
          .update({ ejercicios: updatedExercises, updated_at: new Date().toISOString() })
          .eq('id', activeRoutine.id);
        if (updateErr) throw updateErr;
        toast.success(`Ejercicio asignado a la rutina activa`);
      } else {
        const { error: insertErr } = await supabase.from('rutinas').insert({
          paciente_id: selectedPatientId,
          fisioterapeuta_id: user?.id,
          nombre: `Rutina - ${new Date().toLocaleDateString('es-ES')}`,
          descripcion: 'Rutina creada al asignar ejercicio individual',
          ejercicios: [{
            id: assignExercise.id,
            nombre: assignExercise.nombre,
            series: assignExercise.series ?? 3,
            repeticiones: assignExercise.repeticiones ?? 10,
            duracion_segundos: assignExercise.duracion_segundos ?? 60,
          }],
          activa: true,
          status: 'activa',
          fecha_inicio: new Date().toISOString().split('T')[0],
        });
        if (insertErr) throw insertErr;
        toast.success(`Nueva rutina creada con el ejercicio asignado`);
      }

      const { error: peErr } = await supabase.from('patient_exercises').insert({
        paciente_id: selectedPatientId,
        ejercicio_id: assignExercise.id,
        ejercicio_nombre: assignExercise.nombre,
        series: assignExercise.series ?? 3,
        repeticiones: assignExercise.repeticiones ?? 10,
      });
      if (peErr) console.error('Error inserting patient_exercise:', peErr.message);

      setAssignExercise(null);
      setSelectedPatientId(null);
    } catch (e) {
      toast.error('Error al asignar ejercicio: ' + (e as Error).message);
    } finally {
      setAssigning(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      nombre: '', descripcion: '', detailed_description: '', articulacion: '', grupo_muscular: '',
      series: 3, repeticiones: 10, duracion_segundos: 60, angulo_objetivo: 90,
      fase_recuperacion: 'inicial', lado: 'bilateral', categoria: 'movilidad',
    });
    setShowModal(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditing(ex);
    setForm({
      nombre: ex.nombre,
      descripcion: ex.descripcion ?? '',
      detailed_description: ex.detailed_description ?? '',
      articulacion: ex.articulacion ?? '',
      grupo_muscular: ex.grupo_muscular ?? '',
      series: ex.series ?? 3,
      repeticiones: ex.repeticiones ?? 10,
      duracion_segundos: ex.duracion_segundos ?? 60,
      angulo_objetivo: ex.angulo_objetivo ?? 90,
      fase_recuperacion: ex.fase_recuperacion ?? 'inicial',
      lado: ex.lado ?? 'bilateral',
      categoria: ex.categoria ?? 'movilidad',
    });
    setShowModal(true);
  };

  const saveExercise = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    try {
      if (editing) {
        const { error } = await supabase.from('exercises').update({
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          detailed_description: form.detailed_description || null,
          articulacion: form.articulacion || null,
          grupo_muscular: form.grupo_muscular || null,
          series: form.series,
          repeticiones: form.repeticiones,
          duracion_segundos: form.duracion_segundos,
          angulo_objetivo: form.angulo_objetivo,
          fase_recuperacion: form.fase_recuperacion,
          lado: form.lado,
          categoria: form.categoria,
        }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Ejercicio actualizado');
      } else {
        const { error } = await supabase.from('exercises').insert({
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          detailed_description: form.detailed_description || null,
          articulacion: form.articulacion || null,
          grupo_muscular: form.grupo_muscular || null,
          series: form.series,
          repeticiones: form.repeticiones,
          duracion_segundos: form.duracion_segundos,
          angulo_objetivo: form.angulo_objetivo,
          fase_recuperacion: form.fase_recuperacion,
          lado: form.lado,
          categoria: form.categoria,
          fisio_id: user?.id,
        });
        if (error) throw error;
        toast.success('Ejercicio creado');
      }
      setShowModal(false);
      loadExercises();
    } catch (e) {
      toast.error('Error guardando ejercicio');
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;
      toast.success('Ejercicio eliminado');
      loadExercises();
    } catch {
      toast.error('Error eliminando ejercicio');
    }
  };

  const cloneExercise = async (ex: Exercise) => {
    try {
      const { error } = await supabase.from('exercises').insert({
        nombre: `${ex.nombre} (copia)`,
        descripcion: ex.descripcion,
        detailed_description: ex.detailed_description,
        articulacion: ex.articulacion,
        grupo_muscular: ex.grupo_muscular,
        series: ex.series,
        repeticiones: ex.repeticiones,
        fisio_id: user?.id,
      });
      if (error) throw error;
      toast.success('Ejercicio clonado');
      loadExercises();
    } catch {
      toast.error('Error clonando ejercicio');
    }
  };

  const filtered = exercises.filter((e) => {
    const matchesSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 0 || (e.grupo_muscular ?? e.articulacion) === filters[activeFilter];
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            <MedicalIcon name="exercise" size={16} />
            <span>Biblioteca Clínica Kinesiológica</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
            Catálogo de Ejercicios y Biofeedback
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Configura y asigna protocolos de movilidad, fuerza y estabilidad articular con seguimiento AR.
          </p>
        </div>

        {isFisio && (
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2 self-start lg:self-auto"
          >
            <Icon name="add" size={18} />
            <span>Nuevo Ejercicio</span>
          </button>
        )}
      </div>

      {/* Floating action button — mobile only */}
      {isFisio && (
        <button
          onClick={openCreate}
          aria-label="Nuevo Ejercicio"
          className="lg:hidden fixed bottom-6 right-6 z-50 size-14 rounded-2xl bg-primary text-on-primary shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 flex items-center justify-center transition-all"
        >
          <Icon name="add" size={28} />
        </button>
      )}

      {/* Search and Anatomical Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 rounded-3xl bg-surface/60 dark:bg-surface-container-low/40 border border-outline/10">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, articulación o grupo muscular..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-surface-container/60 border border-transparent focus:border-teal-500/40 focus:bg-surface text-sm text-on-surface placeholder:text-outline/70 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {filters.map((f, i) => {
            const count =
              i === 0
                ? exercises.length
                : exercises.filter(
                    (e) => (e.grupo_muscular ?? e.articulacion)?.toLowerCase() === f.toLowerCase()
                  ).length;
            const isSelected = i === activeFilter;

            return (
              <button
                key={f}
                onClick={() => setActiveFilter(i)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
                  isSelected
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container/70 text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                <span>{f}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-outline'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface/40 border border-dashed border-outline/20">
          <MedicalIcon name="exercise" size={48} className="mx-auto text-primary/40 mb-3" />
          <h3 className="text-base font-bold text-on-surface">No se encontraron ejercicios</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
            Intenta con otro término de búsqueda o cambia la categoría anatómica seleccionada.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveFilter(0);
            }}
            className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            Restablecer búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group rounded-3xl p-5 bg-surface/85 dark:bg-surface-container-low/70 border border-outline/15 hover:border-teal-500/40 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <ExerciseImage src={getExerciseImage(ex.id)} name={ex.nombre} />

                <div className="flex items-center justify-between gap-2 mt-3 mb-2">
                  <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                    {ex.nombre}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ex.complejidad && (
                      <span className={cn(
                        'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                        ex.complejidad === 'alta'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : ex.complejidad === 'media'
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      )}>
                        {ex.complejidad}
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 border border-teal-500/20">
                      {ex.categoria || 'Movilidad'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                  {ex.descripcion || 'Ejercicio kinesiológico guiado.'}
                </p>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-surface-container/50 border border-outline/5 text-center mb-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-outline">Series</p>
                    <p className="text-sm font-extrabold text-on-surface">{ex.series ?? 3}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-outline">Reps</p>
                    <p className="text-sm font-extrabold text-on-surface">{ex.repeticiones ?? 10}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-outline">Ángulo</p>
                    <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                      {ex.angulo_objetivo ? `${ex.angulo_objetivo}°` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-outline/10">
                <button
                  onClick={() => setDescriptionExercise(ex)}
                  className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="menu_book" size={15} />
                  <span>Ver Guía Anatómica</span>
                </button>

                {isFisio && (
                  <button
                    onClick={() => openAssignModal(ex)}
                    className="w-full py-2 px-3 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Icon name="person_add" size={15} />
                    <span>Asignar a Paciente</span>
                  </button>
                )}

                {isFisio && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openEdit(ex)}
                      className="flex-1 py-2 rounded-xl bg-surface-container/80 hover:bg-primary/10 hover:text-primary text-on-surface-variant text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Icon name="edit" size={14} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => cloneExercise(ex)}
                      className="flex-1 py-2 rounded-xl bg-surface-container/80 hover:bg-surface-container-high text-on-surface-variant text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Icon name="content_copy" size={14} />
                      <span>Clonar</span>
                    </button>
                    <button
                      onClick={() => deleteExercise(ex.id)}
                      aria-label="Eliminar ejercicio"
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all"
                    >
                      <Icon name="delete" size={15} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <AnimatePresence>
      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="glass-panel rounded-3xl p-5 sm:p-6 lg:p-8 max-w-full lg:max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg gradient-text-living">{editing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h3>
              <button onClick={() => setShowModal(false)} aria-label="Cerrar ventana de ejercicio" className="text-outline hover:text-error"><Icon name="close" size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Nombre del ejercicio" />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none" rows={3} placeholder="Descripción del ejercicio" />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Descripción detallada</label>
                <textarea value={form.detailed_description} onChange={(e) => setForm({ ...form, detailed_description: e.target.value })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none" rows={5} placeholder="Instrucciones detalladas paso a paso, precauciones y recomendaciones que verá el paciente al pulsar 'Ver descripción'." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Articulación</label>
                  <select value={form.articulacion} onChange={(e) => setForm({ ...form, articulacion: e.target.value })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="">Seleccionar...</option>
                    <option value="hombro">Hombro</option>
                    <option value="codo">Codo</option>
                    <option value="rodilla">Rodilla</option>
                    <option value="cadera">Cadera</option>
                    <option value="tobillo">Tobillo</option>
                    <option value="cervical">Cervical</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Grupo Muscular</label>
                  <input value={form.grupo_muscular} onChange={(e) => setForm({ ...form, grupo_muscular: e.target.value })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ej: Hombro" />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Series</label>
                  <input type="number" value={form.series} onChange={(e) => setForm({ ...form, series: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none" min={1} />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Repeticiones</label>
                  <input type="number" value={form.repeticiones} onChange={(e) => setForm({ ...form, repeticiones: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none" min={1} />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Duración (segundos)</label>
                  <input type="number" value={form.duracion_segundos} onChange={(e) => setForm({ ...form, duracion_segundos: parseInt(e.target.value) || 30 })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none" min={5} />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Ángulo Objetivo (°)</label>
                  <input type="number" value={form.angulo_objetivo} onChange={(e) => setForm({ ...form, angulo_objetivo: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none" min={0} max={360} />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Fase de Recuperación</label>
                  <select value={form.fase_recuperacion} onChange={(e) => setForm({ ...form, fase_recuperacion: e.target.value })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="inicial">Inicial</option>
                    <option value="intermedia">Intermedia</option>
                    <option value="avanzada">Avanzada</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Lado</label>
                  <select value={form.lado} onChange={(e) => setForm({ ...form, lado: e.target.value })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="bilateral">Bilateral</option>
                    <option value="derecho">Derecho</option>
                    <option value="izquierdo">Izquierdo</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Categoría</label>
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full px-4 py-3 rounded-xl glass-teal border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="movilidad">Movilidad</option>
                    <option value="fortalecimiento">Fortalecimiento</option>
                    <option value="estiramiento">Estiramiento</option>
                    <option value="propiocepcion">Propiocepción</option>
                    <option value="funcional">Funcional</option>
                  </select>
                </div>
              </div>
              {/* Live 3D preview */}
              {form.nombre.trim() && form.articulacion && (
                <div className="pt-2">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Icon name="3d_rotation" size={16} /> Vista previa de demostración 3D
                  </p>
                  <div className="flex justify-center">
                    <SkeletonDemo
                      exercise={buildExerciseDefinition(
                        editing?.id || 'preview',
                        form.nombre,
                        form.series,
                        form.repeticiones,
                        form.articulacion,
                        form.lado,
                        form.angulo_objetivo,
                        form.detailed_description || null
                      )}
                      userRole="physio"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-surface-variant/40 text-on-surface-variant font-bold hover:bg-surface-variant/60 transition-all">Cancelar</button>
                <button onClick={saveExercise} className="premium-btn flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold hover:scale-[0.98] transition-all">{editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Description modal */}
      <GlassModal isOpen={!!descriptionExercise} onClose={() => setDescriptionExercise(null)} size="lg">
        {descriptionExercise && (
          <div className="space-y-4">
            <h3 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg gradient-text-living pr-8">
              {descriptionExercise.nombre}
            </h3>
            <ExerciseImage src={getExerciseImage(descriptionExercise.id)} name={descriptionExercise.nombre} heightClass="h-44" />
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-2">Descripción detallada</p>
              {descriptionExercise.detailed_description ? (
                <p className="text-on-surface font-body-lg whitespace-pre-wrap leading-relaxed">
                  {descriptionExercise.detailed_description}
                </p>
              ) : (
                <p className="text-on-surface font-body-lg whitespace-pre-wrap leading-relaxed">
                  {getExerciseDescription(descriptionExercise.nombre, descriptionExercise.articulacion ?? undefined)}
                </p>
              )}
            </div>

            {/* Skeleton Demo */}
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-2">Demostración con esqueleto articulado</p>
              <div className="flex justify-center">
                <SkeletonDemo
                  exercise={buildExerciseDefinition(
                    descriptionExercise.id,
                    descriptionExercise.nombre,
                    descriptionExercise.series ?? 3,
                    descriptionExercise.repeticiones ?? 10,
                    descriptionExercise.articulacion ?? undefined,
                    descriptionExercise.lado ?? undefined,
                    descriptionExercise.angulo_objetivo ?? undefined,
                    descriptionExercise.detailed_description
                  )}
                  userRole="physio"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setDescriptionExercise(null)} className="premium-btn px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:scale-[1.02] active:scale-95 transition-all">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Assign to patient modal */}
      <GlassModal isOpen={!!assignExercise} onClose={() => setAssignExercise(null)} size="md">
        <div className="p-6">
          <h3 className="text-xl font-bold text-on-surface mb-1">Asignar a paciente</h3>
          <p className="text-sm text-on-surface-variant mb-4">
            Ejercicio: <span className="font-bold text-primary">{assignExercise?.nombre}</span>
          </p>

          <label className="block text-sm font-bold text-on-surface-variant mb-2">Buscar paciente</label>
          <div className="relative mb-3">
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Nombre del paciente..."
              className="w-full px-4 py-3 pl-10 rounded-xl bg-surface-variant/20 text-on-surface border border-divider focus:border-primary focus:outline-none transition-colors"
            />
            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
            {patients
              .filter((p) => p.nombre.toLowerCase().includes(patientSearch.toLowerCase()))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                    selectedPatientId === p.id
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-variant/10 text-on-surface hover:bg-surface-variant/20'
                  }`}
                >
                  <Icon name="person" size={20} />
                  <span>{p.nombre}</span>
                </button>
              ))}
            {patients.length === 0 && (
              <p className="text-center text-on-surface-variant text-sm py-4">No hay pacientes disponibles</p>
            )}
          </div>

          <button
            onClick={handleAssignExercise}
            disabled={!selectedPatientId || assigning}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {assigning ? (
              <><Spinner size={20} /> Asignando...</>
            ) : (
              <><Icon name="check_circle" size={20} /> Asignar ejercicio</>
            )}
          </button>
        </div>
      </GlassModal>
    </div>
  );
}
