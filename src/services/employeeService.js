import { QueryFetchPolicy, subscribe } from "firebase/data-connect";
//import { assertBirthDate } from "../utils/dates";
import {
  archiveProfessional,
  createProfessional,
  createUser,
  deleteUnlinkedUser,
  getAdminUserByCpf,
  linkPatientAuthIdentity,
  listProfessionalsRef,
  updateProfessional,
  updateUser,
  getCurrentPatientForProfessionalRegistration,
} from "@dataconnect/generated";
import {
  createEmployeeAuthAccount,
  requestPasswordReset,
} from "./authService";


function clean(value) {
  return String(value ?? "").trim();
}

function cleanCpf(value) {
  return clean(value).replace(/\D/g, "");
}

async function findCurrentPatientUserByCpf(cpf) {
  const result = await getCurrentPatientForProfessionalRegistration();
  const patient = result?.data?.patients?.[0];
  const user = patient?.user;

  if (!patient?.id || !user?.id) {
    throw new Error(
      "Sua conta ainda não possui um perfil de paciente para vincular. Solicite o cadastro ao administrador.",
    );
  }

  if (cleanCpf(user.cpf) !== cpf) {
    throw new Error(
      "O CPF informado não corresponde à pessoa vinculada à sua conta.",
    );
  }

  return {
    ...user,
    patient_on_user: patient,
  };
}

export function mapProfessional(professional) {
  const user = professional?.user || {};
  const ubs = professional?.ubs || null;

  return {
    id: professional?.id || "",
    userId: user.id || "",
    name: user.name || "",
    birthDate: user.birthDate || "",
    email: professional?.email || "",
    authUid: professional?.authUid || "",
    cpf: user.cpf || "",
    sex: user.sex || "",
    status: user.status || "ACTIVE",
    professionalType: professional?.professionalType || "OTHER",
    professionalRegistration:
      professional?.professionalRegistration || "",
    ubsId: ubs?.id || "",
    ubsName: ubs?.name || "",
  };
}

export function watchProfessionals(onData, onError) {
  return subscribe(
    listProfessionalsRef(),
    (result) => {
      const items = (result?.data?.professionals || [])
        .map(mapProfessional)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      onData(items);
    },
    onError,
  );
}

async function findUserByCpf(cpf) {
  const result = await getAdminUserByCpf(
    { cpf },
    { fetchPolicy: QueryFetchPolicy.SERVER_ONLY },
  );

  return result?.data?.users?.[0] || null;
}

