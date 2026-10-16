# Plan de Refinación y Mejora Funcional: Reportes PDF, i18n y Biomecánica MediaPipe

Plan arquitectónico integral para elevar la calidad operativa de FisioMirror en tres áreas prioritarias: exportación de documentos clínicos con validez e identidad de marca en PDF, soporte multilingüe completo (ES, EN, PT) con persistencia reactiva, y optimización de rendimiento en la detección biomecánica de puntos con MediaPipe básico.

---

## Decisiones Críticas y Resumen de Alcance

> [!IMPORTANT]
> Se han definido tres líneas de trabajo complementarias sin alterar la estructura existente de base de datos ni romper compatibilidad con las funciones actuales de la app:
> 
> 1. **Reportes PDF**: Creación de 3 plantillas clínicas vectoriales/imprimibles selladas con la identidad visual FisioMirror (Deep Clinical Teal `#00504d` y Azure Blue `#3a5f94`), con sello de validación técnica, datos del profesional, rangos articulares y feedback de IA/automático.
> 2. **i18n (Internacionalización)**: Activación completa de los 3 idiomas (`es`, `en`, `pt`), integración de selector interactivo en la cabecera global (`FisioLayout` y `PatientLayout`) y en `SettingsPage`, sincronizado con `localStorage` y React-i18next.
> 3. **Biomecánica MediaPipe**: Corrección del cuello de botella en `src/hooks/usePoseDetection.ts` (reduciendo `modelComplexity` de 2-Heavy a 1-Standard/0-Lite adaptativo, aplicando candado de fotogramas en vuelo `isProcessingFrame` y suavizado de ángulos para erradicar el lag).

---

## 1. Módulo de Reportes Clínicos en PDF

### 1.1 Nuevas Plantillas con Sello de Marca
- **Plantilla A: Resumen de Fin de Sesión (Post-Session Report)**:
  - Generada al concluir un ejercicio o rutina en el Espejo AR.
  - Métricas clave: Duración activa, repeticiones logradas vs. objetivo, ROM máximo alcanzado por articulación, porcentaje de adherencia postural, compensaciones motrices registradas y recomendación inmediata.
- **Plantilla B: Prescripción Terapéutica / Receta de Ejercicios**:
  - Diseñada para impresión o envío al paciente por correo o WhatsApp.
  - Encabezado con datos del fisioterapeuta, centro clínico, fecha de emisión, lista de ejercicios prescritos con número de series, repeticiones, tolerancia angular, días asignados, precauciones de seguridad y espacio de firma/sello profesional.
- **Plantilla C: Historia Clínica y Evolución Temporal (Comprehensive Clinical Record)**:
  - Consolidado del expediente del paciente para auditorías médicas o derivaciones a especialistas.
  - Gráfico de progreso de ROM a lo largo de las semanas, historial de sesiones recientes, antecedentes patológicos y análisis narrativo generado por IA o síntesis clínica.

### 1.2 Identidad Visual y Validación
- Paleta institucional: Cabecera en *Deep Clinical Teal* (`#00504d`), acentos en *Azure Slate* (`#3a5f94`), tipografía nítida para impresión (`Helvetica` / `Montserrat`).
- Sello de certificación digital: Marca gráfica *"FisioMirror Verified Biomechanical Tele-Rehab Session"* con fecha, ID de sesión y hash de integridad.
- Formato dual de descarga: Vectorial ultra rápido vía `jsPDF` con tablas formateadas y exportación de alta fidelidad vía canvas para reportes con capturas del espejo AR.

---

## 2. Internacionalización Integral (i18n)

### 2.1 Soporte Multilingüe (Español, Inglés y Portugués)
- Completar las llaves de traducción en `src/i18n/es.ts`, `src/i18n/en.ts` y `src/i18n/pt.ts` cubriendo:
  - Menús de navegación y acciones globales (`common`, `navigation`).
  - Términos de biomecánica y tele-rehabilitación (ángulos, rangos articulares, flexión, extensión, abducción, compensaciones).
  - Modalidades y textos de exportación en PDF.
  - Mensajes de voz y retroalimentación del Espejo AR.
  - Pantallas de Paciente, Fisioterapeuta, Ajustes y Escáner OCR.

