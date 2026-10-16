# Contrato de Diseño Único y Estandarización Global — FisioMirror

> **Objetivo Arquitectónico:** Unificar de forma quirúrgica los componentes heterogéneos de FisioMirror (Bolt, Google Stitch, Deepcheck y fragmentos manuales) bajo una identidad visual premium, coherente, accesible y con microinteracciones fluidas.

---

## 1. Guía de Tokens y Clases Utilitarias Estándar

### A. Jerarquía Estricta de Radios (`border-radius`)
Para eliminar el ruido visual de esquinas cuadradas mezcladas con píldoras arbitrarias:

| Nivel Estructural | Clase Estándar | Razón de Uso | Clases Disonantes a Reemplazar |
| :--- | :--- | :--- | :--- |
| **Contenedor Primario** | `rounded-3xl` (24–32px) | Paneles principales de dashboard, vistas de página completas, modales de pantalla completa. | `rounded-none`, `rounded-lg`, `rounded-md`, `rounded-xl` |
| **Tarjetas y Paneles** | `rounded-2xl` (16–20px) | Tarjetas clínicas, popovers, burbujas de mensaje, diálogos flotantes, widgets de ejercicios. | `rounded-lg`, `rounded-md`, `rounded-sm`, `rounded-full` |
| **Elementos Internos** | `rounded-xl` (12px) | Botones primarios/secundarios, inputs de texto, chips de filtro, mini-avatares, badges. | `rounded-md`, `rounded-sm`, `rounded-none` |
| **Indicadores / Pills** | `rounded-full` | Insignias de estado ('En línea', 'Activo'), avatars circulares, toggles. | Usar solo para chips flotantes de una sola palabra. |

---

### B. Mapeo de Reemplazo Rápido (Tailwind Harmonization Map)

| Clase Disonante (Bolt/Stitch/Deepcheck) | Clase Estándar FisioMirror | Beneficio Inmediato |
| :--- | :--- | :--- |
| `bg-white` | `bg-surface/90 dark:bg-surface-container-low/80` | Soporte real de modo oscuro sin destellos blancos. |
| `bg-gray-50`, `bg-slate-50` | `bg-surface-container-lowest dark:bg-surface-container-lowest` | Profundidad armónica con tokens HeroUI/M3. |
| `bg-gray-100`, `bg-slate-100` | `bg-surface-container/60 dark:bg-surface-container/40` | Contraste refinado para fondos anidados. |
| `bg-gray-900`, `bg-black` | `bg-surface-container-highest dark:bg-surface-container-low` | Evita negros puros agresivos (#000000). |
| `border-gray-200`, `border-slate-200` | `border-outline/15 dark:border-white/10` | Borde sutil y translúcido que respeta glassmorphism. |
| `border-gray-300`, `border-slate-300` | `border-outline/25 dark:border-white/15` | Mayor definición accesible sin rigidez. |
| `shadow-2xl`, `shadow-xl` | `shadow-xs hover:shadow-md transition-shadow` | Elimina sombras opacas gigantes artificiales. |
| `transition duration-100` | `transition-all duration-300 ease-out` | Microinteracción clínica suave y fluida. |
| `font-extrabold` indiscriminado | `font-bold text-on-surface tracking-tight` | Jerarquía tipográfica legible para pacientes. |

---

### C. Receta Estándar de Glassmorphism Clínico
Aplicar a todas las tarjetas principales de información y análisis biomecánico:
```tsx
className="bg-surface/85 dark:bg-surface-container-low/80 backdrop-blur-md border border-outline/15 dark:border-white/10 rounded-2xl shadow-xs hover:border-teal-500/30 transition-all duration-300"
```

---

## 2. Patrones Wrapper y HOCs Limpios

Ubicados en `src/components/design-system/`:

### A. `FisioCard`
Normaliza tarjetas de ejercicios, progreso, métricas o recomendaciones:
```tsx
import { FisioCard } from '@/components/design-system';

<FisioCard variant="glass" interactive onClick={handleOpen}>
  <h4 className="text-sm font-bold text-on-surface">Flexión de Rodilla</h4>
  <p className="text-xs text-on-surface-variant">3 series de 10 repeticiones</p>
</FisioCard>
```

### B. `FisioPanel`
Normaliza secciones completas de dashboards o asistentes:
```tsx
import { FisioPanel } from '@/components/design-system';

<FisioPanel header="Copiloto de Recuperación" action={<QuickVoiceSelector compact />}>
  {/* Contenido de la sección */}
</FisioPanel>
```

### C. `FisioButton`
Estandariza estados `hover`, `active:scale-[0.97]`, borde y contraste:
```tsx
import { FisioButton } from '@/components/design-system';

<FisioButton variant="primary" icon={<Play className="size-4" />} onClick={startExercise}>
  Iniciar Ejercicio
</FisioButton>
```

### D. `withFisioHarmonization` (HOC para Componentes Heterogéneos)
Envuelve componentes antiguos de Bolt o Deepcheck para que adopten la identidad visual sin tocarlos línea por línea:
```tsx
import { withFisioHarmonization } from '@/components/design-system';
import { LegacyChartWidget } from './legacy/LegacyChartWidget';

export const HarmonizedChartWidget = withFisioHarmonization(LegacyChartWidget, {
  radius: 'card',
  surface: 'glass',
  padded: true,
});
```

---

## 3. Síntesis de Voz Humana Natural (Resolución Definitiva)

### Diagnóstico de la Causa Raíz
1. Google Translate TTS (`tw-ob`) fallaba con **HTTP 400** en textos que superaban los 160 caracteres.
2. Al fallar la llamada de red, el manejador activaba el fallback al sintetizador local del navegador (`speakLocal`), produciendo la clásica voz metálica y monótona por defecto.
3. El audio de OpenRouter requería créditos de pago (`402 Insufficient credits`).

### Solución Quirúrgica Implementada
1. **Chunking Inteligente por Signos de Puntuación:**
   El endpoint `/api/synthesize-speech` descompone automáticamente mensajes clínicos largos (hasta 2,000 caracteres) en fragmentos naturales de ≤140 caracteres.
2. **Concatenación de Audio MP3 Multibúfer Concurrente:**
   Los fragmentos se procesan concurrentemente en <250ms vía `Promise.all` y sus flujos MP3 se concatenan directamente en el servidor antes de devolver el audio completo en base64.
3. **Calibración de Personas Vocales:**
   - **Doctor Physi (Masculino):** Barítono cálido, empático y pausado (`playbackRate: 0.93`, modulación de pitch).
   - **Doctora Physi (Femenina):** Tono brillante, claro y motivador (`playbackRate: 1.03`).
4. **Selector Rápido Multi-Proveedor (`QuickVoiceSelector`):**
   Accesible tanto en `AIAssistantPage` como en `PhysiGuide`, permitiendo alternar entre el motor neuronal gratuito de baja latencia, Fish Audio Pro con clave propia, y la síntesis offline de emergencia.
