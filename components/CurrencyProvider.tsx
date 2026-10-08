"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Approximate EUR per 1 SEK, fetched on the server. 0 = no conversion available. */
const EurRateContext = createContext(0);

export function CurrencyProvider({ eurPerSek, children }: { eurPerSek: number; children: ReactNode }) {
  return <EurRateContext.Provider value={eurPerSek}>{children}</EurRateContext.Provider>;
}

export const useEurPerSek = () => useContext(EurRateContext);
