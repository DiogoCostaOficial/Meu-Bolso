import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const [financialData, setFinancialData] = useState({
    receitas: [],
    despesas: []
  });

  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    loadData();
  }, []);

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
      
      setFinancialData({
        receitas: userData.receitas || [],
        despesas: userData.despesas || []
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Se não houver dados, inicia com arrays vazios
      setFinancialData({
        receitas: [],
        despesas: []
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const calculateTotal = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
  };

  const filtrarPorAno = (dados) => {
    if (!Array.isArray(dados)) return [];
    
    return dados.filter(item => {
      if (!item.data) return false;
      const [ano] = item.data.split('-');
      return ano === anoSelecionado;
    });
  };

  const receitasFiltradas = filtrarPorAno(financialData.receitas);
  const despesasFiltradas = filtrarPorAno(financialData.despesas);

  // Separar despesas por categoria
  const despesasEssenciais = despesasFiltradas.filter(d => d.categoria === 'Despesas Fixas');
  const despesasLazer = despesasFiltradas.filter(d => d.categoria === 'Lazer');
  const despesasEducacao = despesasFiltradas.filter(d => d.categoria === 'Educação');

  const totalReceitas = calculateTotal(receitasFiltradas);
  const totalDespesasEssenciais = calculateTotal(despesasEssenciais);
  const totalDespesasLazer = calculateTotal(despesasLazer);
  const totalDespesasEducacao = calculateTotal(despesasEducacao);
  const totalDespesas = totalDespesasEssenciais + totalDespesasLazer + totalDespesasEducacao;
  const saldoFinal = totalReceitas - totalDespesas;
  const percentualSobra = totalReceitas > 0 ? ((saldoFinal / totalReceitas) * 100) : 0;

  const pieData = [
    { name: 'Despesas Fixas', value: totalDespesasEssenciais, color: '#ef4444' },
    { name: 'Lazer', value: totalDespesasLazer, color: '#f59e0b' },
    { name: 'Educação', value: totalDespesasEducacao, color: '#8b5cf6' },
    { name: 'Saldo', value: saldoFinal > 0 ? saldoFinal : 0, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  const cards = [
    {
      title: 'Receitas',
      value: totalReceitas,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Despesas',
      value: totalDespesas,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Saldo Final',
      value: saldoFinal,
      icon: Wallet,
      color: saldoFinal >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: saldoFinal >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      title: 'Percentual Sobra',
      value: `${percentualSobra.toFixed(1)}%`,
      icon: PiggyBank,
      color: percentualSobra >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: percentualSobra >= 0 ? 'bg-blue-100' : 'bg-red-100',
      isPercentage: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho com Filtro de Ano */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Visão geral das suas finanças</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
          <Calendar className="w-5 h-5 text-blue-600" />
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-700"
          >
            {gerarListaAnos().map(ano => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-medium">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.isPercentage ? card.value : formatCurrency(card.value)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={card.color} size={24} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card de Percentual de Sobras */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1 font-medium">Status Financeiro</p>
            <p className={`text-3xl font-bold ${percentualSobra >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(percentualSobra)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {saldoFinal >= 0 ? 'Sobrando no mês' : 'Déficit no mês'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">
              {percentualSobra >= 20 ? '🎉' : percentualSobra >= 10 ? '👍' : percentualSobra >= 0 ? '⚠️' : '❌'}
            </div>
            <p className="text-sm font-semibold text-gray-600">
              {percentualSobra >= 20 ? 'Excelente!' : percentualSobra >= 10 ? 'Bom' : percentualSobra >= 0 ? 'Atenção' : 'Déficit'}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Distribuição de Gastos</h3>
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PiggyBank className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhum dado para exibir</p>
                  <p className="text-sm mt-1">Ano: {anoSelecionado}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumo em Lista */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Resumo Financeiro</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Total de Receitas</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(totalReceitas)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Despesas Fixas</span>
                <span className="font-bold text-red-600">{formatCurrency(totalDespesasEssenciais)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Lazer</span>
                <span className="font-bold text-orange-600">{formatCurrency(totalDespesasLazer)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Educação</span>
                <span className="font-bold text-purple-600">{formatCurrency(totalDespesasEducacao)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Total de Despesas</span>
                <span className="font-bold text-red-600 text-lg">{formatCurrency(totalDespesas)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 bg-gray-50 -mx-6 px-6 py-4">
                <span className="text-lg font-bold text-gray-900">Saldo Final</span>
                <span className={`text-2xl font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(saldoFinal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Receitas no Ano</h4>
          <p className="text-2xl font-bold text-green-700">{receitasFiltradas.length}</p>
          <p className="text-xs text-gray-600 mt-1">transações registradas</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border border-red-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Despesas no Ano</h4>
          <p className="text-2xl font-bold text-red-700">{despesasFiltradas.length}</p>
          <p className="text-xs text-gray-600 mt-1">transações registradas</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Média Mensal</h4>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(saldoFinal / 12)}</p>
          <p className="text-xs text-gray-600 mt-1">saldo estimado/mês</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;