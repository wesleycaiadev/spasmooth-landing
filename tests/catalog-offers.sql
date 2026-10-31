-- Local fixture only: applied after all migrations, never against production.
DO $$ DECLARE v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.services WHERE slug IN (
    'combo-desacelera','combo-contorno-cuidado','combo-leveza','combo-recupera',
    'mensal-modeladora-10-sessoes','mensal-sueca-4-sessoes');
  IF v_count <> 6 THEN RAISE EXCEPTION 'SIX_OFFERS_MISSING_OR_DUPLICATED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.services WHERE slug='combo-desacelera' AND price=160 AND duration_minutes=45)
    OR NOT EXISTS (SELECT 1 FROM public.services WHERE slug='combo-contorno-cuidado' AND price=190 AND duration_minutes=45)
    OR NOT EXISTS (SELECT 1 FROM public.services WHERE slug='combo-leveza' AND price=180 AND duration_minutes=45)
    OR NOT EXISTS (SELECT 1 FROM public.services WHERE slug='combo-recupera' AND price=150 AND duration_minutes=45)
    OR NOT EXISTS (SELECT 1 FROM public.services WHERE slug='mensal-modeladora-10-sessoes' AND category='mensal' AND price=800 AND reference_price=1200 AND session_count=10 AND validity_days=30 AND duration_minutes=45)
    OR NOT EXISTS (SELECT 1 FROM public.services WHERE slug='mensal-sueca-4-sessoes' AND category='mensal' AND price=300 AND reference_price=400 AND session_count=4 AND validity_days=30 AND duration_minutes=45)
  THEN RAISE EXCEPTION 'OFFER_PRICE_OR_TERMS_MISMATCH'; END IF;
END $$;

-- A monthly booking still occupies only one 45-minute slot.
BEGIN;
SET LOCAL ROLE service_role;
DO $$ DECLARE v_pro uuid; v_service uuid; v_day date; v_slot text; v_start timestamptz; v_booking uuid;
BEGIN
  INSERT INTO public.professionals(name,location,active) VALUES('MONTHLY FIXTURE','Aracaju',true) RETURNING id INTO v_pro;
  SELECT id INTO v_service FROM public.services WHERE slug='mensal-modeladora-10-sessoes';
  v_day := (now() AT TIME ZONE 'America/Maceio')::date + 1;
  IF extract(dow FROM v_day)=0 THEN v_day:=v_day+1; END IF;
  v_slot := (public.available_booking_slots(v_pro,v_service,v_day))[1];
  IF v_slot IS NULL THEN RAISE EXCEPTION 'MONTHLY_AVAILABILITY_MISSING'; END IF;
  v_start := (v_day+v_slot::time) AT TIME ZONE 'America/Maceio';
  v_booking := public.check_and_create_booking('Aracaju',v_pro,v_service,'MONTHLY TEST','82999990000',v_start,v_start+interval '45 minutes','');
  IF NOT EXISTS(SELECT 1 FROM public.bookings WHERE id=v_booking AND ends_at-starts_at=interval '45 minutes')
  THEN RAISE EXCEPTION 'PACKAGE_RESERVED_ALL_SESSIONS_AS_ONE'; END IF;
END $$;
ROLLBACK;
SELECT 'Six offers, exact prices, package terms and 45-minute individual session booking passed' AS result;
