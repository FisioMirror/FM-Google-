import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  AppNotification,
  fetchNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  playNotificationSound,
} from '../lib/notificationService';
import { useToast } from '../components/ui/ToastProvider';

export type NotificationFilter = 'todas' | 'no_leidas' | 'clinica' | 'seguridad';

interface RealtimeSharedState {
  userId: string | null;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
}

let sharedState: RealtimeSharedState = {
  userId: null,
  notifications: [],
  unreadCount: 0,
  loading: false,
};

let activeChannel: any = null;
let activeChannelTopic: string | null = null;
let activeSubscriberCount = 0;
let teardownTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

const stateListeners = new Set<(state: RealtimeSharedState) => void>();
const toastCallbacks = new Set<(title: string, desc?: string) => void>();

function notifyStateListeners() {
  stateListeners.forEach((fn) => fn(sharedState));
}

async function loadSharedNotifications(uid: string) {
  if (!uid) return;
  sharedState = { ...sharedState, loading: true };
  notifyStateListeners();

  try {
    const [list, unread] = await Promise.all([
      fetchNotifications(uid),
      getUnreadCount(uid),
    ]);
    sharedState = {
      userId: uid,
      notifications: list,
      unreadCount: unread,
      loading: false,
    };
    notifyStateListeners();
  } catch {
    sharedState = { ...sharedState, loading: false };
    notifyStateListeners();
  }
}

function teardownActiveChannel() {
  if (activeChannel) {
    try {
      supabase.removeChannel(activeChannel);
    } catch {
      // ignore
    }
    activeChannel = null;
    activeChannelTopic = null;
  }

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startSubscription(uid: string) {
  if (!uid) return;

  if (teardownTimer) {
    clearTimeout(teardownTimer);
    teardownTimer = null;
  }

  // If already subscribed to this user with an active, valid channel, don't recreate
  if (
    sharedState.userId === uid &&
    activeChannel &&
    activeChannelTopic &&
    (activeChannel.state === 'joined' || activeChannel.state === 'joining')
  ) {
    return;
  }

  // Clean up any prior channel
  teardownActiveChannel();

  sharedState.userId = uid;
  loadSharedNotifications(uid);

  // Clean up any stale channels in supabase client for this user
  try {
    const existingChannels = supabase.getChannels();
    existingChannels.forEach((ch) => {
      if (ch.topic && ch.topic.includes(`realtime-notifs-${uid}`)) {
        supabase.removeChannel(ch);
      }
    });
  } catch {
    // ignore
  }

  // Unique channel name with timestamp avoids collision even during fast unmount/mount
  const channelName = `realtime-notifs-${uid}-${Date.now()}`;
  activeChannelTopic = channelName;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${uid}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const newNotif = payload.new as AppNotification;
          const updated = [newNotif, ...sharedState.notifications.filter((n) => n.id !== newNotif.id)];
          const unread = updated.filter((n) => !n.read).length;

          sharedState = {
            ...sharedState,
            notifications: updated,
            unreadCount: unread,
          };
          notifyStateListeners();

          // Audio chime
          const isMuted =
            typeof window !== 'undefined' &&
            localStorage.getItem('fisiomirror_notif_sound_muted') === 'true';
          if (!isMuted) {
            playNotificationSound(newNotif.type);
          }

          // Single toast alert across all open components
          const firstToast = toastCallbacks.values().next().value;
          if (firstToast) {
            firstToast(newNotif.title, newNotif.message);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as AppNotification;
          const list = sharedState.notifications.map((n) => (n.id === updated.id ? updated : n));
          const unread = list.filter((n) => !n.read).length;

          sharedState = {
            ...sharedState,
            notifications: list,
            unreadCount: unread,
          };
          notifyStateListeners();
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as any)?.id;
          if (oldId) {
            const list = sharedState.notifications.filter((n) => n.id !== oldId);
            const unread = list.filter((n) => !n.read).length;

            sharedState = {
              ...sharedState,
              notifications: list,
              unreadCount: unread,
            };
            notifyStateListeners();
          }
        }
      }
    )
    .subscribe();

  activeChannel = channel;

  // Background polling every 45s as backup
  pollTimer = setInterval(() => {
    if (sharedState.userId) {
      loadSharedNotifications(sharedState.userId);
    }
  }, 45_000);
}

