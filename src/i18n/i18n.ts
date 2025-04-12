
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en.json";
import ptBRTranslation from "./locales/pt-BR.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      "pt-BR": {
        translation: ptBRTranslation
      }
    },
    lng: "pt-BR", // Idioma padrão agora é Português
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