### 2.2 Componente Selector de Idioma Global (`LanguageSelector`)
- Dropdown sutil o selector de píldora interactiva integrado en la barra superior de `FisioLayout` y `PatientLayout`, permitiendo alternar entre `ES`, `EN` y `PT` con 1 clic.
- Sincronización bidireccional inmediata con `localStorage('fisio_language')` y evento `fisio_language_changed`.
- Cambio instantáneo sin parpadeo ni recarga completa de la página.

---

## 3. Optimización Biomecánica con MediaPipe Básico

### 3.1 Diagnóstico del Cuello de Botella
- En `src/hooks/usePoseDetection.ts`, se identificó `modelComplexity: 2` (modelo *Heavy*), el cual satura la GPU/CPU en portátiles y móviles convencionales, reduciendo los cuadros por segundo a <15 FPS.
- En el ciclo de captura `cameraRef.current`, la función `onFrame` enviaba frames continuamente sin verificar si el frame anterior había completado su inferencia (`await pose.send`), saturando la cola de mensajes de WebAssembly.

### 3.2 Acciones de Optimización
1. **Modelo Adaptativo y Liviano**:
   - Cambiar a `modelComplexity: 1` por defecto (modelo estándar optimizado) y `modelComplexity: 0` (modelo Lite de baja latencia) en dispositivos móviles o con hardware limitado (`capabilities.isLowEnd`).
2. **Candado de Frames en Vuelo (`isProcessingFrameRef`)**:
   - Descartar frames acumulados en el buffer si la GPU aún está calculando el fotograma anterior, asegurando que el renderizado siempre refleje el estado más reciente a 30-60 FPS fluidos.
3. **Filtro de Visibilidad y Suavizado Exponencial de Ángulos**:
   - Ignorar landmarks con `visibility < 0.5` para evitar saltos o deformaciones en el esqueleto.
   - Aplicar filtro de media móvil exponencial (EMA con $\alpha = 0.45$) tanto en coordenadas de articulaciones críticas como en el valor numérico del ángulo articular, erradicando el temblor (*jitter*) en el HUD de AR.
4. **Canvas Eficiente**:
   - Optimizar el contexto 2D (`willReadFrequently: false`) y limitar operaciones de redibujado solo a cuando existen landmarks válidos.

---

## 4. Diagrama de Arquitectura de los Flujos

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FisioMirror Frontend App                        │
└────────────────────────────────────────────────────────────────────────┘
          │                                  │
          ▼                                  ▼
┌───────────────────────┐          ┌───────────────────────┐
│     i18n Engine       │          │   MediaPipe Engine    │
│  (ES / EN / PT)       │          │   (Optimized Basic)   │
├───────────────────────┤          ├───────────────────────┤
│ • Header Selector     │          │ • ModelComplexity:1/0 │
│ • Settings Modal      │          │ • In-Flight Frame Lock│
│ • Reactive Dictionary │          │ • Exponential Filter  │
│ • LocalStorage Sync   │          │ • Stable Angle Feed   │
└───────────────────────┘          └───────────────────────┘
          │                                  │
          └─────────────────┬────────────────┘
                            ▼
          ┌───────────────────────────────────┐
          │     Clinical Reporting Engine     │
          │         (FisioMirror PDF)         │
          ├───────────────────────────────────┤
          │ 1. Post-Session Summary PDF       │
          │ 2. Routine Prescription Recipe    │
          │ 3. Comprehensive History & AI     │
          │ • Teal/Slate Clinical Seal        │
          │ • Vector Tables & ROM Analytics   │
          └───────────────────────────────────┘
```

---

## 5. Fases de Ejecución

1. **Fase 1: Motor Biomecánico**: Refactorización de `src/hooks/usePoseDetection.ts` y sincronización con `src/hooks/useMediaPipeModel.ts` para eliminar la lentitud y optimizar la precisión de ángulos.
2. **Fase 2: Motor de Internacionalización**: Extensión de diccionarios en `src/i18n/`, creación del componente `LanguageSelector` e integración en barras de navegación y vistas principales.
3. **Fase 3: Motor de Documentos PDF**: Creación de las plantillas de PDF de sesión, receta de ejercicios e informe clínico con identidad visual en `src/lib/pdfExport.ts`, conectándolas a los modales de sesión y expediente.
4. **Fase 4: Verificación y Compilación**: Pruebas de renderizado, verificación de FPS, descarga de PDFs de prueba y compilación exitosa con `compile_applet`.
