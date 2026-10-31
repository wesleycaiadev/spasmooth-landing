-- Keep sql/009_rate_limit.sql identical to this idempotent installer.
-- Historical counter tables are deliberately preserved.
CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  key text PRIMARY KEY CHECK (key ~ '^[a-f0-9]{64}$'),
  hits integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS security_rate_limits_expiry
  ON public.security_rate_limits(expires_at);
ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.security_rate_limits TO service_role;
DROP POLICY IF EXISTS server_access ON public.security_rate_limits;
CREATE POLICY server_access ON public.security_rate_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key text, p_limit integer, p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE v_hits integer;
BEGIN
  IF p_key IS NULL OR p_key !~ '^[a-f0-9]{64}$'
    OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 1000
    OR p_window_seconds IS NULL OR p_window_seconds NOT BETWEEN 1 AND 86400
  THEN RAISE EXCEPTION 'INVALID_RATE_LIMIT'; END IF;

  DELETE FROM public.security_rate_limits WHERE key IN (
    SELECT key FROM public.security_rate_limits WHERE expires_at < now() LIMIT 100
  );
  INSERT INTO public.security_rate_limits AS r(key, hits, expires_at)
    VALUES(p_key, 1, now() + make_interval(secs => p_window_seconds))
  ON CONFLICT(key) DO UPDATE SET
    hits = CASE WHEN r.expires_at <= now() THEN 1 ELSE LEAST(r.hits + 1, p_limit + 1) END,
    expires_at = CASE WHEN r.expires_at <= now()
      THEN now() + make_interval(secs => p_window_seconds) ELSE r.expires_at END
  RETURNING hits INTO v_hits;
  RETURN v_hits <= p_limit;
END $$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_entries() RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  DELETE FROM public.security_rate_limits WHERE key IN (
    SELECT key FROM public.security_rate_limits WHERE expires_at < now() LIMIT 1000
  );
END $$;
REVOKE ALL ON FUNCTION public.cleanup_rate_limit_entries() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_entries() TO service_role;

-- An earlier installer used this table. Retain the data, but close inherited
-- table privileges if that installation path was used.
DO $$ BEGIN
  IF to_regclass('public.rate_limit_entries') IS NOT NULL THEN
    ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.rate_limit_entries FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
