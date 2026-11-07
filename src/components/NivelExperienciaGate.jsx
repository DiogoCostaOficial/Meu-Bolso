// src/components/NivelExperienciaGate.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLevel } from '../contexts/LevelContext';
import { USER_LEVELS, LEVEL_DEFINITIONS } from '../constants/userLevels';
import { Compass, Sparkles, ArrowLeft, Check, Unlock, ArrowRight } from 'lucide-react';

const PATH_MINIMUM_LEVEL = {
  '/dashboard': USER_LEVELS.INICIANTE,
  '/receitas': USER_LEVELS.INICIANTE,
  '/despesas': USER_LEVELS.INICIANTE,
  '/configuracoes': USER_LEVELS.INICIANTE,
  '/orcamento': USER_LEVELS.FACIL,
  '/cartoes': USER_LEVELS.INTERMEDIARIO,
  '/relatorios': USER_LEVELS.INTERMEDIARIO,
  '/backup': USER_LEVELS.INTERMEDIARIO,
  '/viagens': USER_LEVELS.AVANCADO,
  '/dre': USER_LEVELS.AVANCADO,
  '/restauracao': USER_LEVELS.AVANCADO,
};

const MODULE_NAMES = {
  '/orcamento': 'Orçamento & Metas',
  '/cartoes': 'Cartões de Crédito',
  '/relatorios': 'Relatórios & Gráficos',
  '/backup': 'Backup de Segurança',
  '/viagens': 'Gestão de Viagens & Câmbio',
  '/dre': 'DRE Contábil',
  '/restauracao': 'Restauração de Dados',
};

const NivelExperienciaGate = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLevel, changeLevel, isPathAllowed } = useLevel();

  const currentPath = location.pathname.split('?')[0].split('#')[0];
  const isAllowed = isPathAllowed(currentPath);

  // Se a rota for permitida no nível atual, exibe diretamente
  if (isAllowed) {
    return children;
  }

  const requiredLevel = PATH_MINIMUM_LEVEL[currentPath] || USER_LEVELS.AVANCADO;
  const targetLevelDef = LEVEL_DEFINITIONS[requiredLevel] || LEVEL_DEFINITIONS[USER_LEVELS.AVANCADO];
  const currentLevelDef = LEVEL_DEFINITIONS[currentLevel] || LEVEL_DEFINITIONS[USER_LEVELS.INICIANTE];
  const moduleName = MODULE_NAMES[currentPath] || 'Recurso Avançado';

  const handleDesbloquear = () => {
    changeLevel(requiredLevel);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-custom-card border border-custom-color rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-custom-gold/15 border border-custom-gold/30 text-custom-gold flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-custom-gold uppercase tracking-wider bg-custom-gold/15 px-3 py-1 rounded-full border border-custom-gold/30">
          Modo Livre do Sistema
        </span>

        <h2 className="text-xl font-bold text-custom-main mt-4 mb-2">
          {moduleName} faz parte do nível {targetLevelDef.name}
        </h2>

        <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
          Você está utilizando o modo <strong>{currentLevelDef.name}</strong> ({currentLevelDef.tagline}).
          Como o sistema possui <strong>acesso livre</strong>, você pode alternar de nível agora mesmo para utilizar esta funcionalidade sem qualquer perda de dados.
        </p>

        <div className="bg-custom-primary/50 border border-custom-color rounded-2xl p-4 text-left mb-6 space-y-2">
          <p className="text-xs font-bold text-custom-main">O que este nível adiciona:</p>
          <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1.5">
            {targetLevelDef.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-custom-color hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-custom-main transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </button>

          <button
            type="button"
            onClick={handleDesbloquear}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-custom-gold text-black hover:bg-yellow-400 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Ativar Modo {targetLevelDef.name}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NivelExperienciaGate;
