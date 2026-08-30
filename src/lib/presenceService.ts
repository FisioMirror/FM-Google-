import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface UserPresence {
  userId: string;
  role: 'fisioterapeuta' | 'paciente' | 'admin' | string;
  name: string;
  status: 'online' | 'en_ejercicio' | 'videoconsulta' | 'inactivo';
  page?: string;
  onlineAt: string;
}

let presenceChannel: any = null;
let currentTrackedUserId: string | null = null;
const presenceListeners = new Set<(onlineUsers: Record<string, UserPresence>) => void>();
let currentOnlineState: Record<string, UserPresence> = {};

export function initGlobalPresence(currentUser: { id: string; role?: string; full_name?: string }) {
  if (typeof window === 'undefined' || !currentUser?.id) return;

  // If already tracking this exact user and channel is active, do not recreate
  if (
    currentTrackedUserId === currentUser.id &&
    presenceChannel &&
    (presenceChannel.state === 'joined' || presenceChannel.state === 'joining')
  ) {
    return;
  }

  currentTrackedUserId = currentUser.id;

  if (presenceChannel) {
    try {
      supabase.removeChannel(presenceChannel);
    } catch {
      // ignore
    }
    presenceChannel = null;
  }

  // Remove any stale channel in supabase client cache
  try {
    const existing = supabase
      .getChannels()
      .filter((c) => c.topic.includes('fisiomirror-presence'));
    existing.forEach((ch) => supabase.removeChannel(ch));
  } catch {
    // ignore
  }

  const channelTopic = `fisiomirror-presence-${currentUser.id}-${Date.now()}`;
  const channel = supabase.channel(channelTopic, {
    config: {
      presence: {
        key: currentUser.id,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const mapped: Record<string, UserPresence> = {};

      Object.keys(state).forEach((key) => {
        const presences = state[key] as any[];
        if (presences && presences.length > 0) {
          const latest = presences[presences.length - 1];
          mapped[key] = {
            userId: key,
            role: latest.role || 'usuario',
            name: latest.name || 'Usuario',
            status: latest.status || 'online',
            page: latest.page || '',
            onlineAt: latest.onlineAt || new Date().toISOString(),
          };
        }
      });

      currentOnlineState = mapped;
      presenceListeners.forEach((listener) => listener(mapped));
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          role: currentUser.role || 'paciente',
          name: currentUser.full_name || 'Usuario',
          status: 'online',
          page: window.location.pathname,
          onlineAt: new Date().toISOString(),
        });
      }
    });

  presenceChannel = channel;
}

export function updatePresenceStatus(status: 'online' | 'en_ejercicio' | 'videoconsulta' | 'inactivo', page?: string) {
  if (presenceChannel && presenceChannel.state === 'joined') {
    presenceChannel.track({
      status,
      page: page || window.location.pathname,
      onlineAt: new Date().toISOString(),
    }).catch(() => {});
  }
}

/**
 * Hook de React para observar la presencia en vivo de los usuarios en el sistema
 */
export function useRealtimePresence() {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, UserPresence>>(currentOnlineState);

  useEffect(() => {
    const handleUpdate = (updated: Record<string, UserPresence>) => {
      setOnlineUsers({ ...updated });
    };

    presenceListeners.add(handleUpdate);
    setOnlineUsers(currentOnlineState);

    return () => {
      presenceListeners.delete(handleUpdate);
    };
  }, []);

  const isUserOnline = (userId: string): boolean => {
    return !!onlineUsers[userId];
  };

  const getUserStatus = (userId: string): UserPresence | null => {
    return onlineUsers[userId] || null;
  };

  return {
    onlineUsers,
    isUserOnline,
    getUserStatus,
    onlineCount: Object.keys(onlineUsers).length,
  };
}
