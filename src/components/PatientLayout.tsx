import { type ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Phone,
  MessageCircle,
  Mail,
  Bot,
  Home,
  Dumbbell,
  Activity,
  User,
  Settings,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  Bell,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Icon } from './ui/Icon';
import { BackButton } from './ui/BackButton';

import { FloatingMenu, type FloatingMenuItem } from './ui/FloatingMenu';
import { CurvedMobileDock } from './ui/NavigationDocksSuite';
import { PhysiChatbot } from './ui/PhysiChatbot';
import { LegalModal, type LegalDocType } from './ui/LegalModal';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/ThemeContext';
import { useToast } from './ui/ToastProvider';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import MascotAnimation from './ui/MascotAnimation';
import { NotificationDrawer } from './notifications/NotificationDrawer';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { initGlobalPresence, updatePresenceStatus } from '../lib/presenceService';
import { notifyVideoCall } from '../lib/notificationService';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './ui/LanguageSelector';

interface PatientLayoutProps {
  children: ReactNode;
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const primaryNavItems = [
    { to: '/dashboard-paciente', label: t('navigation.dashboard', 'Inicio'), icon: Home, accent: 'teal' },
    { to: '/exercises', label: t('navigation.exercises', 'Ejercicios'), icon: Dumbbell, accent: 'cyan' },
    { to: '/stats', label: t('navigation.stats', 'Progreso'), icon: Activity, accent: 'emerald' },
    { to: '/ai-assistant', label: t('navigation.aiAssistant', 'Physi IA'), icon: Bot, accent: 'blue' },
  ];

  const secondaryNavItems = [
    { to: '/profile', label: t('navigation.profile', 'Perfil'), icon: User, accent: 'teal' },
    { to: '/settings', label: t('navigation.settings', 'Configuración'), icon: Settings, accent: 'teal' },
  ];

  const navItems = [...primaryNavItems, ...secondaryNavItems];

