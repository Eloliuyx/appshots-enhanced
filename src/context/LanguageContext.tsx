import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { chineseMessages, formatMessage } from "../lib/ui-translations";

export type Language = "en" | "zh";
export const LANGUAGE_STORAGE_KEY = "appshots-ui-language";
export type Translate = (message: string, values?: readonly (string | number)[]) => string;

export const translateMessage = (language: Language, message: string, values?: readonly (string | number)[]) =>
  formatMessage(language === "zh" && Object.hasOwn(chineseMessages, message) ? chineseMessages[message] : message, values);

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
}>({ language: "en", setLanguage: () => {}, t: (message, values) => translateMessage("en", message, values) });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try { return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "zh" ? "zh" : "en"; }
    catch { return "en"; }
  });

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = language === "zh" ? "AppShots 编辑器" : "AppShots Editor";
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); }
    catch { /* The UI still works when browser storage is unavailable. */ }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t: (message: string, values?: readonly (string | number)[]) => translateMessage(language, message, values) }), [language]);

  return <LanguageContext.Provider value={value}>
    {children}
  </LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
