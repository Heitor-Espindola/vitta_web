import crypto from 'node:crypto'
import path from 'node:path'
import { createRequire } from 'node:module'
import { deleteApp, initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  executeMutation,
  executeQuery,
  getDataConnect,
  mutationRef,
  queryRef,
} from 'firebase/data-connect'

if (process.argv[2] !== 'TEST_ONBOARDING_REGISTRATION_RUNTIME') {
  throw new Error(
    'Confirmacao explicita ausente. Use TEST_ONBOARDING_REGISTRATION_RUNTIME.',
  )
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
const { configstore } = require(path.join(firebaseToolsRoot, 'configstore.js'))
const { requireAuth } = require(path.join(firebaseToolsRoot, 'requireAuth.js'))
const { executeSqlCmdsAsSuperUser } = require(
  path.join(firebaseToolsRoot, 'gcp', 'cloudsql', 'connect.js'),
)

const projectId = 'vitta-5ec1e'
const instanceId = 'vitta-5ec1e-instance'
const databaseId = 'vitta-5ec1e-database'
const apiKey = 'AIzaSyCwH4dDAfqZznP11hjspsLtTrbB0hAE5GY'
const stamp = Date.now()
const email = `onboarding-runtime-${stamp}@vitta.test`
const password = `Vitta!${crypto.randomBytes(18).toString('base64url')}`
const cpf = `8${String(stamp).slice(-10)}`

const tokens = configstore.get('tokens')
const cliUser = configstore.get('user')
if (!tokens?.refresh_token || !cliUser?.email) {
  throw new Error('Firebase CLI sem sessao completa.')
}
setRefreshToken(tokens.refresh_token)
if (tokens.access_token) setAccessToken(tokens.access_token)

const cliOptions = {
  projectId,
  project: projectId,
  tokens,
  user: cliUser,
}
const identityToolkit = new Client({
  urlPrefix: 'https://identitytoolkit.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})

let authUid = null
let firebaseApp = null

function q(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

async function runSql(sql) {
  await executeSqlCmdsAsSuperUser(
    cliOptions,
    instanceId,
    databaseId,
    [sql],
    true,
    false,
  )
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
      `Falha ao criar identidade temporaria: ${payload.error?.message || response.status}.`,
    )
  }
  authUid = payload.localId
}

async function cleanup() {
  if (authUid) {
    await runSql(`
      BEGIN;
      WITH test_patients AS (
        SELECT patient.id
          FROM public.patient patient
          JOIN public."user" app_user ON app_user.id = patient.user_id
         WHERE app_user.auth_uid = ${q(authUid)}
      ), restored AS (
        SELECT application.batch_id, count(*)::integer AS quantity
          FROM public.application application
         WHERE application.patient_id IN (SELECT id FROM test_patients)
           AND application.source = 'EXPERIMENTAL_ONBOARDING'
           AND application.batch_id IS NOT NULL
         GROUP BY application.batch_id
      )
      UPDATE public.batch batch
         SET current_quantity = batch.current_quantity + restored.quantity
        FROM restored
       WHERE batch.id = restored.batch_id;

      DELETE FROM public.application
       WHERE patient_id IN (
         SELECT patient.id
           FROM public.patient patient
           JOIN public."user" app_user ON app_user.id = patient.user_id
          WHERE app_user.auth_uid = ${q(authUid)}
       );
      DELETE FROM public."user" WHERE auth_uid = ${q(authUid)};
      COMMIT;
    `).catch(() => {})
    await identityToolkit
      .post(`projects/${projectId}/accounts:delete`, { localId: authUid })
      .catch(() => {})
  }
  if (firebaseApp) {
    const auth = getAuth(firebaseApp)
    await signOut(auth).catch(() => {})
    await deleteApp(firebaseApp).catch(() => {})
  }
}

async function main() {
  await requireAuth(cliOptions)
  try {
    await createFirebaseUser()
    firebaseApp = initializeApp(
      {
        apiKey,
        authDomain: 'vitta-5ec1e.firebaseapp.com',
        projectId,
        appId: '1:733443225670:web:9334e443d9f13b0092b247',
      },
      `onboarding-runtime-${stamp}`,
    )
    const auth = getAuth(firebaseApp)
    await signInWithEmailAndPassword(auth, email, password)
    await auth.currentUser.getIdToken(true)

    const mobileDataConnect = getDataConnect(firebaseApp, {
      connector: 'mobile-connector',
      service: 'vitta-5ec1e-service',
      location: 'southamerica-east1',
    })
    await executeMutation(
      mutationRef(mobileDataConnect, 'CompleteMobileRegistration', {
        name: 'Teste runtime onboarding',
        birthDate: '1990-01-01',
        email,
        cpf,
        sex: null,
      }),
    )

    const profile = await executeQuery(
      queryRef(mobileDataConnect, 'GetMobileCurrentPerson'),
      { fetchPolicy: 'SERVER_ONLY' },
    )
    const patientId = profile.data.users?.[0]?.patient_on_user?.id
    if (!patientId) throw new Error('Cadastro Mobile nao retornou paciente.')

    const wallet = await executeQuery(
      queryRef(mobileDataConnect, 'GetAccessiblePatientVaccinations', {
        patientId,
      }),
      { fetchPolicy: 'SERVER_ONLY' },
    )
    const applications = wallet.data.applications || []
    if (applications.length !== 6) {
      throw new Error(
        `Carteira Mobile recebeu ${applications.length} registros; esperado 6.`,
      )
    }
    if (
      applications.some(
        (application) =>
          application.source !== 'EXPERIMENTAL_ONBOARDING' ||
          !application.vaccineNameSnapshot ||
          !application.lotSnapshot ||
          !application.facilityNameSnapshot ||
          !application.professionalNameSnapshot,
      )
    ) {
      throw new Error('Carteira Mobile recebeu registro experimental incompleto.')
    }

    process.stdout.write(
      `${JSON.stringify(
        {
          status: 'passed',
          projectId,
          firebaseRegistration: true,
          mobileConnectorRegistration: true,
          persistedApplicationsVisibleToMobile: applications.length,
          source: 'EXPERIMENTAL_ONBOARDING',
          cleanupRequested: true,
          completedAt: new Date().toISOString(),
        },
        null,
        2,
      )}\n`,
    )
  } finally {
    await cleanup()
  }
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
