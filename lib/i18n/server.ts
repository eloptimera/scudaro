import "server-only";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { translate, type Messages } from "./translate";
import en from "./messages/en.json";

const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => import("./messages/en.json"),
  bg: () => import("./messages/bg.json"),
  hr: () => import("./messages/hr.json"),
  cs: () => import("./messages/cs.json"),
  da: () => import("./messages/da.json"),
  nl: () => import("./messages/nl.json"),
  et: () => import("./messages/et.json"),
  fi: () => import("./messages/fi.json"),
  fr: () => import("./messages/fr.json"),
  de: () => import("./messages/de.json"),
  el: () => import("./messages/el.json"),
  hu: () => import("./messages/hu.json"),
  ga: () => import("./messages/ga.json"),
  it: () => import("./messages/it.json"),
  lv: () => import("./messages/lv.json"),
  lt: () => import("./messages/lt.json"),
  mt: () => import("./messages/mt.json"),
  pl: () => import("./messages/pl.json"),
  pt: () => import("./messages/pt.json"),
  ro: () => import("./messages/ro.json"),
  sk: () => import("./messages/sk.json"),
  sl: () => import("./messages/sl.json"),
  es: () => import("./messages/es.json"),
  sv: () => import("./messages/sv.json"),
  ar: () => import("./messages/ar.json"),
  zh: () => import("./messages/zh.json"),
};

/** The dictionary for a locale (missing keys are filled from English at lookup time). */
export async function getMessages(locale: Locale): Promise<Messages> {
  if (locale === DEFAULT_LOCALE) return en as Messages;
  try {
    return (await loaders[locale]()).default;
  } catch {
    return en as Messages;
  }
}

/** Server-side `t`. */
export async function getT(locale: Locale) {
  const messages = await getMessages(locale);
  return (key: string, vars?: Record<string, string | number>) => translate(messages, en as Messages, key, vars);
}
