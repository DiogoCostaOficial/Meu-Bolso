import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, GraduationCap } from 'lucide-react';
import api from '../services/api';
import { useEdu } from '../contexts/EduContext';
import EduHelpButton from '../components/EduHelpButton';

const DRE = () => {
  const { showLesson } = useEdu();
  // Estados
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mensal');
  const [mesSelecionado, setMesSelecionado] = useState('01');
  const [trimestreSelecionado, setTrimestreSelecionado] = useState('1');
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());

  // Definições de períodos
  const meses = [
    { nome: 'Janeiro', valor: '01' },
    { nome: 'Fevereiro', valor: '02' },
    { nome: 'Março', valor: '03' },
    { nome: 'Abril', valor: '04' },
    { nome: 'Maio', valor: '05' },
    { nome: 'Junho', valor: '06' },
    { nome: 'Julho', valor: '07' },
    { nome: 'Agosto', valor: '08' },
    { nome: 'Setembro', valor: '09' },
    { nome: 'Outubro', valor: '10' },
    { nome: 'Novembro', valor: '11' },
    { nome: 'Dezembro', valor: '12' }
  ];

  const trimestres = [
    { nome: '1º Trim', nomeCompleto: '1º Trimestre', valor: '1', meses: ['01', '02', '03'] },
    { nome: '2º Trim', nomeCompleto: '2º Trimestre', valor: '2', meses: ['04', '05', '06'] },
    { nome: '3º Trim', nomeCompleto: '3º Trimestre', valor: '3', meses: ['07', '08', '09'] },
    { nome: '4º Trim', nomeCompleto: '4º Trimestre', valor: '4', meses: ['10', '11', '12'] }
  ];

  // Carregar dados do backend
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await api.get('/user/dados');
        const userData = response.data.dados || {};

        setReceitas(Array.isArray(userData.receitas) ? userData.receitas : []);
        setDespesas(Array.isArray(userData.despesas) ? userData.despesas : []);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setReceitas([]);
        setDespesas([]);
      }
    };

    carregarDados();
  }, []);

  // Funções de filtro
  const filtrarPorPeriodo = (dados) => {
    if (!Array.isArray(dados)) return [];

    return dados.filter(item => {
      if (!item.data) return false;
      const [ano, mes] = item.data.split('-');

      if (periodoSelecionado === 'mensal') {
        return ano === anoSelecionado && mes === mesSelecionado;
      } else if (periodoSelecionado === 'trimestral') {
        const trimestre = trimestres.find(t => t.valor === trimestreSelecionado);
        return ano === anoSelecionado && trimestre.meses.includes(mes);
      } else if (periodoSelecionado === 'anual') {
        return ano === anoSelecionado;
      }

      return false;
    });
  };

  // Função para calcular totais
  const calcularTotais = () => {
    const receitasFiltradas = filtrarPorPeriodo(receitas);
    const despesasFiltradas = filtrarPorPeriodo(despesas);

    const totalReceitas = receitasFiltradas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
    const totalDespesas = despesasFiltradas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
    const lucro = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0 ? ((lucro / totalReceitas) * 100) : 0;

    return {
      totalReceitas,
      totalDespesas,
      lucro,
      margemLucro
    };
  };

  // Função para calcular comparativo trimestral
  const calcularComparativoTrimestral = () => {
    return trimestres.map(trimestre => {
      const receitasTrimestre = receitas.filter(r => {
        if (!r.data) return false;
        const [ano, mes] = r.data.split('-');
        return ano === anoSelecionado && trimestre.meses.includes(mes);
      });

      const despesasTrimestre = despesas.filter(d => {
        if (!d.data) return false;
        const [ano, mes] = d.data.split('-');
        return ano === anoSelecionado && trimestre.meses.includes(mes);
      });

      const totalReceitas = receitasTrimestre.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      const totalDespesas = despesasTrimestre.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      const lucro = totalReceitas - totalDespesas;
      const margemLucro = totalReceitas > 0 ? ((lucro / totalReceitas) * 100) : 0;

      return {
        trimestre: trimestre.nome.split(' ')[0] + ' ' + trimestre.nome.split(' ')[1],
        totalReceitas,
        totalDespesas,
        lucro,
        margemLucro
      };
    });
  };

  // Função para calcular comparativo anual
  const calcularComparativoAnual = () => {
    const anoAtual = parseInt(anoSelecionado);
    const anos = [anoAtual - 4, anoAtual - 3, anoAtual - 2, anoAtual - 1, anoAtual];

    return anos.map(ano => {
      const receitasAno = receitas.filter(r => {
        if (!r.data) return false;
        const [anoData] = r.data.split('-');
        return anoData === ano.toString();
      });

      const despesasAno = despesas.filter(d => {
        if (!d.data) return false;
        const [anoData] = d.data.split('-');
        return anoData === ano.toString();
      });

      const totalReceitas = receitasAno.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      const totalDespesas = despesasAno.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      const lucro = totalReceitas - totalDespesas;
      const margemLucro = totalReceitas > 0 ? ((lucro / totalReceitas) * 100) : 0;

      return {
        ano: ano.toString(),
        totalReceitas,
        totalDespesas,
        lucro,
        margemLucro
      };
    });
  };

  // Função para agrupar por categoria
  const agruparPorCategoria = (dados) => {
    if (!Array.isArray(dados)) return [];
    const dadosFiltrados = filtrarPorPeriodo(dados);
    const agrupado = {};

    dadosFiltrados.forEach(item => {
      const categoria = item.categoria || 'Outros';
      if (!agrupado[categoria]) {
        agrupado[categoria] = 0;
      }
      agrupado[categoria] += Number(item.valor) || 0;
    });

    return Object.entries(agrupado)
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);
  };

  // Função para calcular porcentagens
  const calcularPorcentagens = (dados) => {
    const total = dados.reduce((acc, item) => acc + item.valor, 0);
    return dados.map(item => ({
      ...item,
      percentual: total > 0 ? ((item.valor / total) * 100).toFixed(1) : 0
    }));
  };

  // Função para formatar moeda
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Função para obter texto do período
  const getPeriodoTexto = () => {
    if (periodoSelecionado === 'mensal') {
      const mes = meses.find(m => m.valor === mesSelecionado);
      return `${mes?.nome || ''} de ${anoSelecionado}`;
    } else if (periodoSelecionado === 'trimestral') {
      const trimestre = trimestres.find(t => t.valor === trimestreSelecionado);
      return `${trimestre?.nomeCompleto || ''} de ${anoSelecionado}`;
    }
    return `Ano de ${anoSelecionado}`;
  };
  // Calcular dados
  const totais = calcularTotais();
  const comparativoTrimestral = calcularComparativoTrimestral();
  const comparativoAnual = calcularComparativoAnual();
  const receitasPorCategoria = calcularPorcentagens(agruparPorCategoria(receitas));
  const despesasPorCategoria = calcularPorcentagens(agruparPorCategoria(despesas));
  const mostrarComparativo = periodoSelecionado === 'trimestral' || periodoSelecionado === 'anual';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Demonstração do Resultado do Exercício (DRE)
          </h1>
          <EduHelpButton topic="dre" />
        </div>

        {/* FILTROS DE PERÍODO */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tipo de Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={periodoSelecionado}
                onChange={(e) => setPeriodoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            {/* Seletor de Mês */}
            {periodoSelecionado === 'mensal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês
                </label>
                <select
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {meses.map(mes => (
                    <option key={mes.valor} value={mes.valor}>
                      {mes.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Seletor de Trimestre */}
            {periodoSelecionado === 'trimestral' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trimestre
                </label>
                <select
                  value={trimestreSelecionado}
                  onChange={(e) => setTrimestreSelecionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {trimestres.map(trimestre => (
                    <option key={trimestre.valor} value={trimestre.valor}>
                      {trimestre.nomeCompleto}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Seletor de Ano */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <select
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: new Date().getFullYear() - 2020 + 2 }, (_, i) => 2020 + i).map(ano => (
                  <option key={ano} value={ano.toString()}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card Receitas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Receitas</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            R$ {formatarMoeda(totais.totalReceitas)}
          </div>
        </div>

        {/* Card Despesas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Despesas</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            R$ {formatarMoeda(totais.totalDespesas)}
          </div>
        </div>

        {/* Card Lucro/Prejuízo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              {totais.lucro >= 0 ? 'Lucro' : 'Prejuízo'}
            </span>
            <DollarSign className={`w-5 h-5 ${totais.lucro >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className={`text-2xl font-bold ${totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {formatarMoeda(Math.abs(totais.lucro))}
          </div>
        </div>

        {/* Card Margem de Lucro */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Margem</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className={`text-2xl font-bold ${totais.margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totais.margemLucro.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* TABELA DE RECEITAS POR CATEGORIA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Receitas por Categoria - {getPeriodoTexto()}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receitasPorCategoria.length > 0 ? (
                receitasPorCategoria.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      R$ {formatarMoeda(item.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.percentual}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma receita encontrada para o período selecionado
                  </td>
                </tr>
              )}
            </tbody>
            {receitasPorCategoria.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    R$ {formatarMoeda(totais.totalReceitas)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    100%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* TABELA DE DESPESAS POR CATEGORIA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Despesas por Categoria - {getPeriodoTexto()}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {despesasPorCategoria.length > 0 ? (
                despesasPorCategoria.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      R$ {formatarMoeda(item.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.percentual}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma despesa encontrada para o período selecionado
                  </td>
                </tr>
              )}
            </tbody>
            {despesasPorCategoria.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    R$ {formatarMoeda(totais.totalDespesas)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    100%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* COMPARATIVO TRIMESTRAL */}
      {periodoSelecionado === 'trimestral' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Comparativo Trimestral - {anoSelecionado}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trimestre
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receitas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Despesas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lucro/Prejuízo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margem (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparativoTrimestral.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.trimestre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      R$ {formatarMoeda(item.totalReceitas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      R$ {formatarMoeda(item.totalDespesas)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${item.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      R$ {formatarMoeda(Math.abs(item.lucro))}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${item.margemLucro >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {item.margemLucro.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPARATIVO ANUAL */}
      {periodoSelecionado === 'anual' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Comparativo dos Últimos 5 Anos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ano
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receitas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Despesas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lucro/Prejuízo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margem (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparativoAnual.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.ano}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      R$ {formatarMoeda(item.totalReceitas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      R$ {formatarMoeda(item.totalDespesas)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${item.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      R$ {formatarMoeda(Math.abs(item.lucro))}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${item.margemLucro >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {item.margemLucro.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DRE;
