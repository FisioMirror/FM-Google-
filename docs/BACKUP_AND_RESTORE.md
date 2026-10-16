# Guía de Respaldos y Restauración de Base de Datos (Supabase / PostgreSQL)

**Proyecto:** FisioMirror  
**Entorno de Base de Datos:** PostgreSQL en Supabase Cloud  
**Objetivo:** Garantizar la continuidad operativa, protección ante desastres y cumplimiento médico para datos clínicos de pacientes.

---

## 1. Respaldos Automáticos Gestionados en Supabase

Supabase incluye copias de seguridad automáticas a nivel de infraestructura para todos los proyectos gestionados.

### 1.1 Características del Respaldo Nativo
- **Frecuencia:** Diaria (ejecutado durante la ventana de mantenimiento nocturno).
- **Retención:** 7 días en planes estándar; ampliable hasta 30 días.
- **Alcance:** Esquema completo, datos tabulares, extensiones y blobs relacionales.
- **Ubicación en el Panel de Supabase:**
  1. Ingresa a [supabase.com/dashboard](https://supabase.com/dashboard).
  2. Selecciona tu proyecto (`mnkqfrulcpxpwaftokdi` / FisioMirror).
  3. En la barra lateral izquierda, dirígete a **Project Settings** (icono de engranaje).
  4. Haz clic en **Database** y selecciona la pestaña **Backups**.
  5. Encontrarás la lista de snapshots diarios generados con su marca de tiempo exacta y estado (*Completed*).

### 1.2 Point-in-Time Recovery (PITR)
- Si el proyecto cuenta con el complemento PITR activado en Supabase, la base de datos registra continuamente los registros Write-Ahead Logging (WAL).
- **Ventaja clave:** Puedes restaurar el estado de la base de datos al segundo exacto anterior a una falla o alteración accidental de datos.

---

## 2. Respaldos Lógicos Manuales Bajo Demanda

Para contar con copias de seguridad locales, previas a despliegues mayores o migraciones críticas:

### 2.1 Método A: Mediante Supabase CLI (Recomendado)
Instala la CLI de Supabase o utiliza `npx supabase`:

```bash
# 1. Iniciar sesión en Supabase CLI
npx supabase login

# 2. Vincular tu proyecto
npx supabase link --project-ref mnkqfrulcpxpwaftokdi

# 3. Exportar esquema completo y datos a un archivo SQL
npx supabase db dump -f backup_fisiomirror_$(date +%Y%m%d_%H%M%S).sql

# 4. (Opcional) Exportar únicamente los datos (sin esquema DDL)
npx supabase db dump --data-only -f backup_datos_$(date +%Y%m%d).sql
```

### 2.2 Método B: Mediante PostgreSQL Nativo (`pg_dump`)
Si dispones de la cadena de conexión directa de PostgreSQL (obtenida en *Project Settings* > *Database* > *Connection String*):

```bash
# Dump en formato comprimido personalizado (-F c)
pg_dump "postgresql://postgres:[TU_CONTRASEÑA]@db.mnkqfrulcpxpwaftokdi.supabase.co:5432/postgres" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  -F c \
  -b \
  -v \
  -f fisiomirror_snapshot_$(date +%Y%m%d).dump
```

---

## 3. Protocolos de Restauración (Disaster Recovery)

### 3.1 Restauración con un Clic desde el Panel de Supabase
1. Ingresa a **Project Settings** > **Database** > **Backups**.
2. Localiza el snapshot deseado en la lista cronológica.
3. Haz clic en el botón de tres puntos `...` o en el enlace **Restore**.
4. Confirma la acción en el cuadro de diálogo. Supabase iniciará el aprovisionamiento y reemplazo del estado de la base de datos de manera atómica.

### 3.2 Restauración Manual desde Archivo de Respaldo (`pg_restore` / `psql`)

#### Caso 1: Restauración desde archivo SQL plano
```bash
psql "postgresql://postgres:[TU_CONTRASEÑA]@db.mnkqfrulcpxpwaftokdi.supabase.co:5432/postgres" \
  -f backup_fisiomirror_20261012.sql
```

#### Caso 2: Restauración desde archivo binario `.dump`
```bash
pg_restore -d "postgresql://postgres:[TU_CONTRASEÑA]@db.mnkqfrulcpxpwaftokdi.supabase.co:5432/postgres" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  -v \
  fisiomirror_snapshot_20261012.dump
```

---

## 4. Lista de Verificación Posterior a la Restauración

Una vez finalizada la restauración, verifica los siguientes puntos clave:
- [ ] **Tablas e Integridad:** Comprobar que `profiles`, `rutinas`, `sesiones_rehabilitacion` y `audit_logs` tengan el conteo de registros esperado.
- [ ] **Políticas RLS:** Validar que las políticas de seguridad por fila sigan activadas (`ALTER TABLE [nombre] ENABLE ROW LEVEL SECURITY;`).
- [ ] **Secuencias y Triggers:** Verificar que los triggers de auditoría forense (`trg_audit_*`) continúen enlazados.
- [ ] **Acceso de Usuarios:** Probar inicio de sesión tanto de fisioterapeuta como de paciente para validar tokens y claves de acceso.

---

## 5. Auditoría de Respaldos
Cada vez que se ejecute una migración o respaldo administrativo manual, se recomienda registrar una entrada en la tabla `audit_logs`:
```sql
SELECT log_audit_event(
  'DATABASE_BACKUP_GENERATED',
  'system',
  'mnkqfrulcpxpwaftokdi',
  NULL,
  'admin@fisiomirror.app',
  'sistema',
  '{"backup_type": "pg_dump_logical", "status": "completed"}'::jsonb,
  'info'
);
```
