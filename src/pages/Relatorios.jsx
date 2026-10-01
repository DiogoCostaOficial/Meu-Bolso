import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar,
  PieChart as PieChartIcon, Filter, ChevronDown, ChevronUp, Target, GraduationCap,
  BarChart3, AlertCircle, Sliders, ShieldCheck, PiggyBank
} from 'lucide-react';
import { useEdu } from '../contexts/EduContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../components/theme-provider';
import EduHelpButton from '../components/EduHelpButton';
import CurrencySelector from '../components/CurrencySelector';

// Helper functions and constants defined outside the component

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ORDEM_CATEGORIAS = [
  'Despesas Fixas',
  'Educação',
  'Lazer',
  'Investimentos',
  'Reserva de Emergência'
];

const DEFAULT_CHART_CONFIGS = [
  { id: 'orcamento', title: 'Acompanhamento de Orçamento', size: 'large', visible: true },
  { id: 'distribuicao', title: 'Distribuição Geral (Reais vs Planejado)', size: 'large', visible: true },
  { id: 'custo-vida', title: 'Análise de Custo de Vida', size: 'large', visible: true },
  { id: 'precisao', title: 'Análise de Precisão por Subcategoria', size: 'large', visible: true },
  { id: 'compromissos-essenciais', title: 'Compromissos Essenciais (Fixas + Educação)', size: 'large', visible: true },
  { id: 'construcao-patrimonial', title: 'Construção Patrimonial (Investimentos + Reserva)', size: 'large', visible: true },
  { id: 'evolucao', title: 'Evolução Temporal de Receitas/Despesas', size: 'large', visible: true },
];

