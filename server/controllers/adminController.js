const db = require('../utils/database');

const obterEstatisticas = async (req, res) => {
  try {
    const usuarios = await db.getUsuarios();
    const totalUsuarios = usuarios.length;
    const usuariosComAcesso = usuarios.filter(u => !!u.ultimoAcesso).length;
    const usuariosSemAcesso = totalUsuarios - usuariosComAcesso;

    const usuariosOrdenados = [...usuarios].sort((a, b) => {
      if (!a.ultimoAcesso) return 1;
      if (!b.ultimoAcesso) return -1;
      return new Date(b.ultimoAcesso) - new Date(a.ultimoAcesso);
    }).map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      tipo: u.tipo || 'usuario',
      ultimoAcesso: u.ultimoAcesso,
      dataCriacao: u.dataCriacao,
      verificado: u.verificado,
      avatar: u.avatar
    }));

    // Calcular novos usuários hoje
    const hoje = new Date().toISOString().split('T')[0];
    const novosUsuariosHoje = usuarios.filter(u =>
      u.dataCriacao && u.dataCriacao.startsWith(hoje)
    ).length;

    res.json({
      sucesso: true,
      dados: {
        totalUsuarios,
        usuariosComAcesso,
        usuariosSemAcesso,
        novosUsuariosHoje,
        usuarios: usuariosOrdenados
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter estatísticas' });
  }
};

const listarTodosUsuarios = async (req, res) => {
  try {
    const usuarios = await db.getUsuarios();
    const usuariosFormatados = usuarios.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      dataCriacao: u.dataCriacao,
      ultimoAcesso: u.ultimoAcesso,
      primeiroAcesso: u.primeiroAcesso,
      tipo: u.tipo || 'usuario'
    }));
    res.json({ sucesso: true, dados: usuariosFormatados });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar usuários' });
  }
};

const buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }
    res.json({ sucesso: true, dados: usuario });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar usuário' });
  }
};

const atualizarUsuario = async (req, res) => {
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

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    const emailEmUso = usuarios.find(u => u.email === email && u.id !== id);
    if (emailEmUso) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail já está em uso por outro usuário' });
    }

    usuario.nome = nome;
    usuario.email = email;
    usuario.tipo = tipo;

    await db.atualizarUsuario(usuario);

    res.json({ sucesso: true, mensagem: 'Usuário atualizado com sucesso', dados: usuario });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao atualizar usuário' });
  }
};

const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.id === id) {
      return res.status(403).json({ sucesso: false, mensagem: 'Você não pode excluir sua própria conta' });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    // TODO: Implement delete user in DB (we need to add a delete function in database.js or just use raw query here if needed, but for now let's assume we might just deactivate or we need to add a delete function)
    // Since we don't have a delete function in database.js yet, let's add one or use a direct query if we were inside database.js.
    // But wait, database.js exports `salvarUsuarios` which overwrites everything.
    // In the new Postgres version of database.js, `salvarUsuarios` is NOT exported.
    // We need to add `deletarUsuario` to database.js or handle it.
    // Let's assume for this step we will just log it and maybe fail or we should have updated database.js first to include delete.
    // Actually, looking at database.js I wrote earlier, I didn't export a delete function.
    // I should probably update database.js to include a delete function.

    // For now, I will comment out the actual deletion and return a message saying it's not implemented fully or I will fix database.js in next step.
    // Better yet, I will use `db.deletarUsuario` and I will add it to database.js in the next step.

    await db.deletarUsuario(id);

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
