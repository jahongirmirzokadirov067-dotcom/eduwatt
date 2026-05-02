import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/i18n/translations";

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

const STORAGE_KEY = "eduwatt_lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "uz") setLangState(saved);
    } catch (_) { /* noop */ }
  }, []);

  const setLang = (next) => {
    if (next !== "en" && next !== "uz") return;
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (_) { /* noop */ }
  };

  const t = (key, vars) => {
    const dict = translations[lang] || translations.en;
    let str = dict[key];
    if (str === undefined || str === null || str === "") {
      str = translations.en[key];
    }
    if (str === undefined || str === null) return key;
    if (vars && typeof str === "string") {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
