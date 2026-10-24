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

  const navGroups = [
    { id: 'therapy', label: t('navigation.therapyGroup', 'Terapia'), items: primaryNavItems },
    { id: 'account', label: t('navigation.accountGroup', 'Cuenta'), items: secondaryNavItems },
  ];

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
  const currentCrumb = breadcrumbMap[location.pathname] || t('navigation.dashboard');

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

  // Close the mobile drawer with Escape and lock body scroll while it is open
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
    toast.info(t('layout.sessionClosed'));
    navigate('/login');
  };

  const quickActionItems: FloatingMenuItem[] = [
    {
      label: t('navigation.videoCall'),
      icon: <Video size={20} className="text-primary" />,
      onClick: async () => {
        if (!user?.id) { toast.info(t('layout.noActiveSession')); return; }
        try {
          const { data: vinculacion } = await supabase
            .from('pacientes_terapeutas')
            .select('terapeuta_id')
            .eq('paciente_id', user.id)
            .maybeSingle();
          if (!vinculacion?.terapeuta_id) {
            toast.error(t('layout.noTherapistAssigned'));
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
          toast.success(t('layout.videoCallStarted'));
        } catch {
          toast.error(t('layout.videoCallError'));
        }
      },
    },
    {
      label: t('layout.call'),
      icon: <Phone size={20} className="text-primary" />,
      onClick: () => {
        if (therapistPhone) {
          window.location.href = `tel:${therapistPhone}`;
        } else {
          toast.info(t('layout.noPhone'));
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
          toast.info(t('layout.noWhatsapp'));
        }
      },
    },
    {
      label: t('layout.message'),
      icon: <Mail size={20} className="text-primary" />,
      onClick: () => {
        if (therapistPhone) {
          window.location.href = `sms:${therapistPhone}`;
        } else {
          toast.info(t('layout.noPhone'));
        }
      },
    },
  ];

  const renderNavItem = (
    item: { to: string; label: string; icon: React.ElementType; accent: string },
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
                layoutId="active-patient-nav-indicator"
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
      {!collapsed && (
        <div className="rounded-2xl bg-surface-container/60 p-3 flex items-center gap-3 border border-outline-variant/50">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm overflow-hidden shrink-0 shadow-xs relative">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || 'P'
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface-container" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-on-surface truncate">{user?.full_name || 'Paciente'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-2xs text-primary uppercase tracking-wider font-semibold">{t('layout.activePatient')}</p>
            </div>
          </div>
        </div>
      )}
      <div className={cn(collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between px-1')}>
        <button
          onClick={toggleTheme}
          className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label={t('common.changeTheme')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => { onNavAway?.(); setShowNotifications((v) => !v); }}
          className="relative p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label={`Notificaciones, ${unreadCount} sin leer`}
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
          className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-danger/10 hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label={t('common.logout')}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  const sidebarContent = (collapsed: boolean, opts?: { onNavigate?: () => void; showToggle?: boolean }) => (
    <>
      <div className="flex items-center px-4 h-16 border-b border-outline-variant/50 shrink-0 relative">
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0 pr-6">
            <img src="/logo.png" alt="FisioMirror" className="h-9 w-9 min-w-[36px] min-h-[36px] object-contain shrink-0 aspect-square" />
            <div className="flex flex-col min-w-0">
              <h1 className="text-base font-extrabold text-on-surface tracking-tight leading-tight whitespace-nowrap">FisioMirror</h1>
              <p className="text-2xs uppercase tracking-wider text-primary font-bold whitespace-nowrap">{t('navigation.patientPortal')}</p>
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
            <Icon name={sidebarCollapsed ? 'chevron_right' : 'chevron_left'} size={14} />
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
      className="sidebar-surface fixed left-0 top-0 h-[100dvh] z-40 flex flex-col text-on-surface transition-[width] duration-300 overflow-hidden"
      style={{ width: `${sidebarWidth}px` }}
    >
      {sidebarContent(sidebarCollapsed, { showToggle: true })}
    </aside>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] overflow-hidden bg-background text-on-surface relative" style={{ ['--patient-sidebar-w' as string]: `${sidebarWidth}px` }}>
      {/* Ambient Clinical Pastel Mesh Glow (Celeste, Menta y Lavanda suave) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-teal-400/10 dark:bg-teal-500/[0.05] blur-[110px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-info/10 dark:bg-info/[0.05] blur-[100px]" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-secondary/[0.08] dark:bg-secondary/[0.04] blur-[120px]" />
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
              aria-label={t('layout.navMenu')}
              className="sidebar-surface h-full w-72 max-w-[85vw] flex flex-col text-on-surface rounded-r-3xl overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="FisioMirror" className="h-9 w-9 object-contain shrink-0" />
                  <div>
                    <h2 className="text-base font-extrabold text-on-surface leading-tight">FisioMirror</h2>
                    <p className="text-2xs uppercase tracking-wider text-primary font-bold">{t('navigation.patientPortal')}</p>
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

      {/* Main content area with sticky header */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-[var(--patient-sidebar-w)]" data-scroll-root>
        {/* Sticky header — mobile (hamburger + title + actions) and desktop (breadcrumb + actions) */}
        <header className="glass-panel sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] border-b divider-teal shrink-0 gap-2">
          {/* Left: hamburger (mobile) + breadcrumb (desktop) */}
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
              <span onClick={() => navigate('/dashboard-paciente')} role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard-paciente'); }} className="hover:text-primary cursor-pointer shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{t('navigation.dashboard')}</span>
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
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-error rounded-full text-white text-2xs font-bold flex items-center justify-center px-1">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            <LanguageSelector compact />
            <button
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-primary transition-colors active-scale p-2 rounded-full"
              aria-label={t('common.changeTheme')}
            >
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
            </button>
            <button
              onClick={() => setPhysiChatOpen(true)}
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors active-scale flex items-center gap-1.5"
              aria-label={t('layout.openChatbot')}
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
              aria-label={t('common.logout')}
            >
              <Icon name="logout" size={20} />
            </button>
          </div>
        </header>
        {/* Scrollable content with clean spacing (bottom padding clears the mobile dock / FAB) */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 pt-5 sm:pt-8 pb-28 md:pb-24 space-y-5 sm:space-y-8 max-w-md mx-auto lg:px-0 lg:max-w-none lg:mx-0 lg:p-10 bg-surface/30 dark:bg-transparent">{children}</div>

        {/* Desktop footer */}
        <footer className="hidden lg:flex pt-6 pb-6 px-8 justify-between text-outline text-xs border-t divider-teal shrink-0">
          <span>&copy; 2026 FisioMirror</span>
          <div className="flex gap-4">
            <button onClick={() => setLegalModal('consent')} className="transition-colors hover:text-primary">{t('layout.informedConsent')}</button>
            <button onClick={() => setLegalModal('terms')} className="transition-colors hover:text-primary">{t('layout.termsOfService')}</button>
            <button onClick={() => setLegalModal('privacy')} className="transition-colors hover:text-primary">{t('layout.dataPrivacy')}</button>
          </div>
        </footer>
      </main>

      {/* Acción flotante — visible en móvil y desktop; oculta solo en el chat de Physi */}
      {location.pathname !== '/ai-assistant' && (
        <FloatingMenu
          items={quickActionItems}
          ariaLabel="Acciones del paciente"
          className="fab-anchor fixed right-4 sm:right-6 z-40 bottom-[calc(1.25rem+env(safe-area-inset-bottom))]"
        />
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
              role="dialog"
              aria-modal="true"
              aria-label={t('layout.confirmSignOut')}
              className="glass-panel rounded-3xl p-8 max-w-sm w-full mx-4 text-center max-h-[90dvh] overflow-y-auto"
            >
              <MascotAnimation type="goodbye" size="md" className="mx-auto mb-4" />
              <h3 className="fm-section-title text-on-surface mb-2">{t('navigation.logoutConfirm', '¿Cerrar sesión?')}</h3>
              <p className="text-on-surface-variant text-sm mb-6">{t('layout.tokenReentryDesc')}</p>
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
