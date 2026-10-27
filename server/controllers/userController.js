const fs = require('fs');
const path = require('path');
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

const normalizarEmail = (email) => String(email || '').trim().toLowerCase();

const atualizarPerfil = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { nome, avatar, email, telefone, whatsapp } = req.body;

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === userId);

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Atualiza nome
    if (nome) usuario.nome = String(nome).trim();

    // Atualiza avatar
    if (avatar !== undefined) usuario.avatar = avatar;

    // Atualiza e-mail com validação de unicidade
    if (email) {
      const emailNorm = normalizarEmail(email);
      if (!/\S+@\S+\.\S+/.test(emailNorm)) {
        return res.status(400).json({ success: false, message: 'Formato de e-mail inválido' });
      }

      const outroUsuario = usuarios.find(u => u.id !== userId && normalizarEmail(u.email) === emailNorm);
      if (outroUsuario) {
        return res.status(400).json({ success: false, message: 'Este e-mail já está em uso por outro usuário' });
      }

      usuario.email = emailNorm;
    }

    // Atualiza telefone e WhatsApp
    if (telefone !== undefined || whatsapp !== undefined) {
      const telFinal = String(telefone || whatsapp || '').trim();
      usuario.telefone = telFinal;
      usuario.whatsapp = telFinal;
    }

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
const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_ANON_KEY || '').trim();
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
    }

    const file = req.file;
    const fileExt = (file.originalname && file.originalname.includes('.')) 
      ? file.originalname.split('.').pop() 
      : 'png';
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    let avatarUrl = '';

    // 1. Tenta Supabase Storage caso configurado
    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          if (publicUrl) {
            avatarUrl = publicUrl;
          }
        }
      } catch (errSupabase) {
        console.warn('Falha no Supabase Storage, utilizando armazenamento local/data URL:', errSupabase.message);
      }
    }

    // 2. Fallback seguro: salva localmente na pasta uploads e gera Data URL
    if (!avatarUrl) {
      try {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const localPath = path.join(uploadDir, fileName);
        fs.writeFileSync(localPath, file.buffer);
        avatarUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      } catch (errLocal) {
        console.warn('Erro ao salvar localmente, gerando data URL:', errLocal.message);
        avatarUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    }

    // 3. Atualiza o avatar no usuário autenticado imediatamente
    if (req.usuario && req.usuario.id) {
      try {
        const usuarios = await db.getUsuarios();
        const usuario = usuarios.find(u => u.id === req.usuario.id);
        if (usuario) {
          usuario.avatar = avatarUrl;
          await db.atualizarUsuario(usuario);
        }
      } catch (e) {
        console.warn('Erro ao atualizar avatar no usuário:', e.message);
      }
    }

    res.json({
      success: true,
      message: 'Avatar enviado com sucesso',
      data: { avatarUrl },
      sucesso: true,
      mensagem: 'Avatar enviado com sucesso',
      dados: { avatarUrl }
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({ success: false, message: 'Erro ao fazer upload do avatar: ' + error.message });
  }
};

const obterDados = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const dados = await db.buscarDadosUsuario(userId);
    res.json({ success: true, message: '', data: dados, sucesso: true, mensagem: '', dados });
  } catch (error) {
    console.error('Erro em obterDados:', error);
    res.status(500).json({ success: false, message: `Erro ao obter dados: ${error.message}`, sucesso: false, mensagem: `Erro ao obter dados: ${error.message}` });
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
      return res.status(500).json({ success: false, message: 'Erro ao salvar dados no banco de dados', sucesso: false, mensagem: 'Erro ao salvar dados no banco de dados' });
    }
    res.json({ success: true, message: 'Dados salvos com sucesso', data: dados, sucesso: true, mensagem: 'Dados salvos com sucesso', dados });
  } catch (error) {
    console.error('Erro em salvarDados:', error);
    res.status(500).json({ success: false, message: `Erro ao salvar dados: ${error.message}`, sucesso: false, mensagem: `Erro ao salvar dados: ${error.message}` });
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

const excluirConta = async (req, res) => {
  try {
    const userId = req.usuario && req.usuario.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        sucesso: false,
        mensagem: 'Usuário não autenticado'
      });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === userId);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    if (usuario.tipo === 'admin' || (req.usuario && req.usuario.tipo === 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Contas de administrador estão protegidas e não podem ser excluídas por aqui.',
        sucesso: false,
        mensagem: 'Contas de administrador estão protegidas e não podem ser excluídas por aqui.'
      });
    }

    const confirmacao = String((req.body && req.body.confirmacao) || '').trim().toUpperCase();
    if (confirmacao && confirmacao !== 'EXCLUIR') {
      return res.status(400).json({
        success: false,
        message: 'Confirmação inválida. Digite EXCLUIR para confirmar.',
        sucesso: false,
        mensagem: 'Confirmação inválida. Digite EXCLUIR para confirmar.'
      });
    }

    const ok = await db.deletarUsuario(userId);
    if (!ok) {
      return res.status(500).json({
        success: false,
        message: 'Não foi possível excluir sua conta no momento.',
        sucesso: false,
        mensagem: 'Não foi possível excluir sua conta no momento.'
      });
    }

    res.json({
      success: true,
      message: 'Sua conta e todos os seus dados foram excluídos permanentemente.',
      sucesso: true,
      mensagem: 'Sua conta e todos os seus dados foram excluídos permanentemente.'
    });
  } catch (error) {
    console.error('Erro ao excluir própria conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao excluir conta',
      sucesso: false,
      mensagem: 'Erro interno ao excluir conta'
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
  deletarTransacao,
  excluirConta
};
