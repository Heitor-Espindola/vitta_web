import { describe, expect, it, vi } from "vitest";
import { mapVaccineSnapshot } from "../services/vaccineService";
import { professionalReportQueryScope } from "../services/vaccinationService";
import {
  accountSettingsCapabilities,
  accountStatusLabel,
  buildAccountSummary,
} from "./accountPresentation";
import { performProfessionalLogout } from "./professionalAuth";
import {
  ReportPeriod,
  buildProfessionalReport,
  reportPeriodBounds,
} from "./reports";
import {
  nextCatalogRetryVersion,
  searchVaccines,
  vaccineCatalogCapabilities,
  vaccineCatalogViewState,
} from "./vaccineCatalog";

const reportNow = new Date(2026, 7, 31, 12);

function record(appliedAt, overrides = {}) {
  return {
    id: "technical-record-id",
    patientId: "technical-patient-id",
    professionalUid: "auth-professional-1",
    cpf: "529.982.247-25",
    vaccineName: "BCG",
    doseLabel: "Dose única",
    appliedAt,
    ...overrides,
  };
}

describe("Vacinas", () => {
  const vaccines = [
    {
      id: "bcg",
      name: "BCG",
      shortName: "BCG",
      description: "Proteção contra formas graves da tuberculose",
      active: true,
    },
    {
      id: "flu",
      name: "Influenza",
      shortName: "Gripe",
      description: "Vacina anual contra influenza",
      active: false,
    },
  ];

  it("1. mapeia registros reais do catálogo e descarta item sem nome", () => {
    const snapshot = {
      docs: [
        {
          id: "bcg",
          data: () => ({
            name: "BCG",
            shortName: "BCG",
            description: "Tuberculose",
            doseCount: 1,
            active: true,
          }),
        },
        { id: "invalid", data: () => ({ description: "Sem nome" }) },
      ],
    };
    expect(mapVaccineSnapshot(snapshot)).toEqual([
      expect.objectContaining({
        id: "bcg",
        name: "BCG",
        doseCount: 1,
        active: true,
        hasActiveStatus: true,
      }),
    ]);
  });

  it("2. identifica catálogo vazio", () => {
    expect(
      vaccineCatalogViewState({ vaccines: [], filtered: [] }),
    ).toBe("empty");
  });

  it("3. pesquisa por nome, sigla e descrição", () => {
    expect(searchVaccines(vaccines, "influenza").map((item) => item.id)).toEqual([
      "flu",
    ]);
    expect(searchVaccines(vaccines, "gripe").map((item) => item.id)).toEqual([
      "flu",
    ]);
    expect(searchVaccines(vaccines, "tuberculose").map((item) => item.id)).toEqual([
      "bcg",
    ]);
  });

  it("4. filtra vacinas ativas e inativas", () => {
    expect(searchVaccines(vaccines, "", "active").map((item) => item.id)).toEqual([
      "bcg",
    ]);
    expect(searchVaccines(vaccines, "", "inactive").map((item) => item.id)).toEqual([
      "flu",
    ]);
  });

  it("5. representa erro e inicia nova tentativa", () => {
    expect(
      vaccineCatalogViewState({ error: "falha", vaccines, filtered: vaccines }),
    ).toBe("error");
    expect(nextCatalogRetryVersion(2)).toBe(3);
  });

  it("6. mantém o catálogo sem criação, edição ou exclusão", () => {
    expect(vaccineCatalogCapabilities).toEqual({
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    });
  });
});

