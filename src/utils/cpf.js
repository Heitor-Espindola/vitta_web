export function cpfDigits(value = "") {
  return String(value).replace(/\D/g, "").slice(0, 11);
}

export function formatCpf(value = "") {
  const digits = cpfDigits(value);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

export function isValidCpf(value = "") {
  const digits = cpfDigits(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const checkDigit = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return (
    checkDigit(9) === Number(digits[9]) &&
    checkDigit(10) === Number(digits[10])
  );
}

export function maskCpf(value = "") {
  const digits = cpfDigits(value);
  if (digits.length !== 11) return "";
  return `***.***.***-${digits.slice(-2)}`;
}

export async function cpfRegistryHash(value) {
  const digits = cpfDigits(value);
  const bytes = new TextEncoder().encode(digits);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
