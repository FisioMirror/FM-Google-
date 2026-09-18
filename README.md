# FisioMirror v2.0 — Plataforma de Tele-Rehabilitación con IA

> **PWA médica de tele-rehabilitación** que conecta fisioterapeutas y pacientes mediante visión artificial y análisis biomecánico en tiempo real (cámara web + MediaPipe Pose), asistente clínico con IA multimodal (OCR de prescripciones, generación de resúmenes, síntesis por voz), generación de reportes clínicos en PDF, gamificación por logros y operación resiliente con soporte offline (IndexedDB + Service Worker).

---

## Tabla de Contenidos

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura del Sistema y Flujo de Datos](#2-arquitectura-del-sistema-y-flujo-de-datos)
3. [Stack Tecnológico con Mapeo en el Código Fuente](#3-stack-tecnológico-con-mapeo-en-el-código-fuente)
4. [Módulo de Autenticación, Login y Registro en Detalle](#4-módulo-de-autenticación-login-y-registro-en-detalle)
5. [Base de Datos Supabase (Esquemas, Tablas y Relaciones)](#5-base-de-datos-supabase-esquemas-tablas-y-relaciones)
6. [Seguridad en Supabase: RLS, RPC Functions y Storage](#6-seguridad-en-supabase-rls-rpc-functions-y-storage)
7. [Edge Functions y Backend Serverless](#7-edge-functions-y-backend-serverless)
8. [Modo Espejo AR (Visión Artificial y Biomecánica)](#8-modo-espejo-ar-visión-artificial-y-biomecánica)
9. [Sistema de Inteligencia Artificial (Pipeline de Jobs y OCR)](#9-sistema-de-inteligencia-artificial-pipeline-de-jobs-y-ocr)
10. [PWA, Service Worker y Soporte Offline](#10-pwa-service-worker-y-soporte-offline)
11. [Gamificación, Rachas y Notificaciones en Tiempo Real](#11-gamificación-rachas-y-notificaciones-en-tiempo-real)
12. [Sistema de Diseño (Material Design 3 + Glassmorphism)](#12-sistema-de-diseño-material-design-3--glassmorphism)
13. [Catálogo de Componentes UI y Microinteracciones](#13-catálogo-de-componentes-ui-y-microinteracciones)
14. [Plano de Rutas y Navegación](#14-plano-de-rutas-y-navegación)
15. [Guía de Estudio y Buenas Prácticas del Código](#15-guía-de-estudio-y-buenas-prácticas-del-código)

---

## 1. Visión General del Proyecto

**FisioMirror** resuelve la falta de adherencia y supervisión en la rehabilitación física remota. Tradicionalmente, un paciente recibe una hoja impresa con ejercicios y realiza los movimientos en casa sin corrección postural, lo que deriva en compensaciones lesivas o abandono del tratamiento.

La plataforma proporciona un ecosistema simbiótico entre dos perfiles:

1. **Fisioterapeuta (Profesional Clínico):**
   - Panel de control clínico con métricas en tiempo real (pacientes activos, adherencia semanal, sesiones completadas hoy).
   - Digitalización automática de expedientes y fórmulas médicas mediante **OCR con IA** (extracción estructurada de patología, articulación diana, ROM objetivo, medicamentos y precauciones).
   - Diseñador y reasignador de rutinas con biblioteca de ejercicios parametrizables (series, repeticiones, descansos, ángulos diana y lado afectado).
   - Generación instantánea de **tokens de activación de 6 dígitos** para dar de alta y vincular pacientes sin fricción.
   - Historial clínico con evolución de ROM (Rango de Movimiento), escala visual analógica del dolor (EVA) y exportación de informes en PDF formal.

2. **Paciente (Usuario en Rehabilitación):**
   - Acceso simplificado mediante **token numérico de 6 dígitos** (o credenciales email/contraseña).
   - **Modo Espejo AR:** Ejecución de ejercicios frente a la cámara web donde la IA detecta 33 puntos anatómicos (landmarks), cuenta repeticiones automáticamente en base a la cinemática articular, previene compensaciones posturales y ofrece indicaciones por voz en español.
   - **Asistente Physi:** Mascota y asistente conversacional entrenado con contexto clínico personalizado para resolver dudas sobre ejercicios, dolor post-sesión y pautas ergonómicas.
   - **Gamificación médica:** Sistema de medallas, rachas de constancia diaria y celebraciones interactivas diseñadas para aumentar la adherencia terapéutica.
   - **Modo Offline:** Posibilidad de visualizar y completar la rutina del día sin conexión a internet mediante sincronización local en IndexedDB.

---

## 2. Arquitectura del Sistema y Flujo de Datos

El proyecto sigue una arquitectura **Client-First PWA** desacoplada, respaldada por **Supabase (PostgreSQL 15)** como Backend-as-a-Service (BaaS) y un conjunto de **Edge Functions serverless (Deno)** para operaciones criptográficas y orquestación de IA.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APLICACIÓN CLIENTE (PWA)                            │
│  React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Zustand      │
└──────────────┬───────────────────────────────┬──────────────────────────────┘
               │                               │
       (Consultas Directas                     │ (Operaciones Seguras,
        PostgreSQL via RLS)                    │  Auth & Inferencia IA)
               │                               │
               ▼                               ▼
┌──────────────────────────────┐     ┌────────────────────────────────────────┐
│     SUPABASE POSTGRESQL      │     │         SUPABASE EDGE FUNCTIONS        │
│  - Tablas Relacionales       │     │  - auth-login (Argon2 / SHA-256)       │
│  - Row Level Security (RLS)  │     │  - auth-register (Alta profesional)    │
│  - Realtime WebSocket Ch.    │     │  - process-job (Orquestador IA)        │
│  - RPC Stored Procedures     │     │  - transcribe-audio (Whisper STT)      │
└──────────────┬───────────────┘     └───────────────────┬────────────────────┘
               │                                         │
               ▼                                         ▼
┌──────────────────────────────┐     ┌────────────────────────────────────────┐
│       SUPABASE STORAGE       │     │         PROVEEDORES EXTERNOS           │
│  - /avatars                  │     │  - Cloudflare Workers AI / LLaVA       │
│  - /credenciales-profesional │     │  - Google Gemini 2.5 Flash             │
│  - /documentos               │     │  - MediaPipe Pose CDN (Google)         │
│  - /pwa-icons                │     │  - Cloudflare Turnstile (Anti-bot)     │
└──────────────────────────────┘     └────────────────────────────────────────┘
```

### Ciclo de Vida de una Sesión de Rehabilitación:
1. El **Fisioterapeuta** sube una foto de una prescripción médica en `/ocr-scanner`.
2. El sistema envía la imagen a la cola de trabajos `ai_jobs`, procesada por la Edge Function `process-job` (LLaVA/Gemini) para extraer datos clínicos estructurados.
3. El fisioterapeuta ajusta la rutina y se genera un token en la tabla `activation_tokens`.
4. El **Paciente** ingresa a `/login`, escribe el token de 6 dígitos; el cliente valida contra `activation_tokens` y recupera su perfil y rutina activa de `patient_exercises`.
5. En `/ar-mirror`, el hook `usePoseDetection` carga MediaPipe Pose, procesa los fotogramas del video en un canvas HTML5 a 30 FPS, calcula ángulos euclidianos y registra repeticiones.
6. Al finalizar, se almacena la sesión en `sesiones_completadas` y la evaluación analógica de dolor en `post_session_reports`.

---

## 3. Stack Tecnológico con Mapeo en el Código Fuente

A continuación se detalla cada biblioteca del stack, su función técnica y los archivos exactos donde se encuentra implementada en producción para su estudio:

| Tecnología | Versión | Propósito en FisioMirror | Archivos de Implementación Clave |
|---|---|---|---|
| **React** | `^18.3.1` | Renderizado declarativo, ciclo de vida de componentes, hooks personalizados (`useMemo`, `useCallback`, `useRef`). | `src/main.tsx`, `src/App.tsx`, `src/pages/*.tsx` |
| **TypeScript** | `^5.5.3` | Tipado estático estricto para modelos clínicos, DTOs de base de datos y eventos de interfaz. | `src/types/index.ts`, `src/types/character.types.ts` |
| **Vite** | `^5.4.2` | Bundler ESM de alta velocidad, proxy de desarrollo y compilación de producción. | `vite.config.ts`, `package.json` |
| **Supabase Client** | `^2.57.4` | Conexión a base de datos PostgreSQL, suscripciones Realtime WebSocket y gestión de Storage. | `src/lib/supabase.ts`, `src/stores/authStore.ts`, `src/context/NotificationContext.tsx` |
| **Tailwind CSS** | `^3.4.1` | Sistema de estilos utility-first con variables CSS personalizadas para Material Design 3. | `tailwind.config.ts`, `src/styles/globals.css` |
| **Framer Motion** | `^12.42.0` | Animaciones fluidas basadas en físicas de resortes (*springs*), transiciones de ruta y spotlight interactivo. | `src/pages/Login.tsx` (CharacterSpotlight), `src/components/ui/AnimatedList.tsx`, `src/components/ui/BorderBeam.tsx` |
| **@number-flow/react** | `^0.6.1` | Transiciones tipográficas fluidas al incrementar o decrementar contadores numéricos y cuentas regresivas. | `src/components/ui/AnimatedCountdown.tsx` |
| **Lucide React** | `^0.344.0` | Iconografía SVG médica, de navegación y estado con props homogéneas de grosor y tamaño. | `src/components/ui/Icon.tsx`, `src/pages/ResetPassword.tsx`, `src/components/FisioLayout.tsx` |
| **Recharts** | `^3.10.1` | Gráficos SVG responsivos para monitorizar adherencia, niveles de dolor (EVA) y rango de movimiento (ROM). | `src/pages/StatsPage.tsx`, `src/components/clinical/ClinicalAnalyticsHub.tsx`, `src/components/patient/PatientStatisticsView.tsx` |
| **Three.js** | `^0.185.1` | Renderizado WebGL 3D para la visualización de avatares biomecánicos y guías de postura en ejercicios. | `src/components/characters3d/PhysioModel3D.tsx`, `src/components/characters3d/KidModel3D.tsx`, `src/components/rehabilitation/SkeletonDemo.tsx` |
| **jsPDF & html2canvas** | `^4.2.1` / `^1.4.1` | Compilación vectorial y rasterizada de informes clínicos para descarga o envío por correo. | `src/lib/pdfExport.ts`, `src/components/ui/PDFExportModal.tsx`, `src/pages/ToolsPage.tsx` |
| **Zustand** | `^5.0.14` | Gestión de estado global ligera con middleware `persist` en `localStorage` (7 días de retención). | `src/stores/authStore.ts` |
| **Canvas Confetti** | `^1.9.4` | Animación de partículas festivas de alto rendimiento en Canvas para refuerzo positivo. | `src/lib/confetti.ts`, `src/components/ui/ConfettiButton.tsx`, `src/pages/ARMirrorPage.tsx` |
| **React Hot Toast** | `^2.6.0` | Sistema de notificaciones emergentes accesibles y reactivas ante eventos del sistema. | `src/components/ui/ToastProvider.tsx`, `src/components/ui/GlassToast.tsx` |
| **Vite Plugin PWA** | `^1.3.0` | Generación del Service Worker (Workbox), manifiesto PWA y caché offline de activos estáticos. | `vite.config.ts`, `src/lib/offlineDB.ts` |
| **i18next** | `^26.4.0` | Infraestructura de internacionalización preparada para localización de términos clínicos. | `src/i18n/index.ts` |

---

## 4. Módulo de Autenticación, Login y Registro en Detalle

El acceso a la aplicación se centraliza en `src/pages/Login.tsx`, complementado por `src/pages/ResetPassword.tsx` y `src/pages/RegistroPacientePage.tsx`.

### 4.1. Filosofía Visual del Login Interactivo
La pantalla de inicio de sesión presenta un diseño dividido en dos áreas en pantallas grandes y colapsable en móviles:

1. **Panel Izquierdo (Visual e Ilustración Biomecánica):**
   - Aloja la ilustración original del proyecto (`/login.png`), protegida sin filtros opacos oscuros para conservar su contraste y colorido nativo al 100%.
   - **Sistema de Focos Radiales (`CharacterSpotlight`):**
     - Al seleccionar el rol **Fisioterapeuta**, se proyecta un aura luminosa verde/esmeralda (`rgba(16, 185, 129, 0.42)`) sobre la figura del profesional (lado izquierdo), acompañada por un HUD de baliza holográfica con aro de pulso y la insignia *"Fisioterapeuta Clínico"*.
     - Al seleccionar el rol **Paciente**, se proyecta un aura azul terapéutico (`rgba(14, 165, 233, 0.42)`) sobre el paciente en rehabilitación (lado derecho), mostrando la insignia *"Paciente en Terapia"*.
     - Las auras utilizan `mix-blend-mode: screen`, técnica de iluminación aditiva que añade fotones de luz pura sin oscurecer ni teñir los pigmentos originales del dibujo.
     - **Zonas interactivas (Hotspots):** Cada personaje actúa como un botón interactivo con cursor táctil; al hacer clic sobre el fisioterapeuta o sobre el paciente en la propia imagen, el rol cambia de inmediato.
   - **Efecto de Destellos Multidimensional (`SparkleEffect`):**
     - Matriz de estrellas de 4 puntas y micropartículas esféricas distribuidas armónicamente por toda la extensión de la ilustración (planos superior, medio, central e inferior).
     - Cada partícula posee duraciones y desfases independientes, respondiendo en color verde esmeralda o azul cielo según el rol activo.

2. **Panel Derecho (Formulario Reactivo):**
   - Selector segmentado de rol en píldora (*segmented button*): Fisioterapeuta (Verde) vs. Paciente (Azul).
   - Selector de modo: **Iniciar Sesión** vs. **Crear Cuenta**.
   - Integración con **Cloudflare Turnstile** (`TurnstileWidget`) para protección anti-bots sin captchas intrusivos.
   - Botones de **Acceso Rápido Demo**: Carga perfiles clínicos precargados de prueba (`fisio@demo.com` y token `123456`) para evaluar la experiencia completa sin necesidad de configurar base de datos local.

### 4.2. Flujo de Inicio de Sesión de Fisioterapeuta
1. El fisioterapeuta introduce su **correo electrónico** y **contraseña**.
2. `useAuthStore.signIn()` ejecuta una llamada `POST` a la Edge Function `${supabaseUrl}/functions/v1/auth-login`.
3. La Edge Function compara el hash con la sal segura del servidor (`fisiomirror-salt-2024`).
4. Si la Edge Function no está disponible, el almacén ejecuta un *fallback* directo en el cliente con Web Crypto API (`crypto.subtle.digest('SHA-256')`) consultando la tabla `profiles` mediante la clave anónima.
5. Tras el éxito, se almacena el perfil en el estado de Zustand y se serializa en `localStorage` con una vigencia máxima de 7 días (`SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000`).
6. El enrutador redirige a `/dashboard-fisio`.

### 4.3. Flujo de Registro de Fisioterapeuta (2 Pasos)
1. **Paso 1 (Credenciales Básicas):** Nombre completo, correo profesional y contraseña segura (mínimo 6 caracteres).
2. **Paso 2 (Validación Colegiada):**
   - Número de colegiado / Cédula profesional.
   - Universidad de egreso y año de titulación.
   - Selección múltiple de especialidades clínicas (Traumatología, Deportiva, Neurológica, Pediátrica, etc.).
   - Carga opcional de documento probatorio (PDF o imagen), el cual se almacena de forma segura en el bucket `credenciales-profesionales`.
3. Invocación a `signUpFisio()` que registra la fila en `usuarios` / `profiles` y vincula las especialidades en la tabla relacional `profile_especialidades`.

### 4.4. Flujo de Acceso del Paciente (Token de 6 Dígitos)
1. El paciente selecciona el rol **Paciente**.
2. El formulario muestra el componente `PinInput` (6 casillas individuales con autofoco y salto automático entre dígitos).
3. `useAuthStore.signInWithToken(token)` consulta la tabla `activation_tokens`.
4. Comprueba que el token coincida, que no esté revocado y que `paciente_id` apunte a un registro válido en `profiles`.
5. Si el token es correcto, actualiza `profiles.is_active = true`, garantiza la vinculación con el terapeuta en `pacientes_terapeutas` y autentica la sesión.
6. El enrutador redirige automáticamente a `/dashboard-paciente`.

---

## 5. Base de Datos Supabase (Esquemas, Tablas y Relaciones)

> **Nota de Seguridad para Estudio con IA:** Toda la arquitectura de datos aquí descrita refleja esquemas estructurales DDL (Data Definition Language). No contiene contraseñas, secretos `service_role` ni tokens privados.

La base de datos PostgreSQL de FisioMirror en Supabase está organizada alrededor del esquema `public`:

```
                           ┌─────────────────┐
                           │    usuarios     │
                           │  (auth shadow)  │
                           └────────┬────────┘
                                    │ 1:1
                                    ▼
       ┌──────────────────── profiles ────────────────────┐
       │ - id (UUID PK)                                   │
       │ - email, nombre, role, avatar_url                │
       │ - telefono, fecha_nacimiento, tipo_sangre        │
       │ - estatura_cm, peso_kg, extremidad_afectada      │
       │ - rom_objetivo, patologia, tutor_*               │
       └───────┬───────────────────────────────┬──────────┘
               │ 1:N                           │ 1:N
               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐
     │ activation_tokens │           │     rutinas       │
     │ - token (6 dígitos)│          │ - status (activa) │
     │ - paciente_id     │           │ - fisio_id        │
     │ - terapeuta_id    │           └─────────┬─────────┘
     └───────────────────┘                     │ 1:N
                                               ▼
     ┌───────────────────┐           ┌───────────────────┐
     │     exercises     │◀──────────┤ patient_exercises │
     │ - angulo_objetivo │    N:M    │ - paciente_id     │
     │ - landmarks       │           │ - series, reps    │
     │ - grupo_muscular  │           └───────────────────┘
     └───────────────────┘
               │
               ▼
     ┌───────────────────────┐       ┌───────────────────────┐
     │  sesiones_completadas │◀──────┤  post_session_reports │
     │ - calidad_promedio    │  1:1  │ - dolor_antes / desp. │
     │ - compensaciones      │       │ - nivel_fatiga        │
     └───────────────────────┘       └───────────────────────┘
```

### 5.1. Diccionario de Tablas Principales

#### 1. `profiles`
Tabla central de identidades. Almacena tanto a fisioterapeutas como a pacientes con sus atributos médicos:
- `id` (`uuid`, Primary Key): Identificador único del usuario.
- `email` (`text`, Unique): Correo electrónico del usuario.
- `role` (`text`, Check: `'fisioterapeuta' | 'paciente'`): Rol del usuario en el sistema.
- `nombre` (`text`): Nombre y apellidos completos.
- `avatar_url` (`text`): Enlace a la imagen en el bucket `avatars`.
- `telefono` (`text`): Teléfono de contacto directo.
- `fecha_nacimiento` (`date`): Fecha de nacimiento para cálculo de edad.
- `colegiado_id` (`text`): Identificador del colegio oficial de fisioterapeutas (solo terapeutas).
- `universidad` (`text`): Alma máter universitaria.
- `anio_egreso` (`integer`): Año de graduación.
- `clinic_name` (`text`): Nombre del centro o clínica de rehabilitación.
- `es_menor_edad` (`boolean`): Si es verdadero, habilita los campos de tutoría legal.
- `tutor_nombre`, `tutor_telefono`, `tutor_email` (`text`): Información del representante legal.
- `patologia`, `diagnostico` (`text`): Diagnóstico médico principal.
- `diagnostico_secundario` (`text`): Comorbilidades asociadas.
- `extremidad_afectada` (`text`): Miembro en tratamiento (ej. "Hombro derecho", "Rodilla izquierda").
- `rom_objetivo` (`text`): Grados angulares de flexión/extensión esperados al alta médica.
- `medicamentos_actuales`, `alergias`, `enfermedades_cronicas` (`text`): Historial farmacológico y clínico.
- `estatura_cm` (`integer`), `peso_kg` (`numeric(5,2)`): Biometría del paciente para cálculos de carga.
- `onboarding_completed` (`boolean`): Indica si el usuario ya vio el tutorial interactivo inicial.

#### 2. `activation_tokens`
Gestión de credenciales de acceso rápido para pacientes:
- `id` (`uuid`, PK): Identificador único.
- `token` (`text`, Unique): Código numérico o alfanumérico (ej. `849201`).
- `paciente_id` (`uuid`, FK → `profiles.id`): Paciente asignado a este token.
- `terapeuta_id` (`uuid`, FK → `profiles.id`): Fisioterapeuta emisor del token.
- `expires_at` (`timestamptz`): Fecha de vencimiento (por defecto 30 días posteriores).
- `is_used` (`boolean`): Bandera de uso (reutilizable en la configuración actual para facilitar el acceso regular).

#### 3. `exercises`
Catálogo maestro de ejercicios biomecánicos:
- `id` (`uuid`, PK): Identificador del ejercicio.
- `fisio_id` (`uuid`, FK → `profiles.id`): Terapeuta autor o dueño del ejercicio en su catálogo.
- `nombre` (`text`): Nombre descriptivo (ej. *"Abducción de hombro con rotación neutra"*).
- `descripcion`, `detailed_description` (`text`): Pautas técnicas de ejecución y precauciones.
- `categoria` (`text`): Tipo (ej. `movilidad`, `fortalecimiento`, `estiramiento`).
- `fase_recuperacion` (`text`): Fase clínica recomendada (`agudo`, `subagudo`, `mantenimiento`).
- `articulacion` (`text`): Articulación implicada (`hombro`, `codo`, `cadera`, `rodilla`, `tobillo`).
- `grupo_muscular` (`text`): Grupos motores principales (ej. `deltoides`, `cuádriceps`).
- `angulo_objetivo` (`integer`): Umbral angular en grados sexagesimales (ej. `90`, `120`).
- `landmarks` (`jsonb`): Vector de índices de MediaPipe a trackear (ej. `[11, 13, 15]` para hombro-codo-muñeca).
- `series_default`, `repeticiones_default`, `duracion_segundos` (`integer`): Dosificación recomendada.

#### 4. `patient_exercises` y `rutinas`
Prescripciones activas vinculadas a cada paciente:
- `rutinas`: Define el contenedor global de la rutina con su estado (`activa` o `archivada`).
- `patient_exercises`: Relación directa entre paciente, ejercicio dosificado (`series`, `repeticiones`, `frecuencia_semana`) y notas personalizadas del terapeuta.

#### 5. `sesiones_completadas` y `post_session_reports`
Registro cuantitativo y cualitativo de la sesión en el modo espejo AR:
- `sesiones_completadas`:
  - `paciente_id` (`uuid`): Paciente que completó el entrenamiento.
  - `ejercicios` (`jsonb`): Detalle de ejercicios realizados con número de repeticiones efectivas.
  - `adherencia` (`integer`): Porcentaje de la rutina prescrita completado (0 - 100%).
  - `calidad_promedio` (`real`): Puntuación de precisión cinemática en base a la desviación angular.
  - `compensaciones_detectadas` (`jsonb`): Errores posturales registrados (ej. elevación de trapecios, inclinación de tronco).
- `post_session_reports`:
  - `dolor_antes` (`integer`, escala 0-10): Intensidad de dolor previa al ejercicio.
  - `dolor_despues` (`integer`, escala 0-10): Intensidad de dolor al culminar.
  - `fatiga_nivel` (`integer`, escala 1-5): Nivel de esfuerzo percibido (RPE).
  - `comentario` (`text`): Sensaciones transmitidas por el paciente.

#### 6. `ai_jobs` y `ai_conversations`
Infraestructura de inteligencia artificial asíncrona:
- `ai_jobs`: Cola con columnas `id`, `type` (`image_analysis`, `text_generation`, `insights`, `summaries`, `pdf_report`), `status` (`pending`, `processing`, `completed`, `failed`), `input_data` (`jsonb`) y `result_data` (`jsonb`).
- `ai_conversations`: Historial de mensajes entre el paciente y el agente Physi en `AIAssistantPage.tsx`.

#### 7. `notifications`
Canal de mensajería reactiva:
- Columnas: `id`, `user_id`, `type` (`videollamada`, `rutina`, `sistema`, `recordatorio`), `title`, `message`, `read` (`boolean`), `metadata` (`jsonb`).

---

## 6. Seguridad en Supabase: RLS, RPC Functions y Storage

### 6.1. Políticas de Seguridad de Nivel de Fila (Row Level Security - RLS)
En Supabase, RLS garantiza que ninguna petición realizada desde el cliente pueda leer o alterar datos no autorizados. En FisioMirror:
- Cada tabla cuenta con `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
- Se implementan políticas atómicas por verbo SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) en lugar de directivas genéricas `FOR ALL`.
- Para el acceso anónimo mediante Token de paciente, se utilizan políticas validadas por `paciente_id` o funciones de comprobación segura.

### 6.2. Procedimientos Almacenados (RPC Functions)
Ubicadas en `supabase/migrations/20260805162739_20260805_migration_part2_rls_functions_storage.sql.sql`:

1. `hash_password(password text)`:
   - Aplica `digest(password || 'fisiomirror-salt-2024', 'sha256')` utilizando la extensión criptográfica `pgcrypto`.
   - Se revoca su ejecución directa por roles públicos (`REVOKE EXECUTE ON FUNCTION hash_password FROM anon, authenticated`) para aislar la sal.
2. `login_usuario(p_email text, p_password text)`:
   - Procedimiento con `SECURITY DEFINER` que valida las credenciales y devuelve un objeto JSON estructurado con el estado de autenticación.
3. `registrar_fisioterapeuta(...)`:
   - Transacción atómica que crea simultáneamente el usuario en `usuarios`, el perfil base en `perfiles_simples` y los datos de colegiado en `fisioterapeutas_simple`.
4. `registrar_paciente(...)`:
   - Valida el token de activación, confirma que no haya expirado (`expires_at > now()`), crea la cuenta del paciente y asocia al fisioterapeuta emisor.
5. `validar_token(p_token text)`:
   - Comprueba la vigencia y disponibilidad de un token de 6 caracteres.

### 6.3. Almacenamiento Seguro (Storage Buckets)
Cinco buckets estructuran los archivos binarios de la plataforma:
- `avatars` (Público en lectura): Fotografías de perfil de usuarios.
- `credenciales-profesionales` (Lectura controlada): Títulos universitarios y carnets de colegiados para verificación deontológica.
- `documentos` (Público con token): Radiografías, órdenes de rehabilitación y recetas médicas escaneadas.
- `mascot-animations`: Secuencias animadas en formato `.webp` de la mascota Physi.
- `pwa-icons`: Activos para el manifiesto de instalación en dispositivos móviles y de escritorio.

---

## 7. Edge Functions y Backend Serverless

FisioMirror contiene 16 funciones en `supabase/functions/` (ejecutadas en el runtime Deno):

```
supabase/functions/
├── auth-login/               # Autenticación con limitación de tasa (rate limit)
├── auth-register/            # Alta transaccional de fisioterapeutas
├── auth-validate/            # Validación de integridad de tokens
├── create-job/               # Encolado de solicitudes pesadas de IA
├── process-job/              # Procesamiento de OCR con fallback multi-modelo
├── FisioMirror_Asistent_AI/  # Motor conversacional del asistente Physi
├── transcribe-audio/         # Transcripción Whisper de audios del paciente
└── send-notification/        # Disparador de notificaciones push
```

### Orquestador de IA Multi-Proveedor (`process-job`):
Para garantizar alta disponibilidad sin depender de una única API, el backend implementa una cascada de tolerancia a fallos (*fallback cascade*):
1. **Intento Primario:** Cloudflare Workers AI (LLaVA 1.5 7B para imágenes / Llama 3.1 8B para texto).
2. **Fallback Secundario:** Google Gemini 2.5 Flash / Flash-Lite.
3. **Fallback Terciario:** Groq (Llama 3.2 90B Vision) o Hugging Face Inference API (Qwen2-VL).

---

## 8. Modo Espejo AR (Visión Artificial y Biomecánica)

El núcleo de tele-rehabilitación reside en `src/pages/ARMirrorPage.tsx`, gestionado por el hook `src/hooks/usePoseDetection.ts`.

### 8.1. Cinemática y Landmarks de MediaPipe
El modelo `MediaPipe Pose` identifica 33 puntos corporales en coordenadas normalizadas $(x, y, z)$. El sistema calcula los ángulos articulares utilizando el producto escalar y arcotangente bidimensional:

$$\theta = \arccos\left(\frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}\right)$$

Donde $\vec{u}$ y $\vec{v}$ son los vectores formados por la articulación evaluada (por ejemplo, hombro $\rightarrow$ codo y codo $\rightarrow$ muñeca).

### 8.2. Filtrado y Suavizado de Señal
- **Media Móvil Ponderada:** Se calcula el promedio de los últimos 5 fotogramas para eliminar el ruido de jittering provocado por variaciones de iluminación.
- **Detección de Fases de Repetición:** Una máquina de estados finitos evalúa la fase del movimiento (`subida`, `sostenimiento`, `bajada`). La repetición solo se computa si el paciente entra en la zona verde de tolerancia ($\pm 5^\circ$ del objetivo) y regresa a la posición de reposo.
- **Prevención de Compensaciones:** Si durante una flexión de hombro la cadera contraria se inclina más de $12^\circ$ o el hombro contralateral se desalinea, el sistema emite una alerta visual en rojo y un mensaje de audio mediante la **Web Speech API**: *"Mantén la espalda recta y no eleves el trapecio"*.

---

## 9. Sistema de Inteligencia Artificial (Pipeline de Jobs y OCR)

El consumo de IA en el cliente se realiza exclusivamente a través de `src/lib/ai.ts`.

### Patrón Asíncrono de Consulta (Create $\rightarrow$ Poll $\rightarrow$ Result)
Para evitar cierres de conexión HTTP por timeout durante análisis pesados de documentos clínicos de varias páginas:
1. `createAIJob('image_analysis', { imageBase64, prompt })`: Realiza un `POST` al endpoint y recibe un identificador único `job_id`.
2. `pollAIJob(jobId, timeout = 120000)`: Efectúa lecturas espaciadas cada 2.5 segundos consultando el estado del trabajo en `ai_jobs`.
3. Al detectarse `status === 'completed'`, retorna el JSON estructurado con el desglose clínico.

---

## 10. PWA, Service Worker y Soporte Offline

FisioMirror está configurado como una **Progressive Web App (PWA)** de primer nivel en `vite.config.ts` mediante `vite-plugin-pwa`:

### 10.1. Estrategia de Caché de Red (Workbox)
- **Activos Estáticos (JS, CSS, WOFF2):** `StaleWhileRevalidate` con límite de 50 entradas durante 24 horas.
- **Fotografías y Diagramas:** `CacheFirst` (100 entradas, hasta 7 días).
- **Peticiones a la API de Supabase:** `NetworkFirst` (con fallback de 24 horas en caché local para mantener la visualización de la última rutina consultada).

### 10.2. Base de Datos Local IndexedDB
Implementada en `src/lib/offlineDB.ts` y consumida por el hook `src/hooks/useOfflineExercises.ts`.
- Si el paciente pierde la conexión a internet, un banner superior (`src/components/OfflineIndicator.tsx`) notifica la desconexión.
- La aplicación recupera la rutina activa directamente desde IndexedDB, permitiendo que el paciente continúe sus ejercicios sin interrupción.

---

## 11. Gamificación, Rachas y Notificaciones en Tiempo Real

### 11.1. Logros Médicos (`src/hooks/useGamification.ts`)
Para estimular la adherencia del paciente, el sistema audita las sesiones completadas y otorga insignias almacenadas en `localStorage` (`fisiomirror-achievements`):
- **Primer Paso:** Completar la primera sesión de terapia.
- **Constancia de Bronce / Plata / Oro:** Completar 3, 5 o 10 sesiones consecutivas.
- **Racha de Fuego:** Mantener 7 días ininterrumpidos de rehabilitación.
- **Forma Impecable:** Realizar una serie con más del 95% de precisión biomecánica.
- Al desbloquearse un logro o culminar una serie, `src/lib/confetti.ts` lanza una cascada de confeti con `canvas-confetti`.

### 11.2. Notificaciones en Tiempo Real (`src/context/NotificationContext.tsx`)
El cliente abre un canal WebSocket continuo con Supabase Realtime:
```typescript
supabase
  .channel('public:notifications')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, handleNewNotification)
  .subscribe();
```
Incluye avisos acústicos diferenciados mediante la Web Audio API (tonos clínicos armónicos, evitando zumbidos molestos) para videollamadas de telemedicina con **Jitsi Meet** o reasignación de ejercicios.

---

## 12. Sistema de Diseño (Material Design 3 + Glassmorphism)

La identidad visual está gobernada por `src/styles/globals.css` y `tailwind.config.ts`:

- **Filosofía Cromática:** Se fundamenta en una paleta clínica de alta confianza con **Teal/Esmeralda** (`#10b981`, `#00504d`) para el ámbito clínico del fisioterapeuta y **Azul Celeste / Océano** (`#0ea5e9`, `#0284c7`) para el paciente.
  - *Regla de Estilo:* Se prohíbe el uso de tonos magenta, violeta o púrpura saturados fuera del manual de marca.
- **Glassmorphism Funcional:** Fondos con `backdrop-blur-md` o `backdrop-blur-xl` combinados con bordes translúcidos suaves (`border-white/10` o `border-emerald-500/20`), permitiendo profundidad visual sin sobrecargar el procesador gráfico.
- **Tipografía:**
  - *Montserrat:* Claridad legible para controles de interfaz, tablas clínicas e inputs.
  - *Playfair Display:* Títulos editoriales y cabeceras de módulos para un aspecto clínico sofisticado.
  - *JetBrains Mono:* Presentación de ángulos, coordenadas, series y contadores biomecánicos.

---

## 13. Catálogo de Componentes UI y Microinteracciones

El directorio `src/components/ui/` contiene más de 50 componentes diseñados para enriquecer la experiencia de usuario:

- **Efectos y Microinteracciones:**
  - `BorderBeam`: Haz de luz que recorre el perímetro de tarjetas destacadas.
  - `AuroraText` y `ShimmerText`: Textos con brillos dinámicos en títulos clave.
  - `AnimatedCountdown`: Contador regresivo con `NumberFlow` previo al inicio del escaneo AR.
  - `Particles`: Campo de micropartículas con spotlight de fondo.
  - `MascotAnimation`: Componente contenedor que reproduce las animaciones WebP de la mascota Physi (`saludo`, `ejercicio`, `éxito`, `alerta`).
- **Navegación y Estructura:**
  - `CommandPalette` (`⌘K`): Buscador global rápido para acceder a pacientes, ejercicios o métricas.
  - `FloatingMenu` (FAB): Botón flotante para acciones instantáneas en móvil.
  - `PinInput`: Entrada fragmentada de 6 casillas numéricas con validación rápida para el token de paciente.

---

## 14. Plano de Rutas y Navegación

Todas las rutas se encuentran protegidas y encapsuladas bajo `ProtectedRoute` en `src/App.tsx`:

| Ruta | Acceso | Layout | Función Principal |
|---|---|---|---|
| `/login` | Público | Standalone | Acceso dual por credenciales o token con spotlight interactivo. |
| `/reset-password` | Público | Standalone | Recuperación y restablecimiento de contraseña. |
| `/registro-paciente`| Público | Standalone | Auto-registro de paciente con token clínico asignado. |
| `/dashboard-fisio` | Fisioterapeuta | `FisioLayout` | Panel de control, estadísticas agregadas e insights de IA. |
| `/patients` | Fisioterapeuta | `FisioLayout` | Directorio maestro de pacientes con filtros y búsqueda. |
| `/paciente/:id` | Fisioterapeuta | `FisioLayout` | Expediente clínico individualizado, evolución y notas. |
| `/ocr-scanner` | Fisioterapeuta | `FisioLayout` | Asistente de 4 pasos para digitalización de recetas con IA. |
| `/tokens` | Fisioterapeuta | `FisioLayout` | Consola de emisión, asignación y revocación de tokens. |
| `/fisio-exercises` | Fisioterapeuta | `FisioLayout` | Biblioteca y diseñador CRUD de ejercicios articulares. |
| `/fisio-stats` | Fisioterapeuta | `FisioLayout` | Analítica de adherencia general, distribución y patologías. |
| `/tools` | Fisioterapeuta | `FisioLayout` | Calculadora de IMC, conversor de ROM y exportador PDF. |
| `/dashboard-paciente`| Paciente | `PatientLayout`| Resumen del día, racha actual y tarjeta de inicio de rutina. |
| `/exercises` | Paciente | `PatientLayout`| Lista de ejercicios pautados con guías visuales en 3D. |
| `/ar-mirror` | Paciente | Standalone / AR | Sesión guiada con cámara, conteo automático y voz. |
| `/calibration` | Paciente | `PatientLayout`| Calibración de rango articular base previa a la sesión. |
| `/ai-assistant` | Paciente | `PatientLayout`| Chat con Physi (preguntas clínicas, voz y análisis de fotos). |
| `/stats` | Paciente | `PatientLayout`| Gráficos individuales de progreso y dolor acumulado. |
| `/settings` | Común | Ambos Layouts | Configuración de accesibilidad, tamaño de fuente y tema. |

---

## 15. Guía de Estudio y Buenas Prácticas del Código

Para desarrolladores o inteligencias artificiales (como Google Gemini) que analicen este repositorio:

1. **Gestión de Estado de Autenticación:** Inspeccionar siempre `src/stores/authStore.ts`. Observar cómo conviven el token de 6 dígitos del paciente con el inicio de sesión convencional del profesional.
2. **Consultas a Base de Datos:** Las lecturas y escrituras en el frontend usan la instancia de `supabase` exportada en `src/lib/supabase.ts`. Toda llamada cumple con las restricciones de RLS definidas en `supabase/migrations/`.
3. **Flujo de Pose e Inteligencia Artificial:**
   - La lógica matemática de detección postural se ubica íntegramente en `src/hooks/usePoseDetection.ts`.
   - La lógica de inferencia remota con fallback reside en `src/lib/ai.ts` y en la función Deno `supabase/functions/process-job/index.ts`.
4. **Validación de Compilación:** Todo nuevo desarrollo o ajuste debe ser verificado ejecutando:
   ```bash
   npm run lint        # Verificación estricta de código y hooks de React
   npm run typecheck   # Validación estricta de tipos de TypeScript
   npm run build       # Verificación de bundling final con Vite
   ```
