// server/middleware/security.js
// Cabeçalhos de segurança e limitação de tentativas (sem dependências externas).

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
};

// Limitador em memória por IP + rota. Em ambiente serverless o contador vale por instância.
const createRateLimiter = ({ windowMs, max, message }) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        message: message || 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
      });
    }
    return next();
  };
};

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
const otpLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8 });

module.exports = { securityHeaders, createRateLimiter, authLimiter, otpLimiter };
