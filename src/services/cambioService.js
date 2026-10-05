/**
 * Serviço de Cotações de Câmbio em Tempo Real (Gratuito / Sem Token / Sem Custo)
 * Utiliza a API pública oficial do mercado brasileiro (AwesomeAPI) com fallback gracioso.
 */

const FALLBACK_COTITY = {
  USD: { code: 'USD', nome: 'Dólar Americano', valor: 5.25, data: 'Hoje' },
  EUR: { code: 'EUR', nome: 'Euro', valor: 5.80, data: 'Hoje' },
  GBP: { code: 'GBP', nome: 'Libra Esterlina', valor: 6.85, data: 'Hoje' },
  CAD: { code: 'CAD', nome: 'Dólar Canadense', valor: 3.85, data: 'Hoje' },
  ARS: { code: 'ARS', nome: 'Peso Argentino', valor: 0.0055, data: 'Hoje' },
  JPY: { code: 'JPY', nome: 'Iene Japonês', valor: 0.035, data: 'Hoje' },
  CLP: { code: 'CLP', nome: 'Peso Chileno', valor: 0.0056, data: 'Hoje' }
};

let cacheCotacoes = null;
let ultimaAtualizacao = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hora de cache (atualização de hora em hora)

export const buscarCotacoesCambio = async (forcarAtualizacao = false) => {
  const agora = Date.now();
  if (!forcarAtualizacao && cacheCotacoes && (agora - ultimaAtualizacao < CACHE_DURATION_MS)) {
    return { sucesso: true, dados: cacheCotacoes, fonte: 'cache', timestamp: ultimaAtualizacao };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL,CAD-BRL,ARS-BRL,JPY-BRL,CLP-BRL';
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const data = await response.json();
    const cotacoes = {};

    const mapaChaves = {
      USDBRL: 'USD',
      EURBRL: 'EUR',
      GBPBRL: 'GBP',
      CADBRL: 'CAD',
      ARSBRL: 'ARS',
      JPYBRL: 'JPY',
      CLPBRL: 'CLP'
    };

    Object.keys(mapaChaves).forEach(key => {
      const code = mapaChaves[key];
      if (data[key]) {
        cotacoes[code] = {
          code,
          nome: data[key].name ? data[key].name.split('/')[0] : code,
          valor: parseFloat(data[key].bid || data[key].ask || FALLBACK_COTITY[code].valor),
          alta: parseFloat(data[key].high || 0),
          baixa: parseFloat(data[key].low || 0),
          pctChange: parseFloat(data[key].pctChange || 0),
          data: data[key].create_date || new Date().toLocaleString('pt-BR')
        };
      } else {
        cotacoes[code] = FALLBACK_COTITY[code];
      }
    });

    cacheCotacoes = cotacoes;
    ultimaAtualizacao = agora;
    return { sucesso: true, dados: cotacoes, fonte: 'api', timestamp: agora };
  } catch (error) {
    console.warn('Falha ao obter cotações da API pública. Usando valores de referência padrão.', error);
    cacheCotacoes = FALLBACK_COTITY;
    ultimaAtualizacao = agora;
    return { sucesso: true, dados: FALLBACK_COTITY, fonte: 'fallback', timestamp: agora };
  }
};
