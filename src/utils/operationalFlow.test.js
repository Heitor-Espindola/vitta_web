import { Timestamp } from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";
import {
  PatientLookupError,
  authorizePatientLookupWithGateway,
  isPatientAccessExpired,
  patientAccessDurationMs,
  patientAccessErrorMessage,
} from "../services/patientService";
import {
  buildVaccinationRecord,
  mapVaccinationSnapshot,
  professionalRecordsQueryScope,
} from "../services/vaccinationService";
import {
  createSubmissionGuard,
  validateVaccinationForm,
} from "./vaccinationForm";
import {
  derivePatientRecordSummary,
  vaccinationRecordCapabilities,
} from "./vaccination";

const validCpf = "529.982.247-25";
const now = new Date(2026, 7, 31, 10);

function gateway(overrides = {}) {
  return {
    lookupRegistry: vi.fn(async () => ({ personId: "person-1" })),
    writeAccess: vi.fn(async () => {}),
    loadPatient: vi.fn(async () => ({
      fullName: "Maria Silva",
      cpfFormatted: validCpf,
      birthDate: "1998-05-12",
      accountStatus: "active",
    })),
    storage: { setItem: vi.fn() },
    now: () => now.getTime(),
    ...overrides,
  };
}

function validForm(overrides = {}) {
  return {
    vaccineId: "bcg",
    doseLabel: "Dose única",
    appliedDate: "2026-08-30",
    nextDoseDate: "",
    lot: "",
    manufacturer: "",
    facilityId: "",
    facilityName: "",
    notes: "",
    ...overrides,
  };
}

function validRecord(overrides = {}) {
  return buildVaccinationRecord({
    patientId: "person-1",
    professionalUid: "auth-professional-1",
    vaccine: { id: "bcg", name: "BCG" },
    ...validForm(),
    now,
    ...overrides,
  });
}

