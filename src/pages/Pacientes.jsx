import React, { useState, useEffect } from "react";
import PacienteModal from "../components/modal/PacienteModal";

import { validarCPF } from "../utils/validations";
import { validarNascimento } from "../utils/validations";
import { sanitizeName } from "../utils/validations";

import { getPacientes, createPaciente, updatePaciente, deletePaciente } from "../services/api";

export default function Pacientes() {

  const [modalAberto, setModalAberto] = useState(false);

  const [pacienteEditando, setPacienteEditando] =
    useState(null);

  const [search, setSearch] = useState("");

  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function carregarPacientes() {
    const dados = await getPacientes();
    setPacientes(dados);
  }

  function abrirModalNovo() {
    console.log("Novo paciente");

    setPacienteEditando(null);
    setModalAberto(true);
  }

  function abrirModalEditar(paciente) {
    setPacienteEditando(paciente);
    setModalAberto(true);
  }

  async function salvarPaciente(paciente) {
    if (!validarCPF(paciente.cpf)) {
      alert("CPF inválido.");
      return;
    }

    if (!validarNascimento(paciente.nascimento)) {
      alert("Data de nascimento inválida.");
      return;
    }

    if (sanitizeName(paciente.nome).length < 3) {
      alert("Nome muito curto.");
      return;
    }

    if (pacienteEditando) {
      const cpfExiste = pacientes.some(
      (p) =>
        p.cpf === paciente.cpf &&
        p.id !== (pacienteEditando?.id || paciente.id)
      );

      if (cpfExiste) {
        alert("Já existe um paciente com este CPF.");
        return;
      }
      await updatePaciente(
        pacienteEditando.id,
        paciente
      );
    } else {
      const cpfExiste = pacientes.some(
      (p) =>
        p.cpf === paciente.cpf &&
        p.id !== (pacienteEditando?.id || paciente.id)
      );

      if (cpfExiste) {
        alert("Já existe um paciente com este CPF.");
        return;
      }
      await createPaciente(paciente);
    }

    await carregarPacientes();

    setModalAberto(false);
    setPacienteEditando(null);
  }

  async function excluirPaciente(id) {
    if (!confirm("Deseja excluir este paciente?"))
      return;

    await deletePaciente(id);
    await carregarPacientes();
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

  function formatarCPF(valor) {
    valor = valor.replace(/\D/g, "");
    valor = valor.slice(0, 11);
        
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        
    return valor;
  }

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
          onChange={(e) => {
            const value = e.target.value;

            const soNumeros = value.replace(/\D/g, "");

            if (soNumeros.length > 0) {
              setSearch(formatarCPF(value));
            } else {
              setSearch(value);
            }
          }}
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
              pacientesFiltrados.map((p) => (
                <tr
                  key={p.id}
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
                        abrirModalEditar(p)
                      }
                      className="text-blue-600 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        excluirPaciente(p.id)
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