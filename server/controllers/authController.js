// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const { gerarToken } = require('../utils/jwt');
const { gerarSenhaAleatoria, hashSenha, compararSenha } = require('../utils/password');
const { enviarCodigoOTP, enviarEmailBoasVindas } = require('../utils/email');
const db = require('../utils/database');

// Função para registrar atividades do admin
const registrarAtividadeAdmin = (usuarioId, ip, tipo) => {
  const log = {
    timestamp: new Date().toISOString(),
    usuarioId,
    ip,
    tipo,
    userAgent: 'N/A' // Pode ser expandido com req.headers['user-agent'] se necessário
  };

  // Salvar em arquivo de logs
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(__dirname, '..', 'data', 'admin-logs.json');

  try {
    let logs = [];
    if (fs.existsSync(logPath)) {
      const logsData = fs.readFileSync(logPath, 'utf8');
      logs = JSON.parse(logsData);
    }

    logs.push(log);

    // Manter apenas os últimos 1000 logs para não crescer indefinidamente
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    console.log(`✅ Log admin registrado: ${tipo} - IP: ${ip}`);
  } catch (error) {
    console.error('Erro ao registrar log admin:', error);
  }
};

// Registrar novo usuário
const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, e-mail e senha são obrigatórios'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
    }

    // Verifica se e-mail já existe
    const usuarios = await db.getUsuarios();
    const usuarioExistente = usuarios.find(u => u.email === email);

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado'
      });
    }

    // Cria hash da senha
    const senhaHash = await hashSenha(senha);

    // Cria novo usuário
    const otpCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpira = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const novoUsuario = {
      id: `user-${Date.now()}`,
      nome,
      email,
      senha: senhaHash,
      tipo: 'usuario',
      ativo: true,
      primeiroAcesso: true,
      verificado: false,
      otpCodigo,
      otpExpira,
      dataCriacao: new Date().toISOString(),
      ultimoAcesso: null
    };

    // Salva usuário no banco
    await db.adicionarUsuario(novoUsuario);

    // Envia OTP
    await enviarCodigoOTP(email, nome, otpCodigo);

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado. Verifique seu e-mail para o código OTP.',
      email
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário'
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, senha, username } = req.body;

    // Login especial para admin (sem email)
    if (username === 'admin' && senha === 'admin') {
      const usuarios = await db.getUsuarios();
      const usuarioAdmin = usuarios.find(u => u.tipo === 'admin' && u.email === 'admin@admin.com');

      if (!usuarioAdmin) {
        return res.status(401).json({
          success: false,
          message: 'Administrador não encontrado no sistema'
        });
      }

      // Atualiza último acesso
      usuarioAdmin.ultimoAcesso = new Date().toISOString();
      await db.atualizarUsuario(usuarioAdmin);

      // Gera token
      const token = gerarToken(usuarioAdmin);

      // Registra atividade especial de admin
      registrarAtividadeAdmin(usuarioAdmin.id, req.ip, 'login_especial');

      return res.json({
        success: true,
        message: 'Login de administrador realizado com sucesso',
        token,
        user: {
          id: usuarioAdmin.id,
          nome: usuarioAdmin.nome,
          email: usuarioAdmin.email,
          tipo: usuarioAdmin.tipo,
          primeiroAcesso: usuarioAdmin.primeiroAcesso,
          loginEspecial: true
        }
      });
    }

    // Login normal por email
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios'
      });
    }

    // Verificação de segurança: impedir login normal com senha padrão do admin
    if (email === 'admin@admin.com' && senha === 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Use o login administrativo especial para acessar com essas credenciais'
      });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha inválidos'
      });
    }

    // Verifica se usuário está ativo
    if (!usuario.ativo) {
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Bloqueia se não verificado
    if (!usuario.verificado) {
      return res.status(403).json({
        success: false,
        message: 'Conta não verificada. Valide o código OTP enviado ao seu e-mail.'
      });
    }

    // Valida senha
    const senhaValida = await compararSenha(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha inválidos'
      });
    }

    // Atualiza último acesso
    usuario.ultimoAcesso = new Date().toISOString();
    await db.atualizarUsuario(usuario);

    // Gera token (apenas dados necessários)
    const payloadToken = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      primeiroAcesso: usuario.primeiroAcesso
    };
    const token = gerarToken(payloadToken);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        primeiroAcesso: usuario.primeiroAcesso
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login'
    });
  }
};

// Validar OTP
const validarOTP = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    if (!email || !codigo) {
      return res.status(400).json({ success: false, message: 'E-mail e código são obrigatórios' });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    if (usuario.verificado) {
      return res.status(200).json({ success: true, message: 'Conta já verificada' });
    }

    if (!usuario.otpCodigo || !usuario.otpExpira) {
      return res.status(400).json({ success: false, message: 'Código OTP não gerado' });
    }

    const expira = new Date(usuario.otpExpira).getTime();
    if (Date.now() > expira) {
      return res.status(400).json({ success: false, message: 'Código OTP expirado' });
    }

    if (usuario.otpCodigo !== codigo) {
      return res.status(400).json({ success: false, message: 'Código OTP inválido' });
    }

    usuario.verificado = true;
    usuario.primeiroAcesso = false;
    usuario.otpCodigo = null;
    usuario.otpExpira = null;
    await db.atualizarUsuario(usuario);

    const token = gerarToken(usuario);
    return res.json({
      success: true, message: 'Conta verificada com sucesso', token, user: {
        id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo, primeiroAcesso: usuario.primeiroAcesso
      }
    });
  } catch (error) {
    console.error('Erro ao validar OTP:', error);
    return res.status(500).json({ success: false, message: 'Erro ao validar OTP' });
  }
};

