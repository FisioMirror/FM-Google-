import { useState, useEffect, useRef, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Dumbbell,
  Video,
  Sparkles,
  ScanLine,
  Phone,
  Bot,
  LayoutDashboard,
  Users,
  Activity,
  Wrench,
  UserCheck,
  Settings,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  Download,
  LogOut,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { Icon } from './ui/Icon';
import { BackButton } from './ui/BackButton';
import { FloatingMenu, type FloatingMenuItem } from './ui/FloatingMenu';
import { LegalModal, type LegalDocType } from './ui/LegalModal';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/ThemeContext';
import { useToast } from './ui/ToastProvider';
import { useInstall } from '../lib/installContext';
import { PhysiChatbot } from './ui/PhysiChatbot';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import MascotAnimation from './ui/MascotAnimation';
import { isDemoAccount } from '../lib/demoAuth';
import { UNIFIED_DEMO_PATIENTS } from '../data/unifiedDemoData';
import { NotificationDrawer } from './notifications/NotificationDrawer';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { initGlobalPresence, updatePresenceStatus } from '../lib/presenceService';
import { notifyVideoCall } from '../lib/notificationService';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage, normalizeLanguage, type SupportedLanguage } from '../i18n';

interface FisioLayoutProps {
  children: ReactNode;
}

