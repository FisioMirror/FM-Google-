/**
 * Imágenes de ejercicios.
 *
 * IMPORTANTE (bug corregido): la app resuelve la imagen con `ejercicio_id`, y en los datos
 * reales ese campo es un SLUG (`flexion-hombro`, `circunduccion`, ...), no un UUID.
 * El mapa original estaba indexado solo por UUID de la tabla `exercises`, así que
 * `getExerciseImage()` devolvía `undefined` y no se mostraba ninguna imagen.
 *
 * Orden de resolución:
 *   1. `EXERCISE_IMAGES_BY_SLUG`  -> imágenes locales generadas (public/exercises/*.jpg)
 *   2. `EXERCISE_IMAGES_LOCAL`    -> mismas imágenes indexadas por UUID (por si la DB usa UUID)
 *   3. `EXERCISE_IMAGES`          -> fotos de Pexels (respaldo histórico)
 *
 * Las locales se prefieren: mismo estilo, encuadre y paleta en todas, ~35 KB cada una
 * y sin depender de un CDN externo. Regenerar con:
 *   node scripts/generate-exercise-images.mjs
 *   node scripts/generate-missing-exercise-images.mjs
 */

/** Imágenes locales por `ejercicio_id` (slug). Es el índice que usa la app. */
export const EXERCISE_IMAGES_BY_SLUG: Record<string, string> = {
  'bird-dog': '/exercises/bird-dog.jpg',
  'chin-tuck': '/exercises/chin-tuck.jpg',
  circunduccion: '/exercises/circunduccion-de-hombro.jpg',
  'estiramiento-trapecio': '/exercises/estiramiento-de-trapecio.jpg',
  'flexion-hombro': '/exercises/flexion-de-hombro.jpg',
  'isometrico-cuadriceps': '/exercises/isometrico-cuadriceps.jpg',
  'monopodal-bosu': '/exercises/monopodal-bosu.jpg',
  'pendulo-codman': '/exercises/pendulo-codman.jpg',
  'puente-gluteo': '/exercises/puente-de-gluteos.jpg',
  'rotacion-externa': '/exercises/rotacion-externa-de-hombro.jpg',
  'sentadilla-declinada': '/exercises/sentadilla-declinada.jpg',
};

/** Imágenes locales por UUID (compatibilidad con la tabla `exercises` de Supabase). */
export const EXERCISE_IMAGES_LOCAL: Record<string, string> = {
  'd1a41812-15ab-4df7-8700-da8a7a7a607c': '/exercises/abduccion-de-hombro.jpg',
  '64998ed7-10fc-4367-8033-edc06b26627b': '/exercises/circunduccion-de-hombro.jpg',
  '1eecc5c9-0930-432a-829f-4e2990da9b85': '/exercises/equilibrio-sobre-una-pierna.jpg',
  '17885eb5-defe-4dee-b64b-f9bd54fae9a5': '/exercises/estiramiento-de-trapecio.jpg',
  '4a6f7c96-8a82-4920-95b9-ebce1853f3f1': '/exercises/extension-de-rodilla.jpg',
  '0c06c729-3050-4b0d-ba87-ec435330bd22': '/exercises/flexion-de-codo.jpg',
  'e8a2d5fa-7e50-45e3-9a27-960217210af6': '/exercises/flexion-de-hombro.jpg',
  '53748d3e-2a02-44cf-a389-8b621520a61e': '/exercises/flexion-de-rodilla-en-pie.jpg',
  'c3ae31f6-1573-49e2-b16c-f43f2b86e498': '/exercises/movilidad-cervical.jpg',
  '8d4f64a0-2ba2-49cb-8d88-b4905ad1fe2d': '/exercises/puente-de-gluteos.jpg',
  '3e5e327e-1ffc-4040-8a8c-fef0b20e4559': '/exercises/rotacion-externa-de-hombro.jpg',
  '38f8c7ad-312d-4d8d-9a4f-823d10893fed': '/exercises/sentadilla-parcial.jpg',
};

