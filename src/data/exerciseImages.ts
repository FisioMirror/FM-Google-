/**
 * Imágenes de ejercicios obtenidas de Pexels (vía API).
 * Mapea el ID del ejercicio (de la tabla `exercises`) a una URL de imagen real.
 * Cada URL es una foto con licencia libre de Pexels.
 */

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
 * Obtiene la imagen asociada a un ejercicio por su ID.
 * Devuelve undefined si no existe imagen asignada.
 */
/**
 * Imágenes locales generadas para el catálogo (public/exercises/*.jpg).
 * Se prefieren sobre las de Pexels: mismo estilo, encuadre y paleta en todas,
 * y no dependen de un CDN externo. Regenerar con scripts/generate-exercise-images.mjs.
 */
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

export function getExerciseImage(exerciseId: string | null | undefined): string | undefined {
  if (!exerciseId) return undefined;
  // Local primero (consistente y sin CDN); Pexels como respaldo si falta la generada.
  return EXERCISE_IMAGES_LOCAL[exerciseId] ?? EXERCISE_IMAGES[exerciseId];
}
