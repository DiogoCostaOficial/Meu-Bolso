import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEdu } from '../contexts/EduContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import CurrencySelector from '../components/CurrencySelector';
import FieldHelpTooltip from '../components/FieldHelpTooltip';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  DollarSign, TrendingUp, Target, AlertCircle,
  Save, RefreshCw, PieChart as PieIcon, Calculator,
  CheckCircle, XCircle, GraduationCap, Copy, Calendar, Percent, X, Check, ArrowLeft,
  ChevronDown, ChevronUp, Plus, Layers, Trash2, Sparkles, ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import { removeDuplicates } from '../utils/arrayUtils';

const CATEGORIAS_PADRAO = [
  {
    nome: 'Despesas Fixas',
    percentual: 50.00,
    cor: '#3B82F6',
    gastoAtual: 0,
    subcategorias: ['Moradia', 'Mercado', 'Saúde', 'Carro', 'Transporte', 'Bichos', 'Diversos Fixos'],
    metasSubcategorias: {}
  },
  {
    nome: 'Lazer',
    percentual: 20.00,
    cor: '#10B981',
    gastoAtual: 0,
    subcategorias: ['Junkie Food', 'Assinaturas', 'Rolês e Passeios', 'Datas especiais', 'Presentes', 'Diversos Lazer'],
    metasSubcategorias: {}
  },
  {
    nome: 'Educação',
    percentual: 20.00,
    cor: '#F59E0B',
    gastoAtual: 0,
    subcategorias: ['Cursos', 'Livros', 'Workshops', 'Material Escolar', 'Faculdade', 'Idiomas', 'Pós-graduação', 'Diversos Educação'],
    metasSubcategorias: {}
  },
  {
    nome: 'Investimentos',
    percentual: 0.00,
    cor: '#EF4444',
    gastoAtual: 0,
    subcategorias: ['Investimentos BR', 'Investimentos US', 'Cripto', 'Diversos Investimentos'],
    metasSubcategorias: {}
  },
  {
    nome: 'Reserva de Emergência',
    percentual: 10.00,
    cor: '#EC4899',
    gastoAtual: 0,
    subcategorias: ['Fundo de Emergência', 'Fundo de Oportunidade', 'Diversos Reserva'],
    metasSubcategorias: {}
  }
];

const obterSubcategoriasPadrao = (nomeCategoria) => {
  const match = CATEGORIAS_PADRAO.find(
    c => c.nome.toLowerCase() === String(nomeCategoria || '').trim().toLowerCase()
  );
  return match ? [...match.subcategorias] : [];
};

const obterPercentualPadrao50202010 = (nomeCategoria) => {
  const nome = String(nomeCategoria || '').trim().toLowerCase();
  if (nome === 'despesas fixas') return 50;
  if (nome === 'lazer') return 20;
  if (nome === 'educação' || nome === 'educacao') return 20;
  if (nome === 'investimentos') return 0;
  if (nome === 'reserva de emergência' || nome === 'reserva de emergencia' || nome === 'reserva') return 10;
  return null;
};

const ehDistribuicaoLegadaOuZerada = (lista) => {
  if (!Array.isArray(lista) || lista.length === 0) return true;
  const valores = lista.map(c => parseFloat(c.valorMeta ?? c.percentual ?? c.valorPlanejado ?? 0) || 0);
  const soma = valores.reduce((a, b) => a + b, 0);
  return soma === 0;
};

