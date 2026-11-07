import { createClient } from '@supabase/supabase-js';
import { SUPABASE_FALLBACK } from '../config/supabase-fallback';

function resolveSupabaseUrl(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) {
    return SUPABASE_FALLBACK.url;
  }
  const trimmed = raw.trim();

  // 1. If it contains a supabase.co URL anywhere, extract it
  const match = trimmed.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/i);
  if (match && !match[0].includes('knbgeddxslrtfkhcohgb')) {
    return match[0];
  }

  // 2. Check if the string itself is a valid http/https URL
  try {
    const parsed = new URL(trimmed);
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && !trimmed.includes('knbgeddxslrtfkhcohgb')) {
      return trimmed;
    }
  } catch {
    // Ignore invalid URL parse
  }

  return SUPABASE_FALLBACK.url;
}

function resolveSupabaseAnonKey(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) {
    return SUPABASE_FALLBACK.anonKey;
  }
  const trimmed = raw.trim();

  // 1. Match standard JWT pattern
  const match = trimmed.match(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/);
  if (match && !match[0].includes('knbgeddxslrtfkhcohgb')) {
    return match[0];
  }

  if (trimmed.startsWith('eyJ') && !trimmed.includes('knbgeddxslrtfkhcohgb') && !trimmed.includes(' ')) {
    return trimmed;
  }

  return SUPABASE_FALLBACK.anonKey;
}

const rawEnvUrl = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
const rawEnvKey = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

const resolvedUrl = resolveSupabaseUrl(rawEnvUrl);

// Extra sanity check to guarantee createClient will never throw an invalid URL error
export const supabaseUrl = (() => {
  try {
    const u = new URL(resolvedUrl);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return resolvedUrl;
    }
  } catch {
    // fallback
  }
  return SUPABASE_FALLBACK.url;
})();

export const supabaseAnonKey = resolveSupabaseAnonKey(rawEnvKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

