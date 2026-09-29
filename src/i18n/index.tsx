import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DICTS, type Dict, type Lang } from './dict';
import type { FieldDef } from '../data/schema';

function get(obj: any, path: string): any {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string, vars?: Record<string, any>) => string;
  tf: (f: { en: string; zh: string }) => string;
  d: Dict;
};

const I18nCtx = createContext<Ctx>(null as any);

const LS_LANG = 'agencyos.lang';
const LS_THEME = 'agencyos.theme';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem(LS_LANG) as Lang) || 'en');
  const [theme, setThemeState] = useState<string>(() => localStorage.getItem(LS_THEME) || 'light');

  useEffect(() => {
    localStorage.setItem(LS_LANG, lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(LS_THEME, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang];
    const t = (path: string, vars?: Record<string, any>) => {
      const raw = get(dict, path) ?? get(DICTS.en, path) ?? path;
      if (typeof raw !== 'string') return String(raw);
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
    };
    return {
      lang,
      setLang: (l: Lang) => setLangState(l),
      t,
      tf: (f: { en: string; zh: string }) => (lang === 'zh' ? f.zh || f.en : f.en),
      d: dict,
    };
  }, [lang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}

export function useTheme() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem(LS_THEME) || 'light');
  useEffect(() => {
    const apply = (v: string) => {
      setTheme(v);
      document.documentElement.classList.toggle('dark', v === 'dark');
    };
    apply(localStorage.getItem(LS_THEME) || 'light');
    const on = () => apply(localStorage.getItem(LS_THEME) || 'light');
    window.addEventListener('agencyos:theme', on);
    return () => window.removeEventListener('agencyos:theme', on);
  }, []);
  const set = (v: string) => {
    localStorage.setItem(LS_THEME, v);
    window.dispatchEvent(new Event('agencyos:theme'));
  };
  return { theme, setTheme: set };
}

export function fieldLabel(f: FieldDef, lang: Lang) {
  return lang === 'zh' ? f.zh || f.en : f.en;
}
