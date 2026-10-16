-- ==============================================================================
-- MIGRATION: 20261012000000_create_audit_logs_system.sql
-- DESCRIPTION: Sistema integral de Bitácora de Auditoría Clínica e Inmutable
-- FisioMirror Platform - PostgreSQL & Supabase
-- ==============================================================================

-- 1. TABLA PRINCIPAL DE AUDITORÍA (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Identificación del Actor
  actor_id uuid,
  actor_email text,
  actor_role text DEFAULT 'anonimo',
  ip_address text,
  user_agent text,
  
  -- Acción y Entidad
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  
  -- Diff y Snapshots JSONB
  old_values jsonb,
  new_values jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Nivel de Severidad
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warn', 'error', 'critical'))
);

-- Comentarios explicativos
COMMENT ON TABLE audit_logs IS 'Bitácora de auditoría forense inmutable de acciones de usuario y cambios clínicos en FisioMirror.';
COMMENT ON COLUMN audit_logs.severity IS 'Nivel de severidad del evento: info, warn, error, critical';

-- 2. ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs (actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs (severity);

-- 3. INMUTABILIDAD ESTRICTA (PREVENCIÓN DE UPDATE Y DELETE)
CREATE OR REPLACE FUNCTION fn_prevent_audit_log_tampering()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'VIOLACIÓN DE INTEGRIDAD FORENSE: Los registros de audit_logs son inmutables y no pueden modificarse ni eliminarse.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_tampering ON audit_logs;
CREATE TRIGGER trg_prevent_audit_tampering
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_audit_log_tampering();

-- 4. TRIGGER MAESTRO PARA CAPTURA AUTOMÁTICA DE CAMBIOS EN TABLAS CLÍNICAS
CREATE OR REPLACE FUNCTION fn_audit_table_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id uuid := NULL;
  v_actor_email text := NULL;
  v_actor_role text := 'sistema';
  v_old_data jsonb := NULL;
  v_new_data jsonb := NULL;
  v_entity_id text := NULL;
  v_action text := '';
  v_severity text := 'info';
BEGIN
  -- Intentar obtener el ID del usuario actual de la sesión de Supabase Auth
  BEGIN
    v_actor_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    v_new_data := to_jsonb(NEW);
    -- Enmascarar contraseñas o hashes sensibles si existen en el snapshot
    IF v_new_data ? 'password_hash' THEN
      v_new_data := v_new_data || jsonb_build_object('password_hash', '[PROTEGIDO]');
    END IF;
    
    v_action := TG_TABLE_NAME || '_CREATE';
    IF v_new_data ? 'id' THEN
      v_entity_id := v_new_data->>'id';
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    
    -- Enmascarar datos sensibles
    IF v_old_data ? 'password_hash' THEN
      v_old_data := v_old_data || jsonb_build_object('password_hash', '[PROTEGIDO]');
    END IF;
    IF v_new_data ? 'password_hash' THEN
      v_new_data := v_new_data || jsonb_build_object('password_hash', '[PROTEGIDO]');
    END IF;

    v_action := TG_TABLE_NAME || '_UPDATE';
    IF v_new_data ? 'id' THEN
      v_entity_id := v_new_data->>'id';
    ELSIF v_old_data ? 'id' THEN
      v_entity_id := v_old_data->>'id';
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    IF v_old_data ? 'password_hash' THEN
      v_old_data := v_old_data || jsonb_build_object('password_hash', '[PROTEGIDO]');
    END IF;

    v_action := TG_TABLE_NAME || '_DELETE';
    v_severity := 'warn';
    IF v_old_data ? 'id' THEN
      v_entity_id := v_old_data->>'id';
    END IF;
  END IF;

  -- Insertar el registro de auditoría
  INSERT INTO audit_logs (
    actor_id,
    actor_email,
    actor_role,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata,
    severity
  ) VALUES (
    v_actor_id,
    v_actor_email,
    v_actor_role,
    v_action,
    TG_TABLE_NAME,
    v_entity_id,
    v_old_data,
    v_new_data,
    jsonb_build_object('trigger_op', TG_OP, 'schema', TG_TABLE_SCHEMA),
    v_severity
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 5. ASOCIACIÓN DE TRIGGERS A TABLAS EXISTENTES
DO $$
BEGIN
  -- Trigger en profiles
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP TRIGGER IF EXISTS trg_audit_profiles ON profiles;
    CREATE TRIGGER trg_audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION fn_audit_table_mutation();
  END IF;

  -- Trigger en rutinas
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rutinas') THEN
    DROP TRIGGER IF EXISTS trg_audit_rutinas ON rutinas;
    CREATE TRIGGER trg_audit_rutinas
    AFTER INSERT OR UPDATE OR DELETE ON rutinas
    FOR EACH ROW EXECUTE FUNCTION fn_audit_table_mutation();
  END IF;

  -- Trigger en sesiones_rehabilitacion
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sesiones_rehabilitacion') THEN
    DROP TRIGGER IF EXISTS trg_audit_sesiones ON sesiones_rehabilitacion;
    CREATE TRIGGER trg_audit_sesiones
    AFTER INSERT OR UPDATE OR DELETE ON sesiones_rehabilitacion
    FOR EACH ROW EXECUTE FUNCTION fn_audit_table_mutation();
  END IF;

  -- Trigger en activation_tokens
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activation_tokens') THEN
    DROP TRIGGER IF EXISTS trg_audit_activation_tokens ON activation_tokens;
    CREATE TRIGGER trg_audit_activation_tokens
    AFTER INSERT OR UPDATE OR DELETE ON activation_tokens
    FOR EACH ROW EXECUTE FUNCTION fn_audit_table_mutation();
  END IF;

  -- Trigger en documentos_clinicos
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documentos_clinicos') THEN
    DROP TRIGGER IF EXISTS trg_audit_documentos_clinicos ON documentos_clinicos;
    CREATE TRIGGER trg_audit_documentos_clinicos
    AFTER INSERT OR UPDATE OR DELETE ON documentos_clinicos
    FOR EACH ROW EXECUTE FUNCTION fn_audit_table_mutation();
  END IF;
END $$;

-- 6. FUNCIÓN RPC PARA EVENTOS DE APLICACIÓN (LOGINS, LECTURA DE EXPEDIENTE, REPORTES)
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL,
  p_actor_id uuid DEFAULT NULL,
  p_actor_email text DEFAULT NULL,
  p_actor_role text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted_id uuid;
  v_effective_actor_id uuid := p_actor_id;
  v_effective_email text := p_actor_email;
  v_effective_role text := COALESCE(p_actor_role, 'anonimo');
  v_severity text := p_severity;
BEGIN
  -- Si no se suministró actor explícito, extraer de auth.uid()
  IF v_effective_actor_id IS NULL THEN
    BEGIN
      v_effective_actor_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
      v_effective_actor_id := NULL;
    END IF;
  END IF;

  -- Validar severidad permitida
  IF v_severity NOT IN ('info', 'warn', 'error', 'critical') THEN
    v_severity := 'info';
  END IF;

  INSERT INTO audit_logs (
    actor_id,
    actor_email,
    actor_role,
    action,
    entity_type,
    entity_id,
    metadata,
    severity
  ) VALUES (
    v_effective_actor_id,
    v_effective_email,
    v_effective_role,
    p_action,
    p_entity_type,
    p_entity_id,
    COALESCE(p_metadata, '{}'::jsonb),
    v_severity
  )
  RETURNING id INTO v_inserted_id;

  RETURN v_inserted_id;
END;
$$;

-- Otorgar ejecución a usuarios autenticados y anónimos (para logins fallidos o verificaciones públicas)
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event TO anon;

-- 7. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política de lectura: Solo fisioterapeutas o personal con rol autorizado pueden consultar la bitácora
DROP POLICY IF EXISTS "Solo fisioterapeutas pueden consultar auditoria" ON audit_logs;
CREATE POLICY "Solo fisioterapeutas pueden consultar auditoria"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'fisioterapeuta'
  )
);

-- Denegar inserción/modificación directa por SQL directo (debe hacerse mediante RPC o Trigger)
DROP POLICY IF EXISTS "Prohibir insercion directa en audit_logs" ON audit_logs;
CREATE POLICY "Prohibir insercion directa en audit_logs"
ON audit_logs FOR INSERT
TO authenticated, anon
WITH CHECK (false);
