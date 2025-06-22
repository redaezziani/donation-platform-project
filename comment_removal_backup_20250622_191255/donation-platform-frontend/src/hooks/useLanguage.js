import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { onLanguageChange } from '../lib/api.js';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const [languageVersion, setLanguageVersion] = useState(0);

  const isRTL = i18n.language === 'ar';
  
  // Update document attributes when language changes
  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
  }, [i18n.language, isRTL]);

  // Subscribe to language changes and increment version
  useEffect(() => {
    const unsubscribe = onLanguageChange(() => {
      setLanguageVersion(prev => prev + 1);
    });
    
    return unsubscribe;
  }, []);

  // Hook for components that need to refresh data when language changes
  const useLanguageRefresh = (refreshCallback) => {
    useEffect(() => {
      if (languageVersion > 0) {
        refreshCallback();
      }
    }, [languageVersion, refreshCallback]);
  };

  const formatCurrency = useCallback((amount, currency = 'USD') => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 
                   i18n.language === 'fr' ? 'fr-FR' :
                   i18n.language === 'es' ? 'es-ES' :
                   i18n.language === 'ru' ? 'ru-RU' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }, [i18n.language]);

  const formatDate = useCallback((dateString) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 
                   i18n.language === 'fr' ? 'fr-FR' :
                   i18n.language === 'es' ? 'es-ES' :
                   i18n.language === 'ru' ? 'ru-RU' : 'en-US';

    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [i18n.language]);

  const formatNumber = useCallback((number) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 
                   i18n.language === 'fr' ? 'fr-FR' :
                   i18n.language === 'es' ? 'es-ES' :
                   i18n.language === 'ru' ? 'ru-RU' : 'en-US';

    return new Intl.NumberFormat(locale).format(number);
  }, [i18n.language]);

  return {
    t,
    i18n,
    isRTL,
    currentLanguage: i18n.language,
    languageVersion,
    useLanguageRefresh,
    formatCurrency,
    formatDate,
    formatNumber,
  };
};