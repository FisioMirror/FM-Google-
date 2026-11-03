create or replace function public.fn_audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_actor text;
begin
  begin v_actor := coalesce(current_setting('request.jwt.claims', true)::jsonb->>'email', 'system'); exception when others then v_actor := 'system'; end;
  insert into public.audit_logs (actor_email, action, entity_type, old_values, new_values, metadata)
  values (
    v_actor,
    TG_OP,
    TG_TABLE_NAME,
    case when TG_OP = 'INSERT' then null else to_jsonb(OLD) end,
    case when TG_OP = 'DELETE' then null else to_jsonb(NEW) end,
    jsonb_build_object('schema', TG_TABLE_SCHEMA, 'at', now())
  );
  return case when TG_OP = 'DELETE' then OLD else NEW end;
end $$;

drop trigger if exists trg_audit_profiles on public.profiles;
create trigger trg_audit_profiles after insert or update or delete on public.profiles
for each row execute function public.fn_audit_row();

drop trigger if exists trg_audit_sesiones on public.sesiones_completadas;
create trigger trg_audit_sesiones after insert or update or delete on public.sesiones_completadas
for each row execute function public.fn_audit_row();

drop trigger if exists trg_audit_pain on public.pain_reports;
create trigger trg_audit_pain after insert or update or delete on public.pain_reports
for each row execute function public.fn_audit_row();

drop trigger if exists trg_audit_adj on public.session_adjustments;
create trigger trg_audit_adj after insert or update or delete on public.session_adjustments
for each row execute function public.fn_audit_row();

drop trigger if exists trg_audit_rutinas on public.rutinas;
create trigger trg_audit_rutinas after insert or update or delete on public.rutinas
for each row execute function public.fn_audit_row();

select tgname from pg_trigger where tgname like 'trg_audit%' order by 1;
