import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEdu } from '../contexts/EduContext';
import { useTheme } from '../components/theme-provider';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLayoutVariant } from '../contexts/LayoutVariantContext';
import { useLevel } from '../contexts/LevelContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import CurrencySelector from '../components/CurrencySelector';
import TransferenciaInternaModal from '../components/TransferenciaInternaModal';
import { toast } from 'sonner';
import {
  Wallet, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownRight, DollarSign, Calendar,
  GraduationCap, PiggyBank, Target, FileSpreadsheet,
  Sprout, PlusCircle, MinusCircle, Sparkles, Sliders, Check, Bell, X,
  ArrowLeftRight, Edit3, RotateCcw, ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { removeDuplicates } from '../utils/arrayUtils';
import ImportadorPlanilhaModal from '../components/ImportadorPlanilhaModal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Detectores contábeis para evitar duplicidade de caixa ("Reserva Mês Anterior" / "Retirada Reserva")
const isCarryoverDuplicado = (desc = '') => /reserva\s+m[eê]s\s+anterior/i.test(String(desc).trim());
const isResgateReserva = (desc = '') => /retirad[ao]\s+(da\s+)?reserva/i.test(String(desc).trim());

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const { showLesson, updateFinancialData } = useEdu();
  const { layoutVariant } = useLayoutVariant();
  const { currentLevel, openOnboardingModal, openLevelModal } = useLevel();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    receitas: [],
    despesas: []
  });
  const [transferencias, setTransferencias] = useState([]);
  const [ajustesCaixa, setAjustesCaixa] = useState({});
  const [editandoSaldoAnterior, setEditandoSaldoAnterior] = useState(false);
  const [valorSaldoAnteriorInput, setValorSaldoAnteriorInput] = useState('');
  const [mostrarModalTransferencia, setMostrarModalTransferencia] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [mostrarImportador, setMostrarImportador] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));

  const meses = [
    { valor: '01', nome: 'Janeiro' },
    { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' },
    { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' },
    { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' },
    { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' }
  ];

  // Lembrete Diário In-App (se ativado nas preferências)
  const hojeChave = new Date().toISOString().split('T')[0];
  const [lembreteDispensado, setLembreteDispensado] = useState(() => {
    return localStorage.getItem(`financas_lembrete_dispensado_${hojeChave}`) === 'true';
  });

  const dispensarLembrete = () => {
    setLembreteDispensado(true);
    localStorage.setItem(`financas_lembrete_dispensado_${hojeChave}`, 'true');
  };

  const deveExibirLembreteDiario = useMemo(() => {
    if (lembreteDispensado) return false;
    let configAtiva = true;
    try {
      const saved = localStorage.getItem('financas_notificacoes_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lembreteDiarioInApp === false) configAtiva = false;
      }
    } catch (e) {
      // usa true como padrão
    }

    if (!configAtiva) return false;

    const temReceitaHoje = (financialData?.receitas || []).some(r => r.data && String(r.data).startsWith(hojeChave));
    const temDespesaHoje = (financialData?.despesas || []).some(d => d.data && String(d.data).startsWith(hojeChave));

    return !temReceitaHoje && !temDespesaHoje;
  }, [financialData, lembreteDispensado, hojeChave]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('importar') === '1') {
      setMostrarImportador(true);
    }
  }, [location.search]);

  const gerarListaAnos = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual - 5; i <= anoAtual + 2; i++) {
      anos.push(i.toString());
    }
    return anos;
  };

  const loadData = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};

      const receitas = Array.isArray(userData.receitas) ? userData.receitas : [];
      const despesas = Array.isArray(userData.despesas) ? userData.despesas : [];
      const userTransferencias = Array.isArray(userData.transferencias) ? userData.transferencias : [];
      const userAjustesCaixa = userData.ajustesCaixa && typeof userData.ajustesCaixa === 'object' ? userData.ajustesCaixa : {};
      const userOrcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];

      setFinancialData({
        receitas,
        despesas
      });
      setTransferencias(userTransferencias);
      setAjustesCaixa(userAjustesCaixa);
      setOrcamentos(userOrcamentos);

      // Carregar categorias do usuário ou usar padrão
      if (userData.categorias && userData.categorias.length > 0) {
        const categoriasUnicas = removeDuplicates(userData.categorias, 'nome');
        setCategorias(categoriasUnicas);
      } else {
        setCategorias([
          { nome: 'Despesas Fixas', cor: '#EF4444' },
          { nome: 'Lazer', cor: '#3B82F6' },
          { nome: 'Educação', cor: '#10B981' },
          { nome: 'Investimentos', cor: '#8B5CF6' },
          { nome: 'Reserva de Emergência', cor: '#F59E0B' }
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setFinancialData({
        receitas: [],
        despesas: []
      });
      setLoading(false);
    }
  };

  // Lançamentos antigos de Reserva Mês Anterior / Retirada Reserva detectados
  const lancamentosDuplicadosDetectados = useMemo(() => {
    return (financialData.receitas || []).filter(
      r => isCarryoverDuplicado(r.descricao) || isResgateReserva(r.descricao)
    );
  }, [financialData.receitas]);

  const handleExcluirDuplicadosDefinitivo = async () => {
    if (!window.confirm(
      `Encontrados ${lancamentosDuplicadosDetectados.length} lançamento(s) de "Reserva Mês Anterior / Retirada Reserva" na aba de Receitas.\n\nDeseja remover esses lançamentos duplicados das Receitas (mantendo os resgates registrados apenas como Transferência Interna)?`
    )) {
      return;
    }
    try {
      const receitasLimpas = (financialData.receitas || []).filter(
        r => !isCarryoverDuplicado(r.descricao) && !isResgateReserva(r.descricao)
      );
      await api.post('/user/dados', { receitas: receitasLimpas });
      setFinancialData(prev => ({ ...prev, receitas: receitasLimpas }));
      toast.success('Lançamentos duplicados removidos com sucesso! Seu faturamento agora reflete 100% sua renda real.');
    } catch (err) {
      toast.error('Erro ao limpar lançamentos duplicados.');
    }
  };

  const handleSaveTransferencias = async (novaLista) => {
    await api.post('/user/dados', { transferencias: novaLista });
    setTransferencias(novaLista);
  };

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const calculateTotal = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
  };

  // Mês efetivo da receita (suporta Competência Salarial Quinzenal, ex: Adiantamento Dia 20/Out -> Competência 2026-11)
  const getChaveMesReceita = (r) => {
    if (r.competenciaMes) return String(r.competenciaMes).slice(0, 7);
    if (!r.data) return '';
    return String(r.data).slice(0, 7);
  };

  const getChaveMesDespesa = (d) => {
    if (!d.data) return '';
    return String(d.data).slice(0, 7);
  };

  const mesChave = `${anoSelecionado}-${mesSelecionado}`;

  const receitasFiltradas = useMemo(() => {
    return (financialData.receitas || []).filter(r => getChaveMesReceita(r) === mesChave);
  }, [financialData.receitas, mesChave]);

  const despesasFiltradas = useMemo(() => {
    return (financialData.despesas || []).filter(d => getChaveMesDespesa(d) === mesChave);
  }, [financialData.despesas, mesChave]);

  // Receitas do Mês (preserva 100% do que foi lançado pelo usuário; só ignora se o usuário desmarcou somarNoOrcamento)
  const receitasReaisDoMes = useMemo(() => {
    return receitasFiltradas.filter(r => r.somarNoOrcamento !== false);
  }, [receitasFiltradas]);

  const totalReceitas = calculateTotal(receitasReaisDoMes);
  const totalDespesas = calculateTotal(despesasFiltradas.filter(d => d.somarNoOrcamento !== false));

  // Cálculo Automático do "Sobrou do Mês Anterior (Seu Caixa Livre)"
  const saldoAnteriorCalculado = useMemo(() => {
    const recAnteriores = (financialData.receitas || [])
      .filter(r => {
        const m = getChaveMesReceita(r);
        return m && m < mesChave && r.somarNoOrcamento !== false && !isCarryoverDuplicado(r.descricao) && !isResgateReserva(r.descricao);
      })
      .reduce((acc, r) => acc + (parseFloat(r.valor) || 0), 0);

    const despAnteriores = (financialData.despesas || [])
      .filter(d => {
        const m = getChaveMesDespesa(d);
        return m && m < mesChave && d.somarNoOrcamento !== false;
      })
      .reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);

    return Math.max(0, recAnteriores - despAnteriores);
  }, [financialData.receitas, financialData.despesas, mesChave]);

  const temAjusteManualSaldoAnterior = ajustesCaixa[mesChave] !== undefined && ajustesCaixa[mesChave] !== null && ajustesCaixa[mesChave] !== '';
  const saldoAnteriorEfetivo = temAjusteManualSaldoAnterior
    ? (parseFloat(ajustesCaixa[mesChave]) || 0)
    : saldoAnteriorCalculado;

  const salvarAjusteSaldoAnterior = async () => {
    const val = valorSaldoAnteriorInput === '' ? null : (parseFloat(valorSaldoAnteriorInput) || 0);
    const novosAjustes = { ...ajustesCaixa };
    if (val === null) {
      delete novosAjustes[mesChave];
    } else {
      novosAjustes[mesChave] = val;
    }
    try {
      await api.post('/user/dados', { ajustesCaixa: novosAjustes });
      setAjustesCaixa(novosAjustes);
      setEditandoSaldoAnterior(false);
      toast.success('Saldo transportado do mês anterior atualizado!');
    } catch (err) {
      toast.error('Erro ao salvar ajuste de saldo anterior.');
    }
  };

  const restaurarSaldoAnteriorAutomatico = async () => {
    const novosAjustes = { ...ajustesCaixa };
    delete novosAjustes[mesChave];
    try {
      await api.post('/user/dados', { ajustesCaixa: novosAjustes });
      setAjustesCaixa(novosAjustes);
      setEditandoSaldoAnterior(false);
      toast.info('Cálculo automático do saldo anterior restaurado.');
    } catch (err) {
      toast.error('Erro ao restaurar cálculo automático.');
    }
  };

  // Transferências internas do mês selecionado
  const transferenciasDoMes = useMemo(() => {
    return (transferencias || []).filter(t => t.data && String(t.data).startsWith(mesChave));
  }, [transferencias, mesChave]);

  // Calcular totais por categoria dinamicamente
  const categoriasTotais = categorias.map(cat => {
    const total = despesasFiltradas
      .filter(d => d.categoria === cat.nome && d.somarNoOrcamento !== false)
      .reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);
    return { ...cat, total };
  }).filter(cat => cat.total > 0);

  // Atualizar dados do mascote com base nos valores filtrados
  useEffect(() => {
    if (!loading) {
      updateFinancialData(totalReceitas, totalDespesas);
    }
  }, [loading, totalReceitas, totalDespesas, updateFinancialData]);

  const getHistoricalData = () => {
    const data = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesStr = String(d.getMonth() + 1).padStart(2, '0');
      const anoStr = String(d.getFullYear());
      const chave = `${anoStr}-${mesStr}`;

      const totalRec = (financialData.receitas || [])
        .filter(r => getChaveMesReceita(r) === chave && r.somarNoOrcamento !== false && !isCarryoverDuplicado(r.descricao) && !isResgateReserva(r.descricao))
        .reduce((acc, curr) => acc + Number(curr.valor), 0);

      const totalDes = (financialData.despesas || [])
        .filter(d => getChaveMesDespesa(d) === chave && d.somarNoOrcamento !== false)
        .reduce((acc, curr) => acc + Number(curr.valor), 0);

      data.push({
        name: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
        Receitas: totalRec,
        Despesas: totalDes,
        Saldo: totalRec - totalDes
      });
    }
    return data;
  };

  // Resultado puro do mês vs. Dinheiro Disponível em Caixa Hoje (contando o que sobrou do mês anterior)
  const saldoFinalMes = totalReceitas - totalDespesas;
  const dinheiroDisponivelCaixa = saldoAnteriorEfetivo + totalReceitas - totalDespesas;
  const percentualSobra = totalReceitas > 0 ? ((saldoFinalMes / totalReceitas) * 100) : 0;

  const pieData = [
    ...categoriasTotais.map(cat => ({
      name: cat.nome,
      value: cat.total,
      color: cat.cor
    })),
    { name: 'Saldo', value: dinheiroDisponivelCaixa > 0 ? dinheiroDisponivelCaixa : 0, color: 'var(--accent-gold)' }
  ].filter(item => item.value > 0);

  const isIniciante = currentLevel === 'iniciante';

  // Metas por Categoria para o Mês Selecionado
  const orcamentoDoMes = orcamentos.find(o => o.mes === mesChave);

  const metasCategorias = categorias.map(cat => {
    const catOrcamento = orcamentoDoMes?.categorias?.find(c => c.nome === cat.nome);
    let tipoMeta = catOrcamento?.tipoMeta || cat.tipoMeta || 'percentual';
    let metaValor = 0;
    let percentualMeta = 0;

    const baseRenda = parseFloat(orcamentoDoMes?.rendaReal) || totalReceitas || 0;

    if (catOrcamento) {
      if (tipoMeta === 'valor') {
        metaValor = parseFloat(catOrcamento.valorPlanejado) || 0;
        percentualMeta = baseRenda > 0 ? parseFloat(((metaValor / baseRenda) * 100).toFixed(1)) : 0;
      } else {
        percentualMeta = parseFloat(catOrcamento.percentual) || 0;
        metaValor = baseRenda > 0 ? (baseRenda * percentualMeta) / 100 : (parseFloat(catOrcamento.valorPlanejado) || 0);
      }
    } else if (cat.valorMeta !== null && cat.valorMeta !== undefined && cat.valorMeta !== '') {
      if (tipoMeta === 'valor') {
        metaValor = parseFloat(cat.valorMeta) || 0;
        percentualMeta = baseRenda > 0 ? parseFloat(((metaValor / baseRenda) * 100).toFixed(1)) : 0;
      } else {
        percentualMeta = parseFloat(cat.valorMeta) || 0;
        metaValor = baseRenda > 0 ? (baseRenda * percentualMeta) / 100 : 0;
      }
    }

    const gastoAtual = despesasFiltradas
      .filter(d => d.categoria === cat.nome && d.somarNoOrcamento !== false)
      .reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);

    const percentualConsumido = metaValor > 0 ? (gastoAtual / metaValor) * 100 : 0;

    return {
      nome: cat.nome,
      cor: cat.cor,
      tipoMeta,
      metaValor,
      percentualMeta,
      gastoAtual,
      percentualConsumido,
      temMeta: metaValor > 0
    };
  }).filter(c => c.temMeta);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 transition-custom">
      {/* Cabeçalho com Filtro de Mês/Ano — mobile-first */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-custom-main">Dashboard</h2>
          <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm md:text-base">
            A história completa do seu dinheiro no mês — simples, clara e sem duplicidades
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão Transferência Interna entre Contas/Reserva */}
          <button
            type="button"
            onClick={() => setMostrarModalTransferencia(true)}
            className="h-11 px-4 bg-custom-gold text-black hover:opacity-90 rounded-full shadow-custom flex items-center gap-2 text-xs md:text-sm font-bold transition cursor-pointer flex-shrink-0"
            title="Transferir dinheiro entre Conta Corrente e Reserva sem inflar Receitas ou Despesas"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transferir Conta ⇄ Reserva</span>
          </button>

          {/* Botão Importar Planilha */}
          <button
            type="button"
            onClick={() => setMostrarImportador(true)}
            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-custom flex items-center gap-2 text-xs md:text-sm font-semibold transition cursor-pointer flex-shrink-0"
            title="Importar planilha de receitas e despesas"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar Planilha</span>
          </button>
          <CurrencySelector />

          {/* Filtro de Mês/Ano */}
          <div className="h-11 flex items-center gap-2 bg-custom-card text-custom-main px-4 rounded-full shadow-custom border border-custom-color w-full sm:w-auto transition-custom">
            <Calendar className="w-4 h-4 text-custom-gold flex-shrink-0" />
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="py-1 border-0 focus:ring-0 bg-transparent font-medium text-custom-main text-sm cursor-pointer capitalize"
            >
              {meses.map(mes => (
                <option key={mes.valor} value={mes.valor} className="bg-custom-card text-custom-main">{t(mes.nome)}</option>
              ))}
            </select>
            <span className="text-custom-main opacity-30 select-none">|</span>
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              className="py-1 border-0 focus:ring-0 bg-transparent font-medium text-custom-main text-sm w-18 cursor-pointer"
            >
              {gerarListaAnos().map(ano => (
                <option key={ano} value={ano} className="bg-custom-card text-custom-main">{ano}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Aviso Consultivo Opcional (preserva 100% dos lançamentos originais e deixa a decisão com o usuário) */}
      {lancamentosDuplicadosDetectados.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-custom-main">
                Seus lançamentos foram 100% preservados ({lancamentosDuplicadosDetectados.length} registro(s) de Reserva identificados)
              </h4>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">
                Lançamentos como <strong>"Reserva Mês Anterior"</strong> ou <strong>"Retirada Reserva"</strong> permanecem intactos como você lançou. Você pode editá-los manualmente em Receitas quando desejar.
              </p>
            </div>
          </div>
          <Link
            to="/receitas"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs whitespace-nowrap transition cursor-pointer self-end sm:self-auto"
          >
            Revisar em Receitas
          </Link>
        </div>
      )}

      {/* Lembrete Diário In-App */}
      {deveExibirLembreteDiario && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-custom-main flex items-center gap-2">
                Lembrete do Dia
                <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full font-semibold">
                  Registro Rápido
                </span>
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                Você teve alguma entrada ou saída hoje? Anotar agora leva menos de 30 segundos!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <Link
              to="/receitas"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              + Entrada
            </Link>
            <Link
              to="/despesas"
              className="px-3 py-1.5 rounded-lg bg-custom-gold text-black hover:bg-yellow-400 text-xs font-bold transition-colors shadow-xs"
            >
              - Saída
            </Link>
            <button
              type="button"
              onClick={dispensarLembrete}
              className="p-1.5 text-gray-400 hover:text-custom-main rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dispensar lembrete por hoje"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Banner de Boas-Vindas & Ações Rápidas do Modo Iniciante */}
      {isIniciante && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center font-bold text-lg flex-shrink-0 mt-0.5">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-custom-main">Modo Iniciante Ativo</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    Foco no Essencial
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 max-w-xl">
                  Seu controle começa simples: veja o que <strong>Sobrou do Mês Passado</strong>, o que <strong>Entrou</strong> e o que <strong>Saiu</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/receitas"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Registrar Entrada
              </Link>
              <Link
                to="/despesas"
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <MinusCircle className="w-4 h-4" />
                Registrar Saída
              </Link>
              <button
                type="button"
                onClick={openOnboardingModal}
                className="px-3 py-2 rounded-xl border border-custom-color hover:bg-gray-100 dark:hover:bg-slate-800 text-custom-main text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Configurar estimativa de renda e metas"
              >
                <Sparkles className="w-3.5 h-3.5 text-custom-gold" />
                Questionário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* A HISTÓRIA DO SEU DINHEIRO NO MÊS (5 CARTÕES ALINHADOS LADO A LADO)   */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* CARD 1: SOBROU DO MÊS ANTERIOR (SEU CAIXA LIVRE) */}
        <div className="bg-custom-card rounded-custom shadow-custom border border-amber-500/30 overflow-hidden transition-custom hover:-translate-y-0.5 hover:shadow-lg duration-300">
          <div className="p-4 space-y-2 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    💰 Sobrou do Mês Anterior
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  Seu Caixa Livre (Capital de Giro)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValorSaldoAnteriorInput(String(saldoAnteriorEfetivo.toFixed(2)));
                  setEditandoSaldoAnterior(!editandoSaldoAnterior);
                }}
                className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                title="Ajustar manualmente o saldo transportado do mês anterior"
              >
                <Edit3 className="w-3 h-3" />
                <span className="text-[10px]">Ajustar</span>
              </button>
            </div>

            {editandoSaldoAnterior ? (
              <div className="pt-1 space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    value={valorSaldoAnteriorInput}
                    onChange={(e) => setValorSaldoAnteriorInput(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-amber-500 bg-white dark:bg-slate-900 text-xs font-bold text-custom-main"
                    placeholder="Ex: 1090.00"
                  />
                  <button
                    type="button"
                    onClick={salvarAjusteSaldoAnterior}
                    className="px-2 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
                {temAjusteManualSaldoAnterior && (
                  <button
                    type="button"
                    onClick={restaurarSaldoAnteriorAutomatico}
                    className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Restaurar cálculo automático ({formatCurrency(saldoAnteriorCalculado)})
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 truncate">
                  {formatCurrency(saldoAnteriorEfetivo)}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                  {temAjusteManualSaldoAnterior
                    ? 'Valor ajustado manualmente para este mês'
                    : 'Transportado automaticamente sem inflar receitas'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: ENTROU ESTE MÊS (SALÁRIO + EXTRAS REAIS) */}
        <div className="bg-custom-card rounded-custom shadow-custom border border-custom-color overflow-hidden transition-custom hover:-translate-y-0.5 hover:shadow-lg duration-300">
          <div className="p-4 space-y-2 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  📈 Entrou Este Mês
                </span>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  Salário + Adiantamento + Extras Reais
                </p>
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp size={16} />
              </div>
            </div>
            <div>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                {formatCurrency(totalReceitas)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                Renda pura do mês (sem duplicar sobra anterior)
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: SAIU ESTE MÊS (DESPESAS) */}
        <div className="bg-custom-card rounded-custom shadow-custom border border-custom-color overflow-hidden transition-custom hover:-translate-y-0.5 hover:shadow-lg duration-300">
          <div className="p-4 space-y-2 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">
                  📉 Saiu Este Mês
                </span>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  Contas Fixas, Faturas e Gastos
                </p>
              </div>
              <div className="p-1.5 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
                <TrendingDown size={16} />
              </div>
            </div>
            <div>
              <p className="text-xl font-extrabold text-red-600 dark:text-red-400 truncate">
                {formatCurrency(totalDespesas)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                Resultado isolado do mês: {formatCurrency(saldoFinalMes)}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 4: DINHEIRO DISPONÍVEL NO CAIXA HOJE */}
        <div className="bg-custom-card rounded-custom shadow-custom border-2 border-emerald-500/40 overflow-hidden transition-custom hover:-translate-y-0.5 hover:shadow-lg duration-300">
          <div className="p-4 space-y-2 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-custom-gold block">
                  🟢 Disponível no Caixa Hoje
                </span>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  Sobrou ({formatCurrency(saldoAnteriorEfetivo)}) + Entrou - Saiu
                </p>
              </div>
              <div className="p-1.5 rounded-xl bg-custom-gold/20 text-custom-gold shrink-0">
                <Wallet size={16} />
              </div>
            </div>
            <div>
              <p className={`text-xl font-extrabold truncate ${
                dinheiroDisponivelCaixa >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(dinheiroDisponivelCaixa)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                Fôlego real somando seu Capital de Giro
              </p>
            </div>
          </div>
        </div>

        {/* CARD 5: PERFORMANCE DA RENDA NO MÊS (ENTROU VS. SAIU) AO LADO DO DISPONÍVEL NO CAIXA */}
        <div className="bg-custom-card rounded-custom shadow-custom border border-custom-color overflow-hidden transition-custom hover:-translate-y-0.5 hover:shadow-lg duration-300">
          <div className="p-4 space-y-2 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block">
                  Performance da Renda no Mês
                </span>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  Entrou vs. Saiu ({percentualSobra >= 20 ? 'Excelente!' : percentualSobra >= 10 ? 'Bom' : percentualSobra >= 0 ? 'Equilibrado' : 'Capital de Giro'})
                </p>
              </div>
              <span className="text-xl leading-none shrink-0" title={percentualSobra >= 20 ? 'Excelente!' : percentualSobra >= 10 ? 'Bom' : percentualSobra >= 0 ? 'Equilibrado' : 'Usando Capital de Giro'}>
                {percentualSobra >= 20 ? '🎉' : percentualSobra >= 10 ? '👍' : percentualSobra >= 0 ? '⚠️' : '🛡️'}
              </span>
            </div>
            <div>
              <p className={`text-xl font-extrabold truncate ${
                percentualSobra >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPercent(percentualSobra)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-1" title={
                saldoFinalMes >= 0
                  ? `Sua renda do mês superou os gastos em ${formatCurrency(saldoFinalMes)}`
                  : `Suas despesas do mês consumiram ${formatCurrency(Math.abs(saldoFinalMes))} do seu caixa anterior`
              }>
                {saldoFinalMes >= 0
                  ? `Superou gastos em ${formatCurrency(saldoFinalMes)}`
                  : `Consumiu ${formatCurrency(Math.abs(saldoFinalMes))} do caixa anterior`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metas por Categoria do Mês */}
      {metasCategorias.length > 0 && (
        <div className="bg-custom-card rounded-custom shadow-custom p-5 md:p-6 border border-custom-color transition-custom">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-custom bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Target size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wider uppercase text-custom-gold">Metas por Categoria</h3>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Acompanhamento dos limites planejados para o mês</p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {metasCategorias.filter(m => m.percentualConsumido <= 100).length} de {metasCategorias.length} dentro da meta
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metasCategorias.map((item) => {
              const isOver = item.percentualConsumido > 100;
              const isNear = item.percentualConsumido >= 80 && !isOver;
              const barWidth = Math.min(item.percentualConsumido, 100);

              const statusColor = isOver
                ? 'text-red-600 dark:text-red-400'
                : isNear
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400';

              const barBgColor = isOver
                ? 'bg-red-500'
                : isNear
                ? 'bg-amber-500'
                : 'bg-emerald-500';

              const badgeBg = isOver
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
                : isNear
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

              return (
                <div
                  key={item.nome}
                  className="p-3.5 rounded-custom border border-custom-color bg-gray-50/50 dark:bg-slate-800/40 hover:border-gray-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.cor || '#3B82F6' }}
                      />
                      <span className="font-semibold text-xs md:text-sm text-custom-main truncate" title={item.nome}>
                        {item.nome}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {item.percentualConsumido.toFixed(0)}%
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-2.5 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${barBgColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  {/* Detalhes de Valores */}
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 dark:text-slate-400 block">Gasto</span>
                      <span className="font-semibold text-custom-main">{formatCurrency(item.gastoAtual)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 dark:text-slate-400 block">
                        Meta {item.tipoMeta === 'percentual' && item.percentualMeta > 0 ? `(${item.percentualMeta}%)` : ''}
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-slate-300">{formatCurrency(item.metaValor)}</span>
                    </div>
                  </div>

                  {/* Mensagem de alerta / status */}
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                    <span className={`font-medium ${statusColor}`}>
                      {isOver ? 'Excedeu a meta' : isNear ? 'Próximo do limite' : 'Dentro da meta'}
                    </span>
                    <span className="text-gray-400 text-[10px]">
                      {isOver
                        ? `+${formatCurrency(item.gastoAtual - item.metaValor)}`
                        : `Resta ${formatCurrency(Math.max(0, item.metaValor - item.gastoAtual))}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráfico de Evolução Mensal (Fluxo de Caixa Premium) */}
      <div className="bg-custom-card rounded-custom shadow-custom overflow-hidden border border-custom-color transition-custom">
        <div className="p-6 border-b border-custom-color flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase text-custom-gold">Evolução Mensal (Fluxo de Caixa Real)</h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Receitas Reais vs Despesas nos últimos 6 meses</p>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getHistoricalData()}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(212,175,55,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
              <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-style)', border: '1px solid var(--border-color)' }} formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Receitas" stroke="var(--accent-gold)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReceitas)" />
              <Area type="monotone" dataKey="Despesas" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Gráfico de Pizza */}
        <div className="bg-custom-card rounded-custom shadow-custom overflow-hidden border border-custom-color transition-custom">
          <div className="p-6 border-b border-custom-color">
            <h3 className="text-xs font-bold tracking-wider uppercase text-custom-gold">Distribuição de Gastos</h3>
          </div>
          <div className="p-6">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="var(--accent-gold)"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-style)', border: '1px solid var(--border-color)' }} formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-slate-500">
                Sem dados de despesas para este ano
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="bg-custom-card rounded-custom shadow-custom overflow-hidden border border-custom-color transition-custom">
          <div className="p-6 border-b border-custom-color">
            <h3 className="text-xs font-bold tracking-wider uppercase text-custom-gold">Gastos por Categoria</h3>
          </div>
          <div className="p-6">
            {categoriasTotais.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoriasTotais} layout="vertical">
                  <XAxis type="number" tickFormatter={(value) => `R$${value}`} stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                  <YAxis dataKey="nome" type="category" width={100} stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-style)', border: '1px solid var(--border-color)' }} formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="var(--accent-gold)" radius={layoutVariant === 'geo-brutalist' ? [0, 0, 0, 0] : [0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-slate-500">
                Sem dados de despesas para este ano
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Importador Inteligente de Planilhas */}
      <ImportadorPlanilhaModal
        isOpen={mostrarImportador}
        onClose={() => setMostrarImportador(false)}
        onImportSuccess={() => loadData()}
        categoriasExistentes={categorias}
        tipoPadrao="auto"
      />

      {/* Modal de Transferências Internas & Reserva */}
      <TransferenciaInternaModal
        isOpen={mostrarModalTransferencia}
        onClose={() => setMostrarModalTransferencia(false)}
        transferencias={transferencias}
        onSaveTransferencias={handleSaveTransferencias}
        lancamentosDuplicadosDetectados={lancamentosDuplicadosDetectados}
        onLimparDuplicados={handleExcluirDuplicadosDefinitivo}
      />
    </div>
  );
};

export default Dashboard;
