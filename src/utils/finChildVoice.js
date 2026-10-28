import api from '../services/api';
import { SPEECH_LOCALE_BY_LANG } from './finI18n';

/**
 * MOTOR DE VOZ INFANTIL NATURAL DO FIN (CRIANÇA ~10 ANOS) - ZERO CORTES
 *
 * Por que a voz anterior parecia robótica e cortava?
 * 1. O Web Speech API padrão do Windows usa vozes SAPI5 antigas ("Microsoft Maria Desktop")
 *    e o Chrome possui um bug nativo que interrompe qualquer SpeechSynthesisUtterance após ~14 segundos.
 * 2. Agora usamos o motor Neural MP3 (/user/fin-video/tts) reproduzido via HTML5 <audio> com
 *    ajuste acústico de formantes infantis (`preservesPitch = false` + `playbackRate = 1.17`),
 *    gerando o timbre natural e alegre de uma criança de ~10 anos!
 * 3. A transição de cena ocorre EXCLUSIVAMENTE no evento `onended` do último bloco de áudio,
 *    tornando impossível cortar qualquer frase no meio!
 */

const clientAudioCache = new Map();
let activeController = null;

export const FIN_VOICE_OPTIONS = [
  { id: 'homem', label: '👨 Homem', title: 'Voz Masculina Adulta (Padrão)' },
  { id: 'mulher', label: '👩 Mulher', title: 'Voz Feminina Adulta' },
  { id: 'crianca', label: '👦 Criança', title: 'Voz Infantil (~10 anos)' }
];

const VOICE_STORAGE_KEY = 'fin_video_voice_type';

export function getSavedFinVoiceType() {
  try {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    if (saved === 'homem' || saved === 'mulher' || saved === 'crianca') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'homem';
}

export function saveFinVoiceType(voiceType) {
  try {
    if (voiceType === 'homem' || voiceType === 'mulher' || voiceType === 'crianca') {
      localStorage.setItem(VOICE_STORAGE_KEY, voiceType);
    }
  } catch {
    // ignore
  }
}

/**
 * Divide texto em frases curtas para o fallback de SpeechSynthesis nunca bater no limite de 14s do Chrome.
 */
function splitIntoShortClauses(text = '', maxLen = 115) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const parts = clean.split(/(?<=[.!?;:,])\s+/);
  const clauses = [];
  let current = '';

  for (const p of parts) {
    if ((current + ' ' + p).trim().length <= maxLen) {
      current = (current + ' ' + p).trim();
    } else {
      if (current) clauses.push(current);
      current = p;
    }
  }
  if (current) clauses.push(current);
  return clauses;
}

/**
 * Escolhe a voz mais natural/jovem disponível no navegador (caso use fallback offline).
 */
