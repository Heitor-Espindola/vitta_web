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

if (process.argv[2] !== "RUN_ROLLBACK_INTEGRITY_TEST") {
  throw new Error("Confirmação explícita do teste transacional ausente.");
}

const sql = `
BEGIN;

INSERT INTO "public"."user"
  ("id", "name", "birth_date", "status", "cpf")
VALUES
  ('20000000-0000-4000-8000-000000000001', 'Paciente teste rollback',
   '2000-01-01', 'ACTIVE', 'rollback-patient-20260924'),
  ('20000000-0000-4000-8000-000000000002', 'Profissional teste rollback',
   '1980-01-01', 'ACTIVE', 'rollback-professional-20260924');

INSERT INTO "public"."patient"
  ("id", "user_id", "patient_type")
VALUES
  ('20000000-0000-4000-8000-000000000003',
   '20000000-0000-4000-8000-000000000001', 'ADULT');

INSERT INTO "public"."u_b_s" ("id", "name")
VALUES ('20000000-0000-4000-8000-000000000004', 'UBS teste rollback');

INSERT INTO "public"."professional"
  ("id", "user_id", "professional_type", "ubs_id")
VALUES
  ('20000000-0000-4000-8000-000000000005',
   '20000000-0000-4000-8000-000000000002', 'OTHER',
   '20000000-0000-4000-8000-000000000004');

INSERT INTO "public"."vaccine" ("id", "name", "required_doses")
VALUES
  ('20000000-0000-4000-8000-000000000006', 'Vacina teste rollback', 1);

INSERT INTO "public"."application" (
  "id", "patient_id", "professional_id", "ubs_id", "vaccine_id",
  "application_date", "patient_id_snapshot", "patient_name_snapshot",
  "vaccine_name_snapshot", "professional_name_snapshot",
  "facility_name_snapshot", "source"
) VALUES (
  '20000000-0000-4000-8000-000000000007',
  '20000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000005',
  '20000000-0000-4000-8000-000000000004',
  '20000000-0000-4000-8000-000000000006',
  now(),
  '20000000-0000-4000-8000-000000000003',
  'Paciente teste rollback',
  'Vacina teste rollback',
  'Profissional teste rollback',
  'UBS teste rollback',
  'INTEGRITY_ROLLBACK_TEST'
);

DELETE FROM "public"."patient"
WHERE "id" = '20000000-0000-4000-8000-000000000003';
DELETE FROM "public"."professional"
WHERE "id" = '20000000-0000-4000-8000-000000000005';
DELETE FROM "public"."u_b_s"
WHERE "id" = '20000000-0000-4000-8000-000000000004';
DELETE FROM "public"."vaccine"
WHERE "id" = '20000000-0000-4000-8000-000000000006';

DO $integrity$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "public"."application"
    WHERE "id" = '20000000-0000-4000-8000-000000000007'
      AND "patient_id" IS NULL
      AND "professional_id" IS NULL
      AND "ubs_id" IS NULL
      AND "vaccine_id" IS NULL
      AND "patient_name_snapshot" = 'Paciente teste rollback'
      AND "vaccine_name_snapshot" = 'Vacina teste rollback'
      AND "professional_name_snapshot" = 'Profissional teste rollback'
      AND "facility_name_snapshot" = 'UBS teste rollback'
  ) THEN
    RAISE EXCEPTION 'Application nao foi preservada corretamente.';
  END IF;
END
$integrity$;

ROLLBACK;
`;

async function main() {
  const tokens = configstore.get("tokens");
  const user = configstore.get("user");
  if (!tokens?.refresh_token || !user?.email) {
    throw new Error("Firebase CLI sem sessão completa.");
  }
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
      status: "passed",
      applicationSurvivedAllFourDeletes: true,
      referencesBecameNull: true,
      snapshotsPreserved: true,
      transactionRolledBack: true,
      testedAt: new Date().toISOString(),
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
