import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  executeMutation,
  executeQuery,
  getDataConnect,
  mutationRef,
  queryRef,
} from 'firebase/data-connect'
import {
  createApplication,
  getCurrentPortalUser,
  getPatient,
  getUser,
  voidApplication,
} from '../src/dataconnect-generated/esm/index.esm.js'

if (process.argv[2] !== 'RUN_PRODUCTION_SQL_SMOKE') {
  throw new Error('Confirmação explícita do smoke de produção ausente.')
}

const require = createRequire(import.meta.url)
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
const { configstore } = require(
  path.join(firebaseToolsRoot, 'configstore.js'),
)
const { requireAuth } = require(
  path.join(firebaseToolsRoot, 'requireAuth.js'),
)
const { executeSqlCmdsAsSuperUser } = require(
  path.join(firebaseToolsRoot, 'gcp', 'cloudsql', 'connect.js'),
)

const projectId = 'vitta-5ec1e'
const apiKey = 'AIzaSyCwH4dDAfqZznP11hjspsLtTrbB0hAE5GY'
const instanceId = 'vitta-5ec1e-instance'
const databaseId = 'vitta-5ec1e-database'
const stamp = Date.now()
const email = `sql-smoke-${stamp}@vitta.test`
const password = `Vitta!${crypto.randomBytes(18).toString('base64url')}`
const phone = `1699${String(stamp).slice(-7)}`
const cpf = `9${String(stamp).slice(-10)}`
const userId = crypto.randomUUID()
const patientId = crypto.randomUUID()
const professionalId = crypto.randomUUID()

const tokens = configstore.get('tokens')
const cliUser = configstore.get('user')
if (!tokens?.refresh_token || !cliUser?.email) {
  throw new Error('Firebase CLI sem sessão completa.')
}
setRefreshToken(tokens.refresh_token)
if (tokens.access_token) setAccessToken(tokens.access_token)
const cliOptions = { projectId, project: projectId, tokens, user: cliUser }

const identityToolkit = new Client({
  urlPrefix: 'https://identitytoolkit.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})

let authUid = null
let applicationId = null
let firebaseApp = null

const report = {
  status: 'running',
  orphanSmokeIdentitiesRemoved: 0,
  webSessionFromSql: false,
  mobileSessionFromSql: false,
  webSessionUserFound: false,
  webProfessionalFound: false,
  webUserIdMatches: false,
  webProfessionalIdMatches: false,
  mobileSessionUserFound: false,
  mobilePatientFound: false,
  mobileUserIdMatches: false,
  mobilePatientIdMatches: false,
  mobileToWebPhoneRoundTrip: false,
  webToMobileApplicationRoundTrip: false,
  unrelatedPatientDenied: false,
  testApplicationVoided: false,
  temporaryIdentityRemoved: false,
}

const q = (value) => `'${String(value).replaceAll("'", "''")}'`
const normalizeUuid = (value) => String(value || '').replaceAll('-', '').toLowerCase()

function productionTargetsFromBackup() {
  const backupDir = path.resolve(process.cwd(), '..', 'backups', 'sql')
  const candidates = fs
    .readdirSync(backupDir)
    .filter((name) => /^vitta-sql-post-backfill-.*\.json$/.test(name))
    .map((name) => ({
      path: path.join(backupDir, name),
      modified: fs.statSync(path.join(backupDir, name)).mtimeMs,
    }))
    .sort((left, right) => right.modified - left.modified)
  if (!candidates.length) throw new Error('Backup SQL pós-backfill não encontrado.')
  const backup = JSON.parse(fs.readFileSync(candidates[0].path, 'utf8'))
  const activePatients = (backup.tables.patient || []).filter(
    (item) => item.active !== false,
  )
  const activeVaccineIds = new Set(
    (backup.tables.vaccine || [])
      .filter((item) => item.active !== false)
      .map((item) => item.id),
  )
  const batch = (backup.tables.batch || []).find((item) =>
    activeVaccineIds.has(item.vaccine_id),
  )
  const ubs = (backup.tables.u_b_s || []).find(
    (item) => item.active !== false,
  )
  if (activePatients.length < 2 || !batch?.id || !ubs?.id) {
    throw new Error('Backup sem dados suficientes para o smoke controlado.')
  }
  return {
    patient_id: activePatients[0].id,
    unrelated_patient_id: activePatients[1].id,
    vaccine_id: batch.vaccine_id,
    batch_id: batch.id,
    ubs_id: ubs.id,
  }
}

async function runSql(sql) {
  await requireAuth(cliOptions)
  await executeSqlCmdsAsSuperUser(
    cliOptions,
    instanceId,
    databaseId,
    [sql],
    true,
    false,
  )
}

async function listAuthUsers() {
  const users = []
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
    users.push(...(response.body.users || []))
    nextPageToken = response.body.nextPageToken
  } while (nextPageToken)
  return users
}

async function removeOrphanSmokeData() {
  const oldSmokeUsers = (await listAuthUsers()).filter((item) => {
    try {
      return JSON.parse(item.customAttributes || '{}').smokeTest === true
    } catch {
      return false
    }
  })

  await runSql(`
    BEGIN;
    DELETE FROM public.patient_access
     WHERE grantee_auth_uid IN (
       SELECT auth_uid FROM public."user"
        WHERE email LIKE 'sql-smoke-%@vitta.test'
     );
    DELETE FROM public.patient
     WHERE user_id IN (
       SELECT id FROM public."user"
        WHERE email LIKE 'sql-smoke-%@vitta.test'
     );
    DELETE FROM public.professional
     WHERE user_id IN (
       SELECT id FROM public."user"
        WHERE email LIKE 'sql-smoke-%@vitta.test'
     );
    DELETE FROM public."user" WHERE email LIKE 'sql-smoke-%@vitta.test';
    COMMIT;
  `)

  for (const item of oldSmokeUsers) {
    await identityToolkit.post(`projects/${projectId}/accounts:delete`, {
      localId: item.localId,
    })
  }
  report.orphanSmokeIdentitiesRemoved = oldSmokeUsers.length
}

async function createFirebaseUser() {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  )
  const payload = await response.json()
  if (!response.ok || !payload.localId) {
    throw new Error(
      `Falha ao criar identidade temporária: ${payload.error?.message || response.status}`,
    )
  }
  authUid = payload.localId
  await identityToolkit.post(`projects/${projectId}/accounts:update`, {
    localId: authUid,
    customAttributes: JSON.stringify({ admin: true, smokeTest: true }),
  })
}

