-- Migration: 20260828000000_create_pgvector_and_webhooks.sql
-- Description: Enable pgvector, create clinical embeddings table with RLS, cosine similarity search RPC, and database webhook automation.

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
-- Create in public if extensions schema is not default
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

-- 2. Create expedientes_embeddings table for clinical semantic search
CREATE TABLE IF NOT EXISTS public.expedientes_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  terapeuta_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  documento_id uuid REFERENCES public.documentos_clinicos(id) ON DELETE CASCADE,
  titulo text NOT NULL DEFAULT 'Documento Clínico',
  contenido text NOT NULL,
  categoria text DEFAULT 'evolucion',
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for semantic similarity using Cosine Distance (<=>)
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS expedientes_embeddings_vector_idx
    ON public.expedientes_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
EXCEPTION
  WHEN others THEN
    -- Fallback to HNSW or sequential if IVFFlat index list limit not met with small table
    NULL;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.expedientes_embeddings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anon all on expedientes_embeddings" ON public.expedientes_embeddings;
DROP POLICY IF EXISTS "Therapists can view assigned patient embeddings" ON public.expedientes_embeddings;
DROP POLICY IF EXISTS "Therapists can insert patient embeddings" ON public.expedientes_embeddings;
DROP POLICY IF EXISTS "Patients can view own embeddings" ON public.expedientes_embeddings;

-- For Custom Auth and Supabase Auth hybrid:
CREATE POLICY "Allow anon read expedientes_embeddings"
  ON public.expedientes_embeddings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon write expedientes_embeddings"
  ON public.expedientes_embeddings
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. RPC Function for Cosine Similarity Search: match_expedientes_clinicos
CREATE OR REPLACE FUNCTION public.match_expedientes_clinicos (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.65,
  match_count int DEFAULT 5,
  filter_terapeuta_id uuid DEFAULT NULL,
  filter_paciente_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  paciente_id uuid,
  terapeuta_id uuid,
  documento_id uuid,
  titulo text,
  contenido text,
  categoria text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.paciente_id,
    e.terapeuta_id,
    e.documento_id,
    e.titulo,
    e.contenido,
    e.categoria,
    e.metadata,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.expedientes_embeddings e
  WHERE
    (filter_terapeuta_id IS NULL OR e.terapeuta_id = filter_terapeuta_id)
    AND (filter_paciente_id IS NULL OR e.paciente_id = filter_paciente_id)
    AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION public.match_expedientes_clinicos TO anon, authenticated, service_role;

-- 4. Database Trigger for Automatic Notifications / Webhooks on new Activation Token
CREATE OR REPLACE FUNCTION public.handle_new_activation_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_therapist_name text;
BEGIN
  -- Fetch therapist full name
  SELECT full_name INTO v_therapist_name
  FROM public.profiles
  WHERE id = NEW.terapeuta_id;

  IF v_therapist_name IS NULL THEN
    v_therapist_name := 'Tu Fisioterapeuta';
  END IF;

  -- If patient is already assigned or email is present, insert an internal notification
  IF NEW.paciente_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      link,
      read
    ) VALUES (
      NEW.paciente_id,
      'Nuevo Plan de Rehabilitación Asignado',
      format('%s te ha asignado un nuevo plan con el token de acceso %s.', v_therapist_name, NEW.token),
      'sistema',
      format('/registro-paciente?token=%s', NEW.token),
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_activation_token ON public.activation_tokens;
CREATE TRIGGER trg_notify_activation_token
  AFTER INSERT ON public.activation_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_activation_token();
