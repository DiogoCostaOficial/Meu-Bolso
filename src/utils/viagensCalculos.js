/**
 * Caderno de Engenharia e Modelagem Financeira para Viagens (Meu Bolso)
 * Contém todas as fórmulas de transporte, alimentação, câmbio, hospedagem e contingência.
 */

// 1. Matriz de Gorjetas por País/Região
export const MATRIZ_GORJETAS = {
  BR: {
    codigo: 'BR',
    nome: 'Brasil',
    gorjetaPadrao: 10,
    gorjetaMin: 10,
    gorjetaMax: 13,
    coperto: 0,
    moedaPadrao: 'BRL',
    descricao: 'Taxa de serviço (10% a 13%) normalmente inclusa na conta (padrão cultural).'
  },
  US: {
    codigo: 'US',
    nome: 'Estados Unidos',
    gorjetaPadrao: 20,
    gorjetaMin: 18,
    gorjetaMax: 22,
    coperto: 0,
    moedaPadrao: 'USD',
    descricao: 'Não inclusa no cardápio. Em grandes centros, 20% é a referência de serviço padrão.'
  },
  CA: {
    codigo: 'CA',
    nome: 'Canadá',
    gorjetaPadrao: 18,
    gorjetaMin: 15,
    gorjetaMax: 20,
    coperto: 0,
    moedaPadrao: 'CAD',
    descricao: 'Não inclusa. Adicionada diretamente na maquininha de cartão no momento do pagamento.'
  },
  UK: {
    codigo: 'UK',
    nome: 'Reino Unido',
    gorjetaPadrao: 12.5,
    gorjetaMin: 10,
    gorjetaMax: 12.5,
    coperto: 0,
    moedaPadrao: 'GBP',
    descricao: 'Vem discriminada como Discretionary Service Charge (10% a 12,5%). Se inclusa, não adicionar extra.'
  },
  EU: {
    codigo: 'EU',
    nome: 'União Europeia (França, Alemanha, Espanha)',
    gorjetaPadrao: 7.5,
    gorjetaMin: 5,
    gorjetaMax: 10,
    coperto: 0,
    moedaPadrao: 'EUR',
    descricao: 'Serviço embutido por lei (service compris). Costuma-se arredondar a conta para cima.'
  },
  IT: {
    codigo: 'IT',
    nome: 'Itália',
    gorjetaPadrao: 0,
    gorjetaMin: 0,
    gorjetaMax: 5,
    coperto: 3.5,
    moedaPadrao: 'EUR',
    descricao: 'Pouca gorjeta direta. Cobra-se taxa fixa por pessoa na mesa (Coperto € 2 a € 5).'
  },
  AR: {
    codigo: 'AR',
    nome: 'Argentina',
    gorjetaPadrao: 10,
    gorjetaMin: 10,
    gorjetaMax: 10,
    coperto: 0,
    moedaPadrao: 'ARS',
    descricao: 'Habitual deixar 10% em dinheiro vivo (propina), já que muitas máquinas não aceitam gorjeta no cartão.'
  },
  JP: {
    codigo: 'JP',
    nome: 'Japão',
    gorjetaPadrao: 0,
    gorjetaMin: 0,
    gorjetaMax: 0,
    coperto: 0,
    moedaPadrao: 'JPY',
    descricao: 'Estritamente proibido e considerado indelicado. O valor do cardápio é o valor final.'
  },
  OUTRO: {
    codigo: 'OUTRO',
    nome: 'Outro País / Destino Internacional',
    gorjetaPadrao: 10,
    gorjetaMin: 5,
    gorjetaMax: 15,
    coperto: 0,
    moedaPadrao: 'USD',
    descricao: 'Média de gorjeta internacional flexível.'
  }
};

