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
- **Hecho**: shells (`FisioLayout`, `PatientLayout`), de-slop global (emojis/etiquetas), `100dvh`, `Login`, auth (Reset/Registro/UpdatePassword), normalización masiva de tipografía/radios/sombras/duraciones por tokens.
- **Pendiente**: `PatientDetailPage`, resto de páginas, integración de componentes de galería (`UIShowcasePage`/`megaSuite`) con lógica real.