async function seedSqlIdentity(target) {
  await runSql(`
    BEGIN;
    DO $verify$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM public.patient WHERE id = ${q(target.patient_id)}::uuid AND active = TRUE) THEN
        RAISE EXCEPTION 'Paciente alvo do smoke não está ativo';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM public.vaccine WHERE id = ${q(target.vaccine_id)}::uuid AND active = TRUE) THEN
        RAISE EXCEPTION 'Vacina alvo do smoke não está ativa';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM public.u_b_s WHERE id = ${q(target.ubs_id)}::uuid AND active = TRUE) THEN
        RAISE EXCEPTION 'UBS alvo do smoke não está ativa';
      END IF;
    END
    $verify$;

    INSERT INTO public."user"
      (id, name, birth_date, email, auth_uid, status, cpf, portal_role, created_at, updated_at)
    VALUES
      (${q(userId)}::uuid, 'Vitta Smoke SQL', DATE '1990-01-01', ${q(email)},
       ${q(authUid)}, 'ACTIVE', ${q(cpf)}, 'PROFESSIONAL', now(), now());

    INSERT INTO public.patient (id, user_id, patient_type, active)
    VALUES (${q(patientId)}::uuid, ${q(userId)}::uuid, 'ADULT', TRUE);

    INSERT INTO public.professional
      (id, user_id, professional_type, professional_registration, ubs_id, active)
    VALUES
      (${q(professionalId)}::uuid, ${q(userId)}::uuid, 'OTHER', 'SMOKE-PROD',
       ${q(target.ubs_id)}::uuid, TRUE);

    INSERT INTO public.patient_access
      (grantee_auth_uid, patient_id, access_kind, view_profile,
       view_vaccination, receive_notifications, consent_status,
       created_at, updated_at)
    VALUES
      (${q(authUid)}, ${q(patientId)}::uuid, 'SELF', TRUE, TRUE, TRUE,
       'GRANTED', now(), now()),
      (${q(authUid)}, ${q(target.patient_id)}::uuid, 'PROFESSIONAL', TRUE, TRUE,
       FALSE, 'GRANTED', now(), now());
    COMMIT;
  `)
}