const Orcamento = () => {
  const { user } = useAuth();
  const { showLesson } = useEdu();
  const { t } = useLanguage();
  const { formatCurrency: formatarMoeda } = useCurrency();
  const [rendaPrevista, setRendaPrevista] = useState('');
  const [dividas, setDividas] = useState('');
  const [rendaReal, setRendaReal] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7)); // Formato YYYY-MM
  const [categorias, setCategorias] = useState(
    CATEGORIAS_PADRAO.map(c => ({ ...c, tipoMeta: 'percentual', valorPlanejado: 0 }))
  );
  const [categoriasCadastro, setCategoriasCadastro] = useState([]);
  const [orcamentoSalvo, setOrcamentoSalvo] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [despesas, setDespesas] = useState([]);

  // Controle de expansão de subcategorias por categoria
  const [categoriasExpandidas, setCategoriasExpandidas] = useState({});
  const [novaSubInline, setNovaSubInline] = useState({});

  // Modal de Nova Categoria direto no Orçamento
  const [modalNovaCategoria, setModalNovaCategoria] = useState(false);
  const [formNovaCategoria, setFormNovaCategoria] = useState({
    nome: '',
    cor: '#10B981',
    tipoMeta: 'percentual',
    valorMeta: '',
    primeiraSubcategoria: ''
  });

  // Modal de Replicação de Metas
  const [modalCopiarAberto, setModalCopiarAberto] = useState(false);
  const [mesesParaCopiar, setMesesParaCopiar] = useState([]);
  const [copiarRenda, setCopiarRenda] = useState(true);
  const [manterRendaExistente, setManterRendaExistente] = useState(false);
  const [salvandoCopia, setSalvandoCopia] = useState(false);

  useEffect(() => {
    carregarOrcamento();
    carregarDespesas();
  }, [mesSelecionado]);

  useEffect(() => {
    calcularRendaReal();
  }, [rendaPrevista, dividas]);

  useEffect(() => {
    atualizarGastosAtuais();
  }, [despesas]);

  const toggleExpandirCategoria = (nomeCat) => {
    setCategoriasExpandidas(prev => ({
      ...prev,
      [nomeCat]: !prev[nomeCat]
    }));
  };

  // Normaliza as metas de subcategorias quando o valor planejado da categoria pai muda
  const normalizarMetasSubcategorias = (metasSubBrutas, subcategoriasLista, valorCatPai) => {
    const resultado = {};
    const origem = metasSubBrutas && typeof metasSubBrutas === 'object' ? metasSubBrutas : {};
    (subcategoriasLista || []).forEach(subNome => {
      const m = origem[subNome];
      if (!m) {
        resultado[subNome] = { tipoMeta: 'percentual', percentual: 0, valorPlanejado: 0 };
        return;
      }
      const tipoMeta = m.tipoMeta || 'percentual';
      let percentual = parseFloat(m.percentual ?? (tipoMeta === 'percentual' ? m.valorMeta : 0)) || 0;
      let valorPlanejado = parseFloat(m.valorPlanejado ?? (tipoMeta === 'valor' ? m.valorMeta : 0)) || 0;

      if (tipoMeta === 'percentual') {
        valorPlanejado = valorCatPai > 0 ? parseFloat(((valorCatPai * percentual) / 100).toFixed(2)) : valorPlanejado;
      } else {
        percentual = valorCatPai > 0 ? parseFloat(((valorPlanejado / valorCatPai) * 100).toFixed(2)) : percentual;
      }

      resultado[subNome] = {
        tipoMeta,
        percentual,
        valorPlanejado
      };
    });
    return resultado;
  };

  const inicializarCategoriasSemOrcamento = (categoriasDoUsuario, real) => {
    const realNum = parseFloat(real) || 0;
    if (categoriasDoUsuario.length > 0) {
      const categoriasUnicasUsuario = removeDuplicates(categoriasDoUsuario, 'nome').filter(cat => {
        const nomeLimpo = String(cat.nome || '').trim().toLowerCase();
        if (nomeLimpo === 'viagens' && (cat.valorMeta === null || cat.valorMeta === undefined || cat.valorMeta === '')) {
          return false;
        }
        return true;
      });

      const usarPadrao50202010 = ehDistribuicaoLegadaOuZerada(categoriasUnicasUsuario);

      setCategorias(categoriasUnicasUsuario.map(cat => {
        const pctPadrao = obterPercentualPadrao50202010(cat.nome);
        const tipoMeta = usarPadrao50202010 && pctPadrao !== null ? 'percentual' : (cat.tipoMeta || 'percentual');
        let valorPlanejado = 0;
        let percentual = 0;

        if (!usarPadrao50202010 && cat.valorMeta !== undefined && cat.valorMeta !== null && cat.valorMeta !== '') {
          if (tipoMeta === 'valor') {
            valorPlanejado = parseFloat(cat.valorMeta);
            percentual = realNum > 0 ? parseFloat(((valorPlanejado / realNum) * 100).toFixed(2)) : 0;
          } else {
            percentual = parseFloat(cat.valorMeta);
            valorPlanejado = realNum > 0 ? (realNum * percentual) / 100 : 0;
          }
        } else if (pctPadrao !== null) {
          percentual = pctPadrao;
          valorPlanejado = realNum > 0 ? (realNum * percentual) / 100 : 0;
        }

        const subcategorias = Array.isArray(cat.subcategorias) && cat.subcategorias.length > 0
          ? cat.subcategorias
          : obterSubcategoriasPadrao(cat.nome);

        return {
          id: cat.id,
          nome: cat.nome,
          cor: cat.cor || '#3B82F6',
          tipoMeta,
          valorPlanejado,
          percentual,
          gastoAtual: 0,
          subcategorias,
          metasSubcategorias: normalizarMetasSubcategorias(cat.metasSubcategorias, subcategorias, valorPlanejado)
        };
      }));
    } else {
      setCategorias(CATEGORIAS_PADRAO.map(cat => {
        const valorPlanejado = realNum > 0 ? (realNum * cat.percentual) / 100 : 0;
        return {
          ...cat,
          tipoMeta: 'percentual',
          valorPlanejado,
          gastoAtual: 0,
          metasSubcategorias: normalizarMetasSubcategorias(cat.metasSubcategorias, cat.subcategorias, valorPlanejado)
        };
      }));
    }
  };

  const carregarOrcamento = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};

      const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];
      const orcamentoMes = orcamentos.find(o => o.mes === mesSelecionado);
      const categoriasDoUsuario = Array.isArray(userData.categorias) ? userData.categorias : [];
      setCategoriasCadastro(categoriasDoUsuario);

      if (orcamentoMes) {
        setRendaPrevista(orcamentoMes.rendaPrevista || '');
        setDividas(orcamentoMes.dividas || '');
        setRendaReal(orcamentoMes.rendaReal || '');
        const real = parseFloat(orcamentoMes.rendaReal) || 0;

        const categoriasDoOrcamento = orcamentoMes.categorias || [];

        if (categoriasDoOrcamento.length > 0) {
          // Mescla categorias novas que o usuário criou em Configurações e ainda não estavam no orçamento salvo do mês
          const nomesNoOrcamento = new Set(categoriasDoOrcamento.map(c => String(c.nome || '').trim().toLowerCase()));
          const categoriasExtrasUsuario = categoriasDoUsuario.filter(cu => {
            const n = String(cu.nome || '').trim().toLowerCase();
            if (n === 'viagens' && !cu.valorMeta) return false;
            return !nomesNoOrcamento.has(n);
          });

          const listaCombinada = [
            ...removeDuplicates(categoriasDoOrcamento, 'nome'),
            ...categoriasExtrasUsuario.map(cu => ({
              nome: cu.nome,
              cor: cu.cor || '#3B82F6',
              tipoMeta: cu.tipoMeta || 'percentual',
              valorPlanejado: cu.tipoMeta === 'valor' ? (parseFloat(cu.valorMeta) || 0) : (real > 0 ? (real * (parseFloat(cu.valorMeta) || 0)) / 100 : 0),
              percentual: cu.tipoMeta === 'percentual' ? (parseFloat(cu.valorMeta) || 0) : (real > 0 ? parseFloat((((parseFloat(cu.valorMeta) || 0) / real) * 100).toFixed(2)) : 0),
              metasSubcategorias: cu.metasSubcategorias || {}
            }))
          ];

          const somaPlanejado = listaCombinada.reduce((acc, c) => acc + (parseFloat(c.valorPlanejado) || 0), 0);
          const usarPadrao50202010 = somaPlanejado === 0 && ehDistribuicaoLegadaOuZerada(listaCombinada);

          setCategorias(listaCombinada.map(cat => {
            const matchUser = categoriasDoUsuario.find(
              c => String(c.nome || '').trim().toLowerCase() === String(cat.nome || '').trim().toLowerCase()
            );
            let cor = cat.cor;
            if (!cor || cor === '#CCCCCC') {
              const match = matchUser || CATEGORIAS_PADRAO.find(c => c.nome === cat.nome);
              if (match) cor = match.cor;
            }
            if (!cor) cor = '#3B82F6';

            const pctPadrao = obterPercentualPadrao50202010(cat.nome);
            const tipoMeta = usarPadrao50202010 && pctPadrao !== null
              ? 'percentual'
              : (cat.tipoMeta || (matchUser && matchUser.tipoMeta ? matchUser.tipoMeta : 'percentual'));
            let valorPlanejado = cat.valorPlanejado !== undefined && cat.valorPlanejado !== null ? parseFloat(cat.valorPlanejado) : 0;
            let percentual = cat.percentual !== undefined && cat.percentual !== null ? parseFloat(cat.percentual) : 0;

            if (usarPadrao50202010 && pctPadrao !== null) {
              percentual = pctPadrao;
              valorPlanejado = real > 0 ? (real * percentual) / 100 : 0;
            } else if (tipoMeta === 'valor' && valorPlanejado > 0 && real > 0 && !percentual) {
              percentual = parseFloat(((valorPlanejado / real) * 100).toFixed(2));
            } else if (tipoMeta === 'percentual' && percentual > 0 && real > 0 && !valorPlanejado) {
              valorPlanejado = (real * percentual) / 100;
            }

            const subcategorias = (matchUser && Array.isArray(matchUser.subcategorias) && matchUser.subcategorias.length > 0)
              ? matchUser.subcategorias
              : (Array.isArray(cat.subcategorias) && cat.subcategorias.length > 0
                  ? cat.subcategorias
                  : obterSubcategoriasPadrao(cat.nome));

            const metasSubBrutas = (cat.metasSubcategorias && Object.keys(cat.metasSubcategorias).length > 0)
              ? cat.metasSubcategorias
              : (matchUser?.metasSubcategorias || {});

            return {
              ...cat,
              id: matchUser?.id || cat.id,
              cor,
              tipoMeta,
              valorPlanejado,
              percentual,
              gastoAtual: cat.gastoAtual || 0,
              subcategorias,
              metasSubcategorias: normalizarMetasSubcategorias(metasSubBrutas, subcategorias, valorPlanejado)
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
      const todasDespesas = Array.isArray(userData.despesas) ? userData.despesas : [];
      const despesasMes = todasDespesas.filter(d => d.data && d.data.startsWith(mesSelecionado));
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
      return prevCategorias.map(cat => {
        const gastoTotal = despesas
          .filter(d => d.categoria === cat.nome && d.somarNoOrcamento !== false)
          .reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);
        return { ...cat, gastoAtual: gastoTotal };
      });
    });
  };

  const calcularGastoSubcategoria = (nomeCat, nomeSub) => {
    return despesas
      .filter(d => d.categoria === nomeCat && d.subcategoria === nomeSub && d.somarNoOrcamento !== false)
      .reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);
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

  // Calcula valor e percentual de uma subcategoria em relação à categoria pai
  const calcularDadosSubcategoria = (cat, subNome) => {
    const valorCat = calcularValorCategoria(cat);
    const metaSub = (cat.metasSubcategorias && cat.metasSubcategorias[subNome]) || {
      tipoMeta: 'percentual',
      percentual: 0,
      valorPlanejado: 0
    };
    const tipoMeta = metaSub.tipoMeta || 'percentual';
    let valorPlanejado = 0;
    let percentual = 0;

    if (tipoMeta === 'valor') {
      valorPlanejado = parseFloat(metaSub.valorPlanejado) || 0;
      percentual = valorCat > 0 ? parseFloat(((valorPlanejado / valorCat) * 100).toFixed(2)) : (parseFloat(metaSub.percentual) || 0);
    } else {
      percentual = parseFloat(metaSub.percentual) || 0;
      valorPlanejado = valorCat > 0 ? parseFloat(((valorCat * percentual) / 100).toFixed(2)) : (parseFloat(metaSub.valorPlanejado) || 0);
    }

    const gastoAtual = calcularGastoSubcategoria(cat.nome, subNome);
    const disponivel = valorPlanejado - gastoAtual;

    return {
      tipoMeta,
      valorPlanejado,
      percentual,
      gastoAtual,
      disponivel
    };
  };

  // Calcula o resumo de todas as subcategorias de uma categoria pai
  const calcularResumoSubcategorias = (cat) => {
    const valorCat = calcularValorCategoria(cat);
    const listaSubs = cat.subcategorias || [];
    let somaValorSub = 0;
    let somaPercentualSub = 0;

    listaSubs.forEach(subNome => {
      const dados = calcularDadosSubcategoria(cat, subNome);
      somaValorSub += dados.valorPlanejado;
      somaPercentualSub += dados.percentual;
    });

    // Se a categoria pai tem valor > 0, o percentual total real das subcategorias também pode ser aferido por somaValorSub / valorCat
    const percentualEfetivo = valorCat > 0
      ? parseFloat(((somaValorSub / valorCat) * 100).toFixed(2))
      : parseFloat(somaPercentualSub.toFixed(2));

    const diferencaValorSub = valorCat - somaValorSub;
    const diferencaPercentualSub = 100 - percentualEfetivo;

    // Ultrapassou se:
    // 1) A soma percentual nas subcategorias > 100.1%
    // 2) Ou somaValorSub > valorCat + 0.05
    const ultrapassou =
      percentualEfetivo > 100.1 ||
      somaPercentualSub > 100.1 ||
      (somaValorSub > 0 && somaValorSub > valorCat + 0.05);

    return {
      valorCat,
      somaValorSub: parseFloat(somaValorSub.toFixed(2)),
      somaPercentualSub: parseFloat(somaPercentualSub.toFixed(2)),
      percentualEfetivo,
      diferencaValorSub: parseFloat(diferencaValorSub.toFixed(2)),
      diferencaPercentualSub: parseFloat(diferencaPercentualSub.toFixed(2)),
      ultrapassou
    };
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
    const novoValorCat = real > 0 ? (real * valNum) / 100 : 0;
    novasCategorias[index].percentual = valNum;
    novasCategorias[index].valorPlanejado = novoValorCat;
    novasCategorias[index].metasSubcategorias = normalizarMetasSubcategorias(
      novasCategorias[index].metasSubcategorias,
      novasCategorias[index].subcategorias,
      novoValorCat
    );
    setCategorias(novasCategorias);
  };

  const atualizarValorPlanejado = (index, valor) => {
    const valNum = parseFloat(valor) || 0;
    const real = parseFloat(rendaReal) || 0;
    const novasCategorias = [...categorias];
    novasCategorias[index].valorPlanejado = valNum;
    novasCategorias[index].percentual = real > 0 ? parseFloat(((valNum / real) * 100).toFixed(2)) : 0;
    novasCategorias[index].metasSubcategorias = normalizarMetasSubcategorias(
      novasCategorias[index].metasSubcategorias,
      novasCategorias[index].subcategorias,
      valNum
    );
    setCategorias(novasCategorias);
  };

  // Manipuladores de metas das Subcategorias
  const alternarTipoMetaSubcategoria = (catIndex, subNome, novoTipo) => {
    const novasCategorias = [...categorias];
    const cat = { ...novasCategorias[catIndex] };
    const valorCat = calcularValorCategoria(cat);
    const metasAtuais = { ...(cat.metasSubcategorias || {}) };
    const atual = metasAtuais[subNome] || { tipoMeta: 'percentual', percentual: 0, valorPlanejado: 0 };

    let valorPlanejado = parseFloat(atual.valorPlanejado) || 0;
    let percentual = parseFloat(atual.percentual) || 0;

    if (novoTipo === 'valor' && !valorPlanejado && percentual > 0 && valorCat > 0) {
      valorPlanejado = parseFloat(((valorCat * percentual) / 100).toFixed(2));
    } else if (novoTipo === 'percentual' && !percentual && valorPlanejado > 0 && valorCat > 0) {
      percentual = parseFloat(((valorPlanejado / valorCat) * 100).toFixed(2));
    }

    metasAtuais[subNome] = {
      tipoMeta: novoTipo,
      valorPlanejado,
      percentual
    };
    cat.metasSubcategorias = metasAtuais;
    novasCategorias[catIndex] = cat;
    setCategorias(novasCategorias);
  };

  const atualizarMetaSubcategoria = (catIndex, subNome, inputValor) => {
    const valNum = parseFloat(inputValor) || 0;
    const novasCategorias = [...categorias];
    const cat = { ...novasCategorias[catIndex] };
    const valorCat = calcularValorCategoria(cat);
    const metasAtuais = { ...(cat.metasSubcategorias || {}) };
    const atual = metasAtuais[subNome] || { tipoMeta: 'percentual', percentual: 0, valorPlanejado: 0 };
    const tipoMeta = atual.tipoMeta || 'percentual';

    if (tipoMeta === 'valor') {
      metasAtuais[subNome] = {
        tipoMeta: 'valor',
        valorPlanejado: valNum,
        percentual: valorCat > 0 ? parseFloat(((valNum / valorCat) * 100).toFixed(2)) : 0
      };
    } else {
      metasAtuais[subNome] = {
        tipoMeta: 'percentual',
        percentual: valNum,
        valorPlanejado: valorCat > 0 ? parseFloat(((valorCat * valNum) / 100).toFixed(2)) : 0
      };
    }

    cat.metasSubcategorias = metasAtuais;
    novasCategorias[catIndex] = cat;
    setCategorias(novasCategorias);
  };

  // Botão rápido de 1 clique: Reajusta a meta da Categoria Principal para bater exatamente com a soma das subcategorias
  const reajustarTetoCategoriaParaSubcategorias = (catIndex) => {
    const novasCategorias = [...categorias];
    const cat = { ...novasCategorias[catIndex] };
    const resumo = calcularResumoSubcategorias(cat);
    const real = parseFloat(rendaReal) || 0;

    if (resumo.somaValorSub > 0) {
      cat.valorPlanejado = resumo.somaValorSub;
      if (real > 0) {
        cat.percentual = parseFloat(((resumo.somaValorSub / real) * 100).toFixed(2));
      } else {
        cat.tipoMeta = 'valor';
      }
      // Recalcula o percentual de cada subcategoria com base no novo teto da categoria pai
      cat.metasSubcategorias = normalizarMetasSubcategorias(
        cat.metasSubcategorias,
        cat.subcategorias,
        resumo.somaValorSub
      );
      novasCategorias[catIndex] = cat;
      setCategorias(novasCategorias);
      setMensagemFeedback({
        tipo: 'sucesso',
        texto: `Meta principal de "${cat.nome}" reajustada para ${formatarMoeda(resumo.somaValorSub)} para bater com a soma das subcategorias!`
      });
      setTimeout(() => setMensagemFeedback(null), 4000);
    }
  };

  // Adicionar nova subcategoria inline dentro do Orçamento e sincronizar com Configurações
  const adicionarSubcategoriaNoOrcamento = async (catIndex) => {
    const cat = categorias[catIndex];
    const formSub = novaSubInline[cat.nome] || { nome: '', tipoMeta: 'percentual', valor: '' };
    const nomeLimpo = String(formSub.nome || '').trim();
    if (!nomeLimpo) return;

    const subAtuais = cat.subcategorias || [];
    if (subAtuais.some(s => s.toLowerCase() === nomeLimpo.toLowerCase())) {
      setMensagemFeedback({ tipo: 'erro', texto: `A subcategoria "${nomeLimpo}" já existe em ${cat.nome}.` });
      return;
    }

    const valorCat = calcularValorCategoria(cat);
    const tipoMetaSub = formSub.tipoMeta || 'percentual';
    const valInput = parseFloat(formSub.valor) || 0;
    const novaMetaObj = {
      tipoMeta: tipoMetaSub,
      valorPlanejado: tipoMetaSub === 'valor' ? valInput : (valorCat > 0 ? parseFloat(((valorCat * valInput) / 100).toFixed(2)) : 0),
      percentual: tipoMetaSub === 'percentual' ? valInput : (valorCat > 0 ? parseFloat(((valInput / valorCat) * 100).toFixed(2)) : 0)
    };

    const novasCategorias = [...categorias];
    const novasSubs = [...subAtuais, nomeLimpo];
    const novasMetasSub = {
      ...(cat.metasSubcategorias || {}),
      [nomeLimpo]: novaMetaObj
    };

    novasCategorias[catIndex] = {
      ...cat,
      subcategorias: novasSubs,
      metasSubcategorias: novasMetasSub
    };
    setCategorias(novasCategorias);
    setNovaSubInline(prev => ({ ...prev, [cat.nome]: { nome: '', tipoMeta: 'percentual', valor: '' } }));

    // Sincronizar também no cadastro geral de categorias do usuário
    await sincronizarCadastroCategorias(novasCategorias);
  };

  const removerSubcategoriaNoOrcamento = async (catIndex, subNome) => {
    if (!window.confirm(`Deseja remover a subcategoria "${subNome}"?`)) return;
    const novasCategorias = [...categorias];
    const cat = { ...novasCategorias[catIndex] };
    cat.subcategorias = (cat.subcategorias || []).filter(s => s !== subNome);
    const novasMetas = { ...(cat.metasSubcategorias || {}) };
    delete novasMetas[subNome];
    cat.metasSubcategorias = novasMetas;
    novasCategorias[catIndex] = cat;
    setCategorias(novasCategorias);
    await sincronizarCadastroCategorias(novasCategorias);
  };

  // Criar nova Categoria Principal direto pelo Orçamento
  const criarNovaCategoriaNoOrcamento = async (e) => {
    e.preventDefault();
    const nomeLimpo = String(formNovaCategoria.nome || '').trim();
    if (!nomeLimpo) return;

    if (categorias.some(c => c.nome.toLowerCase() === nomeLimpo.toLowerCase())) {
      setMensagemFeedback({ tipo: 'erro', texto: `A categoria "${nomeLimpo}" já existe.` });
      return;
    }

    const real = parseFloat(rendaReal) || 0;
    const tipoMeta = formNovaCategoria.tipoMeta || 'percentual';
    const valInput = parseFloat(formNovaCategoria.valorMeta) || 0;
    const valorPlanejado = tipoMeta === 'valor' ? valInput : (real > 0 ? (real * valInput) / 100 : 0);
    const percentual = tipoMeta === 'percentual' ? valInput : (real > 0 ? parseFloat(((valInput / real) * 100).toFixed(2)) : 0);

    const primeiraSub = String(formNovaCategoria.primeiraSubcategoria || '').trim();
    const subcategorias = primeiraSub ? [primeiraSub] : [];

    const novaCat = {
      id: `cat-${Date.now()}`,
      nome: nomeLimpo,
      cor: formNovaCategoria.cor || '#10B981',
      tipoMeta,
      valorPlanejado,
      percentual,
      gastoAtual: 0,
      subcategorias,
      metasSubcategorias: primeiraSub
        ? { [primeiraSub]: { tipoMeta: 'percentual', percentual: 100, valorPlanejado } }
        : {}
    };

    const novasCategorias = [...categorias, novaCat];
    setCategorias(novasCategorias);
    setCategoriasExpandidas(prev => ({ ...prev, [nomeLimpo]: true }));
    setModalNovaCategoria(false);
    setFormNovaCategoria({ nome: '', cor: '#10B981', tipoMeta: 'percentual', valorMeta: '', primeiraSubcategoria: '' });

    await sincronizarCadastroCategorias(novasCategorias);
    setMensagemFeedback({
      tipo: 'sucesso',
      texto: `Categoria "${nomeLimpo}" criada e sincronizada com Configurações! Não esqueça de clicar em "Salvar Orçamento".`
    });
  };

  const sincronizarCadastroCategorias = async (listaCategoriasOrcamento) => {
    try {
      const categoriasParaSalvar = listaCategoriasOrcamento.map(c => ({
        id: c.id || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        nome: c.nome,
        cor: c.cor || '#3B82F6',
        tipoMeta: c.tipoMeta || 'percentual',
        valorMeta: c.tipoMeta === 'valor' ? (parseFloat(c.valorPlanejado) || 0) : (parseFloat(c.percentual) || 0),
        subcategorias: Array.isArray(c.subcategorias) ? c.subcategorias : [],
        metasSubcategorias: c.metasSubcategorias || {}
      }));
      setCategoriasCadastro(categoriasParaSalvar);
      await api.post('/user/dados', { categorias: categoriasParaSalvar });
    } catch (err) {
      console.error('Erro ao sincronizar cadastro de categorias:', err);
    }
  };

  const totalPercentual = categorias.reduce((acc, cat) => acc + (parseFloat(cat.percentual) || 0), 0);
  const percentualValido = Math.abs(totalPercentual - 100) < 0.1 || totalPercentual === 0;

  // Verifica se alguma categoria tem subcategorias cuja soma ultrapassa o valor da categoria principal
  const categoriasComSubcategoriasEstouradas = categorias
    .map((cat, idx) => ({ cat, idx, resumo: calcularResumoSubcategorias(cat) }))
    .filter(item => item.resumo.ultrapassou);

  const salvarOrcamento = async () => {
    setMensagemFeedback(null);

    if (totalPercentual > 100.5) {
      setMensagemFeedback({ tipo: 'erro', texto: `A soma dos percentuais das categorias ultrapassa 100%. Atual: ${totalPercentual.toFixed(2)}%` });
      return;
    }

    if (categoriasComSubcategoriasEstouradas.length > 0) {
      const nomesEstourados = categoriasComSubcategoriasEstouradas
        .map(i => `${i.cat.nome} (Subcategorias: ${formatarMoeda(i.resumo.somaValorSub)} / ${i.resumo.percentualEfetivo.toFixed(1)}% vs Meta: ${formatarMoeda(i.resumo.valorCat)})`)
        .join(', ');
      setMensagemFeedback({
        tipo: 'erro',
        texto: `A soma das subcategorias ultrapassa o valor principal em: ${nomesEstourados}. Ajuste as subcategorias ou clique em "Igualar Teto da Categoria" antes de salvar.`
      });
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
          percentual: c.percentual || 0,
          subcategorias: c.subcategorias || [],
          metasSubcategorias: c.metasSubcategorias || {}
        }))
      };

      const categoriasAtualizadas = categorias.map(c => ({
        id: c.id || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        nome: c.nome,
        cor: c.cor || '#3B82F6',
        tipoMeta: c.tipoMeta || 'percentual',
        valorMeta: c.tipoMeta === 'valor' ? calcularValorCategoria(c) : (parseFloat(c.percentual) || 0),
        subcategorias: Array.isArray(c.subcategorias) ? c.subcategorias : [],
        metasSubcategorias: c.metasSubcategorias || {}
      }));

      await api.post('/user/dados', {
        orcamentos: [novoOrcamento],
        categorias: categoriasAtualizadas
      });

      setOrcamentoSalvo(true);
      setMensagemFeedback({ tipo: 'sucesso', texto: 'Orçamento, categorias e metas de subcategorias salvos e sincronizados com sucesso!' });
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
    const nomeTraduzido = nomes[mesNum - 1] ? t(nomes[mesNum - 1]) : mesStr;
    return `${nomeTraduzido}/${anoStr}`;
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

          const subcategorias = (matchUser && Array.isArray(matchUser.subcategorias) && matchUser.subcategorias.length > 0)
            ? matchUser.subcategorias
            : obterSubcategoriasPadrao(cat.nome);

          return {
            ...cat,
            cor,
            tipoMeta,
            valorPlanejado,
            percentual,
            gastoAtual: 0,
            subcategorias,
            metasSubcategorias: normalizarMetasSubcategorias(cat.metasSubcategorias || matchUser?.metasSubcategorias, subcategorias, valorPlanejado)
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
        label: `${t(nomes[m - 1])} / ${anoAtual}`,
        isOrigem: chave === mesSelecionado
      });
    }
    for (let m = 1; m <= 6; m++) {
      const chave = `${anoAtual + 1}-${String(m).padStart(2, '0')}`;
      lista.push({
        chave,
        label: `${t(nomes[m - 1])} / ${anoAtual + 1}`,
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
            }

            return {
              nome: c.nome,
              cor: c.cor,
              tipoMeta,
              valorPlanejado,
              percentual,
              gastoAtual: 0,
              subcategorias: c.subcategorias || [],
              metasSubcategorias: normalizarMetasSubcategorias(c.metasSubcategorias, c.subcategorias, valorPlanejado)
            };
          })
        };
      });

      await api.post('/user/dados', { orcamentos: orcamentosParaSalvar });

      setModalCopiarAberto(false);
      setMesesParaCopiar([]);
      setMensagemFeedback({
        tipo: 'sucesso',
        texto: `Orçamento e metas copiados com sucesso para ${orcamentosParaSalvar.length} ${orcamentosParaSalvar.length === 1 ? 'mês' : 'meses'}!`
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
          <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm md:text-base">
            Configure as metas principais das categorias e distribua entre suas subcategorias
          </p>
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white transition shadow-lg flex-1 sm:flex-none justify-center font-bold ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
        <div className={`border-2 rounded-xl p-4 flex items-center justify-between gap-3 ${
          mensagemFeedback.tipo === 'sucesso'
            ? 'bg-green-50 dark:bg-green-950/40 border-green-500 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {mensagemFeedback.tipo === 'sucesso' ? (
              <CheckCircle className="w-6 h-6 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 shrink-0" />
            )}
            <p className="font-semibold text-sm">{mensagemFeedback.texto}</p>
          </div>
          {mensagemFeedback.tipo === 'erro' && categoriasComSubcategoriasEstouradas.length > 0 && (
            <button
              type="button"
              onClick={() => {
                categoriasComSubcategoriasEstouradas.forEach(item => {
                  reajustarTetoCategoriaParaSubcategorias(item.idx);
                });
              }}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shrink-0 transition shadow-sm"
            >
              Igualar Teto da Categoria Automaticamente
            </button>
          )}
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
            <div className="bg-custom-primary/30 dark:bg-amber-900/10 p-4 rounded-custom border border-custom-color flex items-center justify-between">
              <span className="text-lg font-semibold text-custom-main opacity-90 flex items-center">
                <span>Renda Real Disponível:</span>
                <FieldHelpTooltip fieldLabel="Renda Real Disponível" />
              </span>
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
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }} formatter={(value, name) => [`${value.toFixed(2)}%`, name]} />
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

      {/* TABELA DE CATEGORIAS E SUBCATEGORIAS */}
      <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-custom-primary/50 dark:bg-amber-900/20 rounded-lg">
              <Target className="w-6 h-6 text-custom-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-custom-main">Metas por Categoria e Subcategoria</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Clique em qualquer categoria para expandir suas subcategorias e distribuir a meta (em R$ ou % até 100% da categoria)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setModalNovaCategoria(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </button>
            <button
              type="button"
              onClick={() => {
                const todasAbertas = categorias.every(c => categoriasExpandidas[c.nome]);
                const novoMapa = {};
                categorias.forEach(c => {
                  novoMapa[c.nome] = !todasAbertas;
                });
                setCategoriasExpandidas(novoMapa);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              {categorias.every(c => categoriasExpandidas[c.nome]) ? 'Recolher Subcategorias' : 'Expandir Subcategorias'}
            </button>
            <button
              onClick={() => setModalCopiarAberto(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar p/ Outros Meses
            </button>
          </div>
        </div>

        {/* ALERTA GLOBAL SE ALGUMA SUBCATEGORIA ESTOURAR O TETO DA CATEGORIA PAI */}
        {categoriasComSubcategoriasEstouradas.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-400 dark:border-red-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800 dark:text-red-200 text-sm">
                  Atenção: Soma das Subcategorias ultrapassou a Meta Principal!
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  As subcategorias devem somar no máximo 100% do valor configurado para a categoria principal. Verifique:{' '}
                  <strong>
                    {categoriasComSubcategoriasEstouradas
                      .map(i => `${i.cat.nome} (Excedeu ${formatarMoeda(Math.abs(i.resumo.diferencaValorSub))} / ${Math.abs(i.resumo.diferencaPercentualSub).toFixed(1)}%)`)
                      .join(' • ')}
                  </strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                categoriasComSubcategoriasEstouradas.forEach(item => {
                  reajustarTetoCategoriaParaSubcategorias(item.idx);
                });
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shrink-0 transition shadow-sm"
            >
              Ajustar Teto da Categoria Automaticamente
            </button>
          </div>
        )}

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
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-slate-300">Categoria / Subcategorias</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-slate-300">Modo</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-slate-300">Meta Principal</th>
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
                const isExpanded = Boolean(categoriasExpandidas[categoria.nome]);
                const resumoSub = calcularResumoSubcategorias(categoria);
                const qtdSubs = (categoria.subcategorias || []).length;

                return (
                  <React.Fragment key={categoria.nome || index}>
                    <tr className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${
                      resumoSub.ultrapassou ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                    }`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleExpandirCategoria(categoria.nome)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition"
                            title={isExpanded ? 'Recolher subcategorias' : 'Expandir e definir metas das subcategorias'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: categoria.cor }} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                onClick={() => toggleExpandirCategoria(categoria.nome)}
                                className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
                              >
                                {categoria.nome}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleExpandirCategoria(categoria.nome)}
                                className={`text-[11px] px-2 py-0.5 rounded-full font-bold border transition ${
                                  resumoSub.ultrapassou
                                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                                    : resumoSub.somaValorSub > 0
                                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700'
                                }`}
                              >
                                {qtdSubs} sub{qtdSubs === 1 ? '' : 's'}
                                {resumoSub.somaValorSub > 0 && ` • ${resumoSub.percentualEfetivo.toFixed(0)}% alocado`}
                                {resumoSub.ultrapassou && ' ⚠️ Excedeu'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => alternarTipoMeta(index, isValor ? 'percentual' : 'valor')}
                          title="Clique para alternar entre Valor (R$) e Porcentagem (%)"
                          className="min-w-[42px] h-9 px-3 rounded-lg bg-custom-card border border-custom-color text-xs font-bold text-amber-400 hover:border-custom-gold hover:bg-custom-primary/40 transition cursor-pointer inline-flex items-center justify-center shadow-xs"
                        >
                          {isValor ? 'R$' : '%'}
                        </button>
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

                    {/* PAINEL EXPANSÍVEL DE SUBCATEGORIAS (DESKTOP) */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 dark:bg-slate-800/40 border-b-2 border-indigo-100 dark:border-slate-700">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-3 pl-4 border-l-4" style={{ borderLeftColor: categoria.cor }}>
                            {/* Cabeçalho de Alocação Interna da Categoria */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4" style={{ color: categoria.cor }} />
                                <span className="text-xs font-bold text-gray-800 dark:text-white">
                                  Distribuição de Subcategorias em {categoria.nome}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                  (Teto Principal: <strong>{formatarMoeda(valorCat)}</strong> = 100%)
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500 dark:text-slate-400">Soma das Subcategorias: </span>
                                  <strong className={resumoSub.ultrapassou ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}>
                                    {formatarMoeda(resumoSub.somaValorSub)} ({resumoSub.percentualEfetivo.toFixed(1)}%)
                                  </strong>
                                </div>
                                <div>
                                  {resumoSub.ultrapassou ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      Ultrapassou {formatarMoeda(Math.abs(resumoSub.diferencaValorSub))} (+{Math.abs(resumoSub.diferencaPercentualSub).toFixed(1)}%)
                                    </span>
                                  ) : resumoSub.diferencaValorSub > 0.01 ? (
                                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                      Livre p/ distribuir: {formatarMoeda(resumoSub.diferencaValorSub)} ({Math.max(0, resumoSub.diferencaPercentualSub).toFixed(1)}%)
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                      ✓ 100% da Categoria Distribuída
                                    </span>
                                  )}
                                </div>
                                {resumoSub.ultrapassou && (
                                  <button
                                    type="button"
                                    onClick={() => reajustarTetoCategoriaParaSubcategorias(index)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition shadow-sm"
                                  >
                                    Ajustar Teto p/ {formatarMoeda(resumoSub.somaValorSub)}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Barra de Progresso Interna da Categoria */}
                            <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  resumoSub.ultrapassou
                                    ? 'bg-red-500'
                                    : Math.abs(resumoSub.percentualEfetivo - 100) < 0.5
                                      ? 'bg-emerald-500'
                                      : 'bg-indigo-500'
                                }`}
                                style={{ width: `${Math.min(resumoSub.percentualEfetivo, 100)}%` }}
                              />
                            </div>

                            {/* Lista de Subcategorias */}
                            {(categoria.subcategorias || []).length === 0 ? (
                              <p className="text-xs text-gray-500 italic py-2">
                                Nenhuma subcategoria cadastrada. Adicione uma abaixo!
                              </p>
                            ) : (
                              <div className="divide-y divide-gray-200/70 dark:divide-slate-700/70 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                {(categoria.subcategorias || []).map((subNome) => {
                                  const subDados = calcularDadosSubcategoria(categoria, subNome);
                                  const isSubValor = subDados.tipoMeta === 'valor';

                                  return (
                                    <div
                                      key={subNome}
                                      className="grid grid-cols-12 items-center px-4 py-2.5 text-xs hover:bg-gray-50 dark:hover:bg-slate-800/60 transition"
                                    >
                                      <div className="col-span-4 flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-200">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoria.cor }} />
                                        <span>{subNome}</span>
                                        <button
                                          type="button"
                                          onClick={() => removerSubcategoriaNoOrcamento(index, subNome)}
                                          className="text-gray-400 hover:text-red-500 transition ml-1"
                                          title="Remover subcategoria"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      <div className="col-span-2 flex justify-center">
                                        <button
                                          type="button"
                                          onClick={() => alternarTipoMetaSubcategoria(index, subNome, isSubValor ? 'percentual' : 'valor')}
                                          title="Clique para alternar entre Valor (R$) e Porcentagem (%)"
                                          className="min-w-[38px] h-7 px-2.5 rounded-lg bg-custom-card border border-custom-color text-[11px] font-bold text-amber-400 hover:border-custom-gold hover:bg-custom-primary/40 transition cursor-pointer inline-flex items-center justify-center shadow-xs"
                                        >
                                          {isSubValor ? 'R$' : '%'}
                                        </button>
                                      </div>

                                      <div className="col-span-2 flex items-center justify-center gap-1.5">
                                        <div className="relative">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                                            {isSubValor ? 'R$' : '%'}
                                          </span>
                                          <input
                                            type="number"
                                            step={isSubValor ? '0.01' : '0.1'}
                                            min="0"
                                            value={
                                              isSubValor
                                                ? (subDados.valorPlanejado || '')
                                                : (subDados.percentual || '')
                                            }
                                            onChange={(e) => atualizarMetaSubcategoria(index, subNome, e.target.value)}
                                            placeholder="0"
                                            className="w-24 pl-6 pr-2 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-center font-bold text-xs bg-white dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                          />
                                        </div>
                                        <span className="text-[11px] text-gray-400">
                                          {isSubValor
                                            ? `(${subDados.percentual.toFixed(1)}%)`
                                            : `(${formatarMoeda(subDados.valorPlanejado)})`}
                                        </span>
                                      </div>

                                      <div className="col-span-1 text-right font-semibold text-gray-700 dark:text-slate-300">
                                        {formatarMoeda(subDados.valorPlanejado)}
                                      </div>

                                      <div className="col-span-1 text-right font-semibold text-gray-700 dark:text-slate-300">
                                        {formatarMoeda(subDados.gastoAtual)}
                                      </div>

                                      <div className={`col-span-2 text-right font-bold ${
                                        subDados.disponivel >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                      }`}>
                                        {formatarMoeda(subDados.disponivel)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Adicionar Nova Subcategoria Inline com Meta */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <input
                                type="text"
                                placeholder={`+ Nova subcategoria em ${categoria.nome}...`}
                                value={novaSubInline[categoria.nome]?.nome || ''}
                                onChange={(e) =>
                                  setNovaSubInline(prev => ({
                                    ...prev,
                                    [categoria.nome]: {
                                      ...(prev[categoria.nome] || { tipoMeta: 'percentual', valor: '' }),
                                      nome: e.target.value
                                    }
                                  }))
                                }
                                className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setNovaSubInline(prev => {
                                    const atual = prev[categoria.nome] || { nome: '', tipoMeta: 'percentual', valor: '' };
                                    return {
                                      ...prev,
                                      [categoria.nome]: {
                                        ...atual,
                                        tipoMeta: atual.tipoMeta === 'valor' ? 'percentual' : 'valor'
                                      }
                                    };
                                  })
                                }
                                title="Clique para alternar entre Valor (R$) e Porcentagem (%)"
                                className="min-w-[38px] h-8 px-2.5 rounded-lg bg-custom-card border border-custom-color text-xs font-bold text-amber-400 hover:border-custom-gold hover:bg-custom-primary/40 transition cursor-pointer inline-flex items-center justify-center shadow-xs"
                              >
                                {(novaSubInline[categoria.nome]?.tipoMeta || 'percentual') === 'valor' ? 'R$' : '%'}
                              </button>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Meta (opcional)"
                                value={novaSubInline[categoria.nome]?.valor || ''}
                                onChange={(e) =>
                                  setNovaSubInline(prev => ({
                                    ...prev,
                                    [categoria.nome]: {
                                      ...(prev[categoria.nome] || { nome: '', tipoMeta: 'percentual' }),
                                      valor: e.target.value
                                    }
                                  }))
                                }
                                className="w-32 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() => adicionarSubcategoriaNoOrcamento(index)}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Adicionar Subcategoria
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
            const isExpanded = Boolean(categoriasExpandidas[categoria.nome]);
            const resumoSub = calcularResumoSubcategorias(categoria);

            return (
              <div
                key={categoria.nome || index}
                className="bg-gray-50 dark:bg-slate-800 rounded-xl border-l-4 p-4 space-y-3"
                style={{ borderLeftColor: categoria.cor }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoria.cor }} />
                    <span className="font-bold text-gray-900 dark:text-white">{categoria.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alternarTipoMeta(index, isValor ? 'percentual' : 'valor')}
                      title="Clique para alternar entre Valor (R$) e Porcentagem (%)"
                      className="min-w-[38px] h-8 px-2.5 rounded-lg bg-custom-card border border-custom-color text-xs font-bold text-amber-400 hover:border-custom-gold hover:bg-custom-primary/40 transition cursor-pointer inline-flex items-center justify-center shadow-xs"
                    >
                      {isValor ? 'R$' : '%'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpandirCategoria(categoria.nome)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-600"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

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

                {/* Subcategorias Mobile */}
                {isExpanded && (
                  <div className="pt-3 border-t border-gray-200 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 dark:text-slate-300">
                        Subcategorias ({resumoSub.percentualEfetivo.toFixed(0)}%)
                      </span>
                      <span className={resumoSub.ultrapassou ? 'text-red-600 font-bold' : 'text-indigo-600 font-semibold'}>
                        {formatarMoeda(resumoSub.somaValorSub)} / {formatarMoeda(valorCat)}
                      </span>
                    </div>

                    {resumoSub.ultrapassou && (
                      <div className="p-2 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center justify-between gap-2">
                        <span>Excedeu em {formatarMoeda(Math.abs(resumoSub.diferencaValorSub))}!</span>
                        <button
                          type="button"
                          onClick={() => reajustarTetoCategoriaParaSubcategorias(index)}
                          className="px-2 py-1 bg-red-600 text-white rounded font-bold text-[11px]"
                        >
                          Igualar Teto
                        </button>
                      </div>
                    )}

                    {(categoria.subcategorias || []).map(subNome => {
                      const subDados = calcularDadosSubcategoria(categoria, subNome);
                      const isSubValor = subDados.tipoMeta === 'valor';
                      return (
                        <div key={subNome} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{subNome}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => alternarTipoMetaSubcategoria(index, subNome, isSubValor ? 'percentual' : 'valor')}
                                title="Clique para alternar entre Valor (R$) e Porcentagem (%)"
                                className="min-w-[34px] h-6 px-2 rounded bg-custom-card border border-custom-color text-[10px] font-bold text-amber-400 hover:border-custom-gold transition cursor-pointer inline-flex items-center justify-center"
                              >
                                {isSubValor ? 'R$' : '%'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removerSubcategoriaNoOrcamento(index, subNome)}
                                className="text-gray-400 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={isSubValor ? (subDados.valorPlanejado || '') : (subDados.percentual || '')}
                              onChange={(e) => atualizarMetaSubcategoria(index, subNome, e.target.value)}
                              placeholder={isSubValor ? 'R$ 0,00' : '0%'}
                              className="w-24 px-2 py-1 text-xs font-bold border border-gray-300 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-800 dark:text-white"
                            />
                            <span className="text-[11px] text-gray-500">
                              Plan: {formatarMoeda(subDados.valorPlanejado)} ({subDados.percentual.toFixed(0)}%)
                            </span>
                            <span className="text-[11px] ml-auto font-semibold text-gray-600 dark:text-slate-400">
                              Gasto: {formatarMoeda(subDados.gastoAtual)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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

      {/* MODAL: NOVA CATEGORIA DIRETO NO ORÇAMENTO */}
      {modalNovaCategoria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Nova Categoria e Meta
              </h3>
              <button
                type="button"
                onClick={() => setModalNovaCategoria(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={criarNovaCategoriaNoOrcamento} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Saúde, Pets, Casa..."
                  value={formNovaCategoria.nome}
                  onChange={(e) => setFormNovaCategoria({ ...formNovaCategoria, nome: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={formNovaCategoria.cor}
                    onChange={(e) => setFormNovaCategoria({ ...formNovaCategoria, cor: e.target.value })}
                    className="w-full h-10 rounded-xl cursor-pointer border border-gray-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Tipo de Meta
                  </label>
                  <select
                    value={formNovaCategoria.tipoMeta}
                    onChange={(e) => setFormNovaCategoria({ ...formNovaCategoria, tipoMeta: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-gray-900 dark:text-white"
                  >
                    <option value="percentual">% da Renda</option>
                    <option value="valor">Valor Fixo (R$)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Meta Principal da Categoria ({formNovaCategoria.tipoMeta === 'valor' ? 'R$' : '%'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={formNovaCategoria.tipoMeta === 'valor' ? 'Ex: 500.00' : 'Ex: 10'}
                  value={formNovaCategoria.valorMeta}
                  onChange={(e) => setFormNovaCategoria({ ...formNovaCategoria, valorMeta: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Primeira Subcategoria (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Consultas, Farmácia..."
                  value={formNovaCategoria.primeiraSubcategoria}
                  onChange={(e) => setFormNovaCategoria({ ...formNovaCategoria, primeiraSubcategoria: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovaCategoria(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-400 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REPLICAÇÃO DE METAS PARA OUTROS MESES */}
      {modalCopiarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
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

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
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
