SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- Application authentication is Clerk, not Supabase Auth. Browser roles must never be admins.
DO $$ DECLARE p record; t text; BEGIN
  FOR p IN SELECT schemaname,tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('leads','bookings','booking_locks','professionals','services','site_config','professional_schedule') LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I',p.policyname,p.schemaname,p.tablename);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['leads','bookings','booking_locks','professionals','services','site_config','professional_schedule'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated',t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
    EXECUTE format('CREATE POLICY server_access ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',t);
  END LOOP;
END $$;
GRANT SELECT ON public.professionals, public.services TO anon, authenticated;
CREATE POLICY active_catalog ON public.professionals FOR SELECT TO anon,authenticated USING (active = true);
CREATE POLICY active_catalog ON public.services FOR SELECT TO anon,authenticated USING (active = true);
-- Only these explicitly public configuration rows are readable.
GRANT SELECT ON public.site_config TO anon,authenticated;
CREATE POLICY public_site_config ON public.site_config FOR SELECT TO anon,authenticated USING (id IN ('landing_page','service_categories','featured_carousel'));

-- Lock down all application routines (exclude extension-owned functions).
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure AS identity FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e') LOOP
   EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC,anon,authenticated',f.identity);
   EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',f.identity);
   EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp',f.identity);
 END LOOP;
END $$;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC,anon,authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon,authenticated;

CREATE TABLE public.security_rate_limits (
 key text PRIMARY KEY CHECK (key ~ '^[a-f0-9]{64}$'), hits integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE INDEX security_rate_limits_expiry ON public.security_rate_limits(expires_at);
ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_rate_limits FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.security_rate_limits TO service_role;
CREATE POLICY server_access ON public.security_rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE FUNCTION public.consume_rate_limit(p_key text,p_limit integer,p_window_seconds integer) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public,pg_temp AS $$
DECLARE v_hits integer; BEGIN
 IF p_key IS NULL OR p_key !~ '^[a-f0-9]{64}$' OR p_limit NOT BETWEEN 1 AND 1000 OR p_window_seconds NOT BETWEEN 1 AND 86400 THEN RAISE EXCEPTION 'INVALID_RATE_LIMIT'; END IF;
 DELETE FROM public.security_rate_limits WHERE key IN (SELECT key FROM public.security_rate_limits WHERE expires_at < now() LIMIT 100);
 INSERT INTO public.security_rate_limits AS r(key,hits,expires_at) VALUES(p_key,1,now()+make_interval(secs=>p_window_seconds))
 ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN r.expires_at<=now() THEN 1 ELSE LEAST(r.hits+1,p_limit+1) END,
 expires_at=CASE WHEN r.expires_at<=now() THEN now()+make_interval(secs=>p_window_seconds) ELSE r.expires_at END RETURNING hits INTO v_hits;
 RETURN v_hits<=p_limit;
END $$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text,integer,integer) TO service_role;

CREATE FUNCTION public.available_booking_slots(p_professional_id uuid,p_service_id uuid,p_date date) RETURNS text[]
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE v_pro public.professionals; v_duration integer; v_start time; v_end time; v_sched record;
 v_slot timestamptz; v_close timestamptz; v_day integer; v_slots text[] := '{}';
