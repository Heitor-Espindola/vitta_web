import {
  BookOpen,
  Package,
  Pencil,
  Plus,
  Search,
  // ShieldCheck,
  Syringe,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PageHeader,
  SkeletonRows,
  StatePanel,
  StatusBadge,
} from "../components/ui";
import {
  addBatch,
  addVaccine,
  editBatch,
  editVaccine,
  removeBatch,
  removeVaccine,
  watchBatches,
  watchVaccines,
} from "../services/vaccineService";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

const emptyVaccineForm = {
  name: "",
  description: "",
  requiredDoses: "",
};

const emptyBatchForm = {
  vaccineId: "",
  manufacturer: "",
  batchCode: "",
  initialQuantity: "",
  currentQuantity: "",
  manufacturingDate: "",
  expirationDate: "",
};

function formatDate(date) {
  if (!date) return "Não informada";

  const [year, month, day] = String(date).split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function getErrorMessage(error) {
  if (!error) {
    return "Não foi possível concluir a operação.";
  }

  try {
    const friendly = friendlyFirebaseError(error);

    if (friendly && friendly !== error) {
      return friendly;
    }
  } catch {
    // Mantém a mensagem original caso o helper antigo não reconheça
    // erros vindos do SQL Connect.
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error.message ||
    error.details ||
    "Não foi possível concluir a operação."
  );
}

export default function Vacinas() {
  const [view, setView] = useState("vaccines");

  const [vaccines, setVaccines] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loadingVaccines, setLoadingVaccines] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [vaccineForm, setVaccineForm] = useState(emptyVaccineForm);
  const [batchForm, setBatchForm] = useState(emptyBatchForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const unsubscribe = watchVaccines(
      (data) => {
        setVaccines(data);
        setLoadingVaccines(false);
      },
      (snapshotError) => {
        setError(getErrorMessage(snapshotError));
        setLoadingVaccines(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = watchBatches(
      (data) => {
        setBatches(data);
        setLoadingBatches(false);
      },
      (snapshotError) => {
        setError(getErrorMessage(snapshotError));
        setLoadingBatches(false);
      },
    );

    return unsubscribe;
  }, []);

  const filteredVaccines = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    if (!term) {
      return vaccines;
    }

    return vaccines.filter((vaccine) =>
      [vaccine.name, vaccine.description, vaccine.requiredDoses]
        .filter((value) => value !== null && value !== undefined)
        .some((value) =>
          String(value).toLocaleLowerCase("pt-BR").includes(term),
        ),
    );
  }, [vaccines, search]);

  const filteredBatches = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    if (!term) {
      return batches;
    }

    return batches.filter((batch) =>
      [
        batch.vaccineName,
        batch.manufacturer,
        batch.batchCode,
        batch.initialQuantity,
        batch.currentQuantity,
      ]
        .filter((value) => value !== null && value !== undefined)
        .some((value) =>
          String(value).toLocaleLowerCase("pt-BR").includes(term),
        ),
    );
  }, [batches, search]);

  const openCreateVaccine = () => {
    setError("");
    setEditingItem(null);
    setVaccineForm(emptyVaccineForm);
    setModal("vaccine");
  };

  const openEditVaccine = (vaccine) => {
    setError("");
    setEditingItem(vaccine);
    setVaccineForm({
      name: vaccine.name || "",
      description: vaccine.description || "",
      requiredDoses:
        vaccine.requiredDoses !== null &&
        vaccine.requiredDoses !== undefined
          ? String(vaccine.requiredDoses)
          : "",
    });
    setModal("vaccine");
  };

  const openCreateBatch = () => {
    setError("");
    setEditingItem(null);
    setBatchForm({
      ...emptyBatchForm,
      vaccineId: vaccines[0]?.id || "",
    });
    setModal("batch");
  };

  const openEditBatch = (batch) => {
    setError("");
    setEditingItem(batch);
    setBatchForm({
      vaccineId: batch.vaccineId || "",
      manufacturer: batch.manufacturer || "",
      batchCode: batch.batchCode || "",
      initialQuantity:
        batch.initialQuantity !== null &&
        batch.initialQuantity !== undefined
          ? String(batch.initialQuantity)
          : "",
      currentQuantity:
        batch.currentQuantity !== null &&
        batch.currentQuantity !== undefined
          ? String(batch.currentQuantity)
          : "",
      manufacturingDate: batch.manufacturingDate || "",
      expirationDate: batch.expirationDate || "",
    });
    setModal("batch");
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setEditingItem(null);
    setVaccineForm(emptyVaccineForm);
    setBatchForm(emptyBatchForm);
  };

  const handleVaccineSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = vaccineForm.name.trim();
    const description = vaccineForm.description.trim();
    const requiredDoses = Number(vaccineForm.requiredDoses);

    if (!name) {
      setError("Informe o nome da vacina.");
      return;
    }

    if (!Number.isInteger(requiredDoses) || requiredDoses < 1) {
      setError("A quantidade de doses obrigatórias deve ser um número inteiro maior que zero.");
      return;
    }

    setSaving(true);

    try {
      if (editingItem) {
        await editVaccine(editingItem.id, {
          name,
          description,
          requiredDoses,
        });
      } else {
        await addVaccine({
          name,
          description,
          requiredDoses,
        });
      }

      closeModal();
    } catch (operationError) {
      setError(getErrorMessage(operationError));
    } finally {
      setSaving(false);
    }
  };

  const handleBatchSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const vaccineId = batchForm.vaccineId;
    const manufacturer = batchForm.manufacturer.trim();
    const batchCode = batchForm.batchCode.trim();
    const initialQuantity = Number(batchForm.initialQuantity);
    const currentQuantity = Number(batchForm.currentQuantity);

    if (!vaccineId) {
      setError("Selecione a vacina do lote.");
      return;
    }

    if (!manufacturer) {
      setError("Informe o fabricante.");
      return;
    }

    if (!batchCode) {
      setError("Informe o código do lote.");
      return;
    }

    if (
      !Number.isInteger(initialQuantity) ||
      initialQuantity < 0
    ) {
      setError("A quantidade inicial deve ser um número inteiro igual ou maior que zero.");
      return;
    }

    if (
      !Number.isInteger(currentQuantity) ||
      currentQuantity < 0
    ) {
      setError("A quantidade atual deve ser um número inteiro igual ou maior que zero.");
      return;
    }

    if (currentQuantity > initialQuantity) {
      setError("A quantidade atual não pode ser maior que a quantidade inicial.");
      return;
    }

    if (!batchForm.expirationDate) {
      setError("Informe a data de validade.");
      return;
    }

    if (
      batchForm.manufacturingDate &&
      batchForm.manufacturingDate > batchForm.expirationDate
    ) {
      setError("A data de fabricação não pode ser posterior à validade.");
      return;
    }

    setSaving(true);

    try {
      const data = {
        vaccineId,
        manufacturer,
        batchCode,
        initialQuantity,
        currentQuantity,
        manufacturingDate: batchForm.manufacturingDate,
        expirationDate: batchForm.expirationDate,
      };

      if (editingItem) {
        await editBatch(editingItem.id, data);
      } else {
        await addBatch(data);
      }

      closeModal();
    } catch (operationError) {
      setError(getErrorMessage(operationError));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVaccine = async (vaccine) => {
    const confirmed = window.confirm(
      `Arquivar a vacina "${vaccine.name}"? O histórico de aplicações será preservado.`,
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(vaccine.id);

    try {
      await removeVaccine(vaccine.id);
    } catch (operationError) {
      setError(getErrorMessage(operationError));
    } finally {
      setDeletingId("");
    }
  };

  const handleDeleteBatch = async (batch) => {
    const confirmed = window.confirm(
      `Excluir o lote "${batch.batchCode}" da vacina "${batch.vaccineName}"?`,
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(batch.id);

    try {
      await removeBatch(batch.id);
    } catch (operationError) {
      setError(getErrorMessage(operationError));
    } finally {
      setDeletingId("");
    }
  };

  const isLoading =
    view === "vaccines" ? loadingVaccines : loadingBatches;

  const currentItems =
    view === "vaccines" ? filteredVaccines : filteredBatches;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Gestão de imunização"
        title={view === "vaccines" ? "Vacinas" : "Lotes"}
        description={
          view === "vaccines"
            ? "Consulte e gerencie as vacinas cadastradas no banco de dados do Vitta."
            : "Controle os lotes, fabricantes, quantidades e validades das vacinas."
        }
      />

      <section className="content-card">
        <div className="toolbar toolbar--wrap">
          <div className="input-with-icon toolbar__search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                view === "vaccines"
                  ? "Buscar vacina"
                  : "Buscar lote, vacina ou fabricante"
              }
            />
          </div>

          <div className="segmented-control" aria-label="Alternar gerenciamento">
            <button
              className={view === "vaccines" ? "active" : ""}
              onClick={() => {
                setView("vaccines");
                setSearch("");
                setError("");
              }}
              type="button"
            >
              Vacinas
            </button>

            <button
              className={view === "batches" ? "active" : ""}
              onClick={() => {
                setView("batches");
                setSearch("");
                setError("");
              }}
              type="button"
            >
              Lotes
            </button>
          </div>
        </div>

        {error ? (
          <div className="inline-alert inline-alert--error">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <SkeletonRows rows={6} />
        ) : currentItems.length === 0 ? (
          <StatePanel
            title={
              view === "vaccines"
                ? "Nenhuma vacina encontrada"
                : "Nenhum lote encontrado"
            }
            description={
              search
                ? "Ajuste a busca ou limpe o campo para visualizar todos os registros."
                : view === "vaccines"
                  ? "Cadastre a primeira vacina usando o botão acima."
                  : "Cadastre um lote depois de possuir pelo menos uma vacina."
            }
          />
        ) : view === "vaccines" ? (
          <div className="vaccine-grid">
            {filteredVaccines.map((vaccine) => (
              <article className="vaccine-card" key={vaccine.id}>
                <header>
                  <span className="vaccine-card__icon">
                    <Syringe />
                  </span>

                  <StatusBadge status="active">
                    Cadastrada
                  </StatusBadge>
                </header>

                <h2>{vaccine.name}</h2>

                <p>
                  {vaccine.description ||
                    "Descrição educativa ainda não informada."}
                </p>

                <dl>
                  <div>
                    <dt>Doses</dt>
                    <dd>
                      {vaccine.requiredDoses}
                    </dd>
                  </div>

                  <div>
                    <dt>Lotes</dt>
                    <dd>
                      {
                        batches.filter(
                          (batch) => batch.vaccineId === vaccine.id,
                        ).length
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>Fonte</dt>
                    <dd>Banco Vitta</dd>
                  </div>
                </dl>

                <footer>
                  <BookOpen size={15} />

                  <span style={{ flex: 1 }}>
                    SQL Connect
                  </span>

                  <button
                    className="icon-button icon-button--small"
                    type="button"
                    title={`Editar ${vaccine.name}`}
                    aria-label={`Editar ${vaccine.name}`}
                    onClick={() => openEditVaccine(vaccine)}
                    disabled={deletingId === vaccine.id}
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    className="icon-button icon-button--small"
                    type="button"
                    title={`Arquivar ${vaccine.name}`}
                    aria-label={`Arquivar ${vaccine.name}`}
                    onClick={() => handleDeleteVaccine(vaccine)}
                    disabled={deletingId === vaccine.id}
                  >
                    <Trash2 size={15} />
                  </button>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vacina</th>
                  <th>Lote</th>
                  <th>Fabricante</th>
                  <th>Quantidade</th>
                  <th>Fabricação</th>
                  <th>Validade</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.id}>
                    <td>
                      <strong>{batch.vaccineName}</strong>
                      <small>
                        {batch.vaccineRequiredDoses
                          ? `${batch.vaccineRequiredDoses} dose(s) previstas`
                          : "Doses não informadas"}
                      </small>
                    </td>

                    <td>
                      <strong>{batch.batchCode}</strong>
                    </td>

                    <td>
                      {batch.manufacturer}
                    </td>

                    <td>
                      <strong>
                        {batch.currentQuantity}
                      </strong>
                      <small>
                        de {batch.initialQuantity} inicial
                      </small>
                    </td>

                    <td>
                      {formatDate(batch.manufacturingDate)}
                    </td>

                    <td>
                      {formatDate(batch.expirationDate)}
                    </td>

                    <td>
                      <div className="button-row">
                        <button
                          className="icon-button icon-button--small"
                          type="button"
                          title={`Editar lote ${batch.batchCode}`}
                          aria-label={`Editar lote ${batch.batchCode}`}
                          onClick={() => openEditBatch(batch)}
                          disabled={deletingId === batch.id}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="icon-button icon-button--small"
                          type="button"
                          title={`Excluir lote ${batch.batchCode}`}
                          aria-label={`Excluir lote ${batch.batchCode}`}
                          onClick={() => handleDeleteBatch(batch)}
                          disabled={deletingId === batch.id}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="content-card info-banner">
        {view === "vaccines" ? <Syringe /> : <Package />}

        <div>
          <strong>
            {view === "vaccines"
              ? "Cadastro de vacinas"
              : "Controle de lotes"}
          </strong>

          <p>
            {view === "vaccines"
              ? "Os dados são armazenados diretamente no SQL Connect do Vitta."
              : "Os lotes ficam vinculados às vacinas cadastradas e controlam estoque e validade."}
          </p>
        </div>
      </div>

      {modal === "vaccine" ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vaccine-modal-title"
          >
            <header className="modal__header">
              <div>
                <h2 id="vaccine-modal-title">
                  {editingItem
                    ? "Editar vacina"
                    : "Adicionar vacina"}
                </h2>

                <p>
                  {editingItem
                    ? "Atualize os dados cadastrados no SQL Connect."
                    : "Cadastre uma nova vacina no banco de dados do Vitta."}
                </p>
              </div>

              <button
                className="icon-button"
                type="button"
                aria-label="Fechar"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </header>

            <form
              className="modal__body professional-form"
              onSubmit={handleVaccineSubmit}
            >
              <div className="form-grid">
                <label className="field field--span-2">
                  <span>Nome da vacina</span>
                  <input
                    value={vaccineForm.name}
                    onChange={(event) =>
                      setVaccineForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Ex.: Hepatite B"
                    required
                  />
                </label>

                <label className="field field--span-2">
                  <span>Descrição</span>
                  <textarea
                    value={vaccineForm.description}
                    onChange={(event) =>
                      setVaccineForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Descreva brevemente a finalidade da vacina."
                  />
                </label>

                <label className="field">
                  <span>Doses obrigatórias</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={vaccineForm.requiredDoses}
                    onChange={(event) =>
                      setVaccineForm((current) => ({
                        ...current,
                        requiredDoses: event.target.value,
                      }))
                    }
                    placeholder="Ex.: 3"
                    required
                  />
                  <small>
                    Quantidade prevista pelo esquema cadastrado.
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
                  Cancelar
                </button>

                <button
                  className="button button--primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      {editingItem ? "Salvar alterações" : "Cadastrar vacina"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {modal === "batch" ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            className="modal modal--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="batch-modal-title"
          >
            <header className="modal__header">
              <div>
                <h2 id="batch-modal-title">
                  {editingItem
                    ? "Editar lote"
                    : "Adicionar lote"}
                </h2>

                <p>
                  Vincule o lote a uma vacina e informe os dados de estoque.
                </p>
              </div>

              <button
                className="icon-button"
                type="button"
                aria-label="Fechar"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </header>

            <form
              className="modal__body professional-form"
              onSubmit={handleBatchSubmit}
            >
              <div className="form-grid">
                <label className="field field--span-2">
                  <span>Vacina</span>

                  <select
                    value={batchForm.vaccineId}
                    onChange={(event) =>
                      setBatchForm((current) => ({
                        ...current,
                        vaccineId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">
                      Selecione uma vacina
                    </option>

                    {vaccines.map((vaccine) => (
                      <option key={vaccine.id} value={vaccine.id}>
                        {vaccine.name}
                      </option>
                    ))}
                  </select>

                  {vaccines.length === 0 ? (
                    <small className="field__error">
                      Cadastre uma vacina antes de criar um lote.
                    </small>
                  ) : null}
                </label>

                <label className="field">
                  <span>Fabricante</span>
                  <input
                    value={batchForm.manufacturer}
                    onChange={(event) =>
                      setBatchForm((current) => ({
                        ...current,
                        manufacturer: event.target.value,
                      }))
                    }
                    placeholder="Ex.: Butantan"
                    required
                  />
                </label>

                <label className="field">
                  <span>Código do lote</span>
                  <input
                    value={batchForm.batchCode}
                    onChange={(event) =>
                      setBatchForm((current) => ({
                        ...current,
                        batchCode: event.target.value,
                      }))
                    }
                    placeholder="Ex.: HB2026A001"
                    required
                  />
                </label>

                <label className="field">
                  <span>Quantidade inicial</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={batchForm.initialQuantity}
                    onChange={(event) =>
                      setBatchForm((current) => ({
                        ...current,
                        initialQuantity: event.target.value,
                      }))
                    }
                    placeholder="Ex.: 500"
                    required
                  />
                </label>

                <label className="field">
                  <span>Quantidade atual</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={batchForm.currentQuantity}
                    onChange={(event) =>
                      setBatchForm((current) => ({
                        ...current,
                        currentQuantity: event.target.value,
                      }))
                    }
                    placeholder="Ex.: 500"
                    required
                  />
                </label>

                <label className="field">
                  <span>Data de fabricação</span>
                  <input
                    type="date"
                    value={batchForm.manufacturingDate}
                    onChange={(event) =>
                      setBatchForm((current) => ({
                        ...current,
                        manufacturingDate: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span>Data de validade</span>
                  <input
                    type="date"
                    value={batchForm.expirationDate}
                    onChange={(event) =>
                      setBatchForm((current) => ({
                        ...current,
                        expirationDate: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  className="button button--primary"
                  type="submit"
                  disabled={saving || vaccines.length === 0}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      {editingItem ? "Salvar alterações" : "Cadastrar lote"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <div className="page-header__actions" style={{ display: "none" }}>
        <button type="button" />
      </div>

      <div
        style={{
          position: "fixed",
          right: "2.25rem",
          top: "90px",
          zIndex: 20,
        }}
      >
        <button
          className="button button--primary"
          type="button"
          onClick={
            view === "vaccines"
              ? openCreateVaccine
              : openCreateBatch
          }
        >
          <Plus size={17} />
          {view === "vaccines"
            ? "Adicionar vacina"
            : "Adicionar lote"}
        </button>
      </div>
    </div>
  );
}

function SaveIcon() {
  return <span aria-hidden="true">✓</span>;
}
