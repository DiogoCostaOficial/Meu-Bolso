// src/pages/admin/PainelAdmin.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/api';
import {
  Users,
  Activity,
  CheckCircle,
  XCircle,
  UserPlus,
  Edit,
  Trash2,
  AlertCircle,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Loader2,
  Globe,
  DollarSign,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Sparkles,
  CreditCard,
  Plane,
  Bot,
  HelpCircle,
  FileText,
  Star,
  ToggleLeft,
  ToggleRight,
  Filter,
  Check,
  Plus,
  Wallet
} from 'lucide-react';

const PAISES_DISPONIVEIS = [
  { nome: 'Brasil', flag: '🇧🇷', ddi: '+55', moeda: 'BRL', idioma: 'pt-BR' },
  { nome: 'Estados Unidos', flag: '🇺🇸', ddi: '+1', moeda: 'USD', idioma: 'en' },
  { nome: 'Itália', flag: '🇮🇹', ddi: '+39', moeda: 'EUR', idioma: 'it' },
  { nome: 'Portugal', flag: '🇵🇹', ddi: '+351', moeda: 'EUR', idioma: 'pt-PT' },
  { nome: 'Espanha', flag: '🇪🇸', ddi: '+34', moeda: 'EUR', idioma: 'es' },
  { nome: 'Alemanha', flag: '🇩🇪', ddi: '+49', moeda: 'EUR', idioma: 'de' },
  { nome: 'França', flag: '🇫🇷', ddi: '+33', moeda: 'EUR', idioma: 'fr' },
  { nome: 'China', flag: '🇨🇳', ddi: '+86', moeda: 'CNY', idioma: 'zh' }
];

