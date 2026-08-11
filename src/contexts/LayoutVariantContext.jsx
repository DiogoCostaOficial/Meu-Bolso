import React, { createContext, useContext, useEffect, useState } from 'react';

const LayoutVariantContext = createContext({
  layoutVariant: 'lux-gold',
  setLayoutVariant: () => null,
});

export const LayoutVariantProvider = ({ children }) => {
  const [layoutVariant, setLayoutVariant] = useState(
    () => localStorage.getItem('layout-variant') || 'lux-gold'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    // Remover classes antigas de layout
    root.classList.remove('layout-lux-gold', 'layout-geo-brutalist', 'layout-modern-fluid');
    // Adicionar a classe ativa
    root.classList.add(`layout-${layoutVariant}`);
    localStorage.setItem('layout-variant', layoutVariant);
  }, [layoutVariant]);

  return (
    <LayoutVariantContext.Provider value={{ layoutVariant, setLayoutVariant }}>
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
