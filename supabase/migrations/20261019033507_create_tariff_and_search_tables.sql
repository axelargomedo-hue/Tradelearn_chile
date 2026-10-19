/*
# Create tariff items and search history tables

1. Plain-English explanation
   - The tariff searcher page currently uses a hardcoded list in the app code.
     This migration moves that data into the database so it can be updated
     without changing the app, and grows to the full 8,551 fractions later.
   - The home page shows a hardcoded "Búsquedas Recientes" section. This
     migration adds a table that records what users search for, so the
     section can show real recent searches.

2. New Tables
   - `tariff_items`
     - `id` (uuid, primary key)
     - `code` (text, unique, e.g. "2204.21.00")
     - `description` (text, not null)
     - `rate` (numeric, not null, e.g. 6 or 0 for the NMF tariff percentage)
     - `tlcs` (text, free-text summary of FTA rates, e.g. "0% (UE, USA)")
     - `unit_measure` (text, not null, e.g. "Kg", "Litro", "Unidad")
     - `created_at` (timestamp, defaults to now)
   - `search_history`
     - `id` (uuid, primary key)
     - `term` (text, not null, the searched text)
     - `results_count` (integer, not null, how many results the search returned)
     - `created_at` (timestamp, defaults to now)

3. Security changes
   - RLS enabled on both tables.
   - `tariff_items`: public read (reference data), NO insert/update/delete
     policies — writes are denied by default and managed via the service role.
   - `search_history`: anyone (anon + authenticated) can insert a search and
     read the recent list; no update/delete policies (the log is immutable).

4. Important notes
   - The 17 existing hardcoded tariff rows are inserted as seed data, idempotent
     on the unique `code` column.
   - No auth/user columns: this app is single-tenant (regular users never sign
     in; only the admin portal uses Supabase auth).
*/

CREATE TABLE IF NOT EXISTS public.tariff_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL,
  rate numeric NOT NULL,
  tlcs text NOT NULL DEFAULT '0% (todos)',
  unit_measure text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tariff_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_tariff_items" ON public.tariff_items;
CREATE POLICY "public_select_tariff_items"
  ON public.tariff_items FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_select_search_history" ON public.search_history;
CREATE POLICY "public_select_search_history"
  ON public.search_history FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_insert_search_history" ON public.search_history;
CREATE POLICY "public_insert_search_history"
  ON public.search_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(term)) > 0
    AND length(btrim(term)) <= 120
    AND results_count >= 0
  );

INSERT INTO public.tariff_items (code, description, rate, tlcs, unit_measure) VALUES
  ('0101.21.00', 'Caballos vivos reproductores de pura raza', 6, '0% (UE, USA, China)', 'Unidad'),
  ('0201.10.00', 'Carne de bovino en canales, fresca o refrigerada', 6, '0% (UE, USA)', 'Kg'),
  ('0302.11.00', 'Truchas frescas o refrigeradas', 0, '0% (todos)', 'Kg'),
  ('0803.90.00', 'Bananas y plátanos frescos', 6, '0% (China, UE, USA)', 'Kg'),
  ('0901.11.00', 'Café sin tostar ni descafeinar', 6, '0% (Colombia, UE)', 'Kg'),
  ('1507.10.00', 'Aceite de soja en bruto, sin modificar', 6, '0% (USA)', 'Kg'),
  ('2204.21.00', 'Vino de uvas frescas, en recipientes ≤2L', 6, '0% (UE, USA)', 'Litro'),
  ('2710.12.00', 'Gasolinas y demás preparaciones para motor', 6, '0% (USA, UE)', 'Litro'),
  ('3004.20.00', 'Medicamentos con antibióticos para uso humano', 6, '0% (UE, USA, China)', 'Kg'),
  ('3923.30.00', 'Garrafas, botellas, frascos de plástico', 6, '0% (China, UE)', 'Kg'),
  ('6109.10.00', 'Camisetas de algodón, de punto', 6, '0% (China, UE)', 'Unidad'),
  ('6203.42.00', 'Pantalones de algodón para hombres', 6, '0% (UE, USA, China)', 'Unidad'),
  ('7108.12.00', 'Oro en bruto para uso no monetario', 0, '0% (todos)', 'Kg'),
  ('8414.51.00', 'Ventiladores de mesa, pared o techo con motor', 0, '0% (China, UE)', 'Unidad'),
  ('8471.30.00', 'Computadoras portátiles de peso ≤10 kg', 0, '0% (todos los TLCs)', 'Unidad'),
  ('8517.12.00', 'Teléfonos celulares o de redes inalámbricas', 0, '0% (todos los TLCs)', 'Unidad'),
  ('8703.23.00', 'Automóviles con motor de émbolo 1500–3000cc', 6, '0% (UE, USA)', 'Unidad')
ON CONFLICT (code) DO NOTHING;
