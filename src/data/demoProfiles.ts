import type { Profile } from '../types';

export const DEMO_PATIENT_PROFILE: Profile = {
  id: '5093ac77-e391-49ba-994a-8c75572c8313',
  email: 'paciente@demo.com',
  full_name: 'Carlos Mendoza',
  role: 'paciente',
  is_active: true,
  especialidad: null,
  universidad: null,
  anio_egreso: null,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
  patologia: 'Rehabilitación Manguito Rotador',
  diagnostico: 'Tendinopatía del supraespinoso derecho con limitación funcional moderada',
  extremidad_afectada: 'Hombro derecho',
  rom_objetivo: '160° de flexión y 75° de rotación externa',
  frecuencia_sesiones: '4 veces por semana',
  onboarding_completed: true,
  telefono: '+58 412 5550192',
  tipo_sangre: 'O+',
  ocupacion: 'Ingeniero de Software',
  nivel_actividad: 'Moderado',
  estatura_cm: 178,
  peso_kg: 74,
  contacto_emergencia_nombre: 'María Mendoza',
  contacto_emergencia_telefono: '+58 414 5550193',
  clinic_name: 'Centro Clínico FisioMirror',
};

export const DEMO_FISIO_PROFILE: Profile = {
  id: 'fdf7cc26-59e3-413b-9e3a-43e54976a8e0',
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

export const DEMO_TOKENS = ['123456', '000000', 'demo', 'DEMO', 'demo123', 'PACIENTE'];
