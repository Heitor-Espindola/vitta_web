import { useEffect, useState } from "react";

export default function PacienteModal({
  aberto,
  fechar,
  onSalvar,
  pacienteInicial
}) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");

  function formatarCPF(valor) {
    valor = valor.replace(/\D/g, "");
    valor = valor.slice(0, 11);
    valor = valor.replace(
      /(\d{3})(\d)/,
      "$1.$2"
    );
    valor = valor.replace(
      /(\d{3})(\d)/,
      "$1.$2"
    );
    valor = valor.replace(
      /(\d{3})(\d{1,2})$/,
      "$1-$2"
    );
    return valor;
  }

  useEffect(() => {
    if (pacienteInicial) {
      setNome(pacienteInicial.nome || "");
      setCpf(pacienteInicial.cpf || "");
      setNascimento(pacienteInicial.nascimento || "");
    } else {
      setNome("");
      setCpf("");
      setNascimento("");
    }
  }, [pacienteInicial]);

  if (!aberto) return null;

  function handleSalvar() {

  // Campos obrigatórios
  if (
    !nome.trim() ||
    !cpf.trim() ||
    !nascimento.trim()
  ) {
    alert("Preencha todos os campos.");
    return;
  }

  // CPF precisa ter 11 números
  const cpfNumeros =
    cpf.replace(/\D/g, "");

  if (!/^\d{11}$/.test(cpfNumeros)) {
    alert("CPF inválido.");
    return;
  }

  // Data futura
  const hoje = new Date();

  const dataNascimento =
    new Date(nascimento);
  
  const ano =
    dataNascimento.getFullYear();

  if (ano < 1900 || ano > hoje.getFullYear()) {
    alert("Ano inválido.");
    return;
  }

  if (dataNascimento > hoje) {
    alert("Data de nascimento inválida.");
    return;
  }

  // Idade máxima
  const idade =
    hoje.getFullYear() -
    dataNascimento.getFullYear();

  if (idade > 130) {
    alert("Data de nascimento inválida.");
    return;
  }

  onSalvar({
    nome,
    cpf,
    nascimento
  });
}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[500px]">
        <h2 className="text-2xl font-bold mb-4">
          {pacienteInicial ? "Editar Paciente" : "Novo Paciente"}
        </h2>
        <div className="space-y-3">

          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={100}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            placeholder="CPF"
            value={cpf}
            maxLength={14}
            onChange={(e) =>
              setCpf(formatarCPF(e.target.value))
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="date"
            value={nascimento}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setNascimento(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={fechar}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={handleSalvar}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}