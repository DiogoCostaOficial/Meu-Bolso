# 📋 Backlog Completo do Produto — Meu Bolso (PM / PO)

> **Documento Oficial de Governança de Backlog, User Stories, Dependências e Critérios de Aceite**

---

## 1. Visão Geral e Priorização da Próxima Sprint (v2.1 — Para Execução Amanhã)

| Ordem | ID | Épico / Módulo | Funcionalidade (User Story) | Prioridade (MoSCoW) | Dependência |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **1º** | `US-01` | **Cartões de Crédito** | Adicionar campo de **Data/Dia de Vencimento da Fatura** no cadastro de cartões | **MUST HAVE** | Nenhuma *(Base para US-03)* |
| **2º** | `US-02` | **Onboarding / Cadastro** | Adicionar seleção de **País de Residência** e **Número de WhatsApp (com DDI)** no cadastro | **MUST HAVE** | Nenhuma *(Base para US-03)* |
| **3º** | `US-03` | **Notificações / Retenção** | **Integração com WhatsApp** para envio de lembretes automáticos antes do vencimento da fatura | **MUST HAVE** | Depende de `US-01` e `US-02` |
| **4º** | `US-04` | **Assistente FIN (UX)** | Permitir ao usuário **aumentar ou diminuir a fonte (`A+` / `A-`)** no FIN (tamanho atual como mínimo) | **MUST HAVE** | Nenhuma |
| **5º** | `US-05` | **Assistente FIN (`i18n`)** | **Sincronizar o idioma do FIN** (textos, 23 livros e Quiz *"Posso Gastar?"*) ao idioma selecionado | **MUST HAVE** | `LanguageContext` (Concluído) |
| **6º** | `US-06` | **Assistente FIN (`L10n`)** | Indicar **vídeos educativos no YouTube conforme o idioma selecionado** (BR, IT, EN, ES, etc.) | **SHOULD HAVE** | Depende de `US-05` |

---

## 2. Detalhamento das User Stories e Critérios de Aceite (Sprint v2.1)

### 🔹 `US-01`: Data de Vencimento da Fatura nos Cartões
* **User Story:** *Como* um usuário que possui 2 ou mais cartões de bancos digitais, *quero* informar a data/dia de vencimento da fatura de cada cartão, *para que* eu visualize quando cada fatura vence na tela consolidada e receba lembretes antes do vencimento.
* **Critérios de Aceite (AC):**
  1. No formulário de criação/edição de cartões, exibir campo obrigatório ou recomendado de **Dia/Data de Vencimento da Fatura** (1 a 31).
  2. Exibir na tela consolidada de cartões o dia de vencimento de cada cartão e destacar faturas próximas do vencimento.

### 🔹 `US-02`: País de Residência e WhatsApp no Cadastro
* **User Story:** *Como* um novo usuário (no Brasil, América do Sul, Itália, EUA ou outros países), *quero* informar meu País de residência e meu número de WhatsApp no momento do cadastro, *para que* o sistema identifique minha localização/DDI e possa me enviar alertas importantes no WhatsApp.
* **Critérios de Aceite (AC):**
  1. Na tela de criação de conta (`CadastroNovo`), incluir seletor de **País** (com preenchimento automático do DDI, ex: `+55` Brasil, `+39` Itália, `+1` EUA) e campo de **WhatsApp**.
  2. Persistir `pais` e `whatsapp` no perfil do usuário no banco de dados.

### 🔹 `US-03`: Alertas Automáticos de Vencimento via WhatsApp
* **User Story:** *Como* um usuário de baixa renda que quase não utiliza e-mail no dia a dia, *quero* receber mensagens automáticas no meu WhatsApp lembrando que uma fatura de cartão ou conta está prestes a vencer, *para que* eu realize o pagamento em dia e evite juros rotativos e multas.
* **Critérios de Aceite (AC):**
  1. Verificar faturas de cartão e despesas com data de vencimento próxima.
  2. Disparar alerta formatado para o número de WhatsApp cadastrado do usuário com o resumo do cartão, valor consolidado da fatura e data de vencimento.

