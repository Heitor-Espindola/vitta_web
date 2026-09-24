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
const instanceId = 'vitta-5ec1e-instance'
const action = process.argv[2] || 'inspect'
const description = process.argv[3]

const tokens = configstore.get('tokens')
if (!tokens?.refresh_token) {
  throw new Error('Firebase CLI sem refresh token. Execute firebase login.')
}

setRefreshToken(tokens.refresh_token)
if (tokens.access_token) setAccessToken(tokens.access_token)

const sql = new Client({
  urlPrefix: 'https://sqladmin.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})

async function inspect() {
  const [instanceResponse, backupsResponse] = await Promise.all([
    sql.get(`projects/${projectId}/instances/${instanceId}`),
    sql.get(`projects/${projectId}/instances/${instanceId}/backupRuns`),
  ])
  const instance = instanceResponse.body
  const backups = (backupsResponse.body.items || [])
    .sort((a, b) => String(b.startTime).localeCompare(String(a.startTime)))
    .slice(0, 10)
    .map(({ id, status, type, startTime, endTime, description: backupDescription }) => ({
      id,
      status,
      type,
      startTime,
      endTime,
      description: backupDescription,
    }))

  console.log(JSON.stringify({
    instance: {
      name: instance.name,
      project: instance.project,
      region: instance.region,
      state: instance.state,
      databaseVersion: instance.databaseVersion,
      backupConfiguration: instance.settings?.backupConfiguration,
      deletionProtectionEnabled: instance.settings?.deletionProtectionEnabled,
    },
    backups,
  }, null, 2))
}

async function createBackup() {
  if (!description) throw new Error('Descrição do backup é obrigatória.')
  const response = await sql.post(
    `projects/${projectId}/instances/${instanceId}/backupRuns`,
    { description },
  )
  console.log(JSON.stringify({
    operation: response.body.name,
    status: response.body.status,
    operationType: response.body.operationType,
    targetId: response.body.targetId,
  }, null, 2))
}

async function listUsers() {
  const response = await sql.get(
    `projects/${projectId}/instances/${instanceId}/users`,
  )
  console.log(JSON.stringify(
    (response.body.items || []).map(({ name, type }) => ({ name, type })),
    null,
    2,
  ))
}

async function main() {
  if (action === 'inspect') return inspect()
  if (action === 'create') return createBackup()
  if (action === 'users') return listUsers()
  throw new Error(`Ação desconhecida: ${action}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
