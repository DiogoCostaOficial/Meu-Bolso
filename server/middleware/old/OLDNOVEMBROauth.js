import { verificarToken } from '../utils/jwt.js';
import { buscarUsuarioPorId, buscarUsuarioPorEmail } from '../utils/database.js';

/**
 * Middleware para verificar se o usuário está autenticado
 */
export const autenticar = async (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token não fornecido'
      });
    }
    
    // Token vem no formato "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Formato de token inválido'
      });
    }
    
    // Verificar token
    const decoded = verificarToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token inválido ou expirado'
      });
    }
    
    // Buscar usuário
    let usuario;
    if (decoded.tipo === 'admin') {
      const db = await import('../utils/database.js');
      const data = await db.lerDB();
      usuario = data.admin;
    } else {
      usuario = await buscarUsuarioPorId(decoded.id);
    }
    
    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }
    
    // Adicionar usuário ao request
    req.usuario = {
      id: decoded.id || 'admin',
      email: usuario.email,
      nome: usuario.nome,
      tipo: decoded.tipo || 'usuario'
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar autenticação'
    });
  }
};

/**
 * Middleware para verificar se o usuário é admin
 */
export const autenticarAdmin = async (req, res, next) => {
  try {
    // Primeiro verificar autenticação normal
    await autenticar(req, res, () => {});
    
    // Verificar se é admin
    if (req.usuario.tipo !== 'admin') {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Apenas administradores.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro na autenticação admin:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar autenticação'
    });
  }
};

export default {
  autenticar,
  autenticarAdmin
};
