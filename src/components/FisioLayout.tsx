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
import { LanguageSelector } from './ui/LanguageSelector';

interface FisioLayoutProps {
  children: ReactNode;
}

export function FisioLayout({ children }: FisioLayoutProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const { isInstalled, triggerInstall } = useInstall();
  const navigate = useNavigate();
  const location = useLocation();

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

  const navGroups = [
    { id: 'clinical', label: t('navigation.clinicalGroup', 'Clínica'), items: navItems.slice(0, 3) },
    { id: 'follow-up', label: t('navigation.followUpGroup', 'Seguimiento'), items: navItems.slice(3, 5) },
    { id: 'system', label: t('navigation.systemGroup', 'Sistema'), items: navItems.slice(5) },
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

  // Mobile drawer: close on Escape and lock the page behind it
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

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
    toast.info(t('layout.sessionClosed'));
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
    if (!user?.id) { toast.info(t('layout.noActiveSession')); return; }
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

      toast.success(t('layout.videoCallStartedWith', { name: paciente.name }));
      setShowVideoModal(false);
    } catch {
      toast.error(t('layout.videoCallError'));
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
            'group relative sidebar-nav-item select-none',
            collapsed ? 'justify-center px-2 my-1' : 'gap-3 px-3 my-1',
            isActive
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant font-medium hover:bg-on-surface/[0.04] hover:text-on-surface'
          )
        }
        title={collapsed ? item.label : undefined}
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.div
                layoutId="active-fisio-nav-indicator"
                className="absolute inset-0 rounded-xl bg-primary/[0.08] border border-primary/20 -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {isActive && !collapsed && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" aria-hidden="true" />
            )}
            {isActive && collapsed && (
              <span className="absolute left-0.5 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary" aria-hidden="true" />
            )}
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-[1.04]',
                isActive
                  ? 'bg-primary text-on-primary shadow-sm shadow-primary/20'
                  : 'bg-on-surface/[0.04] text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
              )}
            >
              <IconComp size={18} />
            </div>
            {!collapsed && <span className="text-sm truncate flex-1">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const renderNavList = (collapsed: boolean, onNavigate?: () => void) => (
    <>
      {navGroups.map((group, index) => (
        <div
          key={group.id}
          className={cn(
            'space-y-0.5',
            index > 0 && 'mt-2 pt-2 border-t border-outline-variant/40'
          )}
        >
          {!collapsed && <p className="sidebar-group-label">{group.label}</p>}
          {collapsed && index > 0 && <div className="sidebar-rail-divider" />}
          {group.items.map((item) => renderNavItem(item, collapsed, onNavigate))}
        </div>
      ))}
    </>
  );

  const renderBottomActions = (collapsed: boolean, onNavAway?: () => void) => (
    <div className={cn('shrink-0 border-t border-outline-variant/50 p-3', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-3')}>
      {!isInstalled && (
        <button
          onClick={async () => {
            const result = await triggerInstall();
            if (result === 'unavailable') {
              toast.info(t('layout.installHint'));
            } else if (result === 'accepted') {
              toast.success(t('layout.appInstalled'));
            }
          }}
          className={cn(
            'rounded-xl text-on-surface hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            collapsed ? 'p-2 min-h-[44px] min-w-[44px] justify-center' : 'flex items-center gap-3 px-3 py-2 w-full',
          )}
          title={collapsed ? 'Instalar App' : undefined}
        >
          <Download size={18} className="shrink-0 text-primary" />
          {!collapsed && <span className="text-sm font-medium">{t('layout.installApp')}</span>}
        </button>
      )}
      {!collapsed && (
        <div className="rounded-2xl bg-surface-container/60 p-3 flex items-center gap-3 border border-outline-variant/50">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm overflow-hidden shrink-0 shadow-xs relative">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || 'F'
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface-container" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-on-surface truncate">{user?.full_name || 'Fisioterapeuta'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-2xs text-primary uppercase tracking-wider font-semibold">{t('layout.inConsultation')}</p>
            </div>
          </div>
        </div>
      )}
      <div className={cn(collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between px-1')}>
        <button
          onClick={toggleTheme}
          aria-label={t('common.changeTheme')}
          className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => { onNavAway?.(); setShowNotifications(true); }}
          aria-label={t('navigation.notifications')}
          className="relative p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-danger rounded-full text-white text-2xs font-bold flex items-center justify-center px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { onNavAway?.(); setShowLogout(true); }}
          aria-label={t('common.logout')}
          className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-danger/10 hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  const sidebarContent = (collapsed: boolean, opts?: { onNavigate?: () => void; showToggle?: boolean }) => (
    <>
      <div className="px-4 py-3 shrink-0 relative flex items-center border-b border-outline-variant/50" style={{ minHeight: 64 }}>
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0 pr-6">
            <img src="/logo.png" alt="FisioMirror" className="h-9 w-9 min-w-[36px] min-h-[36px] object-contain shrink-0 aspect-square" />
            <div className="flex flex-col min-w-0">
              <h1 className="text-base font-extrabold text-on-surface tracking-tight leading-tight whitespace-nowrap">FisioMirror</h1>
              <p className="text-2xs uppercase tracking-wider text-primary font-bold whitespace-nowrap">{t('navigation.clinicalEdition')}</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <img src="/logo.png" alt="FisioMirror" className="h-8 w-8 min-w-[32px] min-h-[32px] object-contain shrink-0 aspect-square" />
          </div>
        )}
        {opts?.showToggle && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? t('layout.expandMenu') : t('layout.collapseMenu')}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 rounded-full bg-primary text-on-primary items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform z-10"
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      <nav className="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden">
        {renderNavList(collapsed, opts?.onNavigate)}
      </nav>

      {renderBottomActions(collapsed, opts?.onNavigate)}
    </>
  );

  const desktopSidebar = (
    <aside
      className="sidebar-surface fixed left-0 top-0 h-[100dvh] flex flex-col z-30 text-on-surface transition-[width] duration-300 overflow-hidden"
      style={{ width: `${sidebarWidth}px` }}
    >
      {sidebarContent(sidebarCollapsed, { showToggle: true })}
    </aside>
  );

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden relative" style={{ ['--fisio-sidebar-w' as string]: `${sidebarWidth}px` }}>
      {/* Ambient Clinical Pastel Mesh Glow (Celeste, Menta y Lavanda suave) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-teal-400/10 dark:bg-teal-500/[0.05] blur-[110px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-info/10 dark:bg-info/[0.05] blur-[100px]" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-secondary/[0.08] dark:bg-secondary/[0.04] blur-[120px]" />
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
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 lg:hidden flex"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={t('layout.navMenu', 'Menú de navegación')}
              className="sidebar-surface h-full w-72 max-w-[85vw] flex flex-col text-on-surface rounded-r-3xl overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="FisioMirror" className="h-9 w-9 object-contain shrink-0" />
                  <div>
                    <h2 className="text-base font-extrabold text-on-surface leading-tight">FisioMirror</h2>
                    <p className="text-2xs uppercase tracking-wider text-primary font-bold">{t('navigation.clinicalEdition')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-on-surface/[0.06] transition-colors"
                  aria-label={t('navigation.closeMenu')}
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-3 overflow-y-auto">
                {renderNavList(false, () => setSidebarOpen(false))}
              </nav>
              {renderBottomActions(false, () => setSidebarOpen(false))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto lg:ml-[var(--fisio-sidebar-w)]" data-scroll-root>
        <header className="h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] glass-panel sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label={t('navigation.openMenu')}
              className="lg:hidden text-primary shrink-0 p-2.5 min-h-[44px] min-w-[44px] rounded-lg hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon name="menu" size={22} />
            </button>
            <BackButton />
            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center text-outline text-label-sm gap-2 min-w-0 truncate">
              <span onClick={() => navigate('/dashboard-fisio')} role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard-fisio'); }} className="hover:text-primary cursor-pointer shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{t('navigation.dashboard')}</span>
              <Icon name="chevron_right" size={14} className="shrink-0" />
              <span className="text-on-surface font-bold truncate">{currentCrumb}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className={`hidden md:inline-flex online-indicator is-${isOnline ? 'online' : 'offline'}`}>
              <span className="dot" />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
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
                <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl shadow-elevated overflow-hidden z-50">
                  {searchResults.patients.length > 0 && (
                    <div className="p-2">
                      <p className="text-2xs font-bold uppercase tracking-widest text-outline px-2 py-1">{t('navigation.patients', 'Pacientes')}</p>
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
                      <p className="text-2xs font-bold uppercase tracking-widest text-outline px-2 py-1">{t('navigation.exercises', 'Ejercicios')}</p>
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
              aria-label={t('layout.openChatbot')}
              title="Chatbot IA Physi"
            >
              <Bot size={20} className="text-primary" />
              <span className="hidden xl:inline text-xs font-semibold text-primary">
                {t('navigation.chatbotPhysi', 'Chatbot Physi')}
              </span>
            </button>
            {/* Idioma: sólo escritorio; en móvil vive en Preferencias. */}
            <div className="hidden lg:flex">
              <LanguageSelector compact />
            </div>
            {/* Tema: en escritorio está en la barra lateral; en móvil acá. */}
            <button
              onClick={toggleTheme}
              className="lg:hidden text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-colors active-scale size-11 inline-flex items-center justify-center rounded-full"
              aria-label={t('common.changeTheme')}
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
            </button>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-colors active-scale size-11 inline-flex items-center justify-center rounded-full"
              aria-label={t('common.notifications', 'Notificaciones') + ', ' + unreadCount + ' ' + t('common.unread', 'sin leer')}
            >
              <Icon name="notifications" size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-error rounded-full text-white text-2xs font-bold flex items-center justify-center px-1 badge-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main scrollable content with clean spacing (bottom padding leaves room for the FAB on mobile) */}
        <div className="p-3 sm:p-6 lg:p-8 pb-28 lg:pb-10 flex-1 bg-transparent">{children}</div>

        <footer className="pt-6 pb-6 px-4 sm:px-8 flex flex-col md:flex-row justify-between text-outline text-xs gap-4 border-t border-outline-variant/40">
          <span>&copy; 2026 FisioMirror S.A. · {t('navigation.clinicalEdition')}</span>
          <div className="flex gap-4">
            <button onClick={() => setLegalModal('consent')} className="text-outline hover:text-primary transition-colors">{t('layout.informedConsent')}</button>
            <button onClick={() => setLegalModal('terms')} className="text-outline hover:text-primary transition-colors">{t('layout.termsOfService')}</button>
            <button onClick={() => setLegalModal('privacy')} className="text-outline hover:text-primary transition-colors">{t('layout.dataPrivacy')}</button>
          </div>
        </footer>
      </main>

      {/* Menú de acciones flotante (FAB) para el fisioterapeuta */}
      <FloatingMenu
        items={quickActionItems}
        ariaLabel="Acciones del fisioterapeuta"
        className="fab-anchor fixed right-4 sm:right-6 z-40 bottom-[calc(1.25rem+env(safe-area-inset-bottom))]"
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
              className="glass-panel rounded-3xl p-6 max-w-sm w-full shadow-elevated max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Video size={22} />
                  </div>
                  <h3 className="fm-section-title">{t('layout.startVideoCall')}</h3>
                </div>
                <button
                  onClick={() => !videoStarting && setShowVideoModal(false)}
                  aria-label={t('common.close')}
                  className="text-outline hover:text-error transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
              <p className="text-on-surface-variant text-sm mb-4">{t('layout.selectVideoPatient')}</p>

              {videoLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : videoPatients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant text-sm mb-4">{t('layout.noPatientsLinked')}</p>
                  <button
                    onClick={() => { setShowVideoModal(false); navigate('/ocr-scanner'); }}
                    className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:scale-[0.98] transition-all min-h-[48px]"
                  >
                    {t('layout.loadNewPatient')}
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
              <h3 className="fm-section-title text-on-surface mb-2">{t('navigation.logoutConfirm', '¿Cerrar sesión?')}</h3>
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
