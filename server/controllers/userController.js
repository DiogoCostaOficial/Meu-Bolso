const db = require('../utils/database');

const obterPerfil = (req, res) => {
  try {
    const dados = req.usuario;
    res.json({ success: true, message: '', data: dados, sucesso: true, mensagem: '', dados });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao obter perfil', sucesso: false, mensagem: 'Erro ao obter perfil' });
  }
};

const obterDados = (req, res) => {
  try {
    const userId = req.usuario.id;
    const dados = db.buscarDadosUsuario(userId);
    res.json({ success: true, message: '', data: dados, sucesso: true, mensagem: '', dados });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao obter dados', sucesso: false, mensagem: 'Erro ao obter dados' });
  }
};

const salvarDados = (req, res) => {
  try {
    const userId = req.usuario.id;
    const dados = req.body && req.body.dados ? req.body.dados : req.body;
    if (!dados || typeof dados !== 'object') {
      return res.status(400).json({ success: false, message: 'Dados inválidos fornecidos', sucesso: false, mensagem: 'Dados inválidos fornecidos' });
    }
    if (dados.receitas && !Array.isArray(dados.receitas)) {
      dados.receitas = [];
    }
    if (dados.despesas && !Array.isArray(dados.despesas)) {
      dados.despesas = [];
    }
    const ok = db.salvarDadosUsuario(userId, dados);
    if (!ok) {
      return res.status(500).json({ success: false, message: 'Erro ao salvar dados', sucesso: false, mensagem: 'Erro ao salvar dados' });
    }
    res.json({ success: true, message: 'Dados salvos com sucesso', data: dados, sucesso: true, mensagem: 'Dados salvos com sucesso', dados });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao salvar dados', sucesso: false, mensagem: 'Erro ao salvar dados' });
  }
};

module.exports = {
  obterPerfil,
  obterDados,
  salvarDados
};
