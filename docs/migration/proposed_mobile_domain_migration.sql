-- PROPOSTA LOCAL GERADA EM 23/09/2026. NÃO EXECUTAR NESTA ETAPA.
-- Origem: firebase dataconnect:sql:diff --project vitta-5ec1e
-- O diff não contém DROP TABLE, DROP COLUMN, TRUNCATE ou DELETE em massa.

CREATE TYPE "public"."consent_status" AS ENUM('PENDING', 'GRANTED', 'REVOKED');
CREATE TYPE "public"."patient_access_kind" AS ENUM('SELF', 'DEPENDENT', 'CAREGIVER', 'PROFESSIONAL');
CREATE TYPE "public"."portal_role" AS ENUM('PATIENT', 'PROFESSIONAL', 'ADMIN');
CREATE TYPE "public"."relationship_status" AS ENUM('PENDING', 'VERIFIED', 'REVOKED');
CREATE TYPE "public"."relationship_type" AS ENUM('MOTHER', 'FATHER', 'LEGAL_GUARDIAN', 'TUTOR', 'CAREGIVER');

ALTER TABLE "public"."application"
  ADD COLUMN "created_at" timestamptz NULL,
  ADD COLUMN "dose_label" text NULL,
  ADD COLUMN "facility_name_snapshot" text NULL,
  ADD COLUMN "legacy_record_id" text NULL,
  ADD COLUMN "lot_snapshot" text NULL,
  ADD COLUMN "manufacturer_snapshot" text NULL,
  ADD COLUMN "next_dose_at" timestamptz NULL,
  ADD COLUMN "professional_name_snapshot" text NULL,
  ADD COLUMN "source" text NULL,
  ADD COLUMN "updated_at" timestamptz NULL;
CREATE UNIQUE INDEX "application_legacyRecordId_uidx"
  ON "public"."application" ("legacy_record_id");

ALTER TABLE "public"."user"
  ALTER COLUMN "email" DROP NOT NULL,
  ADD COLUMN "auth_uid" text NULL,
  ADD COLUMN "created_at" timestamptz NULL,
  ADD COLUMN "last_login_at" timestamptz NULL,
  ADD COLUMN "phone" text NULL,
  ADD COLUMN "photo_url" text NULL,
  ADD COLUMN "portal_role" "public"."portal_role" NULL,
  ADD COLUMN "updated_at" timestamptz NULL;
CREATE UNIQUE INDEX "user_authUid_uidx" ON "public"."user" ("auth_uid");

ALTER TABLE "public"."vaccine"
  ADD COLUMN "active" boolean NULL,
  ADD COLUMN "calendar_version" text NULL,
  ADD COLUMN "contraindications" text[] NULL,
  ADD COLUMN "dose_schedule" jsonb NULL,
  ADD COLUMN "expected_reactions" text[] NULL,
  ADD COLUMN "interval_days" integer NULL,
  ADD COLUMN "legacy_vaccine_id" text NULL,
  ADD COLUMN "prevents" text[] NULL,
  ADD COLUMN "recommended_age" text NULL,
  ADD COLUMN "short_name" text NULL,
  ADD COLUMN "source_name" text NULL,
  ADD COLUMN "source_updated_at" timestamptz NULL,
  ADD COLUMN "source_url" text NULL,
  ADD COLUMN "target_groups" text[] NULL,
  ADD COLUMN "warning_signs" text[] NULL;
CREATE UNIQUE INDEX "vaccine_legacyVaccineId_uidx"
  ON "public"."vaccine" ("legacy_vaccine_id");

CREATE TABLE "public"."emergency_contact" (
  "user_id" uuid NOT NULL,
  "created_at" timestamptz NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "relationship" text NOT NULL,
  "updated_at" timestamptz NULL,
  PRIMARY KEY ("user_id"),
  CONSTRAINT "emergency_contact_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE CASCADE
);
CREATE INDEX "emergency_contact_userId_idx"
  ON "public"."emergency_contact" ("user_id");

ALTER TABLE "public"."patient"
  ADD COLUMN "legacy_person_id" text NULL,
  ADD COLUMN "mother_name" text NULL;
CREATE UNIQUE INDEX "patient_legacyPersonId_uidx"
  ON "public"."patient" ("legacy_person_id");

CREATE TABLE "public"."family_relationship" (
  "from_patient_id" uuid NOT NULL,
  "to_patient_id" uuid NOT NULL,
  "consent_status" "public"."consent_status" NOT NULL,
  "created_at" timestamptz NULL,
  "legacy_relationship_id" text NULL,
  "receive_notifications" boolean NOT NULL,
  "relationship_type" "public"."relationship_type" NOT NULL,
  "status" "public"."relationship_status" NOT NULL,
  "updated_at" timestamptz NULL,
  "valid_until" timestamptz NULL,
  "view_vaccination" boolean NOT NULL,
  PRIMARY KEY ("from_patient_id", "to_patient_id"),
  CONSTRAINT "family_relationship_from_patient_id_fkey"
    FOREIGN KEY ("from_patient_id") REFERENCES "public"."patient" ("id") ON DELETE CASCADE,
  CONSTRAINT "family_relationship_to_patient_id_fkey"
    FOREIGN KEY ("to_patient_id") REFERENCES "public"."patient" ("id") ON DELETE CASCADE
);
CREATE INDEX "family_relationship_fromPatientId_idx"
  ON "public"."family_relationship" ("from_patient_id");
CREATE INDEX "family_relationship_toPatientId_idx"
  ON "public"."family_relationship" ("to_patient_id");
CREATE UNIQUE INDEX "family_relationship_legacyRelationshipId_uidx"
  ON "public"."family_relationship" ("legacy_relationship_id");

CREATE TABLE "public"."patient_access" (
  "grantee_auth_uid" text NOT NULL,
  "patient_id" uuid NOT NULL,
  "access_kind" "public"."patient_access_kind" NOT NULL,
  "consent_status" "public"."consent_status" NOT NULL,
  "created_at" timestamptz NULL,
  "legacy_grant_id" text NULL,
  "receive_notifications" boolean NOT NULL,
  "updated_at" timestamptz NULL,
  "valid_until" timestamptz NULL,
  "view_profile" boolean NOT NULL,
  "view_vaccination" boolean NOT NULL,
  PRIMARY KEY ("grantee_auth_uid", "patient_id"),
  CONSTRAINT "patient_access_patient_id_fkey"
    FOREIGN KEY ("patient_id") REFERENCES "public"."patient" ("id") ON DELETE CASCADE
);
CREATE INDEX "patient_access_patientId_idx"
  ON "public"."patient_access" ("patient_id");
CREATE UNIQUE INDEX "patient_access_legacyGrantId_uidx"
  ON "public"."patient_access" ("legacy_grant_id");
