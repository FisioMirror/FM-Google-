# FisioMirror — DESIGN.md

Contrato visual y de interacción para agentes. Es la fuente de verdad para UI.
Si una skill o una idea contradice este archivo, gana este archivo.

## Identidad

- Producto clínico premium para fisioterapia: serio, cálido, preciso. Nunca "startup genérica".
- Sensación: clínica luminosa + vidrio óptico + movimiento contenido.
- Paleta: teal profundo, azul slate, terracota cálida y lima cinética como acento puntual.
- Prohibido: violeta/púrpura, degradados mesh llamativos en contenido clínico, glass sobre datos, emojis decorativos, lorem ipsum.

## Tokens

Fuente única: `src/index.css` (`:root` y `.dark`) + mapeo en `tailwind.config.ts`.
Nunca escribir hex sueltos en componentes; usar clases semánticas (`bg-surface`, `text-on-surface`, `border-outline-variant`) o `var(--c-*)`.

### Color
| Rol | Claro | Oscuro |
|---|---|---|
| Primario | `#00504d` teal | `#2dd4bf` aqua |
| Secundario | `#3a5f94` azure | `#93c5fd` |
| Terciario | `#E2725B` terracota | `#fdba74` |
| Fondo | `#f8fafc` | `#090d12` |
| Superficie | `#ffffff` | `#0e141d` |
| Texto | `#0f172a` | `#f8fafc` |
| Texto secundario | `#475569` | `#94a3b8` |
| Borde | `#cbd5e1` | `#1e293b` |
| Éxito | `#15803d` | `#34d399` |
| Warning | `#c2410c` | `#fbbf24` |
| Error | `#ba1a1a` | `#fca5a5` |

Reglas:
- Acento (`kinetic` lima) solo para energía/estado puntual; nunca texto sobre lima sin contraste.
- Teal = acción y marca. Azul = información/IA. Terracota = calidez/alertas suaves.
- Contraste mínimo 4.5:1 texto, 3:1 iconos y foco.
- Dark mode solo cambia variables; no duplicar estilos por componente.

### Tipografía
- Sans: `Montserrat` → `Inter` → system-ui.
- Display/editorial: `Playfair Display` solo en titulares de marca, nunca en datos clínicos.
- Mono: `JetBrains Mono` para tokens, códigos y métricas técnicas.

Escala aprobada: `label-sm 12`, `label-md 14`, `label-lg 16`, `body-md 14`, `body-lg 16`, `title-md 20`, `title-lg 22`, `headline-sm 24`, `headline-md 28`, `headline-lg 32` (móvil 28), `display-lg 48`, `display-editorial 56`.

Reglas:
- Cuerpo mínimo 14px; formularios y texto clínico 16px.
- Máximo 3 pesos por pantalla (400/500/600/700 según jerarquía).
- Números tabulares en métricas y tablas (`tabular-nums`).
- Sin tracking negativo por debajo de 24px.

### Espaciado y radios
- Base 4px; escala: 8 / 16 / 24 / 40 / 64.
- Padding de tarjeta 16–24; gap de grid 16; sección 40–64.
- Radios: `sm 8`, `md 12`, `lg 16`, `xl 20`, `2xl 24`, `3xl 32`; pills `full`.
- Altura mínima de control táctil: 44px.

### Sombras y superficies
- Reposo: `shadow-soft` o `shadow-card`. Elevado: `shadow-elevated`.
- Glass: `shadow-glass`; glow solo en foco/estado activo, nunca en reposo.
- Sin sombras duras ni bordes negros.

## Glass

- Solo en chrome: barras, nav, sheets, modales, toolbars. **Nunca** en tarjetas de datos clínicos, tablas o gráficos.
- Claro: `--glass-card` (0.72) sobre fondo con mesh suave; oscuro: 0.72 sobre `#0e141d`.
- `backdrop-filter: blur(28px) saturate(190%)`; borde 1px `--glass-border`; highlight superior con `gradient-specular`.
- Fallback obligatorio: si no hay `backdrop-filter`, fondo opaco con el mismo radio y borde.
- `prefers-reduced-transparency`: superficies opacas.
- Texto sobre glass siempre ≥4.5:1; si no, subir opacidad o quitar glass.