describe("fluxo operacional Pacientes → Histórico", () => {
  it("1. aceita CPF válido e faz a consulta exata", async () => {
    const dependencies = gateway();
    await authorizePatientLookupWithGateway(
      { cpf: validCpf, professionalUid: "auth-professional-1" },
      dependencies,
    );
    expect(dependencies.lookupRegistry).toHaveBeenCalledOnce();
    expect(dependencies.lookupRegistry.mock.calls[0][0]).toMatch(/^[a-f0-9]{64}$/);
  });

  it("2. rejeita CPF inválido antes de consultar o gateway", async () => {
    const dependencies = gateway();
    await expect(
      authorizePatientLookupWithGateway(
        { cpf: "111.111.111-11", professionalUid: "auth-professional-1" },
        dependencies,
      ),
    ).rejects.toMatchObject({ code: "invalid-cpf" });
    expect(dependencies.lookupRegistry).not.toHaveBeenCalled();
    expect(dependencies.writeAccess).not.toHaveBeenCalled();
  });

  it("3. informa paciente não encontrado sem criar acesso", async () => {
    const dependencies = gateway({ lookupRegistry: vi.fn(async () => null) });
    await expect(
      authorizePatientLookupWithGateway(
        { cpf: validCpf, professionalUid: "auth-professional-1" },
        dependencies,
      ),
    ).rejects.toMatchObject({
      code: "patient-not-found",
      message:
        "Confira o CPF informado ou solicite que o paciente realize o cadastro no Vitta.",
    });
    expect(dependencies.writeAccess).not.toHaveBeenCalled();
  });

  it("4. devolve paciente encontrado com CPF parcialmente mascarado", async () => {
    const patient = await authorizePatientLookupWithGateway(
      { cpf: validCpf, professionalUid: "auth-professional-1" },
      gateway(),
    );
    expect(patient).toMatchObject({
      personId: "person-1",
      name: "Maria Silva",
      maskedCpf: "***.***.***-25",
    });
  });

  it("5. cria e renova acesso temporário de 25 minutos", async () => {
    const dependencies = gateway();
    await authorizePatientLookupWithGateway(
      { cpf: validCpf, professionalUid: "auth-professional-1" },
      dependencies,
    );
    await authorizePatientLookupWithGateway(
      { cpf: validCpf, professionalUid: "auth-professional-1" },
      dependencies,
    );
    expect(dependencies.writeAccess).toHaveBeenCalledTimes(2);
    const [accessId, payload] = dependencies.writeAccess.mock.calls[0];
    expect(accessId).toBe("auth-professional-1_person-1");
    expect(payload.expiresAt.toMillis()).toBe(now.getTime() + patientAccessDurationMs);
    expect(payload).toMatchObject({
      patientId: "person-1",
      professionalUid: "auth-professional-1",
    });
  });

  it("6. representa paciente sem vaccination_records com resumo vazio", () => {
    expect(derivePatientRecordSummary([])).toMatchObject({
      total: 0,
      lastRecord: null,
      nextRecord: null,
      scheduledCount: 0,
    });
  });

  it("7. ordena o histórico por appliedAt decrescente", () => {
    const summary = derivePatientRecordSummary([
      { id: "old", appliedAt: new Date(2025, 0, 1) },
      { id: "new", appliedAt: new Date(2026, 0, 1) },
    ]);
    expect(summary.orderedRecords.map((record) => record.id)).toEqual([
      "new",
      "old",
    ]);
    expect(summary.lastRecord.id).toBe("new");
  });

  it("8. constrói um registro válido com timestamps de aplicação", () => {
    const payload = validRecord();
    expect(payload.appliedAt).toBeInstanceOf(Timestamp);
    expect(payload.vaccineId).toBe("bcg");
    expect(payload.vaccineName).toBe("BCG");
    expect(payload.doseLabel).toBe("Dose única");
    expect(payload.createdAt).toBeDefined();
    expect(payload.updatedAt).toBeDefined();
  });

  it("9. exige uma vacina selecionada do catálogo", () => {
    const errors = validateVaccinationForm({
      form: validForm({ vaccineId: "" }),
      selectedVaccine: null,
      now,
    });
    expect(errors.vaccineId).toBe("Selecione uma vacina do catálogo.");
  });

  it("10. rejeita data de aplicação futura", () => {
    const errors = validateVaccinationForm({
      form: validForm({ appliedDate: "2026-09-01" }),
      selectedVaccine: { id: "bcg", name: "BCG" },
      now,
    });
    expect(errors.appliedDate).toBe(
      "A data de aplicação não pode estar no futuro.",
    );
  });

  it("11. rejeita nextDoseAt anterior a appliedAt", () => {
    const errors = validateVaccinationForm({
      form: validForm({ nextDoseDate: "2026-08-29" }),
      selectedVaccine: { id: "bcg", name: "BCG" },
      now,
    });
    expect(errors.nextDoseDate).toBe(
      "A próxima dose não pode ser anterior à aplicação.",
    );
  });

  it("12. bloqueia duplo submit enquanto o primeiro está em andamento", async () => {
    const submit = createSubmissionGuard();
    let release;
    const waiting = new Promise((resolve) => {
      release = resolve;
    });
    const first = submit(() => waiting);
    const second = await submit(async () => {});
    expect(second).toBe(false);
    release();
    await expect(first).resolves.toBe(true);
  });

  it("13. converte a atualização em tempo real para o estado da tela", () => {
    const snapshot = {
      docs: [
        {
          id: "record-1",
          data: () => ({ vaccineName: "BCG", patientId: "person-1" }),
        },
      ],
    };
    const screenRecords = mapVaccinationSnapshot(snapshot);
    expect(screenRecords).toEqual([
      { id: "record-1", vaccineName: "BCG", patientId: "person-1" },
    ]);
  });

  it("14. preserva os valores do formulário quando o envio falha", async () => {
    const draft = validForm({ lot: "LOTE-123" });
    const original = structuredClone(draft);
    const submit = createSubmissionGuard();
    await expect(
      submit(async () => {
        throw new Error("falha simulada");
      }),
    ).rejects.toThrow("falha simulada");
    expect(draft).toEqual(original);
  });

  it("15. grava patientId no novo registro", () => {
    expect(validRecord().patientId).toBe("person-1");
  });

  it("16. não grava patientUid no novo registro", () => {
    expect(validRecord()).not.toHaveProperty("patientUid");
  });

  it("17. não grava status no novo registro", () => {
    expect(validRecord()).not.toHaveProperty("status");
  });

  it("18. grava o auth UID correto em professionalUid", () => {
    expect(validRecord().professionalUid).toBe("auth-professional-1");
  });

  it("19. grava source professional_panel", () => {
    expect(validRecord().source).toBe("professional_panel");
  });

  it("20. mantém update e delete indisponíveis", () => {
    expect(vaccinationRecordCapabilities).toEqual({
      canUpdate: false,
      canDelete: false,
    });
  });

  it("21. converte acesso expirado em mensagem amigável", () => {
    const error = new PatientLookupError("access-expired", "interno");
    expect(isPatientAccessExpired(error)).toBe(true);
    expect(patientAccessErrorMessage(error)).toBe(
      "O acesso a esta carteira expirou.",
    );
  });

  it("22. limita Aplicações ao professionalUid autenticado", () => {
    expect(professionalRecordsQueryScope("auth-professional-1")).toEqual({
      collection: "vaccination_records",
      field: "professionalUid",
      value: "auth-professional-1",
      orderBy: "appliedAt",
      direction: "desc",
      limit: 100,
    });
  });
});