/** Fotos de Pexels por UUID. Respaldo si falta la imagen local. */
export const EXERCISE_IMAGES: Record<string, string> = {
  // Abducción de Hombro
  'd1a41812-15ab-4df7-8700-da8a7a7a607c':
    'https://images.pexels.com/photos/4506166/pexels-photo-4506166.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Circunducción de Hombro
  '64998ed7-10fc-4367-8033-edc06b26627b':
    'https://images.pexels.com/photos/8187686/pexels-photo-8187686.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Ejercicio de Prueba
  'a675d9ba-2e6d-4ff6-a1d9-b682a6834c92':
    'https://images.pexels.com/photos/20860622/pexels-photo-20860622.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Equilibrio sobre una Pierna
  '1eecc5c9-0930-432a-829f-4e2990da9b85':
    'https://images.pexels.com/photos/4803866/pexels-photo-4803866.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Estiramiento de Trapecio
  '17885eb5-defe-4dee-b64b-f9bd54fae9a5':
    'https://images.pexels.com/photos/7592384/pexels-photo-7592384.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Extensión de Rodilla
  '4a6f7c96-8a82-4920-95b9-ebce1853f3f1':
    'https://images.pexels.com/photos/20860603/pexels-photo-20860603.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Flexión de Codo
  '0c06c729-3050-4b0d-ba87-ec435330bd22':
    'https://images.pexels.com/photos/12314077/pexels-photo-12314077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Flexión de Hombro
  'e8a2d5fa-7e50-45e3-9a27-960217210af6':
    'https://images.pexels.com/photos/6550851/pexels-photo-6550851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Flexión de Rodilla en Pie
  '53748d3e-2a02-44cf-a389-8b621520a61e':
    'https://images.pexels.com/photos/4587382/pexels-photo-4587382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Movilidad Cervical
  'c3ae31f6-1573-49e2-b16c-f43f2b86e498':
    'https://images.pexels.com/photos/27730452/pexels-photo-27730452.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Puente de Glúteos
  '8d4f64a0-2ba2-49cb-8d88-b4905ad1fe2d':
    'https://images.pexels.com/photos/36400032/pexels-photo-36400032.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Rotación Externa de Hombro
  '3e5e327e-1ffc-4040-8a8c-fef0b20e4559':
    'https://images.pexels.com/photos/8846529/pexels-photo-8846529.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Sentadilla Parcial
  '38f8c7ad-312d-4d8d-9a4f-823d10893fed':
    'https://images.pexels.com/photos/4662333/pexels-photo-4662333.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

/**
 * Catálogo clínico de los 18 ejercicios que tienen imagen local.
 *
 * El catálogo del fisioterapeuta carga de Supabase (ids UUID) y de `DEFAULT_CLINICAL_EXERCISES`
 * (ids `ex-N`), así que ninguno de esos ids coincide con el slug de la imagen. Este seed se
 * mergea por nombre normalizado para que las 18 imágenes siempre tengan su ejercicio visible.
 */
export interface ExerciseImageCatalogEntry {
  slug: string;
  nombre: string;
  src: string;
  articulacion: string;
  grupo_muscular: string;
  categoria: string;
  series: number;
  repeticiones: number;
  angulo_objetivo: number;
}

export const EXERCISE_IMAGE_CATALOG: ExerciseImageCatalogEntry[] = [
  { slug: 'abduccion-de-hombro', nombre: 'Abducción de Hombro', src: '/exercises/abduccion-de-hombro.jpg', articulacion: 'hombro', grupo_muscular: 'Deltoides medio, supraespinoso', categoria: 'fortalecimiento', series: 3, repeticiones: 12, angulo_objetivo: 90 },
  { slug: 'bird-dog', nombre: 'Bird-Dog', src: '/exercises/bird-dog.jpg', articulacion: 'lumbar', grupo_muscular: 'Multífidos, glúteo mayor', categoria: 'estabilidad', series: 3, repeticiones: 10, angulo_objetivo: 0 },
  { slug: 'chin-tuck', nombre: 'Chin Tuck (Retracción Cervical)', src: '/exercises/chin-tuck.jpg', articulacion: 'cervical', grupo_muscular: 'Flexores profundos del cuello', categoria: 'movilidad', series: 3, repeticiones: 10, angulo_objetivo: 0 },
  { slug: 'circunduccion-de-hombro', nombre: 'Circunducción de Hombro', src: '/exercises/circunduccion-de-hombro.jpg', articulacion: 'hombro', grupo_muscular: 'Deltoides, manguito rotador', categoria: 'movilidad', series: 2, repeticiones: 10, angulo_objetivo: 360 },
  { slug: 'equilibrio-sobre-una-pierna', nombre: 'Equilibrio sobre una Pierna', src: '/exercises/equilibrio-sobre-una-pierna.jpg', articulacion: 'rodilla', grupo_muscular: 'Glúteo medio, tibial anterior', categoria: 'equilibrio', series: 3, repeticiones: 6, angulo_objetivo: 0 },
  { slug: 'estiramiento-de-trapecio', nombre: 'Estiramiento de Trapecio', src: '/exercises/estiramiento-de-trapecio.jpg', articulacion: 'cervical', grupo_muscular: 'Trapecio superior', categoria: 'estiramiento', series: 3, repeticiones: 4, angulo_objetivo: 30 },
  { slug: 'extension-de-rodilla', nombre: 'Extensión de Rodilla', src: '/exercises/extension-de-rodilla.jpg', articulacion: 'rodilla', grupo_muscular: 'Cuádriceps', categoria: 'fortalecimiento', series: 3, repeticiones: 12, angulo_objetivo: 0 },
  { slug: 'flexion-de-codo', nombre: 'Flexión de Codo', src: '/exercises/flexion-de-codo.jpg', articulacion: 'codo', grupo_muscular: 'Bíceps braquial, braquial', categoria: 'fortalecimiento', series: 3, repeticiones: 12, angulo_objetivo: 120 },
  { slug: 'flexion-de-hombro', nombre: 'Flexión de Hombro', src: '/exercises/flexion-de-hombro.jpg', articulacion: 'hombro', grupo_muscular: 'Deltoides anterior, coracobraquial', categoria: 'movilidad', series: 3, repeticiones: 12, angulo_objetivo: 90 },
  { slug: 'flexion-de-rodilla-en-pie', nombre: 'Flexión de Rodilla en Pie', src: '/exercises/flexion-de-rodilla-en-pie.jpg', articulacion: 'rodilla', grupo_muscular: 'Isquiotibiales', categoria: 'fortalecimiento', series: 3, repeticiones: 12, angulo_objetivo: 90 },
  { slug: 'isometrico-cuadriceps', nombre: 'Isométrico de Cuádriceps', src: '/exercises/isometrico-cuadriceps.jpg', articulacion: 'rodilla', grupo_muscular: 'Cuádriceps', categoria: 'isométrico', series: 3, repeticiones: 5, angulo_objetivo: 0 },
  { slug: 'monopodal-bosu', nombre: 'Monopodal en Bosu', src: '/exercises/monopodal-bosu.jpg', articulacion: 'rodilla', grupo_muscular: 'Glúteo medio, peroneos', categoria: 'equilibrio', series: 3, repeticiones: 8, angulo_objetivo: 0 },
  { slug: 'movilidad-cervical', nombre: 'Movilidad Cervical', src: '/exercises/movilidad-cervical.jpg', articulacion: 'cervical', grupo_muscular: 'Esternocleidomastoideo, escalenos', categoria: 'movilidad', series: 2, repeticiones: 10, angulo_objetivo: 45 },
  { slug: 'pendulo-codman', nombre: 'Péndulo de Codman', src: '/exercises/pendulo-codman.jpg', articulacion: 'hombro', grupo_muscular: 'Manguito rotador', categoria: 'movilidad', series: 3, repeticiones: 15, angulo_objetivo: 0 },
  { slug: 'puente-de-gluteos', nombre: 'Puente de Glúteos', src: '/exercises/puente-de-gluteos.jpg', articulacion: 'lumbar', grupo_muscular: 'Glúteo mayor, isquiotibiales', categoria: 'fortalecimiento', series: 3, repeticiones: 12, angulo_objetivo: 0 },
  { slug: 'rotacion-externa-de-hombro', nombre: 'Rotación Externa de Hombro', src: '/exercises/rotacion-externa-de-hombro.jpg', articulacion: 'hombro', grupo_muscular: 'Infraespinoso, redondo menor', categoria: 'fortalecimiento', series: 3, repeticiones: 12, angulo_objetivo: 45 },
  { slug: 'sentadilla-declinada', nombre: 'Sentadilla Declinada', src: '/exercises/sentadilla-declinada.jpg', articulacion: 'rodilla', grupo_muscular: 'Cuádriceps, glúteo mayor', categoria: 'fortalecimiento', series: 3, repeticiones: 10, angulo_objetivo: 90 },
  { slug: 'sentadilla-parcial', nombre: 'Sentadilla Parcial', src: '/exercises/sentadilla-parcial.jpg', articulacion: 'rodilla', grupo_muscular: 'Cuádriceps, glúteo mayor', categoria: 'fortalecimiento', series: 3, repeticiones: 12, angulo_objetivo: 60 },
];

/** Normaliza un nombre clínico: sin acentos, minúsculas, sin palabras vacías. */
export function normalizeExerciseName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(de|del|la|el|los|las|en|con|y|sobre|una|un)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Índice nombre normalizado -> imagen, para resolver desde el catálogo del fisio. */
const NAME_INDEX: Record<string, string> = Object.fromEntries(
  EXERCISE_IMAGE_CATALOG.map((e) => [normalizeExerciseName(e.nombre), e.src])
);

/**
 * Alias para los nombres de `DEFAULT_CLINICAL_EXERCISES`, que no coinciden literalmente con
 * el nombre del catálogo pero describen el mismo movimiento.
 */
const NAME_ALIASES: Record<string, string> = {
  'flexion cervical suave': '/exercises/movilidad-cervical.jpg',
  'flexoextension codo': '/exercises/flexion-de-codo.jpg',
  'puente gluteo estabilidad lumbar': '/exercises/puente-de-gluteos.jpg',
  'estiramiento trapecio': '/exercises/estiramiento-de-trapecio.jpg',
  'circunduccion hombro': '/exercises/circunduccion-de-hombro.jpg',
  'isometrico cuadriceps': '/exercises/isometrico-cuadriceps.jpg',
  'monopodal bosu': '/exercises/monopodal-bosu.jpg',
  'pendulo codman': '/exercises/pendulo-codman.jpg',
  'sentadilla declinada': '/exercises/sentadilla-declinada.jpg',
  'sentadilla parcial': '/exercises/sentadilla-parcial.jpg',
  'equilibrio una pierna': '/exercises/equilibrio-sobre-una-pierna.jpg',
  'flexion rodilla pie': '/exercises/flexion-de-rodilla-en-pie.jpg',
  'extension rodilla': '/exercises/extension-de-rodilla.jpg',
  'abduccion hombro': '/exercises/abduccion-de-hombro.jpg',
  'bird dog': '/exercises/bird-dog.jpg',
  'chin tuck': '/exercises/chin-tuck.jpg',
};

/** Raíz de 5 letras para tolerar plurales y variantes: glúteo/glúteos, flexión/flexiones. */
function stem(word: string): string {
  return word.slice(0, 5);
}

/** Normaliza un id para comparar de forma tolerante: `flexion-hombro` ~ `flexion-de-hombro`. */
function normalizeId(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(de|del|la|el|los|las|en|con)\b/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

const SLUG_INDEX: Record<string, string> = Object.fromEntries(
  Object.entries(EXERCISE_IMAGES_BY_SLUG).map(([slug, src]) => [normalizeId(slug), src])
);

/**
 * Obtiene la imagen asociada a un ejercicio.
 *
 * @param exerciseId  `ejercicio_id` (slug) o UUID de la tabla `exercises`.
 * @param exerciseName Nombre clínico. Necesario para el catálogo del fisio, donde el id es
 *                     un UUID o `ex-N` y no coincide con el slug de la imagen.
 * Devuelve `undefined` si no hay imagen asignada.
 */
export function getExerciseImage(
  exerciseId: string | null | undefined,
  exerciseName?: string | null
): string | undefined {
  const id = exerciseId ? String(exerciseId).trim() : '';

  if (id) {
    // 1. slug exacto
    const bySlug = EXERCISE_IMAGES_BY_SLUG[id];
    if (bySlug) return bySlug;

    // 2. UUID exacto (local, luego Pexels)
    const byUuid = EXERCISE_IMAGES_LOCAL[id] ?? EXERCISE_IMAGES[id];
    if (byUuid) return byUuid;

    // 3. coincidencia tolerante por slug normalizado
    const normalized = normalizeId(id);
    if (normalized) {
      const tolerant = SLUG_INDEX[normalized];
      if (tolerant) return tolerant;
      const partial = Object.entries(SLUG_INDEX).find(
        ([key]) => key.includes(normalized) || normalized.includes(key)
      );
      if (partial) return partial[1];
    }
  }

  // 4. por nombre clínico (catálogo del fisioterapeuta)
  if (exerciseName) {
    const name = normalizeExerciseName(exerciseName);
    if (name) {
      const exact = NAME_INDEX[name] ?? NAME_ALIASES[name];
      if (exact) return exact;

      // tolerante: "Flexión de Hombro Activa" -> "flexion hombro" ⊂ "flexion hombro"
      const words = name.split(' ').filter((w) => w.length > 2).map(stem);
      let best: { score: number; src: string } | undefined;
      for (const [key, src] of Object.entries(NAME_INDEX)) {
        const keyWords = key.split(' ').filter((w) => w.length > 2).map(stem);
        if (!keyWords.length) continue;
        const hits = keyWords.filter((w) => words.includes(w)).length;
        const score = hits / keyWords.length;
        if (score >= 0.6 && (!best || score > best.score)) best = { score, src };
      }
      if (best) return best.src;
    }
  }

  return undefined;
}
