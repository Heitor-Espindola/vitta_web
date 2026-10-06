const path = require('node:path')

const firebaseToolsRoot = path.join(
  process.env.APPDATA,
  'npm',
  'node_modules',
  'firebase-tools',
  'lib',
)
const { configstore } = require(path.join(firebaseToolsRoot, 'configstore.js'))
const { requireAuth } = require(path.join(firebaseToolsRoot, 'requireAuth.js'))
const { executeSqlCmdsAsSuperUser } = require(
  path.join(firebaseToolsRoot, 'gcp', 'cloudsql', 'connect.js'),
)

if (process.argv[2] !== 'TEST_EXPERIMENTAL_ONBOARDING_SEED') {
  throw new Error(
    'Confirmacao explicita ausente. Use TEST_EXPERIMENTAL_ONBOARDING_SEED.',
  )
}

const projectId = 'vitta-5ec1e'
const instanceId = 'vitta-5ec1e-instance'
const databaseId = 'vitta-5ec1e-database'
const tokens = configstore.get('tokens')
const user = configstore.get('user')
if (!tokens?.refresh_token || !user?.email) {
  throw new Error('Firebase CLI sem sessao completa. Execute firebase login.')
}

const sql = `
BEGIN;

CREATE TEMP TABLE seed_test_before AS
SELECT coalesce(sum(current_quantity), 0)::integer AS total_quantity
  FROM public.batch;

INSERT INTO public."user"
  (id, name, birth_date, email, auth_uid, status, cpf, portal_role,
   created_at, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', 'Teste adulto onboarding',
   DATE '1990-01-01', NULL, NULL, 'ACTIVE', '91000000001', 'PATIENT',
   now(), now()),
  ('91000000-0000-4000-8000-000000000002', 'Teste crianca onboarding',
   CURRENT_DATE - INTERVAL '8 years', NULL, NULL, 'ACTIVE', '91000000002',
   'PATIENT', now(), now()),
  ('91000000-0000-4000-8000-000000000003', 'Teste recem nascido onboarding',
   CURRENT_DATE, NULL, NULL, 'ACTIVE', '91000000003', 'PATIENT', now(), now());

INSERT INTO public.patient (id, user_id, patient_type, active)
VALUES
  ('92000000-0000-4000-8000-000000000001',
   '91000000-0000-4000-8000-000000000001', 'ADULT', TRUE),
  ('92000000-0000-4000-8000-000000000002',
   '91000000-0000-4000-8000-000000000002', 'CHILD', TRUE),
  ('92000000-0000-4000-8000-000000000003',
   '91000000-0000-4000-8000-000000000003', 'CHILD', TRUE);

DO $assert$
DECLARE
  adult_count integer;
  child_count integer;
  newborn_count integer;
  before_quantity integer;
  after_quantity integer;
  duplicate_count integer;
BEGIN
  SELECT count(*) INTO adult_count
    FROM public.application
   WHERE patient_id = '92000000-0000-4000-8000-000000000001';
  SELECT count(*) INTO child_count
    FROM public.application
   WHERE patient_id = '92000000-0000-4000-8000-000000000002';
  SELECT count(*) INTO newborn_count
    FROM public.application
   WHERE patient_id = '92000000-0000-4000-8000-000000000003';

  IF adult_count <> 6 THEN
    RAISE EXCEPTION 'Adulto recebeu % registros; esperado 6.', adult_count;
  END IF;
  IF child_count <> 5 THEN
    RAISE EXCEPTION 'Crianca recebeu % registros; esperado 5.', child_count;
  END IF;
  IF newborn_count <> 2 THEN
    RAISE EXCEPTION 'Recem-nascido recebeu % registros; esperado 2.', newborn_count;
  END IF;
  IF EXISTS (
    SELECT 1
      FROM public.application
     WHERE patient_id IN (
       '92000000-0000-4000-8000-000000000001',
       '92000000-0000-4000-8000-000000000002',
       '92000000-0000-4000-8000-000000000003'
     )
       AND (
         source <> 'EXPERIMENTAL_ONBOARDING'
         OR legacy_record_id IS NULL
         OR patient_name_snapshot IS NULL
         OR vaccine_name_snapshot IS NULL
         OR lot_snapshot IS NULL
         OR manufacturer_snapshot IS NULL
         OR facility_name_snapshot IS NULL
         OR professional_name_snapshot IS NULL
         OR application_date > now()
       )
  ) THEN
    RAISE EXCEPTION 'Registro experimental incompleto ou com data futura.';
  END IF;

  SELECT total_quantity INTO before_quantity FROM seed_test_before;
  SELECT coalesce(sum(current_quantity), 0)::integer INTO after_quantity
    FROM public.batch;
  IF before_quantity - after_quantity <> 13 THEN
    RAISE EXCEPTION 'Estoque alterou %, esperado 13.',
      before_quantity - after_quantity;
  END IF;

  PERFORM public.seed_experimental_onboarding_applications(
    '92000000-0000-4000-8000-000000000001'
  );
  SELECT count(*) INTO duplicate_count
    FROM public.application
   WHERE patient_id = '92000000-0000-4000-8000-000000000001';
  IF duplicate_count <> 6 THEN
    RAISE EXCEPTION 'Repeticao criou duplicatas.';
  END IF;
  SELECT coalesce(sum(current_quantity), 0)::integer INTO after_quantity
    FROM public.batch;
  IF before_quantity - after_quantity <> 13 THEN
    RAISE EXCEPTION 'Repeticao consumiu estoque novamente.';
  END IF;
END
$assert$;

ROLLBACK;
`

async function main() {
  const options = { projectId, project: projectId, tokens, user }
  await requireAuth(options)
  await executeSqlCmdsAsSuperUser(
    options,
    instanceId,
    databaseId,
    [sql],
    true,
    false,
  )
  process.stdout.write(
    `${JSON.stringify(
      {
        status: 'passed',
        projectId,
        tested: {
          adultApplications: 6,
          childApplications: 5,
          newbornApplications: 2,
          idempotent: true,
          stockAtomic: true,
          transactionRolledBack: true,
        },
        completedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  )
}

main().catch((error) => {
  process.stderr.write(
    `${JSON.stringify({
      status: 'failed',
      message: String(error?.message || error).split('\n')[0],
    })}\n`,
  )
  process.exitCode = 1
})
