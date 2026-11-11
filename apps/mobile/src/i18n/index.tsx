import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

import en from './en.json';
import am from './am.json';
import om from './om.json';
import ti from './ti.json';

export type LanguageCode = 'en' | 'am' | 'om' | 'ti';

const translations: Record<LanguageCode, typeof en> = {
  en,
  am: am as unknown as typeof en,
  om: om as unknown as typeof en,
  ti: ti as unknown as typeof en,
};

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (keyPath: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'am', // Default to Amharic as per specification
  setLanguage: async () => {},
  t: (keyPath: string, fallback?: string) => fallback || keyPath,
});

const LANGUAGE_KEY = 'agrintel_user_language';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('am');

  useEffect(() => {
    SecureStore.getItemAsync(LANGUAGE_KEY).then((saved) => {
      if (saved && (saved === 'en' || saved === 'am' || saved === 'om' || saved === 'ti')) {
        setLanguageState(saved as LanguageCode);
      }
    }).catch(() => {
      // Fallback
    });
  }, []);

  const setLanguage = async (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, newLang);
    } catch {
      // Ignore
    }
  };

  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    let current: any = translations[language] || translations.en;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let enCurrent: any = translations.en;
        for (const enKey of keys) {
          if (enCurrent && typeof enCurrent === 'object' && enKey in enCurrent) {
            enCurrent = enCurrent[enKey];
          } else {
            return fallback || keyPath;
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : fallback || keyPath;
      }
    }
    return typeof current === 'string' ? current : fallback || keyPath;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
