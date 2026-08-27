import { supabase, supabaseUrl, supabaseAnonKey } from './supabase';

export type AIJobType = 'image_analysis' | 'text_generation' | 'insights' | 'summaries' | 'pdf_report';

export interface AIJobInput {
  imageBase64?: string;
  mimeType?: string;
  prompt?: string;
  userPrompt?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  context?: Record<string, unknown>;
  data?: Record<string, unknown>;
  summaryType?: string;
  audioTranscription?: string;
}

export interface AIJobResult {
  success: boolean;
  result?: string;
  error?: string;
}

const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 120_000;

export function normalizeBase64(raw: string): string {
  let b64 = raw;
  const commaIdx = b64.indexOf(',');
  if (b64.startsWith('data:') && commaIdx !== -1) b64 = b64.slice(commaIdx + 1);
  b64 = b64.replace(/\s+/g, '');
  return b64;
}

export function inferMimeType(dataUrl: string, fallback?: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  if (match) return match[1];
  return fallback || 'image/jpeg';
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error('Error de red');
}

export async function createAIJob(type: AIJobType, input_data: AIJobInput): Promise<string | null> {
  // Ensure appropriate maxTokens to prevent cut-off responses
  if (!input_data.maxTokens || input_data.maxTokens < 2048) {
    input_data.maxTokens = 2048;
  }

  // 1. Try Supabase Edge Function directly
  try {
    const fnUrl = `${supabaseUrl}/functions/v1/create-job`;
    const response = await fetchWithRetry(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ type, input_data }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.job_id) return data.job_id as string;
    }
  } catch (err) {
    console.warn('Edge function create-job direct call failed, attempting database fallback:', err);
  }

  // 2. Try proxy /api/create-job if available
  try {
    const response = await fetchWithRetry('/api/create-job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ type, input_data }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.job_id) return data.job_id as string;
    }
  } catch {
    // Continue to database insert fallback
  }

  // 3. Fallback: Insert directly into Supabase 'ai_jobs' table
  try {
    const { data, error } = await supabase
      .from('ai_jobs')
      .insert({ type, input_data, status: 'pending' })
      .select()
      .single();

    if (!error && data?.id) {
      // Trigger process-job asynchronously
      fetch(`${supabaseUrl}/functions/v1/process-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ job_id: data.id }),
      }).catch((e) => console.warn('Background process-job trigger notice:', e));

      return data.id as string;
    }
  } catch (err) {
    console.error('Supabase DB ai_jobs insert fallback failed:', err);
  }

  throw new Error('No se pudo inicializar el servicio de IA. Inténtalo nuevamente.');
}

export async function pollAIJob(jobId: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<AIJobResult> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // 1. Check directly via Supabase database
    try {
      const { data, error } = await supabase
        .from('ai_jobs')
        .select('status, result, error')
        .eq('id', jobId)
        .maybeSingle();

      if (!error && data) {
        if (data.status === 'completed') {
          return { success: true, result: data.result };
        }
        if (data.status === 'failed') {
          return { success: false, error: data.error || 'El procesamiento de IA falló' };
        }
      }
    } catch {
      // fallback to endpoint check
    }

    // 2. Check via Edge Function get-job
    try {
      const res = await fetchWithRetry(`${supabaseUrl}/functions/v1/get-job?job_id=${jobId}`, {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'completed') return { success: true, result: data.result };
        if (data.status === 'failed') return { success: false, error: data.error || 'El job de IA falló' };
      }
    } catch {
      // wait next iteration
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return { success: false, error: 'Tiempo de espera agotado al procesar la solicitud de IA.' };
}

export async function runAIJob(type: AIJobType, input_data: AIJobInput, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<AIJobResult> {
  try {
    const normalizedInput: AIJobInput = { ...input_data };
    if (normalizedInput.imageBase64) {
      normalizedInput.imageBase64 = normalizeBase64(normalizedInput.imageBase64);
    }
    const jobId = await createAIJob(type, normalizedInput);
    if (!jobId) return { success: false, error: 'No se pudo generar la tarea de IA' };
    return await pollAIJob(jobId, timeoutMs);
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function transcribeAudio(audioBase64: string, mimeType?: string): Promise<{ success: boolean; transcription?: string; error?: string }> {
  try {
    const cleanBase64 = normalizeBase64(audioBase64);
    const fnUrl = `${supabaseUrl}/functions/v1/transcribe-audio`;
    const response = await fetchWithRetry(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ audioBase64: cleanBase64, mimeType: mimeType || 'audio/webm' }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error al transcribir audio' };
    }
    const data = await response.json();
    return { success: true, transcription: data.text || data.transcription };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function ocrUpdatePatient(imageBase64: string, patientId: string, mimeType?: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const cleanBase64 = normalizeBase64(imageBase64);
    const fnUrl = `${supabaseUrl}/functions/v1/ocr-prescripcion`;
    const response = await fetchWithRetry(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ imageBase64: cleanBase64, mimeType: mimeType || 'image/jpeg', mode: 'update', patientId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error al analizar documento' };
    }
    const data = await response.json();
    if (data.error) return { success: false, error: data.error };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = inferMimeType(result, file.type || 'image/jpeg');
      const base64 = normalizeBase64(result);
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
