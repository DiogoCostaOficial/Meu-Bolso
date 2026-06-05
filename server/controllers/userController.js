const db = require('../utils/database');

const obterPerfil = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === userId);

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Remove sensitive data
    const { senha, otpCodigo, otpExpira, ...dadosUsuario } = usuario;

    res.json({
      success: true,
      message: '',
      data: dadosUsuario,
      sucesso: true,
      mensagem: '',
      dados: dadosUsuario
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter perfil', sucesso: false, mensagem: 'Erro ao obter perfil' });
  }
};

const atualizarPerfil = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { nome, avatar } = req.body;

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === userId);

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Update fields if provided
    if (nome) usuario.nome = nome;
    if (avatar !== undefined) usuario.avatar = avatar;

    await db.atualizarUsuario(usuario);

    const { senha, otpCodigo, otpExpira, ...dadosUsuario } = usuario;

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: dadosUsuario,
      sucesso: true,
      mensagem: 'Perfil atualizado com sucesso',
      dados: dadosUsuario
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
  }
};

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Erro Supabase Storage:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      message: 'Avatar enviado com sucesso',
      data: { avatarUrl: publicUrl },
      sucesso: true,
      mensagem: 'Avatar enviado com sucesso',
      dados: { avatarUrl: publicUrl }
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({ success: false, message: 'Erro ao fazer upload do avatar' });
  }
};

const obterDados = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const dados = await db.buscarDadosUsuario(userId);
    res.json({ success: true, message: '', data: dados, sucesso: true, mensagem: '', dados });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao obter dados', sucesso: false, mensagem: 'Erro ao obter dados' });
  }
};

const salvarDados = async (req, res) => {
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
    const ok = await db.salvarDadosUsuario(userId, dados);
    if (!ok) {
      return res.status(500).json({ success: false, message: 'Erro ao salvar dados', sucesso: false, mensagem: 'Erro ao salvar dados' });
    }
    res.json({ success: true, message: 'Dados salvos com sucesso', data: dados, sucesso: true, mensagem: 'Dados salvos com sucesso', dados });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao salvar dados', sucesso: false, mensagem: 'Erro ao salvar dados' });
  }
};

const adicionarTransacao = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const transacao = req.body;
    
    if (!transacao || !transacao.id || !transacao.descricao || transacao.valor === undefined || !transacao.data || !transacao.categoria || !transacao.tipo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados obrigatórios da transação ausentes (id, descricao, valor, data, categoria, tipo)', 
        sucesso: false, 
        mensagem: 'Dados obrigatórios da transação ausentes' 
      });
    }

    const ok = await db.adicionarTransacao(userId, transacao);
    if (!ok) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao salvar transação no banco de dados', 
        sucesso: false, 
        mensagem: 'Erro ao salvar transação no banco de dados' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Transação adicionada com sucesso', 
      data: transacao, 
      sucesso: true, 
      mensagem: 'Transação adicionada com sucesso', 
      dados: transacao 
    });
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao adicionar transação', 
      sucesso: false, 
      mensagem: 'Erro ao adicionar transação' 
    });
  }
};

const atualizarTransacao = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const transacaoId = req.params.id;
    const transacao = req.body;

    if (!transacaoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID da transação não fornecido', 
        sucesso: false, 
        mensagem: 'ID da transação não fornecido' 
      });
    }

    const ok = await db.atualizarTransacao(userId, transacaoId, transacao);
    if (!ok) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar transação no banco de dados ou transação não encontrada', 
        sucesso: false, 
        mensagem: 'Erro ao atualizar transação no banco de dados ou transação não encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Transação atualizada com sucesso', 
      data: transacao, 
      sucesso: true, 
      mensagem: 'Transação atualizada com sucesso', 
      dados: transacao 
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar transação', 
      sucesso: false, 
      mensagem: 'Erro ao atualizar transação' 
    });
  }
};

const deletarTransacao = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const transacaoId = req.params.id;

    if (!transacaoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID da transação não fornecido', 
        sucesso: false, 
        mensagem: 'ID da transação não fornecido' 
      });
    }

    const ok = await db.deletarTransacao(userId, transacaoId);
    if (!ok) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao deletar transação no banco de dados ou transação não encontrada', 
        sucesso: false, 
        mensagem: 'Erro ao deletar transação no banco de dados ou transação não encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Transação deletada com sucesso', 
      sucesso: true, 
      mensagem: 'Transação deletada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar transação', 
      sucesso: false, 
      mensagem: 'Erro ao deletar transação' 
    });
  }
};

module.exports = {
  obterPerfil,
  atualizarPerfil,
  uploadAvatar,
  obterDados,
  salvarDados,
  adicionarTransacao,
  atualizarTransacao,
  deletarTransacao
};
