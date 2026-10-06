import { createContext, useContext, useState, useCallback } from 'react';
import { dict } from './dictionary';

const I18nContext = createContext(null);
const LANG_KEY = 'fundilink_lang';

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'en');

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'rw' : 'en';
      localStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback((key) => dict[lang][key] ?? dict.en[key] ?? key, [lang]);

  return <I18nContext.Provider value={{ lang, toggleLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
