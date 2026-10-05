-- Run as the database owner AFTER manually creating hoopstat_app with a password.
-- This file contains no credential and never changes a password.
-- Create the account in the SQL editor with LOGIN, NOSUPERUSER, NOCREATEDB,
-- NOCREATEROLE, NOREPLICATION, NOBYPASSRLS, and no neon_superuser membership.
-- Run only in the intended basketball database. Do not run the seed afterward.

BEGIN;

DO $$
DECLARE
  app_role RECORD;
BEGIN
  SELECT * INTO app_role FROM pg_roles WHERE rolname = 'hoopstat_app';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Create hoopstat_app manually before applying these grants';
  END IF;
  IF NOT app_role.rolcanlogin OR app_role.rolsuper OR app_role.rolcreatedb
     OR app_role.rolcreaterole OR app_role.rolreplication OR app_role.rolbypassrls THEN
    RAISE EXCEPTION 'hoopstat_app must be a login role without administrative attributes';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE member = app_role.oid) THEN
    RAISE EXCEPTION 'hoopstat_app must have no inherited role memberships';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relowner = app_role.oid)
     OR EXISTS (SELECT 1 FROM pg_namespace WHERE nspowner = app_role.oid)
     OR EXISTS (SELECT 1 FROM pg_database WHERE datdba = app_role.oid) THEN
    RAISE EXCEPTION 'hoopstat_app must not own database objects';
  END IF;
  IF has_schema_privilege('hoopstat_app', 'public', 'CREATE') THEN
    RAISE EXCEPTION 'hoopstat_app inherits public-schema CREATE; inspect PUBLIC grants first';
  END IF;
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO hoopstat_app', current_database());
END $$;

REVOKE ALL ON TABLE public.app_users, public.games, public.leagues,
  public.league_teams, public.league_players, public.teams,
  public.players, public.plays FROM hoopstat_app;
GRANT USAGE ON SCHEMA public TO hoopstat_app;

-- Only operations used by the existing Express repositories are granted.
GRANT SELECT, INSERT ON public.app_users, public.leagues TO hoopstat_app;
GRANT SELECT, INSERT, UPDATE ON public.games, public.league_teams,
  public.teams, public.players TO hoopstat_app;
GRANT SELECT, INSERT, DELETE ON public.league_players, public.plays TO hoopstat_app;

DO $$
DECLARE
  table_name TEXT;
  sequence_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['app_users', 'games', 'leagues',
      'league_teams', 'league_players', 'teams', 'players', 'plays'] LOOP
    sequence_name := pg_get_serial_sequence(format('public.%I', table_name), 'id');
    IF sequence_name IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON SEQUENCE %s FROM hoopstat_app', sequence_name);
      EXECUTE format('GRANT USAGE ON SEQUENCE %s TO hoopstat_app', sequence_name);
    END IF;
  END LOOP;
END $$;

COMMIT;

-- Run after switching the API connection to hoopstat_app.
-- These flags should be false, memberships empty, and current_user hoopstat_app.
SELECT current_user, r.rolsuper, r.rolcreaterole, r.rolcreatedb, r.rolbypassrls,
  ARRAY(SELECT parent.rolname FROM pg_auth_members m
    JOIN pg_roles parent ON parent.oid = m.roleid WHERE m.member = r.oid) AS memberships
FROM pg_roles r WHERE r.rolname = current_user;
