import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { backendurl } from '../config/constants';

const CurrencyContext = createContext();

// Exchange rates (using RWF as base currency for Rwanda)
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
  const [currency, setCurrency] = useState('RWF');
  const [loading, setLoading] = useState(true);

  // Fetch settings currency on mount (public settings endpoint; token optional)
  useEffect(() => {
    const fetchSettingsCurrency = async () => {
      try {
        const response = await axios.get(`${backendurl}/api/settings`);
        if (response.data.success && response.data.settings?.currency) {
          setCurrency(response.data.settings.currency);
        }
      } catch (error) {
        console.warn('Settings currency unavailable, using RWF default');
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsCurrency();
  }, []);

  const convertPrice = (price) => {
    if (!price || isNaN(price)) return 0;
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
    return CURRENCY_SYMBOLS[currency] || 'Fr';
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
        loading,
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

