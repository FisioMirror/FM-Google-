import { supabase } from './supabase';

export type NotificationType =
  | 'clinica'
  | 'rutina'
  | 'videollamada'
  | 'seguridad'
  | 'sistema'
  | 'ejercicio'
  | 'logro';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audio Chimes sintetizados vía Web Audio API (100% nativo, sin dependencias)
// ─────────────────────────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playNotificationSound(type: NotificationType | string = 'sistema') {
  if (typeof window === 'undefined') return;
  const isMuted = localStorage.getItem('fisiomirror_notif_sound_muted') === 'true';
  if (isMuted) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'videollamada') {
      // Ringtone suave de 3 notas ascendentes
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.26);
      });
    } else if (type === 'seguridad') {
      // Doble pulso de alerta suave
      [440, 370].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.21);
      });
    } else {
      // Chime armonioso de 2 tonos (587.33Hz Re5 -> 880Hz La5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      gain2.gain.setValueAtTime(0.12, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.45);
    }

    // Vibración en dispositivos móviles táctiles
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch {
        // ignore
      }
    }
  } catch {
    // Web audio no disponible o bloqueado por interacción del navegador
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD de Notificaciones con Supabase
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  link?: string | null;
}

export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
      read: false,
    });

    if (error) {
      console.warn('Error inserting notification:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('createNotification exception:', err);
    return false;
  }
}

export async function fetchNotifications(userId: string, limit = 40): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as AppNotification[];
  } catch {
    return [];
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    return !error;
  } catch {
    return false;
  }
}

export async function markAsUnread(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: false })
      .eq('id', notificationId);
    return !error;
  } catch {
    return false;
  }
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    return !error;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Disparadores Especializados Clínicos y Operativos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notifica al terapeuta cuando un paciente finaliza una sesión de rehabilitación
 */
export async function notifySessionCompleted(params: {
  therapistId: string;
  patientName: string;
  exerciseTitle: string;
  precision: number;
  durationSeconds?: number;
}): Promise<boolean> {
  const durationText = params.durationSeconds
    ? ` en ${Math.round(params.durationSeconds / 60)} min`
    : '';
  return createNotification({
    userId: params.therapistId,
    type: 'ejercicio',
    title: `Sesión completada por ${params.patientName}`,
    message: `Finalizó "${params.exerciseTitle}" con ${Math.round(params.precision)}% de precisión${durationText}.`,
    link: '/dashboard',
  });
}

/**
 * Notifica al paciente cuando su fisioterapeuta le asigna o actualiza una rutina
 */
export async function notifyRoutineAssigned(params: {
  patientId: string;
  therapistName: string;
  routineTitle: string;
  exerciseCount?: number;
}): Promise<boolean> {
  const countText = params.exerciseCount ? ` con ${params.exerciseCount} ejercicios` : '';
  return createNotification({
    userId: params.patientId,
    type: 'rutina',
    title: `Nueva rutina asignada por ${params.therapistName}`,
    message: `Tienes disponible la rutina "${params.routineTitle}"${countText}. Ingresa a tu módulo de ejercicios para comenzar.`,
    link: '/paciente/ejercicios',
  });
}

/**
 * Notifica al paciente o terapeuta sobre una sesión de videoconsulta
 */
export async function notifyVideoCall(params: {
  targetUserId: string;
  callerName: string;
  meetLink: string;
}): Promise<boolean> {
  return createNotification({
    userId: params.targetUserId,
    type: 'videollamada',
    title: `Videollamada con ${params.callerName}`,
    message: `${params.callerName} te ha invitado a una videoconsulta en tiempo real. Haz clic para unirte.`,
    link: params.meetLink,
  });
}

/**
 * Notifica al fisioterapeuta cuando se genera un token de activación para un paciente
 */
export async function notifyTokenCreated(params: {
  therapistId: string;
  patientName: string;
  token: string;
}): Promise<boolean> {
  return createNotification({
    userId: params.therapistId,
    type: 'sistema',
    title: `Token generado para ${params.patientName}`,
    message: `Código de vinculación ${params.token} generado exitosamente. Válido para activación de cuenta.`,
  });
}

/**
 * Alerta de seguridad para accesos o cambios críticos
 */
export async function notifySecurityAlert(params: {
  userId: string;
  title: string;
  message: string;
}): Promise<boolean> {
  return createNotification({
    userId: params.userId,
    type: 'seguridad',
    title: params.title,
    message: params.message,
    link: '/perfil',
  });
}
