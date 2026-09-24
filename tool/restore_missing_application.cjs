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
const expectedId = "7f05b61a-bf81-4c56-9646-2fc70537f943";
const backupPath =
  process.argv[3] ||
  "C:/Users/dudis/Vitta_mobile/backups/sql/vitta-sql-pre-apply-20260923-170216.json";

if (process.argv[2] !== "RESTORE_CONFIRMED_APPLICATION") {
  throw new Error("Confirmação explícita da restauração ausente.");
}

const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
const row = backup.tables.application.find((item) => item.id === expectedId);
if (!row) throw new Error("Registro esperado não existe no backup informado.");

const literal = (value, cast = "") => {
  if (value === null || value === undefined) return "NULL";
  const escaped = String(value).replaceAll("'", "''");
  return `'${escaped}'${cast}`;
};

const ids = {
  id: literal(row.id, "::uuid"),
  appointment: literal(row.appointment_id, "::uuid"),
  batch: literal(row.batch_id, "::uuid"),
  patient: literal(row.patient_id, "::uuid"),
  professional: literal(row.professional_id, "::uuid"),
  ubs: literal(row.ubs_id, "::uuid"),
  vaccine: literal(row.vaccine_id, "::uuid"),
};

const sql = `
BEGIN;
DO $restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "public"."application" WHERE "id" = ${ids.id}
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM "public"."patient" AS p
      JOIN "public"."professional" AS pr ON pr."id" = ${ids.professional}
      JOIN "public"."u_b_s" AS u ON u."id" = ${ids.ubs}
      JOIN "public"."vaccine" AS v ON v."id" = ${ids.vaccine}
      JOIN "public"."batch" AS b ON b."id" = ${ids.batch}
      WHERE p."id" = ${ids.patient}
    ) THEN
      RAISE EXCEPTION 'Referência obrigatória ausente; restauração cancelada.';
    END IF;

    INSERT INTO "public"."application" (
      "id", "appointment_id", "batch_id", "patient_id", "professional_id",
      "ubs_id", "vaccine_id", "application_date", "dose_number", "notes",
      "patient_id_snapshot", "patient_legacy_person_id_snapshot",
      "patient_name_snapshot", "vaccine_name_snapshot", "lot_snapshot",
      "manufacturer_snapshot", "facility_name_snapshot",
      "professional_name_snapshot", "professional_registration_snapshot",
      "source", "created_at", "updated_at"
    )
    SELECT
      ${ids.id}, ${ids.appointment}, b."id", p."id", pr."id",
      u."id", v."id", ${literal(row.application_date, "::timestamptz")},
      ${row.dose_number ?? "NULL"}, ${literal(row.notes)},
      p."id", p."legacy_person_id", pu."name", v."name", b."batch_code",
      b."manufacturer", u."name", pru."name", pr."professional_registration",
      'RESTORED_FROM_LOGICAL_BACKUP',
      ${literal(row.application_date, "::timestamptz")},
      ${literal(row.application_date, "::timestamptz")}
    FROM "public"."patient" AS p
    JOIN "public"."user" AS pu ON pu."id" = p."user_id"
    JOIN "public"."professional" AS pr ON pr."id" = ${ids.professional}
    JOIN "public"."user" AS pru ON pru."id" = pr."user_id"
    JOIN "public"."u_b_s" AS u ON u."id" = ${ids.ubs}
    JOIN "public"."vaccine" AS v ON v."id" = ${ids.vaccine}
    JOIN "public"."batch" AS b ON b."id" = ${ids.batch}
    WHERE p."id" = ${ids.patient};
  END IF;

  IF (SELECT count(*) FROM "public"."application" WHERE "id" = ${ids.id}) <> 1 THEN
    RAISE EXCEPTION 'Invariante de restauração falhou.';
  END IF;
END
$restore$;
COMMIT;
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
      status: "restored_or_already_present",
      applicationId: expectedId,
      restoredAt: new Date().toISOString(),
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
