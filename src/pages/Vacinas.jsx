import React, {
  useState,
  useEffect
} from "react";
import VacinaModal from "../components/modal/VacinaModal";

import { validarValidade } from "../utils/validations";

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
    if (!validarValidade(Vacina.validade)) {
      alert("A validade deve ser hoje ou uma data futura.");
      return;
    }

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
          Gerencie as vacinas cadastradas
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
          + Nova Vacina
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Fabricante</th>
              <th className="p-4 text-left">Lote</th>
              <th className="p-4 text-left">Validade</th>
              <th className="p-4 text-center">Qtde.</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {vacinasFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center p-6 text-slate-500"
                >
                  Nenhuma vacina encontrada.
                </td>
              </tr>
            ) : (
              vacinasFiltradas.map((v) => (
                <tr
                  key={v.id}
                  className="border-t"
                >
                  <td className="p-4">{v.nome}</td>

                  <td className="p-4">{v.fabricante}</td>
                  
                  <td className="p-4">{v.lote}</td>
                  
                  <td className="p-4">{v.validade}</td>
                  
                  <td className="p-4 text-center">{v.qtde}</td>
                  
                  <td className="p-4 text-center">
                      {v.status}
                  </td>
                  
                  <td className="p-4 text-center">
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