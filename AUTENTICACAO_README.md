# 🔐 Sistema de Autenticação - Finanças Fácil

## ✅ O QUE FOI IMPLEMENTADO

Sistema **COMPLETO** de autenticação profissional com:

### 🎯 Funcionalidades Principais

1. **✅ Registro de Usuários**
   - Cadastro com nome e e-mail
   - Geração automática de senha forte (12 caracteres)
   - Envio de e-mail de boas-vindas com senha temporária
   
2. **✅ Login Seguro**
   - Autenticação com JWT (JSON Web Tokens)
   - Senhas criptografadas com bcrypt (10 rounds)
   - Rate limiting para proteção contra ataques
   - Suporte para usuário "admin"

3. **✅ Primeiro Acesso**
   - Sistema obriga o usuário a alterar senha temporária
   - Validação de força de senha (maiúsculas, minúsculas, números, caracteres especiais)
   - Confirmação de senha
   - E-mail de confirmação de troca de senha

4. **✅ Painel Administrativo**
   - Usuário admin padrão (admin/admin)
   - Visualização de total de usuários cadastrados
   - Último acesso de cada usuário
   - Estatísticas do sistema
   - **SEM acesso aos dados financeiros dos usuários**

5. **✅ Perfis Isolados**
   - Cada usuário tem seus próprios dados
   - Isolamento completo entre perfis
   - Dados armazenados por usuário no backend

6. **✅ Segurança**
   - JWT com expiração configurável (7 dias padrão)
   - Hash bcrypt nas senhas
   - Rate limiting (100 req/15min geral, 5 req/15min login)
   - Proteção contra ataques de força bruta
   - Validação de força de senha

---

## 📁 ESTRUTURA DO PROJETO

```
financas-facil/
├── server/                          # 🔧 BACKEND (Node.js + Express)
│   ├── controllers/
│   │   ├── authController.js        # Login, registro, alterar senha
│   │   ├── adminController.js       # Estatísticas do sistema
│   │   └── userController.js        # Perfil e dados do usuário
│   ├── middleware/
│   │   └── auth.js                  # Verificação de JWT e permissões
│   ├── routes/
│   │   ├── auth.js                  # Rotas de autenticação
│   │   ├── admin.js                 # Rotas administrativas
│   │   └── user.js                  # Rotas do usuário
│   ├── utils/
│   │   ├── database.js              # Gerenciamento do banco JSON
│   │   ├── email.js                 # Envio de e-mails
│   │   ├── jwt.js                   # Funções JWT
│   │   └── password.js              # Geração e validação de senhas
│   ├── data/                        # Banco de dados JSON
│   ├── .env.example                 # Exemplo de configuração
│   ├── .env                         # Configurações (criar!)
│   ├── package.json
│   ├── server.js                    # Arquivo principal
│   └── README.md                    # Documentação do backend
│
├── src/                             # 🎨 FRONTEND (React)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginNovo.jsx        # Tela de login
│   │   │   ├── CadastroNovo.jsx     # Tela de cadastro
│   │   │   └── AlterarSenhaObrigatorio.jsx  # Tela de troca obrigatória
│   │   ├── LayoutNovo.jsx           # Layout com logout
│   │   └── ProtectedRoute.jsx       # Proteção de rotas
│   ├── contexts/
│   │   └── AuthContext.jsx          # Contexto de autenticação
│   ├── services/
│   │   └── api.js                   # Serviço de comunicação com API
│   ├── pages/
│   │   └── admin/
│   │       └── PainelAdmin.jsx      # Dashboard administrativo
│   ├── AppNovo.jsx                  # App com rotas de autenticação
│   └── main.jsx
│
├── .env                             # Configuração do frontend
├── package.json
└── AUTENTICACAO_README.md           # Este arquivo
```

---

## 🚀 COMO USAR

### 1️⃣ Configurar o Backend

```bash
# Entre na pasta do servidor
cd server

# Instale as dependências
npm install

# Configure o arquivo .env
cp .env.example .env
```

**Edite o arquivo `server/.env`:**

```env
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRE=7d

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_do_gmail
EMAIL_FROM=Finanças Fácil <seu_email@gmail.com>

# URL do Frontend
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANTE: Configurar E-mail do Gmail**

1. Acesse: https://myaccount.google.com/security
2. Ative a **Verificação em duas etapas**
3. Acesse: https://myaccount.google.com/apppasswords
4. Gere uma **Senha de app** 
5. Use essa senha no `EMAIL_PASS` do `.env`

```bash
# Inicie o servidor backend
npm run dev
```

O servidor estará rodando em: **http://localhost:5000**

---

### 2️⃣ Configurar o Frontend

**No arquivo raiz `.env`:**

```env
VITE_API_URL=http://localhost:5000/api
```

**Atualizar o `main.jsx` para usar o novo App:**

```bash
# Abra o arquivo src/main.jsx e altere:
# De: import App from './App.jsx'
# Para: import App from './AppNovo.jsx'
```

```bash
# Instale dependências (se necessário)
npm install

