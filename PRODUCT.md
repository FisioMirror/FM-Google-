# FisioMirror — Product Truth

> Documento de verdad de producto. No describe estética; eso vive en `DESIGN.md`.
> Mantener factual: si algo no está verificado en el código, no va acá.

## Qué es

Plataforma de tele-rehabilitación que combina seguimiento clínico, rutinas personalizadas y un espejo de realidad aumentada (AR) para que el paciente haga fisioterapia en su casa con corrección de movimiento.

## Para quién

| Rol | Contexto real de uso | Éxito |
|---|---|---|
| Fisioterapeuta | Escritorio en consultorio, sesiones de 20–40 min, apuro entre pacientes | Cargar un paciente en < 3 min, asignar rutina, ver evolución sin buscar datos |
| Paciente | Celular, en el piso o en una silla, a veces con dolor o poca movilidad | Entender qué hacer ahora, sin ambigüedad, con feedback inmediato |

## Funciones núcleo

- Onboarding de paciente en 4 pasos (datos → validación → rutina → cierre).
- Biblioteca de ejercicios con parámetros clínicos (series, reps, ROM, dolor EVA).
- Espejo AR con seguimiento de pose (MediaPipe) y calibración biomecánica.
- OCR de recetas/estudios para precargar datos.
- Progreso, rachas y gamificación del paciente.
- Asistente clínico con IA (Physi) y herramientas de cálculo (IMC, escalas).

## Restricciones técnicas reales

- React 18 + Vite + TypeScript, Tailwind v3 (no v4), `framer-motion` como motor de animación.
- Mobile-first real: el paciente usa pantalla chica y conexión variable; hay modo offline.
- Español rioplatense como idioma de producto; sin emojis en superficies clínicas.
- Accesibilidad no negociable: contraste AA, foco visible, targets ≥ 44px, `prefers-reduced-motion`.
- Datos sensibles de salud: nada de telemetría ni terceros en pantallas con datos de paciente.

## Lo que NO es

- No es una app de fitness ni de bienestar general. El tono es clínico, sobrio y preciso.
- No es un dashboard financiero: las métricas son clínicas (dolor, ROM, adherencia), no vanity metrics.
- No reemplaza al profesional: la IA sugiere, el fisioterapeuta decide.

## Métricas de producto que la UI debe servir

1. Tiempo hasta primera acción útil en el dashboard del fisio.
2. Adherencia del paciente (ejercicios completados / asignados).
3. Errores de carga de datos clínicos (campos inválidos, unidades).
4. Abandono del onboarding de paciente.
