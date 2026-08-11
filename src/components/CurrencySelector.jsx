import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

// Bandeiras em SVG inline para evitar dependências externas
const flags = {
  BRL: (
    <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full object-cover">
      <path fill="#009b3a" d="M0 0h640v480H0z"/>
      <path fill="#fedf00" d="M320 81.3L541.1 240 320 398.7 98.9 240z"/>
      <circle cx="320" cy="240" r="106.7" fill="#002776"/>
      <path fill="#fff" d="M225 255c25-25 100-35 150-10 25 12 40 45 40 45s-30-20-80-15c-50 5-100 25-110 30z"/>
    </svg>
  ),
  USD: (
    <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full object-cover">
      <path fill="#bd3d44" d="M0 0h640v480H0z"/>
      <path fill="#fff" d="M0 43.6h640v43.6H0zm0 87.3h640v43.6H0zm0 87.3h640v43.6H0zm0 87.2h640v43.6H0zm0 87.3h640v43.6H0z"/>
      <path fill="#192f5d" d="M0 0h256v261.8H0z"/>
      <path fill="#fff" d="M36.1 20.3L46 34.2H24l10-13.9zm52.4 0l10 13.9H76.2l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.3 0l10 13.9h-22l10-13.9zm-183.3 26l10 13.9H50l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm-157.2 26l10 13.9H24l10-13.9zm52.4 0l10 13.9H76.2l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.3 0l10 13.9h-22l10-13.9zm-183.3 26l10 13.9H50l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm-157.2 26.1l10 13.9H24l10-13.9zm52.4 0l10 13.9H76.2l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.3 0l10 13.9h-22l10-13.9zm-183.3 26l10 13.9H50l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm-157.2 26l10 13.9H24l10-13.9zm52.4 0l10 13.9H76.2l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.3 0l10 13.9h-22l10-13.9zm-183.3 26l10 13.9H50l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9zm52.4 0l10 13.9h-22.1l10-13.9z"/>
    </svg>
  ),
  EUR: (
    <svg viewBox="0 0 640 480" className="w-6 h-6 rounded-full object-cover">
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

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center space-x-2 bg-custom-primary/30 dark:bg-black/35 rounded-full p-1 border border-custom-color mr-4 transition-colors">
      {['BRL', 'USD', 'EUR'].map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          title={`Alterar para ${c}`}
          className={`flex items-center justify-center rounded-full transition-transform ${
            currency === c ? 'ring-2 ring-primary scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'
          }`}
        >
          {flags[c]}
        </button>
      ))}
    </div>
  );
}
