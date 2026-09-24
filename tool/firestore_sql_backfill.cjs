const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const mode = process.argv[2]
const firestorePath = path.resolve(process.argv[3] || '')
const sqlBackupPath = path.resolve(process.argv[4] || '')

if (!['PLAN', 'DRY_RUN_PRODUCTION', 'APPLY_PRODUCTION_VITTA'].includes(mode)) {
  throw new Error('Use PLAN, DRY_RUN_PRODUCTION ou APPLY_PRODUCTION_VITTA.')
}
if (!fs.existsSync(firestorePath) || !fs.existsSync(sqlBackupPath)) {
  throw new Error('Os backups Firestore e SQL são obrigatórios.')
}

const firestore = JSON.parse(fs.readFileSync(firestorePath, 'utf8'))
const sqlBackup = JSON.parse(fs.readFileSync(sqlBackupPath, 'utf8'))

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

function decodeValue(value) {
  if (!value || has(value, 'nullValue')) return null
  if (has(value, 'stringValue')) return value.stringValue
  if (has(value, 'booleanValue')) return value.booleanValue
  if (has(value, 'integerValue')) return Number(value.integerValue)
  if (has(value, 'doubleValue')) return Number(value.doubleValue)
  if (has(value, 'timestampValue')) return value.timestampValue
  if (has(value, 'arrayValue')) {
    return (value.arrayValue.values || []).map(decodeValue)
  }
  if (has(value, 'mapValue')) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, item]) => [
        key,
        decodeValue(item),
      ]),
    )
  }
  throw new Error(`Tipo Firestore não suportado: ${Object.keys(value).join(',')}`)
}

function decodeDocument(document) {
  const segments = document.name.split('/')
  const fields = Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [
      key,
      decodeValue(value),
    ]),
  )
  return {
    ...fields,
    _docId: segments.at(-1),
    _path: document.name,
    _createTime: document.createTime || null,
    _updateTime: document.updateTime || null,
  }
}

const collections = Object.fromEntries(
  Object.entries(firestore.collections || {}).map(([name, documents]) => [
    name,
    documents.map(decodeDocument),
  ]),
)

const digits = (value) => String(value || '').replace(/\D/g, '')
const lower = (value) => String(value || '').trim().toLowerCase()
const normalizedText = (value) =>
  lower(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

const dateOnly = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

const timestamp = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

const pick = (documents, keys) => {
  for (const document of documents) {
    for (const key of keys) {
      if (document[key] !== null && document[key] !== undefined && document[key] !== '') {
        return document[key]
      }
    }
  }
  return null
}

const unique = (values) => [...new Set(values.filter(Boolean))]

class DisjointSet {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, index) => index)
  }

  find(index) {
    if (this.parent[index] !== index) this.parent[index] = this.find(this.parent[index])
    return this.parent[index]
  }

  union(left, right) {
    const leftRoot = this.find(left)
    const rightRoot = this.find(right)
    if (leftRoot !== rightRoot) this.parent[rightRoot] = leftRoot
  }
}

