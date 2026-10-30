import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import mr from './mr.json';
import hi from './hi.json';

const dictionaries = { en, mr, hi };

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('shetkari_lang') || 'en';
  });

  const setLang = (newLang) => {
    if (dictionaries[newLang]) {
      setLangState(newLang);
      localStorage.setItem('shetkari_lang', newLang);
    }
  };

  const t = (key) => {
    const dict = dictionaries[lang] || dictionaries.en;
    const parts = key.split('.');
    let cur = dict;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        // Fallback to English
        let fallback = dictionaries.en;
        for (const fp of parts) {
          if (fallback && typeof fallback === 'object' && fp in fallback) {
            fallback = fallback[fp];
          } else {
            return key;
          }
        }
        return fallback;
      }
    }
    return typeof cur === 'string' ? cur : key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

