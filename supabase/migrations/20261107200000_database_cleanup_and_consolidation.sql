-- ============================================================================
-- FISIOMIRROR DATABASE CLEANUP MIGRATION
-- Senior DBA / Backend Architect Audit
-- Date: 2026-11-07
-- Project: FisioMirror (ref: mnkqfrulcpxpwaftokdi)
-- ============================================================================
-- OBJETIVO: Eliminar tablas fantasma/obsoletas, consolidar esquema unificado
-- en `profiles`, garantizar integridad referencial y mejores prácticas.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- PASO 1: MIGRAR DATOS DE TABLAS LEGACY A TABLAS ACTIVAS
-- -----------------------------------------------------------------------------

-- 1.1 Migrar teléfono de fisioterapeutas desde fisioterapeutas_simple → profiles
--    (PatientLayout.tsx usa fisioterapeutas_simple.telefono)
UPDATE profiles p
SET telefono = fs.telefono
FROM fisioterapeutas_simple fs
WHERE p.id = fs.id
  AND p.role = 'fisioterapeuta'
  AND fs.telefono IS NOT NULL
  AND (p.telefono IS NULL OR p.telefono = '');

-- 1.2 Verificar que documentos_clinicos apunta lógicamente a profiles
--    (FK actual apunta a usuarios.id, pero los IDs son los mismos que profiles.id)
--    No hay migración de datos necesaria, solo corregir FK en paso 2.

-- -----------------------------------------------------------------------------
-- PASO 2: ELIMINAR FOREIGN KEYS QUE REFERENCIAN TABLAS LEGACY
-- -----------------------------------------------------------------------------

-- 2.1 document_clinicos → usuarios (fisioterapeuta_id, paciente_id)
ALTER TABLE documentos_clinicos
    DROP CONSTRAINT IF EXISTS documentos_clinicos_fisioterapeuta_id_fkey,
    DROP CONSTRAINT IF EXISTS documentos_clinicos_paciente_id_fkey;

-- 2.2 fisioterapeutas_simple → usuarios (id)
ALTER TABLE fisioterapeutas_simple
    DROP CONSTRAINT IF EXISTS fisioterapeutas_simple_id_fkey;

-- 2.3 perfiles_simples → usuarios (id)
ALTER TABLE perfiles_simples
    DROP CONSTRAINT IF EXISTS perfiles_simples_id_fkey;

-- 2.4 tokens_activacion → usuarios (created_by, fisioterapeuta_id, used_by)
ALTER TABLE tokens_activacion
    DROP CONSTRAINT IF EXISTS tokens_activacion_created_by_fkey,
    DROP CONSTRAINT IF EXISTS tokens_activacion_fisioterapeuta_id_fkey,
    DROP CONSTRAINT IF EXISTS tokens_activacion_used_by_fkey;

-- 2.5 documentos_medicos → pacientes (paciente_id)
ALTER TABLE documentos_medicos
    DROP CONSTRAINT IF EXISTS documentos_medicos_paciente_id_fkey;

-- 2.6 sesiones_ejercicios → pacientes (paciente_id)
ALTER TABLE sesiones_ejercicios
    DROP CONSTRAINT IF EXISTS sesiones_ejercicios_paciente_id_fkey;

-- 2.7 logros_paciente → logros_definicion (logro_id) y profiles (paciente_id)
ALTER TABLE logros_paciente
    DROP CONSTRAINT IF EXISTS logros_paciente_logro_id_fkey,
    DROP CONSTRAINT IF EXISTS logros_paciente_paciente_id_fkey;

-- -----------------------------------------------------------------------------
-- PASO 3: CREAR FKs CORRECTAS HACIA profiles (tabla unificada)
-- -----------------------------------------------------------------------------

-- 3.1 documentos_clinicos → profiles
ALTER TABLE documentos_clinicos
    ADD CONSTRAINT documentos_clinicos_fisioterapeuta_id_fkey
        FOREIGN KEY (fisioterapeuta_id) REFERENCES profiles(id) ON DELETE NO ACTION,
    ADD CONSTRAINT documentos_clinicos_paciente_id_fkey
        FOREIGN KEY (paciente_id) REFERENCES profiles(id) ON DELETE NO ACTION;

