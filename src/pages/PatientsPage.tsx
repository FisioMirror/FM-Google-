import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { SpotlightCard } from '../components/ui/SpotlightCard';
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
  Eye,
} from 'lucide-react';
import { DrawerClinicalDemo } from '../components/ui/Drawer';
import { useRealtimePresence } from '../lib/presenceService';
import { staggerContainer, staggerItem, springTactile } from '../lib/motionVariants';
import { MobileBottomSheet } from '../components/ui/MobileBottomSheet';
import { JointDetailPopover } from '../components/ui/JointDetailPopover';
import { TherapistSidebarMini } from '../components/ui/NavigationDocksSuite';

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
  { id: 'activos', labelKey: 'patients.filterActive' },
  { id: 'revision', labelKey: 'patients.filterReview' },
  { id: 'recuperacion', labelKey: 'patients.filterRecovery' },
];

export function PatientsPage() {
  const { t } = useTranslation();
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
  const [previewPatient, setPreviewPatient] = useState<PatientCard | null>(null);

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
          ? t('dashboard.statusDischarge')
          : p.status === 'Requiere Revisión'
          ? 'Requiere Revisión'
          : p.progress >= 75
          ? t('patients.improving')
          : t('patients.stable'),
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
        name: p.full_name || t('common.patientDefault'),
        fmId: `FM-${p.id.slice(0, 4).toUpperCase()}`,
        status: t('patients.onTreatment'),
        statusColor: 'blue',
        recoveryProgress: 50,
        lastSession: t('patients.recent'),
        condition: p.diagnostico || p.patologia || t('patients.inEvaluation'),
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
        patientName: t.paciente_id ? (patientMap[t.paciente_id]?.name ?? t('patients.linkedPatient')) : null,
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
      toast.error(t('patients.tokenGenError'));
    }
  };

  const handleCopyCode = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopiedToken(tok);
    toast.success(t('patients.codeCopied', { code: tok }));
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyLink = (tok: string) => {
    const link = `${window.location.origin}/registro-paciente?token=${encodeURIComponent(tok)}`;
    navigator.clipboard.writeText(link);
    toast.success(t('patients.linkCopied'));
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
    <div className="fm-page pb-12">
      {/* Header Section with Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            <Users className="size-4" />
            <span>{t('patients.headerChip')}</span>
          </div>
          <h1 className="fm-title text-on-surface">
            {t('patients.pageTitle')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('patients.pageSubtitle')}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <DrawerClinicalDemo />
          <button
            onClick={createQuickToken}
            className="px-4 py-2.5 rounded-2xl bg-surface/80 dark:bg-surface-container-low/70 border border-outline/15 text-on-surface hover:border-teal-500/40 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Key className="size-4 text-teal-600 dark:text-teal-400" />
            <span>{t('patients.quickToken')}</span>
          </button>
          <button
            onClick={() => navigate('/ocr-scanner')}
            className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-sm shadow-teal-700/20 flex items-center gap-2"
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between group cursor-default transition-all shadow-sm hover:shadow-card bg-gradient-to-br from-teal-50/80 via-surface/90 to-emerald-50/40 dark:from-teal-950/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-teal-200/60 dark:border-teal-500/30"
        >
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold border border-teal-500/25">
              <Users className="size-4 sm:size-5" />
            </div>
            <span className="text-xs sm:text-xs text-teal-800 dark:text-teal-200 font-bold">{t('patients.totalPatients')}</span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl sm:text-3xl font-black text-on-surface tabular-nums tracking-tight">{stats.total}</p>
            {onlineCount > 0 && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 text-2xs sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xs:inline">{onlineCount} en vivo</span>
                <span className="xs:hidden">{onlineCount}</span>
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between group cursor-default transition-all shadow-sm hover:shadow-card bg-gradient-to-br from-sky-50/75 via-surface/90 to-sky-50/40 dark:from-sky-950/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-sky-200/60 dark:border-sky-500/30"
        >
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold border border-sky-500/25">
              <CheckCircle2 className="size-4 sm:size-5" />
            </div>
            <span className="text-xs sm:text-xs text-sky-800 dark:text-sky-200 font-bold">{t('patients.activeTreatment')}</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-300 tabular-nums tracking-tight">{stats.active}</p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between group cursor-default transition-all shadow-sm hover:shadow-card bg-gradient-to-br from-amber-50/75 via-surface/90 to-amber-50/30 dark:from-amber-950/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-amber-200/50 dark:border-amber-500/25"
        >
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold border border-amber-500/25">
              <AlertTriangle className="size-4 sm:size-5" />
            </div>
            <span className="text-xs sm:text-xs text-amber-800 dark:text-amber-200 font-bold">{t('patients.needAttention')}</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums tracking-tight">{stats.needReview}</p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          whileHover={{ y: -3, scale: 1.015, transition: springTactile }}
          className="p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between group cursor-default transition-all shadow-sm hover:shadow-card bg-gradient-to-br from-indigo-50/70 via-surface/90 to-purple-50/40 dark:from-indigo-950/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-indigo-200/50 dark:border-indigo-500/25"
        >
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold border border-indigo-500/25">
              <Key className="size-4 sm:size-5" />
            </div>
            <span className="text-xs sm:text-xs text-indigo-800 dark:text-indigo-200 font-bold">{t('dashboard.pendingReports')}</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 tabular-nums tracking-tight">{stats.pendingTokCount}</p>
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
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <Users className="size-4" />
          <span>{t('patients.clinicalDirectory', { n: patients.length })}</span>
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={cn(
            'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2',
            activeTab === 'tokens'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <Key className="size-4" />
          <span>{t('patients.tokensTab', { n: tokens.length })}</span>
        </button>
      </div>

      {/* ─── TAB 1: PACIENTES ─── */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2.5 rounded-3xl bg-surface/60 dark:bg-surface-container-low/40 border border-outline/15">
            <div className="relative flex-1">
              <Search className="size-4 text-outline absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('patients.searchNew')}
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
                        ? 'bg-primary text-on-primary border-teal-600 shadow-sm'
                        : 'bg-surface-container/70 border-outline/15 text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    <span>{t(f.label)}</span>
                    <span
                      className={cn(
                        'text-2xs px-1.5 py-0.2 rounded-full font-bold',
                        isSelected ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-outline'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid / List Mode & Therapist Mini Toolbar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container/80 shrink-0">
                <button
                  onClick={() => setViewMode('cards')}
                  aria-label={t('patients.viewGrid')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === 'cards' ? 'bg-surface text-teal-600 shadow-xs font-bold' : 'text-outline hover:text-on-surface'
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label={t('patients.viewList')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === 'list' ? 'bg-surface text-teal-600 shadow-xs font-bold' : 'text-outline hover:text-on-surface'
                  )}
                >
                  <List className="size-4" />
                </button>
              </div>

              <div className="hidden sm:flex items-center">
                <TherapistSidebarMini
                  activeId="users"
                  onSelect={(id) => {
                    if (id === 'grid') navigate('/dashboard-fisio');
                    if (id === 'users') setActiveTab('patients');
                    if (id === 'video') navigate('/tools');
                  }}
                />
              </div>
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
              description={t('patients.emptyPatientsDesc')}
              actionLabel={t('patients.loadNewPatient')}
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
                    className="h-full"
                  >
                    <SpotlightCard className="p-6 rounded-2xl group cursor-pointer transition-all duration-300 relative flex flex-col justify-between h-full shadow-sm hover:shadow-elevated bg-gradient-to-br from-surface/95 via-surface to-sky-50/30 dark:from-surface-container/85 dark:via-surface-container/70 dark:to-teal-950/20 border border-outline-variant/25 dark:border-white/10 hover:border-teal-500/35">
                    <div>
                      {/* Top Header: Avatar/Badge + Name & ID + Status Tag */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative">
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-base border-2 shadow-sm shrink-0",
                              isAlert 
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800" 
                                : isGood
                                ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200/70 dark:border-teal-500/30 ring-2 ring-teal-400/20"
                                : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-500/30 ring-2 ring-sky-400/20"
                            )}>
                              {initials || 'FM'}
                            </div>
                            {isAlert ? (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-2xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-xs">
                                !
                              </div>
                            ) : presence ? (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse" />
                            ) : null}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-on-surface group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                              {p.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs font-mono text-outline uppercase tracking-wider font-semibold">
                                {p.fmId || `FM-${p.id.slice(0, 4).toUpperCase()}`}
                              </p>
                              {presence && (
                                <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {presence.status === 'en_ejercicio' ? 'En ejercicio' : 'En línea'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className={cn(
                          "px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider flex items-center gap-1.5 shrink-0",
                          isAlert
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200"
                            : isGood
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200"
                            : "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isAlert ? "bg-rose-500" : isGood ? "bg-emerald-500 animate-pulse" : "bg-teal-600"
                          )} />
                          <span>{p.status}</span>
                        </span>
                      </div>

                      {/* Recovery Progress Bar with Shimmer */}
                      <div className="space-y-2 mb-5">
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-on-surface-variant font-semibold">{t('patients.recoveryProgress')}</span>
                          <span className={cn(
                            "font-extrabold text-sm",
                            isAlert ? "text-rose-600 dark:text-rose-400" : "text-teal-700 dark:text-teal-300"
                          )}>
                            {p.recoveryProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/80 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden relative">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300 relative overflow-hidden",
                              isAlert ? "bg-rose-500" : p.recoveryProgress >= 75 ? "bg-emerald-500" : "bg-teal-600"
                            )}
                            style={{ width: `${Math.max(6, p.recoveryProgress)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer-bar" />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-outline font-medium">
                          <span>{p.sessionCount || 1} sesiones completadas</span>
                          <span>{t('dashboard.prescribedPlan')}</span>
                        </div>
                      </div>

                      {/* 2-Column Clinical Metadata Grid */}
                      <div className="grid grid-cols-2 gap-3 py-3.5 border-y border-outline-variant/15 text-xs mb-4">
                        <div>
                          <p className="text-2xs uppercase font-bold text-outline tracking-wider mb-1">{t('patients.lastSession')}</p>
                          <p className="font-semibold text-on-surface flex items-center gap-1.5 truncate">
                            <Calendar className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span>{p.lastSession || 'Reciente'}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-2xs uppercase font-bold text-outline tracking-wider mb-1">{t('common.diagnosis')}</p>
                          <p className="font-semibold text-on-surface line-clamp-1">
                            {p.condition || 'En evaluación'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Area with Quick Preview & Full Dossier */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewPatient(p);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-slate-700/80 text-on-surface hover:text-teal-700 dark:hover:text-teal-300 font-semibold transition-all text-xs flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60"
                        title="Abrir vista previa rápida en modal o bottom sheet"
                      >
                        <Eye className="size-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{t('patients.quickCard')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/paciente/${p.id}`)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>{t('patients.record')}</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-outline/15 bg-surface/80 dark:bg-surface-container-low/70 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-high/60 text-outline font-bold uppercase tracking-wider border-b border-outline/15">
                  <tr>
                    <th className="p-4">{t('common.patientDefault')}</th>
                    <th className="p-4">{t('common.diagnosis')}</th>
                    <th className="p-4">{t('patients.progress')}</th>
                    <th className="p-4">{t('common.status')}</th>
                    <th className="p-4 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/15">
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
                              "inline-flex items-center gap-1 text-2xs font-bold px-1.5 py-0.2 rounded-full border",
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
                            'text-2xs font-bold px-2 py-0.5 rounded-full',
                            p.statusColor === 'red'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-teal-500/10 text-teal-600'
                          )}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-teal-600 font-bold hover:underline">{t('dashboard.viewRecord')}</span>
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
              <div className="size-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Key className="size-5" />
              </div>
              <div>
                <h3 className="fm-section-title text-on-surface">{t('patients.activationKeys')}</h3>
                <p className="text-xs text-on-surface-variant">
                  Permiten a un paciente activar su cuenta y vincular su expediente clínico directamente a tu consulta.
                </p>
              </div>
            </div>

            <button
              onClick={createQuickToken}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus className="size-4" />
              <span>{t('patients.emitNewKey')}</span>
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
                    ? 'bg-primary text-on-primary border-teal-600 shadow-xs'
                    : 'bg-surface/70 border-outline/15 text-on-surface-variant hover:bg-surface-container'
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
              title={t('patients.noTokensState')}
              description={t('patients.emptyTokensDesc')}
              actionLabel={t('patients.genToken')}
              onAction={createQuickToken}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTokens.map((tok) => (
                <div
                  key={tok.id}
                  className="p-5 rounded-2xl ios-glass-heavy refraction-border shadow-sm hover:shadow-card transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-2xs text-outline uppercase font-bold tracking-wider">{t('patients.activationCode')}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-mono font-extrabold tracking-widest text-teal-700 dark:text-teal-300">
                          {tok.token}
                        </span>
                        <button
                          onClick={() => handleCopyCode(tok.token)}
                          aria-label={t('patients.copyCode')} title={t('patients.copyCode')}
                          className="p-1.5 rounded-lg hover:bg-teal-500/10 text-teal-700 dark:text-teal-300 transition-colors"
                        >
                          {copiedToken === tok.token ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-2xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                        tok.status === 'activado'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      )}
                    >
                      {tok.status}
                    </span>
                  </div>

                  <div className="text-xs text-on-surface-variant font-medium">
                    {tok.patientName ? (
                      <p className="flex items-center gap-1.5 text-on-surface font-semibold">
                        <UserCheck className="size-3.5 text-emerald-600" />
                        {t('patients.linked')} {tok.patientName}
                      </p>
                    ) : (
                      <p className="text-amber-600 dark:text-amber-400">{t('patients.availableToAssign')}</p>
                    )}
                    <p className="text-xs text-outline mt-0.5">
                      {t('patients.issuedOn')} {new Date(tok.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-outline/15 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLink(tok.token)}
                      className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="size-3 text-teal-600" />
                      <span>{t('patients.copyLink')}</span>
                    </button>

                    <button
                      onClick={() => setEmailModalToken(tok)}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="size-3" />
                      <span>{t('common.send')}</span>
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

      {/* MobileBottomSheet: Ficha Rápida del Paciente */}
      <MobileBottomSheet
        isOpen={previewPatient !== null}
        onClose={() => setPreviewPatient(null)}
        title={previewPatient?.name || 'Ficha del Paciente'}
        subtitle={previewPatient ? `${previewPatient.fmId || 'FM-PAC'} • ${previewPatient.condition}` : ''}
        icon={<Users className="size-5 text-teal-600 dark:text-teal-400" />}
        variant="pastel-mint"
        footerActions={
          previewPatient && (
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  const id = previewPatient.id;
                  setPreviewPatient(null);
                  navigate(`/paciente/${id}`);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>{t('patients.openFullRecord')}</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          )
        }
      >
        {previewPatient && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-teal-50/70 dark:bg-slate-800/80 border border-teal-100/60 dark:border-slate-700">
              <div>
                <span className="text-2xs uppercase font-bold text-outline">{t('patients.clinicalStatus')}</span>
                <p className="font-bold text-teal-700 dark:text-teal-300 mt-0.5">{previewPatient.status}</p>
              </div>
              <div>
                <span className="text-2xs uppercase font-bold text-outline">{t('patients.globalProgress')}</span>
                <p className="font-bold text-on-surface dark:text-white mt-0.5">{previewPatient.recoveryProgress}%</p>
              </div>
              <div>
                <span className="text-2xs uppercase font-bold text-outline">{t('patients.sessionsDone')}</span>
                <p className="font-semibold text-on-surface mt-0.5">{previewPatient.sessionCount} sesiones</p>
              </div>
              <div>
                <span className="text-2xs uppercase font-bold text-outline">{t('patients.lastActivity')}</span>
                <p className="font-semibold text-on-surface mt-0.5">{previewPatient.lastSession}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface dark:bg-slate-800/50 border border-outline-variant/30 space-y-2">
              <span className="text-2xs uppercase font-bold text-outline block">{t('patients.diagnosisPathology')}</span>
              <p className="font-semibold text-on-surface">{previewPatient.condition}</p>
              {previewPatient.patologia && (
                <p className="text-xs text-on-surface-variant font-medium">{t('patients.pathology')}: {previewPatient.patologia}</p>
              )}
            </div>

            {/* Inspección biomecánica rápida */}
            <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30">
              <span className="text-2xs uppercase font-bold text-sky-700 dark:text-sky-300 block mb-2">{t('patients.quickBiomech')}</span>
              <JointDetailPopover
                metrics={{
                  jointName: previewPatient.condition.includes('Rodilla') ? 'Rodilla Afectada (Extensión)' : 'Articulación en Tratamiento',
                  currentRom: Math.round(90 + previewPatient.recoveryProgress * 0.45),
                  maxHistoricalRom: 135,
                  angularVelocity: 38,
                  asymmetryPercentage: Math.max(3, Math.round(25 - previewPatient.recoveryProgress * 0.2)),
                  status: previewPatient.recoveryProgress > 70 ? 'normal' : 'warning',
                }}
                triggerLabel="Examinar Rango de Movimiento (ROM)"
              />
            </div>
          </div>
        )}
      </MobileBottomSheet>
    </div>
  );
}
 PatientsPage;
