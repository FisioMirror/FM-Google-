/**
 * FisioMirror - Central Validation Library
 * Zod schemas for all forms with strict clinical validation
 * Single source of truth for validation logic across the app
 */

import { z } from 'zod';

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export const ACTIVITY_LEVELS = [
  'Sedentario', 'Ligero', 'Moderado', 'Alto'
] as const;

export const AFFECTED_LIMBS = [
  'Superior Izquierda', 'Superior Derecha',
  'Inferior Izquierda', 'Inferior Derecha',
  'Columna', 'Ambas Superiores', 'Ambas Inferiores'
] as const;

export const RECOVERY_PHASES = [
  'Aguda', 'Subaguda', 'Remodelación', 'Funcional'
] as const;

export const ROLES = ['fisioterapeuta', 'paciente'] as const;

// ============================================================================
// REUSABLE VALIDATORS
// ============================================================================

/** Venezuelan ID: 6-9 digits, with optional V-, E-, J- prefix and hyphens */
export const cedulaSchema = z
  .string()
  .min(6, 'La cédula debe tener al menos 6 caracteres')
  .max(14, 'La cédula es demasiado larga')
  .refine(
    (val) => !val || /^(?:[VEJPvejp][- ]?)?\d{6,9}$/.test(val.trim()),
    'Formato de cédula inválido (ej: 12345678 o V-12345678)'
  )
  .transform((val) => val.trim());

/** Email with strict validation */
export const emailSchema = z
  .string()
  .min(1, 'El correo es obligatorio')
  .email('Formato de correo inválido')
  .max(254, 'El correo es demasiado largo')
  .toLowerCase()
  .trim();

/** Password: min 8 chars, uppercase, number, special char */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un símbolo');

/** Confirm password (validated in parent schema) */
export const confirmPasswordSchema = z.string().min(1, 'Confirma tu contraseña');

/** Full name: 2-100 chars, letters, spaces, accents, hyphens */
export const fullNameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre es demasiado largo')
  .regex(/^[\p{L}\s'-]+$/u, 'El nombre solo puede contener letras, espacios, guiones y apóstrofes')
  .trim();

/** Phone: Venezuelan format (optional, handles spaces, hyphens and parentheses) */
export const phoneSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => !val || /^(\+58|0)?[24]\d{9}$/.test(val.replace(/[\s\-()]/g, '')),
    'Formato de teléfono inválido (ej: 04121234567 o +58 412-1234567)'
  )
  .transform((val) => val?.trim() || null);

/** Date of birth: not future, not > 120 years, not "born yesterday" */
export const birthDateSchema = z
  .string()
  .optional()
  .nullable()
  .refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return false;
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    return actualAge >= 0 && actualAge <= 120;
  }, 'Fecha de nacimiento inválida (no futura, edad 0-120 años)')
  .transform((val) => val || null);

/** Height in cm: 50-250 */
export const heightSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 50 && val <= 250), 'Estatura debe estar entre 50 y 250 cm');

/** Weight in kg: 2-300 */
export const weightSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 2 && val <= 300), 'Peso debe estar entre 2 y 300 kg');

/** Pain level: 0-10 */
export const painLevelSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 0 && val <= 10), 'Nivel de dolor debe ser 0-10');

/** Repetitions per set: 1-100 (with warning > 50) */
export const repsSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 1 && val <= 100), 'Repeticiones deben ser 1-100');

/** Sets: 1-20 */
export const setsSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 1 && val <= 20), 'Series deben ser 1-20');

/** Duration seconds: 1-7200 (2 hours max) */
export const durationSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 1 && val <= 7200), 'Duración debe ser 1-7200 segundos');

/** ROM objective: 0-180 degrees */
export const romSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 0 && val <= 180), 'ROM debe ser 0-180 grados');

/** Frequency per week: 1-7 */
export const frequencySchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 1 && val <= 7), 'Frecuencia semanal 1-7');

/** Year of graduation: 1950 - current year */
export const graduationYearSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => {
    if (val === null || val === undefined) return true;
    const currentYear = new Date().getFullYear();
    return val >= 1950 && val <= currentYear;
  }, `Año de egreso debe estar entre 1950 y ${new Date().getFullYear()}`);

