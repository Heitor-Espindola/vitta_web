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
const confirmation = process.argv[2]
const backupPath = path.resolve(process.argv[3] || '')
const personalCollections = [
  'users',
  'auth_links',
  'cpf_registry',
  'children',
  'relationships',
  'access_grants',
  'professional_patient_access',
  'vaccination_records',
]
const preservedCollections = ['vaccines', 'news_articles']

if (confirmation !== 'RESET_LEGACY_FIRESTORE_IDENTITIES') {
  throw new Error(
    'Confirmacao explicita ausente. Use RESET_LEGACY_FIRESTORE_IDENTITIES.',
  )
}
if (!backupPath || !fs.existsSync(backupPath)) {
  throw new Error('Backup Firestore obrigatorio nao encontrado.')
}
if (fs.statSync(backupPath).size === 0) {
  throw new Error('Backup Firestore obrigatorio esta vazio.')
}

const tokens = configstore.get('tokens')
if (!tokens?.refresh_token) {
  throw new Error('Firebase CLI sem sessao completa. Execute firebase login.')
}
setRefreshToken(tokens.refresh_token)
if (tokens.access_token) setAccessToken(tokens.access_token)

const firestore = new Client({
  urlPrefix: 'https://firestore.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})
const documentsRoot = `projects/${projectId}/databases/${databaseId}/documents`

async function listCollectionIds(parentPath = '') {
  const collectionIds = []
  let pageToken
  do {
    const endpoint = parentPath
      ? `${documentsRoot}/${parentPath}:listCollectionIds`
      : `${documentsRoot}:listCollectionIds`
    const response = await firestore.post(endpoint, {
      pageSize: 300,
      ...(pageToken ? { pageToken } : {}),
    })
    collectionIds.push(...(response.body.collectionIds || []))
    pageToken = response.body.nextPageToken
  } while (pageToken)
  return collectionIds
}

async function listDocuments(collectionPath) {
  const documents = []
  let pageToken
  do {
    const response = await firestore.get(
      `${documentsRoot}/${collectionPath}`,
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

function relativeDocumentPath(documentName) {
  const prefix = `${documentsRoot}/`
  if (!documentName.startsWith(prefix)) {
    throw new Error('Documento Firestore fora do projeto esperado.')
  }
  return documentName.slice(prefix.length)
}

async function deleteDocumentTree(document) {
  const documentPath = relativeDocumentPath(document.name)
  const childCollections = await listCollectionIds(documentPath)
  for (const childCollection of childCollections) {
    const childCollectionPath = `${documentPath}/${childCollection}`
    const childDocuments = await listDocuments(childCollectionPath)
    for (const childDocument of childDocuments) {
      await deleteDocumentTree(childDocument)
    }
  }
  await firestore.delete(document.name)
  return 1
}

async function main() {
  const rootCollections = await listCollectionIds()
  const allowedCollections = new Set([
    ...personalCollections,
    ...preservedCollections,
  ])
  const unknownCollections = rootCollections.filter(
    (collectionId) => !allowedCollections.has(collectionId),
  )
  if (unknownCollections.length > 0) {
    throw new Error(
      `Reset recusado: colecoes desconhecidas encontradas (${unknownCollections.join(', ')}).`,
    )
  }

  const before = {}
  let deletedDocuments = 0
  for (const collectionId of personalCollections) {
    const documents = await listDocuments(collectionId)
    before[collectionId] = documents.length
    for (const document of documents) {
      deletedDocuments += await deleteDocumentTree(document)
    }
  }

  const remaining = {}
  for (const collectionId of personalCollections) {
    remaining[collectionId] = (await listDocuments(collectionId)).length
  }
  const remainingPersonalDocuments = Object.values(remaining).reduce(
    (total, count) => total + count,
    0,
  )
  if (remainingPersonalDocuments > 0) {
    throw new Error(
      `Reset incompleto: ${remainingPersonalDocuments} documentos pessoais permaneceram.`,
    )
  }

  const preserved = {}
  for (const collectionId of preservedCollections) {
    preserved[collectionId] = rootCollections.includes(collectionId)
      ? (await listDocuments(collectionId)).length
      : 0
  }
  if (preserved.vaccines < 10) {
    throw new Error('Reset invalido: catalogo legado de vacinas foi afetado.')
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        status: 'reset',
        projectId,
        databaseId,
        before,
        remaining,
        deletedDocuments,
        preserved,
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
