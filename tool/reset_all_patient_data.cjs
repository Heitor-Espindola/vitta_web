const fs = require('node:fs')
const path = require('node:path')

const firebaseToolsRoot = path.join(
  process.env.APPDATA,
  'npm',
  'node_modules',
  'firebase-tools',
  'lib',
)
const { Client, setAccessToken, setRefreshToken } = require(
  path.join(firebaseToolsRoot, 'apiv2.js'),
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
const sqlBackupPath = path.resolve(process.argv[3] || '')
const authBackupPath = path.resolve(process.argv[4] || '')

if (confirmation !== 'RESET_ALL_VITTA_IDENTITIES') {
  throw new Error(
    'Confirmacao explicita ausente. Use RESET_ALL_VITTA_IDENTITIES.',
  )
}

for (const [label, backupPath] of [
  ['SQL', sqlBackupPath],
  ['Authentication', authBackupPath],
]) {
  if (!backupPath || !fs.existsSync(backupPath)) {
    throw new Error(`Backup ${label} obrigatorio nao encontrado.`)
  }
  if (fs.statSync(backupPath).size === 0) {
    throw new Error(`Backup ${label} obrigatorio esta vazio.`)
  }
}

const tokens = configstore.get('tokens')
const user = configstore.get('user')
if (!tokens?.refresh_token || !user?.email) {
  throw new Error('Firebase CLI sem sessao completa. Execute firebase login.')
}
setRefreshToken(tokens.refresh_token)
if (tokens.access_token) setAccessToken(tokens.access_token)

const options = { projectId, project: projectId, tokens, user }
const identityToolkit = new Client({
  urlPrefix: 'https://identitytoolkit.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})

const cleanupSql = `
BEGIN;

LOCK TABLE public.application,
           public.appointment,
           public.emergency_contact,
           public.family_relationship,
           public.patient_access,
           public.patient,
           public.professional,
           public."user"
  IN ACCESS EXCLUSIVE MODE;

DELETE FROM public.application;
DELETE FROM public.appointment;
DELETE FROM public.emergency_contact;
DELETE FROM public.family_relationship;
DELETE FROM public.patient_access;
DELETE FROM public.patient;
DELETE FROM public.professional;
DELETE FROM public."user";

DO $assert$
BEGIN
  IF EXISTS (SELECT 1 FROM public.application) THEN
    RAISE EXCEPTION 'Reset invalido: aplicacoes permaneceram no banco.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.appointment) THEN
    RAISE EXCEPTION 'Reset invalido: agendamentos permaneceram no banco.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.emergency_contact) THEN
    RAISE EXCEPTION 'Reset invalido: contatos permaneceram no banco.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.family_relationship) THEN
    RAISE EXCEPTION 'Reset invalido: vinculos familiares permaneceram no banco.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.patient_access) THEN
    RAISE EXCEPTION 'Reset invalido: acessos de pacientes permaneceram no banco.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.patient) THEN
    RAISE EXCEPTION 'Reset invalido: pacientes permaneceram no banco.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.professional) THEN
    RAISE EXCEPTION 'Reset invalido: profissionais permaneceram no banco.';
  END IF;
  IF EXISTS (SELECT 1 FROM public."user") THEN
    RAISE EXCEPTION 'Reset invalido: usuarios permaneceram no banco.';
  END IF;
  IF (SELECT count(*) FROM public.vaccine WHERE active = TRUE) < 10 THEN
    RAISE EXCEPTION 'Reset invalido: catalogo de vacinas foi afetado.';
  END IF;
  IF (SELECT count(*) FROM public.batch WHERE current_quantity > 0) < 10 THEN
    RAISE EXCEPTION 'Reset invalido: lotes experimentais foram afetados.';
  END IF;
  IF (SELECT count(*) FROM public.u_b_s WHERE active = TRUE) < 1 THEN
    RAISE EXCEPTION 'Reset invalido: UBS foi afetada.';
  END IF;
END
$assert$;

COMMIT;
`

async function listAuthUsers() {
  const authUsers = []
  let nextPageToken
  do {
    const response = await identityToolkit.get(
      `projects/${projectId}/accounts:batchGet`,
      {
        queryParams: {
          maxResults: 500,
          ...(nextPageToken ? { nextPageToken } : {}),
        },
      },
    )
    authUsers.push(...(response.body.users || []))
    nextPageToken = response.body.nextPageToken
  } while (nextPageToken)
  return authUsers
}

async function cleanupSqlIdentities() {
  await executeSqlCmdsAsSuperUser(
    options,
    instanceId,
    databaseId,
    [cleanupSql],
    true,
    false,
  )
}

async function main() {
  await requireAuth(options)

  const initialAuthUsers = await listAuthUsers()
  await cleanupSqlIdentities()

  let deletedAuthUsers = 0
  let deletionErrors = 0
  for (let pass = 0; pass < 3; pass += 1) {
    const authUsers = await listAuthUsers()
    if (authUsers.length === 0) break
    for (const authUser of authUsers) {
      try {
        await identityToolkit.post(`projects/${projectId}/accounts:delete`, {
          localId: authUser.localId,
        })
        deletedAuthUsers += 1
      } catch {
        deletionErrors += 1
      }
    }
  }

  // A segunda limpeza remove qualquer perfil criado durante a janela de corte.
  await cleanupSqlIdentities()
  const remainingAuthUsers = await listAuthUsers()
  if (remainingAuthUsers.length > 0) {
    throw new Error(
      `Reset incompleto: ${remainingAuthUsers.length} contas do Authentication permaneceram.`,
    )
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        status: 'reset',
        projectId,
        instanceId,
        databaseId,
        initialAuthUsers: initialAuthUsers.length,
        deletedAuthUsers,
        deletionErrors,
        remainingAuthUsers: remainingAuthUsers.length,
        cleared: [
          'application',
          'appointment',
          'emergency_contact',
          'family_relationship',
          'patient_access',
          'patient',
          'professional',
          'user',
          'firebase_auth_accounts',
        ],
        preserved: ['vaccine', 'batch', 'u_b_s'],
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
