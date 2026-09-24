const fs = require('node:fs')
const path = require('node:path')

const firebaseToolsRoot = path.join(
  process.env.APPDATA,
  'npm',
  'node_modules',
  'firebase-tools',
  'lib',
)
const firebaseToolsNodeModules = path.join(path.dirname(firebaseToolsRoot), 'node_modules')
const { Client, setAccessToken, setRefreshToken } = require(
  path.join(firebaseToolsRoot, 'apiv2.js'),
)
const { configstore } = require(path.join(firebaseToolsRoot, 'configstore.js'))
const { FBToolsAuthClient } = require(
  path.join(firebaseToolsRoot, 'gcp', 'cloudsql', 'fbToolsAuthClient.js'),
)
const { Connector, IpAddressTypes, AuthTypes } = require(
  path.join(firebaseToolsNodeModules, '@google-cloud', 'cloud-sql-connector'),
)
const pg = require(path.join(firebaseToolsNodeModules, 'pg'))

const projectId = 'vitta-5ec1e'
const instanceId = 'vitta-5ec1e-instance'
const databaseId = 'vitta-5ec1e-database'
const schemaName = 'public'
const outputPath = process.argv[2]

if (!outputPath) throw new Error('Caminho do backup lógico é obrigatório.')

const tokens = configstore.get('tokens')
const user = configstore.get('user')
if (!tokens?.refresh_token || !user?.email) {
  throw new Error('Firebase CLI sem sessão completa. Execute firebase login.')
}
setRefreshToken(tokens.refresh_token)
if (tokens.access_token) setAccessToken(tokens.access_token)

const sqlAdmin = new Client({
  urlPrefix: 'https://sqladmin.googleapis.com',
  apiVersion: 'v1',
  auth: true,
})

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`
}

async function main() {
  const instanceResponse = await sqlAdmin.get(
    `projects/${projectId}/instances/${instanceId}`,
  )
  const instance = instanceResponse.body
  const connectionName = instance.connectionName
  if (!connectionName) throw new Error('Instância sem connectionName.')

  const connector = new Connector({ auth: new FBToolsAuthClient() })
  const pool = new pg.Pool({
    ...(await connector.getOptions({
      instanceConnectionName: connectionName,
      ipType: IpAddressTypes.PUBLIC,
      authType: AuthTypes.IAM,
    })),
    user: user.email,
    database: databaseId,
  })

  let client
  try {
    client = await pool.connect()
    await client.query(`SET search_path TO ${quoteIdentifier(schemaName)}`)
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY')

    const generatedAt = new Date().toISOString()
    const tableRows = await client.query(
      `SELECT tablename
         FROM pg_catalog.pg_tables
        WHERE schemaname = $1
        ORDER BY tablename`,
      [schemaName],
    )
    const tables = {}
    for (const { tablename } of tableRows.rows) {
      const result = await client.query(
        `SELECT * FROM ${quoteIdentifier(schemaName)}.${quoteIdentifier(tablename)}`,
      )
      tables[tablename] = result.rows
    }

    const columns = await client.query(
      `SELECT table_name, ordinal_position, column_name, data_type, udt_name,
              is_nullable, column_default
         FROM information_schema.columns
        WHERE table_schema = $1
        ORDER BY table_name, ordinal_position`,
      [schemaName],
    )
    const constraints = await client.query(
      `SELECT c.conname AS constraint_name,
              c.contype AS constraint_type,
              c.conrelid::regclass::text AS table_name,
              pg_get_constraintdef(c.oid, true) AS definition
         FROM pg_catalog.pg_constraint c
         JOIN pg_catalog.pg_namespace n ON n.oid = c.connamespace
        WHERE n.nspname = $1
        ORDER BY table_name, constraint_name`,
      [schemaName],
    )
    const indexes = await client.query(
      `SELECT tablename AS table_name, indexname AS index_name, indexdef AS definition
         FROM pg_catalog.pg_indexes
        WHERE schemaname = $1
        ORDER BY tablename, indexname`,
      [schemaName],
    )
    const enums = await client.query(
      `SELECT t.typname AS enum_name, e.enumsortorder, e.enumlabel
         FROM pg_catalog.pg_type t
         JOIN pg_catalog.pg_enum e ON t.oid = e.enumtypid
         JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = $1
        ORDER BY t.typname, e.enumsortorder`,
      [schemaName],
    )

    await client.query('COMMIT')

    const payload = {
      metadata: {
        generatedAt,
        projectId,
        instanceId,
        databaseId,
        schemaName,
        instanceState: instance.state,
        databaseVersion: instance.databaseVersion,
        backupKind: 'logical-read-only-repeatable-read',
      },
      schema: {
        columns: columns.rows,
        constraints: constraints.rows,
        indexes: indexes.rows,
        enums: enums.rows,
      },
      counts: Object.fromEntries(
        Object.entries(tables).map(([name, rows]) => [name, rows.length]),
      ),
      tables,
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
      generatedAt,
      tableCount: Object.keys(tables).length,
      counts: payload.counts,
    }, null, 2))
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK')
      } catch {
        // A conexão pode já ter sido encerrada pelo erro original.
      }
    }
    throw error
  } finally {
    if (client) client.release()
    await pool.end()
    connector.close()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
