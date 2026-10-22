#!/usr/bin/env node
/**
 * Genera las imágenes que faltan para los `ejercicio_id` REALES de la app.
 *
 * Por qué existe: `generate-exercise-images.mjs` toma los nombres de los comentarios de
 * `src/data/exerciseImages.ts`, que corresponden a la tabla `exercises` de Supabase (UUIDs).
 * Pero la app resuelve las imágenes con `ejercicio_id`, que en los datos reales son SLUGS
 * (`flexion-hombro`, `circunduccion`, ...). Resultado: 6 de los 11 ejercicios no tenían imagen.
 *
 * Mismo estilo, mismo throttle y mismos reintentos que el generador principal.
 * Idempotente: si el archivo ya existe, se salta.
 */
import { writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/exercises');

const args = process.argv.slice(2);
const num = (flag, fallback) => {
  const i = args.indexOf(flag);
  const v = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(v) ? v : fallback;
};
const WIDTH = num('--width', 768);
const HEIGHT = num('--height', 1024);
const DELAY_MS = num('--delay', 20000);
const RETRIES = num('--retries', 4);
const BACKOFF_MS = num('--backoff', 30000);

const STYLE = [
  'clean clinical physiotherapy illustration',
  'single full-body figure, correct anatomical alignment',
  'flat vector style with soft shading',
  'teal, mint and warm off-white palette',
  'plain light neutral background, soft studio light',
  'centered composition, generous margins',
  'no text, no letters, no watermark, no logo, no UI',
].join(', ');

// slug (ejercicio_id real) -> nombre legible + encuadre
const MISSING = [
  ['bird-dog', 'Bird Dog exercise on hands and knees, opposite arm and leg extended', 'side view, three-quarter angle'],
  ['chin-tuck', 'Chin Tuck cervical retraction, seated upright', 'upper body, side view'],
  ['isometrico-cuadriceps', 'Isometric quadriceps contraction, seated with leg extended and towel under knee', 'side view of the leg, three-quarter angle'],
  ['monopodal-bosu', 'Single leg balance standing on an unstable balance pad', 'full body standing, three-quarter angle'],
  ['pendulo-codman', 'Codman pendulum exercise, trunk leaning forward with arm hanging and swinging gently', 'side view, three-quarter angle'],
  ['sentadilla-declinada', 'Declined squat on a 25 degree incline board', 'side view, three-quarter angle'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = async (f) => access(f, constants.F_OK).then(() => true).catch(() => false);

await mkdir(OUT_DIR, { recursive: true });

for (const [index, [slug, description, view]] of MISSING.entries()) {
  const file = path.join(OUT_DIR, `${slug}.jpg`);
  if (await exists(file)) {
    console.log(`[${index + 1}/${MISSING.length}] skip  ${slug} (ya existe)`);
    continue;
  }
  const prompt = `${STYLE}, showing the exercise "${description}", ${view}`;
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${WIDTH}&height=${HEIGHT}&nologo=true&seed=${slug.length * 7919}`;

  process.stdout.write(`[${index + 1}/${MISSING.length}] get   ${slug} ... `);
  let buf = null;
  let lastErr = null;
  for (let attempt = 0; attempt < RETRIES && !buf; attempt++) {
    if (attempt > 0) {
      const wait = BACKOFF_MS * attempt;
      process.stdout.write(`reintento ${attempt} en ${Math.round(wait / 1000)}s ... `);
      await sleep(wait);
    }
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(90_000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0 Mobile Safari/537.36',
          Accept: 'image/*',
        },
      });
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status}`);
        if (res.status !== 402 && res.status !== 429 && res.status !== 503) break;
        continue;
      }
      const body = Buffer.from(await res.arrayBuffer());
      if (body.length < 1024) {
        lastErr = new Error(`respuesta demasiado chica (${body.length} B)`);
        continue;
      }
      buf = body;
    } catch (err) {
      lastErr = err;
    }
  }
  if (!buf) {
    console.log(`FALLO: ${lastErr?.message ?? 'sin respuesta'}`);
    continue;
  }
  await writeFile(file, buf);
  console.log(`ok (${Math.round(buf.length / 1024)} KB)`);
  if (index < MISSING.length - 1) await sleep(DELAY_MS);
}

console.log('listo');
