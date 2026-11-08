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

/** Venezuelan ID: 6-8 digits, with optional V-, E-, J- prefix and hyphens */
export const cedulaSchema = z
  .string()
  .min(1, 'La cédula de identidad es requerida')
  .max(14, 'La cédula no puede tener más de 14 caracteres')
  .refine(
    (val) => {
      if (!val) return false;
      const clean = val.replace(/^[VEJPvejp][- ]?/, '').trim();
      return /^\d{6,8}$/.test(clean);
    },
    'La cédula debe contener entre 6 y 8 dígitos numéricos, sin letras ni símbolos (ej: 12345678 o V-12345678)'
  )
  .transform((val) => val.trim());

/** Email with strict validation */
export const emailSchema = z
  .string()
  .min(1, 'El correo electrónico es obligatorio')
  .email('Introduce un formato de correo electrónico válido (ej: nombre@ejemplo.com)')
  .max(254, 'El correo es demasiado largo')
  .toLowerCase()
  .trim();

/** Password: min 8 chars, uppercase, number, special char */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial o símbolo');

/** Confirm password (validated in parent schema) */
export const confirmPasswordSchema = z.string().min(1, 'Confirma tu contraseña');

/** Full name: 2-100 chars, letters, spaces, accents, hyphens */
export const fullNameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .regex(/^[\p{L}\s'.-]+$/u, 'El nombre solo puede contener letras, espacios, puntos, guiones y apóstrofes')
  .trim();

/** Strict Phone Validation: Venezuelan mobile/landlines and ITU E.164 international */
export const phoneSchema = z
  .string()
  .min(1, 'El número telefónico es obligatorio')
  .max(20, 'El teléfono no puede exceder 20 caracteres')
  .transform((val) => val.trim())
  .refine(
    (val) => {
      if (!val) return false;
      const clean = val.replace(/[\s\-().+]/g, '');
      if (!/^\d+$/.test(clean)) return false;
      if (clean.length < 10 || clean.length > 15) return false;
      // Reject dummy repetitive numbers (e.g., 0000000000, 1111111111)
      if (/^(\d)\1{7,}$/.test(clean)) return false;
      // Venezuelan local format: must be 11 digits and start with valid operator/area
      if (clean.startsWith('0')) {
        return clean.length === 11 && /^(0412|0414|0424|0416|0426|02\d{2})/.test(clean);
      }
      // Venezuelan international format: starts with 58 and is 12 digits total
      if (clean.startsWith('58')) {
        return clean.length === 12 && /^58(412|414|424|416|426|2\d{2})/.test(clean);
      }
      // Otherwise valid international standard number
      return true;
    },
    'Ingresa un número telefónico válido (ej: 0412-1234567 o +58 412 1234567)'
  );

/** Optional Phone Validation */
export const optionalPhoneSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => val?.trim() || null)
  .refine(
    (val) => {
      if (!val) return true;
      const clean = val.replace(/[\s\-().+]/g, '');
      if (!/^\d+$/.test(clean)) return false;
      if (clean.length < 10 || clean.length > 15) return false;
      if (/^(\d)\1{7,}$/.test(clean)) return false;
      if (clean.startsWith('0')) {
        return clean.length === 11 && /^(0412|0414|0424|0416|0426|02\d{2})/.test(clean);
      }
      if (clean.startsWith('58')) {
        return clean.length === 12 && /^58(412|414|424|416|426|2\d{2})/.test(clean);
      }
      return true;
    },
    'Ingresa un número telefónico válido (ej: 0412-1234567 o +58 412 1234567)'
  );

/** Date of birth: not future, not > 120 years */
export const birthDateSchema = z
  .string()
  .optional()
  .nullable()
  .refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (isNaN(date.getTime())) return false;
    if (date > today) return false;
    const age = today.getFullYear() - date.getFullYear();
    return age >= 0 && age <= 120;
  }, 'La fecha de nacimiento no puede ser futura ni mayor a 120 años')
  .transform((val) => val || null);

/** Height in cm: 40-250 */
export const heightSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 40 && val <= 250), 'La estatura debe estar entre 40 y 250 cm');

/** Weight in kg: 2-300 */
export const weightSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 2 && val <= 300), 'El peso debe estar entre 2 y 300 kg');

/** Pain level: 0-10 */
export const painLevelSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 0 && val <= 10), 'El nivel de dolor debe ser entre 0 y 10 (Escala EVA)');

/** Repetitions per set: 1-30 (safe clinical rehabilitation limit) */
export const repsSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 1 && val <= 30), 'Las repeticiones deben ser entre 1 y 30 por serie para seguridad articular');

/** Sets: 1-6 (safe clinical limit to prevent acute muscle overload) */
export const setsSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 1 && val <= 6), 'Las series deben ser entre 1 y 6 por ejercicio');

/** Duration seconds: 1-7200 (2 hours max) */
export const durationSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 1 && val <= 7200), 'La duración debe ser entre 1 y 7200 segundos');

