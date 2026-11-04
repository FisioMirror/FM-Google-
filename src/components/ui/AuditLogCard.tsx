import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, RefreshCw, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from './Skeleton';

interface AuditRow {
  id: string;
  created_at: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  severity?: string | null;
  description?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
}

const ENTITY_LABEL: Record<string, string> = {
  profiles: 'perfil',
  sesiones_completadas: 'sesión completada',
  pain_reports: 'reporte de dolor',
  session_adjustments: 'ajuste de sesión',
  rutinas: 'rutina',
};

const ACTION_LABEL: Record<string, string> = {
  INSERT: 'creó',
  UPDATE: 'actualizó',
  DELETE: 'eliminó',
};

function buildFallback(row: AuditRow): string {
  const actor = row.actor_email || 'sistema';
  const values = row.new_values || row.old_values || {};
  const name =
    (values as Record<string, unknown>).full_name ||
    (values as Record<string, unknown>).ejercicio_nombre ||
    (values as Record<string, unknown>).nombre;

  // Acciones de aplicación (AUTH_LOGIN_SUCCESS, EXPORT_REPORT, ...): se muestran tal cual.
  if (!ACTION_LABEL[row.action]) {
    const readable = row.action.replace(/_/g, ' ').toLowerCase();
    return name ? `${actor}: ${readable} («${String(name)}»)` : `${actor}: ${readable}`;
  }

  const entity = ENTITY_LABEL[row.entity_type] || row.entity_type;
  const action = ACTION_LABEL[row.action];
  return name
    ? `${actor} ${action} ${entity} «${String(name)}»`
    : `${actor} ${action} ${entity}`;
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AuditLogCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: err } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);
      if (err) throw err;
      setRows((data as AuditRow[]) || []);
    } catch {
      setError(true);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className={className}>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <History size={18} className="text-teal-600 dark:text-teal-400" />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {t('auditLog.title', 'Bitácora de actividad')}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {t('auditLog.subtitle', 'Quién hizo qué y cuándo, en lenguaje claro')}
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label={t('auditLog.refresh', 'Actualizar bitácora')}
            title={t('auditLog.refresh', 'Actualizar bitácora')}
            className="ml-auto p-2 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="p-4 space-y-3" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton variant="text" width="82%" height={12} />
                <Skeleton variant="text" width="38%" height={9} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
            {t('auditLog.error', 'No se pudo leer la bitácora en este momento.')}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5 text-center">
            <ShieldCheck size={26} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('auditLog.empty', 'Todavía no hay acciones registradas.')}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <li key={row.id} className="px-4 py-2.5 flex items-start gap-2.5">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    row.severity === 'critical' || row.severity === 'error'
                      ? 'bg-red-500'
                      : row.severity === 'warn'
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 break-words">
                    {row.description || buildFallback(row)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatWhen(row.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default AuditLogCard;