/** Blood type enum */
export const bloodTypeSchema = z
  .enum(BLOOD_TYPES)
  .nullable()
  .optional();

/** Activity level enum */
export const activityLevelSchema = z
  .enum(ACTIVITY_LEVELS)
  .nullable()
  .optional();

/** Affected limb enum */
export const affectedLimbSchema = z
  .enum(AFFECTED_LIMBS)
  .nullable()
  .optional();

/** Recovery phase enum */
export const recoveryPhaseSchema = z
  .enum(RECOVERY_PHASES)
  .nullable()
  .optional();

/** Role enum */
export const roleSchema = z.enum(ROLES);

/** Token: 4-10 alphanumeric */
export const tokenSchema = z
  .string()
  .min(4, 'El código debe tener al menos 4 caracteres')
  .max(10, 'El código es demasiado largo')
  .regex(/^[A-Z0-9]+$/i, 'El código solo puede contener letras y números')
  .toUpperCase()
  .trim();

/** Optional text field with max length */
export const optionalText = (maxLen: number, fieldName: string) =>
  z.string().max(maxLen, `${fieldName} no puede exceder ${maxLen} caracteres`).optional().nullable().transform((v) => v?.trim() || null);

/** Required text field */
export const requiredText = (minLen: number, maxLen: number, fieldName: string) =>
  z.string().min(minLen, `${fieldName} debe tener al menos ${minLen} caracteres`).max(maxLen, `${fieldName} no puede exceder ${maxLen} caracteres`).trim();

// ============================================================================
// FORM SCHEMAS
// ============================================================================

/** Patient Login Form */
export const patientLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
  turnstileToken: z.string().min(1, 'Completa la verificación de seguridad'),
});

/** Patient Register Form (with token) */
export const patientRegisterSchema = z.object({
  token: tokenSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  fullName: fullNameSchema.optional(),
  turnstileToken: z.string().min(1, 'Completa la verificación de seguridad'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/** Physiotherapist Login Form */
export const fisioLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
  turnstileToken: z.string().min(1, 'Completa la verificación de seguridad'),
});

/** Physiotherapist Register - Step 1 base shape without refinement */
const fisioRegisterStep1Base = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  cedula: cedulaSchema,
  telefono: phoneSchema,
  turnstileToken: z.string().min(1, 'Completa la verificación de seguridad'),
});

/** Physiotherapist Register - Step 1 (Basic) */
export const fisioRegisterStep1Schema = fisioRegisterStep1Base.refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/** Physiotherapist Register - Step 2 (Professional) */
export const fisioRegisterStep2Schema = z.object({
  universidad: optionalText(100, 'Universidad'),
  colegiadoId: optionalText(50, 'Número de colegiado'),
  anioEgreso: graduationYearSchema,
  especialidades: z.array(z.string().min(1)).min(1, 'Selecciona al menos una especialidad'),
  credencialFile: z.instanceof(File).nullable().optional(),
});

