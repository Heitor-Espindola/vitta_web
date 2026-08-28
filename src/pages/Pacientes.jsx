import { LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PatientLookup from "../components/PatientLookup";
import { PageHeader } from "../components/ui";

export default function Pacientes() {
  const navigate = useNavigate();
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Atendimento"
        title="Pacientes"
        description="Localize um cadastro pelo CPF para consultar a carteira ou registrar uma aplicação."
      />
      <PatientLookup
        onFound={(patient) =>
          navigate(`/pacientes/${patient.personId}`, { state: { patient } })
        }
      />
      <section className="security-explainer">
        <article>
          <span><Search /></span>
          <div><strong>Busca exata</strong><p>O painel não carrega nem filtra uma lista geral de pessoas.</p></div>
        </article>
        <article>
          <span><LockKeyhole /></span>
          <div><strong>Acesso temporário</strong><p>A carteira fica disponível somente durante o atendimento autorizado.</p></div>
        </article>
        <article>
          <span><ShieldCheck /></span>
          <div><strong>Identidade preservada</strong><p>O fluxo usa personId sem expor UIDs ou hashes na interface.</p></div>
        </article>
      </section>
    </div>
  );
}
