import crypto from 'node:crypto'
import path from 'node:path'
import { createRequire } from 'node:module'
import { deleteApp, initializeApp } from 'firebase/app'
import {
  getAuth,
  getIdTokenResult,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getDataConnect } from 'firebase/data-connect'
import { getCurrentPortalUser } from '../src/dataconnect-generated/esm/index.esm.js'

if (process.argv[2] !== 'CREATE_VITTA_WEB_PROFESSIONAL') {
  throw new Error(
    'Confirmacao explicita ausente. Use CREATE_VITTA_WEB_PROFESSIONAL.',
  )
}

const email = String(process.env.VITTA_WEB_PRO_EMAIL || '')
  .trim()
  .toLowerCase()
const password = String(process.env.VITTA_WEB_PRO_PASSWORD || '')
const displayName = String(
  process.env.VITTA_WEB_PRO_NAME || 'Administrador Vitta',
).trim()
const cpf = String(process.env.VITTA_WEB_PRO_CPF || '52998224725').trim()

if (!email || !email.includes('@')) throw new Error('E-mail profissional invalido.')
if (password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.')
if (!displayName) throw new Error('Nome profissional obrigatorio.')
if (!/^\d{11}$/.test(cpf)) throw new Error('CPF profissional invalido.')

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
const userId = crypto.randomUUID()
const professionalId = crypto.randomUUID()

const tokens = configstore.get('tokens')
const cliUser = configstore.get('user')
if (!tokens?.refresh_token || !cliUser?.email) {
  throw new Error('Firebase CLI sem sessao completa. Execute firebase login.')
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

function q(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

function normalizeUuid(value) {
  return String(value || '').replaceAll('-', '').toLowerCase()
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
      `Falha ao criar identidade profissional: ${payload.error?.message || response.status}.`,
    )
  }
  return payload.localId
}

async function seedSqlIdentity(authUid) {
  await runSql(`
    BEGIN;

    DO $verify$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM public."user"
         WHERE lower(email) = lower(${q(email)})
            OR cpf = ${q(cpf)}
            OR auth_uid = ${q(authUid)}
      ) THEN
        RAISE EXCEPTION 'Usuario profissional ja existe.';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM public.u_b_s WHERE active = TRUE) THEN
        RAISE EXCEPTION 'Nenhuma UBS ativa disponivel.';
      END IF;
    END
    $verify$;

    INSERT INTO public."user"
      (id, name, birth_date, email, auth_uid, status, cpf, portal_role,
       created_at, updated_at)
    VALUES
      (${q(userId)}::uuid, ${q(displayName)}, DATE '1990-01-01', ${q(email)},
       ${q(authUid)}, 'ACTIVE', ${q(cpf)}, 'ADMIN', now(), now());

    INSERT INTO public.professional
      (id, user_id, professional_type, professional_registration, ubs_id, active)
    SELECT
      ${q(professionalId)}::uuid,
      ${q(userId)}::uuid,
      'NURSE',
      'VITTA-DEMO-001',
      id,
      TRUE
    FROM public.u_b_s
    WHERE active = TRUE
    ORDER BY name, id
    LIMIT 1;

    DO $assert$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
          FROM public."user" u
          JOIN public.professional p ON p.user_id = u.id
         WHERE u.id = ${q(userId)}::uuid
           AND u.auth_uid = ${q(authUid)}
           AND u.status = 'ACTIVE'
           AND u.portal_role = 'ADMIN'
           AND p.id = ${q(professionalId)}::uuid
           AND p.active = TRUE
           AND p.ubs_id IS NOT NULL
      ) THEN
        RAISE EXCEPTION 'Perfil profissional nao foi criado corretamente.';
      END IF;
    END
    $assert$;

    COMMIT;
  `)
}

async function validateWebLogin(authUid) {
  const app = initializeApp(
    {
      apiKey,
      authDomain: 'vitta-5ec1e.firebaseapp.com',
      projectId,
      appId: '1:733443225670:web:9334e443d9f13b0092b247',
    },
    `create-web-professional-${Date.now()}`,
  )
  const auth = getAuth(app)
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const token = await getIdTokenResult(credential.user, true)
    const dataConnect = getDataConnect(app, {
      connector: 'example',
      service: 'vitta-5ec1e-service',
      location: 'southamerica-east1',
    })
    const result = await getCurrentPortalUser(dataConnect, {
      fetchPolicy: 'SERVER_ONLY',
    })
    const sqlUser = result.data.users?.[0]
    const professional = sqlUser?.professional_on_user
    const checks = {
      firebaseUid: credential.user.uid === authUid,
      adminClaim: token.claims.admin === true,
      sqlUser: normalizeUuid(sqlUser?.id) === normalizeUuid(userId),
      portalRole: sqlUser?.portalRole === 'ADMIN',
      professional:
        normalizeUuid(professional?.id) === normalizeUuid(professionalId),
      professionalActive: professional?.active === true,
      ubsLinked: Boolean(professional?.ubs?.id),
    }
    if (Object.values(checks).some((passed) => !passed)) {
      throw new Error(
        `A validacao autenticada do perfil profissional falhou: ${JSON.stringify(checks)}.`,
      )
    }
  } finally {
    await signOut(auth).catch(() => {})
    await deleteApp(app)
  }
}

async function cleanup(authUid) {
  await runSql(`
    BEGIN;
    DELETE FROM public."user" WHERE id = ${q(userId)}::uuid;
    COMMIT;
  `).catch(() => {})
  if (authUid) {
    await identityToolkit
      .post(`projects/${projectId}/accounts:delete`, { localId: authUid })
      .catch(() => {})
  }
}

async function main() {
  await requireAuth(cliOptions)
  let authUid = null
  try {
    authUid = await createFirebaseUser()
    await identityToolkit.post(`projects/${projectId}/accounts:update`, {
      localId: authUid,
      displayName,
      customAttributes: JSON.stringify({ admin: true }),
    })
    await seedSqlIdentity(authUid)
    await validateWebLogin(authUid)

    process.stdout.write(
      `${JSON.stringify(
        {
          status: 'created',
          projectId,
          email,
          portalRole: 'ADMIN',
          professionalType: 'NURSE',
          adminClaim: true,
          active: true,
          ubsLinked: true,
          authenticatedWebValidation: 'passed',
          completedAt: new Date().toISOString(),
        },
        null,
        2,
      )}\n`,
    )
  } catch (error) {
    await cleanup(authUid)
    throw error
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