export function FisioLayout({ children }: FisioLayoutProps) {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const { isInstalled, triggerInstall } = useInstall();
  const navigate = useNavigate();
  const location = useLocation();
  const activeLanguage = normalizeLanguage(i18n.language);

  const navItems = [
    { to: '/dashboard-fisio', label: t('navigation.dashboard', 'Inicio'), icon: LayoutDashboard, color: 'teal' },
    { to: '/patients', label: t('navigation.patients', 'Pacientes'), icon: Users, color: 'teal', badge: t('navigation.active', 'Activos') },
    { to: '/ocr-scanner', label: t('navigation.loadPatient', 'Cargar Paciente'), icon: UserPlus, color: 'teal' },
    { to: '/fisio-exercises', label: t('navigation.exercises', 'Ejercicios'), icon: Dumbbell, color: 'cyan' },
    { to: '/fisio-stats', label: t('navigation.stats', 'Estadísticas'), icon: Activity, color: 'teal' },
    { to: '/tools', label: t('navigation.tools', 'Herramientas'), icon: Wrench, color: 'amber' },
    { to: '/fisio-profile', label: t('navigation.profile', 'Perfil'), icon: UserCheck, color: 'teal' },
    { to: '/fisio-settings', label: t('navigation.settings', 'Configuración'), icon: Settings, color: 'slate' },
  ];

  const breadcrumbMap: Record<string, string> = {
    '/dashboard-fisio': t('navigation.dashboard', 'Dashboard'),
    '/patients': t('navigation.patients', 'Pacientes'),
    '/ocr-scanner': t('navigation.loadPatient', 'Cargar Paciente'),
    '/fisio-exercises': t('navigation.exercises', 'Ejercicios'),
    '/fisio-stats': t('navigation.stats', 'Estadísticas'),
    '/tools': t('navigation.tools', 'Herramientas'),
    '/fisio-profile': t('navigation.profile', 'Perfil'),
    '/fisio-settings': t('navigation.settings', 'Configuración'),
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('fisio-sidebar-collapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('fisio-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const sidebarWidth = sidebarCollapsed ? 64 : 256;
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ patients: Array<{ id: string; name: string; email: string; diagnostico: string }>; exercises: Array<{ id: string; name: string; group: string }> }>({ patients: [], exercises: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { unreadCount } = useRealtimeNotifications(user?.id);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Selector de paciente para iniciar videollamada desde el FAB
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalDocType | null>(null);
  const [videoPatients, setVideoPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStarting, setVideoStarting] = useState(false);
  const [physiGuideOpen, setPhysiGuideOpen] = useState(false);

  const currentCrumb = breadcrumbMap[location.pathname] || 'Dashboard';

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Inicializar Presencia Realtime en Supabase
  useEffect(() => {
    if (user?.id) {
      initGlobalPresence({
        id: user.id,
        role: user.role || 'fisioterapeuta',
        full_name: user.full_name || 'Fisioterapeuta',
      });
    }
  }, [user?.id, user?.role, user?.full_name]);

  const handleSignOut = () => {
    signOut();
    toast.info('Sesión cerrada');
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchResults.patients.length > 0) {
        navigate('/paciente/' + searchResults.patients[0].id);
      } else {
        navigate('/patients?q=' + encodeURIComponent(searchQuery.trim()));
      }
      setSearchQuery('');
      setShowSearchDropdown(false);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) { setSearchResults({ patients: [], exercises: [] }); return; }
    try {
      const isDemo = isDemoAccount(user);
      const safeQ = query.trim().replace(/[%,"']/g, '');
      let foundPatients: Array<{ id: string; name: string; email: string; diagnostico: string }> = [];

      // 1. Search Supabase profiles and exercises safely
      const patPromise = supabase
        .from('profiles')
        .select('id, full_name, email, diagnostico, documento_identidad, patologia')
        .or(`full_name.ilike."%${safeQ}%",email.ilike."%${safeQ}%",diagnostico.ilike."%${safeQ}%",patologia.ilike."%${safeQ}%"`)
        .limit(8);

      const exPromise = supabase
        .from('exercises')
        .select('id, nombre, grupo_muscular')
        .or(`nombre.ilike."%${safeQ}%",grupo_muscular.ilike."%${safeQ}%"`)
        .limit(5);

      const [patSettled, exSettled] = await Promise.allSettled([patPromise, exPromise]);

      if (patSettled.status === 'fulfilled' && patSettled.value.data) {
        foundPatients = (patSettled.value.data as Array<any>).map((p) => ({
          id: p.id,
          name: p.full_name || p.name || 'Paciente',
          email: p.email?.includes('@fisiomirror.paciente') ? '' : (p.email || ''),
          diagnostico: p.diagnostico || p.patologia || '',
        }));
      }

      const foundExercises: Array<{ id: string; name: string; group: string }> = [];
      if (exSettled.status === 'fulfilled' && exSettled.value.data) {
        (exSettled.value.data as Array<any>).forEach((e) => {
          foundExercises.push({
            id: e.id,
            name: e.nombre || e.name || 'Ejercicio',
            group: e.grupo_muscular || e.muscle_group || '',
          });
        });
      }

      // 2. Only add demo patients if logged in as a demo user
      if (isDemo) {
        const q = query.toLowerCase();
        const demoMatches = UNIFIED_DEMO_PATIENTS.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.diagnosis && p.diagnosis.toLowerCase().includes(q))
        ).map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          diagnostico: p.diagnosis || '',
        }));

        for (const dm of demoMatches) {
          if (!foundPatients.some(fp => fp.id === dm.id || fp.name.toLowerCase() === dm.name.toLowerCase())) {
            foundPatients.push(dm);
          }
        }
      }

      setSearchResults({
        patients: foundPatients,
        exercises: foundExercises,
      });
    } catch { /* keep empty */ }
  };

  const onSearchChange = (val: string) => {
    setSearchQuery(val);
    setShowSearchDropdown(true);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => performSearch(val), 300);
  };

  // --- FAB: Videollamada con paciente ---
  const abrirSelectorPaciente = async () => {
    if (!user?.id) { toast.info('No hay sesión activa'); return; }
    setShowVideoModal(true);
    setVideoLoading(true);
    try {
      const { data: links } = await supabase
        .from('pacientes_terapeutas')
        .select('paciente_id')
        .eq('terapeuta_id', user.id);
      if (!links || links.length === 0) {
        setVideoPatients([]);
        setVideoLoading(false);
        return;
      }
      const ids = links.map((l) => l.paciente_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ids)
        .order('full_name', { ascending: true });
      setVideoPatients((profiles || []).map((p: any) => ({ id: p.id, name: p.full_name || 'Paciente' })));
    } catch {
      setVideoPatients([]);
    } finally {
      setVideoLoading(false);
    }
  };

  const iniciarVideollamadaPaciente = async (paciente: { id: string; name: string }) => {
    if (!user?.id) return;
    setVideoStarting(true);
    try {
      const jitsiUrl = `https://meet.jit.si/FisioMirror-${user.id}-${paciente.id}`;
      window.open(jitsiUrl, '_blank');
      updatePresenceStatus('videoconsulta', window.location.pathname);

      // Notificar al paciente con la función centralizada y garantizada
      await notifyVideoCall({
        targetUserId: paciente.id,
        callerName: user.full_name || 'Tu fisioterapeuta',
        meetLink: jitsiUrl,
      });

      // Intento complementario de Edge Function si existe
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            fisio_id: paciente.id,
            type: 'videollamada',
            title: 'Videollamada entrante',
            message: `${user.full_name || 'Tu fisioterapeuta'} quiere iniciar una videollamada`,
            link: jitsiUrl,
          }),
        });
      } catch {
        // Edge function opcional
      }

      toast.success(`Videollamada iniciada con ${paciente.name}. Notificación enviada en tiempo real.`);
      setShowVideoModal(false);
    } catch {
      toast.error('No se pudo iniciar la videollamada');
    } finally {
      setVideoStarting(false);
    }
  };

  const quickActionItems: FloatingMenuItem[] = [
    { label: 'Nuevo paciente', icon: <UserPlus size={20} className="text-primary" />, onClick: () => navigate('/ocr-scanner') },
    { label: 'Crear rutina', icon: <Dumbbell size={20} className="text-primary" />, onClick: () => navigate('/fisio-exercises') },
    { label: 'Videollamada', icon: <Video size={20} className="text-primary" />, onClick: abrirSelectorPaciente },
    { label: 'Herramientas IA', icon: <Sparkles size={20} className="text-primary" />, onClick: () => navigate('/tools') },
    { label: 'Escanear receta', icon: <ScanLine size={20} className="text-primary" />, onClick: () => navigate('/ocr-scanner') },
  ];

  const renderNavItem = (
    item: { to: string; label: string; icon: React.ElementType; color: string; badge?: string },
    collapsed: boolean,
    onNavigate?: () => void
  ) => {
    const IconComp = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center rounded-xl transition-all duration-200 select-none',
            collapsed ? 'justify-center p-2.5 my-1' : 'gap-3 px-3.5 py-2.5 my-0.5',
            isActive
              ? 'text-teal-700 dark:text-teal-300 font-bold'
              : 'text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white'
          )
        }
        title={collapsed ? item.label : undefined}
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.div
                layoutId="active-fisio-nav-indicator"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-transparent border border-teal-400/30 dark:border-teal-500/30 -z-10 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-teal-50 dark:group-hover:bg-slate-700/80 group-hover:text-teal-600 dark:group-hover:text-teal-400'
              )}
            >
              <IconComp size={18} />
            </div>
            {!collapsed && <span className="text-sm truncate flex-1">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const renderBottomActions = (collapsed: boolean, onNavAway?: () => void) => (
    <div className={cn('shrink-0 border-t border-sky-100/60 dark:border-slate-800 p-3', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-3')}>
      {!isInstalled && (
        <button
          onClick={async () => {
            const result = await triggerInstall();
            if (result === 'unavailable') {
              toast.info('Para instalar la app, usa el menú de tu navegador: Agregar a pantalla de inicio');
            } else if (result === 'accepted') {
              toast.success('App instalada correctamente');
            }
          }}
          className={cn(
            'rounded-xl text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-300 transition-colors',
            collapsed ? 'p-2' : 'flex items-center gap-3 px-3 py-2 w-full',
          )}
          title={collapsed ? 'Instalar App' : undefined}
        >
          <Download size={18} className="shrink-0 text-sky-600 dark:text-sky-400" />
          {!collapsed && <span className="text-sm font-medium">Instalar App</span>}
        </button>
      )}
      {!collapsed && (
        <div className="rounded-2xl bg-sky-50/80 dark:bg-slate-800/80 p-3 flex items-center gap-3 border border-sky-100/50 dark:border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 shadow-xs relative">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || 'F'
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{user?.full_name || 'Fisioterapeuta'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-sky-600 dark:text-sky-400 uppercase tracking-wider font-semibold">En consulta</p>
            </div>
          </div>
        </div>
      )}
      <div className={cn(collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between px-1')}>
        <button
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => { onNavAway?.(); setShowNotifications(true); }}
          aria-label="Notificaciones"
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { onNavAway?.(); setShowLogout(true); }}
          aria-label="Cerrar sesión"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  const sidebarContent = (collapsed: boolean, opts?: { onNavigate?: () => void; showToggle?: boolean }) => (
    <>
      <div className="px-4 py-3 shrink-0 relative flex items-center border-b border-sky-100/60 dark:border-slate-800/80" style={{ minHeight: 64 }}>
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0 pr-6">
            <div className="flex flex-col min-w-0">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight whitespace-nowrap">FisioMirror</h1>
              <p className="text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold whitespace-nowrap">Edición Clínica</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <span className="text-sm font-extrabold tracking-tight text-sky-600 dark:text-sky-400 select-none">FM</span>
          </div>
        )}
        {opts?.showToggle && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 rounded-full bg-sky-500 text-white items-center justify-center text-xs shadow-md hover:scale-110 transition-transform z-10"
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => renderNavItem(item, collapsed, opts?.onNavigate))}
      </nav>

      {renderBottomActions(collapsed, opts?.onNavigate)}
    </>
  );

  const desktopSidebar = (
    <aside
      data-sidebar="left"
      className="fixed left-0 top-0 h-screen flex flex-col z-30 bg-gradient-to-b from-white/90 via-sky-50/30 to-surface/90 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border-r border-sky-200/50 dark:border-slate-800 text-slate-900 dark:text-slate-200 transition-all duration-300 overflow-hidden backdrop-blur-xl"
      style={{ width: `${sidebarWidth}px` }}
    >
      {sidebarContent(sidebarCollapsed, { showToggle: true })}
    </aside>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden relative" style={{ ['--fisio-sidebar-w' as string]: `${sidebarWidth}px`, ['--app-sidebar-w' as string]: `${sidebarWidth}px` }}>
      {/* Ambient Clinical Pastel Mesh Glow (Celeste, Menta y Lavanda suave) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-[110px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-[100px]" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-indigo-400/8 dark:bg-indigo-500/8 blur-[120px]" />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block relative z-30">{desktopSidebar}</div>

      {/* Mobile drawer with slide-over */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 lg:hidden flex"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-72 max-w-[85vw] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-sky-200/50 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-r-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-sky-100/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">FisioMirror</h2>
                    <p className="text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold">Edición Clínica</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => renderNavItem(item, false, () => setSidebarOpen(false)))}
              </nav>
              {renderBottomActions(false, () => setSidebarOpen(false))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto lg:ml-[var(--fisio-sidebar-w)]" data-scroll-root>
        <header className="h-16 w-full min-w-0 max-w-full glass-panel sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden text-primary shrink-0 p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <Icon name="menu" size={22} />
            </button>
            <BackButton />
            {/* Mobile title */}
            <div className="flex items-center gap-2 lg:hidden min-w-0 flex-1">
              <span className="text-on-surface font-bold text-sm truncate min-w-0">{currentCrumb}</span>
            </div>
            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center text-outline text-label-sm gap-2 min-w-0 truncate">
              <span onClick={() => navigate('/dashboard-fisio')} className="hover:text-primary cursor-pointer shrink-0">{t('navigation.dashboard', 'Inicio')}</span>
              <Icon name="chevron_right" size={14} className="shrink-0" />
              <span className="text-on-surface font-bold truncate">{currentCrumb}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <div className={`hidden md:inline-flex online-indicator is-${isOnline ? 'online' : 'offline'}`}>
              <span className="dot" />
              <span>{isOnline ? t('common.online', 'En línea') : t('common.offline', 'Sin conexión')}</span>
            </div>
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-surface-variant/30 rounded-full pl-10 pr-4 py-2 w-72 relative">
              <Icon name="search" size={18} className="absolute left-3 text-outline" />
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                className="bg-transparent border-none focus:ring-0 text-label-sm w-full outline-none placeholder:text-outline"
                placeholder={t('navigation.searchPlaceholder', 'Buscar pacientes o ejercicios... (⌘K)')}
              />
              {showSearchDropdown && (searchResults.patients.length > 0 || searchResults.exercises.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl shadow-2xl overflow-hidden z-50">
                  {searchResults.patients.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-outline px-2 py-1">{t('navigation.patients', 'Pacientes')}</p>
                      {searchResults.patients.map((p) => (
                        <button key={p.id} type="button" onClick={() => { navigate('/paciente/' + p.id); setSearchQuery(''); setShowSearchDropdown(false); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-2">
                          <Icon name="person" size={16} className="text-primary" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-on-surface truncate">{p.name}</p>
                            <p className="text-xs text-outline truncate">{p.email || p.diagnostico || 'Sin email'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.exercises.length > 0 && (
                    <div className="p-2 border-t divider-teal">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-outline px-2 py-1">{t('navigation.exercises', 'Ejercicios')}</p>
                      {searchResults.exercises.map((ex) => (
                        <button key={ex.id} type="button" onClick={() => { navigate('/fisio-exercises'); setSearchQuery(''); setShowSearchDropdown(false); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-2">
                          <Icon name="fitness_center" size={16} className="text-primary" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-on-surface truncate">{ex.name}</p>
                            <p className="text-xs text-outline truncate">{ex.group}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
            <button
              onClick={() => setPhysiGuideOpen(true)}
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors active-scale flex items-center gap-1.5"
              aria-label="Abrir Chatbot IA Physi"
              title="Chatbot IA Physi"
            >
              <Bot size={20} className="text-primary" />
              <span className="hidden xl:inline text-xs font-semibold text-primary">
                {t('navigation.chatbotPhysi', 'Chatbot Physi')}
              </span>
            </button>
            <select
              value={activeLanguage}
              onChange={(e) => changeAppLanguage(e.target.value as SupportedLanguage)}
              aria-label={t('common.changeLanguage', 'Cambiar idioma')}
              title={t('common.changeLanguage', 'Cambiar idioma')}
              className="shrink-0 w-10 appearance-none cursor-pointer rounded-lg border border-primary/30 bg-surface/80 px-0 py-1 text-center text-[11px] font-bold uppercase tracking-wider text-primary outline-none transition-colors hover:border-primary/60 focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/80"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
              <option value="pt">PT</option>
            </select>
            <button
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-primary transition-colors active-scale"
              aria-label={t('common.changeTheme', 'Cambiar tema')}
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
            </button>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative text-on-surface-variant hover:text-primary transition-colors active-scale"
              aria-label={`Notificaciones, ${unreadCount} sin leer`}
            >
              <Icon name="notifications" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 badge-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowLogout(true)}
              className="text-on-surface-variant hover:text-error transition-colors active-scale"
              aria-label="Cerrar sesión"
            >
              <Icon name="logout" size={20} />
            </button>
          </div>
        </header>

        {/* Main scrollable content with clean spacing */}
        <div className="p-4 sm:p-6 lg:p-8 pb-8 flex-1 bg-teal-50/20 dark:bg-slate-950/20">{children}</div>

        <footer className="pt-6 pb-6 px-4 sm:px-8 flex flex-col md:flex-row justify-between text-outline text-xs gap-4 border-t border-white/10">
          <span>&copy; 2025 FisioMirror S.A. | Edición Clínica Premium v2.0.42</span>
          <div className="flex gap-4">
            <button onClick={() => setLegalModal('consent')} className="text-outline hover:text-primary transition-colors">Consentimiento Informado</button>
            <button onClick={() => setLegalModal('terms')} className="text-outline hover:text-primary transition-colors">Términos de Servicio</button>
            <button onClick={() => setLegalModal('privacy')} className="text-outline hover:text-primary transition-colors">Privacidad de Datos</button>
          </div>
        </footer>
      </main>

      {/* Menú de acciones flotante (FAB) para el fisioterapeuta */}
      <FloatingMenu
        items={quickActionItems}
        ariaLabel="Acciones del fisioterapeuta"
        className="fab-anchor fixed bottom-6 right-6 z-40"
      />

      {/* Modal: selector de paciente para iniciar videollamada */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={() => !videoStarting && setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel rounded-3xl p-6 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Video size={22} />
                  </div>
                  <h3 className="font-title-md text-title-md text-on-surface">Iniciar videollamada</h3>
                </div>
                <button
                  onClick={() => !videoStarting && setShowVideoModal(false)}
                  aria-label="Cerrar"
                  className="text-outline hover:text-error transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
              <p className="text-on-surface-variant text-sm mb-4">Selecciona el paciente con quien quieres iniciar la videollamada.</p>

              {videoLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : videoPatients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant text-sm mb-4">No tienes pacientes vinculados todavía.</p>
                  <button
                    onClick={() => { setShowVideoModal(false); navigate('/ocr-scanner'); }}
                    className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:scale-[0.98] transition-all min-h-[48px]"
                  >
                    Cargar nuevo paciente
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {videoPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => iniciarVideollamadaPaciente(p)}
                      disabled={videoStarting}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 transition-colors text-left disabled:opacity-50 min-h-[52px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 min-w-0 font-medium text-sm text-on-surface truncate">{p.name}</span>
                      <Phone size={18} className="text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout modal */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowLogout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel rounded-3xl p-8 max-w-sm w-full mx-4 text-center max-h-[90vh] overflow-y-auto"
            >
              <MascotAnimation type="goodbye" size="md" className="bg-error/10 mx-auto mb-4" />
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">{t('navigation.logoutConfirm', '¿Cerrar sesión?')}</h3>
              <p className="text-on-surface-variant text-sm mb-6">{t('navigation.logoutConfirmDesc', 'Tendrás que volver a iniciar sesión para acceder a tu panel.')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 py-3 rounded-xl bg-surface-variant/40 text-on-surface-variant font-bold hover:bg-surface-variant/60 transition-all"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-3 rounded-xl bg-error text-on-error font-bold hover:scale-[0.98] transition-all"
                >
                  {t('common.logout', 'Cerrar sesión')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centro de Notificaciones Clínico Avanzado */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userId={user?.id}
      />

      <LegalModal isOpen={legalModal !== null} onClose={() => setLegalModal(null)} type={legalModal ?? 'privacy'} />

      <PhysiChatbot isOpen={physiGuideOpen} onClose={() => setPhysiGuideOpen(false)} />
    </div>
  );
}
