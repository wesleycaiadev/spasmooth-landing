-- Run only against an isolated test database with the migration applied.
BEGIN;
SET LOCAL ROLE anon;
DO $$ BEGIN
 IF has_table_privilege(current_user,'public.leads','SELECT') OR has_table_privilege(current_user,'public.bookings','INSERT') OR has_function_privilege(current_user,'public.update_lead_interest(uuid,text)','EXECUTE') THEN RAISE EXCEPTION 'ANON_PRIVILEGE_TEST_FAILED'; END IF;
END $$;
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 IF has_table_privilege(current_user,'public.leads','SELECT') OR has_table_privilege(current_user,'public.professionals','UPDATE') OR has_function_privilege(current_user,'public.check_and_create_booking(text,uuid,uuid,text,text,timestamptz,timestamptz,text)','EXECUTE') THEN RAISE EXCEPTION 'AUTHENTICATED_PRIVILEGE_TEST_FAILED'; END IF;
END $$;
SET LOCAL ROLE service_role;
DO $$ DECLARE v_pro uuid; v_svc uuid; v_id uuid; v_day date; v_slot text; v_start timestamptz; BEGIN
 IF NOT public.consume_rate_limit(repeat('a',64),2,60) OR NOT public.consume_rate_limit(repeat('a',64),2,60) OR public.consume_rate_limit(repeat('a',64),2,60) THEN RAISE EXCEPTION 'RATE_LIMIT_TEST_FAILED'; END IF;
 INSERT INTO public.professionals(name,location,active) VALUES('SECURITY TRANSACTION TEST','Aracaju',true) RETURNING id INTO v_pro;
 INSERT INTO public.services(name,category,duration_minutes,price,active) VALUES('SECURITY TEST','combo',60,100,true) RETURNING id INTO v_svc;
 v_day := (now() at time zone 'America/Maceio')::date+1;
 IF extract(dow from v_day)=0 THEN v_day:=v_day+1; END IF;
 INSERT INTO public.professional_schedule(professional_id,day_of_week,start_time,end_time,is_day_off)
 VALUES(v_pro::text,extract(dow from v_day)::integer,'08:00','21:00',false);
 IF NOT '20:00'=ANY(public.available_booking_slots(v_pro,v_svc,v_day)) THEN RAISE EXCEPTION 'ADMIN_SCHEDULE_END_TIME_TEST_FAILED'; END IF;
 v_slot := (public.available_booking_slots(v_pro,v_svc,v_day))[1];
 IF v_slot IS NULL THEN RAISE EXCEPTION 'AVAILABILITY_TEST_FAILED'; END IF;
 v_start := (v_day+v_slot::time) AT TIME ZONE 'America/Maceio';
 v_id:=public.check_and_create_booking('Aracaju',v_pro,v_svc,'SECURITY TEST','82999990000',v_start,v_start+interval '1 hour','');
 IF NOT EXISTS(SELECT 1 FROM public.leads WHERE id=v_id AND appointment_date=v_day AND appointment_time=v_slot AND status_kanban='novo') THEN RAISE EXCEPTION 'BOOKING_SYNC_TEST_FAILED'; END IF;
 IF v_slot=ANY(public.available_booking_slots(v_pro,v_svc,v_day)) THEN RAISE EXCEPTION 'PENDING_SLOT_NOT_BLOCKED_TEST_FAILED'; END IF;
 BEGIN
   PERFORM public.check_and_create_booking('Aracaju',v_pro,v_svc,'SECURITY TEST','82999990000',v_start,v_start+interval '1 hour','');
   RAISE EXCEPTION 'DUPLICATE_ACCEPTED';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM<>'SLOT_UNAVAILABLE' THEN RAISE; END IF;
 END;
 BEGIN
   INSERT INTO public.bookings(unit,professional_id,service_id,client_name,client_phone,starts_at,ends_at,status) VALUES('Aracaju',v_pro,v_svc,'SECURITY TEST','82999990000',v_start,v_start+interval '1 hour','pendente');
   RAISE EXCEPTION 'OVERLAP_ACCEPTED';
 EXCEPTION WHEN exclusion_violation THEN NULL;
 END;
 PERFORM public.admin_set_lead_status(v_id,'cancelado');
 IF NOT v_slot=ANY(public.available_booking_slots(v_pro,v_svc,v_day)) THEN RAISE EXCEPTION 'CANCELLED_SLOT_NOT_RELEASED_TEST_FAILED'; END IF;
 v_id:=public.check_and_create_booking('Aracaju',v_pro,v_svc,'SECURITY TEST','82999990000',v_start,v_start+interval '1 hour','');
 PERFORM public.admin_delete_lead_and_booking(v_id);
 IF EXISTS(SELECT 1 FROM public.leads WHERE id=v_id) OR NOT EXISTS(SELECT 1 FROM public.bookings WHERE id=v_id AND status='cancelado') THEN RAISE EXCEPTION 'DELETE_BOOKING_SYNC_TEST_FAILED'; END IF;
 IF NOT v_slot=ANY(public.available_booking_slots(v_pro,v_svc,v_day)) THEN RAISE EXCEPTION 'DELETED_SLOT_NOT_RELEASED_TEST_FAILED'; END IF;
 v_id:=public.check_and_create_booking('Aracaju',v_pro,v_svc,'SECURITY TEST','82999990000',v_start,v_start+interval '1 hour','');
 IF public.apply_signed_booking_action(v_id,'confirmar') <> 'applied' THEN RAISE EXCEPTION 'SIGNED_ACTION_APPLY_TEST_FAILED'; END IF;
 IF public.apply_signed_booking_action(v_id,'confirmar') <> 'already_confirmado' THEN RAISE EXCEPTION 'SIGNED_ACTION_IDEMPOTENCY_TEST_FAILED'; END IF;
 IF public.apply_signed_booking_action(v_id,'recusar') <> 'already_confirmado' THEN RAISE EXCEPTION 'SIGNED_ACTION_CONFLICT_TEST_FAILED'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.bookings WHERE id=v_id AND status='confirmado' AND confirmed_at IS NOT NULL AND confirmed_by='link_assinado') THEN RAISE EXCEPTION 'SIGNED_ACTION_AUDIT_TEST_FAILED'; END IF;
 PERFORM public.admin_set_lead_status(v_id,'agendado');
 IF NOT EXISTS(SELECT 1 FROM public.bookings WHERE id=v_id AND status='confirmado') THEN RAISE EXCEPTION 'STATUS_SYNC_TEST_FAILED'; END IF;
 PERFORM public.admin_reschedule_lead(v_id,v_day,(v_slot::time+interval '1 hour')::time,v_pro);
 IF NOT EXISTS(SELECT 1 FROM public.bookings WHERE id=v_id AND starts_at=v_start+interval '1 hour') THEN RAISE EXCEPTION 'RESCHEDULE_TEST_FAILED'; END IF;
 -- Reset an expired limit, then ensure it can be consumed again.
 UPDATE public.security_rate_limits SET expires_at=now()-interval '1 second' WHERE key=repeat('a',64);
 IF NOT public.consume_rate_limit(repeat('a',64),2,60) THEN RAISE EXCEPTION 'RATE_EXPIRY_TEST_FAILED'; END IF;
END $$;
ROLLBACK;
SELECT 'RLS/grants, rate limits, cancellation/deletion slot release, active-slot blocking, duplicate prevention and rescheduling passed' AS result;
