# Features Futuras - Vitta

Este documento reúne funcionalidades planejadas para futuras versões do sistema.

> Algumas funcionalidades são requisitos do projeto, outras são melhorias de usabilidade, segurança e qualidade de software.

---

## Autenticação

* [ ] Tela de Login
* [ ] Logout
* [ ] Controle de sessão
* [ ] Recuperação de senha
* [ ] Perfis de usuário (Administrador, Enfermeiro, Atendente)
* [ ] Controle de permissões por perfil

---

## Configurações

* [ ] Tela de Configurações
* [ ] Dados da Unidade de Saúde
* [ ] Alteração de senha
* [ ] Tema claro/escuro
* [ ] Idioma
* [ ] Configuração de lembretes
* [ ] Backup do banco de dados
* [ ] Restauração de backup

---

## Pacientes

* [x] Cadastro
* [x] CPF validado
* [x] Nome formatado automaticamente

### Futuras melhorias

* [ ] Foto do paciente
* [ ] Cartão SUS
* [ ] CNS
* [ ] Endereço completo
* [ ] Nome da mãe
* [ ] Contato de emergência
* [ ] Observações médicas
* [x] Busca por CPF
* [ ] Busca por telefone
* [ ] Histórico completo de vacinação

---

## Vacinas

* [x] CRUD

### Futuras melhorias

* [ ] Status automático do lote
* [ ] Tamanho do lote
* [ ] Quantidade inicial
* [ ] Quantidade disponível
* [ ] Quantidade aplicada
* [ ] Validade do lote
* [ ] Fabricante
* [ ] Local de armazenamento
* [ ] Motivo da indisponibilidade
* [x] Alerta de estoque baixo
* [ ] Alerta de validade próxima
* [ ] Baixa automática de estoque após aplicação

---

## Aplicações

* [ ] Aplicação utilizando IDs
* [ ] Carteira vacinal automática
* [ ] Histórico de aplicações
* [ ] Reagendamento
* [x] Cancelamento
* [ ] Observações da aplicação
* [ ] Local de aplicação
* [x] Profissional responsável
* [ ] Registro de reações adversas

### Alertas automáticos

* [ ] Vacina atrasada (agendada e não aplicada)
* [ ] Vacina vencida
* [x] Dose futura
* [ ] Esquema vacinal incompleto
* [ ] Intervalo mínimo entre doses
* [ ] Notificação de próxima dose

---

## Agendamentos

* [ ] Agenda de vacinação
* [ ] Reagendamento
* [ ] Cancelamento
* [ ] Agenda por profissional
* [ ] Agenda por paciente
* [ ] Agenda por vacina

---

## Dashboard

* [x] Total de pacientes
* [x] Total de vacinas
* [x] Aplicações do dia
* [ ] Estoque disponível
* [x] Vacinas vencidas
* [ ] Vacinas próximas do vencimento
* [ ] Vacinas atrasadas
* [ ] Gráfico por mês
* [ ] Gráfico por fabricante
* [ ] Gráfico por faixa etária
* [x] Ranking das vacinas mais aplicadas

---

## Relatórios

* [x] Pacientes cadastrados
* [ ] Aplicações por período
* [ ] Aplicações por profissional
* [x] Aplicações por vacina
* [x] Estoque
* [ ] Vacinas vencidas
* [ ] Vacinas atrasadas
* [ ] Exportação em PDF
* [ ] Exportação em Excel
* [ ] Impressão

---

## Pesquisa

* [ ] Pesquisa global
* [ ] Busca por CPF
* [ ] Busca por nome
* [ ] Busca por lote
* [ ] Busca por vacina
* [ ] Busca por profissional

---

## Interface

* [ ] Toasts de sucesso
* [ ] Toasts de erro
* [ ] Skeleton Loading
* [ ] Loading Spinner
* [x] Confirmação antes de excluir
* [ ] Paginação
* [ ] Ordenação das tabelas
* [ ] Filtros avançados
* [ ] Modal de detalhes
* [ ] Atalhos de teclado

---

## Validações

### Pacientes

* [x] CPF
* [x] Nome

### Vacinas

* [ ] Nome
* [ ] Fabricante
* [ ] Lote
* [ ] Datas
* [ ] Quantidade

### Aplicações

* [ ] Não permitir datas futuras
* [ ] Não permitir vacina vencida
* [ ] Verificar disponibilidade em estoque
* [ ] Verificar idade mínima
* [ ] Verificar intervalo entre doses
* [ ] Impedir aplicação duplicada

---

## Notificações

* [x] Estoque baixo
* [ ] Vacina próxima do vencimento
* [ ] Vacina vencida
* [ ] Vacina atrasada
* [ ] Próxima dose do paciente

---

## Segurança

* [ ] Proteção de rotas
* [ ] Criptografia de senha
* [ ] Auditoria de alterações
* [ ] Registro de logs
* [ ] Controle de acesso por perfil

---

## Qualidade

* [ ] Testes unitários
* [ ] Testes de integração
* [ ] Testes E2E
* [ ] CI/CD
* [ ] Docker
* [ ] Deploy em produção

---

## Melhorias Futuras

* [ ] Leitura de QR Code da carteira de vacinação
* [ ] Importação de dados CSV
* [ ] Exportação completa do banco
* [ ] API REST documentada
* [ ] Integração com SUS (quando disponível)
* [ ] Aplicação responsiva para dispositivos móveis
* [ ] PWA (Progressive Web App)
* [ ] Modo offline com sincronização
* [ ] Integração com envio de e-mail
* [ ] Integração com WhatsApp para lembretes
