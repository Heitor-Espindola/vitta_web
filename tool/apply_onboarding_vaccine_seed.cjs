const crypto = require('node:crypto')
const fs = require('node:fs')
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
const migrationPath = path.resolve(
  process.argv[3] ||
    path.join(
      __dirname,
      '../docs/migration/onboarding_experimental_vaccine_seed.sql',
    ),
)

if (confirmation !== 'APPLY_EXPERIMENTAL_ONBOARDING_SEED') {
  throw new Error(
    'Confirmacao explicita ausente. Use APPLY_EXPERIMENTAL_ONBOARDING_SEED.',
  )
}
if (!fs.existsSync(migrationPath)) {
  throw new Error('Migration de carteira inicial nao encontrada.')
}

const sql = fs.readFileSync(migrationPath, 'utf8')
const executableSql = sql
  .replace(/--.*$/gm, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
const forbidden = [
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+COLUMN\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
]
if (forbidden.some((pattern) => pattern.test(executableSql))) {
  throw new Error('Migration recusada: instrucao destrutiva encontrada.')
}
if (!/\bBEGIN\s*;/i.test(executableSql) || !/\bCOMMIT\s*;/i.test(executableSql)) {
  throw new Error('Migration recusada: transacao explicita ausente.')
}
const isScheduleMigration =
  path.basename(migrationPath) ===
  'onboarding_experimental_vaccine_schedule.sql'
if (
  !isScheduleMigration &&
  !/ON\s+CONFLICT\s*\(legacy_record_id\)\s+DO\s+NOTHING/i.test(executableSql)
) {
  throw new Error('Migration recusada: idempotencia ausente.')
}
if (
  isScheduleMigration &&
  !/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.schedule_experimental_onboarding_doses/i.test(
    executableSql,
  )
) {
  throw new Error('Migration recusada: funcao de agenda experimental ausente.')
}
if (!/source[\s\S]*'EXPERIMENTAL_ONBOARDING'/i.test(executableSql)) {
  throw new Error('Migration recusada: origem experimental ausente.')
}

const tokens = configstore.get('tokens')
const user = configstore.get('user')
if (!tokens?.refresh_token || !user?.email) {
  throw new Error('Firebase CLI sem sessao completa. Execute firebase login.')
}

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
        status: 'applied',
        projectId,
        instanceId,
        databaseId,
        migrationPath,
        sha256: crypto.createHash('sha256').update(sql).digest('hex'),
        appliedAt: new Date().toISOString(),
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
