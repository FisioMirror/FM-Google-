import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCheck,
  Check,
  Trash2,
  ExternalLink,
  Activity,
  Video,
  ShieldCheck,
  Dumbbell,
  Info,
  X,
  Sparkles,
} from 'lucide-react';
import { useRealtimeNotifications, NotificationFilter } from '../../hooks/useRealtimeNotifications';
import { AppNotification } from '../../lib/notificationService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHour < 24) return `Hace ${diffHour} h`;
    if (diffDay === 1) return 'Ayer';
    if (diffDay < 7) return `Hace ${diffDay} días`;
    return date.toLocaleDateString();
  } catch {
    return 'Reciente';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'videollamada':
      return <Video size={16} className="text-cyan-600 dark:text-cyan-400" />;
    case 'rutina':
      return <Dumbbell size={16} className="text-teal-600 dark:text-teal-400" />;
    case 'ejercicio':
    case 'clinica':
      return <Activity size={16} className="text-emerald-600 dark:text-emerald-400" />;
    case 'seguridad':
      return <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400" />;
    case 'logro':
      return <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />;
    case 'sistema':
    default:
      return <Info size={16} className="text-slate-600 dark:text-slate-400" />;
  }
}

function getNotificationBadgeStyle(type: string) {
  switch (type) {
    case 'videollamada':
      return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-300';
    case 'rutina':
      return 'bg-teal-500/10 border-teal-500/20 text-teal-700 dark:text-teal-300';
    case 'ejercicio':
    case 'clinica':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300';
    case 'seguridad':
      return 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300';
    case 'logro':
      return 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300';
    case 'sistema':
    default:
      return 'bg-slate-500/10 border-slate-500/20 text-slate-700 dark:text-slate-300';
  }
}

export function NotificationDrawer({ isOpen, onClose, userId }: NotificationDrawerProps) {
  const {
    notifications,
    unreadCount,
    activeFilter,
    setActiveFilter,
    soundMuted,
    toggleSound,
    markRead,
    markAllRead,
    removeNotification,
  } = useRealtimeNotifications(userId);

  const filters: { id: NotificationFilter; label: string; count?: number }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'no_leidas', label: 'No leídas', count: unreadCount },
    { id: 'clinica', label: 'Clínica' },
    { id: 'seguridad', label: 'Seguridad' },
  ];

  const handleOpenLink = (notif: AppNotification) => {
    markRead(notif.id);
    if (notif.link) {
      if (notif.link.startsWith('http')) {
        window.open(notif.link, '_blank');
      } else {
        window.location.href = notif.link;
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="notification-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-xs flex justify-end"
          onClick={onClose}
        >
          <motion.div
            id="notification-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Bell size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Centro de Notificaciones
                    </h2>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shadow-xs">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sincronización clínica en tiempo real
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id="btn-toggle-sound"
                  type="button"
                  onClick={toggleSound}
                  title={soundMuted ? 'Activar sonido de alertas' : 'Silenciar sonido de alertas'}
                  className={`p-2 rounded-xl transition-colors ${
                    soundMuted
                      ? 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      : 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
                  }`}
                  aria-label="Alternar sonido"
                >
                  {soundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>

                <button
                  id="btn-close-notifications"
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Cerrar notificaciones"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Quick Actions */}
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      activeFilter === f.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-50'
                    }`}
                  >
                    <span>{f.label}</span>
                    {f.count !== undefined && f.count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                          activeFilter === f.id
                            ? 'bg-white text-teal-700'
                            : 'bg-teal-600 text-white'
                        }`}
                      >
                        {f.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  id="btn-mark-all-read"
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                >
                  <CheckCheck size={13} />
                  <span className="hidden sm:inline">Marcar todas</span>
                </button>
              )}
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Bell size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Sin notificaciones
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                      {activeFilter === 'no_leidas'
                        ? 'No tienes notificaciones pendientes de leer.'
                        : 'No hay registros en esta categoría.'}
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !notif.read;
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3.5 rounded-2xl border transition-all relative group ${
                        isUnread
                          ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800/60 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon Badge */}
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getNotificationBadgeStyle(
                            notif.type
                          )}`}
                        >
                          {getNotificationIcon(notif.type)}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                              {timeAgo(notif.created_at)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>

                          {/* Action Link or CTAs */}
                          <div className="flex items-center gap-2 mt-2.5">
                            {notif.link && (
                              <button
                                type="button"
                                onClick={() => handleOpenLink(notif)}
                                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs"
                              >
                                <span>Ver detalle</span>
                                <ExternalLink size={11} />
                              </button>
                            )}

                            {isUnread ? (
                              <button
                                type="button"
                                onClick={() => markRead(notif.id)}
                                className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                              >
                                <Check size={12} />
                                <span>Marcar leída</span>
                              </button>
                            ) : null}

                            <div className="ml-auto flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => removeNotification(notif.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Eliminar notificación"
                                aria-label="Eliminar"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Unread indicator dot */}
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-[10px] text-slate-400">
                FisioMirror Realtime • Avisos de sesiones, videoconsultas y seguridad
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