describe("Relatórios", () => {
  it("7. consulta somente pelo professionalUid autenticado", () => {
    expect(professionalReportQueryScope("auth-professional-1")).toEqual({
      collection: "vaccination_records",
      field: "professionalUid",
      value: "auth-professional-1",
      orderBy: "appliedAt",
      direction: "desc",
    });
  });

  it("8. limita o período Hoje ao dia atual", () => {
    const report = buildProfessionalReport(
      [
        record(new Date(2026, 7, 31, 9)),
        record(new Date(2026, 7, 30, 18)),
      ],
      { period: ReportPeriod.today, now: reportNow },
    );
    expect(report.total).toBe(1);
    expect(report.today).toBe(1);
  });

  it("9. inclui somente os últimos 7 dias", () => {
    const report = buildProfessionalReport(
      [
        record(new Date(2026, 7, 25, 8)),
        record(new Date(2026, 7, 24, 8)),
      ],
      { period: ReportPeriod.last7Days, now: reportNow },
    );
    expect(report.total).toBe(1);
  });

  it("10. inclui somente os últimos 30 dias", () => {
    const report = buildProfessionalReport(
      [
        record(new Date(2026, 7, 2, 8)),
        record(new Date(2026, 7, 1, 8)),
      ],
      { period: ReportPeriod.last30Days, now: reportNow },
    );
    expect(report.total).toBe(1);
  });

  it("11. retorna vazio no período sem dados e valida período personalizado", () => {
    const report = buildProfessionalReport([], {
      period: ReportPeriod.last30Days,
      now: reportNow,
    });
    const invalid = reportPeriodBounds({
      period: ReportPeriod.custom,
      customStart: "2026-08-20",
      customEnd: "2026-08-10",
      now: reportNow,
    });
    expect(report.total).toBe(0);
    expect(report.byVaccine).toEqual([]);
    expect(invalid.error).toBe(
      "A data inicial não pode ser posterior à data final.",
    );
  });

  it("12. agrega aplicações por vacina e por unidade", () => {
    const report = buildProfessionalReport(
      [
        record(new Date(2026, 7, 31, 8), { facilityName: "UBS Central" }),
        record(new Date(2026, 7, 30, 8), { facilityName: "UBS Central" }),
        record(new Date(2026, 7, 29, 8), {
          vaccineName: "Influenza",
          facilityName: "UBS Norte",
        }),
      ],
      { period: ReportPeriod.last30Days, now: reportNow },
    );
    expect(report.byVaccine).toEqual([
      { label: "BCG", count: 2 },
      { label: "Influenza", count: 1 },
    ]);
    expect(report.byFacility[0]).toEqual({ label: "UBS Central", count: 2 });
  });

  it("13. não devolve CPF, patientId, authUid ou IDs técnicos", () => {
    const report = buildProfessionalReport(
      [record(new Date(2026, 7, 31, 8))],
      { period: ReportPeriod.today, now: reportNow },
    );
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain("529.982.247-25");
    expect(serialized).not.toContain("technical-patient-id");
    expect(serialized).not.toContain("technical-record-id");
    expect(serialized).not.toContain("auth-professional-1");
  });
});

describe("Configurações", () => {
  it("14. apresenta nome e e-mail disponíveis", () => {
    expect(
      buildAccountSummary(
        { fullName: "Dra. Maria", email: "maria@vitta.test" },
        { email: "auth@vitta.test" },
      ),
    ).toMatchObject({ name: "Dra. Maria", email: "maria@vitta.test" });
  });

  it("15. apresenta Administrador quando o perfil possui admin", () => {
    expect(
      buildAccountSummary({ roles: ["admin", "health_professional"] }).role,
    ).toBe("Administrador");
  });

  it("16. apresenta Profissional de saúde para health_professional", () => {
    expect(
      buildAccountSummary({ roles: ["health_professional"] }).role,
    ).toBe("Profissional de saúde");
  });

  it("17. converte status active para Ativa", () => {
    expect(accountStatusLabel("active")).toBe("Ativa");
  });

  it("18. não permite autoedição de role ou accountStatus", () => {
    expect(accountSettingsCapabilities.canEditRole).toBe(false);
    expect(accountSettingsCapabilities.canEditAccountStatus).toBe(false);
  });

  it("19. não inclui IDs técnicos no resumo apresentado", () => {
    const summary = buildAccountSummary({
      personId: "person-1",
      authUid: "auth-1",
      firebaseProjectId: "project-1",
      roles: ["health_professional"],
    });
    expect(summary).not.toHaveProperty("personId");
    expect(summary).not.toHaveProperty("authUid");
    expect(summary).not.toHaveProperty("firebaseProjectId");
    expect(summary).not.toHaveProperty("roles");
  });

  it("20. reutiliza o logout atual e limpa o contexto do paciente", async () => {
    const storage = { removeItem: vi.fn() };
    const signOutUser = vi.fn(async () => {});
    await performProfessionalLogout({ storage, signOutUser });
    expect(storage.removeItem).toHaveBeenCalledWith("vitta:selectedPatientId");
    expect(signOutUser).toHaveBeenCalledOnce();
  });
});