BEGIN
 IF p_date IS NULL OR p_date < (now() at time zone 'America/Maceio')::date OR p_date > (now() at time zone 'America/Maceio')::date+60 THEN RETURN v_slots; END IF;
 SELECT * INTO v_pro FROM public.professionals WHERE id=p_professional_id AND active;
 IF NOT FOUND OR p_date < v_pro.location_start_date OR p_date > v_pro.location_end_date THEN RETURN v_slots; END IF;
 SELECT duration_minutes INTO v_duration FROM public.services WHERE id=p_service_id AND active;
 IF v_duration IS NULL OR v_duration NOT BETWEEN 1 AND 720 THEN RETURN v_slots; END IF;
 v_day := extract(dow from p_date);
 IF v_day=0 THEN RETURN v_slots; END IF;
 v_start := CASE WHEN v_day=6 THEN '09:00'::time ELSE '08:00'::time END;
 v_end := CASE WHEN v_day=6 THEN '16:00'::time ELSE '20:00'::time END;
 SELECT * INTO v_sched FROM public.professional_schedule WHERE professional_id=p_professional_id::text AND day_of_week=v_day ORDER BY created_at DESC LIMIT 1;
 IF FOUND THEN
   IF v_sched.is_day_off THEN RETURN v_slots; END IF;
   v_start := greatest(v_start,v_sched.start_time); v_end := least(v_end,v_sched.end_time);
 END IF;
 v_slot := (p_date+v_start) AT TIME ZONE 'America/Maceio';
 v_close := (p_date+v_end) AT TIME ZONE 'America/Maceio';
 WHILE v_slot+make_interval(mins=>v_duration)<=v_close LOOP
   IF v_slot >= now()+interval '30 minutes' AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE professional_id=p_professional_id AND status<>'cancelado' AND tstzrange(starts_at,ends_at,'[)') && tstzrange(v_slot,v_slot+make_interval(mins=>v_duration),'[)')) THEN
     v_slots := array_append(v_slots,to_char(v_slot AT TIME ZONE 'America/Maceio','HH24:MI'));
   END IF;
   v_slot := v_slot+interval '1 hour';
 END LOOP;
 RETURN v_slots;
END $$;
REVOKE ALL ON FUNCTION public.available_booking_slots(uuid,uuid,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.available_booking_slots(uuid,uuid,date) TO service_role;

CREATE OR REPLACE FUNCTION public.check_and_create_booking(p_unit text,p_professional_id uuid,p_service_id uuid,p_client_name text,p_client_phone text,p_starts_at timestamptz,p_ends_at timestamptz,p_notes text DEFAULT '') RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE v_id uuid; v_pro public.professionals; v_service public.services; v_date date; v_time text;
BEGIN
 SELECT * INTO v_pro FROM public.professionals WHERE id=p_professional_id FOR UPDATE;
 IF NOT FOUND OR NOT v_pro.active OR v_pro.location IS DISTINCT FROM p_unit THEN RAISE EXCEPTION 'PROFESSIONAL_INACTIVE'; END IF;
 SELECT * INTO v_service FROM public.services WHERE id=p_service_id AND active FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'SERVICE_INACTIVE'; END IF;
 IF p_client_name IS NULL OR length(trim(p_client_name)) NOT BETWEEN 3 AND 100 OR p_client_phone IS NULL OR length(p_client_phone) NOT BETWEEN 10 AND 20 OR length(coalesce(p_notes,''))>500 OR p_starts_at IS NULL OR p_ends_at IS NULL OR p_ends_at<>p_starts_at+make_interval(mins=>v_service.duration_minutes) THEN RAISE EXCEPTION 'INVALID_BOOKING'; END IF;
 v_date := (p_starts_at AT TIME ZONE 'America/Maceio')::date;
 v_time := to_char(p_starts_at AT TIME ZONE 'America/Maceio','HH24:MI');
 IF extract(second from p_starts_at)<>0 OR NOT (v_time=ANY(public.available_booking_slots(p_professional_id,p_service_id,v_date))) THEN RAISE EXCEPTION 'SLOT_UNAVAILABLE'; END IF;
 INSERT INTO public.bookings(unit,professional_id,service_id,client_name,client_phone,starts_at,ends_at,status,notes)
 VALUES(p_unit,p_professional_id,p_service_id,trim(p_client_name),p_client_phone,p_starts_at,p_ends_at,'pendente',coalesce(p_notes,'')) RETURNING id INTO v_id;
 INSERT INTO public.leads(id,nome,whatsapp,service_name,professional_id,appointment_date,appointment_time,status_kanban,mensagem_interesse)
 VALUES(v_id,trim(p_client_name),p_client_phone,v_service.name,p_professional_id,v_date,v_time,'novo',coalesce(p_notes,''));
 RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.check_and_create_booking(text,uuid,uuid,text,text,timestamptz,timestamptz,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_create_booking(text,uuid,uuid,text,text,timestamptz,timestamptz,text) TO service_role;

CREATE FUNCTION public.replace_professional_schedule(p_professional_id uuid,p_schedule jsonb) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN
 IF p_schedule IS NULL OR jsonb_typeof(p_schedule)<>'array' OR jsonb_array_length(p_schedule)<>7 THEN RAISE EXCEPTION 'INVALID_SCHEDULE'; END IF;
 IF (SELECT count(distinct (d->>'day_of_week')::int) FROM jsonb_array_elements(p_schedule) d WHERE (d->>'day_of_week')::int BETWEEN 0 AND 6)<>7 THEN RAISE EXCEPTION 'INVALID_SCHEDULE'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_schedule) d WHERE d->>'start_time' IS NULL OR d->>'end_time' IS NULL OR d->>'is_day_off' IS NULL OR (NOT (d->>'is_day_off')::boolean AND (d->>'start_time')::time >= (d->>'end_time')::time)) THEN RAISE EXCEPTION 'INVALID_SCHEDULE'; END IF;
 PERFORM 1 FROM public.professionals WHERE id=p_professional_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'PROFESSIONAL_NOT_FOUND'; END IF;
 DELETE FROM public.professional_schedule WHERE professional_id=p_professional_id::text;
 INSERT INTO public.professional_schedule(professional_id,day_of_week,start_time,end_time,is_day_off)
 SELECT p_professional_id::text,(d->>'day_of_week')::int,(d->>'start_time')::time,(d->>'end_time')::time,(d->>'is_day_off')::boolean FROM jsonb_array_elements(p_schedule) d;
