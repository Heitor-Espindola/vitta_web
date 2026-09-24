const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const firebaseToolsRoot = path.join(
  process.env.APPDATA,
  "npm",
  "node_modules",
  "firebase-tools",
  "lib",
);
const { configstore } = require(path.join(firebaseToolsRoot, "configstore.js"));
const { requireAuth } = require(path.join(firebaseToolsRoot, "requireAuth.js"));
const { executeSqlCmdsAsSuperUser } = require(
  path.join(firebaseToolsRoot, "gcp", "cloudsql", "connect.js"),
);

const projectId = "vitta-5ec1e";
const instanceId = "vitta-5ec1e-instance";
const databaseId = "vitta-5ec1e-database";
const confirmation = process.argv[2];
const migrationPath = path.resolve(
  process.argv[3] ||
    path.join(__dirname, "../docs/migration/proposed_mobile_domain_migration.sql"),
);

if (confirmation !== "APPLY_PRODUCTION_VITTA") {
  throw new Error("Confirmação explícita da migration de produção ausente.");
}

const tokens = configstore.get("tokens");
const user = configstore.get("user");
if (!tokens?.refresh_token || !user?.email) {
  throw new Error("Firebase CLI sem sessão completa.");
}

const sql = fs.readFileSync(migrationPath, "utf8");
const executableSql = sql
  .replace(/--.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");
const forbidden = [
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+COLUMN\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
];
if (forbidden.some((pattern) => pattern.test(executableSql))) {
  throw new Error("Migration recusada: instrução destrutiva não autorizada.");
}
if (!/\bBEGIN\s*;/i.test(executableSql) || !/\bCOMMIT\s*;/i.test(executableSql)) {
  throw new Error("Migration recusada: transação explícita ausente.");
}
if ((executableSql.match(/ON DELETE SET NULL/gi) || []).length !== 4) {
  throw new Error("Migration recusada: as quatro FKs históricas não estão seguras.");
}

async function main() {
  const hash = crypto.createHash("sha256").update(sql).digest("hex").toUpperCase();
  const options = { projectId, project: projectId, tokens, user };
  await requireAuth(options);
  await executeSqlCmdsAsSuperUser(
    options,
    instanceId,
    databaseId,
    [sql],
    true,
    false,
  );
  process.stdout.write(
    JSON.stringify(
      {
        status: "applied",
        projectId,
        instanceId,
        databaseId,
        migrationPath,
        sha256: hash,
        appliedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  process.stderr.write(
    JSON.stringify({
      status: "failed",
      message: String(error?.message || error).split("\n")[0],
    }),
  );
  process.exitCode = 1;
});