// 2. Modalidades Cambiais & IOF (Alíquotas 2026)
export const MODALIDADES_CAMBIO = {
  global: {
    id: 'global',
    nome: 'Conta Global / Cartão Multimoeda (Wise, Nomad)',
    iofPadrao: 1.10, // IOF remessa cambial 1,1%
    spreadPadrao: 1.50, // 1,0% a 2,0%
    descricao: 'Melhor custo-benefício para compras no exterior. Cotação Comercial + IOF 1,1% + Spread 1-2%.'
  },
  cartao_credito: {
    id: 'cartao_credito',
    nome: 'Cartão de Crédito Tradicional (Banco Nacional)',
    iofPadrao: 2.38, // IOF 2026 oficial de 2,38% (escalonado até zerar em 2028)
    spreadPadrao: 5.00, // 4% a 7% dependendo do banco
    descricao: 'Cotação PTAX emissora + Spread bancário (4-7%) + IOF 2026 (2,38%). Sujeito a variação cambial.'
  },
  especie: {
    id: 'especie',
    nome: 'Dinheiro em Espécie (Casa de Câmbio)',
    iofPadrao: 1.10, // 1,10%
    spreadPadrao: 0.00, // Já embutido na taxa turismo
    descricao: 'Cotação Turismo em espécie + IOF de 1,10%.'
  }
};

// 3. Perfis de Risco para Fundo de Contingência
export const PERFIS_RISCO = {
  baixo: {
    id: 'baixo',
    percentual: 10,
    label: 'Baixo Risco (10%)',
    descricao: 'Viagens nacionais curtas ou destinos internacionais com infraestrutura altamente previsível.'
  },
  medio: {
    id: 'medio',
    percentual: 15,
    label: 'Médio Risco (15%)',
    descricao: 'Viagens internacionais com múltiplas conexões, países com câmbio volátil ou roteiros de carro longos.'
  },
  alto: {
    id: 'alto',
    percentual: 20,
    label: 'Alto Risco (20%)',
    descricao: 'Regiões remotas, esportes de aventura ou temporadas com risco climático elevado.'
  }
};

// 4. Pilares de Custos de Viagem
export const PILARES_VIAGEM = [
  { id: 'pre_viagem', nome: 'Pré-Viagem & Burocracia', icone: 'FileCheck', cor: '#3B82F6' },
  { id: 'transporte', nome: 'Deslocamento & Transporte', icone: 'Car', cor: '#0EA5E9' },
  { id: 'hospedagem', nome: 'Hospedagem & Estadia', icone: 'Home', cor: '#F59E0B' },
  { id: 'alimentacao', nome: 'Alimentação & Gorjetas', icone: 'Utensils', cor: '#10B981' },
  { id: 'passeios', nome: 'Roteiro, Passeios & Tours', icone: 'Compass', cor: '#6366F1' },
  { id: 'comunicacao', nome: 'Comunicação & Conectividade', icone: 'Wifi', cor: '#14B8A6' },
  { id: 'cambio_taxas', nome: 'Câmbio, Impostos & Spread', icone: 'Banknote', cor: '#EC4899' },
  { id: 'compras', nome: 'Compras & Lembranças', icone: 'ShoppingBag', cor: '#F97316' },
  { id: 'contingencia', nome: 'Fundo de Contingência', icone: 'ShieldAlert', cor: '#EF4444' }
];

// --- FÓRMULAS DE CÁLCULO ---

/**
 * 1. Módulo de Mobilidade e Transporte Terrestre
 */
export const calcularCombustivel = ({
  distanciaKm = 0,
  consumoKmL = 10,
  fatorOperacional = 1.0,
  precoLitro = 6.0
}) => {
  const dist = Number(distanciaKm) || 0;
  const cons = Number(consumoKmL) > 0 ? Number(consumoKmL) : 10;
  const fOp = Number(fatorOperacional) || 1.0;
  const preco = Number(precoLitro) || 0;

  const litrosConsumidos = (dist / cons) * fOp;
  const custoCombustivel = litrosConsumidos * preco;

  return {
    litrosConsumidos: Number(litrosConsumidos.toFixed(2)),
    custoCombustivel: Number(custoCombustivel.toFixed(2))
  };
};

export const converterMpgParaKmL = (mpg) => {
  const val = Number(mpg) || 0;
  return Number((val * 0.42514).toFixed(2));
};

