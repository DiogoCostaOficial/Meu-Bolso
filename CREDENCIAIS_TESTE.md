# 🔐 CREDENCIAIS DE TESTE

## 👤 Usuário de Teste Criado

### Informações de Acesso

```
📧 E-mail: diogo.grunge@gmail.com
🔑 Senha:  Teste@2025
```

---

## 🚀 COMO USAR

### Opção 1: Script Automático (Recomendado)

```bash
# Execute na raiz do projeto:
criar-usuario-teste.bat
```

Isso irá:
- ✅ Criar o usuário no banco de dados
- ✅ Gerar senha criptografada (bcrypt)
- ✅ Marcar como primeiro acesso
- ✅ Mostrar as credenciais

### Opção 2: Manual

```bash
cd server
node scripts/criar-usuario-teste.js
```

---

## 📝 FLUXO DE TESTE COMPLETO

### 1️⃣ Criar Usuário
```bash
criar-usuario-teste.bat
```

### 2️⃣ Iniciar Sistema
```bash
start-tudo.bat
```

### 3️⃣ Fazer Login
```
URL: http://localhost:5173/login

E-mail: diogo.grunge@gmail.com
Senha: Teste@2025
```

### 4️⃣ Alterar Senha (Obrigatório)
```
O sistema irá FORÇAR você a alterar a senha.

Requisitos da nova senha:
✓ Mínimo 8 caracteres
✓ 1 letra maiúscula
✓ 1 letra minúscula
✓ 1 número
✓ 1 caractere especial (!@#$%&*)

Sugestão: Diogo@2025
```

### 5️⃣ Acessar Sistema
```
Após alterar a senha, você terá acesso completo ao sistema!
```

---

## 🧪 TESTES SUGERIDOS

### ✅ Teste 1: Login e Alteração de Senha
```
1. Login com Teste@2025
2. Forçado a alterar senha
3. Criar nova senha forte
4. Confirmar senha
5. Acessar dashboard
```

### ✅ Teste 2: Perfil Isolado
```
1. Adicione receitas e despesas
2. Faça logout
3. Login como admin
4. Acesse Painel Admin
5. Veja que admin NÃO vê seus dados financeiros
6. Admin vê apenas: nome, email, último acesso
```

### ✅ Teste 3: Logout e Re-login
```
1. Faça logout
2. Tente acessar /dashboard diretamente
3. Sistema deve redirecionar para /login
4. Faça login novamente
5. Acesse dashboard normalmente
```

### ✅ Teste 4: Validação de Senha
```
1. Tente alterar senha para: "123"
2. Sistema deve rejeitar (senha fraca)
3. Tente: "senha123"
4. Sistema deve rejeitar (falta maiúscula e especial)
5. Use: "Senha@123"
6. Sistema deve aceitar ✓
```

---

## 👨‍💼 TESTE COMO ADMIN

Além do usuário de teste, você pode testar como admin:

```
E-mail: admin
Senha: admin
(Alterar no primeiro acesso)
```

**Painel Admin permite:**
- Ver total de usuários
- Ver usuários ativos
- Ver último acesso de cada usuário
- **NÃO** ver dados financeiros

---

## 🔄 RESETAR USUÁRIO

Se quiser resetar o usuário de teste:

```bash
# Execute novamente:
criar-usuario-teste.bat

# Isso irá:
# - Resetar a senha para: Teste@2025
# - Marcar como primeiro acesso novamente
# - Manter o ID e histórico
```

---

## 🗑️ REMOVER USUÁRIO

Para remover o usuário de teste:

1. Abra: `server/data/database.json`
2. Remova o objeto do usuário do array `usuarios`
3. Salve o arquivo
4. Reinicie o backend

Ou execute novamente o script que ele vai sobrescrever.

---

## 📊 VERIFICAR BANCO DE DADOS

Para ver o usuário no banco:

```bash
# Abra o arquivo:
server/data/database.json

# Procure por:
"email": "diogo.grunge@gmail.com"
```

---

## 🎯 CENÁRIOS DE TESTE

### Cenário 1: Novo Usuário Completo
```
1. Criar usuário (script)
2. Login
3. Alterar senha
4. Adicionar receitas
5. Adicionar despesas
6. Ver relatórios
7. Exportar dados
8. Fazer backup
9. Logout
```

### Cenário 2: Segurança
```
1. Login
2. Copie o token do localStorage (F12)
3. Faça logout
4. Tente usar o token antigo
5. Deve ser redirecionado para login
```

### Cenário 3: Perfis Isolados
```
1. Login como teste (diogo.grunge@gmail.com)
2. Adicione 3 receitas
3. Logout
4. Login como admin
5. Verifique que admin NÃO vê as receitas
6. Admin vê apenas estatísticas
```

---

## ⚠️ IMPORTANTE

### Segurança
- ✅ Senha criptografada com bcrypt
- ✅ Token JWT com expiração
- ✅ Primeiro acesso obrigatório
- ✅ Validação de senha forte

### Dados
- ✅ Perfil isolado
- ✅ Dados salvos em `USER_DATA_[id].json`
- ✅ Admin não acessa dados

### E-mail
- ❌ Script NÃO envia e-mail
- ℹ️ E-mail só é enviado via cadastro normal
- ℹ️ Para teste, use o script que já cria com senha

---

## 💡 DICAS

1. **Use o script** - Muito mais rápido que cadastro normal
2. **Anote a senha** - Teste@2025 (depois Diogo@2025)
3. **Teste tudo** - Login, logout, perfis, admin
4. **F12 sempre** - Console do navegador mostra erros
5. **Backend logs** - Terminal mostra requisições

---

## 🎉 PRONTO PARA TESTAR!

Execute:
```bash
criar-usuario-teste.bat
```

E comece seus testes com:
```
E-mail: diogo.grunge@gmail.com
Senha: Teste@2025
```

**Boa sorte! 🚀**
