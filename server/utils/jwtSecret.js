const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET não configurado (mínimo 16 caracteres). Defina a variável de ambiente.');
  }
  return secret;
};

module.exports = { getJwtSecret };