const matchCat = (catName, target) => {
  if (!catName || !target) return false;
  return catName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
         target.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

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
  const { formatCurrency: formatarMoeda } = useCurrency();
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
  const { formatCurrency: formatarMoeda } = useCurrency();
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
  const [chartConfigs, setChartConfigs] = useState(() => {
    const saved = localStorage.getItem('relatorios_chart_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(c => c.id));
          const missing = DEFAULT_CHART_CONFIGS.filter(c => !existingIds.has(c.id));
          if (missing.length > 0) {
            return [...parsed, ...missing];
          }
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_CHART_CONFIGS;
  });

  const [dadosCompromissos, setDadosCompromissos] = useState(null);
  const [dadosPatrimonio, setDadosPatrimonio] = useState(null);

  useEffect(() => {
    localStorage.setItem('relatorios_chart_configs', JSON.stringify(chartConfigs));
  }, [chartConfigs]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, targetIndex) => {
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newConfigs = [...chartConfigs];
    const [removed] = newConfigs.splice(sourceIndex, 1);
    newConfigs.splice(targetIndex, 0, removed);
    setChartConfigs(newConfigs);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const toggleChartVisibility = (id) => {
    setChartConfigs(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const changeChartSize = (id, size) => {
    setChartConfigs(prev => prev.map(c => c.id === id ? { ...c, size: size } : c));
  };

  
  const [layoutVariant, setLayoutVariant] = useState(() => {
    return localStorage.getItem('homolog_layout_variant') || 'standard';
  });

  useEffect(() => {
    const handleStorage = () => {
      setLayoutVariant(localStorage.getItem('homolog_layout_variant') || 'standard');
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);
  
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
        let totalSemanasMes = 4.33;
        if (periodoSelecionado === 'mensal') {
          const mesNum = parseInt(mesSelecionado) || (new Date().getMonth() + 1);
          const anoNum = parseInt(anoSelecionado) || new Date().getFullYear();
          const ultimoDiaMes = new Date(anoNum, mesNum, 0).getDate();
          totalSemanasMes = Math.max(1, ultimoDiaMes / 7);
        } else if (periodoSelecionado === 'trimestral') {
          totalSemanasMes = 13;
        } else if (periodoSelecionado === 'anual') {
          totalSemanasMes = 52;
        }

        const semanasRest = (periodoSelecionado === 'mensal' && semanasRestantes > 0) ? semanasRestantes : totalSemanasMes;

        const dadosOrc = orcamentoSelecionado.categorias.map(catOrc => {
          const gasto = categoriasMap[catOrc.nome] || 0;
          const planejado = catOrc.valor || (parseFloat(orcamentoSelecionado.rendaReal || orcamentoSelecionado.rendaPrevista || 0) * catOrc.percentual / 100);
          const disponivel = planejado - gasto;
          const gastoAtualPositivo = Math.min(gasto, planejado);
          const disponivelPositivo = Math.max(0, disponivel);
          const excedente = Math.max(0, gasto - planejado);
          const excedenteNegativo = Math.min(0, disponivel);

          return {
            categoria: catOrc.nome,
            planejado: planejado,
            planejadoTotal: planejado,
            planoSemanal: totalSemanasMes > 0 ? planejado / totalSemanasMes : 0,
            gasto: gasto,
            gastoAtualPositivo: gastoAtualPositivo,
            disponivelTotal: disponivel,
            disponivelPositivo: disponivelPositivo,
            disponivelSemanal: semanasRest > 0 ? disponivel / semanasRest : 0,
            excedente: excedente,
            excedenteNegativo: excedenteNegativo
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

      // ==========================================
      // RELATÓRIOS UNIFICADOS (AGRUPAMENTOS INTELIGENTES)
      // ==========================================

      const getPlanejadoCat = (target) => {
        if (!orcamentoSelecionado || !orcamentoSelecionado.categorias) return 0;
        const item = orcamentoSelecionado.categorias.find(c => matchCat(c.nome, target));
        if (!item) return 0;
        const renda = parseFloat(orcamentoSelecionado.rendaReal || orcamentoSelecionado.rendaPrevista || 0);
        return Number(item.valor || (renda * (Number(item.percentual) || 0) / 100)) || 0;
      };

      // 1. Relatório: Compromissos Essenciais (Despesas Fixas + Educação)
      const planejadoFixas = getPlanejadoCat('Despesas Fixas');
      const planejadoEducacao = getPlanejadoCat('Educação');
      const planejadoCompromissos = planejadoFixas + planejadoEducacao;

      const despesasFixas = despesasFiltradas.filter(d => matchCat(d.categoria, 'Despesas Fixas'));
      const despesasEducacao = despesasFiltradas.filter(d => matchCat(d.categoria, 'Educação'));
      const gastoFixas = despesasFixas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      const gastoEducacao = despesasEducacao.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      const gastoCompromissos = gastoFixas + gastoEducacao;

      const disponivelCompromissos = planejadoCompromissos - gastoCompromissos;
      const ultrapassouCompromissos = planejadoCompromissos > 0 && gastoCompromissos > planejadoCompromissos;
      const percUtilizadoCompromissos = planejadoCompromissos > 0 ? (gastoCompromissos / planejadoCompromissos) * 100 : 0;

      const subMapCompromissos = {};
      [...despesasFixas, ...despesasEducacao].forEach(d => {
        const sub = d.subcategoria?.trim() || 'Geral';
        const catOrigem = matchCat(d.categoria, 'Educação') ? 'Educação' : 'Despesas Fixas';
        if (!subMapCompromissos[sub]) {
          subMapCompromissos[sub] = { name: sub, valor: 0, categoria: catOrigem };
        }
        subMapCompromissos[sub].valor += Number(d.valor || 0);
      });
      const topSubCompromissos = Object.values(subMapCompromissos)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8);

      setDadosCompromissos({
        gastoTotal: gastoCompromissos,
        gastoFixas,
        gastoEducacao,
        planejadoTotal: planejadoCompromissos,
        planejadoFixas,
        planejadoEducacao,
        disponivel: disponivelCompromissos,
        ultrapassou: ultrapassouCompromissos,
        percentualUtilizado: percUtilizadoCompromissos,
        subcategorias: topSubCompromissos,
        porcentagemFixas: gastoCompromissos > 0 ? (gastoFixas / gastoCompromissos) * 100 : 50,
        porcentagemEducacao: gastoCompromissos > 0 ? (gastoEducacao / gastoCompromissos) * 100 : 50,
        hasOrcamento: planejadoCompromissos > 0
      });

      // 2. Relatório: Construção Patrimonial (Investimentos + Reserva de Emergência)
      const planejadoInvestimentos = getPlanejadoCat('Investimentos');
      const planejadoReserva = getPlanejadoCat('Reserva de Emergência');
      const planejadoPatrimonio = planejadoInvestimentos + planejadoReserva;

      const despesasInvestimentos = despesasFiltradas.filter(d => matchCat(d.categoria, 'Investimentos'));
      const despesasReserva = despesasFiltradas.filter(d => matchCat(d.categoria, 'Reserva de Emergência'));
      const aporteInvestimentos = despesasInvestimentos.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      const aporteReserva = despesasReserva.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      const aporteTotalPatrimonio = aporteInvestimentos + aporteReserva;

      const percAtingidoPatrimonio = planejadoPatrimonio > 0 ? (aporteTotalPatrimonio / planejadoPatrimonio) * 100 : 0;
      const metaSuperada = planejadoPatrimonio > 0 && aporteTotalPatrimonio >= planejadoPatrimonio;
      const saldoRestanteMeta = Math.max(0, planejadoPatrimonio - aporteTotalPatrimonio);
      const excedenteAporte = Math.max(0, aporteTotalPatrimonio - planejadoPatrimonio);

      const subMapPatrimonio = {};
      [...despesasInvestimentos, ...despesasReserva].forEach(d => {
        const sub = d.subcategoria?.trim() || 'Geral';
        const catOrigem = matchCat(d.categoria, 'Reserva de Emergência') ? 'Reserva' : 'Investimentos';
        if (!subMapPatrimonio[sub]) {
          subMapPatrimonio[sub] = { name: sub, valor: 0, categoria: catOrigem };
        }
        subMapPatrimonio[sub].valor += Number(d.valor || 0);
      });
      const topSubPatrimonio = Object.values(subMapPatrimonio)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8);

      setDadosPatrimonio({
        aporteTotal: aporteTotalPatrimonio,
        aporteInvestimentos,
        aporteReserva,
        metaTotal: planejadoPatrimonio,
        planejadoInvestimentos,
        planejadoReserva,
        percentualAtingido: percAtingidoPatrimonio,
        metaSuperada,
        saldoRestanteMeta,
        excedenteAporte,
        subcategorias: topSubPatrimonio,
        porcentagemInvestimentos: aporteTotalPatrimonio > 0 ? (aporteInvestimentos / aporteTotalPatrimonio) * 100 : 50,
        porcentagemReserva: aporteTotalPatrimonio > 0 ? (aporteReserva / aporteTotalPatrimonio) * 100 : 50,
        hasOrcamento: planejadoPatrimonio > 0
      });

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

  const renderChartContent = (id) => {
    switch (id) {
      case 'orcamento':
        return (
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-colors h-full">
            <h3 className="text-xl font-bold text-custom-main mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-custom-gold" />
              Acompanhamento de Orçamento
            </h3>
            {orcamentoCompleto && orcamentoCompleto.categorias && orcamentoCompleto.categorias.length > 0 ? (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosOrcamento} margin={{ top: 10, right: 10, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#e2e8f0'} />
                    <XAxis
                      dataKey="categoria"
                      tick={renderCustomAxisTick}
                      interval={0}
                      height={80}
                      stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                    />
                    <YAxis formatter={(value) => formatarMoeda(value)} stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000' }}
                      formatter={(value) => formatarMoeda(value)} 
                    />
                    <Legend />
                    <Bar dataKey="planejado" fill={layoutVariant === "neon-glass" ? "#00f0ff" : layoutVariant === "scifi-hud" ? "#0088ff" : layoutVariant === "cosmic-aurora" ? "#ff7b54" : "#3B82F6"} name="Planejado" stackId="a" />
                    <Bar dataKey="gastoAtualPositivo" fill={layoutVariant === "scifi-hud" ? "#ff6600" : "#EF4444"} name="Gasto" stackId="b" />
                    <Bar dataKey="excedente" fill="#F59E0B" name="Excedente" stackId="b" />
                    <Bar dataKey="disponivelPositivo" fill={layoutVariant === "neon-glass" ? "#10B981" : layoutVariant === "cosmic-aurora" ? "#ffd43f" : "#10B981"} name="Disponível" stackId="c" />
                  </BarChart>
                </ResponsiveContainer>
                {/* TABELA */}
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-custom-color">
                    <thead className="bg-custom-primary/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-custom-main uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-custom-main uppercase tracking-wider">Planejado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-custom-main uppercase tracking-wider">Plano Semanal</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-custom-main uppercase tracking-wider">Gasto</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-custom-main uppercase tracking-wider">Disponível</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-custom-main uppercase tracking-wider">Disp. Semanal</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-custom-main uppercase tracking-wider">% Utilizado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-custom-main uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-custom-color">
                      {dadosOrcamento.map((item, index) => {
                        const gastoReal = item.gastoAtualPositivo + Math.abs(item.excedenteNegativo);
                        const percentualUtilizado = item.planejadoTotal > 0 ? (gastoReal / item.planejadoTotal) * 100 : 0;
                        const ultrapassou = item.excedenteNegativo < 0;
                        return (
                          <tr key={index} className="hover:bg-custom-primary/20">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-custom-main">{item.categoria}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-custom-main font-semibold">{formatarMoeda(item.planejadoTotal)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-custom-main opacity-80">{formatarMoeda(item.planoSemanal)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-500 font-semibold">{formatarMoeda(gastoReal)}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${ultrapassou ? 'text-orange-500' : 'text-green-500'}`}>{formatarMoeda(item.disponivelTotal)}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${ultrapassou ? 'text-orange-500' : 'text-green-500'}`}>{formatarMoeda(item.disponivelSemanal)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-custom-main font-semibold">{percentualUtilizado.toFixed(1)}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ultrapassou ? 'bg-orange-950/20 text-orange-400' : 'bg-green-950/20 text-green-400'}`}>
                                {ultrapassou ? 'Estourado' : 'Dentro do Limite'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <AlertCircle className="w-12 h-12 mb-2 text-custom-gold" />
                <p className="text-custom-main">Nenhum dado de orçamento disponível para o mês selecionado.</p>
              </div>
            )}
          </div>
        );

      case 'distribuicao':
        return (
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-colors h-full">
            <h3 className="text-xl font-bold text-custom-main mb-6 flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-custom-gold" />
              Distribuição Geral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-semibold text-custom-main opacity-80 mb-4 uppercase tracking-wider">Gastos Reais</h4>
                {dadosPizza.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart margin={{ top: 0, right: 40, left: 40, bottom: 0 }}>
                      <Pie
                        data={dadosPizza.filter(item => item.value > 0)}
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
                        {dadosPizza.filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCorCategoria(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [formatarMoeda(value), name === 'Reserva de Emergência' ? 'Reserva Emergência' : name]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[320px] text-gray-400">
                    <p className="text-custom-main">Nenhum gasto registrado</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-semibold text-custom-main opacity-80 mb-4 uppercase tracking-wider">Planejado (Orçamento)</h4>
                {dadosPizzaOrcamento.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <Pie
                        data={dadosPizzaOrcamento.filter(item => item.value > 0)}
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
                        {dadosPizzaOrcamento.filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-orc-${index}`} fill={getCorCategoria(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000' }}
                        formatter={(value, name) => [formatarMoeda(value), name === 'Reserva de Emergência' ? 'Reserva Emergência' : name]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[320px] text-gray-400">
                    <p className="text-custom-main">Orçamento não configurado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'custo-vida':
        return (
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-colors h-full">
            {dadosCustoVida ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-custom-main flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-custom-gold" />
                      Análise de Custo de Vida
                    </h3>
                    <p className="text-sm text-custom-main opacity-70 mt-1">Média mensal baseada em Despesas Fixas, Educação e Lazer</p>
                  </div>
                  <div className="bg-custom-gold/15 px-4 py-2 rounded-lg border border-custom-color">
                    <span className="text-xs font-bold text-custom-gold uppercase block">Média Mensal Geral</span>
                    <span className="text-xl font-black text-custom-gold">{formatarMoeda(dadosCustoVida.mediaMensal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                        <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Despesas Fixas</span>
                        <span className="text-lg font-bold text-custom-main">{formatarMoeda(dadosCustoVida.mediasPorCategoria['Despesas Fixas'])}</span>
                        <span className="text-[10px] text-custom-main opacity-50 block mt-1">média/mês</span>
                      </div>
                      <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                        <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Educação</span>
                        <span className="text-lg font-bold text-custom-main">{formatarMoeda(dadosCustoVida.mediasPorCategoria['Educação'])}</span>
                        <span className="text-[10px] text-custom-main opacity-50 block mt-1">média/mês</span>
                      </div>
                      <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                        <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Lazer</span>
                        <span className="text-lg font-bold text-custom-main">{formatarMoeda(dadosCustoVida.mediasPorCategoria['Lazer'])}</span>
                        <span className="text-[10px] text-custom-main opacity-50 block mt-1">média/mês</span>
                      </div>
                    </div>

                    <div className="p-4 bg-custom-gold/10 rounded-xl border border-custom-gold/25">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-custom-gold/20 rounded-lg mt-1">
                          <TrendingUp className="w-4 h-4 text-custom-gold" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-custom-gold">Resumo do Período</h4>
                          <p className="text-xs text-custom-main opacity-80 mt-1">
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                        <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748B'} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                          contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                          formatter={(value) => formatarMoeda(value)}
                        />
                        <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={50}>
                          <Cell fill={layoutVariant === "neon-glass" ? "#00f0ff" : layoutVariant === "scifi-hud" ? "#0088ff" : "#3B82F6"} />
                          <Cell fill={layoutVariant === "cosmic-aurora" ? "#ff7b54" : "#10B981"} />
                          <Cell fill={layoutVariant === "cosmic-aurora" ? "#ffd43f" : "#F59E0B"} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <AlertCircle className="w-12 h-12 mb-2 text-custom-gold" />
                <p className="text-custom-main">Dados de Custo de Vida indisponíveis</p>
              </div>
            )}
          </div>
        );

      case 'precisao':
        return (
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-custom-main flex items-center gap-3">
                  <span className="p-2 bg-custom-primary/50 rounded-lg">
                    <Filter className="w-5 h-5 text-custom-gold" />
                  </span>
                  Análise de Precisão
                </h3>
                <p className="text-sm text-custom-main opacity-70 ml-10">Desdobramento por subcategoria e comparação histórica</p>
              </div>

              <div className="flex items-center gap-3 bg-custom-primary/50 p-2 rounded-custom border border-custom-color w-full md:w-auto">
                <span className="text-xs font-bold text-custom-gold uppercase ml-2">Categoria Ativa:</span>
                <select
                  className="bg-transparent border-none text-sm font-bold text-custom-main focus:ring-0 cursor-pointer rounded-lg px-2 dark:bg-slate-900"
                  value={categoriaSelecionadaSub}
                  onChange={(e) => setCategoriaSelecionadaSub(e.target.value)}
                >
                  {listaCategoriasAtivas.map(cat => (
                    <option key={cat.id} value={cat.nome} className="dark:bg-slate-900">{cat.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-custom-primary/30 p-4 rounded-custom border border-custom-color flex-1">
                <h4 className="text-xs font-bold tracking-wider text-custom-gold uppercase mb-6 text-center">
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
                          <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.85} />
                          <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorSub" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#c5a880" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={90}
                        tick={{ fontSize: 10, fontWeight: 700, fill: theme === 'dark' ? '#94a3b8' : '#64748B' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-custom-card p-3 shadow-custom rounded-custom border border-custom-color">
                                <p className="text-xs font-bold text-custom-gold uppercase mb-1">{payload[0].payload.name}</p>
                                <p className="text-lg font-black text-custom-main">{formatarMoeda(payload[0].value)}</p>
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
                                  fill={theme === 'dark' ? (entry.isTotal ? "var(--accent-gold)" : "#e2e8f0") : (entry.isTotal ? "#1E3A8A" : "#1F2937")}
                                  fontSize={11}
                                  fontWeight="800"
                                >
                                  {formatarMoeda(value)}
                                </text>
                                {!entry.isTotal && (
                                  <text
                                    x={x + width + 8}
                                    y={y + 24}
                                    fill={theme === 'dark' ? "#94a3b8" : "#6B7280"}
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
                    <AlertCircle className="w-8 h-8 text-custom-gold" />
                    <p className="font-medium text-sm text-custom-main opacity-80">Sem dados para esta categoria no período</p>
                  </div>
                )}
              </div>

              <div className="bg-custom-primary/30 p-4 rounded-custom border border-custom-color">
                <h4 className="text-xs font-bold tracking-wider text-custom-gold uppercase mb-6 text-center">
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
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
                        tick={{ fontSize: 10, fontWeight: 600, fill: theme === 'dark' ? '#94a3b8' : '#94A3B8' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length === 2) {
                            const atual = payload[1].value;
                            const anterior = payload[0].value;
                            const diff = atual - anterior;
                            const perc = anterior > 0 ? ((diff / anterior) * 100).toFixed(1) : (atual > 0 ? 100 : 0);
                            const isUp = diff > 0;

                            return (
                              <div className="bg-custom-card p-4 shadow-custom rounded-custom border border-custom-color min-w-[200px]">
                                <p className="text-xs font-black text-custom-gold uppercase mb-3 pb-2 border-b border-custom-color">{label}</p>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-custom-main opacity-60">ANTERIOR</span>
                                  <span className="text-sm font-bold text-custom-main">{formatarMoeda(anterior)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs font-extrabold text-emerald-500">ATUAL</span>
                                  <span className="text-base font-black text-emerald-500">{formatarMoeda(atual)}</span>
                                </div>
                                <div className={`p-2 rounded-custom flex items-center justify-center gap-2 ${isUp ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
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
                    <TrendingUp className="w-8 h-8 text-custom-gold" />
                    <p className="font-medium text-sm text-custom-main opacity-85">Histórico insuficiente para comparação</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'evolucao':
        return (
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom h-full">
            <h3 className="text-xl font-bold text-custom-main mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-custom-gold" />
                <span>Evolução Temporal de Receitas e Despesas</span>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="graficoEvolucaoPeriodo" className="text-sm font-medium text-custom-main opacity-80">Período:</label>
                <select
                  id="graficoEvolucaoPeriodo"
                  className="bg-transparent border border-custom-color text-custom-main text-sm focus:outline-none focus:ring-amber-500/50 rounded-custom px-2 py-1 dark:bg-slate-900"
                  value={graficoEvolucaoPeriodo}
                  onChange={(e) => setGraficoEvolucaoPeriodo(e.target.value)}
                >
                  <option value="mensal" className="dark:bg-slate-900">Mensal</option>
                  <option value="trimestral" className="dark:bg-slate-900">Trimestral</option>
                  <option value="anual" className="dark:bg-slate-900">Anual</option>
                </select>
              </div>
            </h3>
            {dadosEvolucaoTemporal.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={dadosEvolucaoTemporal}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorEvolReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEvolDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEvolSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                  <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748B'} fontSize={11} tickLine={false} />
                  <YAxis formatter={(value) => formatarMoeda(value)} stroke={theme === 'dark' ? '#94a3b8' : '#64748B'} fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke={layoutVariant === "neon-glass" ? "#00f0ff" : layoutVariant === "cosmic-aurora" ? "#ffd43f" : "#10B981"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEvolReceitas)"
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke={layoutVariant === "scifi-hud" ? "#ff6600" : "#EF4444"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEvolDespesas)"
                    name="Despesas"
                  />
                  <Area
                    type="monotone"
                    dataKey="saldo"
                    stroke={layoutVariant === "neon-glass" ? "#00f0ff" : layoutVariant === "scifi-hud" ? "#ff6600" : "var(--accent-gold)"}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorEvolSaldo)"
                    name="Saldo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <AlertCircle className="w-12 h-12 mb-2 text-custom-gold" />
                <p className="text-custom-main opacity-80">Nenhum dado de evolução temporal disponível para o período selecionado.</p>
                <p className="text-sm mt-2">Verifique se há receitas e despesas registradas.</p>
              </div>
            )}
          </div>
        );

      case 'compromissos-essenciais':
        return (
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-custom-main flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-custom-gold" />
                    <span>Compromissos Essenciais (Fixas + Educação)</span>
                  </h3>
                  <p className="text-sm text-custom-main opacity-70 mt-1">
                    Consolidação dos gastos estruturais básicos e capacitação/formação pessoal
                  </p>
                </div>
                {dadosCompromissos && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
                      dadosCompromissos.ultrapassou
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    }`}>
                      {dadosCompromissos.ultrapassou ? 'Atenção: Teto Ultrapassado' : 'Dentro do Teto Planejado'}
                    </span>
                  </div>
                )}
              </div>

              {dadosCompromissos ? (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                      <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Total Consolidado Gasto</span>
                      <span className="text-2xl font-black text-custom-main">{formatarMoeda(dadosCompromissos.gastoTotal)}</span>
                      <div className="flex items-center gap-2 text-[11px] text-custom-main opacity-70 mt-2">
                        <span>Fixas: {formatarMoeda(dadosCompromissos.gastoFixas)}</span>
                        <span>•</span>
                        <span>Educação: {formatarMoeda(dadosCompromissos.gastoEducacao)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                      <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Meta Orçamentária</span>
                      <span className="text-2xl font-black text-custom-gold">
                        {dadosCompromissos.hasOrcamento ? formatarMoeda(dadosCompromissos.planejadoTotal) : 'Não definida'}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-custom-main opacity-70 mt-2">
                        <span>Fixas: {formatarMoeda(dadosCompromissos.planejadoFixas)}</span>
                        <span>•</span>
                        <span>Educação: {formatarMoeda(dadosCompromissos.planejadoEducacao)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                      <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Disponível no Teto</span>
                      <span className={`text-2xl font-black ${dadosCompromissos.ultrapassou ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {dadosCompromissos.hasOrcamento ? formatarMoeda(dadosCompromissos.disponivel) : '—'}
                      </span>
                      <div className="text-[11px] text-custom-main opacity-70 mt-2">
                        {dadosCompromissos.hasOrcamento
                          ? `${dadosCompromissos.percentualUtilizado.toFixed(1)}% do orçamento consumido`
                          : 'Sem orçamento mensal configurado'}
                      </div>
                    </div>
                  </div>

                  {/* Barra Proporcional de Composição (Fixas vs Educação) */}
                  {dadosCompromissos.gastoTotal > 0 && (
                    <div className="p-4 bg-custom-primary/20 rounded-xl border border-custom-color space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-custom-main">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                          Despesas Fixas ({dadosCompromissos.porcentagemFixas.toFixed(1)}%)
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                          Educação ({dadosCompromissos.porcentagemEducacao.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/20 rounded-full h-3 flex overflow-hidden">
                        <div
                          className="bg-blue-500 h-3 transition-all duration-500"
                          style={{ width: `${dadosCompromissos.porcentagemFixas}%` }}
                          title={`Fixas: ${formatarMoeda(dadosCompromissos.gastoFixas)}`}
                        ></div>
                        <div
                          className="bg-emerald-500 h-3 transition-all duration-500"
                          style={{ width: `${dadosCompromissos.porcentagemEducacao}%` }}
                          title={`Educação: ${formatarMoeda(dadosCompromissos.gastoEducacao)}`}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Grid: Gráfico e Subcategorias */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    {/* Gráfico Comparativo */}
                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color flex flex-col justify-between">
                      <h4 className="text-xs font-bold tracking-wider text-custom-gold uppercase mb-4 text-center">
                        Comparativo: Planejado vs Realizado
                      </h4>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={[
                            {
                              name: 'Fixas',
                              planejado: dadosCompromissos.planejadoFixas,
                              gasto: dadosCompromissos.gastoFixas
                            },
                            {
                              name: 'Educação',
                              planejado: dadosCompromissos.planejadoEducacao,
                              gasto: dadosCompromissos.gastoEducacao
                            },
                            {
                              name: 'Total',
                              planejado: dadosCompromissos.planejadoTotal,
                              gasto: dadosCompromissos.gastoTotal
                            }
                          ]}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                          <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748B'} fontSize={12} tickLine={false} />
                          <YAxis formatter={(value) => formatarMoeda(value).replace('R$', '').trim()} stroke={theme === 'dark' ? '#94a3b8' : '#64748B'} fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000' }}
                            formatter={(value) => formatarMoeda(value)}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Bar dataKey="planejado" fill="#3B82F6" name="Planejado" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="gasto" fill="#EF4444" name="Gasto Real" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detalhamento das Maiores Subcategorias */}
                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color flex flex-col justify-between">
                      <h4 className="text-xs font-bold tracking-wider text-custom-gold uppercase mb-4 text-center">
                        Maiores Despesas do Grupo Unificado
                      </h4>
                      {dadosCompromissos.subcategorias && dadosCompromissos.subcategorias.length > 0 ? (
                        <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
                          {dadosCompromissos.subcategorias.map((sub, idx) => {
                            const pct = dadosCompromissos.gastoTotal > 0
                              ? ((sub.valor / dadosCompromissos.gastoTotal) * 100).toFixed(1)
                              : 0;
                            return (
                              <div key={idx} className="p-2.5 rounded-lg bg-custom-card/60 border border-custom-color flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-custom-main truncate">{sub.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                      sub.categoria === 'Educação'
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                                    }`}>
                                      {sub.categoria}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-700/20 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full ${sub.categoria === 'Educação' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                      style={{ width: `${pct}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-bold text-custom-main block">{formatarMoeda(sub.valor)}</span>
                                  <span className="text-[10px] text-custom-main opacity-60">{pct}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <AlertCircle className="w-8 h-8 text-custom-gold mb-2" />
                          <p className="text-xs text-custom-main opacity-70">Nenhuma despesa registrada para o grupo no período.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <AlertCircle className="w-10 h-10 mb-2 text-custom-gold" />
                  <p className="text-custom-main">Dados indisponíveis para o período selecionado.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'construcao-patrimonial':
        return (
          <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-custom-main flex items-center gap-2">
                    <PiggyBank className="w-6 h-6 text-custom-gold" />
                    <span>Construção Patrimonial (Investimentos + Reserva)</span>
                  </h3>
                  <p className="text-sm text-custom-main opacity-70 mt-1">
                    Aportes para segurança financeira e valorização patrimonial de longo prazo
                  </p>
                </div>
                {dadosPatrimonio && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
                      dadosPatrimonio.metaSuperada
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        : dadosPatrimonio.hasOrcamento
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-custom-gold/10 text-custom-gold border-custom-gold/30'
                    }`}>
                      {dadosPatrimonio.metaSuperada
                        ? 'Meta de Aporte Superada! 🎯'
                        : dadosPatrimonio.hasOrcamento
                        ? 'Acumulação em Andamento'
                        : 'Aportes Ativos'}
                    </span>
                  </div>
                )}
              </div>

              {dadosPatrimonio ? (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                      <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Total Aportado / Poupado</span>
                      <span className="text-2xl font-black text-emerald-500">{formatarMoeda(dadosPatrimonio.aporteTotal)}</span>
                      <div className="flex items-center gap-2 text-[11px] text-custom-main opacity-70 mt-2">
                        <span>Investimentos: {formatarMoeda(dadosPatrimonio.aporteInvestimentos)}</span>
                        <span>•</span>
                        <span>Reserva: {formatarMoeda(dadosPatrimonio.aporteReserva)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                      <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Meta Planejada de Aporte</span>
                      <span className="text-2xl font-black text-custom-gold">
                        {dadosPatrimonio.hasOrcamento ? formatarMoeda(dadosPatrimonio.metaTotal) : 'Sem meta estipulada'}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-custom-main opacity-70 mt-2">
                        <span>Investimentos: {formatarMoeda(dadosPatrimonio.planejadoInvestimentos)}</span>
                        <span>•</span>
                        <span>Reserva: {formatarMoeda(dadosPatrimonio.planejadoReserva)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color">
                      <span className="text-xs font-bold text-custom-main opacity-60 uppercase block mb-1">Progresso do Aporte</span>
                      <span className="text-2xl font-black text-custom-main">
                        {dadosPatrimonio.hasOrcamento ? `${dadosPatrimonio.percentualAtingido.toFixed(1)}%` : 'Ativo'}
                      </span>
                      <div className="text-[11px] text-custom-main opacity-70 mt-2">
                        {dadosPatrimonio.hasOrcamento ? (
                          dadosPatrimonio.metaSuperada
                            ? `Excedente investido: +${formatarMoeda(dadosPatrimonio.excedenteAporte)}`
                            : `Faltam ${formatarMoeda(dadosPatrimonio.saldoRestanteMeta)} para a meta`
                        ) : (
                          'Aportes registrados sem meta mensal'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Barra Proporcional de Composição (Investimentos vs Reserva) */}
                  {dadosPatrimonio.aporteTotal > 0 && (
                    <div className="p-4 bg-custom-primary/20 rounded-xl border border-custom-color space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-custom-main">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
                          Investimentos ({dadosPatrimonio.porcentagemInvestimentos.toFixed(1)}%)
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                          Reserva de Emergência ({dadosPatrimonio.porcentagemReserva.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/20 rounded-full h-3 flex overflow-hidden">
                        <div
                          className="bg-cyan-500 h-3 transition-all duration-500"
                          style={{ width: `${dadosPatrimonio.porcentagemInvestimentos}%` }}
                          title={`Investimentos: ${formatarMoeda(dadosPatrimonio.aporteInvestimentos)}`}
                        ></div>
                        <div
                          className="bg-emerald-500 h-3 transition-all duration-500"
                          style={{ width: `${dadosPatrimonio.porcentagemReserva}%` }}
                          title={`Reserva: ${formatarMoeda(dadosPatrimonio.aporteReserva)}`}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Grid: Gráfico e Subcategorias */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    {/* Gráfico Comparativo */}
                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color flex flex-col justify-between">
                      <h4 className="text-xs font-bold tracking-wider text-custom-gold uppercase mb-4 text-center">
                        Metas vs Aportes Efetivos
                      </h4>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={[
                            {
                              name: 'Investimentos',
                              planejado: dadosPatrimonio.planejadoInvestimentos,
                              aporte: dadosPatrimonio.aporteInvestimentos
                            },
                            {
                              name: 'Reserva',
                              planejado: dadosPatrimonio.planejadoReserva,
                              aporte: dadosPatrimonio.aporteReserva
                            },
                            {
                              name: 'Total',
                              planejado: dadosPatrimonio.metaTotal,
                              aporte: dadosPatrimonio.aporteTotal
                            }
                          ]}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                          <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748B'} fontSize={12} tickLine={false} />
                          <YAxis formatter={(value) => formatarMoeda(value).replace('R$', '').trim()} stroke={theme === 'dark' ? '#94a3b8' : '#64748B'} fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000' }}
                            formatter={(value) => formatarMoeda(value)}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Bar dataKey="planejado" fill="#64748B" name="Meta Planejada" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="aporte" fill="#10B981" name="Aporte Realizado" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detalhamento dos Destinos */}
                    <div className="p-4 bg-custom-primary/30 rounded-xl border border-custom-color flex flex-col justify-between">
                      <h4 className="text-xs font-bold tracking-wider text-custom-gold uppercase mb-4 text-center">
                        Destinos dos Recursos (Subcategorias)
                      </h4>
                      {dadosPatrimonio.subcategorias && dadosPatrimonio.subcategorias.length > 0 ? (
                        <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
                          {dadosPatrimonio.subcategorias.map((sub, idx) => {
                            const pct = dadosPatrimonio.aporteTotal > 0
                              ? ((sub.valor / dadosPatrimonio.aporteTotal) * 100).toFixed(1)
                              : 0;
                            return (
                              <div key={idx} className="p-2.5 rounded-lg bg-custom-card/60 border border-custom-color flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-custom-main truncate">{sub.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                      sub.categoria === 'Reserva'
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                                    }`}>
                                      {sub.categoria}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-700/20 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full ${sub.categoria === 'Reserva' ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                                      style={{ width: `${pct}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-bold text-custom-main block">{formatarMoeda(sub.valor)}</span>
                                  <span className="text-[10px] text-custom-main opacity-60">{pct}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <AlertCircle className="w-8 h-8 text-custom-gold mb-2" />
                          <p className="text-xs text-custom-main opacity-70">Nenhum aporte registrado para o grupo no período.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <AlertCircle className="w-10 h-10 mb-2 text-custom-gold" />
                  <p className="text-custom-main">Dados indisponíveis para o período selecionado.</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-custom-card p-4 md:p-6 rounded-custom shadow-custom border border-custom-color transition-colors">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-custom-main flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-custom-gold" />
            Relatórios Financeiros
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <CurrencySelector />
            <EduHelpButton topic="relatorios" />
            <button
              onClick={() => setIsFiltrosMinimized(!isFiltrosMinimized)}
              className="p-2 text-custom-main opacity-80 hover:opacity-100 hover:bg-custom-primary/30 rounded-lg transition cursor-pointer"
              title={isFiltrosMinimized ? 'Expandir Filtros' : 'Minimizar Filtros'}
            >
              {isFiltrosMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!isFiltrosMinimized && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="periodo" className="block text-sm font-medium text-custom-main opacity-80 mb-1">Período</label>
              <select
                id="periodo"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-custom-color bg-custom-card text-custom-main focus:outline-none focus:ring-custom-gold rounded-custom"
                value={periodoSelecionado}
                onChange={(e) => setPeriodoSelecionado(e.target.value)}
              >
                <option value="mensal" className="dark:bg-slate-900">Mensal</option>
                <option value="trimestral" className="dark:bg-slate-900">Trimestral</option>
                <option value="anual" className="dark:bg-slate-900">Anual</option>
              </select>
            </div>
            {periodoSelecionado === 'mensal' && (
              <div>
                <label htmlFor="mes" className="block text-sm font-medium text-custom-main opacity-80 mb-1">Mês</label>
                <select
                  id="mes"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-custom-color bg-custom-card text-custom-main focus:outline-none focus:ring-custom-gold rounded-custom"
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(e.target.value)}
                >
                  {meses.map(mes => (
                    <option key={mes.valor} value={mes.valor} className="dark:bg-slate-900">{mes.nome}</option>
                  ))}
                </select>
              </div>
            )}
            {periodoSelecionado === 'trimestral' && (
              <div>
                <label htmlFor="trimestre" className="block text-sm font-medium text-custom-main opacity-80 mb-1">Trimestre</label>
                <select
                  id="trimestre"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-custom-color bg-custom-card text-custom-main focus:outline-none focus:ring-custom-gold rounded-custom"
                  value={trimestreSelecionado}
                  onChange={(e) => setTrimestreSelecionado(e.target.value)}
                >
                  {trimestres.map(trimestre => (
                    <option key={trimestre.valor} value={trimestre.valor} className="dark:bg-slate-900">{trimestre.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="ano" className="block text-sm font-medium text-custom-main opacity-80 mb-1">Ano</label>
              <select
                id="ano"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-custom-color bg-custom-card text-custom-main focus:outline-none focus:ring-custom-gold rounded-custom"
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(e.target.value)}
              >
                {gerarListaAnos().map(ano => (
                  <option key={ano} value={ano} className="dark:bg-slate-900">{ano}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color flex items-center justify-between transition-colors text-custom-main">
          <div>
            <p className="text-sm font-medium opacity-70">Total de Receitas</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{formatarMoeda(totalReceitas)}</p>
          </div>
          <DollarSign className="w-8 h-8 text-green-500 opacity-70" />
        </div>
        <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color flex items-center justify-between transition-colors text-custom-main">
          <div>
            <p className="text-sm font-medium opacity-70">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{formatarMoeda(totalDespesas)}</p>
          </div>
          <TrendingDown className="w-8 h-8 text-red-500 opacity-70" />
        </div>
        <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color flex items-center justify-between transition-colors text-custom-main">
          <div>
            <p className="text-sm font-medium opacity-70">Saldo Atual</p>
            <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-custom-gold' : 'text-orange-500'}`}>{formatarMoeda(saldo)}</p>
          </div>
          <Calendar className="w-8 h-8 text-custom-gold opacity-70" />
        </div>
      </div>

      {/* Central de Personalização de Gráficos (Drag, Drop e Resize) */}
      <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-colors">
        <h3 className="text-lg font-bold text-custom-main mb-3 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-custom-gold" />
          <span>Personalizar Painel de Relatórios</span>
        </h3>
        <p className="text-xs text-custom-main opacity-70 mb-4">
          Ative ou desative os gráficos abaixo. Você também pode **clicar e arrastar** os gráficos para reordenar suas posições, e usar os botões de controle em cada card para alterar o tamanho deles.
        </p>
        <div className="flex flex-wrap gap-3">
          {chartConfigs.map(chart => (
            <button
              key={chart.id}
              onClick={() => toggleChartVisibility(chart.id)}
              className={`px-4 py-2 text-xs font-bold rounded-custom transition-custom flex items-center gap-2 border cursor-pointer ${
                chart.visible
                  ? 'bg-custom-gold text-black border-custom-gold'
                  : 'bg-transparent text-custom-main opacity-50 border-custom-color'
              }`}
            >
              <span>{chart.visible ? '✓' : '+'}</span>
              <span>{chart.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Drag, Drop and Resize Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-6">
        {chartConfigs
          .filter(chart => chart.visible)
          .map((chart, index) => {
            const sizeClass = chart.size === 'small' 
              ? 'col-span-1 md:col-span-2' 
              : chart.size === 'medium' 
              ? 'col-span-1 md:col-span-3' 
              : 'col-span-1 md:col-span-6';

            return (
              <div
                key={chart.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`${sizeClass} cursor-move relative transition-all duration-300`}
              >
                {/* Tamanho controls overlay on top right */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity bg-custom-card/90 px-2 py-1 rounded-custom border border-custom-color">
                  <span className="text-[9px] font-bold text-custom-gold uppercase tracking-wider mr-1">Tamanho:</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); changeChartSize(chart.id, 'small'); }} 
                    className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold cursor-pointer transition-colors ${chart.size === 'small' ? 'bg-custom-gold text-black' : 'text-custom-main opacity-70 hover:opacity-100'}`}
                  >
                    P
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); changeChartSize(chart.id, 'medium'); }} 
                    className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold cursor-pointer transition-colors ${chart.size === 'medium' ? 'bg-custom-gold text-black' : 'text-custom-main opacity-70 hover:opacity-100'}`}
                  >
                    M
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); changeChartSize(chart.id, 'large'); }} 
                    className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold cursor-pointer transition-colors ${chart.size === 'large' ? 'bg-custom-gold text-black' : 'text-custom-main opacity-70 hover:opacity-100'}`}
                  >
                    G
                  </button>
                </div>
                {renderChartContent(chart.id)}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Relatorios;