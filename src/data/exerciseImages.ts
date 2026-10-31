/**
 * Imágenes reales de ejercicios extraídas de la rama dev/opencode-mobile.
 * El mapa relaciona el slug del ejercicio con su archivo en /public/exercises.
 */

export const EXERCISE_IMAGES: Record<string, string> = {
  'abduccion-de-hombro': '/exercises/abduccion-de-hombro.jpg',
  'bird-dog': '/exercises/bird-dog.jpg',
  'chin-tuck': '/exercises/chin-tuck.jpg',
  'circunduccion-de-hombro': '/exercises/circunduccion-de-hombro.jpg',
  'equilibrio-sobre-una-pierna': '/exercises/equilibrio-sobre-una-pierna.jpg',
  'estiramiento-de-trapecio': '/exercises/estiramiento-de-trapecio.jpg',
  'extension-de-rodilla': '/exercises/extension-de-rodilla.jpg',
  'flexion-de-codo': '/exercises/flexion-de-codo.jpg',
  'flexion-de-hombro': '/exercises/flexion-de-hombro.jpg',
  'flexion-de-rodilla-en-pie': '/exercises/flexion-de-rodilla-en-pie.jpg',
  'isometrico-cuadriceps': '/exercises/isometrico-cuadriceps.jpg',
  'monopodal-bosu': '/exercises/monopodal-bosu.jpg',
  'movilidad-cervical': '/exercises/movilidad-cervical.jpg',
  'pendulo-codman': '/exercises/pendulo-codman.jpg',
  'puente-de-gluteos': '/exercises/puente-de-gluteos.jpg',
  'rotacion-externa-de-hombro': '/exercises/rotacion-externa-de-hombro.jpg',
  'sentadilla-declinada': '/exercises/sentadilla-declinada.jpg',
  'sentadilla-parcial': '/exercises/sentadilla-parcial.jpg',
};

/**
 * Reglas de coincidencia por palabra clave. El orden importa: las más
 * específicas van primero para no capturar ejercicios de otra región.
 */
const KEYWORD_RULES: Array<[needle: string, slug: string]> = [
  ['abduccion-de-hombro', 'abduccion-de-hombro'],
  ['circunduccion', 'circunduccion-de-hombro'],
  ['equilibrio', 'equilibrio-sobre-una-pierna'],
  ['monopodal', 'monopodal-bosu'],
  ['bosu', 'monopodal-bosu'],
  ['trapecio', 'estiramiento-de-trapecio'],
  ['isometrico', 'isometrico-cuadriceps'],
  ['cuadriceps', 'isometrico-cuadriceps'],
  ['codo', 'flexion-de-codo'],
  ['flexion-de-hombro', 'flexion-de-hombro'],
  ['flexion-rodilla', 'flexion-de-rodilla-en-pie'],
  ['flexion-de-rodilla', 'flexion-de-rodilla-en-pie'],
  ['chin-tuck', 'chin-tuck'],
  ['menton', 'chin-tuck'],
  ['cervical', 'movilidad-cervical'],
  ['puente', 'puente-de-gluteos'],
  ['gluteo', 'puente-de-gluteos'],
  ['rotacion-externa', 'rotacion-externa-de-hombro'],
  ['bird-dog', 'bird-dog'],
  ['pendulo', 'pendulo-codman'],
  ['codman', 'pendulo-codman'],
  ['sentadilla-declinada', 'sentadilla-declinada'],
  ['sentadilla', 'sentadilla-parcial'],
  ['extension', 'extension-de-rodilla'],
];

/** Normaliza un nombre: minúsculas, sin acentos, espacios/guiones bajos a guiones. */
function normalizeExerciseName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Devuelve la ruta de la imagen de un ejercicio a partir de su nombre.
 * Primero busca coincidencia exacta del slug y luego por palabra clave.
 * Si no hay match real, devuelve undefined (no inventa imágenes).
 */
export function getExerciseImage(nombre: string): string | undefined {
  if (!nombre) return undefined;

  const slug = normalizeExerciseName(nombre);
  if (!slug) return undefined;

  if (EXERCISE_IMAGES[slug]) return EXERCISE_IMAGES[slug];

  for (const [needle, imageSlug] of KEYWORD_RULES) {
    if (slug.includes(needle)) return EXERCISE_IMAGES[imageSlug];
  }

  return undefined;
}
