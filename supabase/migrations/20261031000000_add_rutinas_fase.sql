/*
# Add clinical phase to assigned routines

1. Modified Tables
- `rutinas`: adds `fase` (text) with the official rehabilitation phases:
  Aguda, Subaguda, Remodelación, Funcional.

2. Rationale
- The clinical assignment flow now records the rehabilitation phase together with
  the date range (fecha_inicio / fecha_fin), so progress can be traced per phase
  instead of only per routine.

3. Compatibility
- The app retries the insert without `fase` if this migration has not been applied
  yet, so routines can still be assigned while the migration is pending.
- Existing rows get `Aguda` as the default phase.
*/

ALTER TABLE rutinas
  ADD COLUMN IF NOT EXISTS fase text DEFAULT 'Aguda';

UPDATE rutinas
SET fase = 'Aguda'
WHERE fase IS NULL;

ALTER TABLE rutinas
  DROP CONSTRAINT IF EXISTS rutinas_fase_check;

ALTER TABLE rutinas
  ADD CONSTRAINT rutinas_fase_check
  CHECK (fase IN ('Aguda', 'Subaguda', 'Remodelación', 'Funcional'));

CREATE INDEX IF NOT EXISTS idx_rutinas_fase ON rutinas (fase);
