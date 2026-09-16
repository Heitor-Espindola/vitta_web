import { Building2, Pencil, Plus, Search, Trash2, UserCog, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal, PageHeader, StatePanel, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { addProfessional, editProfessional, removeProfessional, watchProfessionals } from "../services/employeeService";
import { addUBS, editUBS, removeUBS, watchUBS } from "../services/ubsService";
import { formatCpf, isValidCpf } from "../utils/cpf";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

const emptyProfessional = {
    name: "",
    birthDate: "",
    email: "",
    cpf: "",
    sex: "",
    status: "ACTIVE",
    professionalType: "OTHER",
    professionalRegistration: "",
    ubsId: "",
};

const emptyUBS = {
    name: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    cep: "",
};

const typeLabels = {
    NURSE: "Enfermeiro(a)",
    DOCTOR: "Médico(a)",
    NURSING_TECHNICIAN: "Técnico(a) de enfermagem",
    PHARMACIST: "Farmacêutico(a)",
    OTHER: "Outro",
};

export default function Funcionarios() {
    const { isAdmin, firebaseUser } = useAuth();
    const { showToast } = useToast();
    const [professionals, setProfessionals] = useState([]);
    const [ubs, setUbs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("professionals");
    const [professionalModal, setProfessionalModal] = useState(false);
    const [ubsModal, setUbsModal] = useState(false);
    const [editingProfessional, setEditingProfessional] = useState(null);
    const [editingUBS, setEditingUBS] = useState(null);
    const [professionalForm, setProfessionalForm] = useState(emptyProfessional);
    const [ubsForm, setUbsForm] = useState(emptyUBS);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");

    useEffect(() => {
        let professionalsReady = false;
        let ubsReady = false;
        const checkLoading = () => setLoading(!(professionalsReady && ubsReady));

        const stopProfessionals = watchProfessionals(
            (data) => {
                setProfessionals(data);
                professionalsReady = true;
                checkLoading();
            },
            (watchError) => {
                setError(friendlyFirebaseError(watchError, watchError.message));
                professionalsReady = true;
                checkLoading();
            },
        );
        const stopUbs = watchUBS(
            (data) => {
                setUbs(data);
                ubsReady = true;
                checkLoading();
            },
            (watchError) => {
                setError(friendlyFirebaseError(watchError, watchError.message));
                ubsReady = true;
                checkLoading();
            },
        );
        return () => {
            stopProfessionals?.();
            stopUbs?.();
        };
    }, []);

    const ownProfessional = useMemo(
        () => professionals.find((item) => item.email.toLowerCase() === String(firebaseUser?.email || "").toLowerCase()),
        [professionals, firebaseUser?.email],
    );

    const visibleProfessionals = useMemo(() => {
        const source = isAdmin ? professionals : ownProfessional ? [ownProfessional] : [];
        const term = search.trim().toLocaleLowerCase("pt-BR");
        if (!term) return source;
        return source.filter((item) =>
            [item.name, item.email, item.cpf, item.ubsName, typeLabels[item.professionalType]]
                .filter(Boolean)
                .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term)),
        );
    }, [isAdmin, ownProfessional, professionals, search]);

    function openProfessional(professional = null, self = false) {
        setEditingProfessional(professional);
        setFormError("");
        setProfessionalForm(
            professional
                ? {
                    name: professional.name,
                    birthDate: professional.birthDate ? new Date(professional.birthDate).toISOString().slice(0, 10) : "",
                    email: professional.email,
                    cpf: formatCpf(professional.cpf),
                    sex: professional.sex || "",
                    status: professional.status || "ACTIVE",
                    professionalType: professional.professionalType || "OTHER",
                    professionalRegistration: professional.professionalRegistration || "",
                    ubsId: professional.ubsId || "",
                }
                : {
                    ...emptyProfessional,
                    email: self ? firebaseUser?.email || "" : "",
                },
        );
        setProfessionalModal(true);
    }

    function closeProfessional() {
        if (saving) return;
        setProfessionalModal(false);
        setEditingProfessional(null);
        setProfessionalForm(emptyProfessional);
        setFormError("");
    }

    function openUBS(unit = null) {
        setEditingUBS(unit);
        setFormError("");
        setUbsForm(unit ? { ...emptyUBS, ...unit } : emptyUBS);
        setUbsModal(true);
    }

    function closeUBS() {
        if (saving) return;
        setUbsModal(false);
        setEditingUBS(null);
        setUbsForm(emptyUBS);
        setFormError("");
    }

    function updateProfessional(field, value) {
        setProfessionalForm((current) => ({ ...current, [field]: value }));
        setFormError("");
    }

    function updateUBS(field, value) {
        setUbsForm((current) => ({ ...current, [field]: value }));
        setFormError("");
    }

    async function submitProfessional(event) {
        event.preventDefault();
        if (saving) return;
        if (!professionalForm.name.trim() || !professionalForm.birthDate || !professionalForm.email.trim()) {
            setFormError("Nome, nascimento e e-mail são obrigatórios.");
            return;
        }
        if (!isValidCpf(professionalForm.cpf)) {
            setFormError("Informe um CPF válido.");
            return;
        }
        if (!isAdmin && editingProfessional?.email.toLowerCase() !== String(firebaseUser?.email || "").toLowerCase()) {
            setFormError("Sua conta só pode atualizar o próprio cadastro.");
            return;
        }

        setSaving(true);
        try {
            if (editingProfessional) {
                await editProfessional(editingProfessional, professionalForm);
            } else {
                await addProfessional(professionalForm);
            }
            showToast({
                tone: "success",
                title: editingProfessional ? "Funcionário atualizado" : "Funcionário cadastrado",
                message: "O cadastro SQL foi atualizado sem recarregar a página.",
            });
            closeProfessional();
        } catch (saveError) {
            const message = friendlyFirebaseError(saveError, saveError.message);
            setFormError(message);
            showToast({ tone: "error", title: "Não foi possível salvar", message });
        } finally {
            setSaving(false);
        }
    }

    async function deleteProfessional(professional) {
        if (!isAdmin || deletingId) return;
        if (!window.confirm(`Excluir o cadastro de ${professional.name}?`)) return;
        setDeletingId(professional.id);
        try {
            await removeProfessional(professional);
            showToast({ tone: "success", title: "Funcionário excluído", message: "O cadastro SQL foi removido." });
        } catch (deleteError) {
            showToast({ tone: "error", title: "Não foi possível excluir", message: friendlyFirebaseError(deleteError, deleteError.message) });
        } finally {
            setDeletingId("");
        }
    }

    async function submitUBS(event) {
        event.preventDefault();
        if (saving) return;
        if (!ubsForm.name.trim()) {
            setFormError("Informe o nome da UBS.");
            return;
        }
        setSaving(true);
        try {
            if (editingUBS) await editUBS(editingUBS.id, ubsForm);
            else await addUBS(ubsForm);
            showToast({ tone: "success", title: editingUBS ? "UBS atualizada" : "UBS cadastrada", message: "As unidades vinculadas já foram atualizadas." });
            closeUBS();
        } catch (saveError) {
            const message = friendlyFirebaseError(saveError, saveError.message);
            setFormError(message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteUnit(unit) {
        if (deletingId) return;
        if (!window.confirm(`Excluir a UBS ${unit.name}?`)) return;
        setDeletingId(unit.id);
        try {
            await removeUBS(unit.id);
            showToast({ tone: "success", title: "UBS excluída", message: "A lista foi atualizada em tempo real." });
        } catch (deleteError) {
            showToast({ tone: "error", title: "Não foi possível excluir a UBS", message: friendlyFirebaseError(deleteError, deleteError.message) });
        } finally {
            setDeletingId("");
        }
    }

    return (
        <div className="page-stack">
            <PageHeader
                eyebrow="Cadastros do painel"
                title="Equipe e unidades"
                description="Cadastre o perfil SQL dos profissionais e as UBS utilizadas pelos atendimentos. O acesso ao painel continua ligado ao Firebase Authentication."
                actions={
                    tab === "professionals" && isAdmin ? (
                        <button className="button button--primary" type="button" onClick={() => openProfessional()}>
                            <Plus size={18} /> Novo funcionário
                        </button>
                    ) : tab === "ubs" ? (
                        <button className="button button--primary" type="button" onClick={() => openUBS()}>
                            <Plus size={18} /> Nova UBS
                        </button>
                    ) : null}
            />

            {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

            {!ownProfessional ? (
                <section className="content-card onboarding-card">
                    <div className="feature-icon"><UserCog /></div>
                    <div>
                        <span className="eyebrow">Seu primeiro acesso ao SQL</span>
                        <h2>Seu usuário ainda não está cadastrado no Vitta SQL</h2>
                        <p>Isso explica a mensagem exibida ao registrar uma aplicação. Cadastre o seu perfil profissional abaixo e vincule uma UBS.</p>
                    </div>
                    <button className="button button--primary" type="button" onClick={() => openProfessional(null, true)}>
                        Cadastrar minha conta
                    </button>
                </section>
            ) : null}

            <div className="page-tabs">
                <button className={tab === "professionals" ? "page-tab page-tab--active" : "page-tab"} type="button" onClick={() => setTab("professionals")}>
                    <UserCog size={17} /> Funcionários
                </button>
                <button className={tab === "ubs" ? "page-tab page-tab--active" : "page-tab"} type="button" onClick={() => setTab("ubs")}>
                    <Building2 size={17} /> Unidades / UBS
                </button>
            </div>

            {tab === "professionals" ? (
                <section className="content-card">
                    <div className="toolbar">
                        <div className="input-with-icon toolbar__search">
                            <Search size={18} />
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, CPF, e-mail ou UBS" />
                        </div>
                        <span className="toolbar__count">{visibleProfessionals.length} funcionário(s)</span>
                    </div>

                    {!loading && !visibleProfessionals.length ? (
                        <StatePanel title="Nenhum funcionário encontrado" description={isAdmin ? "Cadastre o primeiro profissional no SQL Connect." : "Cadastre a sua própria conta para liberar os registros de aplicação."} />
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead><tr><th>Profissional</th><th>Tipo</th><th>Registro</th><th>UBS</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
                                <tbody>
                                    {visibleProfessionals.map((professional) => (
                                        <tr key={professional.id}>
                                            <td><strong>{professional.name}</strong><small>{professional.email}</small></td>
                                            <td>{typeLabels[professional.professionalType] || professional.professionalType}</td>
                                            <td>{professional.professionalRegistration || "—"}</td>
                                            <td>{professional.ubsName || "Não vinculada"}</td>
                                            <td><StatusBadge status={professional.status === "ACTIVE" ? "active" : "warning"}>{professional.status === "ACTIVE" ? "Ativo" : professional.status === "BLOCKED" ? "Bloqueado" : "Inativo"}</StatusBadge></td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="icon-button" type="button" title="Editar" onClick={() => openProfessional(professional)}><Pencil size={17} /></button>
                                                    {isAdmin ? <button className="icon-button" type="button" title="Excluir" disabled={deletingId === professional.id} onClick={() => deleteProfessional(professional)}>{deletingId === professional.id ? <span className="button-spinner" /> : <Trash2 size={17} />}</button> : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            ) : (
                <section className="content-card">
                    {!loading && !ubs.length ? (
                        <StatePanel title="Nenhuma UBS cadastrada" description="Cadastre uma unidade para vincular os profissionais e agendamentos." action={<button className="button button--primary" type="button" onClick={() => openUBS()}><Plus size={17} /> Cadastrar UBS</button>} />
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead><tr><th>Unidade</th><th>Endereço</th><th>Cidade</th><th>CEP</th><th><span className="sr-only">Ações</span></th></tr></thead>
                                <tbody>
                                    {ubs.map((unit) => (
                                        <tr key={unit.id}>
                                            <td><strong>{unit.name}</strong></td>
                                            <td>{[unit.logradouro, unit.numero, unit.bairro].filter(Boolean).join(", ") || "—"}</td>
                                            <td>{unit.cidade || "—"}</td>
                                            <td>{unit.cep || "—"}</td>
                                            <td><div className="table-actions"><button className="icon-button" type="button" onClick={() => openUBS(unit)} title="Editar"><Pencil size={17} /></button><button className="icon-button" type="button" disabled={deletingId === unit.id} onClick={() => deleteUnit(unit)} title="Excluir">{deletingId === unit.id ? <span className="button-spinner" /> : <Trash2 size={17} />}</button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            <p className="privacy-note">A conta de login do funcionário precisa existir no Firebase Authentication. Esta tela controla o cadastro profissional, o status de acesso no Vitta e a unidade vinculada.</p>

            <Modal open={professionalModal} onClose={closeProfessional} title={editingProfessional ? "Editar funcionário" : "Cadastrar funcionário"} description="O perfil profissional será gravado no SQL Connect." wide>
                <form className="modal__body professional-form" onSubmit={submitProfessional} noValidate>
                    {formError ? <div className="inline-alert inline-alert--error">{formError}</div> : null}
                    <div className="form-grid">
                        <label className="field field--span-2"><span>Nome completo *</span><input value={professionalForm.name} onChange={(event) => updateProfessional("name", event.target.value)} disabled={saving} /></label>
                        <label className="field"><span>Data de nascimento *</span><input type="date" value={professionalForm.birthDate} onChange={(event) => updateProfessional("birthDate", event.target.value)} disabled={saving} /></label>
                        <label className="field"><span>CPF *</span><input inputMode="numeric" value={professionalForm.cpf} onChange={(event) => updateProfessional("cpf", formatCpf(event.target.value))} maxLength={14} disabled={saving} /></label>
                        <label className="field field--span-2"><span>E-mail *</span><input type="email" value={professionalForm.email} onChange={(event) => updateProfessional("email", event.target.value)} disabled={saving || (!isAdmin && !editingProfessional)} /></label>
                        <label className="field"><span>Sexo</span><input value={professionalForm.sex} onChange={(event) => updateProfessional("sex", event.target.value)} disabled={saving} /></label>
                        <label className="field"><span>Status</span><select value={professionalForm.status} onChange={(event) => updateProfessional("status", event.target.value)} disabled={saving || (!isAdmin && editingProfessional?.email !== firebaseUser?.email)}><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option><option value="BLOCKED">Bloqueado</option></select></label>
                        <label className="field"><span>Tipo profissional</span><select value={professionalForm.professionalType} onChange={(event) => updateProfessional("professionalType", event.target.value)} disabled={saving}><option value="NURSE">Enfermeiro(a)</option><option value="DOCTOR">Médico(a)</option><option value="NURSING_TECHNICIAN">Técnico(a) de enfermagem</option><option value="PHARMACIST">Farmacêutico(a)</option><option value="OTHER">Outro</option></select></label>
                        <label className="field"><span>Registro profissional</span><input value={professionalForm.professionalRegistration} onChange={(event) => updateProfessional("professionalRegistration", event.target.value)} disabled={saving} placeholder="Ex.: COREN 123456" /></label>
                        <label className="field field--span-2"><span>UBS vinculada</span><select value={professionalForm.ubsId} onChange={(event) => updateProfessional("ubsId", event.target.value)} disabled={loading || saving}><option value="">Nenhuma</option>{ubs.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
                    </div>
                    <div className="inline-alert inline-alert--info"><strong>Atenção:</strong> o e-mail aqui deve ser o mesmo e-mail usado pela conta do Firebase Authentication.</div>
                    <div className="form-actions"><button className="button button--secondary" type="button" onClick={closeProfessional} disabled={saving}><X size={18} /> Cancelar</button><button className="button button--primary" type="submit" disabled={saving}>{saving ? <span className="button-spinner" /> : <UserCog size={18} />}{saving ? "Salvando..." : editingProfessional ? "Salvar alterações" : "Cadastrar profissional"}</button></div>
                </form>
            </Modal>

            <Modal open={ubsModal} onClose={closeUBS} title={editingUBS ? "Editar UBS" : "Nova UBS"} description="Unidades usadas pelo cadastro profissional e pela agenda.">
                <form className="modal__body professional-form" onSubmit={submitUBS} noValidate>
                    {formError ? <div className="inline-alert inline-alert--error">{formError}</div> : null}
                    <div className="form-grid">
                        <label className="field field--span-2"><span>Nome da UBS *</span><input value={ubsForm.name} onChange={(event) => updateUBS("name", event.target.value)} disabled={saving} /></label>
                        <label className="field field--span-2"><span>Logradouro</span><input value={ubsForm.logradouro} onChange={(event) => updateUBS("logradouro", event.target.value)} disabled={saving} /></label>
                        <label className="field"><span>Número</span><input value={ubsForm.numero} onChange={(event) => updateUBS("numero", event.target.value)} disabled={saving} /></label>
                        <label className="field"><span>Bairro</span><input value={ubsForm.bairro} onChange={(event) => updateUBS("bairro", event.target.value)} disabled={saving} /></label>
                        <label className="field"><span>Cidade</span><input value={ubsForm.cidade} onChange={(event) => updateUBS("cidade", event.target.value)} disabled={saving} /></label>
                        <label className="field"><span>CEP</span><input value={ubsForm.cep} onChange={(event) => updateUBS("cep", event.target.value)} disabled={saving} /></label>
                    </div>
                    <div className="form-actions"><button className="button button--secondary" type="button" onClick={closeUBS} disabled={saving}><X size={18} /> Cancelar</button><button className="button button--primary" type="submit" disabled={saving}>{saving ? <span className="button-spinner" /> : <Building2 size={18} />}{saving ? "Salvando..." : editingUBS ? "Salvar alterações" : "Cadastrar UBS"}</button></div>
                </form>
            </Modal>
        </div>
    );
}
