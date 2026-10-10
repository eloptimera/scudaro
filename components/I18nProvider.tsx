"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import { translate, translateRich, type Messages } from "@/lib/i18n/translate";
import en from "@/lib/i18n/messages/en.json";

type Ctx = {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  rich: (key: string, vars: Record<string, ReactNode>) => ReactNode[];
  path: (href: string) => string;
  /** Picks `${base}.${one|few|many|other…}` for a count using the language's plural rules. */
  plural: (base: string, n: number, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export default function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: (key, vars) => translate(messages, en as Messages, key, vars),
      rich: (key, vars) => translateRich(messages, en as Messages, key, vars),
      path: (href) => localePath(locale, href),
      plural: (base, n, vars) => {
        const cat = new Intl.PluralRules(locale).select(n);
        const key = `${base}.${cat}` in messages ? `${base}.${cat}` : `${base}.other`;
        return translate(messages, en as Messages, key, { n, ...vars });
      },
    }),
    [locale, messages],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
