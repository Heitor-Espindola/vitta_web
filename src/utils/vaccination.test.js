import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { buildVaccinationRecord } from "../services/vaccinationService";
import {
  doseNumberFromLabel,
  vaccinationStatus,
} from "./vaccination";

describe("contrato Web para vaccination_records", () => {
  it("usa patientId, UID autenticado e omite campos vazios", () => {
    const payload = buildVaccinationRecord({
      patientId: "person-123",
      professionalUid: "auth-professional-456",
      vaccine: { id: "bcg", name: "BCG" },
      doseLabel: "1ª dose",
      appliedDate: "2026-08-28",
      nextDoseDate: "",
      lot: "  ",
      manufacturer: "Instituto de Teste",
      facilityName: "UBS Central",
      notes: "",
    });

    expect(payload.patientId).toBe("person-123");
    expect(payload.professionalUid).toBe("auth-professional-456");
    expect(payload.source).toBe("professional_panel");
    expect(payload.doseNumber).toBe(1);
    expect(payload.appliedAt).toBeInstanceOf(Timestamp);
    expect(payload).not.toHaveProperty("patientUid");
    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("lot");
    expect(payload).not.toHaveProperty("notes");
    expect(payload).not.toHaveProperty("nextDoseAt");
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
