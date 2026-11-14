import type { JointAngleConfig, ExerciseDefinition, JointRotationAxis, ExercisePosition } from '../types/character.types';

export interface ExerciseJointPreset {
  description: string;
  detailedDescription: string;
  targetJoints: JointAngleConfig[];
  holdDurationSec: number;
  position?: ExercisePosition;
  movementPattern?: MovementPattern;
}

export type Articulacion =
  | 'hombro'
  | 'codo'
  | 'rodilla'
  | 'cadera'
  | 'tobillo'
  | 'cervical'
  | 'escapula'
  | 'columna';

export type Lado = 'bilateral' | 'derecho' | 'izquierdo';

export type MovementPattern =
  | 'shoulder_elevation'
  | 'shoulder_external_rotation'
  | 'scapular_retraction'
  | 'elbow_flexion'
  | 'knee_extension'
  | 'knee_flexion'
  | 'hip_abduction'
  | 'hip_bridge'
  | 'ankle_mobility'
  | 'cervical_lateral_flexion'
  | 'cervical_rotation'
  | 'cervical_flexion'
  | 'isometric_balance';

export type RepJointKey = 'elbow' | 'knee' | 'shoulder' | 'hip' | 'ankle' | 'cervical' | 'scapula';

export interface ExerciseTrackingRule {
  movementPattern: MovementPattern;
  repJoint: RepJointKey;
  neutralAngle: number;
  targetAngle: number;
  holdDurationSec: number;
  /** Ratio del rango objetivo requerido como excursión mínima para validar la repetición */
  minExcursionRatio: number;
  /** Porcentaje mínimo del rango objetivo para abandonar reposo e iniciar fase concéntrica */
  startThresholdRatio: number;
  /** Tolerancia de retorno a neutro respecto al rango objetivo */
  returnToleranceRatio: number;
  /** Duración mínima realista de una repetición (ms) */
  minDurationMs: number;
  /** Zona muerta en reposo para evitar lecturas falsas cerca de neutro */
  restDeadzoneDeg: number;
  /** Si es true, exige completar al menos ~75% del tiempo de sostén isométrico para contar */
  requiresHoldCompletion: boolean;
  /** Si es true, ancla el ángulo neutro automáticamente al inicio de la sesión */
  usesDeltaFromRest: boolean;
  /** Guía breve específica para mostrar al paciente en el HUD */
  instructionCue: string;
}

export interface DefaultExerciseSpec {
  id: string;
  nombre: string;
  articulacion: Articulacion;
  angulo_objetivo: number;
  lado: Lado;
  series: number;
  repeticiones: number;
  duracion_segundos?: number;
}

