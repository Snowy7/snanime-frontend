"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

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

// Enhanced helper function to get nested translation value with better error handling
const getTranslation = (translations: Translations, key: string): string | undefined => {
  if (!key || typeof key !== 'string') {
    console.warn('Invalid translation key:', key);
    return undefined;
  }

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

// Function to load translation files with better error handling
const loadTranslations = async (language: Language): Promise<Translations> => {
  try {
    // Dynamic import of translation files
    const translations = await import(`../locales/${language}.json`);
    console.log(`Loaded translations for ${language}:`, translations);

    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // Return empty object as fallback
    return {};
  }
};

// Helper function to interpolate parameters in translation strings
const interpolateParams = (text: string, params: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return text;
  }

  return Object.entries(params).reduce((acc, [key, value]) => {
    const placeholder = `{{${key}}}`;
    return acc.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
  }, text);
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      // Helper function to get cookie value
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      // Check cookie first, then localStorage
      const cookieLanguage = getCookie(STORAGE_KEY) as Language;
      const savedLanguage = cookieLanguage || localStorage.getItem(STORAGE_KEY) as Language;
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
    
    // Set both localStorage and cookie for better compatibility
    localStorage.setItem(STORAGE_KEY, newLanguage);
    document.cookie = `app-language=${newLanguage}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    
    const newTranslations = await loadTranslations(newLanguage);
    setTranslations(newTranslations);
    setIsLoading(false);
  };

  // Enhanced translation function with better error handling and fallback
  const t = (key: string, params?: Record<string, any>): string => {
    if (!key) {
      console.warn('Empty translation key provided');
      return '';
    }

    const translation = getTranslation(translations, key);
    
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      // Return the key as fallback, but make it more readable
      const fallback = key.split('.').pop() || key;
      return fallback.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    return interpolateParams(translation, params || {});
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
