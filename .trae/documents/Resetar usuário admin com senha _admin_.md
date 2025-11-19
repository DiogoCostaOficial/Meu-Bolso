## Objetivo
- Criar/atualizar o usuário administrador para permitir login com `email: admin@admin.com` e `senha: admin`, sem fluxo de OTP.

## Diagnóstico atual
- Login é processado em `server/controllers/authController.js:86–145` e usa `bcrypt` para comparar senha.
- Endpoints de autenticação estão em `server/routes/auth.js:8–12` e o servidor expõe `/api/auth/login` e `/api/auth/registrar`.
- O banco é um arquivo JSON em `server/data/database.json` consumido via utilitário em `server/utils/database.js`.

## Plano técnico
1. Criar um script one‑off `server/scripts/resetAdmin.js` que:
- Carrega `server/data/database.json`.
- Busca um usuário com `tipo === 'admin'` ou `email === 'admin@admin.com'`.
- Se existir, atualiza os campos: `senha` (hash `bcrypt` de `'admin'`), `ativo: true`, `primeiroAcesso: false`.
- Se não existir, insere um novo registro com: `id: 'admin-001'`, `nome: 'Administrador'`, `email: 'admin@admin.com'`, `senha: <hash bcrypt de 'admin'>`, `tipo: 'admin'`, `ativo: true`, `primeiroAcesso: false`, `dataCriacao` atual.
- Persiste no JSON e loga resultado.
2. Não alterar fluxo de OTP; o login não depende dele.
3. Adicionar um comando NPM temporário `"reset-admin": "node scripts/resetAdmin.js"` no `server/package.json` para execução simples.

## Verificação
- Executar o script de reset.
- Testar POST `http://localhost:5000/api/auth/login` com body `{ "email": "admin@admin.com", "senha": "admin" }`.
- Confirmar resposta `success: true` e presença de `token`.
- Validar login via frontend na rota `/login` com as mesmas credenciais.

## Segurança
- O script é utilitário interno, não expõe endpoint público.
- Remover o script após o uso ou deixá-lo protegido (ex.: só executável em desenvolvimento).

## Rollback
- Se necessário, restaurar `server/data/database.json` da cópia anterior (criada pelo script) para desfazer a mudança.

Confirma que posso implementar o script e rodar o reset agora?