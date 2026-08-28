# Vitta Web

Painel profissional do ecossistema Vitta. O projeto usa React 19, Vite,
Firebase Authentication, Cloud Firestore, Tailwind CSS 4 e CSS responsivo
próprio.

## Ambiente

O painel usa exclusivamente o Firebase `vitta-5ec1e`. A configuração pública
do Firebase Web fica centralizada em `src/config/firebase.js` e pode ser
sobrescrita pelas variáveis documentadas em `.env.example`.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Firebase Web API keys identificam o projeto e não substituem as Firestore
Rules. Autorização de dados é sempre validada no servidor pelas Rules.

## Conta profissional

O login resolve `auth_links/{authUid}.personId`, com fallback legado para o
próprio UID, e abre o painel somente quando o perfil em `users/{personId}` tem:

- `roles` contendo `health_professional` ou `admin`;
- `accountStatus` igual a `active`.

## Atendimento

O fluxo principal é:

```text
login → CPF exato → paciente → carteira → registrar aplicação
```

Novas aplicações usam `patientId`, nunca `patientUid`. `professionalUid` vem
sempre de `auth.currentUser.uid`; não existe campo manual para esse valor.

As Rules e os índices oficiais ficam no projeto Vitta Mobile. Consulte
`docs/VITTA_WEB_MOBILE_INTEGRATION.md` naquele repositório.

## Validação

```powershell
npm run lint
npm test
npm run build
```

`db.json` e `npm run demo:legacy` foram mantidos apenas como material histórico
da antiga beta. O build normal e todo código em `src` usam Firebase real; os
mocks não são misturados com dados de produção.
