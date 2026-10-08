"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { Product, Variant } from "@/lib/types";
import { useCart } from "./CartProvider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { formatMoney } from "@/lib/format";

type Group = { name: string; values: string[] };
type Choice = Record<string, string>;

const isColor = (name: string) => /colou?r/i.test(name);
const hasValue = (v: Variant, name: string, value: string) => v.options.some((o) => o.name === name && o.value === value);
const matches = (v: Variant, choice: Choice) => Object.entries(choice).every(([n, val]) => hasValue(v, n, val));

export default function AddToCart({ product }: { product: Product }) {
  const { add, busy } = useCart();
  const single = product.variants.length === 1 && product.variants[0].title === "Default Title";

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, string[]>();
    for (const v of product.variants) {
      for (const o of v.options) {
        const values = map.get(o.name) ?? [];
        if (!values.includes(o.value)) values.push(o.value);
        map.set(o.name, values);
      }
    }
    return [...map].map(([name, values]) => ({ name, values }));
  }, [product.variants]);

  const [choice, setChoice] = useState<Choice>(() => {
    if (single) return {};
    const initial: Choice = {};
    for (const g of groups) {
      // Only one possible value → nothing to decide. Colour → start on the first colour that is in stock.
      if (g.values.length === 1) initial[g.name] = g.values[0];
      else if (isColor(g.name)) {
        const inStock = g.values.find((val) => product.variants.some((v) => v.availableForSale && hasValue(v, g.name, val)));
        if (inStock) initial[g.name] = inStock;
      }
    }
    return initial;
  });

  const pick = (name: string, value: string) => {
    setChoice((prev) => {
      const next: Choice = { ...prev, [name]: prev[name] === value ? "" : value };
      if (!next[name]) delete next[name];
      // Drop earlier picks in other groups that no longer exist in stock together with the new one.
      for (const g of groups) {
        if (g.name === name || !next[g.name]) continue;
        if (!product.variants.some((v) => v.availableForSale && matches(v, next))) delete next[g.name];
      }
      return next;
    });
  };

  /** A value is selectable if some in-stock variant has it together with the other current picks. */
  const inStock = (name: string, value: string) =>
    product.variants.some((v) => v.availableForSale && hasValue(v, name, value) && matches(v, { ...choice, [name]: value }));

  const missing = groups.filter((g) => !choice[g.name]);
  const selected = single
    ? (product.variants[0].availableForSale ? product.variants[0] : null)
    : missing.length === 0
      ? (product.variants.find((v) => matches(v, choice)) ?? null)
      : null;

  const soldOut = product.variants.every((v) => !v.availableForSale);
  const price = selected?.price ?? product.price;
  const compareAt = selected ? selected.compareAt : product.compareAt;

  const buttonLabel = soldOut
    ? "Sold out"
    : busy
      ? "Adding…"
      : selected
        ? "Add to cart"
        : missing.length === 1
          ? `Select a ${missing[0].name.toLowerCase()}`
          : `Select ${missing.map((g) => g.name.toLowerCase()).join(" and ")}`;

  return (
    <>
      <p className="pdp__price">
        {formatMoney(price)}
        {compareAt && compareAt.amount > price.amount && <s>{formatMoney(compareAt)}</s>}
      </p>

      <div className="pdp__desc">{product.description}</div>

      {!single &&
        groups.map((g) => (
          <div className="opt" key={g.name}>
            <p className="pdp__label" id={`opt-${g.name}`}>
              {g.name}
              {choice[g.name] && <span className="pdp__label-value"> — {choice[g.name]}</span>}
            </p>
            <div className="opt__values" role="group" aria-labelledby={`opt-${g.name}`}>
              {g.values.map((val) => (
                <button
                  key={val}
                  className={isColor(g.name) ? "swatch" : "size"}
                  style={isColor(g.name) ? ({ "--dot": val.toLowerCase().replace(/\s+/g, "") } as CSSProperties) : undefined}
                  disabled={!inStock(g.name, val)}
                  aria-pressed={choice[g.name] === val}
                  onClick={() => pick(g.name, val)}
                >
                  {isColor(g.name) && <span className="swatch__dot" aria-hidden="true" />}
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}

      <button
        className="btn btn--light btn--block"
        disabled={soldOut || !selected || busy}
        onClick={() => selected && add(selected.id)}
      >
        {buttonLabel}
      </button>
      <p className="pdp__note">Free shipping over {formatMoney(FREE_SHIPPING_THRESHOLD)} · 30-day returns</p>
    </>
  );
}
