import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Sparkles } from 'lucide-react';
import { useLanguage, FEATURED_LANGUAGES, OTHER_LANGUAGES } from '../contexts/LanguageContext';

// Bandeiras SVG nítidas em formato circular (garante renderização perfeita no Windows, Mac e Mobile)
export const LANGUAGE_FLAGS = {
  'pt-BR': (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover rounded-full">
      <path fill="#009b3a" d="M0 0h640v480H0z" />
      <path fill="#fedf00" d="M320 72L560 240 320 408 80 240z" />
      <circle cx="320" cy="240" r="105" fill="#002776" />
      <path fill="#fff" d="M222 252c28-24 102-34 154-10 24 11 40 42 40 42s-32-18-82-14c-50 4-100 24-112 30z" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover rounded-full">
      <path fill="#bd3d44" d="M0 0h640v480H0z" />
      <path
        fill="#fff"
        d="M0 37h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0z"
      />
      <path fill="#192f5d" d="M0 0h290v259H0z" />
      <g fill="#fff">
        <circle cx="48" cy="45" r="12" />
        <circle cx="115" cy="45" r="12" />
        <circle cx="182" cy="45" r="12" />
        <circle cx="248" cy="45" r="12" />
        <circle cx="82" cy="95" r="12" />
        <circle cx="148" cy="95" r="12" />
        <circle cx="215" cy="95" r="12" />
        <circle cx="48" cy="145" r="12" />
        <circle cx="115" cy="145" r="12" />
        <circle cx="182" cy="145" r="12" />
        <circle cx="248" cy="145" r="12" />
        <circle cx="82" cy="195" r="12" />
        <circle cx="148" cy="195" r="12" />
        <circle cx="215" cy="195" r="12" />
      </g>
    </svg>
  ),
  es: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover rounded-full">
      <path fill="#AA151B" d="M0 0h640v480H0z" />
      <path fill="#F1BF00" d="M0 120h640v240H0z" />
      <rect x="140" y="185" width="55" height="110" rx="18" fill="#AA151B" stroke="#fff" strokeWidth="8" />
    </svg>
  ),
  'pt-PT': (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover rounded-full">
      <path fill="#ff0000" d="M0 0h640v480H0z" />
      <path fill="#006600" d="M0 0h256v480H0z" />
      <circle cx="256" cy="240" r="82" fill="#ffcc00" />
      <path fill="#fff" d="M222 195h68v65c0 22-15 38-34 38s-34-16-34-38z" stroke="#ff0000" strokeWidth="12" />
    </svg>
  ),
  it: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover rounded-full">
      <path fill="#009246" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ce2b37" d="M426.7 0H640v480H426.7z" />
    </svg>
  ),
  zh: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover rounded-full">
      <path fill="#de2910" d="M0 0h640v480H0z" />
      <polygon
        fill="#ffde00"
        points="120,70 138,125 195,125 149,159 167,214 120,180 73,214 91,159 45,125 102,125"
      />
      <circle cx="235" cy="65" r="14" fill="#ffde00" />
      <circle cx="270" cy="110" r="14" fill="#ffde00" />
      <circle cx="270" cy="168" r="14" fill="#ffde00" />
      <circle cx="235" cy="215" r="14" fill="#ffde00" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover rounded-full">
      <path fill="#002654" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover rounded-full">
      <path fill="#000" d="M0 0h640v160H0z" />
      <path fill="#d00" d="M0 160h640v160H0z" />
      <path fill="#ffce00" d="M0 320h640v160H0z" />
    </svg>
  )
};

