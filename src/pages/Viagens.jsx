import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown
} from 'lucide-react';

const Viagens = () => {
  const { formatCurrency } = useCurrency();

  // Estados principais
  const [viagens, setViagens] = useState([]);
  const [viagemAtivaId, setViagemAtivaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('geral'); // 'geral', 'transporte', 'hospedagem', 'alimentacao', 'cambio', 'passeios', 'itens'

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

  // Simulador de Transporte (Carro)
  const [transporteCarro, setTransporteCarro] = useState({
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
    lavagem: 50
  });

  // Simulador de Hospedagem
  const [simuladorHospedagem, setSimuladorHospedagem] = useState({
    nomeLocal: 'Hotel / Pousada',
    diariaBase: 350,
    noites: 4,
    cityTax: 0,
    hospedes: 2,
    resortFee: 0,
    salesTax: 0,
    limpeza: 80,
    caucao: 500
  });

  // Simulador de Alimentação
  const [simuladorAlimentacao, setSimuladorAlimentacao] = useState({
    cafe: 25,
    almoco: 60,
    jantar: 80,
    lanches: 25,
    dias: 5,
    pessoas: 2,
    paisCodigo: 'BR',
    gorjetaCustom: null,
    copertoCustom: null
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
    valorPrevisto: '',
    moeda: 'BRL',
    valorPago: '',
    pago: false,
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

  // Atualizar simulador de alimentação e câmbio quando mudar de viagem
  useEffect(() => {
    if (viagemAtiva) {
      const novoPais = viagemAtiva.paisCodigo || 'BR';
      setSimuladorAlimentacao(prev => {
        if (prev.paisCodigo === novoPais) return prev;
        return { ...prev, paisCodigo: novoPais };
      });
      if (viagemAtiva.moedaPrincipal && viagemAtiva.moedaPrincipal !== 'BRL') {
        setSimuladorCambio(prev => {
          if (prev.moeda === viagemAtiva.moedaPrincipal) return prev;
          return { ...prev, moeda: viagemAtiva.moedaPrincipal };
        });
      }
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

  // Excluir viagem
  const handleExcluirViagem = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este planejamento de viagem?')) return;
    const filtradas = viagens.filter(v => v.id !== id);
    const ok = await salvarViagensNoBackend(filtradas);
    if (ok) {
      if (viagemAtivaId === id) {
        setViagemAtivaId(filtradas.length > 0 ? filtradas[0].id : '');
      }
      toast.success('Viagem removida.');
    }
  };

  // Adicionar item orçado na viagem ativa
  const adicionarItemNaViagem = async (itemData) => {
    if (!viagemAtiva) {
      toast.error('Nenhuma viagem selecionada.');
      return;
    }

    const itemFinal = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      pilar: itemData.pilar || 'transporte',
      descricao: itemData.descricao || 'Item de Despesa',
      valorPrevisto: parseFloat(itemData.valorPrevisto) || 0,
      valorPago: itemData.pago ? (parseFloat(itemData.valorPago) || parseFloat(itemData.valorPrevisto) || 0) : 0,
      pago: !!itemData.pago,
      dataVencimento: itemData.dataVencimento || viagemAtiva.dataInicio || new Date().toISOString().split('T')[0],
      moeda: itemData.moeda || 'BRL',
      caucao: parseFloat(itemData.caucao) || 0,
      sincronizadoMeuBolso: false,
      observacoes: itemData.observacoes || ''
    };

    const viagensAtualizadas = viagens.map(v => {
      if (v.id === viagemAtiva.id) {
        return {
          ...v,
          itens: [...(v.itens || []), itemFinal]
        };
      }
      return v;
    });

    const ok = await salvarViagensNoBackend(viagensAtualizadas);
    if (ok) {
      toast.success(`"${itemFinal.descricao}" adicionado ao orçamento da viagem!`);
    }
  };

  // Alternar status de pagamento do item
  const handleTogglePago = async (itemId) => {
    if (!viagemAtiva) return;

    const viagensAtualizadas = viagens.map(v => {
      if (v.id === viagemAtiva.id) {
        const itensAtualizados = (v.itens || []).map(item => {
          if (item.id === itemId) {
            const novoPago = !item.pago;
            return {
              ...item,
              pago: novoPago,
              valorPago: novoPago ? (item.valorPago || item.valorPrevisto) : 0
            };
          }
          return item;
        });
        return { ...v, itens: itensAtualizados };
      }
      return v;
    });

    await salvarViagensNoBackend(viagensAtualizadas);
  };

  // Remover item
  const handleRemoverItem = async (itemId) => {
    if (!viagemAtiva) return;

    const viagensAtualizadas = viagens.map(v => {
      if (v.id === viagemAtiva.id) {
        return {
          ...v,
          itens: (v.itens || []).filter(i => i.id !== itemId)
        };
      }
      return v;
    });

    await salvarViagensNoBackend(viagensAtualizadas);
    toast.info('Item removido da viagem.');
  };

  // Sincronizar item pago com Despesas Gerais do Meu Bolso
  const handleSincronizarComMeuBolso = async (item) => {
    if (!item.pago) {
      toast.error('Marque o item como pago/efetivado antes de sincronizar.');
      return;
    }
    if (item.sincronizadoMeuBolso) {
      toast.info('Este item já foi sincronizado com as Despesas gerais.');
      return;
    }

    try {
      const mapaSubcategorias = {
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

      const subcat = mapaSubcategorias[item.pilar] || 'Passagens e Deslocamento';
      const valorFinal = parseFloat(item.valorPago) || parseFloat(item.valorPrevisto) || 0;
      const dataFinal = item.dataVencimento || new Date().toISOString().split('T')[0];

      // Busca dados completos para anexar a despesa
      const res = await api.get('/user/dados');
      const dados = res.data?.dados || res.data || {};
      const despesasAtuais = Array.isArray(dados.despesas) ? dados.despesas : [];

      const novaDespesa = {
        id: `desp-viagem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        descricao: `[${viagemAtiva.titulo}] ${item.descricao}`,
        valor: valorFinal,
        data: dataFinal,
        dataLancamento: dataFinal,
        categoria: 'Viagens',
        subcategoria: subcat,
        status: 'pago',
        statusPagamento: 'pago',
        observacao: `Importado da Viagem: ${viagemAtiva.titulo} (${viagemAtiva.destino})`
      };

      dados.despesas = [...despesasAtuais, novaDespesa];

      // Marca o item na viagem como sincronizado
      const viagensAtualizadas = viagens.map(v => {
        if (v.id === viagemAtiva.id) {
          const itensAtt = (v.itens || []).map(i => {
            if (i.id === item.id) {
              return { ...i, sincronizadoMeuBolso: true };
            }
            return i;
          });
          return { ...v, itens: itensAtt };
        }
        return v;
      });
      dados.viagens = viagensAtualizadas;

      await api.post('/user/dados', dados);
      setViagens(viagensAtualizadas);
      toast.success(`Despesa enviada para o Meu Bolso com a categoria "Viagens > ${subcat}"!`);
    } catch (err) {
      console.error('Erro ao sincronizar com despesas:', err);
      toast.error('Erro ao sincronizar despesa.');
    }
  };

  // Cálculos dinâmicos dos simuladores
  // 1. Transporte Carro
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
    const custoTotal = calcularCustoRodagemCarro({
      custoCombustivel: comb.custoCombustivel,
      desgasteMecanico: desgaste,
      pedagios: transporteCarro.pedagios,
      diariasEstacionamento: transporteCarro.diariasEstacionamento,
      tarifaEstacionamento: transporteCarro.tarifaEstacionamento,
      vagasRotativas: transporteCarro.rotativas,
      lavagemRetorno: transporteCarro.lavagem
    });

    return {
      litros: comb.litrosConsumidos,
      custoCombustivel: comb.custoCombustivel,
      desgaste,
      custoTotal
    };
  }, [transporteCarro]);

  // 2. Hospedagem
  const resultadoHospedagem = useMemo(() => {
    return calcularHospedagem({
      diariaBase: simuladorHospedagem.diariaBase,
      noites: simuladorHospedagem.noites,
      cityTaxPorPessoaNoite: simuladorHospedagem.cityTax,
      hospedes: simuladorHospedagem.hospedes,
      resortFeeDiaria: simuladorHospedagem.resortFee,
      salesTaxPerc: simuladorHospedagem.salesTax,
      taxaLimpeza: simuladorHospedagem.limpeza,
      caucaoRetencao: simuladorHospedagem.caucao
    });
  }, [simuladorHospedagem]);

  // 3. Alimentação
  const resultadoAlimentacao = useMemo(() => {
    return calcularAlimentacao({
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
  }, [simuladorAlimentacao]);

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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* CABEÇALHO & SELEÇÃO DE VIAGEM */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-lg">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-custom-main flex items-center gap-2">
                  Gestão de Viagens
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-custom-gold/15 text-custom-gold font-semibold">
                    Homologação
                  </span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Planejamento orçamentário inteligente, simuladores de transporte, câmbio e taxas culturais.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {viagens.length > 0 && (
              <div className="relative min-w-[200px]">
                <select
                  value={viagemAtivaId}
                  onChange={(e) => setViagemAtivaId(e.target.value)}
                  className="w-full bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-custom-gold cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 bg-custom-gold text-black rounded-lg font-semibold text-sm hover:opacity-90 transition shadow-custom"
            >
              <Plus className="w-4 h-4" />
              Nova Viagem
            </button>

            {viagemAtiva && (
              <button
                onClick={() => handleExcluirViagem(viagemAtiva.id)}
                title="Excluir Viagem Selecionada"
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* DETALHES DA VIAGEM SELECIONADA OU EMPTY STATE */}
        {!viagemAtiva ? (
          <div className="bg-custom-card p-12 text-center rounded-custom border border-custom-color shadow-custom space-y-4">
            <div className="w-16 h-16 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-custom-main">Nenhuma Viagem Planejada Ainda</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto">
              Crie seu primeiro roteiro de viagem para calcular custos de combustível, hospedagem com taxas, cotações de câmbio e sincronizar tudo com o seu Meu Bolso!
            </p>
            <button
              onClick={() => setModalNovaViagem(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-custom-gold text-black rounded-lg font-bold text-sm shadow-custom hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Começar Meu Primeiro Roteiro
            </button>
          </div>
        ) : (
          <>
            {/* CARDS DE KPIS / RESUMO EXECUTIVO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Total Previsto */}
              <div className="bg-custom-card p-4 rounded-custom border border-custom-color shadow-custom">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">Custo Total Previsto</span>
                  <DollarSign className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-xl font-bold text-custom-main">
                  {formatCurrency(resumoFinanceiro.totalGeralPrevisto)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <span>Itens: {formatCurrency(resumoFinanceiro.subtotalPrevisto)}</span>
                </div>
              </div>

              {/* 2. Efetivado / Pago */}
              <div className="bg-custom-card p-4 rounded-custom border border-custom-color shadow-custom">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">Já Pago / Efetivado</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(resumoFinanceiro.totalPago)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {resumoFinanceiro.totalGeralPrevisto > 0
                    ? `${((resumoFinanceiro.totalPago / resumoFinanceiro.totalGeralPrevisto) * 100).toFixed(0)}% do orçamento total`
                    : '0% pago'}
                </div>
              </div>

              {/* 3. Restante a Pagar */}
              <div className="bg-custom-card p-4 rounded-custom border border-custom-color shadow-custom">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pendente a Pagar</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(resumoFinanceiro.totalPendente)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Necessário para quitar a viagem
                </div>
              </div>

              {/* 4. Contingência / Reserva */}
              <div className="bg-custom-card p-4 rounded-custom border border-custom-color shadow-custom">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">Fundo de Reserva</span>
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(resumoFinanceiro.reservaContingencia)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {resumoFinanceiro.percentualContingencia}% ({viagemAtiva.perfilRisco} risco)
                </div>
              </div>

              {/* 5. Caução Retido (Informativo) */}
              <div className="bg-custom-card p-4 rounded-custom border border-custom-color shadow-custom">
                <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">Caução em Cartão</span>
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(resumoFinanceiro.caucaoTotal)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Bloqueio temporário (não é custo)
                </div>
              </div>
            </div>

            {/* BARRA DE NAVEGAÇÃO ENTRE ABAS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-custom-color mobile-scroll">
              {[
                { id: 'geral', label: 'Visão Geral & Custos', icone: Layers },
                { id: 'transporte', label: 'Transporte & Rodagem', icone: Car },
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
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                      ativa
                        ? 'bg-custom-gold text-black shadow-custom'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icone className="w-4 h-4" />
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
                <div className="bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-4">
                  <h3 className="font-bold text-lg text-custom-main flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-custom-gold" />
                    {viagemAtiva.titulo}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-custom-color">
                      <span className="text-gray-500">Destino:</span>
                      <span className="font-medium text-custom-main">{viagemAtiva.destino}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-custom-color">
                      <span className="text-gray-500">País de Referência:</span>
                      <span className="font-medium text-custom-main">
                        {MATRIZ_GORJETAS[viagemAtiva.paisCodigo]?.nome || viagemAtiva.paisCodigo}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-custom-color">
                      <span className="text-gray-500">Período:</span>
                      <span className="font-medium text-custom-main">
                        {viagemAtiva.dataInicio || 'Início'} até {viagemAtiva.dataFim || 'Fim'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-custom-color">
                      <span className="text-gray-500">Perfil de Contingência:</span>
                      <span className="font-semibold text-rose-500">
                        {PERFIS_RISCO[viagemAtiva.perfilRisco]?.label || 'Médio (15%)'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setModalNovoItem(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg text-sm font-semibold transition"
                    >
                      <Plus className="w-4 h-4" />
                      Lançar Gasto Avulso na Viagem
                    </button>
                  </div>
                </div>

                {/* Composição por Pilar de Custos */}
                <div className="lg:col-span-2 bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-4">
                  <h3 className="font-bold text-lg text-custom-main flex items-center justify-between">
                    <span>Composição Orçamentária por Categoria</span>
                    <span className="text-xs text-gray-500 font-normal">
                      Total: {formatCurrency(resumoFinanceiro.totalGeralPrevisto)}
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {PILARES_VIAGEM.map(pilar => {
                      const dadosPilar = resumoFinanceiro.porPilar[pilar.id] || { previsto: 0, pago: 0 };
                      const perc = resumoFinanceiro.totalGeralPrevisto > 0
                        ? (dadosPilar.previsto / resumoFinanceiro.totalGeralPrevisto) * 100
                        : 0;

                      return (
                        <div key={pilar.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-custom-main flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pilar.cor }} />
                              {pilar.nome}
                            </span>
                            <span className="text-gray-500">
                              {formatCurrency(dadosPilar.previsto)} ({perc.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(perc, 100)}%`, backgroundColor: pilar.cor }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Linha da Contingência */}
                    <div className="space-y-1 pt-2 border-t border-custom-color">
                      <div className="flex justify-between text-xs font-semibold text-rose-500">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Fundo de Contingência & Imprevistos ({resumoFinanceiro.percentualContingencia}%)
                        </span>
                        <span>{formatCurrency(resumoFinanceiro.reservaContingencia)}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-custom-main flex items-center gap-2">
                      <Car className="w-5 h-5 text-sky-500" />
                      Módulo de Mobilidade e Transporte Terrestre (Carro)
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Fórmula com Fator Operacional (Fop: relevo/ar-condicionado) e desgaste mecânico por quilômetro rodado (Ckm).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Distância Total (Ida + Volta km)
                      </label>
                      <input
                        type="number"
                        value={transporteCarro.distanciaKm}
                        onChange={(e) => setTransporteCarro({ ...transporteCarro, distanciaKm: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Consumo Médio (km/litro)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={transporteCarro.consumoKmL}
                        onChange={(e) => setTransporteCarro({ ...transporteCarro, consumoKmL: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Preço do Litro (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={transporteCarro.precoLitro}
                        onChange={(e) => setTransporteCarro({ ...transporteCarro, precoLitro: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Fator Operacional (Fop)
                      </label>
                      <select
                        value={transporteCarro.fatorOp}
                        onChange={(e) => setTransporteCarro({ ...transporteCarro, fatorOp: parseFloat(e.target.value) })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      >
                        <option value="1.0">1.00 - Estrada plana / ar desligado</option>
                        <option value="1.1">1.10 - Relevo ondulado ou ar-condicionado (+10%)</option>
                        <option value="1.2">1.20 - Serra / trânsito pesado / carro lotado (+20%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Total de Pedágios (R$)
                      </label>
                      <input
                        type="number"
                        value={transporteCarro.pedagios}
                        onChange={(e) => setTransporteCarro({ ...transporteCarro, pedagios: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Estacionamento (Diárias x Diária)
                      </label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="number"
                          placeholder="Diárias"
                          value={transporteCarro.diariasEstacionamento}
                          onChange={(e) => setTransporteCarro({ ...transporteCarro, diariasEstacionamento: e.target.value })}
                          className="w-1/2 bg-custom-primary text-custom-main px-2 py-2 border border-custom-color rounded-lg text-xs font-semibold"
                        />
                        <input
                          type="number"
                          placeholder="R$/dia"
                          value={transporteCarro.tarifaEstacionamento}
                          onChange={(e) => setTransporteCarro({ ...transporteCarro, tarifaEstacionamento: e.target.value })}
                          className="w-1/2 bg-custom-primary text-custom-main px-2 py-2 border border-custom-color rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Opção de desgaste mecânico */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between border border-custom-color">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="checkDesgaste"
                        checked={transporteCarro.incluirDesgaste}
                        onChange={(e) => setTransporteCarro({ ...transporteCarro, incluirDesgaste: e.target.checked })}
                        className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                      />
                      <label htmlFor="checkDesgaste" className="text-xs font-medium text-custom-main cursor-pointer">
                        Calcular Desgaste Mecânico e Manutenção Proporcional (R$ 0,24/km)
                      </label>
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {formatCurrency(resultadoCarro.desgaste)}
                    </span>
                  </div>
                </div>

                {/* Resumo do Cálculo de Transporte */}
                <div className="bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-bold text-base text-custom-main">Resumo de Rodagem</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Combustível Estimado:</span>
                        <span className="font-semibold text-custom-main">
                          {resultadoCarro.litros} L ({formatCurrency(resultadoCarro.custoCombustivel)})
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Pedágios:</span>
                        <span className="font-semibold text-custom-main">
                          {formatCurrency(transporteCarro.pedagios)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Estacionamentos:</span>
                        <span className="font-semibold text-custom-main">
                          {formatCurrency(transporteCarro.diariasEstacionamento * transporteCarro.tarifaEstacionamento)}
                        </span>
                      </div>
                      {transporteCarro.incluirDesgaste && (
                        <div className="flex justify-between py-1 border-b border-custom-color">
                          <span className="text-gray-500">Desgaste Mecânico:</span>
                          <span className="font-semibold text-custom-main">
                            {formatCurrency(resultadoCarro.desgaste)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 text-sm font-bold text-sky-600 dark:text-sky-400">
                        <span>Custo Total Terrestre:</span>
                        <span>{formatCurrency(resultadoCarro.custoTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => adicionarItemNaViagem({
                      pilar: 'transporte',
                      descricao: `Deslocamento de Carro (${transporteCarro.distanciaKm} km)`,
                      valorPrevisto: resultadoCarro.custoTotal,
                      moeda: 'BRL',
                      observacoes: `${resultadoCarro.litros}L de combustível + R$ ${transporteCarro.pedagios} pedágio`
                    })}
                    className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar ao Orçamento da Viagem
                  </button>
                </div>
              </div>
            )}

            {/* ABA 3: SIMULADOR DE HOSPEDAGEM */}
            {abaAtiva === 'hospedagem' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-custom-main flex items-center gap-2">
                      <Home className="w-5 h-5 text-amber-500" />
                      Módulo de Hospedagem e Taxas Ocultas
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Calcula diárias totais, taxas de turismo municipais (City Tax por hóspede), resort fees com impostos e caução.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Nome da Hospedagem / Hotel
                      </label>
                      <input
                        type="text"
                        value={simuladorHospedagem.nomeLocal}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, nomeLocal: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Diária Base (R$ ou Moeda)
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.diariaBase}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, diariaBase: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Número de Noites
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.noites}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, noites: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Quantidade de Hóspedes
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.hospedes}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, hospedes: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        City Tax (por pessoa/noite)
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.cityTax}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, cityTax: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Resort Fee Diária
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.resortFee}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, resortFee: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Taxa de Limpeza Única
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.limpeza}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, limpeza: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Caução / Bloqueio no Cartão (Retenção temporária)
                      </label>
                      <input
                        type="number"
                        value={simuladorHospedagem.caucao}
                        onChange={(e) => setSimuladorHospedagem({ ...simuladorHospedagem, caucao: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        * O caução não é somado ao custo final, apenas registrado como alerta de bloqueio de limite no cartão.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resumo Hospedagem */}
                <div className="bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-bold text-base text-custom-main">Resumo da Estadia</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Diárias Base ({simuladorHospedagem.noites} noites):</span>
                        <span className="font-semibold text-custom-main">
                          {formatCurrency(resultadoHospedagem.totalDiarias)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Taxas Municipais (City Tax):</span>
                        <span className="font-semibold text-custom-main">
                          {formatCurrency(resultadoHospedagem.totalCityTax)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Resort Fees:</span>
                        <span className="font-semibold text-custom-main">
                          {formatCurrency(resultadoHospedagem.totalResortFee)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Taxa de Limpeza:</span>
                        <span className="font-semibold text-custom-main">
                          {formatCurrency(resultadoHospedagem.taxaLimpeza)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 text-sm font-bold text-amber-600 dark:text-amber-400">
                        <span>Custo Total Efetivo:</span>
                        <span>{formatCurrency(resultadoHospedagem.custoTotalEfetivo)}</span>
                      </div>
                      {resultadoHospedagem.caucaoRetencao > 0 && (
                        <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg text-orange-600 dark:text-orange-400 text-xs">
                          ⚠️ Bloqueio temporário de cartão previsto: <strong>{formatCurrency(resultadoHospedagem.caucaoRetencao)}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => adicionarItemNaViagem({
                      pilar: 'hospedagem',
                      descricao: `${simuladorHospedagem.nomeLocal} (${simuladorHospedagem.noites} noites)`,
                      valorPrevisto: resultadoHospedagem.custoTotalEfetivo,
                      caucao: resultadoHospedagem.caucaoRetencao,
                      moeda: 'BRL',
                      observacoes: `Diárias + Taxas (Caução de ${formatCurrency(resultadoHospedagem.caucaoRetencao)})`
                    })}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Hospedagem ao Orçamento
                  </button>
                </div>
              </div>
            )}

            {/* ABA 4: SIMULADOR DE ALIMENTAÇÃO */}
            {abaAtiva === 'alimentacao' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-custom-main flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-emerald-500" />
                      Módulo de Alimentação e Matriz Cultural de Gorjetas
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Aplica as regras culturais de gorjetas (ex: 20% EUA, Coperto Itália, proibido no Japão) automaticamente.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        País / Região Cultural
                      </label>
                      <select
                        value={simuladorAlimentacao.paisCodigo}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, paisCodigo: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      >
                        {Object.values(MATRIZ_GORJETAS).map(pais => (
                          <option key={pais.codigo} value={pais.codigo}>
                            {pais.nome} (Gorjeta padrão: {pais.gorjetaPadrao}%{pais.coperto > 0 ? ` + Coperto € ${pais.coperto}` : ''})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-400 mt-1">
                        ℹ️ {MATRIZ_GORJETAS[simuladorAlimentacao.paisCodigo]?.descricao}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Café da Manhã (R$/pessoa/dia)
                      </label>
                      <input
                        type="number"
                        value={simuladorAlimentacao.cafe}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, cafe: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Almoço Médio (R$/pessoa/dia)
                      </label>
                      <input
                        type="number"
                        value={simuladorAlimentacao.almoco}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, almoco: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Jantar Médio (R$/pessoa/dia)
                      </label>
                      <input
                        type="number"
                        value={simuladorAlimentacao.jantar}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, jantar: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Água / Lanches / Cafés (R$/dia)
                      </label>
                      <input
                        type="number"
                        value={simuladorAlimentacao.lanches}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, lanches: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Total de Dias
                      </label>
                      <input
                        type="number"
                        value={simuladorAlimentacao.dias}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, dias: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Número de Pessoas
                      </label>
                      <input
                        type="number"
                        value={simuladorAlimentacao.pessoas}
                        onChange={(e) => setSimuladorAlimentacao({ ...simuladorAlimentacao, pessoas: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo Alimentação */}
                <div className="bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-bold text-base text-custom-main">Orçamento de Alimentação</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Base por Pessoa/Dia:</span>
                        <span className="font-semibold text-custom-main">
                          {formatCurrency(resultadoAlimentacao.basePorPessoaDia)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-custom-color">
                        <span className="text-gray-500">Gorjeta Aplicada:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {resultadoAlimentacao.taxaGorjetaAplicada}%
                        </span>
                      </div>
                      {resultadoAlimentacao.copertoAplicado > 0 && (
                        <div className="flex justify-between py-1 border-b border-custom-color">
                          <span className="text-gray-500">Coperto Italiano:</span>
                          <span className="font-semibold text-custom-main">
                            € {resultadoAlimentacao.copertoAplicado} / pessoa
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <span>Total ({simuladorAlimentacao.dias} dias x {simuladorAlimentacao.pessoas} pess.):</span>
                        <span>{formatCurrency(resultadoAlimentacao.custoTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => adicionarItemNaViagem({
                      pilar: 'alimentacao',
                      descricao: `Alimentação Completa (${simuladorAlimentacao.dias} dias - ${MATRIZ_GORJETAS[simuladorAlimentacao.paisCodigo]?.nome})`,
                      valorPrevisto: resultadoAlimentacao.custoTotal,
                      moeda: 'BRL',
                      observacoes: `Inclui gorjeta de ${resultadoAlimentacao.taxaGorjetaAplicada}% (${simuladorAlimentacao.pessoas} pessoas)`
                    })}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Alimentação ao Orçamento
                  </button>
                </div>
              </div>
            )}

            {/* ABA 5: SIMULADOR DE CÂMBIO & IOF 2026 */}
            {abaAtiva === 'cambio' && (
              <div className="space-y-6">
                <div className="bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-custom-main flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-pink-500" />
                        Módulo Cambial e Tributário (Transações Internacionais)
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Cotação pública gratuita em tempo real via AwesomeAPI / Banco Central. Cálculo exato de IOF 2026 (2,38% no cartão vs 1,1% na conta global).
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1">
                      <button
                        onClick={() => carregarCotacoes(true)}
                        disabled={carregandoCambio}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-custom-primary hover:bg-gray-100 dark:hover:bg-slate-800 border border-custom-color rounded-lg text-xs font-semibold text-custom-main transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${carregandoCambio ? 'animate-spin' : ''}`} />
                        Atualizar Agora ({fonteCambio || 'API'})
                      </button>
                      {horaUltimaCotacao && (
                        <span className="text-[11px] text-gray-400">
                          🕒 Atualizado às {horaUltimaCotacao} (automático a cada 1h)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cards de Cotações Rápidas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {['USD', 'EUR', 'GBP', 'CAD', 'ARS', 'JPY'].map(code => {
                      const cot = cotacoes[code];
                      const selecionada = simuladorCambio.moeda === code;
                      return (
                        <div
                          key={code}
                          onClick={() => setSimuladorCambio({ ...simuladorCambio, moeda: code, cotacaoManual: null })}
                          className={`p-3 rounded-lg border text-center cursor-pointer transition ${
                            selecionada
                              ? 'border-custom-gold bg-custom-gold/10'
                              : 'border-custom-color hover:bg-gray-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="text-xs font-bold text-gray-500">{code}/BRL</div>
                          <div className="text-base font-bold text-custom-main mt-0.5">
                            R$ {cot ? cot.valor.toFixed(2) : '--'}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">{cot?.nome || code}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Comparativo de Modalidades */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                    {/* Conta Global */}
                    <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          Conta Global (Wise / Nomad)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded">
                          Mais Econômico
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-custom-main">
                        {formatCurrency(comparativoCambio.resGlobal.valorTotalBRL)}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>• IOF: <strong>1,10%</strong> ({formatCurrency(comparativoCambio.resGlobal.valorIofReais)})</div>
                        <div>• Spread Médio: <strong>1,50%</strong> ({formatCurrency(comparativoCambio.resGlobal.valorSpreadReais)})</div>
                        <div>• Cotação: Comercial em tempo real</div>
                      </div>
                    </div>

                    {/* Cartão de Crédito Tradicional */}
                    <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-rose-600 dark:text-rose-400">
                          Cartão de Crédito (Banco BR)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-600 font-bold rounded">
                          IOF 2026: 2,38%
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-custom-main">
                        {formatCurrency(comparativoCambio.resCartao.valorTotalBRL)}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>• IOF 2026: <strong>2,38%</strong> ({formatCurrency(comparativoCambio.resCartao.valorIofReais)})</div>
                        <div>• Spread Emissor: <strong>5,00%</strong> ({formatCurrency(comparativoCambio.resCartao.valorSpreadReais)})</div>
                        <div>• Cotação PTAX emissora</div>
                      </div>
                    </div>

                    {/* Espécie */}
                    <div className="p-4 rounded-xl border border-custom-color bg-custom-primary space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-custom-main">
                          Dinheiro em Espécie
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-500/10 text-gray-600 font-bold rounded">
                          Turismo
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-custom-main">
                        {formatCurrency(comparativoCambio.resEspecie.valorTotalBRL)}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>• IOF: <strong>1,10%</strong> ({formatCurrency(comparativoCambio.resEspecie.valorIofReais)})</div>
                        <div>• Spread embutido no câmbio turismo</div>
                        <div>• Risco de segurança física</div>
                      </div>
                    </div>
                  </div>

                  {/* Destaque da Economia */}
                  {comparativoCambio.economiaContaGlobal > 0 && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>💡 Economia estimada usando Conta Global em vez de Cartão Tradicional:</span>
                      <span className="text-sm font-bold">{formatCurrency(comparativoCambio.economiaContaGlobal)}</span>
                    </div>
                  )}

                  {/* Inputs de Simulação Manual */}
                  <div className="pt-2 border-t border-custom-color grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Valor em Moeda Estrangeira ({simuladorCambio.moeda})
                      </label>
                      <input
                        type="number"
                        value={simuladorCambio.valorMoeda}
                        onChange={(e) => setSimuladorCambio({ ...simuladorCambio, valorMoeda: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                        Cotação Usada (Editar manualmente se desejar)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={cotacaoMoedaAtual}
                        onChange={(e) => setSimuladorCambio({ ...simuladorCambio, cotacaoManual: e.target.value })}
                        className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
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
                        className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-bold shadow-custom transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Câmbio ao Orçamento
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 6: PLANILHA DE ITENS & SINCRONIZAÇÃO COM MEU BOLSO */}
            {abaAtiva === 'itens' && (
              <div className="bg-custom-card p-5 rounded-custom border border-custom-color shadow-custom space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-custom-main flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-custom-gold" />
                      Planilha de Gastos Orçados & Efetivados
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Marque como pago e envie diretamente com 1 clique para o seu extrato geral de Despesas do Meu Bolso!
                    </p>
                  </div>

                  <button
                    onClick={() => setModalNovoItem(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-custom-gold text-black rounded-lg text-sm font-bold shadow-custom hover:opacity-90 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Item ao Orçamento
                  </button>
                </div>

                {(!viagemAtiva.itens || viagemAtiva.itens.length === 0) ? (
                  <div className="py-12 text-center text-gray-400">
                    Nenhum item adicionado ainda. Utilize os simuladores acima ou adicione itens manualmente!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-custom-color text-xs font-semibold text-gray-500 uppercase">
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2">Categoria</th>
                          <th className="py-3 px-2">Descrição</th>
                          <th className="py-3 px-2 text-right">Valor Previsto</th>
                          <th className="py-3 px-2 text-right">Valor Efetivado</th>
                          <th className="py-3 px-2 text-center">Sincronização</th>
                          <th className="py-3 px-2 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-custom-color">
                        {viagemAtiva.itens.map(item => {
                          const pilarObj = PILARES_VIAGEM.find(p => p.id === item.pilar);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => handleTogglePago(item.id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                    item.pago
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {item.pago ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Pago
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3.5 h-3.5" />
                                      Pendente
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3 px-2">
                                <span
                                  className="text-xs px-2.5 py-1 rounded-md font-medium text-white shadow-sm inline-block"
                                  style={{ backgroundColor: pilarObj?.cor || '#0EA5E9' }}
                                >
                                  {pilarObj?.nome || item.pilar}
                                </span>
                              </td>

                              <td className="py-3 px-2">
                                <div className="font-semibold text-custom-main">{item.descricao}</div>
                                {item.observacoes && (
                                  <div className="text-[11px] text-gray-400">{item.observacoes}</div>
                                )}
                              </td>

                              <td className="py-3 px-2 text-right font-medium text-gray-600 dark:text-slate-300">
                                {formatCurrency(item.valorPrevisto)}
                              </td>

                              <td className="py-3 px-2 text-right font-bold text-custom-main">
                                {item.pago ? formatCurrency(item.valorPago || item.valorPrevisto) : '--'}
                              </td>

                              <td className="py-3 px-2 text-center">
                                {item.sincronizadoMeuBolso ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <Check className="w-3.5 h-3.5" />
                                    No Meu Bolso
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSincronizarComMeuBolso(item)}
                                    disabled={!item.pago}
                                    title={item.pago ? 'Enviar para tabela de Despesas Gerais' : 'Marque como pago primeiro'}
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                                      item.pago
                                        ? 'bg-custom-gold text-black hover:opacity-90 shadow-sm cursor-pointer'
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Sincronizar
                                  </button>
                                )}
                              </td>

                              <td className="py-3 px-2 text-center">
                                <button
                                  onClick={() => handleRemoverItem(item.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded transition cursor-pointer"
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
                <h3 className="font-bold text-base text-custom-main">
                  Lançar Item no Orçamento da Viagem
                </h3>
                <button
                  onClick={() => setModalNovoItem(false)}
                  className="text-gray-400 hover:text-custom-main font-bold"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!novoItem.descricao.trim()) return;
                  adicionarItemNaViagem(novoItem);
                  setModalNovoItem(false);
                  setNovoItem({
                    pilar: 'transporte',
                    descricao: '',
                    valorPrevisto: '',
                    moeda: 'BRL',
                    valorPago: '',
                    pago: false,
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
                    placeholder="Ex: Ingressos Museu do Louvre"
                    value={novoItem.descricao}
                    onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                    className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                      Valor Previsto (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0,00"
                      value={novoItem.valorPrevisto}
                      onChange={(e) => setNovoItem({ ...novoItem, valorPrevisto: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-custom-color rounded-lg text-sm font-bold"
                    />
                  </div>

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
                    <label htmlFor="itemPagoCheck" className="text-xs font-semibold text-custom-main cursor-pointer">
                      Este item já foi pago?
                    </label>
                  </div>
                </div>

                {novoItem.pago && (
                  <div>
                    <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Valor Real Efetivado (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Deixe em branco para usar o valor previsto"
                      value={novoItem.valorPago}
                      onChange={(e) => setNovoItem({ ...novoItem, valorPago: e.target.value })}
                      className="w-full mt-1 bg-custom-primary text-custom-main px-3 py-2 border border-emerald-500/40 rounded-lg text-sm font-bold"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-custom-color">
                  <button
                    type="button"
                    onClick={() => setModalNovoItem(false)}
                    className="px-4 py-2 border border-custom-color text-custom-main rounded-lg text-xs font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-custom-gold text-black rounded-lg text-xs font-bold shadow-custom"
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