/** Complete Physiotherapist Register (combined) */
export const fisioRegisterSchema = fisioRegisterStep1Base
  .merge(fisioRegisterStep2Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/** Patient Profile Form (22 fields) - Supports both camelCase and snake_case */
export const patientProfileSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  return {
    ...val,
    fullName: val.fullName ?? val.full_name ?? '',
    email: val.email || 'paciente@fisiomirror.app',
    fechaNacimiento: val.fechaNacimiento ?? val.fecha_nacimiento ?? null,
    telefono: val.telefono ?? null,
    tipoSangre: val.tipoSangre ?? val.tipo_sangre ?? null,
    ocupacion: val.ocupacion ?? null,
    nivelActividad: val.nivelActividad ?? val.nivel_actividad ?? null,
    estaturaCm: val.estaturaCm !== undefined && val.estaturaCm !== '' ? Number(val.estaturaCm) : (val.estatura_cm !== undefined && val.estatura_cm !== '' ? Number(val.estatura_cm) : null),
    pesoKg: val.pesoKg !== undefined && val.pesoKg !== '' ? Number(val.pesoKg) : (val.peso_kg !== undefined && val.peso_kg !== '' ? Number(val.peso_kg) : null),
    esMenorEdad: val.esMenorEdad ?? val.es_menor_edad ?? false,
    diagnostico: val.diagnostico ?? null,
    patologia: val.patologia ?? null,
    diagnosticoSecundario: val.diagnosticoSecundario ?? val.diagnostico_secundario ?? null,
    medicamentosActuales: val.medicamentosActuales ?? val.medicamentos_actuales ?? null,
    alergias: val.alergias ?? null,
    enfermedadesCronicas: val.enfermedadesCronicas ?? val.enfermedades_cronicas ?? null,
    lesionesPrevias: val.lesionesPrevias ?? val.lesiones_previas ?? null,
    extremidadAfectada: val.extremidadAfectada ?? val.extremidad_afectada ?? null,
    romObjetivo: val.romObjetivo !== undefined && val.romObjetivo !== '' ? Number(val.romObjetivo) : (val.rom_objetivo !== undefined && val.rom_objetivo !== '' ? Number(val.rom_objetivo) : null),
    frecuenciaSesiones: val.frecuenciaSesiones !== undefined && val.frecuenciaSesiones !== '' ? Number(val.frecuenciaSesiones) : (val.frecuencia_sesiones !== undefined && val.frecuencia_sesiones !== '' ? Number(val.frecuencia_sesiones) : null),
    medicoRemitente: val.medicoRemitente ?? val.medico_remitente ?? null,
    contactoEmergenciaNombre: val.contactoEmergenciaNombre ?? val.contacto_emergencia_nombre ?? null,
    contactoEmergenciaTelefono: val.contactoEmergenciaTelefono ?? val.contacto_emergencia_telefono ?? null,
    tutorNombre: val.tutorNombre ?? val.tutor_nombre ?? null,
    tutorTelefono: val.tutorTelefono ?? val.tutor_telefono ?? null,
    tutorEmail: val.tutorEmail ?? val.tutor_email ?? null,
    consentimiento: val.consentimiento ?? true,
  };
}, z.object({
  // Personal
  fullName: fullNameSchema,
  email: emailSchema,
  fechaNacimiento: birthDateSchema,
  telefono: phoneSchema,
  tipoSangre: bloodTypeSchema,
  ocupacion: optionalText(100, 'Ocupación'),
  nivelActividad: activityLevelSchema,
  estaturaCm: heightSchema,
  pesoKg: weightSchema,
  esMenorEdad: z.boolean().optional().default(false),

  // Clinical
  diagnostico: optionalText(200, 'Diagnóstico principal'),
  patologia: optionalText(200, 'Patología'),
  diagnosticoSecundario: optionalText(200, 'Diagnóstico secundario'),
  medicamentosActuales: optionalText(500, 'Medicamentos'),
  alergias: optionalText(500, 'Alergias'),
  enfermedadesCronicas: optionalText(500, 'Enfermedades crónicas'),
  lesionesPrevias: optionalText(500, 'Lesiones previas'),
  extremidadAfectada: affectedLimbSchema,
  romObjetivo: romSchema,
  frecuenciaSesiones: frequencySchema,
  medicoRemitente: optionalText(100, 'Médico remitente'),

  // Emergency contact
  contactoEmergenciaNombre: optionalText(100, 'Nombre contacto emergencia'),
  contactoEmergenciaTelefono: phoneSchema,

  // Guardian (required if esMenorEdad)
  tutorNombre: optionalText(100, 'Nombre del tutor'),
  tutorTelefono: phoneSchema,
  tutorEmail: emailSchema.optional().nullable(),

  // Consent
  consentimiento: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  // If minor, require guardian data
  if (data.esMenorEdad) {
    if (!data.tutorNombre?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nombre del tutor es obligatorio para menores de edad',
        path: ['tutorNombre'],
      });
    }
    if (!data.tutorTelefono?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Teléfono del tutor es obligatorio para menores de edad',
        path: ['tutorTelefono'],
      });
    }
    if (!data.tutorEmail?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email del tutor es obligatorio para menores de edad',
        path: ['tutorEmail'],
      });
    }
  }
}));

