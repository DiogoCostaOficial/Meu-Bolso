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
import EduHelpButton from '../components/EduHelpButton';

// Helper functions and constants defined outside the component
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
  const [dadosEvolucaoTemporal, setDadosEvolucaoTemporal] = useState([]);
  const [graficoEvolucaoPeriodo, setGraficoEvolucaoPeriodo] = useState('mensal');
  const [calcularDadosTrimestrais, setCalcularDadosTrimestrais] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [periodoSelecionado, mesSelecionado, trimestreSelecionado, anoSelecionado, graficoEvolucaoPeriodo]);

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

      const receitasFiltradas = filtrarPorPeriodo(receitas);
      const despesasFiltradas = filtrarPorPeriodo(despesas);

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

      // Dados Pizza
      const dadosPiz = Object.keys(categoriasMap).map(cat => ({
        name: cat,
        value: categoriasMap[cat]
      }));
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
      } else {
        setDadosOrcamento([]);
      }

      // Evolução Temporal
      const dadosEvolucao = [];
      const mesesDoAno = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      mesesDoAno.forEach(mes => {
        const recMes = receitas.filter(r => r.data.startsWith(`${anoSelecionado}-${mes}`)).reduce((acc, r) => acc + Number(r.valor), 0);
        const despMes = despesas.filter(d => d.data.startsWith(`${anoSelecionado}-${mes}`)).reduce((acc, d) => acc + Number(d.valor), 0);
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
            return a === anoSelecionado && mNum >= inicio && mNum <= fim;
          }).reduce((acc, r) => acc + Number(r.valor), 0);

          const despTrim = despesas.filter(d => {
            const [a, m] = d.data.split('-');
            const mNum = parseInt(m);
            return a === anoSelecionado && mNum >= inicio && mNum <= fim;
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

      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-blue-600" />
            Relatórios Financeiros
          </h2>
          <div className="flex items-center gap-3">
            <EduHelpButton topic="relatorios" />
            <button
              onClick={() => setIsFiltrosMinimized(!isFiltrosMinimized)}
              className="text-gray-500 hover:text-gray-700"
              title={isFiltrosMinimized ? "Expandir Filtros" : "Minimizar Filtros"}
            >
              {isFiltrosMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
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
      </div >

      {/* Cards de Resumo */}
      < div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
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
      </div >

      {/* Acompanhamento de Orçamento */}
      < div className="bg-white p-6 rounded-lg shadow-lg" >
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" />
          Acompanhamento de Orçamento
        </h3>
        {
          orcamentoCompleto && orcamentoCompleto.categorias && orcamentoCompleto.categorias.length > 0 ? (
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
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${ultrapassou ? 'text-red-600' : 'text-gray-900'
                            }`}>
                            {formatarMoeda(gastoReal)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${item.disponivelPositivo >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {ultrapassou ? formatarMoeda(item.excedenteNegativo) : formatarMoeda(item.disponivelPositivo)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${percentualUtilizado > 100 ? 'text-red-600' : percentualUtilizado > 80 ? 'text-orange-600' : 'text-green-600'
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
          )
        }
      </div >

      {/* Relatório Trimestral de Receitas e Despesas */}
      {
        periodoSelecionado === 'trimestral' && (
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
        )
      }
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
