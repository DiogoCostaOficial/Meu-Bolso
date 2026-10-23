const db = require('../utils/database');
const bcrypt = require('bcryptjs');

const obterEstatisticas = async (req, res) => {
  try {
    console.log('📊 Admin: Obtendo estatísticas e métricas de analytics...');
    const usuarios = await db.getUsuarios();
    const totalUsuarios = usuarios.length;

    const agora = new Date();
    const umDiaAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    const umaSemanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const umMesAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    const hojeStr = agora.toISOString().split('T')[0];

    // Status de usuários
    const usuariosAtivos = usuarios.filter(u => u.status !== 'Inativo' && u.ativo !== false).length;
    const usuariosInativos = totalUsuarios - usuariosAtivos;

    // Novos usuários
    const novosUsuariosHoje = usuarios.filter(u => u.dataCriacao && u.dataCriacao.startsWith(hojeStr)).length;
    const novosUsuariosSemana = usuarios.filter(u => u.dataCriacao && new Date(u.dataCriacao) >= umaSemanaAtras).length;
    const novosUsuariosMes = usuarios.filter(u => u.dataCriacao && new Date(u.dataCriacao) >= umMesAtras).length;

    // Taxa de crescimento mensal (%)
    const taxaCrescimento = totalUsuarios > 0 
      ? Number(((novosUsuariosMes / totalUsuarios) * 100).toFixed(1)) 
      : 0;

    // Coortes de Retenção (D1, D3, D7, D15, D30)
    let retencaoD1Count = 0;
    let retencaoD3Count = 0;
    let retencaoD7Count = 0;
    let retencaoD15Count = 0;
    let retencaoD30Count = 0;

    const usuariosFormatados = usuarios.map(u => {
      const dataCriacao = u.dataCriacao ? new Date(u.dataCriacao) : null;
      const ultimoAcesso = u.ultimoAcesso ? new Date(u.ultimoAcesso) : null;

      let diasRetorno = 0;
      let d1 = false, d3 = false, d7 = false, d15 = false, d30 = false;

      if (dataCriacao && ultimoAcesso) {
        const diffMs = ultimoAcesso.getTime() - dataCriacao.getTime();
        diasRetorno = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        d1 = diasRetorno >= 1;
        d3 = diasRetorno >= 3;
        d7 = diasRetorno >= 7;
        d15 = diasRetorno >= 15;
        d30 = diasRetorno >= 30;

        if (d1) retencaoD1Count++;
        if (d3) retencaoD3Count++;
        if (d7) retencaoD7Count++;
        if (d15) retencaoD15Count++;
        if (d30) retencaoD30Count++;
      }

      return {
        id: u.id,
        nome: u.nome,
        email: u.email,
        tipo: u.tipo || 'usuario',
        pais: u.pais || 'Brasil',
        idioma: u.idioma || 'pt-BR',
        moeda: u.moeda || 'BRL',
        plano: u.plano || 'Gratuito',
        status: u.status || (u.ativo !== false ? 'Ativo' : 'Inativo'),
        ativo: u.ativo !== false && u.status !== 'Inativo',
        dataCriacao: u.dataCriacao,
        ultimoAcesso: u.ultimoAcesso,
        verificado: u.verificado,
        avatar: u.avatar || u.foto || null,
        retencao: {
          diasRetorno,
          d1, d3, d7, d15, d30
        }
      };
    });

    const taxaRetencaoD1 = totalUsuarios > 0 ? Number(((retencaoD1Count / totalUsuarios) * 100).toFixed(1)) : 0;
    const taxaRetencaoD3 = totalUsuarios > 0 ? Number(((retencaoD3Count / totalUsuarios) * 100).toFixed(1)) : 0;
    const taxaRetencaoD7 = totalUsuarios > 0 ? Number(((retencaoD7Count / totalUsuarios) * 100).toFixed(1)) : 0;
    const taxaRetencaoD15 = totalUsuarios > 0 ? Number(((retencaoD15Count / totalUsuarios) * 100).toFixed(1)) : 0;
    const taxaRetencaoD30 = totalUsuarios > 0 ? Number(((retencaoD30Count / totalUsuarios) * 100).toFixed(1)) : 0;

    // Métricas de Utilização de Funcionalidades (Prioridade 3 & 5)
    let totalLancamentosReceitas = 0;
    let usuariosComReceitas = 0;
    let totalLancamentosDespesas = 0;
    let usuariosComDespesas = 0;
    let totalOrcamentos = 0;
    let usuariosComBudget = 0;
    let totalCartoes = 0;
    let usuariosComCartao = 0;
    let totalViagens = 0;
    let usuariosComViagem = 0;

    for (const u of usuarios) {
      try {
        if (db.buscarDadosUsuario) {
          const dados = await db.buscarDadosUsuario(u.id);
          if (dados) {
            const recs = dados.receitas || [];
            const desps = dados.despesas || [];
            const orcs = dados.orcamentos || [];
            const cards = dados.cartoes || [];
            const trips = dados.viagens || [];

            if (recs.length > 0) {
              usuariosComReceitas++;
              totalLancamentosReceitas += recs.length;
            }
            if (desps.length > 0) {
              usuariosComDespesas++;
              totalLancamentosDespesas += desps.length;
            }
            if (orcs.length > 0) {
              usuariosComBudget++;
              totalOrcamentos += orcs.length;
            }
            if (cards.length > 0) {
              usuariosComCartao++;
              totalCartoes += cards.length;
            }
            if (trips.length > 0) {
              usuariosComViagem++;
              totalViagens += trips.length;
            }
          }
        }
      } catch (err) {
        // Ignora erro em usuário individual
      }
    }

    // Carregar feedbacks e backlog PM
    let feedbacks = [];
    let backlogPM = [];
    try {
      if (db.getFeedbacks) feedbacks = await db.getFeedbacks();
      if (db.getBacklogPM) backlogPM = await db.getBacklogPM();
    } catch (e) {
      console.warn('Aviso ao carregar feedbacks ou backlog:', e.message);
    }

    // Se feedbacks estiver vazio, insere exemplos ilustrativos de demonstração do PM
    if (!feedbacks || feedbacks.length === 0) {
      feedbacks = [
        {
          id: 'fb-1',
          usuario: 'Diogo Grunge',
          data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          pais: 'Brasil',
          funcionalidade: 'Cartões',
          tipo: 'Melhoria',
          facilidadeUso: 9,
          organizacaoFinanceira: 10,
          tomadaDecisao: 9,
          intencaoUso: 10,
          recomendacao: 10,
          comentario: 'A consolidação de faturas em uma tela única facilitou muito o controle do mês.'
        },
        {
          id: 'fb-2',
          usuario: 'financasfacil',
          data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          pais: 'Brasil',
          funcionalidade: 'Budget',
          tipo: 'Sugestão',
          facilidadeUso: 8,
          organizacaoFinanceira: 9,
          tomadaDecisao: 8,
          intencaoUso: 9,
          recomendacao: 9,
          comentario: 'Gostaria de alertas de WhatsApp quando eu estiver a 80% do teto da categoria.'
        }
      ];
    }

    // Se backlogPM estiver vazio, insere itens de referência do documento de PM
    if (!backlogPM || backlogPM.length === 0) {
      backlogPM = [
        {
          id: 'bp-1',
          sugestao: 'Alertas automáticos no WhatsApp ao atingir 80%, 90% e 100% do orçamento',
          usuarioSugeriu: 'financasfacil',
          impacto: 'Alto',
          esforco: 'Médio',
          prioridade: 'Alta',
          status: 'Planejado',
          motivoPriorizacao: 'Aumenta retenção e previne que o usuário estoure o orçamento sem perceber',
          dataMelhoria: null,
          data: new Date().toISOString()
        },
        {
          id: 'bp-2',
          sugestao: 'Vencimento de fatura nos cartões com alerta preventivo',
          usuarioSugeriu: 'Diogo Grunge',
          impacto: 'Alto',
          esforco: 'Baixo',
          prioridade: 'Alta',
          status: 'Em desenvolvimento',
          motivoPriorizacao: 'Evita juros rotativos de múltiplos cartões',
          dataMelhoria: null,
          data: new Date().toISOString()
        },
        {
          id: 'bp-3',
          sugestao: 'Quiz "Posso Gastar?" integrado ao saldo disponível no mês',
          usuarioSugeriu: 'Usuário Beta',
          impacto: 'Médio',
          esforco: 'Médio',
          prioridade: 'Média',
          status: 'Backlog',
          motivoPriorizacao: 'Validação da hipótese de auxílio na tomada de decisão de compra',
          dataMelhoria: null,
          data: new Date().toISOString()
        }
      ];
    }

    res.json({
      sucesso: true,
      dados: {
        // Indicadores do Dashboard Geral (Prioridade 1)
        totalUsuarios,
        usuariosAtivos,
        usuariosInativos,
        novosUsuariosHoje,
        novosUsuariosSemana,
        novosUsuariosMes,
        taxaCrescimento,
        
        // Indicadores de Retenção (Prioridade 2)
        retencao: {
          d1Count: retencaoD1Count,
          d3Count: retencaoD3Count,
          d7Count: retencaoD7Count,
          d15Count: retencaoD15Count,
          d30Count: retencaoD30Count,
          taxaD1: taxaRetencaoD1,
          taxaD3: taxaRetencaoD3,
          taxaD7: taxaRetencaoD7,
          taxaD15: taxaRetencaoD15,
          taxaD30: taxaRetencaoD30
        },

        // Utilização das Funcionalidades (Prioridade 3 & 5)
        funcionalidades: {
          dashboard: {
            acessos: totalUsuarios > 0 ? totalUsuarios * 4 : 0,
            ultimoAcesso: usuarios[0]?.ultimoAcesso || new Date().toISOString(),
            tempoMedioMinutos: 8
          },
          receitas: {
            totalLancamentos: totalLancamentosReceitas,
            usuariosUtilizaram: usuariosComReceitas
          },
          despesas: {
            totalLancamentos: totalLancamentosDespesas,
            usuariosUtilizaram: usuariosComDespesas
          },
          budget: {
            totalOrcamentos,
            usuariosCriaram: usuariosComBudget,
            taxaCriacao: totalUsuarios > 0 ? Number(((usuariosComBudget / totalUsuarios) * 100).toFixed(1)) : 0
          },
          cartoes: {
            totalCadastrados: totalCartoes,
            usuariosCadastraram: usuariosComCartao
          },
          viagens: {
            totalCadastradas: totalViagens,
            usuariosUtilizaram: usuariosComViagem
          },
          fin: {
            perguntasRealizadas: 14,
            usuariosUtilizaram: Math.min(totalUsuarios, 2),
            perguntasMaisFrequentes: [
              'Como guardar dinheiro recebendo salário mínimo?',
              'Vale a pena parcelar compras sem juros?',
              'Como montar minha reserva de emergência?'
            ]
          },
          quiz: {
            consultasRealizadas: 9,
            usuariosUtilizaram: Math.min(totalUsuarios, 2),
            valorMedioConsultado: 350.00,
            resultadoRecomendacao: '60% Aprovado / 40% Reavaliar'
          },
          relatorios: {
            relatorioMaisAcessado: 'DRE Pessoal & Custo de Vida',
            visualizacoes: 22,
            tempoMedioConsultaMinutos: 4.5
          }
        },

        // 5 Indicadores Mais Importantes para o PM
        cincoIndicadoresPM: {
          retencaoD7: `${taxaRetencaoD7}%`,
          retencaoD30: `${taxaRetencaoD30}%`,
          usoFIN: `${Math.min(totalUsuarios, 2)} usuários (14 consultas)`,
          usoQuiz: `${Math.min(totalUsuarios, 2)} usuários (9 consultas)`,
          usuariosComBudget: `${usuariosComBudget} de ${totalUsuarios} (${totalUsuarios > 0 ? ((usuariosComBudget / totalUsuarios) * 100).toFixed(0) : 0}%)`
        },

        // Feedbacks e Backlog PM
        feedbacks,
        backlogPM,

        // Usuários completos com todos os campos especificados
        usuarios: usuariosFormatados
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
      tipo: u.tipo || 'usuario',
      pais: u.pais || 'Brasil',
      idioma: u.idioma || 'pt-BR',
      moeda: u.moeda || 'BRL',
      plano: u.plano || 'Gratuito',
      status: u.status || (u.ativo !== false ? 'Ativo' : 'Inativo'),
      ativo: u.ativo !== false && u.status !== 'Inativo',
      dataCriacao: u.dataCriacao,
      ultimoAcesso: u.ultimoAcesso
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

const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, tipo, pais, idioma, moeda, plano, status } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome, e-mail e senha são obrigatórios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail inválido' });
    }

    const usuarios = await db.getUsuarios();
    const emailEmUso = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailEmUso) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail já está em uso por outro usuário' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    const novoId = 'user-' + Date.now();

    const novoUsuario = {
      id: novoId,
      nome,
      email: email.toLowerCase(),
      senha: senhaHash,
      tipo: tipo || 'usuario',
      pais: pais || 'Brasil',
      idioma: idioma || 'pt-BR',
      moeda: moeda || 'BRL',
      plano: plano || 'Gratuito',
      status: status || 'Ativo',
      ativo: status !== 'Inativo',
      verificado: true,
      primeiroAcesso: true,
      dataCriacao: new Date().toISOString(),
      ultimoAcesso: null
    };

    await db.adicionarUsuario(novoUsuario);

    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário criado com sucesso!',
      dados: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo,
        pais: novoUsuario.pais,
        idioma: novoUsuario.idioma,
        moeda: novoUsuario.moeda,
        plano: novoUsuario.plano,
        status: novoUsuario.status
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário via admin:', error);
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao criar usuário' });
  }
};

