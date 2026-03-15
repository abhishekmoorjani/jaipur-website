"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Language = "DE" | "EN";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
  t: (de: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("DE");

  const toggle = useCallback(() => {
    setLang((prev) => (prev === "DE" ? "EN" : "DE"));
  }, []);

  const t = useCallback(
    (de: string, en: string) => (lang === "DE" ? de : en),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