/** Physiotherapist Profile Form - Supports both camelCase and snake_case */
export const fisioProfileSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  return {
    ...val,
    fullName: val.fullName ?? val.full_name ?? '',
    email: val.email || 'fisio@fisiomirror.app',
    cedula: val.cedula ?? null,
    universidad: val.universidad ?? null,
    anioEgreso: val.anioEgreso !== undefined && val.anioEgreso !== '' ? Number(val.anioEgreso) : (val.anio_egreso !== undefined && val.anio_egreso !== '' ? Number(val.anio_egreso) : null),
    colegiadoId: val.colegiadoId ?? val.colegiado_id ?? null,
    telefono: val.telefono ?? null,
    especialidad: val.especialidad ?? null,
    clinicName: val.clinicName ?? val.clinic_name ?? null,
  };
}, z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  cedula: cedulaSchema.optional().nullable(),
  universidad: optionalText(100, 'Universidad'),
  anioEgreso: graduationYearSchema,
  colegiadoId: optionalText(50, 'Número de colegiado'),
  telefono: phoneSchema,
  especialidad: optionalText(200, 'Especialidad'),
  clinicName: optionalText(100, 'Nombre de clínica'),
}));

/** Session Adjustments (Clinical) */
export const sessionAdjustmentsSchema = z.object({
  toleranciaGrados: z.number().min(0).max(45).optional().nullable(),
  repeticionesMax: z.number().min(1).max(30).optional().nullable(),
  foco: z.enum(['movilidad', 'fuerza', 'control', 'dolor']).optional().nullable(),
  notas: optionalText(500, 'Notas'),
  // Clinical extensions
  dolorEva: z.number().min(0).max(10).optional().nullable(),
  romActual: z.number().min(0).max(180).optional().nullable(),
  romObjetivo: z.number().min(0).max(180).optional().nullable(),
  progresion: z.number().min(0).max(100).optional().nullable(),
  frecuenciaSemanal: z.number().min(1).max(7).optional().nullable(),
  duracionMin: z.number().min(5).max(120).optional().nullable(),
  precauciones: optionalText(500, 'Precauciones'),
  proximaRevision: z.string().optional().nullable().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'La próxima revisión no puede ser en el pasado'),
}).superRefine((data, ctx) => {
  if (data.romActual !== null && data.romActual !== undefined && data.romObjetivo !== null && data.romObjetivo !== undefined && data.romObjetivo < data.romActual) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El ROM objetivo no puede ser menor al ROM actual',
      path: ['romObjetivo'],
    });
  }
});

/** Routine Creation */
export const routineSchema = z.object({
  nombre: requiredText(2, 100, 'Nombre de la rutina'),
  descripcion: optionalText(500, 'Descripción'),
  pacienteId: z.string().uuid('Paciente inválido'),
  ejercicios: z.array(z.object({
    nombre: z.string().min(1),
    descripcion: z.string().min(1),
    repeticiones: repsSchema,
    series: setsSchema,
    duracionSegundos: durationSchema,
    anguloObjetivo: romSchema,
    articulacion: z.enum(['hombro', 'codo', 'rodilla', 'cadera', 'tobillo']),
    lado: z.enum(['izquierdo', 'derecho', 'ambos']),
    complejidad: z.enum(['baja', 'media', 'alta']).optional(),
  })).min(1, 'La rutina debe tener al menos un ejercicio'),
  fase: recoveryPhaseSchema,
  fechaInicio: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha de inicio inválida'),
  fechaFin: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, 'Fecha de fin inválida'),
}).superRefine((data, ctx) => {
  if (data.fechaFin && new Date(data.fechaFin) < new Date(data.fechaInicio)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de fin no puede ser anterior a la de inicio',
      path: ['fechaFin'],
    });
  }
});

/** Completed Session */
export const completedSessionSchema = z.object({
  pacienteId: z.string().uuid('Paciente inválido'),
  rutinaId: z.string().uuid().nullable().optional(),
  ejercicioNombre: z.string().min(1, 'Nombre del ejercicio requerido'),
  duracionSegundos: durationSchema,
  repeticiones: repsSchema,
  calidadEjecucion: z.number().min(0).max(100).nullable().optional(),
  dolorReportado: painLevelSchema,
  notas: optionalText(500, 'Notas'),
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
});

