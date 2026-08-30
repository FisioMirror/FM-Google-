import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SkeletonList } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { UNIFIED_DEMO_PATIENTS } from '../data/unifiedDemoData';
import { useToast } from '../components/ui/ToastProvider';
import { EmailFeatureModal } from '../components/ui/EmailFeatureModal';
import { isDemoAccount } from '../lib/demoAuth';
import {
  Users,
  Search,
  Plus,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  Key,
  Copy,
  Check,
  Mail,
  ExternalLink,
  UserCheck,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useRealtimePresence } from '../lib/presenceService';
import { staggerContainer, staggerItem, springTactile } from '../lib/motionVariants';

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

interface TokenRow {
  id: string;
  token: string;
  patientName: string | null;
  patientEmail?: string | null;
  patientPhone?: string | null;
  status: 'pendiente' | 'activado' | 'expirado';
  createdAt: string;
}

const defaultDemoTokens: TokenRow[] = [
  { id: 'demo-token-1', token: '482910', patientName: 'Carlos Mendoza', patientEmail: 'paciente@demo.com', patientPhone: '+58 412 1234567', status: 'activado', createdAt: '2026-03-20T10:00:00Z' },
  { id: 'demo-token-2', token: '839201', patientName: 'María Delgado', patientEmail: 'maria.delgado@example.com', patientPhone: '+58 414 9876543', status: 'activado', createdAt: '2026-03-22T14:30:00Z' },
  { id: 'demo-token-3', token: '194820', patientName: 'Lucía Fernández', patientEmail: 'lucia.f@example.com', patientPhone: '+58 424 5551234', status: 'pendiente', createdAt: '2026-03-24T09:15:00Z' },
  { id: 'demo-token-4', token: '582019', patientName: 'Jorge Ramírez', patientEmail: 'jorge.ramirez@example.com', patientPhone: '+58 416 3338899', status: 'pendiente', createdAt: '2026-03-25T11:45:00Z' },
];

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
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'patients' | 'tokens'>('patients');
  const [patients, setPatients] = useState<PatientCard[]>([]);
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [tokenFilter, setTokenFilter] = useState<'todos' | 'pendiente' | 'activado'>('todos');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [emailModalToken, setEmailModalToken] = useState<TokenRow | null>(null);

  const { getUserStatus, onlineCount } = useRealtimePresence();

  useEffect(() => {
    loadPatients();
    loadTokens();
  }, [user?.id]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
      setActiveTab('pacientes');
    }
  }, [searchParams]);

  const loadPatients = async () => {
    setLoading(true);
    const isDemo = isDemoAccount(user);
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
      setPatients(isDemo ? demoCards : []);
      setLoading(false);
      return;
    }

    try {
      const { data: links } = await supabase
        .from('pacientes_terapeutas')
        .select('paciente_id')
        .eq('terapeuta_id', user.id);

      const patientIds = links?.map((l) => l.paciente_id).filter(Boolean) || [];

      let profQuery = supabase
        .from('profiles')
        .select(`
          id, full_name, email, diagnostico,
          patologia, medico_remitente, documento_identidad,
          telefono, fecha_nacimiento, extremidad_afectada, role
        `);

      if (patientIds.length > 0) {
        profQuery = profQuery.or(`id.in.(${patientIds.join(',')}),role.eq.paciente`);
      } else {
        profQuery = profQuery.eq('role', 'paciente');
      }

      const { data: profiles } = await profQuery;

      if (!profiles || profiles.length === 0) {
        setPatients(isDemo ? demoCards : []);
        setLoading(false);
        return;
      }

      const realCards: PatientCard[] = profiles.map((p) => ({
        id: p.id,
        name: p.full_name || 'Paciente',
        fmId: `FM-${p.id.slice(0, 4).toUpperCase()}`,
        status: 'En tratamiento',
        statusColor: 'blue',
        recoveryProgress: 50,
        lastSession: 'Reciente',
        condition: p.diagnostico || p.patologia || 'En evaluación',
        sessionCount: 1,
        patologia: p.patologia,
        medico_remitente: p.medico_remitente,
        documento_identidad: p.documento_identidad,
        telefono: p.telefono,
        adherencia: 75,
      }));

      if (isDemo) {
        const merged = [...realCards];
        for (const d of demoCards) {
          if (!merged.some((m) => m.name.toLowerCase() === d.name.toLowerCase() || m.id === d.id)) {
            merged.push(d);
          }
        }
        setPatients(merged);
      } else {
        setPatients(realCards);
      }
    } catch {
      setPatients(isDemo ? demoCards : []);
    } finally {
      setLoading(false);
    }
  };

  const loadTokens = async () => {
    setTokensLoading(true);
    const isDemo = isDemoAccount(user);
    if (!user?.id) {
      setTokens(isDemo ? defaultDemoTokens : []);
      setTokensLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activation_tokens')
        .select('id, token, paciente_id, terapeuta_id, created_at')
        .eq('terapeuta_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setTokens(isDemo ? defaultDemoTokens : []);
        return;
      }

      const patientIds = data.map((d) => d.paciente_id).filter(Boolean);
      let patientMap: Record<string, { name: string; email?: string | null; phone?: string | null }> = {};
      if (patientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, telefono')
          .in('id', patientIds);
        if (profiles) {
          patientMap = Object.fromEntries(
            profiles.map((p) => [
              p.id,
              {
                name: p.full_name,
                email: p.email?.includes('@fisiomirror.paciente') ? null : p.email,
                phone: p.telefono,
              },
            ]),
          );
        }
      }

      const realTokens: TokenRow[] = data.map((t) => ({
        id: t.id,
        token: t.token,
        patientName: t.paciente_id ? (patientMap[t.paciente_id]?.name ?? 'Paciente Vinculado') : null,
        patientEmail: t.paciente_id ? patientMap[t.paciente_id]?.email : null,
        patientPhone: t.paciente_id ? patientMap[t.paciente_id]?.phone : null,
        status: (t.paciente_id ? 'activado' : 'pendiente') as TokenRow['status'],
        createdAt: t.created_at,
      }));

      if (isDemo) {
        const merged = [...realTokens];
        for (const d of defaultDemoTokens) {
          if (!merged.some((m) => m.token === d.token)) {
            merged.push(d);
          }
        }
        setTokens(merged);
      } else {
        setTokens(realTokens);
      }
    } catch {
      setTokens(isDemo ? defaultDemoTokens : []);
    } finally {
      setTokensLoading(false);
    }
  };

  const createQuickToken = async () => {
    const randomSixDigits = String(Math.floor(100000 + Math.random() * 900000));
    try {
      if (user?.id) {
        const { error } = await supabase.from('activation_tokens').insert({
          token: randomSixDigits,
          terapeuta_id: user.id,
        });
        if (error) throw error;
      }
      const newToken: TokenRow = {
        id: `tok-${Date.now()}`,
        token: randomSixDigits,
        patientName: null,
        status: 'pendiente',
        createdAt: new Date().toISOString(),
      };
      setTokens((prev) => [newToken, ...prev]);
      toast.success(`Token de acceso emitido: ${randomSixDigits}`, {
        description: 'Compártelo con tu paciente para que vincule su cuenta.',
      });
    } catch {
      toast.error('Error al generar el token.');
    }
  };

  const handleCopyCode = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopiedToken(tok);
    toast.success(`Código copiado: ${tok}`);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyLink = (tok: string) => {
    const link = `${window.location.origin}/registro-paciente?token=${encodeURIComponent(tok)}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace de activación copiado al portapapeles');
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.fmId?.toLowerCase().includes(q) ||
        p.patologia?.toLowerCase().includes(q) ||
        p.medico_remitente?.toLowerCase().includes(q) ||
        p.documento_identidad?.toLowerCase().includes(q) ||
        p.telefono?.toLowerCase().includes(q) ||
        (p as any).email?.toLowerCase().includes(q) ||
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

  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      if (tokenFilter === 'todos') return true;
      return t.status === tokenFilter;
    });
  }, [tokens, tokenFilter]);

  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter((p) => p.statusColor === 'green' || p.statusColor === 'blue').length;
    const needReview = patients.filter((p) => p.statusColor === 'red').length;
    const avgRecovery = total > 0 ? Math.round(patients.reduce((s, p) => s + p.recoveryProgress, 0) / total) : 0;
    const pendingTokCount = tokens.filter((t) => t.status === 'pendiente').length;
    return { total, active, needReview, avgRecovery, pendingTokCount };
  }, [patients, tokens]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* Header Section with Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            <Users className="size-4" />
            <span>Gestión Clínica y Acceso</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
            Pacientes y Llaves de Acceso
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Supervisa expedientes, rehabilitación remota y emite tokens seguros para tus pacientes.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={createQuickToken}
            className="px-4 py-2.5 rounded-2xl bg-surface/80 dark:bg-surface-container-low/70 border border-outline/15 text-on-surface hover:border-teal-500/40 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Key className="size-4 text-teal-600 dark:text-teal-400" />
            <span>Emitir Token Rápido</span>
          </button>
          <button
            onClick={() => navigate('/ocr-scanner')}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-700/20 flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span>Cargar Paciente (OCR)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="p-4 rounded-3xl bg-surface/70 dark:bg-surface-container-low/50 border border-outline/10 flex items-center gap-3.5 cursor-default"
        >
          <div className="size-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Users className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-on-surface-variant font-medium">Total Pacientes</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xl font-extrabold text-on-surface">{stats.total}</p>
              {onlineCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineCount} en vivo
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="p-4 rounded-3xl bg-surface/70 dark:bg-surface-container-low/50 border border-outline/10 flex items-center gap-3.5 cursor-default"
        >
          <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Tratamiento Activo</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="p-4 rounded-3xl bg-surface/70 dark:bg-surface-container-low/50 border border-outline/10 flex items-center gap-3.5 cursor-default"
        >
          <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Requieren Atención</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{stats.needReview}</p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="p-4 rounded-3xl bg-surface/70 dark:bg-surface-container-low/50 border border-outline/10 flex items-center gap-3.5 cursor-default"
        >
          <div className="size-11 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Key className="size-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Tokens Pendientes</p>
            <p className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">{stats.pendingTokCount}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Module Tabs Switcher */}
      <div className="flex bg-surface-container-low/80 p-1.5 rounded-2xl border border-outline/15 w-fit max-w-full">
        <button
          onClick={() => setActiveTab('patients')}
          className={cn(
            'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2',
            activeTab === 'patients'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <Users className="size-4" />
          <span>Directorio Clínico ({patients.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={cn(
            'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2',
            activeTab === 'tokens'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <Key className="size-4" />
          <span>Tokens y Llaves de Acceso ({tokens.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: PACIENTES ─── */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2.5 rounded-3xl bg-surface/60 dark:bg-surface-container-low/40 border border-outline/10">
            <div className="relative flex-1">
              <Search className="size-4 text-outline absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, diagnóstico, cédula o patología..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-surface-container/60 border border-transparent focus:border-teal-500/40 focus:bg-surface text-xs sm:text-sm text-on-surface placeholder:text-outline/70 outline-none transition-all"
              />
            </div>

            {/* Filter Pills with clean gap & flex-wrap */}
            <div className="flex flex-wrap items-center gap-2">
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
                      'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border',
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-surface-container/70 border-outline/10 text-on-surface-variant hover:bg-surface-container-high'
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

            {/* Grid / List Mode */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container/80 shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                aria-label="Vista cuadrícula"
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  viewMode === 'cards' ? 'bg-surface text-teal-600 shadow-xs font-bold' : 'text-outline hover:text-on-surface'
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="Vista lista"
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  viewMode === 'list' ? 'bg-surface text-teal-600 shadow-xs font-bold' : 'text-outline hover:text-on-surface'
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Patient Cards / List */}
          {loading ? (
            <SkeletonList count={6} />
          ) : filteredPatients.length === 0 ? (
            <EmptyState
              type="patients"
              icon="person_search"
              title="No se encontraron pacientes"
              description="Intenta modificar tu búsqueda o carga un nuevo paciente con el escáner OCR."
              actionLabel="Cargar Nuevo Paciente"
              onAction={() => navigate('/ocr-scanner')}
            />
          ) : viewMode === 'cards' ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredPatients.map((p) => {
                const isAlert = p.statusColor === 'red';
                const isGood = p.statusColor === 'green';
                const presence = getUserStatus(p.id);
                const initials = p.name
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <motion.div
                    key={p.id}
                    layout
                    variants={staggerItem}
                    whileHover={{ y: -4, scale: 1.015, transition: springTactile }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/paciente/${p.id}`)}
                    className="glass-card p-6 rounded-3xl group cursor-pointer transition-shadow duration-300 relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Avatar/Badge + Name & ID + Status Tag */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3.5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0",
                            isAlert 
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" 
                              : "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                          )}>
                            {initials || 'FM'}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-on-surface group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                              {p.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
                                {p.fmId || `#FM-${p.id.slice(0, 4)}`}
                              </p>
                              {presence && (
                                <span className={cn(
                                  "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border",
                                  presence.status === 'en_ejercicio'
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                    : presence.status === 'videoconsulta'
                                    ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
                                    : "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
                                )}>
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    presence.status === 'en_ejercicio' ? "bg-emerald-500 animate-pulse" :
                                    presence.status === 'videoconsulta' ? "bg-indigo-500 animate-ping" : "bg-teal-500"
                                  )} />
                                  {presence.status === 'en_ejercicio' ? 'En ejercicio' : presence.status === 'videoconsulta' ? 'En videollamada' : 'En línea'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={cn(
                          "px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold shrink-0",
                          isAlert
                            ? "bg-red-500/10 text-red-600 border border-red-500/20"
                            : isGood
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                        )}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isAlert ? '#EF4444' : isGood ? '#10B981' : '#00504d' }} />
                          <span>{p.status}</span>
                        </div>
                      </div>

                      {/* Recovery Progress Bar */}
                      <div className="space-y-1.5 mb-5">
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-on-surface-variant font-semibold">Progreso de Recuperación</span>
                          <span className={cn(
                            "font-extrabold",
                            isAlert ? "text-red-600 dark:text-red-400" : "text-teal-700 dark:text-teal-300"
                          )}>
                            {p.recoveryProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden p-0.5 border border-outline-variant/10">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              isAlert ? "bg-red-500" : p.recoveryProgress >= 75 ? "bg-emerald-500" : "bg-teal-600"
                            )}
                            style={{ width: `${Math.max(4, p.recoveryProgress)}%` }}
                          />
                        </div>
                      </div>

                      {/* 2-Column Clinical Metadata Grid */}
                      <div className="grid grid-cols-2 gap-3 py-3.5 border-y border-outline-variant/15 text-xs mb-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-outline tracking-wider mb-1">Última Sesión</p>
                          <p className="font-semibold text-on-surface flex items-center gap-1.5 truncate">
                            <Calendar className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span>{p.lastSession || 'Reciente'}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-outline tracking-wider mb-1">Diagnóstico</p>
                          <p className="font-semibold text-on-surface line-clamp-1">
                            {p.condition || 'Rehabilitación'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center -space-x-1.5">
                        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-surface-container bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200 flex items-center justify-center text-[9px] font-extrabold shadow-xs">
                          AI
                        </div>
                        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-surface-container bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-[9px] font-extrabold shadow-xs">
                          PT
                        </div>
                        <span className="text-[11px] text-outline font-medium pl-3">
                          {p.sessionCount} ses.
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/paciente/${p.id}`);
                        }}
                        className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-bold text-xs flex items-center gap-1 group-hover:gap-1.5 transition-all"
                      >
                        <span>Ver Expediente</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-outline/15 bg-surface/80 dark:bg-surface-container-low/70 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-high/60 text-outline font-bold uppercase tracking-wider border-b border-outline/10">
                  <tr>
                    <th className="p-4">Paciente</th>
                    <th className="p-4">Diagnóstico</th>
                    <th className="p-4">Progreso</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {filteredPatients.map((p) => {
                    const rowPresence = getUserStatus(p.id);
                    return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/paciente/${p.id}`)}
                      className="hover:bg-surface-container-high/40 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-bold text-on-surface">
                        <div className="flex items-center gap-2">
                          <span>{p.name}</span>
                          {rowPresence && (
                            <span className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border",
                              rowPresence.status === 'en_ejercicio'
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : rowPresence.status === 'videoconsulta'
                                ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
                                : "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
                            )}>
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                rowPresence.status === 'en_ejercicio' ? "bg-emerald-500 animate-pulse" :
                                rowPresence.status === 'videoconsulta' ? "bg-indigo-500 animate-ping" : "bg-teal-500"
                              )} />
                              {rowPresence.status === 'en_ejercicio' ? 'En ejercicio' : rowPresence.status === 'videoconsulta' ? 'En llamada' : 'En línea'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant">{p.condition}</td>
                      <td className="p-4 font-bold">{p.recoveryProgress}%</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full',
                            p.statusColor === 'red'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-teal-500/10 text-teal-600'
                          )}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-teal-600 font-bold hover:underline">Ver Expediente</span>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: GESTIÓN DE TOKENS Y LLAVES ─── */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Key className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Llaves de Activación para Pacientes</h3>
                <p className="text-xs text-on-surface-variant">
                  Permiten a un paciente activar su cuenta y vincular su expediente clínico directamente a tu consulta.
                </p>
              </div>
            </div>

            <button
              onClick={createQuickToken}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus className="size-4" />
              <span>Emitir Nueva Llave</span>
            </button>
          </div>

          {/* Tokens Filters */}
          <div className="flex items-center gap-2">
            {(['todos', 'pendiente', 'activado'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setTokenFilter(filterKey)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border',
                  tokenFilter === filterKey
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-surface/70 border-outline/10 text-on-surface-variant hover:bg-surface-container'
                )}
              >
                {filterKey === 'todos' ? 'Todas las Llaves' : filterKey === 'pendiente' ? 'Pendientes' : 'Activadas'}
              </button>
            ))}
          </div>

          {/* Tokens Grid */}
          {tokensLoading ? (
            <SkeletonList count={4} />
          ) : filteredTokens.length === 0 ? (
            <EmptyState
              type="tokens"
              icon="key"
              title="No hay tokens en este estado"
              description="Puedes emitir un nuevo token de acceso en cualquier momento."
              actionLabel="Generar Token"
              onAction={createQuickToken}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTokens.map((tok) => (
                <div
                  key={tok.id}
                  className="p-5 rounded-3xl bg-surface/80 dark:bg-surface-container-low/70 border border-outline/15 shadow-sm hover:border-teal-500/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Código de Activación</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-mono font-extrabold tracking-widest text-teal-600 dark:text-teal-400">
                          {tok.token}
                        </span>
                        <button
                          onClick={() => handleCopyCode(tok.token)}
                          title="Copiar código"
                          className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                        >
                          {copiedToken === tok.token ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                        tok.status === 'activado'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      )}
                    >
                      {tok.status}
                    </span>
                  </div>

                  <div className="text-xs text-on-surface-variant font-medium">
                    {tok.patientName ? (
                      <p className="flex items-center gap-1.5 text-on-surface font-semibold">
                        <UserCheck className="size-3.5 text-emerald-600" />
                        Vinculado: {tok.patientName}
                      </p>
                    ) : (
                      <p className="text-amber-600 dark:text-amber-400">Disponible para ser asignado</p>
                    )}
                    <p className="text-[11px] text-outline mt-0.5">
                      Emitido el: {new Date(tok.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-outline/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLink(tok.token)}
                      className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-[11px] font-bold text-on-surface flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="size-3 text-teal-600" />
                      <span>Copiar Enlace</span>
                    </button>

                    <button
                      onClick={() => setEmailModalToken(tok)}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-[11px] font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="size-3" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Email Feature Modal */}
      {emailModalToken && (
        <EmailFeatureModal
          token={emailModalToken.token}
          patientName={emailModalToken.patientName || undefined}
          recipientName={emailModalToken.patientName || undefined}
          recipientEmail={emailModalToken.patientEmail || undefined}
          recipientPhone={emailModalToken.patientPhone || undefined}
          isOpen={true}
          onClose={() => setEmailModalToken(null)}
        />
      )}
    </div>
  );
}
export default PatientsPage;