## Movimiento

- Duraciones: 120–200ms micro, 200–340ms transiciones, 400–600ms entrada de página.
- Easings: `smooth-out` (`cubic-bezier(0.16,1,0.3,1)`) por defecto; `elastic` solo en gestos.
- Animar solo `transform` y `opacity`; nada de `width/height/top/left` en loops.
- Un foco de movimiento por pantalla. Nada de loops decorativos en pantallas clínicas.
- `prefers-reduced-motion`: sin desplazamientos, solo crossfade ≤120ms.
- No animar métricas, gráficos de dolor, formularios ni datos que el usuario está leyendo.
- Springs solo para gestos (drag, sheet); nunca para cambios de layout.

## Componentes

- Botón primario: teal sólido, texto blanco, radio `lg`, altura 44–48, una sola acción primaria por vista.
- Secundario: outline o ghost; destructivo: `error` con confirmación que nombre el objeto.
- Inputs: label arriba, 16px, borde `outline-variant`, foco `ring` teal de 2px, error con texto y no solo color.
- Tarjetas: `surface`, borde 1px, radio `xl`, sombra suave; sin glass salvo que sean chrome.
- Sheets: radio superior 24–28, handle visible, foco atrapado, cierre por gesto y botón.
- Tablas: header sticky, filas 56–64px, números tabulares, scroll horizontal con sombra de borde.
- Gráficos: paleta teal/azul/terracota, grid sutil, tooltips con `surface`, leyenda siempre visible.

## Estados

- Loading: skeleton con la forma final (no spinner de pantalla completa).
- Vacío: qué es, por qué está vacío, una acción.
- Error: qué pasó + qué hacer + reintentar; conservar input.
- Offline: banner persistente y estado "guardado localmente" vs "sincronizado".
- Éxito: toast breve; nunca modal para algo reversible.

## Accesibilidad

- Foco visible en todo control (ring 2px teal, offset 2).
- Navegación completa por teclado; foco atrapado en modales.
- `aria-label` en iconos; `alt` real en imágenes; decorativos ocultos.
- No transmitir estado solo por color.
- Zoom 200% sin pérdida de contenido; texto reflow a 320px.

## Copy

- Español rioplatense neutro, "tú" consistente; ES/EN/PT.
- Botones verbo + objeto ("Crear paciente", "Asignar rutina").
- Errores accionables, sin culpar ni alarmar.
- Un término por concepto: paciente, rutina, sesión, ejercicio, progreso.

## Anti-patrones

- Glass en todo, degradados mesh fuertes, glow permanente.
- Más de una acción primaria por pantalla.
- Texto gris claro sobre glass.
- Animaciones de entrada en cada scroll de una tabla clínica.
- Sombras de colores, bordes de 2px decorativos, radios inconsistentes.
- Iconos de varios sets mezclados.

## Skills

- Dirección y craft: `frontend-design`, `high-end-visual-design`, `ui-designer`.
- Glass y superficies: `glassmorphism-craft`.
- Color y tipografía: `color-system-oklch`, `typography-spacing`, `iconography-system`.
- Motion: `motion-system-design`, `animate`, `review-animations`, `animation-performance`.
- Layout y responsive: `responsive-density`, `navigation-ia`, `i18n-layout`.
- Estados y formularios: `form-ux`, `async-state-ux`, `bottom-sheets-dialogs`.
- Datos y PWA: `dashboard-data-viz`, `pwa-installable`, `performance-budget`.
- Confianza clínica y copy: `clinical-trust-ui`, `ux-microcopy`.
- QA: `design-audit-rubric`, `web-design-guidelines`, `accessibility-engineer`, `break-ui`.

## Checklist antes de dar una pantalla por terminada

- [ ] Una acción primaria clara; jerarquía evidente en 3 segundos.
- [ ] 360px, 768px y 1280px; claro y oscuro; reduced motion.
- [ ] Contraste y foco verificados; teclado completo.
- [ ] Loading/empty/error/offline diseñados.
- [ ] Sin hex sueltos ni estilos duplicados de dark mode.
- [ ] Glass solo en chrome; datos legibles.
- [ ] Copy en ES/EN/PT, sin claves crudas.
- [ ] Sin violaciones de los anti-patrones.
