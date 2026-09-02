const messages = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-login-credentials": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/too-many-requests":
    "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "auth/network-request-failed":
    "Não foi possível conectar ao Vitta. Verifique sua internet.",
  "auth/invalid-email": "Informe um e-mail válido.",
  "permission-denied": "Não foi possível validar seu acesso neste momento.",
  unavailable: "Não foi possível conectar ao Vitta. Tente novamente.",
};

export function friendlyFirebaseError(error, fallback) {
  const code = String(error?.code || "").replace("firestore/", "");
  return (
    messages[code] ||
    fallback ||
    "Não foi possível concluir a operação. Tente novamente."
  );
}
