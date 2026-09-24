# Vitta Web

Painel profissional do ecossistema Vitta, construído com React 19, Vite,
Firebase Authentication, Firebase Data Connect/Cloud SQL, Tailwind CSS 4 e CSS
responsivo próprio.

## Ambiente

O painel usa exclusivamente o projeto Firebase `vitta-5ec1e`. A configuração
pública do Firebase Web fica em `src/config/firebase.js` e pode ser
sobrescrita pelas variáveis documentadas em `.env.example`.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Firebase Authentication identifica a sessão. Dados clínicos, perfis,
autorizações e vínculos são lidos e gravados pelos conectores SQL Connect
`example` e `mobile-connector`, na região `southamerica-east1`.

## Conta profissional

O login resolve o perfil SQL pelo `auth.uid`. O painel só é aberto quando o
usuário está ativo e possui perfil profissional ativo ou claim administrativo.
Profissionais enxergam apenas pacientes com `PatientAccess` direto, válido e
não expirado; o acesso não é transitivo.

## Atendimento

O fluxo principal é:

```text
login → CPF exato autorizado → paciente → carteira → registrar aplicação
```

`CreateApplication` exige paciente, vacina, profissional e UBS válidos, grava
snapshots históricos no servidor e é atômica. Aplicações não são excluídas:
correções administrativas usam anulação auditável. Pacientes, profissionais,
vacinas e UBS são arquivados/desativados em vez de removidos pelo fluxo comum.

O Firestore legado continua preservado para rollback, mas não é fonte primária
do domínio no Web. A coleção `news_articles` permanece fora desta migração e
continua sendo consumida pelo Mobile.

## Validação

```powershell
npm run lint
npm test -- --run
npm run build
node tool/production_sql_connect_smoke.mjs RUN_PRODUCTION_SQL_SMOKE
```

O smoke de produção cria uma identidade temporária, valida os dois conectores,
anula a aplicação de teste e remove os dados temporários. Execute-o somente com
uma sessão Firebase CLI autorizada para o projeto de produção.

## Publicação

```powershell
firebase deploy --only hosting --project vitta-5ec1e
```

O Hosting serve `dist` e reescreve rotas da SPA para `index.html`.

`db.json`, `npm run demo:legacy` e os scripts de emulador Firestore foram
mantidos apenas como material histórico da antiga beta.
