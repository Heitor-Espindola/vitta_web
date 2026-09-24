import { ArrowRight, Search, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { authorizePatientLookup, formatPatientCpf } from "../services/patientService";
import { formatDate, ageFromBirthDate } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";
import { isValidCpf } from "../utils/cpf";

export default function PatientLookup({ onFound, compact = false }) {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const [cpf, setCpf] = useState("");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPatient(null);

    if (!isValidCpf(cpf)) {
      setError("Informe um CPF válido com 11 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const result = await authorizePatientLookup({ cpf, isAdmin });
      setPatient(result);
      showToast({
        tone: "success",
        title: "Paciente localizado",
        message: "Cadastro carregado do banco SQL do Vitta.",
      });
    } catch (lookupError) {
      setError(friendlyFirebaseError(lookupError, lookupError.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`patient-lookup ${compact ? "patient-lookup--compact" : ""}`}>
      <div className="patient-lookup__intro">
        <span className="feature-icon">
          <Search aria-hidden="true" />
        </span>
        <div>
          <h2>Localizar paciente</h2>
          <p>Use o CPF exato para abrir o cadastro.</p>
        </div>
      </div>

      <form className="patient-lookup__form" onSubmit={handleSubmit} noValidate>
        <label className="field field--grow">
          <span>CPF do paciente</span>
          <div className={`input-with-icon ${error ? "input-with-icon--error" : ""}`}>
            <Search size={19} aria-hidden="true" />
            <input
              inputMode="numeric"
              autoComplete="off"
              value={cpf}
              onChange={(event) => {
                setCpf(formatPatientCpf(event.target.value));
                setError("");
              }}
              placeholder="000.000.000-00"
              maxLength={14}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error ? <small className="field__error">{error}</small> : null}
        </label>

        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? <span className="button-spinner" /> : <Search size={18} />}
          {loading ? "Localizando..." : "Localizar"}
        </button>
      </form>

      {patient ? (
        <article className="patient-result">
          <div className="patient-result__avatar">
            <UserRoundCheck aria-hidden="true" />
          </div>
          <div className="patient-result__identity">
            <span className="status-badge status-badge--active">Cadastro carregado</span>
            <h3>{patient.name}</h3>
            <p>
              {patient.maskedCpf} • {formatDate(patient.birthDate)}
              {ageFromBirthDate(patient.birthDate) !== null
                ? ` • ${ageFromBirthDate(patient.birthDate)} anos`
                : ""}
            </p>
          </div>
          <button
            className="button button--primary button--small"
            type="button"
            onClick={() => onFound(patient)}
          >
            Abrir cadastro <ArrowRight size={17} />
          </button>
        </article>
      ) : null}
    </section>
  );
}
