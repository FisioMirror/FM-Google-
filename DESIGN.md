# FisioMirror — Design System & Craft Contract

> Extiende el sistema existente (`src/index.css`, `tailwind.config.ts`). No lo reemplaza.
> Toda decisión visual nueva debe poder justificarse con una regla de acá.

## Modo de superficie

- **Operate**: dashboards, fichas de paciente, carga de datos, ajustes. Manda la escaneabilidad, la consistencia y la escena real de uso. La marca vive en el detalle preciso, no en el espectáculo.
- **Experience**: espejo AR, calibración, progreso del paciente. El artefacto (el cuerpo en movimiento) lidera; la interfaz se retira.
- **Persuade**: sólo login/marketing. Ahí sí se permite ambición visual.

## Identidad clínica

**Principio rector: instrumento médico, no app de bienestar.**

1. **Teal profundo = confianza clínica.** `--c-primary: #00504d` es el ancla. El mint (`#8ad3cf`) es acento, nunca fondo de superficies grandes.
2. **El dato es el héroe.** Números en `tabular-nums`, tamaño `headline`, etiqueta en `label-sm` mayúscula con tracking. Nunca un número sin unidad ni contexto.
3. **Rojo sólo para riesgo.** `--c-error` se reserva a dolor alto, alertas y destructive. Prohibido como decoración.
4. **Terracota (`#E2725B`) = calidez humana**, para mensajes del paciente y estados de recuperación. No para errores.
5. **Sin emojis.** La calidez se logra con copy y micro-movimiento, no con emojis.
6. **Vocabulario anatómico.** La iconografía usa metáforas clínicas (columna, rodilla, marcha, ROM, EMG), no genéricas de "fitness".

## Color

| Token | Light | Uso |
|---|---|---|
| `--c-primary` | `#00504d` | Acción primaria, navegación activa, énfasis |
| `--c-primary-600` | `#156966` | Hover, gradientes |
| `--c-primary-fixed-dim` | `#8ad3cf` | Acento, bordes activos, data-viz |
| `--c-secondary` | `#3a5f94` | Información, links secundarios |
| `--c-tertiary` | `#E2725B` | Calidez, recuperación, paciente |
| `--c-background` | `#f8fafc` | Fondo de app |
| `--c-surface` | `#ffffff` | Tarjetas |
| `--c-error` | reservado | Sólo riesgo |

Reglas:
- Máximo **2 acentos** por pantalla.
- Texto sobre color: sólo `--c-on-*`. Nunca blanco sobre `--c-primary-fixed-dim`.
- Data-viz: rampa teal → azure; terracota sólo para "dolor/limitación".
- Dark mode no invierte jerarquías: el teal se vuelve luminoso (`#2dd4bf`), las superficies se separan por elevación, no por borde duro.

## Tipografía

- **Montserrat** (UI y datos), **Playfair Display** (sólo editorial/marketing), **JetBrains Mono** (código/IDs).
- Escala: `display-lg 48/52` · `headline-lg 32/40` · `headline-md 24/32` · `title-md 18/26` · `body-lg 16/26` · `body-md 14/22` · `label-sm 12/16` (tracking 0.06em, mayúsculas).
- Máximo 2 pesos por pantalla (500/700). Prohibido 300 en texto clínico.
- Línea de texto: 60–75 caracteres. Nada de párrafos de 120 caracteres en desktop.

## Superficies

Tres niveles, no cinco:

1. **Base** — `--c-background`. Sin sombra.
2. **Card** — superficie + borde `outline/12` + `shadow-soft`. Radio 24px.
3. **Overlay** — glass real (`blur(24-32px) saturate(180%)`) sólo para elementos flotantes (modal, dock, command palette). **Prohibido glass en tarjetas de datos**: baja el contraste del número.

Glass permitido: `.glass-panel`, `.glass-modal`, `.dock-nav`. Todo lo demás usa superficie sólida.

## Espaciado y layout

- Base 4px. Ritmo 8/12/16/24/32/40/64.
- Gutter móvil 16px, desktop 24px. Contenedor máx 1440px.
- Densidad clínica: filas de tabla 48px, targets 44px mínimo, separación entre grupos 24px.
- Una sola columna de lectura en móvil; en desktop, grid 12 columnas con `gap-6`.

## Movimiento

- Motor: `framer-motion`. Duraciones 120–240ms; entrada de página 320ms máx.
- Curva estándar: `cubic-bezier(0.16, 1, 0.3, 1)`. **Sin rebote en contextos clínicos.**
- Animar sólo `transform` y `opacity`. Nunca `width/height/top/left`.
- Loop permanente sólo si comunica estado (latido, respiración, progreso). Máximo 1 loop visible por pantalla.
- `prefers-reduced-motion`: todo loop se detiene, las entradas se vuelven fade.

## Iconografía

- Material Symbols Outlined vía `<Icon name="..."/>` para UI general.
- Lucide para acciones densas (toolbars, tablas).
- Set clínico propio (`ClinicalIcons`) para conceptos fisioterapéuticos.
- Trazo 1.75–2px, esquinas redondeadas, 24x24. Nunca mezclar dos sets en el mismo grupo de acciones.

## Accesibilidad (piso, no techo)

- Contraste AA (4.5:1 texto, 3:1 UI). Verificar el par real, no el token.
- Foco visible siempre: `ring-2 ring-primary/60 ring-offset-2`.
- Todo control tiene label accesible; los icon-only, `aria-label`.
- Estados: hover, focus, active, disabled, loading, error, empty. Los siete.
- Nunca comunicar estado sólo con color.

## Prohibiciones (anti-slop)

- Gradientes arcoíris, glass sobre glass, sombras de 5 capas.
- Emojis, iconos decorativos sin función, "sparkles" en pantallas clínicas.
- Texto en gris claro (`#9ca3af`) sobre blanco.
- Cards dentro de cards dentro de cards.
- Animaciones que se reproducen en loop sin significado.
- Números sin unidad, fechas sin formato local, siglas sin expandir la primera vez.
