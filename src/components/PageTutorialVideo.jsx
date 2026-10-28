import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Film, Play, ChevronDown, ChevronUp, X } from 'lucide-react';
import FinVideoPlayer from './FinVideoPlayer';
import { getVideoForRouteOrId, getVideosForRoute } from '../utils/finManualVideos';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedVideo } from '../utils/finI18n';
import { stopFinChildVoice } from '../utils/finChildVoice';

/**
 * COMPONENTE DE VÍDEO EXPLICATIVO EXCLUSIVO DE CADA TELA
 * - Na tela de Orçamento (/orcamento), exibe SOMENTE os vídeos da tela de Orçamento (Parte 1 e Parte 2).
 * - Na tela de Despesas (/despesas), exibe SOMENTE os vídeos da tela de Despesas (Parte 1: Nova Despesa 11 Campos + Parte 2: Filtros/Lista).
 * - Na tela de Receitas (/receitas), exibe SOMENTE os vídeos da tela de Receitas (Parte 1 e Parte 2).
 * - E assim por diante para cada módulo do sistema (singleTopicMode={true}).
 */
const PageTutorialVideo = () => {
  const location = useLocation();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const pageVideos = getVideosForRoute(location.pathname);
  const rawVideo = pageVideos[0] || getVideoForRouteOrId(location.pathname);
  const [activeVideoId, setActiveVideoId] = useState(rawVideo?.id);
  const localizedVideo = getLocalizedVideo(rawVideo, language, t);

  // Fechar o player automaticamente e parar a voz ao trocar de tela no menu lateral
  useEffect(() => {
    setIsOpen(false);
    setActiveVideoId(rawVideo?.id);
    stopFinChildVoice();
  }, [location.pathname, rawVideo?.id]);

  if (!rawVideo) return null;

  const handleOpenSpecificPart = (videoId) => {
    setActiveVideoId(videoId);
    setIsOpen(true);
  };

  return (
    <div className="mb-5">
      {/* Barra Dedicada da Tela Atual */}
      <div className="rounded-2xl bg-custom-card border border-amber-500/40 shadow-custom overflow-hidden transition-all">
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
              <img
                src="/assets/fin_coin_boy.png"
                alt="FIN Vídeo da Tela"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-black flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  {pageVideos.length > 1
                    ? `${pageVideos.length} Vídeos Explicativos desta Tela`
                    : 'Vídeo desta Tela'}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-custom-main truncate">
                  {localizedVideo.title}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                Explicação passo a passo para leigos mostrando todos os campos reais desta tela
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isOpen && pageVideos.length > 1 ? (
              pageVideos.map((vid, idx) => (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => handleOpenSpecificPart(vid.id)}
                  className="px-3.5 py-2 rounded-full font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm bg-custom-gold text-black hover:opacity-95"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>{vid.partLabel || `Vídeo ${idx + 1}`}</span>
                </button>
              ))
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm flex-shrink-0 ${
                  isOpen
                    ? 'bg-slate-800 text-amber-400 border border-amber-400/50 hover:bg-slate-700'
                    : 'bg-custom-gold text-black hover:opacity-95'
                }`}
              >
                {isOpen ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Fechar Vídeo desta Tela</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>Assistir Vídeo desta Tela ({localizedVideo.shortLabel})</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Player Exclusivo da Tela Atual (singleTopicMode={true}) */}
        {isOpen && (
          <div className="p-4 border-t border-custom-color bg-custom-primary/30 animate-in fade-in duration-200">
            <FinVideoPlayer
              initialTopicId={activeVideoId || rawVideo.id}
              singleTopicMode={true}
              onClose={() => {
                stopFinChildVoice();
                setIsOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageTutorialVideo;
