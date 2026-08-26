import type { Profile } from '../types';

export interface UnifiedDemoPatient {
  id: string;
  name: string;
  email: string;
  fmId: string;
  diagnosis: string;
  patologia: string;
  progress: number;
  sessionsCompleted: number;
  sessionsTotal: number;
  lastActive: string;
  routine: string;
  status: 'Activo' | 'En pausa' | 'Alta próxima' | 'Requiere Revisión';
  adherence: number;
  phone: string;
  bloodType: string;
  occupation: string;
  activityLevel: string;
  heightCm: number;
  weightKg: number;
  affectedLimb: string;
  targetRom: string;
  frequency: string;
  referringDoctor: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  sessions: {
    id: string;
    fecha: string;
    ejercicio_nombre: string;
    duracion_segundos: number;
    repeticiones: number;
    calidad_ejecucion: number;
    notas: string;
    compensaciones_detectadas?: string[];
    adherencia?: number;
    rom_alcanzado?: number;
  }[];
  exercises: {
    id: string;
    ejercicio_nombre: string;
    ejercicio_id: string;
    series: number;
    repeticiones: number;
    frecuencia_semana: number;
    notas: string;
    detailed_description: string;
    complexity: 'baja' | 'media' | 'alta';
    musculos: string;
  }[];
}