/** ROM objective: 0-180 degrees */
export const romSchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 0 && val <= 180), 'El rango articular ROM debe ser entre 0° y 180°');

/** Frequency per week: 1-7 days */
export const frequencySchema = z
  .number()
  .nullable()
  .optional()
  .refine((val) => val === null || val === undefined || (val >= 1 && val <= 7), 'La frecuencia semanal debe ser entre 1 y 7 días');

/** Year of graduation: 1950 - current year */
export const graduationYearSchema = z
  .union([
    z.number(),
    z.string().transform((val) => (val === 'anterior' ? 2014 : parseInt(val, 10))),
  ])
  .nullable()
  .optional()
  .refine((val) => {
    if (val === null || val === undefined || isNaN(val as number)) return true;
    const currentYear = new Date().getFullYear();
    return (val as number) >= 1950 && (val as number) <= currentYear;
  }, `El año de egreso debe estar entre 1950 y ${new Date().getFullYear()}`);

/** Blood type enum with friendly Spanish error */
export const bloodTypeSchema = z.preprocess(
  (v) => (v === '' ? null : v),
  z.enum(BLOOD_TYPES, {
    errorMap: () => ({ message: 'Selecciona un grupo sanguíneo válido (ej: O+, A+, B+)' }),
  }).nullable().optional()
);

/** Activity level enum with friendly Spanish error */
export const activityLevelSchema = z.preprocess(
  (v) => (v === '' ? null : v),
  z.enum(ACTIVITY_LEVELS, {
    errorMap: () => ({ message: 'Selecciona un nivel de actividad física válido' }),
  }).nullable().optional()
);

/** Affected limb enum - friendly message for clinical users */
export const affectedLimbSchema = z.preprocess(
  (v) => (v === '' ? null : v),
  z.enum(AFFECTED_LIMBS, {
    errorMap: () => ({ message: 'Todavía no se ha seleccionado una extremidad o articulación afectada' }),
  }).nullable().optional()
);

/** Recovery phase enum with friendly error */
export const recoveryPhaseSchema = z.preprocess(
  (v) => (v === '' ? null : v),
  z.enum(RECOVERY_PHASES, {
    errorMap: () => ({ message: 'Selecciona una fase de recuperación válida' }),
  }).nullable().optional()
);

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

/** Physiotherapist Register - Step 1 base shape (before Turnstile & credential) */
export const fisioRegisterStep1Base = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  cedula: cedulaSchema,
  telefono: phoneSchema,
  turnstileToken: z.string().optional().nullable(),
});

/** Physiotherapist Register - Step 1 with password match refinement */
export const fisioRegisterStep1Schema = fisioRegisterStep1Base.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }
);

/** Physiotherapist Register - Step 2 (Professional & Credential) */
export const fisioRegisterStep2Schema = z.object({
  universidad: optionalText(100, 'Universidad'),
  colegiadoId: optionalText(50, 'Número de colegiado'),
  anioEgreso: graduationYearSchema,
  especialidades: z.array(z.string().min(1)).min(1, 'Selecciona al menos una especialidad'),
  credencialFile: z.instanceof(File).nullable().optional(),
});

/** Complete Physiotherapist Register (combined with Turnstile required at final submit) */
export const fisioRegisterSchema = fisioRegisterStep1Base
  .extend({
    turnstileToken: z.string().min(1, 'Completa la verificación de seguridad'),
  })
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
    fullName: val.fullName ?? val.full_name ?? val.nombre_completo ?? '',
    documentoIdentidad: val.documentoIdentidad ?? val.documento_identidad ?? null,
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
  telefono: optionalPhoneSchema,
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
  contactoEmergenciaTelefono: optionalPhoneSchema,

  // Guardian (required if esMenorEdad)
  tutorNombre: optionalText(100, 'Nombre del tutor'),
  tutorTelefono: optionalPhoneSchema,
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
}).superRefine((data, ctx) => {
  // Clinical audit: High complexity exercises should have appropriate ROM targets
  if (data.complejidad === 'alta' && data.anguloObjetivo !== null && data.anguloObjetivo !== undefined && data.anguloObjetivo < 90) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Ejercicios de alta complejidad suelen requerir ROM objetivo ≥ 90°',
      path: ['anguloObjetivo'],
    });
  }
});

