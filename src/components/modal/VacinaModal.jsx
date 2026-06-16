import { useEffect, useState } from "react";

export default function VacinaModal({
  aberto,
  fechar,
  onSalvar,
  vacinaInicial
}) {

  const [nome, setNome] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [lote, setLote] = useState("");
  const [validade, setValidade] = useState("");
  const [qtde, setQtde] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {

    if (!aberto) {
      setNome("");
      setFabricante("");
      setLote("");
      setValidade("");
      setQtde("");
      setStatus("");
      return;
    }

    if (vacinaInicial) {
      setNome(vacinaInicial.nome || "");
      setFabricante(vacinaInicial.fabricante || "");
      setLote(vacinaInicial.lote || "");
      setValidade(vacinaInicial.validade || "");
      setQtde(vacinaInicial.qtde || "");
      setStatus(vacinaInicial.status || "");
    }

  }, [vacinaInicial, aberto]);

  if (!aberto) return null;

  function handleSalvar() {

    if (
      !nome.trim() ||
      !fabricante.trim() ||
      !lote.trim() ||
      !validade.trim() ||
      !qtde
    ) {
      alert("Preencha todos os campos.");
      return;
    }

    onSalvar({
      nome,
      fabricante,
      lote,
      validade,
      qtde,
      status
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white rounded-xl p-6 w-[500px]">

        <h2 className="text-2xl font-bold mb-4">
          {vacinaInicial
            ? "Editar Vacina"
            : "Nova Vacina"}
        </h2>

        <div className="space-y-3">

          <input
            placeholder="Nome da vacina"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            placeholder="Fabricante"
            value={fabricante}
            onChange={(e) =>
              setFabricante(e.target.value)
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            placeholder="Lote"
            value={lote}
            onChange={(e) =>
              setLote(e.target.value)
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="date"
            value={validade}
            onChange={(e) =>
              setValidade(e.target.value)
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="number"
            placeholder="Quantidade"
            value={qtde}
            onChange={(e) =>
              setQtde(e.target.value)
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">
              Selecione o status
            </option>

            <option value="Disponível">
              Disponível
            </option>

            <option value="Baixo Estoque">
              Baixo Estoque
            </option>

            <option value="Esgotada">
              Esgotada
            </option>

          </select>

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