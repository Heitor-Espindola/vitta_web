import { subscribe } from "firebase/data-connect";
import {
  archiveProfessional,
  createProfessional,
  createUser,
  deleteUnlinkedUser,
  getUserByEmail,
  listProfessionalsRef,
  updateProfessional,
  updateUser,
} from "@dataconnect/generated";
import { createEmployeeAuthAccount, requestPasswordReset, } from "./authService";

function clean(value) {
  return String(value ?? "").trim();
}

export function mapProfessional(professional) {
  const user = professional?.user || {};
  const ubs = professional?.ubs || null;
  return {
    id: professional?.id || "",
    userId: user.id || "",
    name: user.name || "",
    birthDate: user.birthDate || "",
    email: user.email || "",
    cpf: user.cpf || "",
    sex: user.sex || "",
    status: user.status || "ACTIVE",
    professionalType: professional?.professionalType || "OTHER",
    professionalRegistration: professional?.professionalRegistration || "",
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

async function findUserByEmail(email) {
  const result = await getUserByEmail({ email });
  const user = result?.data?.users?.[0];
  if (!user?.id) {
    throw new Error("O usuário foi criado, mas não pôde ser localizado no SQL Connect.");
  }
  return user;
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
    portalRole = "PROFESSIONAL",
  } = {},
) {
  const cleanName = clean(name);
  const cleanEmail = clean(email).toLowerCase();
  const cleanCpf = clean(cpf).replace(/\D/g, "");

  if (!cleanName || !birthDate || !cleanEmail || !cleanCpf) {
    throw new Error("Preencha nome, nascimento, e-mail e CPF.");
  }

  const authAccount = createAuthenticationAccount
    ? await createEmployeeAuthAccount(cleanEmail)
    : null;

  const targetAuthUid = authAccount?.uid || authUid;

  if (!targetAuthUid) {
    if (authAccount) {
      await authAccount.close();
    }

    throw new Error("Não foi possível identificar a conta de Authentication.");
  }

  let sqlUserInserted = false;
  let sqlUserId = null;

  try {
    await createUser({
      name: cleanName,
      birthDate,
      email: cleanEmail,
      status,
      cpf: cleanCpf,
      sex: clean(sex) || null,
      authUid: targetAuthUid,
      portalRole,
    });

    sqlUserInserted = true;

    const user = await findUserByEmail(cleanEmail);
    sqlUserId = user.id;

    await createProfessional({
      userId: user.id,
      professionalType,
      professionalRegistration:
        clean(professionalRegistration) || null,
      ubsId: ubsId || null,
    });
  } catch (error) {
    if (sqlUserInserted) {
      let createdUserId = sqlUserId;

      if (!createdUserId) {
        const result = await getUserByEmail({ email: cleanEmail })
          .catch(() => null);

        createdUserId = result?.data?.users?.[0]?.id || null;
      }

      if (createdUserId) {
        await deleteUnlinkedUser({ id: createdUserId }).catch(() => { });
      }
    }

    if (authAccount) {
      await authAccount.rollback().catch(() => { });
    }

    throw error;
  } finally {
    if (authAccount) {
      await authAccount.close();
    }
  }

  let passwordResetSent = false;

  if (authAccount) {
    try {
      await requestPasswordReset(cleanEmail);
      passwordResetSent = true;
    } catch {
      passwordResetSent = false;
    }
  }

  return { passwordResetSent };
}

export async function editProfessional(professional, data) {
  if (!professional?.id || !professional?.userId) {
    throw new Error("O profissional selecionado é inválido.");
  }

  const cleanName = clean(data.name);
  const cleanEmail = clean(data.email).toLowerCase();
  const cleanCpf = clean(data.cpf).replace(/\D/g, "");
  if (!cleanName || !data.birthDate || !cleanEmail || !cleanCpf) {
    throw new Error("Preencha nome, nascimento, e-mail e CPF.");
  }

  await updateUser({
    id: professional.userId,
    name: cleanName,
    birthDate: data.birthDate,
    email: cleanEmail,
    status: data.status,
    cpf: cleanCpf,
    sex: clean(data.sex) || null,
  });

  await updateProfessional({
    id: professional.id,
    professionalType: data.professionalType,
    professionalRegistration: clean(data.professionalRegistration) || null,
    ubsId: data.ubsId || null,
  });
}

export async function removeProfessional(professional) {
  if (!professional?.id || !professional?.userId) {
    throw new Error("O profissional selecionado é inválido.");
  }

  await archiveProfessional({ id: professional.id });
}
