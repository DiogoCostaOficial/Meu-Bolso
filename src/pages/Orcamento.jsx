import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEdu } from '../contexts/EduContext';
import { useCurrency } from '../contexts/CurrencyContext';
import CurrencySelector from '../components/CurrencySelector';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  DollarSign, TrendingUp, Target, AlertCircle,
  Save, RefreshCw, PieChart as PieIcon, Calculator,
  CheckCircle, XCircle, GraduationCap, Copy, Calendar, Percent, X, Check, ArrowLeft
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
  const [categorias, setCategorias] = useState(CATEGORIAS_PADRAO.map(c => ({ ...c, tipoMeta: 'percentual', valorPlanejado: 0 })));
  const [orcamentoSalvo, setOrcamentoSalvo] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [despesas, setDespesas] = useState([]);

  // Modal de Replicação de Metas
  const [modalCopiarAberto, setModalCopiarAberto] = useState(false);
  const [mesesParaCopiar, setMesesParaCopiar] = useState([]);
  const [copiarRenda, setCopiarRenda] = useState(true);
  const [manterRendaExistente, setManterRendaExistente] = useState(false);
  const [salvandoCopia, setSalvandoCopia] = useState(false);

  useEffect(() => {
    carregarOrcamento();
    carregarDespesas();
  }, [mesSelecionado]); // Recarrega orçamento e despesas ao mudar o mês

  useEffect(() => {
    calcularRendaReal();
  }, [rendaPrevista, dividas]);

  useEffect(() => {
    atualizarGastosAtuais();
  }, [despesas]);

  const inicializarCategoriasSemOrcamento = (categoriasDoUsuario, real) => {
    const realNum = parseFloat(real) || 0;
    if (categoriasDoUsuario.length > 0) {
      const categoriasUnicasUsuario = removeDuplicates(categoriasDoUsuario, 'nome');
      setCategorias(categoriasUnicasUsuario.map(cat => {
        const tipoMeta = cat.tipoMeta || 'percentual';
        let valorPlanejado = 0;
        let percentual = 0;

        if (cat.valorMeta !== undefined && cat.valorMeta !== null && cat.valorMeta !== '') {
          if (tipoMeta === 'valor') {
            valorPlanejado = parseFloat(cat.valorMeta);
            percentual = realNum > 0 ? parseFloat(((valorPlanejado / realNum) * 100).toFixed(2)) : 0;
          } else {
            percentual = parseFloat(cat.valorMeta);
            valorPlanejado = realNum > 0 ? (realNum * percentual) / 100 : 0;
          }
        }

        return {
          nome: cat.nome,
          cor: cat.cor || '#3B82F6',
          tipoMeta,
          valorPlanejado,
          percentual,
          gastoAtual: 0
        };
      }));
    } else {
      setCategorias(CATEGORIAS_PADRAO.map(cat => ({
        ...cat,
        tipoMeta: 'percentual',
        valorPlanejado: realNum > 0 ? (realNum * cat.percentual) / 100 : 0,
        gastoAtual: 0
      })));
    }
  };

  const carregarOrcamento = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};

      // Look for budget for the selected month
      const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];
      const orcamentoMes = orcamentos.find(o => o.mes === mesSelecionado);
      const categoriasDoUsuario = userData.categorias || [];

      if (orcamentoMes) {
        setRendaPrevista(orcamentoMes.rendaPrevista || '');
        setDividas(orcamentoMes.dividas || '');
        setRendaReal(orcamentoMes.rendaReal || '');
        const real = parseFloat(orcamentoMes.rendaReal) || 0;

        const categoriasDoOrcamento = orcamentoMes.categorias || [];

        if (categoriasDoOrcamento.length > 0) {
          const categoriasUnicas = removeDuplicates(categoriasDoOrcamento, 'nome');
          setCategorias(categoriasUnicas.map(cat => {
            const matchUser = categoriasDoUsuario.find(c => c.nome === cat.nome);
            let cor = cat.cor;
            if (!cor || cor === '#CCCCCC') {
              const match = matchUser || CATEGORIAS_PADRAO.find(c => c.nome === cat.nome);
              if (match) cor = match.cor;
            }
            if (!cor) cor = '#3B82F6';

            const tipoMeta = cat.tipoMeta || (matchUser && matchUser.tipoMeta ? matchUser.tipoMeta : 'percentual');
            let valorPlanejado = cat.valorPlanejado !== undefined && cat.valorPlanejado !== null ? parseFloat(cat.valorPlanejado) : 0;
            let percentual = cat.percentual !== undefined && cat.percentual !== null ? parseFloat(cat.percentual) : 0;

            if (tipoMeta === 'valor' && valorPlanejado > 0 && real > 0 && !percentual) {
              percentual = parseFloat(((valorPlanejado / real) * 100).toFixed(2));
            } else if (tipoMeta === 'percentual' && percentual > 0 && real > 0 && !valorPlanejado) {
              valorPlanejado = (real * percentual) / 100;
            }

            return {
              ...cat,
              cor,
              tipoMeta,
              valorPlanejado,
              percentual,
              gastoAtual: cat.gastoAtual || 0
            };
          }));
        } else {
          inicializarCategoriasSemOrcamento(categoriasDoUsuario, orcamentoMes.rendaReal);
        }
      } else {
        setRendaPrevista('');
        setDividas('');
        setRendaReal('');
        inicializarCategoriasSemOrcamento(categoriasDoUsuario, 0);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento do backend:', error);
    }
  };

  const carregarDespesas = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};
      const despesas = Array.isArray(userData.despesas) ? userData.despesas : [];
      const despesasMes = despesas.filter(d => d.data && d.data.startsWith(mesSelecionado));
      setDespesas(despesasMes);
    } catch (error) {
      console.error('Erro ao carregar despesas do backend:', error);
    }
  };

  const calcularRendaReal = () => {
    const prevista = parseFloat(rendaPrevista) || 0;
    const dividasTotal = parseFloat(dividas) || 0;
    const real = Math.max(0, prevista - dividasTotal);
    setRendaReal(real.toFixed(2));
  };

  const atualizarGastosAtuais = () => {
    setCategorias(prevCategorias => {
      const novasCategorias = prevCategorias.map(cat => {
        const gastoTotal = despesas
          .filter(d => d.categoria === cat.nome && d.somarNoOrcamento !== false)
          .reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);
        return { ...cat, gastoAtual: gastoTotal };
      });

      const mudou = novasCategorias.some((cat, index) => {
        return cat.gastoAtual !== (prevCategorias[index] ? prevCategorias[index].gastoAtual : 0);
      });

      return mudou ? novasCategorias : prevCategorias;
    });
  };

  const alternarTipoMeta = (index, novoTipo) => {
    const real = parseFloat(rendaReal) || 0;
    const novasCategorias = [...categorias];
    const cat = { ...novasCategorias[index], tipoMeta: novoTipo };
    if (novoTipo === 'valor' && !cat.valorPlanejado && cat.percentual && real > 0) {
      cat.valorPlanejado = (real * cat.percentual) / 100;
    } else if (novoTipo === 'percentual' && !cat.percentual && cat.valorPlanejado && real > 0) {
      cat.percentual = parseFloat(((cat.valorPlanejado / real) * 100).toFixed(2));
    }
    novasCategorias[index] = cat;
    setCategorias(novasCategorias);
  };

  const atualizarPercentual = (index, valor) => {
    const valNum = parseFloat(valor) || 0;
    const real = parseFloat(rendaReal) || 0;
    const novasCategorias = [...categorias];
    novasCategorias[index].percentual = valNum;
    novasCategorias[index].valorPlanejado = real > 0 ? (real * valNum) / 100 : 0;
    setCategorias(novasCategorias);
  };

  const atualizarValorPlanejado = (index, valor) => {
    const valNum = parseFloat(valor) || 0;
    const real = parseFloat(rendaReal) || 0;
    const novasCategorias = [...categorias];
    novasCategorias[index].valorPlanejado = valNum;
    novasCategorias[index].percentual = real > 0 ? parseFloat(((valNum / real) * 100).toFixed(2)) : 0;
    setCategorias(novasCategorias);
  };

  const calcularValorCategoria = (cat) => {
    if (!cat) return 0;
    const real = parseFloat(rendaReal) || 0;
    if (cat.tipoMeta === 'valor') {
      return parseFloat(cat.valorPlanejado) || 0;
    }
    return (real * (parseFloat(cat.percentual) || 0)) / 100;
  };

  const calcularDisponivel = (cat) => {
    if (!cat) return 0;
    return calcularValorCategoria(cat) - (parseFloat(cat.gastoAtual) || 0);
  };

  const totalPercentual = categorias.reduce((acc, cat) => acc + (parseFloat(cat.percentual) || 0), 0);
  const percentualValido = Math.abs(totalPercentual - 100) < 0.1 || totalPercentual === 0;

  const salvarOrcamento = async () => {
    setMensagemFeedback(null);

    if (totalPercentual > 100.5) {
      setMensagemFeedback({ tipo: 'erro', texto: `A soma dos percentuais ultrapassa 100%. Atual: ${totalPercentual.toFixed(2)}%` });
      return;
    }

    setLoading(true);
    try {
      const novoOrcamento = {
        mes: mesSelecionado,
        rendaPrevista,
        dividas,
        rendaReal,
        categorias: categorias.map(c => ({
          ...c,
          tipoMeta: c.tipoMeta || 'percentual',
          valorPlanejado: calcularValorCategoria(c),
          percentual: c.percentual || 0
        }))
      };

      await api.post('/user/dados', { orcamentos: [novoOrcamento] });

      setOrcamentoSalvo(true);
      setMensagemFeedback({ tipo: 'sucesso', texto: 'Orçamento e metas salvos com sucesso!' });
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
    if (confirm('Deseja realmente resetar o orçamento deste mês? Esta ação não pode ser desfeita.')) {
      try {
        const response = await api.get('/user/dados');
        const userData = response.data.dados || {};
        const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];
        const orcamentosFiltrados = orcamentos.filter(o => o.mes !== mesSelecionado);

        const updatedData = {
          ...userData,
          orcamentos: orcamentosFiltrados
        };

        await api.post('/user/dados', { dados: updatedData });

        setRendaPrevista('');
        setDividas('');
        setRendaReal('');
        inicializarCategoriasSemOrcamento(userData.categorias || [], 0);
      } catch (error) {
        console.error('Erro ao resetar orçamento no backend:', error);
        alert('Erro ao resetar orçamento. Tente novamente.');
      }
    }
  };

  // Helper methods for month navigation and replication
  const getMesAnterior = (mesChave) => {
    const [anoStr, mesStr] = mesChave.split('-');
    let ano = parseInt(anoStr, 10);
    let mes = parseInt(mesStr, 10);
    mes--;
    if (mes < 1) {
      mes = 12;
      ano--;
    }
    return `${ano}-${String(mes).padStart(2, '0')}`;
  };

  const getNomeMes = (mesChave) => {
    if (!mesChave) return '';
    const [anoStr, mesStr] = mesChave.split('-');
    const mesNum = parseInt(mesStr, 10);
    const nomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${nomes[mesNum - 1] || mesStr}/${anoStr}`;
  };

  const copiarDoMesAnterior = async () => {
    const mesAnteriorChave = getMesAnterior(mesSelecionado);
    setLoading(true);
    setMensagemFeedback(null);
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};
      const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];
      const orcamentoAnterior = orcamentos.find(o => o.mes === mesAnteriorChave);

      if (!orcamentoAnterior) {
        setMensagemFeedback({
          tipo: 'erro',
          texto: `Nenhum orçamento encontrado para o mês anterior (${getNomeMes(mesAnteriorChave)}). Preencha o orçamento ou use "Copiar Orçamento".`
        });
        setTimeout(() => setMensagemFeedback(null), 4000);
        return;
      }

      setRendaPrevista(orcamentoAnterior.rendaPrevista || '');
      setDividas(orcamentoAnterior.dividas || '');
      setRendaReal(orcamentoAnterior.rendaReal || '');
      const real = parseFloat(orcamentoAnterior.rendaReal) || 0;

      const categoriasAnteriores = orcamentoAnterior.categorias || [];
      const categoriasDoUsuario = userData.categorias || [];

      if (categoriasAnteriores.length > 0) {
        const categoriasUnicas = removeDuplicates(categoriasAnteriores, 'nome');
        setCategorias(categoriasUnicas.map(cat => {
          const matchUser = categoriasDoUsuario.find(c => c.nome === cat.nome);
          let cor = cat.cor;
          if (!cor || cor === '#CCCCCC') {
            const match = matchUser || CATEGORIAS_PADRAO.find(c => c.nome === cat.nome);
            if (match) cor = match.cor;
          }
          if (!cor) cor = '#3B82F6';

          const tipoMeta = cat.tipoMeta || (matchUser && matchUser.tipoMeta ? matchUser.tipoMeta : 'percentual');
          let percentual = cat.percentual !== undefined ? parseFloat(cat.percentual) : 0;
          let valorPlanejado = cat.valorPlanejado !== undefined ? parseFloat(cat.valorPlanejado) : 0;

          if (tipoMeta === 'percentual' && real > 0 && percentual > 0) {
            valorPlanejado = (real * percentual) / 100;
          } else if (tipoMeta === 'valor' && valorPlanejado > 0 && real > 0 && !percentual) {
            percentual = parseFloat(((valorPlanejado / real) * 100).toFixed(2));
          }

          return {
            ...cat,
            cor,
            tipoMeta,
            valorPlanejado,
            percentual,
            gastoAtual: 0
          };
        }));
      }

      setMensagemFeedback({
        tipo: 'sucesso',
        texto: `Orçamento de ${getNomeMes(mesAnteriorChave)} copiado para este mês! Verifique os dados e clique em "Salvar Orçamento".`
      });
      setTimeout(() => setMensagemFeedback(null), 5000);
    } catch (error) {
      console.error('Erro ao copiar do mês anterior:', error);
      setMensagemFeedback({ tipo: 'erro', texto: 'Erro ao copiar dados do mês anterior.' });
    } finally {
      setLoading(false);
    }
  };

  const getMesesDisponiveis = () => {
    const [anoStr] = mesSelecionado.split('-');
    const anoAtual = parseInt(anoStr, 10) || new Date().getFullYear();
    const nomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const lista = [];
    for (let m = 1; m <= 12; m++) {
      const chave = `${anoAtual}-${String(m).padStart(2, '0')}`;
      lista.push({
        chave,
        label: `${nomes[m - 1]} / ${anoAtual}`,
        isOrigem: chave === mesSelecionado
      });
    }
    for (let m = 1; m <= 6; m++) {
      const chave = `${anoAtual + 1}-${String(m).padStart(2, '0')}`;
      lista.push({
        chave,
        label: `${nomes[m - 1]} / ${anoAtual + 1}`,
        isOrigem: chave === mesSelecionado
      });
    }
    return lista;
  };

  const alternarMesParaCopiar = (chave) => {
    if (chave === mesSelecionado) return;
    setMesesParaCopiar(prev =>
      prev.includes(chave) ? prev.filter(m => m !== chave) : [...prev, chave]
    );
  };

  const selecionarRestanteAno = () => {
    const [anoStr, mesStr] = mesSelecionado.split('-');
    const mesNum = parseInt(mesStr, 10);
    const restantes = [];
    for (let m = mesNum + 1; m <= 12; m++) {
      restantes.push(`${anoStr}-${String(m).padStart(2, '0')}`);
    }
    setMesesParaCopiar(restantes);
  };

  const selecionarProximosMeses = (qtd) => {
    const [anoStr, mesStr] = mesSelecionado.split('-');
    let ano = parseInt(anoStr, 10);
    let mes = parseInt(mesStr, 10);
    const selecionados = [];
    for (let i = 0; i < qtd; i++) {
      mes++;
      if (mes > 12) {
        mes = 1;
        ano++;
      }
      selecionados.push(`${ano}-${String(mes).padStart(2, '0')}`);
    }
    setMesesParaCopiar(selecionados);
  };

  const executarCopiaMetas = async () => {
    if (mesesParaCopiar.length === 0) {
      alert('Selecione pelo menos um mês de destino.');
      return;
    }
    setSalvandoCopia(true);
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};
      const orcamentosExistentes = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];

      const orcamentosParaSalvar = mesesParaCopiar.map(mesDestino => {
        const orcamentoExistente = orcamentosExistentes.find(o => o.mes === mesDestino);

        let rendaPrevistaFinal = rendaPrevista;
        let dividasFinal = dividas;
        let rendaRealFinal = rendaReal;

        if (!copiarRenda) {
          rendaPrevistaFinal = orcamentoExistente?.rendaPrevista || '';
          dividasFinal = orcamentoExistente?.dividas || '';
          rendaRealFinal = orcamentoExistente?.rendaReal || '';
        } else if (manterRendaExistente && orcamentoExistente?.rendaReal) {
          rendaPrevistaFinal = orcamentoExistente.rendaPrevista;
          dividasFinal = orcamentoExistente.dividas;
          rendaRealFinal = orcamentoExistente.rendaReal;
        }

        const realDestino = parseFloat(rendaRealFinal) || 0;

        return {
          mes: mesDestino,
          rendaPrevista: rendaPrevistaFinal,
          dividas: dividasFinal,
          rendaReal: rendaRealFinal,
          categorias: categorias.map(c => {
            const tipoMeta = c.tipoMeta || 'percentual';
            const percentual = c.percentual !== undefined ? parseFloat(c.percentual) : 0;
            let valorPlanejado = c.valorPlanejado !== undefined ? parseFloat(c.valorPlanejado) : 0;

            if (tipoMeta === 'percentual') {
              valorPlanejado = realDestino > 0 ? (realDestino * percentual) / 100 : valorPlanejado;
            } else if (tipoMeta === 'valor') {
              if (realDestino > 0 && valorPlanejado > 0) {
                // mantém o valor planejado em R$ e ajusta percentual se houver renda
              }
            }

            return {
              nome: c.nome,
              cor: c.cor,
              tipoMeta,
              valorPlanejado,
              percentual,
              gastoAtual: 0
            };
          })
        };
      });

      await api.post('/user/dados', { orcamentos: orcamentosParaSalvar });

      setModalCopiarAberto(false);
      setMesesParaCopiar([]);
      setMensagemFeedback({
        tipo: 'sucesso',
        texto: `Orçamento e porcentagens copiados com sucesso para ${orcamentosParaSalvar.length} ${orcamentosParaSalvar.length === 1 ? 'mês' : 'meses'}!`
      });
      setTimeout(() => setMensagemFeedback(null), 4000);
    } catch (error) {
      console.error('Erro ao copiar metas:', error);
      setMensagemFeedback({ tipo: 'erro', texto: 'Erro ao copiar orçamento para outros meses.' });
    } finally {
      setSalvandoCopia(false);
    }
  };

  const realDisponivel = parseFloat(rendaReal) || 0;
  const totalPlanejado = categorias.reduce((acc, cat) => acc + calcularValorCategoria(cat), 0);
  const totalGastoAtual = categorias.reduce((acc, cat) => acc + (parseFloat(cat.gastoAtual) || 0), 0);
  const totalDisponivel = (realDisponivel || totalPlanejado) - totalGastoAtual;

  const diferencaValor = realDisponivel - totalPlanejado;
  const diferencaPercentual = 100 - totalPercentual;

  const todasEmValor = categorias.length > 0 && categorias.every(c => c.tipoMeta === 'valor');
  const todasEmPercentual = categorias.length > 0 && categorias.every(c => c.tipoMeta === 'percentual');
  const modoMisto = !todasEmValor && !todasEmPercentual;

  const dadosGrafico = categorias
    .filter(cat => calcularValorCategoria(cat) > 0 || (cat.percentual && cat.percentual > 0))
    .map(cat => ({
      name: cat.nome,
      value: cat.percentual > 0 ? cat.percentual : (totalPlanejado > 0 ? parseFloat(((calcularValorCategoria(cat) / totalPlanejado) * 100).toFixed(2)) : 0),
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
        <div className="flex flex-wrap items-start gap-3">
          <CurrencySelector />
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="h-11 px-4 border border-custom-color rounded-full focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-semibold bg-custom-card dark:bg-slate-800 text-custom-main shadow-sm cursor-pointer"
          />
          <button
            onClick={resetarOrcamento}
            className="h-11 flex items-center gap-2 px-4 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Resetar</span>
          </button>
          <button
            onClick={copiarDoMesAnterior}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-semibold text-sm"
            title={`Copiar orçamento do mês anterior (${getNomeMes(getMesAnterior(mesSelecionado))})`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Copiar Mês Anterior</span>
          </button>
          <button
            onClick={() => setModalCopiarAberto(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-semibold text-sm"
            title="Replicar orçamento e porcentagens para outros meses"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Replicar Meses</span>
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
                <div className="text-center mt-2 space-y-1">
                  <p className="text-sm text-amber-500 font-bold">
                    Configurado: {totalPercentual.toFixed(1)}% ({formatarMoeda(totalPlanejado)})
                  </p>
                  {realDisponivel > 0 && (
                    <p className={`text-xs font-semibold ${diferencaPercentual > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                      {diferencaPercentual > 0
                        ? `Falta configurar: ${diferencaPercentual.toFixed(1)}% (${formatarMoeda(diferencaValor)})`
                        : `Ultrapassou em: ${Math.abs(diferencaPercentual).toFixed(1)}% (${formatarMoeda(Math.abs(diferencaValor))})`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* TABELA DE CATEGORIAS */}
      <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-custom-primary/50 dark:bg-amber-900/20 rounded-lg">
              <Target className="w-6 h-6 text-custom-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-custom-main">Metas por Categoria</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Escolha definir cada meta em valor monetário (R$) ou percentual (%) da renda</p>
            </div>
          </div>
          <button
            onClick={() => setModalCopiarAberto(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar Metas para Outros Meses
          </button>
        </div>

        {/* RESUMO DE ALOCAÇÃO DO ORÇAMENTO (VALOR E PERCENTUAL) */}
        {realDisponivel > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-custom-color">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Renda Real Disponível
                </span>
                <p className="text-base sm:text-lg font-bold text-custom-main">
                  {formatarMoeda(realDisponivel)} <span className="text-xs font-normal text-gray-400">(100%)</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Já Configurado
                </span>
                <p className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {formatarMoeda(totalPlanejado)}{' '}
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    ({totalPercentual.toFixed(1)}%)
                  </span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {diferencaValor > 0.01 ? 'Falta Configurar' : diferencaValor < -0.01 ? 'Ultrapassou da Renda' : 'Status da Alocação'}
                </span>
                <p className={`text-base sm:text-lg font-bold ${
                  diferencaValor > 0.01 
                    ? 'text-amber-500' 
                    : diferencaValor < -0.01 
                      ? 'text-red-500' 
                      : 'text-green-600 dark:text-green-400'
                }`}>
                  {diferencaValor > 0.01 ? (
                    <>
                      {formatarMoeda(diferencaValor)}{' '}
                      <span className="text-xs font-semibold">({diferencaPercentual.toFixed(1)}%)</span>
                    </>
                  ) : diferencaValor < -0.01 ? (
                    <>
                      {formatarMoeda(Math.abs(diferencaValor))}{' '}
                      <span className="text-xs font-semibold">({Math.abs(diferencaPercentual).toFixed(1)}%)</span>
                    </>
                  ) : (
                    '100% Configurado'
                  )}
                </p>
              </div>
            </div>

            {/* Barra visual de alocação */}
            <div className="mt-3 w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  totalPercentual > 100.5 ? 'bg-red-500' : percentualValido ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(totalPercentual, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* TABELA — apenas desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-slate-300">Categoria</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-slate-300">Modo</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-slate-300">Meta do Mês</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-slate-300">Planejado</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-slate-300">Gasto Atual</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-slate-300">Disponível</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria, index) => {
                const valorCat = calcularValorCategoria(categoria);
                const dispCat = calcularDisponivel(categoria);
                const isValor = categoria.tipoMeta === 'valor';

                return (
                  <tr key={index} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: categoria.cor }} />
                        <span className="font-semibold text-gray-900 dark:text-white">{categoria.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => alternarTipoMeta(index, 'valor')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${isValor ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                          R$
                        </button>
                        <button
                          type="button"
                          onClick={() => alternarTipoMeta(index, 'percentual')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${!isValor ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                          %
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                            {isValor ? 'R$' : '%'}
                          </span>
                          <input
                            type="number"
                            step={isValor ? '0.01' : '0.1'}
                            min="0"
                            max={!isValor ? '100' : undefined}
                            value={isValor ? (categoria.valorPlanejado !== undefined ? categoria.valorPlanejado : '') : (categoria.percentual !== undefined ? categoria.percentual : '')}
                            onChange={(e) => isValor ? atualizarValorPlanejado(index, e.target.value) : atualizarPercentual(index, e.target.value)}
                            placeholder="0,00"
                            className="w-28 pl-7 pr-2 py-1.5 border-2 border-gray-200 dark:border-slate-600 rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                          {isValor 
                            ? `(${categoria.percentual || 0}%)` 
                            : `(${formatarMoeda(valorCat)})`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-base font-bold text-gray-900 dark:text-white">{formatarMoeda(valorCat)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-base font-bold text-gray-900 dark:text-white">{formatarMoeda(categoria.gastoAtual || 0)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-base font-bold ${dispCat >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatarMoeda(dispCat)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* LINHA DE TOTAL */}
              <tr className="bg-indigo-50/50 dark:bg-slate-800/80 border-t-2 border-indigo-200 dark:border-slate-700">
                <td className="px-4 py-4"><span className="font-bold text-gray-900 dark:text-white text-base">TOTAL</span></td>
                <td className="px-4 py-4 text-center">-</td>
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-base font-bold ${percentualValido ? 'text-green-600 dark:text-green-400' : totalPercentual > 100.5 ? 'text-red-500' : 'text-amber-500'}`}>
                      {totalPercentual.toFixed(1)}%
                    </span>
                    {realDisponivel > 0 && (
                      <span className={`text-[11px] font-semibold mt-0.5 ${diferencaValor > 0.01 || diferencaPercentual > 0.05 ? 'text-amber-600 dark:text-amber-400' : diferencaValor < -0.01 || diferencaPercentual < -0.05 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                        {todasEmValor ? (
                          diferencaValor > 0.01 ? `Falta ${formatarMoeda(diferencaValor)}` : diferencaValor < -0.01 ? `Excede ${formatarMoeda(Math.abs(diferencaValor))}` : '100% Configurado'
                        ) : todasEmPercentual ? (
                          diferencaPercentual > 0.05 ? `Falta ${diferencaPercentual.toFixed(1)}%` : diferencaPercentual < -0.05 ? `Excede ${Math.abs(diferencaPercentual).toFixed(1)}%` : '100% Configurado'
                        ) : (
                          diferencaValor > 0.01 ? `Falta ${formatarMoeda(diferencaValor)} (${diferencaPercentual.toFixed(1)}%)` : diferencaValor < -0.01 ? `Excede ${formatarMoeda(Math.abs(diferencaValor))} (${Math.abs(diferencaPercentual).toFixed(1)}%)` : '100% Configurado'
                        )}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {formatarMoeda(totalPlanejado)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right"><span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{formatarMoeda(totalGastoAtual)}</span></td>
                <td className="px-4 py-4 text-right"><span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{formatarMoeda(totalDisponivel)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CARDS — apenas mobile */}
        <div className="md:hidden space-y-3">
          {categorias.map((categoria, index) => {
            const valorCat = calcularValorCategoria(categoria);
            const dispCat = calcularDisponivel(categoria);
            const isValor = categoria.tipoMeta === 'valor';

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
                  {/* Switcher R$ / % */}
                  <div className="flex bg-white dark:bg-slate-700 p-0.5 rounded-lg border border-gray-200 dark:border-slate-600">
                    <button
                      type="button"
                      onClick={() => alternarTipoMeta(index, 'valor')}
                      className={`px-2 py-0.5 text-xs font-bold rounded ${isValor ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}
                    >
                      R$
                    </button>
                    <button
                      type="button"
                      onClick={() => alternarTipoMeta(index, 'percentual')}
                      className={`px-2 py-0.5 text-xs font-bold rounded ${!isValor ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}
                    >
                      %
                    </button>
                  </div>
                </div>

                {/* Input de meta — touch-friendly */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-slate-600">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 flex-shrink-0">
                    {isValor ? 'Meta (R$):' : 'Meta (%):'}
                  </label>
                  <input
                    type="number"
                    step={isValor ? '0.01' : '0.1'}
                    min="0"
                    max={!isValor ? '100' : undefined}
                    value={isValor ? (categoria.valorPlanejado !== undefined ? categoria.valorPlanejado : '') : (categoria.percentual !== undefined ? categoria.percentual : '')}
                    onChange={(e) => isValor ? atualizarValorPlanejado(index, e.target.value) : atualizarPercentual(index, e.target.value)}
                    className="flex-1 text-center text-base font-bold border-0 focus:ring-0 bg-transparent dark:text-white py-1 outline-none"
                    placeholder="0,00"
                  />
                  <span className="text-xs text-gray-400 font-medium">
                    {isValor ? `(${categoria.percentual || 0}%)` : `(${formatarMoeda(valorCat)})`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Planejado</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatarMoeda(valorCat)}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Gasto</p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatarMoeda(categoria.gastoAtual || 0)}</p>
                  </div>
                  <div className={`${dispCat >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} rounded-lg p-2`}>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Disponível</p>
                    <p className={`text-sm font-bold ${dispCat >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatarMoeda(dispCat)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Totais no mobile */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Configurado</p>
                <p className="text-base font-bold text-blue-600 dark:text-blue-400">{formatarMoeda(totalPlanejado)}</p>
                <p className={`text-xs font-bold ${percentualValido ? 'text-green-600 dark:text-green-400' : 'text-amber-500'}`}>
                  {totalPercentual.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {diferencaValor > 0.01 ? 'Falta Configurar' : diferencaValor < -0.01 ? 'Ultrapassou' : 'Alocação'}
                </p>
                <p className={`text-base font-bold ${diferencaValor > 0.01 ? 'text-amber-500' : diferencaValor < -0.01 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                  {todasEmValor ? (
                    diferencaValor > 0.01 ? formatarMoeda(diferencaValor) : diferencaValor < -0.01 ? formatarMoeda(Math.abs(diferencaValor)) : '100% Configurado'
                  ) : todasEmPercentual ? (
                    diferencaPercentual > 0.05 ? `${diferencaPercentual.toFixed(1)}%` : diferencaPercentual < -0.05 ? `${Math.abs(diferencaPercentual).toFixed(1)}%` : '100%'
                  ) : (
                    formatarMoeda(Math.abs(diferencaValor))
                  )}
                </p>
                {modoMisto && (
                  <p className={`text-xs font-bold ${diferencaPercentual > 0.01 ? 'text-amber-500' : diferencaPercentual < -0.01 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                    {diferencaValor > 0.01 || diferencaValor < -0.01 ? `${Math.abs(diferencaPercentual).toFixed(1)}%` : '100%'}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-blue-200/60 dark:border-blue-800/60">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Gasto Atual</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{formatarMoeda(totalGastoAtual)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Disponível Total</p>
                <p className={`text-sm font-bold ${totalDisponivel >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatarMoeda(totalDisponivel)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTA SE PERCENTUAL ULTRAPASSAR 100% */}
        {totalPercentual > 100.5 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 dark:text-red-300">Atenção ao Orçamento!</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                A soma dos percentuais atingiu {totalPercentual.toFixed(2)}%, ultrapassando 100% da renda planejada. Ajuste as metas para equilibrar o mês.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RESUMO DE VALORES POR CATEGORIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.filter(cat => calcularValorCategoria(cat) > 0 || (cat.percentual && cat.percentual > 0)).map((categoria, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 hover:shadow-md transition"
            style={{ borderLeftColor: categoria.cor }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{categoria.nome}</h3>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: categoria.cor }}
              >
                {categoria.percentual || 0}%
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: categoria.cor }}>
              {formatarMoeda(calcularValorCategoria(categoria))}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>Gasto: {formatarMoeda(categoria.gastoAtual || 0)}</span>
              <span className={calcularDisponivel(categoria) >= 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                Disp: {formatarMoeda(calcularDisponivel(categoria))}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE REPLICAÇÃO DE METAS PARA OUTROS MESES */}
      {modalCopiarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Copy size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Copiar Metas para Outros Meses</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Origem das metas: <strong className="text-indigo-600 dark:text-indigo-400">{mesSelecionado}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalCopiarAberto(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Botões de Atalho */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Seleção Rápida
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => selecionarProximosMeses(3)}
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    + Próximos 3 meses
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarProximosMeses(6)}
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    + Próximos 6 meses
                  </button>
                  <button
                    type="button"
                    onClick={selecionarRestanteAno}
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    Restante do Ano
                  </button>
                  <button
                    type="button"
                    onClick={() => setMesesParaCopiar([])}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition ml-auto"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Grade de Meses */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Selecione os Meses de Destino ({mesesParaCopiar.length} selecionado{mesesParaCopiar.length === 1 ? '' : 's'})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {getMesesDisponiveis().map((item) => {
                    const isSelecionado = mesesParaCopiar.includes(item.chave);
                    const isOrigem = item.isOrigem;

                    return (
                      <button
                        key={item.chave}
                        type="button"
                        disabled={isOrigem}
                        onClick={() => alternarMesParaCopiar(item.chave)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                          isOrigem
                            ? 'bg-gray-100 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                            : isSelecionado
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isOrigem ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400">Origem</span>
                        ) : isSelecionado ? (
                          <Check size={14} className="flex-shrink-0" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opção Adicional: Copiar Renda */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">Copiar Renda e Dívidas</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Aplica também os valores de renda prevista e dívidas para os meses selecionados</p>
                </div>
                <input
                  type="checkbox"
                  checked={copiarRenda}
                  onChange={(e) => setCopiarRenda(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Opção Adicional: Preservar Renda Existente */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">Preservar Renda Existente no Destino</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Se o mês de destino já possuir renda configurada, mantém a renda original e apenas recalcula os valores pelas porcentagens</p>
                </div>
                <input
                  type="checkbox"
                  checked={manterRendaExistente}
                  onChange={(e) => setManterRendaExistente(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setModalCopiarAberto(false)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={mesesParaCopiar.length === 0 || salvandoCopia}
                onClick={executarCopiaMetas}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                {salvandoCopia ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Copiando...</>
                ) : (
                  <><Copy className="w-4 h-4" /> Aplicar para {mesesParaCopiar.length} {mesesParaCopiar.length === 1 ? 'Mês' : 'Meses'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orcamento;
