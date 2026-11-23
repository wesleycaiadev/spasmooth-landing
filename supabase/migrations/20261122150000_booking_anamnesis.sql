CREATE TABLE public.booking_anamneses (
  booking_id uuid PRIMARY KEY REFERENCES public.bookings(id) ON DELETE CASCADE,
  questionnaire_version text NOT NULL,
  service_slug text,
  service_category text NOT NULL,
  deadline_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'not_filled', 'completed', 'needs_review', 'reviewed', 'purged')),
  submission jsonb CHECK (jsonb_typeof(submission) = 'object' AND pg_column_size(submission) <= 8192),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  purged_at timestamptz,
  CHECK ((status IN ('completed', 'needs_review', 'reviewed')) = (submission IS NOT NULL AND submitted_at IS NOT NULL)),
  CHECK ((status = 'reviewed') = (reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL))
);

CREATE TABLE public.booking_anamnesis_audit (
  booking_id uuid NOT NULL REFERENCES public.booking_anamneses(booking_id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('submit', 'skip', 'read', 'review', 'purge')),
  actor text,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE public.booking_notification_outbox (
  booking_id uuid PRIMARY KEY REFERENCES public.booking_anamneses(booking_id) ON DELETE CASCADE,
  available_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'accepted', 'unknown', 'failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 3),
  intake_completed boolean NOT NULL DEFAULT false,
  claim_id uuid,
  lease_until timestamptz,
  last_result text CHECK (last_result ~ '^(http_[1-5][0-9]{2}|transport|unrecognized|stale|preflight|lease_expired)$'),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK ((status = 'sending') = (claim_id IS NOT NULL AND lease_until IS NOT NULL))
);

CREATE INDEX booking_anamnesis_pending_deadline ON public.booking_anamneses(deadline_at) WHERE status = 'pending';
CREATE INDEX booking_anamnesis_submitted ON public.booking_anamneses(submitted_at) WHERE submission IS NOT NULL;
CREATE INDEX booking_anamnesis_audit_date ON public.booking_anamnesis_audit(occurred_at);
CREATE INDEX booking_anamnesis_audit_booking ON public.booking_anamnesis_audit(booking_id);
CREATE INDEX booking_notification_due ON public.booking_notification_outbox(available_at) WHERE status = 'queued';
CREATE INDEX booking_notification_lease ON public.booking_notification_outbox(lease_until) WHERE status = 'sending';

ALTER TABLE public.booking_anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_anamnesis_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_notification_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_anamneses, public.booking_anamnesis_audit, public.booking_notification_outbox FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.booking_anamneses, public.booking_notification_outbox TO service_role;
GRANT INSERT, DELETE, SELECT (occurred_at) ON public.booking_anamnesis_audit TO service_role;

CREATE FUNCTION public.create_booking_with_anamnesis(
  p_unit text, p_professional_id uuid, p_service_id uuid, p_client_name text,
  p_client_phone text, p_starts_at timestamptz, p_ends_at timestamptz, p_notes text,
  p_questionnaire_version text, p_delay_seconds integer, p_notify boolean
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  v_booking_id uuid;
  v_deadline timestamptz;
BEGIN
  IF p_delay_seconds IS NULL OR p_delay_seconds NOT BETWEEN 60 AND 1200 THEN
    RAISE EXCEPTION 'INVALID_NOTIFICATION_DELAY';
  END IF;
  v_booking_id := public.check_and_create_booking(
    p_unit, p_professional_id, p_service_id, p_client_name, p_client_phone, p_starts_at, p_ends_at, p_notes
  );
  v_deadline := clock_timestamp() + make_interval(secs => p_delay_seconds);
  INSERT INTO public.booking_anamneses (booking_id, questionnaire_version, service_slug, service_category, deadline_at)
  SELECT v_booking_id, p_questionnaire_version, slug, category, v_deadline FROM public.services WHERE id = p_service_id;
  IF p_notify THEN
    INSERT INTO public.booking_notification_outbox (booking_id, available_at) VALUES (v_booking_id, v_deadline);
  END IF;
  RETURN v_booking_id;
END;
$$;

CREATE FUNCTION public.save_booking_anamnesis(
  p_booking_id uuid, p_version text, p_submission jsonb, p_needs_review boolean
) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  v_status text;
  v_version text;
BEGIN
  SELECT status, questionnaire_version INTO v_status, v_version
    FROM public.booking_anamneses WHERE booking_id = p_booking_id FOR UPDATE;
  IF NOT FOUND OR v_version IS DISTINCT FROM p_version OR v_status = 'purged' THEN RETURN false; END IF;
  IF v_status IN ('completed', 'needs_review', 'reviewed') THEN
    RETURN true;
  END IF;
  IF p_submission IS NULL THEN
    IF v_status = 'pending' THEN
      UPDATE public.booking_anamneses SET status = 'not_filled' WHERE booking_id = p_booking_id;
      INSERT INTO public.booking_anamnesis_audit (booking_id, event) VALUES (p_booking_id, 'skip');
    END IF;
  ELSE
    UPDATE public.booking_anamneses
      SET status = CASE WHEN p_needs_review THEN 'needs_review' ELSE 'completed' END,
          submission = p_submission, submitted_at = clock_timestamp()
      WHERE booking_id = p_booking_id;
    INSERT INTO public.booking_anamnesis_audit (booking_id, event) VALUES (p_booking_id, 'submit');
  END IF;
  UPDATE public.booking_notification_outbox
    SET available_at = CASE WHEN attempts = 0 THEN least(available_at, clock_timestamp()) ELSE available_at END,
        intake_completed = p_submission IS NOT NULL
    WHERE booking_id = p_booking_id AND status = 'queued';
  RETURN true;
END;
$$;

CREATE FUNCTION public.claim_booking_notification(p_booking_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = public, pg_temp AS $$
  WITH candidate AS (
    SELECT booking_id FROM public.booking_notification_outbox
    WHERE status = 'queued' AND available_at <= clock_timestamp()
      AND (p_booking_id IS NULL OR booking_id = p_booking_id)
    ORDER BY available_at, booking_id LIMIT 1 FOR UPDATE SKIP LOCKED
  ), claim AS (
    UPDATE public.booking_notification_outbox o
    SET status = 'sending', attempts = attempts + 1, claim_id = gen_random_uuid(),
        lease_until = clock_timestamp() + interval '2 minutes', updated_at = clock_timestamp()
    FROM candidate c WHERE o.booking_id = c.booking_id
    RETURNING o.booking_id, o.claim_id, o.intake_completed
  )
  SELECT jsonb_build_object(
    'id', c.booking_id, 'claimId', c.claim_id, 'intakeCompleted', c.intake_completed,
    'clientName', b.client_name, 'clientPhone', b.client_phone, 'serviceName', s.name,
    'professionalName', pr.name, 'unit', coalesce(pr.location, b.unit), 'startsAt', b.starts_at,
    'date', (b.starts_at AT TIME ZONE 'America/Maceio')::date,
    'time', to_char(b.starts_at AT TIME ZONE 'America/Maceio', 'HH24:MI')
  )
  FROM claim c JOIN public.bookings b ON b.id = c.booking_id
  LEFT JOIN public.services s ON s.id = b.service_id
  LEFT JOIN public.professionals pr ON pr.id = b.professional_id;
$$;

CREATE FUNCTION public.finish_booking_notification(p_id uuid, p_claim_id uuid, p_result text, p_reason text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  IF p_result IS NULL OR p_result NOT IN ('accepted', 'unknown', 'failed', 'retry') THEN RETURN false; END IF;
  UPDATE public.booking_notification_outbox
    SET status = CASE WHEN p_result <> 'retry' THEN p_result WHEN attempts < 3 THEN 'queued' ELSE 'failed' END,
        available_at = CASE WHEN p_result = 'retry' THEN clock_timestamp() + make_interval(mins => attempts * 2) ELSE available_at END,
        lease_until = NULL, claim_id = NULL, last_result = p_reason, updated_at = clock_timestamp()
    WHERE booking_id = p_id AND claim_id = p_claim_id AND status = 'sending';
  RETURN FOUND;
END;
$$;

CREATE FUNCTION public.maintain_booking_anamneses(p_payload_days integer, p_audit_days integer)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  IF p_payload_days IS NULL OR p_payload_days NOT BETWEEN 1 AND 365
    OR p_audit_days IS NULL OR p_audit_days NOT BETWEEN 1 AND 730 THEN
    RAISE EXCEPTION 'INVALID_RETENTION';
  END IF;
  UPDATE public.booking_anamneses SET status = 'not_filled'
    WHERE status = 'pending' AND deadline_at <= clock_timestamp();
  UPDATE public.booking_notification_outbox
    SET status = 'unknown', claim_id = NULL, lease_until = NULL, last_result = 'lease_expired', updated_at = clock_timestamp()
    WHERE status = 'sending' AND lease_until <= clock_timestamp();
  DELETE FROM public.booking_anamnesis_audit WHERE occurred_at < clock_timestamp() - make_interval(days => p_audit_days);
  WITH purged AS (
    UPDATE public.booking_anamneses
      SET submission = NULL, submitted_at = NULL, reviewed_at = NULL, reviewed_by = NULL,
          status = 'purged', purged_at = clock_timestamp()
      WHERE submission IS NOT NULL AND submitted_at < clock_timestamp() - make_interval(days => p_payload_days)
    RETURNING booking_id
  )
  INSERT INTO public.booking_anamnesis_audit (booking_id, event) SELECT booking_id, 'purge' FROM purged;
END;
$$;

CREATE FUNCTION public.read_booking_anamnesis(p_booking_id uuid, p_actor text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'questionnaire_version', a.questionnaire_version, 'service_slug', a.service_slug, 'service_category', a.service_category,
    'status', CASE WHEN a.status = 'pending' AND a.deadline_at <= clock_timestamp() THEN 'not_filled' ELSE a.status END,
    'submission', a.submission, 'submitted_at', a.submitted_at, 'reviewed_at', a.reviewed_at,
    'reviewed_by', a.reviewed_by, 'purged_at', a.purged_at,
    'client_name', b.client_name, 'starts_at', b.starts_at, 'unit', b.unit,
    'service_name', s.name, 'professional_name', pr.name,
    'notification_status', n.status
  ) INTO v_result
  FROM public.booking_anamneses a JOIN public.bookings b ON b.id = a.booking_id
  LEFT JOIN public.booking_notification_outbox n ON n.booking_id = a.booking_id
  LEFT JOIN public.services s ON s.id = b.service_id
  LEFT JOIN public.professionals pr ON pr.id = b.professional_id
  WHERE a.booking_id = p_booking_id FOR SHARE OF a;
  IF FOUND THEN
    INSERT INTO public.booking_anamnesis_audit (booking_id, event, actor) VALUES (p_booking_id, 'read', p_actor);
  END IF;
  RETURN v_result;
END;
$$;

CREATE FUNCTION public.review_booking_anamnesis(p_booking_id uuid, p_actor text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.booking_anamneses SET status = 'reviewed', reviewed_by = p_actor, reviewed_at = clock_timestamp()
    WHERE booking_id = p_booking_id AND status IN ('completed', 'needs_review');
  IF NOT FOUND THEN RETURN false; END IF;
  INSERT INTO public.booking_anamnesis_audit (booking_id, event, actor) VALUES (p_booking_id, 'review', p_actor);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.create_booking_with_anamnesis(text,uuid,uuid,text,text,timestamptz,timestamptz,text,text,integer,boolean),
  public.save_booking_anamnesis(uuid,text,jsonb,boolean), public.claim_booking_notification(uuid),
  public.finish_booking_notification(uuid,uuid,text,text), public.maintain_booking_anamneses(integer,integer),
  public.read_booking_anamnesis(uuid,text), public.review_booking_anamnesis(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_with_anamnesis(text,uuid,uuid,text,text,timestamptz,timestamptz,text,text,integer,boolean),
  public.save_booking_anamnesis(uuid,text,jsonb,boolean), public.claim_booking_notification(uuid),
  public.finish_booking_notification(uuid,uuid,text,text), public.maintain_booking_anamneses(integer,integer),
  public.read_booking_anamnesis(uuid,text), public.review_booking_anamnesis(uuid,text) TO service_role;