/** Post Session Report */
export const postSessionReportSchema = z.object({
  pacienteId: z.string().uuid('Paciente inválido'),
  sesionId: z.string().uuid().nullable().optional(),
  nivelDolorAntes: painLevelSchema,
  nivelDolorDespues: painLevelSchema,
  fatigaNivel: z.number().min(0).max(10).nullable().optional(),
  comentario: optionalText(500, 'Comentario'),
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
});

/** Pain Report */
export const painReportSchema = z.object({
  pacienteId: z.string().uuid('Paciente inválido'),
  nivel: painLevelSchema,
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  notas: optionalText(500, 'Notas').optional(),
});

/** Exercise Definition */
export const exerciseSchema = z.object({
  nombre: requiredText(2, 100, 'Nombre del ejercicio'),
  descripcion: requiredText(10, 1000, 'Descripción'),
  repeticiones: repsSchema,
  series: setsSchema,
  duracionSegundos: durationSchema,
  anguloObjetivo: romSchema,
  articulacion: z.enum(['hombro', 'codo', 'rodilla', 'cadera', 'tobillo']),
  lado: z.enum(['izquierdo', 'derecho', 'ambos']),
  complejidad: z.enum(['baja', 'media', 'alta']).optional(),
});

/** Password Reset */
export const passwordResetSchema = z.object({
  email: emailSchema,
  turnstileToken: z.string().min(1, 'Completa la verificación de seguridad'),
});

/** Password Update */
export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Confirma la nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PatientLoginInput = z.infer<typeof patientLoginSchema>;
export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
export type FisioLoginInput = z.infer<typeof fisioLoginSchema>;
export type FisioRegisterStep1Input = z.infer<typeof fisioRegisterStep1Schema>;
export type FisioRegisterStep2Input = z.infer<typeof fisioRegisterStep2Schema>;
export type FisioRegisterInput = z.infer<typeof fisioRegisterSchema>;
export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
export type FisioProfileInput = z.infer<typeof fisioProfileSchema>;
export type SessionAdjustmentsInput = z.infer<typeof sessionAdjustmentsSchema>;
export type RoutineInput = z.infer<typeof routineSchema>;
export type CompletedSessionInput = z.infer<typeof completedSessionSchema>;
export type PostSessionReportInput = z.infer<typeof postSessionReportSchema>;
export type PainReportInput = z.infer<typeof painReportSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;

// ============================================================================
// HELPER: Format Zod Errors for UI
// ============================================================================

export function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!formatted[path] || issue.code === 'custom') {
      formatted[path] = issue.message;
    }
    // Also provide snake_case version of camelCase keys and vice-versa
    const snakePath = path.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (!formatted[snakePath]) {
      formatted[snakePath] = issue.message;
    }
    const camelPath = path.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    if (!formatted[camelPath]) {
      formatted[camelPath] = issue.message;
    }
  }
  return formatted;
}

export function getFieldError(errors: Record<string, string>, fieldName: string): string | undefined {
  return errors[fieldName];
}

// ============================================================================
// PLACEHOLDER TEXTS (for UX consistency)
// ============================================================================

