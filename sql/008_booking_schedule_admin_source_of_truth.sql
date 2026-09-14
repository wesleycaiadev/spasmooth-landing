-- A agenda configurada no Admin é a fonte de verdade para a disponibilidade.
-- Sem configuração para um profissional, preserva-se o expediente legado.
CREATE OR REPLACE FUNCTION public.available_booking_slots(
  p_professional_id uuid,
  p_service_id uuid,
  p_date date
)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_pro public.professionals;
  v_duration integer;
  v_start time;
  v_end time;
  v_sched record;
  v_slot timestamptz;
  v_close timestamptz;
  v_day integer;
  v_slots text[] := '{}';
BEGIN
  IF p_date IS NULL
    OR p_date < (now() AT TIME ZONE 'America/Maceio')::date
    OR p_date > (now() AT TIME ZONE 'America/Maceio')::date + 60 THEN
    RETURN v_slots;
  END IF;

  SELECT * INTO v_pro
  FROM public.professionals
  WHERE id = p_professional_id AND active;

  IF NOT FOUND
    OR p_date < v_pro.location_start_date
    OR p_date > v_pro.location_end_date THEN
    RETURN v_slots;
  END IF;

  SELECT duration_minutes INTO v_duration
  FROM public.services
  WHERE id = p_service_id AND active;

  IF v_duration IS NULL OR v_duration NOT BETWEEN 1 AND 720 THEN
    RETURN v_slots;
  END IF;

  v_day := EXTRACT(DOW FROM p_date);

  SELECT * INTO v_sched
  FROM public.professional_schedule
  WHERE professional_id = p_professional_id::text
    AND day_of_week = v_day
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    IF v_sched.is_day_off THEN
      RETURN v_slots;
    END IF;

    v_start := v_sched.start_time;
    v_end := v_sched.end_time;
  ELSE
    -- Fallback para profissionais antigos sem agenda cadastrada no Admin.
    IF v_day = 0 THEN
      RETURN v_slots;
    END IF;

    v_start := CASE WHEN v_day = 6 THEN '09:00'::time ELSE '08:00'::time END;
    v_end := CASE WHEN v_day = 6 THEN '16:00'::time ELSE '20:00'::time END;
  END IF;

  v_slot := (p_date + v_start) AT TIME ZONE 'America/Maceio';
  v_close := (p_date + v_end) AT TIME ZONE 'America/Maceio';

  WHILE v_slot + make_interval(mins => v_duration) <= v_close LOOP
    IF v_slot >= now() + interval '30 minutes'
      AND NOT EXISTS (
        SELECT 1
        FROM public.bookings
        WHERE professional_id = p_professional_id
          AND status IN ('pendente', 'confirmado')
          AND tstzrange(starts_at, ends_at, '[)')
            && tstzrange(v_slot, v_slot + make_interval(mins => v_duration), '[)')
      ) THEN
      v_slots := array_append(
        v_slots,
        to_char(v_slot AT TIME ZONE 'America/Maceio', 'HH24:MI')
      );
    END IF;

    v_slot := v_slot + interval '1 hour';
  END LOOP;

  RETURN v_slots;
END;
$$;
