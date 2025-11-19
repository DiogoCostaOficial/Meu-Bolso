## Objetivo
- Permitir cadastro de novos usuários com verificação via OTP por e-mail.
- Corrigir a falha `ERR_CONNECTION_RESET` ao registrar.

## Causas
- O `nodemon` reinicia o servidor quando o arquivo `server/data/database.json` é escrito durante o cadastro, causando `net::ERR_CONNECTION_RESET`.
- O backend hoje cadastra e já retorna token sem exigir verificação OTP; login não bloqueia usuários não verificados.
- O frontend possui página `ValidarOTP.jsx`, mas o contexto de auth não implementa `validateOTP/resendOTP` e o router ainda não tem a rota.

## Plano técnico
1. Evitar reinício do servidor ao gravar dados:
- Adicionar `nodemon.json` ignorando `server/data/**/*.json` para evitar restart.
2. Backend – Fluxo OTP:
- Em `authController.registrar`: criar usuário com `verificado=false`, gerar `otpCodigo` (6 dígitos) e `otpExpira` (+10 min); enviar código com `enviarCodigoOTP`; não retornar token; retornar mensagem orientando validação.
- Em `authController.login`: bloquear login se `verificado=false` com `403`.
- Criar endpoints:
  - `POST /api/auth/validar-otp` → valida código e, se ok, marca `verificado=true`, limpa OTP, gera token e retorna `{ token, user }`.
  - `POST /api/auth/reenviar-otp` → gera novo código, atualiza validade e reenvia.
3. Frontend – Integração OTP:
- `AuthContext`:
  - ajustar `register` para não guardar `token/user` e retornar `{ success:true, email }`.
  - implementar `validateOTP(email, codigo)`, salvando `token/user` ao validar.
  - implementar `resendOTP(email)`.
- `AppNovo.jsx`: adicionar rota `/validar-otp` para `ValidarOTP`.
- `CadastroNovo.jsx`: após sucesso, navegar para `/validar-otp` com `state: { email }`.

## Verificação
- Reiniciar servidor (com nodemon respeitando ignore).
- Cadastrar novo usuário e observar resposta de sucesso sem reset.
- Validar OTP e receber token; realizar login.

## Observações
- Se `EMAIL_USER/EMAIL_PASS` não estiverem configurados, o envio pode falhar; o backend continuará sem reiniciar. Podemos exibir mensagem informativa e permitir reenviar após configurar as credenciais.

Confirma que posso aplicar as mudanças e testar o cadastro com OTP agora?