export const PLACEHOLDERS = {
  email: 'Ej: juan.perez@email.com',
  password: 'Mín. 8 caracteres, mayúscula, número, símbolo',
  confirmPassword: 'Repite tu contraseña',
  fullName: 'Ej: Juan Pérez García',
  cedula: 'Ej: 12345678 (solo números, 6-8 dígitos)',
  telefono: 'Ej: 04121234567',
  universidad: 'Ej: Universidad Central de Venezuela',
  colegiadoId: 'Ej: 12345-FT',
  anioEgreso: 'Ej: 2015',
  especialidad: 'Ej: Fisioterapia Deportiva',
  fechaNacimiento: 'DD/MM/AAAA',
  tipoSangre: 'Selecciona',
  ocupacion: 'Ej: Ingeniero, Estudiante, Ama de casa...',
  nivelActividad: 'Selecciona',
  estaturaCm: 'Ej: 175',
  pesoKg: 'Ej: 72.5',
  diagnostico: 'Ej: Tendinopatía del manguito rotador',
  patologia: 'Ej: Rotura parcial supraespinoso',
  diagnosticoSecundario: 'Ej: Bursitis subacromial',
  medicamentosActuales: 'Ej: Ibuprofeno 600mg c/8h, Omeprazol 20mg',
  alergias: 'Ej: Penicilina, Ibuprofeno',
  enfermedadesCronicas: 'Ej: Hipertensión, Diabetes tipo 2',
  lesionesPrevias: 'Ej: Fractura de clavícula 2018, Esguince tobillo 2020',
  extremidadAfectada: 'Selecciona',
  romObjetivo: 'Ej: 120',
  frecuenciaSesiones: 'Ej: 3',
  medicoRemitente: 'Ej: Dr. Carlos Rodríguez - Traumatología',
  contactoEmergenciaNombre: 'Ej: María Pérez',
  contactoEmergenciaTelefono: 'Ej: 04241234567',
  tutorNombre: 'Ej: Carlos Mendoza (padre)',
  tutorTelefono: 'Ej: 04141234567',
  tutorEmail: 'Ej: carlos.mendoza@email.com',
  clinicName: 'Ej: Clínica FisioAvanzada',
  toleranciaGrados: 'Ej: 10',
  repeticionesMax: 'Ej: 15',
  foco: 'Selecciona',
  dolorEva: 'Ej: 3',
  romActual: 'Ej: 90',
  progresion: 'Ej: 60',
  frecuenciaSemanal: 'Ej: 3',
  duracionMin: 'Ej: 45',
  precauciones: 'Ej: Evitar flexión > 90°, no carga axial',
  proximaRevision: 'YYYY-MM-DD',
  nombreRutina: 'Ej: Rehabilitación Hombro Fase 1',
  descripcionRutina: 'Ej: Rutina para fase aguda de tendinopatía...',
  ejercicioNombre: 'Ej: Elevación frontal con banda',
  ejercicioDescripcion: 'Ej: De pie, banda bajo el pie, elevar brazo...',
  ejercicioRepeticiones: 'Ej: 12',
  ejercicioSeries: 'Ej: 3',
  ejercicioDuracion: 'Ej: 45',
  ejercicioAngulo: 'Ej: 90',
  ejercicioArticulacion: 'Selecciona',
  ejercicioLado: 'Selecciona',
  ejercicioComplejidad: 'Selecciona',
  sesionDuracion: 'Ej: 1800',
  sesionRepeticiones: 'Ej: 36',
  sesionCalidad: 'Ej: 85',
  sesionDolor: 'Ej: 2',
  sesionNotas: 'Ej: Paciente toleró bien, sin dolor agudo',
  reporteDolorAntes: 'Ej: 5',
  reporteDolorDespues: 'Ej: 2',
  reporteFatiga: 'Ej: 3',
  reporteComentario: 'Ej: Buena tolerancia, progresar carga',
  dolorNivel: 'Ej: 4',
  dolorNotas: 'Ej: Dolor en abducción > 90°',
} as const;

// ============================================================================
// SELECT OPTIONS (for UX - replace free text inputs)
// ============================================================================

export const SELECT_OPTIONS = {
  bloodType: BLOOD_TYPES.map((v) => ({ value: v, label: v })),
  activityLevel: ACTIVITY_LEVELS.map((v) => ({ value: v, label: v })),
  affectedLimb: AFFECTED_LIMBS.map((v) => ({ value: v, label: v })),
  recoveryPhase: RECOVERY_PHASES.map((v) => ({ value: v, label: v })),
  focus: [
    { value: 'movilidad', label: 'Movilidad' },
    { value: 'fuerza', label: 'Fuerza' },
    { value: 'control', label: 'Control motor' },
    { value: 'dolor', label: 'Dolor' },
  ],
  joint: [
    { value: 'hombro', label: 'Hombro' },
    { value: 'codo', label: 'Codo' },
    { value: 'rodilla', label: 'Rodilla' },
    { value: 'cadera', label: 'Cadera' },
    { value: 'tobillo', label: 'Tobillo' },
  ],
  side: [
    { value: 'izquierdo', label: 'Izquierdo' },
    { value: 'derecho', label: 'Derecho' },
    { value: 'ambos', label: 'Ambos' },
  ],
  complexity: [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
  ],
  role: [
    { value: 'fisioterapeuta', label: 'Fisioterapeuta' },
    { value: 'paciente', label: 'Paciente' },
  ],
} as const;