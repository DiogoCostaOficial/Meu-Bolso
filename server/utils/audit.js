// server/utils/audit.js
const db = require('./database');

const registrar = (req, acao, extra = {}) => {
  const usuario = req.usuario || {};
  return db
    .registrarAuditoria({
      atorId: extra.atorId || usuario.id || null,
      atorTipo: extra.atorTipo || usuario.tipo || null,
      acao,
      alvoId: extra.alvoId || null,
      ip: req.ip,
      detalhes: extra.detalhes || {}
    })
    .catch(() => false);
};

// Middleware: registra toda ação administrativa (quem, o quê, quando, de onde).
const auditarAdmin = (req, res, next) => {
  res.on('finish', () => {
    const rota = `${req.baseUrl}${req.route ? req.route.path : req.path}`;
    registrar(req, `admin:${req.method} ${rota}`, {
      alvoId: req.params && req.params.id ? String(req.params.id) : null,
      detalhes: { status: res.statusCode }
    });
  });
  next();
};

module.exports = { registrar, auditarAdmin };
