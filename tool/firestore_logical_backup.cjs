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

const projectId = 'vitta-5ec1e'
const databaseId = '(default)'
const outputPath = process.argv[2]
const collectionIds = [
  'users',
  'auth_links',
  'cpf_registry',
  'relationships',
  'access_grants',
  'vaccines',
  'vaccination_records',
]

if (!outputPath) throw new Error('Caminho do backup Firestore é obrigatório.')

const tokens = configstore.get('tokens')
if (!tokens?.refresh_token) {
  throw new Error('Firebase CLI sem refresh token. Execute firebase login.')
}
setRefreshToken(tokens.refresh_token)
if (tokens.access_token) setAccessToken(tokens.access_token)

const firestore = new Client({
  urlPrefix: 'https://firestore.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})

async function readCollection(collectionId) {
  const documents = []
  let pageToken
  do {
    const response = await firestore.get(
      `projects/${projectId}/databases/${databaseId}/documents/${collectionId}`,
      {
        queryParams: {
          pageSize: 300,
          ...(pageToken ? { pageToken } : {}),
        },
      },
    )
    documents.push(...(response.body.documents || []))
    pageToken = response.body.nextPageToken
  } while (pageToken)
  return documents
}

async function readPrivateEmergencyContacts(userDocuments) {
  const documents = []
  for (const userDocument of userDocuments) {
    const userDocumentId = userDocument.name.split('/').at(-1)
    const response = await firestore.get(
      `projects/${projectId}/databases/${databaseId}/documents/users/${encodeURIComponent(userDocumentId)}/private`,
      { queryParams: { pageSize: 20 } },
    )
    for (const document of response.body.documents || []) {
      if (document.name.endsWith('/private/emergency_contact')) {
        documents.push(document)
      }
    }
  }
  return documents
}

async function main() {
  const collections = {}
  for (const collectionId of collectionIds) {
    collections[collectionId] = await readCollection(collectionId)
  }
  collections.emergency_contacts = await readPrivateEmergencyContacts(
    collections.users,
  )

  const payload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      projectId,
      databaseId,
      backupKind: 'firestore-rest-logical-export',
      excludedCollections: ['news_articles'],
    },
    counts: Object.fromEntries(
      Object.entries(collections).map(([name, documents]) => [name, documents.length]),
    ),
    collections,
  }

  const resolved = path.resolve(outputPath)
  fs.mkdirSync(path.dirname(resolved), { recursive: true })
  const temporary = `${resolved}.tmp`
  fs.writeFileSync(temporary, JSON.stringify(payload, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  })
  fs.renameSync(temporary, resolved)

  console.log(JSON.stringify({
    outputPath: resolved,
    generatedAt: payload.metadata.generatedAt,
    counts: payload.counts,
  }, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
