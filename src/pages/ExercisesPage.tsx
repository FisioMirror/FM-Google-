import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Dumbbell,
  Target,
  RotateCw,
  Layers,
  Sparkles,
  Search,
  Plus,
  Edit3,
  Copy,
  Trash2,
  BookOpen,
  UserPlus,
  CheckCircle2,
  X,
  Gauge,
  Brain,
  ShieldAlert,
  Flame,
  Compass,
  Zap,
  Repeat,
  Crosshair,
  User,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastProvider';
import { cn } from '../lib/utils';
import { Spinner } from '../components/ui/Loader';
import { SkeletonCard } from '../components/ui/Skeleton';
import { celebrateAchievement } from '../lib/confetti';
import { GlassModal } from '../components/ui/GlassModal';
import { ExerciseImage } from '../components/ui/ExerciseImage';
import { getExerciseImage } from '../data/exerciseImages';
import { SkeletonDemo } from '../components/rehabilitation/SkeletonDemo';
import { buildExerciseDefinition, getExerciseDescription } from '../data/exercisePresets';
import { UNIFIED_DEMO_PATIENTS } from '../data/unifiedDemoData';
import { isDemoAccount } from '../lib/demoAuth';

export interface Exercise {
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
  featured?: boolean;
}

const DEFAULT_CLINICAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    nombre: 'Flexión de Hombro Activa',
    descripcion: 'Elevación anterior del brazo hasta 90° con control postural y escápula fija.',
    detailed_description:
      'Fase 1 (Posición Inicial): De pie con postura erguida, hombros relajados y brazos a los costados.\n' +
      'Fase 2 (Ejecución): Eleva el brazo en el plano sagital hasta alcanzar los 90° (paralelo al suelo) manteniendo el codo completamente extendido.\n' +
      'Fase 3 (Sostenimiento): Mantén la posición isométrica durante 3 segundos verificando la alineación cervicodorsal.\n' +
      'Fase 4 (Retorno): Desciende de manera excéntrica y controlada en 3 segundos sin dejar caer el brazo.\n\n' +
      '⚠️ Compensaciones a evitar: No elevar la clavícula hacia la oreja ni arquear la columna lumbar al subir.',
    articulacion: 'hombro',
    grupo_muscular: 'Deltoides anterior, coracobraquial, supraespinoso',
    series: 3,
    repeticiones: 12,
    duracion_segundos: 60,
    angulo_objetivo: 90,
    fase_recuperacion: 'intermedia',
    lado: 'bilateral',
    categoria: 'movilidad',
    complejidad: 'media',
    featured: true,
  },
  {
    id: 'ex-2',
    nombre: 'Rotación Externa de Hombro',
    descripcion: 'Fortalecimiento selectivo de manguito rotador manteniendo codo a 90° adosado.',
    detailed_description:
      'Fase 1 (Posición Inicial): De pie o sentado con el codo flexionado a 90° y pegado a la parrilla costal.\n' +
      'Fase 2 (Ejecución): Rota el antebrazo hacia afuera en el plano transversal hasta alcanzar 45° de rotación externa.\n' +
      'Fase 3 (Sostenimiento): Sostén 2 segundos sintiendo la activación en la parte posterior del hombro.\n' +
      'Fase 4 (Retorno): Regresa lentamente a la posición neutra resistiendo el movimiento.\n\n' +
      '⚠️ Compensaciones a evitar: No despegar el codo del costado ni rotar el tronco para ganar rango falso.',
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
    featured: true,
  },
  {
    id: 'ex-3',
    nombre: 'Extensión Activa de Rodilla',
    descripcion: 'Activación de cuádriceps en cadena cinética abierta desde sedestación.',
    detailed_description:
      'Fase 1 (Posición Inicial): Sentado con la espalda apoyada firmemente y rodillas flexionadas a 90°.\n' +
      'Fase 2 (Ejecución): Extiende la rodilla hacia el frente hasta alcanzar la extensión completa horizontal (0°).\n' +
      'Fase 3 (Sostenimiento): Contrae el cuádriceps intensamente durante 3 segundos en el punto más alto.\n' +
      'Fase 4 (Retorno): Desciende el pie con control en 2 segundos sin golpear el suelo.\n\n' +
      '⚠️ Compensaciones a evitar: Mantener el muslo en contacto con el asiento sin inclinar la pelvis hacia atrás.',
    articulacion: 'rodilla',
    grupo_muscular: 'Cuádriceps femoral (recto femoral, vastos)',
    series: 3,
    repeticiones: 10,
    duracion_segundos: 60,
    angulo_objetivo: 0,
    fase_recuperacion: 'inicial',
    lado: 'bilateral',
    categoria: 'fuerza',
    complejidad: 'baja',
    featured: true,
  },
  {
    id: 'ex-4',
    nombre: 'Abducción de Cadera de Pie',
    descripcion: 'Estabilidad pélvica y fortalecimiento de glúteo medio con apoyo unipodal.',
    detailed_description:
      'Fase 1 (Posición Inicial): De pie con apoyo ligero de manos sobre soporte seguro y pies paralelos.\n' +
      'Fase 2 (Ejecución): Separa la pierna hacia el lado en el plano frontal alcanzando 40° de abducción.\n' +
      'Fase 3 (Sostenimiento): Sostén 2 segundos manteniendo la pelvis completamente horizontal.\n' +
      'Fase 4 (Retorno): Desciende lentamente sin tocar el suelo bruscamente.\n\n' +
      '⚠️ Compensaciones a evitar: No inclinar el tronco en dirección opuesta ni rotar la punta del pie hacia afuera.',
    articulacion: 'piernas',
    grupo_muscular: 'Glúteo medio, glúteo menor, tensor de fascia lata',
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
    descripcion: 'Movilización de columna cervical superior para elongación de flexores profundos.',
    detailed_description:
      'Fase 1 (Posición Inicial): Sentado con espalda erguida, hombros descendidos y mirada al frente.\n' +
      'Fase 2 (Ejecución): Realiza un gesto suave de doble mentón llevando la cabeza hacia adelante hasta 30°.\n' +
      'Fase 3 (Sostenimiento): Mantén 3 segundos respirando con calma sintiendo la descompresión suboccipital.\n' +
      'Fase 4 (Retorno): Retorna despacio a la posición neutra sin hiperextender el cuello.\n\n' +
      '⚠️ Compensaciones a evitar: No encoger los hombros ni forzar el rango si produce mareos o dolor.',
    articulacion: 'cuello',
    grupo_muscular: 'Largo del cuello, recto anterior, escalenos',
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
    descripcion: 'Rango articular completo y acondicionamiento neuromuscular braquial.',
    detailed_description:
      'Fase 1 (Posición Inicial): De pie o sentado con los brazos relajados a los lados y palmas hacia adelante.\n' +
      'Fase 2 (Ejecución): Flexiona los codos llevando las manos hacia los hombros hasta alcanzar los 130°.\n' +
      'Fase 3 (Sostenimiento): Pausa 1 segundo en la contracción máxima sin separar los codos del cuerpo.\n' +
      'Fase 4 (Retorno): Extiende los brazos suavemente hasta llegar a 0° de extensión.\n\n' +
      '⚠️ Compensaciones a evitar: Evitar impulsarse con el cuerpo o balancear los hombros hacia adelante.',
    articulacion: 'brazos',
    grupo_muscular: 'Bíceps braquial, braquial anterior, tríceps',
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

const FILTER_CATEGORIES = [
  { id: 'todos', label: 'Todos los Protocolos', icon: Activity },
  { id: 'hombro', label: 'Hombro & Escápula', icon: RotateCw },
  { id: 'rodilla', label: 'Rodilla & Cuádriceps', icon: Target },
  { id: 'piernas', label: 'Cadera & Pelvis', icon: Compass },
  { id: 'brazos', label: 'Codo & Brazos', icon: Dumbbell },
  { id: 'cuello', label: 'Columna Cervical', icon: Sparkles },
];

export function ExercisesPage() {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
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
    nombre: '',
    descripcion: '',
    detailed_description: '',
    articulacion: 'hombro',
    grupo_muscular: '',
    series: 3,
    repeticiones: 10,
    duracion_segundos: 60,
    angulo_objetivo: 90,
    fase_recuperacion: 'inicial',
    lado: 'bilateral',
    categoria: 'movilidad',
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
          const merged = [...(data as Exercise[])];
          for (const def of DEFAULT_CLINICAL_EXERCISES) {
            if (!merged.some((m) => m.nombre.toLowerCase() === def.nombre.toLowerCase())) {
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
          .select('id, ejercicio_nombre, series, repeticiones, ejercicio:exercises(detailed_description, articulacion, categoria, angulo_objetivo)')
          .eq('paciente_id', user?.id);

        if (!assignedError && assigned && assigned.length > 0) {
          setExercises(
            assigned.map((a: any) => ({
              id: a.id,
              nombre: a.ejercicio_nombre || 'Ejercicio',
              descripcion: null,
              detailed_description: a.ejercicio?.detailed_description ?? null,
              articulacion: a.ejercicio?.articulacion ?? 'hombro',
              grupo_muscular: null,
              series: a.series,
              repeticiones: a.repeticiones,
              duracion_segundos: 60,
              angulo_objetivo: a.ejercicio?.angulo_objetivo ?? 90,
              fase_recuperacion: 'inicial',
              lado: 'bilateral',
              categoria: a.ejercicio?.categoria ?? 'movilidad',
            })) as Exercise[]
          );
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
    const isDemo = isDemoAccount(user);
    const demoPatientOptions = UNIFIED_DEMO_PATIENTS.map((p) => ({
      id: p.id,
      nombre: p.name,
      apellido: null,
    }));

    try {
      // If user is a therapist, load their linked patients
      let realPatientsData: any[] = [];
      if (user?.id) {
        const { data: links } = await supabase
          .from('pacientes_terapeutas')
          .select('paciente_id')
          .eq('terapeuta_id', user.id);

        if (links && links.length > 0) {
          const pIds = links.map(l => l.paciente_id);
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', pIds)
            .order('full_name');
          if (profs) realPatientsData = profs;
        }
      }

      if (realPatientsData.length > 0) {
        const real = realPatientsData.map((p: any) => ({ id: p.id, nombre: p.full_name, apellido: null }));
        if (isDemo) {
          const merged = [...real];
          for (const d of demoPatientOptions) {
            if (!merged.some((m) => m.nombre.toLowerCase() === d.nombre.toLowerCase())) {
              merged.push(d);
            }
          }
          setPatients(merged);
        } else {
          setPatients(real);
        }
      } else {
        setPatients(isDemo ? demoPatientOptions : []);
      }
    } catch {
      setPatients(isDemo ? demoPatientOptions : []);
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
        const updatedExercises = [
          ...currentExercises,
          {
            id: assignExercise.id,
            nombre: assignExercise.nombre,
            series: assignExercise.series ?? 3,
            repeticiones: assignExercise.repeticiones ?? 10,
            duracion_segundos: assignExercise.duracion_segundos ?? 60,
          },
        ];
        const { error: updateErr } = await supabase
          .from('rutinas')
          .update({ ejercicios: updatedExercises, updated_at: new Date().toISOString() })
          .eq('id', activeRoutine.id);
        if (updateErr) throw updateErr;
        toast.success(`Ejercicio asignado a la rutina activa del paciente`);
      } else {
        const { error: insertErr } = await supabase.from('rutinas').insert({
          paciente_id: selectedPatientId,
          fisioterapeuta_id: user?.id,
          nombre: `Rutina - ${new Date().toLocaleDateString('es-ES')}`,
          descripcion: 'Rutina creada al prescribir ejercicio individual',
          ejercicios: [
            {
              id: assignExercise.id,
              nombre: assignExercise.nombre,
              series: assignExercise.series ?? 3,
              repeticiones: assignExercise.repeticiones ?? 10,
              duracion_segundos: assignExercise.duracion_segundos ?? 60,
            },
          ],
          activa: true,
          status: 'activa',
          fecha_inicio: new Date().toISOString().split('T')[0],
        });
        if (insertErr) throw insertErr;
        toast.success(`Nueva rutina creada y asignada con éxito`);
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
      nombre: '',
      descripcion: '',
      detailed_description: '',
      articulacion: 'hombro',
      grupo_muscular: '',
      series: 3,
      repeticiones: 10,
      duracion_segundos: 60,
      angulo_objetivo: 90,
      fase_recuperacion: 'inicial',
      lado: 'bilateral',
      categoria: 'movilidad',
    });
    setShowModal(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditing(ex);
    setForm({
      nombre: ex.nombre,
      descripcion: ex.descripcion ?? '',
      detailed_description: ex.detailed_description ?? '',
      articulacion: ex.articulacion ?? 'hombro',
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
        const { error } = await supabase
          .from('exercises')
          .update({
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
          })
          .eq('id', editing.id);
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
        toast.success('Ejercicio creado con éxito');
      }
      setShowModal(false);
      loadExercises();
    } catch {
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

  const getJointIcon = (articulacion?: string | null) => {
    switch (articulacion?.toLowerCase()) {
      case 'hombro':
        return RotateCw;
      case 'rodilla':
        return Target;
      case 'cadera':
      case 'piernas':
        return Compass;
      case 'codo':
      case 'brazos':
        return Dumbbell;
      case 'cuello':
      case 'cervical':
        return Sparkles;
      default:
        return Activity;
    }
  };

  const getCategoryIcon = (categoria?: string | null) => {
    switch (categoria?.toLowerCase()) {
      case 'fuerza':
      case 'fortalecimiento':
        return Flame;
      case 'control motor':
      case 'propiocepcion':
        return Crosshair;
      case 'estiramiento':
        return Layers;
      case 'funcional':
        return Zap;
      default:
        return RotateCw;
    }
  };

  const filtered = exercises.filter((e) => {
    const matchesSearch =
      !search ||
      e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (e.grupo_muscular ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.articulacion ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === 'todos' ||
      (e.articulacion ?? '').toLowerCase() === activeFilter.toLowerCase() ||
      (activeFilter === 'piernas' && (e.articulacion === 'cadera' || e.articulacion === 'piernas')) ||
      (activeFilter === 'brazos' && (e.articulacion === 'codo' || e.articulacion === 'brazos')) ||
      (activeFilter === 'cuello' && (e.articulacion === 'cervical' || e.articulacion === 'cuello'));

    const matchesCat =
      categoryFilter === 'todos' ||
      (e.categoria ?? '').toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesFilter && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* Header section with notification-like glass aesthetics */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-teal-500/20 shadow-[0_8px_32px_rgba(0,80,77,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] border-l-4 border-l-teal-600 dark:border-l-teal-400 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/25 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Activity className="size-3.5" />
              <span>Biblioteca Biomecánica & Telemetría AR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Catálogo de Ejercicios & Guía Anatómica
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Prescribe protocolos kinesiológicos con modelos anatómicos 3D interactivos, ángulos ROM objetivo y biofeedback en tiempo real.
            </p>
          </div>

          {isFisio && (
            <button
              onClick={openCreate}
              className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-sm transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 shrink-0 self-start lg:self-center"
            >
              <Plus className="size-4" />
              <span>Nuevo Ejercicio</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar (Design-Ref Styled with notification glass) */}
      <div className="rounded-2xl p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-teal-500/20 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 size-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ejercicio, músculo objetivo o articulación..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-teal-500/40 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {FILTER_CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = activeFilter === cat.id;
            const count =
              cat.id === 'todos'
                ? exercises.length
                : exercises.filter(
                    (e) =>
                      (e.articulacion ?? '').toLowerCase() === cat.id ||
                      (cat.id === 'piernas' && (e.articulacion === 'cadera' || e.articulacion === 'piernas')) ||
                      (cat.id === 'brazos' && (e.articulacion === 'codo' || e.articulacion === 'brazos')) ||
                      (cat.id === 'cuello' && (e.articulacion === 'cervical' || e.articulacion === 'cuello'))
                  ).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0',
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
                )}
              >
                <IconComp className="size-3.5" />
                <span>{cat.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Exercises */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Activity className="size-12 mx-auto text-teal-600/40 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No se encontraron ejercicios</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Intenta con otro término de búsqueda o cambia la categoría de articulación seleccionada.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveFilter('todos');
              setCategoryFilter('todos');
            }}
            className="px-4 py-2 rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-600/20 transition-colors"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ex, i) => {
            const JointIcon = getJointIcon(ex.articulacion);
            const CatIcon = getCategoryIcon(ex.categoria);

            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                className={cn(
                  'group rounded-[2rem] p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden',
                  ex.featured
                    ? 'border-teal-500/30 dark:border-teal-500/40 shadow-[0_8px_30px_rgba(0,80,77,0.08)] border-l-4 border-l-teal-600 dark:border-l-teal-400'
                    : 'border-white/60 dark:border-teal-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,80,77,0.12)] border-l-4 border-l-teal-500/50'
                )}
              >
                {/* AI / Protocol Badge */}
                {ex.featured && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <Sparkles className="size-2.5" />
                    <span>Protocolo Clínico</span>
                  </div>
                )}

                <div>
                  {/* Image container */}
                  <div className="relative rounded-2xl overflow-hidden mb-3">
                    <ExerciseImage src={getExerciseImage(ex.id)} name={ex.nombre} />
                    <button
                      onClick={() => setDescriptionExercise(ex)}
                      aria-label="Ver Guía Anatómica"
                      className="absolute bottom-3 right-3 size-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-teal-700 dark:text-teal-300 hover:scale-110 active:scale-95 shadow-md transition-transform"
                    >
                      <BookOpen className="size-4" />
                    </button>
                  </div>

                  {/* Title and Badges */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                        {ex.nombre}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        <JointIcon className="size-3" />
                        <span className="capitalize">{ex.articulacion || 'Articular'}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <CatIcon className="size-3" />
                        <span className="capitalize">{ex.categoria || 'Movilidad'}</span>
                      </span>

                      {ex.complejidad && (
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                            ex.complejidad === 'alta'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                              : ex.complejidad === 'media'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                          )}
                        >
                          {ex.complejidad}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {ex.descripcion || 'Protocolo kinesiológico guiado con biofeedback computarizado.'}
                  </p>

                  {/* Muscle group target */}
                  {ex.grupo_muscular && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 truncate">
                      <Target className="size-3 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="truncate">{ex.grupo_muscular}</span>
                    </div>
                  )}

                  {/* Biomechanical Telemetry metrics tile */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 text-center mb-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Repeat className="size-2.5" /> Series
                      </p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{ex.series ?? 3}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Flame className="size-2.5" /> Reps
                      </p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{ex.repeticiones ?? 10}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Gauge className="size-2.5 text-teal-500" /> ROM
                      </p>
                      <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                        {ex.angulo_objetivo !== null ? `${ex.angulo_objetivo}°` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    onClick={() => setDescriptionExercise(ex)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <BookOpen className="size-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Ver Guía Anatómica</span>
                  </button>

                  {isFisio && (
                    <button
                      onClick={() => openAssignModal(ex)}
                      className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
                    >
                      <UserPlus className="size-3.5" />
                      <span>Asignar a Paciente</span>
                    </button>
                  )}

                  {isFisio && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openEdit(ex)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-600 dark:text-slate-300 hover:text-teal-600 text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Edit3 className="size-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => cloneExercise(ex)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Copy className="size-3" />
                        <span>Clonar</span>
                      </button>
                      <button
                        onClick={() => deleteExercise(ex.id)}
                        aria-label="Eliminar ejercicio"
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Anatomical & Biomechanical Guide Modal */}
      <GlassModal isOpen={!!descriptionExercise} onClose={() => setDescriptionExercise(null)} size="xl">
        {descriptionExercise && (
          <div className="p-2 sm:p-4 space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-500/20">
                    {descriptionExercise.articulacion || 'Articulación'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                    {descriptionExercise.categoria || 'Movilidad'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {descriptionExercise.nombre}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Músculos objetivo: <strong className="text-teal-600 dark:text-teal-400">{descriptionExercise.grupo_muscular || 'Musculatura estabilizadora'}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Rango Objetivo</span>
                <span className="text-lg font-mono font-extrabold text-teal-600 dark:text-teal-400">
                  {descriptionExercise.angulo_objetivo !== null ? `${descriptionExercise.angulo_objetivo}° ROM` : '0° - 90°'}
                </span>
              </div>
            </div>

            {/* 2-Column Responsive Layout: Left: Clinical Instructions, Right: 3D Model & Angle Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Structured execution phases and guidelines */}
              <div className="lg:col-span-7 space-y-4">
                {/* Clinical Parameter Summary */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Series</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {descriptionExercise.series ?? 3}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Reps</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {descriptionExercise.repeticiones ?? 10}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sostén</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      3s Isom.
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lado</span>
                    <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 capitalize">
                      {descriptionExercise.lado || 'Bilateral'}
                    </span>
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="rounded-2xl p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    <Brain className="size-4" />
                    <span>Prescripción Paso a Paso & Control Biomecánico</span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed space-y-2">
                    {descriptionExercise.detailed_description ? (
                      descriptionExercise.detailed_description
                    ) : (
                      getExerciseDescription(descriptionExercise.nombre, descriptionExercise.articulacion ?? undefined)
                    )}
                  </div>
                </div>

                {/* AI Biofeedback Alert */}
                <div className="rounded-2xl p-3.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-500/25 flex items-start gap-3">
                  <ShieldAlert className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-teal-900 dark:text-teal-200">
                    <p className="font-bold">Monitoreo de Calibración Óptica (MediaPipe / Pose)</p>
                    <p className="text-teal-700 dark:text-teal-300 mt-0.5">
                      El paciente recibirá biofeedback sonoro y visual si detecta una tolerancia angular mayor a ±8° respecto al ángulo clínico programado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Live 3D Model with Skeleton and Biomechanical Controls */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="size-3.5 text-teal-600" />
                    <span>Simulación 3D Sincronizada</span>
                  </span>
                </div>

                <div className="w-full flex justify-center">
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
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              {isFisio ? (
                <button
                  onClick={() => {
                    const ex = descriptionExercise;
                    setDescriptionExercise(null);
                    openAssignModal(ex);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                >
                  <UserPlus className="size-3.5" />
                  <span>Asignar este Ejercicio</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setDescriptionExercise(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
              >
                Cerrar Guía
              </button>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Assign to Patient Modal (Enhanced notification glass style) */}
      <GlassModal isOpen={!!assignExercise} onClose={() => setAssignExercise(null)} size="md">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Asignar a Paciente</h3>
              <p className="text-xs text-slate-500">
                Ejercicio: <strong className="text-teal-600 dark:text-teal-400">{assignExercise?.nombre}</strong>
              </p>
            </div>
            <button
              onClick={() => setAssignExercise(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Seleccionar Paciente de la Clínica
            </label>

            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Buscar por nombre del paciente..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {patients
                .filter((p) => p.nombre.toLowerCase().includes(patientSearch.toLowerCase()))
                .map((p) => {
                  const isSelected = selectedPatientId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={cn(
                        'w-full px-3.5 py-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 text-xs',
                        isSelected
                          ? 'bg-teal-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <User className="size-4 shrink-0" />
                        <span className="truncate">{p.nombre}</span>
                      </div>
                      {isSelected && <Check className="size-4 shrink-0" />}
                    </button>
                  );
                })}
              {patients.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-4">No hay pacientes disponibles</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => setAssignExercise(null)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssignExercise}
              disabled={!selectedPatientId || assigning}
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              {assigning ? (
                <>
                  <Spinner size={16} />
                  <span>Asignando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Confirmar Asignación</span>
                </>
              )}
            </button>
          </div>
        </div>
      </GlassModal>

      {/* Create / Edit Exercise Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-white/60 dark:border-teal-500/20 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="size-5 text-teal-600" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editing ? 'Editar Protocolo de Ejercicio' : 'Nuevo Protocolo de Ejercicio'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  aria-label="Cerrar modal"
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nombre del Ejercicio
                  </label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-sm outline-none"
                    placeholder="Ej: Flexión de Hombro Activa"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Descripción Breve
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-sm outline-none"
                    rows={2}
                    placeholder="Resumen del objetivo terapéutico..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Instrucciones Clínicas Detalladas (Fases 1 a 4)
                  </label>
                  <textarea
                    value={form.detailed_description}
                    onChange={(e) => setForm({ ...form, detailed_description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-sm outline-none font-mono text-xs"
                    rows={4}
                    placeholder="Detalla la posición inicial, fase concéntrica, sostén isométrico y retorno excéntrico..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Articulación Principal
                    </label>
                    <select
                      value={form.articulacion}
                      onChange={(e) => setForm({ ...form, articulacion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-xs outline-none font-bold"
                    >
                      <option value="hombro">Hombro</option>
                      <option value="codo">Codo</option>
                      <option value="rodilla">Rodilla</option>
                      <option value="cadera">Cadera</option>
                      <option value="tobillo">Tobillo</option>
                      <option value="cervical">Cervical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Músculos Objetivo
                    </label>
                    <input
                      value={form.grupo_muscular}
                      onChange={(e) => setForm({ ...form, grupo_muscular: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-xs outline-none"
                      placeholder="Ej: Deltoides, Supraespinoso"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Series Prescritas
                    </label>
                    <input
                      type="number"
                      value={form.series}
                      onChange={(e) => setForm({ ...form, series: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-xs outline-none"
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Repeticiones por Serie
                    </label>
                    <input
                      type="number"
                      value={form.repeticiones}
                      onChange={(e) => setForm({ ...form, repeticiones: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-xs outline-none"
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Ángulo ROM Objetivo (Grados °)
                    </label>
                    <input
                      type="number"
                      value={form.angulo_objetivo}
                      onChange={(e) => setForm({ ...form, angulo_objetivo: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-xs outline-none"
                      min={0}
                      max={360}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Lado Articular
                    </label>
                    <select
                      value={form.lado}
                      onChange={(e) => setForm({ ...form, lado: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 text-xs outline-none font-bold"
                    >
                      <option value="bilateral">Bilateral</option>
                      <option value="derecho">Derecho</option>
                      <option value="izquierdo">Izquierdo</option>
                    </select>
                  </div>
                </div>

                {/* Live 3D Preview in form */}
                {form.nombre.trim() && (
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5">
                      <Gauge className="size-4 text-teal-600" />
                      <span>Vista Previa Biomecánica 3D</span>
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

                <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveExercise}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                  >
                    {editing ? 'Actualizar Protocolo' : 'Crear Protocolo'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
