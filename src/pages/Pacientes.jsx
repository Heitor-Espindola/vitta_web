import React, { useState } from "react";
import PacienteModal from "../components/modal/PacienteModal";

export default function Pacientes() {

  const [modalAberto, setModalAberto] = useState(false);

  const [pacienteEditando, setPacienteEditando] =
    useState(null);

  const [search, setSearch] = useState("");

  const [pacientes, setPacientes] = useState([
    {
      nome: "João Silva",
      cpf: "123.456.789-00",
      nascimento: "12/05/2010"
    }
  ]);

  function abrirModalNovo() {
    setPacienteEditando(null);
    setModalAberto(true);
  }

  function abrirModalEditar(paciente, index) {
    setPacienteEditando({
      ...paciente,
      index
    });

    setModalAberto(true);
  }

  function salvarPaciente(paciente) {

    if (pacienteEditando !== null) {

      const lista = [...pacientes];

      lista[pacienteEditando.index] = paciente;

      setPacientes(lista);

    } else {

      setPacientes([
        ...pacientes,
        paciente
      ]);

    }

    setModalAberto(false);
    setPacienteEditando(null);
  }

  function excluirPaciente(index) {

    if (!confirm("Deseja excluir este paciente?"))
      return;

    const lista =
      pacientes.filter((_, i) => i !== index);

    setPacientes(lista);
  }

  const pacientesFiltrados =
  pacientes.filter((p) => {
    const termo =
      search.toLowerCase();
    return (
      p.nome
        .toLowerCase()
        .includes(termo)

      ||
      p.cpf
        .toLowerCase()
        .includes(termo)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Pacientes
        </h1>

        <p className="text-slate-500">
          Gerencie os pacientes cadastrados
        </p>
      </div>

      <div className="flex justify-between items-center">
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Pesquisar paciente..."
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
          + Novo Paciente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">
                Nome
              </th>

              <th className="p-4 text-left">
                CPF
              </th>

              <th className="p-4 text-left">
                Nascimento
              </th>

              <th className="p-4 text-left">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {pacientesFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="
                    text-center
                    p-6
                    text-slate-500
                  "
                >
                  Nenhum paciente encontrado.
                </td>
              </tr>
            ) : (
              pacientesFiltrados.map((p, index) => (
                <tr
                  key={index}
                  className="border-t"
                >
                  <td className="p-4">
                    {p.nome}
                  </td>

                  <td className="p-4">
                    {p.cpf}
                  </td>

                  <td className="p-4">
                    {p.nascimento}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        abrirModalEditar(p, index)
                      }
                      className="text-blue-600 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        excluirPaciente(index)
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

      <PacienteModal
        aberto={modalAberto}
        fechar={() => {
          setModalAberto(false);
          setPacienteEditando(null);
        }}
        onSalvar={salvarPaciente}
        pacienteInicial={pacienteEditando}
      />

    </div>
  );
}