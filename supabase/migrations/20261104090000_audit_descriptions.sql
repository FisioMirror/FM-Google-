-- ==============================================================================
-- Bitácora descriptiva y legible para administración
-- Añade una descripción en lenguaje natural a audit_logs y una vista de lectura.
-- ==============================================================================

alter table public.audit_logs add column if not exists description text;

comment on column public.audit_logs.description is
  'Descripción legible por humanos de la acción registrada (quién hizo qué, cuándo y sobre qué).';

create or replace function public.fn_audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_actor text;
  v_patient text;
  v_actor_name text;
  v_desc text;
begin
  begin
    v_actor := coalesce(current_setting('request.jwt.claims', true)::jsonb->>'email', 'sistema');
  exception when others then
    v_actor := 'sistema';
  end;

  if TG_TABLE_NAME = 'sesiones_completadas' then
    select full_name into v_patient from public.profiles
      where id = coalesce(NEW.paciente_id, OLD.paciente_id);
  elsif TG_TABLE_NAME = 'pain_reports' then
    select full_name into v_patient from public.profiles
      where id = coalesce(NEW.paciente_id, OLD.paciente_id);
  elsif TG_TABLE_NAME = 'session_adjustments' then
    select full_name into v_patient from public.profiles
      where id = coalesce(NEW.paciente_id, OLD.paciente_id);
    select full_name into v_actor_name from public.profiles
      where id = coalesce(NEW.fisio_id, OLD.fisio_id);
  elsif TG_TABLE_NAME = 'rutinas' then
    select full_name into v_patient from public.profiles
      where id = coalesce(NEW.paciente_id, OLD.paciente_id);
  end if;

  if TG_TABLE_NAME = 'profiles' then
    v_desc := format(
      '%s %s el perfil de %s',
      coalesce(v_actor, 'sistema'),
      case TG_OP when 'INSERT' then 'creó' when 'UPDATE' then 'actualizó' else 'eliminó' end,
      coalesce(NEW.full_name, OLD.full_name, NEW.email, OLD.email, 'un usuario')
    );
  elsif TG_TABLE_NAME = 'sesiones_completadas' then
    if TG_OP = 'DELETE' then
      v_desc := format('%s eliminó una sesión de %s', v_actor, coalesce(v_patient, 'un paciente'));
    else
      v_desc := format(
        '%s completó la sesión «%s»: %s%% de calidad, %s repeticiones, %s segundos',
        coalesce(v_patient, 'Un paciente'),
        coalesce(NEW.ejercicio_nombre, 'ejercicio'),
        coalesce(round(NEW.calidad_ejecucion)::text, '0'),
        coalesce(NEW.repeticiones::text, '0'),
        coalesce(NEW.duracion_segundos::text, '0')
      );
    end if;
  elsif TG_TABLE_NAME = 'pain_reports' then
    if TG_OP = 'DELETE' then
      v_desc := format('%s eliminó un reporte de dolor de %s', v_actor, coalesce(v_patient, 'un paciente'));
    else
      v_desc := format(
        '%s reportó dolor %s/10',
        coalesce(v_patient, 'Un paciente'),
        coalesce(NEW.nivel::text, '?')
      );
    end if;
  elsif TG_TABLE_NAME = 'session_adjustments' then
    if TG_OP = 'DELETE' then
      v_desc := format('%s eliminó un ajuste de sesión de %s', v_actor, coalesce(v_patient, 'un paciente'));
    else
      v_desc := format(
        '%s ajustó la sesión de %s: tolerancia %s°, foco %s, máximo %s repeticiones',
        coalesce(v_actor_name, v_actor, 'Un fisioterapeuta'),
        coalesce(v_patient, 'un paciente'),
        coalesce(NEW.tolerancia_grados::text, '?'),
        coalesce(NEW.foco, 'movilidad'),
        coalesce(NEW.repeticiones_max::text, '?')
      );
    end if;
  elsif TG_TABLE_NAME = 'rutinas' then
    if TG_OP = 'DELETE' then
      v_desc := format('%s eliminó una rutina de %s', v_actor, coalesce(v_patient, 'un paciente'));
    else
      v_desc := format(
        '%s %s la rutina de %s (fase %s)',
        v_actor,
        case TG_OP when 'INSERT' then 'creó' else 'actualizó' end,
        coalesce(v_patient, 'un paciente'),
        coalesce(NEW.fase, 'sin fase')
      );
    end if;
  else
    v_desc := format('%s ejecutó %s sobre %s', v_actor, TG_OP, TG_TABLE_NAME);
  end if;

  insert into public.audit_logs (actor_email, action, entity_type, old_values, new_values, metadata, description)
  values (
    v_actor,
    TG_OP,
    TG_TABLE_NAME,
    case when TG_OP = 'INSERT' then null else to_jsonb(OLD) end,
    case when TG_OP = 'DELETE' then null else to_jsonb(NEW) end,
    jsonb_build_object('schema', TG_TABLE_SCHEMA, 'at', now()),
    v_desc
  );

  return case when TG_OP = 'DELETE' then OLD else NEW end;
end $$;

create or replace view public.vw_audit_logs_readable
with (security_invoker = true) as
select
  id,
  created_at,
  actor_email,
  action,
  entity_type,
  severity,
  coalesce(
    description,
    format('%s ejecutó %s sobre %s', coalesce(actor_email, 'sistema'), action, entity_type)
  ) as description,
  old_values,
  new_values,
  metadata
from public.audit_logs;

comment on view public.vw_audit_logs_readable is
  'Vista de bitácora con descripciones legibles para supervisión administrativa. security_invoker: respeta el RLS de audit_logs.';

-- La vista hereda el RLS de audit_logs (solo fisioterapeutas). Se retiran grants directos.
revoke all on public.vw_audit_logs_readable from anon;
grant select on public.vw_audit_logs_readable to authenticated;
