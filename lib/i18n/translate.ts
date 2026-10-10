import type { ReactNode } from "react";

export type Messages = Record<string, string>;
type Vars = Record<string, string | number>;

/** Looks up `key`, falling back to English (then the key itself), and fills `{name}` placeholders. */
export function translate(messages: Messages, fallback: Messages, key: string, vars?: Vars): string {
  const raw = messages[key] ?? fallback[key] ?? key;
  return vars ? raw.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : raw;
}

/** Like translate, but placeholders may be React nodes (e.g. `<strong>`); returns an array of nodes. */
export function translateRich(messages: Messages, fallback: Messages, key: string, vars: Record<string, ReactNode>): ReactNode[] {
  const raw = messages[key] ?? fallback[key] ?? key;
  return raw.split(/(\{\w+\})/g).map((part) => {
    const m = /^\{(\w+)\}$/.exec(part);
    return m && m[1] in vars ? vars[m[1]] : part;
  });
}