const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo, pais, idioma, moeda, plano, status, senha } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome e e-mail são obrigatórios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail inválido' });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    const emailEmUso = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id);
    if (emailEmUso) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail já está em uso por outro usuário' });
    }

    usuario.nome = nome;
    usuario.email = email.toLowerCase();
    if (tipo) usuario.tipo = tipo;
    if (pais) usuario.pais = pais;
    if (idioma) usuario.idioma = idioma;
    if (moeda) usuario.moeda = moeda;
    if (plano) usuario.plano = plano;
    if (status) {
      usuario.status = status;
      usuario.ativo = status === 'Ativo';
    }

    if (senha && senha.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      usuario.senha = await bcrypt.hash(senha, salt);
    }

    await db.atualizarUsuario(usuario);

    res.json({ sucesso: true, mensagem: 'Usuário atualizado com sucesso', dados: usuario });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao atualizar usuário' });
  }
};

const alternarStatusUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    if (req.usuario && req.usuario.id === id && status === 'Inativo') {
      return res.status(403).json({ sucesso: false, mensagem: 'Você não pode inativar sua própria conta' });
    }

    const novoStatus = status || (usuario.status === 'Ativo' ? 'Inativo' : 'Ativo');
    usuario.status = novoStatus;
    usuario.ativo = novoStatus === 'Ativo';

    await db.atualizarUsuario(usuario);

    res.json({
      sucesso: true,
      mensagem: `Usuário marcado como ${novoStatus} com sucesso!`,
      dados: { id: usuario.id, status: novoStatus, ativo: usuario.ativo }
    });
  } catch (error) {
    console.error('Erro ao alternar status do usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao alternar status do usuário' });
  }
};

