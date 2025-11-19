## Diagnóstico
- Endpoint incorreto no frontend: `api.get('/api/user/dados')` → baseURL já inclui `/api`, resultando em `.../api/api/user/dados` e 404.
- Falta de token JWT: o interceptor adiciona `Authorization` a partir de `localStorage.getItem('token')`, mas o Login usado (`src/components/auth/Login.jsx`) não chama o backend nem salva `token`, causando 401 "Token não fornecido".
- Backend está correto nas rotas: `server/server.js` monta `/api/user` e `server/routes/user.js:7` protege `/dados` com `verificarToken`. Controlador retorna `{ sucesso: true, dados }` (`server/controllers/userController.js:16`).

## Correções no Frontend
1. Corrigir rota no Dashboard
- Arquivo: `src/pages/Dashboard.jsx`
- Trocar `api.get('/api/user/dados')` por `api.get('/user/dados')` para evitar `/api/api/...`.

2. Garantir presença de token antes de carregar dados
- No `useEffect`, verificar `localStorage.getItem('token')`. Se não existir, não chamar `loadData`, exibir aviso e redirecionar para Login.
- No `catch` do `loadData`, tratar 401/403: mostrar mensagem amigável e redirecionar.

3. Unificar fluxo de login para gerar token
- Atualizar `src/components/auth/Login.jsx` para usar o backend via `useAuth().login(email, senha)` (em `src/contexts/AuthContext.jsx:29-69`) que:
  - Chama `POST /api/auth/login`.
  - Salva `localStorage.setItem('token', data.token)` e `localStorage.setItem('usuario', JSON.stringify(data.user))`.
- Remover a lógica de autenticação por `USUARIOS`/`SESSION` local que não emite JWT.

4. Melhorar UX do Dashboard
- Exibir estado "carregando" enquanto busca.
- Exibir mensagem "Faça login para visualizar seus dados" quando não houver token.
- Manter `receitas`/`despesas` como arrays vazios somente após erro não-autorizado tratado.

## Ajustes opcionais no Backend (higienização)
- Padronizar chaves de resposta do `userController` para `{ success, message, dados }` (hoje usa `{ sucesso, mensagem }`), alinhando com `authController` e o middleware.
- Se fizer a padronização, ajustar `src/services/api.js` (`handleResponse` usa `response.data.sucesso`). Como o Dashboard acessa `response.data.dados` diretamente, a correção não é bloqueante.

## Verificação
- Realizar login por `AuthContext` e confirmar `localStorage.token`.
- Testar `GET /api/user/dados` pelo Dashboard após correção da rota.
- Confirmar que os totais e gráficos populam com dados do arquivo `server/utils/database.js` → `buscarDadosUsuario(userId)`.

## Referências de código
- `src/services/api.js:4-11, 13-21` (baseURL e interceptor)
- `src/pages/Dashboard.jsx` (função `loadData` com a rota)
- `server/server.js:18-21` (montagem das rotas `/api/...`)
- `server/routes/user.js:6-8` (endpoints de usuário)
- `server/controllers/userController.js:12-20` (retorno de dados)
- `server/middleware/auth.js:8-22, 31-41` (validação do token)
- `src/contexts/AuthContext.jsx:29-69` (login via backend)
- `src/components/auth/Login.jsx:56-108` (login local que não gera token)

## Entregáveis
- Ajuste no Dashboard para rota correta e checagem de token.
- Atualização do Login para usar backend e salvar JWT.
- Tratamento de erro/UX no Dashboard.
- (Opcional) Padronização de respostas no backend.

Confirma aplicar estas alterações? 