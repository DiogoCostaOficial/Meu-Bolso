import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEdu } from '../contexts/EduContext';
import { useTheme } from '../components/theme-provider';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLayoutVariant } from '../contexts/LayoutVariantContext';
import EduHelpButton from '../components/EduHelpButton';
import CurrencySelector from '../components/CurrencySelector';
import {
  Wallet, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownRight, DollarSign, Calendar,
  GraduationCap, PiggyBank
} from 'lucide-react';
import api from '../services/api';
import { removeDuplicates } from '../utils/arrayUtils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const { showLesson, updateFinancialData } = useEdu();
  const { layoutVariant } = useLayoutVariant();
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

  const getHistoricalData = () => {
    const data = [];
    const hoje = new Date();
    // Gerar últimos 6 meses ordenados cronologicamente
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesStr = String(d.getMonth() + 1).padStart(2, '0');
      const anoStr = String(d.getFullYear());
      const chaveMes = `${anoStr}-${mesStr}`;
      
      const totalRec = financialData.receitas
        .filter(r => r.data && r.data.startsWith(chaveMes) && r.somarNoOrcamento !== false)
        .reduce((acc, curr) => acc + Number(curr.valor), 0);
        
      const totalDes = financialData.despesas
        .filter(d => d.data && d.data.startsWith(chaveMes) && d.somarNoOrcamento !== false)
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

  const saldoFinal = totalReceitas - totalDespesas;
  const percentualSobra = totalReceitas > 0 ? ((saldoFinal / totalReceitas) * 100) : 0;

  const pieData = [
    ...categoriasTotais.map(cat => ({
      name: cat.nome,
      value: cat.total,
      color: cat.cor
    })),
    { name: 'Saldo', value: saldoFinal > 0 ? saldoFinal : 0, color: 'var(--accent-gold)' }
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
    <div className="space-y-5 transition-custom">
      {/* Cabeçalho com Filtro de Mês/Ano — mobile-first */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-custom-main">Dashboard</h2>
          <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm md:text-base">Visão geral das suas finanças</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <EduHelpButton topic="dashboard" />
          </div>
          <div className="flex items-center gap-2 bg-custom-card text-custom-main px-3 py-2 rounded-custom shadow-custom border border-custom-color w-full sm:w-auto transition-custom">
            <Calendar className="w-4 h-4 text-custom-gold flex-shrink-0" />
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="flex-1 py-1 border-0 focus:ring-0 bg-transparent font-medium text-custom-main text-sm cursor-pointer"
            >
              {meses.map(mes => (
                <option key={mes.valor} value={mes.valor} className="bg-custom-card text-custom-main">{mes.nome}</option>
              ))}
            </select>
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              className="py-1 border-0 focus:ring-0 bg-transparent font-medium text-custom-main text-sm w-20 cursor-pointer"
            >
              {gerarListaAnos().map(ano => (
                <option key={ano} value={ano} className="bg-custom-card text-custom-main">{ano}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-custom-card rounded-custom shadow-custom border border-custom-color overflow-hidden transition-custom hover:-translate-y-1 hover:shadow-lg duration-300">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mb-1 font-medium">{card.title}</p>
                    <p className={`text-lg md:text-2xl font-bold ${card.color} truncate`}>
                      {card.isPercentage ? card.value : formatCurrency(card.value)}
                    </p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-custom ${card.bgColor} dark:bg-opacity-20 flex-shrink-0 ml-2 transition-custom`}>
                    <Icon className={card.color} size={20} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card de Percentual de Sobras */}
      <div className="bg-custom-card rounded-custom shadow-custom p-6 border border-custom-color transition-custom">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1 font-medium">Status Financeiro</p>
            <p className={`text-3xl font-bold ${percentualSobra >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
            <p className="text-sm font-semibold text-custom-main opacity-80">
              {percentualSobra >= 20 ? 'Excelente!' : percentualSobra >= 10 ? 'Bom' : percentualSobra >= 0 ? 'Atenção' : 'Déficit'}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução Mensal (Fluxo de Caixa Premium) */}
      <div className="bg-custom-card rounded-custom shadow-custom overflow-hidden border border-custom-color transition-custom">
        <div className="p-6 border-b border-custom-color flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase text-custom-gold">Evolução Mensal (Fluxo de Caixa)</h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Receitas vs Despesas nos últimos 6 meses</p>
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
    </div>
  );
};

export default Dashboard;