/**
 * i18n Hook — وفاء (Wafa)
 *
 * Provides language context and translation function.
 * Persists language preference in localStorage.
 *
 * Usage in any component:
 *   const { t, lang, setLang, dir } = useI18n();
 *   <h1>{t('dashboard.todaysMeds')}</h1>
 *   <button onClick={() => setLang('en')}>English</button>
 */

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from './translations';

const I18nContext = createContext(undefined);

const STORAGE_KEY = 'wafa_lang';

export function I18nProvider({ children, initialLang = 'ar' }) {
  const [lang, setLangState] = useState(initialLang);

  // Load saved language on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  // Update <html> lang and dir attributes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  }, []);

  /**
   * Translation function
   * @param {string} key - Dot-separated key, e.g., 'dashboard.todaysMeds'
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} Translated string
   */
  const t = useCallback((key, params = {}) => {
    const parts = key.split('.');
    if (parts.length !== 2) return key;

    const [section, field] = parts;
    const sectionData = translations[section];
    if (!sectionData) return key;

    const langData = sectionData[lang];
    if (!langData || !langData[field]) {
      // Fallback to Arabic
      const arData = sectionData.ar;
      if (arData && arData[field]) return arData[field];
      return key;
    }

    let str = langData[field];

    // Interpolate parameters
    Object.entries(params).forEach(([param, value]) => {
      str = str.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
    });

    return str;
  }, [lang]);

  const value = {
    lang,
    setLang,
    t,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    isRtl: lang === 'ar'
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Return defaults when used outside provider (during SSR)
    return {
      lang: 'ar',
      setLang: () => {},
      t: (key) => {
        const parts = key.split('.');
        if (parts.length !== 2) return key;
        const section = translations[parts[0]];
        return (section && section.ar && section.ar[parts[1]]) || key;
      },
      dir: 'rtl',
      isRtl: true
    };
  }
  return ctx;
}

/**
 * Language Switcher Component
 */
export function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={`inline-flex rounded-lg border border-outline overflow-hidden ${className}`}>
      <button
        onClick={() => setLang('ar')}
        className={`px-3 py-1.5 text-sm font-semibold ${
          lang === 'ar' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant'
        }`}
      >
        عربي
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 text-sm font-semibold ${
          lang === 'en' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant'
        }`}
      >
        EN
      </button>
    </div>
  );
}
