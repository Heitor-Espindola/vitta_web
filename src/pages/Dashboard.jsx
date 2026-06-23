import React, { useEffect, useState } from "react";

import {
  getPacientes,
  getVacinas,
  getAplicacoes
} from "../services/api";

export default function Dashboard() {
  const [pacientes, setPacientes] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [aplicacoes, setAplicacoes] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }

  const totalPacientes = pacientes.length;
  const totalVacinas = vacinas.length;
  const totalAplicacoes = aplicacoes.length;

  const vacinasEsgotadas = vacinas.filter(
    (v) => v.status === "Esgotada"
  ).length;

  const ultimasAplicacoes = [...aplicacoes]
    .slice(-5)
    .reverse();

  const getNomePaciente = (id) =>
    pacientes.find((p) => p.id === id)?.nome || "—";

  const getNomeVacina = (id) =>
    vacinas.find((v) => v.id === id)?.nome || "—";

  if (loading) {
    return (
      <div className="text-slate-500">
        Carregando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500">
          Visão geral do sistema de vacinação
        </p>
      </div>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card label="Pacientes" value={totalPacientes} />

        <Card label="Vacinas" value={totalVacinas} />

        <Card label="Aplicações" value={totalAplicacoes} />

        <Card label="Vacinas Esgotadas" value={vacinasEsgotadas} />

      </div>

      {/* ALERTAS / ESTOQUE */}
      <Section title="Alertas de Estoque">

        {vacinas.filter(v => v.status === "Esgotada" || v.status === "Baixo Estoque").length === 0 ? (
          <p className="text-slate-500">
            Nenhum alerta de estoque no momento.
          </p>
        ) : (
          <div className="space-y-2">
            {vacinas
              .filter(v => v.status === "Esgotada" || v.status === "Baixo Estoque")
              .map(v => (
                <div
                  key={v.id}
                  className="flex justify-between border-b py-1"
                >
                  <span>{v.nome}</span>
                  <span className="text-red-500 font-medium">
                    {v.status}
                  </span>
                </div>
              ))}
          </div>
        )}

      </Section>

      {/* ÚLTIMAS APLICAÇÕES */}
      <Section title="Últimas Aplicações">

        {ultimasAplicacoes.length === 0 ? (
          <p className="text-slate-500">
            Nenhuma aplicação registrada.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Paciente</th>
                <th className="p-2 text-left">Vacina</th>
                <th className="p-2 text-left">Dose</th>
                <th className="p-2 text-left">Data</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {ultimasAplicacoes.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">
                    {getNomePaciente(a.pacienteId)}
                  </td>

                  <td className="p-2">
                    {getNomeVacina(a.vacinaId)}
                  </td>

                  <td className="p-2">{a.dose}</td>
                  <td className="p-2">{a.data}</td>
                  <td className="p-2">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </Section>

    </div>
  );
}

/* COMPONENTES AUXILIARES */

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-bold mb-3 text-slate-800">
        {title}
      </h2>
      {children}
    </div>
  );
}