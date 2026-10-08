/*
# Admin access control for registrations

## Summary
Creates an admin access layer so that only the app creator can view submitted
registrations. Regular users and anonymous visitors can still submit the public
registration form, but can no longer read other people's registrations. The
first person to sign up through the admin portal becomes the creator/admin and
gains exclusive access to the registrations database.

## New Tables
- `app_admins`
  - `id` (uuid, primary key)
  - `email` (text, unique, not null) — the admin's auth email
  - `created_at` (timestamptz)

## Security changes
- `app_admins` has RLS enabled with NO policies — it is completely invisible
  to the anon and authenticated roles via the data API. Only the service role
  (used server-side) and SECURITY DEFINER functions can read/write it.
- `registrations` SELECT policy replaced: was `USING (true)` for everyone, now
  only authenticated users whose email appears in `app_admins` can read rows.
- `registrations` INSERT policy unchanged (public form, validated).
- New `is_admin()` SECURITY DEFINER function: returns true if the current
  authenticated user's email is in `app_admins`. Used by the SELECT policy.
- New `bootstrap_first_admin()` SECURITY DEFINER function: the first
  authenticated user to call it becomes the admin. Fails if an admin already
  exists, so it can only ever run once. This avoids the chicken-and-egg problem
  of seeding the first admin without exposing admin management to the API.
- New `add_admin(p_email text)` SECURITY DEFINER function: lets an existing
  admin promote another email. Authorization is derived from auth.uid().

## Notes
1. The creator signs up through the admin portal, then the app calls
   bootstrap_first_admin() once. After that, only that email can read
   registrations.
2. app_admins is intentionally unreachable from the data API — no SELECT,
   INSERT, UPDATE, or DELETE policies. All access goes through functions.
3. is_admin() and add_admin() check auth.uid() server-side, never a
   client-supplied parameter, so they cannot be forged.
*/

CREATE TABLE IF NOT EXISTS app_admins (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;

-- is_admin: returns true if the caller's auth email is in app_admins
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM app_admins a
    JOIN auth.users u ON u.email = a.email
    WHERE u.id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- bootstrap_first_admin: the first authenticated caller becomes admin.
-- Fails once an admin already exists, so it can only ever run once.
CREATE OR REPLACE FUNCTION bootstrap_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_email text;
  v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM app_admins;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Admin already configured';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO app_admins (email) VALUES (v_email);
END;
$$;

REVOKE EXECUTE ON FUNCTION bootstrap_first_admin() FROM anon;
GRANT EXECUTE ON FUNCTION bootstrap_first_admin() TO authenticated;

-- add_admin: an existing admin can promote another email
CREATE OR REPLACE FUNCTION add_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_email IS NULL OR btrim(p_email) = '' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  INSERT INTO app_admins (email) VALUES (lower(btrim(p_email)))
  ON CONFLICT (email) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION add_admin(text) FROM anon;
GRANT EXECUTE ON FUNCTION add_admin(text) TO authenticated;

-- Replace registrations SELECT policy: only admins can read
DROP POLICY IF EXISTS "anon_select_registrations" ON registrations;
DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations" ON registrations FOR SELECT
  TO authenticated
  USING (is_admin());
