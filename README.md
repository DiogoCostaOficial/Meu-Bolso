# 💰 Meu Bolso (Finanças Fácil) - Gestão Financeira Inteligente

[![CI/CD Pipeline](https://github.com/seu-usuario/financas-facil/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/financas-facil/actions/workflows/ci.yml)
[![Release Pipeline](https://github.com/seu-usuario/financas-facil/actions/workflows/release.yml/badge.svg)](https://github.com/seu-usuario/financas-facil/actions/workflows/release.yml)
[![Versão](https://img.shields.io/badge/versão-2.0.0-blue.svg)](https://github.com/seu-usuario/financas-facil)
[![Desenvolvido com IA](https://img.shields.io/badge/Engenharia-Assistida_por_IA-7928CA.svg)](#-desenvolvimento-com-inteligência-artificial)
[![Licença](https://img.shields.io/badge/licença-MIT-green.svg)](LICENSE)

Sistema completo de controle financeiro pessoal e gerencial, com **autenticação segura (JWT e Google OAuth)**, assistente educacional interativo (**FIN**), arquitetura de dados híbrida (**PostgreSQL/Supabase + JSON local**), relatórios executivos (**DRE, orçamentos, gráficos**) e suporte multiplataforma (Web e Mobile Android via Capacitor).

---

## 🤖 Desenvolvimento com Inteligência Artificial

Este sistema foi concebido, construído e refinado através de uma dinâmica prática de **Engenharia de Software Assistida por Inteligência Artificial (AI-Assisted Engineering)**, operando em modelo de *Pair Programming* com o ecossistema **Google Antigravity & Modelos Gemini**, sob estrita liderança e governança técnica humana.

### 🧭 Como o Desenvolvimento foi Conduzido
O projeto não resultou de geração automatizada cega, mas sim de um ciclo contínuo e disciplinado de orientação humana e execução assistida:
1. **Intenção e Escopo Humano:** Definição clara de metas funcionais, casos de uso reais e requisitos não-funcionais (segurança, tolerância a falhas, responsividade).
2. **Implementação Guiada:** A IA gerou scaffolds de componentes React, estilização fluida em Tailwind CSS, rotas da API Express e queries analíticas no PostgreSQL.
3. **Depuração e Refinamento Iterativo:** Cada comportamento anômalo observado em testes de integração (como erros de CORS, tipagem de arrays no banco e regras serverless) foi diagnosticado em tempo real em colaboração com a IA até a resolução definitiva.

### 👨‍💻 Governança e Decisões do Desenvolvedor (Controle Humano)
A tomada de decisões críticas permaneceu integralmente sob responsabilidade humana:
- **Regras de Negócio Financeiras:** Lógica de apuração do DRE (Demonstrativo de Resultado do Exercício), cálculo de saldo operacional, parcelamento dinâmico em edição inline e alertas de orçamento.
- **Definição da Arquitetura:** Decisão pelo armazenamento híbrido (PostgreSQL em produção com fallback e backup sincronizado em JSON local) e adoção do Vercel Serverless (`.cjs`).
- **Políticas de Segurança:** Estratégia de autenticação em múltiplas camadas (JWT + Google OAuth), hashing de senhas com bcrypt, limitação de taxa (rate limiting) e isolamento rigoroso por `userId`.
- **Auditoria e Homologação:** Validação manual de cada pull request, teste de regressão em interface e aprovação de deploys para produção.

### 🛠️ Onde a IA foi Decisiva
- **Diagnósticos de Alta Complexidade:** Identificação e correção de incompatibilidades de módulos no ambiente Vercel Serverless (`api/index.cjs`), tipagem de arrays `UNNEST` no PostgreSQL e headers anti-cache para instâncias Supabase.
- **Assistente Financeiro Educacional (FIN):** Apoio na criação dos *knowledge cards* educativos, mascote dinâmico e motor de processamento em linguagem natural para dúvidas de finanças.
- **Produtividade de Código e UX:** Aceleração na entrega de gráficos Recharts, alternância de temas (*Lux Gold*, Claro, Escuro) e feedback com toasts acessíveis.

---

## ✨ Funcionalidades Principais

### 💼 Gestão Financeira Completa
- ✅ **Dashboard Inteligente:** Visão rápida de saldos, receitas, despesas e fluxo de caixa.
- ✅ **Receitas e Despesas:** Lançamentos com categorias personalizáveis, datas de competência e status.
- ✅ **Parcelamento Dinâmico:** Conversão de despesas simples em pagamentos parcelados diretamente na edição *inline*.
- ✅ **Acompanhamento de Orçamento:** Definição de tetos mensais por categoria com barras de progresso visual.
- ✅ **DRE (Demonstrativo de Resultado):** Apuração gerencial completa de receitas brutas, custos, despesas operacionais e resultado líquido.
- ✅ **Exportação de Dados:** Geração instantânea de relatórios profissionais em **Excel (XLSX)** e **PDF** com tabelas formatadas.
- ✅ **Múltiplas Moedas:** Suporte a diferentes moedas e formatações financeiras.

### 🦉 FIN - Mascote & Assistente Financeiro
- ✅ **Dicas Contextuais:** Explicações didáticas e amigáveis sobre DRE, orçamentos, cartão de crédito e fluxo de caixa.
- ✅ **Chatbot Integrado:** Resposta a perguntas frequentes e ajuda na navegação do sistema via linguagem natural.
- ✅ **Anúncios Dinâmicos:** Notificações contextuais de novidades e atualizações por usuário.

### 🔐 Autenticação & Segurança de Nível Corporativo
- ✅ **Login Seguro com JWT:** Tokens com expiração controlada e validação contínua.
- ✅ **Social Login:** Integração completa com **Google OAuth 2.0**.
- ✅ **Criptografia Forte:** Senhas criptografadas com hash **bcrypt**.
- ✅ **Alteração Obrigatória de Senha:** Proteção de primeiro acesso para novas contas geradas pelo sistema.
- ✅ **Recuperação de Acesso via E-mail:** Envio automatizado de senhas e códigos OTP via Nodemailer/Gmail.
- ✅ **Rate Limiting:** Proteção ativa contra ataques de força bruta e sobrecarga de requisições.
- ✅ **Isolamento de Dados:** Dados financeiros 100% segregados e protegidos por usuário.

### 📱 Experiência Multiplataforma & Mobile
- ✅ **Interface Totalmente Responsiva:** Otimizada para telas desktop, tablets e smartphones.
- ✅ **Aplicativo Android Nativo:** Empacotamento móvel configurado via **Capacitor**.
- ✅ **Temas Customizáveis:** Suporte a tema Claro, Escuro e tema exclusivo **Lux Gold**.

---

## 🏗️ Arquitetura do Sistema

```
financas-facil/
├── 🎨 src/ (Frontend SPA)
│   ├── components/        # Componentes UI reutilizáveis, modais e mascote FIN
│   ├── contexts/          # Auth, Temas, Moedas e Variações de Layout
│   ├── pages/             # Telas principais (Dashboard, DRE, Orçamento, Admin, etc.)
│   ├── utils/             # Chatbot FIN, cálculos financeiros, exportadores PDF/Excel
│   └── main.jsx           # Ponto de entrada com Providers (Google OAuth, Router, Tema)
│
├── 🔧 server/ (Backend API RESTful)
│   ├── controllers/       # Lógica de controle (authController, userController, adminController)
│   ├── routes/            # Rotas modulares (/auth, /user, /admin, /debug)
│   ├── middleware/        # Interceptadores de autenticação JWT e validação de permissões
│   ├── utils/             # Camada de banco híbrida (databasePg.js e databaseJson.js)
│   └── server.js          # Servidor Express local e configuração de CORS
│
├── ☁️ api/
│   └── index.cjs          # Ponto de entrada serverless otimizado para deploy na Vercel
│
├── 📱 android/            # Projeto Android nativo gerado pelo Capacitor
│
└── 🤖 .github/workflows/  # CI/CD automatizado, releases semânticos e ping anti-pausa do Supabase
```

---

## 📊 Tecnologias Utilizadas

| Camada | Tecnologias |
|---|---|
| **Frontend** | React 18, Vite 7, Tailwind CSS, React Router DOM, Lucide Icons, Recharts, Sonner, Headless UI |
| **Backend** | Node.js, Express, JWT, Bcrypt, Google Auth Library, Nodemailer, Express Rate Limit, CORS |
| **Banco de Dados** | **PostgreSQL (Supabase)** em produção com fallback/sincronização automática para **JSON Storage** local |
| **Mobile** | Capacitor (@capacitor/core, @capacitor/android, @capacitor/cli) |
| **Hospedagem & CI/CD** | Vercel (Frontend & Serverless Functions), GitHub Actions (CI, Keep-Alive, Semantic Release) |
| **Desenvolvimento com IA**| Google Antigravity & Modelos Gemini |

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- **Node.js** 18+ instalado
- Gerenciador de pacotes **NPM** (versão 8+)

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/financas-facil.git
cd financas-facil
```

### 2. Instalação das Dependências
Instale simultaneamente as dependências da raiz (frontend) e do backend:
```bash
npm run install:all
```

### 3. Configuração de Variáveis de Ambiente

#### Backend (`server/.env`):
Copie o exemplo e configure suas credenciais:
```bash
cp server/.env.example server/.env
```
Campos essenciais:
```env
PORT=5000
JWT_SECRET=sua_chave_secreta_jwt_longa
USE_JSON_STORAGE=false            # Defina 'true' para usar apenas arquivo local sem Supabase
DATABASE_URL=sua_conexao_postgres # Connection string do Supabase/PostgreSQL (se aplicável)
SUPABASE_URL=https://sua-url.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_aplicativo_google
```

#### Frontend (`.env` na raiz):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Executando o Projeto

Para rodar **Frontend e Backend juntos** com um único comando:
```bash
npm run dev:all
```

Ou em terminais separados:
```bash
# Terminal 1 - Servidor Backend (porta 5000)
npm run server

# Terminal 2 - Frontend Vite (porta 5173)
npm run dev
```

Acesse a aplicação no navegador em: `http://localhost:5173`

---

## ☁️ Deploy em Produção (Vercel & Supabase)

O repositório já está configurado para deploy *zero-config* na **Vercel** através do arquivo `vercel.json`:
- **Frontend SPA:** Compilado via `@vercel/static-build` apontando para o diretório `dist`.
- **Backend API:** Executado de forma serverless através de `api/index.cjs` com compatibilidade CommonJS.
- **Supabase Keep-Alive:** A action `.github/workflows/keep-supabase-alive.yml` dispara requisições diárias sem cache para evitar que projetos inativos no plano gratuito do Supabase entrem em pausa.

---

## 📱 Build para Android (Capacitor)

Para gerar e sincronizar o build com o aplicativo nativo Android:

```bash
# 1. Compilar os assets web
npm run build

# 2. Sincronizar com o diretório nativo Android
npm run cap:sync

# 3. Abrir no Android Studio
npm run cap:open
```

---

## 📖 Principais Rotas da API

### Autenticação (`/api/auth`)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/registrar` | Cadastra novo usuário com senha temporária enviada por e-mail |
| `POST` | `/api/auth/login` | Realiza login e retorna token JWT |
| `POST` | `/api/auth/google` | Autenticação via token de ID do Google OAuth |
| `POST` | `/api/auth/alterar-senha` | Redefinição obrigatória ou manual de senha |
| `GET`  | `/api/auth/verificar` | Validação do token de sessão ativo |

### Dados do Usuário (`/api/user`)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET`  | `/api/user/perfil` | Retorna os dados do perfil do usuário logado |
| `PUT`  | `/api/user/perfil` | Atualiza dados cadastrais (nome, preferências) |
| `GET`  | `/api/user/dados` | Obtém todas as transações, orçamentos e categorias do usuário |
| `POST` | `/api/user/dados` | Sincroniza e persiste lote de transações financeiras |

### Painel Administrativo (`/api/admin`)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET`  | `/api/admin/estatisticas` | Estatísticas gerais do sistema (usuários, atividade) |
| `GET`  | `/api/admin/usuarios` | Listagem e gerenciamento de perfis cadastrados |

---

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Siga o fluxo padrão:
1. Faça um **Fork** do projeto.
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/minha-melhoria`).
3. Commit suas alterações (`git commit -m 'feat: adiciona nova funcionalidade'`).
4. Faça o push para a branch (`git push origin feature/minha-melhoria`).
5. Abra um **Pull Request**.

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.

---

<p align="center">
  <b>Meu Bolso - Finanças Fácil</b> • Construído com controle humano e inteligência artificial 🚀
</p>
