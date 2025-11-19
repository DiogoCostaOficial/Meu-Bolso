// server/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Remove "Bearer " do token se existir
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // Verifica se o token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production');

    // Adiciona dados do usuário na requisição
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo,
      nome: decoded.nome
    };

    // Continua para a próxima função
    next();

  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);

    // Token expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente.'
      });
    }

    // Token inválido
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Outros erros
    return res.status(401).json({
      success: false,
      message: 'Erro ao verificar autenticação'
    });
  }
};

// Middleware para verificar se é admin
const verificarAdmin = (req, res, next) => {
  try {
    // Verifica se o usuário foi autenticado
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Verifica se é admin
    if (req.usuario.tipo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
      });
    }

    // Continua para a próxima função
    next();

  } catch (error) {
    console.error('❌ Erro ao verificar admin:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões'
    });
  }
};

// Middleware opcional - verifica token mas não bloqueia se não houver
const verificarTokenOpcional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.usuario = null;
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      req.usuario = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo,
      nome: decoded.nome
    };

    next();

  } catch (error) {
    // Se houver erro, apenas continua sem usuário
    req.usuario = null;
    next();
  }
};

// Exporta os middlewares
module.exports = {
  verificarToken,
  verificarAdmin,
  verificarTokenOpcional
};
