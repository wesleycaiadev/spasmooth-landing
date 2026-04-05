CREATE OR REPLACE FUNCTION public.check_and_create_booking(
    p_unit            text,
    p_professional_id uuid,
    p_service_id      uuid,
    p_client_name     text,
    p_client_phone    text,
    p_starts_at       timestamptz,
    p_ends_at         timestamptz,
    p_notes           text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking_id  uuid;
    v_conflict_id uuid;
    v_pro_active  boolean;
    v_svc_active  boolean;
BEGIN
    SELECT active INTO v_pro_active
    FROM professionals WHERE id = p_professional_id;

    IF v_pro_active IS NULL THEN RAISE EXCEPTION 'PROFESSIONAL_NOT_FOUND'; END IF;
    IF v_pro_active = false THEN RAISE EXCEPTION 'PROFESSIONAL_INACTIVE'; END IF;

    SELECT active INTO v_svc_active
    FROM services WHERE id = p_service_id;

    IF v_svc_active IS NULL THEN RAISE EXCEPTION 'SERVICE_NOT_FOUND'; END IF;
    IF v_svc_active = false THEN RAISE EXCEPTION 'SERVICE_INACTIVE'; END IF;

    SELECT id INTO v_conflict_id
    FROM bookings
    WHERE professional_id = p_professional_id
      AND status != 'cancelado'
      AND tstzrange(starts_at, ends_at) && tstzrange(p_starts_at, p_ends_at)
    ORDER BY starts_at
    LIMIT 1
    FOR UPDATE;

    IF v_conflict_id IS NOT NULL THEN RAISE EXCEPTION 'SLOT_UNAVAILABLE'; END IF;

    INSERT INTO bookings (
        unit, professional_id, service_id,
        client_name, client_phone,
        starts_at, ends_at, status, notes
    ) VALUES (
        p_unit, p_professional_id, p_service_id,
        p_client_name, p_client_phone,
        p_starts_at, p_ends_at, 'pendente', COALESCE(p_notes, '')
    )
    RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_create_booking TO anon;
GRANT EXECUTE ON FUNCTION public.check_and_create_booking TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_create_booking TO authenticated;