ALTER TABLE public.booking_anamneses
  DROP CONSTRAINT booking_anamneses_submission_check,
  ADD CONSTRAINT booking_anamneses_submission_check
    CHECK (jsonb_typeof(submission) = 'object' AND pg_column_size(submission) <= 24576);