END $$;
REVOKE ALL ON FUNCTION public.replace_professional_schedule(uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.replace_professional_schedule(uuid,jsonb) TO service_role;

-- Enforce no overlapping active appointments for every write path, including admin changes.
ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_overlap EXCLUDE USING gist
 (professional_id WITH =, tstzrange(starts_at,ends_at,'[)') WITH &&) WHERE (status<>'cancelado');

CREATE FUNCTION public.admin_set_lead_status(p_id uuid,p_status text) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN
 IF p_status IS NULL OR p_status NOT IN ('novo','interessado','agendado','concluido','cancelado') THEN RAISE EXCEPTION 'INVALID_STATUS'; END IF;
 UPDATE public.leads SET status_kanban=p_status WHERE id=p_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
 UPDATE public.bookings SET status=CASE p_status WHEN 'agendado' THEN 'confirmado' WHEN 'concluido' THEN 'concluido' WHEN 'cancelado' THEN 'cancelado' ELSE 'pendente' END WHERE id=p_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_lead_status(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_lead_status(uuid,text) TO service_role;

CREATE FUNCTION public.admin_reschedule_lead(p_id uuid,p_date date,p_time time,p_professional_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE v_booking public.bookings; v_pro uuid; v_duration integer; v_start timestamptz; v_unit text;
BEGIN
 SELECT * INTO v_booking FROM public.bookings WHERE id=p_id FOR UPDATE;
 IF FOUND THEN
   IF p_date IS NULL OR p_time IS NULL THEN RAISE EXCEPTION 'INVALID_SCHEDULE'; END IF;
   v_pro := coalesce(p_professional_id,v_booking.professional_id);
   SELECT location INTO v_unit FROM public.professionals WHERE id=v_pro AND active FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'PROFESSIONAL_NOT_FOUND'; END IF;
   SELECT duration_minutes INTO v_duration FROM public.services WHERE id=v_booking.service_id AND active;
   UPDATE public.bookings SET status='cancelado' WHERE id=p_id;
   IF v_duration IS NULL OR extract(second from p_time)<>0 OR NOT(to_char(p_time,'HH24:MI')=ANY(public.available_booking_slots(v_pro,v_booking.service_id,p_date))) THEN RAISE EXCEPTION 'SLOT_UNAVAILABLE'; END IF;
   v_start := (p_date+p_time) AT TIME ZONE 'America/Maceio';
   UPDATE public.bookings SET professional_id=v_pro,unit=v_unit,starts_at=v_start,ends_at=v_start+make_interval(mins=>v_duration),status=v_booking.status WHERE id=p_id;
 END IF;
 UPDATE public.leads SET appointment_date=p_date,appointment_time=to_char(p_time,'HH24:MI'),professional_id=coalesce(p_professional_id,professional_id) WHERE id=p_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.admin_reschedule_lead(uuid,date,time,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reschedule_lead(uuid,date,time,uuid) TO service_role;
