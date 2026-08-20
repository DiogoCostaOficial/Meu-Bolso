import React, { createContext, useContext, useEffect, useState } from 'react';

const LayoutVariantContext = createContext({
  layoutVariant: 'lux-gold',
  setLayoutVariant: () => null,
});

export const LayoutVariantProvider = ({ children }) => {
  const [layoutVariant, setLayoutVariant] = useState('lux-gold');

  useEffect(() => {
    const root = window.document.documentElement;
    // Remover todas as classes de layout customizadas antigas
    root.classList.remove(
      'layout-lux-gold',
      'layout-geo-brutalist',
      'layout-modern-fluid',
      'layout-neon-glass',
      'layout-scifi-hud',
      'layout-cosmic-aurora'
    );
    // Adicionar a classe padrão (Lux Gold) que possui suporte correto a light e dark
    root.classList.add('layout-lux-gold');
    localStorage.setItem('layout-variant', 'lux-gold');
  }, []);

  return (
    <LayoutVariantContext.Provider value={{ layoutVariant: 'lux-gold', setLayoutVariant }}>
      {children}
    </LayoutVariantContext.Provider>
  );
};

export const useLayoutVariant = () => {
  const context = useContext(LayoutVariantContext);
  if (!context) {
    throw new Error('useLayoutVariant deve ser usado dentro de um LayoutVariantProvider');
  }
  return context;
};