function pickBestChildFallbackVoice(targetLocale = 'pt-BR') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const langPrefix = targetLocale.split('-')[0].toLowerCase();

  const matchingLang = voices.filter(
    (v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix)
  );
  if (matchingLang.length === 0) return null;

  // Priorizar vozes "Natural" / "Online" / "Google" / femininas jovens (que com pitch infantil soam como menino de 10 anos)
  const scored = matchingLang.map((v) => {
    const name = (v.name || '').toLowerCase();
    let score = 0;
    if (name.includes('natural') || name.includes('online')) score += 50;
    if (name.includes('thalita') || name.includes('francisca') || name.includes('giovanna') || name.includes('ana')) score += 40;
    if (name.includes('google')) score += 35;
    if (name.includes('luciana') || name.includes('vitória') || name.includes('vitoria')) score += 25;
    if (name.includes('desktop')) score -= 20; // Evitar vozes SAPI5 robóticas antigas se houver opção melhor
    return { voice: v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.voice || matchingLang[0];
}

/**
 * Para imediatamente qualquer fala/áudio em andamento do FIN.
 */
export function stopFinChildVoice() {
  if (activeController) {
    activeController.cancel();
    activeController = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Reproduz a explicação completa do FIN com voz infantil (~10 anos) e ZERO cortes.
 * @param {Object} params
 * @param {string} params.text Texto completo a ser narrado
 * @param {string} params.language Idioma atual (pt-BR, en, es, etc.)
 * @param {(pct: number) => void} [params.onProgress] Callback de progresso real (0 a 100)
 * @param {() => void} [params.onComplete] Callback disparado APENAS quando toda a fala terminar 100%
 * @param {() => void} [params.onError] Callback caso não seja possível reproduzir áudio
 */
export function speakWithFinChildVoice({
  text,
  language = 'pt-BR',
  onProgress,
  onComplete,
  onError
}) {
  stopFinChildVoice();

  const cleanText = String(text || '').trim();
  if (!cleanText) {
    if (onComplete) onComplete();
    return { cancel: () => {} };
  }

  let cancelled = false;
  let currentAudio = null;

  const controller = {
    cancel: () => {
      cancelled = true;
      if (currentAudio) {
        try {
          currentAudio.onended = null;
          currentAudio.onerror = null;
          currentAudio.ontimeupdate = null;
          currentAudio.pause();
          currentAudio.src = '';
        } catch {
          // ignore
        }
        currentAudio = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  activeController = controller;

  // Fallback sequencial por cláusulas curtas (nunca corta em 14s no Chrome)
  const runBrowserFallback = () => {
    if (cancelled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError();
      return;
    }

    const clauses = splitIntoShortClauses(cleanText, 115);
    if (clauses.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const targetLocale = SPEECH_LOCALE_BY_LANG[language] || 'pt-BR';
    const bestVoice = pickBestChildFallbackVoice(targetLocale);
    let idx = 0;

    const speakNextClause = () => {
      if (cancelled) return;
      if (idx >= clauses.length) {
        if (onProgress) onProgress(100);
        if (onComplete) onComplete();
        return;
      }

      const clauseText = clauses[idx];
      const utter = new SpeechSynthesisUtterance(clauseText);
      utter.lang = targetLocale;
      if (bestVoice) utter.voice = bestVoice;
      // Timbre de criança de ~10 anos (mais agudo e alegre)
      utter.pitch = 1.38;
      utter.rate = 1.08;

      utter.onstart = () => {
        if (cancelled) return;
        const basePct = (idx / clauses.length) * 100;
        if (onProgress) onProgress(Math.min(95, Math.round(basePct + 5)));
      };

      utter.onend = () => {
        if (cancelled) return;
        idx += 1;
        const donePct = (idx / clauses.length) * 100;
        if (onProgress) onProgress(Math.min(99, Math.round(donePct)));
        speakNextClause();
      };

      utter.onerror = () => {
        if (cancelled) return;
        idx += 1;
        speakNextClause();
      };

      window.speechSynthesis.speak(utter);
    };

    speakNextClause();
  };

  // Reproduz a fila de chunks MP3 neurais com formantes de criança de ~10 anos
  const playNeuralAudioChunks = (audioChunks) => {
    if (cancelled) return;
    if (!Array.isArray(audioChunks) || audioChunks.length === 0) {
      runBrowserFallback();
      return;
    }

    let chunkIdx = 0;

    const playNextChunk = () => {
      if (cancelled) return;
      if (chunkIdx >= audioChunks.length) {
        if (onProgress) onProgress(100);
        if (onComplete) onComplete();
        return;
      }

      const audio = new Audio(audioChunks[chunkIdx]);
      currentAudio = audio;

      // Ajuste acústico de formantes + pitch para soar como um menino animado de ~10 anos (estilo dublagem infantil)
      try {
        audio.preservesPitch = false;
        audio.mozPreservesPitch = false;
        audio.webkitPreservesPitch = false;
      } catch {
        // ignore
      }
      audio.playbackRate = 1.17;

      audio.ontimeupdate = () => {
        if (cancelled || !audio.duration || isNaN(audio.duration)) return;
        const chunkFraction = Math.min(1, audio.currentTime / audio.duration);
        const overallPct = ((chunkIdx + chunkFraction) / audioChunks.length) * 100;
        if (onProgress) onProgress(Math.min(99, overallPct));
      };

      audio.onended = () => {
        if (cancelled) return;
        chunkIdx += 1;
        playNextChunk();
      };

      audio.onerror = () => {
        if (cancelled) return;
        // Se falhar a reprodução do chunk MP3, usa o fallback sequencial sem cortes
        runBrowserFallback();
      };

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (!cancelled) {
            runBrowserFallback();
          }
        });
      }
    };

    playNextChunk();
  };

  // Busca no cache local ou requisita os chunks MP3 neurais do backend
  const cacheKey = `${language}::${cleanText}`;
  if (clientAudioCache.has(cacheKey)) {
    playNeuralAudioChunks(clientAudioCache.get(cacheKey));
  } else {
    api
      .post('/user/fin-video/tts', { text: cleanText, language })
      .then((res) => {
        if (cancelled) return;
        const chunks = res.data?.audioChunks;
        if (Array.isArray(chunks) && chunks.length > 0) {
          clientAudioCache.set(cacheKey, chunks);
          playNeuralAudioChunks(chunks);
        } else {
          runBrowserFallback();
        }
      })
      .catch(() => {
        if (!cancelled) {
          runBrowserFallback();
        }
      });
  }

  return controller;
}
