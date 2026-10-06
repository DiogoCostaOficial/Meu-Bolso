import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

// Bandeiras em SVG inline para evitar dependências externas
const flags = {
  BRL: (
    <svg viewBox="0 0 640 480" className="w-8 h-8 rounded-full object-cover shadow-sm">
      <path fill="#009b3a" d="M0 0h640v480H0z"/>
      <path fill="#fedf00" d="M320 81.3L541.1 240 320 398.7 98.9 240z"/>
      <circle cx="320" cy="240" r="106.7" fill="#002776"/>
      <path fill="#fff" d="M225 255c25-25 100-35 150-10 25 12 40 45 40 45s-30-20-80-15c-50 5-100 25-110 30z"/>
    </svg>
  ),
  USD: (
    <svg viewBox="0 0 640 480" className="w-8 h-8 rounded-full object-cover shadow-sm">
      <path fill="#bd3d44" d="M0 0h640v480H0z"/>
      <path fill="#fff" d="M0 43.6h640v43.6H0zm0 87.3h640v43.6H0zm0 87.3h640v43.6H0zm0 87.2h640v43.6H0zm0 87.3h640v43.6H0z"/>
      <path fill="#192f5d" d="M0 0h256v261.8H0z"/>
      <path fill="#fff" d="M36.1 20.3L46 34.2H24l10-13.9zm52.4 0l10 13.9H76.2l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.3 0l10 13.9h-22l10-13.9zm-183.3 26l10 13.9H50l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm-157.2 26l10 13.9H24l10-13.9zm52.4 0l10 13.9H76.2l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.3 0l10 13.9h-22l10-13.9zm-183.3 26l10 13.9H50l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm-157.2 26.1l10 13.9H24l10-13.9zm52.4 0l10 13.9H76.2l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.3 0l10 13.9h-22l10-13.9zm-183.3 26l10 13.9H50l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm-157.2 26l10 13.9H24l10-13.9zm52.4 0l10 13.9H76.2l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.3 0l10 13.9h-22l10-13.9zm-183.3 26l10 13.9H50l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9z"/>
    </svg>
  ),
  EUR: (
    <svg viewBox="0 0 640 480" className="w-8 h-8 rounded-full object-cover shadow-sm">
      <path fill="#039" d="M0 0h640v480H0z"/>
      <g fill="#fc0">
        <path d="M320 85l12 37.1h39l-31.5 22.9 12 37-31.5-22.8-31.5 22.8 12-37L269 122.1h39zM203 123.3l37 12 22.8-31.5L240 135.3l37 12-31.5 22.9L257.6 207l-22.9-31.5-22.8 31.5 12-37z"/>
        <path d="M123.3 203l37 12 22.8-31.5L160.2 215l37 12-31.5 22.9L177.8 287l-22.9-31.5-22.8 31.5 12-37zM85 320l37.1-12h39L138.2 339.5l37.1-12-22.9 31.5 22.9 31.5-37.1-12-22.9 31.5v-39zM123.3 437l12-37 31.5 22.8-22.9-31.5 12-37-31.5 22.9L92.9 354l12 37-31.5 22.8 31.5-22.8z"/>
        <path d="M203 516.7l12-37 31.5 22.9-22.9-31.5 12-37-31.5 22.9L172.9 434l12 37-31.5 22.9 31.5-22.9zM320 555l-12-37.1h-39l31.5-22.9-12-37 31.5 22.8 31.5-22.8-12 37 31.5 22.9h-39zM437 516.7l-37-12-22.8 31.5 22.9-31.5-37-12 31.5-22.9L382.4 433l22.9 31.5 22.8-31.5-12 37z"/>
        <path d="M516.7 437l-37-12-22.8 31.5L479.8 425l-37-12 31.5-22.9L462.2 353l22.9 31.5 22.8-31.5-12 37zM555 320l-37.1 12h-39l22.9-31.5-37.1 12 22.9-31.5-22.9-31.5 37.1 12 22.9-31.5v39zM516.7 203l-12 37-31.5-22.8 22.9 31.5-12 37 31.5-22.9L547.1 286l-12-37 31.5-22.8-31.5 22.8z"/>
        <path d="M437 123.3l-12 37-31.5-22.9 22.9 31.5-12 37 31.5-22.9L467.1 206l-12-37 31.5-22.9-31.5 22.9z"/>
      </g>
    </svg>
  )
};