export const DEFAULT_EXERCISE_SPECS: DefaultExerciseSpec[] = [
  { id: 'ex-1', nombre: 'Flexión de Hombro Activa', articulacion: 'hombro', angulo_objetivo: 90, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'flexion-hombro', nombre: 'Flexión de hombro', articulacion: 'hombro', angulo_objetivo: 120, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'ex-2', nombre: 'Rotación Externa de Hombro', articulacion: 'hombro', angulo_objetivo: 45, lado: 'bilateral', series: 3, repeticiones: 15 },
  { id: 'rotacion-externa', nombre: 'Rotación externa con banda', articulacion: 'hombro', angulo_objetivo: 45, lado: 'bilateral', series: 3, repeticiones: 15 },
  { id: 'circunduccion', nombre: 'Circunducción escapular', articulacion: 'escapula', angulo_objetivo: 45, lado: 'bilateral', series: 2, repeticiones: 10 },
  { id: 'estiramiento-trapecio', nombre: 'Estiramiento de trapecio superior', articulacion: 'cervical', angulo_objetivo: 35, lado: 'bilateral', series: 2, repeticiones: 4 },
  { id: 'ex-3', nombre: 'Extensión Activa de Rodilla', articulacion: 'rodilla', angulo_objetivo: 0, lado: 'bilateral', series: 3, repeticiones: 10 },
  { id: 'ex-4', nombre: 'Abducción de Cadera de Pie', articulacion: 'cadera', angulo_objetivo: 40, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'ex-5', nombre: 'Flexión Cervical Suave', articulacion: 'cervical', angulo_objetivo: 30, lado: 'bilateral', series: 2, repeticiones: 8 },
  { id: 'ex-6', nombre: 'Flexoextensión de Codo', articulacion: 'codo', angulo_objetivo: 130, lado: 'bilateral', series: 3, repeticiones: 15 },
  { id: 'ex-7', nombre: 'Dorsiflexión y Flexión Plantar de Tobillo', articulacion: 'tobillo', angulo_objetivo: 20, lado: 'bilateral', series: 3, repeticiones: 15 },
  { id: 'ex-8', nombre: 'Puente Glúteo y Estabilidad Lumbar', articulacion: 'columna', angulo_objetivo: 0, lado: 'bilateral', series: 3, repeticiones: 10 },
  { id: 'ex-9', nombre: 'Retracción Escapular Postural', articulacion: 'escapula', angulo_objetivo: 45, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'abd-hombro', nombre: 'Abducción de hombro', articulacion: 'hombro', angulo_objetivo: 90, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'circ-hombro', nombre: 'Circunducción de hombro', articulacion: 'hombro', angulo_objetivo: 120, lado: 'bilateral', series: 2, repeticiones: 10 },
  { id: 'flx-codo', nombre: 'Flexión de codo', articulacion: 'codo', angulo_objetivo: 120, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'ext-rodilla', nombre: 'Extensión de rodilla', articulacion: 'rodilla', angulo_objetivo: 0, lado: 'bilateral', series: 3, repeticiones: 10 },
  { id: 'flx-rodilla-pie', nombre: 'Flexión de rodilla en pie', articulacion: 'rodilla', angulo_objetivo: 120, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'sentadilla', nombre: 'Sentadilla parcial', articulacion: 'rodilla', angulo_objetivo: 45, lado: 'bilateral', series: 3, repeticiones: 10 },
  { id: 'puente', nombre: 'Puente de glúteos', articulacion: 'cadera', angulo_objetivo: 0, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'mov-cervical', nombre: 'Movilidad cervical', articulacion: 'cervical', angulo_objetivo: 45, lado: 'bilateral', series: 2, repeticiones: 10 },
  { id: 'equilibrio', nombre: 'Equilibrio sobre una pierna', articulacion: 'rodilla', angulo_objetivo: 45, lado: 'derecho', series: 3, repeticiones: 3 },
  { id: 'monopodal-bosu', nombre: 'Apoyo monopodal propioceptivo', articulacion: 'cadera', angulo_objetivo: 35, lado: 'derecho', series: 3, repeticiones: 5 },
  { id: 'pendulo-codman', nombre: 'Péndulo de Codman', articulacion: 'hombro', angulo_objetivo: 60, lado: 'bilateral', series: 3, repeticiones: 20 },
  { id: 'chin-tuck', nombre: 'Retracción cervical (Chin-tuck)', articulacion: 'cervical', angulo_objetivo: 25, lado: 'bilateral', series: 3, repeticiones: 12 },
  { id: 'bird-dog', nombre: 'Bird-Dog', articulacion: 'columna', angulo_objetivo: 45, lado: 'bilateral', series: 3, repeticiones: 10 },
  { id: 'sentadilla-declinada', nombre: 'Sentadilla declinada 25°', articulacion: 'rodilla', angulo_objetivo: 60, lado: 'bilateral', series: 3, repeticiones: 15 },
];

