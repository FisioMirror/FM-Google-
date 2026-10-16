# Plan de Verificación, Corrección y Armonización (Versión Revisada)

Este plan incorpora con precisión las directrices del equipo:
1. **Respaldos, Restauración y Bitácora de Auditoría (Supabase)**: Se gestionan **exclusivamente en Supabase**, sin interfaces, paneles de administración ni visores expuestos dentro de la aplicación cliente. La app únicamente se encarga de enviar de forma transparente y silenciosa los eventos de auditoría a Supabase (`audit_logs`).
2. **Gama Ampliada de Reportes en PDF**: En lugar de solo el PDF rápido y de IA, se incorpora la selección de 4 tipos clínicos de reporte:
   - **Informe de Evolución y Sesiones** (seguimiento general y métricas biomecánicas).
   - **Reporte de Casos de Dolor y Compensaciones** (incidentes EVA, comentarios de dolor en sesión AR y banderas rojas).
   - **Informe Médico para Especialista Tratante** (resumen clínico formal para interconsulta médica).
   - **Récipe / Prescripción de Rutina Domiciliaria** (ejercicios asignados, series, repeticiones y rangos angulares ROM).
3. **Visualización del Modelo 3D en Modo AR**: Verificación y conexión del demostrador 3D PiP (`ARModel3DOverlayPiP`) en `ARMirrorPage.tsx`, asegurando rotación, sincronización angular y alternancia fluida desde los controles del HUD.
4. **Galería UI y Acabados de Interfaz**: Implementación armónica y funcional de los componentes de las suites de UI (`FloatingControlsSuite`, `NavigationDocksSuite`, `ActivityCardsSuite`, `RealTimeMetricsSuite`, `HeroUI`, `Magic UI`) respetando el sistema de diseño FisioMirror.
5. **Internacionalización (i18n)**: Verificación del selector trilingüe (Español `ES`, Inglés `EN`, Portugués `PT`) en cabeceras principales y persistencia de traducciones en layouts y vistas.

---

## 1. Módulos y Diagnóstico de Ajustes

| Módulo | Decisión de Arquitectura | Ajuste Concreto |
|---|---|---|
| **1. Reportes en PDF** | Ampliación de gama de reportes clínicos en `pdfExport.ts` y `PDFExportModal.tsx`. | Crear las 4 modalidades (Evolución, Dolor y Compensaciones, Informe Médico, Récipe/Prescripción) tanto en formato simple como asistido por IA; conectar botón de descarga en `PatientDashboard` y `PatientDetailPage`. |
| **2. Respaldos y Restauración** | **100% Supabase / Backend**. Sin UI en la app. | Mantener los protocolos exclusivamente en Supabase Cloud / PostgreSQL conforme a `docs/BACKUP_AND_RESTORE.md`. No exponer pantallas ni modales de administración en la aplicación. |
| **3. Bitácora de Auditoría (Logs)** | **100% Supabase / Backend**. Sin visor en la app. | Asegurar que la app emita silenciosamente los eventos forenses a la tabla `audit_logs` de Supabase (`logAuthEvent` en login, `logExerciseAssignment` en rutinas, `logPatientRecordAccess` en expedientes, `logReportExport` en generación de PDFs) sin mostrar registros a los usuarios. |
| **4. Modelo 3D en Modo AR** | Verificación y conexión en `ARMirrorPage.tsx`. | Validar que el botón flotante y el conmutador de la barra inferior activen correctamente `ARModel3DOverlayPiP`, con renderizado del personaje 3D, fases del ejercicio y control de perspectiva sin interferir con MediaPipe. |
| **5. Internacionalización (i18n)** | Verificación y conexión de `es`, `en`, `pt`. | Colocar el selector de idioma en el encabezado global (`FisioLayout.tsx` y `PatientLayout.tsx`), asegurando sincronización inmediata de textos y persistencia en `localStorage`. |
| **6. Galería UI y Dashboards** | Implementación coherente y funcional. | Validar que los componentes de las suites de navegación, controles flotantes y KPIs en `DashboardFisio.tsx` y `PatientDashboard.tsx` tengan lógica real, contraste adecuado en modo oscuro y sin errores de consola. |

---

## 2. Plan Detallado de Implementación por Archivo

