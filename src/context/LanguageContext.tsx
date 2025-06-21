"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface Translations {
  [key: string]: string | Translations;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: { code: Language; name: string }[];
  t: (key: string, params?: Record<string, any>) => string;
  getDirection: () => "ltr" | "rtl";
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "app-language";

const availableLanguages = [
  { code: "en" as Language, name: "English", direction: "ltr" },
  { code: "ar" as Language, name: "Arabic", direction: "rtl" },
];

interface LanguageProviderProps {
  children: ReactNode;
}

// Helper function to get nested translation value
const getTranslation = (translations: Translations, key: string): string | undefined => {
  const keys = key.split(".");
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return typeof value === "string" ? value : undefined;
};

// Function to load translation files
const loadTranslations = async (language: Language): Promise<Translations> => {
  try {
    // Dynamic import of translation files
    const translations = await import(`../locales/${language}.json`);
    console.log(`Loaded translations for ${language}:`, translations);

    return translations.default || translations;
  } catch (error) {
    console.warn(`Failed to load translations for ${language}:`, error);
    // Return empty object as fallback
    return {};
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language;
      let selectedLanguage: Language = "en";

      if (savedLanguage && availableLanguages.some((lang) => lang.code === savedLanguage)) {
        selectedLanguage = savedLanguage;
      } else {
        const browserLanguage = navigator.language.split("-")[0] as Language;
        const supportedLanguage = availableLanguages.find((lang) => lang.code === browserLanguage);
        selectedLanguage = supportedLanguage?.code || "en";
      }

      setLanguage(selectedLanguage);
    };

    initializeLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    setIsLoading(true);
    setLanguageState(newLanguage);
    localStorage.setItem(STORAGE_KEY, newLanguage);

    const newTranslations = await loadTranslations(newLanguage);
    setTranslations(newTranslations);
    setIsLoading(false);
  };

  // Translation function
  const t = (key: string, params?: Record<string, any>): string => {
    const translation = getTranslation(translations, key);
    if (!translation) return key;

    return Object.entries(params || {}).reduce((acc, [k, v]) => {
      return acc.replace(new RegExp(`{{${k}}}`, "g"), String(v));
    }, translation);
  };

  // Function to get text direction based on language
  const getDirection = (): "ltr" | "rtl" => {
    const lang = availableLanguages.find((l) => l.code === language);
    return (lang?.direction as "ltr" | "rtl") || "ltr";
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    availableLanguages,
    t,
    getDirection,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      <div dir={getDirection()} className={`min-h-screen w-full ${language === "ar" ? "text-right" : "text-left"} transition-all duration-300`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
