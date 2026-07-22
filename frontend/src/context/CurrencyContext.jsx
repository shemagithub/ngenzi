import { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

const CurrencyContext = createContext();

// Exchange rates (as of a sample date - in production, fetch from an API)
// Using RWF as base currency for Rwanda
const EXCHANGE_RATES = {
  RWF: 1,        // Base currency (Rwandan Francs)
  USD: 0.00081,  // 1 RWF = 0.00081 USD
  EUR: 0.00075,  // 1 RWF = 0.00075 EUR
  GBP: 0.00064,  // 1 RWF = 0.00064 GBP
  AED: 0.0030,   // 1 RWF = 0.0030 AED
  JPY: 0.12,     // 1 RWF = 0.12 JPY
  INR: 0.069,    // 1 RWF = 0.069 INR
};

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  JPY: '¥',
  // Use explicit currency code for Rwanda
  RWF: 'RWF',
};

export const CurrencyProvider = ({ children }) => {
  const { settings, loading: settingsLoading } = useSettings();
  
  // Get default currency from settings, fallback to localStorage, then RWF
  const [currency, setCurrency] = useState(() => {
    const storedCurrency = localStorage.getItem('selectedCurrency');
    return storedCurrency || 'RWF';
  });

  // Update currency when settings are loaded (only on initial load)
  useEffect(() => {
    if (!settingsLoading && settings?.currency) {
      const settingsCurrency = settings.currency;
      const storedCurrency = localStorage.getItem('selectedCurrency');
      // Only set from settings if no stored preference exists
      if (!storedCurrency) {
        setCurrency(settingsCurrency);
        localStorage.setItem('selectedCurrency', settingsCurrency);
      }
    }
  }, [settings?.currency, settingsLoading]);

  useEffect(() => {
    // Save to localStorage whenever currency changes
    localStorage.setItem('selectedCurrency', currency);
  }, [currency]);

  const convertPrice = (price) => {
    if (!price || isNaN(price)) return 0;
    // If price is already in the selected currency, return as is
    // Otherwise, convert from base currency (RWF) to selected currency
    const rate = EXCHANGE_RATES[currency] || 1;
    return Number(price) * rate;
  };

  const formatPrice = (price) => {
    const convertedPrice = convertPrice(price);
    if (!convertedPrice || isNaN(convertedPrice)) return '';

    // RWF should be displayed as: "RWF 6,000,000" (no decimals)
    if (currency === 'RWF') {
      const formatted = Math.round(Number(convertedPrice)).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return `RWF ${formatted}`;
    }

    const symbol = CURRENCY_SYMBOLS[currency] || '';
    const formattedNumber = Number(convertedPrice).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return symbol ? `${symbol}${formattedNumber}` : formattedNumber;
  };

  const getCurrencySymbol = () => {
    return CURRENCY_SYMBOLS[currency] || '₹';
  };

  const getCurrencyCode = () => {
    return currency;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        getCurrencySymbol,
        getCurrencyCode,
        currencies: Object.keys(CURRENCY_SYMBOLS),
        currencySymbols: CURRENCY_SYMBOLS,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