export const converterMilhasParaKm = (milhas) => {
  const val = Number(milhas) || 0;
  return Number((val * 1.60934).toFixed(2));
};

export const converterGaloesParaLitros = (galoes) => {
  const val = Number(galoes) || 0;
  return Number((val * 3.78541).toFixed(2));
};

export const calcularDesgasteMecanico = (distanciaKm = 0, custoKm = 0.24) => {
  const dist = Number(distanciaKm) || 0;
  const cKm = Number(custoKm) || 0.24;
  return Number((dist * cKm).toFixed(2));
};

export const calcularCustoRodagemCarro = ({
  custoCombustivel = 0,
  desgasteMecanico = 0,
  pedagios = 0,
  diariasEstacionamento = 0,
  tarifaEstacionamento = 0,
  vagasRotativas = 0,
  lavagemRetorno = 0
}) => {
  const comb = Number(custoCombustivel) || 0;
  const desg = Number(desgasteMecanico) || 0;
  const ped = Number(pedagios) || 0;
  const est = (Number(diariasEstacionamento) || 0) * (Number(tarifaEstacionamento) || 0);
  const rot = Number(vagasRotativas) || 0;
  const lav = Number(lavagemRetorno) || 0;

  const total = comb + desg + ped + est + rot + lav;
  return Number(total.toFixed(2));
};

/**
 * 2. Módulo de Alimentação e Matriz Cultural de Gorjetas
 */
export const calcularAlimentacao = ({
  cafeDaManhaDiario = 0,
  almocoDiario = 0,
  jantarDiario = 0,
  lanchesAguaDiario = 0,
  dias = 1,
  pessoas = 1,
  paisCodigo = 'BR',
  taxaGorjetaPercentual = null,
  copertoPorPessoa = null
}) => {
  const configPais = MATRIZ_GORJETAS[paisCodigo] || MATRIZ_GORJETAS.OUTRO;
  const tGorjeta = taxaGorjetaPercentual !== null && taxaGorjetaPercentual !== undefined
    ? Number(taxaGorjetaPercentual)
    : configPais.gorjetaPadrao;

  const copertoFixo = copertoPorPessoa !== null && copertoPorPessoa !== undefined
    ? Number(copertoPorPessoa)
    : configPais.coperto;

  const numDias = Number(dias) > 0 ? Number(dias) : 1;
  const numPessoas = Number(pessoas) > 0 ? Number(pessoas) : 1;

  const basePorPessoaDia =
    (Number(cafeDaManhaDiario) || 0) +
    (Number(almocoDiario) || 0) +
    (Number(jantarDiario) || 0) +
    (Number(lanchesAguaDiario) || 0);

  const baseComGorjetaPorPessoaDia = basePorPessoaDia * (1 + tGorjeta / 100) + copertoFixo;
  const custoTotal = baseComGorjetaPorPessoaDia * numPessoas * numDias;

  return {
    basePorPessoaDia: Number(basePorPessoaDia.toFixed(2)),
    taxaGorjetaAplicada: tGorjeta,
    copertoAplicado: copertoFixo,
    custoTotal: Number(custoTotal.toFixed(2))
  };
};

/**
 * 3. Módulo Cambial e Tributário (Transações Internacionais)
 */
