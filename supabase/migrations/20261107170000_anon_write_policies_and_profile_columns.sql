-- Fixes de escritura para la autenticación custom de FisioMirror.
-- La app valida credenciales contra public.profiles (Edge auth-login) y NO crea
-- una sesión de Supabase Auth; por lo tanto auth.uid() es NULL y las policies
-- basadas en auth.uid() rechazaban inserts/selects legítimos de la app.
-- Se mantienen las policies originales para una futura migración a Supabase Auth
-- y se agregan policies permisivas para el rol anon (mismo criterio que el resto
-- de las tablas operativas del proyecto).
-- Aplicada a producción (ref mnkqfrulcpxpwaftokdi) el 2026-11-07.

-- 1. Columnas de perfil usadas por el registro y la edición de perfil.
alter table public.profiles
  add column if not exists cedula text,
  add column if not exists colegiado_id text,
  add column if not exists credencial_url text;

-- 2. Historial del chat de Physi (la app ya enviaba/leía `images`).
alter table public.ai_conversations
  add column if not exists images jsonb;

-- 3. Mediciones de dolor.
drop policy if exists anon_insert_pain_reports on public.pain_reports;
create policy anon_insert_pain_reports on public.pain_reports
  for insert to anon with check (true);

drop policy if exists anon_select_pain_reports on public.pain_reports;
create policy anon_select_pain_reports on public.pain_reports
  for select to anon using (true);

-- 4. Ajustes clínicos de sesión (demo clínica y lectura del paciente).
drop policy if exists anon_insert_session_adjustments on public.session_adjustments;
create policy anon_insert_session_adjustments on public.session_adjustments
  for insert to anon with check (true);

drop policy if exists anon_select_session_adjustments on public.session_adjustments;
create policy anon_select_session_adjustments on public.session_adjustments
  for select to anon using (true);

-- 5. Avatar del perfil (bucket público `avatars`).
drop policy if exists anon_upload_avatars on storage.objects;
create policy anon_upload_avatars on storage.objects
  for insert to anon with check (bucket_id = 'avatars');

drop policy if exists anon_update_avatars on storage.objects;
create policy anon_update_avatars on storage.objects
  for update to anon using (bucket_id = 'avatars') with check (bucket_id = 'avatars');

notify pgrst, 'reload schema';
