# 📌 REFERÊNCIA RÁPIDA

## 🚀 COMANDOS ESSENCIAIS

### Instalação (1x apenas)
```bash
setup.bat                    # Instala tudo automaticamente
```

### Iniciar Sistema
```bash
start-tudo.bat              # Inicia backend + frontend
```

### Iniciar Separadamente
```bash
start-backend.bat           # Só o backend
start-frontend.bat          # Só o frontend
```

---

## 🔑 CREDENCIAIS

### Admin
```
Usuário: admin
Senha: admin
(Deve alterar no primeiro acesso)
```

### Novos Usuários
```
Cadastro em: /cadastro
Senha enviada por e-mail
Ou veja no console do backend
```

---

## 🌐 URLs

```
Frontend:  http://localhost:5173
Backend:   http://localhost:5000
API Test:  http://localhost:5000/api/health
```

---

## 📂 ARQUIVOS IMPORTANTES

### Configuração
```
server/.env                 # Config backend (EMAIL, JWT)
src/main.jsx               # ALTERAR para AppNovo
.env                       # Config frontend (API URL)
```

### Documentação
```
COMECE_AQUI.md            # Guia completo
INSTALACAO_RAPIDA.md      # Setup 5 min
CHECKLIST.md              # Checklist interativo
```

---

## 🔧 API ENDPOINTS

### Auth
```
POST   /api/auth/registrar         # Cadastrar
POST   /api/auth/login              # Login
POST   /api/auth/alterar-senha      # Alterar senha
GET    /api/auth/verificar          # Verificar token
```

### Admin
```
GET    /api/admin/estatisticas      # Stats
GET    /api/admin/usuarios          # Lista users
```

### User
```
GET    /api/user/perfil             # Perfil
GET    /api/user/dados              # Dados
POST   /api/user/dados              # Salvar
```

---

## 🐛 PROBLEMAS COMUNS

### Backend não inicia
```bash
cd server
rm -rf node_modules
npm install
```

### Frontend erro
```bash
# Verifique src/main.jsx
# Deve importar AppNovo
```

### E-mail não envia
```
Normal! Veja senha no console
Ou configure Gmail em server/.env
```

### Porta em uso
```env
# Altere em server/.env
PORT=5001
```

---

## 📖 ESTRUTURA

```
server/           → Backend (Node.js)
src/              → Frontend (React)
  ├── components/auth/   → Telas login/cadastro
  ├── contexts/          → AuthContext
  ├── services/          → API
  └── pages/admin/       → Painel admin
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Dependências instaladas
- [ ] server/.env configurado
- [ ] src/main.jsx alterado
- [ ] Backend rodando (porta 5000)
- [ ] Frontend rodando (porta 5173)
- [ ] Login funcionando
- [ ] Cadastro funcionando

---

## 💡 DICAS

1. Use `start-tudo.bat` para facilitar
2. Console do backend mostra senhas em dev
3. F12 no navegador para debug
4. Leia `COMECE_AQUI.md` para detalhes
5. Admin: admin/admin (alterar depois)

---

## 🎯 FLUXO BÁSICO

```
1. Cadastro → Senha por email
2. Login → Alterar senha
3. Dashboard → Usar sistema
4. Admin → Ver estatísticas
5. Logout → Seguro
```

---

## 🔐 SEGURANÇA

```
✓ Senhas com bcrypt
✓ Tokens JWT
✓ Rate limiting
✓ Validação de senha forte
✓ Perfis isolados
```

---

## 📞 AJUDA

```
Documentação: COMECE_AQUI.md
Técnica: AUTENTICACAO_README.md
Rápida: INSTALACAO_RAPIDA.md
Estrutura: ESTRUTURA_COMPLETA.md
```

---

**Versão:** 2.0.0
**Status:** ✅ Pronto para uso
