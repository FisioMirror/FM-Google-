import type { JointAngleConfig, ExerciseDefinition, JointRotationAxis, ExercisePosition } from '../types/character.types';

export interface ExerciseJointPreset {
  description: string;
  detailedDescription: string;
  targetJoints: JointAngleConfig[];
  holdDurationSec: number;
  position?: ExercisePosition;
}

type Articulacion = 'hombro' | 'codo' | 'rodilla' | 'cadera' | 'tobillo' | 'cervical';
type Lado = 'bilateral' | 'derecho' | 'izquierdo';

const PRESets: Record<Articulacion, ExerciseJointPreset> = {
  hombro: {
    description: 'Elevación del brazo controlada hasta 90° manteniendo el hombro estable.',
    detailedDescription: 'Comienza de pie con los brazos a los lados. Eleva lentamente el brazo hacia adelante hasta alcanzar los 90° (paralelo al suelo). Mantén la posición 3 segundos y baja con control. Evita encoger el hombro hacia la oreja. El movimiento debe ser fluido y indoloro.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'pie',
  },
  codo: {
    description: 'Flexión de codo llevando la mano hacia el hombro con control.',
    detailedDescription: 'Comienza con el brazo extendido junto al cuerpo. Flexiona el codo lentamente llevando la mano hacia el hombro. Mantén el codo pegado al torso durante todo el movimiento. Sostén la flexión máxima 2 segundos y extiende con suavidad. El antebrazo debe permanecer alineado sin rotación interna.',
    targetJoints: [
      { joint: 'codo_izquierdo', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'hombro_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'codo_derecho', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  rodilla: {
    description: 'Extensión de rodilla desde posición sentada hasta completa extensión.',
    detailedDescription: 'Siéntate con la espalda recta y los pies en el suelo. Extiende lentamente la rodilla hasta alcanzar la máxima extensión. Mantén la posición 3 segundos sintiendo la contracción del cuádriceps. Baja con control evitando que el pie golpee el suelo. La cadera debe permanecer estable y pegada al asiento.',
    targetJoints: [
      { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 90, tolerance: 8, axis: 'x' },
      { joint: 'cadera_izquierda', targetAngle: 90, neutralAngle: 90, tolerance: 12, axis: 'x' },
      { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 90, tolerance: 8, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 90, neutralAngle: 90, tolerance: 12, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'sentado',
  },
  cadera: {
    description: 'Abducción de cadera llevando la pierna hacia el lado con control.',
    detailedDescription: 'Comienza de pie apoyándote en una superficie estable. Separa la pierna hacia el lado (abducción) manteniendo el torso erguido y sin inclinarte. Alcanza los 45° de abducción y sostén 2 segundos. Retorna a la posición inicial con lentitud. Evita rotar la cadera o balancear el torso.',
    targetJoints: [
      { joint: 'cadera_izquierda', targetAngle: 45, neutralAngle: 0, tolerance: 8, axis: 'z' },
      { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 45, neutralAngle: 0, tolerance: 8, axis: 'z' },
      { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  tobillo: {
    description: 'Movilidad de tobillo con dorsiflexión y flexión plantar alternantes.',
    detailedDescription: 'Siéntate con la pierna extendida. Realiza dorsiflexión (llevando los dedos hacia arriba) hasta 20° y luego flexión plantar (empujando los dedos hacia abajo) hasta 40°. Mantén cada posición 2 segundos. El movimiento debe ser lento y controlado, sin mover la rodilla. Repite el ciclo completo con fluidez.',
    targetJoints: [
      { joint: 'tobillo_izquierdo', targetAngle: 20, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'tobillo_derecho', targetAngle: 20, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'sentado',
  },
  cervical: {
    description: 'Inclinación lateral cervical controlada hacia ambos lados.',
    detailedDescription: 'Comienza sentado con la columna recta y los hombros relajados. Inclina lentamente la cabeza hacia el lado derecho llevando la oreja hacia el hombro. Mantén 3 segundos sintiendo el estiramiento del lado opuesto. Retorna al centro y repite hacia el izquierdo. Los hombros deben permanecer quietos y bajos durante todo el movimiento.',
    targetJoints: [
      { joint: 'cabeza', targetAngle: 35, neutralAngle: 0, tolerance: 8, axis: 'z' },
      { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'sentado',
  },
};

const EXERCISE_OVERRIDES: Record<string, ExerciseJointPreset> = {
  'flexión de hombro': {
    description: 'Elevación del brazo hacia adelante hasta 120° con codo extendido.',
    detailedDescription: 'De pie con brazos a los lados y palmas mirando hacia adentro. Eleva el brazo recto hacia adelante (flexión anterior) hasta alcanzar 120°. El codo permanece extendido durante todo el movimiento. Sostén la posición 3 segundos en el punto máximo y baja con control en 3 segundos. Evita compensar con el torso o arquear la espalda.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 120, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 120, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'pie',
  },
  'abducción de hombro': {
    description: 'Apertura del brazo hacia el lado hasta 90° con codo extendido.',
    detailedDescription: 'De pie con brazos a los lados. Separa el brazo hacia el lado (abducción) manteniendo el codo extendido y el pulgar hacia arriba. Alcanza 90° (paralelo al suelo) y sostén 3 segundos. Baja con control evitando que el brazo caiga por gravedad. El movimiento debe ocurrir en el plano frontal sin rotación del torso.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'z' },
      { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'z' },
      { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'pie',
  },
  'rotación externa de hombro': {
    description: 'Rotación externa del hombro con el codo fijo a 90°.',
    detailedDescription: 'Coloca el codo pegado al costado del cuerpo flexionado a 90°. Mantén el codo inmóvil y rota el antebrazo hacia afuera (rotación externa) hasta alcanzar 60°. Sostén 2 segundos y retorna con control. Usa una toalla pequeña entre el codo y el torso para asegurar que no se separe. Evita inclinar el torso o compensar con la escápula.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 60, neutralAngle: 0, tolerance: 8, axis: 'y' },
      { joint: 'codo_izquierdo', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 60, neutralAngle: 0, tolerance: 8, axis: 'y' },
      { joint: 'codo_derecho', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  'circunducción de hombro': {
    description: 'Círculos completos del brazo con codo extendido en el plano sagital.',
    detailedDescription: 'De pie con el brazo extendido. Realiza círculos amplios con el brazo (circunducción) empezando hacia adelante, subiendo, atrás y bajando. El codo permanece recto y el movimiento es continuo y controlado. Haz 5 círculos en cada dirección. Reduce el diámetro si sientes molestia. El hombro debe ser el único punto móvil.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 120, neutralAngle: 0, tolerance: 15, axis: 'x' },
      { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 120, neutralAngle: 0, tolerance: 15, axis: 'x' },
      { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
    ],
    holdDurationSec: 1,
    position: 'pie',
  },
  'flexión de codo': {
    description: 'Curl de bíceps llevando la mano al hombro con control.',
    detailedDescription: 'De pie o sentado con el brazo extendido junto al cuerpo, palma mirando adelante. Flexiona el codo llevando la mano hacia el hombro. Mantén el codo pegado al torso y sin moverse. Sostén 1 segundo en la flexión máxima (120°) y baja en 2 segundos. Evita balancear el cuerpo o usar impulso.',
    targetJoints: [
      { joint: 'codo_izquierdo', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'hombro_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'codo_derecho', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
    ],
    holdDurationSec: 1,
    position: 'pie',
  },
  'extensión de rodilla': {
    description: 'Extensión completa de rodilla desde flexión de 90° sentado.',
    detailedDescription: 'Siéntate con espalda recta y rodillas a 90°. Extiende una rodilla hasta alcanzar la máxima extensión (0°) manteniendo el muslo sobre el asiento. Sostén 3 segundos sintiendo la contracción del cuádriceps. Baja con control en 2 segundos. Evita que el pie golpe el suelo bruscamente. La cadera no debe elevarse.',
    targetJoints: [
      { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 90, tolerance: 8, axis: 'x' },
      { joint: 'cadera_izquierda', targetAngle: 90, neutralAngle: 90, tolerance: 12, axis: 'x' },
      { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 90, tolerance: 8, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 90, neutralAngle: 90, tolerance: 12, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'sentado',
  },
  'flexión de rodilla en pie': {
    description: 'Lleva el talón al glúteo de pie manteniendo el muslo vertical.',
    detailedDescription: 'De pie apoyándote en una pared o silla. Flexiona la rodilla llevando el talón hacia el glúteo. Mantén el muslo perpendicular al suelo (no lo eleves hacia el pecho). Alcanza 120° de flexión y sostén 2 segundos. Baja el pie con control. El torso debe permanecer erguido y la cadera estable.',
    targetJoints: [
      { joint: 'rodilla_izquierda', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'cadera_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'rodilla_derecha', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  'sentadilla parcial': {
    description: 'Sentadilla a 45° de flexión de rodilla con peso en los talones.',
    detailedDescription: 'De pie con los pies al ancho de los hombros. Baja flexionando rodillas y caderas simultáneamente hasta alcanzar 45° de flexión de rodilla. Mantén el peso en los talones y las rodillas alineadas con los pies. La espalda permanece recta y el pecho erguido. Sostén 2 segundos y sube empujando el suelo con los talones.',
    targetJoints: [
      { joint: 'rodilla_izquierda', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'cadera_izquierda', targetAngle: 45, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'rodilla_derecha', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 45, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'tronco_torax', targetAngle: 20, neutralAngle: 0, tolerance: 15, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  'puente de glúteos': {
    description: 'Elevación de cadera desde supino extendiendo completamente la cadera.',
    detailedDescription: 'Acostado boca arriba con rodillas flexionadas y pies en el suelo. Eleva la cadera empujando con los talones hasta alcanzar extensión completa (0°). Aprieta los glúteos en la posición máxima. Sostén 3 segundos y baja con control evitando que la pelvis caiga bruscamente. La espalda debe permanecer neutra.',
    targetJoints: [
      { joint: 'cadera_izquierda', targetAngle: 0, neutralAngle: 45, tolerance: 8, axis: 'x' },
      { joint: 'rodilla_izquierda', targetAngle: 90, neutralAngle: 90, tolerance: 12, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 0, neutralAngle: 45, tolerance: 8, axis: 'x' },
      { joint: 'rodilla_derecha', targetAngle: 90, neutralAngle: 90, tolerance: 12, axis: 'x' },
      { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'acostado',
  },
  'estiramiento de trapecio': {
    description: 'Inclinación cervical con tracción suave del brazo opuesto.',
    detailedDescription: 'Siéntate con la espalda recta. Inclina la cabeza hacia el hombro derecho llevando la oreja hacia el hombro. Con la mano izquierda, tira suavemente del brazo izquierdo hacia abajo para aumentar el estiramiento del trapecio. Mantén 15 segundos respirando profundamente. Retorna al centro y repite del lado contrario. No force el rango.',
    targetJoints: [
      { joint: 'cabeza', targetAngle: 35, neutralAngle: 0, tolerance: 10, axis: 'z' },
      { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'hombro_izquierdo', targetAngle: 10, neutralAngle: 0, tolerance: 15, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 10, neutralAngle: 0, tolerance: 15, axis: 'x' },
    ],
    holdDurationSec: 15,
    position: 'sentado',
  },
  'equilibrio sobre una pierna': {
    description: 'Apoyo unipodal con leve flexión de rodilla y cadera estable.',
    detailedDescription: 'De pie, transfiere el peso a una pierna y eleva la otra flexionando la rodilla a 45°. Mantén la cadera nivelada y el torso erguido. Fija la mirada en un punto estable. Sostén el equilibrio 10 segundos. La pierna de apoyo debe tener una microflexión de rodilla (10°) para proteger la articulación. Evita que la cadera del lado elevado se desplome.',
    targetJoints: [
      { joint: 'rodilla_derecha', targetAngle: 45, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 30, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'rodilla_izquierda', targetAngle: 10, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'cadera_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
    ],
    holdDurationSec: 10,
    position: 'pie',
  },
  'flexoextensión de codo': {
    description: 'Flexión y extensión activa de codo para rango articular completo.',
    detailedDescription: 'Comienza con el brazo extendido a lo largo del cuerpo. Flexiona el codo acercando la mano hacia el hombro hasta los 130° sin mover el húmero. Sostén 1 segundo y extiende controladamente hasta 0° sin bloquear bruscamente la articulación. Mantén los hombros relajados y el tronco erguido.',
    targetJoints: [
      { joint: 'codo_izquierdo', targetAngle: 130, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'hombro_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'codo_derecho', targetAngle: 130, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  'abducción de cadera de pie': {
    description: 'Elevación lateral de la pierna manteniendo la pelvis neutra.',
    detailedDescription: 'De pie con apoyo unipodal suave sobre una superficie firme. Separa la pierna hacia el lado en el plano frontal alcanzando 40° de abducción. La pelvis debe mantenerse completamente nivelada sin inclinar el tronco hacia el lado opuesto. Sostén 2 segundos y desciende con control.',
    targetJoints: [
      { joint: 'cadera_derecha', targetAngle: 40, neutralAngle: 0, tolerance: 8, axis: 'z' },
      { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'cadera_izquierda', targetAngle: 40, neutralAngle: 0, tolerance: 8, axis: 'z' },
      { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  'extensión activa de rodilla': {
    description: 'Extensión terminal de rodilla en sedestación para activación de cuádriceps.',
    detailedDescription: 'Sentado en una silla con la espalda recta y los muslos apoyados. Extiende la rodilla hacia adelante hasta la horizontal completa (0°). Aprieta el cuádriceps en la parte superior durante 3 segundos. Regresa lentamente a la posición de 90° sin dejar caer la pierna.',
    targetJoints: [
      { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 90, tolerance: 8, axis: 'x' },
      { joint: 'cadera_izquierda', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
      { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 90, tolerance: 8, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'sentado',
  },
  'flexión cervical suave': {
    description: 'Inclinación anterior suave del cuello para elongación cervicodorsal.',
    detailedDescription: 'Sentado con postura erguida y hombros relajados. Realiza una suave flexión anterior de la cabeza llevando el mentón hacia el esternón hasta alcanzar 30°. Mantén una respiración suave durante 3 segundos. Regresa a la posición neutra con lentitud evitando movimientos bruscos.',
    targetJoints: [
      { joint: 'cabeza', targetAngle: 30, neutralAngle: 0, tolerance: 6, axis: 'x' },
      { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'sentado',
  },
  'rotación externa con banda': {
    description: 'Rotación externa glenohumeral manteniendo el codo a 90° adosado al cuerpo.',
    detailedDescription: 'Con el codo pegado a las costillas y doblado a 90°, rota el antebrazo hacia afuera en contra de la resistencia elástica. Alcanza 45° de rotación externa sin descolocar la escápula ni compensar con la columna lumbar. Sostén 2 segundos y retorna lentamente.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 45, neutralAngle: 0, tolerance: 8, axis: 'y' },
      { joint: 'codo_izquierdo', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 45, neutralAngle: 0, tolerance: 8, axis: 'y' },
      { joint: 'codo_derecho', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  'circunducción escapular': {
    description: 'Movilización circular escapulotorácica para descompresión de cintura escapular.',
    detailedDescription: 'De pie o sentado erguido. Realiza círculos amplios y controlados con ambos hombros: elevación hacia las orejas, retracción hacia atrás, descenso y protracción anterior. Realiza el ciclo en 4 segundos de forma continua y simétrica.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 60, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 60, neutralAngle: 0, tolerance: 12, axis: 'x' },
      { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'pie',
  },
  'movilidad cervical': {
    description: 'Rotación cervical suave hacia ambos lados con hombros relajados.',
    detailedDescription: 'Siéntate con la columna recta y hombros relajados. Rota lentamente la cabeza hacia la derecha hasta alcanzar 45° de rotación. Mantén 2 segundos y retorna al centro. Repite hacia la izquierda. Los hombros deben permanecer quietos y bajos. El movimiento es suave y sin rebotes. Si sientes mareo, reduce el rango.',
    targetJoints: [
      { joint: 'cabeza', targetAngle: 45, neutralAngle: 0, tolerance: 8, axis: 'y' },
      { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 2,
    position: 'sentado',
  },
};

function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

function filterByLado(joints: JointAngleConfig[], lado?: string): JointAngleConfig[] {
  if (!lado || lado === 'bilateral') return joints;
  if (lado === 'izquierdo') {
    return joints.filter((j) => !j.joint.includes('derecho') && !j.joint.includes('derecha'));
  }
  if (lado === 'derecho') {
    return joints.filter((j) => !j.joint.includes('izquierdo') && !j.joint.includes('izquierda'));
  }
  return joints;
}

/**
 * Eje de rotación por defecto para articulaciones que no especifican uno.
 * La mayoría de movimientos sagitales (flexión/extensión) usan 'x'.
 */
const DEFAULT_AXIS: JointRotationAxis = 'x';

function ensureAxis(joints: JointAngleConfig[]): JointAngleConfig[] {
  return joints.map((j) => ({ ...j, axis: j.axis ?? DEFAULT_AXIS }));
}

export function getExercisePreset(
  name: string,
  articulacion?: string,
  lado?: string,
  anguloObjetivo?: number
): ExerciseJointPreset {
  const normName = normalizeName(name);
  const override = Object.entries(EXERCISE_OVERRIDES).find(([key]) =>
    normName.includes(key)
  );
  if (override) return override[1];

  const articulacionKey = (articulacion as Articulacion) || 'hombro';
  const preset = PRESets[articulacionKey] || PRESets.hombro;

  if (anguloObjetivo && anguloObjetivo > 0) {
    return {
      ...preset,
      targetJoints: preset.targetJoints.map((j) => ({
        ...j,
        targetAngle: j.joint.includes(articulacionKey) ? anguloObjetivo : j.targetAngle,
      })),
      description: preset.description,
      detailedDescription: preset.detailedDescription,
    };
  }

  return preset;
}

export function buildExerciseDefinition(
  id: string,
  name: string,
  series: number,
  repeticiones: number,
  articulacion?: string,
  lado?: string,
  anguloObjetivo?: number,
  detailedDescription?: string | null
): ExerciseDefinition {
  const preset = getExercisePreset(name, articulacion, lado, anguloObjetivo);
  const targetJoints = ensureAxis(filterByLado(preset.targetJoints, lado));

  return {
    id,
    name,
    description: preset.description,
    targetJoints,
    sets: series || 3,
    reps: repeticiones || 10,
    holdDurationSec: preset.holdDurationSec,
    position: preset.position ?? 'pie',
  };
}

export function getExerciseDescription(name: string, articulacion?: string): string {
  const preset = getExercisePreset(name, articulacion);
  return preset.detailedDescription;
}
