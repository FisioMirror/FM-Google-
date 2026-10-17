# AGENTS.md — FisioMirror (FM-Google)

Guía para agentes que trabajen en esta app. **Aplícala en todo cambio de UI.**

## Contexto del proyecto
- Stack: React + Vite + TypeScript + Tailwind + Supabase.
- Rama de trabajo: `dev/opencode-mobile`.
- **Sin `node_modules` ni build/typecheck local.** Verificación = `git push` y esperar
  build READY en Vercel (el build solo detecta errores de sintaxis/imports, no de tipos).
- Trabajo **por lotes**: cada lote termina en un commit pusheado y verificado.
- Regla base: **mejorar, nunca eliminar** funcionalidad.

## Fuente de verdad del sistema de diseño
- `tailwind.config.ts` — escala de `fontSize`, `borderRadius`, `boxShadow`, `animation`, colores.
- `src/index.css` — CSS variables (`:root` / `.dark`), glass, animaciones, `prefers-reduced-motion`.
- `src/lib/designTokens.ts` — `FM_DESIGN_SYSTEM`, `CLINICAL_PASTELS` y el contrato de armonización.
- `src/design-system/DESIGN_CONTRACT.md`.

## Convenciones (obligatorias en todo cambio de UI)
- **Tipografía**: usar la escala. Mínimo `text-2xs` (10px); `text-xs` (12px), `text-sm` (14px), `text-base` (16px); `title/headline/display` para jerarquía. **Prohibido** `text-[Npx]` arbitrario.
- **Radios**: solo escala — `rounded-3xl` (paneles), `rounded-2xl` (tarjetas), `rounded-xl` (controles/inputs/botones), `rounded-full` (píldoras). **Prohibido** `rounded-[...]`.
- **Shell de página**: usar las primitivas canónicas — `.fm-page` (ancho 7xl + `space-y-8`), `.fm-page-narrow` (4xl), `.fm-title` (H1 responsive), `.fm-subtitle`, `.fm-section-title`. Los layouts ya aplican el padding exterior: **no** volver a añadir `px/py` en la raíz de la página.
- **Sombras**: suaves y clínicas — `shadow-sm`, `shadow-card`, `shadow-elevated` (o `FM_DESIGN_SYSTEM.shadows`). **Prohibido** `shadow-lg`/`shadow-xl`/`shadow-2xl` de Tailwind. Glows solo vía tokens/`shadow-[...]` intencional.
- **Transiciones**: `duration-300 ease-out` estándar. Evitar `duration-500/700`.
- **Color**: tokens semánticos (`surface*`, `on-surface*`, `primary*`, `outline*`). Pasteles médicos vía `CLINICAL_PASTELS`. Mantener coherencia claro/oscuro con `dark:`.
- **Cero emojis** en UI. Wording profesional/clínico. Sin etiquetas tipo `v2.0`/`Premium`/`Élite`.
- **Móvil**: `min-h-[100dvh]` (nunca `100vh`/`min-h-screen`); respetar safe-area en FAB/docks; respetar `prefers-reduced-motion`.
- **A11y**: `role`/`aria-*` en modales (`role="dialog"`, `aria-modal`), `aria-label` en botones-ícono, cerrar drawer/modal con `Escape` + scroll-lock.
- **Mejorar, no eliminar**: no quitar funcionalidad; refinar jerarquía, espaciado, radios, sombras y tipografía dentro del sistema.

## Efectos y motion
- Los efectos (glass, glows, breathe, shimmer) se **mantienen** y se refinan: sombras más suaves y duraciones uniformes.
- No introducir loops infinitos nuevos sin necesidad; preferir transiciones de entrada cortas.

## Verificación por lote
```bash
git add -A && git commit -m "..." && git push origin dev/opencode-mobile
# luego confirmar build READY en Vercel
```

## Estado del barrido de refinamiento
- **Hecho (global, por commits)**: shells (`FisioLayout`, `PatientLayout`), de-slop (emojis/etiquetas/v2.0/Premium), `100dvh`; tipografía/radios/sombras/duraciones a tokens; primitivas `.fm-page`/`.fm-page-narrow`/`.fm-title`/`.fm-section-title`; color de texto neutro → `on-surface`/`on-surface-variant`; controles activos → `bg-primary text-on-primary`; sombras → `shadow-sm`/`shadow-card`; bordes → `outline/15`; títulos `font-headline-lg` → primitivas.
- **Páginas con shell/título normalizados**: `PatientDetailPage`, `DashboardFisio`, `PatientsPage`, `StatsPage`, `ExercisesPage`, `ToolsPage`, `ProfilePage`, `PatientDashboard`, `PatientExercisesPage`, `SettingsPage`, `OCRScannerPage`, `UIShowcasePage`, `NotFound` + modales (`LegalModal`, layouts).
- **Pendiente**: repaso fino por página (estados vacío/loading, a11y de modales, ritmo de espaciado) en `AIAssistantPage`, `CalibrationPage`, `CatalogPage`, `ARMirrorPage`, `TokenGeneratorPage`, `Login`/auth; integración de componentes de galería (`UIShowcasePage`/`megaSuite`) con lógica real.

## Nota de seguridad (subagentes)
- Un subagente ejecutó comandos destructivos (revert con `git restore` y un regex que borró dígitos). **Regla**: los subagentes que editen código deben usar solo Read/Edit/Write; **prohibido** `git`/`sed` destructivo. Revisar `git diff` antes de commitear.
