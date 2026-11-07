// src/components/NivelExperienciaModal.jsx
import React from 'react';
import { useLevel } from '../contexts/LevelContext';
import {
  X,
  Check,
  CheckCircle2,
  Sparkles,
  Sprout,
  Layers,
  Crown,
  ArrowRight,
  HelpCircle,
  Compass
} from 'lucide-react';

const LEVEL_ICONS = {
  Sprout: Sprout,
  CheckCircle2: CheckCircle2,
  Layers: Layers,
  Crown: Crown,
};

const NivelExperienciaModal = () => {
  const {
    currentLevel,
    changeLevel,
    allLevels,
    isLevelModalOpen,
    closeLevelModal,
    openOnboardingModal
  } = useLevel();

  if (!isLevelModalOpen) return null;

  const handleSelectLevel = (levelId) => {
    changeLevel(levelId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-custom-card border border-custom-color rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-custom-main">
        {/* Header do Modal */}
        <div className="p-6 border-b border-custom-color flex items-center justify-between sticky top-0 bg-custom-card/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-custom-gold/15 border border-custom-gold/30 flex items-center justify-center text-custom-gold shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-custom-main flex items-center gap-2">
                Modo de Uso & Níveis do Sistema
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-custom-gold/20 text-custom-gold border border-custom-gold/40 font-semibold">
                  Livre & Sem Bloqueios
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Escolha o nível que melhor se adapta à sua rotina financeira. Você pode alternar a qualquer momento.
              </p>
            </div>
          </div>
          <button
            onClick={closeLevelModal}
            className="p-2 text-gray-400 hover:text-custom-main hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade de Níveis */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(allLevels).map((level) => {
            const Icon = LEVEL_ICONS[level.iconName] || Crown;
            const isCurrent = currentLevel === level.id;

            return (
              <div
                key={level.id}
                className={`relative flex flex-col rounded-xl border p-5 transition-all duration-200 ${
                  isCurrent
                    ? `${level.colorBg} ${level.colorBorder} shadow-lg ring-2 ${level.colorRing}`
                    : 'bg-white/40 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-md'
                }`}
              >
                {/* Badge Ativo */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-custom-gold text-black text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    MODO ATIVO
                  </div>
                )}

                {/* Topo do Card */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${level.colorBg} ${level.colorText} border ${level.colorBorder}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-custom-main">
                      {level.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs font-medium text-custom-gold dark:text-amber-400 mb-2">
                  {level.tagline}
                </p>

                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 flex-1">
                  {level.description}
                </p>

                {/* Lista de Recursos */}
                <div className="space-y-2 mb-5 border-t border-b border-custom-color py-3">
                  {level.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      {feat.included ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600 flex-shrink-0 text-center leading-3">—</span>
                      )}
                      <span className={feat.included ? 'text-gray-700 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500 line-through opacity-70'}>
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ações */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleSelectLevel(level.id)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-custom-gold text-black cursor-default shadow-xs'
                        : 'bg-gray-100 dark:bg-slate-800 hover:bg-custom-gold hover:text-black text-custom-main'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-4 h-4" />
                        Nível Atual
                      </>
                    ) : (
                      <>
                        Mudar para {level.name}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {level.id === 'iniciante' && (
                    <button
                      onClick={() => {
                        handleSelectLevel('iniciante');
                        closeLevelModal();
                        openOnboardingModal();
                      }}
                      className="w-full text-center text-[11px] text-custom-gold hover:underline py-1 font-medium cursor-pointer"
                    >
                      🚀 Abrir Questionário Inicial
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé explicativo */}
        <div className="p-4 bg-gray-50 dark:bg-slate-900/60 border-t border-custom-color flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-custom-gold flex-shrink-0" />
            <span>
              <strong>Dica:</strong> Iniciantes podem focar no essencial e subir de nível conforme ganham confiança. Seus dados nunca são apagados ao mudar de nível.
            </span>
          </div>
          <button
            onClick={closeLevelModal}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-custom-main font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NivelExperienciaModal;
