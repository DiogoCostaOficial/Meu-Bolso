import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEdu } from '../contexts/EduContext';
import { useCurrency } from '../contexts/CurrencyContext';
import EduHelpButton from '../components/EduHelpButton';
import CurrencySelector from '../components/CurrencySelector';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  DollarSign, TrendingUp, Target, AlertCircle,
  Save, RefreshCw, PieChart as PieIcon, Calculator,
  CheckCircle, XCircle, GraduationCap
} from 'lucide-react';
import api from '../services/api';
import { removeDuplicates } from '../utils/arrayUtils';

const CATEGORIAS_PADRAO = [
  { nome: 'Despesas Fixas', percentual: 30.00, cor: '#3B82F6', gastoAtual: 0 },
  { nome: 'Lazer', percentual: 8.00, cor: '#10B981', gastoAtual: 0 },
  { nome: 'Educação', percentual: 15.00, cor: '#F59E0B', gastoAtual: 0 },
  { nome: 'Investimentos', percentual: 40.00, cor: '#EF4444', gastoAtual: 0 },
  { nome: 'Reserva de Emergência', percentual: 7.00, cor: '#EC4899', gastoAtual: 0 }
];

const Orcamento = () => {
  const { user } = useAuth();
  const { showLesson } = useEdu();
  const { formatCurrency: formatarMoeda } = useCurrency();
  const [rendaPrevista, setRendaPrevista] = useState('');
  const [dividas, setDividas] = useState('');
  const [rendaReal, setRendaReal] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7)); // Formato YYYY-MM
  const [categorias, setCategorias] = useState(CATEGORIAS_PADRAO);
  const [orcamentoSalvo, setOrcamentoSalvo] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [despesas, setDespesas] = useState([]);

  useEffect(() => {
    carregarOrcamento();
    carregarDespesas();
  }, [mesSelecionado]); // Recarrega orçamento e despesas ao mudar o mês

  useEffect(() => {
    calcularRendaReal();
  }, [rendaPrevista, dividas]);

  useEffect(() => {
    atualizarGastosAtuais();
  }, [despesas]); // Removido 'categorias' para evitar loop infinito

  const carregarOrcamento = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};

      // Look for budget for the selected month
      const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];
      const orcamentoMes = orcamentos.find(o => o.mes === mesSelecionado);

      if (orcamentoMes) {
        setRendaPrevista(orcamentoMes.rendaPrevista || '');
        setDividas(orcamentoMes.dividas || '');
        setRendaReal(orcamentoMes.rendaReal || '');
        // Use categories from saved budget, or user's custom categories, or defaults
        const categoriasDoOrcamento = orcamentoMes.categorias || [];
        const categoriasDoUsuario = userData.categorias || [];

        if (categoriasDoOrcamento.length > 0) {
          const categoriasUnicas = removeDuplicates(categoriasDoOrcamento, 'nome');
          setCategorias(categoriasUnicas.map(cat => {
            // Fallback robusto para cores
            let cor = cat.cor;
            if (!cor || cor === '#CCCCCC') {
              const match = categoriasDoUsuario.find(c => c.nome === cat.nome) ||
                CATEGORIAS_PADRAO.find(c => c.nome === cat.nome);
              if (match) cor = match.cor;
            }
            // Se ainda assim não tiver cor, mantém o cinza ou gera uma aleatória (opcional)
            if (!cor) cor = '#CCCCCC';

            return {
              ...cat,
              cor,
              gastoAtual: cat.gastoAtual || 0
            };
          }));
        } else if (categoriasDoUsuario.length > 0) {
          // Use user's custom categories
          const categoriasUnicasUsuario = removeDuplicates(categoriasDoUsuario, 'nome');
          setCategorias(categoriasUnicasUsuario.map(cat => ({
            ...cat,
            percentual: 0,
            gastoAtual: 0
          })));
        } else {
          // Default categories if none in backend
          setCategorias(CATEGORIAS_PADRAO);
        }
      } else {
        // No budget found for this month - reset to defaults or user categories
        setRendaPrevista('');
        setDividas('');
        setRendaReal('');

        const categoriasDoUsuario = userData.categorias || [];
        if (categoriasDoUsuario.length > 0) {
          const categoriasUnicasUsuario = removeDuplicates(categoriasDoUsuario, 'nome');
          setCategorias(categoriasUnicasUsuario.map(cat => ({
            ...cat,
            percentual: 0,
            gastoAtual: 0
          })));
        } else {
          setCategorias(CATEGORIAS_PADRAO);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento do backend:', error);
    }
  };

  const carregarDespesas = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};

      // Get expenses from backend
      const despesas = Array.isArray(userData.despesas) ? userData.despesas : [];

      // Filter expenses for the selected month
      const despesasMes = despesas.filter(d => d.data.startsWith(mesSelecionado));
      setDespesas(despesasMes);
    } catch (error) {
      console.error('Erro ao carregar despesas do backend:', error);
    }
  };

  const calcularRendaReal = () => {
    const prevista = parseFloat(rendaPrevista) || 0;
    const dividasTotal = parseFloat(dividas) || 0;
    const real = prevista - dividasTotal;
    setRendaReal(real.toFixed(2));
  };

  const atualizarGastosAtuais = () => {
    setCategorias(prevCategorias => {
      const novasCategorias = prevCategorias.map(cat => {
        const gastoTotal = despesas
          .filter(d => d.categoria === cat.nome && d.somarNoOrcamento !== false)
          .reduce((acc, d) => acc + d.valor, 0);
        return { ...cat, gastoAtual: gastoTotal };
      });

      // Verifica se houve mudança real para evitar re-render desnecessário
      const mudou = novasCategorias.some((cat, index) => {
        return cat.gastoAtual !== prevCategorias[index].gastoAtual;
      });

      return mudou ? novasCategorias : prevCategorias;
    });
  };

  const atualizarPercentual = (index, valor) => {
    const novasCategorias = [...categorias];
    novasCategorias[index].percentual = parseFloat(valor) || 0;
    setCategorias(novasCategorias);
  };

  const totalPercentual = categorias.reduce((acc, cat) => acc + cat.percentual, 0);
  // Use a small epsilon for floating point comparison
  const percentualValido = Math.abs(totalPercentual - 100) < 0.01;

  const salvarOrcamento = async () => {
    setMensagemFeedback(null); // Limpa mensagens anteriores

    if (!percentualValido) {
      setMensagemFeedback({ tipo: 'erro', texto: `A soma dos percentuais deve ser 100%. Atual: ${totalPercentual.toFixed(2)}%` });
      return;
    }
    if (!rendaPrevista || parseFloat(rendaPrevista) <= 0) {
      setMensagemFeedback({ tipo: 'erro', texto: 'Informe uma renda prevista válida!' });
      return;
    }

    setLoading(true);
    setLoading(true);
    try {
      // OTIMIZAÇÃO: Enviar apenas o orçamento do mês atual
      // O backend substituirá apenas os dados deste período

      const novoOrcamento = {
        mes: mesSelecionado,
        rendaPrevista,
        dividas,
        rendaReal,
        categorias // Categories already contain updated gastoAtual
      };

      // Salvar no backend (enviando apenas este orçamento)
      await api.post('/user/dados', { orcamentos: [novoOrcamento] });

      setOrcamentoSalvo(true);
      setMensagemFeedback({ tipo: 'sucesso', texto: 'Orçamento salvo com sucesso!' });
      setTimeout(() => {
        setOrcamentoSalvo(false);
        setMensagemFeedback(null);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar orçamento no backend:', error);
      setMensagemFeedback({ tipo: 'erro', texto: 'Erro ao salvar orçamento. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const resetarOrcamento = async () => {
    if (confirm('Deseja realmente resetar o orçamento? Esta ação não pode ser desfeita.')) {
      try {
        const response = await api.get('/user/dados');
        const userData = response.data.dados || {};

        // Get existing budgets
        const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];

        // Remove budget for this month
        const orcamentosFiltrados = orcamentos.filter(o => o.mes !== mesSelecionado);

        // Update user data
        const updatedData = {
          ...userData,
          orcamentos: orcamentosFiltrados
        };

        // Save to backend
        await api.post('/user/dados', { dados: updatedData });

        // Reset form
        setRendaPrevista('');
        setDividas('');
        setRendaReal('');

        const categoriasDoUsuario = userData.categorias || [];
        if (categoriasDoUsuario.length > 0) {
          const categoriasUnicasUsuario = removeDuplicates(categoriasDoUsuario, 'nome');
          setCategorias(categoriasUnicasUsuario.map(cat => ({
            ...cat,
            percentual: 0,
            gastoAtual: 0
          })));
        } else {
          setCategorias([
            { nome: 'Despesas Fixas', percentual: 30.00, cor: '#3B82F6', gastoAtual: 0 },
            { nome: 'Lazer', percentual: 8.00, cor: '#10B981', gastoAtual: 0 },
            { nome: 'Educação', percentual: 15.00, cor: '#F59E0B', gastoAtual: 0 },
            { nome: 'Investimentos', percentual: 40.00, cor: '#EF4444', gastoAtual: 0 },
            { nome: 'Reserva de Emergência', percentual: 7.00, cor: '#EC4899', gastoAtual: 0 }
          ]);
        }
      } catch (error) {
        console.error('Erro ao resetar orçamento no backend:', error);
        alert('Erro ao resetar orçamento. Tente novamente.');
      }
    }
  };


  const calcularValorCategoria = (percentual) => {
    const real = parseFloat(rendaReal) || 0;
    return (real * percentual) / 100;
  };

  const calcularDisponivel = (percentual, gastoAtual) => {
    return calcularValorCategoria(percentual) - gastoAtual;
  };

  const totalPlanejado = parseFloat(rendaReal) || 0;
  const totalGastoAtual = categorias.reduce((acc, cat) => acc + cat.gastoAtual, 0);
  const totalDisponivel = totalPlanejado - totalGastoAtual;

  const dadosGrafico = categorias
    .filter(cat => cat.percentual > 0)
    .map(cat => ({
      name: cat.nome,
      value: cat.percentual,
      cor: cat.cor
    }));

  return (
    <div className="space-y-6">
      {/* CABEÇALHO — mobile-first */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Programação do Orçamento</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm md:text-base">Configure seu orçamento mensal de acordo com suas metas</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CurrencySelector />
          <EduHelpButton topic="orcamento" />
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="px-3 py-2.5 border-2 border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-base font-semibold bg-white dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={resetarOrcamento}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Resetar</span>
          </button>
          <button
            onClick={salvarOrcamento}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white transition shadow-lg flex-1 sm:flex-none justify-center ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? (
              <><RefreshCw className="w-5 h-5 animate-spin" />Salvando...</>
            ) : (
              <><Save className="w-5 h-5" />Salvar Orçamento</>
            )}
          </button>
        </div>
      </div>
      {/* MENSAGEM DE FEEDBACK */}
      {mensagemFeedback && (
        <div className={`border-2 rounded-lg p-4 flex items-center gap-3 ${mensagemFeedback.tipo === 'sucesso'
          ? 'bg-green-50 border-green-500 text-green-800'
          : 'bg-red-50 border-red-500 text-red-800'
          }`}>
          {mensagemFeedback.tipo === 'sucesso' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
          <p className="font-semibold">{mensagemFeedback.texto}</p>
        </div>
      )}
      {/* GRID: RENDA E GRÁFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEÇÃO DE RENDA */}
        <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-custom-primary/50 dark:bg-amber-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-custom-gold" />
            </div>
            <h2 className="text-xl font-bold text-custom-main">Configuração de Renda</h2>
          </div>
          <div className="space-y-4">
            {/* RENDA PREVISTA */}
            <div>
              <label className="block text-sm font-semibold text-custom-main opacity-80 mb-2">
                Renda Prevista
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rendaPrevista}
                  onChange={(e) => setRendaPrevista(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-custom-color rounded-custom focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-custom-main text-lg font-semibold"
                  placeholder="0,00"
                />
              </div>
            </div>
            {/* DÍVIDAS */}
            <div>
              <label className="block text-sm font-semibold text-custom-main opacity-80 mb-2">
                Dívidas (a serem abatidas da renda)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={dividas}
                  onChange={(e) => setDividas(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-custom-color rounded-custom focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-custom-main text-lg font-semibold"
                  placeholder="0,00"
                />
              </div>
            </div>
            {/* RENDA REAL */}
            <div className="bg-custom-primary/30 dark:bg-amber-900/10 p-4 rounded-custom border border-custom-color flex items-center justify-between">
              <span className="text-lg font-semibold text-custom-main opacity-90">Renda Real Disponível:</span>
              <span className="text-2xl font-bold text-custom-gold">{formatarMoeda(parseFloat(rendaReal))}</span>
            </div>
          </div>
        </div>
        {/* GRÁFICO DE DISTRIBUIÇÃO */}
        <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color flex flex-col items-center justify-center transition-custom">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-custom-primary/50 dark:bg-amber-900/20 rounded-lg">
              <PieIcon className="w-6 h-6 text-custom-gold" />
            </div>
            <h2 className="text-xl font-bold text-custom-main">Distribuição do Orçamento</h2>
          </div>
          {dadosGrafico.length > 0 && percentualValido ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGrafico}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="var(--accent-gold)"
                  dataKey="value"
                >
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }} formatter={(value, name, props) => [`${value.toFixed(2)}%`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <AlertCircle className="w-12 h-12 mb-2 text-custom-gold" />
              <p className="text-custom-main opacity-65 text-center">Configure sua renda e percentuais para ver o gráfico.</p>
              {!percentualValido && totalPercentual > 0 && (
                <p className="text-sm mt-2 text-red-500 font-bold">Total de percentuais: {totalPercentual.toFixed(2)}% (deve ser 100%)</p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* TABELA DE CATEGORIAS */}
      <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-custom-primary/50 dark:bg-amber-900/20 rounded-lg">
            <Target className="w-6 h-6 text-custom-gold" />
          </div>
          <h2 className="text-xl font-bold text-custom-main">Definição de Categorias</h2>
        </div>
        {/* TABELA — apenas desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-slate-900">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-slate-300">Categoria</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-slate-300">Percentual (%)</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-slate-300">Planejado</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-slate-300">Gasto Atual</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-slate-300">Disponível</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: categoria.cor }} />
                      <span className="font-semibold text-gray-900 dark:text-white">{categoria.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={categoria.percentual}
                        onChange={(e) => atualizarPercentual(index, e.target.value)}
                        className="w-24 px-3 py-2 border-2 border-gray-200 dark:border-slate-600 rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 dark:text-white"
                      />
                      <span className="text-gray-600 dark:text-slate-400 font-semibold">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatarMoeda(calcularValorCategoria(categoria.percentual))}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatarMoeda(categoria.gastoAtual)}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`text-lg font-bold ${calcularDisponivel(categoria.percentual, categoria.gastoAtual) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarMoeda(calcularDisponivel(categoria.percentual, categoria.gastoAtual))}
                    </span>
                  </td>
                </tr>
              ))}
              {/* LINHA DE TOTAL */}
              <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                <td className="px-4 py-4"><span className="font-bold text-gray-900 dark:text-white text-lg">TOTAL</span></td>
                <td className="px-4 py-4 text-center">
                  <span className={`text-2xl font-bold ${percentualValido ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPercentual.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-right"><span className="text-2xl font-bold text-blue-600">{formatarMoeda(totalPlanejado)}</span></td>
                <td className="px-4 py-4 text-right"><span className="text-2xl font-bold text-blue-600">{formatarMoeda(totalGastoAtual)}</span></td>
                <td className="px-4 py-4 text-right"><span className="text-2xl font-bold text-blue-600">{formatarMoeda(totalDisponivel)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CARDS — apenas mobile */}
        <div className="md:hidden space-y-3">
          {categorias.map((categoria, index) => {
            const disponivel = calcularDisponivel(categoria.percentual, categoria.gastoAtual);
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-slate-800 rounded-xl border-l-4 p-4 space-y-3"
                style={{ borderLeftColor: categoria.cor }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoria.cor }} />
                    <span className="font-bold text-gray-900 dark:text-white">{categoria.nome}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: categoria.cor }}>
                    {categoria.percentual}%
                  </span>
                </div>

                {/* Input de percentual — touch-friendly */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-700 rounded-lg px-3 py-1">
                  <label className="text-sm text-gray-500 dark:text-slate-400 flex-shrink-0">Percentual:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={categoria.percentual}
                    onChange={(e) => atualizarPercentual(index, e.target.value)}
                    className="flex-1 text-center text-lg font-bold border-0 focus:ring-0 bg-transparent dark:text-white py-2"
                    style={{ fontSize: '16px' }}
                  />
                  <span className="text-gray-500 dark:text-slate-400 font-semibold">%</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Planejado</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatarMoeda(calcularValorCategoria(categoria.percentual))}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Gasto</p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatarMoeda(categoria.gastoAtual)}</p>
                  </div>
                  <div className={`${disponivel >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} rounded-lg p-2`}>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Disponível</p>
                    <p className={`text-sm font-bold ${disponivel >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatarMoeda(disponivel)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Totais no mobile */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Total %</p>
                <p className={`text-xl font-bold ${percentualValido ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPercentual.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Planejado</p>
                <p className="text-lg font-bold text-blue-600">{formatarMoeda(totalPlanejado)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Disponível</p>
                <p className={`text-lg font-bold ${totalDisponivel >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(totalDisponivel)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* ALERTA SE PERCENTUAL INVÁLIDO */}
        {!percentualValido && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Atenção!</p>
              <p className="text-sm text-red-700 mt-1">
                A soma dos percentuais deve ser exatamente 100%. Atualmente está em {totalPercentual.toFixed(2)}%.
                {totalPercentual > 100 && ' Reduza os valores.'}
                {totalPercentual < 100 && ' Aumente os valores.'}
              </p>
            </div>
          </div>
        )}
      </div>
      {/* RESUMO DE VALORES POR CATEGORIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.filter(cat => cat.percentual > 0).map((categoria, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-lg shadow border-l-4 hover:shadow-lg transition"
            style={{ borderLeftColor: categoria.cor }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{categoria.nome}</h3>
              <span
                className="px-2 py-1 rounded text-xs font-bold text-white"
                style={{ backgroundColor: categoria.cor }}
              >
                {categoria.percentual}%
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: categoria.cor }}>
              {formatarMoeda(calcularValorCategoria(categoria.percentual))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orcamento;
