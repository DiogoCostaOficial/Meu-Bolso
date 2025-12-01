import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  DollarSign, TrendingUp, Target, AlertCircle,
  Save, RefreshCw, PieChart as PieIcon, Calculator,
  CheckCircle, XCircle
} from 'lucide-react';
import api from '../services/api';

const CATEGORIAS_PADRAO = [
  { nome: 'Despesas Fixas', percentual: 30.00, cor: '#3B82F6', gastoAtual: 0 },
  { nome: 'Lazer', percentual: 8.00, cor: '#10B981', gastoAtual: 0 },
  { nome: 'Educação', percentual: 15.00, cor: '#F59E0B', gastoAtual: 0 },
  { nome: 'Investimentos', percentual: 40.00, cor: '#EF4444', gastoAtual: 0 },
  { nome: 'Reserva de Emergência', percentual: 7.00, cor: '#EC4899', gastoAtual: 0 }
];

const Orcamento = () => {
  const { user } = useAuth();
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
          setCategorias(categoriasDoOrcamento.map(cat => {
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
          setCategorias(categoriasDoUsuario.map(cat => ({
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
          setCategorias(categoriasDoUsuario.map(cat => ({
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
          .filter(d => d.categoria === cat.nome)
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

  // Esta função não é mais necessária, pois gastoAtual é calculado automaticamente
  // const atualizarGastoAtual = (index, valor) => {
  //   const novasCategorias = [...categorias];
  //   novasCategorias[index].gastoAtual = parseFloat(valor) || 0;
  //   setCategorias(novasCategorias);
  // };

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
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};

      // Prepare budget data
      const novoOrcamento = {
        mes: mesSelecionado,
        rendaPrevista,
        dividas,
        rendaReal,
        categorias // Categories already contain updated gastoAtual
      };

      // Get existing budgets or initialize array
      const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];

      // Remove existing budget for this month if it exists
      const orcamentosFiltrados = orcamentos.filter(o => o.mes !== mesSelecionado);

      // Add the new budget
      orcamentosFiltrados.push(novoOrcamento);

      // Update user data with new budgets array
      const updatedData = {
        ...userData,
        orcamentos: orcamentosFiltrados
      };

      // Save to backend
      await api.post('/user/dados', { dados: updatedData });

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
          setCategorias(categoriasDoUsuario.map(cat => ({
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

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
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
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programação do Orçamento</h1>
          <p className="text-gray-600 mt-1">Configure seu orçamento mensal de acordo com suas metas</p>
        </div>
        <div className="flex gap-3">
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
          />
          <button
            onClick={resetarOrcamento}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Resetar
          </button>
          <button
            onClick={salvarOrcamento}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white transition shadow-lg ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Orçamento
              </>
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
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Configuração de Renda</h2>
          </div>
          <div className="space-y-4">
            {/* RENDA PREVISTA */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
                  placeholder="0,00"
                />
              </div>
            </div>
            {/* DÍVIDAS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
                  placeholder="0,00"
                />
              </div>
            </div>
            {/* RENDA REAL */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center justify-between">
              <span className="text-lg font-semibold text-blue-800">Renda Real Disponível:</span>
              <span className="text-2xl font-bold text-blue-900">{formatarMoeda(parseFloat(rendaReal))}</span>
            </div>
          </div>
        </div>
        {/* GRÁFICO DE DISTRIBUIÇÃO */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Distribuição do Orçamento</h2>
          </div>
          {dadosGrafico.length > 0 && percentualValido ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGrafico}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value.toFixed(2)}%`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <AlertCircle className="w-12 h-12 mb-2" />
              <p>Configure sua renda e percentuais para ver o gráfico.</p>
              {!percentualValido && totalPercentual > 0 && (
                <p className="text-sm mt-2 text-red-500">Total de percentuais: {totalPercentual.toFixed(2)}% (deve ser 100%)</p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* TABELA DE CATEGORIAS */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Definição de Categorias</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Categoria</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Percentual (%)</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Planejado (R$)</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Gasto Atual (R$)</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Disponível (R$)</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      <span className="font-semibold text-gray-900">{categoria.nome}</span>
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
                        className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-gray-600 font-semibold">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {formatarMoeda(calcularValorCategoria(categoria.percentual))}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {formatarMoeda(categoria.gastoAtual)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {formatarMoeda(calcularDisponivel(categoria.percentual, categoria.gastoAtual))}
                    </span>
                  </td>
                </tr>
              ))}
              {/* LINHA DE TOTAL */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-4 py-4">
                  <span className="font-bold text-gray-900 text-lg">TOTAL</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`text-2xl font-bold ${percentualValido ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {totalPercentual.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatarMoeda(totalPlanejado)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatarMoeda(totalGastoAtual)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatarMoeda(totalDisponivel)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
