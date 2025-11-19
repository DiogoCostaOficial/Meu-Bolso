// src/components/utils/validations.js

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarTelefone = (telefone) => {
  const regex = /^\d{9,}$/;
  const apenasNumeros = telefone.replace(/\D/g, '');
  return regex.test(apenasNumeros);
};

export const validarSenha = (senha) => {
  return senha.length >= 6;
};

export const formatarTelefone = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};
