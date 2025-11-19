# 🚀 Backend - Sistema de Autenticação Finanças Fácil

Backend completo com autenticação JWT, envio de e-mails e painel administrativo.

## 📋 Funcionalidades

✅ Registro de usuários com senha automática
✅ Envio de e-mail de boas-vindas
✅ Login seguro com JWT
✅ Obrigatório trocar senha no primeiro acesso
✅ Senhas com hash bcrypt
✅ Painel administrativo
✅ Perfis isolados por usuário
✅ Rate limiting para proteção contra ataques

## 🔧 Instalação

1. Entre na pasta do servidor:
```bash
cd server
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

### 📧 Configuração do Gmail

Para enviar e-mails, você precisa:

1. Ativar a verificação em duas etapas na sua conta Google
2. Gerar uma "Senha de app" em: https://myaccount.google.com/apppasswords
3. Usar essa senha no `EMAIL_PASS` do arquivo `.env`

## ▶️ Execução

### Modo Desenvolvimento:
```bash
npm run dev
```

### Modo Produção:
```bash
npm start
```

O servidor estará rodando em `http://localhost:5000`

## 📚 Rotas da API

### Autenticação (`/api/auth`)

#### POST `/api/auth/registrar`
Registra novo usuário
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
  "senha": "senha123"
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

### Admin (`/api/admin`)

#### GET `/api/admin/estatisticas`
Retorna estatísticas do sistema (requer token admin)

#### GET `/api/admin/usuarios`
Lista todos os usuários (requer token admin)

### Usuário (`/api/user`)

#### GET `/api/user/perfil`
Retorna perfil do usuário (requer token)

#### GET `/api/user/dados`
Retorna dados do usuário (requer token)

#### POST `/api/user/dados`
Salva dados do usuário (requer token)

## 🔐 Credenciais Padrão

**Administrador:**
- Usuário: `admin`
- Senha: `admin` (deve ser alterada no primeiro acesso)

## 📁 Estrutura de Arquivos

```
server/
├── controllers/      # Lógica de negócio
├── middleware/       # Middlewares (auth, etc)
├── routes/          # Definição de rotas
├── utils/           # Utilitários (email, db, jwt)
├── data/            # Banco de dados JSON
├── .env.example     # Exemplo de variáveis
├── .env             # Variáveis (não versionar)
├── server.js        # Arquivo principal
└── package.json     # Dependências
```

## 🛡️ Segurança

- Senhas com hash bcrypt (10 rounds)
- JWT com expiração configurável
- Rate limiting (100 req/15min geral, 5 req/15min para login)
- Validação de força de senha
- Headers CORS configurados

## 🐛 Troubleshooting

### Erro ao enviar e-mail
- Verifique se ativou a verificação em duas etapas
- Certifique-se de estar usando uma "Senha de app"
- Confirme que o EMAIL_USER e EMAIL_PASS estão corretos

### Porta já em uso
- Altere a variável PORT no .env
- Ou mate o processo: `npx kill-port 5000`

### Dependências não instaladas
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas

- O banco de dados é em JSON (para produção, migre para PostgreSQL/MongoDB)
- Em desenvolvimento, a senha temporária é retornada na resposta do registro
- Em produção, remova o retorno da senha temporária
