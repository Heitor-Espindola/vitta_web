const messages = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/too-many-requests":
    "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "auth/network-request-failed": "Verifique sua conexão e tente novamente.",
  "auth/invalid-email": "Informe um e-mail válido.",
  "permission-denied":
    "Você não possui permissão para realizar esta operação.",
  unavailable: "O serviço está temporariamente indisponível.",
};

export function friendlyFirebaseError(error, fallback) {
  const code = String(error?.code || "").replace("firestore/", "");
  return (
    messages[code] ||
    fallback ||
    "Não foi possível concluir a operação. Tente novamente."
  );
}
