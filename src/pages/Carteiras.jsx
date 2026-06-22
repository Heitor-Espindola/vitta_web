import React, { useEffect, useState } from "react";

import {
  getPacientes,
  getVacinas,
  getAplicacoes
} from "../services/api";

export default function Carteiras() {

  const [pacientes, setPacientes] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [aplicacoes, setAplicacoes] = useState([]);

  const [search, setSearch] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [p, v, a] = await Promise.all([
      getPacientes(),
      getVacinas(),
      getAplicacoes()
    ]);

    setPacientes(p);
    setVacinas(v);
    setAplicacoes(a);
  }

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const carteiraPaciente = pacienteSelecionado
    ? aplicacoes.filter(
        (a) => a.pacienteId === pacienteSelecionado.id
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Carteiras de Vacinação
        </h1>

        <p className="text-slate-500">
          Histórico vacinal por paciente
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />

          <div className="space-y-2">
            {pacientesFiltrados.map((p) => (
              <div
                key={p.id}
                onClick={() => setPacienteSelecionado(p)}
                className={`
                  p-3 rounded-lg cursor-pointer border
                  hover:bg-slate-50
                  ${pacienteSelecionado?.id === p.id
                    ? "bg-blue-50 border-blue-400"
                    : ""
                  }
                `}
              >
                <p className="font-medium">{p.nome}</p>
                <p className="text-sm text-slate-500">{p.cpf}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">

          {!pacienteSelecionado ? (
            <p className="text-slate-500">
              Selecione um paciente para ver a carteira
            </p>
          ) : (
            <>
              <div className="mb-4 border-b pb-3">
                <h2 className="text-xl font-bold">
                  {pacienteSelecionado.nome}
                </h2>

                <p className="text-sm text-slate-500">
                  CPF: {pacienteSelecionado.cpf}
                </p>

                <p className="text-sm text-slate-500">
                  Nascimento: {pacienteSelecionado.nascimento}
                </p>
              </div>

              {carteiraPaciente.length === 0 ? (
                <p className="text-slate-500">
                  Este paciente ainda não possui vacinas registradas
                </p>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 text-left">Vacina</th>
                      <th className="p-2 text-left">Dose</th>
                      <th className="p-2 text-left">Data</th>
                      <th className="p-2 text-left">Profissional</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {carteiraPaciente.map((a) => {

                      const vacina =
                        vacinas.find((v) => v.id === a.vacinaId);

                      return (
                        <tr key={a.id} className="border-t">
                          <td className="p-2">
                            {vacina?.nome || "—"}
                          </td>

                          <td className="p-2">{a.dose}</td>
                          <td className="p-2">{a.data}</td>
                          <td className="p-2">{a.profissional}</td>
                          <td className="p-2">{a.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}