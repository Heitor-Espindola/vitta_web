import React, {
  useState,
  useEffect
} from "react";
import VacinaModal from "../components/modal/VacinaModal";

import {
  getVacinas,
  createVacina,
  updateVacina,
  deleteVacina
} from "../services/api";

export default function Vacinas() {

  const [modalAberto, setModalAberto] = useState(false);

  const [VacinaEditando, setVacinaEditando] =
    useState(null);

  const [search, setSearch] = useState("");

  const [Vacinas, setVacinas] = useState([]);

  useEffect(() => {
    carregarVacinas();
  }, []);

  async function carregarVacinas() {
    const dados = await getVacinas();
    setVacinas(dados);
  }

  function abrirModalNovo() {
    console.log("Novo Vacina");

    setVacinaEditando(null);
    setModalAberto(true);
  }

  function abrirModalEditar(Vacina) {
    setVacinaEditando(Vacina);
    setModalAberto(true);
  }

  async function salvarVacina(Vacina) {
    if (VacinaEditando) {
      await updateVacina(
        VacinaEditando.id,
        Vacina
      );
    } else {
      await createVacina(Vacina);
    }

    await carregarVacinas();

    setModalAberto(false);
    setVacinaEditando(null);
  }

  async function excluirVacina(id) {
    if (!confirm("Deseja excluir este Vacina?"))
      return;

    await deleteVacina(id);
    await carregarVacinas();
  }

  const vacinasFiltradas =
    Vacinas.filter((v) => {

      const termo =
        search.toLowerCase();

      return (
        v.nome
          .toLowerCase()
          .includes(termo)

        ||

        v.fabricante
          .toLowerCase()
          .includes(termo)

        ||

        v.lote
          .toLowerCase()
          .includes(termo)
      );
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Vacinas
        </h1>

        <p className="text-slate-500">
          Gerencie os Vacinas cadastrados
        </p>
      </div>

      <div className="flex justify-between items-center">
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Pesquisar Vacina..."
          className="
            border border-slate-300
            rounded-lg
            px-4 py-2
            w-80
          "
        />

        <button
          onClick={abrirModalNovo}
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-4 py-2
            rounded-lg
          "
        >
          + Novo Vacina
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th>Nome</th>

              <th>Fabricante</th>

              <th>Lote</th>

              <th>Validade</th>

              <th>Qtde.</th>

              <th>Status</th>

              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {VacinasFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="
                    text-center
                    p-6
                    text-slate-500
                  "
                >
                  Nenhuma Vacina encontrado.
                </td>
              </tr>
            ) : (
              VacinasFiltradas.map((v) => (
                <tr
                  key={v.id}
                  className="border-t"
                >
                  <td>{v.nome}</td>

                  <td>{v.fabricante}</td>

                  <td>{v.lote}</td>

                  <td>{v.validade}</td>

                  <td>{v.qtde}</td>

                  <td>{v.status}</td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        abrirModalEditar(v)
                      }
                      className="text-blue-600 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        excluirVacina(v.id)
                      }
                      className="text-red-600"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <VacinaModal
        aberto={modalAberto}
        fechar={() => {
          setModalAberto(false);
          setVacinaEditando(null);
        }}
        onSalvar={salvarVacina}
        vacinaInicial={VacinaEditando}
      />

    </div>
  );
}