const PRESets: Record<Articulacion, ExerciseJointPreset> = {
  hombro: {
    description: 'Elevación del brazo controlada hasta 90° manteniendo el hombro estable.',
    detailedDescription: 'Comienza de pie con los brazos a los lados. Eleva lentamente el brazo hacia adelante hasta alcanzar los 90° (paralelo al suelo). Mantén la posición 3 segundos y baja con control. Evita encoger el hombro hacia la oreja. El movimiento debe ser fluido e indoloro.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      { joint: 'hombro_derecho', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'x' },
      { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'pie',
    movementPattern: 'shoulder_elevation',
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
    movementPattern: 'elbow_flexion',
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
    movementPattern: 'knee_extension',
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
    movementPattern: 'hip_abduction',
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
    movementPattern: 'ankle_mobility',
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
    movementPattern: 'cervical_lateral_flexion',
  },
  escapula: {
    description: 'Retracción y control escapulotorácico manteniendo cuello relajado.',
    detailedDescription: 'Sentado o de pie con el tronco erguido. Aproxima ambas escápulas hacia la línea media dorsal abriendo el pecho sin elevar los hombros hacia las orejas. Mantén 3 segundos y retorna con control.',
    targetJoints: [
      { joint: 'hombro_izquierdo', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'z' },
      { joint: 'hombro_derecho', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'z' },
      { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 8, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'pie',
    movementPattern: 'scapular_retraction',
  },
  columna: {
    description: 'Estabilidad lumbopélvica y extensión controlada de cadera.',
    detailedDescription: 'Mantén la columna neutra con activación del core abdominal. Realiza el desplazamiento pélvico o de extremidades evitando hiperextensión lumbar.',
    targetJoints: [
      { joint: 'cadera_izquierda', targetAngle: 0, neutralAngle: 45, tolerance: 8, axis: 'x' },
      { joint: 'cadera_derecha', targetAngle: 0, neutralAngle: 45, tolerance: 8, axis: 'x' },
      { joint: 'rodilla_izquierda', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
      { joint: 'rodilla_derecha', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
      { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 8, axis: 'x' },
    ],
    holdDurationSec: 3,
    position: 'acostado',
    movementPattern: 'hip_bridge',
  },
};

// Ordenado del patrón más específico al más general para evitar colisiones
const EXERCISE_OVERRIDES: Array<{ keys: string[]; preset: ExerciseJointPreset }> = [
  {
    keys: ['flexión de hombro activa'],
    preset: {
      description: 'Elevación anterior del brazo hasta 90° con control postural y escápula fija.',
      detailedDescription: 'De pie con postura erguida, eleva lentamente el brazo hacia adelante hasta alcanzar 90° (paralelo al suelo) con el codo extendido. Sostén 3 segundos y desciende con control.',
      targetJoints: [
        { joint: 'hombro_izquierdo', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'x' },
        { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'hombro_derecho', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'x' },
        { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      ],
      holdDurationSec: 3,
      position: 'pie',
      movementPattern: 'shoulder_elevation',
    },
  },
  {
    keys: ['flexión de hombro'],
    preset: {
      description: 'Elevación del brazo hacia adelante hasta 120° con codo extendido.',
      detailedDescription: 'De pie con brazos a los lados y palmas mirando hacia adentro. Eleva el brazo recto hacia adelante (flexión anterior) hasta alcanzar 120°. Sostén 3 segundos en el punto máximo y baja con control.',
      targetJoints: [
        { joint: 'hombro_izquierdo', targetAngle: 120, neutralAngle: 0, tolerance: 8, axis: 'x' },
        { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'hombro_derecho', targetAngle: 120, neutralAngle: 0, tolerance: 8, axis: 'x' },
        { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      ],
      holdDurationSec: 3,
      position: 'pie',
      movementPattern: 'shoulder_elevation',
    },
  },
  {
    keys: ['abducción de hombro'],
    preset: {
      description: 'Apertura del brazo hacia el lado hasta 90° con codo extendido.',
      detailedDescription: 'De pie con brazos a los lados. Separa el brazo hacia el lado (abducción) manteniendo el codo extendido y el pulgar hacia arriba hasta 90° y sostén 3 segundos.',
      targetJoints: [
        { joint: 'hombro_izquierdo', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'z' },
        { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'hombro_derecho', targetAngle: 90, neutralAngle: 0, tolerance: 8, axis: 'z' },
        { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      ],
      holdDurationSec: 3,
      position: 'pie',
      movementPattern: 'shoulder_elevation',
    },
  },
  {
    keys: ['rotación externa de hombro', 'rotación externa con banda', 'rotacion externa'],
    preset: {
      description: 'Rotación externa del hombro con el codo fijo a 90° junto al torso.',
      detailedDescription: 'Coloca el codo pegado al costado del cuerpo flexionado a 90°. Mantén el codo inmóvil y rota el antebrazo hacia afuera hasta alcanzar el rango objetivo. Sostén 2 segundos y retorna con control.',
      targetJoints: [
        { joint: 'hombro_izquierdo', targetAngle: 45, neutralAngle: 0, tolerance: 8, axis: 'y' },
        { joint: 'codo_izquierdo', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
        { joint: 'hombro_derecho', targetAngle: 45, neutralAngle: 0, tolerance: 8, axis: 'y' },
        { joint: 'codo_derecho', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'pie',
      movementPattern: 'shoulder_external_rotation',
    },
  },
  {
    keys: ['péndulo de codman', 'pendulo de codman', 'codman'],
    preset: {
      description: 'Balanceo pendular pasivo del brazo relajado para descompresión glenohumeral.',
      detailedDescription: 'Inclina ligeramente el tronco apoyando el brazo sano y deja colgar el brazo afecto realizando oscilaciones suaves de hasta 60° sin tensión muscular.',
      targetJoints: [
        { joint: 'hombro_izquierdo', targetAngle: 60, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'hombro_derecho', targetAngle: 60, neutralAngle: 0, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 1,
      position: 'pie',
      movementPattern: 'shoulder_elevation',
    },
  },
  {
    keys: ['circunducción de hombro'],
    preset: {
      description: 'Círculos completos del brazo con codo extendido en el plano sagital.',
      detailedDescription: 'De pie con el brazo extendido. Realiza círculos amplios y continuos con el brazo manteniendo el codo recto y el tronco estable.',
      targetJoints: [
        { joint: 'hombro_izquierdo', targetAngle: 120, neutralAngle: 0, tolerance: 15, axis: 'x' },
        { joint: 'codo_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'hombro_derecho', targetAngle: 120, neutralAngle: 0, tolerance: 15, axis: 'x' },
        { joint: 'codo_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 1,
      position: 'pie',
      movementPattern: 'shoulder_elevation',
    },
  },
  {
    keys: ['circunducción escapular', 'retracción escapular'],
    preset: {
      description: 'Movilización y retracción escapulotorácica controlada.',
      detailedDescription: 'De pie o sentado erguido, retrae y moviliza ambas escápulas abriendo el pecho sin elevar los hombros hacia las orejas.',
      targetJoints: [
        { joint: 'hombro_izquierdo', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'z' },
        { joint: 'hombro_derecho', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'z' },
        { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 8, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'pie',
      movementPattern: 'scapular_retraction',
    },
  },
  {
    keys: ['flexoextensión de codo'],
    preset: {
      description: 'Flexión y extensión activa de codo para rango articular completo.',
      detailedDescription: 'Comienza con el brazo extendido a lo largo del cuerpo. Flexiona el codo acercando la mano hacia el hombro hasta los 130° sin mover el húmero y extiende con control.',
      targetJoints: [
        { joint: 'codo_izquierdo', targetAngle: 130, neutralAngle: 0, tolerance: 8, axis: 'x' },
        { joint: 'hombro_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'codo_derecho', targetAngle: 130, neutralAngle: 0, tolerance: 8, axis: 'x' },
        { joint: 'hombro_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'pie',
      movementPattern: 'elbow_flexion',
    },
  },
  {
    keys: ['flexión de codo', 'curl'],
    preset: {
      description: 'Flexión controlada llevando la mano al hombro.',
      detailedDescription: 'Con el codo pegado al torso, flexiona el antebrazo hasta 120°, sostén 1 segundo y desciende en 2 segundos.',
      targetJoints: [
        { joint: 'codo_izquierdo', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'hombro_izquierdo', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'codo_derecho', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'hombro_derecho', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 1,
      position: 'pie',
      movementPattern: 'elbow_flexion',
    },
  },
  {
    keys: ['extensión activa de rodilla', 'extensión de rodilla', 'isométrico de cuádriceps'],
    preset: {
      description: 'Extensión completa de rodilla desde flexión de 90° hasta 0°.',
      detailedDescription: 'Sentado con la espalda recta y rodillas a 90°. Extiende la rodilla hacia adelante hasta 0°, mantén 3 segundos contrayendo el cuádriceps y vuelve despacio a 90°.',
      targetJoints: [
        { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 90, tolerance: 8, axis: 'x' },
        { joint: 'cadera_izquierda', targetAngle: 90, neutralAngle: 90, tolerance: 12, axis: 'x' },
        { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 90, tolerance: 8, axis: 'x' },
        { joint: 'cadera_derecha', targetAngle: 90, neutralAngle: 90, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 3,
      position: 'sentado',
      movementPattern: 'knee_extension',
    },
  },
  {
    keys: ['flexión de rodilla en pie', 'flexión de rodilla'],
    preset: {
      description: 'Lleva el talón hacia el glúteo de pie manteniendo el muslo vertical.',
      detailedDescription: 'De pie con apoyo seguro, flexiona la rodilla llevando el talón atrás hasta 120° y sostén 2 segundos.',
      targetJoints: [
        { joint: 'rodilla_izquierda', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'rodilla_derecha', targetAngle: 120, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_derecha', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'pie',
      movementPattern: 'knee_flexion',
    },
  },
  {
    keys: ['sentadilla declinada'],
    preset: {
      description: 'Sentadilla excéntrica controlada hasta 60° de flexión de rodilla.',
      detailedDescription: 'Desciende con control durante 3 segundos hasta 60° de flexión de rodilla manteniendo la alineación rotuliana.',
      targetJoints: [
        { joint: 'rodilla_izquierda', targetAngle: 60, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_izquierda', targetAngle: 55, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'rodilla_derecha', targetAngle: 60, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_derecha', targetAngle: 55, neutralAngle: 0, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'pie',
      movementPattern: 'knee_flexion',
    },
  },
  {
    keys: ['sentadilla parcial', 'sentadilla'],
    preset: {
      description: 'Sentadilla a 45° de flexión de rodilla con peso en los talones.',
      detailedDescription: 'De pie con pies al ancho de hombros. Flexiona rodillas y caderas hasta 45°, sostén 2 segundos y sube empujando con los talones.',
      targetJoints: [
        { joint: 'rodilla_izquierda', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_izquierda', targetAngle: 45, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'rodilla_derecha', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_derecha', targetAngle: 45, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'tronco_torax', targetAngle: 20, neutralAngle: 0, tolerance: 15, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'pie',
      movementPattern: 'knee_flexion',
    },
  },
  {
    keys: ['equilibrio sobre una pierna', 'apoyo monopodal'],
    preset: {
      description: 'Apoyo unipodal con elevación controlada de rodilla y sostén isométrico.',
      detailedDescription: 'Transfiere el peso a una pierna, eleva la contraria hasta 45° manteniendo la pelvis nivelada y sostén el equilibrio el tiempo indicado antes de bajar.',
      targetJoints: [
        { joint: 'rodilla_derecha', targetAngle: 45, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'cadera_derecha', targetAngle: 30, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'rodilla_izquierda', targetAngle: 10, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 8,
      position: 'pie',
      movementPattern: 'isometric_balance',
    },
  },
  {
    keys: ['puente glúteo', 'puente de glúteo', 'puente de glúteos'],
    preset: {
      description: 'Elevación pélvica desde supino hasta extensión neutra de cadera (0°).',
      detailedDescription: 'Tumbado boca arriba con rodillas a 90°. Eleva la pelvis empujando con los talones hasta alinear tronco, caderas y rodillas (0°). Mantén 3 segundos.',
      targetJoints: [
        { joint: 'cadera_izquierda', targetAngle: 0, neutralAngle: 45, tolerance: 8, axis: 'x' },
        { joint: 'cadera_derecha', targetAngle: 0, neutralAngle: 45, tolerance: 8, axis: 'x' },
        { joint: 'rodilla_izquierda', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
        { joint: 'rodilla_derecha', targetAngle: 90, neutralAngle: 90, tolerance: 10, axis: 'x' },
        { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 8, axis: 'x' },
      ],
      holdDurationSec: 3,
      position: 'acostado',
      movementPattern: 'hip_bridge',
    },
  },
  {
    keys: ['abducción de cadera de pie', 'abducción de cadera'],
    preset: {
      description: 'Elevación lateral de la pierna manteniendo la pelvis nivelada.',
      detailedDescription: 'De pie con apoyo firme, separa la pierna lateralmente hasta 40° sin inclinar el tronco al lado contrario. Sostén 2 segundos y vuelve despacio.',
      targetJoints: [
        { joint: 'cadera_derecha', targetAngle: 40, neutralAngle: 0, tolerance: 8, axis: 'z' },
        { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_izquierda', targetAngle: 40, neutralAngle: 0, tolerance: 8, axis: 'z' },
        { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'pie',
      movementPattern: 'hip_abduction',
    },
  },
  {
    keys: ['bird-dog', 'bird dog'],
    preset: {
      description: 'Extensión alterna de brazo y pierna en cuadrupedia manteniendo columna neutra.',
      detailedDescription: 'En cuadrupedia, extiende brazo y pierna opuesta hasta 45° estabilizando la zona lumbar durante 3 segundos.',
      targetJoints: [
        { joint: 'cadera_izquierda', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'cadera_derecha', targetAngle: 45, neutralAngle: 0, tolerance: 10, axis: 'x' },
        { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 8, axis: 'x' },
      ],
      holdDurationSec: 3,
      position: 'acostado',
      movementPattern: 'hip_abduction',
    },
  },
  {
    keys: ['estiramiento de trapecio superior', 'estiramiento de trapecio'],
    preset: {
      description: 'Inclinación lateral cervical suave hacia ambos lados.',
      detailedDescription: 'Sentado con la espalda recta, inclina suavemente la cabeza llevando la oreja hacia el hombro hasta 35° manteniendo ambos hombros bajos y nivelados.',
      targetJoints: [
        { joint: 'cabeza', targetAngle: 35, neutralAngle: 0, tolerance: 8, axis: 'z' },
        { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 8,
      position: 'sentado',
      movementPattern: 'cervical_lateral_flexion',
    },
  },
  {
    keys: ['flexión cervical suave', 'chin-tuck', 'retracción cervical'],
    preset: {
      description: 'Flexión / retracción cervical anterior suave para elongación suboccipital.',
      detailedDescription: 'Sentado erguido, lleva suavemente el mentón hacia atrás y abajo hasta alcanzar el rango indicado sin encoger los hombros.',
      targetJoints: [
        { joint: 'cabeza', targetAngle: 30, neutralAngle: 0, tolerance: 6, axis: 'x' },
        { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      ],
      holdDurationSec: 3,
      position: 'sentado',
      movementPattern: 'cervical_flexion',
    },
  },
  {
    keys: ['movilidad cervical', 'rotación cervical'],
    preset: {
      description: 'Rotación cervical suave hacia ambos lados con hombros relajados.',
      detailedDescription: 'Sentado con la columna recta, rota lentamente la cabeza hacia un lado hasta 45°, mantén 2 segundos y vuelve al centro.',
      targetJoints: [
        { joint: 'cabeza', targetAngle: 45, neutralAngle: 0, tolerance: 8, axis: 'y' },
        { joint: 'tronco_torax', targetAngle: 0, neutralAngle: 0, tolerance: 10, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'sentado',
      movementPattern: 'cervical_rotation',
    },
  },
  {
    keys: ['dorsiflexión', 'flexión plantar', 'movilidad de tobillo'],
    preset: {
      description: 'Movilidad articular activa de tobillo en flexo-extensión sagital.',
      detailedDescription: 'Sentado con la pierna extendida y talón libre. Lleva la punta del pie hacia arriba hasta 20° manteniendo la rodilla fija.',
      targetJoints: [
        { joint: 'tobillo_izquierdo', targetAngle: 20, neutralAngle: 0, tolerance: 8, axis: 'x' },
        { joint: 'tobillo_derecho', targetAngle: 20, neutralAngle: 0, tolerance: 8, axis: 'x' },
        { joint: 'rodilla_izquierda', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
        { joint: 'rodilla_derecha', targetAngle: 0, neutralAngle: 0, tolerance: 12, axis: 'x' },
      ],
      holdDurationSec: 2,
      position: 'sentado',
      movementPattern: 'ankle_mobility',
    },
  },
];

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function normalizeTextRaw(name: string): string {
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

const DEFAULT_AXIS: JointRotationAxis = 'x';

function ensureAxis(joints: JointAngleConfig[]): JointAngleConfig[] {
  return joints.map((j) => ({ ...j, axis: j.axis ?? DEFAULT_AXIS }));
}

function inferArticulacionFromName(name: string): Articulacion | undefined {
  const n = normalizeName(name);
  if (/(tobillo|ankle|dorsiflex|plantar|gemelo|aquiles)/.test(n)) return 'tobillo';
  if (/(cervical|cuello|neck|chin|trapecio|suboccipital)/.test(n)) return 'cervical';
  if (/(escapul|romboid|serrato)/.test(n)) return 'escapula';
  if (/(rodilla|knee|sentadilla|squat|cuadricep|zancada|lunge|rotul)/.test(n)) return 'rodilla';
  if (/(codo|elbow|bicep|tricep|curl|antebrazo)/.test(n)) return 'codo';
  if (/(puente|lumbar|columna|bird-dog|core)/.test(n)) return 'columna';
  if (/(cadera|hip|gluteo|abducci.*pierna|monopodal|equilibrio)/.test(n)) return 'cadera';
  if (/(hombro|shoulder|manguito|deltoides|codman|elevaci|rotacion externa)/.test(n)) return 'hombro';
  return undefined;
}

function inferMovementPattern(
  name: string,
  articulacion: Articulacion,
  targetAngle: number,
  overridePattern?: MovementPattern
): MovementPattern {
  const n = normalizeName(name);

  if (/(equilibrio|monopodal|bosu|unipodal)/.test(n)) return 'isometric_balance';
  if (/(rotacion externa|rotación externa)/.test(n)) return 'shoulder_external_rotation';
  if (/(escapul|retracci)/.test(n) && articulacion !== 'cervical') return 'scapular_retraction';
  if (/(puente|bridge)/.test(n)) return 'hip_bridge';
  if (/(extension.*rodilla|isometrico.*cuadricep)/.test(n)) return 'knee_extension';
  if (/(flexion.*rodilla|sentadilla|squat|zancada|lunge)/.test(n)) return 'knee_flexion';
  if (/(rotacion.*cervical|movilidad cervical)/.test(n)) return 'cervical_rotation';
  if (/(flexion.*cervical|chin-tuck|retraccion cervical)/.test(n)) return 'cervical_flexion';
  if (/(trapecio|inclinacion.*cervical|lateral.*cuello)/.test(n)) return 'cervical_lateral_flexion';

  if (overridePattern) {
    // Si el terapeuta creó/editó una variante de flexión con >20° sobre rodilla/cadera, adaptamos el patrón
    if (articulacion === 'rodilla' && targetAngle > 20) return 'knee_flexion';
    if ((articulacion === 'cadera' || articulacion === 'columna') && targetAngle > 20 && overridePattern === 'hip_bridge') {
      return 'hip_abduction';
    }
    return overridePattern;
  }

  switch (articulacion) {
    case 'hombro':
      return 'shoulder_elevation';
    case 'codo':
      return 'elbow_flexion';
    case 'rodilla':
      return targetAngle <= 20 ? 'knee_extension' : 'knee_flexion';
    case 'cadera':
      return targetAngle <= 15 ? 'hip_bridge' : 'hip_abduction';
    case 'columna':
      return targetAngle <= 15 ? 'hip_bridge' : 'hip_abduction';
    case 'tobillo':
      return 'ankle_mobility';
    case 'cervical':
      return 'cervical_lateral_flexion';
    case 'escapula':
      return 'scapular_retraction';
  }
}

export function lookupDefaultExerciseSpec(name?: string | null, id?: string | null): DefaultExerciseSpec | undefined {
  if (id) {
    const byId = DEFAULT_EXERCISE_SPECS.find((s) => s.id === id);
    if (byId) return byId;
  }
  if (!name) return undefined;
  const norm = normalizeName(name);
  return (
    DEFAULT_EXERCISE_SPECS.find((s) => normalizeName(s.nombre) === norm) ||
    DEFAULT_EXERCISE_SPECS.find((s) => norm.includes(normalizeName(s.nombre)) || normalizeName(s.nombre).includes(norm))
  );
}

export function getExercisePreset(
  name: string,
  articulacion?: string,
  _lado?: string,
  anguloObjetivo?: number
): ExerciseJointPreset {
  const normPlain = normalizeName(name);
  const normRaw = normalizeTextRaw(name);
  const hasExplicitTarget = typeof anguloObjetivo === 'number' && Number.isFinite(anguloObjetivo) && anguloObjetivo >= 0;

  const matchedOverride = EXERCISE_OVERRIDES.find(({ keys }) =>
    keys.some((k) => normRaw.includes(k) || normPlain.includes(normalizeName(k)))
  )?.preset;

  const artNorm = articulacion?.toLowerCase().trim();
  const explicitArt = artNorm && artNorm in PRESets ? (artNorm as Articulacion) : undefined;
  const inferredArt = explicitArt ?? inferArticulacionFromName(name) ?? 'hombro';
  const basePreset = matchedOverride ?? PRESets[inferredArt];

  const primaryBaseTarget = basePreset.targetJoints[0]?.targetAngle ?? 90;
  const effectiveTarget = hasExplicitTarget ? Math.max(0, Math.min(180, anguloObjetivo!)) : primaryBaseTarget;
  const pattern = inferMovementPattern(name, inferredArt, effectiveTarget, basePreset.movementPattern);

  // Derivar neutralAngle coherente para cualquier ejercicio nuevo o editado
  const resolveNeutral = (jointName: string, origNeutral: number | undefined): number => {
    const isPrimary =
      jointName === basePreset.targetJoints[0]?.joint ||
      (inferredArt === 'columna' && jointName.includes('cadera')) ||
      (inferredArt === 'escapula' && jointName.includes('hombro')) ||
      jointName.includes(inferredArt);

    if (!isPrimary) return origNeutral ?? 0;
    if (pattern === 'knee_extension') return 90;
    if (pattern === 'knee_flexion') return 0;
    if (pattern === 'hip_bridge') return 45;
    if (pattern === 'hip_abduction') return 0;
    return origNeutral ?? 0;
  };

  const primaryStem = basePreset.targetJoints[0]?.joint.split('_')[0] ?? inferredArt;

  const updatedJoints = basePreset.targetJoints.map((j, idx) => {
    const isPrimaryCounterpart =
      idx === 0 ||
      j.joint.startsWith(primaryStem) ||
      (inferredArt === 'columna' && j.joint.startsWith('cadera')) ||
      (inferredArt === 'escapula' && j.joint.startsWith('hombro'));

    return {
      ...j,
      neutralAngle: resolveNeutral(j.joint, j.neutralAngle),
      targetAngle: isPrimaryCounterpart ? effectiveTarget : j.targetAngle,
    };
  });

  return {
    ...basePreset,
    movementPattern: pattern,
    targetJoints: updatedJoints,
  };
}

export function resolveExerciseTrackingRule(
  name: string,
  articulacion?: string,
  lado?: string,
  anguloObjetivo?: number,
  holdDurationSecOverride?: number
): ExerciseTrackingRule {
  const preset = getExercisePreset(name, articulacion, lado, anguloObjetivo);
  const filteredJoints = filterByLado(preset.targetJoints, lado);
  const primaryJoint = filteredJoints[0] ?? preset.targetJoints[0];

  const neutralAngle = primaryJoint?.neutralAngle ?? 0;
  const targetAngle = primaryJoint?.targetAngle ?? 90;
  const targetSpan = Math.max(12, Math.abs(targetAngle - neutralAngle));
  const movementPattern = preset.movementPattern ?? 'shoulder_elevation';
  const holdDurationSec = Math.max(1, holdDurationSecOverride ?? preset.holdDurationSec ?? 2);

  const mapPatternToRepJoint = (p: MovementPattern): RepJointKey => {
    switch (p) {
      case 'shoulder_elevation':
      case 'shoulder_external_rotation':
        return 'shoulder';
      case 'scapular_retraction':
        return 'scapula';
      case 'elbow_flexion':
        return 'elbow';
      case 'knee_extension':
      case 'knee_flexion':
        return 'knee';
      case 'hip_abduction':
      case 'hip_bridge':
      case 'isometric_balance':
        return 'hip';
      case 'ankle_mobility':
        return 'ankle';
      case 'cervical_lateral_flexion':
      case 'cervical_rotation':
      case 'cervical_flexion':
        return 'cervical';
    }
  };

  const isSmallRom = targetSpan <= 35;
  const isIsometric = movementPattern === 'isometric_balance';

  const instructionCueMap: Record<MovementPattern, string> = {
    shoulder_elevation: `Eleva el brazo desde ${neutralAngle}° hasta ${targetAngle}° con tronco erguido`,
    shoulder_external_rotation: `Codo a 90° junto al torso; rota antebrazo hacia afuera hasta ${targetAngle}°`,
    scapular_retraction: `Junta escápulas y abre pecho hasta ${targetSpan}° sin encoger hombros`,
    elbow_flexion: `Flexiona el codo con brazo fijo hasta ${targetAngle}° y retorna lento`,
    knee_extension: `Extiende la rodilla desde ${neutralAngle}° hasta ${targetAngle}° y sostén ${holdDurationSec}s`,
    knee_flexion: `Flexiona la rodilla de ${neutralAngle}° a ${targetAngle}° manteniendo alineación`,
    hip_abduction: `Separa la pierna lateralmente hasta ${targetAngle}° sin inclinar el torso`,
    hip_bridge: `Eleva la pelvis desde ${neutralAngle}° hasta alinear cadera en ${targetAngle}°`,
    ankle_mobility: `Lleva el pie en rango controlado hasta ${targetAngle}° manteniendo rodilla fija`,
    cervical_lateral_flexion: `Inclina cabeza suavemente hacia el lado hasta ${targetAngle}°`,
    cervical_rotation: `Rota cabeza con suavidad hacia cada lado hasta ${targetAngle}°`,
    cervical_flexion: `Desliza mentón suavemente hasta ${targetAngle}° con hombros relajados`,
    isometric_balance: `Eleva pierna hasta ${targetAngle}° y mantén equilibrio ${holdDurationSec}s`,
  };

  return {
    movementPattern,
    repJoint: mapPatternToRepJoint(movementPattern),
    neutralAngle,
    targetAngle,
    holdDurationSec,
    minExcursionRatio: isIsometric ? 0.68 : isSmallRom ? 0.65 : 0.72,
    startThresholdRatio: isSmallRom ? 0.22 : 0.24,
    returnToleranceRatio: isSmallRom ? 0.28 : 0.24,
    minDurationMs: isIsometric ? Math.max(2200, Math.round(holdDurationSec * 750)) : isSmallRom ? 1000 : 1200,
    restDeadzoneDeg: isSmallRom ? 4 : 7,
    requiresHoldCompletion: isIsometric,
    usesDeltaFromRest:
      movementPattern === 'scapular_retraction' || movementPattern === 'cervical_flexion',
    instructionCue: instructionCueMap[movementPattern],
  };
}

export function buildArMirrorPath(params: {
  ejercicio: string;
  articulacion?: string | null;
  angulo?: number | null;
  lado?: string | null;
  series?: number | null;
  repeticiones?: number | null;
  descanso?: number | null;
  id?: string | null;
}): string {
  const sp = new URLSearchParams();
  sp.set('ejercicio', params.ejercicio);
  if (params.articulacion) sp.set('articulacion', params.articulacion);
  if (typeof params.angulo === 'number' && Number.isFinite(params.angulo)) {
    sp.set('angulo', String(params.angulo));
  }
  if (params.lado) sp.set('lado', params.lado);
  if (typeof params.series === 'number' && params.series > 0) sp.set('series', String(params.series));
  if (typeof params.repeticiones === 'number' && params.repeticiones > 0) sp.set('repeticiones', String(params.repeticiones));
  if (typeof params.descanso === 'number' && params.descanso > 0) sp.set('descanso', String(params.descanso));
  if (params.id) sp.set('id', params.id);
  return `/ar-mirror?${sp.toString()}`;
}

export function buildCalibrationToArPath(params: {
  ejercicio: string;
  articulacion?: string | null;
  angulo?: number | null;
  lado?: string | null;
  series?: number | null;
  repeticiones?: number | null;
  descanso?: number | null;
  id?: string | null;
}): string {
  const arUrl = buildArMirrorPath(params);
  const sp = new URLSearchParams();
  sp.set('ejercicio', params.ejercicio);
  if (params.articulacion) sp.set('articulacion', params.articulacion);
  if (typeof params.angulo === 'number' && Number.isFinite(params.angulo)) {
    sp.set('angulo', String(params.angulo));
  }
  if (params.lado) sp.set('lado', params.lado);
  if (typeof params.series === 'number' && params.series > 0) sp.set('series', String(params.series));
  if (typeof params.repeticiones === 'number' && params.repeticiones > 0) sp.set('repeticiones', String(params.repeticiones));
  if (params.id) sp.set('id', params.id);
  sp.set('next', arUrl);
  return `/calibration?${sp.toString()}`;
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
    description: detailedDescription || preset.description,
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
