import { LockKeyhole, ShieldCheck } from "lucide-react";
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
        description="Localize uma carteira pelo CPF para iniciar o atendimento."
      />
      <PatientLookup
        onFound={(patient) =>
          navigate(`/pacientes/${patient.personId}`, { state: { patient } })
        }
      />
      <section className="security-explainer">
        <article>
          <span><LockKeyhole /></span>
          <div><strong>Atendimento temporário</strong><p>A carteira fica disponível somente durante o atendimento autorizado.</p></div>
        </article>
        <article>
          <span><ShieldCheck /></span>
          <div><strong>Privacidade preservada</strong><p>O Portal não exibe nem carrega uma lista geral de pacientes.</p></div>
        </article>
      </section>
    </div>
  );
}
