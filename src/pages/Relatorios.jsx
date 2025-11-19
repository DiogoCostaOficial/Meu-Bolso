import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Target
} from 'lucide-react';

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

const Relatorios = () => {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]); // Este estado pode ser redundante, mas mantido para compatibilidade
  const [orcamentoCompleto, setOrcamentoCompleto] = useState(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mensal');
  const currentMonth = new Date().getMonth() + 1;
  const initialMonth = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  const [mesSelecionado, setMesSelecionado] = useState(initialMonth);
  const [trimestreSelecionado, setTrimestreSelecionado] = useState('T1'); // Valor inicial para o primeiro trimestre
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [isFiltrosMinimized, setIsFiltrosMinimized] = useState(false);

  // Estado para o período do gráfico de evolução (mensal, trimestral, anual)
  const [graficoEvolucaoPeriodo, setGraficoEvolucaoPeriodo] = useState('mensal');

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

  const trimestres = [
    { valor: 'T1', nome: '1º Trimestre', meses: ['01', '02', '03'] },
    { valor: 'T2', nome: '2º Trimestre', meses: ['04', '05', '06'] },
    { valor: 'T3', nome: '3º Trimestre', meses: ['07', '08', '09'] },
    { valor: 'T4', nome: '4º Trimestre', meses: ['10', '11', '12'] }
  ];

  const gerarListaAnos = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual - 5; i <= anoAtual + 2; i++) {
      anos.push(i.toString());
    }
    return anos;
  };

  // Função para carregar dados de orçamento do backend
  const carregarOrcamento = useCallback(async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};
      
      console.log('📋 Dados do usuário recebidos:', userData);
      
      // Use orcamentos from backend
      const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];
      
      console.log(`📊 Orçamentos encontrados: ${orcamentos.length}`, orcamentos);
      
      if (orcamentos.length === 0) {
        console.log('⚠️ Nenhum orçamento encontrado');
        setOrcamentoCompleto(null);
        setCategorias([]);
        return;
      }

      // Filter budgets by selected year
      const orcamentosDoAno = orcamentos.filter(orcamento => {
        if (!orcamento.mes) return false;
        const anoOrcamento = orcamento.mes.split('-')[0];
        return anoOrcamento === anoSelecionado;
      });
      
      console.log(`📅 Orçamentos do ano ${anoSelecionado}: ${orcamentosDoAno.length}`, orcamentosDoAno);

      // Simple budget aggregation logic - sum up filtered budgets
      let totalPlanejado = 0;
      let totalReal = 0;
      const categoriasMap = new Map();

      orcamentosDoAno.forEach(orcamento => {
        const rendaPrevista = parseFloat(orcamento.rendaPrevista || 0);
        const rendaReal = parseFloat(orcamento.rendaReal || 0);
        
        totalPlanejado += rendaPrevista;
        totalReal += rendaReal;
        
        if (orcamento.categorias && Array.isArray(orcamento.categorias)) {
          orcamento.categorias.forEach(cat => {
            const nome = cat.nome || 'Categoria Desconhecida';
            const atual = categoriasMap.get(nome) || { planejado: 0, gasto: 0 };
            
            // Handle both percentage-based and value-based budgets
            let valorPlanejado;
            if (cat.valorPlanejado !== undefined) {
              // Value-based budget (old format)
              valorPlanejado = parseFloat(cat.valorPlanejado || 0);
            } else if (cat.percentual !== undefined && rendaPrevista > 0) {
              // Percentage-based budget (new format)
              valorPlanejado = (parseFloat(cat.percentual || 0) / 100) * rendaPrevista;
            } else {
              valorPlanejado = 0;
            }
            
            atual.planejado += valorPlanejado;
            atual.gasto += parseFloat(cat.valorGasto || cat.gastoAtual || 0);
            categoriasMap.set(nome, atual);
          });
        }
      });
      
      console.log('🗺️ Mapa de categorias:', categoriasMap);

      const finalCategorias = Array.from(categoriasMap.entries()).map(([nome, dados]) => {
        const planejado = dados.planejado;
        const gasto = dados.gasto;
        const disponivel = Math.max(0, planejado - gasto);
        const excedente = gasto > planejado ? -(gasto - planejado) : 0;
        
        return {
          categoria: nome,
          planejado: planejado,
          planejadoTotal: planejado,
          gastoAtualPositivo: Math.min(gasto, planejado),
          disponivelPositivo: disponivel,
          excedenteNegativo: excedente
        };
      });
      
      console.log('📋 Categorias finais:', finalCategorias);

      const finalOrcamento = {
        rendaPrevista: totalPlanejado,
        rendaReal: totalReal,
        categorias: finalCategorias,
      };

      setOrcamentoCompleto(finalOrcamento);
      setCategorias(finalCategorias);
      console.log(`✅ Orçamento carregado do backend para o ano ${anoSelecionado}:`, finalOrcamento);
    } catch (error) {
      console.error('❌ Erro ao carregar orçamento do backend:', error);
      setOrcamentoCompleto(null);
      setCategorias([]);
    }
  }, [anoSelecionado]);

  // Carrega dados de receitas/despesas e orçamento quando os filtros mudam
  useEffect(() => {
    const loadData = async () => {
      await carregarDados();
      await carregarOrcamento();
    };
    loadData();
  }, [mesSelecionado, anoSelecionado, periodoSelecionado, trimestreSelecionado, carregarOrcamento]);

  const carregarDados = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};
      
      // Use receitas and despesas from backend, fallback to empty arrays
      setReceitas(Array.isArray(userData.receitas) ? userData.receitas : []);
      setDespesas(Array.isArray(userData.despesas) ? userData.despesas : []);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setReceitas([]);
      setDespesas([]);
    }
  };

  const formatarMoeda = valor => {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const filtrarPorPeriodo = (dados) => {
    if (!Array.isArray(dados)) {
      return [];
    }
    return dados.filter(item => {
      if (!item.data) return false;
      const [ano, mes] = item.data.split('-');
      if (periodoSelecionado === 'mensal') {
        return ano === anoSelecionado && mes === mesSelecionado;
      } else if (periodoSelecionado === 'trimestral') {
        const trimestre = trimestres.find(t => t.valor === trimestreSelecionado);
        return ano === anoSelecionado && trimestre && trimestre.meses.includes(mes);
      } else if (periodoSelecionado === 'anual') {
        return ano === anoSelecionado;
      }
      return false;
    });
  };

  const receitasFiltradas = filtrarPorPeriodo(receitas);
  const despesasFiltradas = filtrarPorPeriodo(despesas);

  const totalReceitas = receitasFiltradas.reduce((acc, r) => {
    const valor = typeof r.valor === 'number' ? r.valor : parseFloat(r.valor) || 0;
    return acc + valor;
  }, 0);

  const totalDespesas = despesasFiltradas.reduce((acc, d) => {
    const valor = typeof d.valor === 'number' ? d.valor : parseFloat(d.valor) || 0;
    return acc + valor;
  }, 0);

  const saldo = totalReceitas - totalDespesas;

  const todasCategorias = [...new Set([
    ...receitasFiltradas.map(r => r.categoria),
    ...despesasFiltradas.map(d => d.categoria)
  ])];

  const dadosPorCategoria = todasCategorias.map(catNome => {
    const receitasCat = receitasFiltradas
      .filter(r => r.categoria === catNome)
      .reduce((acc, r) => {
        const valor = typeof r.valor === 'number' ? r.valor : parseFloat(r.valor) || 0;
        return acc + valor;
      }, 0);
    const despesasCat = despesasFiltradas
      .filter(d => d.categoria === catNome)
      .reduce((acc, d) => {
        const valor = typeof d.valor === 'number' ? d.valor : parseFloat(d.valor) || 0;
        return acc + valor;
      }, 0);
    return {
      categoria: catNome,
      receitas: receitasCat,
      despesas: despesasCat
    };
  }).filter(item => item.receitas > 0 || item.despesas > 0);

  // CORREÇÃO: Dados para o gráfico de acompanhamento de orçamento - Usando useMemo para encapsular a lógica
  const dadosOrcamento = useMemo(() => {
    // Garante que orcamentoCompleto e orcamentoCompleto.categorias existam e sejam válidos
    if (!orcamentoCompleto || !Array.isArray(orcamentoCompleto.categorias) || orcamentoCompleto.categorias.length === 0) {
      console.log('⚠️ Orçamento incompleto ou sem categorias:', orcamentoCompleto);
      return [];
    }
    
    console.log('📊 Processando categorias do orçamento:', orcamentoCompleto.categorias);
    
    return orcamentoCompleto.categorias.map((cat) => { // Alterado para (cat) =>
      const nomeCategoria = cat.categoria || 'Desconhecida'; // Usar 'categoria' ao invés de 'nome'
      const planejadoTotal = cat.planejado || 0; // Usar 'planejado' ao invés de 'planejadoTotalAgregado'
      
      console.log(`📋 Categoria: ${nomeCategoria}, Planejado: ${planejadoTotal}`);
      
      const gastoAtualTotal = despesasFiltradas
        .filter(d => d.categoria === nomeCategoria)
        .reduce((acc, d) => {
          const valor = typeof d.valor === 'number' ? d.valor : parseFloat(d.valor) || 0;
          return acc + valor;
        }, 0);
        
      console.log(`💰 Gasto atual total para ${nomeCategoria}: ${gastoAtualTotal}`);
      
      let gastoAtualPositivo = 0;
      let disponivelPositivo = 0;
      let excedenteNegativo = 0;
      if (gastoAtualTotal <= planejadoTotal) {
        gastoAtualPositivo = gastoAtualTotal;
        disponivelPositivo = planejadoTotal - gastoAtualTotal;
        excedenteNegativo = 0;
      } else {
        gastoAtualPositivo = planejadoTotal;
        disponivelPositivo = 0;
        excedenteNegativo = -(gastoAtualTotal - planejadoTotal);
      }
      
      const resultado = {
        categoria: nomeCategoria,
        planejadoTotal: planejadoTotal,
        planejado: planejadoTotal, // Mantido para compatibilidade com o gráfico
        gastoAtualPositivo: gastoAtualPositivo,
        disponivelPositivo: disponivelPositivo,
        excedenteNegativo: excedenteNegativo
      };
      
      console.log(`✅ Resultado para ${nomeCategoria}:`, resultado);
      return resultado;
    }).filter(item => item.planejadoTotal > 0);
  }, [orcamentoCompleto, despesasFiltradas]); // Dependências do useMemo
  console.log('📈 Dados finais do gráfico de orçamento:', dadosOrcamento);

  const dadosPizza = [
    { name: 'Receitas', value: totalReceitas > 0 ? totalReceitas : 0 },
    { name: 'Despesas', value: totalDespesas > 0 ? totalDespesas : 0 }
  ].filter(item => item.value > 0);

  const renderCustomAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-20)"
          style={{ fontSize: '11px', fontWeight: '500' }}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Cálculo dos dados trimestrais para o relatório e gráfico
  const calcularDadosTrimestrais = useMemo(() => {
    if (periodoSelecionado !== 'trimestral') return [];
    const dadosTrimestrais = trimestres.map(trimestre => {
      const mesesDoTrimestre = trimestre.meses;
      const receitasDoTrimestre = receitas.filter(r => {
        const [ano, mes] = r.data.split('-');
        return ano === anoSelecionado && mesesDoTrimestre.includes(mes);
      });
      const despesasDoTrimestre = despesas.filter(d => {
        const [ano, mes] = d.data.split('-');
        return ano === anoSelecionado && mesesDoTrimestre.includes(mes);
      });
      const receitaTotal = receitasDoTrimestre.reduce((acc, r) => acc + (parseFloat(r.valor) || 0), 0);
      const despesasTotais = despesasDoTrimestre.reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);
      const sobrasMonetarias = receitaTotal - despesasTotais;
      const sobrasPercentual = receitaTotal > 0 ? (sobrasMonetarias / receitaTotal) * 100 : 0;
      return {
        trimestre: trimestre.nome,
        receitaTotal,
        despesasTotais,
        sobrasMonetarias,
        sobrasPercentual
      };
    });
    console.log('📊 Dados Trimestrais Calculados:', dadosTrimestrais);
    return dadosTrimestrais;
  }, [receitas, despesas, anoSelecionado, periodoSelecionado, trimestres]);

  // Obter todos os anos únicos para o gráfico de evolução anual
  const allYears = useMemo(() => {
    const years = new Set();
    receitas.forEach(r => years.add(r.data.split('-')[0]));
    despesas.forEach(d => years.add(d.data.split('-')[0]));
    return Array.from(years).sort();
  }, [receitas, despesas]);

  // Função para agregar dados para o gráfico de evolução temporal
  const dadosEvolucaoTemporal = useMemo(() => {
    const dataMap = new Map(); // Key: 'YYYY-MM' or 'YYYY-Tn' or 'YYYY'

    // Helper para adicionar valores ao mapa
    const addValue = (key, type, value) => {
      if (!dataMap.has(key)) {
        dataMap.set(key, { receitas: 0, despesas: 0, saldo: 0 });
      }
      const current = dataMap.get(key);
      current[type] += value;
      current.saldo = current.receitas - current.despesas; // Atualiza saldo
      dataMap.set(key, current);
    };

    // Processar receitas
    receitas.forEach(r => {
      const [ano, mes] = r.data.split('-');
      const valor = parseFloat(r.valor) || 0;
      let key;

      if (graficoEvolucaoPeriodo === 'mensal') {
        if (ano !== anoSelecionado) return; // Apenas o ano selecionado
        key = `${ano}-${mes}`;
      } else if (graficoEvolucaoPeriodo === 'trimestral') {
        if (ano !== anoSelecionado) return; // Apenas o ano selecionado
        const trimestre = trimestres.find(t => t.meses.includes(mes));
        if (!trimestre) return;
        key = `${ano}-${trimestre.valor}`;
      } else { // 'anual'
        key = ano; // Para anual, usa o ano como chave
      }
      addValue(key, 'receitas', valor);
    });

    // Processar despesas
    despesas.forEach(d => {
      const [ano, mes] = d.data.split('-');
      const valor = parseFloat(d.valor) || 0;
      let key;

      if (graficoEvolucaoPeriodo === 'mensal') {
        if (ano !== anoSelecionado) return; // Apenas o ano selecionado
        key = `${ano}-${mes}`;
      } else if (graficoEvolucaoPeriodo === 'trimestral') {
        if (ano !== anoSelecionado) return; // Apenas o ano selecionado
        const trimestre = trimestres.find(t => t.meses.includes(mes));
        if (!trimestre) return;
        key = `${ano}-${trimestre.valor}`;
      } else { // 'anual'
        key = ano; // Para anual, usa o ano como chave
      }
      addValue(key, 'despesas', valor);
    });

    // Garantir que todos os períodos estejam presentes, mesmo que sem dados
    let allPeriodsInScope = [];
    if (graficoEvolucaoPeriodo === 'mensal') {
      meses.forEach(m => allPeriodsInScope.push(`${anoSelecionado}-${m.valor}`));
    } else if (graficoEvolucaoPeriodo === 'trimestral') {
      trimestres.forEach(t => allPeriodsInScope.push(`${anoSelecionado}-${t.valor}`));
    } else { // 'anual'
      allYears.forEach(y => allPeriodsInScope.push(y));
    }

    // Preencher períodos ausentes com dados zerados
    allPeriodsInScope.forEach(periodoKey => {
      if (!dataMap.has(periodoKey)) {
        dataMap.set(periodoKey, { receitas: 0, despesas: 0, saldo: 0 });
      }
    });

    let sortedData = Array.from(dataMap.entries()).map(([key, values]) => {
      let name;
      if (graficoEvolucaoPeriodo === 'mensal') {
        const [ano, mes] = key.split('-');
        name = `${meses.find(m => m.valor === mes)?.nome.substring(0, 3)}/${ano}`;
      } else if (graficoEvolucaoPeriodo === 'trimestral') {
        const [anoTrimestre, trimestreVal] = key.split('-');
        name = `${trimestreVal}/${anoTrimestre}`;
      } else { // 'anual'
        name = key;
      }
      return { periodo: key, name, ...values };
    });

    // Ordenar dados cronologicamente
    sortedData.sort((a, b) => {
      if (graficoEvolucaoPeriodo === 'mensal' || graficoEvolucaoPeriodo === 'trimestral') {
        return a.periodo.localeCompare(b.periodo);
      } else { // 'anual'
        return parseInt(a.periodo) - parseInt(b.periodo);
      }
    });

    console.log('📊 Dados Evolução Temporal:', sortedData);
    return sortedData;
  }, [receitas, despesas, anoSelecionado, graficoEvolucaoPeriodo, meses, trimestres, allYears]);

  // Custom Tooltip para o Gráfico de Linha
  const CustomTooltip = ({ active, payload, label, formatarMoeda }) => {
    if (active && payload && payload.length) {
      const receitasValue = payload.find(p => p.dataKey === 'receitas')?.value || 0;
      const despesasValue = payload.find(p => p.dataKey === 'despesas')?.value || 0;
      const saldoValue = payload.find(p => p.dataKey === 'saldo')?.value || 0;

      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-md">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          <p className="text-green-600">Receitas: {formatarMoeda(receitasValue)}</p>
          <p className="text-red-600">Despesas: {formatarMoeda(despesasValue)}</p>
          <p className={`font-bold mt-2 ${saldoValue >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            Saldo: {formatarMoeda(saldoValue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Relatórios Financeiros
          </h1>
          <p className="text-gray-600 mt-2">Análise detalhada de suas finanças</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Filter className="w-6 h-6 text-blue-600" />
            Filtros
          </h2>
          <button
            onClick={() => setIsFiltrosMinimized(!isFiltrosMinimized)}
            className="text-gray-500 hover:text-gray-700"
            title={isFiltrosMinimized ? "Expandir Filtros" : "Minimizar Filtros"}
          >
            {isFiltrosMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
        {!isFiltrosMinimized && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <select
                id="periodo"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={periodoSelecionado}
                onChange={(e) => setPeriodoSelecionado(e.target.value)}
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            {periodoSelecionado === 'mensal' && (
              <div>
                <label htmlFor="mes" className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <select
                  id="mes"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(e.target.value)}
                >
                  {meses.map(mes => (
                    <option key={mes.valor} value={mes.valor}>{mes.nome}</option>
                  ))}
                </select>
              </div>
            )}
            {periodoSelecionado === 'trimestral' && (
              <div>
                <label htmlFor="trimestre" className="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
                <select
                  id="trimestre"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={trimestreSelecionado}
                  onChange={(e) => setTrimestreSelecionado(e.target.value)}
                >
                  {trimestres.map(trimestre => (
                    <option key={trimestre.valor} value={trimestre.valor}>{trimestre.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <select
                id="ano"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(e.target.value)}
              >
                {gerarListaAnos().map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Receitas</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatarMoeda(totalReceitas)}</p>
          </div>
          <DollarSign className="w-8 h-8 text-green-400 opacity-70" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatarMoeda(totalDespesas)}</p>
          </div>
          <TrendingDown className="w-8 h-8 text-red-400 opacity-70" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Saldo Atual</p>
            <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatarMoeda(saldo)}
            </p>
          </div>
          <Calendar className="w-8 h-8 text-blue-400 opacity-70" />
        </div>
      </div>

      {/* Acompanhamento de Orçamento */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" />
          Acompanhamento de Orçamento
        </h3>
        {orcamentoCompleto && orcamentoCompleto.categorias && orcamentoCompleto.categorias.length > 0 ? (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dadosOrcamento} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoria"
                  tick={renderCustomAxisTick}
                  interval={0}
                  height={80}
                />
                <YAxis formatter={(value) => formatarMoeda(value)} />
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Legend />
                <Bar dataKey="planejado" fill="#3B82F6" name="Planejado" stackId="a" />
                <Bar dataKey="gastoAtualPositivo" fill="#EF4444" name="Gasto" stackId="a" />
                <Bar dataKey="disponivelPositivo" fill="#10B981" name="Disponível" stackId="b" />
                <Bar dataKey="excedenteNegativo" fill="#F59E0B" name="Excedente" stackId="c" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Planejado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Disponível</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Utilizado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dadosOrcamento.map((item, index) => {
                    // Para a tabela, o gasto real é a soma do gasto atual (dentro do planejado) e o excedente (se houver)
                    const gastoReal = item.gastoAtualPositivo + Math.abs(item.excedenteNegativo);
                    const percentualUtilizado = item.planejadoTotal > 0 ? (gastoReal / item.planejadoTotal) * 100 : 0;
                    const ultrapassou = item.excedenteNegativo < 0;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">
                          {formatarMoeda(item.planejadoTotal)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          ultrapassou ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {formatarMoeda(gastoReal)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          item.disponivelPositivo >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {ultrapassou ? formatarMoeda(item.excedenteNegativo) : formatarMoeda(item.disponivelPositivo)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          percentualUtilizado > 100 ? 'text-red-600' : percentualUtilizado > 80 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {percentualUtilizado.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {ultrapassou ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              ⚠️ Ultrapassou
                            </span>
                          ) : percentualUtilizado > 80 ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              ⚡ Atenção
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p>Configure o orçamento para visualizar este gráfico</p>
            <p className="text-sm mt-2">
              Renda prevista: {orcamentoCompleto ? formatarMoeda(parseFloat(orcamentoCompleto.rendaPrevista || 0)) : 'R$ 0,00'}
            </p>
          </div>
        )}
      </div>

      {/* Relatório Trimestral de Receitas e Despesas */}
      {periodoSelecionado === 'trimestral' && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            Relatório Trimestral de Receitas e Despesas
          </h3>
          {calcularDadosTrimestrais.length > 0 && calcularDadosTrimestrais.some(d => d.receitaTotal > 0 || d.despesasTotais > 0) ? (
            <>
              {/* Tabela */}
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      {calcularDadosTrimestrais.map((data, index) => (
                        <th key={index} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {data.trimestre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Receita Total</td>
                      {calcularDadosTrimestrais.map((data, index) => (
                        <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                          {formatarMoeda(data.receitaTotal)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Despesas totais</td>
                      {calcularDadosTrimestrais.map((data, index) => (
                        <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-semibold">
                          {formatarMoeda(data.despesasTotais)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sobras ($)</td>
                      {calcularDadosTrimestrais.map((data, index) => (
                        <td key={index} className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${data.sobrasMonetarias >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatarMoeda(data.sobrasMonetarias)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sobras (%)</td>
                      {calcularDadosTrimestrais.map((data, index) => (
                        <td key={index} className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${data.sobrasPercentual >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {data.sobrasPercentual.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Gráfico */}
              <div className="mt-8">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={calcularDadosTrimestrais} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trimestre" />
                    <YAxis formatter={(value) => formatarMoeda(value)} />
                    <Tooltip formatter={(value, name) => [formatarMoeda(value), name]} />
                    <Legend />
                    <Bar dataKey="receitaTotal" fill="#10B981" name="Receita Total" />
                    <Bar dataKey="despesasTotais" fill="#EF4444" name="Despesas Totais" />
                    <Bar dataKey="sobrasMonetarias" fill="#3B82F6" name="Sobras ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <AlertCircle className="w-12 h-12 mb-2" />
              <p>Nenhum dado trimestral disponível para o ano selecionado.</p>
            </div>
          )}
        </div>
      )}
      {/* Gráficos Originais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Receitas vs Despesas por Categoria
          </h3>
          {dadosPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dadosPorCategoria} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoria"
                  tick={renderCustomAxisTick}
                  interval={0}
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Legend />
                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-purple-600" />
            Distribuição Geral
          </h3>
          {dadosPizza.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatarMoeda(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ NOVO: Gráfico de Evolução Temporal de Receitas e Despesas (AGORA NO FINAL DA PÁGINA) */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Evolução Temporal de Receitas e Despesas
          <div className="flex items-center gap-2">
            <label htmlFor="graficoEvolucaoPeriodo" className="text-sm font-medium text-gray-700">Período:</label>
            <select
              id="graficoEvolucaoPeriodo"
              className="pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              value={graficoEvolucaoPeriodo}
              onChange={(e) => setGraficoEvolucaoPeriodo(e.target.value)}
            >
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </h3>
        {dadosEvolucaoTemporal.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={dadosEvolucaoTemporal}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis formatter={(value) => formatarMoeda(value)} />
              <Tooltip content={<CustomTooltip formatarMoeda={formatarMoeda} />} /> {/* Passando formatarMoeda */}
              <Legend />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="#10B981" // Verde para Receitas
                strokeWidth={2}
                name="Receitas"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#EF4444" // Vermelho para Despesas
                strokeWidth={2}
                name="Despesas"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="#3B82F6" // Azul para Saldo
                strokeWidth={2}
                name="Saldo"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p>Nenhum dado de evolução temporal disponível para o período selecionado.</p>
            <p className="text-sm mt-2">Verifique se há receitas e despesas registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Relatorios;
