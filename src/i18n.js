import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Tarjima fayllarni import qilamiz
import uz from './locales/uz/translation.json'
import en from './locales/en/translation.json'
import ru from './locales/ru/translation.json'

i18n
  .use(LanguageDetector) // brauzerdan yoki localStoragedan tilni aniqlaydi
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: 'uz', // agar topilmasa, o‘zbek tili bo‘ladi
    debug: false,
    interpolation: {
    },
  })

export default i18n
