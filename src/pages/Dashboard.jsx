import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEdu } from '../contexts/EduContext';
import { useTheme } from '../components/theme-provider';
import EduHelpButton from '../components/EduHelpButton';
import {
  Wallet, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownRight, DollarSign, Calendar,
  GraduationCap, PiggyBank
} from 'lucide-react';
import api from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showLesson, updateFinancialData } = useEdu();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    receitas: [],
    despesas: []
  });
  const [categorias, setCategorias] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
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

      const receitas = userData.receitas || [];
      const despesas = userData.despesas || [];

      setFinancialData({
        receitas: receitas,
        despesas: despesas
      });

      // Calcular totais para o contexto educativo
      const totalReceitas = receitas.reduce((acc, curr) => acc + Number(curr.valor), 0);
      const totalDespesas = despesas.reduce((acc, curr) => acc + Number(curr.valor), 0);
      // updateFinancialData(totalReceitas, totalDespesas);

      // Carregar categorias do usuário ou usar padrão
      if (userData.categorias && userData.categorias.length > 0) {
        setCategorias(userData.categorias);
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

  const filtrarPorMes = (dados) => {
    if (!Array.isArray(dados)) return [];

    return dados.filter(item => {
      if (!item.data) return false;
      const [ano, mes] = item.data.split('-');
      return ano === anoSelecionado && mes === mesSelecionado;
    });
  };

  const receitasFiltradas = filtrarPorMes(financialData.receitas);
  const despesasFiltradas = filtrarPorMes(financialData.despesas);

  // Calcular totais por categoria dinamicamente
  const categoriasTotais = categorias.map(cat => {
    const total = despesasFiltradas
      .filter(d => d.categoria === cat.nome && d.somarNoOrcamento !== false)
      .reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);
    return { ...cat, total };
  }).filter(cat => cat.total > 0);

  const totalReceitas = calculateTotal(receitasFiltradas.filter(r => r.somarNoOrcamento !== false));
  const totalDespesas = calculateTotal(despesasFiltradas.filter(d => d.somarNoOrcamento !== false)); // Soma apenas despesas que devem ser somadas
  // Atualizar dados do mascote com base nos valores filtrados
  useEffect(() => {
    updateFinancialData(totalReceitas, totalDespesas);
  }, [totalReceitas, totalDespesas, updateFinancialData]);

  const saldoFinal = totalReceitas - totalDespesas;
  const percentualSobra = totalReceitas > 0 ? ((saldoFinal / totalReceitas) * 100) : 0;

  const pieData = [
    ...categoriasTotais.map(cat => ({
      name: cat.nome,
      value: cat.total,
      color: cat.cor
    })),
    { name: 'Saldo', value: saldoFinal > 0 ? saldoFinal : 0, color: '#3b82f6' }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho com Filtro de Ano */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Visão geral das suas finanças</p>
        </div>

        <div className="flex items-center gap-3">
          <EduHelpButton topic="dashboard" />

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-md border border-gray-200 dark:border-slate-800">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 font-medium text-gray-700 dark:text-slate-200"
            >
              {meses.map(mes => (
                <option key={mes.valor} value={mes.valor}>
                  {mes.nome}
                </option>
              ))}
            </select>
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 font-medium text-gray-700 dark:text-slate-200"
            >
              {gerarListaAnos().map(ano => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-1 font-medium">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.isPercentage ? card.value : formatCurrency(card.value)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor} dark:bg-opacity-20`}>
                    <Icon className={card.color} size={24} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card de Percentual de Sobras */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-1 font-medium">Status Financeiro</p>
            <p className={`text-3xl font-bold ${percentualSobra >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(percentualSobra)}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              {saldoFinal >= 0 ? 'Sobrando no mês' : 'Déficit no mês'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">
              {percentualSobra >= 20 ? '🎉' : percentualSobra >= 10 ? '👍' : percentualSobra >= 0 ? '⚠️' : '❌'}
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">
              {percentualSobra >= 20 ? 'Excelente!' : percentualSobra >= 10 ? 'Bom' : percentualSobra >= 0 ? 'Atenção' : 'Déficit'}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Distribuição de Gastos</h3>
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
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '8px' }} formatter={(value) => formatCurrency(value)} />
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
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gastos por Categoria</h3>
          </div>
          <div className="p-6">
            {categoriasTotais.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoriasTotais} layout="vertical">
                  <XAxis type="number" tickFormatter={(value) => `R$${value}`} stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                  <YAxis dataKey="nome" type="category" width={100} stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '8px' }} formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
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
    </div>
  );
};

export default Dashboard;