export const UNIFIED_DEMO_PATIENTS: UnifiedDemoPatient[] = [
  {
    id: 'demo-patient-001',
    name: 'Carlos Mendoza',
    email: 'paciente@demo.com',
    fmId: 'FM-1001',
    diagnosis: 'Tendinopatía del supraespinoso derecho con limitación funcional moderada',
    patologia: 'Rehabilitación Manguito Rotador',
    progress: 84,
    sessionsCompleted: 18,
    sessionsTotal: 24,
    lastActive: 'Hace 1 hora',
    routine: 'Manguito rotador + flexión escapular',
    status: 'Activo',
    adherence: 90,
    phone: '+58 412 5550192',
    bloodType: 'O+',
    occupation: 'Ingeniero de Software',
    activityLevel: 'Moderado',
    heightCm: 178,
    weightKg: 74,
    affectedLimb: 'Hombro derecho',
    targetRom: '160° de flexión y 75° de rotación externa',
    frequency: '4 veces por semana',
    referringDoctor: 'Dr. Roberto Silva',
    emergencyContact: {
      name: 'María Mendoza',
      phone: '+58 414 5550193',
    },
    sessions: [
      { id: 's-1', fecha: new Date(Date.now() - 3600000).toISOString(), ejercicio_nombre: 'Flexión de hombro', duracion_segundos: 420, repeticiones: 36, calidad_ejecucion: 94, notas: 'Excelente control motor, sin compensación de trapecio.', rom_alcanzado: 155, adherencia: 95 },
      { id: 's-2', fecha: new Date(Date.now() - 86400000).toISOString(), ejercicio_nombre: 'Rotación externa con banda', duracion_segundos: 380, repeticiones: 30, calidad_ejecucion: 90, notas: 'Ritmo estable. Codo pegado al torso.', rom_alcanzado: 70, adherencia: 90 },
      { id: 's-3', fecha: new Date(Date.now() - 3 * 86400000).toISOString(), ejercicio_nombre: 'Circunducción escapular', duracion_segundos: 300, repeticiones: 24, calidad_ejecucion: 88, notas: 'Movimiento fluido.', rom_alcanzado: 145, adherencia: 85 },
      { id: 's-4', fecha: new Date(Date.now() - 5 * 86400000).toISOString(), ejercicio_nombre: 'Flexión de hombro', duracion_segundos: 410, repeticiones: 36, calidad_ejecucion: 85, notas: 'Ligera compensación en últimas 3 repeticiones.', rom_alcanzado: 140, adherencia: 85 },
      { id: 's-5', fecha: new Date(Date.now() - 7 * 86400000).toISOString(), ejercicio_nombre: 'Estiramiento de trapecio', duracion_segundos: 300, repeticiones: 12, calidad_ejecucion: 92, notas: 'Buena respiración diafragmática.', rom_alcanzado: 135, adherencia: 90 },
    ],
    exercises: [
      { id: 'ex-1', ejercicio_nombre: 'Flexión de hombro', ejercicio_id: 'flexion-hombro', series: 3, repeticiones: 12, frecuencia_semana: 4, notas: 'Eleva hasta 90° o tolerancia sin elevar la escápula.', detailed_description: 'Comienza de pie con los brazos a los lados. Eleva lentamente el brazo hacia adelante hasta alcanzar los 90° (paralelo al suelo). Mantén la posición 3 segundos y baja con control.', complexity: 'media', musculos: 'Deltoides anterior, supraespinoso' },
      { id: 'ex-2', ejercicio_nombre: 'Rotación externa con banda', ejercicio_id: 'rotacion-externa', series: 3, repeticiones: 15, frecuencia_semana: 4, notas: 'Mantener codo a 90° pegado a las costillas.', detailed_description: 'Codo flexionado a 90° pegado al costado. Rota el antebrazo hacia afuera manteniendo el eje del codo.', complexity: 'media', musculos: 'Infraespinoso, redondo menor' },
      { id: 'ex-3', ejercicio_nombre: 'Circunducción escapular', ejercicio_id: 'circunduccion', series: 2, repeticiones: 10, frecuencia_semana: 3, notas: 'Círculos lentos y amplios sin forzar rangos de dolor.', detailed_description: 'Realiza círculos controlados con los hombros hacia atrás y hacia adelante abriendo el pecho.', complexity: 'baja', musculos: 'Trapecio medio, romboides, serrato anterior' },
      { id: 'ex-4', ejercicio_nombre: 'Estiramiento de trapecio superior', ejercicio_id: 'estiramiento-trapecio', series: 2, repeticiones: 4, frecuencia_semana: 5, notas: 'Sostener 20s con respiración suave.', detailed_description: 'Inclina suavemente la cabeza hacia el lado opuesto y mantén la tensión durante 20 segundos.', complexity: 'baja', musculos: 'Trapecio superior, elevador de la escápula' },
    ],
  },
  {
    id: 'demo-1',
    name: 'María Fernández',
    email: 'maria.fernandez@demo.com',
    fmId: 'FM-1002',
    diagnosis: 'Lumbalgia crónica inespecífica con debilidad de core',
    patologia: 'Columna Lumbar',
    progress: 78,
    sessionsCompleted: 14,
    sessionsTotal: 18,
    lastActive: 'Hace 2 horas',
    routine: 'Core + movilidad lumbar',
    status: 'Activo',
    adherence: 92,
    phone: '+58 414 5550201',
    bloodType: 'A+',
    occupation: 'Diseñadora Gráfica',
    activityLevel: 'Sedentario',
    heightCm: 165,
    weightKg: 60,
    affectedLimb: 'Zona lumbar',
    targetRom: 'Flexión lumbar completa sin dolor',
    frequency: '3 veces por semana',
    referringDoctor: 'Dr. Roberto Silva',
    emergencyContact: { name: 'Pedro Fernández', phone: '+58 414 5550202' },
    sessions: [
      { id: 's-m1', fecha: new Date(Date.now() - 7200000).toISOString(), ejercicio_nombre: 'Puente de glúteo', duracion_segundos: 360, repeticiones: 30, calidad_ejecucion: 92, notas: 'Activación correcta de glúteos y transverso.', rom_alcanzado: 45, adherencia: 95 },
      { id: 's-m2', fecha: new Date(Date.now() - 2 * 86400000).toISOString(), ejercicio_nombre: 'Bird-Dog funcional', duracion_segundos: 400, repeticiones: 24, calidad_ejecucion: 88, notas: 'Buena estabilidad pélvica.', rom_alcanzado: 50, adherencia: 90 },
    ],
    exercises: [
      { id: 'ex-m1', ejercicio_nombre: 'Puente de glúteo', ejercicio_id: 'puente-gluteo', series: 3, repeticiones: 12, frecuencia_semana: 3, notas: 'Evitar hiperextensión lumbar.', detailed_description: 'Acostado boca arriba con rodillas flexionadas, eleva la pelvis contrayendo glúteos.', complexity: 'baja', musculos: 'Glúteo mayor, isquiotibiales' },
      { id: 'ex-m2', ejercicio_nombre: 'Bird-Dog', ejercicio_id: 'bird-dog', series: 3, repeticiones: 10, frecuencia_semana: 3, notas: 'Mantener la columna neutra.', detailed_description: 'En cuadrupedia, extiende simultáneamente brazo derecho y pierna izquierda.', complexity: 'media', musculos: 'Multífidos, erector espinal, transverso' },
    ],
  },
  {
    id: 'demo-2',
    name: 'Carlos Domínguez',
    email: 'carlos.dominguez@demo.com',
    fmId: 'FM-1003',
    diagnosis: 'Rehabilitación postoperatoria LCA rodilla derecha',
    patologia: 'Rodilla Postquirúrgica',
    progress: 45,
    sessionsCompleted: 9,
    sessionsTotal: 20,
    lastActive: 'Hace 1 día',
    routine: 'Fortalecimiento cuádriceps',
    status: 'Activo',
    adherence: 68,
    phone: '+58 416 5550301',
    bloodType: 'B+',
    occupation: 'Arquitecto',
    activityLevel: 'Activo',
    heightCm: 182,
    weightKg: 80,
    affectedLimb: 'Rodilla derecha',
    targetRom: '130° de flexión y 0° de extensión',
    frequency: '4 veces por semana',
    referringDoctor: 'Dr. Roberto Silva',
    emergencyContact: { name: 'Laura Domínguez', phone: '+58 416 5550302' },
    sessions: [
      { id: 's-cd1', fecha: new Date(Date.now() - 86400000).toISOString(), ejercicio_nombre: 'Isométrico de cuádriceps', duracion_segundos: 450, repeticiones: 30, calidad_ejecucion: 75, notas: 'Monitorear derrame post-ejercicio.', rom_alcanzado: 95, adherencia: 70 },
    ],
    exercises: [
      { id: 'ex-cd1', ejercicio_nombre: 'Isométrico de cuádriceps', ejercicio_id: 'isometrico-cuadriceps', series: 3, repeticiones: 10, frecuencia_semana: 4, notas: 'Contracción sostenida 6 segundos.', detailed_description: 'Sentado con pierna extendida, empuja la rodilla hacia la camilla contrayendo el cuádriceps.', complexity: 'baja', musculos: 'Cuádriceps femoral' },
    ],
  },
  {
    id: 'demo-3',
    name: 'Lucía Romero',
    email: 'lucia.romero@demo.com',
    fmId: 'FM-1004',
    diagnosis: 'Tendinopatía rotuliana izquierda en fase de remodelación',
    patologia: 'Tendón Rotuliano',
    progress: 62,
    sessionsCompleted: 11,
    sessionsTotal: 16,
    lastActive: 'Hace 3 horas',
    routine: 'Eccéntricos + estiramientos',
    status: 'Activo',
    adherence: 81,
    phone: '+58 424 5550401',
    bloodType: 'O-',
    occupation: 'Atleta de Voleibol',
    activityLevel: 'Muy Alto',
    heightCm: 174,
    weightKg: 64,
    affectedLimb: 'Rodilla izquierda',
    targetRom: 'Retorno a salto sin dolor',
    frequency: '3 veces por semana',
    referringDoctor: 'Dr. Roberto Silva',
    emergencyContact: { name: 'Gabriela Romero', phone: '+58 424 5550402' },
    sessions: [
      { id: 's-lr1', fecha: new Date(Date.now() - 10800000).toISOString(), ejercicio_nombre: 'Sentadilla declinada 25°', duracion_segundos: 400, repeticiones: 30, calidad_ejecucion: 86, notas: 'Buena carga excéntrica controlada.', rom_alcanzado: 110, adherencia: 85 },
    ],
    exercises: [
      { id: 'ex-lr1', ejercicio_nombre: 'Sentadilla declinada 25°', ejercicio_id: 'sentadilla-declinada', series: 3, repeticiones: 15, frecuencia_semana: 3, notas: 'Fase de bajada en 3 segundos.', detailed_description: 'Sobre tabla inclinada a 25°, desciende lentamente con la pierna afectada.', complexity: 'alta', musculos: 'Cuádriceps, tendón rotuliano' },
    ],
  },
  {
    id: 'demo-4',
    name: 'Javier Molina',
    email: 'javier.molina@demo.com',
    fmId: 'FM-1005',
    diagnosis: 'Capsulitis adhesiva (hombro congelado) fase II',
    patologia: 'Hombro Glenohumeral',
    progress: 30,
    sessionsCompleted: 6,
    sessionsTotal: 20,
    lastActive: 'Hace 4 días',
    routine: 'Movilidad glenohumeral pendular',
    status: 'En pausa',
    adherence: 54,
    phone: '+58 412 5550501',
    bloodType: 'A-',
    occupation: 'Profesor Universitario',
    activityLevel: 'Bajo',
    heightCm: 170,
    weightKg: 78,
    affectedLimb: 'Hombro izquierdo',
    targetRom: '120° de abducción activa',
    frequency: '4 veces por semana',
    referringDoctor: 'Dr. Roberto Silva',
    emergencyContact: { name: 'Carmen Molina', phone: '+58 412 5550502' },
    sessions: [
      { id: 's-jm1', fecha: new Date(Date.now() - 4 * 86400000).toISOString(), ejercicio_nombre: 'Ejercicios de Codman (Péndulo)', duracion_segundos: 300, repeticiones: 20, calidad_ejecucion: 60, notas: 'Refiere molestia al final del rango. Requiere motivación.', rom_alcanzado: 75, adherencia: 50 },
    ],
    exercises: [
      { id: 'ex-jm1', ejercicio_nombre: 'Péndulo de Codman', ejercicio_id: 'pendulo-codman', series: 3, repeticiones: 20, frecuencia_semana: 4, notas: 'Usar gravedad para descomprimir la articulación.', detailed_description: 'Inclina el tronco hacia adelante apoyando el brazo sano y deja colgar el brazo afecto en círculos.', complexity: 'baja', musculos: 'Manguito rotador, cápsula articular' },
    ],
  },
  {
    id: 'demo-5',
    name: 'Elena Castillo',
    email: 'elena.castillo@demo.com',
    fmId: 'FM-1006',
    diagnosis: 'Esguince de tobillo grado II (LPAA) en fase final',
    patologia: 'Tobillo y Pie',
    progress: 88,
    sessionsCompleted: 16,
    sessionsTotal: 18,
    lastActive: 'Hace 30 minutos',
    routine: 'Propiocepción + retorno a carrera',
    status: 'Alta próxima',
    adherence: 95,
    phone: '+58 414 5550601',
    bloodType: 'O+',
    occupation: 'Corredora de Maratón',
    activityLevel: 'Muy Alto',
    heightCm: 168,
    weightKg: 57,
    affectedLimb: 'Tobillo derecho',
    targetRom: 'Dorsiflexión 20° con estabilidad dinámica',
    frequency: '4 veces por semana',
    referringDoctor: 'Dr. Roberto Silva',
    emergencyContact: { name: 'Luis Castillo', phone: '+58 414 5550602' },
    sessions: [
      { id: 's-ec1', fecha: new Date(Date.now() - 1800000).toISOString(), ejercicio_nombre: 'Apoyo monopodal en Bosu', duracion_segundos: 420, repeticiones: 20, calidad_ejecucion: 96, notas: 'Estabilidad sobresaliente. Lista para alta clínica.', rom_alcanzado: 22, adherencia: 98 },
    ],
    exercises: [
      { id: 'ex-ec1', ejercicio_nombre: 'Apoyo monopodal propioceptivo', ejercicio_id: 'monopodal-bosu', series: 3, repeticiones: 5, frecuencia_semana: 4, notas: 'Mantener 30s con ojos cerrados.', detailed_description: 'Equilibrio sobre una sola pierna manteniendo la rodilla con ligera flexión.', complexity: 'media', musculos: 'Peroneos, tibial anterior, gastrocnemios' },
    ],
  },
  {
    id: 'demo-6',
    name: 'Andrés Ruiz',
    email: 'andres.ruiz@demo.com',
    fmId: 'FM-1007',
    diagnosis: 'Cervicalgia mecánica por síndrome cruzado superior',
    patologia: 'Columna Cervical',
    progress: 71,
    sessionsCompleted: 12,
    sessionsTotal: 17,
    lastActive: 'Ayer',
    routine: 'Estiramientos cervicales + postural',
    status: 'Activo',
    adherence: 85,
    phone: '+58 416 5550701',
    bloodType: 'A+',
    occupation: 'Contador Público',
    activityLevel: 'Sedentario',
    heightCm: 176,
    weightKg: 75,
    affectedLimb: 'Columna cervical',
    targetRom: 'Rotación bilateral 70° libre de dolor',
    frequency: '3 veces por semana',
    referringDoctor: 'Dr. Roberto Silva',
    emergencyContact: { name: 'Sonia Ruiz', phone: '+58 416 5550702' },
    sessions: [
      { id: 's-ar1', fecha: new Date(Date.now() - 86400000).toISOString(), ejercicio_nombre: 'Chin-tucks (Retracción cervical)', duracion_segundos: 300, repeticiones: 20, calidad_ejecucion: 88, notas: 'Disminución notable de cefalea tensional.', rom_alcanzado: 68, adherencia: 85 },
    ],
    exercises: [
      { id: 'ex-ar1', ejercicio_nombre: 'Retracción cervical (Chin-tuck)', ejercicio_id: 'chin-tuck', series: 3, repeticiones: 12, frecuencia_semana: 3, notas: 'Empujar el mentón hacia atrás suavemente.', detailed_description: 'De pie con la espalda apoyada, retrae el mentón hacia el cuello sin flexionar la cabeza.', complexity: 'baja', musculos: 'Flexores profundos del cuello, escalenos' },
    ],
  },
];