async function runSdkSmoke(target) {
  firebaseApp = initializeApp(
    {
      apiKey,
      authDomain: 'vitta-5ec1e.firebaseapp.com',
      projectId,
      appId: '1:733443225670:web:9334e443d9f13b0092b247',
    },
    `sql-smoke-${stamp}`,
  )
  const auth = getAuth(firebaseApp)
  await signInWithEmailAndPassword(auth, email, password)
  await auth.currentUser.getIdToken(true)

  const webDc = getDataConnect(firebaseApp, {
    connector: 'example',
    service: 'vitta-5ec1e-service',
    location: 'southamerica-east1',
  })
  const mobileDc = getDataConnect(firebaseApp, {
    connector: 'mobile-connector',
    service: 'vitta-5ec1e-service',
    location: 'southamerica-east1',
  })

  const webProfile = await getCurrentPortalUser(webDc, {
    fetchPolicy: 'SERVER_ONLY',
  })
  const webProfileUser = webProfile.data.users?.[0]
  report.webSessionUserFound = Boolean(webProfileUser)
  report.webProfessionalFound = Boolean(webProfileUser?.professional_on_user)
  report.webUserIdMatches =
    normalizeUuid(webProfileUser?.id) === normalizeUuid(userId)
  report.webProfessionalIdMatches =
    normalizeUuid(webProfileUser?.professional_on_user?.id) ===
    normalizeUuid(professionalId)
  report.webSessionFromSql =
    report.webUserIdMatches && report.webProfessionalIdMatches

  const mobileProfile = await executeQuery(
    queryRef(mobileDc, 'GetMobileCurrentPerson'),
    { fetchPolicy: 'SERVER_ONLY' },
  )
  const mobileProfileUser = mobileProfile.data.users?.[0]
  report.mobileSessionUserFound = Boolean(mobileProfileUser)
  report.mobilePatientFound = Boolean(mobileProfileUser?.patient_on_user)
  report.mobileUserIdMatches =
    normalizeUuid(mobileProfileUser?.id) === normalizeUuid(userId)
  report.mobilePatientIdMatches =
    normalizeUuid(mobileProfileUser?.patient_on_user?.id) ===
    normalizeUuid(patientId)
  report.mobileSessionFromSql =
    report.mobileUserIdMatches && report.mobilePatientIdMatches

  if (!report.webSessionFromSql || !report.mobileSessionFromSql) {
    throw new Error('A sessao autenticada nao corresponde aos perfis SQL temporarios.')
  }

  await executeMutation(
    mutationRef(mobileDc, 'UpdateMobileProfile', {
      name: 'Vitta Smoke SQL',
      phone,
    }),
  )
  const webUser = await getUser(webDc, { id: userId }, {
    fetchPolicy: 'SERVER_ONLY',
  })
  report.mobileToWebPhoneRoundTrip = webUser.data.user?.phone === phone

  const created = await createApplication(webDc, {
    patientId: target.patient_id,
    vaccineId: target.vaccine_id,
    batchId: target.batch_id,
    appointmentId: null,
    professionalId,
    ubsId: target.ubs_id,
    applicationDate: new Date().toISOString(),
    doseNumber: 1,
    notes: `SMOKE SQL CONNECT ${new Date().toISOString()}`,
  })
  applicationId = created.data.application_insert.id

  const mobileVaccinations = await executeQuery(
    queryRef(mobileDc, 'GetAccessiblePatientVaccinations', {
      patientId: target.patient_id,
    }),
    { fetchPolicy: 'SERVER_ONLY' },
  )
  report.webToMobileApplicationRoundTrip =
    mobileVaccinations.data.applications?.some(
      (application) => application.id === applicationId,
    ) === true

  try {
    await getPatient(webDc, { id: target.unrelated_patient_id }, {
      fetchPolicy: 'SERVER_ONLY',
    })
  } catch {
    report.unrelatedPatientDenied = true
  }

  await voidApplication(webDc, {
    id: applicationId,
    reason: 'Smoke de produção SQL Connect concluído',
  })
  report.testApplicationVoided = true
  await signOut(auth)
}

async function cleanup() {
  let sqlError = null
  let authError = null
  if (authUid) {
    try {
      await runSql(`
        BEGIN;
        ${applicationId && !report.testApplicationVoided ? `
        UPDATE public.application
           SET voided_at = COALESCE(voided_at, now()),
               voided_by_auth_uid = COALESCE(voided_by_auth_uid, ${q(authUid)}),
               void_reason = COALESCE(void_reason, 'Smoke interrompido; anulado na limpeza'),
               updated_at = now()
         WHERE id = ${q(applicationId)}::uuid;` : ''}
        DELETE FROM public.patient_access WHERE grantee_auth_uid = ${q(authUid)};
        DELETE FROM public.patient WHERE id = ${q(patientId)}::uuid;
        DELETE FROM public.professional WHERE id = ${q(professionalId)}::uuid;
        DELETE FROM public."user" WHERE id = ${q(userId)}::uuid;
        COMMIT;
      `)
    } catch (error) {
      sqlError = error
    }
    try {
      await identityToolkit.post(`projects/${projectId}/accounts:delete`, {
        localId: authUid,
      })
    } catch (error) {
      authError = error
    }
  }
  if (sqlError || authError) throw sqlError || authError
  report.temporaryIdentityRemoved = true
}

try {
  await removeOrphanSmokeData()
  const target = productionTargetsFromBackup()
  await createFirebaseUser()
  await seedSqlIdentity(target)
  await runSdkSmoke(target)
  report.status = 'passed'
} catch (error) {
  report.status = 'failed'
  report.error = String(error?.message || error).split('\n')[0]
  process.exitCode = 1
} finally {
  try {
    await cleanup()
  } catch (cleanupError) {
    report.status = 'failed_cleanup'
    report.cleanupError = String(cleanupError?.message || cleanupError).split('\n')[0]
    process.exitCode = 1
  }
  if (firebaseApp) await deleteApp(firebaseApp).catch(() => {})
}

report.completedAt = new Date().toISOString()
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
