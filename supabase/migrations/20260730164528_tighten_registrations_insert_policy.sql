/*
# Tighten INSERT policy on registrations

## Summary
The previous INSERT policy `anon_insert_registrations` used `WITH CHECK (true)`,
which allowed unrestricted inserts by the anon and authenticated roles and
effectively bypassed row-level security. This migration replaces it with a
policy that validates the shape and content of every submitted registration row,
so only well-formed, legitimate registrations can be inserted through the public
form — while still allowing anonymous submission (no sign-in required).

## Security changes
- RLS remains enabled on `registrations`.
- INSERT policy `anon_insert_registrations` is replaced. The new `WITH CHECK`
  requires, for the inserted row:
  1. `nombre` is present and non-empty after trimming.
  2. `correo` matches a basic email pattern (local@domain.tld).
  3. `fecha_nacimiento` is present, not in the future, and not more than 120
     years in the past.
  4. `genero` is one of the allowed values: 'hombre', 'mujer', 'otros'.
  5. `region`, `ciudad`, and `pais` are present and non-empty after trimming.
- SELECT policy (`anon_select_registrations`) is unchanged — this no-auth app
  relies on public read access.
- No UPDATE or DELETE policies exist; registrations remain immutable once
  submitted.

## Notes
1. This is a public registration form with no sign-in screen, so anon INSERT
   access is intentional. The check constrains WHAT can be inserted rather than
   WHO can insert it, which is the meaningful protection available without auth.
2. Column NOT NULL constraints already reject null values; the WITH CHECK adds
   content validation (email format, genero domain, date range, non-empty
   trimmed strings) on top of the column constraints.
3. The policy is idempotent: it drops the existing policy before recreating it,
   so it is safe to re-run.
*/

DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    nombre IS NOT NULL
    AND length(btrim(nombre)) > 0
    AND correo IS NOT NULL
    AND correo ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND fecha_nacimiento IS NOT NULL
    AND fecha_nacimiento <= CURRENT_DATE
    AND fecha_nacimiento >= (CURRENT_DATE - INTERVAL '120 years')::date
    AND genero IN ('hombre', 'mujer', 'otros')
    AND region IS NOT NULL
    AND length(btrim(region)) > 0
    AND ciudad IS NOT NULL
    AND length(btrim(ciudad)) > 0
    AND pais IS NOT NULL
    AND length(btrim(pais)) > 0
  );