# Inicie o frontend
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

---

## 🔑 CREDENCIAIS PADRÃO

### Administrador
- **Usuário:** `admin`
- **Senha:** `admin`
- ⚠️ **DEVE ser alterada no primeiro acesso!**

### Novos Usuários
- Cadastram-se com nome e e-mail
- Senha gerada automaticamente
- Enviada por e-mail
- Devem alterar no primeiro acesso

---

## 📖 FLUXO DE USO

### Para Novo Usuário:

1. **Acesse:** http://localhost:5173/cadastro
2. Preencha nome completo e e-mail
3. ✅ Sistema gera senha e envia por e-mail
4. Acesse o e-mail e copie a senha
5. Faça login com e-mail e senha temporária
6. 🔒 Sistema obriga a alterar a senha
7. Crie uma senha forte seguindo os requisitos
8. ✅ Pronto! Acesso ao sistema

### Para Administrador:

1. **Login:** admin / admin
2. 🔒 Alterar senha obrigatoriamente
3. Acessar "Painel Admin" no menu
4. Visualizar estatísticas:
   - Total de usuários
   - Usuários ativos
   - Último acesso de cada um
5. ⚠️ **Não pode acessar dados financeiros dos usuários**

---

## 🛡️ REGRAS DE SEGURANÇA

