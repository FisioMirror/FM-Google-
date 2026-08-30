import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { DEMO_PATIENT_PROFILE, DEMO_FISIO_PROFILE, DEMO_TOKENS } from '../data/demoProfiles';
import { isDemoAccount } from '../lib/demoAuth';

const STORAGE_KEY = 'fisiomirror-auth';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const functionsUrl = `${supabaseUrl}/functions/v1`;
const SALT = 'fisiomirror-salt-2024';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface FisioSignupData {
  cedula: string;
  universidad: string;
  colegiadoId: string;
  especialidades: string[];
  credencialUrl?: string;
  anioEgreso?: string;
  telefono?: string;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error('Error de conexión con el servidor');
}

async function fetchProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

async function fetchProfileByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithToken: (token: string, email?: string, password?: string) => Promise<boolean>;
  signInPatientWithEmail: (email: string, password: string, token?: string) => Promise<boolean>;
  linkTokenToEmail: (token: string, email: string, password: string, fullName?: string) => Promise<boolean>;
  signUpFisio: (
    email: string,
    password: string,
    fullName: string,
    data: FisioSignupData,
  ) => Promise<boolean>;
  signUpPaciente: (email: string, password: string, fullName: string) => Promise<boolean>;
  validateToken: (token: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      initialized: false,

      initialize: async () => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) {
            set({ initialized: true });
            return;
          }
          const parsed = JSON.parse(raw);
          const storedAt = parsed?.state?.storedAt as number | undefined;
          if (storedAt && Date.now() - storedAt > SESSION_MAX_AGE_MS) {
            localStorage.removeItem(STORAGE_KEY);
            set({ user: null, initialized: true });
            return;
          }
          const storedUser = parsed?.state?.user as Profile | null;
          if (storedUser) {
            if (storedUser.id === DEMO_PATIENT_PROFILE.id) {
              set({ user: DEMO_PATIENT_PROFILE, initialized: true });
              return;
            }
            if (storedUser.id === DEMO_FISIO_PROFILE.id) {
              set({ user: DEMO_FISIO_PROFILE, initialized: true });
              return;
            }
            set({ user: storedUser, initialized: true });
            try {
              const refreshed = await Promise.race([
                fetchProfileById(storedUser.id),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
              ]);
              if (refreshed) set({ user: refreshed, initialized: true });
            } catch {
              // keep stored user
            }
          } else {
            set({ initialized: true });
          }
        } catch {
          set({ initialized: true });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        const cleanEmail = email.toLowerCase().trim();

        // Acceso directo a credenciales Demo
        if (cleanEmail === 'fisio@demo.com' || cleanEmail === 'demo@fisiomirror.com' || cleanEmail === 'demo@fisio.com') {
          set({ user: DEMO_FISIO_PROFILE, loading: false, error: null });
          return true;
        }
        if (cleanEmail === 'paciente@demo.com' || cleanEmail === 'demo@paciente.com') {
          set({ user: DEMO_PATIENT_PROFILE, loading: false, error: null });
          return true;
        }

        try {
          // 1. Intento con Edge Function auth-login
          try {
            const res = await fetchWithRetry(`${functionsUrl}/auth-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: cleanEmail, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 429) {
              set({ error: 'Demasiados intentos. Espera un minuto.', loading: false });
              return false;
            }
            if (res.ok && data.success) {
              const userId = data.user_id as string | null;
              const userEmail = data.email as string | null;
              let profile = userId ? await fetchProfileById(userId) : null;
              if (!profile && userEmail) profile = await fetchProfileByEmail(userEmail);
              if (profile) {
                set({ user: profile, loading: false });
                return true;
              }
            }
          } catch (edgeErr) {
            console.warn('Edge function auth-login error, fallback to direct DB:', edgeErr);
          }

          // 2. Direct Supabase fallback
          const computedHash = await hashPassword(password);
          const { data: profile, error: dbError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (dbError) {
            set({ error: 'Error al consultar el perfil de usuario', loading: false });
            return false;
          }

          if (!profile) {
            set({ error: 'Correo o contraseña incorrectos', loading: false });
            return false;
          }

          if (profile.password_hash && profile.password_hash !== computedHash && profile.password_hash !== 'TOKEN_AUTH') {
            set({ error: 'Contraseña incorrecta', loading: false });
            return false;
          }

          const { password_hash: _, ...userWithoutHash } = profile;
          set({ user: userWithoutHash as Profile, loading: false });
          return true;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      signUpFisio: async (email, password, fullName, signupData) => {
        set({ loading: true, error: null });
        const cleanEmail = email.toLowerCase().trim();
        const computedHash = await hashPassword(password);

        try {
          let userId: string | null = null;

          // 1. Intento con Edge Function auth-register
          try {
            const res = await fetchWithRetry(`${functionsUrl}/auth-register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: cleanEmail,
                password,
                fullName,
                role: 'fisioterapeuta',
                especialidad: signupData.especialidades.join(', ') || null,
                universidad: signupData.universidad || null,
                telefono: signupData.telefono || null,
              }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 429) {
              set({ error: 'Demasiados intentos. Espera un minuto.', loading: false });
              return false;
            }
            if (res.ok && data.success) {
              userId = (data.user_id as string) || null;
            }
          } catch (edgeErr) {
            console.warn('Edge function auth-register fallback:', edgeErr);
          }

          // 2. Direct fallback si la edge function no proveyó userId
          let profile: Profile | null = null;
          if (userId) {
            profile = await fetchProfileById(userId);
          }

          if (!profile) {
            // Verificar si el correo ya existe
            const existing = await fetchProfileByEmail(cleanEmail);
            if (existing) {
              set({ error: 'El correo electrónico ya se encuentra registrado', loading: false });
              return false;
            }

            const newId = crypto.randomUUID();
            const { data: newProfile, error: insErr } = await supabase
              .from('profiles')
              .insert({
                id: newId,
                email: cleanEmail,
                full_name: fullName,
                role: 'fisioterapeuta',
                password_hash: computedHash,
                is_active: true,
                cedula: signupData.cedula || null,
                universidad: signupData.universidad || null,
                colegiado_id: signupData.colegiadoId || null,
                telefono: signupData.telefono || null,
                especialidad: signupData.especialidades.join(', ') || null,
                credencial_url: signupData.credencialUrl || null,
                anio_egreso: signupData.anioEgreso ? parseInt(signupData.anioEgreso, 10) : null,
              })
              .select('*')
              .maybeSingle();

            if (insErr || !newProfile) {
              set({ error: insErr?.message || 'Error creando el perfil profesional', loading: false });
              return false;
            }
            profile = newProfile as Profile;
            userId = profile.id;
          }

          // Actualizar datos complementarios
          const updates: Record<string, unknown> = {};
          if (signupData.cedula) updates.cedula = signupData.cedula;
          if (signupData.colegiadoId) updates.colegiado_id = signupData.colegiadoId;
          if (signupData.credencialUrl) updates.credencial_url = signupData.credencialUrl;
          if (signupData.anioEgreso) updates.anio_egreso = parseInt(signupData.anioEgreso, 10);
          if (signupData.universidad) updates.universidad = signupData.universidad;
          if (signupData.especialidades.length > 0) {
            updates.especialidad = signupData.especialidades.join(', ');
          }
          if (signupData.telefono) updates.telefono = signupData.telefono;

          if (Object.keys(updates).length > 0 && userId) {
            try {
              await supabase.from('profiles').update(updates).eq('id', userId);
              const refreshed = await fetchProfileById(userId);
              if (refreshed) profile = refreshed;
            } catch {
              // non-critical
            }
          }

          if (signupData.especialidades.length > 0 && userId) {
            try {
              const { data: espRows } = await supabase
                .from('especialidades')
                .select('id, nombre')
                .in('nombre', signupData.especialidades);
              if (espRows && espRows.length > 0) {
                const relRows = espRows.map((e) => ({
                  profile_id: userId,
                  especialidad_id: e.id,
                }));
                await supabase.from('profile_especialidades').insert(relRows);
              }
            } catch {
              // non-critical
            }
          }

          set({ user: profile, loading: false });
          return true;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      signInWithToken: async (token, _email?: string, _password?: string) => {
        set({ loading: true, error: null });
        const cleanToken = token.trim();

        // Acceso demo inmediato para tokens de prueba
        if (DEMO_TOKENS.includes(cleanToken) || cleanToken === '123456' || cleanToken.toLowerCase() === 'demo') {
          set({ user: DEMO_PATIENT_PROFILE, loading: false, error: null });
          return true;
        }

        try {
          const { data: tokenRow, error: tokenError } = await supabase
            .from('activation_tokens')
            .select('id, token, paciente_id, terapeuta_id, email, password_hash')
            .eq('token', cleanToken)
            .maybeSingle();

          if (tokenError || !tokenRow) {
            if (cleanToken === '123456' || DEMO_TOKENS.includes(cleanToken)) {
              set({ user: DEMO_PATIENT_PROFILE, loading: false, error: null });
              return true;
            }
            set({ error: 'Token no encontrado o inválido', loading: false });
            return false;
          }

          const row = tokenRow as {
            id: string;
            paciente_id: string | null;
            terapeuta_id: string | null;
            email?: string | null;
            password_hash?: string | null;
          };

          if (!row.paciente_id) {
            set({ error: 'Este token no tiene un paciente asignado', loading: false });
            return false;
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', row.paciente_id)
            .maybeSingle();

          if (profileError || !profile) {
            set({ error: 'No se encontró el perfil del paciente', loading: false });
            return false;
          }

          await supabase
            .from('profiles')
            .update({ is_active: true, updated_at: new Date().toISOString() })
            .eq('id', row.paciente_id);

          if (row.terapeuta_id) {
            await supabase
              .from('pacientes_terapeutas')
              .upsert({ paciente_id: row.paciente_id, terapeuta_id: row.terapeuta_id });
          }

          const { password_hash: _, ...userWithoutHash } = profile;
          set({ user: userWithoutHash as Profile, loading: false });
          return true;
        } catch (e) {
          if (cleanToken === '123456' || DEMO_TOKENS.includes(cleanToken)) {
            set({ user: DEMO_PATIENT_PROFILE, loading: false, error: null });
            return true;
          }
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      signInPatientWithEmail: async (email: string, password: string, token?: string) => {
        set({ loading: true, error: null });
        const cleanEmail = email.toLowerCase().trim();

        // Acceso demo
        if (cleanEmail === 'paciente@demo.com' || cleanEmail === 'demo@paciente.com' || token === '123456') {
          set({ user: DEMO_PATIENT_PROFILE, loading: false, error: null });
          return true;
        }

        try {
          // 1. Intentar con auth-login
          try {
            const res = await fetchWithRetry(`${functionsUrl}/auth-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: cleanEmail, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 429) {
              set({ error: 'Demasiados intentos. Espera un minuto.', loading: false });
              return false;
            }
            if (res.ok && data.success) {
              const userId = data.user_id as string | null;
              let profile = userId ? await fetchProfileById(userId) : null;
              if (!profile) profile = await fetchProfileByEmail(cleanEmail);
              if (profile) {
                set({ user: profile, loading: false });
                return true;
              }
            }
          } catch (edgeErr) {
            console.warn('Edge function patient login fallback:', edgeErr);
          }

          // 2. Direct fallback
          const computedHash = await hashPassword(password);
          const { data: profile, error: dbError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (dbError || !profile) {
            set({ error: 'Correo o contraseña incorrectos', loading: false });
            return false;
          }

          if (profile.password_hash && profile.password_hash !== computedHash && profile.password_hash !== 'TOKEN_AUTH') {
            set({ error: 'Contraseña incorrecta', loading: false });
            return false;
          }

          const { password_hash: _, ...userWithoutPassword } = profile;
          set({ user: userWithoutPassword as Profile, loading: false });
          return true;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      linkTokenToEmail: async (token: string, email: string, password: string, fullName?: string) => {
        set({ loading: true, error: null });
        const cleanToken = token.trim();
        const cleanEmail = email.toLowerCase().trim();

        // Demo shortcut
        if (DEMO_TOKENS.includes(cleanToken) || cleanToken === '123456' || cleanEmail === 'paciente@demo.com') {
          set({ user: DEMO_PATIENT_PROFILE, loading: false, error: null });
          return true;
        }

        try {
          // 1. Intentar con la Edge Function patient-activate
          try {
            const res = await fetchWithRetry(`${functionsUrl}/patient-activate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: cleanToken, email: cleanEmail, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 429) {
              set({ error: 'Demasiados intentos. Espera un minuto.', loading: false });
              return false;
            }
            if (res.ok && data.success) {
              const userId = data.user_id as string | null;
              let profile = userId ? await fetchProfileById(userId) : null;
              if (!profile) profile = await fetchProfileByEmail(cleanEmail);
              if (profile) {
                set({ user: profile, loading: false });
                return true;
              }
            }
          } catch (edgeErr) {
            console.warn('Edge function patient-activate fallback:', edgeErr);
          }

          // 2. Direct Supabase Fallback
          const { data: tokenData, error: tokErr } = await supabase
            .from('activation_tokens')
            .select('*')
            .eq('token', cleanToken)
            .maybeSingle();

          if (tokErr || !tokenData) {
            set({ error: 'Token inválido o no encontrado', loading: false });
            return false;
          }

          if (tokenData.is_used) {
            set({ error: 'Este token ya fue utilizado previamente', loading: false });
            return false;
          }

          const passwordHash = await hashPassword(password);
          let pacienteId = tokenData.paciente_id;

          if (pacienteId) {
            // Actualizar el perfil existente
            await supabase
              .from('profiles')
              .update({
                email: cleanEmail,
                password_hash: passwordHash,
                is_active: true,
                ...(fullName ? { full_name: fullName } : {}),
                updated_at: new Date().toISOString(),
              })
              .eq('id', pacienteId);

            // Actualizar paciente_terapeuta si existe
            if (tokenData.terapeuta_id) {
              await supabase
                .from('pacientes_terapeutas')
                .upsert({ paciente_id: pacienteId, terapeuta_id: tokenData.terapeuta_id });
            }
          } else {
            // Crear nuevo perfil de paciente
            pacienteId = crypto.randomUUID();
            const { error: insErr } = await supabase
              .from('profiles')
              .insert({
                id: pacienteId,
                email: cleanEmail,
                password_hash: passwordHash,
                full_name: fullName || 'Paciente FisioMirror',
                role: 'paciente',
                is_active: true,
              });

            if (insErr) {
              set({ error: 'Error al registrar perfil: ' + insErr.message, loading: false });
              return false;
            }

            if (tokenData.terapeuta_id) {
              await supabase
                .from('pacientes_terapeutas')
                .upsert({ paciente_id: pacienteId, terapeuta_id: tokenData.terapeuta_id });
            }
          }

          // Marcar token como usado
          await supabase
            .from('activation_tokens')
            .update({
              is_used: true,
              email_asignado: cleanEmail,
              paciente_id: pacienteId,
            })
            .eq('id', tokenData.id);

          const finalProfile = await fetchProfileById(pacienteId);
          if (!finalProfile) {
            set({ error: 'No se pudo recuperar el perfil vinculado', loading: false });
            return false;
          }

          const { password_hash: _, ...userWithoutHash } = finalProfile;
          set({ user: userWithoutHash as Profile, loading: false });
          return true;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      signUpPaciente: async (email, password, fullName) => {
        set({ loading: true, error: null });
        const cleanEmail = email.toLowerCase().trim();
        const computedHash = await hashPassword(password);

        try {
          // Intentar Edge function
          try {
            const res = await fetchWithRetry(`${functionsUrl}/auth-register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: cleanEmail,
                password,
                fullName,
                role: 'paciente',
              }),
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success && data.user_id) {
              const profile = await fetchProfileById(data.user_id);
              if (profile) {
                set({ user: profile, loading: false });
                return true;
              }
            }
          } catch (edgeErr) {
            console.warn('Edge function auth-register fallback:', edgeErr);
          }

          // Fallback directo
          const newId = crypto.randomUUID();
          const { data: newProfile, error: insErr } = await supabase
            .from('profiles')
            .insert({
              id: newId,
              email: cleanEmail,
              password_hash: computedHash,
              full_name: fullName,
              role: 'paciente',
              is_active: true,
            })
            .select('*')
            .maybeSingle();

          if (insErr || !newProfile) {
            set({ error: insErr?.message || 'Error al registrar paciente', loading: false });
            return false;
          }

          set({ user: newProfile as Profile, loading: false });
          return true;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      validateToken: async (token) => {
        const clean = token.trim();
        if (DEMO_TOKENS.includes(clean) || clean === '123456' || clean.toLowerCase() === 'demo') {
          return true;
        }
        try {
          const { data, error } = await supabase
            .from('activation_tokens')
            .select('paciente_id, is_used')
            .eq('token', clean)
            .maybeSingle();
          if (error || !data) return false;
          return !data.is_used;
        } catch {
          return false;
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        const currentUser = get().user;
        if (!currentUser?.id) {
          return { success: false, error: 'No hay usuario autenticado' };
        }

        // Demo user simulation
        if (isDemoAccount(currentUser)) {
          return { success: true };
        }

        try {
          const currentHash = await hashPassword(currentPassword);
          const newHash = await hashPassword(newPassword);

          // 1. Verify current password in profiles table if password_hash exists
          const { data: prof } = await supabase
            .from('profiles')
            .select('id, password_hash, email')
            .eq('id', currentUser.id)
            .maybeSingle();

          if (prof?.password_hash && prof.password_hash !== currentHash) {
            return { success: false, error: 'La contraseña actual es incorrecta' };
          }

          // 2. Update password_hash in profiles table
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ password_hash: newHash, updated_at: new Date().toISOString() })
            .eq('id', currentUser.id);

          if (updateError) {
            console.warn('Profile password update notice:', updateError);
          }

          // 3. Try edge function with correct headers if available
          try {
            await fetchWithRetry(`${functionsUrl}/auth-update-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({
                userId: currentUser.id,
                currentPassword,
                newPassword,
              }),
            });
          } catch (edgeErr) {
            console.warn('Edge function auth-update-password notice:', edgeErr);
          }

          // 4. Also update Supabase Auth user if session is present
          try {
            await supabase.auth.updateUser({ password: newPassword });
          } catch {
            // non-critical
          }

          // 5. Security audit notification & security email alert
          try {
            await supabase.from('notifications').insert({
              user_id: currentUser.id,
              title: 'Contraseña Actualizada',
              message: `La contraseña de tu cuenta fue actualizada el ${new Date().toLocaleString()}. Si no fuiste tú, contacta inmediatamente a soporte.`,
              type: 'seguridad',
              read: false,
            });

            if (currentUser.email) {
              fetch('/api/send-security-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: currentUser.email,
                  event: 'password_updated',
                  userName: currentUser.full_name || 'Usuario',
                }),
              }).catch(() => {});
            }
          } catch {
            // non-critical
          }

          return { success: true };
        } catch (err) {
          return { success: false, error: (err as Error).message || 'Error al cambiar contraseña' };
        }
      },

      signOut: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({ user: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        storedAt: Date.now(),
      }),
    },
  ),
);
