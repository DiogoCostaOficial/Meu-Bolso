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
  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const logDir = isVercel ? '/tmp/meu-bolso-data' : path.join(__dirname, '..', 'data');
  const logPath = path.join(logDir, 'admin-logs.json');

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
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

const normalizarEmail = (email) => String(email || '').trim().toLowerCase();

// Registrar novo usuário
const registrar = async (req, res) => {
  try {
    const { nome, email, senha, pais, whatsapp, telefone } = req.body;
    const emailNorm = normalizarEmail(email);
    const nomeLimpo = String(nome || '').trim();
    const paisLimpo = String(pais || '').trim();
    const whatsappLimpo = String(whatsapp || telefone || '').trim();

    // Validações
    if (!nomeLimpo || !emailNorm || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, e-mail e senha são obrigatórios'
      });
    }

    if (!paisLimpo) {
      return res.status(400).json({
        success: false,
        message: 'O país é obrigatório'
      });
    }

    if (!whatsappLimpo) {
      return res.status(400).json({
        success: false,
        message: 'O telefone de WhatsApp é obrigatório'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
    }

    // Verifica se e-mail já existe (case-insensitive)
    const usuarios = await db.getUsuarios();
    const usuarioExistente = usuarios.find(u => normalizarEmail(u.email) === emailNorm);

    // Cria hash da senha e gera OTP de 5 minutos
    const senhaHash = await hashSenha(senha);
    const otpCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpira = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutos

    if (usuarioExistente) {
      if (usuarioExistente.verificado) {
        return res.status(400).json({
          success: false,
          message: 'E-mail já cadastrado'
        });
      }

      // Conta existente ainda não verificada: atualiza dados e envia novo OTP
      usuarioExistente.nome = nomeLimpo;
      usuarioExistente.email = emailNorm;
      usuarioExistente.senha = senhaHash;
      usuarioExistente.pais = paisLimpo;
      usuarioExistente.whatsapp = whatsappLimpo;
      usuarioExistente.telefone = whatsappLimpo;
      usuarioExistente.otpCodigo = otpCodigo;
      usuarioExistente.otpExpira = otpExpira;

      const atualizado = await db.atualizarUsuario(usuarioExistente);
      if (!atualizado) {
        return res.status(500).json({
          success: false,
          message: 'Não foi possível atualizar o cadastro pendente no banco de dados.'
        });
      }

      const emailRes = await enviarCodigoOTP(emailNorm, nomeLimpo, otpCodigo);
      const isDevSimulado = emailRes?.simulado && process.env.NODE_ENV !== 'production';

      return res.status(200).json({
        success: true,
        message: 'Novo código OTP enviado para o seu e-mail.',
        email: emailNorm,
        ...(isDevSimulado ? { otpSimulado: otpCodigo } : {})
      });
    }

    // Cria novo usuário
    const novoUsuario = {
      id: `user-${Date.now()}`,
      nome: nomeLimpo,
      email: emailNorm,
      senha: senhaHash,
      tipo: 'usuario',
      pais: paisLimpo,
      whatsapp: whatsappLimpo,
      telefone: whatsappLimpo,
      ativo: true,
      primeiroAcesso: true,
      verificado: false,
      otpCodigo,
      otpExpira,
      dataCriacao: new Date().toISOString(),
      ultimoAcesso: null
    };

    // Salva usuário no banco e valida persistência antes de enviar OTP
    const salvo = await db.adicionarUsuario(novoUsuario);
    if (!salvo) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar cadastro no banco de dados. Tente novamente.'
      });
    }

    // Envia OTP
    const emailRes = await enviarCodigoOTP(emailNorm, nomeLimpo, otpCodigo);
    const isDevSimulado = emailRes?.simulado && process.env.NODE_ENV !== 'production';

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado. Verifique seu e-mail para o código OTP.',
      email: emailNorm,
      ...(isDevSimulado ? { otpSimulado: otpCodigo } : {})
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
    if (username) {
      const usuarios = await db.getUsuarios();
      // O admin pode tentar logar usando o username 'admin' ou o email 'admin@admin.com'
      let usuarioAdmin = usuarios.find(u => u.tipo === 'admin' && (u.email === username || u.nome === username || username === 'admin'));

      // Fallback para homologação caso o banco esteja vazio ou inacessível
      if (!usuarioAdmin && (username === 'admin' || username === 'admin@admin.com')) {
        usuarioAdmin = {
          id: 'admin-fallback-id',
          nome: 'Administrador Homologação',
          email: 'admin@admin.com',
          tipo: 'admin',
          senha: await bcrypt.hash('admin123', 10),
          primeiroAcesso: false
        };
      }

      if (!usuarioAdmin) {
        return res.status(401).json({
          success: false,
          message: 'Administrador não encontrado no sistema'
        });
      }

      // Valida a senha usando bcrypt
      const senhaValida = await compararSenha(senha, usuarioAdmin.senha);

      // Se a senha do banco for diferente da digitada, E também não for a nova senha nem a anterior
      if (!senhaValida && !(username === 'admin' && (senha === 'admin123' || senha === 'xPrwGfdhUKnsny0+'))) {
        return res.status(401).json({
          success: false,
          message: 'Usuário ou senha inválidos'
        });
      }

      // Se logou com admin123, sincroniza a senha no banco e garante primeiroAcesso = false
      if (senha === 'admin123') {
        usuarioAdmin.senha = await hashSenha('admin123');
        usuarioAdmin.primeiroAcesso = false;
      }

      // Atualiza último acesso
      usuarioAdmin.ultimoAcesso = new Date().toISOString();
      await db.atualizarUsuario(usuarioAdmin);

      // Gera token (apenas dados necessários para não expor a senha)
      const payloadToken = {
        id: usuarioAdmin.id,
        nome: usuarioAdmin.nome,
        email: usuarioAdmin.email,
        tipo: usuarioAdmin.tipo,
        primeiroAcesso: false
      };
      const token = gerarToken(payloadToken);

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
          primeiroAcesso: false,
          loginEspecial: false
        }
      });
    }


    // Login normal por email
    const emailNorm = normalizarEmail(email);
    if (!emailNorm || !senha) {
      return res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios'
      });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => normalizarEmail(u.email) === emailNorm);

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

    // Bloqueia se não verificado (exceto admin) e envia novo OTP de 5 minutos
    if (!usuario.verificado && usuario.tipo !== 'admin') {
      const novoOtp = Math.floor(100000 + Math.random() * 900000).toString();
      usuario.otpCodigo = novoOtp;
      usuario.otpExpira = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      await db.atualizarUsuario(usuario);
      await enviarCodigoOTP(usuario.email, usuario.nome, novoOtp);

      return res.status(403).json({
        success: false,
        message: 'Conta não verificada. Enviamos um novo código OTP ao seu e-mail.'
      });
    }

    // Valida senha
    let senhaValida = await compararSenha(senha, usuario.senha);

    // Se for o admin e a senha for admin123, sincroniza no banco e desativa primeiro acesso
    if (!senhaValida && usuario.tipo === 'admin' && (senha === 'admin123' || senha === 'xPrwGfdhUKnsny0+')) {
      usuario.senha = await hashSenha('admin123');
      usuario.primeiroAcesso = false;
      await db.atualizarUsuario(usuario);
      senhaValida = true;
    }

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

