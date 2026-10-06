BEGIN;

CREATE OR REPLACE FUNCTION public.seed_experimental_onboarding_applications(
  p_patient_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_birth_date date;
  v_patient_name text;
  v_patient_legacy_id text;
  v_professional_id uuid;
  v_professional_name text;
  v_professional_registration text;
  v_ubs_id uuid;
  v_ubs_name text;
  v_application_id uuid;
  v_seeded integer := 0;
  vaccine_row record;
  batch_row record;
BEGIN
  SELECT u.birth_date, u.name, p.legacy_person_id
    INTO v_birth_date, v_patient_name, v_patient_legacy_id
    FROM public.patient p
    JOIN public."user" u ON u.id = p.user_id
   WHERE p.id = p_patient_id
     AND p.active = TRUE;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  SELECT p.id,
         u.name,
         p.professional_registration,
         p.ubs_id,
         facility.name
    INTO v_professional_id,
         v_professional_name,
         v_professional_registration,
         v_ubs_id,
         v_ubs_name
    FROM public.professional p
    JOIN public."user" u ON u.id = p.user_id
    LEFT JOIN public.u_b_s facility ON facility.id = p.ubs_id
   WHERE p.active = TRUE
     AND u.status = 'ACTIVE'
     AND (facility.id IS NULL OR facility.active = TRUE)
   ORDER BY (u.portal_role = 'ADMIN') DESC, p.id
   LIMIT 1;

  IF v_ubs_id IS NULL THEN
    SELECT id, name
      INTO v_ubs_id, v_ubs_name
      FROM public.u_b_s
     WHERE active = TRUE
     ORDER BY name, id
     LIMIT 1;
  END IF;

  FOR vaccine_row IN
    WITH initial_schedule(
      short_name,
      application_date,
      dose_number,
      dose_label
    ) AS (
      VALUES
        ('BCG', v_birth_date::timestamp, 1, 'Dose unica'),
        ('HB', v_birth_date::timestamp, 1, '1a dose'),
        (
          'Gripe',
          GREATEST(
            (v_birth_date + INTERVAL '6 months')::timestamp,
            (CURRENT_DATE - INTERVAL '90 days')::timestamp
          ),
          1,
          'Dose anual'
        ),
        (
          'FA',
          (v_birth_date + INTERVAL '9 months')::timestamp,
          1,
          'Dose unica'
        ),
        (
          'SCR',
          (v_birth_date + INTERVAL '12 months')::timestamp,
          1,
          '1a dose'
        ),
        (
          'HPV',
          (v_birth_date + INTERVAL '9 years')::timestamp,
          1,
          '1a dose'
        )
    )
    SELECT vaccine.id AS vaccine_id,
           vaccine.name AS vaccine_name,
           initial_schedule.application_date,
           initial_schedule.dose_number,
           initial_schedule.dose_label
      FROM initial_schedule
      JOIN public.vaccine vaccine
        ON vaccine.short_name = initial_schedule.short_name
       AND vaccine.active = TRUE
     WHERE initial_schedule.application_date::date <= CURRENT_DATE
     ORDER BY initial_schedule.application_date, vaccine.id
  LOOP
    batch_row := NULL;
    SELECT batch.id,
           batch.batch_code,
           batch.manufacturer
      INTO batch_row
      FROM public.batch batch
     WHERE batch.vaccine_id = vaccine_row.vaccine_id
       AND batch.current_quantity > 0
       AND batch.expiration_date >= CURRENT_DATE
     ORDER BY batch.expiration_date, batch.id
     FOR UPDATE SKIP LOCKED
     LIMIT 1;

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    v_application_id := NULL;
    INSERT INTO public.application (
      patient_id,
      vaccine_id,
      batch_id,
      professional_id,
      ubs_id,
      application_date,
      dose_number,
      dose_label,
      legacy_record_id,
      patient_id_snapshot,
      patient_legacy_person_id_snapshot,
      patient_name_snapshot,
      vaccine_name_snapshot,
      lot_snapshot,
      manufacturer_snapshot,
      facility_name_snapshot,
      professional_name_snapshot,
      professional_registration_snapshot,
      source,
      notes,
      created_at,
      updated_at
    )
    VALUES (
      p_patient_id,
      vaccine_row.vaccine_id,
      batch_row.id,
      v_professional_id,
      v_ubs_id,
      vaccine_row.application_date,
      vaccine_row.dose_number,
      vaccine_row.dose_label,
      'experimental-onboarding:' || p_patient_id::text || ':' ||
        vaccine_row.vaccine_id::text,
      p_patient_id,
      v_patient_legacy_id,
      v_patient_name,
      vaccine_row.vaccine_name,
      batch_row.batch_code,
      batch_row.manufacturer,
      COALESCE(v_ubs_name, 'Vitta Experimental'),
      COALESCE(v_professional_name, 'Equipe Vitta Experimental'),
      v_professional_registration,
      'EXPERIMENTAL_ONBOARDING',
      'Registro inicial experimental criado automaticamente no cadastro.',
      now(),
      now()
    )
    ON CONFLICT (legacy_record_id) DO NOTHING
    RETURNING id INTO v_application_id;

    IF v_application_id IS NOT NULL THEN
      UPDATE public.batch
         SET current_quantity = current_quantity - 1
       WHERE id = batch_row.id
         AND current_quantity > 0;
      v_seeded := v_seeded + 1;
    END IF;
  END LOOP;

  RETURN v_seeded;
END
$function$;

REVOKE ALL ON FUNCTION public.seed_experimental_onboarding_applications(uuid)
  FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.seed_experimental_onboarding_after_patient()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $trigger$
BEGIN
  PERFORM public.seed_experimental_onboarding_applications(NEW.id);
  RETURN NEW;
END
$trigger$;

REVOKE ALL ON FUNCTION public.seed_experimental_onboarding_after_patient()
  FROM PUBLIC;

DROP TRIGGER IF EXISTS patient_seed_experimental_onboarding
  ON public.patient;

CREATE TRIGGER patient_seed_experimental_onboarding
AFTER INSERT ON public.patient
FOR EACH ROW
WHEN (NEW.active = TRUE)
EXECUTE FUNCTION public.seed_experimental_onboarding_after_patient();

DO $backfill$
DECLARE
  patient_row record;
BEGIN
  FOR patient_row IN
    SELECT patient.id
      FROM public.patient patient
     WHERE patient.active = TRUE
       AND NOT EXISTS (
         SELECT 1
           FROM public.application application
          WHERE application.patient_id = patient.id
            AND application.voided_at IS NULL
       )
     ORDER BY patient.id
  LOOP
    PERFORM public.seed_experimental_onboarding_applications(patient_row.id);
  END LOOP;
END
$backfill$;

COMMIT;
