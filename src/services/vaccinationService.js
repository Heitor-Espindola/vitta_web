import { QueryFetchPolicy, executeQuery, subscribe, } from "firebase/data-connect";
import { asDate } from "../utils/dates";
import {
  createApplication,
  deleteApplication,
  deleteLegacyApplication,
  getApplicationRef,
  getProfessionalByUser,
  getUserByEmail,
  listApplicationsRef,
  listApplicationsByPatientRef,
  updateApplication,
} from "@dataconnect/generated";

function textOrNull(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

export function mapApplication(application) {
  const patient = application?.patient || {};
  const user = patient?.user || {};
  const vaccine = application?.vaccine || {};
  const batch = application?.batch || null;
  const professional = application?.professional || {};
  const professionalUser = professional?.user || {};
  const ubs = application?.ubs || {};

  return {
    id: application?.id || "",
    patientId: patient.id || "",
    patientName: user.name || "Paciente não informado",
    patientCpf: user.cpf || "",
    vaccineId: vaccine.id || "",
    vaccineName: vaccine.name || "Vacina não informada",
    vaccineRequiredDoses: vaccine.requiredDoses ?? null,
    batchId: batch?.id || "",
    batchCode: batch?.batchCode || "",
    manufacturer: batch?.manufacturer || "",
    expirationDate: batch?.expirationDate || null,
    appointmentId: application?.appointment?.id || "",
    professionalId: professional.id || "",
    professionalName: professionalUser.name || "Profissional não informado",
    professionalType: professional.professionalType || "OTHER",
    professionalRegistration: professional.professionalRegistration || "",
    ubsId: ubs.id || "",
    ubsName: ubs.name || "UBS não informada",
    applicationDate: application?.applicationDate || null,
    doseNumber: application?.doseNumber ?? null,
    doseLabel:
      application?.doseNumber != null
        ? `${application.doseNumber}ª dose`
        : "Dose não informada",
    notes: application?.notes || "",
    source: "sql_connect",
  };
}

function sortApplications(items) {
  return [...items].sort((a, b) => {
    const dateA = asDate(a.applicationDate)?.getTime() || 0;

    const dateB = asDate(b.applicationDate)?.getTime() || 0;

    return dateB - dateA;
  });
}

export function watchApplications(onData, onError) {
  return subscribe(
    listApplicationsRef(),
    (result) => {
      const applications = result?.data?.applications || [];

      onData(sortApplications(applications.map(mapApplication)));
    },
    onError,
  );
}

export function watchPatientRecords(patientId, onData, onError) {
  return subscribe(
    listApplicationsByPatientRef({
      patientId,
    }),
    (result) => {
      const applications = result?.data?.applications || [];

      onData(sortApplications(applications.map(mapApplication)));
    },
    onError,
  );
}

export async function resolveCurrentProfessional(firebaseUser) {
  const email = String(firebaseUser?.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error("A conta autenticada não possui um e-mail válido.");
  }

  const userResult = await getUserByEmail({
    email,
  });

  const user = userResult?.data?.users?.[0];

  if (!user?.id) {
    throw new Error("O usuário autenticado não possui cadastro no Vitta SQL.");
  }

  const professionalResult = await getProfessionalByUser({
    userId: user.id,
  });

  const professional = professionalResult?.data?.professionals?.[0];

  if (!professional?.id) {
    throw new Error("A conta autenticada não possui cadastro profissional.");
  }

  if (!professional.ubs?.id) {
    throw new Error("O profissional autenticado não possui uma UBS vinculada.");
  }

  return professional;
}

function timestampFromDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Informe uma data de aplicação válida.");
  }

  return new Date(`${value}T12:00:00-03:00`).toISOString();
}

/**
 * Busca uma aplicação diretamente no servidor.
 *
 * O uso de SERVER_ONLY evita decidir o lote anterior
 * usando uma resposta potencialmente antiga do cache.
 */
async function getFreshApplication(id) {
  if (!id) {
    throw new Error("A aplicação selecionada é inválida.");
  }

  const result = await executeQuery(
    getApplicationRef({ id }),
    QueryFetchPolicy.SERVER_ONLY,
  );

  const application = result?.data?.application;

  if (!application) {
    throw new Error("A aplicação não foi encontrada.");
  }

  return application;
}

export async function registerVaccination({
  patientId,
  vaccineId,
  batchId,
  applicationDate,
  doseNumber,
  notes,
  firebaseUser,
}) {
  if (!patientId || !vaccineId) {
    throw new Error("Selecione o paciente e a vacina.");
  }

  if (!batchId) {
    throw new Error("Selecione um lote antes de registrar a aplicação.");
  }

  if (!applicationDate) {
    throw new Error("Informe a data da aplicação.");
  }

  const professional = await resolveCurrentProfessional(firebaseUser);

  /*
   * A própria mutation verifica:
   * - existência do lote;
   * - compatibilidade entre lote e vacina;
   * - estoque > 0;
   * - desconto do estoque;
   * - criação da aplicação.
   *
   * Tudo acontece em uma transação no SQL Connect.
   */
  return createApplication({
    patientId,
    vaccineId,
    batchId,
    appointmentId: null,
    professionalId: professional.id,
    ubsId: professional.ubs.id,
    applicationDate: timestampFromDateInput(applicationDate),
    doseNumber: doseNumber ? Number(doseNumber) : null,
    notes: textOrNull(notes),
  });
}

export async function editApplication(
  id,
  {
    patientId,
    vaccineId,
    batchId,
    appointmentId,
    professionalId,
    ubsId,
    applicationDate,
    doseNumber,
    notes,
  },
) {
  if (!id) {
    throw new Error("A aplicação selecionada é inválida.");
  }

  if (!batchId) {
    throw new Error("Selecione um lote antes de salvar a aplicação.");
  }

  /*
   * Descobrimos no servidor qual lote a aplicação
   * realmente usa neste momento.
   *
   * A mutation UpdateApplication verifica novamente
   * essa informação dentro da transação. Assim,
   * caso outro profissional tenha alterado o registro
   * entre a leitura e a gravação, a operação é abortada
   * em vez de restaurar/descontar um lote incorreto.
   */
  const currentApplication = await getFreshApplication(id);

  const previousBatchId = currentApplication?.batch?.id || "";

  if (!previousBatchId) {
    throw new Error(
      "Esta aplicação antiga não possui lote associado e não pode ser editada por este fluxo.",
    );
  }

  return updateApplication({
    id,
    patientId,
    vaccineId,
    batchId,
    previousBatchId,
    appointmentId: appointmentId || null,
    professionalId,
    ubsId,
    applicationDate: timestampFromDateInput(applicationDate),
    doseNumber: doseNumber ? Number(doseNumber) : null,
    notes: textOrNull(notes),
  });
}

export async function removeApplication(id) {
  if (!id) {
    throw new Error("A aplicação selecionada é inválida.");
  }

  /*
   * Busca o lote diretamente no servidor.
   */
  const currentApplication = await getFreshApplication(id);

  const batchId = currentApplication?.batch?.id || "";

  /*
   * Aplicações antigas, criadas antes da exigência
   * de lote, são excluídas pelo fluxo legado.
   */
  if (!batchId) {
    return deleteLegacyApplication({
      id,
    });
  }

  /*
   * Para aplicações normais, a mutation:
   * 1. verifica que o lote realmente pertence à aplicação;
   * 2. devolve uma unidade ao estoque;
   * 3. exclui a aplicação;
   * tudo dentro da mesma transação.
   */
  return deleteApplication({
    id,
    batchId,
  });
}