function releaseSubscription() {
  activeSubscriberCount = Math.max(0, activeSubscriberCount - 1);
  if (activeSubscriberCount === 0) {
    // Debounce teardown to avoid thrashing between route navigations
    if (teardownTimer) clearTimeout(teardownTimer);
    teardownTimer = setTimeout(() => {
      if (activeSubscriberCount === 0) {
        teardownActiveChannel();
        sharedState = {
          userId: null,
          notifications: [],
          unreadCount: 0,
          loading: false,
        };
      }
    }, 2500);
  }
}

export function useRealtimeNotifications(userId?: string) {
  const toast = useToast();
  const [state, setState] = useState<RealtimeSharedState>(sharedState);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('todas');
  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fisiomirror_notif_sound_muted') === 'true';
    }
    return false;
  });

  const toggleSound = useCallback(() => {
    setSoundMuted((prev) => {
      const next = !prev;
      localStorage.setItem('fisiomirror_notif_sound_muted', String(next));
      return next;
    });
  }, []);

  // Connect toast handler
  useEffect(() => {
    const handleToast = (title: string, desc?: string) => {
      toast.info(title, { description: desc });
    };
    toastCallbacks.add(handleToast);
    return () => {
      toastCallbacks.delete(handleToast);
    };
  }, [toast]);

  // Connect to shared notifications state & subscription
  useEffect(() => {
    if (!userId) return;

    activeSubscriberCount += 1;
    startSubscription(userId);

    const handleStateUpdate = (newState: RealtimeSharedState) => {
      setState({ ...newState });
    };

    stateListeners.add(handleStateUpdate);
    // Initial sync
    setState({ ...sharedState });

    return () => {
      stateListeners.delete(handleStateUpdate);
      releaseSubscription();
    };
  }, [userId]);

  const markRead = useCallback(
    async (id: string) => {
      const list = sharedState.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unread = list.filter((n) => !n.read).length;
      sharedState = {
        ...sharedState,
        notifications: list,
        unreadCount: unread,
      };
      notifyStateListeners();
      await apiMarkAsRead(id);
    },
    []
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const list = sharedState.notifications.map((n) => ({ ...n, read: true }));
    sharedState = {
      ...sharedState,
      notifications: list,
      unreadCount: 0,
    };
    notifyStateListeners();
    toast.success('Todas las notificaciones marcadas como leídas');
    await apiMarkAllAsRead(userId);
  }, [userId, toast]);

  const removeNotification = useCallback(
    async (id: string) => {
      const list = sharedState.notifications.filter((n) => n.id !== id);
      const unread = list.filter((n) => !n.read).length;
      sharedState = {
        ...sharedState,
        notifications: list,
        unreadCount: unread,
      };
      notifyStateListeners();
      await apiDeleteNotification(id);
    },
    []
  );

  const refresh = useCallback(async () => {
    if (userId) {
      await loadSharedNotifications(userId);
    }
  }, [userId]);

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'no_leidas':
        return state.notifications.filter((n) => !n.read);
      case 'clinica':
        return state.notifications.filter((n) =>
          ['clinica', 'ejercicio', 'rutina', 'videollamada'].includes(n.type)
        );
      case 'seguridad':
        return state.notifications.filter((n) =>
          ['seguridad', 'sistema'].includes(n.type)
        );
      case 'todas':
      default:
        return state.notifications;
    }
  }, [state.notifications, activeFilter]);

  return {
    notifications: filteredNotifications,
    rawCount: state.notifications.length,
    unreadCount: state.unreadCount,
    loading: state.loading,
    activeFilter,
    setActiveFilter,
    soundMuted,
    toggleSound,
    markRead,
    markAllRead,
    removeNotification,
    refresh,
  };
}
