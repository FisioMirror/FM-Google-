# Plan de Implementación Revisado: Unificación de Navegación & Despliegue Masivo en Dos Partes para FisioMirror

Este plan atiende con máxima fidelidad las instrucciones del usuario:
1. **Eliminación total del menú inferior (`MobileFixedDock`)** tanto en el rol de **fisioterapeuta** como en el de **paciente**.
2. **Atracción visual y elegancia en el menú lateral existente (Sidebar / Drawer móvil)** mediante iconografía prémium de Lucide, acentos sutiles de color en **Azul Clínico y Verde Esmeralda**, bordes con glassmorphism sutil y un indicador de selección deslizante sin saturar la vista.
3. **Despliegue masivo y exhaustivo** de la totalidad de componentes de la Galería UI estructurado en **dos partes claras**, garantizando que cada componente cumpla una función interactiva real en las pantallas operativas sin repetición de tareas.

---

## 1. Rediseño de Navegación & Eliminación de Menús Redundantes

### A. Erradicación del Menú Inferior
* **`src/components/FisioLayout.tsx`:** Eliminar por completo `<MobileFixedDock role="fisioterapeuta" />` y retirar el relleno inferior artificial (`pb-24`), restaurándolo a un espaciado equilibrado (`pb-8`).
* **`src/components/PatientLayout.tsx`:** Eliminar por completo `<MobileFixedDock role="paciente" />` y ajustar el padding inferior para una experiencia despejada en dispositivos móviles y de escritorio.

### B. Mejora del Menú Lateral y Drawer Deslizable (Fisioterapeuta y Paciente)
* **Iconografía Renovada:** Sustituir los iconos genéricos por iconos vectoriales estilizados de `lucide-react` (ej. `LayoutDashboard`, `Users`, `Dumbbell`, `Activity`, `Wrench`, `UserCheck`, `Settings`, `ShieldCheck`), acompañados de micro-contenedores translúcidos con fondos tonales sutiles (azul clínico suave `bg-sky-500/10 text-sky-600 dark:text-sky-400` y verde menta `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`).
* **Indicador de Pestaña Activa Fluido:** Implementar un resaltador de fondo animado con `motion.div` y `layoutId="active-sidebar-indicator"` que se desplaza orgánicamente entre las opciones del menú.
* **Superficie y Acabado Glassmorphism:** Fondo de panel lateral con gradiente clínico suave (`bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-r border-sky-100/60 dark:border-slate-800/80`), eliminando la sensación de bloque plano o gris monótono.
* **Drawer Móvil Ergonómico:** Al abrir el menú de hamburguesa en móvil, el drawer se desliza desde el lateral con esquinas redondeadas (`rounded-r-3xl`), encabezado de marca con avatar del profesional/paciente, indicador de presencia en tiempo real (*online pulse*) y botón de cierre táctil claro.
* **Armonización del FAB (Acciones Rápidas):** Posicionar la barra de herramientas flotante de forma limpia en el extremo inferior derecho sin interferir con la lectura del contenido.

---

## 2. Paleta Cromática Unificada: Azul Clínico & Verde Esmeralda

* **Azul Clínico (Royal/Sapphire `#0284c7`, `#0369a1`):** Base cromática para navegación activa, encabezados jerárquicos, botones de acción primaria y badges de estado clínico.
* **Verde Esmeralda Biomecánico (`#10b981`, `#059669`):** Acento para arcos cinemáticos, métricas de éxito, barras de energía de rehabilitación y valores de cumplimiento.
* **Fondos Suaves de Alto Contraste:** Resplandores ambientales tenues que eliminan la frialdad del blanco puro sin comprometer la legibilidad ni la accesibilidad para pacientes adultos mayores.

---

## 3. Despliegue Masivo en Dos Partes

Para garantizar una ejecución impecable sin errores de compilación ni retrabajos, el despliegue de los componentes de la Galería UI se divide en dos fases estratégicas:

### PARTE 1: Núcleo Operativo, Navegación y Vistas de Alta Frecuencia

1. **`FisioLayout.tsx` & `PatientLayout.tsx`:**
   * Eliminación de `MobileFixedDock` en ambas plantillas.
   * Rediseño completo de la Sidebar y del Drawer móvil deslizable con iconos Lucide, micro-chips tonales e indicador `layoutId`.
