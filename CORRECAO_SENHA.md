# 🔧 CORREÇÃO - Senha Atual Incorreta

## ❌ PROBLEMA

Ao tentar alterar a senha, o sistema diz que a senha atual está incorreta, mesmo estando correta.

---

## ✅ SOLUÇÕES (Tente na ordem)

### SOLUÇÃO 1: Verificar qual é a senha correta

Execute este comando para verificar:

```bash
verificar-senha.bat
```

Isso vai:
- ✅ Mostrar os dados do usuário
- ✅ Testar várias senhas
- ✅ Identificar qual senha está correta

---

### SOLUÇÃO 2: Resetar o usuário

Se a senha não funcionar, execute:

```bash
criar-usuario-teste.bat
```

Isso vai:
- ✅ Resetar a senha para: **Teste@2025**
- ✅ Marcar como primeiro acesso
- ✅ Você poderá fazer login novamente

---

### SOLUÇÃO 3: Reiniciar o Backend

O backend foi atualizado com logs de debug.

```bash
# No terminal do backend:
Ctrl + C  (parar)
npm run dev  (iniciar)
```

Agora quando você tentar alterar a senha, verá logs detalhados no terminal do backend.

---

## 🔍 DEBUG PASSO A PASSO

### 1. Verifique o Terminal do Backend

Quando você clicar em "Alterar Senha", o backend vai mostrar:

```
🔐 Alteração de senha solicitada:
   User ID: ...
   User Tipo: usuario
   Senha Atual fornecida: SIM
   Nova Senha fornecida: SIM
   Primeiro Acesso: true
   Senha atual válida: true/false
```

### 2. Execute o Script de Verificação

```bash
verificar-senha.bat
```

Vai mostrar algo como:

```
✅ Usuário encontrado!

📋 Dados do usuário:
   Nome: Diogo Grunge
   E-mail: diogo.grunge@gmail.com
   Primeiro Acesso: true

🔐 Testando senhas...

   Teste@2025      → ✅ CORRETA
   teste@2025      → ❌ incorreta
   admin           → ❌ incorreta
```

### 3. Use a Senha Correta

Com base no resultado acima, use a senha que apareceu como ✅ CORRETA.

---

## 📝 FLUXO COMPLETO DE CORREÇÃO

```
1. verificar-senha.bat         → Identifica senha correta
2. Anote a senha que está ✅
3. Reinicie o backend
4. Faça login novamente
5. Use a senha identificada
6. Altere para nova senha
```

---

## 🆘 SE NADA FUNCIONAR

### Opção A: Resetar Tudo

```bash
# 1. Pare o backend (Ctrl+C)

# 2. Delete o banco de dados
# Abra: server/data/database.json
# Delete TODO o conteúdo
# Salve o arquivo vazio ou delete o arquivo

# 3. Execute:
criar-usuario-teste.bat

# 4. Reinicie o backend:
cd server
npm run dev

# 5. Faça login com:
# E-mail: diogo.grunge@gmail.com
# Senha: Teste@2025
```

### Opção B: Criar Novo Usuário

Use um e-mail diferente:

```bash
# No navegador, vá para:
http://localhost:5173/cadastro

# Cadastre com:
Nome: Seu Nome
E-mail: outro@email.com

# Veja a senha no console do backend
# Ou no e-mail se configurado
```

---

## 🔐 SENHAS POSSÍVEIS

A senha DEVE ser uma destas:

```
✓ Teste@2025    (mais provável)
✓ teste@2025
✓ Admin@123
✓ admin
```

Execute `verificar-senha.bat` para confirmar.

---

## 💡 DICA IMPORTANTE

Após fazer login, você tem um **token JWT** armazenado.

Se você:
1. Fez login com sucesso
2. Foi redirecionado para alterar senha
3. Mas a senha não funciona

**Pode ser que o usuário no banco seja diferente do token.**

**SOLUÇÃO:**
```
1. Faça LOGOUT (ou limpe o localStorage)
2. Execute: criar-usuario-teste.bat
3. Reinicie o backend
4. Faça login novamente do ZERO
```

---

## 🎯 TESTE AGORA

### Passo 1: Verificar
```bash
verificar-senha.bat
```

### Passo 2: Veja qual senha está correta

### Passo 3: Reinicie backend
```bash
# Terminal do backend:
Ctrl+C
npm run dev
```

### Passo 4: Limpe o navegador
```
F12 → Console → Digite:
localStorage.clear()
Enter

Depois recarregue: F5
```

### Passo 5: Login do zero
```
E-mail: diogo.grunge@gmail.com
Senha: (use a senha identificada no Passo 1)
```

---

## 📊 LOGS DETALHADOS

Agora o backend mostra logs completos. Veja no terminal:

```
🔐 Alteração de senha solicitada:
   User ID: 1234567890
   User Tipo: usuario  
   Senha Atual fornecida: SIM
   Nova Senha fornecida: SIM
   Primeiro Acesso: true
   Senha atual válida: true  ← Deve ser true!
✅ Senha do usuário atualizada
```

Se aparecer `Senha atual válida: false`, então a senha que você digitou está errada.

---

## ✅ CORREÇÃO APLICADA

Arquivos atualizados:
- ✅ `server/controllers/authController.js` - Logs adicionados
- ✅ `server/scripts/verificar-senha.js` - Script de verificação
- ✅ `verificar-senha.bat` - Atalho

---

**Execute `verificar-senha.bat` e veja qual senha está correta!** 🔍
