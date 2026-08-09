"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

type Language = "DE" | "EN" | "FR";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
  t: (de: string, en: string, fr?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("DE");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem("jaipur-lang");
    if (saved === "EN" || saved === "DE" || saved === "FR") {
      setLangState(saved);
    }
  }, []);

  // Keep <html lang> in step with the rendered copy. Without this the document
  // stays "de" while showing English or French, so screen readers apply German
  // pronunciation to the whole page and crawlers read the wrong signal.
  useEffect(() => {
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  // Persist to localStorage on every change
  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try { localStorage.setItem("jaipur-lang", newLang); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const order: Language[] = ["DE", "EN", "FR"];
      const next = order[(order.indexOf(prev) + 1) % order.length];
      try { localStorage.setItem("jaipur-lang", next); } catch {}
      return next;
    });
  }, []);

  const t = useCallback(
    (de: string, en: string, fr?: string) => {
      if (lang === "FR") return fr || en; // Fallback to English if French not provided
      if (lang === "EN") return en;
      return de;
    },
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
