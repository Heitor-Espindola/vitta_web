import { describe, expect, it } from "vitest";
import { mapApplication } from "../services/vaccinationService";
import {
  doseNumberFromLabel,
  vaccinationStatus,
} from "./vaccination";

describe("contrato Web para aplicações do SQL Connect", () => {
  it("normaliza uma aplicação retornada pelo Data Connect", () => {
    const payload = mapApplication({
      id: "application-789",
      patient: {
        id: "person-123",
        user: { name: "Paciente Teste", cpf: "12345678900" },
      },
      vaccine: { id: "bcg", name: "BCG", requiredDoses: 1 },
      batch: null,
      professional: {
        id: "professional-456",
        professionalType: "NURSE",
        user: { name: "Profissional Teste" },
      },
      ubs: { id: "ubs-1", name: "UBS Central" },
      applicationDate: "2026-08-28T15:00:00.000Z",
      doseNumber: 1,
      notes: "",
    });

    expect(payload.patientId).toBe("person-123");
    expect(payload.professionalId).toBe("professional-456");
    expect(payload.source).toBe("sql_connect");
    expect(payload.doseNumber).toBe(1);
    expect(payload.vaccineName).toBe("BCG");
    expect(payload.ubsName).toBe("UBS Central");
    expect(payload.batchId).toBe("");
  });

  it("deriva status sem persistir verdade duplicada", () => {
    const now = new Date(2026, 7, 28, 10);
    expect(vaccinationStatus({}, now)).toBe("applied");
    expect(
      vaccinationStatus({ nextDoseAt: new Date(2026, 7, 27) }, now),
    ).toBe("overdue");
    expect(
      vaccinationStatus({ nextDoseAt: new Date(2026, 7, 29) }, now),
    ).toBe("upcoming");
    expect(doseNumberFromLabel("2ª dose")).toBe(2);
    expect(doseNumberFromLabel("Reforço")).toBeNull();
  });
});
