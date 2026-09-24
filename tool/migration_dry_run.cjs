const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require(
  "C:/Users/dudis/AppData/Roaming/npm/node_modules/firebase-tools/node_modules/@electric-sql/pglite",
);

const backupPath =
  process.argv[2] ||
  "C:/Users/dudis/Vitta_mobile/backups/sql/vitta-sql-pre-migration-20260923-163636.json";
const migrationPath =
  process.argv[3] ||
  path.resolve(__dirname, "../docs/migration/proposed_mobile_domain_migration.sql");

const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
const migration = fs.readFileSync(migrationPath, "utf8");

const q = (value) => `"${String(value).replaceAll('"', '""')}"`;
const normalizeName = (value) => String(value).replace(/^"|"$/g, "");

function sqlType(column) {
  if (column.data_type === "USER-DEFINED") {
    return `"public".${q(column.udt_name)}`;
  }
  const types = {
    uuid: "uuid",
    text: "text",
    int4: "integer",
    date: "date",
    timestamptz: "timestamptz",
    bool: "boolean",
    jsonb: "jsonb",
    _text: "text[]",
  };
  const result = types[column.udt_name];
  if (!result) {
    throw new Error(`Unsupported dry-run type: ${column.udt_name}`);
  }
  return result;
}

async function reconstructProduction(db) {
  const enumGroups = Map.groupBy(
    backup.schema.enums,
    (entry) => entry.enum_name,
  );
  for (const [name, entries] of enumGroups) {
    const values = entries
      .sort((a, b) => a.enumsortorder - b.enumsortorder)
      .map((entry) => `'${entry.enumlabel.replaceAll("'", "''")}'`)
      .join(", ");
    await db.exec(`CREATE TYPE "public".${q(name)} AS ENUM (${values});`);
  }

  const columnGroups = Map.groupBy(
    backup.schema.columns,
    (column) => column.table_name,
  );
  for (const [table, columns] of columnGroups) {
    const definitions = columns
      .sort((a, b) => a.ordinal_position - b.ordinal_position)
      .map(
        (column) =>
          `${q(column.column_name)} ${sqlType(column)} ${
            column.is_nullable === "NO" ? "NOT NULL" : "NULL"
          }`,
      )
      .join(",\n");
    await db.exec(`CREATE TABLE "public".${q(table)} (\n${definitions}\n);`);
  }

  const constraints = backup.schema.constraints
    .filter((constraint) => constraint.constraint_type !== "n")
    .sort((a, b) => {
      const priority = { p: 0, u: 1, c: 2, f: 3 };
      return (priority[a.constraint_type] ?? 2) -
        (priority[b.constraint_type] ?? 2);
    });
  for (const constraint of constraints) {
    const statement =
      `ALTER TABLE "public".${q(normalizeName(constraint.table_name))} ADD CONSTRAINT ${q(
        constraint.constraint_name,
      )} ${constraint.definition};`;
    try {
      await db.exec(statement);
    } catch (error) {
      throw new Error(`Failed dry-run constraint: ${statement}`, {
        cause: error,
      });
    }
  }

  const order = [
    "user",
    "u_b_s",
    "vaccine",
    "patient",
    "professional",
    "batch",
    "appointment",
    "application",
  ];
  for (const table of order) {
    for (const row of backup.tables[table] || []) {
      const columns = Object.keys(row);
      const params = columns.map((_, index) => `$${index + 1}`).join(", ");
      await db.query(
        `INSERT INTO "public".${q(table)} (${columns
          .map(q)
          .join(", ")}) VALUES (${params})`,
        columns.map((column) => row[column]),
      );
    }
  }
}

