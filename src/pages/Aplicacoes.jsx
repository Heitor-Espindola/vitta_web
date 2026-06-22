import React, { useState, useEffect } from "react";
import AplicacaoModal from "../components/modal/AplicacaoModal";


import {
  getAplicacoes,
  createAplicacao,
  updateAplicacao,
  deleteAplicacao,
  getPacientes,
  getVacinas
} from "../services/api";

export default function Aplicacoes() {

  const [modalAberto, setModalAberto] = useState(false);

  const [aplicacaoEditando, setAplicacaoEditando] = useState(null);

  const [search, setSearch] = useState("");

  const [aplicacoes, setAplicacoes] = useState([]);

  const [pacientes, setPacientes] = useState([]);

  const [vacinas, setVacinas] = useState([]);

  useEffect(() => {
    carregarAplicacoes();
    carregarDadosAuxiliares();
  }, []);
  
  async function carregarDadosAuxiliares() {
    const [p, v] = await Promise.all([
      getPacientes(),
      getVacinas()
    ]);
  
    setPacientes(p);
    setVacinas(v);
  }

  async function carregarAplicacoes() {
      const dados = await getAplicacoes();
      setAplicacoes(dados);
  }

  function abrirModalNovo() {
      setAplicacaoEditando(null);
      setModalAberto(true);
  }

  function abrirModalEditar(aplicacao) {
      setAplicacaoEditando(aplicacao);
      setModalAberto(true);
  }


  async function salvarAplicacao(aplicacao) {
    if (aplicacaoEditando) {
      await updateAplicacao(aplicacaoEditando.id, aplicacao);
    } else {
      await createAplicacao(aplicacao);
    }
  
    await carregarAplicacoes();
    setModalAberto(false);
    setAplicacaoEditando(null);
  }

  async function excluirAplicacao(id) {
      if (!confirm("Deseja excluir esta aplicação?"))
          return;

      await deleteAplicacao(id);

      await carregarAplicacoes();
  }

  const aplicacoesFiltradas =
    aplicacoes.filter((a) => {
        const termo = search.toLowerCase();

        const nomePaciente =
          pacientes.find(p => p.id === a.pacienteId)?.nome || "";

        const nomeVacina =
          vacinas.find(v => v.id === a.vacinaId)?.nome || "";

        return (
          nomePaciente.toLowerCase().includes(termo) ||
          nomeVacina.toLowerCase().includes(termo)
        );
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Aplicações
        </h1>

        <p className="text-slate-500">
          Gerencie as vacinas aplicadas
        </p>
      </div>

      <div className="flex justify-between items-center">
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Pesquisar paciente ou vacina..."
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
          + Nova Aplicação
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">
                Paciente
              </th>

              <th className="p-4 text-left">
                Vacina
              </th>

              <th className="p-4 text-left">
                Dose
              </th>

              <th className="p-4 text-left">
                Data
              </th>

              <th className="p-4 text-left">
                Profissional
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {aplicacoesFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="
                    text-center
                    p-6
                    text-slate-500
                  "
                >
                  Nenhuma aplicação encontrada.
                </td>
              </tr>
            ) : (
              aplicacoesFiltradas.map((a) => {
                const nomePaciente =
                  pacientes.find(p => p.id === a.pacienteId)?.nome || "";
                const nomeVacina =
                  vacinas.find(v => v.id === a.vacinaId)?.nome || "";

                return (
                  <tr key={a.id} className="border-t">
                    <td className="p-4">
                      {nomePaciente}
                    </td>
                
                    <td className="p-4">
                      {nomeVacina}
                    </td>
                
                    <td className="p-4">
                      {a.dose}
                    </td>
                
                    <td className="p-4">
                      {a.data}
                    </td>
                
                    <td className="p-4">
                      {a.profissional}
                    </td>
                
                    <td className="p-4">
                      {a.status}
                    </td>
                
                    <td className="p-4">
                      <button
                        onClick={() => abrirModalEditar(a)}
                        className="text-blue-600 mr-3"
                      >
                        Editar
                      </button>
                
                      <button
                        onClick={() => excluirAplicacao(a.id)}
                        className="text-red-600"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AplicacaoModal
        aberto={modalAberto}
        fechar={() => {
          setModalAberto(false);
          setAplicacaoEditando(null);
        }}
        onSalvar={salvarAplicacao}
        aplicacaoInicial={aplicacaoEditando}
        pacientes={pacientes}
        vacinas={vacinas}
      />
    </div>
  );
}