### 🔹 `US-04`: Acessibilidade Visual — Controle de Fonte (`A+` / `A-`) no FIN
* **User Story:** *Como* um usuário que busca conforto visual na leitura das dicas financeiras, *quero* botões para aumentar ou diminuir o tamanho da letra dentro do assistente FIN, *para que* eu consiga ler sem esforço tanto no celular quanto no computador.
* **Critérios de Aceite (AC):**
  1. Adicionar controles `A-` e `A+` no cabeçalho do assistente **FIN**.
  2. O tamanho de fonte atual da interface do FIN deve ser travado como o **tamanho mínimo permitido** (o usuário pode aumentar em níveis graduais e diminuir de volta apenas até esse piso mínimo).
  3. Salvar a preferência de tamanho de fonte do usuário (`localStorage`).

### 🔹 `US-05`: Internacionalização Completa do Assistente FIN (`i18n`)
* **User Story:** *Como* um usuário que selecionou outro idioma no aplicativo (como Inglês, Espanhol ou Italiano), *quero* que o assistente FIN, as pílulas dos 23 livros e o quiz *"Posso Gastar?"* conversem comigo no mesmo idioma selecionado, *para que* eu compreenda 100% das orientações.
* **Critérios de Aceite (AC):**
  1. Conectar o assistente **FIN** ao idioma ativo do `LanguageContext`.
  2. Traduzir saudações, dicas contextuais, perguntas/respostas do quiz *"Posso Gastar?"* e respostas do chatbot para o idioma selecionado pelo usuário.

### 🔹 `US-06`: Curadoria de Vídeos no YouTube Localizados por Idioma (`L10n`)
* **User Story:** *Como* um usuário que aprende melhor assistindo a vídeos do que apenas lendo, *quero* que o FIN me indique vídeos de educação financeira no YouTube no idioma que selecionei (ex: canais brasileiros se estiver em Português-BR, canais italianos se estiver em Italiano), *para que* eu aprofunde meu conhecimento com conteúdos da minha língua.
* **Critérios de Aceite (AC):**
  1. Estruturar catálogo curado de vídeos educativos do YouTube mapeado para cada um dos **8 idiomas** (`pt-BR`, `en`, `es`, `pt-PT`, `it`, `zh`, `fr`, `de`).
  2. Exibir dentro do **FIN** cards clicáveis de recomendação de vídeo do YouTube que mudam dinamicamente conforme o idioma ativo.

---

## 3. Histórico de Entregas Concluídas (Done — v1.0 a v2.0)

- [x] **[CORE-01]** Fluxo de Caixa completo (Receitas, Despesas, Categorias e Metas Orçamentárias).
- [x] **[CORE-02]** Módulo de Cartões vinculado às despesas com **Consolidação Total de Faturas em Tela Única**.
- [x] **[CORE-03]** Edição *inline* de compras parceladas diretamente na tabela (redução de 5 etapas para 1 clique).
- [x] **[CORE-04]** Cálculo 100% automático do **Custo de Vida Real** e do **DRE Pessoal** (visão empresarial acessível).
- [x] **[BETA-01]** **Módulo Exclusivo de Viagens** (criado a partir do feedback real no Brasil).
- [x] **[BETA-02]** **Conversão Multimoedas em Tempo Real** (criado a partir do feedback real na Itália e EUA).
- [x] **[FIN-01]** Assistente **FIN** com persona de "melhor amigo", base de **23 livros clássicos** e Quiz *"Posso Gastar?"* em 3 perguntas.
- [x] **[UX-01]** Onboarding com Google OAuth (1 clique) e validação OTP com atalhos diretos para **Gmail e Outlook**.
- [x] **[UX-02]** Redesign *Split-Screen* limpo de Login e Cadastro com apresentação de slides (Solteiro, Casal, Família e Viagens).
- [x] **[UX-03]** Redirecionamento do Logout para a página inicial com Vitrine de Novidades (`#novidades`).
- [x] **[I18N-01]** Seletor global de **8 idiomas** em todas as páginas (destaque América do Sul: PT-BR, EN, ES + PT-PT, IT, ZH, FR, DE).

---

## 4. Roadmap Pós-Subida em Produção (v2.5)

- [ ] **[PROD-01]** Rodada estruturada de entrevistas e testes de usabilidade com **10 a 15 usuários reais** (foco baixa renda e internacional).
- [ ] **[PROD-02]** Mensuração do Funil de Ativação, Coortes de Retenção (D7/D30/D60) e **North Star Metric** (*"% de usuários ativos que fecham o mês no verde, pagam faturas sem atraso e reduzem o comprometimento com múltiplos cartões"*).
