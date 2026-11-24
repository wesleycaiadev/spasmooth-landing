BEGIN;
DO $$
DECLARE
  v_role text;
  v_table text;
  v_function record;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    FOREACH v_table IN ARRAY ARRAY['booking_anamneses', 'booking_anamnesis_audit', 'booking_notification_outbox'] LOOP
      IF has_table_privilege(v_role, 'public.' || v_table, 'SELECT,INSERT,UPDATE,DELETE') OR NOT
        (SELECT relrowsecurity FROM pg_class WHERE oid = ('public.' || v_table)::regclass)
      THEN RAISE EXCEPTION 'ANAMNESIS_TABLE_PRIVILEGE_FAILED'; END IF;
    END LOOP;
    FOR v_function IN SELECT oid FROM pg_proc
      WHERE pronamespace = 'public'::regnamespace AND (proname LIKE '%booking%anamnes%' OR proname LIKE '%booking_notification%')
    LOOP
      IF has_function_privilege(v_role, v_function.oid, 'EXECUTE')
      THEN RAISE EXCEPTION 'ANAMNESIS_RPC_PRIVILEGE_FAILED'; END IF;
    END LOOP;
  END LOOP;
END;
$$;

SET LOCAL ROLE service_role;
DO $$
DECLARE
  v_pro uuid;
  v_service uuid;
  v_day date := (now() AT TIME ZONE 'America/Maceio')::date + 1;
  v_start timestamptz;
  v_ids uuid[] := '{}';
  v_id uuid;
  v_claim jsonb;
  v_report jsonb;
  v_submission jsonb := '{"consent":true,"privacyVersion":"spa-aviso-1","goals":["tension"],"answers":{"pressure":"light"},"regions":[{"region":"back-lower","kind":"discomfort","intensity":3}]}';
  v_clinical jsonb := '{"consent":true,"privacyVersion":"spa-aviso-2","goals":["self_care"],"answers":{"medications":"discuss"},"regions":[{"region":"back-lower-left","kind":"discomfort","intensity":0},{"region":"back-lower-right","kind":"discomfort","intensity":10,"sensations":["tingling"]},{"region":"back-lower-right","kind":"avoid"}]}';