function stableUuid(value) {
  const bytes = crypto.createHash('sha256').update(`vitta:${value}`).digest().subarray(0, 16)
  bytes[6] = (bytes[6] & 0x0f) | 0x50
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function buildIdentityGroups() {
  const users = collections.users || []
  const dsu = new DisjointSet(users.length)
  const aliasesByValue = new Map()
  const cpfByValue = new Map()

  const aliasesFor = (user) =>
    unique(
      [user._docId, user.id, user.personId, user.uid, user.authUid]
        .filter(Boolean)
        .map(String),
    )
  const cpfFor = (user) => digits(user.cpfDigits || user.cpf || user.cpfFormatted)

  users.forEach((user, index) => {
    for (const alias of aliasesFor(user)) {
      if (aliasesByValue.has(alias)) dsu.union(index, aliasesByValue.get(alias))
      else aliasesByValue.set(alias, index)
    }
    const cpf = cpfFor(user)
    if (cpf) {
      if (cpfByValue.has(cpf)) dsu.union(index, cpfByValue.get(cpf))
      else cpfByValue.set(cpf, index)
    }
  })

  // Os documentos antigos e novos podem representar a mesma pessoa sob UID
  // e personId diferentes. Esses dois índices explícitos são vínculos fortes.
  for (const link of collections.auth_links || []) {
    const authDocument = aliasesByValue.get(link._docId)
    const personDocument = aliasesByValue.get(link.personId)
    if (authDocument !== undefined && personDocument !== undefined) {
      dsu.union(authDocument, personDocument)
    }
  }
  for (const registry of collections.cpf_registry || []) {
    const ownerDocument = aliasesByValue.get(registry.ownerUid)
    const personDocument = aliasesByValue.get(registry.personId)
    if (ownerDocument !== undefined && personDocument !== undefined) {
      dsu.union(ownerDocument, personDocument)
    }
  }

  const initial = new Map()
  users.forEach((user, index) => {
    const root = dsu.find(index)
    if (!initial.has(root)) initial.set(root, [])
    initial.get(root).push(index)
  })

  // Um documento antigo sem CPF só é unido por e-mail quando nome ou nascimento
  // também coincide. Isso evita transformar e-mail compartilhado em identidade.
  for (const indexes of initial.values()) {
    const cpfs = unique(indexes.map((index) => cpfFor(users[index])))
    if (cpfs.length > 0) continue
    const source = users[indexes[0]]
    const email = lower(source.email)
    if (!email) continue
    const candidates = users
      .map((candidate, index) => ({ candidate, index }))
      .filter(({ candidate }) => {
        return lower(candidate.email) === email && Boolean(cpfFor(candidate))
      })
    const candidateCpfs = unique(candidates.map(({ candidate }) => cpfFor(candidate)))
    if (candidateCpfs.length === 1 && candidates.length > 0) {
      dsu.union(indexes[0], candidates[0].index)
    }
  }

  const grouped = new Map()
  users.forEach((user, index) => {
    const root = dsu.find(index)
    if (!grouped.has(root)) grouped.set(root, [])
    grouped.get(root).push(user)
  })

  const referencedAliases = new Set()
  for (const relation of collections.relationships || []) {
    referencedAliases.add(relation.fromPersonId)
    referencedAliases.add(relation.toPersonId)
  }
  for (const grant of collections.access_grants || []) {
    referencedAliases.add(grant.granteePersonId)
    referencedAliases.add(grant.subjectPersonId)
  }
  for (const record of collections.vaccination_records || []) {
    referencedAliases.add(record.patientId)
  }

  let birthDateConflicts = 0
  const groups = [...grouped.values()].map((documents) => {
    documents.sort(
      (left, right) =>
        new Date(right._updateTime || right.updatedAt || 0) -
        new Date(left._updateTime || left.updatedAt || 0),
    )
    const aliases = unique(documents.flatMap(aliasesFor))
    const cpfs = unique(documents.map(cpfFor))
    const births = unique(documents.map((item) => dateOnly(item.birthDate)))
    if (cpfs.length > 1) throw new Error('Conflito: identidade Firestore possui múltiplos CPFs.')
    if (births.length > 1) birthDateConflicts += 1

    const roles = unique(
      documents.flatMap((item) => [item.role, ...(item.roles || [])]).map(lower),
    )
    const explicitPersonIds = unique(
      documents.flatMap((item) => [item.personId, item.id]).map((item) => String(item || '')),
    )
    const legacyPersonId = explicitPersonIds[0] || aliases[0]
    const referenced = aliases.some((alias) => referencedAliases.has(alias))
    const isAdmin = roles.includes('admin')
    const isHealthProfessional =
      documents.some((item) => item.healthProfessional === true) ||
      roles.some((role) => role.includes('professional'))

    return {
      documents,
      aliases,
      cpf: cpfs[0] || null,
      // Para duplicatas históricas com o mesmo CPF, o documento mais recente
      // fornece o perfil corrente. Um usuário SQL já existente nunca tem a
      // data sobrescrita por este backfill.
      birthDate: dateOnly(pick(documents, ['birthDate'])),
      email: lower(pick(documents, ['email'])) || null,
      name: String(pick(documents, ['fullName', 'name', 'nome']) || '').trim(),
      phone: pick(documents, ['phone']),
      photoUrl: pick(documents, ['photoUrl']),
      sex: pick(documents, ['sex']),
      status:
        lower(pick(documents, ['accountStatus'])) === 'blocked' ? 'BLOCKED' : 'ACTIVE',
      roles,
      isAdmin,
      isHealthProfessional,
      referenced,
      patientEligible: !isAdmin || referenced,
      patientType:
        roles.includes('dependent') || roles.includes('child') ? 'CHILD' : 'ADULT',
      motherName: pick(documents, ['motherName']),
      responsibleAlias: pick(documents, ['responsibleId']),
      legacyPersonId,
      authCandidates: new Set(
        documents.flatMap((item) => [
          item.authUid,
          item.canAuthenticate === true ? item.uid : null,
          item.canAuthenticate === true ? item._docId : null,
        ]).filter(Boolean),
      ),
    }
  })

  const groupByAlias = new Map()
  for (const group of groups) {
    for (const alias of group.aliases) {
      if (groupByAlias.has(alias) && groupByAlias.get(alias) !== group) {
        throw new Error('Conflito: alias Firestore pertence a duas identidades.')
      }
      groupByAlias.set(alias, group)
    }
  }

  for (const link of collections.auth_links || []) {
    const group = groupByAlias.get(link.personId)
    if (!group) throw new Error('auth_links referencia pessoa inexistente.')
    group.authCandidates.add(link._docId)
  }
  for (const group of groups) {
    const candidates = unique([...group.authCandidates])
    if (candidates.length > 1) {
      throw new Error('Conflito: identidade Firestore possui múltiplos authUid.')
    }
    group.authUid = candidates[0] || null
  }

  return { groups, groupByAlias, identityConflicts: { birthDate: birthDateConflicts } }
}

const q = (value, cast = '') => {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  return `'${String(value).replaceAll("'", "''")}'${cast}`
}

const textArray = (values) => {
  if (!Array.isArray(values)) return 'NULL'
  return `ARRAY[${values.map((value) => q(value)).join(', ')}]::text[]`
}

const jsonb = (value) => (value === null || value === undefined ? 'NULL' : q(JSON.stringify(value), '::jsonb'))

const statements = []
const metrics = {
  identityGroups: 0,
  patientIdentityGroups: 0,
  authLinks: 0,
  identitiesSkippedIncomplete: 0,
  usersCreated: 0,
  usersUpdated: 0,
  patientsCreated: 0,
  patientsUpdated: 0,
  responsibleConflictsPreserved: 0,
  vaccinesCreated: 0,
  vaccinesUpdated: 0,
  relationshipsCreated: 0,
  relationshipsUpdated: 0,
  legacyGrantsCreated: 0,
  legacyGrantsUpdated: 0,
  selfGrantsCreated: 0,
  emergencyContactsCreated: 0,
  emergencyContactsUpdated: 0,
  emptyEmergencyContactsSkipped: 0,
  applicationsCreated: 0,
  applicationsLinked: 0,
  applicationsUpdated: 0,
}

const requiredTables = [
  'user',
  'patient',
  'professional',
  'u_b_s',
  'vaccine',
  'application',
  'family_relationship',
  'patient_access',
  'emergency_contact',
]
for (const table of requiredTables) {
  if (!Array.isArray(sqlBackup.tables?.[table])) {
    throw new Error(`Backup SQL sem a tabela obrigatória ${table}.`)
  }
}

const sqlUsers = sqlBackup.tables.user
const sqlPatients = sqlBackup.tables.patient
const userById = new Map(sqlUsers.map((item) => [item.id, item]))
const patientByUserId = new Map(sqlPatients.map((item) => [item.user_id, item]))
const usersByCpf = new Map(sqlUsers.map((item) => [digits(item.cpf), item]))
const usersByEmail = new Map(sqlUsers.filter((item) => item.email).map((item) => [lower(item.email), item]))
const usersByAuthUid = new Map(
  sqlUsers.filter((item) => item.auth_uid).map((item) => [item.auth_uid, item]),
)

const { groups, groupByAlias, identityConflicts } = buildIdentityGroups()
metrics.identityGroups = groups.length
metrics.patientIdentityGroups = groups.filter((group) => group.patientEligible).length
metrics.authLinks = groups.filter((group) => group.authUid).length

for (const group of groups) {
  const matches = unique([
    group.cpf ? usersByCpf.get(group.cpf)?.id : null,
    group.email ? usersByEmail.get(group.email)?.id : null,
    group.authUid ? usersByAuthUid.get(group.authUid)?.id : null,
  ])
  if (matches.length > 1) {
    throw new Error('Conflito: CPF, e-mail e authUid apontam para usuários SQL distintos.')
  }
  let sqlUser = matches.length ? userById.get(matches[0]) : null
  const desiredRole = group.isHealthProfessional
    ? 'PROFESSIONAL'
    : group.isAdmin
      ? 'ADMIN'
      : 'PATIENT'

  if (!sqlUser) {
    if (!group.cpf || !group.birthDate || !group.name) {
      if (!group.authUid && !group.referenced) {
        group.skippedIncomplete = true
        group.patientEligible = false
        metrics.patientIdentityGroups -= 1
        metrics.identitiesSkippedIncomplete += 1
        continue
      }
      throw new Error(
        `Identidade nova incompleta (cpf=${Boolean(group.cpf)}, nascimento=${Boolean(group.birthDate)}, nome=${Boolean(group.name)}, email=${Boolean(group.email)}, aliases=${group.aliases.length}, admin=${group.isAdmin}, profissional=${group.isHealthProfessional}, paciente=${group.patientEligible}, auth=${Boolean(group.authUid)}).`,
      )
    }
    const id = stableUuid(`user:${group.legacyPersonId}`)
    sqlUser = {
      id,
      name: group.name,
      birth_date: group.birthDate,
      email: group.email,
      auth_uid: group.authUid,
      status: group.status,
      cpf: group.cpf,
      sex: group.sex,
      phone: group.phone,
      photo_url: group.photoUrl,
      portal_role: desiredRole,
      created_at: timestamp(pick(group.documents, ['createdAt'])) || new Date().toISOString(),
      updated_at: timestamp(pick(group.documents, ['updatedAt'])) || new Date().toISOString(),
    }
    statements.push(
      `INSERT INTO "public"."user" ("id", "name", "birth_date", "email", "auth_uid", "status", "cpf", "sex", "phone", "photo_url", "portal_role", "created_at", "updated_at") VALUES (${q(id, '::uuid')}, ${q(sqlUser.name)}, ${q(sqlUser.birth_date, '::date')}, ${q(sqlUser.email)}, ${q(sqlUser.auth_uid)}, ${q(sqlUser.status, '::user_status')}, ${q(sqlUser.cpf)}, ${q(sqlUser.sex)}, ${q(sqlUser.phone)}, ${q(sqlUser.photo_url)}, ${q(sqlUser.portal_role, '::portal_role')}, ${q(sqlUser.created_at, '::timestamptz')}, ${q(sqlUser.updated_at, '::timestamptz')});`,
    )
    metrics.usersCreated += 1
    userById.set(id, sqlUser)
    usersByCpf.set(group.cpf, sqlUser)
    if (group.email) usersByEmail.set(group.email, sqlUser)
    if (group.authUid) usersByAuthUid.set(group.authUid, sqlUser)
  } else {
    if (group.authUid && sqlUser.auth_uid && sqlUser.auth_uid !== group.authUid) {
      throw new Error('Conflito: usuário SQL já possui outro authUid.')
    }
    if (sqlUser.portal_role && sqlUser.portal_role !== desiredRole) {
      throw new Error('Conflito: papel SQL existente diverge do papel legado controlado.')
    }
    const changes = {}
    if (!sqlUser.auth_uid && group.authUid) changes.auth_uid = group.authUid
    if (!sqlUser.email && group.email) changes.email = group.email
    if (!sqlUser.phone && group.phone) changes.phone = group.phone
    if (!sqlUser.photo_url && group.photoUrl) changes.photo_url = group.photoUrl
    if (!sqlUser.portal_role) changes.portal_role = desiredRole
    if (!sqlUser.created_at) {
      changes.created_at = timestamp(pick(group.documents, ['createdAt'])) || new Date().toISOString()
    }
    if (!sqlUser.updated_at) {
      changes.updated_at = timestamp(pick(group.documents, ['updatedAt'])) || new Date().toISOString()
    }
    if (Object.keys(changes).length) {
      const assignments = Object.entries(changes).map(([key, value]) => {
        const cast = key === 'portal_role' ? '::portal_role' : key.endsWith('_at') ? '::timestamptz' : ''
        return `"${key}" = ${q(value, cast)}`
      })
      statements.push(
        `UPDATE "public"."user" SET ${assignments.join(', ')} WHERE "id" = ${q(sqlUser.id, '::uuid')};`,
      )
      Object.assign(sqlUser, changes)
      metrics.usersUpdated += 1
    }
  }

  group.sqlUser = sqlUser
  let patient = patientByUserId.get(sqlUser.id)
  if (group.patientEligible && !patient) {
    const id = stableUuid(`patient:${group.legacyPersonId}`)
    patient = {
      id,
      user_id: sqlUser.id,
      patient_type: group.patientType,
      active: true,
      legacy_person_id: group.legacyPersonId,
      mother_name: group.motherName,
      responsible_id: null,
    }
    statements.push(
      `INSERT INTO "public"."patient" ("id", "user_id", "patient_type", "active", "legacy_person_id", "mother_name") VALUES (${q(id, '::uuid')}, ${q(sqlUser.id, '::uuid')}, ${q(group.patientType, '::patient_type')}, TRUE, ${q(group.legacyPersonId)}, ${q(group.motherName)});`,
    )
    patientByUserId.set(sqlUser.id, patient)
    metrics.patientsCreated += 1
  } else if (group.patientEligible && patient) {
    if (patient.legacy_person_id && !group.aliases.includes(patient.legacy_person_id)) {
      throw new Error('Conflito: paciente SQL possui legacyPersonId de outra identidade.')
    }
    const changes = {}
    if (!patient.legacy_person_id) changes.legacy_person_id = group.legacyPersonId
    if (!patient.mother_name && group.motherName) changes.mother_name = group.motherName
    if (Object.keys(changes).length) {
      statements.push(
        `UPDATE "public"."patient" SET ${Object.entries(changes).map(([key, value]) => `"${key}" = ${q(value)}`).join(', ')} WHERE "id" = ${q(patient.id, '::uuid')};`,
      )
      Object.assign(patient, changes)
      metrics.patientsUpdated += 1
    }
  }
  group.sqlPatient = patient || null
}

for (const group of groups) {
  if (!group.responsibleAlias || !group.sqlPatient) continue
  const responsible = groupByAlias.get(group.responsibleAlias)?.sqlPatient
  if (!responsible) throw new Error('Responsável legado não pôde ser associado a paciente SQL.')
  if (group.sqlPatient.responsible_id && group.sqlPatient.responsible_id !== responsible.id) {
    // O vínculo SQL existente é preservado. As relações legadas continuam
    // sendo importadas separadamente e não substituem o responsável atual.
    metrics.responsibleConflictsPreserved += 1
    continue
  }
  if (!group.sqlPatient.responsible_id) {
    statements.push(
      `UPDATE "public"."patient" SET "responsible_id" = ${q(responsible.id, '::uuid')} WHERE "id" = ${q(group.sqlPatient.id, '::uuid')};`,
    )
    group.sqlPatient.responsible_id = responsible.id
    metrics.patientsUpdated += 1
  }
}

const vaccines = sqlBackup.tables.vaccine.map((item) => ({ ...item }))
const vaccineById = new Map(vaccines.map((item) => [item.id, item]))
const vaccineByLegacy = new Map(
  vaccines.filter((item) => item.legacy_vaccine_id).map((item) => [item.legacy_vaccine_id, item]),
)
const vaccinesByName = new Map()
for (const vaccine of vaccines) {
  const key = normalizedText(vaccine.name)
  if (!vaccinesByName.has(key)) vaccinesByName.set(key, [])
  vaccinesByName.get(key).push(vaccine)
}
const vaccineFields = {
  short_name: ['shortName', 'text'],
  recommended_age: ['recommendedAge', 'text'],
  interval_days: ['intervalDays', 'number'],
  prevents: ['prevents', 'array'],
  target_groups: ['targetGroups', 'array'],
  dose_schedule: ['doseSchedule', 'json'],
  expected_reactions: ['expectedReactions', 'array'],
  warning_signs: ['warningSigns', 'array'],
  contraindications: ['contraindications', 'array'],
  source_name: ['sourceName', 'text'],
  source_url: ['sourceUrl', 'text'],
  source_updated_at: ['sourceUpdatedAt', 'timestamp'],
  calendar_version: ['calendarVersion', 'text'],
}
const firestoreVaccineToSql = new Map()

for (const source of collections.vaccines || []) {
  const legacyId = source.id || source._docId
  const byLegacy = vaccineByLegacy.get(legacyId)
  const byName = vaccinesByName.get(normalizedText(source.name)) || []
  const matches = unique([byLegacy?.id, ...byName.map((item) => item.id)])
  if (matches.length > 1) throw new Error('Conflito: vacina legada possui múltiplas correspondências SQL.')
  let vaccine = matches.length ? vaccineById.get(matches[0]) : null
  if (!vaccine) {
    if (!source.name) throw new Error('Vacina legada sem nome.')
    const id = stableUuid(`vaccine:${legacyId}`)
    vaccine = {
      id,
      name: source.name,
      description: source.description || null,
      required_doses: source.doseCount || 1,
      legacy_vaccine_id: legacyId,
      active: source.active !== false,
    }
    statements.push(
      `INSERT INTO "public"."vaccine" ("id", "name", "description", "required_doses", "legacy_vaccine_id", "active") VALUES (${q(id, '::uuid')}, ${q(vaccine.name)}, ${q(vaccine.description)}, ${q(vaccine.required_doses)}, ${q(legacyId)}, ${q(vaccine.active)});`,
    )
    vaccineById.set(id, vaccine)
    metrics.vaccinesCreated += 1
  } else {
    if (vaccine.legacy_vaccine_id && vaccine.legacy_vaccine_id !== legacyId) {
      throw new Error('Conflito: vacina SQL já possui outro legacyVaccineId.')
    }
    const assignments = []
    if (!vaccine.legacy_vaccine_id) {
      assignments.push(`"legacy_vaccine_id" = ${q(legacyId)}`)
      vaccine.legacy_vaccine_id = legacyId
    }
    for (const [column, [field, kind]] of Object.entries(vaccineFields)) {
      const value = source[field]
      if (vaccine[column] !== null && vaccine[column] !== undefined) continue
      if (value === null || value === undefined) continue
      const encoded =
        kind === 'array'
          ? textArray(value)
          : kind === 'json'
            ? jsonb(value)
            : kind === 'timestamp'
              ? q(timestamp(value), '::timestamptz')
              : q(value)
      assignments.push(`"${column}" = ${encoded}`)
      vaccine[column] = value
    }
    if (assignments.length) {
      statements.push(
        `UPDATE "public"."vaccine" SET ${assignments.join(', ')} WHERE "id" = ${q(vaccine.id, '::uuid')};`,
      )
      metrics.vaccinesUpdated += 1
    }
  }
  firestoreVaccineToSql.set(legacyId, vaccine)
}

const enumRelationship = (value) => {
  const mapped = {
    mother: 'MOTHER',
    father: 'FATHER',
    legal_guardian: 'LEGAL_GUARDIAN',
    tutor: 'TUTOR',
    caregiver: 'CAREGIVER',
  }[lower(value)]
  if (!mapped) throw new Error('Tipo de relacionamento legado desconhecido.')
  return mapped
}
const enumRelationshipStatus = (value) => {
  const mapped = { pending: 'PENDING', verified: 'VERIFIED', revoked: 'REVOKED' }[lower(value)]
  if (!mapped) throw new Error('Status de relacionamento legado desconhecido.')
  return mapped
}
const enumConsent = (value) => {
  const mapped = { pending: 'PENDING', granted: 'GRANTED', revoked: 'REVOKED' }[lower(value)]
  if (!mapped) throw new Error('Consentimento legado desconhecido.')
  return mapped
}

const relationships = sqlBackup.tables.family_relationship.map((item) => ({ ...item }))
const relationshipByKey = new Map(
  relationships.map((item) => [`${item.from_patient_id}:${item.to_patient_id}`, item]),
)
const relationshipByLegacy = new Map(
  relationships.filter((item) => item.legacy_relationship_id).map((item) => [item.legacy_relationship_id, item]),
)

for (const source of collections.relationships || []) {
  const from = groupByAlias.get(source.fromPersonId)?.sqlPatient
  const to = groupByAlias.get(source.toPersonId)?.sqlPatient
  if (!from || !to || from.id === to.id) {
    throw new Error('Relacionamento legado possui pacientes inválidos.')
  }
  const key = `${from.id}:${to.id}`
  const legacy = relationshipByLegacy.get(source._docId)
  const current = relationshipByKey.get(key)
  if (legacy && current && legacy !== current) {
    throw new Error('Conflito: relacionamento legado e chave SQL divergem.')
  }
  const permissions = source.permissions || {}
  if (!legacy && !current) {
    const row = {
      from_patient_id: from.id,
      to_patient_id: to.id,
      relationship_type: enumRelationship(source.type),
      status: enumRelationshipStatus(source.status),
      consent_status: enumConsent(source.consentStatus),
      view_vaccination: permissions.viewVaccination !== false,
      receive_notifications: permissions.receiveNotifications !== false,
      valid_until: timestamp(source.validUntil),
      legacy_relationship_id: source._docId,
      created_at: timestamp(source.createdAt),
      updated_at: timestamp(source.updatedAt),
    }
    statements.push(
      `INSERT INTO "public"."family_relationship" ("from_patient_id", "to_patient_id", "relationship_type", "status", "consent_status", "view_vaccination", "receive_notifications", "valid_until", "legacy_relationship_id", "created_at", "updated_at") VALUES (${q(row.from_patient_id, '::uuid')}, ${q(row.to_patient_id, '::uuid')}, ${q(row.relationship_type, '::relationship_type')}, ${q(row.status, '::relationship_status')}, ${q(row.consent_status, '::consent_status')}, ${q(row.view_vaccination)}, ${q(row.receive_notifications)}, ${q(row.valid_until, '::timestamptz')}, ${q(row.legacy_relationship_id)}, ${q(row.created_at, '::timestamptz')}, ${q(row.updated_at, '::timestamptz')});`,
    )
    relationshipByKey.set(key, row)
    relationshipByLegacy.set(source._docId, row)
    metrics.relationshipsCreated += 1
  } else {
    const row = legacy || current
    if (!row.legacy_relationship_id) {
      statements.push(
        `UPDATE "public"."family_relationship" SET "legacy_relationship_id" = ${q(source._docId)} WHERE "from_patient_id" = ${q(from.id, '::uuid')} AND "to_patient_id" = ${q(to.id, '::uuid')};`,
      )
      row.legacy_relationship_id = source._docId
      metrics.relationshipsUpdated += 1
    }
  }
}

const accesses = sqlBackup.tables.patient_access.map((item) => ({ ...item }))
const accessByKey = new Map(
  accesses.map((item) => [`${item.grantee_auth_uid}:${item.patient_id}`, item]),
)
const accessByLegacy = new Map(
  accesses.filter((item) => item.legacy_grant_id).map((item) => [item.legacy_grant_id, item]),
)

function planAccess(row, metricPrefix) {
  const key = `${row.grantee_auth_uid}:${row.patient_id}`
  const legacy = row.legacy_grant_id ? accessByLegacy.get(row.legacy_grant_id) : null
  const current = accessByKey.get(key)
  if (legacy && current && legacy !== current) throw new Error('Conflito: grant legado e chave SQL divergem.')
  if (!legacy && !current) {
    statements.push(
      `INSERT INTO "public"."patient_access" ("grantee_auth_uid", "patient_id", "access_kind", "view_profile", "view_vaccination", "receive_notifications", "consent_status", "valid_until", "legacy_grant_id", "created_at", "updated_at") VALUES (${q(row.grantee_auth_uid)}, ${q(row.patient_id, '::uuid')}, ${q(row.access_kind, '::patient_access_kind')}, ${q(row.view_profile)}, ${q(row.view_vaccination)}, ${q(row.receive_notifications)}, ${q(row.consent_status, '::consent_status')}, ${q(row.valid_until, '::timestamptz')}, ${q(row.legacy_grant_id)}, ${q(row.created_at, '::timestamptz')}, ${q(row.updated_at, '::timestamptz')});`,
    )
    accessByKey.set(key, row)
    if (row.legacy_grant_id) accessByLegacy.set(row.legacy_grant_id, row)
    metrics[`${metricPrefix}Created`] += 1
  } else if (row.legacy_grant_id && !(legacy || current).legacy_grant_id) {
    statements.push(
      `UPDATE "public"."patient_access" SET "legacy_grant_id" = ${q(row.legacy_grant_id)} WHERE "grantee_auth_uid" = ${q(row.grantee_auth_uid)} AND "patient_id" = ${q(row.patient_id, '::uuid')};`,
    )
    ;(legacy || current).legacy_grant_id = row.legacy_grant_id
    metrics[`${metricPrefix}Updated`] += 1
  }
}

for (const source of collections.access_grants || []) {
  const grantee = groupByAlias.get(source.granteePersonId)
  const patient = groupByAlias.get(source.subjectPersonId)?.sqlPatient
  if (!grantee?.authUid || !patient) {
    throw new Error('Grant legado sem authUid do responsável ou paciente de destino.')
  }
  planAccess(
    {
      grantee_auth_uid: grantee.authUid,
      patient_id: patient.id,
      access_kind: 'CAREGIVER',
      view_profile: true,
      view_vaccination: source.viewVaccination !== false,
      receive_notifications: source.receiveNotifications !== false,
      consent_status: enumConsent(source.consentStatus),
      valid_until: timestamp(source.validUntil),
      legacy_grant_id: source._docId,
      created_at: timestamp(source.createdAt),
      updated_at: timestamp(source.updatedAt),
    },
    'legacyGrants',
  )
}

for (const group of groups) {
  if (!group.authUid || !group.sqlPatient) continue
  planAccess(
    {
      grantee_auth_uid: group.authUid,
      patient_id: group.sqlPatient.id,
      access_kind: 'SELF',
      view_profile: true,
      view_vaccination: true,
      receive_notifications: true,
      consent_status: 'GRANTED',
      valid_until: null,
      legacy_grant_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'selfGrants',
  )
}

const contacts = new Map(
  sqlBackup.tables.emergency_contact.map((item) => [item.user_id, { ...item }]),
)
for (const source of collections.emergency_contacts || []) {
  const segments = source._path.split('/')
  const usersIndex = segments.lastIndexOf('users')
  const parentUid = usersIndex === -1 ? null : segments[usersIndex + 1]
  const group = groups.find(
    (item) => item.authUid === parentUid || item.aliases.includes(parentUid),
  )
  if (!source.name && !source.phone && !source.relationship) {
    metrics.emptyEmergencyContactsSkipped += 1
    continue
  }
  if (!group?.sqlUser || !source.name || !source.phone || !source.relationship) {
    throw new Error('Contato de emergência privado não pôde ser associado integralmente.')
  }
  const current = contacts.get(group.sqlUser.id)
  if (!current) {
    const row = {
      user_id: group.sqlUser.id,
      name: source.name,
      phone: source.phone,
      relationship: source.relationship,
      created_at: timestamp(source.createdAt) || source._createTime,
      updated_at: timestamp(source.updatedAt) || source._updateTime,
    }
    statements.push(
      `INSERT INTO "public"."emergency_contact" ("user_id", "name", "phone", "relationship", "created_at", "updated_at") VALUES (${q(row.user_id, '::uuid')}, ${q(row.name)}, ${q(row.phone)}, ${q(row.relationship)}, ${q(row.created_at, '::timestamptz')}, ${q(row.updated_at, '::timestamptz')});`,
    )
    contacts.set(row.user_id, row)
    metrics.emergencyContactsCreated += 1
  } else if (
    current.name !== source.name ||
    current.phone !== source.phone ||
    current.relationship !== source.relationship
  ) {
    statements.push(
      `UPDATE "public"."emergency_contact" SET "name" = ${q(source.name)}, "phone" = ${q(source.phone)}, "relationship" = ${q(source.relationship)}, "updated_at" = ${q(timestamp(source.updatedAt) || source._updateTime, '::timestamptz')} WHERE "user_id" = ${q(group.sqlUser.id, '::uuid')};`,
    )
    metrics.emergencyContactsUpdated += 1
  }
}

const professionals = sqlBackup.tables.professional.map((item) => ({ ...item }))
const professionalByAuthUid = new Map()
for (const professional of professionals) {
  const user = userById.get(professional.user_id)
  if (user?.auth_uid) professionalByAuthUid.set(user.auth_uid, professional)
}
const ubsRows = sqlBackup.tables.u_b_s
const applications = sqlBackup.tables.application.map((item) => ({ ...item }))
const applicationByLegacy = new Map(
  applications.filter((item) => item.legacy_record_id).map((item) => [item.legacy_record_id, item]),
)

for (const source of collections.vaccination_records || []) {
  const patientGroup = groupByAlias.get(source.patientId)
  const patient = patientGroup?.sqlPatient
  const vaccine = firestoreVaccineToSql.get(source.vaccineId)
  const appliedAt = timestamp(source.appliedAt)
  if (!patient || !vaccine || !appliedAt) {
    throw new Error('Registro vacinal legado sem paciente, vacina ou data válida.')
  }
  let current = applicationByLegacy.get(source._docId)
  if (!current) {
    const exact = applications.filter(
      (item) =>
        item.patient_id === patient.id &&
        item.vaccine_id === vaccine.id &&
        timestamp(item.application_date) === appliedAt &&
        (source.doseNumber == null || item.dose_number === source.doseNumber) &&
        (!source.lot || item.lot_snapshot === source.lot),
    )
    const sameDay = applications.filter(
      (item) =>
        item.patient_id === patient.id &&
        item.vaccine_id === vaccine.id &&
        dateOnly(item.application_date) === dateOnly(appliedAt) &&
        (source.doseNumber == null || item.dose_number === source.doseNumber) &&
        (!source.lot || item.lot_snapshot === source.lot),
    )
    const candidates = exact.length ? exact : sameDay
    if (candidates.length > 1) {
      throw new Error('Registro vacinal possui correspondência SQL ambígua.')
    }
    current = candidates[0] || null
    if (current) {
      if (current.legacy_record_id && current.legacy_record_id !== source._docId) {
        throw new Error('Aplicação SQL correspondente já possui outro legacyRecordId.')
      }
      if (!current.legacy_record_id) {
        statements.push(
          `UPDATE "public"."application" SET "legacy_record_id" = ${q(source._docId)}, "next_dose_at" = COALESCE("next_dose_at", ${q(timestamp(source.nextDoseAt), '::timestamptz')}), "dose_label" = COALESCE("dose_label", ${q(source.doseLabel)}), "updated_at" = COALESCE("updated_at", ${q(timestamp(source.updatedAt), '::timestamptz')}) WHERE "id" = ${q(current.id, '::uuid')};`,
        )
        current.legacy_record_id = source._docId
        applicationByLegacy.set(source._docId, current)
        metrics.applicationsLinked += 1
      }
    }
  }

  if (!current) {
    const professional = professionalByAuthUid.get(source.professionalUid) || null
    const professionalUser = professional ? userById.get(professional.user_id) : null
    const facilityMatches = ubsRows.filter(
      (item) => normalizedText(item.name) === normalizedText(source.facilityName),
    )
    if (facilityMatches.length > 1) throw new Error('Unidade legada possui correspondência SQL ambígua.')
    const facility = facilityMatches[0] || null
    const id = stableUuid(`application:${source._docId}`)
    const row = {
      id,
      patient_id: patient.id,
      professional_id: professional?.id || null,
      ubs_id: facility?.id || professional?.ubs_id || null,
      vaccine_id: vaccine.id,
      application_date: appliedAt,
      dose_number: source.doseNumber,
      dose_label: source.doseLabel,
      next_dose_at: timestamp(source.nextDoseAt),
      legacy_record_id: source._docId,
      patient_id_snapshot: patient.id,
      patient_legacy_person_id_snapshot: patient.legacy_person_id,
      patient_name_snapshot: patientGroup.sqlUser.name,
      vaccine_name_snapshot: vaccine.name,
      lot_snapshot: source.lot,
      manufacturer_snapshot: source.manufacturer,
      facility_name_snapshot: source.facilityName || facility?.name || 'Unidade não informada',
      professional_name_snapshot: professionalUser?.name || 'Registrado pelo Portal Vitta',
      professional_registration_snapshot: professional?.professional_registration || null,
      source: source.source || 'FIRESTORE_BACKFILL',
      notes: source.notes,
      created_at: timestamp(source.createdAt) || appliedAt,
      updated_at: timestamp(source.updatedAt) || appliedAt,
    }
    statements.push(
      `INSERT INTO "public"."application" ("id", "patient_id", "professional_id", "ubs_id", "vaccine_id", "application_date", "dose_number", "dose_label", "next_dose_at", "legacy_record_id", "patient_id_snapshot", "patient_legacy_person_id_snapshot", "patient_name_snapshot", "vaccine_name_snapshot", "lot_snapshot", "manufacturer_snapshot", "facility_name_snapshot", "professional_name_snapshot", "professional_registration_snapshot", "source", "notes", "created_at", "updated_at") VALUES (${q(row.id, '::uuid')}, ${q(row.patient_id, '::uuid')}, ${q(row.professional_id, '::uuid')}, ${q(row.ubs_id, '::uuid')}, ${q(row.vaccine_id, '::uuid')}, ${q(row.application_date, '::timestamptz')}, ${q(row.dose_number)}, ${q(row.dose_label)}, ${q(row.next_dose_at, '::timestamptz')}, ${q(row.legacy_record_id)}, ${q(row.patient_id_snapshot, '::uuid')}, ${q(row.patient_legacy_person_id_snapshot)}, ${q(row.patient_name_snapshot)}, ${q(row.vaccine_name_snapshot)}, ${q(row.lot_snapshot)}, ${q(row.manufacturer_snapshot)}, ${q(row.facility_name_snapshot)}, ${q(row.professional_name_snapshot)}, ${q(row.professional_registration_snapshot)}, ${q(row.source)}, ${q(row.notes)}, ${q(row.created_at, '::timestamptz')}, ${q(row.updated_at, '::timestamptz')});`,
    )
    applications.push(row)
    applicationByLegacy.set(source._docId, row)
    metrics.applicationsCreated += 1
  }
}

const expected = {
  users: sqlUsers.length + metrics.usersCreated,
  patients: sqlPatients.length + metrics.patientsCreated,
  vaccines: sqlBackup.tables.vaccine.length + metrics.vaccinesCreated,
  relationships:
    sqlBackup.tables.family_relationship.length + metrics.relationshipsCreated,
  accesses:
    sqlBackup.tables.patient_access.length +
    metrics.legacyGrantsCreated +
    metrics.selfGrantsCreated,
  emergencyContacts:
    sqlBackup.tables.emergency_contact.length + metrics.emergencyContactsCreated,
  applications: sqlBackup.tables.application.length + metrics.applicationsCreated,
}

const verification = `
DO $verify$
BEGIN
  IF (SELECT count(*) FROM "public"."user") <> ${expected.users} THEN RAISE EXCEPTION 'Contagem user inesperada'; END IF;
  IF (SELECT count(*) FROM "public"."patient") <> ${expected.patients} THEN RAISE EXCEPTION 'Contagem patient inesperada'; END IF;
  IF (SELECT count(*) FROM "public"."vaccine") <> ${expected.vaccines} THEN RAISE EXCEPTION 'Contagem vaccine inesperada'; END IF;
  IF (SELECT count(*) FROM "public"."family_relationship") <> ${expected.relationships} THEN RAISE EXCEPTION 'Contagem family_relationship inesperada'; END IF;
  IF (SELECT count(*) FROM "public"."patient_access") <> ${expected.accesses} THEN RAISE EXCEPTION 'Contagem patient_access inesperada'; END IF;
  IF (SELECT count(*) FROM "public"."emergency_contact") <> ${expected.emergencyContacts} THEN RAISE EXCEPTION 'Contagem emergency_contact inesperada'; END IF;
  IF (SELECT count(*) FROM "public"."application") <> ${expected.applications} THEN RAISE EXCEPTION 'Contagem application inesperada'; END IF;
  IF EXISTS (SELECT 1 FROM "public"."application" WHERE "patient_name_snapshot" IS NULL OR "vaccine_name_snapshot" IS NULL OR "professional_name_snapshot" IS NULL OR "facility_name_snapshot" IS NULL) THEN RAISE EXCEPTION 'Snapshot de Application incompleto'; END IF;
END
$verify$;
`

const transactionEnd = mode === 'DRY_RUN_PRODUCTION' ? 'ROLLBACK;' : 'COMMIT;'
const sql = `BEGIN;\n${statements.join('\n')}\n${verification}\n${transactionEnd}`
if (/\b(?:DROP|TRUNCATE|DELETE)\b/i.test(sql)) {
  throw new Error('Backfill recusado: operação destrutiva detectada.')
}

const report = {
  status: mode === 'PLAN' ? 'planned' : 'ready_to_apply',
  firestoreGeneratedAt: firestore.metadata?.generatedAt,
  sqlGeneratedAt: sqlBackup.metadata?.generatedAt,
  sourceCounts: firestore.counts,
  metrics,
  identityConflicts,
  identitySummary: {
    admin: groups.filter((group) => group.isAdmin).length,
    healthProfessional: groups.filter((group) => group.isHealthProfessional).length,
    referencedByDomain: groups.filter((group) => group.referenced).length,
    withCpf: groups.filter((group) => group.cpf).length,
    withAuthentication: groups.filter((group) => group.authUid).length,
  },
  expected,
  statementCount: statements.length,
  sqlSha256: crypto.createHash('sha256').update(sql).digest('hex').toUpperCase(),
}

async function apply() {
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
  const tokens = configstore.get('tokens')
  const user = configstore.get('user')
  if (!tokens?.refresh_token || !user?.email) {
    throw new Error('Firebase CLI sem sessão completa.')
  }
  const options = {
    projectId: 'vitta-5ec1e',
    project: 'vitta-5ec1e',
    tokens,
    user,
  }
  await requireAuth(options)
  await executeSqlCmdsAsSuperUser(
    options,
    'vitta-5ec1e-instance',
    'vitta-5ec1e-database',
    [sql],
    true,
    false,
  )
  report.status = 'applied'
  report.appliedAt = new Date().toISOString()
}

;(async () => {
  if (mode !== 'PLAN') {
    await apply()
    if (mode === 'DRY_RUN_PRODUCTION') report.status = 'validated_and_rolled_back'
  }
  process.stdout.write(JSON.stringify(report, null, 2))
})().catch((error) => {
  process.stderr.write(
    JSON.stringify({
      status: 'failed',
      message: String(error?.message || error).split('\n')[0],
    }),
  )
  process.exitCode = 1
})
