# 🚀 GUIA RÁPIDO DE INSTALAÇÃO

## ⚡ Start em 5 Minutos

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

**Edite `server/.env`:**
```env
JWT_SECRET=minha_chave_secreta_123456
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

**Configure o Gmail:**
1. https://myaccount.google.com/security → Ative verificação em 2 etapas
2. https://myaccount.google.com/apppasswords → Gere senha de app
3. Use a senha gerada no `EMAIL_PASS`

**Inicie o backend:**
```bash
npm run dev
```

✅ Backend rodando em `http://localhost:5000`

---

### 2. Frontend

**Na raiz do projeto, edite `src/main.jsx`:**

Altere a linha 3:
```javascript
// De:
import App from './App.jsx'

// Para:
import App from './AppNovo.jsx'
```

**Inicie o frontend:**
```bash
npm run dev
```

✅ Frontend rodando em `http://localhost:5173`

---

## 🎯 Primeiro Acesso

### Como Admin:
1. Acesse: http://localhost:5173/login
2. Usuário: `admin`
3. Senha: `admin`
4. Altere a senha (obrigatório)
5. Acesse "Painel Admin" no menu

### Como Novo Usuário:
1. Acesse: http://localhost:5173/cadastro
2. Preencha nome e e-mail
3. Senha será enviada por e-mail (ou veja no console do backend em modo dev)
4. Faça login e altere a senha

---

## 📋 Checklist

- [ ] Backend instalado e rodando
- [ ] Frontend instalado e rodando
- [ ] Gmail configurado (opcional para testes)
- [ ] Arquivo `main.jsx` atualizado
- [ ] Login funcionando
- [ ] Cadastro funcionando
- [ ] Painel admin acessível

---

## ⚠️ Problemas Comuns

**Backend não inicia:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

**Frontend não conecta:**
- Verifique se o backend está rodando na porta 5000
- Confirme o arquivo `.env` na raiz: `VITE_API_URL=http://localhost:5000/api`

**E-mail não envia:**
- Normal! Em dev, a senha aparece no console do backend
- Para produção, configure o Gmail corretamente

---

## 📖 Documentação Completa

Veja `AUTENTICACAO_README.md` para documentação detalhada.

---

**Pronto! Seu sistema está configurado! 🎉**
