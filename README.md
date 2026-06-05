# 💰 Finanças Fácil - Sistema de Controle Financeiro

[![CI/CD Pipeline](https://github.com/seu-usuario/financas-facil/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/financas-facil/actions/workflows/ci.yml)
[![Release Pipeline](https://github.com/seu-usuario/financas-facil/actions/workflows/release.yml/badge.svg)](https://github.com/seu-usuario/financas-facil/actions/workflows/release.yml)
[![Versão](https://img.shields.io/badge/versão-2.0.0-blue.svg)](https://github.com/seu-usuario/financas-facil)
[![Licença](https://img.shields.io/badge/licença-MIT-green.svg)](LICENSE)

Sistema completo de controle financeiro pessoal com **autenticação segura**, perfis isolados e painel administrativo.

---

## ✨ Funcionalidades

### 💼 Controle Financeiro
- ✅ Dashboard com visão geral
- ✅ Gestão de receitas e despesas
- ✅ Orçamento mensal
- ✅ Relatórios detalhados
- ✅ DRE (Demonstrativo de Resultado)
- ✅ Backup e restauração de dados
- ✅ Exportação para Excel e PDF

### 🔐 Sistema de Autenticação (NOVO!)
- ✅ Cadastro com geração automática de senha
- ✅ E-mail de boas-vindas
- ✅ Login seguro com JWT
- ✅ Alteração obrigatória de senha no primeiro acesso
- ✅ Senhas criptografadas (bcrypt)
- ✅ Perfis isolados por usuário
- ✅ Painel administrativo
- ✅ Proteção contra ataques (rate limiting)

---

## 🚀 Instalação Rápida

### Opção 1: Scripts Automáticos (Recomendado)

**No Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

**No Linux/macOS (Bash):**
```bash
bash scripts/setup.sh
```

### Opção 2: Manual

**1. Instale as dependências:**
```bash
npm run install:all
```

**2. Configure o backend:**
```bash
cd server
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

**3. Configure o frontend:**
```bash
# Edite src/main.jsx
# Altere: import App from './App.jsx'
# Para: import App from './AppNovo.jsx'
```

**4. Inicie o sistema:**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

**5. Acesse:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📋 Requisitos

- Node.js 16+ 
- NPM ou Yarn
- Conta Gmail (para envio de e-mails)

---

## 🔑 Credenciais Padrão

### Administrador
- **Usuário:** `admin`
- **Senha:** `admin`
- ⚠️ Deve ser alterada no primeiro acesso

### Novos Usuários
- Cadastro em: http://localhost:5173/cadastro
- Senha enviada por e-mail
- Alteração obrigatória no primeiro login

---

## 📚 Documentação

- [📖 Guia de Instalação Rápida](INSTALACAO_RAPIDA.md)
- [🔐 Documentação de Autenticação](AUTENTICACAO_README.md)
- [🔧 Documentação do Backend](server/README.md)

---

## 🏗️ Arquitetura

```
financas-facil/
├── 🎨 Frontend (React + Vite + Tailwind)
│   ├── Componentes de Autenticação
│   ├── Dashboard e Relatórios
│   ├── Gestão de Receitas/Despesas
│   └── Painel Administrativo
│
└── 🔧 Backend (Node.js + Express)
    ├── API RESTful
    ├── Autenticação JWT
    ├── Envio de E-mails
    └── Banco de Dados JSON
```

---

## 🛡️ Segurança

- 🔒 **Senhas:** Hash bcrypt com 10 rounds
- 🔒 **Tokens:** JWT com expiração configurável
- 🔒 **Rate Limiting:** Proteção contra ataques
- 🔒 **Validação:** Frontend e backend
- 🔒 **CORS:** Configurado para produção
- 🔒 **Perfis Isolados:** Dados separados por usuário

---

## 📊 Tecnologias

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React (ícones)
- Recharts (gráficos)
- jsPDF (exportação PDF)
- XLSX (exportação Excel)

### Backend
- Node.js
- Express
- JWT (jsonwebtoken)
- Bcrypt (criptografia)
- Nodemailer (e-mails)
- Express Rate Limit
- CORS

---

## 📸 Screenshots

### Tela de Login
![Login](https://via.placeholder.com/600x400/667eea/ffffff?text=Tela+de+Login)

### Dashboard
![Dashboard](https://via.placeholder.com/600x400/667eea/ffffff?text=Dashboard)

### Painel Admin
![Painel Admin](https://via.placeholder.com/600x400/667eea/ffffff?text=Painel+Administrativo)

---

## 🔧 Configuração de E-mail

Para enviar e-mails, configure uma conta Gmail:

1. Acesse: https://myaccount.google.com/security
2. Ative **Verificação em duas etapas**
3. Acesse: https://myaccount.google.com/apppasswords
4. Gere uma **Senha de app**
5. Use no arquivo `server/.env`:

```env
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=senha_de_app_gerada
```

---

## 📖 API Endpoints

### Autenticação
```
POST   /api/auth/registrar          # Cadastrar usuário
POST   /api/auth/login               # Fazer login
POST   /api/auth/alterar-senha       # Alterar senha
GET    /api/auth/verificar           # Verificar token
```

### Admin
```
GET    /api/admin/estatisticas       # Estatísticas do sistema
GET    /api/admin/usuarios           # Listar usuários
```

### Usuário
```
GET    /api/user/perfil              # Obter perfil
GET    /api/user/dados               # Obter dados financeiros
POST   /api/user/dados               # Salvar dados
```

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend não conecta
```bash
# Verifique se o backend está rodando
# Confirme o arquivo .env:
VITE_API_URL=http://localhost:5000/api
```

### E-mail não envia
```bash
# Em desenvolvimento, a senha aparece no console
# Para produção, configure o Gmail corretamente
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Changelog

### v2.0.0 (2025-01-XX)
- ✅ Sistema completo de autenticação
- ✅ Perfis isolados por usuário
- ✅ Painel administrativo
- ✅ Envio de e-mails
- ✅ Segurança aprimorada

### v1.0.0 (2024-XX-XX)
- ✅ Controle de receitas e despesas
- ✅ Dashboard
- ✅ Relatórios e DRE
- ✅ Exportação de dados

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o controle financeiro pessoal.

---

## 🌟 Agradecimentos

- React Team
- Tailwind CSS
- Node.js Community
- Todos os contribuidores

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão?

- 📧 E-mail: suporte@financasfacil.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/financas-facil/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/seu-usuario/financas-facil/discussions)

---

## ⭐ Dê uma Estrela!

Se este projeto te ajudou, dê uma ⭐ no GitHub!

---

**Finanças Fácil - Controle suas finanças com segurança e facilidade! 💰**