// Validar OTP (serve tanto para ativação de cadastro quanto para Login Rápido via OTP)
const validarOTP = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    const emailNorm = normalizarEmail(email);
    const codigoLimpo = String(codigo || '').trim();

    if (!emailNorm || !codigoLimpo) {
      return res.status(400).json({ success: false, message: 'E-mail e código são obrigatórios' });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => normalizarEmail(u.email) === emailNorm);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    if (!usuario.otpCodigo || !usuario.otpExpira) {
      if (usuario.verificado) {
        return res.status(400).json({ success: false, message: 'Nenhum código pendente. Faça login ou solicite um novo código.' });
      }
      return res.status(400).json({ success: false, message: 'Código OTP não gerado' });
    }

    const expira = new Date(usuario.otpExpira).getTime();
    if (Date.now() > expira) {
      return res.status(400).json({ success: false, message: 'Código OTP expirado' });
    }

    if (String(usuario.otpCodigo).trim() !== codigoLimpo) {
      return res.status(400).json({ success: false, message: 'Código OTP inválido' });
    }

    usuario.verificado = true;
    usuario.primeiroAcesso = false;
    usuario.otpCodigo = null;
    usuario.otpExpira = null;
    usuario.ultimoAcesso = new Date().toISOString();
    await db.atualizarUsuario(usuario);

    const payloadToken = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      primeiroAcesso: usuario.primeiroAcesso
    };
    const token = gerarToken(payloadToken);
    return res.json({
      success: true,
      message: 'Autenticação concluída com sucesso',
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        foto: usuario.foto || usuario.avatar || null,
        primeiroAcesso: usuario.primeiroAcesso
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
    const emailNorm = normalizarEmail(email);
    if (!emailNorm) {
      return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => normalizarEmail(u.email) === emailNorm);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.otpCodigo = codigo;
    usuario.otpExpira = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutos
    await db.atualizarUsuario(usuario);

    const emailRes = await enviarCodigoOTP(usuario.email, usuario.nome, codigo);
    const isDevSimulado = emailRes?.simulado && process.env.NODE_ENV !== 'production';
    return res.json({
      success: true,
      message: 'Novo código enviado',
      ...(isDevSimulado ? { otpSimulado: codigo } : {})
    });
  } catch (error) {
    console.error('Erro ao reenviar OTP:', error);
    return res.status(500).json({ success: false, message: 'Erro ao reenviar OTP' });
  }
};

