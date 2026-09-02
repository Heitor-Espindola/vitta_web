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
        description="Busque uma carteira pelo CPF ou retome o atendimento desta sessão."
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
          <strong>Acesso conforme o atendimento</strong>
          <p>
            As carteiras não são listadas globalmente. Cada acesso começa por
            uma busca exata e permanece disponível apenas durante a sessão.
          </p>
        </div>
      </div>
    </div>
  );
}
