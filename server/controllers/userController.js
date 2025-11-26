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

module.exports = {
  obterPerfil,
  atualizarPerfil,
  uploadAvatar,
  obterDados,
  salvarDados
};