export const PRIMARY_DEMO_PATIENT: UnifiedDemoPatient = UNIFIED_DEMO_PATIENTS[0];

export const DEMO_THERAPIST_PROFILE: Profile = {
  id: 'demo-fisio-001',
  email: 'fisio@demo.com',
  full_name: 'Dr. Roberto Silva',
  role: 'fisioterapeuta',
  is_active: true,
  especialidad: 'Traumatología y Ortopedia, Fisioterapia Deportiva',
  universidad: 'Universidad Central de Venezuela',
  anio_egreso: 2018,
  colegiado_id: 'FVF-8492',
  cedula: 'V-19842510',
  telefono: '+58 412 4081077',
  clinic_name: 'FisioMirror Clinical Center',
  created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
  onboarding_completed: true,
};

export const DEMO_PRIORITIES = [
  { text: 'Revisar: Javier Molina', subtitle: 'Capsulitis adhesiva — sin actividad en 4 días (riesgo de abandono)', priority: 'ALTA' },
  { text: 'Revisar: Carlos Domínguez', subtitle: 'Adherencia 68%, por debajo del objetivo clínico (80%)', priority: 'MEDIA' },
  { text: 'Revisar: Elena Castillo', subtitle: 'Alta próxima (88% progreso) — programar evaluación final', priority: 'MEDIA' },
  { text: 'Revisar: Carlos Mendoza', subtitle: 'Excelente evolución (84% progreso) — sesión completada hoy', priority: 'BAJA' },
  { text: 'Revisar: María Fernández', subtitle: 'Progreso 78% — adherencia alta (92%)', priority: 'BAJA' },
];

export const DEMO_KPIS = {
  activePatients: UNIFIED_DEMO_PATIENTS.length,
  sessionsToday: 5,
  weeklyAdherence: 86,
  pendingTokens: 3,
  isDemo: true,
};

export function getUnifiedPatientById(id: string): UnifiedDemoPatient | undefined {
  return UNIFIED_DEMO_PATIENTS.find(
    (p) => p.id === id || p.fmId.toLowerCase() === id.toLowerCase() || p.email.toLowerCase() === id.toLowerCase()
  ) || UNIFIED_DEMO_PATIENTS[0];
}
