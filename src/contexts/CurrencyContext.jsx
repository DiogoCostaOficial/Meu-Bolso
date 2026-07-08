import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('BRL');
  const [exchangeRates, setExchangeRates] = useState({ BRL: 1, USD: 0.18, EUR: 0.16 });
  const [isLoading, setIsLoading] = useState(true);

  const locales = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE' 
  };

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        let rates = { BRL: 1, USD: 0.18, EUR: 0.16 };
        try {
          const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
          if (response.ok) {
            const data = await response.json();
            rates = {
              BRL: 1,
              USD: data.rates.USD || 0.18,
              EUR: data.rates.EUR || 0.16
            };
          }
        } catch (apiError) {
          console.warn('Falha ao buscar cotação. Usando valores fallback.', apiError);
        }
        setExchangeRates(rates);
      } catch (error) {
        console.error('Error with exchange rates', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

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
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, isLoading }}>
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