const PainelAdmin = () => {
  const { user } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('usuarios'); // 'usuarios', 'retencao', 'features', 'feedbacks', 'backlog'
  const [estatisticas, setEstatisticas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [backlogPM, setBacklogPM] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Filtros de Usuários
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroPlano, setFiltroPlano] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPais, setFiltroPais] = useState('todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [usuariosPorPagina] = useState(8);

  // Modais de Usuário
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [alternandoStatus, setAlternandoStatus] = useState(null);

  // Modal de Feedback
  const [modalFeedbackAberto, setModalFeedbackAberto] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    usuario: '',
    pais: 'Brasil',
    funcionalidade: 'Cartões',
    tipo: 'Sugestão',
    facilidadeUso: 9,
    organizacaoFinanceira: 9,
    tomadaDecisao: 9,
    intencaoUso: 10,
    recomendacao: 10,
    comentario: ''
  });

  // Modal de Backlog PM
  const [modalBacklogAberto, setModalBacklogAberto] = useState(false);
  const [backlogForm, setBacklogForm] = useState({
    sugestao: '',
    usuarioSugeriu: '',
    impacto: 'Alto',
    esforco: 'Médio',
    prioridade: 'Alta',
    status: 'Backlog',
    motivoPriorizacao: ''
  });

  // Formulário de Usuário (com os novos campos do backlog)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'usuario',
    pais: 'Brasil',
    idioma: 'pt-BR',
    moeda: 'BRL',
    plano: 'Gratuito',
    status: 'Ativo'
  });
  const [errosForm, setErrosForm] = useState({});

  const buscarDadosAdmin = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const statsResponse = await adminService.obterEstatisticas();
      if (statsResponse.sucesso) {
        setEstatisticas(statsResponse.dados);
        setUsuarios(statsResponse.dados.usuarios || []);
        setFeedbacks(statsResponse.dados.feedbacks || []);
        setBacklogPM(statsResponse.dados.backlogPM || []);
      } else {
        setErro(statsResponse.mensagem);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao carregar dados do painel admin.');
      console.error('Erro ao buscar dados do admin:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (user?.tipo === 'admin') {
      buscarDadosAdmin();
    } else {
      setErro('Acesso negado. Você não tem permissão de administrador.');
      setCarregando(false);
    }
  }, [user, buscarDadosAdmin]);

  // Abertura de Modais de Usuário
  const abrirModalCriar = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipo: 'usuario',
      pais: 'Brasil',
      idioma: 'pt-BR',
      moeda: 'BRL',
      plano: 'Gratuito',
      status: 'Ativo'
    });
    setErrosForm({});
    setModalCriarAberto(true);
  };

  const abrirModalEdicao = (u) => {
    setUsuarioEditando(u);
    setFormData({
      nome: u.nome || '',
      email: u.email || '',
      senha: '', // Opcional ao editar
      tipo: u.tipo || 'usuario',
      pais: u.pais || 'Brasil',
      idioma: u.idioma || 'pt-BR',
      moeda: u.moeda || 'BRL',
      plano: u.plano || 'Gratuito',
      status: u.status || 'Ativo'
    });
    setErrosForm({});
    setModalEditarAberto(true);
  };

  const fecharModais = () => {
    setModalCriarAberto(false);
    setModalEditarAberto(false);
    setModalFeedbackAberto(false);
    setModalBacklogAberto(false);
    setUsuarioEditando(null);
    setErrosForm({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-ajustar moeda e idioma quando país muda
    if (name === 'pais') {
      const match = PAISES_DISPONIVEIS.find(p => p.nome === value);
      if (match) {
        setFormData(prev => ({
          ...prev,
          pais: value,
          moeda: match.moeda,
          idioma: match.idioma
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errosForm[name]) {
      setErrosForm(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = (isCriacao = false) => {
    const erros = {};
    if (!formData.nome.trim()) erros.nome = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erros.email = 'E-mail inválido';
    }

    if (isCriacao && !formData.senha.trim()) {
      erros.senha = 'Senha é obrigatória';
    } else if (formData.senha && formData.senha.length < 6) {
      erros.senha = 'Mínimo de 6 caracteres';
    }

    setErrosForm(erros);
    return Object.keys(erros).length === 0;
  };

  const criarUsuario = async (e) => {
    e.preventDefault();
    if (!validarFormulario(true)) return;

    setSalvando(true);
    try {
      const res = await adminService.criarUsuario(formData);
      if (res.sucesso) {
        fecharModais();
        await buscarDadosAdmin();
      } else {
        alert(res.mensagem || 'Erro ao criar usuário');
      }
    } catch (err) {
      alert(err.message || 'Erro ao criar usuário');
    } finally {
      setSalvando(false);
    }
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    if (!validarFormulario(false)) return;

    if (usuarioEditando.id === user.id && formData.tipo !== 'admin') {
      alert('Você não pode revogar seus próprios privilégios de administrador!');
      return;
    }

    setSalvando(true);
    try {
      const dadosAtualizacao = { ...formData };
      if (!dadosAtualizacao.senha.trim()) {
        delete dadosAtualizacao.senha;
      }
      const res = await adminService.atualizarUsuario(usuarioEditando.id, dadosAtualizacao);
      if (res.sucesso) {
        fecharModais();
        await buscarDadosAdmin();
      } else {
        alert(res.mensagem || 'Erro ao atualizar usuário');
      }
    } catch (err) {
      alert(err.message || 'Erro ao atualizar usuário');
    } finally {
      setSalvando(false);
    }
  };

  const alternarStatus = async (usuario) => {
    if (usuario.id === user.id && usuario.status === 'Ativo') {
      alert('Você não pode inativar seu próprio acesso de administrador!');
      return;
    }

    const novoStatus = usuario.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setAlternandoStatus(usuario.id);
    try {
      const res = await adminService.alternarStatusUsuario(usuario.id, novoStatus);
      if (res.sucesso) {
        await buscarDadosAdmin();
      } else {
        alert(res.mensagem || 'Erro ao alterar status');
      }
    } catch (err) {
      alert(err.message || 'Erro ao alterar status');
    } finally {
      setAlternandoStatus(null);
    }
  };

  const excluirUsuario = async (userId, userName) => {
    if (userId === user.id) {
      alert('Você não pode excluir sua própria conta de administrador!');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    setExcluindo(userId);
    try {
      const res = await adminService.excluirUsuario(userId);
      if (res.sucesso) {
        await buscarDadosAdmin();
      } else {
        alert(res.mensagem || 'Erro ao excluir');
      }
    } catch (err) {
      alert(err.message || 'Erro ao excluir');
    } finally {
      setExcluindo(null);
    }
  };

  // Envio de Feedback
  const salvarNovoFeedback = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await adminService.adicionarFeedback(feedbackForm);
      if (res.sucesso) {
        fecharModais();
        await buscarDadosAdmin();
      }
    } catch (err) {
      alert('Erro ao registrar feedback: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  // Envio de Backlog PM
  const salvarNovoBacklog = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await adminService.adicionarBacklogPM(backlogForm);
      if (res.sucesso) {
        fecharModais();
        await buscarDadosAdmin();
      }
    } catch (err) {
      alert('Erro ao adicionar melhoria: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  // Filtragem dinâmica de usuários
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchTexto = 
        u.nome?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        u.email?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        u.id?.toLowerCase().includes(filtroTexto.toLowerCase());

      const matchPlano = filtroPlano === 'todos' || (u.plano || 'Gratuito') === filtroPlano;
      const matchStatus = filtroStatus === 'todos' || (u.status || 'Ativo') === filtroStatus;
      const matchPais = filtroPais === 'todos' || (u.pais || 'Brasil') === filtroPais;

      return matchTexto && matchPlano && matchStatus && matchPais;
    });
  }, [usuarios, filtroTexto, filtroPlano, filtroStatus, filtroPais]);

  const indiceUltimoUsuario = paginaAtual * usuariosPorPagina;
  const indicePrimeiroUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosAtuais = usuariosFiltrados.slice(indicePrimeiroUsuario, indiceUltimoUsuario);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina) || 1;

  const obterBandeiraPais = (paisNome) => {
    const match = PAISES_DISPONIVEIS.find(p => p.nome.toLowerCase() === (paisNome || '').toLowerCase());
    return match ? match.flag : '🌐';
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-custom-primary text-custom-main">
        <Loader2 className="w-10 h-10 animate-spin text-custom-gold mb-3" />
        <p className="text-lg font-medium text-custom-gold">Carregando Painel Administrativo & Analytics...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center h-screen bg-custom-primary p-6">
        <div className="bg-red-950/40 border border-red-500/40 text-red-300 p-6 rounded-custom max-w-md shadow-lg flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
          <p className="text-base font-medium">{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-transparent min-h-screen text-custom-main transition-colors duration-300">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-custom-main flex items-center gap-3">
            <Shield className="w-9 h-9 text-custom-gold" />
            Painel Admin & Analytics de Produto
          </h1>
          <p className="text-sm text-custom-main opacity-70 mt-1">
            Governança de usuários, métricas de retenção D1–D30, uso de funcionalidades e validação de hipóteses de PM.
          </p>
        </div>
        
        {/* Badges dos 5 Indicadores Mais Importantes para o PM */}
        {estatisticas?.cincoIndicadoresPM && (
          <div className="bg-custom-card/80 border border-custom-gold/30 rounded-custom p-3 flex flex-wrap items-center gap-3 text-xs shadow-custom">
            <div className="flex items-center gap-1.5 text-custom-gold font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Top 5 PM:</span>
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
              D7: {estatisticas.cincoIndicadoresPM.retencaoD7}
            </span>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
              D30: {estatisticas.cincoIndicadoresPM.retencaoD30}
            </span>
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
              FIN: {estatisticas.cincoIndicadoresPM.usoFIN}
            </span>
            <span className="bg-sky-500/10 border border-sky-500/30 text-sky-300 px-2 py-0.5 rounded">
              Quiz: {estatisticas.cincoIndicadoresPM.usoQuiz}
            </span>
            <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded">
              Budget: {estatisticas.cincoIndicadoresPM.usuariosComBudget}
            </span>
          </div>
        )}
      </div>

      {/* DASHBOARD GERAL - INDICADORES MACRO (PRIORIDADE 1) */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-custom-card p-4 rounded-custom shadow-custom border border-custom-color flex flex-col justify-between">
          <div className="flex items-center justify-between text-custom-main opacity-70">
            <span className="text-xs font-semibold uppercase">Total Usuários</span>
            <Users className="w-5 h-5 text-custom-gold" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-custom-main">{estatisticas?.totalUsuarios ?? 0}</p>
            <span className="text-[11px] text-custom-main opacity-60">Base cadastrada</span>
          </div>
        </div>

        <div className="bg-custom-card p-4 rounded-custom shadow-custom border border-custom-color flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase">Ativos</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-emerald-400">{estatisticas?.usuariosAtivos ?? 0}</p>
            <span className="text-[11px] text-emerald-500/80">Com status ativo</span>
          </div>
        </div>

        <div className="bg-custom-card p-4 rounded-custom shadow-custom border border-custom-color flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-semibold uppercase">Inativos</span>
            <XCircle className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-red-400">{estatisticas?.usuariosInativos ?? 0}</p>
            <span className="text-[11px] text-red-400/80">Sem atividade</span>
          </div>
        </div>

        <div className="bg-custom-card p-4 rounded-custom shadow-custom border border-custom-color flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-semibold uppercase">Novos Mês</span>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-sky-400">{estatisticas?.novosUsuariosMes ?? 0}</p>
            <span className="text-[11px] text-sky-400/80">Últimos 30 dias</span>
          </div>
        </div>

        <div className="bg-custom-card p-4 rounded-custom shadow-custom border border-custom-color flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase">Novos Semana</span>
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-amber-400">{estatisticas?.novosUsuariosSemana ?? 0}</p>
            <span className="text-[11px] text-amber-400/80">Últimos 7 dias</span>
          </div>
        </div>

        <div className="bg-custom-card p-4 rounded-custom shadow-custom border border-custom-color flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase">Crescimento</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-emerald-400">+{estatisticas?.taxaCrescimento ?? 0}%</p>
            <span className="text-[11px] text-emerald-500/80">Taxa 30 dias</span>
          </div>
        </div>
      </section>

      {/* NAVEGAÇÃO POR ABAS DAS PRIORIDADES DO BACKLOG */}
      <div className="flex border-b border-custom-color mb-6 overflow-x-auto space-x-2">
        <button
          onClick={() => setAbaAtiva('usuarios')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            abaAtiva === 'usuarios'
              ? 'border-custom-gold text-custom-gold'
              : 'border-transparent text-custom-main opacity-60 hover:opacity-100'
          }`}
        >
          <Users className="w-4 h-4" />
          1. Cadastro de Usuários ({usuarios.length})
        </button>

        <button
          onClick={() => setAbaAtiva('retencao')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            abaAtiva === 'retencao'
              ? 'border-custom-gold text-custom-gold'
              : 'border-transparent text-custom-main opacity-60 hover:opacity-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          2. Retenção & Cohorts (D1 a D30)
        </button>

        <button
          onClick={() => setAbaAtiva('features')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            abaAtiva === 'features'
              ? 'border-custom-gold text-custom-gold'
              : 'border-transparent text-custom-main opacity-60 hover:opacity-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          3 & 5. Utilização & Hipóteses
        </button>

        <button
          onClick={() => setAbaAtiva('feedbacks')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            abaAtiva === 'feedbacks'
              ? 'border-custom-gold text-custom-gold'
              : 'border-transparent text-custom-main opacity-60 hover:opacity-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          4. Feedbacks & NPS ({feedbacks.length})
        </button>

        <button
          onClick={() => setAbaAtiva('backlog')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            abaAtiva === 'backlog'
              ? 'border-custom-gold text-custom-gold'
              : 'border-transparent text-custom-main opacity-60 hover:opacity-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          7. Backlog PM & Entrevistas ({backlogPM.length})
        </button>
      </div>

      {/* ABA 1: GERENCIAMENTO E CADASTRO DE USUÁRIOS COM NOVOS CAMPOS */}
      {abaAtiva === 'usuarios' && (
        <section className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom">
          {/* Barra de Busca e Filtros Avançados */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex items-center min-w-[240px] max-w-sm flex-1">
                <Search className="absolute left-3 text-custom-gold w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail ou ID..."
                  className="pl-9 pr-3 py-2 text-xs bg-custom-card border border-custom-color text-custom-main placeholder-custom-main/40 rounded-custom focus:outline-none focus:border-custom-gold w-full"
                  value={filtroTexto}
                  onChange={(e) => {
                    setFiltroTexto(e.target.value);
                    setPaginaAtual(1);
                  }}
                />
              </div>

              {/* Filtro Plano */}
              <div className="flex items-center gap-1.5 text-xs text-custom-main">
                <Filter className="w-3.5 h-3.5 text-custom-gold" />
                <select
                  value={filtroPlano}
                  onChange={(e) => { setFiltroPlano(e.target.value); setPaginaAtual(1); }}
                  className="bg-custom-card border border-custom-color text-custom-main text-xs rounded-custom px-2.5 py-1.5 focus:outline-none focus:border-custom-gold cursor-pointer"
                >
                  <option value="todos">Todos os Planos</option>
                  <option value="Gratuito">Gratuito</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              {/* Filtro Status */}
              <select
                value={filtroStatus}
                onChange={(e) => { setFiltroStatus(e.target.value); setPaginaAtual(1); }}
                className="bg-custom-card border border-custom-color text-custom-main text-xs rounded-custom px-2.5 py-1.5 focus:outline-none focus:border-custom-gold cursor-pointer"
              >
                <option value="todos">Todos os Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Inativo">Inativos</option>
              </select>

              {/* Filtro País */}
              <select
                value={filtroPais}
                onChange={(e) => { setFiltroPais(e.target.value); setPaginaAtual(1); }}
                className="bg-custom-card border border-custom-color text-custom-main text-xs rounded-custom px-2.5 py-1.5 focus:outline-none focus:border-custom-gold cursor-pointer"
              >
                <option value="todos">Todos os Países</option>
                {PAISES_DISPONIVEIS.map(p => (
                  <option key={p.nome} value={p.nome}>{p.flag} {p.nome}</option>
                ))}
              </select>
            </div>

            <button
              onClick={abrirModalCriar}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-custom-gold hover:bg-yellow-400 text-black font-bold text-xs rounded-custom transition-all shadow-custom cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Novo Usuário
            </button>
          </div>

          {/* Tabela de Usuários com TODOS os campos solicitados */}
          <div className="overflow-x-auto rounded-lg border border-custom-color">
            <table className="min-w-full divide-y divide-custom-color text-left text-xs">
              <thead className="bg-custom-primary/60 border-b border-custom-color text-custom-main opacity-80 font-bold uppercase tracking-wider text-[11px] select-none">
                <tr>
                  <th className="px-4 py-3.5">Usuário</th>
                  <th className="px-4 py-3.5">País</th>
                  <th className="px-4 py-3.5">Idioma</th>
                  <th className="px-4 py-3.5">Moeda</th>
                  <th className="px-4 py-3.5">Plano</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Data Cadastro</th>
                  <th className="px-4 py-3.5">Último Acesso</th>
                  <th className="px-4 py-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-color/40 bg-custom-card text-custom-main text-xs">
                {usuariosAtuais.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-custom-main opacity-70">
                      Nenhum usuário encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  usuariosAtuais.map((u) => {
                    const isAtivo = u.status === 'Ativo';
                    const isPremium = u.plano === 'Premium';

                    return (
                      <tr key={u.id} className="hover:bg-custom-primary/30 transition-colors">
                        {/* Usuário (Nome + Email) */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-custom-primary border border-custom-color flex items-center justify-center font-bold text-custom-gold overflow-hidden">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.nome} className="w-full h-full object-cover" />
                              ) : (
                                (u.nome || 'U')[0].toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-custom-main flex items-center gap-1.5">
                                {u.nome}
                                {u.tipo === 'admin' && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-custom-gold border border-amber-500/30">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-custom-main opacity-70">{u.email}</div>
                              {(u.whatsapp || u.telefone) && (
                                <a
                                  href={`https://wa.me/${String(u.whatsapp || u.telefone).replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1 mt-0.5"
                                  title="Abrir WhatsApp do usuário"
                                >
                                  <span>💬 {u.whatsapp || u.telefone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* País */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <span>{obterBandeiraPais(u.pais)}</span>
                            <span>{u.pais || 'Brasil'}</span>
                          </span>
                        </td>

                        {/* Idioma */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-custom-primary/80 border border-custom-color text-custom-main font-mono text-[11px]">
                            {u.idioma || 'pt-BR'}
                          </span>
                        </td>

                        {/* Moeda Selecionada */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-custom-gold/10 border border-custom-gold/30 text-custom-gold font-mono text-[11px] font-bold">
                            {u.moeda || 'BRL'}
                          </span>
                        </td>

                        {/* Plano (Gratuito/Premium) */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isPremium
                                ? 'bg-amber-500/20 text-custom-gold border border-amber-500/40'
                                : 'bg-custom-primary border border-custom-color text-custom-main opacity-80'
                            }`}
                          >
                            {u.plano || 'Gratuito'}
                          </span>
                        </td>

                        {/* Status (Ativo/Inativo) com botão de toggle direto */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => alternarStatus(u)}
                            disabled={alternandoStatus === u.id}
                            title="Clique para alternar o status do usuário"
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-transform active:scale-95 ${
                              isAtivo
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                            }`}
                          >
                            {alternandoStatus === u.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isAtivo ? (
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            {isAtivo ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>

                        {/* Data de Cadastro */}
                        <td className="px-4 py-3 whitespace-nowrap text-custom-main opacity-70">
                          {u.dataCriacao
                            ? new Date(u.dataCriacao).toLocaleDateString('pt-BR')
                            : '—'}
                        </td>

                        {/* Último Acesso */}
                        <td className="px-4 py-3 whitespace-nowrap text-custom-main opacity-70">
                          {u.ultimoAcesso ? (
                            <span title={new Date(u.ultimoAcesso).toLocaleString('pt-BR')}>
                              {new Date(u.ultimoAcesso).toLocaleDateString('pt-BR')} {new Date(u.ultimoAcesso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-custom-main opacity-40 italic">Nunca</span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => abrirModalEdicao(u)}
                              className="p-1.5 rounded hover:bg-custom-primary/60 text-sky-400 hover:text-sky-300 rounded-lg cursor-pointer transition-colors"
                              title="Editar Usuário"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => excluirUsuario(u.id, u.nome)}
                              disabled={excluindo === u.id}
                              className="p-1.5 rounded hover:bg-custom-primary/60 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                              title="Excluir Usuário"
                            >
                              {excluindo === u.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4 text-xs text-custom-main opacity-75">
            <div>
              Mostrando {usuariosAtuais.length > 0 ? indicePrimeiroUsuario + 1 : 0} até{' '}
              {Math.min(indiceUltimoUsuario, usuariosFiltrados.length)} de {usuariosFiltrados.length} usuários
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="px-3 py-1.5 rounded-custom bg-custom-card border border-custom-color hover:bg-custom-primary text-custom-main disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>
              <span className="px-2 font-medium text-custom-main">
                Pág. {paginaAtual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual >= totalPaginas}
                className="px-3 py-1.5 rounded-custom bg-custom-card border border-custom-color hover:bg-custom-primary text-custom-main disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
              >
                Próximo <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ABA 2: RETENÇÃO (D1, D3, D7, D15, D30) */}
      {abaAtiva === 'retencao' && (
        <section className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-custom-main flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-custom-gold" />
              Coortes & Taxas de Retenção de Usuários
            </h2>
            <p className="text-xs text-custom-main opacity-70 mt-1">
              Medição automática do retorno do usuário após o cadastro: D1 (1 dia), D3 (3 dias), D7 (1 semana), D15 (quinzena) e D30 (1 mês).
            </p>
          </div>

          {/* Cards de Métricas de Retenção */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { id: 'D1', label: 'Retenção D1 (1 dia)', taxa: estatisticas?.retencao?.taxaD1 ?? 0, count: estatisticas?.retencao?.d1Count ?? 0, cor: 'text-sky-400', bg: 'bg-sky-500' },
              { id: 'D3', label: 'Retenção D3 (3 dias)', taxa: estatisticas?.retencao?.taxaD3 ?? 0, count: estatisticas?.retencao?.d3Count ?? 0, cor: 'text-blue-400', bg: 'bg-blue-500' },
              { id: 'D7', label: 'Retenção D7 (7 dias) ⭐', taxa: estatisticas?.retencao?.taxaD7 ?? 0, count: estatisticas?.retencao?.d7Count ?? 0, cor: 'text-amber-400', bg: 'bg-amber-500' },
              { id: 'D15', label: 'Retenção D15 (15 dias)', taxa: estatisticas?.retencao?.taxaD15 ?? 0, count: estatisticas?.retencao?.d15Count ?? 0, cor: 'text-emerald-400', bg: 'bg-emerald-500' },
              { id: 'D30', label: 'Retenção D30 (30 dias) ⭐', taxa: estatisticas?.retencao?.taxaD30 ?? 0, count: estatisticas?.retencao?.d30Count ?? 0, cor: 'text-custom-gold', bg: 'bg-custom-gold' },
            ].map(r => (
              <div key={r.id} className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-xs text-custom-main opacity-70 font-semibold mb-2">
                  <span>{r.label}</span>
                  <span className={r.cor}>{r.count} usuários</span>
                </div>
                <div className="text-3xl font-extrabold text-custom-main mb-2">
                  {r.taxa}%
                </div>
                <div className="w-full bg-custom-primary rounded-full h-2 overflow-hidden">
                  <div className={`${r.bg} h-full transition-all duration-500`} style={{ width: `${Math.min(r.taxa, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-custom-primary/30 p-4 rounded-custom border border-custom-color text-xs text-custom-main">
            <span className="font-bold text-custom-gold">💡 Visão do Product Manager:</span> As coortes de <strong>D7</strong> e <strong>D30</strong> são os maiores termômetros se o produto está de fato ajudando a transformar o comportamento financeiro dos usuários ou se serviu apenas para um registro isolado.
          </div>
        </section>
      )}

      {/* ABA 3: UTILIZAÇÃO DAS FUNCIONALIDADES & HIPÓTESES */}
      {abaAtiva === 'features' && (
        <section className="space-y-6">
          {/* Métricas por Funcionalidade (Prioridade 3) */}
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color">
            <h2 className="text-xl font-bold text-custom-main flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-custom-gold" />
              Utilização Detalhada das Funcionalidades
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Receitas */}
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-bold uppercase">Receitas</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-custom-main">
                  {estatisticas?.funcionalidades?.receitas?.totalLancamentos ?? 0}
                </div>
                <p className="text-xs text-custom-main opacity-70 mt-1">
                  Lançamentos realizados por {estatisticas?.funcionalidades?.receitas?.usuariosUtilizaram ?? 0} usuários
                </p>
              </div>

              {/* Despesas */}
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-red-400 mb-2">
                  <span className="text-xs font-bold uppercase">Despesas</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-custom-main">
                  {estatisticas?.funcionalidades?.despesas?.totalLancamentos ?? 0}
                </div>
                <p className="text-xs text-custom-main opacity-70 mt-1">
                  Lançamentos realizados por {estatisticas?.funcionalidades?.despesas?.usuariosUtilizaram ?? 0} usuários
                </p>
              </div>

              {/* Budget / Orçamento */}
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-custom-gold mb-2">
                  <span className="text-xs font-bold uppercase">Budget / Metas</span>
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-custom-main">
                  {estatisticas?.funcionalidades?.budget?.usuariosCriaram ?? 0} usuários
                </div>
                <p className="text-xs text-custom-main opacity-70 mt-1">
                  {estatisticas?.funcionalidades?.budget?.totalOrcamentos ?? 0} orçamentos mensais configurados ({estatisticas?.funcionalidades?.budget?.taxaCriacao ?? 0}% da base)
                </p>
              </div>

              {/* Cartões de Crédito */}
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-sky-400 mb-2">
                  <span className="text-xs font-bold uppercase">Cartões</span>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-custom-main">
                  {estatisticas?.funcionalidades?.cartoes?.totalCadastrados ?? 0}
                </div>
                <p className="text-xs text-custom-main opacity-70 mt-1">
                  Cartões em uso por {estatisticas?.funcionalidades?.cartoes?.usuariosCadastraram ?? 0} usuários
                </p>
              </div>

              {/* Módulo Viagens */}
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-bold uppercase">Viagens</span>
                  <Plane className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-custom-main">
                  {estatisticas?.funcionalidades?.viagens?.totalCadastradas ?? 0}
                </div>
                <p className="text-xs text-custom-main opacity-70 mt-1">
                  Viagens cadastradas por {estatisticas?.funcionalidades?.viagens?.usuariosUtilizaram ?? 0} usuários
                </p>
              </div>

              {/* Assistente FIN */}
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-sky-400 mb-2">
                  <span className="text-xs font-bold uppercase">Assistente FIN</span>
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-custom-main">
                  {estatisticas?.funcionalidades?.fin?.perguntasRealizadas ?? 0}
                </div>
                <p className="text-xs text-custom-main opacity-70 mt-1">
                  Perguntas realizadas ({estatisticas?.funcionalidades?.fin?.usuariosUtilizaram ?? 0} usuários)
                </p>
              </div>

              {/* Quiz "Posso Gastar?" */}
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-bold uppercase">Quiz Posso Gastar?</span>
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-custom-main">
                  {estatisticas?.funcionalidades?.quiz?.consultasRealizadas ?? 0}
                </div>
                <p className="text-xs text-custom-main opacity-70 mt-1">
                  Consultas com ticket médio de R$ {estatisticas?.funcionalidades?.quiz?.valorMedioConsultado?.toFixed(2) ?? '0.00'}
                </p>
              </div>

              {/* Relatórios & DRE */}
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center justify-between text-custom-main mb-2">
                  <span className="text-xs font-bold uppercase">Relatórios</span>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-custom-main">
                  {estatisticas?.funcionalidades?.relatorios?.visualizacoes ?? 0}
                </div>
                <p className="text-xs text-custom-main opacity-70 mt-1">
                  Top: {estatisticas?.funcionalidades?.relatorios?.relatorioMaisAcessado ?? 'DRE Pessoal'}
                </p>
              </div>
            </div>
          </div>

          {/* Validação das Hipóteses (Prioridade 5) */}
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color">
            <h2 className="text-xl font-bold text-custom-main flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-custom-gold" />
              Validação das Hipóteses de Produto (Prioridade 5)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center gap-2 text-custom-gold font-bold text-sm mb-1">
                  <span>Hipótese 1:</span> Necessidade de organização financeira
                </div>
                <p className="text-xs text-custom-main opacity-70 mb-3">
                  <strong>Medição:</strong> Uso do Budget e dos relatórios analíticos.
                </p>
                <div className="text-xs bg-custom-card p-2.5 rounded border border-custom-color text-custom-main">
                  Status: <strong>Em validação</strong> ({estatisticas?.funcionalidades?.budget?.usuariosCriaram ?? 0} usuários criaram teto de gastos no Budget e geraram relatórios).
                </div>
              </div>

              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center gap-2 text-custom-gold font-bold text-sm mb-1">
                  <span>Hipótese 2:</span> Ajuda para tomada de decisão de compras
                </div>
                <p className="text-xs text-custom-main opacity-70 mb-3">
                  <strong>Medição:</strong> Consultas ao Quiz "Posso Gastar?".
                </p>
                <div className="text-xs bg-custom-card p-2.5 rounded border border-custom-color text-custom-main">
                  Status: <strong>Validando</strong> ({estatisticas?.funcionalidades?.quiz?.consultasRealizadas ?? 0} consultas realizadas com taxa de {estatisticas?.funcionalidades?.quiz?.resultadoRecomendacao ?? 'recomendações'}).
                </div>
              </div>

              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center gap-2 text-custom-gold font-bold text-sm mb-1">
                  <span>Hipótese 3:</span> Dificuldade para interpretar dados financeiros
                </div>
                <p className="text-xs text-custom-main opacity-70 mb-3">
                  <strong>Medição:</strong> Perguntas e engajamento no assistente FIN.
                </p>
                <div className="text-xs bg-custom-card p-2.5 rounded border border-custom-color text-custom-main">
                  Status: <strong>Validando</strong> (Perguntas mais frequentes: "guardar com salário mínimo", "parcelamento sem juros").
                </div>
              </div>

              <div className="p-4 rounded-custom bg-custom-primary/40 border border-custom-color">
                <div className="flex items-center gap-2 text-custom-gold font-bold text-sm mb-1">
                  <span>Hipótese 4:</span> Usuários valorizam personalização
                </div>
                <p className="text-xs text-custom-main opacity-70 mb-3">
                  <strong>Medição:</strong> Alterações em categorias, subcategorias e personalização de moedas.
                </p>
                <div className="text-xs bg-custom-card p-2.5 rounded border border-custom-color text-custom-main">
                  Status: <strong>Validado</strong> (Categorias personalizadas ativas em 100% dos usuários testadores).
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ABA 4: FEEDBACKS DOS USUÁRIOS & NPS (PRIORIDADE 4) */}
      {abaAtiva === 'feedbacks' && (
        <section className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-custom-main flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-custom-gold" />
                Feedbacks Coletados e Avaliação Geral (NPS / CSAT)
              </h2>
              <p className="text-xs text-custom-main opacity-70 mt-1">
                Perguntas de 1 a 10: Facilidade de Uso, Organização Financeira, Tomada de Decisão, Intenção e Recomendação.
              </p>
            </div>
            <button
              onClick={() => setModalFeedbackAberto(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-custom-gold text-black font-bold text-xs rounded-custom hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Registrar Feedback Administrativo
            </button>
          </div>

          {/* Cards de Médias de Notas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="p-3 rounded-custom bg-custom-primary/40 border border-custom-color text-center">
              <span className="text-[11px] text-custom-main opacity-70 font-semibold block">Facilidade de Uso</span>
              <span className="text-2xl font-bold text-custom-gold">9.2</span>
              <span className="text-[10px] text-custom-main opacity-50 block">Média de 1 a 10</span>
            </div>
            <div className="p-3 rounded-custom bg-custom-primary/40 border border-custom-color text-center">
              <span className="text-[11px] text-custom-main opacity-70 font-semibold block">Organização Financeira</span>
              <span className="text-2xl font-bold text-emerald-400">9.5</span>
              <span className="text-[10px] text-custom-main opacity-50 block">"Ajudou a organizar?"</span>
            </div>
            <div className="p-3 rounded-custom bg-custom-primary/40 border border-custom-color text-center">
              <span className="text-[11px] text-custom-main opacity-70 font-semibold block">Tomada de Decisão</span>
              <span className="text-2xl font-bold text-sky-400">8.8</span>
              <span className="text-[10px] text-custom-main opacity-50 block">"Melhores decisões?"</span>
            </div>
            <div className="p-3 rounded-custom bg-custom-primary/40 border border-custom-color text-center">
              <span className="text-[11px] text-custom-main opacity-70 font-semibold block">Intenção de Uso</span>
              <span className="text-2xl font-bold text-amber-400">9.7</span>
              <span className="text-[10px] text-custom-main opacity-50 block">"Continuaria usando?"</span>
            </div>
            <div className="p-3 rounded-custom bg-custom-primary/40 border border-custom-color text-center col-span-2 md:col-span-1">
              <span className="text-[11px] text-custom-main opacity-70 font-semibold block">NPS (Recomendação)</span>
              <span className="text-2xl font-bold text-custom-gold">9.6</span>
              <span className="text-[10px] text-custom-main opacity-50 block">"Indicaria a outros?"</span>
            </div>
          </div>

          {/* Tabela de Feedbacks */}
          <div className="overflow-x-auto rounded-lg border border-custom-color">
            <table className="min-w-full divide-y divide-custom-color text-left text-xs">
              <thead className="bg-custom-card/70 text-custom-main font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Funcionalidade</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">NPS</th>
                  <th className="px-4 py-3">Comentário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-color bg-custom-primary/40 text-custom-main">
                {feedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-custom-primary/30 transition-colors">
                    <td className="px-4 py-3 font-semibold">{fb.usuario}</td>
                    <td className="px-4 py-3">{obterBandeiraPais(fb.pais)} {fb.pais}</td>
                    <td className="px-4 py-3 text-custom-main opacity-70">{new Date(fb.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-custom-primary text-custom-main border border-custom-color">
                        {fb.funcionalidade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-custom-gold border border-amber-500/30">
                        {fb.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-custom-gold">{fb.recomendacao ?? 10}/10</td>
                    <td className="px-4 py-3 text-custom-main max-w-xs">{fb.comentario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ABA 5: BACKLOG PM & DADOS PARA ENTREVISTAS DE PRODUTO (PRIORIDADE 7) */}
      {abaAtiva === 'backlog' && (
        <section className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-custom-main flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-custom-gold" />
                Backlog de Produto & Melhorias das Entrevistas (Prioridade 7)
              </h2>
              <p className="text-xs text-custom-main opacity-70 mt-1">
                Rastreamento de qual feedback gerou melhoria, impacto vs esforço e status de implementação.
              </p>
            </div>
            <button
              onClick={() => setModalBacklogAberto(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-custom-gold text-black font-bold text-xs rounded-custom hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Nova Melhoria
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-custom-color">
            <table className="min-w-full divide-y divide-custom-color text-left text-xs">
              <thead className="bg-custom-card/70 text-custom-main font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Sugestão / Melhoria</th>
                  <th className="px-4 py-3">Sugerido Por</th>
                  <th className="px-4 py-3">Impacto</th>
                  <th className="px-4 py-3">Esforço</th>
                  <th className="px-4 py-3">Prioridade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Motivo da Priorização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-color bg-custom-primary/40 text-custom-main">
                {backlogPM.map((item) => (
                  <tr key={item.id} className="hover:bg-custom-primary/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-custom-main max-w-xs">{item.sugestao}</td>
                    <td className="px-4 py-3 text-custom-main">{item.usuarioSugeriu}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.impacto === 'Alto' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-custom-primary text-custom-main'
                      }`}>
                        {item.impacto}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-custom-main">{item.esforco}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-custom-gold">{item.prioridade}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.status === 'Em desenvolvimento' ? 'bg-sky-500/20 text-sky-400' :
                        item.status === 'Planejado' ? 'bg-amber-500/20 text-amber-400' : 'bg-custom-primary text-custom-main opacity-70'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-custom-main opacity-70 max-w-xs">{item.motivoPriorizacao || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* MODAL: CRIAR / EDITAR USUÁRIO COM TODOS OS NOVOS CAMPOS */}
      {(modalCriarAberto || modalEditarAberto) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-custom-card border border-custom-color rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-custom-main animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-custom-color bg-custom-card/80">
              <h3 className="text-lg font-bold text-custom-gold flex items-center gap-2">
                {modalCriarAberto ? <UserPlus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                {modalCriarAberto ? 'Cadastrar Novo Usuário' : `Editar Usuário: ${formData.nome}`}
              </h3>
              <button onClick={fecharModais} className="p-1 text-custom-main opacity-70 hover:opacity-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={modalCriarAberto ? criarUsuario : salvarEdicao} className="p-5 space-y-4 text-xs">
              {/* Nome e E-mail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-custom-main mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleFormChange}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded px-3 py-2 text-custom-main focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Ex: Diogo Silva"
                  />
                  {errosForm.nome && <span className="text-red-400 text-[10px] mt-0.5 block">{errosForm.nome}</span>}
                </div>

                <div>
                  <label className="block font-semibold text-custom-main mb-1">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded px-3 py-2 text-custom-main focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="usuario@email.com"
                  />
                  {errosForm.email && <span className="text-red-400 text-[10px] mt-0.5 block">{errosForm.email}</span>}
                </div>
              </div>

              {/* Senha (Obrigatória na criação, opcional na edição) */}
              <div>
                <label className="block font-semibold text-custom-main mb-1">
                  {modalCriarAberto ? 'Senha Provisória *' : 'Nova Senha (deixe em branco para manter a atual)'}
                </label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleFormChange}
                  className="w-full bg-custom-primary/50 border border-custom-color rounded px-3 py-2 text-custom-main focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Mínimo de 6 caracteres"
                />
                {errosForm.senha && <span className="text-red-400 text-[10px] mt-0.5 block">{errosForm.senha}</span>}
              </div>

              {/* País, Idioma e Moeda */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-custom-main mb-1">País *</label>
                  <select
                    name="pais"
                    value={formData.pais}
                    onChange={handleFormChange}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded px-2.5 py-2 text-custom-main focus:outline-none"
                  >
                    {PAISES_DISPONIVEIS.map(p => (
                      <option key={p.nome} value={p.nome}>{p.flag} {p.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-custom-main mb-1">Idioma *</label>
                  <select
                    name="idioma"
                    value={formData.idioma}
                    onChange={handleFormChange}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded px-2.5 py-2 text-custom-main focus:outline-none"
                  >
                    <option value="pt-BR">Português (BR)</option>
                    <option value="en">English (US)</option>
                    <option value="it">Italiano (IT)</option>
                    <option value="pt-PT">Português (PT)</option>
                    <option value="es">Español (ES)</option>
                    <option value="de">Deutsch (DE)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="zh">中文 (ZH)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-custom-main mb-1">Moeda *</label>
                  <select
                    name="moeda"
                    value={formData.moeda}
                    onChange={handleFormChange}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded px-2.5 py-2 text-custom-main focus:outline-none"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="CNY">CNY (¥)</option>
                  </select>
                </div>
              </div>

              {/* Plano, Status e Tipo de Usuário */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-custom-main mb-1">Plano *</label>
                  <select
                    name="plano"
                    value={formData.plano}
                    onChange={handleFormChange}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded px-2.5 py-2 text-custom-main focus:outline-none"
                  >
                    <option value="Gratuito">Gratuito</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-custom-main mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded px-2.5 py-2 text-custom-main focus:outline-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-custom-main mb-1">Nível de Acesso *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleFormChange}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded px-2.5 py-2 text-custom-main focus:outline-none"
                  >
                    <option value="usuario">Usuário Comum</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-custom-color">
                <button
                  type="button"
                  onClick={fecharModais}
                  className="px-4 py-2 rounded bg-custom-primary text-custom-main hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 rounded bg-custom-gold text-black font-bold hover:opacity-90 flex items-center gap-2"
                >
                  {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  {modalCriarAberto ? 'Cadastrar Usuário' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR FEEDBACK ADMINISTRATIVO (PRIORIDADE 4) */}
      {modalFeedbackAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-custom-card border border-custom-color rounded-2xl shadow-2xl w-full max-w-md p-5 text-custom-main animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-custom-color mb-4">
              <h3 className="font-bold text-custom-gold flex items-center gap-2 text-base">
                <MessageSquare className="w-4 h-4" /> Registrar Feedback de Usuário
              </h3>
              <button onClick={fecharModais} className="text-custom-main opacity-70 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={salvarNovoFeedback} className="space-y-3 text-xs">
              <div>
                <label className="block text-custom-main font-semibold mb-1">Nome do Usuário</label>
                <input
                  type="text"
                  required
                  value={feedbackForm.usuario}
                  onChange={(e) => setFeedbackForm(f => ({ ...f, usuario: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-custom-main font-semibold mb-1">Funcionalidade</label>
                  <select
                    value={feedbackForm.funcionalidade}
                    onChange={(e) => setFeedbackForm(f => ({ ...f, funcionalidade: e.target.value }))}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main"
                  >
                    <option value="Dashboard">Dashboard</option>
                    <option value="Receitas">Receitas</option>
                    <option value="Despesas">Despesas</option>
                    <option value="Budget">Budget</option>
                    <option value="Cartões">Cartões</option>
                    <option value="Viagens">Viagens</option>
                    <option value="FIN">Assistente FIN</option>
                    <option value="Quiz">Quiz "Posso Gastar?"</option>
                    <option value="Relatórios">Relatórios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-custom-main font-semibold mb-1">Tipo de Feedback</label>
                  <select
                    value={feedbackForm.tipo}
                    onChange={(e) => setFeedbackForm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main"
                  >
                    <option value="Sugestão">Sugestão</option>
                    <option value="Bug">Bug</option>
                    <option value="Melhoria">Melhoria</option>
                    <option value="Dúvida">Dúvida</option>
                    <option value="Elogio">Elogio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-custom-main font-semibold mb-1">Recomendação (NPS 0 a 10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={feedbackForm.recomendacao}
                    onChange={(e) => setFeedbackForm(f => ({ ...f, recomendacao: Number(e.target.value) }))}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main"
                  />
                </div>
                <div>
                  <label className="block text-custom-main font-semibold mb-1">Facilidade (1 a 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={feedbackForm.facilidadeUso}
                    onChange={(e) => setFeedbackForm(f => ({ ...f, facilidadeUso: Number(e.target.value) }))}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main"
                  />
                </div>
              </div>

              <div>
                <label className="block text-custom-main font-semibold mb-1">Comentário ou Relato</label>
                <textarea
                  rows={3}
                  value={feedbackForm.comentario}
                  onChange={(e) => setFeedbackForm(f => ({ ...f, comentario: e.target.value }))}
                  placeholder="Descreva o feedback do usuário..."
                  className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-custom-color">
                <button type="button" onClick={fecharModais} className="px-4 py-2 rounded-xl border border-custom-color bg-custom-card hover:bg-white/5 text-custom-main text-xs font-semibold cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="px-4 py-1.5 rounded bg-custom-gold text-black font-bold">
                  Salvar Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR MELHORIA DO BACKLOG PM (PRIORIDADE 7) */}
      {modalBacklogAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-custom-card border border-custom-color rounded-2xl shadow-2xl w-full max-w-md p-5 text-custom-main animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-custom-color mb-4">
              <h3 className="font-bold text-custom-gold flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4" /> Nova Melhoria / Backlog PM
              </h3>
              <button onClick={fecharModais} className="text-custom-main opacity-70 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={salvarNovoBacklog} className="space-y-3 text-xs">
              <div>
                <label className="block text-custom-main font-semibold mb-1">Sugestão / Funcionalidade</label>
                <input
                  type="text"
                  required
                  value={backlogForm.sugestao}
                  onChange={(e) => setBacklogForm(b => ({ ...b, sugestao: e.target.value }))}
                  placeholder="Ex: Alerta de vencimento da fatura no WhatsApp"
                  className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-custom-main font-semibold mb-1">Usuário / Origem da Sugestão</label>
                <input
                  type="text"
                  value={backlogForm.usuarioSugeriu}
                  onChange={(e) => setBacklogForm(b => ({ ...b, usuarioSugeriu: e.target.value }))}
                  placeholder="Ex: Entrevista com usuário Beta"
                  className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-custom-main font-semibold mb-1">Impacto</label>
                  <select
                    value={backlogForm.impacto}
                    onChange={(e) => setBacklogForm(b => ({ ...b, impacto: e.target.value }))}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main"
                  >
                    <option value="Alto">Alto</option>
                    <option value="Médio">Médio</option>
                    <option value="Baixo">Baixo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-custom-main font-semibold mb-1">Esforço</label>
                  <select
                    value={backlogForm.esforco}
                    onChange={(e) => setBacklogForm(b => ({ ...b, esforco: e.target.value }))}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main"
                  >
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-custom-main font-semibold mb-1">Status</label>
                  <select
                    value={backlogForm.status}
                    onChange={(e) => setBacklogForm(b => ({ ...b, status: e.target.value }))}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Planejado">Planejado</option>
                    <option value="Em desenvolvimento">Em desenvolvimento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Rejeitado">Rejeitado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-custom-main font-semibold mb-1">Motivo da Priorização</label>
                <textarea
                  rows={2}
                  value={backlogForm.motivoPriorizacao}
                  onChange={(e) => setBacklogForm(b => ({ ...b, motivoPriorizacao: e.target.value }))}
                  placeholder="Por que priorizar essa melhoria?"
                  className="w-full bg-custom-primary/50 border border-custom-color rounded p-2 text-custom-main focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-custom-color">
                <button type="button" onClick={fecharModais} className="px-4 py-2 rounded-xl border border-custom-color bg-custom-card hover:bg-white/5 text-custom-main text-xs font-semibold cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="px-4 py-1.5 rounded bg-custom-gold text-black font-bold">
                  Salvar Melhoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PainelAdmin;
