# Hardening local do Firebase Data Connect

Data da proposta local: 23/09/2026. Nenhuma alteração deste documento foi
implantada no Firebase ou no Cloud SQL.

## Decisões de autorização

- `PatientAccess` é o único grant usado para autorizar uma carteira. A chave
  `(granteeAuthUid, patientId)` representa acesso direto e não permite inferir
  A -> C a partir de A -> B e B -> C.
- Consultas Mobile de perfil, vacinação e contato de emergência exigem
  `auth.uid`, consentimento `GRANTED`, permissão específica e grant não expirado.
- Dependentes não precisam de e-mail ou `authUid`; a pessoa continua identificada
  pelo UUID de `User`/`Patient` e pode receber autenticação no futuro.
- O Mobile não possui operações administrativas nem criação de aplicação.
- No Web, listagens globais e CRUD administrativo passaram a exigir o custom
  claim `admin == true`.
- `GetUserByCpf` exige que `auth.uid` corresponda a um `Professional` SQL.
- Leituras Web por paciente exigem `PatientAccess` direto.
- `CreateApplication` exige simultaneamente profissional SQL correspondente ao
  `auth.uid`, `portalRole == PROFESSIONAL` e grant direto `PROFESSIONAL`.

## Compatibilidade do Web

Nenhuma assinatura GraphQL consumida pelo Web foi alterada. O codegen oficial
continua válido e o projeto compila. A mudança é intencionalmente comportamental:

- `listPatientsRef()` e `listApplicationsRef()` continuam sendo chamados pelos
  serviços atuais, mas agora são exclusivos de administrador.
- Um portal profissional deve migrar para as operações escopadas por paciente e
  receber `PatientAccess` explícito antes que este connector seja implantado.
- O custom claim administrativo precisa ser provisionado antes do deploy.
- Os campos `User.authUid` e `User.portalRole` precisam ser preenchidos pela
  futura migração antes da ativação do connector endurecido.

Isso evita uma quebra silenciosa: o connector Web não deve ser implantado antes
das etapas de dados, claims e adaptação dos serviços descritas no plano de deploy.

## Matriz dos casos de autorização

| Caso | Resultado | Mecanismo |
| --- | --- | --- |
| A lê A | Permitido | grant direto `SELF` |
| A lê dependente B | Permitido | grant direto `DEPENDENT` para B |
| A lê C sem grant | Negado | chave de `PatientAccess` ausente |
| A -> B, B -> C, A lê C | Negado | não há travessia de `FamilyRelationship` |
| A altera papel, CPF ou authUid | Negado | campos ausentes das mutations Mobile |
| Usuário comum cria aplicação | Negado | operação inexistente no Mobile e checks Web |
| Profissional autorizado cria aplicação | Permitido | identidade SQL + grant `PROFESSIONAL` |

Os testes Vitest verificam estruturalmente esse contrato. Testes end-to-end com
tokens e dados reais devem ser executados no emulador/ambiente de homologação
antes do deploy; não foram executados contra produção nesta etapa.

## Divergência `motherName`

- LOCAL: `Patient.motherName` existe no schema.
- PRODUÇÃO: a coluna ainda não existe no Cloud SQL.
- AÇÃO FUTURA: incluir `ADD COLUMN mother_name text NULL` na migration revisada,
  depois de backup e validação de diff; não alterar produção nesta etapa.