### A. Gama Ampliada de Reportes en PDF
- **`src/lib/pdfExport.ts`**:
  - Implementar funciones generadoras para las 4 tipologías:
    1. `exportEvolutionReportPDF`: Informe de progreso, adherencia y sesiones históricas.
    2. `exportPainAndCompensationReportPDF`: Resumen de incidentes de dolor referidos (comentarios de dolor post-ejercicio, escala EVA y registros de compensaciones biomecánicas).
    3. `exportMedicalReferralReportPDF`: Informe formal para el médico tratante / interconsulta con diagnóstico, antecedentes clínicos y evolución.
    4. `exportPrescriptionRecipePDF`: Récipe formal de fisioterapia con la rutina domiciliaria prescrita (ejercicio, series, repeticiones, objetivo ROM y notas del terapeuta).
  - Mantener soporte dual: exportación directa con `jsPDF` y estilizada/maquetada mediante `html2canvas`.
  - Registrar automáticamente cada exportación en `audit_logs` mediante `logReportExport`.
- **`src/components/ui/PDFExportModal.tsx`**:
  - Incorporar selector de tipo de reporte (`evolucion` | `dolor` | `medico` | `recipe`) con iconos clínicos descriptivos antes de seleccionar el modo (rápido o estilizado).
- **`src/pages/PatientDashboard.tsx`**:
  - Añadir botón de acción rápida *"Descargar Informe Clínico en PDF"* para que el paciente pueda exportar su progreso o su récipe prescrito.

### B. Bitácora de Auditoría Silenciosa en Supabase
- **`src/pages/Login.tsx`**:
  - Conectar llamada silenciosa a `logAuthEvent('AUTH_LOGIN_SUCCESS', ...)` tras validar credenciales con éxito.
  - Conectar llamada a `logAuthEvent('AUTH_LOGIN_FAILED', ...)` ante fallos de credenciales o tokens inválidos.
- **`src/components/ReassignRoutineModal.tsx`**:
  - Conectar llamada silenciosa a `logExerciseAssignment(...)` tras guardar o reasignar rutinas en Supabase.
- **`src/lib/auditService.ts`**:
  - Garantizar manejo *fail-soft*: si no hay conexión o falla la RPC en Supabase, registrar aviso local en consola sin interrumpir la operación del usuario.

### C. Visualización del Modelo 3D en Modo AR
- **`src/pages/ARMirrorPage.tsx`**:
  - Verificar que `ARModel3DOverlayPiP` reciba el `exerciseName` y ángulo objetivo correctos del ejercicio en curso.
  - Comprobar que el botón *"Guía 3D"* del dock inferior y el toggle del panel de ajustes alternen el estado `showModel3D` de forma fluida.
  - Verificar que la ventana PiP permita cambiar perspectiva (frontal, diagonal, lateral), rol de avatar y velocidad sin congelar la detección de MediaPipe.

### D. Internacionalización (i18n: ES, EN, PT)
- **`src/components/FisioLayout.tsx`**:
  - Conectar selector de idioma (`ES` · `EN` · `PT`) en la barra de herramientas superior para alternar de forma inmediata entre español, inglés y portugués.
  - Conectar `useTranslation()` en los ítems de navegación lateral.
- **`src/components/PatientLayout.tsx`**:
  - Conectar selector de idioma en la cabecera y adaptar los ítems del menú con `useTranslation()`.

### E. Galería UI y Optimización de Dashboards
- **`src/pages/DashboardFisio.tsx`**:
  - Verificar que las tarjetas de KPIs, gráficos y el feed de actividad usen `tabular-nums`, transiciones suaves de 300ms y contrastes WCAG AA en tema claro y oscuro.
- **`src/pages/PatientDashboard.tsx`**:
  - Asegurar la respuesta táctil y coherencia visual en las tarjetas de energía y estado de recuperación.

---

## 3. Plan de Verificación

1. **Reportes PDF**:
   - Generar y descargar los 4 tipos de reportes (Evolución, Dolor, Médico y Récipe) comprobando su formato visual, datos y firmas.
   - Probar la exportación tanto desde el perfil de terapeuta (`PatientDetailPage`) como desde el portal de paciente (`PatientDashboard`).
2. **Bitácora en Supabase**:
   - Iniciar sesión (éxito y fallo) y asignar una rutina; verificar que se generen los registros en la tabla `audit_logs` de Supabase sin alterar el flujo visual ni mostrar datos técnicos al usuario.
3. **Modelo 3D en AR**:
   - Iniciar sesión en el Espejo AR, encender la "Guía 3D", alternar perspectivas y minimizar a píldora flotante verificando 60 FPS estables.
4. **Internacionalización**:
   - Cambiar entre Español, Inglés y Portugués en la barra superior y comprobar que la interfaz cambie al instante sin recargar la página.
5. **Compilación y Linteo**:
   - Ejecutar `compile_applet` para certificar 0 errores de compilación TypeScript.
   - Ejecutar `lint_applet` para confirmar la estabilidad del código.