  const breadcrumbMap: Record<string, string> = {
    '/dashboard-paciente': t('navigation.dashboard', 'Inicio'),
    '/exercises': t('navigation.exercises', 'Ejercicios'),
    '/stats': t('navigation.stats', 'Progreso'),
    '/ai-assistant': 'Physi',
    '/profile': t('navigation.profile', 'Perfil'),
    '/settings': t('navigation.settings', 'Configuración'),
  };
  const [showLogout, setShowLogout] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalDocType | null>(null);
  const [therapistPhone, setTherapistPhone] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('patient-sidebar-collapsed') === 'true');
  const [showNotifications, setShowNotifications] = useState(false);
  const [physiChatOpen, setPhysiChatOpen] = useState(false);
  const { unreadCount } = useRealtimeNotifications(user?.id);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    localStorage.setItem('patient-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const sidebarWidth = sidebarCollapsed ? 64 : 256;
  const currentCrumb = breadcrumbMap[location.pathname] || 'Inicio';

  useEffect(() => {
    loadTherapistPhone();
  }, [user?.id]);

  // Inicializar Presencia Realtime en Supabase
  useEffect(() => {
    if (user?.id) {
      initGlobalPresence({
        id: user.id,
        role: user.role || 'paciente',
        full_name: user.full_name || 'Paciente',
      });
    }
  }, [user?.id, user?.role, user?.full_name]);

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

  const loadTherapistPhone = async () => {
    if (!user?.id) return;
    try {
      const { data: link } = await supabase
        .from('pacientes_terapeutas')
        .select('terapeuta_id')
        .eq('paciente_id', user.id)
        .maybeSingle();
      if (link?.terapeuta_id) {
        const { data: fisio } = await supabase
          .from('fisioterapeutas_simple')
          .select('telefono')
          .eq('id', link.terapeuta_id)
          .maybeSingle();
        if (fisio?.telefono) setTherapistPhone(fisio.telefono);
      }
    } catch {
      // phone unavailable
    }
    if (!therapistPhone) setTherapistPhone('+584124081077');
  };

  const handleSignOut = () => {
    signOut();
    toast.info('Sesión cerrada');
    navigate('/login');
  };

  const quickActionItems: FloatingMenuItem[] = [
    {
      label: 'Videollamada',
      icon: <Video size={20} className="text-primary" />,
      onClick: async () => {
        if (!user?.id) { toast.info('No hay sesión activa'); return; }
        try {
          const { data: vinculacion } = await supabase
            .from('pacientes_terapeutas')
            .select('terapeuta_id')
            .eq('paciente_id', user.id)
            .maybeSingle();
          if (!vinculacion?.terapeuta_id) {
            toast.error('No tienes un fisioterapeuta asignado');
            return;
          }
          const fisioId = vinculacion.terapeuta_id;
          const jitsiUrl = `https://meet.jit.si/FisioMirror-${user.id}-${fisioId}`;
          window.open(jitsiUrl, '_blank');
          updatePresenceStatus('videoconsulta', window.location.pathname);

          // Notificar directamente al fisioterapeuta vía Supabase
          await notifyVideoCall({
            targetUserId: fisioId,
            callerName: user.full_name || 'Tu paciente',
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
                fisio_id: fisioId,
                type: 'videollamada',
                title: 'Videollamada entrante',
                message: `${user.full_name || 'Tu paciente'} quiere iniciar una videollamada`,
                link: jitsiUrl,
              }),
            });
          } catch {
            // opcional
          }
          toast.success('Videollamada iniciada. Notificación enviada en tiempo real.');
        } catch {
          toast.error('No se pudo iniciar la videollamada');
        }
      },
    },
    {
      label: 'Llamada',
      icon: <Phone size={20} className="text-primary" />,
      onClick: () => {
        if (therapistPhone) {
          window.location.href = `tel:${therapistPhone}`;
        } else {
          toast.info('No hay número de teléfono registrado');
        }
      },
    },
    {
      label: 'WhatsApp',
      icon: <MessageCircle size={20} className="text-primary" />,
      onClick: () => {
        if (therapistPhone) {
          const clean = therapistPhone.replace(/\D/g, '');
          window.open(`https://wa.me/${clean}`, '_blank');
        } else {
          toast.info('No hay número de WhatsApp registrado');
        }
      },
    },
    {
      label: 'Mensaje',
      icon: <Mail size={20} className="text-primary" />,
      onClick: () => {
        if (therapistPhone) {
          window.location.href = `sms:${therapistPhone}`;
        } else {
          toast.info('No hay número de teléfono registrado');
        }
      },
    },
  ];

  const renderBottomActions = (collapsed: boolean, onNavAway?: () => void) => (
    <div className={cn('shrink-0 border-t border-teal-100 dark:border-slate-800 p-3', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-3')}>
      {!collapsed && (
        <div className="rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 p-3 flex items-center gap-3 border border-teal-100/50 dark:border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 shadow-xs relative">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || 'P'
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{user?.full_name || 'Paciente'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-wider font-semibold">Paciente Activo</p>
            </div>
          </div>
        </div>
      )}
      <div className={cn(collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between px-1')}>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => { onNavAway?.(); setShowNotifications((v) => !v); }}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          aria-label={`Notificaciones, ${unreadCount} sin leer`}
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
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  const sidebarContent = (collapsed: boolean, opts?: { onNavigate?: () => void; showToggle?: boolean }) => (
    <>
      <div className="flex items-center px-4 h-16 border-b border-teal-100/60 dark:border-slate-800/80 shrink-0 relative">
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0 pr-6">
            <img src="/logo.png" alt="FisioMirror" className="h-9 w-9 min-w-[36px] min-h-[36px] object-contain shrink-0 aspect-square" />
            <div className="flex flex-col min-w-0">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight whitespace-nowrap">FisioMirror</h1>
              <p className="text-[10px] uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold whitespace-nowrap">Portal Paciente</p>
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
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 rounded-full bg-primary text-on-primary items-center justify-center text-xs shadow-md hover:scale-110 transition-transform z-10"
          >
            <Icon name={sidebarCollapsed ? 'chevron_right' : 'chevron_left'} size={14} />
          </button>
        )}
      </div>
      <nav className="flex-1 flex flex-col gap-1 p-2.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const IconComp = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={opts?.onNavigate}
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
                      layoutId="active-patient-nav-indicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent border border-teal-400/30 dark:border-teal-500/30 -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
                      isActive
                        ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/25'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-teal-50 dark:group-hover:bg-slate-700/80 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                    )}
                  >
                    <IconComp size={18} />
                  </div>
                  {!collapsed && <span className="text-sm truncate flex-1">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      {renderBottomActions(collapsed, opts?.onNavigate)}
    </>
  );

  const desktopSidebar = (
    <aside
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-gradient-to-b from-white/90 via-teal-50/30 to-surface/90 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border-r border-teal-200/50 dark:border-slate-800 text-slate-900 dark:text-slate-200 transition-all duration-300 overflow-hidden backdrop-blur-xl"
      style={{ width: `${sidebarWidth}px` }}
    >
      {sidebarContent(sidebarCollapsed, { showToggle: true })}
    </aside>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background text-on-surface relative" style={{ ['--patient-sidebar-w' as string]: `${sidebarWidth}px` }}>
      {/* Ambient Clinical Pastel Mesh Glow (Celeste, Menta y Lavanda suave) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-[110px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-[100px]" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-indigo-400/8 dark:bg-indigo-500/8 blur-[120px]" />
      </div>

      {/* Desktop sidebar navigation */}
      <div className="hidden lg:block relative z-30">{desktopSidebar}</div>

      {/* Mobile sidebar drawer (slide-in from left with smooth glassmorphism) */}
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
              className="h-full w-72 max-w-[85vw] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-teal-200/50 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-r-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-teal-100/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="FisioMirror" className="h-9 w-9 object-contain shrink-0" />
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">FisioMirror</h2>
                    <p className="text-[10px] uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold">Portal Paciente</p>
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
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 px-3.5 py-2.5 my-0.5 rounded-xl transition-all duration-200 select-none',
                          isActive
                            ? 'text-teal-700 dark:text-teal-300 font-bold bg-teal-500/10'
                            : 'text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                        )
                      }
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <IconComp size={18} />
                      </div>
                      <span className="text-sm truncate flex-1">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
              {renderBottomActions(false, () => setSidebarOpen(false))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area with sticky header */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-[var(--patient-sidebar-w)]" data-scroll-root>
        {/* Sticky header — mobile (hamburger + title + actions) and desktop (breadcrumb + actions) */}
        <header className="glass-panel sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 h-16 border-b divider-teal shrink-0 gap-2">
          {/* Left: hamburger (mobile) + breadcrumb (desktop) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden text-primary shrink-0 p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <Icon name="menu" size={22} />
            </button>
            <BackButton />
            {/* Mobile title & logo */}
            <div className="flex items-center gap-2 lg:hidden min-w-0">
              <img src="/logo.png" alt="FisioMirror" className="h-8 w-8 min-w-[32px] min-h-[32px] object-contain shrink-0 aspect-square" />
              <span className="text-on-surface font-bold text-sm truncate max-w-[130px] sm:max-w-[180px]">{currentCrumb}</span>
            </div>
            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center text-outline text-label-sm gap-2 min-w-0 truncate">
              <span onClick={() => navigate('/dashboard-paciente')} className="hover:text-primary cursor-pointer shrink-0">Inicio</span>
              <Icon name="chevron_right" size={14} className="shrink-0" />
              <span className="text-on-surface font-bold truncate">{currentCrumb}</span>
            </div>
          </div>
          {/* Right: actions — all buttons directly in header */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className={`online-indicator is-${isOnline ? 'online' : 'offline'} hidden md:inline-flex`}>
              <span className="dot" />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative text-on-surface-variant hover:text-primary transition-colors active-scale p-2 rounded-full"
              aria-label={`Notificaciones, ${unreadCount} sin leer`}
            >
              <Icon name="notifications" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-error rounded-full text-white text-[9px] font-bold flex items-center justify-center px-1">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            <LanguageSelector compact />
            <button
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-primary transition-colors active-scale p-2 rounded-full"
              aria-label="Cambiar tema"
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
            </button>
            <button
              onClick={() => setPhysiChatOpen(true)}
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors active-scale flex items-center gap-1.5"
              aria-label="Abrir Chatbot IA Physi"
              title="Chatbot IA Physi"
            >
              <Bot size={20} className="text-primary" />
              <span className="hidden xl:inline text-xs font-semibold text-primary">
                {t('navigation.chatbotPhysi', 'Chatbot Physi')}
              </span>
            </button>
            <button
              onClick={() => setShowLogout(true)}
              className="text-on-surface-variant hover:text-error transition-colors active-scale p-2 rounded-full"
              aria-label="Cerrar sesión"
            >
              <Icon name="logout" size={20} />
            </button>
          </div>
        </header>
        {/* Scrollable content with clean spacing */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-8 pb-10 space-y-8 max-w-md mx-auto lg:px-0 lg:max-w-none lg:mx-0 lg:p-10 bg-teal-50/20 dark:bg-slate-950/20">{children}</div>

        {/* Desktop footer */}
        <footer className="hidden lg:flex pt-6 pb-6 px-8 justify-between text-outline text-xs border-t divider-teal shrink-0">
          <span>&copy; 2025 FisioMirror</span>
          <div className="flex gap-4">
            <button onClick={() => setLegalModal('consent')} className="transition-colors hover:text-primary">Consentimiento Informado</button>
            <button onClick={() => setLegalModal('terms')} className="transition-colors hover:text-primary">Términos de Servicio</button>
            <button onClick={() => setLegalModal('privacy')} className="transition-colors hover:text-primary">Privacidad de Datos</button>
          </div>
        </footer>
      </main>

      {/* Mobile Fixed Curved Navigation Dock (MegaSuite 41) */}
      {location.pathname !== '/ai-assistant' && (
        <div className="md:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-auto">
          <CurvedMobileDock
            className="w-full max-w-sm shadow-2xl"
            currentTab={
              location.pathname === '/exercises' ? 'ejercicios' : location.pathname === '/stats' ? 'progreso' : 'scan'
            }
            onExercisesClick={() => navigate('/exercises')}
            onScanClick={() => navigate('/ar-mirror')}
            onProgressClick={() => navigate('/stats')}
          />
        </div>
      )}

      {/* Botón de acción flotante — oculto en móvil donde está el CurvedMobileDock y en la página de chat de Physi */}
      {location.pathname !== '/ai-assistant' && (
        <div className="hidden md:block">
          <FloatingMenu
            items={quickActionItems}
            ariaLabel="Acciones del paciente"
            className="fixed bottom-6 right-6 z-40"
          />
        </div>
      )}

      {/* Centro de Notificaciones Clínico Avanzado */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userId={user?.id}
      />

      {/* Logout modal with mascot */}
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
              <MascotAnimation type="goodbye" size="md" className="mx-auto mb-4" />
              <h3 className="font-headline-lg text-headline-lg gradient-text-editorial mb-2">{t('navigation.logoutConfirm', '¿Cerrar sesión?')}</h3>
              <p className="text-on-surface-variant text-sm mb-6">{t('navigation.logoutConfirmDesc', 'Tendrás que volver a ingresar tu token para acceder.')}</p>
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

      <LegalModal isOpen={legalModal !== null} onClose={() => setLegalModal(null)} type={legalModal ?? 'privacy'} />

      <PhysiChatbot isOpen={physiChatOpen} onClose={() => setPhysiChatOpen(false)} />
    </div>
  );
}