export default function CurrencySelector({ className = '' }) {
  const { currency, setCurrency, exchangeRates, exchangeDate } = useCurrency();
  const [isTipOpen, setIsTipOpen] = useState(false);
  const containerRef = useRef(null);

  // Fecha o popover ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsTipOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Cotação Comercial (quanto custa 1 US$ e 1 € em Reais)
  const usdRateRaw = exchangeRates?.USD || 0.191;
  const eurRateRaw = exchangeRates?.EUR || 0.17;

  const usdCommercial = (usdRateRaw > 0 ? 1 / usdRateRaw : 5.24).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const eurCommercial = (eurRateRaw > 0 ? 1 / eurRateRaw : 5.88).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Poder de compra (quanto R$ 1,00 compra em moeda estrangeira no destino)
  const usdPower = usdRateRaw.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const eurPower = eurRateRaw.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div ref={containerRef} className={`relative flex flex-col items-center w-[230px] select-none flex-shrink-0 ${className}`}>
      {/* Pílula com os seletores de moeda com altura h-11 (44px) idêntica aos filtros */}
      <div className="w-full h-11 flex items-center justify-around bg-custom-card/90 dark:bg-black/40 rounded-full px-4 border border-custom-color transition-colors shadow-custom">
        {['BRL', 'USD', 'EUR'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            title={`Alterar para ${c}`}
            className={`flex items-center justify-center rounded-full transition-transform ${
              currency === c ? 'ring-2 ring-emerald-500 scale-105 shadow-sm' : 'opacity-65 hover:opacity-100 hover:scale-105'
            }`}
          >
            {flags[c]}
          </button>
        ))}
      </div>

      {/* Cotação comercial fixa 100% do tempo embaixo das bandeiras: R$ 1 = US$ X · € Y */}
      <button
        type="button"
        onClick={() => setIsTipOpen((prev) => !prev)}
        onMouseEnter={() => setIsTipOpen(true)}
        className="w-full mt-1.5 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer group whitespace-nowrap"
        title="Clique para ver o seu poder de compra e dicas de viagem"
      >
        <span>R$ 1 = US$ {usdCommercial} · € {eurCommercial}</span>
        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
          💡
        </span>
      </button>

      {/* Popover flutuante exibindo o Poder de Compra do Real */}
      {isTipOpen && (
        <div
          onMouseLeave={() => setIsTipOpen(false)}
          className="absolute top-full mt-1.5 z-50 w-72 p-3.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-700">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              💡 Seu Poder de Compra (com R$ 1,00)
            </span>
            <button
              type="button"
              onClick={() => setIsTipOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs px-1 leading-none"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-900/60 px-2.5 py-2 rounded-lg">
              <span className="text-gray-600 dark:text-slate-300 font-medium">Em Dólar (EUA):</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">R$ 1,00 = US$ {usdPower}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-900/60 px-2.5 py-2 rounded-lg">
              <span className="text-gray-600 dark:text-slate-300 font-medium">Em Euro (Europa):</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">R$ 1,00 = € {eurPower}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-700 space-y-1">
            <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400">
              <span>Cotação de Mercado:</span>
              <span className="font-semibold text-gray-700 dark:text-slate-200">R$ 1 = US$ {usdCommercial} · € {eurCommercial}</span>
            </div>
            <div className="text-[10px] text-gray-400 dark:text-slate-500 text-center pt-1">
              * Atualizada de hora em hora {exchangeDate ? `(${exchangeDate})` : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