async function verifyIntegrity(db) {
  const ids = {
    patientUser: "10000000-0000-4000-8000-000000000001",
    patient: "10000000-0000-4000-8000-000000000002",
    professionalUser: "10000000-0000-4000-8000-000000000003",
    professional: "10000000-0000-4000-8000-000000000004",
    ubs: "10000000-0000-4000-8000-000000000005",
    vaccine: "10000000-0000-4000-8000-000000000006",
    application: "10000000-0000-4000-8000-000000000007",
  };

  await db.exec("BEGIN;");
  try {
    await db.query(
      `INSERT INTO "public"."user"
        ("id", "name", "birth_date", "status", "cpf")
       VALUES ($1, 'Paciente temporario', '2000-01-01', 'ACTIVE', 'dry-run-patient'),
              ($2, 'Profissional temporario', '1980-01-01', 'ACTIVE', 'dry-run-professional')`,
      [ids.patientUser, ids.professionalUser],
    );
    await db.query(
      `INSERT INTO "public"."patient"
        ("id", "user_id", "patient_type")
       VALUES ($1, $2, 'ADULT')`,
      [ids.patient, ids.patientUser],
    );
    await db.query(
      `INSERT INTO "public"."u_b_s" ("id", "name") VALUES ($1, 'UBS temporaria')`,
      [ids.ubs],
    );
    await db.query(
      `INSERT INTO "public"."professional"
        ("id", "user_id", "professional_type", "ubs_id")
       VALUES ($1, $2, 'OTHER', $3)`,
      [ids.professional, ids.professionalUser, ids.ubs],
    );
    await db.query(
      `INSERT INTO "public"."vaccine"
        ("id", "name", "required_doses")
       VALUES ($1, 'Vacina temporaria', 1)`,
      [ids.vaccine],
    );
    await db.query(
      `INSERT INTO "public"."application" (
        "id", "patient_id", "professional_id", "ubs_id", "vaccine_id",
        "application_date", "patient_id_snapshot", "patient_name_snapshot",
        "vaccine_name_snapshot", "professional_name_snapshot",
        "facility_name_snapshot", "source"
      ) VALUES (
        $1, $2, $3, $4, $5, now(), $2, 'Paciente temporario',
        'Vacina temporaria', 'Profissional temporario', 'UBS temporaria',
        'INTEGRITY_DRY_RUN'
      )`,
      [
        ids.application,
        ids.patient,
        ids.professional,
        ids.ubs,
        ids.vaccine,
      ],
    );

    for (const [table, id] of [
      ["patient", ids.patient],
      ["professional", ids.professional],
      ["u_b_s", ids.ubs],
      ["vaccine", ids.vaccine],
    ]) {
      await db.query(`DELETE FROM "public".${q(table)} WHERE "id" = $1`, [id]);
      const result = await db.query(
        'SELECT count(*)::int AS count FROM "public"."application" WHERE "id" = $1',
        [ids.application],
      );
      if (result.rows[0].count !== 1) {
        throw new Error(`Application disappeared after deleting ${table}`);
      }
    }

    const nullResult = await db.query(
      `SELECT
        "patient_id" IS NULL AS patient_null,
        "professional_id" IS NULL AS professional_null,
        "ubs_id" IS NULL AS ubs_null,
        "vaccine_id" IS NULL AS vaccine_null
       FROM "public"."application"
       WHERE "id" = $1`,
      [ids.application],
    );
    if (!Object.values(nullResult.rows[0]).every(Boolean)) {
      throw new Error("One or more historical references were not set to null");
    }
  } finally {
    await db.exec("ROLLBACK;");
  }
}

async function main() {
  const db = new PGlite();
  try {
    await reconstructProduction(db);
    const before = await db.query(
      'SELECT count(*)::int AS count FROM "public"."application"',
    );
    await db.exec(migration);
    const after = await db.query(
      'SELECT count(*)::int AS count FROM "public"."application"',
    );
    const snapshots = await db.query(
      `SELECT count(*)::int AS count
       FROM "public"."application"
       WHERE "patient_id_snapshot" IS NULL
          OR "patient_name_snapshot" IS NULL
          OR "vaccine_name_snapshot" IS NULL
          OR "professional_name_snapshot" IS NULL
          OR "facility_name_snapshot" IS NULL`,
    );
    const constraints = await db.query(
      `SELECT
         tc.constraint_name,
         rc.delete_rule
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.referential_constraints AS rc
         ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.constraint_schema
       WHERE tc.table_schema = 'public'
         AND tc.table_name = 'application'
         AND tc.constraint_name IN (
           'application_patient_id_fkey',
           'application_professional_id_fkey',
           'application_ubs_id_fkey',
           'application_vaccine_id_fkey'
         )
       ORDER BY tc.constraint_name`,
    );
    if (
      before.rows[0].count !== after.rows[0].count ||
      snapshots.rows[0].count !== 0 ||
      constraints.rows.length !== 4 ||
      constraints.rows.some((row) => row.delete_rule !== "SET NULL")
    ) {
      throw new Error("Migration invariants failed");
    }

    await verifyIntegrity(db);
    const finalCount = await db.query(
      'SELECT count(*)::int AS count FROM "public"."application"',
    );
    process.stdout.write(
      JSON.stringify(
        {
          status: "ok",
          applicationsBefore: before.rows[0].count,
          applicationsAfter: after.rows[0].count,
          incompleteSnapshots: snapshots.rows[0].count,
          constraints: constraints.rows,
          integrityTransactionRolledBack: true,
          applicationsAfterRollback: finalCount.rows[0].count,
        },
        null,
        2,
      ),
    );
  } finally {
    await db.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