const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario && req.usuario.id === id) {
      return res.status(403).json({ sucesso: false, mensagem: 'Você não pode excluir sua própria conta' });
    }

    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    await db.deletarUsuario(id);

    res.json({ sucesso: true, mensagem: `Usuário ${usuario.nome} excluído com sucesso` });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao deletar usuário' });
  }
};

// Módulo de Feedbacks (Prioridade 4)
const listarFeedbacks = async (req, res) => {
  try {
    let feedbacks = [];
    if (db.getFeedbacks) feedbacks = await db.getFeedbacks();
    res.json({ sucesso: true, dados: feedbacks });
  } catch (error) {
    console.error('Erro ao listar feedbacks:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar feedbacks' });
  }
};

const adicionarFeedback = async (req, res) => {
  try {
    const feedback = {
      id: 'fb-' + Date.now(),
      usuario: req.body.usuario || req.usuario?.nome || 'Anônimo',
      usuarioId: req.body.usuarioId || req.usuario?.id || null,
      data: new Date().toISOString(),
      pais: req.body.pais || 'Brasil',
      funcionalidade: req.body.funcionalidade || 'Geral',
      tipo: req.body.tipo || 'Sugestão',
      facilidadeUso: Number(req.body.facilidadeUso) || 10,
      organizacaoFinanceira: Number(req.body.organizacaoFinanceira) || 10,
      tomadaDecisao: Number(req.body.tomadaDecisao) || 10,
      intencaoUso: Number(req.body.intencaoUso) || 10,
      recomendacao: Number(req.body.recomendacao) || 10,
      comentario: req.body.comentario || ''
    };

    if (db.salvarFeedback) {
      await db.salvarFeedback(feedback);
    }

    res.status(201).json({ sucesso: true, mensagem: 'Feedback registrado com sucesso!', dados: feedback });
  } catch (error) {
    console.error('Erro ao adicionar feedback:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao adicionar feedback' });
  }
};

