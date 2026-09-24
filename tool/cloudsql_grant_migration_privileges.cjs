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
const tokens = configstore.get("tokens");
const user = configstore.get("user");

if (process.argv[2] !== "GRANT_VITTA_MIGRATION_PRIVILEGES") {
  throw new Error("Confirmação explícita ausente.");
}
if (!tokens?.refresh_token || !user?.email) {
  throw new Error("Firebase CLI sem sessão completa.");
}

const sql = `
BEGIN;
GRANT SELECT ON ALL TABLES IN SCHEMA "public"
  TO "firebasereader_vitta-5ec1e-database_public";
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA "public"
  TO "firebasewriter_vitta-5ec1e-database_public";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "public"
  TO "firebasereader_vitta-5ec1e-database_public";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "public"
  TO "firebasewriter_vitta-5ec1e-database_public";
COMMIT;
`;

async function main() {
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
    JSON.stringify({
      status: "granted",
      appliedAt: new Date().toISOString(),
    }),
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
