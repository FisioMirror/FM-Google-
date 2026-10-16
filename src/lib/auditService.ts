import { supabase } from './supabase';

export type AuditSeverity = 'info' | 'warn' | 'error' | 'critical';

export interface AuditPayload {
  action: string;
  entityType: string;
  entityId?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
}

/**
 * Registra un evento en la bitácora de auditoría forense de PostgreSQL/Supabase.
 * Diseñado con fail-soft: Si la red o Supabase no están disponibles, registra en consola
 * y no interrumpe el flujo crítico de la aplicación.
 */
export async function logAuditEvent(payload: AuditPayload): Promise<string | null> {
  const {
    action,
    entityType,
    entityId = null,
    actorId = null,
    actorEmail = null,
    actorRole = 'anonimo',
    metadata = {},
    severity = 'info',
  } = payload;

  try {
    const { data, error } = await supabase.rpc('log_audit_event', {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_actor_id: actorId,
      p_actor_email: actorEmail,
      p_actor_role: actorRole,
      p_metadata: {
        ...metadata,
        client_timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      },
      p_severity: severity,
    });

    if (error) {
      console.warn('[AuditLogs] Error registrando auditoría en Supabase:', error.message);
      return null;
    }

    return (data as string) || null;
  } catch (err: any) {
    console.warn('[AuditLogs] Fallo en servicio de auditoría:', err?.message || err);
    return null;
  }
}

/**
 * Evento especializado: Autenticación de usuario o validación de tokens
 */
export async function logAuthEvent(
  action: 'AUTH_LOGIN_SUCCESS' | 'AUTH_LOGIN_FAILED' | 'AUTH_LOGOUT' | 'AUTH_TOKEN_USED',
  details: {
    email?: string;
    userId?: string;
    role?: string;
    success: boolean;
    reason?: string;
  }
): Promise<void> {
  const severity: AuditSeverity = details.success ? 'info' : 'warn';
  await logAuditEvent({
    action,
    entityType: 'profiles',
    entityId: details.userId || null,
    actorId: details.userId || null,
    actorEmail: details.email || null,
    actorRole: details.role || (details.success ? 'usuario' : 'anonimo'),
    severity,
    metadata: {
      success: details.success,
      reason: details.reason || null,
    },
  });
}

/**
 * Evento especializado: Acceso o visualización de expediente clínico de paciente (Cumplimiento HIPAA / Privacidad)
 */
export async function logPatientRecordAccess(
  therapistId: string | undefined,
  therapistEmail: string | undefined,
  patientId: string,
  patientName?: string
): Promise<void> {
  await logAuditEvent({
    action: 'CLINICAL_RECORD_ACCESSED',
    entityType: 'profiles',
    entityId: patientId,
    actorId: therapistId || null,
    actorEmail: therapistEmail || null,
    actorRole: 'fisioterapeuta',
    severity: 'info',
    metadata: {
      patient_id: patientId,
      patient_name: patientName || 'No especificado',
      action_type: 'READ_ONLY_ACCESS',
    },
  });
}

/**
 * Evento especializado: Exportación o descarga de informe clínico PDF
 */
export async function logReportExport(
  actorId: string | undefined,
  actorEmail: string | undefined,
  patientId: string,
  reportType = 'PDF_EVOLUCION_CLINICA'
): Promise<void> {
  await logAuditEvent({
    action: 'CLINICAL_REPORT_EXPORTED',
    entityType: 'documentos_clinicos',
    entityId: patientId,
    actorId: actorId || null,
    actorEmail: actorEmail || null,
    actorRole: 'fisioterapeuta',
    severity: 'info',
    metadata: {
      patient_id: patientId,
      report_format: 'PDF',
      report_type: reportType,
    },
  });
}
