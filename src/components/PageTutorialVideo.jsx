import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { HelpCircle, Play, ChevronDown, X, Film } from 'lucide-react';
import FinVideoPlayer from './FinVideoPlayer';
import { getVideoForRouteOrId, getVideosForRoute } from '../utils/finManualVideos';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedVideo } from '../utils/finI18n';
import { stopFinChildVoice } from '../utils/finChildVoice';

/**
 * BOTÃO COMPACTO DE AJUDA / VIDEOAULAS DA TELA ATUAL
 * - Fica discreto no topo da tela ("Ajuda").
 * - Ao clicar, abre um menu compacto listando "Videoaula 1", "Videoaula 2", etc.
 * - Ao escolher a videoaula, abre o player em um modal limpo sem ocupar espaço fixo na tela.
 */
const PageTutorialVideo = () => {
  const location = useLocation();
  const { language, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageVideos = getVideosForRoute(location.pathname);
  const rawVideo = pageVideos[0] || getVideoForRouteOrId(location.pathname);
  const [activeVideoId, setActiveVideoId] = useState(rawVideo?.id);
  const localizedVideo = getLocalizedVideo(rawVideo, language, t);

  // Fechar menu e player automaticamente e parar a voz ao trocar de tela
  useEffect(() => {
    setMenuOpen(false);
    setPlayerOpen(false);
    setActiveVideoId(rawVideo?.id);
    stopFinChildVoice();
  }, [location.pathname, rawVideo?.id]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (!rawVideo) return null;

  const handleSelectLesson = (videoId) => {
    setActiveVideoId(videoId);
    setMenuOpen(false);
    setPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    stopFinChildVoice();
    setPlayerOpen(false);
  };

  const listaAulas = pageVideos.length > 0 ? pageVideos : [rawVideo];

  return (
    <>
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 text-xs font-bold shadow-xs transition-all cursor-pointer"
          title="Ver vídeo-aulas explicativas desta tela"
        >
          <Film className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Vídeo-Aula</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-custom-card dark:bg-slate-900 border border-custom-color shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 border-b border-custom-color/60 mb-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <Film className="w-3 h-3" />
                Videoaulas desta Tela
              </p>
              <p className="text-[11px] font-semibold text-custom-main truncate mt-0.5">
                {localizedVideo.title}
              </p>
            </div>

            <div className="space-y-1">
              {listaAulas.map((vid, idx) => {
                const locVid = getLocalizedVideo(vid, language, t);
                const tituloCurto =
                  listaAulas.length > 1
                    ? `Videoaula ${idx + 1}`
                    : 'Videoaula 1';
                const descricaoAula =
                  vid.partLabel
                    ? vid.partLabel.replace(/^🎬\s*Vídeo\s*\d+:\s*/i, '')
                    : locVid.shortLabel;

                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => handleSelectLesson(vid.id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-500/15 text-left transition cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-custom-main group-hover:text-amber-400 transition-colors">
                        {tituloCurto}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                        {descricaoAula}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal da Videoaula quando acionada */}
      {playerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
          onClick={handleClosePlayer}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-custom-card dark:bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-slate-900 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src="/assets/fin_coin_boy.png"
                    alt="FIN"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-white truncate">
                    {localizedVideo.title}
                  </h3>
                  <p className="text-[11px] text-amber-300/80 truncate">
                    Demonstração passo a passo na tela • Velocidade 1x / 1.25x / 1.5x
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClosePlayer}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold px-2.5"
                title="Fechar videoaula"
              >
                <X className="w-4 h-4" />
                <span>Fechar</span>
              </button>
            </div>

            <div className="p-4 max-h-[85vh] overflow-y-auto">
              <FinVideoPlayer
                initialTopicId={activeVideoId || rawVideo.id}
                singleTopicMode={true}
                onClose={handleClosePlayer}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PageTutorialVideo;
