-- Mediciones reales de dolor y ajustes clínicos de sesión.
-- Aplicada a producción (ref mnkqfrulcpxpwaftokdi) el 2026-11-01.
-- Id canónico de paciente: profiles.id (igual que sesiones_completadas y pacientes_terapeutas).

create table if not exists public.pain_reports (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  nivel smallint not null check (nivel between 0 and 10),
  zona text,
  notas text,
  creado_en timestamptz not null default now(),
  leido_por uuid references public.profiles(id) on delete set null,
  leido_en timestamptz
);
create index if not exists idx_pain_reports_paciente on public.pain_reports (paciente_id, creado_en desc);
alter table public.pain_reports enable row level security;

drop policy if exists pain_reports_paciente_insert on public.pain_reports;
create policy pain_reports_paciente_insert on public.pain_reports for insert to authenticated
  with check (auth.uid() = paciente_id);

drop policy if exists pain_reports_paciente_select on public.pain_reports;
create policy pain_reports_paciente_select on public.pain_reports for select to authenticated
  using (auth.uid() = paciente_id);

drop policy if exists pain_reports_fisio_select on public.pain_reports;
create policy pain_reports_fisio_select on public.pain_reports for select to authenticated
  using (exists (select 1 from public.pacientes_terapeutas pt
                 where pt.paciente_id = pain_reports.paciente_id and pt.terapeuta_id = auth.uid()));

drop policy if exists pain_reports_fisio_update on public.pain_reports;
create policy pain_reports_fisio_update on public.pain_reports for update to authenticated
  using (exists (select 1 from public.pacientes_terapeutas pt
                 where pt.paciente_id = pain_reports.paciente_id and pt.terapeuta_id = auth.uid()));

create table if not exists public.session_adjustments (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  fisio_id uuid references public.profiles(id) on delete set null,
  tolerancia_grados smallint not null default 8 check (tolerancia_grados between 0 and 45),
  repeticiones_max smallint check (repeticiones_max between 1 and 100),
  foco text,
  notas text,
  creado_en timestamptz not null default now()
);
create index if not exists idx_session_adjustments_paciente on public.session_adjustments (paciente_id, creado_en desc);
alter table public.session_adjustments enable row level security;

drop policy if exists session_adjustments_fisio_all on public.session_adjustments;
create policy session_adjustments_fisio_all on public.session_adjustments for all to authenticated
  using (fisio_id = auth.uid() or exists (select 1 from public.pacientes_terapeutas pt
         where pt.paciente_id = session_adjustments.paciente_id and pt.terapeuta_id = auth.uid()))
  with check (fisio_id = auth.uid() or exists (select 1 from public.pacientes_terapeutas pt
         where pt.paciente_id = session_adjustments.paciente_id and pt.terapeuta_id = auth.uid()));

drop policy if exists session_adjustments_paciente_select on public.session_adjustments;
create policy session_adjustments_paciente_select on public.session_adjustments for select to authenticated
  using (auth.uid() = paciente_id);
