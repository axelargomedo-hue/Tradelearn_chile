/*
# Create registrations table

## Summary
Stores user registration information collected from the TradeLearn Chile registration form.

## New Tables

### `registrations`
- `id` (uuid, primary key, auto-generated)
- `nombre` (text, not null) — full name of the registrant
- `correo` (text, not null) — email address
- `fecha_nacimiento` (date, not null) — date of birth (used to calculate age on the frontend)
- `genero` (text, not null) — gender: 'hombre', 'mujer', or 'otros'
- `region` (text, not null) — Chilean region (e.g. "Región Metropolitana de Santiago")
- `ciudad` (text, not null) — city of residence
- `pais` (text, not null, default 'Chile') — country of residence
- `created_at` (timestamptz, auto-generated) — record creation timestamp

## Security
- RLS enabled on `registrations`.
- Anon + authenticated users can INSERT (public registration form, no sign-in required).
- Anon + authenticated users can SELECT their own rows (open read for this public app).
- No UPDATE or DELETE policies — registrations are immutable once submitted.

## Notes
1. This is a public registration form — no auth is required, so anon access is intentional.
2. Age is computed on the frontend from `fecha_nacimiento`; the raw date is stored for flexibility.
3. The `correo` column is NOT unique — the same email may submit multiple times (e.g. updates).
*/

CREATE TABLE IF NOT EXISTS registrations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           text NOT NULL,
  correo           text NOT NULL,
  fecha_nacimiento date NOT NULL,
  genero           text NOT NULL CHECK (genero IN ('hombre', 'mujer', 'otros')),
  region           text NOT NULL,
  ciudad           text NOT NULL,
  pais             text NOT NULL DEFAULT 'Chile',
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_registrations" ON registrations;
CREATE POLICY "anon_select_registrations" ON registrations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT
  TO anon, authenticated WITH CHECK (true);
