import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar,
  PieChart as PieChartIcon, Filter, ChevronDown, ChevronUp, Target, GraduationCap,
  BarChart3, AlertCircle
} from 'lucide-react';
import { useEdu } from '../contexts/EduContext';
import { useTheme } from '../components/theme-provider';
import EduHelpButton from '../components/EduHelpButton';

// Helper functions and constants defined outside the component
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ORDEM_CATEGORIAS = [
  'Despesas Fixas',
  'Educação',
  'Lazer',
  'Investimentos',
  'Reserva de Emergência'
];

const renderCustomAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-45)">
        {payload.value && payload.value.length > 12 ? `${payload.value.substring(0, 12)}...` : payload.value}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.stroke }} className="text-sm">
            {entry.name}: {formatarMoeda(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Relatorios = () => {
  const { showLesson } = useEdu();
  const { theme } = useTheme();
  const [isFiltrosMinimized, setIsFiltrosMinimized] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mensal');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`);
  const [trimestreSelecionado, setTrimestreSelecionado] = useState('1');
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [dadosOrcamento, setDadosOrcamento] = useState([]);
  const [orcamentoCompleto, setOrcamentoCompleto] = useState(null);
  const [dadosPorCategoria, setDadosPorCategoria] = useState([]);
  const [dadosPizza, setDadosPizza] = useState([]);
  const [dadosPizzaOrcamento, setDadosPizzaOrcamento] = useState([]);
  const [dadosEvolucaoTemporal, setDadosEvolucaoTemporal] = useState([]);
  const [graficoEvolucaoPeriodo, setGraficoEvolucaoPeriodo] = useState('mensal');
  const [calcularDadosTrimestrais, setCalcularDadosTrimestrais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionadaSub, setCategoriaSelecionadaSub] = useState('');
  const [dadosSubcategorias, setDadosSubcategorias] = useState([]);
  const [dadosComparativosMensais, setDadosComparativosMensais] = useState([]);
  const [listaCategoriasAtivas, setListaCategoriasAtivas] = useState([]);
  const [dadosCustoVida, setDadosCustoVida] = useState(null);


  // Cálculo das semanas restantes para o valor disponível semanal
  const semanasRestantes = useMemo(() => {
    const hoje = new Date();
    const mesNum = parseInt(mesSelecionado);
    const anoNum = parseInt(anoSelecionado);
    const ultimoDiaMes = new Date(anoNum, mesNum, 0).getDate();

    const isMesAtual = hoje.getFullYear() === anoNum && (hoje.getMonth() + 1) === mesNum;
    const isPassado = anoNum < hoje.getFullYear() || (anoNum === hoje.getFullYear() && mesNum < hoje.getMonth() + 1);

    // Se o mês já passou, usamos 1 para mostrar o valor total restante como a "semana" final
    if (isPassado) return 1;
    // Se for mês futuro, usamos o total de semanas do mês
    if (!isMesAtual) return ultimoDiaMes / 7;

    // Se for o mês atual, calculamos as semanas que faltam para acabar o mês (mínimo 1 dia)
    const diasRestantes = ultimoDiaMes - hoje.getDate() + 1;
    return Math.max(1, diasRestantes / 7);
  }, [mesSelecionado, anoSelecionado]);

  const meses = [
    { valor: '01', nome: 'Janeiro' }, { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' }, { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' }, { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' }, { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' }, { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' }, { valor: '12', nome: 'Dezembro' }
  ];

  const trimestres = [
    { valor: '1', nome: '1º Trimestre' }, { valor: '2', nome: '2º Trimestre' },
    { valor: '3', nome: '3º Trimestre' }, { valor: '4', nome: '4º Trimestre' }
  ];

  const gerarListaAnos = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual - 5; i <= anoAtual + 2; i++) {
      anos.push(i.toString());
    }
    return anos;
  };

  useEffect(() => {
    carregarDados();
  }, [periodoSelecionado, mesSelecionado, trimestreSelecionado, anoSelecionado, graficoEvolucaoPeriodo, categoriaSelecionadaSub]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/dados');
      const { receitas = [], despesas = [], orcamentos = [], categorias = [] } = response.data.dados || {};

      // Find budget for selected month (for mensal) or year (for other periods)
      let orcamentoSelecionado = null;
      if (periodoSelecionado === 'mensal') {
        const mesAnoSelecionado = `${anoSelecionado}-${mesSelecionado}`;
        orcamentoSelecionado = orcamentos.find(o => o.mes === mesAnoSelecionado);
      } else {
        // For trimestral/anual, use the first budget found for the selected year
        orcamentoSelecionado = orcamentos.find(o => o.mes && o.mes.startsWith(anoSelecionado));
      }

      setOrcamentoCompleto(orcamentoSelecionado);

      // Filtragem básica
      const filtrarPorPeriodo = (items) => {
        return items.filter(item => {
          if (!item.data) return false;
          const [ano, mes] = item.data.split('-');

          if (ano !== anoSelecionado) return false;

          if (periodoSelecionado === 'mensal') {
            return mes === mesSelecionado;
          } else if (periodoSelecionado === 'trimestral') {
            const mesNum = parseInt(mes);
            const trimestreInicio = (parseInt(trimestreSelecionado) - 1) * 3 + 1;
            return mesNum >= trimestreInicio && mesNum < trimestreInicio + 3;
          }
          return true; // anual
        });
      };

      const receitasFiltradas = filtrarPorPeriodo(receitas).filter(r => r.somarNoOrcamento !== false);
      const despesasFiltradas = filtrarPorPeriodo(despesas).filter(d => d.somarNoOrcamento !== false);

      // Totais
      const totalRec = receitasFiltradas.reduce((acc, curr) => acc + Number(curr.valor), 0);
      const totalDesp = despesasFiltradas.reduce((acc, curr) => acc + Number(curr.valor), 0);
      setTotalReceitas(totalRec);
      setTotalDespesas(totalDesp);
      setSaldo(totalRec - totalDesp);

      // Dados por Categoria
      const categoriasMap = {};
      despesasFiltradas.forEach(d => {
        if (!categoriasMap[d.categoria]) {
          categoriasMap[d.categoria] = 0;
        }
        categoriasMap[d.categoria] += Number(d.valor);
      });

      const dadosCat = Object.keys(categoriasMap).map(cat => ({
        categoria: cat,
        receitas: 0, // Simplificação
        despesas: categoriasMap[cat]
      }));
      setDadosPorCategoria(dadosCat);

      // Dados Pizza - Ordenados conforme ORDEM_CATEGORIAS
      const dadosPiz = Object.keys(categoriasMap).map(cat => ({
        name: cat,
        value: categoriasMap[cat]
      })).sort((a, b) => {
        const indexA = ORDEM_CATEGORIAS.indexOf(a.name);
        const indexB = ORDEM_CATEGORIAS.indexOf(b.name);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
      setDadosPizza(dadosPiz);

      // Dados Orçamento - use selected budget
      if (orcamentoSelecionado && orcamentoSelecionado.categorias) {
        const dadosOrc = orcamentoSelecionado.categorias.map(catOrc => {
          const gasto = categoriasMap[catOrc.nome] || 0;
          const planejado = catOrc.valor || (parseFloat(orcamentoSelecionado.rendaReal || orcamentoSelecionado.rendaPrevista || 0) * catOrc.percentual / 100);
          return {
            categoria: catOrc.nome,
            planejadoTotal: planejado,
            gastoAtualPositivo: Math.min(gasto, planejado),
            disponivelPositivo: Math.max(0, planejado - gasto),
            excedenteNegativo: Math.min(0, planejado - gasto)
          };
        });
        setDadosOrcamento(dadosOrc);

        // NOVO: Dados Pizza Orçamento - Também Ordenados
        const dadosPizOrc = orcamentoSelecionado.categorias.map(catOrc => ({
          name: catOrc.nome,
          value: catOrc.valor || (parseFloat(orcamentoSelecionado.rendaReal || orcamentoSelecionado.rendaPrevista || 0) * catOrc.percentual / 100)
        })).sort((a, b) => {
          const indexA = ORDEM_CATEGORIAS.indexOf(a.name);
          const indexB = ORDEM_CATEGORIAS.indexOf(b.name);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
        setDadosPizzaOrcamento(dadosPizOrc);
      } else {
        setDadosOrcamento([]);
        setDadosPizzaOrcamento([]);
      }

      // Evolução Temporal
      const dadosEvolucao = [];
      const mesesDoAno = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      mesesDoAno.forEach(mes => {
        const recMes = receitas.filter(r => r.data.startsWith(`${anoSelecionado}-${mes}`) && r.somarNoOrcamento !== false).reduce((acc, r) => acc + Number(r.valor), 0);
        const despMes = despesas.filter(d => d.data.startsWith(`${anoSelecionado}-${mes}`) && d.somarNoOrcamento !== false).reduce((acc, d) => acc + Number(d.valor), 0);
        dadosEvolucao.push({
          name: mes,
          receitas: recMes,
          despesas: despMes,
          saldo: recMes - despMes
        });
      });
      setDadosEvolucaoTemporal(dadosEvolucao);

      // Dados Trimestrais
      if (periodoSelecionado === 'trimestral') {
        const trimestresData = [1, 2, 3, 4].map(t => {
          const inicio = (t - 1) * 3 + 1;
          const fim = inicio + 2;
          const recTrim = receitas.filter(r => {
            const [a, m] = r.data.split('-');
            const mNum = parseInt(m);
            return a === anoSelecionado && mNum >= inicio && mNum <= fim && r.somarNoOrcamento !== false;
          }).reduce((acc, r) => acc + Number(r.valor), 0);

          const despTrim = despesas.filter(d => {
            const [a, m] = d.data.split('-');
            const mNum = parseInt(m);
            return a === anoSelecionado && mNum >= inicio && mNum <= fim && d.somarNoOrcamento !== false;
          }).reduce((acc, d) => acc + Number(d.valor), 0);

          return {
            trimestre: `${t}º Trim`,
            receitaTotal: recTrim,
            despesasTotais: despTrim,
            sobrasMonetarias: recTrim - despTrim,
            sobrasPercentual: recTrim > 0 ? ((recTrim - despTrim) / recTrim) * 100 : 0
          };
        });
        setCalcularDadosTrimestrais(trimestresData);
      } else {
        setCalcularDadosTrimestrais([]);
      }

      // Processamento de Subcategorias (MELHORADO: Inclui categorias das configurações mesmo sem despesas)
      // 1. Pegar categorias das configurações do usuário
      const categoriasConfig = response.data.dados?.categorias || [];
      
      // 2. Extrair categorias que já possuem despesas
      const categoriasComDespesas = [...new Set(despesas.map(d => d.categoria))].filter(Boolean);

      // 3. Unir e remover duplicatas, mantendo a ordem das configurações primeiro
      const nomesCategoriasUnicas = [
        ...categoriasConfig.map(c => c.nome),
        ...categoriasComDespesas.filter(nome => !categoriasConfig.some(c => c.nome === nome))
      ].sort();

      // Criar lista para o dropdown
      const listaFiltro = nomesCategoriasUnicas.map((cat, index) => ({
        id: `cat-rel-${index}`,
        nome: cat
      }));

      setListaCategoriasAtivas(listaFiltro);

      // Definir categoria padrão se não houver selecionada
      let catEfetiva = categoriaSelecionadaSub;
      if (!catEfetiva && listaFiltro.length > 0) {
        catEfetiva = listaFiltro[0].nome;
        setCategoriaSelecionadaSub(catEfetiva);
      }

      if (catEfetiva) {
        // Filtrar despesas da categoria no período selecionado (mensal/trimestral/anual)
        const despesasDaCategoriaPeriodo = despesasFiltradas.filter(d =>
          d.categoria && d.categoria.trim().toLowerCase() === catEfetiva.trim().toLowerCase()
        );

        // Mapa de subcategorias do período selecionado
        const subMap = {};
        despesasDaCategoriaPeriodo.forEach(d => {
          const sub = d.subcategoria || 'Geral';
          subMap[sub] = (subMap[sub] || 0) + Number(d.valor);
        });

        // Totais e ordenação (Top 10)
        const subDados = Object.keys(subMap).map(sub => ({
          name: sub,
          valor: subMap[sub]
        })).sort((a, b) => b.valor - a.valor).slice(0, 10);

        // Adicionar o TOTAL da categoria como o primeiro item para comparação direta
        const totalCat = despesasDaCategoriaPeriodo.reduce((acc, curr) => acc + Number(curr.valor), 0);

        if (totalCat > 0) {
          setDadosSubcategorias([
            { name: 'TOTAL', valor: totalCat, isTotal: true },
            ...subDados
          ]);
        } else {
          setDadosSubcategorias([]);
        }

        // COMPARATIVO MENSAL (Mês Selecionado vs Mês Anterior do Calendário)
        const mesAntNum = parseInt(mesSelecionado) - 1;
        const anoAntNum = parseInt(anoSelecionado);
        let mesAnteriorStr = mesAntNum < 1 ? '12' : (mesAntNum < 10 ? `0${mesAntNum}` : `${mesAntNum}`);
        let anoAnteriorStr = mesAntNum < 1 ? (anoAntNum - 1).toString() : anoAntNum.toString();

        // Despesas da mesma categoria no mês anterior
        const despesasMesAnterior = despesas.filter(d => {
          if (!d.data || !d.categoria) return false;
          if (d.categoria.trim().toLowerCase() !== catEfetiva.trim().toLowerCase()) return false;
          if (d.somarNoOrcamento === false) return false;

          const [ano, mes] = d.data.split('-');
          return ano === anoAnteriorStr && mes === mesAnteriorStr;
        });

        const subMapAnterior = {};
        despesasMesAnterior.forEach(d => {
          const sub = d.subcategoria || 'Geral';
          subMapAnterior[sub] = (subMapAnterior[sub] || 0) + Number(d.valor);
        });

        // Unir dados atuais e anteriores para o gráfico comparativo
        const todasSub = new Set([...Object.keys(subMap), ...Object.keys(subMapAnterior)]);
        const compDados = Array.from(todasSub).map(sub => ({
          name: sub,
          atual: subMap[sub] || 0,
          anterior: subMapAnterior[sub] || 0
        })).sort((a, b) => b.atual - a.atual).slice(0, 10);

        // Só exibe se houver algum dado em pelo menos um dos meses
        if (compDados.some(d => d.atual > 0 || d.anterior > 0)) {
          setDadosComparativosMensais(compDados);
        } else {
          setDadosComparativosMensais([]);
        }

        // NOVO: Cálculo do Custo de Vida (Média Mensal de Despesas Fixas, Educação e Lazer)
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
        const diaAtual = String(hoje.getDate()).padStart(2, '0');
        const dataLimiteStr = `${anoAtual}-${mesAtual}-${diaAtual}`;

        const categoriasCustoVida = ['Despesas Fixas', 'Educação', 'Lazer'];
        const despesasCV = despesas.filter(d => 
          d.categoria && 
          categoriasCustoVida.includes(d.categoria.trim()) && 
          d.somarNoOrcamento !== false &&
          d.data &&
          d.data >= '2026-01-01' &&
          d.data <= dataLimiteStr
        );

        const mesesDiferenca = (anoAtual - 2026) * 12 + (hoje.getMonth() + 1);
        const numMesesCV = Math.max(1, mesesDiferenca);
        
        if (numMesesCV > 0) {
          const totalGeralCV = despesasCV.reduce((acc, curr) => acc + Number(curr.valor), 0);
          const mediaGeralCV = totalGeralCV / numMesesCV;
          
          const totaisPorCatCV = {};
          categoriasCustoVida.forEach(cat => {
            totaisPorCatCV[cat] = despesasCV
              .filter(d => d.categoria.trim() === cat)
              .reduce((acc, curr) => acc + Number(curr.valor), 0);
          });

          setDadosCustoVida({
            totalGeral: totalGeralCV,
            mediaMensal: mediaGeralCV,
            numMeses: numMesesCV,
            totaisPorCategoria: totaisPorCatCV,
            mediasPorCategoria: {
              'Despesas Fixas': totaisPorCatCV['Despesas Fixas'] / numMesesCV,
              'Educação': totaisPorCatCV['Educação'] / numMesesCV,
              'Lazer': totaisPorCatCV['Lazer'] / numMesesCV
            }
          });
        } else {
          setDadosCustoVida(null);
        }
      }


      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
      setLoading(false);
    }
  };

  // Função para garantir cores consistentes entre os gráficos baseada no nome da categoria
  const getCorCategoria = useCallback((nome) => {
    // Primeiro tenta usar a ordem fixa para cores estáveis
    const indexFixa = ORDEM_CATEGORIAS.indexOf(nome);
    if (indexFixa !== -1) return COLORS[indexFixa % COLORS.length];

    // Caso seja uma categoria personalizada, mapeia baseada nas outras categorias presentes
    const todasCategorias = Array.from(new Set([
      ...dadosPizza.map(d => d.name),
      ...dadosPizzaOrcamento.map(d => d.name)
    ])).filter(cat => !ORDEM_CATEGORIAS.includes(cat)).sort();
    
    const indexExtra = todasCategorias.indexOf(nome);
    return COLORS[(ORDEM_CATEGORIAS.length + indexExtra) % COLORS.length];
  }, [dadosPizza, dadosPizzaOrcamento]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            Relatórios Financeiros
          </h2>
          <div className="flex items-center gap-3">
            <EduHelpButton topic="relatorios" />
            <button
              onClick={() => setIsFiltrosMinimized(!isFiltrosMinimized)}
              className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
              title={isFiltrosMinimized ? "Expandir Filtros" : "Minimizar Filtros"}
            >
              {isFiltrosMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {!isFiltrosMinimized && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Período</label>
              <select
                id="periodo"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                <label htmlFor="mes" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Mês</label>
                <select
                  id="mes"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                <label htmlFor="trimestre" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Trimestre</label>
                <select
                  id="trimestre"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
              <label htmlFor="ano" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Ano</label>
              <select
                id="ano"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
      </div >

      {/* Cards de Resumo */}
      < div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total de Receitas</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1">{formatarMoeda(totalReceitas)}</p>
          </div>
          <DollarSign className="w-8 h-8 text-green-400 dark:text-green-600 opacity-70" />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-500 mt-1">{formatarMoeda(totalDespesas)}</p>
          </div>
          <TrendingDown className="w-8 h-8 text-red-400 dark:text-red-600 opacity-70" />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Saldo Atual</p>
            <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-orange-600 dark:text-orange-500'}`}>
              {formatarMoeda(saldo)}
            </p>
          </div>
          <Calendar className="w-8 h-8 text-blue-400 dark:text-blue-600 opacity-70" />
        </div>
      </div >

      {/* Acompanhamento de Orçamento */}
      < div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800 transition-colors" >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Acompanhamento de Orçamento
        </h3>
        {
          orcamentoCompleto && orcamentoCompleto.categorias && orcamentoCompleto.categorias.length > 0 ? (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dadosOrcamento} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                  <XAxis
                    dataKey="categoria"
                    tick={renderCustomAxisTick}
                    interval={0}
                    height={80}
                    stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                  />
                  <YAxis formatter={(value) => formatarMoeda(value)} stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000' }}
                    formatter={(value) => formatarMoeda(value)} 
                  />
                  <Legend />
                  <Bar dataKey="planejado" fill="#3B82F6" name="Planejado" stackId="a" />
                  <Bar dataKey="gastoAtualPositivo" fill="#EF4444" name="Gasto" stackId="a" />
                  <Bar dataKey="disponivelPositivo" fill="#10B981" name="Disponível" stackId="b" />
                  <Bar dataKey="excedenteNegativo" fill="#F59E0B" name="Excedente" stackId="c" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                  <thead className="bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Planejado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plano Semanal</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Gasto</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Disponível</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Disp. Semanal</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">% Utilizado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                    {dadosOrcamento.map((item, index) => {
                      // Para a tabela, o gasto real é a soma do gasto atual (dentro do planejado) e o excedente (se houver)
                      const gastoReal = item.gastoAtualPositivo + Math.abs(item.excedenteNegativo);
                      const percentualUtilizado = item.planejadoTotal > 0 ? (gastoReal / item.planejadoTotal) * 100 : 0;
                      const ultrapassou = item.excedenteNegativo < 0;
                      return (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {item.categoria}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
                            {formatarMoeda(item.planejadoTotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-500 dark:text-blue-300 font-medium">
                            {formatarMoeda(item.planejadoTotal / 4)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${ultrapassou ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-slate-200'
                            }`}>
                            {formatarMoeda(gastoReal)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${item.disponivelPositivo >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                            }`}>
                            {ultrapassou ? formatarMoeda(item.excedenteNegativo) : formatarMoeda(item.disponivelPositivo)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${(item.planejadoTotal - gastoReal) >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                            }`}>
                            {formatarMoeda((item.planejadoTotal - gastoReal) / semanasRestantes)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${Math.abs(percentualUtilizado - 100) < 0.1 ? 'text-blue-600 dark:text-blue-400' : percentualUtilizado > 100 ? 'text-red-600 dark:text-red-500' : percentualUtilizado > 80 ? 'text-orange-600 dark:text-orange-500' : 'text-green-600 dark:text-green-500'
                            }`}>
                            {percentualUtilizado.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {Math.abs(percentualUtilizado - 100) < 0.1 ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                🎯 Meta Atingida
                              </span>
                            ) : ultrapassou ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                                ⚠️ Ultrapassou
                              </span>
                            ) : percentualUtilizado > 80 ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300">
                                ⚡ Atenção
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
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
          )
        }
      </div >

      {/* Relatório Trimestral de Receitas e Despesas */}
      {
        periodoSelecionado === 'trimestral' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800 transition-colors">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-500" />
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
        )
      }
      {/* Gráficos Originais - Distribuição Geral (Real vs Orçado) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800 transition-colors">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <PieChartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Distribuição Geral
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lado Esquerdo: Gastos Reais */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Gastos Reais</h4>
            {dadosPizza.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart margin={{ top: 0, right: 40, left: 40, bottom: 0 }}>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => {
                      const displayName = name === 'Reserva de Emergência' ? 'Reserva Emergência' : name;
                      return `${displayName}: ${(percent * 100).toFixed(1)}%`;
                    }}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCorCategoria(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [formatarMoeda(value), name === 'Reserva de Emergência' ? 'Reserva Emergência' : name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-gray-400">
                <p>Nenhum gasto registrado</p>
              </div>
            )}
          </div>

          {/* Lado Direito: Planejado (Orçamento) */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Planejado (Orçamento)</h4>
            {dadosPizzaOrcamento.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <Pie
                    data={dadosPizzaOrcamento}
                    cx="42%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => {
                      const displayName = name === 'Reserva de Emergência' ? 'Reserva Emergência' : name;
                      return `${displayName}: ${(percent * 100).toFixed(1)}%`;
                    }}
                    outerRadius={70}
                    fill="#82ca9d"
                    dataKey="value"
                  >
                    {dadosPizzaOrcamento.map((entry, index) => (
                      <Cell key={`cell-orc-${index}`} fill={getCorCategoria(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000' }}
                    formatter={(value, name) => [formatarMoeda(value), name === 'Reserva de Emergência' ? 'Reserva Emergência' : name]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-gray-400 dark:text-slate-500">
                <p>Orçamento não configurado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ NOVO: Relatório de Custo de Vida (Média de Despesas Fixas, Educação e Lazer) */}
      {dadosCustoVida && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                Análise de Custo de Vida
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Média mensal baseada em Despesas Fixas, Educação e Lazer</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Média Mensal Geral</span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{formatarMoeda(dadosCustoVida.mediaMensal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Despesas Fixas</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">{formatarMoeda(dadosCustoVida.mediasPorCategoria['Despesas Fixas'])}</span>
                  <span className="text-[10px] text-gray-500 block mt-1">média/mês</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Educação</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">{formatarMoeda(dadosCustoVida.mediasPorCategoria['Educação'])}</span>
                  <span className="text-[10px] text-gray-500 block mt-1">média/mês</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Lazer</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">{formatarMoeda(dadosCustoVida.mediasPorCategoria['Lazer'])}</span>
                  <span className="text-[10px] text-gray-500 block mt-1">média/mês</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Resumo do Período</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Análise realizada sobre <strong>{dadosCustoVida.numMeses} meses</strong> de dados históricos. 
                      O gasto total acumulado nestas categorias foi de <strong>{formatarMoeda(dadosCustoVida.totalGeral)}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Fixas', valor: dadosCustoVida.mediasPorCategoria['Despesas Fixas'] },
                    { name: 'Educação', valor: dadosCustoVida.mediasPorCategoria['Educação'] },
                    { name: 'Lazer', valor: dadosCustoVida.mediasPorCategoria['Lazer'] }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} />
                  <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748B'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value) => formatarMoeda(value)}
                  />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={50}>
                    <Cell fill="#3B82F6" />
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NOVO: Relatório Detalhado por Subcategoria (ESTILIZADO) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </span>
              Análise de Precisão
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 ml-10">Desdobramento por subcategoria e comparação histórica</p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-2 rounded-xl border border-gray-100 dark:border-slate-700 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-2">Categoria Ativa:</span>
            <select
              className="bg-white dark:bg-slate-900 border-none text-sm font-bold text-blue-600 dark:text-blue-400 focus:ring-0 cursor-pointer rounded-lg px-2"
              value={categoriaSelecionadaSub}
              onChange={(e) => setCategoriaSelecionadaSub(e.target.value)}
            >
              {listaCategoriasAtivas.map(cat => (
                <option key={cat.id} value={cat.nome}>{cat.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gráfico 1: Desdobramento com Valores Diretos e Espaço Otimizado */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex-1">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">
              Composição Detalhada (R$ e %)
            </h4>
            {dadosSubcategorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={dadosSubcategorias}
                  layout="vertical"
                  margin={{ top: 5, right: 120, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={90}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{payload[0].payload.name}</p>
                            <p className="text-lg font-black text-gray-800">{formatarMoeda(payload[0].value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={28}>
                    {dadosSubcategorias.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isTotal ? 'url(#colorTotal)' : 'url(#colorSub)'}
                      />
                    ))}
                    <label
                      dataKey="valor"
                      position="right"
                      content={({ x, y, value, width, index }) => {
                        const entry = dadosSubcategorias[index];
                        if (!entry) return null;
                        const totalItem = dadosSubcategorias.find(d => d.isTotal);
                        const total = totalItem ? totalItem.valor : 1;
                        const percent = ((value / total) * 100).toFixed(1);

                        return (
                          <g>
                            <text
                              x={x + width + 8}
                              y={y + 12}
                              fill={entry.isTotal ? "#1E3A8A" : "#1F2937"}
                              fontSize={11}
                              fontWeight="800"
                            >
                              {formatarMoeda(value)}
                            </text>
                            {!entry.isTotal && (
                              <text
                                x={x + width + 8}
                                y={y + 24}
                                fill="#6B7280"
                                fontSize={10}
                                fontWeight="600"
                              >
                                {percent}% do total
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
                <div className="p-4 bg-gray-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-sm">Sem dados para esta categoria no período</p>
              </div>
            )}
          </div>

          {/* Gráfico 2: Comparativo com Indicadores de Mudança */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">
              Variação vs Mês Anterior
            </h4>
            {dadosComparativosMensais.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={dadosComparativosMensais} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="colorAnterior" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={renderCustomAxisTick}
                    interval={0}
                    height={60}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    formatter={(value) => formatarMoeda(value).replace('R$', '').trim()}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length === 2) {
                        const atual = payload[1].value;
                        const anterior = payload[0].value;
                        const diff = atual - anterior;
                        const perc = anterior > 0 ? ((diff / anterior) * 100).toFixed(1) : (atual > 0 ? 100 : 0);
                        const isUp = diff > 0;

                        return (
                          <div className="bg-white p-4 shadow-2xl rounded-xl border border-gray-100 min-w-[200px]">
                            <p className="text-xs font-black text-gray-400 uppercase mb-3 pb-2 border-b border-gray-50">{label}</p>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-gray-400">ANTERIOR</span>
                              <span className="text-sm font-bold text-gray-600">{formatarMoeda(anterior)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-extrabold text-emerald-600">ATUAL</span>
                              <span className="text-base font-black text-emerald-700">{formatarMoeda(atual)}</span>
                            </div>
                            <div className={`p-2 rounded-lg flex items-center justify-center gap-2 ${isUp ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {isUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              <span className="text-xs font-black italic">
                                {isUp ? 'Aumento' : 'Economia'} de {Math.abs(perc)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="anterior" fill="url(#colorAnterior)" name="Mês Anterior" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="atual" fill="url(#colorAtual)" name="Mês Atual" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
                <div className="p-4 bg-gray-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-sm">Histórico insuficiente para comparação</p>
              </div>
            )}
        </div>
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
              <Tooltip content={<CustomTooltip />} />
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
    </div >
  );
};

export default Relatorios;