### Senha Forte:
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 letra maiúscula
- ✅ Pelo menos 1 letra minúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial (!@#$%&*)

### Proteção:
- 🔒 Senhas com hash bcrypt (10 rounds)
- 🔒 JWT com expiração de 7 dias
- 🔒 Rate limiting (proteção contra ataques)
- 🔒 Validação em frontend e backend
- 🔒 CORS configurado

---

## 🔧 API ENDPOINTS

### Autenticação (`/api/auth`)

#### POST `/api/auth/registrar`
Cadastra novo usuário
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com"
}
```

#### POST `/api/auth/login`
Faz login
```json
{
  "email": "joao@exemplo.com",
  "senha": "SuaSenha123!"
}
```

#### POST `/api/auth/alterar-senha`
Altera senha (requer token)
```json
{
  "senhaAtual": "senha_antiga",
  "novaSenha": "Nova@Senha123"
}
```

#### GET `/api/auth/verificar`
Verifica se o token é válido (requer token)

---

### Admin (`/api/admin`)

#### GET `/api/admin/estatisticas`
Retorna estatísticas do sistema (requer token admin)

#### GET `/api/admin/usuarios`
Lista todos os usuários (requer token admin)

---

### Usuário (`/api/user`)

#### GET `/api/user/perfil`
Retorna perfil do usuário (requer token)

#### GET `/api/user/dados`
Retorna dados financeiros do usuário (requer token)

#### POST `/api/user/dados`
Salva dados do usuário (requer token)

---

## 📧 E-MAILS ENVIADOS

### 1. E-mail de Boas-Vindas
- Enviado após cadastro
- Contém senha temporária
- Link para fazer login
- Design bonito e profissional

### 2. E-mail de Confirmação de Troca de Senha
- Enviado após alterar senha com sucesso
- Confirma data e hora da alteração
- Alerta de segurança

---

## 🔍 TESTANDO O SISTEMA

### Teste 1: Cadastro de Novo Usuário
```bash
1. Acesse /cadastro
2. Preencha: "João Silva" / "joao@teste.com"
3. Verifique o console do backend (senha em dev mode)
4. Ou verifique o e-mail se configurado
5. Faça login com a senha temporária
6. Altere a senha obrigatoriamente
7. Acesse o dashboard
```

### Teste 2: Login como Admin
```bash
1. Acesse /login
2. Digite: admin / admin
3. Altere a senha (primeira vez)
4. Acesse o "Painel Admin"
5. Veja as estatísticas dos usuários
```

### Teste 3: Perfis Isolados
```bash
1. Crie 2 usuários diferentes
2. Adicione receitas/despesas em cada um
3. Verifique que os dados são independentes
4. Admin não vê dados financeiros
```

---

## ⚠️ IMPORTANTE

### Em Desenvolvimento:
- ✅ Senha temporária aparece na resposta da API
- ✅ Console mostra informações detalhadas
- ✅ CORS liberado para localhost

### Em Produção:
- ❌ Remover senha temporária da resposta da API
- ❌ Configurar CORS apenas para domínio específico
- ❌ Usar banco de dados real (PostgreSQL/MongoDB)
- ❌ Configurar HTTPS
- ❌ Usar variáveis de ambiente seguras
- ❌ Rate limiting mais restritivo

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module"
```bash
cd server
npm install
```

### Erro: "EADDRINUSE: address already in use"
```bash
# Porta 5000 em uso, altere no .env:
PORT=5001
```

### E-mails não estão sendo enviados
```bash
1. Verifique se o EMAIL_USER e EMAIL_PASS estão corretos
2. Certifique-se de usar "Senha de app" do Gmail
3. Ative "Verificação em duas etapas" na conta Google
4. Confira os logs do servidor
```

### Token inválido ou expirado
```bash
# Faça login novamente
# Tokens expiram em 7 dias por padrão
```

### Senha não atende requisitos
```bash
# Use uma senha com:
# - Mínimo 8 caracteres
# - 1 maiúscula, 1 minúscula, 1 número, 1 especial
# Exemplo: Senha@123
```

---

## 📊 BANCO DE DADOS

### Estrutura JSON (`server/data/database.json`):

```json
{
  "usuarios": [
    {
      "id": "1234567890",
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "senha": "$2a$10$hash...",
      "primeiroAcesso": false,
      "dataCriacao": "2025-01-01T00:00:00.000Z",
      "ultimoAcesso": "2025-01-02T10:30:00.000Z"
    }
  ],
  "admin": {
    "email": "admin",
    "senha": "$2a$10$hash...",
    "nome": "Administrador",
    "tipo": "admin",
    "primeiroAcesso": false
  }
}
```

### Dados por Usuário (`server/data/USER_DATA_[id].json`):

```json
{
  "receitas": [],
  "despesas": [],
  "categorias": [],
  "orcamentos": []
}
```

---

## 🎨 DESIGN

- ✅ Interface moderna e responsiva
- ✅ Gradientes coloridos
- ✅ Animações suaves
- ✅ Feedback visual (toasts, loaders)
- ✅ Ícones Lucide React
- ✅ Tailwind CSS
- ✅ Dark mode ready (estrutura preparada)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Backend completo com Express
- [x] Sistema de e-mail (nodemailer)
- [x] Geração de senha aleatória
- [x] Hash de senhas com bcrypt
- [x] JWT para autenticação
- [x] Rate limiting
- [x] Middleware de autenticação
- [x] Rotas protegidas
- [x] Cadastro de usuários
- [x] Login (usuário e admin)
- [x] Alteração de senha obrigatória
- [x] Validação de força de senha
- [x] E-mail de boas-vindas
- [x] E-mail de confirmação de troca
- [x] Painel administrativo
- [x] Estatísticas do sistema
- [x] Lista de usuários e último acesso
- [x] Perfis isolados por usuário
- [x] Context API para autenticação
- [x] Rotas protegidas no frontend
- [x] Layout com logout
- [x] Design moderno e responsivo
- [x] Documentação completa

---

## 📝 PRÓXIMOS PASSOS (Opcional)

1. **Migrar para Banco Real**
   - PostgreSQL ou MongoDB
   - Usar ORM (Sequelize/Mongoose)

2. **Recuperação de Senha**
   - Implementar "Esqueci minha senha"
   - Token temporário por e-mail
   - Redefinição segura

3. **Autenticação Social**
   - Login com Google
   - Login com Facebook
   - OAuth2

4. **Auditoria**
   - Log de ações dos usuários
   - Histórico de logins
   - Tentativas falhas

5. **Notificações**
   - E-mail de atividades suspeitas
   - Notificações de novos logins
   - Alertas personalizados

---

## 🎉 CONCLUSÃO

Sistema de autenticação **COMPLETO E PROFISSIONAL** implementado com sucesso!

✅ Todos os requisitos atendidos
✅ Segurança em primeiro lugar
✅ Código limpo e organizado
✅ Documentação detalhada
✅ Pronto para uso

**Desenvolvido com ❤️ para Finanças Fácil**

---

## 📞 SUPORTE

Se tiver dúvidas, consulte:
1. Este README
2. `server/README.md` (documentação do backend)
3. Comentários no código
4. Console do navegador (F12)
5. Logs do servidor

**Boa sorte! 🚀**
