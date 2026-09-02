import { ArrowRight, LockKeyhole, Search, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  PatientLookupError,
  authorizePatientLookup,
} from "../services/patientService";
import { formatCpf, isValidCpf } from "../utils/cpf";
import { friendlyFirebaseError } from "../utils/firebaseErrors";
import { ageFromBirthDate, formatDate } from "../utils/dates";

export default function PatientLookup({ onFound, compact = false }) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();
  const [cpf, setCpf] = useState("");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [lookupState, setLookupState] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setFieldError("");
    setLookupState(null);
    setPatient(null);
    if (!isValidCpf(cpf)) {
      setFieldError("Informe um CPF válido.");
      return;
    }
    setLoading(true);
    try {
      const result = await authorizePatientLookup({
        cpf,
        professionalUid: firebaseUser.uid,
      });
      setPatient(result);
      showToast({
        tone: "success",
        title: "Carteira localizada",
        message: "Confira os dados do paciente antes de abrir a carteira.",
      });
    } catch (lookupError) {
      if (
        lookupError instanceof PatientLookupError &&
        lookupError.code === "patient-not-found"
      ) {
        setLookupState({
          title: "Paciente não encontrado",
          message: lookupError.message,
        });
      } else {
        setLookupState({
          title: "Não foi possível localizar o paciente",
          message: friendlyFirebaseError(
            lookupError,
            lookupError.message || "Tente novamente em alguns instantes.",
          ),
        });
      }
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
          <p>Informe o CPF do paciente para iniciar o atendimento.</p>
        </div>
      </div>

      <form className="patient-lookup__form" onSubmit={handleSubmit} noValidate>
        <label className="field field--grow">
          <span>CPF do paciente</span>
          <div
            className={`input-with-icon ${fieldError ? "input-with-icon--error" : ""}`}
          >
            <Search size={19} aria-hidden="true" />
            <input
              inputMode="numeric"
              autoComplete="off"
              value={cpf}
              onChange={(event) => {
                setCpf(formatCpf(event.target.value));
                setFieldError("");
                setLookupState(null);
                setPatient(null);
              }}
              placeholder="000.000.000-00"
              maxLength={14}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? "cpf-search-error" : undefined}
            />
          </div>
          {fieldError ? (
            <small className="field__error" id="cpf-search-error">
              {fieldError}
            </small>
          ) : (
            <small>
              <LockKeyhole size={13} /> Consulta exata e auditável
            </small>
          )}
        </label>
        <button
          className="button button--primary"
          type="submit"
          disabled={loading}
        >
          {loading ? <span className="button-spinner" /> : <Search size={18} />}
          {loading ? "Localizando..." : "Localizar"}
        </button>
      </form>

      {lookupState ? (
        <div className="patient-lookup__state" role="status" aria-live="polite">
          <strong>{lookupState.title}</strong>
          <p>{lookupState.message}</p>
        </div>
      ) : null}

      {patient ? (
        <article className="patient-result">
          <div className="patient-result__avatar">
            <UserRoundCheck aria-hidden="true" />
          </div>
          <div className="patient-result__identity">
            {patient.accountStatus === "active" ? (
              <span className="status-badge status-badge--active">
                Cadastro ativo
              </span>
            ) : null}
            <h3>{patient.name}</h3>
            <dl>
              <div>
                <dt>CPF</dt>
                <dd>{patient.maskedCpf}</dd>
              </div>
              {patient.birthDate ? (
                <div>
                  <dt>Nascimento</dt>
                  <dd>
                    {formatDate(patient.birthDate)}
                    {ageFromBirthDate(patient.birthDate) !== null
                      ? ` • ${ageFromBirthDate(patient.birthDate)} anos`
                      : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <button
            className="button button--primary button--small"
            type="button"
            onClick={() => onFound(patient)}
          >
            Abrir carteira <ArrowRight size={17} />
          </button>
        </article>
      ) : null}
    </section>
  );
}
