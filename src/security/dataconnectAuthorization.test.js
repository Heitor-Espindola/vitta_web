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
    const operation = mobileMutations.match(
      /mutation UpdateMobilePhone[\s\S]*?(?=\n# Cria uma pessoa dependente)/,
    )?.[0]

    expect(operation).toContain('$phone: String')
    expect(operation).not.toMatch(/\$(?:authUid|cpf|portalRole|personId|status):/)
  })

  test('web global patient and application listings are admin-only', () => {
    expect(webQueries).toMatch(
      /query ListPatients[\s\S]*?@auth\(expr: "auth\.token\.admin == true"\)/,
    )
    expect(webQueries).toMatch(
      /query ListApplications[\s\S]*?@auth\(expr: "auth\.token\.admin == true"\)/,
    )
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
})
