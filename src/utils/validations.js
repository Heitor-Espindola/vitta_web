// CPF

export function limparCPF(cpf) {
  return cpf.replace(/\D/g, "");
}

export function validarCPF(cpf) {
  cpf = limparCPF(cpf);

  if (cpf.length !== 11) return false;

  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  if (resto !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  return resto === Number(cpf[10]);
}


// Datas
function converterData(data) {
    if (!data) return null;

    const [ano, mes, dia] = data.split("-").map(Number);

    const date = new Date(ano, mes - 1, dia);

    if (
        date.getFullYear() !== ano ||
        date.getMonth() !== mes - 1 ||
        date.getDate() !== dia
    ) {
        return null;
    }

    return date;
}

    // Nascimento
    export function validarNascimento(data) {
        const nascimento = converterData(data);

        if (!nascimento) return false;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const minimo = new Date(1908, 5, 8); 

        return nascimento >= minimo && nascimento <= hoje;
    }

    // Validade
    export function validarValidade(data) {
        const validade = converterData(data);

        if (!validade) return false;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        return validade >= hoje;
    }
