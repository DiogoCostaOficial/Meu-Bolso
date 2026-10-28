/**
 * MOTOR DE VOZ NEURAL INFANTIL DO FIN (CRIANÇA ~10 ANOS) - ZERO CORTES
 * - Divide qualquer explicação em frases curtas naturais respeitando a pontuação (, . ! ? : ;)
 * - Busca os áudios neurais MP3 de cada frase e retorna tanto os chunks Base64 individuais
 *   (para reprodução sequencial perfeita sem falha de cabeçalho MP3) quanto o buffer combinado.
 * - Com cache em memória para resposta imediata (0ms).
 */

const ttsAudioCache = new Map();
const MAX_CACHE_ITEMS = 150;

const LANG_MAP = {
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-PT',
  en: 'en',
  es: 'es',
  it: 'it',
  zh: 'zh-CN',
  fr: 'fr',
  de: 'de'
};

/**
 * Divide uma narração em frases naturais de até ~160 caracteres sem jamás cortar palavras.
 */
function splitNarrationIntoChunks(text = '', maxLen = 160) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  // Divide inicialmente por fim de frase (. ! ? ; :)
  const rawSentences = clean.split(/(?<=[.!?;:])\s+/);
  const chunks = [];
  let current = '';

  for (const sentence of rawSentences) {
    if ((current + ' ' + sentence).trim().length <= maxLen) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current);
      if (sentence.length <= maxLen) {
        current = sentence;
      } else {
        // Se uma frase única for maior que maxLen, divide nas vírgulas
        const subParts = sentence.split(/(?<=,)\s+/);
        let subCurrent = '';
        for (const sub of subParts) {
          if ((subCurrent + ' ' + sub).trim().length <= maxLen) {
            subCurrent = (subCurrent + ' ' + sub).trim();
          } else {
            if (subCurrent) chunks.push(subCurrent);
            if (sub.length <= maxLen) {
              subCurrent = sub;
            } else {
              const words = sub.split(' ');
              let wordBuf = '';
              for (const w of words) {
                if ((wordBuf + ' ' + w).trim().length <= maxLen) {
                  wordBuf = (wordBuf + ' ' + w).trim();
                } else {
                  if (wordBuf) chunks.push(wordBuf);
                  wordBuf = w;
                }
              }
              subCurrent = wordBuf;
            }
          }
        }
        current = subCurrent;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Busca o buffer MP3 neural de um trecho de texto.
 */
async function fetchChunkMp3Buffer(chunkText, tl = 'pt-BR') {
  const encoded = encodeURIComponent(chunkText);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${encodeURIComponent(tl)}&total=1&idx=0&textlen=${chunkText.length}&client=tw-ob`;

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      Referer: 'https://translate.google.com/'
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao sintetizar trecho de voz neural (HTTP ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Gera os chunks MP3 neurais completos de toda a fala da cena.
 */
async function synthesizeFullNarrationMp3({ text, language = 'pt-BR' }) {
  const cleanText = String(text || '').trim();
  if (!cleanText) {
    throw new Error('Texto de narração vazio.');
  }

  const tl = LANG_MAP[language] || LANG_MAP[language.split('-')[0]] || 'pt-BR';
  const cacheKey = `${tl}::${cleanText}`;

  if (ttsAudioCache.has(cacheKey)) {
    return ttsAudioCache.get(cacheKey);
  }

  const textChunks = splitNarrationIntoChunks(cleanText, 160);
  const buffers = await Promise.all(
    textChunks.map((chunk) => fetchChunkMp3Buffer(chunk, tl))
  );

  const audioChunks = buffers.map(
    (buf) => `data:audio/mpeg;base64,${buf.toString('base64')}`
  );

  const result = {
    textChunks,
    audioChunks
  };

  if (ttsAudioCache.size >= MAX_CACHE_ITEMS) {
    const oldestKey = ttsAudioCache.keys().next().value;
    ttsAudioCache.delete(oldestKey);
  }
  ttsAudioCache.set(cacheKey, result);

  return result;
}

module.exports = {
  synthesizeFullNarrationMp3
};
