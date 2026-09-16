import { ArrowRight, BookOpenCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PatientLookup from "../components/PatientLookup";
import { PageHeader } from "../components/ui";
import { selectedPatientId } from "../services/patientService";

export default function Carteiras() {
  const navigate = useNavigate();
  const recentPatientId = selectedPatientId();
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Carteira digital"
        title="Carteiras de vacinação"
        description="Acesse uma carteira por meio de um atendimento validado pelo CPF."
        actions={
          recentPatientId ? (
            <button
              className="button button--secondary"
              onClick={() => navigate(`/pacientes/${recentPatientId}`)}
              type="button"
            >
              <BookOpenCheck size={18} /> Retomar carteira <ArrowRight size={17} />
            </button>
          ) : null
        }
      />
      <PatientLookup
        compact
        onFound={(patient) =>
          navigate(`/pacientes/${patient.personId}`, { state: { patient } })
        }
      />
      <div className="content-card info-banner">
        <BookOpenCheck />
        <div>
          <strong>Uma fonte de verdade</strong>
          <p>
            O histórico exibido aqui vem de <code>vaccination_records</code>, a
            mesma coleção acompanhada em tempo real pelo aplicativo Vitta.
          </p>
        </div>
      </div>
    </div>
  );
}
