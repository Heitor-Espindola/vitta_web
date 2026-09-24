const fs = require('node:fs')
const path = require('node:path')

const mode = process.argv[2]
const backupPath = path.resolve(process.argv[3] || '')
if (!['AUDIT', 'APPLY_ADMIN_CLAIM'].includes(mode)) {
  throw new Error('Use AUDIT ou APPLY_ADMIN_CLAIM.')
}
if (!fs.existsSync(backupPath)) throw new Error('Backup Firestore obrigatório.')

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
const tokens = configstore.get('tokens')
if (!tokens?.refresh_token) throw new Error('Firebase CLI sem sessão completa.')
setRefreshToken(tokens.refresh_token)
if (tokens.access_token) setAccessToken(tokens.access_token)

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key)
const decode = (value) => {
  if (!value || has(value, 'nullValue')) return null
  if (has(value, 'stringValue')) return value.stringValue
  if (has(value, 'booleanValue')) return value.booleanValue
  return null
}
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
const adminUids = new Set()

for (const document of backup.collections.users || []) {
  const fields = Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [key, decode(value)]),
  )
  if (String(fields.role || '').toLowerCase() !== 'admin') continue
  const uid =
    fields.authUid ||
    (fields.canAuthenticate === true
      ? fields.uid || document.name.split('/').at(-1)
      : null)
  if (uid) adminUids.add(uid)
}
if (adminUids.size !== 1) {
  throw new Error(`Esperado exatamente um administrador autenticável; encontrados ${adminUids.size}.`)
}
const [adminUid] = adminUids

const identityToolkit = new Client({
  urlPrefix: 'https://identitytoolkit.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})

async function listUsers() {
  const users = []
  let nextPageToken
  do {
    const response = await identityToolkit.get(
      'projects/vitta-5ec1e/accounts:batchGet',
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

async function main() {
  const users = await listUsers()
  const admin = users.find((item) => item.localId === adminUid)
  if (!admin) throw new Error('UID administrativo não existe no Firebase Auth.')
  const before = admin.customAttributes ? JSON.parse(admin.customAttributes) : {}
  const alreadyAdmin = before.admin === true
  if (mode === 'APPLY_ADMIN_CLAIM' && !alreadyAdmin) {
    await identityToolkit.post('projects/vitta-5ec1e/accounts:update', {
      localId: adminUid,
      customAttributes: JSON.stringify({ ...before, admin: true }),
    })
  }

  const elevated = users.filter((item) => {
    if (!item.customAttributes) return false
    try {
      return JSON.parse(item.customAttributes).admin === true
    } catch {
      return false
    }
  })
  process.stdout.write(
    JSON.stringify(
      {
        status: mode === 'AUDIT' ? 'audited' : 'applied_or_already_present',
        targetCount: 1,
        targetExisted: true,
        targetAlreadyAdmin: alreadyAdmin,
        preExistingAdminClaims: elevated.length,
        changed: mode === 'APPLY_ADMIN_CLAIM' && !alreadyAdmin,
        auditedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  process.stderr.write(
    JSON.stringify({
      status: 'failed',
      message: String(error?.message || error).split('\n')[0],
    }),
  )
  process.exitCode = 1
})