// Acesso Rápido via OTP (Outlook / Microsoft / E-mail Rápido)
const outlookLoginOTP = async (req, res) => {
  try {
    const { email, nome } = req.body;
    const emailNorm = normalizarEmail(email);

    if (!emailNorm || !/\S+@\S+\.\S+/.test(emailNorm)) {
      return res.status(400).json({
        success: false,
        message: 'Informe um e-mail válido do Outlook/Hotmail/Microsoft'
      });
    }

    const usuarios = await db.getUsuarios();
    let usuario = usuarios.find(u => normalizarEmail(u.email) === emailNorm);

    const otpCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpira = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutos

    if (usuario) {
      if (usuario.ativo === false) {
        return res.status(403).json({
          success: false,
          message: 'Usuário inativo. Entre em contato com o administrador.'
        });
      }

      usuario.otpCodigo = otpCodigo;
      usuario.otpExpira = otpExpira;
      const atualizado = await db.atualizarUsuario(usuario);
      if (!atualizado) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao gerar código de acesso rápido.'
        });
      }
    } else {
      const nomePadrao = String(nome || '').trim() || emailNorm.split('@')[0];
      const senhaAleatoria = await hashSenha(Math.random().toString(36).slice(-10) + Date.now());

      usuario = {
        id: `user-${Date.now()}`,
        nome: nomePadrao,
        email: emailNorm,
        senha: senhaAleatoria,
        tipo: 'usuario',
        ativo: true,
        primeiroAcesso: false,
        verificado: false,
        otpCodigo,
        otpExpira,
        dataCriacao: new Date().toISOString(),
        ultimoAcesso: null
      };

      const salvo = await db.adicionarUsuario(usuario);
      if (!salvo) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao criar conta rápida no banco de dados.'
        });
      }
    }

    const emailRes = await enviarCodigoOTP(emailNorm, usuario.nome, otpCodigo);
    const isDevSimulado = emailRes?.simulado && process.env.NODE_ENV !== 'production';

    return res.status(200).json({
      success: true,
      message: 'Código de acesso enviado para seu e-mail!',
      email: emailNorm,
      ...(isDevSimulado ? { otpSimulado: otpCodigo } : {})
    });
  } catch (error) {
    console.error('Erro no acesso rápido Outlook OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar acesso rápido com Outlook'
    });
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
    const emailNorm = normalizarEmail(email);

    if (!emailNorm) {
      return res.status(400).json({
        success: false,
        message: 'E-mail é obrigatório'
      });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => normalizarEmail(u.email) === emailNorm);

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
    console.log(`🔑 RECUPERAÇÃO DE SENHA - CÓDIGO OTP: ${otpCodigo} para ${usuario.email}`);
    await enviarCodigoOTP(usuario.email, usuario.nome, otpCodigo);

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
    const emailNorm = normalizarEmail(email);
    const codigoLimpo = String(codigo || '').trim();

    if (!emailNorm || !codigoLimpo || !novaSenha) {
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
    const usuario = usuarios.find(u => normalizarEmail(u.email) === emailNorm);

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

    if (String(usuario.otpCodigo).trim() !== codigoLimpo) {
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
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('505242660728-umlemlt3e590grpjjc82uarg7l76spte.apps.googleusercontent.com');

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
      audience: '505242660728-umlemlt3e590grpjjc82uarg7l76spte.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = normalizarEmail(payload.email);
    const nome = payload.name;
    const foto = payload.picture;

    const usuarios = await db.getUsuarios();
    let usuario = usuarios.find(u => normalizarEmail(u.email) === email);

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
  outlookLoginOTP,
  alterarSenha,
  validarOTP,
  reenviarOTP,
  solicitarRecuperacaoSenha,
  redefinirSenha
};
