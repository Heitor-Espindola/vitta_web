BEGIN;

-- Adds realistic next-dose examples to the persisted experimental onboarding
-- records. The application itself continues to read only database records.
CREATE OR REPLACE FUNCTION public.schedule_experimental_onboarding_doses(
  p_patient_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_updated integer := 0;
BEGIN
  WITH scheduled AS (
    UPDATE public.application application
       SET next_dose_at = CASE vaccine.short_name
         -- The next annual influenza dose remains upcoming.
         WHEN 'Gripe' THEN application.application_date + INTERVAL '1 year'
         -- Missing continuation doses remain visible as overdue when applicable.
         WHEN 'HB' THEN application.application_date + INTERVAL '2 months'
         WHEN 'SCR' THEN application.application_date + INTERVAL '3 months'
         ELSE application.next_dose_at
       END,
       updated_at = now()
      FROM public.vaccine vaccine
     WHERE application.patient_id = p_patient_id
       AND application.vaccine_id = vaccine.id
       AND application.source = 'EXPERIMENTAL_ONBOARDING'
       AND application.voided_at IS NULL
       AND vaccine.short_name IN ('Gripe', 'HB', 'SCR')
       AND application.next_dose_at IS DISTINCT FROM CASE vaccine.short_name
         WHEN 'Gripe' THEN application.application_date + INTERVAL '1 year'
         WHEN 'HB' THEN application.application_date + INTERVAL '2 months'
         WHEN 'SCR' THEN application.application_date + INTERVAL '3 months'
         ELSE application.next_dose_at
       END
    RETURNING 1
  )
  SELECT count(*) INTO v_updated FROM scheduled;

  RETURN v_updated;
END
$function$;

REVOKE ALL ON FUNCTION public.schedule_experimental_onboarding_doses(uuid)
  FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.seed_experimental_onboarding_after_patient()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $trigger$
BEGIN
  PERFORM public.seed_experimental_onboarding_applications(NEW.id);
  PERFORM public.schedule_experimental_onboarding_doses(NEW.id);
  RETURN NEW;
END
$trigger$;

REVOKE ALL ON FUNCTION public.seed_experimental_onboarding_after_patient()
  FROM PUBLIC;

DO $backfill$
DECLARE
  patient_row record;
BEGIN
  FOR patient_row IN
    SELECT DISTINCT application.patient_id AS id
      FROM public.application application
     WHERE application.source = 'EXPERIMENTAL_ONBOARDING'
       AND application.voided_at IS NULL
     ORDER BY application.patient_id
  LOOP
    PERFORM public.schedule_experimental_onboarding_doses(patient_row.id);
  END LOOP;
END
$backfill$;

COMMIT;
