// server/utils/otp.js
const crypto = require('crypto');

// Armazena OTPs temporários em memória (em produção, use Redis)
const otpStore = new Map();

// Gera código OTP de 6 dígitos
const gerarCodigoOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Salva OTP com expiração de 10 minutos
const salvarOTP = (userId, codigo) => {
  const expiracao = Date.now() + 10 * 60 * 1000; // 10 minutos

  otpStore.set(userId, {
    codigo,
    expiracao,
    tentativas: 0,
    criadoEm: new Date().toISOString()
  });

  console.log(`📝 OTP salvo para usuário ${userId}: ${codigo} (expira em 10 min)`);
  return codigo;
};

// Valida código OTP
const validarOTP = (userId, codigoInformado) => {
  const otpData = otpStore.get(userId);

  if (!otpData) {
    return {
      valido: false,
      mensagem: 'Código não encontrado. Solicite um novo código.'
    };
  }

  // Verifica expiração
  if (Date.now() > otpData.expiracao) {
    otpStore.delete(userId);
    return {
      valido: false,
      mensagem: 'Código expirado. Solicite um novo código.'
    };
  }

  // Incrementa tentativas
  otpData.tentativas++;

  // Limite de 5 tentativas
  if (otpData.tentativas > 5) {
    otpStore.delete(userId);
    return {
      valido: false,
      mensagem: 'Número máximo de tentativas excedido. Solicite um novo código.'
    };
  }

  // Valida código
  if (otpData.codigo === codigoInformado) {
    otpStore.delete(userId); // Remove OTP após validação bem-sucedida
    return {
      valido: true,
      mensagem: 'Código validado com sucesso!'
    };
  }

  return {
    valido: false,
    mensagem: `Código inválido. Tentativa ${otpData.tentativas} de 5.`,
    tentativasRestantes: 5 - otpData.tentativas
  };
};

// Remove OTP (usado para reenvio)
const removerOTP = (userId) => {
  const removido = otpStore.delete(userId);
  if (removido) {
    console.log(`🗑️ OTP removido para usuário ${userId}`);
  }
  return removido;
};

// Verifica se existe OTP ativo
const existeOTP = (userId) => {
  const otpData = otpStore.get(userId);

  if (!otpData) return false;

  // Verifica se ainda não expirou
  if (Date.now() > otpData.expiracao) {
    otpStore.delete(userId);
    return false;
  }

  return true;
};

// Obtém informações do OTP (para debug)
const obterInfoOTP = (userId) => {
  const otpData = otpStore.get(userId);

  if (!otpData) return null;

  const tempoRestante = Math.max(0, Math.floor((otpData.expiracao - Date.now()) / 1000));

  return {
    existe: true,
    tentativas: otpData.tentativas,
    tempoRestanteSegundos: tempoRestante,
    criadoEm: otpData.criadoEm
  };
};

// Limpa OTPs expirados (executar periodicamente)
const limparOTPsExpirados = () => {
  const agora = Date.now();
  let removidos = 0;

  for (const [userId, otpData] of otpStore.entries()) {
    if (agora > otpData.expiracao) {
      otpStore.delete(userId);
      removidos++;
    }
  }

  if (removidos > 0) {
    console.log(`🧹 ${removidos} OTP(s) expirado(s) removido(s)`);
  }

  return removidos;
};

// Executa limpeza a cada 5 minutos
setInterval(limparOTPsExpirados, 5 * 60 * 1000);

module.exports = {
  gerarCodigoOTP,
  salvarOTP,
  validarOTP,
  removerOTP,
  existeOTP,
  obterInfoOTP,
  limparOTPsExpirados
};