BEGIN
  IF extract(dow FROM v_day) = 0 THEN v_day := v_day + 1; END IF;
  INSERT INTO public.professionals(name, location, active) VALUES ('Fixture Anamnese', 'Aracaju', true) RETURNING id INTO v_pro;
  INSERT INTO public.services(name, slug, category, duration_minutes, price, active)
    VALUES ('Massagem de teste', 'massagem-fixture', 'massage', 45, 100, true) RETURNING id INTO v_service;
  v_start := (v_day + '09:00'::time) AT TIME ZONE 'America/Maceio';

  v_id := public.check_and_create_booking('Aracaju', v_pro, v_service, 'Pessoa Teste', '82999990000', v_start, v_start + interval '45 minutes', '');
  IF EXISTS (SELECT 1 FROM public.booking_anamneses WHERE booking_id = v_id)
  THEN RAISE EXCEPTION 'LEGACY_BOOKING_CREATED_ANAMNESIS'; END IF;

  FOR i IN 1..6 LOOP
    v_start := v_start + interval '1 hour';
    v_ids := array_append(v_ids, public.create_booking_with_anamnesis(
      'Aracaju', v_pro, v_service, 'Pessoa Teste', '82999990000', v_start, v_start + interval '45 minutes', 'OBSERVACAO_RESTRITA',
      CASE WHEN i = 6 THEN 'spa-2' ELSE 'spa-1' END, 300, i < 6));
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM public.leads WHERE id = v_ids[1] AND status_kanban = 'novo')
    OR EXISTS (SELECT 1 FROM public.booking_notification_outbox WHERE booking_id = v_ids[6])
  THEN RAISE EXCEPTION 'NEW_BOOKING_SYNC_OR_NOTIFICATION_FLAG_FAILED'; END IF;
  IF public.save_booking_anamnesis(v_ids[6], 'spa-1', v_submission, false)
    OR NOT public.save_booking_anamnesis(v_ids[6], 'spa-2', v_clinical, true)
  THEN RAISE EXCEPTION 'CLINICAL_VERSION_SUBMISSION_FAILED'; END IF;
  v_report := public.read_booking_anamnesis(v_ids[6], 'user_test');
  IF v_report->'submission' IS DISTINCT FROM v_clinical OR v_report->>'status' IS DISTINCT FROM 'needs_review'
  THEN RAISE EXCEPTION 'CLINICAL_VALUES_OR_REVIEW_NOT_PERSISTED'; END IF;
  IF (SELECT deadline_at - available_at FROM public.booking_anamneses a JOIN public.booking_notification_outbox n USING (booking_id) WHERE booking_id = v_ids[1])
    IS DISTINCT FROM interval '0 seconds'
    OR public.claim_booking_notification(v_ids[1]) IS NOT NULL
  THEN RAISE EXCEPTION 'NOTIFICATION_SENT_BEFORE_DEADLINE'; END IF;

  IF public.save_booking_anamnesis(v_ids[1], 'unknown', v_submission, true)
    OR NOT public.save_booking_anamnesis(v_ids[1], 'spa-1', v_submission, true)
  THEN RAISE EXCEPTION 'INTAKE_VERSION_OR_SUBMISSION_FAILED'; END IF;
  v_claim := public.claim_booking_notification(v_ids[1]);
  IF (v_claim->>'intakeCompleted')::boolean IS DISTINCT FROM true
    OR v_claim::text LIKE '%OBSERVACAO_RESTRITA%' OR v_claim::text LIKE '%back-lower%'
    OR public.claim_booking_notification(v_ids[1]) IS NOT NULL
    OR public.finish_booking_notification(v_ids[1], gen_random_uuid(), 'accepted', 'http_200')
  THEN RAISE EXCEPTION 'CLAIM_DUPLICATION_DATA_LEAK_OR_OWNERSHIP_FAILED'; END IF;
  IF NOT public.finish_booking_notification(v_ids[1], (v_claim->>'claimId')::uuid, 'accepted', 'http_200')
    OR public.claim_booking_notification(v_ids[1]) IS NOT NULL
  THEN RAISE EXCEPTION 'NOTIFICATION_NOT_FINAL'; END IF;

  v_report := public.read_booking_anamnesis(v_ids[1], 'user_test');
  IF v_report->>'status' IS DISTINCT FROM 'needs_review' OR v_report->'submission' IS DISTINCT FROM v_submission
    OR v_report->>'professional_name' IS DISTINCT FROM 'Fixture Anamnese' OR v_report->>'notification_status' IS DISTINCT FROM 'accepted'
    OR NOT public.review_booking_anamnesis(v_ids[1], 'user_test')
    OR public.review_booking_anamnesis(v_ids[1], 'other_user')
  THEN RAISE EXCEPTION 'ADMIN_REPORT_OR_REVIEW_FAILED'; END IF;
  v_report := public.read_booking_anamnesis(v_ids[1], 'user_test');
  IF v_report->>'reviewed_by' IS DISTINCT FROM 'user_test' OR v_report->>'status' IS DISTINCT FROM 'reviewed'
    OR NOT public.save_booking_anamnesis(v_ids[1], 'spa-1', NULL, false)
    OR public.read_booking_anamnesis(v_ids[1], 'user_test')->'submission' IS DISTINCT FROM v_submission
  THEN RAISE EXCEPTION 'REVIEW_WAS_OVERWRITTEN'; END IF;

  IF NOT public.save_booking_anamnesis(v_ids[2], 'spa-1', NULL, false) THEN RAISE EXCEPTION 'SKIP_FAILED'; END IF;
  v_claim := public.claim_booking_notification(v_ids[2]);
  IF (v_claim->>'intakeCompleted')::boolean IS DISTINCT FROM false
    OR NOT public.finish_booking_notification(v_ids[2], (v_claim->>'claimId')::uuid, 'unknown', 'transport')
    OR public.claim_booking_notification(v_ids[2]) IS NOT NULL
  THEN RAISE EXCEPTION 'SKIP_OR_UNKNOWN_OUTCOME_RETRIED'; END IF;

  UPDATE public.booking_anamneses SET deadline_at = now() - interval '1 minute' WHERE booking_id = v_ids[3];
  UPDATE public.booking_notification_outbox SET available_at = now() - interval '1 minute' WHERE booking_id = v_ids[3];
  PERFORM public.maintain_booking_anamneses(30, 90);
  v_claim := public.claim_booking_notification();
  IF (v_claim->>'id')::uuid IS DISTINCT FROM v_ids[3]
    OR (v_claim->>'intakeCompleted')::boolean IS DISTINCT FROM false
    OR public.read_booking_anamnesis(v_ids[3], 'user_test')->>'status' IS DISTINCT FROM 'not_filled'
    OR NOT public.finish_booking_notification(v_ids[3], (v_claim->>'claimId')::uuid, 'accepted', 'http_200')
    OR NOT public.save_booking_anamnesis(v_ids[3], 'spa-1', v_submission, false)
    OR public.claim_booking_notification(v_ids[3]) IS NOT NULL
    OR public.read_booking_anamnesis(v_ids[3], 'user_test')->>'status' IS DISTINCT FROM 'completed'
  THEN RAISE EXCEPTION 'ABANDONMENT_OR_LATE_SUBMISSION_FAILED'; END IF;

  PERFORM public.save_booking_anamnesis(v_ids[4], 'spa-1', NULL, false);
  FOR i IN 1..3 LOOP
    v_claim := public.claim_booking_notification(v_ids[4]);
    IF v_claim IS NULL OR NOT public.finish_booking_notification(v_ids[4], (v_claim->>'claimId')::uuid, 'retry', 'http_429')
      OR public.claim_booking_notification(v_ids[4]) IS NOT NULL
    THEN RAISE EXCEPTION 'BACKOFF_FAILED'; END IF;
    UPDATE public.booking_notification_outbox SET available_at = now() - interval '1 minute' WHERE booking_id = v_ids[4];
  END LOOP;
  IF public.claim_booking_notification(v_ids[4]) IS NOT NULL
    OR NOT EXISTS (SELECT 1 FROM public.booking_notification_outbox WHERE booking_id = v_ids[4] AND status = 'failed' AND attempts = 3)
  THEN RAISE EXCEPTION 'RETRY_LIMIT_FAILED'; END IF;

  PERFORM public.save_booking_anamnesis(v_ids[5], 'spa-1', NULL, false);
  v_claim := public.claim_booking_notification(v_ids[5]);
  UPDATE public.booking_notification_outbox SET lease_until = now() - interval '1 minute' WHERE booking_id = v_ids[5];
  UPDATE public.booking_anamneses SET submitted_at = now() - interval '40 days' WHERE booking_id = v_ids[1];
  INSERT INTO public.booking_anamnesis_audit (booking_id, event, occurred_at) VALUES (v_ids[1], 'read', now() - interval '100 days');
  PERFORM public.maintain_booking_anamneses(30, 90);
  IF public.claim_booking_notification(v_ids[5]) IS NOT NULL
    OR public.finish_booking_notification(v_ids[5], (v_claim->>'claimId')::uuid, 'accepted', 'http_200')
    OR NOT EXISTS (SELECT 1 FROM public.booking_notification_outbox WHERE booking_id = v_ids[5] AND status = 'unknown' AND last_result = 'lease_expired')
    OR public.read_booking_anamnesis(v_ids[1], 'user_test')->>'status' IS DISTINCT FROM 'purged'
    OR EXISTS (SELECT 1 FROM public.booking_anamnesis_audit WHERE occurred_at < now() - interval '90 days')
    OR public.save_booking_anamnesis(v_ids[1], 'spa-1', v_submission, true)
  THEN RAISE EXCEPTION 'LEASE_OR_RETENTION_FAILED'; END IF;

  IF public.apply_signed_booking_action(v_ids[1], 'confirmar') <> 'applied'
    OR public.apply_signed_booking_action(v_ids[2], 'recusar') <> 'applied'
  THEN RAISE EXCEPTION 'SIGNED_BOOKING_ACTION_FAILED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE id = v_ids[1] AND status = 'confirmado')
    OR NOT EXISTS (SELECT 1 FROM public.bookings WHERE id = v_ids[2] AND status = 'cancelado')
  THEN RAISE EXCEPTION 'SIGNED_BOOKING_WORKFLOW_CHANGED'; END IF;
END;
$$;

RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.booking_anamnesis_audit WHERE event = 'read' AND actor = 'user_test')
    OR NOT EXISTS (SELECT 1 FROM public.booking_anamnesis_audit WHERE event = 'review' AND actor = 'user_test')
    OR NOT EXISTS (SELECT 1 FROM public.booking_anamnesis_audit WHERE event = 'purge')
  THEN RAISE EXCEPTION 'AUDIT_EVENTS_MISSING'; END IF;
END;
$$;
ROLLBACK;
SELECT 'Anamnesis, review, access grants, retention, and notification state transitions passed' AS result;
