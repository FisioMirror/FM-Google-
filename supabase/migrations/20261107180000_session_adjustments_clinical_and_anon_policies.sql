-- Ampliación clínica de ajustes de sesión + policies anon faltantes.
-- La app usa auth custom (sin sesión Supabase), por lo que las escrituras
-- necesitan policies para el rol anon además de las de authenticated.
-- Aplicada a producción (ref mnkqfrulcpxpwaftokdi) el 2026-11-07.

-- 1. Ajustes de sesión con evaluación clínica estructurada.
alter table public.session_adjustments
  add column if not exists dolor_eva smallint check (dolor_eva between 0 and 10),
  add column if not exists rom_actual smallint check (rom_actual between 0 and 180),
  add column if not exists rom_objetivo smallint check (rom_objetivo between 0 and 180),
  add column if not exists progresion smallint check (progresion between 0 and 100),
  add column if not exists frecuencia_semanal smallint check (frecuencia_semanal between 1 and 7),
  add column if not exists duracion_min smallint check (duracion_min between 5 and 120),
  add column if not exists precauciones text,
  add column if not exists proxima_revision date;

drop policy if exists anon_update_pain_reports on public.pain_reports;
create policy anon_update_pain_reports on public.pain_reports
  for update to anon using (true) with check (true);

drop policy if exists anon_update_session_adjustments on public.session_adjustments;
create policy anon_update_session_adjustments on public.session_adjustments
  for update to anon using (true) with check (true);

drop policy if exists anon_delete_session_adjustments on public.session_adjustments;
create policy anon_delete_session_adjustments on public.session_adjustments
  for delete to anon using (true);

-- 2. Tablas clínicas que aún no tenían escritura anon.
drop policy if exists anon_select_pacientes on public.pacientes;
create policy anon_select_pacientes on public.pacientes for select to anon using (true);
drop policy if exists anon_insert_pacientes on public.pacientes;
create policy anon_insert_pacientes on public.pacientes for insert to anon with check (true);
drop policy if exists anon_update_pacientes on public.pacientes;
create policy anon_update_pacientes on public.pacientes for update to anon using (true) with check (true);
drop policy if exists anon_delete_pacientes on public.pacientes;
create policy anon_delete_pacientes on public.pacientes for delete to anon using (true);

drop policy if exists anon_select_documentos_medicos on public.documentos_medicos;
create policy anon_select_documentos_medicos on public.documentos_medicos for select to anon using (true);
drop policy if exists anon_insert_documentos_medicos on public.documentos_medicos;
create policy anon_insert_documentos_medicos on public.documentos_medicos for insert to anon with check (true);
drop policy if exists anon_update_documentos_medicos on public.documentos_medicos;
create policy anon_update_documentos_medicos on public.documentos_medicos for update to anon using (true) with check (true);
drop policy if exists anon_delete_documentos_medicos on public.documentos_medicos;
create policy anon_delete_documentos_medicos on public.documentos_medicos for delete to anon using (true);

drop policy if exists anon_select_sesiones_ejercicios on public.sesiones_ejercicios;
create policy anon_select_sesiones_ejercicios on public.sesiones_ejercicios for select to anon using (true);
drop policy if exists anon_insert_sesiones_ejercicios on public.sesiones_ejercicios;
create policy anon_insert_sesiones_ejercicios on public.sesiones_ejercicios for insert to anon with check (true);
drop policy if exists anon_update_sesiones_ejercicios on public.sesiones_ejercicios;
create policy anon_update_sesiones_ejercicios on public.sesiones_ejercicios for update to anon using (true) with check (true);
drop policy if exists anon_delete_sesiones_ejercicios on public.sesiones_ejercicios;
create policy anon_delete_sesiones_ejercicios on public.sesiones_ejercicios for delete to anon using (true);

notify pgrst, 'reload schema';
