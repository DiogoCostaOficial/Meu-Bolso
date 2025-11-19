const db = require('../utils/database');

const obterEstatisticas = (req, res) => {
  try {
    const usuarios = db.getUsuarios();
    const totalUsuarios = usuarios.length;
    const usuariosComAcesso = usuarios.filter(u => !!u.ultimoAcesso).length;
    const usuariosSemAcesso = totalUsuarios - usuariosComAcesso;

    const usuariosOrdenados = [...usuarios].sort((a, b) => {
      if (!a.ultimoAcesso) return 1;
      if (!b.ultimoAcesso) return -1;
      return new Date(b.ultimoAcesso) - new Date(a.ultimoAcesso);
    }).map(u => ({ ...u, tipo: u.tipo || 'usuario' }));

    res.json({
      sucesso: true,
      dados: {
        totalUsuarios,
        usuariosComAcesso,
        usuariosSemAcesso,
        usuarios: usuariosOrdenados
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter estatísticas' });
  }
};

const listarTodosUsuarios = (req, res) => {
  try {
    const usuarios = db.getUsuarios().map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      dataCriacao: u.dataCriacao,
      ultimoAcesso: u.ultimoAcesso,
      primeiroAcesso: u.primeiroAcesso,
      tipo: u.tipo || 'usuario'
    }));
    res.json({ sucesso: true, dados: usuarios });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar usuários' });
  }
};

const buscarUsuarioPorId = (req, res) => {
  try {
    const { id } = req.params;
    const usuario = db.getUsuarios().find(u => u.id === id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }
    res.json({ sucesso: true, dados: usuario });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar usuário' });
  }
};

const atualizarUsuario = (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo } = req.body;

    if (!nome || !email || !tipo) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome, e-mail e tipo são obrigatórios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail inválido' });
    }

    if (!['usuario', 'admin'].includes(tipo)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Tipo de usuário inválido' });
    }

    const usuarios = db.getUsuarios();
    const usuarioIndex = usuarios.findIndex(u => u.id === id);
    if (usuarioIndex === -1) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    const emailEmUso = usuarios.find(u => u.email === email && u.id !== id);
    if (emailEmUso) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail já está em uso por outro usuário' });
    }

    usuarios[usuarioIndex] = { ...usuarios[usuarioIndex], nome, email, tipo };
    db.salvarUsuarios(usuarios);

    res.json({ sucesso: true, mensagem: 'Usuário atualizado com sucesso', dados: usuarios[usuarioIndex] });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao atualizar usuário' });
  }
};

const deletarUsuario = (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.id === id) {
      return res.status(403).json({ sucesso: false, mensagem: 'Você não pode excluir sua própria conta' });
    }

    const usuarios = db.getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    const atualizados = usuarios.filter(u => u.id !== id);
    db.salvarUsuarios(atualizados);

    res.json({ sucesso: true, mensagem: `Usuário ${usuario.nome} excluído com sucesso` });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao deletar usuário' });
  }
};

module.exports = {
  obterEstatisticas,
  listarTodosUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario
};
