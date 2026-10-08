"use client";

import { formatMoney } from "@/lib/format";
import type { Money } from "@/lib/types";
import { useEurPerSek } from "./CurrencyProvider";

/** The shop price (SEK) followed by an approximate EUR amount. */
export default function Price({ money }: { money: Money }) {
  const eurPerSek = useEurPerSek();
  const eur =
    eurPerSek > 0 && money.currencyCode === "SEK"
      ? formatMoney({ amount: Math.round(money.amount * eurPerSek * 100) / 100, currencyCode: "EUR" })
      : null;

  return (
    <>
      {formatMoney(money)}
      {eur && <span className="price__eur">≈ {eur}</span>}
    </>
  );
}
