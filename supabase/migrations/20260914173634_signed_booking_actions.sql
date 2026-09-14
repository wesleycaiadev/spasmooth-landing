-- Signed links are bearer capabilities. The actual mutation is always a POST
-- from the confirmation page, never a GET that a WhatsApp preview could trigger.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS confirmed_by text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_by text;

CREATE OR REPLACE FUNCTION public.apply_signed_booking_action(p_id uuid, p_action text) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE v_status text;
BEGIN
  IF p_action NOT IN ('confirmar', 'recusar') THEN RAISE EXCEPTION 'INVALID_ACTION'; END IF;

  SELECT status INTO v_status FROM public.bookings WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF v_status <> 'pendente' THEN RETURN 'already_' || v_status; END IF;

  IF p_action='confirmar' THEN
    UPDATE public.bookings
      SET status='confirmado', confirmed_at=now(), confirmed_by='link_assinado'
      WHERE id=p_id;
    UPDATE public.leads SET status_kanban='agendado' WHERE id=p_id;
  ELSE
    UPDATE public.bookings
      SET status='cancelado', cancelled_at=now(), cancelled_by='link_assinado'
      WHERE id=p_id;
    UPDATE public.leads SET status_kanban='cancelado' WHERE id=p_id;
  END IF;

  IF NOT FOUND THEN RAISE EXCEPTION 'LEAD_NOT_FOUND'; END IF;
  RETURN 'applied';
END $$;

REVOKE ALL ON FUNCTION public.apply_signed_booking_action(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_signed_booking_action(uuid,text) TO service_role;
