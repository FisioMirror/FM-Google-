#!/usr/bin/env node
/**
 * Generador de imágenes clínicas coherentes para el catálogo de ejercicios.
 *
 * Fuente de nombres: los comentarios `// Nombre del ejercicio` de
 * `src/data/exerciseImages.ts`. Salida: `public/exercises/<slug>.jpg` + manifest.
 *
 * Diseño (por qué así):
 *  - Mismo estilo y encuadre en TODAS las imágenes: figura completa, paleta teal,
 *    fondo neutro, sin texto ni marcas. Evita el efecto "collage de fotos sueltas".
 *  - Pollinations no requiere API key (servicio externo: no enviar datos privados).
 *  - Idempotente: si el archivo ya existe se salta (reanudable si se corta).
 *  - Throttle y timeout: la SD es lenta y el dispositivo tiene poca RAM.
 *
 * Uso:
 *   node scripts/generate-exercise-images.mjs --dry-run
 *   node scripts/generate-exercise-images.mjs --limit 5
 *   node scripts/generate-exercise-images.mjs --force
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'src/data/exerciseImages.ts');
const OUT_DIR = path.join(ROOT, 'public/exercises');

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const num = (flag, fallback) => {
  const i = args.indexOf(flag);
  const v = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(v) ? v : fallback;
};

const DRY_RUN = has('--dry-run');
const FORCE = has('--force');
const LIMIT = num('--limit', Infinity);
const WIDTH = num('--width', 768);
const HEIGHT = num('--height', 768);
const DELAY_MS = num('--delay', 2500);

const STYLE = [
  'clean clinical physiotherapy illustration',
  'single full-body figure, correct anatomical alignment',
  'flat vector style with soft shading',
  'teal, mint and warm off-white palette',
  'plain light neutral background, soft studio light',
  'centered composition, generous margins',
  'no text, no letters, no watermark, no logo, no UI',
].join(', ');

const VIEW_BY_KEYWORD = [
  [/(sentadilla|peso muerto|zancada|puente|hip thrust|remo)/i, 'side view, three-quarter angle'],
  [/(hombro|abducci|elevaci|press militar|circunducci)/i, 'front view, three-quarter angle'],
  [/(codo|bicep|tricep|curl|flexi)/i, 'side view of the arm, three-quarter angle'],
  [/(rodilla|cuádriceps|cuadriceps|isquio|prensa|extensi)/i, 'side view of the leg, three-quarter angle'],
  [/(tobillo|gemelo|talón|talon|equilibrio)/i, 'full body standing, three-quarter angle'],
  [/(trapecio|cervical|cuello|estiramiento)/i, 'upper body, three-quarter angle'],
];

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildPrompt(name) {
  const view = VIEW_BY_KEYWORD.find(([re]) => re.test(name))?.[1] ?? 'three-quarter angle';
  return `${STYLE}, showing the exercise "${name}", ${view}`;
}

async function readExercises() {
  const raw = await readFile(SOURCE, 'utf8');
  const names = [];
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*\/\/\s*(.+?)\s*$/);
    if (!m) continue;
    const name = m[1].trim();
    // Ignora comentarios de cabecera o frases largas que no son ejercicios.
    if (name.length < 3 || name.length > 60) continue;
    if (!/^[A-ZÁÉÍÓÚÑ]/.test(name)) continue;
    // Descarta datos de prueba/demo del seed.
    if (/(prueba|test|demo|ejemplo)/i.test(name)) continue;
    names.push(name);
  }
  return [...new Set(names)];
}

const exists = async (file) => {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const exercises = await readExercises();
  const picked = exercises.slice(0, LIMIT === Infinity ? exercises.length : LIMIT);

  console.log(`Ejercicios detectados: ${exercises.length} · a procesar: ${picked.length}`);
  if (!DRY_RUN) await mkdir(OUT_DIR, { recursive: true });

  const manifest = {};

  for (const [index, name] of picked.entries()) {
    const slug = slugify(name);
    const file = path.join(OUT_DIR, `${slug}.jpg`);
    const prompt = buildPrompt(name);

    if (!FORCE && (await exists(file))) {
      console.log(`[${index + 1}/${picked.length}] skip  ${slug} (ya existe)`);
      manifest[slug] = { name, file: `exercises/${slug}.jpg`, prompt, cached: true };
      continue;
    }

    if (DRY_RUN) {
      console.log(`[${index + 1}/${picked.length}] dry   ${slug}\n        ${prompt}`);
      manifest[slug] = { name, file: `exercises/${slug}.jpg`, prompt };
      continue;
    }

    const url =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
      `?width=${WIDTH}&height=${HEIGHT}&nologo=true&seed=${slug.length * 7919}`;

    process.stdout.write(`[${index + 1}/${picked.length}] get   ${slug} ... `);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(90_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1024) throw new Error(`respuesta demasiado chica (${buf.length} B)`);
      await writeFile(file, buf);
      console.log(`ok (${Math.round(buf.length / 1024)} KB)`);
      manifest[slug] = { name, file: `exercises/${slug}.jpg`, prompt };
    } catch (err) {
      console.log(`FALLO: ${err.message}`);
      manifest[slug] = { name, file: `exercises/${slug}.jpg`, prompt, error: String(err.message) };
    }

    if (index < picked.length - 1) await sleep(DELAY_MS);
  }

  if (!DRY_RUN) {
    await writeFile(
      path.join(OUT_DIR, 'manifest.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), style: STYLE, items: manifest }, null, 2)
    );
    console.log(`Manifest: ${path.join(OUT_DIR, 'manifest.json')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
