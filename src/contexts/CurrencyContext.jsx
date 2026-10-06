import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const CurrencyContext = createContext();

const ONE_HOUR_MS = 60 * 60 * 1000;
const STORAGE_KEY_RATES = 'fin_cached_exchange_rates';
const STORAGE_KEY_TIME = 'fin_cached_exchange_time';

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('fin_selected_currency') || 'BRL';
    } catch {
      return 'BRL';
    }
  });

  // Carrega taxas salvas anteriormente em cache se existirem, senão fallback seguro
  const [exchangeRates, setExchangeRates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RATES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { BRL: 1, USD: 0.191, EUR: 0.17 };
  });

  const [exchangeDate, setExchangeDate] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TIME) || '';
    } catch {
      return '';
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const lastFetchTimeRef = useRef(0);

  const locales = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE'
  };

  const persistCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem('fin_selected_currency', newCurrency);
    } catch {}
  };

  const fetchExchangeRates = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Consulta a API de mercado financeiro em tempo real (AwesomeAPI)
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const usdBrl = parseFloat(data.USDBRL?.bid || data.USDBRL?.ask || 5.24);
        const eurBrl = parseFloat(data.EURBRL?.bid || data.EURBRL?.ask || 5.88);

        const newRates = {
          BRL: 1,
          USD: usdBrl > 0 ? 1 / usdBrl : 0.191,
          EUR: eurBrl > 0 ? 1 / eurBrl : 0.17
        };

        let formattedDate = '';
        if (data.USDBRL?.create_date) {
          const [datePart, timePart] = data.USDBRL.create_date.split(' ');
          if (datePart) {
            const [y, m, d] = datePart.split('-');
            const shortTime = timePart ? timePart.slice(0, 5) : '';
            formattedDate = shortTime ? `${d}/${m}/${y} às ${shortTime}` : `${d}/${m}/${y}`;
          }
        } else {
          formattedDate = new Date().toLocaleDateString('pt-BR');
        }

        setExchangeRates(newRates);
        setExchangeDate(formattedDate);
        lastFetchTimeRef.current = Date.now();

        try {
          localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(newRates));
          localStorage.setItem(STORAGE_KEY_TIME, formattedDate);
        } catch {}
      } else {
        throw new Error(`AwesomeAPI status ${response.status}`);
      }
    } catch (apiError) {
      // Fallback gracioso: tenta API secundária antes de usar o cache
      try {
        const fallbackRes = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          const fbRates = {
            BRL: 1,
            USD: fbData.rates?.USD || 0.191,
            EUR: fbData.rates?.EUR || 0.17
          };
          setExchangeRates(fbRates);
          lastFetchTimeRef.current = Date.now();
          return;
        }
      } catch (_) {}

      // Mantém silenciosamente a última cotação já armazenada no cache
      console.warn('Cotação mantida com a última taxa válida em cache (modo offline/resiliente).');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito principal: busca inicial + intervalo de hora em hora + reativação ao focar na aba
  useEffect(() => {
    // 1. Busca inicial imediata
    fetchExchangeRates(false);

    // 2. Temporizador para atualizar a cada 1 hora (60 minutos)
    const intervalId = setInterval(() => {
      fetchExchangeRates(true);
    }, ONE_HOUR_MS);

    // 3. Verificação ao retornar o foco à aba (se já passou mais de 1 hora)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const timeElapsed = Date.now() - lastFetchTimeRef.current;
        if (timeElapsed >= ONE_HOUR_MS) {
          fetchExchangeRates(true);
        }
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [fetchExchangeRates]);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || isNaN(value)) {
      value = 0;
    }

    // Converte de BRL para a moeda selecionada
    const rate = exchangeRates[currency] || 1;
    const convertedValue = value * rate;

    return new Intl.NumberFormat(locales[currency] || 'pt-BR', {
      style: 'currency',
      currency: currency
    }).format(convertedValue);
  }, [currency, exchangeRates]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency: persistCurrency,
      formatCurrency,
      isLoading,
      exchangeRates,
      exchangeDate,
      atualizarCotacaoManual: () => fetchExchangeRates(false)
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency deve ser usado dentro de um CurrencyProvider');
  }
  return context;
}
