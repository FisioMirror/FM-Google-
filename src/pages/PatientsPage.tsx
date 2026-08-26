import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { SkeletonList } from '../components/ui/Skeleton';
import { MedicalIcon } from '../components/ui/MedicalIcon';
import { CollapsibleProfile } from '../components/ui/CollapsibleProfile';
import { ProgressiveBlur } from '../components/ui/ProgressiveBlur';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { UNIFIED_DEMO_PATIENTS } from '../data/unifiedDemoData';
import { AvatarWithBadge } from '../components/heroui';
import {
  Users,
  Search,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight,
  Calendar,
  Video,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface PatientCard {
  id: string;
  name: string;
  fmId: string;
  status: string;
  statusColor: 'green' | 'red' | 'blue' | 'secondary';
  recoveryProgress: number;
  lastSession: string;
  condition: string;
  sessionCount: number;
  patologia?: string;
  medico_remitente?: string;
  documento_identidad?: string;
  telefono?: string;
  adherencia?: number;
}

const filterOptions = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'revision', label: 'Requieren Revisión' },
  { id: 'recuperacion', label: 'En Recuperación' },
];

export function PatientsPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<PatientCard[]>([]);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  useEffect(() => {
    loadPatients();
  }, [user?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCmdPalette(true);
      }
      if (e.key === 'Escape') setShowCmdPalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    const demoCards: PatientCard[] = UNIFIED_DEMO_PATIENTS.map((p) => ({
      id: p.id,
      name: p.name,
      fmId: p.fmId,
      status:
        p.status === 'Alta próxima'
          ? 'Alta próxima'
          : p.status === 'Requiere Revisión'
          ? 'Requiere Revisión'
          : p.progress >= 75
          ? 'Mejorando'
          : 'Estable',
      statusColor: p.status === 'Requiere Revisión' ? 'red' : p.progress >= 75 ? 'green' : 'blue',
      recoveryProgress: p.progress,
      lastSession: p.lastActive,
      condition: p.diagnosis,
      sessionCount: p.sessionsCompleted,
      patologia: p.patologia,
      medico_remitente: p.referringDoctor,
      telefono: p.phone,
      adherencia: p.adherence,
    }));

    if (!user?.id) {
      setPatients(demoCards);
      setLoading(false);
      return;
    }

    try {
      const { data: links } = await supabase
        .from('pacientes_terapeutas')
        .select('paciente_id')
        .eq('terapeuta_id', user.id);

      if (!links || links.length === 0) {
        setPatients(demoCards);
        setLoading(false);
        return;
      }

      const patientIds = links.map((l) => l.paciente_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id, full_name, diagnostico,
          patologia, medico_remitente, documento_identidad,
          telefono, fecha_nacimiento, extremidad_afectada
        `)
        .in('id', patientIds);

      if (!profiles || profiles.length === 0) {
        setPatients(demoCards);
        setLoading(false);
        return;
      }

      const { data: sessions } = await supabase
        .from('sesiones_completadas')
        .select('paciente_id, fecha, calidad_ejecucion, adherencia')
        .in('paciente_id', patientIds)
        .order('fecha', { ascending: false });

      const realCards: PatientCard[] = profiles.map((p, i) => {
        const patientSessions = (sessions || []).filter((s) => s.paciente_id === p.id);
        const lastSessionDate = patientSessions[0]?.fecha;
        const daysSinceLast = lastSessionDate
          ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / 86400000)
          : null;
        const avgQuality =
          patientSessions.length > 0
            ? Math.round(
                patientSessions.reduce((sum, s) => sum + (s.calidad_ejecucion || 0), 0) /
                  patientSessions.length
              )
            : 0;

        let status = 'Sin Sesiones';
        let statusColor: PatientCard['statusColor'] = 'secondary';
        if (daysSinceLast === null) {
          status = 'Nuevo';
          statusColor = 'secondary';
        } else if (daysSinceLast > 7) {
          status = 'Requiere Revisión';
          statusColor = 'red';
        } else if (avgQuality >= 70) {
          status = 'Mejorando';
          statusColor = 'green';
        } else {
          status = 'Estable';
          statusColor = 'blue';
        }

        const lastSessionStr = lastSessionDate
          ? new Date(lastSessionDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
          : 'Sin sesiones';

        return {
          id: p.id,
          name: p.full_name,
          fmId: `FM-${2000 + i}`,
          status,
          statusColor,
          recoveryProgress: avgQuality,
          lastSession: lastSessionStr,
          condition: p.diagnostico || p.patologia || 'General',
          sessionCount: patientSessions.length,
          patologia: p.patologia || undefined,
          medico_remitente: p.medico_remitente || undefined,
          documento_identidad: p.documento_identidad || undefined,
          telefono: p.telefono || undefined,
          adherencia: avgQuality,
        } as PatientCard;
      });

      const merged = [...realCards];
      for (const d of demoCards) {
        if (!merged.some((m) => m.name.toLowerCase() === d.name.toLowerCase() || m.id === d.id)) {
          merged.push(d);
        }
      }
      setPatients(merged);
    } catch {
      setPatients(demoCards);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.patologia?.toLowerCase().includes(q) ||
        p.medico_remitente?.toLowerCase().includes(q) ||
        p.documento_identidad?.toLowerCase().includes(q) ||
        p.telefono?.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === 'activos') {
        return p.statusColor === 'green' || p.statusColor === 'blue';
      }
      if (activeFilter === 'revision') {
        return p.statusColor === 'red' || p.status === 'Requiere Revisión';
      }
      if (activeFilter === 'recuperacion') {
        return p.recoveryProgress > 0 && p.recoveryProgress < 75;
      }
      return true;
    });
  }, [patients, searchQuery, activeFilter]);

  // Statistics summaries
  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter((p) => p.statusColor === 'green' || p.statusColor === 'blue').length;
    const needReview = patients.filter((p) => p.statusColor === 'red').length;
    const avgRecovery = total > 0 ? Math.round(patients.reduce((s, p) => s + p.recoveryProgress, 0) / total) : 0;
    return { total, active, needReview, avgRecovery };
  }, [patients]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            <Users className="size-4" />
            <span>Gestión Clínica de Pacientes</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
            Directorio y Seguimiento
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Supervisa el progreso biomecánico, adherencia remota y estado de tratamiento de tus pacientes.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/tokens')}
            className="px-4 py-2.5 rounded-2xl bg-surface/80 dark:bg-surface-container-low/70 border border-outline/15 text-on-surface hover:border-teal-500/40 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Icon name="key" size={16} className="text-primary" />
            <span>Generar Token</span>
          </button>
          <button
            onClick={() => navigate('/ocr-scanner')}
            className="px-5 py-2.5 rounded-2xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span>Cargar Paciente (OCR)</span>
          </button>
        </div>
      </div>

      {/* KPI Mini-Cards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-surface/70 dark:bg-surface-container-low/50 border border-outline/10 flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Total Pacientes</p>
            <p className="text-xl font-extrabold text-on-surface">{stats.total}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-surface/70 dark:bg-surface-container-low/50 border border-outline/10 flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">En Tratamiento Activo</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-surface/70 dark:bg-surface-container-low/50 border border-outline/10 flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Requieren Atención</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{stats.needReview}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-surface/70 dark:bg-surface-container-low/50 border border-outline/10 flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Adherencia Media</p>
            <p className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">{stats.avgRecovery}%</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 rounded-3xl bg-surface/60 dark:bg-surface-container-low/40 border border-outline/10">
        {/* Search input with K shortcut */}
        <div className="relative flex-1">
          <Search className="size-4 text-outline absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, diagnóstico, cédula o médico remitente..."
            className="w-full pl-11 pr-20 py-2.5 rounded-2xl bg-surface-container/60 border border-transparent focus:border-teal-500/40 focus:bg-surface text-sm text-on-surface placeholder:text-outline/70 outline-none transition-all"
          />
          <button
            onClick={() => setShowCmdPalette(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container-highest text-outline flex items-center gap-1 hover:bg-teal-500/10 hover:text-teal-600 transition-colors"
          >
            <span>⌘K</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {filterOptions.map((f) => {
            const count =
              f.id === 'todos'
                ? patients.length
                : f.id === 'activos'
                ? patients.filter((p) => p.statusColor === 'green' || p.statusColor === 'blue').length
                : f.id === 'revision'
                ? patients.filter((p) => p.statusColor === 'red').length
                : patients.filter((p) => p.recoveryProgress > 0 && p.recoveryProgress < 75).length;

            const isSelected = activeFilter === f.id;

            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
                  isSelected
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container/70 text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                <span>{f.label}</span>
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

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container/80 self-end md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            aria-label="Vista cuadrícula"
            className={cn(
              'p-1.5 rounded-lg transition-all',
              viewMode === 'cards'
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-outline hover:text-on-surface'
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="Vista lista"
            className={cn(
              'p-1.5 rounded-lg transition-all',
              viewMode === 'list'
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-outline hover:text-on-surface'
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <SkeletonList count={6} />
      ) : filteredPatients.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface/40 border border-dashed border-outline/20">
          <MedicalIcon name="exercise" size={48} className="mx-auto text-primary/40 mb-3" />
          <h3 className="text-base font-bold text-on-surface">No se encontraron pacientes</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
            No hay pacientes que coincidan con los filtros seleccionados o la búsqueda actual.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('todos');
            }}
            className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'cards' ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPatients.map((patient, i) => {
                const initials = patient.name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2);

                const isWarning = patient.statusColor === 'red';
                const isGood = patient.statusColor === 'green';

                return (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group rounded-3xl p-6 bg-surface/85 dark:bg-surface-container-low/70 border border-outline/15 hover:border-teal-500/40 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar + Badges */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <AvatarWithBadge
                            fallback={initials}
                            status={isGood ? 'online' : isWarning ? 'warning' : 'offline'}
                          />
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                              {patient.name}
                            </h3>
                            <p className="text-[11px] font-semibold text-outline uppercase tracking-wider">
                              ID: #{patient.fmId}
                            </p>
                          </div>
                        </div>

                        <span
                          className={cn(
                            'text-[10px] font-black uppercase px-2.5 py-1 rounded-full border',
                            isGood && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                            isWarning && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                            !isGood && !isWarning && 'bg-teal-500/10 text-teal-600 border-teal-500/20'
                          )}
                        >
                          {patient.status}
                        </span>
                      </div>

                      {/* Condition / Diagnostic */}
                      <div className="p-3 rounded-2xl bg-surface-container/40 border border-outline/5 mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                          <MedicalIcon name="spine" size={14} className="text-primary shrink-0" />
                          <span className="truncate">{patient.condition}</span>
                        </div>
                      </div>

                      {/* Progress Bar & Adherence */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant font-medium">Recuperación / Calidad</span>
                          <span className="font-bold text-on-surface">{patient.recoveryProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${patient.recoveryProgress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={cn(
                              'h-full rounded-full',
                              isWarning
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500'
                            )}
                          />
                        </div>
                      </div>

                      {/* Session Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-outline/10 text-xs">
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <Calendar className="size-3.5 text-outline" />
                          <span className="truncate">{patient.lastSession}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-on-surface-variant justify-end">
                          <Activity className="size-3.5 text-teal-500" />
                          <span>{patient.sessionCount} sesiones</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-outline/10">
                      <button
                        onClick={() => navigate(`/paciente/${patient.id}`)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <FileText className="size-3.5" />
                        <span>Ver Expediente</span>
                      </button>

                      <button
                        onClick={() => navigate(`/ar-mirror?patientId=${patient.id}`)}
                        title="Iniciar Sesión AR Guiada"
                        className="py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-teal-500 hover:text-white text-on-surface text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Video className="size-3.5" />
                        <span className="hidden sm:inline">Sesión AR</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Add Patient Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredPatients.length * 0.05 }}
                onClick={() => navigate('/ocr-scanner')}
                className="border-2 border-dashed border-outline/20 hover:border-teal-500/40 rounded-3xl flex flex-col items-center justify-center p-8 text-center cursor-pointer group hover:bg-teal-500/5 transition-all min-h-[260px]"
              >
                <div className="size-14 rounded-2xl bg-teal-500/10 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all mb-3">
                  <Plus className="size-7" />
                </div>
                <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Registrar Nuevo Paciente
                </h4>
                <p className="text-xs text-on-surface-variant max-w-[220px] mt-1">
                  Importa prescripciones médicas u órdenes clínicas vía OCR inteligente.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/paciente/${p.id}`)}
                  className="p-4 rounded-2xl bg-surface/80 dark:bg-surface-container-low/60 border border-outline/10 hover:border-teal-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{p.name}</h4>
                      <p className="text-xs text-on-surface-variant">{p.condition}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-on-surface-variant">
                    <div>
                      <span className="text-outline text-[10px] uppercase font-bold block">Última actividad</span>
                      <span className="font-semibold text-on-surface">{p.lastSession}</span>
                    </div>
                    <div>
                      <span className="text-outline text-[10px] uppercase font-bold block">Adherencia</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{p.recoveryProgress}%</span>
                    </div>
                    <ChevronRight className="size-5 text-outline" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Command Palette Modal */}
      {showCmdPalette && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
          onClick={() => setShowCmdPalette(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-surface border border-outline/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center border-b border-outline/10">
              <Search className="size-5 text-primary mr-3" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none font-medium text-on-surface placeholder:text-outline text-sm outline-none"
                placeholder="Buscar paciente por nombre o diagnóstico..."
              />
              <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-1 rounded-md">
                ESC
              </span>
            </div>
            <div className="p-3 max-h-[350px] overflow-y-auto space-y-1">
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider px-3 py-1.5">
                Resultados
              </p>
              {filteredPatients.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    navigate(`/paciente/${p.id}`);
                    setShowCmdPalette(false);
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-primary/5 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{p.name}</p>
                      <p className="text-xs text-outline">{p.condition}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-outline" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
