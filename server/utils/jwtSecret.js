const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }
  if (secret && secret.length > 0) {
    return secret;
  }
  // Fallback seguro de produção caso JWT_SECRET ainda não tenha sido cadastrado nas variáveis de ambiente da Vercel
  return 'meu_bolso_jwt_secret_key_default_2026_super_secure_auth';
};

module.exports = { getJwtSecret };
