import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const readProjectFile = (relativePath) =>
  readFileSync(fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)), 'utf8')

const mobileQueries = readProjectFile(
  'Firebase_SQL_Connect/dataconnect/mobile-connector/queries.gql',
)
const mobileMutations = readProjectFile(
  'Firebase_SQL_Connect/dataconnect/mobile-connector/mutations.gql',
)
const webQueries = readProjectFile(
  'Firebase_SQL_Connect/dataconnect/example/queries.gql',
)
const webMutations = readProjectFile(
  'Firebase_SQL_Connect/dataconnect/example/mutations.gql',
)
const schema = readProjectFile(
  'Firebase_SQL_Connect/dataconnect/schema/schema.gql',
)
const authService = readProjectFile('src/services/authService.js')

describe('Data Connect authorization contract', () => {
  test('mobile connector is scoped by auth.uid and has no administrative operation', () => {
    const mobileSource = `${mobileQueries}\n${mobileMutations}`

    expect(mobileSource).toContain('auth.uid')
    expect(mobileSource).toContain('patientAccess')
    expect(mobileSource).not.toMatch(
      /(?:ListAll|CreateProfessional|DeletePatient|ManageUnit|ManageEmployee|CreateApplication)/,
    )
  })

  test('family access uses direct grants and never traverses relationships', () => {
    const operation = mobileQueries.match(
      /query GetAccessibleFamilyMembers[\s\S]*?(?=\nquery GetAccessiblePatientProfile)/,
    )?.[0]

    expect(operation).toContain('patientAccesses')
    expect(operation).toContain('granteeAuthUid: { eq_expr: "auth.uid" }')
    expect(operation).not.toContain('familyRelationships')
  })

  test('mobile profile updates cannot change identity or authorization fields', () => {
    const phoneOperation = mobileMutations.match(
      /mutation UpdateMobilePhone[\s\S]*?(?=\n# Nome e telefone)/,
    )?.[0]
    const profileOperation = mobileMutations.match(
      /mutation UpdateMobileProfile[\s\S]*?(?=\n# Cria uma pessoa dependente)/,
    )?.[0]

    expect(phoneOperation).toContain('$phone: String')
    expect(profileOperation).toContain('$name: String!')
    expect(profileOperation).toContain('$phone: String')
    expect(`${phoneOperation}\n${profileOperation}`).not.toMatch(
      /\$(?:authUid|cpf|birthDate|portalRole|personId|status):/,
    )
  })

  test('web global patient and application listings are admin-only', () => {
    expect(webQueries).toMatch(
      /query ListPatients[\s\S]*?@auth\(expr: "auth\.token\.admin == true"\)/,
    )
    expect(webQueries).toMatch(
      /query ListApplications[\s\S]*?@auth\(expr: "auth\.token\.admin == true"\)/,
    )
  })

  test('web session profile is resolved from SQL by auth.uid, not Firestore', () => {
    const operation = webQueries.match(
      /query GetCurrentPortalUser[\s\S]*?(?=\n# Compatibilidade)/,
    )?.[0]

    expect(operation).toContain('authUid: { eq_expr: "auth.uid" }')
    expect(operation).toContain('portalRole')
    expect(operation).toContain('professional_on_user')
    expect(authService).toContain('getCurrentPortalUser')
    expect(authService).not.toMatch(/firebase\/firestore|auth_links|doc\(db/)
  })

  test('legacy broad CPF lookup is retired and admin-only', () => {
    const operation = webQueries.match(
      /query GetUserByCpf[\s\S]*?(?=\nquery GetAdminPatientByCpf)/,
    )?.[0]

    expect(operation).toContain('@auth(expr: "auth.token.admin == true")')
    expect(operation).toContain('@retired')
  })

  test('professional CPF lookup only returns a patient with a direct active grant', () => {
    const operation = webQueries.match(
      /query GetAuthorizedPatientByCpf[\s\S]*?(?=\nquery GetPatient)/,
    )?.[0]

    expect(operation).toContain('granteeAuthUid: { eq_expr: "auth.uid" }')
    expect(operation).toContain('accessKind: { eq: PROFESSIONAL }')
    expect(operation).toContain('consentStatus: { eq: GRANTED }')
    expect(operation).toContain('viewProfile: { eq: true }')
    expect(operation).toContain('user: { cpf: { eq: $cpf } }')
  })

  test('web patient-scoped reads require a direct auth.uid grant', () => {
    for (const operationName of [
      'GetPatient',
      'ListAppointmentsByPatient',
      'ListApplicationsByPatient',
    ]) {
      const start = webQueries.indexOf(`query ${operationName}`)
      const next = webQueries.indexOf('\nquery ', start + 1)
      const operation = webQueries.slice(start, next === -1 ? undefined : next)

      expect(operation).toContain('granteeAuthUid_expr: "auth.uid"')
      expect(operation).toContain('@redact')
      expect(operation).toContain('@check')
    }
  })

  test('only the matching professional with a direct grant can create an application', () => {
    const operation = webMutations.match(
      /mutation CreateApplication[\s\S]*?(?=\nmutation UpdateApplication)/,
    )?.[0]

    expect(operation).toContain('this == auth.uid')
    expect(operation).toContain("this == 'PROFESSIONAL'")
    expect(operation).toContain('granteeAuthUid_expr: "auth.uid"')
    expect(operation).toContain("this == 'GRANTED'")
  })

  test('medical history entities expose archive or void operations, never physical deletes', () => {
    expect(webMutations).not.toMatch(
      /mutation Delete(?:Patient|Professional|Ubs|Vaccine|Application)\b/,
    )
    for (const operationName of [
      'ArchivePatient',
      'ArchiveProfessional',
      'ArchiveUbs',
      'ArchiveVaccine',
      'VoidApplication',
    ]) {
      expect(webMutations).toContain(`mutation ${operationName}`)
    }
  })

  test('application references are nullable while historical snapshots remain required', () => {
    const application = schema.match(
      /type Application @table \{[\s\S]*?\n\}/,
    )?.[0]

    expect(application).toMatch(/\n\s+patient: Patient\s*\n/)
    expect(application).toMatch(/\n\s+professional: Professional\s*\n/)
    expect(application).toMatch(/\n\s+ubs: UBS\s*\n/)
    expect(application).toMatch(/\n\s+vaccine: Vaccine\s*\n/)
    expect(application).toContain('patientIdSnapshot: UUID!')
    expect(application).toContain('patientNameSnapshot: String!')
    expect(application).toContain('vaccineNameSnapshot: String!')
    expect(application).toContain('professionalNameSnapshot: String!')
    expect(application).toContain('facilityNameSnapshot: String!')
    expect(application).toContain('voidedAt: Timestamp')
    expect(application).toContain('voidReason: String')
  })

  test('application creation derives immutable snapshots atomically', () => {
    const operation = webMutations.match(
      /mutation CreateApplication[\s\S]*?(?=\nmutation UpdateApplication)/,
    )?.[0]

    expect(operation).toMatch(/\$patientId: UUID!/)
    expect(operation).toMatch(/\$vaccineId: UUID!/)
    expect(operation).toMatch(/\$professionalId: UUID!/)
    expect(operation).toMatch(/\$ubsId: UUID!/)
    expect(operation).toContain('@transaction')
    expect(operation).toContain(
      'patientNameSnapshot_expr: "response.query.patient.user.name"',
    )
    expect(operation).toContain(
      'vaccineNameSnapshot_expr: "response.query.vaccine.name"',
    )
    expect(operation).toContain(
      'professionalNameSnapshot_expr: "response.query.professional.user.name"',
    )
    expect(operation).toContain(
      'facilityNameSnapshot_expr: "response.query.uBS.name"',
    )
  })

  test('application updates cannot rewrite identity or application date', () => {
    const operation = webMutations.match(
      /mutation UpdateApplication[\s\S]*?(?=\nmutation VoidApplication)/,
    )?.[0]

    expect(operation).not.toMatch(
      /\$(?:patientId|vaccineId|professionalId|ubsId|applicationDate):/,
    )
    expect(operation).toMatch(/\$doseNumber: Int/)
    expect(operation).toMatch(/\$doseLabel: String/)
    expect(operation).toMatch(/\$nextDoseAt: Timestamp/)
    expect(operation).toMatch(/\$notes: String/)
  })
})
