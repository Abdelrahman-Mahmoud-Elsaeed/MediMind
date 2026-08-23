"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}${expires}; path=/`;
};

export function LanguageProvider({ children, initialLocale = "en" }) {
  const [locale, setLocale] = useState(initialLocale);
  const [dir, setDir] = useState(initialLocale === "ar" ? "rtl" : "ltr");

  useEffect(() => {
    const savedLocale = getCookie("NEXT_LOCALE");
    if (savedLocale === "ar" || savedLocale === "en") {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    const direction = locale === "ar" ? "rtl" : "ltr";
    setDir(direction);
    
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
      setCookie("NEXT_LOCALE", locale);
    }
  }, [locale]);

  const toggleLanguage = () => {
    setLocale((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (path, fallbackOrParams = {}, params = {}) => {
    let fallback = null;
    let interpolations = params;

    if (typeof fallbackOrParams === 'string') {
      fallback = fallbackOrParams;
    } else if (fallbackOrParams && typeof fallbackOrParams === 'object') {
      interpolations = fallbackOrParams;
    }

    const keys = path.split(".");
    let value = translations[locale];
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        return fallback !== null ? fallback : path;
      }
    }
    if (typeof value === "string" && interpolations && typeof interpolations === "object") {
      Object.keys(interpolations).forEach((paramKey) => {
        value = value.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, "g"), interpolations[paramKey]);
      });
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, dir, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

const defaultContext = {
  locale: "en",
  dir: "ltr",
  toggleLanguage: () => {},
  t: (path) => path,
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    return defaultContext;
  }
  return context;
}
