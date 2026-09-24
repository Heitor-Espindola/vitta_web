import {
  Check,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PatientLookup from "../components/PatientLookup";
import { Modal, PageHeader, StatePanel, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  addPatient,
  editPatient,
  removePatient,
  watchPatients,
} from "../services/patientService";
import { formatCpf, isValidCpf } from "../utils/cpf";
import { formatDate } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

const emptyForm = {
  name: "",
  birthDate: "",
  email: "",
  cpf: "",
  sex: "",
  status: "ACTIVE",
  patientType: "ADULT",
  responsibleId: "",
};

function normalizeSearch(value) {
  return String(value || "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function cpfDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function Pacientes() {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingPatient, setEditingPatient] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [formError, setFormError] = useState("");

  const [motherSearch, setMotherSearch] = useState("");

  useEffect(() => {
    return watchPatients(
      (data) => {
        setPatients(data);
        setLoading(false);
        setError("");
      },
      (watchError) => {
        setError(
          friendlyFirebaseError(watchError, watchError.message),
        );
        setLoading(false);
      },
      { isAdmin },
    );
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    if (!term) {
      return patients;
    }

    return patients.filter((patient) =>
      [
        patient.name,
        patient.maskedCpf,
        patient.email,
        patient.patientType,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLocaleLowerCase("pt-BR")
            .includes(term),
        ),
    );
  }, [patients, search]);

  const selectedMother = useMemo(
    () =>
      patients.find(
        (patient) =>
          patient.id === form.responsibleId &&
          patient.id !== editingPatient?.id,
      ) || null,
    [patients, form.responsibleId, editingPatient?.id],
  );

  const motherSuggestions = useMemo(() => {
    const term = normalizeSearch(motherSearch);

    if (!term || selectedMother) {
      return [];
    }

    const termCpf = cpfDigits(term);

    return patients
      .filter((patient) => patient.id !== editingPatient?.id)
      .filter((patient) => {
        const name = normalizeSearch(patient.name);
        const email = normalizeSearch(patient.email);
        const maskedCpf = normalizeSearch(patient.maskedCpf);
        const cpf = cpfDigits(patient.cpf);

        return (
          name.includes(term) ||
          email.includes(term) ||
          maskedCpf.includes(term) ||
          (termCpf && cpf.includes(termCpf))
        );
      })
      .slice(0, 8);
  }, [patients, motherSearch, selectedMother, editingPatient?.id]);

  function openCreate() {
    setEditingPatient(null);
    setForm(emptyForm);
    setMotherSearch("");
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(patient) {
    setEditingPatient(patient);

    setForm({
      name: patient.name,
      birthDate: patient.birthDate
        ? new Date(patient.birthDate).toISOString().slice(0, 10)
        : "",
      email: patient.email,
      cpf: formatCpf(patient.cpf),
      sex: patient.sex || "",
      status: patient.status || "ACTIVE",
      patientType: patient.patientType || "ADULT",
      responsibleId: patient.responsibleId || "",
    });

    if (patient.responsibleId) {
      setMotherSearch(
        [
          patient.responsibleName,
          patient.responsibleCpf
            ? formatCpf(patient.responsibleCpf)
            : "",
        ]
          .filter(Boolean)
          .join(" — "),
      );
    } else {
      setMotherSearch("");
    }

    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingPatient(null);
    setForm(emptyForm);
    setMotherSearch("");
    setFormError("");
  }

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFormError("");
  }

  function selectMother(patient) {
    setForm((current) => ({
      ...current,
      responsibleId: patient.id,
    }));

    setMotherSearch(
      [
        patient.name,
        patient.cpf ? formatCpf(patient.cpf) : "",
      ]
        .filter(Boolean)
        .join(" — "),
    );

    setFormError("");
  }

  function clearMother() {
    setForm((current) => ({
      ...current,
      responsibleId: "",
    }));

    setMotherSearch("");
    setFormError("");
  }

  function handleMotherSearchChange(value) {
    setMotherSearch(value);

    if (form.responsibleId) {
      setForm((current) => ({
        ...current,
        responsibleId: "",
      }));
    }

    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    if (
      !form.name.trim() ||
      !form.birthDate ||
      !form.email.trim()
    ) {
      setFormError(
        "Nome, data de nascimento e e-mail são obrigatórios.",
      );
      return;
    }

    if (!isValidCpf(form.cpf)) {
      setFormError("Informe um CPF válido.");
      return;
    }

    if (
      editingPatient &&
      form.responsibleId === editingPatient.id
    ) {
      setFormError(
        "O paciente não pode ser definido como a própria mãe.",
      );
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingPatient) {
        await editPatient(editingPatient, form);

        showToast({
          tone: "success",
          title: "Paciente atualizado",
          message:
            "As alterações já estão sendo refletidas na lista.",
        });
      } else {
        await addPatient(form);

        showToast({
          tone: "success",
          title: "Paciente cadastrado",
          message: "O novo cadastro apareceu em tempo real.",
        });
      }

      closeModal();
    } catch (saveError) {
      const message = friendlyFirebaseError(
        saveError,
        saveError.message,
      );

      setFormError(message);

      showToast({
        tone: "error",
        title: "Não foi possível salvar",
        message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(patient) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Arquivar o cadastro de ${patient.name}? O histórico vacinal será preservado.`,
    );

    if (!confirmed) return;

    setDeletingId(patient.id);

    try {
      await removePatient(patient);

      showToast({
        tone: "success",
        title: "Paciente arquivado",
        message: "O cadastro saiu da lista ativa e o histórico foi preservado.",
      });
    } catch (deleteError) {
      const message = friendlyFirebaseError(
        deleteError,
        "Não foi possível arquivar o paciente.",
      );

      showToast({
        tone: "error",
        title: "Arquivamento bloqueado",
        message,
      });
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Cadastro profissional"
        title="Pacientes"
        description={isAdmin
          ? "Cadastre, consulte e arquive pacientes diretamente no banco SQL do Vitta."
          : "Consulte somente os pacientes com acesso profissional direto concedido."}
        actions={
          isAdmin ? <button
            className="button button--primary"
            type="button"
            onClick={openCreate}
          >
            <Plus size={18} />
            Novo paciente
          </button> : null
        }
      />

      <PatientLookup
        compact
        onFound={(patient) => {
          navigate(`/pacientes/${patient.personId}`, {
            state: { patient },
          });
        }}
      />

      <section className="content-card">
        <div className="toolbar">
          <div className="input-with-icon toolbar__search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, CPF, e-mail ou tipo"
            />
          </div>

          <span className="toolbar__count">
            {filtered.length} paciente(s)
          </span>
        </div>

        {error ? (
          <div className="inline-alert inline-alert--error">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="loading-panel">
            Carregando pacientes...
          </div>
        ) : filtered.length === 0 ? (
          <StatePanel
            title={
              patients.length
                ? "Nenhum resultado encontrado"
                : "Nenhum paciente cadastrado"
            }
            description={
              patients.length
                ? "Tente outro nome, CPF ou e-mail."
                : "Cadastre o primeiro paciente para começar."
            }
            action={
              isAdmin && !patients.length ? (
                <button
                  className="button button--primary"
                  type="button"
                  onClick={openCreate}
                >
                  <Plus size={17} />
                  Cadastrar paciente
                </button>
              ) : null
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>CPF</th>
                  <th>Nascimento</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">
                      Ações
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <strong>{patient.name}</strong>
                      <small>{patient.email}</small>
                    </td>

                    <td>{patient.maskedCpf}</td>

                    <td>
                      {formatDate(patient.birthDate)}
                    </td>

                    <td>
                      {patient.patientType === "CHILD"
                        ? "Infantil"
                        : "Adulto"}
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          patient.status === "ACTIVE"
                            ? "active"
                            : "warning"
                        }
                      >
                        {patient.status === "ACTIVE"
                          ? "Ativo"
                          : patient.status === "BLOCKED"
                            ? "Bloqueado"
                            : "Inativo"}
                      </StatusBadge>
                    </td>

                    <td>
                      <div className="table-actions">
                        <Link
                          className="icon-button"
                          to={`/pacientes/${patient.id}`}
                          aria-label={`Abrir ${patient.name}`}
                          title="Abrir cadastro"
                        >
                          <Eye size={17} />
                        </Link>

                        {isAdmin ? <button
                          className="icon-button"
                          type="button"
                          onClick={() =>
                            openEdit(patient)
                          }
                          aria-label={`Editar ${patient.name}`}
                          title="Editar"
                        >
                          <Pencil size={17} />
                        </button> : null}

                        {isAdmin ? <button
                          className="icon-button"
                          type="button"
                          onClick={() =>
                            handleDelete(patient)
                          }
                          disabled={
                            deletingId === patient.id
                          }
                          aria-label={`Arquivar ${patient.name}`}
                          title="Arquivar"
                        >
                          {deletingId === patient.id ? (
                            <span className="button-spinner" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingPatient
            ? "Editar paciente"
            : "Novo paciente"
        }
        description="Os dados serão gravados nas tabelas User e Patient do SQL Connect."
        wide
      >
        <form
          className="modal__body professional-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {formError ? (
            <div className="inline-alert inline-alert--error">
              {formError}
            </div>
          ) : null}

          <div className="form-grid">
            <label className="field field--span-2">
              <span>Nome completo *</span>

              <input
                value={form.name}
                onChange={(event) =>
                  update("name", event.target.value)
                }
                maxLength={140}
                autoComplete="name"
                disabled={saving}
              />
            </label>

            <label className="field">
              <span>Data de nascimento *</span>

              <input
                type="date"
                value={form.birthDate}
                onChange={(event) =>
                  update(
                    "birthDate",
                    event.target.value,
                  )
                }
                disabled={saving}
              />
            </label>

            <label className="field">
              <span>CPF *</span>

              <input
                inputMode="numeric"
                value={form.cpf}
                onChange={(event) =>
                  update(
                    "cpf",
                    formatCpf(event.target.value),
                  )
                }
                maxLength={14}
                disabled={saving}
              />
            </label>

            <label className="field field--span-2">
              <span>E-mail *</span>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  update(
                    "email",
                    event.target.value,
                  )
                }
                maxLength={160}
                autoComplete="email"
                disabled={saving}
              />
            </label>

            <label className="field">
              <span>Sexo</span>

              <input
                value={form.sex}
                onChange={(event) =>
                  update("sex", event.target.value)
                }
                maxLength={40}
                placeholder="Ex.: Feminino"
                disabled={saving}
              />
            </label>

            <label className="field">
              <span>Status</span>

              <select
                value={form.status}
                onChange={(event) =>
                  update(
                    "status",
                    event.target.value,
                  )
                }
                disabled={saving}
              >
                <option value="ACTIVE">
                  Ativo
                </option>
                <option value="INACTIVE">
                  Inativo
                </option>
                <option value="BLOCKED">
                  Bloqueado
                </option>
              </select>
            </label>

            <label className="field">
              <span>Tipo de paciente</span>

              <select
                value={form.patientType}
                onChange={(event) =>
                  update(
                    "patientType",
                    event.target.value,
                  )
                }
                disabled={saving}
              >
                <option value="ADULT">
                  Adulto
                </option>
                <option value="CHILD">
                  Infantil
                </option>
              </select>
            </label>

            <label className="field field--span-2">
              <span>Nome da mãe</span>

              {selectedMother ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    className="input-with-icon"
                    style={{ flex: 1 }}
                  >
                    <Check
                      size={18}
                      aria-hidden="true"
                    />

                    <input
                      value={[
                        selectedMother.name,
                        selectedMother.cpf
                          ? formatCpf(
                            selectedMother.cpf,
                          )
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" — ")}
                      readOnly
                      disabled={saving}
                    />
                  </div>

                  <button
                    className="icon-button"
                    type="button"
                    onClick={clearMother}
                    title="Remover mãe"
                    aria-label="Remover mãe"
                    disabled={saving}
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <div className="input-with-icon">
                    <Search
                      size={18}
                      aria-hidden="true"
                    />

                    <input
                      value={motherSearch}
                      onChange={(event) =>
                        handleMotherSearchChange(
                          event.target.value,
                        )
                      }
                      maxLength={160}
                      placeholder="Buscar por nome, CPF ou e-mail"
                      autoComplete="off"
                      disabled={saving}
                    />
                  </div>

                  {motherSuggestions.length ? (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 50,
                        top: "calc(100% + 0.4rem)",
                        left: 0,
                        right: 0,
                        maxHeight: "240px",
                        overflowY: "auto",
                        padding: "0.35rem",
                        border:
                          "1px solid var(--slate-200, #dbe3ef)",
                        borderRadius: "0.75rem",
                        background:
                          "var(--surface, #fff)",
                        boxShadow:
                          "0 12px 30px rgb(15 23 42 / 12%)",
                      }}
                    >
                      {motherSuggestions.map(
                        (patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() =>
                              selectMother(patient)
                            }
                            style={{
                              display: "flex",
                              width: "100%",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "0.15rem",
                              padding: "0.7rem 0.8rem",
                              border: 0,
                              borderRadius: "0.55rem",
                              background:
                                "transparent",
                              color:
                                "var(--navy-900, #0f172a)",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            <strong>
                              {patient.name}
                            </strong>

                            <small>
                              {[
                                patient.maskedCpf,
                                patient.email,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </small>
                          </button>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              <small>
                Opcional. A busca procura somente entre
                pacientes já cadastrados.
              </small>
            </label>
          </div>

          <div className="form-actions">
            <button
              className="button button--secondary"
              type="button"
              onClick={closeModal}
              disabled={saving}
            >
              <X size={18} />
              Cancelar
            </button>

            <button
              className="button button--primary"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <span className="button-spinner" />
              ) : (
                <UsersRound size={18} />
              )}

              {saving
                ? "Salvando..."
                : editingPatient
                  ? "Salvar alterações"
                  : "Cadastrar paciente"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
