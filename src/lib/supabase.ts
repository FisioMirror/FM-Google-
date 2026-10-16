import { createClient } from '@supabase/supabase-js';
import { SUPABASE_FALLBACK } from '../config/supabase-fallback';

let configuredUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
let configuredAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Strict sanitization: extract only the actual HTTPS Supabase URL if notes or strings were passed
if (configuredUrl) {
  const match = configuredUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
  configuredUrl = match ? match[0] : undefined;
}

if (!configuredUrl || configuredUrl.includes('knbgeddxslrtfkhcohgb')) {
  console.warn('[FisioMirror] Detectadas credenciales antiguas o inválidas. Usando respaldo de seguridad.');
  configuredUrl = SUPABASE_FALLBACK.url;
}

// Strict sanitization: extract only valid JWT anon key token
if (configuredAnonKey) {
  const match = configuredAnonKey.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  configuredAnonKey = match ? match[0] : undefined;
}

if (!configuredAnonKey || configuredAnonKey.includes('knbgeddxslrtfkhcohgb')) {
  configuredAnonKey = SUPABASE_FALLBACK.anonKey;
}

export const supabaseUrl = configuredUrl;
export const supabaseAnonKey = configuredAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
