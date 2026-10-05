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

const projectId = 'vitta-5ec1e'
const instanceId = 'vitta-5ec1e-instance'
const databaseId = 'vitta-5ec1e-database'
const confirmation = process.argv[2]

if (confirmation !== 'RESET_EXPERIMENTAL_VITTA') {
  throw new Error(
    'Confirmação explícita ausente. Use RESET_EXPERIMENTAL_VITTA.',
  )
}

const tokens = configstore.get('tokens')
const user = configstore.get('user')
if (!tokens?.refresh_token || !user?.email) {
  throw new Error('Firebase CLI sem sessão completa. Execute firebase login.')
}

const sql = `
BEGIN;

LOCK TABLE public.application, public.appointment, public.batch, public.vaccine
  IN ACCESS EXCLUSIVE MODE;

DO $verify$
BEGIN
  IF (SELECT count(*) FROM public.patient) = 0 THEN
    RAISE EXCEPTION 'Reset recusado: nenhum paciente foi encontrado.';
  END IF;
  IF (SELECT count(*) FROM public.vaccine WHERE active = TRUE) < 10 THEN
    RAISE EXCEPTION 'Reset recusado: catálogo de vacinas incompleto.';
  END IF;
END
$verify$;

DELETE FROM public.application;
DELETE FROM public.appointment;
DELETE FROM public.batch;

UPDATE public.vaccine
   SET active = TRUE,
       archived_at = NULL,
       archived_by_auth_uid = NULL
 WHERE active IS DISTINCT FROM TRUE
    OR archived_at IS NOT NULL
    OR archived_by_auth_uid IS NOT NULL;

INSERT INTO public.batch (
  id,
  vaccine_id,
  manufacturer,
  batch_code,
  initial_quantity,
  current_quantity,
  manufacturing_date,
  expiration_date
)
SELECT
  uuid_generate_v4(),
  vaccine.id,
  'Estoque experimental Vitta',
  'EXP-2026-' || upper(substr(regexp_replace(
    coalesce(vaccine.short_name, vaccine.name),
    '[^[:alnum:]]+',
    '-',
    'g'
  ), 1, 24)),
  100,
  100,
  DATE '2026-10-01',
  DATE '2027-12-31'
FROM public.vaccine
WHERE vaccine.active = TRUE;

DO $assert$
BEGIN
  IF EXISTS (SELECT 1 FROM public.application) THEN
    RAISE EXCEPTION 'Reset inválido: aplicações permaneceram no banco.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.appointment) THEN
    RAISE EXCEPTION 'Reset inválido: agendamentos permaneceram no banco.';
  END IF;
  IF (SELECT count(*) FROM public.batch) < 10 THEN
    RAISE EXCEPTION 'Reset inválido: lotes experimentais insuficientes.';
  END IF;
  IF EXISTS (
    SELECT 1
      FROM public.vaccine vaccine
     WHERE vaccine.active = TRUE
       AND NOT EXISTS (
         SELECT 1
           FROM public.batch batch
          WHERE batch.vaccine_id = vaccine.id
            AND batch.current_quantity > 0
       )
  ) THEN
    RAISE EXCEPTION 'Reset inválido: vacina ativa sem lote disponível.';
  END IF;
END
$assert$;

COMMIT;
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
        status: 'reset',
        projectId,
        instanceId,
        databaseId,
        preserved: [
          'user',
          'patient',
          'patient_access',
          'family_relationship',
          'professional',
          'u_b_s',
          'vaccine',
        ],
        cleared: ['application', 'appointment', 'batch'],
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