export const calcularConversaoCambial = ({
  valorMoedaEstrangeira = 0,
  cotacaoComercialOuPtax = 1,
  modalidade = 'global',
  spreadCustom = null,
  iofCustom = null
}) => {
  const valExt = Number(valorMoedaEstrangeira) || 0;
  const cot = Number(cotacaoComercialOuPtax) || 1;
  const config = MODALIDADES_CAMBIO[modalidade] || MODALIDADES_CAMBIO.global;

  const spread = spreadCustom !== null && spreadCustom !== undefined ? Number(spreadCustom) : config.spreadPadrao;
  const iof = iofCustom !== null && iofCustom !== undefined ? Number(iofCustom) : config.iofPadrao;

  let valorEmReais = 0;
  let valorIofReais = 0;
  let valorSpreadReais = 0;

  if (modalidade === 'especie') {
    // Custo Real = Valor * Cotação Turismo * (1 + IOF)
    const baseReais = valExt * cot;
    valorIofReais = baseReais * (iof / 100);
    valorEmReais = baseReais + valorIofReais;
  } else {
    // Cartão Crédito ou Conta Global: Valor * Cotação * (1 + Spread) * (1 + IOF)
    const baseReais = valExt * cot;
    valorSpreadReais = baseReais * (spread / 100);
    const baseComSpread = baseReais + valorSpreadReais;
    valorIofReais = baseComSpread * (iof / 100);
    valorEmReais = baseComSpread + valorIofReais;
  }

  return {
    valorMoedaEstrangeira: valExt,
    cotacao: cot,
    modalidade,
    spreadPercentual: spread,
    iofPercentual: iof,
    valorSpreadReais: Number(valorSpreadReais.toFixed(2)),
    valorIofReais: Number(valorIofReais.toFixed(2)),
    valorTotalBRL: Number(valorEmReais.toFixed(2))
  };
};

/**
 * 4. Módulo de Hospedagem e Taxas Ocultas
 */
export const calcularHospedagem = ({
  diariaBase = 0,
  noites = 1,
  cityTaxPorPessoaNoite = 0,
  hospedes = 1,
  resortFeeDiaria = 0,
  salesTaxPerc = 0,
  taxaLimpeza = 0,
  caucaoRetencao = 0
}) => {
  const diaria = Number(diariaBase) || 0;
  const numNoites = Number(noites) > 0 ? Number(noites) : 1;
  const numHospedes = Number(hospedes) > 0 ? Number(hospedes) : 1;
  const cityTaxPessoa = Number(cityTaxPorPessoaNoite) || 0;
  const resortFee = Number(resortFeeDiaria) || 0;
  const salesTax = Number(salesTaxPerc) || 0;
  const limpeza = Number(taxaLimpeza) || 0;
  const caucao = Number(caucaoRetencao) || 0;

  const totalDiarias = diaria * numNoites;
  const totalCityTax = cityTaxPessoa * numHospedes * numNoites;
  const totalResortFee = resortFee * numNoites * (1 + salesTax / 100);
  const custoTotalHospedagem = totalDiarias + totalCityTax + totalResortFee + limpeza;

  return {
    totalDiarias: Number(totalDiarias.toFixed(2)),
    totalCityTax: Number(totalCityTax.toFixed(2)),
    totalResortFee: Number(totalResortFee.toFixed(2)),
    taxaLimpeza: Number(limpeza.toFixed(2)),
    caucaoRetencao: Number(caucao.toFixed(2)), // Não é custo efetivo se não houver avaria, apenas bloqueio temporário
    custoTotalEfetivo: Number(custoTotalHospedagem.toFixed(2))
  };
};

/**
 * 5. Módulo de Roteiro, Passeios e Atividades
 */
export const calcularAtividade = ({
  precoIngresso = 0,
  taxaConveniencia = 0,
  furaFila = 0,
  pessoas = 1,
  transporteLocal = 0
}) => {
  const ing = Number(precoIngresso) || 0;
  const conv = Number(taxaConveniencia) || 0;
  const fura = Number(furaFila) || 0;
  const numPessoas = Number(pessoas) > 0 ? Number(pessoas) : 1;
  const transp = Number(transporteLocal) || 0;

  const custoTotal = (ing + conv + fura) * numPessoas + transp;
  return Number(custoTotal.toFixed(2));
};

/**
 * 6. Fundo de Contingência e Reserva de Emergência
 */
export const calcularContingencia = (subtotal = 0, perfilRisco = 'medio') => {
  const sub = Number(subtotal) || 0;
  const config = PERFIS_RISCO[perfilRisco] || PERFIS_RISCO.medio;
  const percentual = config.percentual;
  const valorReserva = sub * (percentual / 100);

  return {
    perfilRisco,
    percentual,
    valorReserva: Number(valorReserva.toFixed(2))
  };
};
