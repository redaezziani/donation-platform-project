import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import arTranslations from '../locales/ar/common.json';
import enTranslations from '../locales/en/common.json';
import frTranslations from '../locales/fr/common.json';
import esTranslations from '../locales/es/common.json';
import ruTranslations from '../locales/ru/common.json';

const resources = {
  ar: {
    common: arTranslations,
  },
  en: {
    common: enTranslations,
  },
  fr: {
    common: frTranslations,
  },
  es: {
    common: esTranslations,
  },
  ru: {
    common: ruTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;