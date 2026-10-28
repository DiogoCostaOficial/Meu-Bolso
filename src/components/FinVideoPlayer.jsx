import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Film,
  CheckCircle2,
  Loader2,
  MousePointer
} from 'lucide-react';
import { FIN_MANUAL_VIDEOS, getVideoForRouteOrId, getVideosForRoute } from '../utils/finManualVideos';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedVideo } from '../utils/finI18n';
import { speakWithFinChildVoice, stopFinChildVoice } from '../utils/finChildVoice';
import FinScreenReplica from './FinScreenReplica';
import api from '../services/api';

const MASCOT_IMAGES = {
  wallet: '/assets/fin_wallet_boy.png',
  coin: '/assets/fin_coin_boy.png',
  bill: '/assets/fin_bill_boy.png',
  gold: '/assets/fin_gold_boy.png'
};

const FinVideoPlayer = ({
  initialTopicId,
  currentFont = {
    title: 'text-sm',
    body: 'text-sm',
    secondary: 'text-xs',
    chip: 'text-xs'
  },
  singleTopicMode = false,
  onClose,
  onNavigateToRoute
}) => {
  const { language, t } = useLanguage();
  const initialVideo = getVideoForRouteOrId(initialTopicId);
  const [selectedTopicId, setSelectedTopicId] = useState(initialVideo.id);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [sceneProgressPct, setSceneProgressPct] = useState(0);
  const [typedCharsCount, setTypedCharsCount] = useState(0);

  // Estado para vídeo MP4 pré-gerado via gemini-omni-1.1-flash
  const [availableMp4Ids, setAvailableMp4Ids] = useState([]);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [preferMp4Mode, setPreferMp4Mode] = useState(true);
  const [showGeminiConfig, setShowGeminiConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('fin_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [isGeneratingMp4, setIsGeneratingMp4] = useState(false);
  const [genMessage, setGenMessage] = useState(null);

  const speechFinishedRef = useRef(false);
  const utteranceRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const progressTimerRef = useRef(null);
  const typingTimerRef = useRef(null);

  const rawVideo = getVideoForRouteOrId(selectedTopicId);
  const currentVideo = getLocalizedVideo(rawVideo, language, t);
  const pageVideos = getVideosForRoute(initialTopicId || rawVideo.route || rawVideo.id);
  const scenes = currentVideo.scenes || [];
  const currentScene = scenes[sceneIndex] || scenes[0];
  const mockFields = currentVideo.mockFields || [];
  const hasMp4ForCurrentTopic = availableMp4Ids.includes(currentVideo.id);

  // Progresso contínuo único do vídeo inteiro (0 a 100%)
  const totalVideoProgressPct =
    scenes.length > 0
      ? Math.min(100, ((sceneIndex + sceneProgressPct / 100) / scenes.length) * 100)
      : 0;

  // Consultar no backend quais vídeos .mp4 já foram pré-gerados pelo gemini-omni-1.1-flash
  useEffect(() => {
    let mounted = true;
    api
      .get('/user/fin-video/status')
      .then((res) => {
        if (!mounted) return;
        if (Array.isArray(res.data?.availableMp4Ids)) {
          setAvailableMp4Ids(res.data.availableMp4Ids);
        }
        setHasServerKey(Boolean(res.data?.hasServerApiKey));
      })
      .catch(() => {});

    return () => {
      mounted = false;
      stopFinChildVoice();
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  // Sincronizar quando mudar tópico inicial
  useEffect(() => {
    if (initialTopicId) {
      const matched = getVideoForRouteOrId(initialTopicId);
      setSelectedTopicId(matched.id);
      setSceneIndex(0);
      setSceneProgressPct(0);
      setTypedCharsCount(0);
      setIsPlaying(true);
    }
  }, [initialTopicId]);

  // Efeito de digitação letra por letra (Typewriter) simulando o FIN preenchendo o campo na tela
  useEffect(() => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setTypedCharsCount(0);

    if (!isPlaying) return;
    const fullText = String(currentScene?.typedValue || '');
    if (!fullText) return;

    // Começa a digitar logo após o cursor do FIN chegar no campo (350ms)
    const startDelay = setTimeout(() => {
      typingTimerRef.current = setInterval(() => {
        setTypedCharsCount((prev) => {
          if (prev >= fullText.length) {
            clearInterval(typingTimerRef.current);
            return fullText.length;
          }
          return prev + 1;
        });
      }, 55);
    }, 350);

    return () => {
      clearTimeout(startDelay);
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [selectedTopicId, sceneIndex, isPlaying, currentScene?.typedValue]);

  // Função auxiliar que avança para o próximo passo do vídeo contínuo APENAS quando a fala concluiu
  // Se a tela atual tiver Parte 1 e Parte 2 (ex: Despesas, Receitas, Orçamento), ao terminar a Parte 1 passa automaticamente para a Parte 2!
  const moveToNextStep = () => {
    setSceneProgressPct(0);
    setSceneIndex((currIdx) => {
      if (currIdx + 1 < scenes.length) {
        return currIdx + 1;
      } else {
        const currentPartIdx = pageVideos.findIndex((v) => v.id === rawVideo.id);
        if (currentPartIdx !== -1 && currentPartIdx + 1 < pageVideos.length) {
          const nextPartVideo = pageVideos[currentPartIdx + 1];
          setSelectedTopicId(nextPartVideo.id);
          return 0;
        }
        setIsPlaying(false);
        return currIdx;
      }
    });
  };

  // Motor de Voz Infantil (~10 anos) + Sincronização Sem Cortes:
  // - Quando o som está ligado (!isMuted), NENHUM timer corta a fala: a cena SÓ avança no callback `onComplete`
  //   após a última palavra do áudio terminar 100%!
  // - Quando o som está silenciado (isMuted), avança pelo tempo de leitura confortável.
  useEffect(() => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    stopFinChildVoice();

    if (hasMp4ForCurrentTopic && preferMp4Mode) return;
    if (!isPlaying || !currentScene?.narration) return;

    speechFinishedRef.current = false;
    setSceneProgressPct(0);

    const narrationText = String(currentScene.narration || '');

    if (!isMuted) {
      const voiceCtrl = speakWithFinChildVoice({
        text: narrationText,
        language,
        onProgress: (pct) => {
          setSceneProgressPct(pct);
        },
        onComplete: () => {
          speechFinishedRef.current = true;
          setSceneProgressPct(100);
          advanceTimeoutRef.current = setTimeout(() => {
            moveToNextStep();
          }, 950);
        },
        onError: () => {
          // Caso o áudio esteja indisponível, usa tempo de leitura completo sem cortar
          const fallbackMs = Math.max(11000, narrationText.length * 85);
          advanceTimeoutRef.current = setTimeout(() => {
            setSceneProgressPct(100);
            moveToNextStep();
          }, fallbackMs);
        }
      });

      return () => {
        voiceCtrl.cancel();
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      };
    }

    // Modo Sem Som (isMuted = true): avança suavemente pelo tempo de leitura
    const readingDurationMs = Math.max(11000, narrationText.length * 85);
    const stepMs = 100;
    const increment = (stepMs / readingDurationMs) * 100;

    progressTimerRef.current = setInterval(() => {
      setSceneProgressPct((prev) => {
        if (prev + increment >= 100) {
          clearInterval(progressTimerRef.current);
          advanceTimeoutRef.current = setTimeout(() => {
            moveToNextStep();
          }, 400);
          return 100;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      stopFinChildVoice();
    };
  }, [
    selectedTopicId,
    sceneIndex,
    isPlaying,
    isMuted,
    hasMp4ForCurrentTopic,
    preferMp4Mode,
    language,
    currentScene?.narration
  ]);

  const handleSelectTopic = (id) => {
    setSelectedTopicId(id);
    setSceneIndex(0);
    setSceneProgressPct(0);
    setTypedCharsCount(0);
    setIsPlaying(true);
    setGenMessage(null);
  };

  const handlePrevScene = () => {
    setSceneProgressPct(0);
    setTypedCharsCount(0);
    setSceneIndex((prev) => Math.max(0, prev - 1));
    setIsPlaying(true);
  };

  const handleNextScene = () => {
    setSceneProgressPct(0);
    setTypedCharsCount(0);
    setSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1));
    setIsPlaying(true);
  };

  const handleRestart = () => {
    setSceneIndex(0);
    setSceneProgressPct(0);
    setTypedCharsCount(0);
    setIsPlaying(true);
  };

  const handleGenerateMp4WithGemini = async (e) => {
    e.preventDefault();
    setIsGeneratingMp4(true);
    setGenMessage(null);

    try {
      if (customApiKey.trim()) {
        localStorage.setItem('fin_gemini_api_key', customApiKey.trim());
      }

      const res = await api.post('/user/fin-video/generate', {
        topicId: currentVideo.id,
        language,
        apiKey: customApiKey.trim() || undefined
      });

      if (res.data?.sucesso) {
        setAvailableMp4Ids((prev) => Array.from(new Set([...prev, currentVideo.id])));
        setPreferMp4Mode(true);
        setGenMessage({
          type: 'success',
          text: `✅ Vídeo MP4 de "${currentVideo.shortLabel}" gerado com sucesso via gemini-omni-1.1-flash!`
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.erro ||
        err.message ||
        'Não foi possível gerar o vídeo MP4. Verifique sua chave GEMINI_API_KEY.';
      setGenMessage({
        type: 'error',
        text: `⚠️ ${msg}`
      });
    } finally {
      setIsGeneratingMp4(false);
    }
  };

  // Descobre qual valor mostrar em cada campo simulado da tela:
  // - Campos de cenas anteriores já aparecem preenchidos com ✅
  // - O campo da cena atual mostra o efeito de digitação letra por letra (Typewriter) + cursor piscando |
  // - Campos de cenas futuras mostram o placeholder vazio
  const getFieldDisplayState = (fieldId) => {
    for (let i = 0; i < scenes.length; i++) {
      const sc = scenes[i];
      const isPrimary = sc.activeFieldId === fieldId;
      const isSecondary = sc.AlsoFillFieldId === fieldId;

      if (isPrimary || isSecondary) {
        const targetVal = isPrimary ? sc.typedValue : sc.secondaryTypedValue || sc.typedValue;
        if (i < sceneIndex) {
          return { status: 'completed', value: targetVal };
        }
        if (i === sceneIndex) {
          const partial = String(targetVal || '').slice(0, typedCharsCount);
          return { status: 'typing', value: partial };
        }
      }
    }
    return { status: 'empty', value: '' };
  };

  const mascotImg = MASCOT_IMAGES[currentScene?.pose || currentVideo.mascotPose] || MASCOT_IMAGES.coin;

  return (
    <div className="space-y-3">
      {/* Barra seletora de Capítulos do Manual (Exibida apenas dentro do FIN; na página exibe apenas o vídeo da própria tela!) */}
      {!singleTopicMode ? (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {FIN_MANUAL_VIDEOS.map((vid) => {
            const localizedVid = getLocalizedVideo(vid, language, t);
            const active = vid.id === currentVideo.id;
            const hasMp4 = availableMp4Ids.includes(vid.id);
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => handleSelectTopic(vid.id)}
                className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer flex-shrink-0 ${currentFont.chip} ${
                  active
                    ? 'bg-custom-gold text-black shadow-sm'
                    : 'bg-custom-primary/30 text-custom-main hover:bg-amber-500/15 border border-custom-color'
                }`}
              >
                <span>{localizedVid.shortLabel}</span>
                {hasMp4 && <CheckCircle2 className="w-3 h-3 text-emerald-600" title="MP4 pré-gerado disponível" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className={`${currentFont.secondary} font-extrabold text-custom-main`}>
                Vídeo Explicativo desta Tela: <span className="text-amber-500">{currentVideo.title}</span>
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black whitespace-nowrap">
              {currentVideo.shortLabel}
            </span>
          </div>

          {/* Se esta tela tiver mais de 1 vídeo explicativo (ex: Parte 1 e Parte 2), mostra os botões das Partes desta tela */}
          {pageVideos.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              {pageVideos.map((partVid, idx) => {
                const isPartActive = partVid.id === currentVideo.id;
                return (
                  <button
                    key={partVid.id}
                    type="button"
                    onClick={() => handleSelectTopic(partVid.id)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                      isPartActive
                        ? 'bg-custom-gold text-black shadow-sm ring-2 ring-amber-400/50'
                        : 'bg-slate-800 text-amber-200 hover:bg-slate-700 border border-amber-500/30'
                    }`}
                  >
                    <span>{partVid.partLabel || `🎬 Vídeo ${idx + 1}: ${partVid.shortLabel}`}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Palco do Vídeo Contínuo */}
      {hasMp4ForCurrentTopic && preferMp4Mode ? (
        <div className="rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-lg">
          <video
            key={currentVideo.mp4Url}
            src={currentVideo.mp4Url}
            controls
            autoPlay
            className="w-full aspect-video object-cover bg-black"
          />
          <div className="p-3 bg-slate-900/95 text-white flex items-center justify-between gap-2">
            <span className={`${currentFont.chip} text-amber-400 font-bold flex items-center gap-1.5`}>
              <Film className="w-4 h-4" /> Vídeo MP4 Gerado via Google Gemini Omni 1.1 Flash
            </span>
            <button
              type="button"
              onClick={() => setPreferMp4Mode(false)}
              className={`${currentFont.chip} px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer`}
            >
              Ver Simulação Interativa da Tela
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 text-white shadow-2xl relative">
          {/* Barra de Progresso Contínua Única do Vídeo Inteiro */}
          <div className="px-4 pt-3 pb-2 bg-slate-900 border-b border-white/10">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                🎬 Demonstração na Tela Real do Projeto: {currentScene?.badge}
              </span>
              <span className="text-gray-300">
                Etapa {sceneIndex + 1} de {scenes.length} ({Math.round(totalVideoProgressPct)}%)
              </span>
            </div>
            <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-150"
                style={{ width: `${totalVideoProgressPct}%` }}
              />
            </div>
          </div>

          {/* RÉPLICA FIEL 1:1 DA TELA REAL DO PROJETO + CURSOR ANIMADO DO FIN */}
          <div className="p-2.5 sm:p-3.5 bg-slate-900/95 relative overflow-hidden">
            <FinScreenReplica
              videoId={currentVideo.id}
              sceneIndex={sceneIndex}
              currentScene={currentScene}
              typedCharsCount={typedCharsCount}
            />
          </div>

          {/* FAIXA INFERIOR: MASCOTE FIN (PICTURE-IN-PICTURE) + LEGENDA COMPLETA DA EXPLICAÇÃO */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-t border-amber-500/30 flex items-center gap-3.5">
            <div className="relative flex-shrink-0">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border-2 border-amber-400 overflow-hidden shadow-lg transition-transform duration-300 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              >
                <img
                  src={mascotImg}
                  alt="FIN explicando"
                  className="w-full h-full object-cover"
                />
              </div>
              {isPlaying && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[9px] shadow whitespace-nowrap">
                  🔊 EXPLICANDO
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-amber-400 mb-0.5">
                {currentScene?.visualTitle}
              </p>
              <p className={`${currentFont.secondary} text-amber-50 font-medium leading-relaxed`}>
                "{currentScene?.narration}"
              </p>
            </div>
          </div>

          {/* Controles do Player Contínuo */}
          <div className="px-4 py-2.5 bg-black/70 border-t border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="px-3 py-1.5 rounded-lg bg-amber-400 text-black hover:bg-amber-300 transition cursor-pointer font-extrabold text-xs flex items-center gap-1"
                title={isPlaying ? 'Pausar explicação' : 'Continuar explicação'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pausar' : 'Assistir'}</span>
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Reiniciar vídeo do começo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                  isMuted
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
                title={isMuted ? 'Ativar narração em voz' : 'Silenciar voz'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMuted ? 'Sem Som' : 'Voz IA'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevScene}
                disabled={sceneIndex === 0}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-0.5"
                title="Voltar etapa anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={handleNextScene}
                disabled={sceneIndex >= scenes.length - 1}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-0.5"
                title="Avançar próxima etapa"
              >
                <span>Próximo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ações Inferiores */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {!singleTopicMode && currentVideo.route && currentVideo.route.startsWith('/') && (
          <button
            type="button"
            onClick={() => onNavigateToRoute && onNavigateToRoute(currentVideo.route)}
            className={`flex-1 py-2 px-3 bg-custom-gold text-black rounded-xl font-bold hover:opacity-90 transition cursor-pointer ${currentFont.chip} shadow-sm`}
          >
            🚀 Abrir Tela de {currentVideo.shortLabel}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowGeminiConfig((s) => !s)}
          className={`py-2 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold transition cursor-pointer flex items-center gap-1.5 ${currentFont.chip}`}
          title="Pré-gerar arquivo de vídeo MP4 com Google Gemini Omni 1.1 Flash lendo o MANUAL_DE_USO.md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{hasMp4ForCurrentTopic ? 'Recriar MP4 (Gemini IA)' : 'Gerar MP4 (Gemini Omni)'}</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`py-2 px-3 rounded-xl bg-custom-primary/30 hover:bg-custom-primary/50 border border-custom-color font-semibold transition cursor-pointer ${currentFont.chip}`}
          >
            {singleTopicMode ? 'Fechar Vídeo' : 'Voltar'}
          </button>
        )}
      </div>

      {/* Gaveta de Pré-Geração via Google Gemini API */}
      {showGeminiConfig && (
        <form
          onSubmit={handleGenerateMp4WithGemini}
          className={`p-3.5 rounded-xl bg-custom-primary/30 border border-amber-500/30 space-y-2.5 ${currentFont.secondary}`}
        >
          <p className="font-bold text-amber-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Estúdio Google Gemini (Lê o MANUAL_DE_USO.md → Cria Vídeo MP4)
          </p>
          <p className={`${currentFont.chip} opacity-85 leading-relaxed`}>
            O sistema usa o <strong>gemini-3.8-flash</strong> para ler o capítulo de{' '}
            <strong>{currentVideo.title}</strong> no nosso Manual e o <strong>gemini-omni-1.1-flash</strong> para gerar o vídeo <code>.mp4</code> animado do FIN.
          </p>

          {!hasServerKey && (
            <div>
              <label className={`block ${currentFont.chip} font-bold mb-1`}>
                Chave GEMINI_API_KEY (Google AI Studio):
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Cole sua GEMINI_API_KEY (AIzaSy...)"
                className={`w-full px-3 py-2 bg-white dark:bg-slate-800 border border-custom-color rounded-lg ${currentFont.chip} text-custom-main`}
              />
            </div>
          )}

          {genMessage && (
            <div
              className={`p-2.5 rounded-lg border ${currentFont.chip} font-semibold ${
                genMessage.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-red-500/15 border-red-500/40 text-red-400'
              }`}
            >
              {genMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isGeneratingMp4}
            className={`w-full py-2 px-3 bg-amber-500 text-black font-extrabold rounded-lg hover:bg-amber-400 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 ${currentFont.chip}`}
          >
            {isGeneratingMp4 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Lendo Manual e Gerando MP4 no Gemini Omni...</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                <span>Pré-Gerar Vídeo MP4 de "{currentVideo.shortLabel}" Agora</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default FinVideoPlayer;
