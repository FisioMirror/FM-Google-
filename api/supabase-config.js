export const SUPABASE_FALLBACK = {
  url: 'https://mnkqfrulcpxpwaftokdi.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3FmcnVsY3B4cHdhZnRva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5OTAsImV4cCI6MjA5NzY0Njk5MH0.lsbk4vs8F3uvp4gOqs0Ydz7V7zh04MJqWC919KssRQ0',
};

export function getCleanSupabaseUrl(raw) {
  const val = raw || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!val || typeof val !== 'string') return SUPABASE_FALLBACK.url;
  const trimmed = val.trim();
  try {
    const parsed = new URL(trimmed);
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && !trimmed.includes('knbgeddxslrtfkhcohgb')) {
      return trimmed;
    }
  } catch {
    // try regex extraction
  }

  const match = trimmed.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/i);
  if (match && !match[0].includes('knbgeddxslrtfkhcohgb')) {
    return match[0];
  }

  return SUPABASE_FALLBACK.url;
}

export function getCleanSupabaseKey(raw) {
  const val = raw || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!val || typeof val !== 'string') return SUPABASE_FALLBACK.anonKey;
  const trimmed = val.trim();
  if (trimmed.startsWith('eyJ') && !trimmed.includes('knbgeddxslrtfkhcohgb') && !trimmed.includes(' ')) {
    return trimmed;
  }

  const match = trimmed.match(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/);
  if (match && !match[0].includes('knbgeddxslrtfkhcohgb')) {
    return match[0];
  }

  return SUPABASE_FALLBACK.anonKey;
}