export default function LanguageSelector({
  variant = 'default', // 'default' | 'compact' | 'footer' | 'sidebar'
  align = 'right', // 'left' | 'right' | 'top'
  showQuickFeatured = true,
  className = ''
}) {
  const { language, setLanguage, currentLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const isMenuUp = align === 'top' || variant === 'footer' || variant === 'sidebar';

  return (
    <div
      ref={containerRef}
      data-no-translate="true"
      className={`relative inline-flex items-center gap-1.5 select-none ${className}`}
    >
      {/* Atalhos Rápidos em Destaque (América do Sul: PT-BR, EN, ES) */}
      {showQuickFeatured && variant !== 'compact' && (
        <div className="hidden sm:inline-flex items-center gap-1 bg-custom-primary/70 dark:bg-black/40 p-1 rounded-full border border-custom-color">
          {FEATURED_LANGUAGES.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                title={`${lang.name} (${lang.region})`}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-custom-gold text-black shadow-xs scale-[1.02]'
                    : 'text-custom-main opacity-75 hover:opacity-100 hover:bg-custom-card'
                }`}
              >
                <span className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-black/15">
                  {LANGUAGE_FLAGS[lang.code]}
                </span>
                <span>{lang.short}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Botão Principal que abre todos os 8 idiomas */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center justify-between gap-2 rounded-full border transition-all cursor-pointer ${
          variant === 'sidebar'
            ? 'w-full px-3.5 py-2.5 bg-custom-primary/60 border-custom-color hover:border-custom-gold text-xs font-semibold text-custom-main'
            : 'px-3 py-1.5 bg-custom-card/90 hover:bg-custom-card border-custom-color hover:border-custom-gold/60 text-xs font-semibold text-custom-main shadow-xs'
        }`}
        title="Selecionar idioma do sistema"
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          <span className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-white/20 shadow-xs">
            {LANGUAGE_FLAGS[currentLanguage.code]}
          </span>
          <Globe className="w-3.5 h-3.5 text-custom-gold hidden xs:inline" />
          <span className="truncate">
            {variant === 'sidebar' ? currentLanguage.name : currentLanguage.short}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-custom-main opacity-60 transition-transform duration-200 ${
            open ? 'rotate-180 text-custom-gold opacity-100' : ''
          }`}
        />
      </button>

      {/* Dropdown com os 8 Idiomas (3 Destaques América do Sul + 5 Globais) */}
      {open && (
        <div
          className={`absolute z-50 w-72 rounded-2xl bg-custom-card border border-custom-gold/35 shadow-2xl p-2.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isMenuUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${align === 'left' ? 'left-0' : 'right-0'}`}
        >
          {/* Seção 1: Destaques América do Sul */}
          <div className="px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-custom-gold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Destaques • América do Sul
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-custom-gold/15 text-custom-gold font-semibold">
              Principais
            </span>
          </div>

          <div className="space-y-1 mb-2">
            {FEATURED_LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-custom-gold text-black font-bold shadow-xs'
                      : 'hover:bg-custom-primary/80 text-custom-main'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-black/15 shadow-xs">
                      {LANGUAGE_FLAGS[lang.code]}
                    </span>
                    <div className="truncate">
                      <span className="text-xs block leading-tight">{lang.name}</span>
                      <span
                        className={`text-[10px] block leading-tight ${
                          active ? 'text-black/75' : 'text-custom-main opacity-55'
                        }`}
                      >
                        {lang.nativeName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        active
                          ? 'bg-black/15 text-black'
                          : 'bg-custom-gold/15 text-custom-gold'
                      }`}
                    >
                      {lang.short}
                    </span>
                    {active && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Seção 2: Outros Idiomas */}
          <div className="pt-2 border-t border-custom-color">
            <div className="px-2.5 py-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-custom-main opacity-60">
                Outros Idiomas Globais
              </span>
            </div>

            <div className="grid grid-cols-1 gap-0.5 max-h-52 overflow-y-auto pr-0.5">
              {OTHER_LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-custom-gold text-black font-bold shadow-xs'
                        : 'hover:bg-custom-primary/70 text-custom-main'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-black/15">
                        {LANGUAGE_FLAGS[lang.code]}
                      </span>
                      <span className="text-xs truncate">{lang.name}</span>
                      <span
                        className={`text-[10px] truncate ${
                          active ? 'text-black/70' : 'text-custom-main opacity-50'
                        }`}
                      >
                        ({lang.nativeName})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-semibold ${
                          active ? 'text-black' : 'text-custom-main opacity-60'
                        }`}
                      >
                        {lang.short}
                      </span>
                      {active && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