// Reenviar OTP
const reenviarOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    if (usuario.verificado) {
      return res.status(200).json({ success: true, message: 'Conta já verificada' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.otpCodigo = codigo;
    usuario.otpExpira = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await db.atualizarUsuario(usuario);

    await enviarCodigoOTP(email, usuario.nome, codigo);
    return res.json({ success: true, message: 'Novo código enviado' });
  } catch (error) {
    console.error('Erro ao reenviar OTP:', error);
    return res.status(500).json({ success: false, message: 'Erro ao reenviar OTP' });
  }
};

// Alterar senha
const alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const usuarioId = req.usuario.id;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter no mínimo 6 caracteres'
      });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === usuarioId);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificação especial para admin com senha padrão
    const ehAdminComSenhaPadrao = usuario.email === 'admin@admin.com' && senhaAtual === 'admin';

    let senhaValida = false;

    if (ehAdminComSenhaPadrao) {
      senhaValida = true; // Permite alteração da senha padrão do admin
    } else {
      // Valida senha atual normalmente
      senhaValida = await compararSenha(senhaAtual, usuario.senha);
    }

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualiza senha
    usuario.senha = await hashSenha(novaSenha);
    usuario.primeiroAcesso = false;
    await db.atualizarUsuario(usuario);

    // Registra atividade especial se for admin
    if (usuario.email === 'admin@admin.com') {
      registrarAtividadeAdmin(usuario.id, req.ip, 'alteracao_senha');
    }

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha'
    });
  }
};

// Solicitar recuperação de senha
const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-mail é obrigatório'
      });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      // Por segurança, não informamos se o e-mail existe ou não
      // Mas retornamos sucesso para não permitir enumeração de usuários
      return res.json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.'
      });
    }

    // Gera código OTP
    const otpCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpira = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    // Atualiza usuário com OTP
    usuario.otpCodigo = otpCodigo;
    usuario.otpExpira = otpExpira;
    await db.atualizarUsuario(usuario);

    // Envia e-mail
    console.log(`🔑 RECUPERAÇÃO DE SENHA - CÓDIGO OTP: ${otpCodigo} para ${email}`);
    await enviarCodigoOTP(email, usuario.nome, otpCodigo);

    res.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.'
    });

  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação'
    });
  }
};

// Redefinir senha com OTP
const redefinirSenha = async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body;

    if (!email || !codigo || !novaSenha) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter no mínimo 6 caracteres'
      });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verifica OTP
    if (!usuario.otpCodigo || !usuario.otpExpira) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma solicitação de recuperação encontrada'
      });
    }

    const agora = new Date();
    const expiracao = new Date(usuario.otpExpira);

    if (agora > expiracao) {
      return res.status(400).json({
        success: false,
        message: 'Código expirado. Solicite um novo.'
      });
    }

    if (usuario.otpCodigo !== codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      });
    }

    // Atualiza senha
    usuario.senha = await hashSenha(novaSenha);

    // Limpa OTP
    usuario.otpCodigo = null;
    usuario.otpExpira = null;

    // Se estava pendente de verificação, verifica agora pois confirmou e-mail via OTP
    if (!usuario.verificado) {
      usuario.verificado = true;
    }

    await db.atualizarUsuario(usuario);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.'
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao redefinir senha'
    });
  }
};

// Login com Google
// Login com Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('505242660728-hm4h8k6gbug0mpq5lq8obj95qjt1r6mo.apps.googleusercontent.com');

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token do Google não fornecido'
      });
    }

    // Verifica o token com o Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '505242660728-hm4h8k6gbug0mpq5lq8obj95qjt1r6mo.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const nome = payload.name;
    const foto = payload.picture;

    const usuarios = await db.getUsuarios();
    let usuario = usuarios.find(u => u.email === email);

    if (usuario) {
      // Usuário já existe: Atualiza dados se necessário e loga
      if (!usuario.googleId) {
        usuario.googleId = googleId;
        // Se não tinha foto e veio do Google, atualiza
        if (!usuario.foto && foto) usuario.foto = foto;
        await db.atualizarUsuario(usuario);
      }
    } else {
      // Usuário novo: Cria conta automaticamente
      const novoUsuario = {
        id: `user-${Date.now()}`,
        nome: nome || email.split('@')[0],
        email,
        senha: await hashSenha(Math.random().toString(36).slice(-8)), // Senha aleatória segura
        tipo: 'usuario',
        ativo: true,
        primeiroAcesso: false, // Não precisa trocar senha pois usa Google
        verificado: true, // Google já verificou o e-mail
        googleId,
        foto,
        dataCriacao: new Date().toISOString(),
        ultimoAcesso: null
      };

      await db.adicionarUsuario(novoUsuario);
      usuario = novoUsuario;
    }

    // Login bem sucedido
    usuario.ultimoAcesso = new Date().toISOString();
    await db.atualizarUsuario(usuario);

    const payloadToken = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      primeiroAcesso: usuario.primeiroAcesso
    };
    const jwtToken = gerarToken(payloadToken);

    res.json({
      success: true,
      message: 'Login com Google realizado com sucesso',
      token: jwtToken,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        foto: usuario.foto,
        primeiroAcesso: usuario.primeiroAcesso
      }
    });

  } catch (error) {
    console.error('Erro no login Google:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar login com Google: ' + error.message
    });
  }
};

// Exporta as funções
module.exports = {
  registrar,
  login,
  googleLogin,
  alterarSenha,
  validarOTP,
  reenviarOTP,
  solicitarRecuperacaoSenha,
  redefinirSenha
};
