import { useCallback, useMemo } from 'react';
import { z } from 'zod';
import {
  patientLoginSchema,
  patientRegisterSchema,
  fisioLoginSchema,
  fisioRegisterSchema,
  formatZodError,
  type PatientLoginInput,
  type PatientRegisterInput,
  type FisioLoginInput,
  type FisioRegisterInput,
} from '../lib/validation';
import { useTranslation } from 'react-i18next';

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: Record<string, string>;
}

export function useAuthValidation() {
  const { t } = useTranslation();

  const validatePatientLogin = useCallback(
    (data: PatientLoginInput): ValidationResult<PatientLoginInput> => {
      const result = patientLoginSchema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data, errors: {} };
      }
      return { success: false, errors: formatZodError(result.error) };
    },
    []
  );

  const validatePatientRegister = useCallback(
    (data: PatientRegisterInput): ValidationResult<PatientRegisterInput> => {
      const result = patientRegisterSchema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data, errors: {} };
      }
      return { success: false, errors: formatZodError(result.error) };
    },
    []
  );

  const validateFisioLogin = useCallback(
    (data: FisioLoginInput): ValidationResult<FisioLoginInput> => {
      const result = fisioLoginSchema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data, errors: {} };
      }
      return { success: false, errors: formatZodError(result.error) };
    },
    []
  );

  const validateFisioRegister = useCallback(
    (data: FisioRegisterInput): ValidationResult<FisioRegisterInput> => {
      const result = fisioRegisterSchema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data, errors: {} };
      }
      return { success: false, errors: formatZodError(result.error) };
    },
    []
  );

  const validateFisioStep1 = useCallback(
    (data: Partial<FisioRegisterInput>): ValidationResult<Partial<FisioRegisterInput>> => {
      const step1Schema = fisioRegisterSchema.pick({
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
        cedula: true,
        telefono: true,
      });
      const result = step1Schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data, errors: {} };
      }
      return { success: false, errors: formatZodError(result.error) };
    },
    []
  );

  const getFieldError = useCallback(
    (errors: Record<string, string>, fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    []
  );

  return {
    validatePatientLogin,
    validatePatientRegister,
    validateFisioLogin,
    validateFisioRegister,
    validateFisioStep1,
    getFieldError,
  };
}

// Helper to create form data objects from state
export function createPatientLoginData(email: string, password: string, turnstileToken: string): PatientLoginInput {
  return { email, password, turnstileToken };
}

export function createPatientRegisterData(
  token: string,
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string,
  turnstileToken: string
): PatientRegisterInput {
  return { token, email, password, confirmPassword, fullName, turnstileToken };
}

export function createFisioLoginData(email: string, password: string, turnstileToken: string): FisioLoginInput {
  return { email, password, turnstileToken };
}

export function createFisioRegisterData(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  cedula: string,
  telefono: string,
  universidad: string,
  colegiadoId: string,
  anioEgreso: string,
  especialidades: string[],
  credencialFile: File | null,
  turnstileToken: string
): FisioRegisterInput {
  return {
    fullName,
    email,
    password,
    confirmPassword,
    cedula,
    telefono,
    universidad,
    colegiadoId,
    anioEgreso,
    especialidades,
    credencialFile,
    turnstileToken,
  };
}