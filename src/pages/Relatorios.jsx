import React, { useEffect, useState } from "react";
import {
  getPacientes,
  getVacinas,
  getAplicacoes
} from "../services/api";

export default function Relatorios() {
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

  function getUltimos14Dias() {
    const hoje = new Date();
    const dias = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(hoje.getDate() - i);

      const chave = d.toLocaleDateString("pt-BR");

      const total = aplicacoes.filter(
        (a) =>
          new Date(a.data).toLocaleDateString("pt-BR") === chave
      ).length;

      dias.push({ dia: chave, total });
    }

    return dias;
  }

  const aplicacoesPorDia = getUltimos14Dias();

  function getAplicacoesPorVacina() {
    const resultado = {};

    aplicacoes.forEach((a) => {
      const vacina = vacinas.find(
        (v) => v.id === a.vacinaId
      );

      const nome = vacina?.nome || "Desconhecida";

      resultado[nome] = (resultado[nome] || 0) + 1;
    });

    return Object.entries(resultado).map(
      ([vacina, total]) => ({
        vacina,
        total
      })
    );
  }

  const porVacina = getAplicacoesPorVacina();

  function getStatus() {
    const status = {
      Agendada: 0,
      Aplicada: 0,
      Cancelada: 0
    };

    aplicacoes.forEach((a) => {
      status[a.status] =
        (status[a.status] || 0) + 1;
    });

    return Object.entries(status).map(
      ([status, total]) => ({
        status,
        total
      })
    );
  }

  const porStatus = getStatus();

  if (loading) {
    return (
      <div className="text-slate-500">
        Carregando relatórios...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Relatórios
        </h1>
        <p className="text-slate-500">
          Análises e estatísticas do sistema de vacinação
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Pacientes" value={totalPacientes} />
        <Card label="Vacinas" value={totalVacinas} />
        <Card label="Aplicações" value={totalAplicacoes} />
        <Card label="Vacinas Esgotadas" value={vacinasEsgotadas} />
      </div>

      <Section title="Aplicações (últimos 14 dias)">
        <div className="space-y-2">
          {aplicacoesPorDia.map((d, i) => (
            <div
              key={i}
              className="flex justify-between border-b py-1"
            >
              <span>{d.dia}</span>
              <span>{d.total}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Aplicações por Vacina">
        <div className="space-y-2">
          {porVacina.map((v, i) => (
            <div
              key={i}
              className="flex justify-between border-b py-1"
            >
              <span>{v.vacina}</span>
              <span>{v.total}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Status das Aplicações">
        <div className="space-y-2">
          {porStatus.map((s, i) => (
            <div
              key={i}
              className="flex justify-between border-b py-1"
            >
              <span>{s.status}</span>
              <span>{s.total}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-slate-500 text-sm">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-800">
        {value}
      </p>
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