-- -----------------------------------------------------------------------------
-- PASO 4: ELIMINAR TABLAS OBSOLETAS (ORDEN RESPETANDO DEPENDENCIAS)
-- -----------------------------------------------------------------------------

-- 4.1 Tablas de gamificación no usadas (localStorage en useGamification.ts)
DROP TABLE IF EXISTS logros_paciente CASCADE;
DROP TABLE IF EXISTS logros_definicion CASCADE;

-- 4.2 Tablas de sesiones/ejercicios legacy (reemplazadas por sesiones_completadas + patient_exercises)
DROP TABLE IF EXISTS sesiones_ejercicios CASCADE;

-- 4.3 Documentos médicos legacy (reemplazados por documentos_clinicos)
DROP TABLE IF EXISTS documentos_medicos CASCADE;

-- 4.4 Tokens legacy en español (reemplazados por activation_tokens)
DROP TABLE IF EXISTS tokens_activacion CASCADE;

-- 4.5 Tablas de usuarios/perfiles legacy (reemplazadas por profiles unificado)
--     fisioterapeutas_simple y perfiles_simples tienen FK a usuarios con CASCADE,
--     al borrar usuarios se borran en cascada. Pero las borramos explícitamente por claridad.
DROP TABLE IF EXISTS fisioterapeutas_simple CASCADE;
DROP TABLE IF EXISTS perfiles_simples CASCADE;

-- 4.6 Tabla pacientes legacy (reemplazada por profiles.role='paciente' + pacientes_terapeutas)
DROP TABLE IF EXISTS pacientes CASCADE;

-- 4.7 Tabla usuarios legacy (auth custom, NO Supabase Auth)
DROP TABLE IF EXISTS usuarios CASCADE;

-- 4.8 Tablas no usadas / experimentales
DROP TABLE IF EXISTS expedientes_embeddings CASCADE;
DROP TABLE IF EXISTS rate_limits CASCADE;

-- -----------------------------------------------------------------------------
-- PASO 5: MEJORAS DE INTEGRIDAD REFERENCIAL EN TABLAS ACTIVAS
-- -----------------------------------------------------------------------------

-- 5.1 activation_tokens: asegurar FKs correctas (ya existen, verificar)
--    terapeuta_id → profiles (NO ACTION), paciente_id → profiles (SET NULL), used_by → profiles (NO ACTION)

-- 5.2 session_adjustments: agregar columnas clínicas nuevas (ya en migración 20261107180000)
--    Verificar FKs: paciente_id CASCADE, fisio_id SET NULL

-- 5.3 patient_exercises: FKs correctas (paciente_id CASCADE, ejercicio_id SET NULL, rutina_id SET NULL, fisio_id CASCADE)

-- 5.4 rutinas: FKs a profiles (NO ACTION) - considerar CASCADE para fisioterapeuta_id/paciente_id si se borra usuario

-- 5.5 sesiones_completadas: FKs a profiles (NO ACTION) - considerar CASCADE

-- 5.6 pain_reports: paciente_id CASCADE, leido_por SET NULL

-- 5.7 post_session_reports: paciente_id CASCADE (ya existe)

-- 5.8 notifications: user_id CASCADE (ya existe)

-- 5.9 ai_conversations: user_id CASCADE (ya existe)

-- 5.10 profile_especialidades: profile_id CASCADE (ya existe)

-- -----------------------------------------------------------------------------
-- PASO 6: RESTRICCIONES CHECK Y DEFAULTS EN TABLAS CORE
-- -----------------------------------------------------------------------------

-- 6.1 profiles: role check constraint
ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
    ADD CONSTRAINT profiles_role_check
        CHECK (role IN ('fisioterapeuta','paciente'));

-- 6.2 pain_reports: nivel 0-10
ALTER TABLE pain_reports
    DROP CONSTRAINT IF EXISTS pain_reports_nivel_check;
ALTER TABLE pain_reports
    ADD CONSTRAINT pain_reports_nivel_check
        CHECK (nivel >= 0 AND nivel <= 10);

-- 6.3 session_adjustments: restricciones clínicas (ya en migración 20261107180000)
--    dolor_eva 0-10, rom_actual/objetivo 0-180, progresion 0-100, frecuencia_semanal 1-7, duracion_min 5-120

