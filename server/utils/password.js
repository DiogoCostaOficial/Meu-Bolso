const bcrypt = require('bcryptjs');

const gerarSenhaAleatoria = (tamanho = 12) => {
  const maiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minusculas = 'abcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const especiais = '!@#$%&*';

  const todosCaracteres = maiusculas + minusculas + numeros + especiais;

  let senha = '';

  senha += maiusculas[Math.floor(Math.random() * maiusculas.length)];
  senha += minusculas[Math.floor(Math.random() * minusculas.length)];
  senha += numeros[Math.floor(Math.random() * numeros.length)];
  senha += especiais[Math.floor(Math.random() * especiais.length)];

  for (let i = senha.length; i < tamanho; i++) {
    senha += todosCaracteres[Math.floor(Math.random() * todosCaracteres.length)];
  }

  return senha.split('').sort(() => Math.random() - 0.5).join('');
};

const validarForcaSenha = (senha) => {
  const resultado = {
    valida: true,
    erros: []
  };

  if (senha.length < 8) {
    resultado.valida = false;
    resultado.erros.push('A senha deve ter no mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(senha)) {
    resultado.valida = false;
    resultado.erros.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(senha)) {
    resultado.valida = false;
    resultado.erros.push('A senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(senha)) {
    resultado.valida = false;
    resultado.erros.push('A senha deve conter pelo menos um número');
  }

  if (!/[!@#$%&*]/.test(senha)) {
    resultado.valida = false;
    resultado.erros.push('A senha deve conter pelo menos um caractere especial (!@#$%&*)');
  }

  return resultado;
};

const hashSenha = async (senha) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(senha, salt);
};

const compararSenha = async (senha, hash) => {
  return await bcrypt.compare(senha, hash);
};

module.exports = {
  gerarSenhaAleatoria,
  validarForcaSenha,
  hashSenha,
  compararSenha
};