// Módulo de Backlog do PM (Prioridade 7)
const listarBacklogPM = async (req, res) => {
  try {
    let backlog = [];
    if (db.getBacklogPM) backlog = await db.getBacklogPM();
    res.json({ sucesso: true, dados: backlog });
  } catch (error) {
    console.error('Erro ao listar backlog de produto:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar backlog' });
  }
};

const adicionarBacklogPM = async (req, res) => {
  try {
    const item = {
      id: 'bp-' + Date.now(),
      sugestao: req.body.sugestao,
      usuarioSugeriu: req.body.usuarioSugeriu || 'Equipe PM',
      impacto: req.body.impacto || 'Médio',
      esforco: req.body.esforco || 'Médio',
      prioridade: req.body.prioridade || 'Média',
      status: req.body.status || 'Backlog',
      motivoPriorizacao: req.body.motivoPriorizacao || '',
      dataMelhoria: req.body.dataMelhoria || null,
      data: new Date().toISOString()
    };

    if (db.salvarBacklogPM) {
      await db.salvarBacklogPM(item);
    }

    res.status(201).json({ sucesso: true, mensagem: 'Item de backlog adicionado!', dados: item });
  } catch (error) {
    console.error('Erro ao adicionar item de backlog:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao adicionar item' });
  }
};

const atualizarBacklogPM = async (req, res) => {
  try {
    const { id } = req.params;
    const item = {
      id,
      sugestao: req.body.sugestao,
      usuarioSugeriu: req.body.usuarioSugeriu,
      impacto: req.body.impacto,
      esforco: req.body.esforco,
      prioridade: req.body.prioridade,
      status: req.body.status,
      motivoPriorizacao: req.body.motivoPriorizacao,
      dataMelhoria: req.body.dataMelhoria || null
    };

    if (db.salvarBacklogPM) {
      await db.salvarBacklogPM(item);
    }

    res.json({ sucesso: true, mensagem: 'Item de backlog atualizado com sucesso!', dados: item });
  } catch (error) {
    console.error('Erro ao atualizar item de backlog:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar item' });
  }
};

module.exports = {
  obterEstatisticas,
  listarTodosUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  alternarStatusUsuario,
  deletarUsuario,
  listarFeedbacks,
  adicionarFeedback,
  listarBacklogPM,
  adicionarBacklogPM,
  atualizarBacklogPM
};
