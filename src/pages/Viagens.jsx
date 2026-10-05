import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { useCurrency } from '../contexts/CurrencyContext';
import { buscarCotacoesCambio } from '../services/cambioService';
import {
  MATRIZ_GORJETAS,
  MODALIDADES_CAMBIO,
  PERFIS_RISCO,
  PILARES_VIAGEM,
  calcularCombustivel,
  calcularDesgasteMecanico,
  calcularCustoRodagemCarro,
  calcularAlimentacao,
  calcularConversaoCambial,
  calcularHospedagem,
  calcularAtividade,
  calcularContingencia
} from '../utils/viagensCalculos';
import {
  Plane,
  Plus,
  Trash2,
  Edit3,
  Check,
  RefreshCw,
  Car,
  Home,
  Utensils,
  Compass,
  Banknote,
  ShoppingBag,
  ShieldAlert,
  ArrowRight,
  DollarSign,
  Calendar,
  MapPin,
  Info,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronDown,
  Luggage,
  Ticket,
  Train,
  Bus
} from 'lucide-react';

const Viagens = () => {
  const { formatCurrency } = useCurrency();

  // Moedas Suportadas e Helpers
  const MOEDAS_DISPONIVEIS = useMemo(() => [
    { code: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$' },
    { code: 'USD', nome: 'Dólar Americano', simbolo: 'US$' },
    { code: 'EUR', nome: 'Euro', simbolo: '€' },
    { code: 'GBP', nome: 'Libra Esterlina', simbolo: '£' },
    { code: 'CAD', nome: 'Dólar Canadense', simbolo: 'C$' },
    { code: 'ARS', nome: 'Peso Argentino', simbolo: '$' },
    { code: 'CLP', nome: 'Peso Chileno', simbolo: 'CLP$' },
    { code: 'JPY', nome: 'Iene Japonês', simbolo: '¥' }
  ], []);

  // Estados principais
  const [viagens, setViagens] = useState([]);
  const [viagemAtivaId, setViagemAtivaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('geral'); // 'geral', 'transporte', 'hospedagem', 'alimentacao', 'cambio', 'itens'

  // Modal Nova Viagem
  const [modalNovaViagem, setModalNovaViagem] = useState(false);
  const [formViagem, setFormViagem] = useState({
    titulo: '',
    destino: '',
    paisCodigo: 'BR',
    dataInicio: '',
    dataFim: '',
    perfilRisco: 'medio',
    moedaPrincipal: 'BRL',
    descricao: ''
  });

  // Cotações de Câmbio
  const [cotacoes, setCotacoes] = useState({});
  const [carregandoCambio, setCarregandoCambio] = useState(false);
  const [fonteCambio, setFonteCambio] = useState('');
  const [horaUltimaCotacao, setHoraUltimaCotacao] = useState('');

  const getCotacaoMoeda = useCallback((code) => {
    if (!code || code === 'BRL') return 1.0;
    if (cotacoes[code]?.valor) return parseFloat(cotacoes[code].valor);
    const fallbacks = { USD: 5.25, EUR: 5.80, GBP: 6.85, CAD: 3.85, ARS: 0.0055, JPY: 0.035, CLP: 0.0056 };
    return fallbacks[code] || 1.0;
  }, [cotacoes]);

  const formatSimboloMoeda = useCallback((code) => {
    return MOEDAS_DISPONIVEIS.find(m => m.code === code)?.simbolo || code;
  }, [MOEDAS_DISPONIVEIS]);

  // Sub-aba de transporte: 'passagens' ou 'carro'
  const [subAbaTransporte, setSubAbaTransporte] = useState('passagens');

  // Simulador de Passagens, Aéreo & Bagagens (NOVO)
  const [transportePassagens, setTransportePassagens] = useState({
    tipo: 'aereo', // 'aereo', 'trem', 'onibus', 'transfer'
    descricao: 'Passagens Aéreas (Ida e Volta)',
    moeda: 'BRL',
    valorTarifa: 2800,
    quantidadePassageiros: 1,
    quantidadeMalasDespachadas: 1,
    valorPorMala: 180,
    taxasEmbarque: 110,
    assentosConforto: 0,
    cotacaoManual: null
  });

  // Simulador de Transporte (Carro)
  const [transporteCarro, setTransporteCarro] = useState({
    moeda: 'BRL',
    distanciaKm: 450,
    consumoKmL: 12,
    precoLitro: 5.99,
    fatorOp: 1.0,
    incluirDesgaste: true,
    custoKm: 0.24,
    pedagios: 65,
    diariasEstacionamento: 3,
    tarifaEstacionamento: 40,
    rotativas: 20,
    lavagem: 50,
    cotacaoManual: null
  });

  // Simulador de Hospedagem
  const [simuladorHospedagem, setSimuladorHospedagem] = useState({
    moeda: 'BRL',
    nomeLocal: 'Hotel / Pousada',
    diariaBase: 350,
    noites: 4,
    cityTax: 0,
    hospedes: 2,
    resortFee: 0,
    salesTax: 0,
    limpeza: 80,
    caucao: 500,
    cotacaoManual: null
  });

  // Simulador de Alimentação
  const [simuladorAlimentacao, setSimuladorAlimentacao] = useState({
    moeda: 'BRL',
    cafe: 25,
    almoco: 60,
    jantar: 80,
    lanches: 25,
    dias: 5,
    pessoas: 2,
    paisCodigo: 'BR',
    gorjetaCustom: null,
    copertoCustom: null,
    cotacaoManual: null
  });

  // Simulador de Câmbio
  const [simuladorCambio, setSimuladorCambio] = useState({
    moeda: 'USD',
    valorMoeda: 1000,
    cotacaoManual: null,
    spreadCustom: null,
    iofCustom: null,
    modalidade: 'global'
  });

  // Modal Novo Item Manual no Orçamento
  const [modalNovoItem, setModalNovoItem] = useState(false);
  const [novoItem, setNovoItem] = useState({
    pilar: 'transporte',
    descricao: '',
    moeda: 'BRL',
    valorNaMoeda: '',
    valorPrevisto: '',
    valorPagoNaMoeda: '',
    valorPago: '',
    pago: false,
    cotacaoManual: null,
    dataVencimento: '',
    observacoes: ''
  });

  // Carrega viagens e dados iniciais (com atualização de hora em hora para câmbio)
  useEffect(() => {
    carregarDadosIniciais();
    carregarCotacoes();

    // Atualização automática periódica a cada 1 hora (60 minutos)
    const intervaloCambio = setInterval(() => {
      carregarCotacoes(true);
    }, 60 * 60 * 1000);

    return () => clearInterval(intervaloCambio);
  }, []);

  const carregarCotacoes = async (forcar = false) => {
    setCarregandoCambio(true);
    try {
      const res = await buscarCotacoesCambio(forcar);
      if (res.sucesso) {
        setCotacoes(res.dados);
        setFonteCambio(res.fonte);
        const dataRef = new Date(res.timestamp || Date.now());
        setHoraUltimaCotacao(dataRef.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Erro ao buscar cotações:', err);
    } finally {
      setCarregandoCambio(false);
    }
  };

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/dados');
      const dados = response.data?.dados || response.data || {};
      const listaViagens = Array.isArray(dados.viagens) ? dados.viagens : [];
      setViagens(listaViagens);

      if (listaViagens.length > 0) {
        setViagemAtivaId(listaViagens[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      toast.error('Erro ao carregar dados de viagens.');
    } finally {
      setLoading(false);
    }
  };

  // Salvar viagens no backend
  const salvarViagensNoBackend = async (novasViagens) => {
    setSalvando(true);
    try {
      const resGet = await api.get('/user/dados');
      const dadosCompletos = resGet.data?.dados || resGet.data || {};
      dadosCompletos.viagens = novasViagens;

      await api.post('/user/dados', dadosCompletos);
      setViagens(novasViagens);
      return true;
    } catch (error) {
      console.error('Erro ao salvar viagens:', error);
      toast.error('Erro ao sincronizar com o servidor.');
      return false;
    } finally {
      setSalvando(false);
    }
  };

  // Viagem ativa
  const viagemAtiva = useMemo(() => {
    return viagens.find(v => v.id === viagemAtivaId) || null;
  }, [viagens, viagemAtivaId]);

  // Atualizar simuladores quando mudar de viagem
  useEffect(() => {
    if (viagemAtiva) {
      const novoPais = viagemAtiva.paisCodigo || 'BR';
      const moedaDestino = viagemAtiva.moedaPrincipal || MATRIZ_GORJETAS[novoPais]?.moedaPadrao || 'BRL';

      setSimuladorAlimentacao(prev => ({
        ...prev,
        paisCodigo: novoPais,
        moeda: moedaDestino
      }));

      setSimuladorHospedagem(prev => ({
        ...prev,
        moeda: moedaDestino
      }));

      setTransportePassagens(prev => ({
        ...prev,
        moeda: moedaDestino !== 'BRL' ? moedaDestino : 'BRL'
      }));

      if (moedaDestino && moedaDestino !== 'BRL') {
        setSimuladorCambio(prev => ({
          ...prev,
          moeda: moedaDestino
        }));
      }

      setNovoItem(prev => ({
        ...prev,
        moeda: moedaDestino
      }));
    }
  }, [viagemAtiva?.id, viagemAtiva?.paisCodigo, viagemAtiva?.moedaPrincipal]);

  // Cálculos consolidados da viagem ativa
  const resumoFinanceiro = useMemo(() => {
    if (!viagemAtiva) {
      return {
        subtotalPrevisto: 0,
        totalPago: 0,
        totalPendente: 0,
        reservaContingencia: 0,
        totalGeralPrevisto: 0,
        porPilar: {},
        caucaoTotal: 0
      };
    }

    const itens = viagemAtiva.itens || [];
    let subtotalPrevisto = 0;
    let totalPago = 0;
    let caucaoTotal = 0;
    const porPilar = {};

    PILARES_VIAGEM.forEach(p => {
      porPilar[p.id] = { nome: p.nome, previsto: 0, pago: 0, cor: p.cor };
    });

    itens.forEach(item => {
      const valPrev = parseFloat(item.valorPrevisto) || 0;
      const valPago = parseFloat(item.valorPago) || (item.pago ? valPrev : 0);

      subtotalPrevisto += valPrev;
      if (item.pago) {
        totalPago += valPago;
      }
      if (item.caucao) {
        caucaoTotal += parseFloat(item.caucao) || 0;
      }

      const pId = item.pilar || 'transporte';
      if (!porPilar[pId]) {
        porPilar[pId] = { nome: pId, previsto: 0, pago: 0, cor: '#0EA5E9' };
      }
      porPilar[pId].previsto += valPrev;
      if (item.pago) {
        porPilar[pId].pago += valPago;
      }
    });

    // Contingência
    const perfil = viagemAtiva.perfilRisco || 'medio';
    const contCalc = calcularContingencia(subtotalPrevisto, perfil);
    const reservaContingencia = contCalc.valorReserva;
    const totalGeralPrevisto = subtotalPrevisto + reservaContingencia;
    const totalPendente = Math.max(0, totalGeralPrevisto - totalPago);

    return {
      subtotalPrevisto,
      totalPago,
      totalPendente,
      reservaContingencia,
      totalGeralPrevisto,
      porPilar,
      caucaoTotal,
      percentualContingencia: contCalc.percentual
    };
  }, [viagemAtiva]);

  // Criação de nova viagem
  const handleCriarViagem = async (e) => {
    e.preventDefault();
    if (!formViagem.titulo.trim()) {
      toast.error('Informe o título da viagem.');
      return;
    }

    const nova = {
      id: `viagem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      titulo: formViagem.titulo,
      destino: formViagem.destino || 'Destino',
      paisCodigo: formViagem.paisCodigo || 'BR',
      dataInicio: formViagem.dataInicio || '',
      dataFim: formViagem.dataFim || '',
      perfilRisco: formViagem.perfilRisco || 'medio',
      moedaPrincipal: formViagem.moedaPrincipal || 'BRL',
      descricao: formViagem.descricao || '',
      dataCriacao: new Date().toISOString(),
      itens: []
    };

    const atualizadas = [nova, ...viagens];
    const ok = await salvarViagensNoBackend(atualizadas);
    if (ok) {
      setViagemAtivaId(nova.id);
      setModalNovaViagem(false);
      setFormViagem({
        titulo: '',
        destino: '',
        paisCodigo: 'BR',
        dataInicio: '',
        dataFim: '',
        perfilRisco: 'medio',
        moedaPrincipal: 'BRL',
        descricao: ''
      });
      toast.success('Viagem criada com sucesso!');
    }
  };

  // Mapeamento de pilares para subcategorias do Meu Bolso
  const MAPA_SUBCATEGORIAS = {
    pre_viagem: 'Documentação e Seguros',
    transporte: 'Passagens e Deslocamento',
    hospedagem: 'Hospedagem',
    alimentacao: 'Alimentação em Viagem',
    passeios: 'Passeios e Ingressos',
    comunicacao: 'Passagens e Deslocamento',
    cambio_taxas: 'Câmbio e Taxas',
    compras: 'Compras e Lembranças',
    contingencia: 'Imprevistos e Emergências'
  };

  // Excluir viagem (com limpeza de despesas sincronizadas)
  const handleExcluirViagem = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este planejamento de viagem? Todos os gastos associados a ela também serão removidos do DRE e de Despesas.')) return;

    setSalvando(true);
    try {
      const res = await api.get('/user/dados');
      const dados = res.data?.dados || res.data || {};
      const listaViagens = Array.isArray(dados.viagens) ? dados.viagens : viagens;
      const despesasAtuais = Array.isArray(dados.despesas) ? dados.despesas : [];

      // Remove despesas vinculadas a essa viagem do extrato geral
      dados.despesas = despesasAtuais.filter(d => d.origemViagemId !== id);

      const filtradas = listaViagens.filter(v => v.id !== id);
      dados.viagens = filtradas;

      await api.post('/user/dados', dados);
      setViagens(filtradas);

      if (viagemAtivaId === id) {
        setViagemAtivaId(filtradas.length > 0 ? filtradas[0].id : '');
      }
      toast.success('Viagem e despesas associadas removidas com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir viagem:', error);
      toast.error('Erro ao excluir viagem.');
    } finally {
      setSalvando(false);
    }
  };

  // Adicionar item orçado na viagem ativa
  const adicionarItemNaViagem = async (itemData) => {
    if (!viagemAtiva) {
      toast.error('Nenhuma viagem selecionada.');
      return;
    }

    setSalvando(true);
    try {
      const res = await api.get('/user/dados');
      const dados = res.data?.dados || res.data || {};
      const listaViagens = Array.isArray(dados.viagens) ? dados.viagens : viagens;
      let despesasAtuais = Array.isArray(dados.despesas) ? dados.despesas : [];

      const itemFinal = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        pilar: itemData.pilar || 'transporte',
        descricao: itemData.descricao || 'Item de Despesa',
        valorPrevisto: parseFloat(itemData.valorPrevisto) || 0,
        valorPago: itemData.pago ? (parseFloat(itemData.valorPago) || parseFloat(itemData.valorPrevisto) || 0) : 0,
        pago: !!itemData.pago,
        dataVencimento: itemData.dataVencimento || viagemAtiva.dataInicio || new Date().toISOString().split('T')[0],
        moeda: itemData.moeda || 'BRL',
        valorMoedaOriginal: itemData.valorMoedaOriginal !== undefined && itemData.valorMoedaOriginal !== null ? parseFloat(itemData.valorMoedaOriginal) : null,
        valorPagoMoedaOriginal: itemData.valorPagoMoedaOriginal !== undefined && itemData.valorPagoMoedaOriginal !== null ? parseFloat(itemData.valorPagoMoedaOriginal) : null,
        cotacaoUtilizada: itemData.cotacaoUtilizada !== undefined && itemData.cotacaoUtilizada !== null ? parseFloat(itemData.cotacaoUtilizada) : null,
        caucao: parseFloat(itemData.caucao) || 0,
        sincronizadoMeuBolso: !!itemData.pago,
        observacoes: itemData.observacoes || ''
      };

      if (itemFinal.pago) {
        const subcat = MAPA_SUBCATEGORIAS[itemFinal.pilar] || 'Passagens e Deslocamento';
        const valorFinal = itemFinal.valorPago || itemFinal.valorPrevisto || 0;
        const dataFinal = itemFinal.dataVencimento || viagemAtiva.dataInicio || new Date().toISOString().split('T')[0];
        const sufixoMoeda = itemFinal.moeda && itemFinal.moeda !== 'BRL' && itemFinal.valorMoedaOriginal
          ? ` (${itemFinal.valorMoedaOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${itemFinal.moeda})`
          : '';

        const novaDespesa = {
          id: `desp-viagem-${itemFinal.id}`,
          origemViagemId: viagemAtiva.id,
          origemViagemItemId: itemFinal.id,
          descricao: `[${viagemAtiva.titulo}] ${itemFinal.descricao}${sufixoMoeda}`,
          valor: valorFinal,
          data: dataFinal,
          categoria: 'Viagens',
          subcategoria: subcat,
          formaPagamento: 'Cartão de Crédito',
          status: 'Pago',
          pago: true,
          fixa: false,
          somarNoOrcamento: true,
          observacoes: `Lançamento automático da viagem: ${viagemAtiva.titulo}${itemFinal.moeda !== 'BRL' && itemFinal.cotacaoUtilizada ? ` | Cotação: R$ ${itemFinal.cotacaoUtilizada}` : ''}`
        };
        despesasAtuais.push(novaDespesa);
        dados.despesas = despesasAtuais;
      }

      const viagensAtualizadas = listaViagens.map(v => {
        if (v.id === viagemAtiva.id) {
          return {
            ...v,
            itens: [...(v.itens || []), itemFinal]
          };
        }
        return v;
      });

      dados.viagens = viagensAtualizadas;
      await api.post('/user/dados', dados);
      setViagens(viagensAtualizadas);

      if (itemFinal.pago) {
        toast.success(`"${itemFinal.descricao}" adicionado e lançado no DRE e Despesas!`);
      } else {
        toast.success(`"${itemFinal.descricao}" adicionado ao orçamento da viagem!`);
      }
    } catch (error) {
      console.error('Erro ao adicionar item na viagem:', error);
      toast.error('Erro ao adicionar item.');
    } finally {
      setSalvando(false);
    }
  };

  // Alternar status de pagamento do item com sincronização AUTOMÁTICA no DRE e Despesas
  const handleTogglePago = async (itemId) => {
    if (!viagemAtiva) return;

    setSalvando(true);
    try {
      const res = await api.get('/user/dados');
      const dados = res.data?.dados || res.data || {};
      const listaViagens = Array.isArray(dados.viagens) ? dados.viagens : viagens;
      let despesasAtuais = Array.isArray(dados.despesas) ? dados.despesas : [];

      let itemAtualizadoRef = null;
      let virouPago = false;

      const viagensAtualizadas = listaViagens.map(v => {
        if (v.id === viagemAtiva.id) {
          const itensAtualizados = (v.itens || []).map(item => {
            if (item.id === itemId) {
              const novoPago = !item.pago;
              virouPago = novoPago;
              const valPago = novoPago ? (parseFloat(item.valorPago) || parseFloat(item.valorPrevisto) || 0) : 0;
              itemAtualizadoRef = {
                ...item,
                pago: novoPago,
                valorPago: valPago,
                sincronizadoMeuBolso: novoPago
              };
              return itemAtualizadoRef;
            }
            return item;
          });
          return { ...v, itens: itensAtualizados };
        }
        return v;
      });

      if (!itemAtualizadoRef) {
        setSalvando(false);
        return;
      }

      const despesaId = `desp-viagem-${itemAtualizadoRef.id}`;

      if (virouPago) {
        // ENTRA NO DRE & DESPESAS: adiciona despesa oficial
        const subcat = MAPA_SUBCATEGORIAS[itemAtualizadoRef.pilar] || 'Passagens e Deslocamento';
        const valorFinal = itemAtualizadoRef.valorPago || parseFloat(itemAtualizadoRef.valorPrevisto) || 0;
        const dataFinal = itemAtualizadoRef.dataVencimento || viagemAtiva.dataInicio || new Date().toISOString().split('T')[0];

        // Garante que não haja duplicata
        despesasAtuais = despesasAtuais.filter(d => d.id !== despesaId && d.origemViagemItemId !== itemId);

        const sufixoMoeda = itemAtualizadoRef.moeda && itemAtualizadoRef.moeda !== 'BRL' && itemAtualizadoRef.valorMoedaOriginal
          ? ` (${itemAtualizadoRef.valorMoedaOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${itemAtualizadoRef.moeda})`
          : '';

        const novaDespesa = {
          id: despesaId,
          origemViagemId: viagemAtiva.id,
          origemViagemItemId: itemAtualizadoRef.id,
          descricao: `[${viagemAtiva.titulo}] ${itemAtualizadoRef.descricao}${sufixoMoeda}`,
          valor: valorFinal,
          data: dataFinal,
          dataLancamento: dataFinal,
          categoria: 'Viagens',
          subcategoria: subcat,
          status: 'pago',
          statusPagamento: 'pago',
          somarNoOrcamento: true,
          observacao: `Gasto de viagem: ${viagemAtiva.titulo} (${viagemAtiva.destino})${itemAtualizadoRef.moeda !== 'BRL' && itemAtualizadoRef.cotacaoUtilizada ? ` | Cotação: R$ ${itemAtualizadoRef.cotacaoUtilizada}` : ''}`
        };

        dados.despesas = [...despesasAtuais, novaDespesa];
      } else {
        // SAI DO DRE & DESPESAS: remove a despesa do extrato
        dados.despesas = despesasAtuais.filter(d => 
          d.id !== despesaId && 
          d.origemViagemItemId !== itemId &&
          d.descricao !== `[${viagemAtiva.titulo}] ${itemAtualizadoRef.descricao}`
        );
      }

      dados.viagens = viagensAtualizadas;

      await api.post('/user/dados', dados);
      setViagens(viagensAtualizadas);

      if (virouPago) {
        toast.success(`Gasto marcado como Pago e adicionado ao DRE e Despesas!`);
      } else {
        toast.info(`Gasto marcado como Pendente e removido do DRE e Despesas.`);
      }
    } catch (error) {
      console.error('Erro ao alternar status do item:', error);
      toast.error('Erro ao atualizar status do pagamento.');
    } finally {
      setSalvando(false);
    }
  };

  // Remover item (com remoção automática do DRE/Despesas caso estivesse pago)
  const handleRemoverItem = async (itemId) => {
    if (!viagemAtiva) return;

    setSalvando(true);
    try {
      const res = await api.get('/user/dados');
      const dados = res.data?.dados || res.data || {};
      const listaViagens = Array.isArray(dados.viagens) ? dados.viagens : viagens;
      const despesasAtuais = Array.isArray(dados.despesas) ? dados.despesas : [];

      const despesaId = `desp-viagem-${itemId}`;
      dados.despesas = despesasAtuais.filter(d => d.id !== despesaId && d.origemViagemItemId !== itemId);

      const viagensAtualizadas = listaViagens.map(v => {
        if (v.id === viagemAtiva.id) {
          return {
            ...v,
            itens: (v.itens || []).filter(i => i.id !== itemId)
          };
        }
        return v;
      });

      dados.viagens = viagensAtualizadas;
      await api.post('/user/dados', dados);
      setViagens(viagensAtualizadas);
      toast.info('Item removido da viagem e do DRE/Despesas.');
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item.');
    } finally {
      setSalvando(false);
    }
  };

  // Cálculos dinâmicos dos simuladores

  // 1. Passagens, Aéreo & Bagagens (NOVO)
  const resultadoPassagens = useMemo(() => {
    const p = transportePassagens;
    const cot = p.moeda === 'BRL' ? 1.0 : (p.cotacaoManual ? parseFloat(p.cotacaoManual) : getCotacaoMoeda(p.moeda));
    const totalTarifas = (parseFloat(p.valorTarifa) || 0) * (parseInt(p.quantidadePassageiros) || 1);
    const totalBagagens = (parseFloat(p.valorPorMala) || 0) * (parseInt(p.quantidadeMalasDespachadas) || 0);
    const totalTaxas = parseFloat(p.taxasEmbarque) || 0;
    const totalAssentos = parseFloat(p.assentosConforto) || 0;

    const subtotalMoedaLocal = totalTarifas + totalBagagens + totalTaxas + totalAssentos;
    const totalBRL = subtotalMoedaLocal * cot;

    return {
      totalTarifas,
      totalBagagens,
      totalTaxas,
      totalAssentos,
      subtotalMoedaLocal,
      totalBRL,
      cotacaoUsada: cot
    };
  }, [transportePassagens, getCotacaoMoeda]);

  // 2. Transporte Terrestre (Carro)
  const resultadoCarro = useMemo(() => {
    const comb = calcularCombustivel({
      distanciaKm: transporteCarro.distanciaKm,
      consumoKmL: transporteCarro.consumoKmL,
      fatorOperacional: transporteCarro.fatorOp,
      precoLitro: transporteCarro.precoLitro
    });
    const desgaste = transporteCarro.incluirDesgaste
      ? calcularDesgasteMecanico(transporteCarro.distanciaKm, transporteCarro.custoKm)
      : 0;
    const custoTotalMoedaLocal = calcularCustoRodagemCarro({
      custoCombustivel: comb.custoCombustivel,
      desgasteMecanico: desgaste,
      pedagios: transporteCarro.pedagios,
      diariasEstacionamento: transporteCarro.diariasEstacionamento,
      tarifaEstacionamento: transporteCarro.tarifaEstacionamento,
      vagasRotativas: transporteCarro.rotativas,
      lavagemRetorno: transporteCarro.lavagem
    });

    const cot = transporteCarro.moeda === 'BRL' ? 1.0 : (transporteCarro.cotacaoManual ? parseFloat(transporteCarro.cotacaoManual) : getCotacaoMoeda(transporteCarro.moeda));
    const totalBRL = custoTotalMoedaLocal * cot;

    return {
      litros: comb.litrosConsumidos,
      custoCombustivel: comb.custoCombustivel,
      desgaste,
      custoTotalMoedaLocal,
      totalBRL,
      cotacaoUsada: cot
    };
  }, [transporteCarro, getCotacaoMoeda]);

  // 3. Hospedagem & Taxas
  const resultadoHospedagem = useMemo(() => {
    const calc = calcularHospedagem({
      diariaBase: simuladorHospedagem.diariaBase,
      noites: simuladorHospedagem.noites,
      cityTaxPorPessoaNoite: simuladorHospedagem.cityTax,
      hospedes: simuladorHospedagem.hospedes,
      resortFeeDiaria: simuladorHospedagem.resortFee,
      salesTaxPerc: simuladorHospedagem.salesTax,
      taxaLimpeza: simuladorHospedagem.limpeza,
      caucaoRetencao: simuladorHospedagem.caucao
    });

    const cot = simuladorHospedagem.moeda === 'BRL' ? 1.0 : (simuladorHospedagem.cotacaoManual ? parseFloat(simuladorHospedagem.cotacaoManual) : getCotacaoMoeda(simuladorHospedagem.moeda));
    const totalBRL = calc.custoTotalEfetivo * cot;
    const caucaoBRL = calc.caucaoRetencao * cot;

    return {
      ...calc,
      totalMoedaLocal: calc.custoTotalEfetivo,
      totalBRL,
      caucaoBRL,
      cotacaoUsada: cot
    };
  }, [simuladorHospedagem, getCotacaoMoeda]);

  // 4. Alimentação & Gorjetas
  const resultadoAlimentacao = useMemo(() => {
    const calc = calcularAlimentacao({
      cafeDaManhaDiario: simuladorAlimentacao.cafe,
      almocoDiario: simuladorAlimentacao.almoco,
      jantarDiario: simuladorAlimentacao.jantar,
      lanchesAguaDiario: simuladorAlimentacao.lanches,
      dias: simuladorAlimentacao.dias,
      pessoas: simuladorAlimentacao.pessoas,
      paisCodigo: simuladorAlimentacao.paisCodigo,
      taxaGorjetaPercentual: simuladorAlimentacao.gorjetaCustom,
      copertoPorPessoa: simuladorAlimentacao.copertoCustom
    });

    const cot = simuladorAlimentacao.moeda === 'BRL' ? 1.0 : (simuladorAlimentacao.cotacaoManual ? parseFloat(simuladorAlimentacao.cotacaoManual) : getCotacaoMoeda(simuladorAlimentacao.moeda));
    const totalBRL = calc.custoTotal * cot;

    return {
      ...calc,
      totalMoedaLocal: calc.custoTotal,
      totalBRL,
      cotacaoUsada: cot
    };
  }, [simuladorAlimentacao, getCotacaoMoeda]);

  // 4. Câmbio
  const cotacaoMoedaAtual = useMemo(() => {
    const code = simuladorCambio.moeda;
    if (simuladorCambio.cotacaoManual) return parseFloat(simuladorCambio.cotacaoManual);
    return cotacoes[code]?.valor || (code === 'USD' ? 5.25 : code === 'EUR' ? 5.80 : 1);
  }, [simuladorCambio, cotacoes]);

  const resultadoCambio = useMemo(() => {
    return calcularConversaoCambial({
      valorMoedaEstrangeira: simuladorCambio.valorMoeda,
      cotacaoComercialOuPtax: cotacaoMoedaAtual,
      modalidade: simuladorCambio.modalidade,
      spreadCustom: simuladorCambio.spreadCustom,
      iofCustom: simuladorCambio.iofCustom
    });
  }, [simuladorCambio, cotacaoMoedaAtual]);

  // Comparações de Câmbio lado a lado
  const comparativoCambio = useMemo(() => {
    const val = simuladorCambio.valorMoeda;
    const cot = cotacaoMoedaAtual;

    const resGlobal = calcularConversaoCambial({
      valorMoedaEstrangeira: val,
      cotacaoComercialOuPtax: cot,
      modalidade: 'global'
    });
    const resCartao = calcularConversaoCambial({
      valorMoedaEstrangeira: val,
      cotacaoComercialOuPtax: cot,
      modalidade: 'cartao_credito'
    });
    const resEspecie = calcularConversaoCambial({
      valorMoedaEstrangeira: val,
      cotacaoComercialOuPtax: cot,
      modalidade: 'especie'
    });

    const economiaContaGlobal = resCartao.valorTotalBRL - resGlobal.valorTotalBRL;

    return { resGlobal, resCartao, resEspecie, economiaContaGlobal };
  }, [simuladorCambio.valorMoeda, cotacaoMoedaAtual]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
        {/* CABEÇALHO & SELEÇÃO DE VIAGEM */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-custom-card p-6 rounded-2xl border border-custom-color shadow-custom">
          <div>
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl flex-shrink-0">
                <Plane className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-custom-main flex items-center gap-2.5">
                  Gestão de Viagens
                  <span className="text-xs px-3 py-1 rounded-full bg-custom-gold/15 text-custom-gold font-bold">
                    Homologação
                  </span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Planejamento orçamentário inteligente, simuladores de transporte, câmbio e taxas culturais.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {viagens.length > 0 && (
              <div className="relative min-w-[220px]">
                <select
                  value={viagemAtivaId}
                  onChange={(e) => setViagemAtivaId(e.target.value)}
                  className="w-full bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl font-semibold text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-custom-gold cursor-pointer transition shadow-xs"
                >
                  {viagens.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.titulo} ({v.destino})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setModalNovaViagem(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-custom-gold text-black rounded-xl font-bold text-sm md:text-base hover:opacity-90 transition shadow-custom cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Nova Viagem
            </button>

            {viagemAtiva && (
              <button
                onClick={() => handleExcluirViagem(viagemAtiva.id)}
                title="Excluir Viagem Selecionada"
                className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer border border-transparent hover:border-red-500/20"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* DETALHES DA VIAGEM SELECIONADA OU EMPTY STATE */}
        {!viagemAtiva ? (
          <div className="bg-custom-card p-12 md:p-16 text-center rounded-2xl border border-custom-color shadow-custom space-y-5">
            <div className="w-20 h-20 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center mx-auto">
              <Compass className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-custom-main">Nenhuma Viagem Planejada Ainda</h2>
            <p className="text-base text-gray-500 dark:text-slate-400 max-w-lg mx-auto">
              Crie seu primeiro roteiro de viagem para calcular custos de combustível, hospedagem com taxas, cotações de câmbio e sincronizar tudo com o seu Meu Bolso!
            </p>
            <button
              onClick={() => setModalNovaViagem(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-custom-gold text-black rounded-xl font-bold text-base shadow-custom hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Começar Meu Primeiro Roteiro
            </button>
          </div>
        ) : (
          <>
            {/* CARDS DE KPIS / RESUMO EXECUTIVO COM PROPORÇÃO EXPANDIDA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
              {/* 1. Total Previsto */}
              <div className="bg-custom-card p-5 md:p-6 rounded-2xl border border-custom-color shadow-custom hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Custo Total Previsto</span>
                  <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-custom-main tracking-tight">
                  {formatCurrency(resumoFinanceiro.totalGeralPrevisto)}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mt-2 font-medium flex items-center gap-1">
                  <span>Itens: {formatCurrency(resumoFinanceiro.subtotalPrevisto)}</span>
                </div>
              </div>

              {/* 2. Efetivado / Pago */}
              <div className="bg-custom-card p-5 md:p-6 rounded-2xl border border-custom-color shadow-custom hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Já Pago / Efetivado</span>
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formatCurrency(resumoFinanceiro.totalPago)}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mt-2 font-medium">
                  {resumoFinanceiro.totalGeralPrevisto > 0
                    ? `${((resumoFinanceiro.totalPago / resumoFinanceiro.totalGeralPrevisto) * 100).toFixed(0)}% do orçamento total`
                    : '0% pago'}
                </div>
              </div>

              {/* 3. Restante a Pagar */}
              <div className="bg-custom-card p-5 md:p-6 rounded-2xl border border-custom-color shadow-custom hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Pendente a Pagar</span>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                  {formatCurrency(resumoFinanceiro.totalPendente)}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mt-2 font-medium">
                  Necessário para quitar a viagem
                </div>
              </div>

              {/* 4. Contingência / Reserva */}
              <div className="bg-custom-card p-5 md:p-6 rounded-2xl border border-custom-color shadow-custom hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Fundo de Reserva</span>
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                  {formatCurrency(resumoFinanceiro.reservaContingencia)}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mt-2 font-medium">
                  {resumoFinanceiro.percentualContingencia}% ({viagemAtiva.perfilRisco} risco)
                </div>
              </div>

              {/* 5. Caução Retido (Informativo) */}
              <div className="bg-custom-card p-5 md:p-6 rounded-2xl border border-custom-color shadow-custom hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Caução em Cartão</span>
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
                  {formatCurrency(resumoFinanceiro.caucaoTotal)}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mt-2 font-medium">
                  Bloqueio temporário (não é custo)
                </div>
              </div>
            </div>

            {/* BARRA DE NAVEGAÇÃO ENTRE ABAS COM PROPORÇÃO EXPANDIDA */}
            <div className="p-1.5 bg-custom-card/90 border border-custom-color rounded-2xl flex items-center gap-2 overflow-x-auto mobile-scroll shadow-sm">
              {[
                { id: 'geral', label: 'Visão Geral & Custos', icone: Layers },
                { id: 'transporte', label: 'Transporte, Aéreo & Bagagens', icone: Plane },
                { id: 'hospedagem', label: 'Hospedagem & Taxas', icone: Home },
                { id: 'alimentacao', label: 'Alimentação & Gorjetas', icone: Utensils },
                { id: 'cambio', label: 'Câmbio & IOF 2026', icone: Banknote },
                { id: 'itens', label: `Orçamento & Sincronização (${viagemAtiva.itens?.length || 0})`, icone: FileCheck }
              ].map(tab => {
                const Icone = tab.icone;
                const ativa = abaAtiva === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAbaAtiva(tab.id)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm md:text-base font-bold transition whitespace-nowrap cursor-pointer ${
                      ativa
                        ? 'bg-custom-gold text-black shadow-custom scale-[1.01]'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 hover:text-custom-main'
                    }`}
                  >
                    <Icone className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* CONTEÚDO DAS ABAS */}

            {/* ABA 1: VISÃO GERAL */}
            {abaAtiva === 'geral' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Detalhes da Viagem */}
                <div className="bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-5">
                  <h3 className="font-extrabold text-xl md:text-2xl text-custom-main flex items-center gap-2.5">
                    <MapPin className="w-6 h-6 text-custom-gold" />
                    {viagemAtiva.titulo}
                  </h3>
                  <div className="space-y-3 text-sm md:text-base">
                    <div className="flex justify-between py-2 border-b border-custom-color">
                      <span className="text-gray-500 dark:text-slate-400 font-medium">Destino:</span>
                      <span className="font-bold text-custom-main">{viagemAtiva.destino}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-custom-color">
                      <span className="text-gray-500 dark:text-slate-400 font-medium">País de Referência:</span>
                      <span className="font-bold text-custom-main">
                        {MATRIZ_GORJETAS[viagemAtiva.paisCodigo]?.nome || viagemAtiva.paisCodigo}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-custom-color">
                      <span className="text-gray-500 dark:text-slate-400 font-medium">Período:</span>
                      <span className="font-bold text-custom-main">
                        {viagemAtiva.dataInicio || 'Início'} até {viagemAtiva.dataFim || 'Fim'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-custom-color">
                      <span className="text-gray-500 dark:text-slate-400 font-medium">Perfil de Contingência:</span>
                      <span className="font-bold text-rose-500">
                        {PERFIS_RISCO[viagemAtiva.perfilRisco]?.label || 'Médio (15%)'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => setModalNovoItem(true)}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl text-sm md:text-base font-bold transition cursor-pointer border border-sky-500/20 shadow-xs"
                    >
                      <Plus className="w-5 h-5" />
                      Lançar Gasto Avulso na Viagem
                    </button>
                  </div>
                </div>

                {/* Composição por Pilar de Custos */}
                <div className="lg:col-span-2 bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-5">
                  <h3 className="font-extrabold text-xl md:text-2xl text-custom-main flex items-center justify-between">
                    <span>Composição Orçamentária por Categoria</span>
                    <span className="text-sm md:text-base font-bold text-custom-gold">
                      Total: {formatCurrency(resumoFinanceiro.totalGeralPrevisto)}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    {PILARES_VIAGEM.map(pilar => {
                      const dadosPilar = resumoFinanceiro.porPilar[pilar.id] || { previsto: 0, pago: 0 };
                      const perc = resumoFinanceiro.totalGeralPrevisto > 0
                        ? (dadosPilar.previsto / resumoFinanceiro.totalGeralPrevisto) * 100
                        : 0;

                      return (
                        <div key={pilar.id} className="space-y-1.5">
                          <div className="flex justify-between text-sm md:text-base">
                            <span className="font-semibold text-custom-main flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pilar.cor }} />
                              {pilar.nome}
                            </span>
                            <span className="font-bold text-gray-700 dark:text-slate-300">
                              {formatCurrency(dadosPilar.previsto)} <span className="text-gray-400 font-normal">({perc.toFixed(1)}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(perc, 100)}%`, backgroundColor: pilar.cor }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Linha da Contingência */}
                    <div className="space-y-1.5 pt-3 border-t border-custom-color">
                      <div className="flex justify-between text-sm md:text-base font-bold text-rose-500">
                        <span className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                          Fundo de Contingência & Imprevistos ({resumoFinanceiro.percentualContingencia}%)
                        </span>
                        <span>{formatCurrency(resumoFinanceiro.reservaContingencia)}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${resumoFinanceiro.totalGeralPrevisto > 0 ? (resumoFinanceiro.reservaContingencia / resumoFinanceiro.totalGeralPrevisto) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: SIMULADOR DE TRANSPORTE & RODAGEM */}
            {abaAtiva === 'transporte' && (
              <div className="space-y-6">
                {/* Switcher de Sub-Abas: Passagens/Aéreo/Bagagens vs Carro */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-custom-card border border-custom-color rounded-2xl w-fit shadow-xs">
                  <button
                    onClick={() => setSubAbaTransporte('passagens')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      subAbaTransporte === 'passagens'
                        ? 'bg-sky-500 text-white shadow-custom'
                        : 'text-gray-600 dark:text-slate-400 hover:text-custom-main hover:bg-gray-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Plane className="w-4 h-4" />
                    Passagens, Aéreo & Bagagens
                  </button>
                  <button
                    onClick={() => setSubAbaTransporte('carro')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      subAbaTransporte === 'carro'
                        ? 'bg-sky-500 text-white shadow-custom'
                        : 'text-gray-600 dark:text-slate-400 hover:text-custom-main hover:bg-gray-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    Mobilidade Terrestre (Carro)
                  </button>
                </div>

                {/* Sub-Aba 1: Passagens, Aéreo & Bagagens */}
                {subAbaTransporte === 'passagens' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl md:text-2xl font-extrabold text-custom-main flex items-center gap-2.5">
                            <Ticket className="w-6 h-6 text-sky-500" />
                            Passagens, Voos & Despacho de Bagagens
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Simulação de bilhetes aéreos, rodoviários ou trens, malas despachadas (23kg) e taxas com suporte a moeda local e conversão em tempo real.
                          </p>
                        </div>

                        {/* Seletor de Moeda */}
                        <div className="flex items-center gap-2 self-start sm:self-auto bg-gray-50 dark:bg-slate-800/80 p-1.5 px-3 rounded-xl border border-custom-color">
                          <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Moeda:</span>
                          <select
                            value={transportePassagens.moeda}
                            onChange={(e) => setTransportePassagens({ ...transportePassagens, moeda: e.target.value })}
                            className="bg-transparent text-custom-main font-bold text-sm focus:outline-none cursor-pointer"
                          >
                            {MOEDAS_DISPONIVEIS.map(m => (
                              <option key={m.code} value={m.code} className="bg-custom-card text-custom-main">
                                {m.code} ({m.simbolo}) - {m.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {transportePassagens.moeda !== 'BRL' && (
                        <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
                          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-medium">
                            <Banknote className="w-4 h-4 text-sky-500" />
                            <span>
                              Cotação comercial ({transportePassagens.moeda}/BRL): <strong>R$ {resultadoPassagens.cotacaoUsada.toFixed(3)}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-gray-500 dark:text-slate-400 text-xs">Ajustar cotação:</label>
                            <input
                              type="number"
                              step="0.001"
                              placeholder={resultadoPassagens.cotacaoUsada.toString()}
                              value={transportePassagens.cotacaoManual || ''}
                              onChange={(e) => setTransportePassagens({ ...transportePassagens, cotacaoManual: e.target.value })}
                              className="w-24 bg-custom-primary text-custom-main px-2 py-1 border border-custom-color rounded-lg text-xs font-bold text-right"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <div className="sm:col-span-2 md:col-span-2">
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Descrição do Trecho / Rota *
                          </label>
                          <input
                            type="text"
                            value={transportePassagens.descricao}
                            onChange={(e) => setTransportePassagens({ ...transportePassagens, descricao: e.target.value })}
                            placeholder="Ex: Passagens Aéreas Ida e Volta SP / Paris"
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Tipo de Transporte
                          </label>
                          <select
                            value={transportePassagens.tipo}
                            onChange={(e) => setTransportePassagens({ ...transportePassagens, tipo: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-xs"
                          >
                            <option value="aereo">✈️ Aéreo (Avião)</option>
                            <option value="trem">🚆 Trem de Alta Velocidade / Ferroviário</option>
                            <option value="onibus">🚌 Ônibus Rodoviário</option>
                            <option value="transfer">🚐 Transfer / Translado Executivo</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Tarifa Base por Passageiro ({formatSimboloMoeda(transportePassagens.moeda)})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={transportePassagens.valorTarifa}
                            onChange={(e) => setTransportePassagens({ ...transportePassagens, valorTarifa: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Quantidade de Passageiros
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={transportePassagens.quantidadePassageiros}
                            onChange={(e) => setTransportePassagens({ ...transportePassagens, quantidadePassageiros: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Taxas de Embarque / Aeroporto ({formatSimboloMoeda(transportePassagens.moeda)})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={transportePassagens.taxasEmbarque}
                            onChange={(e) => setTransportePassagens({ ...transportePassagens, taxasEmbarque: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>

                        {/* Bloco Destaque Bagagens Despachadas */}
                        <div className="sm:col-span-2 md:col-span-2 p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/50 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-sm">
                            <Luggage className="w-4 h-4 text-sky-500" />
                            <span>Despacho de Bagagens (Malas 23kg)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                                Qtd Total de Malas Despachadas
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={transportePassagens.quantidadeMalasDespachadas}
                                onChange={(e) => setTransportePassagens({ ...transportePassagens, quantidadeMalasDespachadas: e.target.value })}
                                className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                                Valor por Mala ({formatSimboloMoeda(transportePassagens.moeda)})
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={transportePassagens.valorPorMala}
                                onChange={(e) => setTransportePassagens({ ...transportePassagens, valorPorMala: e.target.value })}
                                className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Assentos Conforto / Extras ({formatSimboloMoeda(transportePassagens.moeda)})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={transportePassagens.assentosConforto}
                            onChange={(e) => setTransportePassagens({ ...transportePassagens, assentosConforto: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resumo Passagens & Bagagens */}
                    <div className="bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="font-extrabold text-lg md:text-xl text-custom-main flex items-center gap-2">
                          <Plane className="w-5 h-5 text-sky-500" />
                          Resumo de Transporte Aéreo
                        </h4>
                        <div className="space-y-2.5 text-sm md:text-base">
                          <div className="flex justify-between py-1.5 border-b border-custom-color">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">
                              Tarifas ({transportePassagens.quantidadePassageiros} pass.):
                            </span>
                            <span className="font-bold text-custom-main">
                              {formatSimboloMoeda(transportePassagens.moeda)} {resultadoPassagens.totalTarifas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="flex justify-between py-1.5 border-b border-custom-color">
                            <span className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                              <Luggage className="w-4 h-4 text-sky-500" />
                              Bagagens ({transportePassagens.quantidadeMalasDespachadas} malas):
                            </span>
                            <span className="font-bold text-custom-main">
                              {formatSimboloMoeda(transportePassagens.moeda)} {resultadoPassagens.totalBagagens.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="flex justify-between py-1.5 border-b border-custom-color">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Taxas e Assentos:</span>
                            <span className="font-bold text-custom-main">
                              {formatSimboloMoeda(transportePassagens.moeda)} {(resultadoPassagens.totalTaxas + resultadoPassagens.totalAssentos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {transportePassagens.moeda !== 'BRL' && (
                            <div className="flex justify-between py-1.5 border-b border-custom-color text-sky-600 dark:text-sky-400 font-bold">
                              <span>Total em {transportePassagens.moeda}:</span>
                              <span>
                                {formatSimboloMoeda(transportePassagens.moeda)} {resultadoPassagens.subtotalMoedaLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between py-2.5 text-base md:text-lg font-extrabold text-sky-600 dark:text-sky-400">
                            <span>Total em Reais (BRL):</span>
                            <span>{formatCurrency(resultadoPassagens.totalBRL)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => adicionarItemNaViagem({
                          pilar: 'transporte',
                          descricao: `${transportePassagens.descricao} (${transportePassagens.quantidadePassageiros} pass. / ${transportePassagens.quantidadeMalasDespachadas} malas)`,
                          valorPrevisto: resultadoPassagens.totalBRL,
                          valorMoedaOriginal: resultadoPassagens.subtotalMoedaLocal,
                          moeda: transportePassagens.moeda,
                          cotacaoUtilizada: resultadoPassagens.cotacaoUsada,
                          observacoes: `${transportePassagens.quantidadePassageiros} passageiro(s) + ${transportePassagens.quantidadeMalasDespachadas} mala(s) despachada(s)${transportePassagens.moeda !== 'BRL' ? ` (${resultadoPassagens.subtotalMoedaLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${transportePassagens.moeda} @ R$ ${resultadoPassagens.cotacaoUsada.toFixed(3)})` : ''}`
                        })}
                        className="w-full py-3.5 px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm md:text-base font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Adicionar Passagens ao Orçamento
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Aba 2: Mobilidade Terrestre (Carro) */}
                {subAbaTransporte === 'carro' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl md:text-2xl font-extrabold text-custom-main flex items-center gap-2.5">
                            <Car className="w-6 h-6 text-sky-500" />
                            Módulo de Mobilidade e Transporte Terrestre (Carro)
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Fórmula com Fator Operacional (Fop: relevo/ar-condicionado) e desgaste mecânico por quilômetro rodado (Ckm).
                          </p>
                        </div>

                        {/* Seletor de Moeda para Carro */}
                        <div className="flex items-center gap-2 self-start sm:self-auto bg-gray-50 dark:bg-slate-800/80 p-1.5 px-3 rounded-xl border border-custom-color">
                          <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Moeda:</span>
                          <select
                            value={transporteCarro.moeda}
                            onChange={(e) => setTransporteCarro({ ...transporteCarro, moeda: e.target.value })}
                            className="bg-transparent text-custom-main font-bold text-sm focus:outline-none cursor-pointer"
                          >
                            {MOEDAS_DISPONIVEIS.map(m => (
                              <option key={m.code} value={m.code} className="bg-custom-card text-custom-main">
                                {m.code} ({m.simbolo}) - {m.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {transporteCarro.moeda !== 'BRL' && (
                        <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 rounded-xl flex items-center justify-between text-xs md:text-sm">
                          <span className="text-sky-700 dark:text-sky-300 font-medium">
                            Cotação utilizada: 1 {transporteCarro.moeda} = <strong>R$ {resultadoCarro.cotacaoUsada.toFixed(3)}</strong>
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Distância Total (Ida + Volta km)
                          </label>
                          <input
                            type="number"
                            value={transporteCarro.distanciaKm}
                            onChange={(e) => setTransporteCarro({ ...transporteCarro, distanciaKm: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Consumo Médio (km/litro)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={transporteCarro.consumoKmL}
                            onChange={(e) => setTransporteCarro({ ...transporteCarro, consumoKmL: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Preço do Litro ({formatSimboloMoeda(transporteCarro.moeda)})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={transporteCarro.precoLitro}
                            onChange={(e) => setTransporteCarro({ ...transporteCarro, precoLitro: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Fator Operacional (Fop)
                          </label>
                          <select
                            value={transporteCarro.fatorOp}
                            onChange={(e) => setTransporteCarro({ ...transporteCarro, fatorOp: parseFloat(e.target.value) })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-xs"
                          >
                            <option value="1.0">1.00 - Estrada plana / ar desligado</option>
                            <option value="1.1">1.10 - Relevo ondulado ou ar-condicionado (+10%)</option>
                            <option value="1.2">1.20 - Serra / trânsito pesado / carro lotado (+20%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Total de Pedágios ({formatSimboloMoeda(transporteCarro.moeda)})
                          </label>
                          <input
                            type="number"
                            value={transporteCarro.pedagios}
                            onChange={(e) => setTransporteCarro({ ...transporteCarro, pedagios: e.target.value })}
                            className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                            Estacionamento (Diárias x Diária)
                          </label>
                          <div className="flex gap-2 mt-1.5">
                            <input
                              type="number"
                              placeholder="Diárias"
                              value={transporteCarro.diariasEstacionamento}
                              onChange={(e) => setTransporteCarro({ ...transporteCarro, diariasEstacionamento: e.target.value })}
                              className="w-1/2 bg-custom-primary text-custom-main px-3 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold shadow-xs"
                            />
                            <input
                              type="number"
                              placeholder={`${formatSimboloMoeda(transporteCarro.moeda)}/dia`}
                              value={transporteCarro.tarifaEstacionamento}
                              onChange={(e) => setTransporteCarro({ ...transporteCarro, tarifaEstacionamento: e.target.value })}
                              className="w-1/2 bg-custom-primary text-custom-main px-3 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold shadow-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Opção de desgaste mecânico */}
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-custom-color">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="checkDesgaste"
                            checked={transporteCarro.incluirDesgaste}
                            onChange={(e) => setTransporteCarro({ ...transporteCarro, incluirDesgaste: e.target.checked })}
                            className="w-5 h-5 rounded text-sky-500 cursor-pointer"
                          />
                          <label htmlFor="checkDesgaste" className="text-sm font-medium text-custom-main cursor-pointer select-none">
                            Calcular Desgaste Mecânico e Manutenção Proporcional ({formatSimboloMoeda(transporteCarro.moeda)} 0,24/km)
                          </label>
                        </div>
                        <span className="text-sm font-bold text-gray-600 dark:text-slate-300">
                          {formatSimboloMoeda(transporteCarro.moeda)} {resultadoCarro.desgaste.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Resumo do Cálculo de Transporte */}
                    <div className="bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="font-extrabold text-lg md:text-xl text-custom-main">Resumo de Rodagem</h4>
                        <div className="space-y-2.5 text-sm md:text-base">
                          <div className="flex justify-between py-1.5 border-b border-custom-color">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Combustível Estimado:</span>
                            <span className="font-bold text-custom-main">
                              {resultadoCarro.litros} L ({formatSimboloMoeda(transporteCarro.moeda)} {resultadoCarro.custoCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-custom-color">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Pedágios:</span>
                            <span className="font-bold text-custom-main">
                              {formatSimboloMoeda(transporteCarro.moeda)} {Number(transporteCarro.pedagios || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-custom-color">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Estacionamentos:</span>
                            <span className="font-bold text-custom-main">
                              {formatSimboloMoeda(transporteCarro.moeda)} {(Number(transporteCarro.diariasEstacionamento || 0) * Number(transporteCarro.tarifaEstacionamento || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          {transporteCarro.incluirDesgaste && (
                            <div className="flex justify-between py-1.5 border-b border-custom-color">
                              <span className="text-gray-500 dark:text-slate-400 font-medium">Desgaste Mecânico:</span>
                              <span className="font-bold text-custom-main">
                                {formatSimboloMoeda(transporteCarro.moeda)} {resultadoCarro.desgaste.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          {transporteCarro.moeda !== 'BRL' && (
                            <div className="flex justify-between py-1.5 border-b border-custom-color text-sky-600 dark:text-sky-400 font-bold">
                              <span>Total em {transporteCarro.moeda}:</span>
                              <span>
                                {formatSimboloMoeda(transporteCarro.moeda)} {resultadoCarro.custoTotalMoedaLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between py-2.5 text-base md:text-lg font-extrabold text-sky-600 dark:text-sky-400">
                            <span>Custo Total em Reais:</span>
                            <span>{formatCurrency(resultadoCarro.totalBRL)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => adicionarItemNaViagem({
                          pilar: 'transporte',
                          descricao: `Deslocamento de Carro (${transporteCarro.distanciaKm} km)`,
                          valorPrevisto: resultadoCarro.totalBRL,
                          valorMoedaOriginal: resultadoCarro.custoTotalMoedaLocal,
                          moeda: transporteCarro.moeda,
                          cotacaoUtilizada: resultadoCarro.cotacaoUsada,
                          observacoes: `${resultadoCarro.litros}L de combustível + ${formatSimboloMoeda(transporteCarro.moeda)} ${transporteCarro.pedagios} pedágio${transporteCarro.moeda !== 'BRL' ? ` (${resultadoCarro.custoTotalMoedaLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${transporteCarro.moeda} @ R$ ${resultadoCarro.cotacaoUsada.toFixed(3)})` : ''}`
                        })}
                        className="w-full py-3.5 px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm md:text-base font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Adicionar ao Orçamento da Viagem
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA 3: SIMULADOR DE HOSPEDAGEM */}
            {abaAtiva === 'hospedagem' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-custom-main flex items-center gap-2.5">
                        <Home className="w-6 h-6 text-amber-500" />
                        Módulo de Hospedagem e Taxas Ocultas
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Calcula diárias totais, taxas de turismo municipais (City Tax por hóspede), resort fees com impostos e caução em qualquer moeda.
                      </p>
                    </div>

                    {/* Seletor de Moeda para Hospedagem */}
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-gray-50 dark:bg-slate-800/80 p-1.5 px-3 rounded-xl border border-custom-color">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Moeda:</span>
                      <select
                        value={simuladorHospedagem.moeda}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, moeda: e.target.value })}
                        className="bg-transparent text-custom-main font-bold text-sm focus:outline-none cursor-pointer"
                      >
                        {MOEDAS_DISPONIVEIS.map(m => (
                          <option key={m.code} value={m.code} className="bg-custom-card text-custom-main">
                            {m.code} ({m.simbolo}) - {m.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {simuladorHospedagem.moeda !== 'BRL' && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
                        <Banknote className="w-4 h-4 text-amber-500" />
                        <span>
                          Cotação ({simuladorHospedagem.moeda}/BRL): <strong>R$ {resultadoHospedagem.cotacaoUsada.toFixed(3)}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-500 dark:text-slate-400 text-xs">Ajustar cotação:</label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder={resultadoHospedagem.cotacaoUsada.toString()}
                          value={simuladorHospedagem.cotacaoManual || ''}
                          onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, cotacaoManual: e.target.value })}
                          className="w-24 bg-custom-primary text-custom-main px-2 py-1 border border-custom-color rounded-lg text-xs font-bold text-right"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Nome da Hospedagem / Hotel
                      </label>
                      <input
                        type="text"
                        value={simuladorHospedagem.nomeLocal}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, nomeLocal: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Diária Base ({formatSimboloMoeda(simuladorHospedagem.moeda)})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorHospedagem.diariaBase}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, diariaBase: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Número de Noites
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.noites}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, noites: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Quantidade de Hóspedes
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.hospedes}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, hospedes: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        City Tax (por pessoa/noite) ({formatSimboloMoeda(simuladorHospedagem.moeda)})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorHospedagem.cityTax}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, cityTax: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Resort Fee Diária ({formatSimboloMoeda(simuladorHospedagem.moeda)})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorHospedagem.resortFee}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, resortFee: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Taxa de Limpeza Única ({formatSimboloMoeda(simuladorHospedagem.moeda)})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorHospedagem.limpeza}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, limpeza: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Caução / Bloqueio no Cartão ({formatSimboloMoeda(simuladorHospedagem.moeda)})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorHospedagem.caucao}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, caucao: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        * O caução não é somado ao custo final, apenas registrado como alerta de bloqueio temporário de limite no cartão.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resumo Hospedagem */}
                <div className="bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-lg md:text-xl text-custom-main">Resumo da Estadia</h4>
                    <div className="space-y-2.5 text-sm md:text-base">
                      <div className="flex justify-between py-1.5 border-b border-custom-color">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">Diárias Base ({simuladorHospedagem.noites} noites):</span>
                        <span className="font-bold text-custom-main">
                          {formatSimboloMoeda(simuladorHospedagem.moeda)} {resultadoHospedagem.totalDiarias.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-custom-color">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">Taxas Municipais (City Tax):</span>
                        <span className="font-bold text-custom-main">
                          {formatSimboloMoeda(simuladorHospedagem.moeda)} {resultadoHospedagem.totalCityTax.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-custom-color">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">Resort Fees:</span>
                        <span className="font-bold text-custom-main">
                          {formatSimboloMoeda(simuladorHospedagem.moeda)} {resultadoHospedagem.totalResortFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-custom-color">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">Taxa de Limpeza:</span>
                        <span className="font-bold text-custom-main">
                          {formatSimboloMoeda(simuladorHospedagem.moeda)} {resultadoHospedagem.taxaLimpeza.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {simuladorHospedagem.moeda !== 'BRL' && (
                        <div className="flex justify-between py-1.5 border-b border-custom-color text-amber-600 dark:text-amber-400 font-bold">
                          <span>Total em {simuladorHospedagem.moeda}:</span>
                          <span>
                            {formatSimboloMoeda(simuladorHospedagem.moeda)} {resultadoHospedagem.totalMoedaLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2.5 text-base md:text-lg font-extrabold text-amber-600 dark:text-amber-400">
                        <span>Custo Total Efetivo:</span>
                        <span>{formatCurrency(resultadoHospedagem.totalBRL)}</span>
                      </div>
                      {resultadoHospedagem.caucaoRetencao > 0 && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl text-orange-600 dark:text-orange-400 text-xs md:text-sm font-semibold">
                          ⚠️ Bloqueio temporário no cartão: <strong>{formatSimboloMoeda(simuladorHospedagem.moeda)} {resultadoHospedagem.caucaoRetencao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simuladorHospedagem.moeda !== 'BRL' ? ` (${formatCurrency(resultadoHospedagem.caucaoBRL)})` : ''}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => adicionarItemNaViagem({
                      pilar: 'hospedagem',
                      descricao: `${simuladorHospedagem.nomeLocal} (${simuladorHospedagem.noites} noites)`,
                      valorPrevisto: resultadoHospedagem.totalBRL,
                      valorMoedaOriginal: resultadoHospedagem.totalMoedaLocal,
                      moeda: simuladorHospedagem.moeda,
                      cotacaoUtilizada: resultadoHospedagem.cotacaoUsada,
                      caucao: resultadoHospedagem.caucaoBRL,
                      observacoes: `Diárias + Taxas${simuladorHospedagem.moeda !== 'BRL' ? ` (${resultadoHospedagem.totalMoedaLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${simuladorHospedagem.moeda} @ R$ ${resultadoHospedagem.cotacaoUsada.toFixed(3)})` : ''}${resultadoHospedagem.caucaoBRL > 0 ? ` (Caução: ${formatCurrency(resultadoHospedagem.caucaoBRL)})` : ''}`
                    })}
                    className="w-full py-3.5 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm md:text-base font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Hospedagem ao Orçamento
                  </button>
                </div>
              </div>
            )}

            {/* ABA 4: SIMULADOR DE ALIMENTAÇÃO */}
            {abaAtiva === 'alimentacao' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-custom-main flex items-center gap-2.5">
                        <Utensils className="w-6 h-6 text-emerald-500" />
                        Módulo de Alimentação e Matriz Cultural de Gorjetas
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Aplica as regras culturais de gorjetas (ex: 20% EUA, Coperto Itália, proibido no Japão) com cálculo em moeda local e conversão em reais.
                      </p>
                    </div>

                    {/* Seletor de Moeda para Alimentação */}
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-gray-50 dark:bg-slate-800/80 p-1.5 px-3 rounded-xl border border-custom-color">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Moeda:</span>
                      <select
                        value={simuladorAlimentacao.moeda}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, moeda: e.target.value })}
                        className="bg-transparent text-custom-main font-bold text-sm focus:outline-none cursor-pointer"
                      >
                        {MOEDAS_DISPONIVEIS.map(m => (
                          <option key={m.code} value={m.code} className="bg-custom-card text-custom-main">
                            {m.code} ({m.simbolo}) - {m.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {simuladorAlimentacao.moeda !== 'BRL' && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                        <Banknote className="w-4 h-4 text-emerald-500" />
                        <span>
                          Cotação ({simuladorAlimentacao.moeda}/BRL): <strong>R$ {resultadoAlimentacao.cotacaoUsada.toFixed(3)}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-500 dark:text-slate-400 text-xs">Ajustar cotação:</label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder={resultadoAlimentacao.cotacaoUsada.toString()}
                          value={simuladorAlimentacao.cotacaoManual || ''}
                          onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, cotacaoManual: e.target.value })}
                          className="w-24 bg-custom-primary text-custom-main px-2 py-1 border border-custom-color rounded-lg text-xs font-bold text-right"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        País / Região Cultural
                      </label>
                      <select
                        value={simuladorAlimentacao.paisCodigo}
                        onChange={(e) => {
                          const novoPais = e.target.value;
                          const moedaPadrao = MATRIZ_GORJETAS[novoPais]?.moedaPadrao || 'BRL';
                          setSimuladorAlimentacao({
                            ...simuladorAlimentacao,
                            paisCodigo: novoPais,
                            moeda: moedaPadrao
                          });
                        }}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
                      >
                        {Object.values(MATRIZ_GORJETAS).map(pais => (
                          <option key={pais.codigo} value={pais.codigo}>
                            {pais.nome} (Gorjeta padrão: {pais.gorjetaPadrao}%{pais.coperto > 0 ? ` + Coperto € ${pais.coperto}` : ''})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1.5">
                        ℹ️ {MATRIZ_GORJETAS[simuladorAlimentacao.paisCodigo]?.descricao}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Café da Manhã ({formatSimboloMoeda(simuladorAlimentacao.moeda)}/pessoa/dia)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorAlimentacao.cafe}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, cafe: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Almoço Médio ({formatSimboloMoeda(simuladorAlimentacao.moeda)}/pessoa/dia)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorAlimentacao.almoco}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, almoco: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Jantar Médio ({formatSimboloMoeda(simuladorAlimentacao.moeda)}/pessoa/dia)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorAlimentacao.jantar}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, jantar: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Água / Lanches / Cafés ({formatSimboloMoeda(simuladorAlimentacao.moeda)}/dia)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simuladorAlimentacao.lanches}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, lanches: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Total de Dias
                      </label>
                      <input
                        type="number"
                        value={simuladorAlimentacao.dias}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, dias: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Número de Pessoas
                      </label>
                      <input
                        type="number"
                        value={simuladorAlimentacao.pessoas}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, pessoas: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo Alimentação */}
                <div className="bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-lg md:text-xl text-custom-main">Orçamento de Alimentação</h4>
                    <div className="space-y-2.5 text-sm md:text-base">
                      <div className="flex justify-between py-1.5 border-b border-custom-color">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">Base por Pessoa/Dia:</span>
                        <span className="font-bold text-custom-main">
                          {formatSimboloMoeda(simuladorAlimentacao.moeda)} {resultadoAlimentacao.basePorPessoaDia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-custom-color">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">Gorjeta Aplicada:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {resultadoAlimentacao.taxaGorjetaAplicada}%
                        </span>
                      </div>
                      {resultadoAlimentacao.copertoAplicado > 0 && (
                        <div className="flex justify-between py-1.5 border-b border-custom-color">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">Coperto Italiano:</span>
                          <span className="font-bold text-custom-main">
                            € {resultadoAlimentacao.copertoAplicado} / pessoa
                          </span>
                        </div>
                      )}
                      {simuladorAlimentacao.moeda !== 'BRL' && (
                        <div className="flex justify-between py-1.5 border-b border-custom-color text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>Total em {simuladorAlimentacao.moeda}:</span>
                          <span>
                            {formatSimboloMoeda(simuladorAlimentacao.moeda)} {resultadoAlimentacao.totalMoedaLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2.5 text-base md:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        <span>Total em Reais:</span>
                        <span>{formatCurrency(resultadoAlimentacao.totalBRL)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => adicionarItemNaViagem({
                      pilar: 'alimentacao',
                      descricao: `Alimentação Completa (${simuladorAlimentacao.dias} dias - ${MATRIZ_GORJETAS[simuladorAlimentacao.paisCodigo]?.nome})`,
                      valorPrevisto: resultadoAlimentacao.totalBRL,
                      valorMoedaOriginal: resultadoAlimentacao.totalMoedaLocal,
                      moeda: simuladorAlimentacao.moeda,
                      cotacaoUtilizada: resultadoAlimentacao.cotacaoUsada,
                      observacoes: `Inclui gorjeta de ${resultadoAlimentacao.taxaGorjetaAplicada}% (${simuladorAlimentacao.pessoas} pessoas)${simuladorAlimentacao.moeda !== 'BRL' ? ` (${resultadoAlimentacao.totalMoedaLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${simuladorAlimentacao.moeda} @ R$ ${resultadoAlimentacao.cotacaoUsada.toFixed(3)})` : ''}`
                    })}
                    className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm md:text-base font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Alimentação ao Orçamento
                  </button>
                </div>
              </div>
            )}

            {/* ABA 5: SIMULADOR DE CÂMBIO & IOF 2026 */}
            {abaAtiva === 'cambio' && (
              <div className="space-y-6">
                <div className="bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-custom-main flex items-center gap-2.5">
                        <Banknote className="w-6 h-6 text-pink-500" />
                        Módulo Cambial e Tributário (Transações Internacionais)
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Cotação pública gratuita em tempo real via AwesomeAPI / Banco Central. Cálculo exato de IOF 2026 (2,38% no cartão vs 1,1% na conta global).
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => carregarCotacoes(true)}
                        disabled={carregandoCambio}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-custom-primary hover:bg-gray-100 dark:hover:bg-slate-800 border border-custom-color rounded-xl text-xs md:text-sm font-bold text-custom-main transition cursor-pointer shadow-xs"
                      >
                        <RefreshCw className={`w-4 h-4 ${carregandoCambio ? 'animate-spin' : ''}`} />
                        Atualizar Agora ({fonteCambio || 'API'})
                      </button>
                      {horaUltimaCotacao && (
                        <span className="text-xs text-gray-400">
                          🕒 Atualizado às {horaUltimaCotacao} (automático a cada 1h)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cards de Cotações Rápidas */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                    {['USD', 'EUR', 'GBP', 'CAD', 'ARS', 'JPY'].map(code => {
                      const cot = cotacoes[code];
                      const selecionada = simuladorCambio.moeda === code;
                      return (
                        <div
                          key={code}
                          onClick={() => setSimuladorCambio({ ...simuladorCambio, moeda: code, cotacaoManual: null })}
                          className={`p-3.5 rounded-xl border text-center cursor-pointer transition ${
                            selecionada
                              ? 'border-custom-gold bg-custom-gold/10 shadow-sm'
                              : 'border-custom-color hover:bg-gray-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="text-xs font-bold text-gray-500">{code}/BRL</div>
                          <div className="text-lg font-black text-custom-main mt-1">
                            R$ {cot ? cot.valor.toFixed(2) : '--'}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">{cot?.nome || code}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Comparativo de Modalidades */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                    {/* Conta Global */}
                    <div className="p-5 md:p-6 rounded-2xl border border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm md:text-base text-emerald-600 dark:text-emerald-400">
                          Conta Global (Wise / Nomad)
                        </span>
                        <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded-full border border-emerald-500/20">
                          Mais Econômico
                        </span>
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-custom-main tracking-tight">
                        {formatCurrency(comparativoCambio.resGlobal.valorTotalBRL)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-slate-400 space-y-1.5">
                        <div>• IOF: <strong>1,10%</strong> ({formatCurrency(comparativoCambio.resGlobal.valorIofReais)})</div>
                        <div>• Spread Médio: <strong>1,50%</strong> ({formatCurrency(comparativoCambio.resGlobal.valorSpreadReais)})</div>
                        <div>• Cotação: Comercial em tempo real</div>
                      </div>
                    </div>

                    {/* Cartão de Crédito Tradicional */}
                    <div className="p-5 md:p-6 rounded-2xl border border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm md:text-base text-rose-600 dark:text-rose-400">
                          Cartão de Crédito (Banco BR)
                        </span>
                        <span className="text-xs px-2.5 py-0.5 bg-rose-500/10 text-rose-600 font-bold rounded-full border border-rose-500/20">
                          IOF 2026: 2,38%
                        </span>
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-custom-main tracking-tight">
                        {formatCurrency(comparativoCambio.resCartao.valorTotalBRL)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-slate-400 space-y-1.5">
                        <div>• IOF 2026: <strong>2,38%</strong> ({formatCurrency(comparativoCambio.resCartao.valorIofReais)})</div>
                        <div>• Spread Emissor: <strong>5,00%</strong> ({formatCurrency(comparativoCambio.resCartao.valorSpreadReais)})</div>
                        <div>• Cotação PTAX emissora</div>
                      </div>
                    </div>

                    {/* Espécie */}
                    <div className="p-5 md:p-6 rounded-2xl border border-custom-color bg-custom-primary space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm md:text-base text-custom-main">
                          Dinheiro em Espécie
                        </span>
                        <span className="text-xs px-2.5 py-0.5 bg-gray-500/10 text-gray-600 dark:text-slate-300 font-bold rounded-full border border-gray-500/20">
                          Turismo
                        </span>
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-custom-main tracking-tight">
                        {formatCurrency(comparativoCambio.resEspecie.valorTotalBRL)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-slate-400 space-y-1.5">
                        <div>• IOF: <strong>1,10%</strong> ({formatCurrency(comparativoCambio.resEspecie.valorIofReais)})</div>
                        <div>• Spread embutido no câmbio turismo</div>
                        <div>• Risco de segurança física</div>
                      </div>
                    </div>
                  </div>

                  {/* Destaque da Economia */}
                  {comparativoCambio.economiaContaGlobal > 0 && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400">
                      <span>💡 Economia estimada usando Conta Global em vez de Cartão Tradicional:</span>
                      <span className="text-lg md:text-xl font-extrabold">{formatCurrency(comparativoCambio.economiaContaGlobal)}</span>
                    </div>
                  )}

                  {/* Inputs de Simulação Manual */}
                  <div className="pt-3 border-t border-custom-color grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Valor em Moeda Estrangeira ({simuladorCambio.moeda})
                      </label>
                      <input
                        type="number"
                        value={simuladorCambio.valorMoeda}
                        onChange={(e) => setSimuladorCambio({ ...simuladorCambio, valorMoeda: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-bold text-gray-700 dark:text-slate-300">
                        Cotação Usada (Editar manualmente se desejar)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={cotacaoMoedaAtual}
                        onChange={(e) => setSimuladorCambio({ ...simuladorCambio, cotacaoManual: e.target.value })}
                        className="w-full mt-1.5 bg-custom-primary text-custom-main px-4 py-2.5 border border-custom-color rounded-xl text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-xs"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => adicionarItemNaViagem({
                          pilar: 'cambio_taxas',
                          descricao: `Câmbio / Conversão (${simuladorCambio.valorMoeda} ${simuladorCambio.moeda})`,
                          valorPrevisto: resultadoCambio.valorTotalBRL,
                          moeda: simuladorCambio.moeda,
                          observacoes: `Cotação: R$ ${cotacaoMoedaAtual} (Modalidade: ${MODALIDADES_CAMBIO[simuladorCambio.modalidade]?.nome})`
                        })}
                        className="w-full py-3 px-5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm md:text-base font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Adicionar Câmbio ao Orçamento
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 6: PLANILHA DE ITENS & SINCRONIZAÇÃO COM MEU BOLSO */}
            {abaAtiva === 'itens' && (
              <div className="bg-custom-card p-6 md:p-7 rounded-2xl border border-custom-color shadow-custom space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-custom-main flex items-center gap-2.5">
                      <FileCheck className="w-6 h-6 text-custom-gold" />
                      Planilha de Gastos Orçados & Efetivados
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      Ao marcar como <strong className="text-emerald-500 font-semibold">Pago</strong>, o gasto entra automaticamente no seu DRE e Despesas. Ao voltar para <strong className="text-amber-500 font-semibold">Pendente</strong>, ele é retirado imediatamente.
                    </p>
                  </div>

                  <button
                    onClick={() => setModalNovoItem(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-custom-gold text-black rounded-xl text-sm md:text-base font-bold shadow-custom hover:opacity-90 transition cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Item ao Orçamento
                  </button>
                </div>

                {(!viagemAtiva.itens || viagemAtiva.itens.length === 0) ? (
                  <div className="py-16 text-center text-gray-400 text-base">
                    Nenhum item adicionado ainda. Utilize os simuladores acima ou adicione itens manualmente!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm md:text-base">
                      <thead>
                        <tr className="border-b border-custom-color text-xs md:text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="py-3.5 px-3">Status</th>
                          <th className="py-3.5 px-3">Categoria</th>
                          <th className="py-3.5 px-3">Descrição</th>
                          <th className="py-3.5 px-3 text-right">Valor Previsto</th>
                          <th className="py-3.5 px-3 text-right">Valor Efetivado</th>
                          <th className="py-3.5 px-3 text-center">Integração DRE / Despesas</th>
                          <th className="py-3.5 px-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-custom-color">
                        {viagemAtiva.itens.map(item => {
                          const pilarObj = PILARES_VIAGEM.find(p => p.id === item.pilar);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-3">
                                <button
                                  onClick={() => handleTogglePago(item.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-bold transition cursor-pointer ${
                                    item.pago
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {item.pago ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" />
                                      Pago
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-4 h-4" />
                                      Pendente
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3.5 px-3">
                                <span
                                  className="text-xs md:text-sm px-3 py-1 rounded-lg font-semibold text-white shadow-xs inline-block"
                                  style={{ backgroundColor: pilarObj?.cor || '#0EA5E9' }}
                                >
                                  {pilarObj?.nome || item.pilar}
                                </span>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="font-bold text-custom-main">{item.descricao}</div>
                                {item.observacoes && (
                                  <div className="text-xs text-gray-400 mt-0.5">{item.observacoes}</div>
                                )}
                              </td>

                              <td className="py-3.5 px-3 text-right font-medium text-gray-600 dark:text-slate-300">
                                <div>{formatCurrency(item.valorPrevisto)}</div>
                                {item.moeda && item.moeda !== 'BRL' && item.valorMoedaOriginal !== null && item.valorMoedaOriginal !== undefined && (
                                  <div className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                                    {formatSimboloMoeda(item.moeda)} {Number(item.valorMoedaOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    {item.cotacaoUtilizada ? ` (cot. R$ ${Number(item.cotacaoUtilizada).toFixed(2)})` : ''}
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-3 text-right font-bold text-custom-main">
                                {item.pago ? (
                                  <div>
                                    <div>{formatCurrency(item.valorPago || item.valorPrevisto)}</div>
                                    {item.moeda && item.moeda !== 'BRL' && (
                                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                        {formatSimboloMoeda(item.moeda)} {Number(item.valorPagoMoedaOriginal || item.valorMoedaOriginal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    )}
                                  </div>
                                ) : '--'}
                              </td>

                              <td className="py-3.5 px-3 text-center">
                                {item.pago ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    <Check className="w-4 h-4" />
                                    Ativo no DRE & Despesas
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-medium text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                                    <Clock className="w-3.5 h-3.5" />
                                    Fora do DRE (Pendente)
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-3 text-center">
                                <button
                                  onClick={() => handleRemoverItem(item.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                                  title="Remover Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* MODAL NOVA VIAGEM */}
        {modalNovaViagem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-custom-card border border-custom-color rounded-custom p-6 w-full max-w-lg shadow-custom space-y-4">
              <div className="flex items-center justify-between border-b border-custom-color pb-3">
                <h3 className="font-bold text-lg text-custom-main flex items-center gap-2">
                  <Plane className="w-5 h-5 text-custom-gold" />
                  Cadastrar Novo Roteiro de Viagem
                </h3>
                <button
                  onClick={() => setModalNovaViagem(false)}
                  className="text-gray-400 hover:text-custom-main font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCriarViagem} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                    Título da Viagem (ex: Férias em Família 2026) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formViagem.titulo}
                    onChange={(e) => setFormViagem({ ...formViagem, titulo: e.target.value })}
                    className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                    placeholder="Ex: Eurotrip 2026"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Cidade / Destino Principal
                    </label>
                    <input
                      type="text"
                      value={formViagem.destino}
                      onChange={(e) => setFormViagem({ ...formViagem, destino: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm"
                      placeholder="Ex: Paris / Roma"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      País (para gorjetas e taxas)
                    </label>
                    <select
                      value={formViagem.paisCodigo}
                      onChange={(e) => setFormViagem({ ...formViagem, paisCodigo: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                    >
                      {Object.values(MATRIZ_GORJETAS).map(p => (
                        <option key={p.codigo} value={p.codigo}>{p.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Data de Partida
                    </label>
                    <input
                      type="date"
                      value={formViagem.dataInicio}
                      onChange={(e) => setFormViagem({ ...formViagem, dataInicio: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Data de Retorno
                    </label>
                    <input
                      type="date"
                      value={formViagem.dataFim}
                      onChange={(e) => setFormViagem({ ...formViagem, dataFim: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Perfil de Contingência / Risco
                    </label>
                    <select
                      value={formViagem.perfilRisco}
                      onChange={(e) => setFormViagem({ ...formViagem, perfilRisco: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                    >
                      {Object.values(PERFIS_RISCO).map(r => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Moeda Principal
                    </label>
                    <select
                      value={formViagem.moedaPrincipal}
                      onChange={(e) => setFormViagem({ ...formViagem, moedaPrincipal: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                    >
                      <option value="BRL">Real (BRL)</option>
                      <option value="USD">Dólar Americano (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">Libra Esterlina (GBP)</option>
                      <option value="ARS">Peso Argentino (ARS)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-custom-color">
                  <button
                    type="button"
                    onClick={() => setModalNovaViagem(false)}
                    className="px-4 py-2 border border-custom-color text-custom-main rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-custom-gold text-black rounded-lg text-sm font-bold shadow-custom hover:opacity-90 transition"
                  >
                    Criar Roteiro
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL NOVO ITEM MANUAL */}
        {modalNovoItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-custom-card border border-custom-color rounded-custom p-6 w-full max-w-md shadow-custom space-y-4">
              <div className="flex items-center justify-between border-b border-custom-color pb-3">
                <h3 className="font-bold text-base text-custom-main flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-custom-gold" />
                  Lançar Item no Orçamento da Viagem
                </h3>
                <button
                  onClick={() => setModalNovoItem(false)}
                  className="text-gray-400 hover:text-custom-main font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!novoItem.descricao.trim()) return;
                  const cot = novoItem.moeda === 'BRL' ? 1.0 : (novoItem.cotacaoManual ? parseFloat(novoItem.cotacaoManual) : getCotacaoMoeda(novoItem.moeda));
                  const valPrevistoBRL = novoItem.moeda === 'BRL'
                    ? (parseFloat(novoItem.valorPrevisto) || 0)
                    : ((parseFloat(novoItem.valorNaMoeda) || 0) * cot);
                  const valOriginal = novoItem.moeda === 'BRL'
                    ? valPrevistoBRL
                    : (parseFloat(novoItem.valorNaMoeda) || 0);

                  const valPagoBRL = novoItem.pago
                    ? (novoItem.moeda === 'BRL'
                        ? (parseFloat(novoItem.valorPago) || valPrevistoBRL)
                        : ((parseFloat(novoItem.valorPagoNaMoeda) || parseFloat(novoItem.valorNaMoeda) || 0) * cot))
                    : 0;
                  const valPagoOriginal = novoItem.pago
                    ? (novoItem.moeda === 'BRL'
                        ? valPagoBRL
                        : (parseFloat(novoItem.valorPagoNaMoeda) || parseFloat(novoItem.valorNaMoeda) || 0))
                    : 0;

                  adicionarItemNaViagem({
                    ...novoItem,
                    valorPrevisto: valPrevistoBRL,
                    valorMoedaOriginal: valOriginal,
                    valorPago: valPagoBRL,
                    valorPagoMoedaOriginal: valPagoOriginal,
                    cotacaoUtilizada: novoItem.moeda !== 'BRL' ? cot : null,
                    observacoes: novoItem.observacoes
                      ? `${novoItem.observacoes}${novoItem.moeda !== 'BRL' ? ` (${valOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${novoItem.moeda} @ R$ ${cot.toFixed(3)})` : ''}`
                      : (novoItem.moeda !== 'BRL' ? `${valOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${novoItem.moeda} (Cotação: R$ ${cot.toFixed(3)})` : '')
                  });
                  setModalNovoItem(false);
                  setNovoItem({
                    pilar: 'transporte',
                    descricao: '',
                    valorPrevisto: '',
                    valorNaMoeda: '',
                    moeda: 'BRL',
                    valorPago: '',
                    valorPagoNaMoeda: '',
                    pago: false,
                    cotacaoManual: null,
                    dataVencimento: '',
                    observacoes: ''
                  });
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                    Pilar / Categoria
                  </label>
                  <select
                    value={novoItem.pilar}
                    onChange={(e) => setNovoItem({ ...novoItem, pilar: e.target.value })}
                    className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                  >
                    {PILARES_VIAGEM.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                    Descrição do Gasto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ingressos Museu do Louvre, Metrô, Jantar..."
                    value={novoItem.descricao}
                    onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                    className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Moeda do Lançamento
                    </label>
                    <select
                      value={novoItem.moeda}
                      onChange={(e) => {
                        const m = e.target.value;
                        const cot = getCotacaoMoeda(m);
                        const val = parseFloat(novoItem.valorNaMoeda) || 0;
                        setNovoItem({
                          ...novoItem,
                          moeda: m,
                          valorPrevisto: m === 'BRL' ? novoItem.valorPrevisto : (val > 0 ? (val * cot).toFixed(2) : '')
                        });
                      }}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold cursor-pointer"
                    >
                      {MOEDAS_DISPONIVEIS.map(m => (
                        <option key={m.code} value={m.code}>
                          {m.code} ({m.simbolo}) - {m.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      {novoItem.moeda === 'BRL' ? 'Valor Previsto (R$)' : `Valor em ${novoItem.moeda} (${formatSimboloMoeda(novoItem.moeda)})`} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0,00"
                      value={novoItem.moeda === 'BRL' ? novoItem.valorPrevisto : novoItem.valorNaMoeda}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (novoItem.moeda === 'BRL') {
                          setNovoItem({ ...novoItem, valorPrevisto: val, valorNaMoeda: val });
                        } else {
                          const cot = novoItem.cotacaoManual ? parseFloat(novoItem.cotacaoManual) : getCotacaoMoeda(novoItem.moeda);
                          const valNum = parseFloat(val) || 0;
                          setNovoItem({
                            ...novoItem,
                            valorNaMoeda: val,
                            valorPrevisto: valNum > 0 ? (valNum * cot).toFixed(2) : ''
                          });
                        }
                      }}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Banner de Conversão ao vivo para Moeda Estrangeira */}
                {novoItem.moeda !== 'BRL' && (
                  <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 font-medium">
                      <span>Cotação ({novoItem.moeda}/BRL): R$ {(novoItem.cotacaoManual ? parseFloat(novoItem.cotacaoManual) : getCotacaoMoeda(novoItem.moeda)).toFixed(3)}</span>
                      <span className="font-bold text-sky-800 dark:text-sky-200">
                        Equivalente: R$ {novoItem.valorPrevisto ? Number(novoItem.valorPrevisto).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Data Prevista / Vencimento
                    </label>
                    <input
                      type="date"
                      value={novoItem.dataVencimento}
                      onChange={(e) => setNovoItem({ ...novoItem, dataVencimento: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Observação / Detalhe
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pago no débito / cartão"
                      value={novoItem.observacoes}
                      onChange={(e) => setNovoItem({ ...novoItem, observacoes: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between border border-custom-color">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="itemPagoCheck"
                      checked={novoItem.pago}
                      onChange={(e) => setNovoItem({ ...novoItem, pago: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="itemPagoCheck" className="text-xs font-semibold text-custom-main cursor-pointer select-none">
                      Este item já foi pago? (Entra direto no DRE e Despesas)
                    </label>
                  </div>
                </div>

                {novoItem.pago && (
                  <div>
                    <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {novoItem.moeda === 'BRL'
                        ? 'Valor Real Efetivado (R$)'
                        : `Valor Pago na Moeda (${formatSimboloMoeda(novoItem.moeda)})`}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={novoItem.moeda === 'BRL' ? novoItem.valorPrevisto || '0,00' : novoItem.valorNaMoeda || '0,00'}
                      value={novoItem.moeda === 'BRL' ? novoItem.valorPago : novoItem.valorPagoNaMoeda}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (novoItem.moeda === 'BRL') {
                          setNovoItem({ ...novoItem, valorPago: val });
                        } else {
                          const cot = novoItem.cotacaoManual ? parseFloat(novoItem.cotacaoManual) : getCotacaoMoeda(novoItem.moeda);
                          const valNum = parseFloat(val) || 0;
                          setNovoItem({
                            ...novoItem,
                            valorPagoNaMoeda: val,
                            valorPago: valNum > 0 ? (valNum * cot).toFixed(2) : ''
                          });
                        }
                      }}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-emerald-500/40 rounded-lg text-sm font-bold"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-custom-color">
                  <button
                    type="button"
                    onClick={() => setModalNovoItem(false)}
                    className="px-4 py-2 border border-custom-color text-custom-main rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-custom-gold text-black rounded-lg text-xs font-bold shadow-custom cursor-pointer"
                  >
                    Salvar Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

export default Viagens;
