# Plan de Estandarización, Responsividad y Optimización de Pantalla AR (Móvil y Escritorio)

## 1. Diagnóstico del Problema y Requerimientos

En pantallas móviles, la superposición de elementos en el Modo AR y la pantalla de Calibración generaba:
- **Obstrucción visual del paciente:** Bloques centrales grandes y medidores que tapan el cuerpo mientras el usuario intenta encuadrarse frente a la cámara.
- **Desproporción tipográfica y numérica:** Números de repeticiones y ángulos con tamaños fijos que desbordan o consumen más de la mitad del espacio vertical del móvil.
- **Saturación de widgets aislados:** Múltiples tarjetas independientes flotando simultáneamente (nombre de ejercicio, series/reps, metrónomo, medidor angular, modelo 3D, feedback de voz, energía).

### Directrices Seleccionadas por el Usuario
1. **Calibración:** Panel inferior colapsable tipo tarjeta flotante (transparente/glassmorphism), dejando el 85%+ de la pantalla despejada para ver el cuerpo y landmarks.
2. **Métricas en vivo en AR Mirror:** Barra superior flotante unificada de micro-métricas con dock inferior limpio y libre de solapamientos.
3. **Modelo 3D AR:** Mantiene su estatus de elemento esencial clínico, con auto-escala responsive (`w-[170px]` a `w-[210px]` en móvil) o modo pill colapsable, sin invadir la barra superior de métricas ni los controles de acción.

---

## 2. Plan de Implementación por Fases

### Fase 1: Rediseño Ergonómico de la Pantalla de Calibración (`CalibrationPage.tsx`)
- **Panel Inferior Colapsable Tipo Tarjeta Flotante:**
  - Sustituir los elementos que bloquean el centro de la pantalla en móvil (círculos pulsantes gigantes, tarjetas centrales superpuestas) por un panel inferior flotante con glassmorphism (`backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-2xl sm:rounded-3xl`).
  - Capacidad de minimizado/colapso con un toque para dar visibilidad total al encuadre corporal.
  - Indicador de estado claro: "Buscando cuerpo", "Mano detectada", barra de progreso y cuenta atrás no obstructiva.
- **Encuadre Guía Sutil:**
  - Silueta o guías de esquina translúcidas (`border-teal-400/30`) que orientan la postura sin cubrir la imagen del paciente.
- **Controles Accesibles:**
  - Botón "Omitir" y estado de confianza integrados de forma compacta y accesible sin desbordes.

### Fase 2: Barra Superior Flotante Unificada de Micro-Métricas en AR Mirror (`ARMirrorPage.tsx`)
- **Barra Superior Consolidada (Mobile First):**
  - En lugar de 3 tarjetas separadas en distintas esquinas, consolidar en una sola barra superior flotante con micro-chips:
    - `[ Ejercicio ]` (con truncado inteligente en pantallas pequeñas).
    - `[ Reps: X/Y ]` (números compactos y de alto contraste).
    - `[ Serie: A/B ]`.
    - `[ Ángulo: XX° ]` (con indicador cromático según precisión).
    - `[ Tiempo: MM:SS ]`.
- **Modo Esencial vs. Modo Completo:**
  - En **Modo Esencial**: Barra superior ultra-delgada con solo Reps, Serie y Ángulo + Modelo 3D (si el paciente lo activó) + Dock inferior.
  - En **Modo Completo**: Añade retroalimentación guiada por voz y detalles ampliados sin duplicar métricas en el centro.
- **Eliminación de Redundancias:**
  - Suprimir tarjetas duplicadas de repeticiones o ángulos que competían por espacio en el centro y esquinas inferiores.

### Fase 3: Dock Inferior Limpio y Ergonómico
- **Disposición en Fila Única Adaptativa:**
  - Controles primarios con touch-target ergonómico (mínimo 44px): Botón de Pausa/Reanudar destacado, botón Finalizar/Abandonar, interruptor de Guía 3D, selector Esencial/Completo y Ajustes.
  - Ajuste automático de padding y espaciado (`gap-2` en móvil, `gap-3` en tablet/escritorio) para evitar scrolls horizontales o saltos de línea antiestéticos.
- **Banner de Audio / Feedback IA:**
  - Ubicado inmediatamente sobre el dock como un pill flotante no invasivo, desapareciendo cuando no hay voz activa.

### Fase 4: Ajustes Finos de Escala en el Modelo 3D PiP (`ARModel3DOverlayPiP.tsx`)
- **Escala Proporcional en Pantallas Pequeñas:**
  - En viewports menores a 400px de ancho: ancho automático de 175px y alto de 230px, con controles internos simplificados a iconos táctiles de 36px.
  - Posicionamiento seguro en esquina superior derecha o inferior según orientación, con `z-index` armónico que previene solapamiento con la micro-barra superior.

---

## 3. Verificación y Control de Calidad
1. **Validación de Compilación y Sintaxis:**
   - Ejecutar `compile_applet` y `lint_applet` para confirmar cero errores tipográficos y de importación.
2. **Pruebas de Responsividad:**
   - Viewport Móvil Estándar (360px - 414px): Confirmar que el paciente tiene libre visión de su cuerpo, sin cortes en textos ni saltos de línea raros.
   - Viewport Tablet/Escritorio (768px - 1440px): Confirmar aprovechamiento de pantalla, tarjetas proporcionales y estabilidad visual.
3. **Flujo de Interacción:**
   - Probar transición de Calibración a AR Mirror.
   - Alternar Modo Esencial y Modo Completo.
   - Ocultar y mostrar Modelo 3D para verificar que no altere la posición de los demás controles.