2. **Dashboard del Fisioterapeuta (`src/pages/DashboardFisio.tsx`):**
   * Reemplazo de tarjetas de KPI por `MagicCard` con efecto resplandor sutil.
   * Contadores con físicas elásticas `NumberTicker` para pacientes activos, sesiones del día y porcentaje de adherencia.
   * Reorganización del panel con la cuadrícula adaptativa `BentoGrid`.
   * Integración de `ClinicalActivityFeed` animado con `AnimatedList` para eventos en directo.
   * Filtros rápidos mediante `CompactQuickSelector` (articulación y severidad).
   * Botones de acción clínica de alto impacto con `ShimmerButton` e `InteractiveHoverButton`.
3. **Modo Espejo AR del Paciente (`src/pages/ARMirrorPage.tsx`):**
   * Medición angular en tiempo real con `BiomechanicalAngleGauge`.
   * Contador elástico de repeticiones con `RepetitionCounterSpring`.
   * Visualización del rendimiento muscular mediante `RehabEnergyBar`.
   * Detección y aviso de vicios posturales con `CompensationAlertBanner`.
   * Controles flotantes AR con microinteracciones mediante `ARFloatingDock`.
4. **Pantalla de Acceso / Login (`src/pages/Login.tsx`):**
   * Atmósfera visual prémium con rayos de luz `LightRays` / `background-beams`.
   * Título y logotipo destacados con `AuroraText` o `SparklesText`.
   * Tarjeta de autenticación reforzada con `MagicCard` y borde animado `BorderBeam`.
   * Botón de ingreso interactivo con `ShimmerButton`.
5. **Gestión de Pacientes (`src/pages/PatientsPage.tsx` & `PatientDetailPage.tsx`):**
   * Visualización de fichas clínicas mediante `SpotlightCard`.
   * Apertura de resúmenes de paciente y fichas rápidas mediante `MobileBottomSheet` deslizable con niveles de altura interactivos (*snap points*).
   * Consulta rápida de movilidad con `JointDetailPopover`.

---

### PARTE 2: Módulos Especializados, Herramientas, Paciente & Reportes Clínicos

1. **Catálogo de Ejercicios (`src/pages/ExercisesPage.tsx` / `CatalogPage.tsx`):**
   * Tarjetas interactivas con `SpotlightCard`, previsualización con `PixelImage` y etiquetas `HeroChip`.
   * Búsqueda y filtrado anatómico con `CompactQuickSelector` y `CommandPalette`.
2. **Estadísticas & Reportes Clínicos (`src/pages/StatsPage.tsx`):**
   * Selector de fechas táctil con presets rápidos mediante `DateRangePicker`.
   * Listas con desplazamiento degradado mediante `ScrollShadow`.
   * Detección de incidencias biomecánicas con `IncidentReportCard`.
   * Anillos de progreso cinemático con `AnimatedCircularProgressBar`.
   * Resaltado de conclusiones diagnósticas con `Highlighter` y guía de lectura con `TracingBeam`.
3. **Dashboard del Paciente (`src/pages/PatientDashboard.tsx` & `PatientExercisesPage.tsx`):**
   * Tarjeta de progreso de rutina con `AssignmentProgressCard`.
   * Gamificación con `GamifiedBadgeCard` y celebración con `ConfettiButton`.
   * Visualizador de esfuerzo o ritmo con `WaveformVisualizer`.
   * Cinta continua de consejos terapéuticos con `Marquee`.
4. **Herramientas Clínicas, Calibración & OCR (`src/pages/ToolsPage.tsx`, `CalibrationPage.tsx`, `OCRScannerPage.tsx`):**
   * Controles clínicos precisos con `ClinicalSlider` y `ExpandableToggle`.
   * Estado del sistema y lectura de documentos con `EmailSystemStatusCard`, `AILoader` y `PremiumSkeleton`.
5. **Perfil & Configuración (`src/pages/ProfilePage.tsx`, `SettingsPage.tsx`):**
   * Estructura modular con `CollapsibleProfile`, selector de secciones con `AnimatedTabs` y conmutador táctil `AnimatedThemeToggler`.
6. **Consolidación de la Galería UI (`src/pages/UIShowcasePage.tsx`):**
   * Verificación exhaustiva de que todos los componentes del sistema se encuentren debidamente catalogados, operando en vivo y sin advertencias.

---

## 4. Criterios de Calidad y Verificación

1. **Cero Duplicidades:** Cada componente desplegado reemplazará directamente elementos obsoletos o estáticos.
2. **Lógica Completa:** Ningún componente se insertará como cascarón vacío; cada uno estará conectado a datos reales (Supabase, demo data o estados reactivos).
3. **Compilación y Linters:** Ejecución de `lint_applet` y `compile_applet` al finalizar para garantizar 0 errores de TypeScript y 100% consistencia.
