const fs = require('node:fs')
const path = require('node:path')

const backupPath = path.resolve(process.argv[2] || '')
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
const docId = (document) => document.name.split('/').at(-1)
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
const candidateSources = {
  explicitAuthUid: new Set(),
  authenticatingUserDocument: new Set(),
  authLink: new Set(),
  cpfRegistryOwner: new Set(),
}

for (const document of backup.collections.users || []) {
  const fields = Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [key, decode(value)]),
  )
  if (fields.authUid) candidateSources.explicitAuthUid.add(fields.authUid)
  if (fields.canAuthenticate === true) {
    candidateSources.authenticatingUserDocument.add(fields.uid || docId(document))
  }
}
for (const document of backup.collections.auth_links || []) {
  candidateSources.authLink.add(docId(document))
}
for (const document of backup.collections.cpf_registry || []) {
  const ownerUid = decode(document.fields?.ownerUid)
  if (ownerUid) candidateSources.cpfRegistryOwner.add(ownerUid)
}
// cpf_registry contém quatro UIDs históricos que já não existem no Auth. Ele é
// mantido no relatório, mas não é fonte de vínculo autenticável. Somente os
// campos authUid/canAuthenticate e auth_links são autoritativos para o corte.
const candidates = new Set(
  [
    candidateSources.explicitAuthUid,
    candidateSources.authenticatingUserDocument,
    candidateSources.authLink,
  ].flatMap((items) => [...items]),
)

const identityToolkit = new Client({
  urlPrefix: 'https://identitytoolkit.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})

async function main() {
  const authUsers = []
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
    authUsers.push(...(response.body.users || []))
    nextPageToken = response.body.nextPageToken
  } while (nextPageToken)

  const authUids = new Set(authUsers.map((item) => item.localId))
  const unresolved = [...candidates].filter((uid) => !authUids.has(uid))
  const disabledCandidates = authUsers.filter(
    (item) => candidates.has(item.localId) && item.disabled,
  )
  process.stdout.write(
    JSON.stringify(
      {
        status: unresolved.length ? 'failed' : 'passed',
        firebaseAuthUsers: authUsers.length,
        candidateAuthUids: candidates.size,
        resolvedCandidates: candidates.size - unresolved.length,
        unresolvedCandidates: unresolved.length,
        disabledCandidates: disabledCandidates.length,
        sources: Object.fromEntries(
          Object.entries(candidateSources).map(([name, items]) => [
            name,
            {
              total: items.size,
              resolved: [...items].filter((uid) => authUids.has(uid)).length,
            },
          ]),
        ),
        auditedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  )
  if (unresolved.length) process.exitCode = 1
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
