export const SEX_OPTIONS = [
  { value: "N", label: "Não Informado" },
  { value: "M", label: "Mulher" },
  { value: "H", label: "Homem" },
  { value: "O", label: "Outro" },
];

export function normalizeSex(value) {
  switch (String(value ?? "").trim().toLowerCase()) {
    case "m":
    case "feminino":
    case "mulher":
      return "M";

    case "h":
    case "masculino":
    case "homem":
      return "H";

    case "n":
    case "não informado":
    case "nao informado":
      return "N";

    case "o":
    case "outro":
    case "intersexo":
      return "O";

    default:
      return "N";
  }
}