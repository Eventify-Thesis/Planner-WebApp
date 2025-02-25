import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '@/locales/en/translation.json';
import translationVN from '@/locales/vn/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  vn: {
    translation: translationVN,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