-- 6.4 post_session_reports: dolor_antes/despues 0-10, fatiga_nivel 0-10
ALTER TABLE post_session_reports
    DROP CONSTRAINT IF EXISTS post_session_reports_dolor_antes_check;
ALTER TABLE post_session_reports
    ADD CONSTRAINT post_session_reports_dolor_antes_check
        CHECK (dolor_antes IS NULL OR (dolor_antes >= 0 AND dolor_antes <= 10));
ALTER TABLE post_session_reports
    DROP CONSTRAINT IF EXISTS post_session_reports_dolor_despues_check;
ALTER TABLE post_session_reports
    ADD CONSTRAINT post_session_reports_dolor_despues_check
        CHECK (dolor_despues IS NULL OR (dolor_despues >= 0 AND dolor_despues <= 10));
ALTER TABLE post_session_reports
    DROP CONSTRAINT IF EXISTS post_session_reports_fatiga_nivel_check;
ALTER TABLE post_session_reports
    ADD CONSTRAINT post_session_reports_fatiga_nivel_check
        CHECK (fatiga_nivel IS NULL OR (fatiga_nivel >= 0 AND fatiga_nivel <= 10));

-- 6.5 rutinas: estado coherente
ALTER TABLE rutinas
    DROP CONSTRAINT IF EXISTS rutinas_activa_check;
ALTER TABLE rutinas
    ADD CONSTRAINT rutinas_activa_check
        CHECK (activa IN (true, false));

-- -----------------------------------------------------------------------------
-- PASO 7: ÍNDICES DE RENDIMIENTO PARA CONSULTAS FRECUENTES
-- -----------------------------------------------------------------------------

-- 7.1 profiles: búsqueda por email (login), role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 7.2 pacientes_terapeutas: consultas de vínculo (muy frecuentes)
CREATE INDEX IF NOT EXISTS idx_pacientes_terapeutas_terapeuta ON pacientes_terapeutas(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_terapeutas_paciente ON pacientes_terapeutas(paciente_id);

-- 7.3 sesiones_completadas: por paciente y fecha (dashboard, stats)
CREATE INDEX IF NOT EXISTS idx_sesiones_completadas_paciente_fecha ON sesiones_completadas(paciente_id, fecha DESC);

-- 7.4 activation_tokens: por token (validación), terapeuta, expiración
CREATE INDEX IF NOT EXISTS idx_activation_tokens_token ON activation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_terapeuta ON activation_tokens(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_expires ON activation_tokens(expires_at);

-- 7.5 documentos_clinicos: por paciente y fisioterapeuta
CREATE INDEX IF NOT EXISTS idx_documentos_clinicos_paciente ON documentos_clinicos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_clinicos_fisioterapeuta ON documentos_clinicos(fisioterapeuta_id);

-- 7.6 patient_exercises: por paciente y rutina
CREATE INDEX IF NOT EXISTS idx_patient_exercises_paciente ON patient_exercises(paciente_id);
CREATE INDEX IF NOT EXISTS idx_patient_exercises_rutina ON patient_exercises(rutina_id);

-- 7.7 post_session_reports: por paciente y fecha
CREATE INDEX IF NOT EXISTS idx_post_session_reports_paciente_fecha ON post_session_reports(paciente_id, fecha DESC);

-- 7.8 notifications: por usuario y leído
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- 7.9 ai_conversations: por usuario
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);

-- -----------------------------------------------------------------------------
-- PASO 8: RLS POLICIES - CONSOLIDAR A ANON + AUTHENTICATED DONDE CORRESPONDA
-- -----------------------------------------------------------------------------
-- Nota: La app usa auth custom (NO Supabase Auth), por lo que auth.uid() es NULL.
-- Las policies deben permitir acceso via role 'anon' (service role bypassa RLS).
-- Las policies existentes en migración 20261107170000 y 20261107180000 ya cubren esto.
-- Verificar que no queden policies huérfanas en tablas eliminadas.

-- -----------------------------------------------------------------------------
-- VERIFICACIÓN FINAL
-- -----------------------------------------------------------------------------
-- Ejecutar tras la migración para confirmar esquema limpio:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;