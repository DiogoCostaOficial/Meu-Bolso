# 🚨 SOLUÇÃO DEFINITIVA - Senha Atual Incorreta

## O PROBLEMA PERSISTE

Mesmo usando `Teste@2025`, o sistema continua dizendo que a senha está incorreta.

---

## ✅ SOLUÇÃO DEFINITIVA (SIGA EXATAMENTE)

### PASSO 1: Feche TUDO

```
1. Feche o navegador completamente
2. No terminal do backend: Ctrl+C (parar)
3. No terminal do frontend: Ctrl+C (parar)
```

---

### PASSO 2: Execute o Reset Forçado

```bash
resetar-senha-forcado.bat
```

Isso vai:
- ✅ Gerar um NOVO hash para senha `Teste@2025`
- ✅ Testar se o hash está correto
- ✅ Salvar no banco de dados
- ✅ Verificar se salvou corretamente

---

### PASSO 3: Reinicie o Backend

```bash
cd server
npm run dev
```

**AGUARDE** até ver a mensagem:
```
🚀 Servidor rodando na porta 5000
```

---

### PASSO 4: Reinicie o Frontend

Em outro terminal:

```bash
npm run dev
```

**AGUARDE** até ver:
```
Local: http://localhost:5173
```

---

### PASSO 5: Limpe COMPLETAMENTE o Navegador

```
1. Abra: http://localhost:5173
2. Pressione F12 (DevTools)
3. Vá na aba "Application" (ou "Aplicação")
4. Clique em "Clear storage" (ou "Limpar armazenamento")
5. Clique no botão "Clear site data"
6. Feche o DevTools (F12)
7. Recarregue a página (Ctrl + Shift + R)
```

**OU** no Console (F12 → Console):
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

### PASSO 6: Faça Login DO ZERO

```
E-mail: diogo.grunge@gmail.com
Senha: Teste@2025
```

---

### PASSO 7: Tela de Alteração de Senha

Agora você deve conseguir:

```
Senha Temporária (Atual): Teste@2025
Nova Senha: Diogo@2025
Confirmar Nova Senha: Diogo@2025
```

**Clique em "Alterar Senha"**

---

## 🔍 SE AINDA NÃO FUNCIONAR

### Verifique o Terminal do Backend

Quando você clicar em "Alterar Senha", deve aparecer:

```
🔐 Alteração de senha solicitada:
   User ID: ...
   User Tipo: usuario
   Senha Atual fornecida: SIM
   Nova Senha fornecida: SIM
   Primeiro Acesso: true
   Senha atual válida: true  ← DEVE SER TRUE!
✅ Senha do usuário atualizada
```

Se aparecer `Senha atual válida: false`, **TIRE PRINT** e me mostre!

---

## 🆘 SOLUÇÃO ALTERNATIVA

Se NADA funcionar, vamos usar um e-mail diferente:

### 1. Cadastro Normal

```
1. Vá para: http://localhost:5173/cadastro
2. Nome: Diogo Teste
3. E-mail: diogo.teste@gmail.com (DIFERENTE!)
4. Clique em "Criar Conta"
5. Veja a senha no CONSOLE DO BACKEND
6. Anote a senha
7. Faça login com essa senha
8. Altere para a senha que quiser
```

---

## 📊 CHECKLIST COMPLETO

Execute NA ORDEM:

- [ ] 1. Fechar navegador
- [ ] 2. Parar backend (Ctrl+C)
- [ ] 3. Parar frontend (Ctrl+C)
- [ ] 4. Executar: `resetar-senha-forcado.bat`
- [ ] 5. Aguardar mensagem de sucesso
- [ ] 6. Iniciar backend: `cd server && npm run dev`
- [ ] 7. Aguardar: "Servidor rodando"
- [ ] 8. Iniciar frontend: `npm run dev`
- [ ] 9. Aguardar: "Local: http://localhost:5173"
- [ ] 10. Abrir navegador NOVO (ou aba anônima)
- [ ] 11. Ir para: http://localhost:5173
- [ ] 12. F12 → Console → `localStorage.clear()`
- [ ] 13. Recarregar: Ctrl+Shift+R
- [ ] 14. Login: diogo.grunge@gmail.com
- [ ] 15. Senha: Teste@2025
- [ ] 16. Clicar "Entrar"
- [ ] 17. Deve ir para tela de alterar senha
- [ ] 18. Senha atual: Teste@2025
- [ ] 19. Nova senha: Diogo@2025
- [ ] 20. Confirmar: Diogo@2025
- [ ] 21. Clicar "Alterar Senha"
- [ ] 22. ✅ SUCESSO!

---

## 🎯 COMANDOS RESUMIDOS

```bash
# 1. Reset forçado
resetar-senha-forcado.bat

# 2. Reiniciar backend
cd server
npm run dev

# 3. Reiniciar frontend (outro terminal)
npm run dev

# 4. No navegador (F12 → Console)
localStorage.clear()
location.reload()

# 5. Login
# E-mail: diogo.grunge@gmail.com
# Senha: Teste@2025
```

---

## 💡 DICA IMPORTANTE

O problema pode ser:
1. **Cache do navegador** - Por isso limpar tudo
2. **Backend não reiniciado** - Por isso parar e iniciar
3. **Token antigo** - Por isso limpar localStorage
4. **Hash antigo no banco** - Por isso o reset forçado

O script `resetar-senha-forcado.bat` resolve TODOS esses problemas!

---

## ✅ EXECUTE AGORA

```bash
resetar-senha-forcado.bat
```

E siga o CHECKLIST acima exatamente!

---

**IMPORTANTE:** Depois de executar o script, você DEVE:
1. Reiniciar backend
2. Limpar navegador
3. Login do zero

NÃO pule nenhum passo! 🎯
