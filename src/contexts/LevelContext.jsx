// src/contexts/LevelContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { USER_LEVELS, DEFAULT_USER_LEVEL, LEVEL_DEFINITIONS } from '../constants/userLevels';
import { userService } from '../services/api';
import { toast } from 'sonner';

const LevelContext = createContext(null);

const STORAGE_KEY = 'financas_nivel_experiencia';

export const LevelProvider = ({ children }) => {
  const { user, updateUser } = useAuth();

  // Inicializa com o nível do usuário autenticado, localStorage, ou padrão 'avancado'
  const [currentLevel, setCurrentLevel] = useState(() => {
    if (user?.nivelExperiencia && LEVEL_DEFINITIONS[user.nivelExperiencia]) {
      return user.nivelExperiencia;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LEVEL_DEFINITIONS[saved]) {
      return saved;
    }
    return DEFAULT_USER_LEVEL;
  });

  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Sincroniza se o user mudar no AuthContext
  useEffect(() => {
    if (user?.nivelExperiencia && LEVEL_DEFINITIONS[user.nivelExperiencia] && user.nivelExperiencia !== currentLevel) {
      setCurrentLevel(user.nivelExperiencia);
      localStorage.setItem(STORAGE_KEY, user.nivelExperiencia);
    }
  }, [user?.nivelExperiencia]);

  // Função para mudar o nível com feedback e persistência
  const changeLevel = useCallback(async (newLevel, options = { showToast: true }) => {
    if (!LEVEL_DEFINITIONS[newLevel]) {
      console.warn(`[LevelContext] Nível inválido tentado: ${newLevel}`);
      return;
    }

    setCurrentLevel(newLevel);
    localStorage.setItem(STORAGE_KEY, newLevel);

    // Atualiza estado do AuthContext
    if (updateUser) {
      updateUser({ nivelExperiencia: newLevel });
    }

    // Persiste no backend de forma transparente
    try {
      if (userService?.atualizarPerfil) {
        await userService.atualizarPerfil({ nivelExperiencia: newLevel });
      }
    } catch (err) {
      console.log('[LevelContext] Sincronização offline ou backend mantido via cache local:', err?.message);
    }

    if (options.showToast) {
      const def = LEVEL_DEFINITIONS[newLevel];
      toast.success(`Modo ${def.name} ativado com sucesso!`, {
        description: def.tagline,
      });
    }
  }, [updateUser]);

  // Verifica se uma rota está permitida no nível atual
  const isPathAllowed = useCallback((path) => {
    const cleanPath = path ? path.split('?')[0].split('#')[0] : '';
    const def = LEVEL_DEFINITIONS[currentLevel] || LEVEL_DEFINITIONS[DEFAULT_USER_LEVEL];
    if (!def || !def.allowedPaths) return true;
    return def.allowedPaths.includes(cleanPath);
  }, [currentLevel]);

  // Retorna rótulo customizado de rota para o nível (ex: 'Entrou' para Receitas no Iniciante)
  const getPathLabelOverride = useCallback((path, defaultLabel) => {
    const def = LEVEL_DEFINITIONS[currentLevel];
    if (def?.labelsOverride && def.labelsOverride[path]) {
      return def.labelsOverride[path];
    }
    return defaultLabel;
  }, [currentLevel]);

  const levelInfo = LEVEL_DEFINITIONS[currentLevel] || LEVEL_DEFINITIONS[DEFAULT_USER_LEVEL];

  const value = {
    currentLevel,
    levelInfo,
    changeLevel,
    isPathAllowed,
    getPathLabelOverride,
    allLevels: LEVEL_DEFINITIONS,
    USER_LEVELS,
    isLevelModalOpen,
    setIsLevelModalOpen,
    openLevelModal: () => setIsLevelModalOpen(true),
    closeLevelModal: () => setIsLevelModalOpen(false),
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    openOnboardingModal: () => setIsOnboardingModalOpen(true),
    closeOnboardingModal: () => setIsOnboardingModalOpen(false),
  };

  return (
    <LevelContext.Provider value={value}>
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error('useLevel deve ser usado dentro de um LevelProvider');
  }
  return context;
};

export default LevelContext;