export async function addProfessional(
  {
    name,
    birthDate,
    email,
    status,
    cpf,
    sex,
    professionalType,
    professionalRegistration,
    ubsId,
  },
  {
    createAuthenticationAccount = true,
    authUid = null,
  } = {},
) {
  const cleanName = clean(name);
  const cleanEmail = clean(email).toLowerCase();
  const cleanCpfValue = cleanCpf(cpf);

  if (!cleanName || !birthDate || !cleanEmail || !cleanCpfValue) {
    throw new Error("Preencha nome, nascimento, e-mail e CPF.");
  }

  let existingUser = createAuthenticationAccount
    ? await findUserByCpf(cleanCpfValue)
    : await findCurrentPatientUserByCpf(cleanCpfValue);

  if (existingUser?.professional_on_user?.id) {
    throw new Error(
      "Já existe um cadastro profissional para este CPF.",
    );
  }

  const existingPatient = existingUser?.patient_on_user || null;

  // Mesmo e-mail no paciente e profissional significa a mesma conta Firebase, com o mesmo UID e senha.
  const sharedEmail =
    existingPatient?.email?.trim().toLowerCase() === cleanEmail;

  let authAccount = null;
  let targetAuthUid;
  let createdUserId = null;
  let linkedPatientIdentity = false;

  try {
    if (!createAuthenticationAccount) {
      targetAuthUid = authUid;
        
      if (!targetAuthUid) {
        throw new Error(
          "Não foi possível identificar a conta de Authentication.",
        );
      }
    
      if (
        existingPatient?.authUid &&
        existingPatient.authUid !== targetAuthUid
      ) {
        throw new Error(
          "A conta autenticada não corresponde à conta de paciente existente.",
        );
      }
    
      if (
        existingPatient?.email &&
        existingPatient.email.trim().toLowerCase() !== cleanEmail
      ) {
        throw new Error(
          "Para compartilhar a autenticação, o e-mail do profissional precisa ser o mesmo do paciente.",
        );
      }
    } else if (sharedEmail && existingPatient?.authUid) {
      targetAuthUid = existingPatient.authUid;
    } else {
      authAccount = await createEmployeeAuthAccount(cleanEmail);
      targetAuthUid = authAccount.uid;
    }

    if (!existingUser) {
      const createResult = await createUser({
        name: cleanName,
        birthDate,
        status,
        cpf: cleanCpfValue,
        sex: clean(sex) || null,
      });
    
      createdUserId = createResult?.data?.user_insert?.id || null;
    
      if (!createdUserId) {
        throw new Error("O usuário foi criado, mas seu ID não foi retornado.");
      }
    
      existingUser = { id: createdUserId };
    }

    // Se o paciente já tinha o mesmo e-mail, mas ainda não tinha
    // UID, a nova identidade será compartilhada pelos dois perfis.
    if (
      existingPatient?.id &&
      sharedEmail &&
      !existingPatient.authUid
    ) {
      await linkPatientAuthIdentity({
        id: existingPatient.id,
        email: cleanEmail,
        authUid: targetAuthUid,
      });

      linkedPatientIdentity = true;
    }

    await createProfessional({
      userId: existingUser.id,
      email: cleanEmail,
      authUid: targetAuthUid,
      professionalType,
      professionalRegistration:
        clean(professionalRegistration) || null,
      ubsId: ubsId || null,
    });
  } catch (error) {
    // Só remove o User quando ele foi criado por esta operação e ainda não possui vínculos com perfis.
    if (createdUserId) {
      await deleteUnlinkedUser({ id: createdUserId }).catch(() => {});
    }

    // Se a identidade recém-criada já foi vinculada ao paciente, não podemos apagá-la: ela passou a ser a autenticação dele.
    if (authAccount && !linkedPatientIdentity) {
      await authAccount.rollback().catch(() => {});
    }

    throw error;
  } finally {
    if (authAccount) {
      await authAccount.close();
    }
  }

  let passwordResetSent = false;

  // Não enviamos redefinição de senha para uma conta já existente.
  if (authAccount) {
    try {
      await requestPasswordReset(cleanEmail);
      passwordResetSent = true;
    } catch {
      passwordResetSent = false;
    }
  }

  return {
    passwordResetSent,
    reusedAuthenticationAccount: !authAccount,
  };
}

export async function editProfessional(professional, data) {
  if (!professional?.id || !professional?.userId) {
    throw new Error("O profissional selecionado é inválido.");
  }

  const cleanName = clean(data.name);
  const cleanCpfValue = cleanCpf(data.cpf);

  if (!cleanName || !data.birthDate || !cleanCpfValue) {
    throw new Error("Preencha nome, nascimento e CPF.");
  }

  // O e-mail pertence ao perfil profissional e não deve ser alterado por uma edição comum dos dados pessoais.
  await updateUser({
    id: professional.userId,
    name: cleanName,
    birthDate: data.birthDate,
    status: data.status,
    cpf: cleanCpfValue,
    sex: clean(data.sex) || null,
  });

  await updateProfessional({
    id: professional.id,
    professionalType: data.professionalType,
    professionalRegistration:
      clean(data.professionalRegistration) || null,
    ubsId: data.ubsId || null,
  });
}

export async function removeProfessional(professional) {
  if (!professional?.id || !professional?.userId) {
    throw new Error("O profissional selecionado é inválido.");
  }

  await archiveProfessional({ id: professional.id });
}