/** Clinical Audit: Recovery Phase vs ROM Validation */
export const recoveryPhaseRomSchema = z.object({
  fase: recoveryPhaseSchema,
  romActual: romSchema,
  romObjetivo: romSchema,
  dolorReportado: painLevelSchema,
}).superRefine((data, ctx) => {
  if (!data.fase || data.romActual === null || data.romActual === undefined || data.romObjetivo === null || data.romObjetivo === undefined) return;

  // Clinical audit: Phase vs ROM consistency
  const phaseRomRanges: Record<string, { min: number; max: number }> = {
    Aguda: { min: 0, max: 45 },
    Subaguda: { min: 30, max: 90 },
    Remodelación: { min: 60, max: 135 },
    Funcional: { min: 90, max: 180 },
  };

  const range = phaseRomRanges[data.fase];
  if (range) {
    if (data.romActual < range.min || data.romActual > range.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `ROM actual (${data.romActual}°) fuera del rango típico para fase ${data.fase} (${range.min}-${range.max}°)`,
        path: ['romActual'],
      });
    }
    if (data.romObjetivo < range.min || data.romObjetivo > range.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `ROM objetivo (${data.romObjetivo}°) fuera del rango típico para fase ${data.fase} (${range.min}-${range.max}°)`,
        path: ['romObjetivo'],
      });
    }
  }

  // Clinical audit: Pain level vs Phase consistency
  if (data.dolorReportado !== null && data.dolorReportado !== undefined) {
    if (data.fase === 'Aguda' && data.dolorReportado < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fase aguda típicamente presenta dolor ≥ 4/10',
        path: ['dolorReportado'],
      });
    }
    if (data.fase === 'Funcional' && data.dolorReportado > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fase funcional típicamente presenta dolor ≤ 3/10',
        path: ['dolorReportado'],
      });
    }
  }
});

/** Clinical Audit: Session Adjustments Validation */
export const sessionAdjustmentsClinicalSchema = z.object({
  toleranciaGrados: z.number().min(0).max(45).optional().nullable(),
  repeticionesMax: z.number().min(1).max(30).optional().nullable(),
  foco: z.enum(['movilidad', 'fuerza', 'control', 'dolor']).optional().nullable(),
  notas: optionalText(500, 'Notas'),
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
  // Clinical audit: ROM objetivo vs ROM actual
  if (data.romActual !== null && data.romActual !== undefined && data.romObjetivo !== null && data.romObjetivo !== undefined && data.romObjetivo < data.romActual) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El ROM objetivo no puede ser menor al ROM actual',
      path: ['romObjetivo'],
    });
  }

  // Clinical audit: Progression vs ROM improvement
  if (data.progresion !== null && data.progresion !== undefined && data.romActual !== null && data.romActual !== undefined && data.romObjetivo !== null && data.romObjetivo !== undefined) {
    const romImprovement = data.romObjetivo - data.romActual;
    if (romImprovement > 0 && data.progresion < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Progresión baja (<20%) con mejora de ROM esperada. Revisar coherencia.',
        path: ['progresion'],
      });
    }
    if (romImprovement <= 0 && data.progresion > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Progresión alta (>50%) sin mejora de ROM. Revisar coherencia.',
        path: ['progresion'],
      });
    }
  }

  // Clinical audit: Pain vs Focus consistency
  if (data.foco === 'dolor' && (data.dolorEva === null || data.dolorEva === undefined || data.dolorEva < 4)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Foco en dolor requiere EVA ≥ 4 para justificar intervención',
      path: ['dolorEva'],
    });
  }

  // Clinical audit: Frequency vs Duration consistency
  if (data.frecuenciaSemanal !== null && data.frecuenciaSemanal !== undefined && data.duracionMin !== null && data.duracionMin !== undefined) {
    const weeklyMinutes = data.frecuenciaSemanal * data.duracionMin;
    if (weeklyMinutes > 300) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Carga semanal alta (${weeklyMinutes} min). Considerar reducir frecuencia o duración.`,
        path: ['frecuenciaSemanal'],
      });
    }
  }
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
    let msg = issue.message;

    // Humanize technical or generic Zod validation messages
    if (msg.includes('Expected') || issue.code === 'invalid_enum_value') {
      if (path.includes('extremidad') || path.includes('affectedLimb') || path.includes('articulacion')) {
        msg = 'Todavía no se ha elegido una extremidad o articulación válida';
      } else if (path.includes('sangre') || path.includes('bloodType') || path.includes('tipoSangre')) {
        msg = 'Selecciona un grupo sanguíneo válido (ej: O+, A+, B+)';
      } else if (path.includes('actividad') || path.includes('activityLevel') || path.includes('nivelActividad')) {
        msg = 'Selecciona un nivel de actividad física válido';
      } else if (path.includes('fase') || path.includes('recoveryPhase')) {
        msg = 'Selecciona una fase de recuperación válida';
      } else {
        msg = 'Por favor selecciona una opción válida de la lista';
      }
    } else if (issue.code === 'invalid_type') {
      if (msg.includes('number')) {
        msg = 'Debes introducir un valor numérico válido';
      } else if (msg.includes('string')) {
        msg = 'Este campo no puede quedar en blanco';
      }
    }

    if (!formatted[path] || issue.code === 'custom') {
      formatted[path] = msg;
    }
    // Also provide snake_case version of camelCase keys and vice-versa
    const snakePath = path.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (!formatted[snakePath]) {
      formatted[snakePath] = msg;
    }
    const camelPath = path.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    if (!formatted[camelPath]) {
      formatted[camelPath] = msg;
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