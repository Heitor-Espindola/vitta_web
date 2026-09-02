import { describe, expect, it } from "vitest";
import {
  cpfDigits,
  cpfRegistryHash,
  formatCpf,
  isValidCpf,
  maskCpf,
} from "./cpf";

describe("CPF profissional", () => {
  it("normaliza, formata e valida com o mesmo valor canônico do mobile", () => {
    expect(cpfDigits("529.982.247-25")).toBe("52998224725");
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(maskCpf("52998224725")).toBe("***.***.***-25");
    expect(maskCpf("")).toBe("");
  });

  it("gera SHA-256 determinístico para cpf_registry", async () => {
    const formatted = await cpfRegistryHash("529.982.247-25");
    const digits = await cpfRegistryHash("52998224725");
    expect(formatted).toBe(digits);
    expect(formatted).toMatch(/^[a-f0-9]{64}$/);
  });
});
