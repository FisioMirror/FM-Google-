# Arquitectura Avanzada de Supabase para FisioMirror

Este documento describe la arquitectura, directrices y hojas de ruta de evolución de la infraestructura de backend de **FisioMirror** sobre Supabase.

---

## 1. Migración a Supabase Auth Nativo

### Contexto Actual
FisioMirror utiliza un esquema híbrido seguro con tokens de activación de un solo uso vinculados a registros de pacientes en la tabla `pacientes` y `activation_tokens`.

### Flujo de Migración Recomendado
1. **Activación de Pacientes**:
   - Cuando el paciente introduce su token de un solo uso de 6 caracteres en `/login`, la Edge Function `patient-activate` valida vigencia y estado `usado = false`.
   - Si es válido, se invoca `supabase.auth.admin.createUser` con el correo y la contraseña elegida por el paciente.
   - Se actualiza `paciente_id` en `auth.users.raw_user_meta_data` y se marca el token como `usado = true`.

2. **Políticas RLS (Row Level Security)**:
   ```sql
   -- Acceso seguro de pacientes a sus rutinas y sesiones
   CREATE POLICY "Pacientes acceden a su propio expediente"
   ON pacientes FOR SELECT
   USING (auth.uid() = user_id OR auth.role() = 'service_role');
   ```

---

## 2. Búsqueda Semántica con Vector (pgvector)

### Casos de Uso en Fisioterapia
- Búsqueda contextual de ejercicios por patología, grupo muscular o contraindicación médica.
- Asistente clínico inteligente Physi AI para recuperar evidencia biomecánica y protocolos de rehabilitación.

### Esquema Propuesto
```sql
-- Activar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla de embeddings clínicos
CREATE TABLE IF NOT EXISTS exercise_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función de búsqueda por similitud de coseno
CREATE OR REPLACE FUNCTION match_exercises (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  exercise_id TEXT,
  nombre TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    exercise_embeddings.id,
    exercise_embeddings.exercise_id,
    exercise_embeddings.nombre,
    1 - (exercise_embeddings.embedding <=> query_embedding) AS similarity
  FROM exercise_embeddings
  WHERE 1 - (exercise_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

---

## 3. Automatización y Cron Jobs (pg_cron)

### Tareas Programadas Semanales y Diarias
1. **Informe Semanal de Recuperación**:
   - Ejecución domingos a las 18:00 (UTC-4 Venezuela).
   - Genera métricas de adherencia, dolor promedio y mejora de ROM.

2. **Detección de Mesetas y Abandono**:
   - Detección diaria a las 20:00 (UTC-4 Venezuela).
   - Pacientes con adherencia < 40% o estancamiento de 3 sesiones disparan alertas para el fisioterapeuta.

3. **Recordatorios de Sesión**:
   - Revisión periódica de recordatorios configurados por el fisioterapeuta.
