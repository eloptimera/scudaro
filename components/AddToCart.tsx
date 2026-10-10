"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Img, Product, Variant } from "@/lib/types";
import { useCart } from "./CartProvider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { formatMoney } from "@/lib/format";
import { useI18n } from "./I18nProvider";

type Group = { name: string; values: string[] };
type Choice = Record<string, string>;

/** Option names may be translated by Shopify ("Farbe", "Couleur"…), so colour is recognised by name in many languages
 *  or, failing that, as "the option that is not a size" (sizes are language-independent: XS, S, M, 42…). */
const COLOR_NAME = /colou?r|farbe|couleur|colore|kleur|kolor|f[aä]rg|farve|väri|barva|farba|culoare|szín|cor\b|χρώμα|цвят|boja|värv|krāsa|spalva|dath|kulur|اللون|颜色|顏色/i;
const SIZE_VALUE = /^(x{0,3}[sml]|[2-6]xl|xxs|one size|os|\d{1,3}(\.\d)?)$/i;
const isSizeGroup = (g: { values: string[] }) => g.values.length > 0 && g.values.every((v) => SIZE_VALUE.test(v.trim()));
function colorGroupName(groups: { name: string; values: string[] }[]): string | undefined {
  const byName = groups.find((g) => COLOR_NAME.test(g.name) && !isSizeGroup(g));
  if (byName) return byName.name;
  return groups.length > 1 ? groups.find((g) => !isSizeGroup(g))?.name : undefined;
}
const hasValue = (v: Variant, name: string, value: string) => v.options.some((o) => o.name === name && o.value === value);
const matches = (v: Variant, choice: Choice) => Object.entries(choice).every(([n, val]) => hasValue(v, n, val));

export default function AddToCart({ product, onColorImage }: { product: Product; onColorImage?: (img: Img) => void }) {
  const { add, busy } = useCart();
  const { t, locale } = useI18n();
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

  const colorKey = colorGroupName(groups);
  const isColor = (name: string) => name === colorKey;

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

  // Show the picture that belongs to the chosen colour.
  const colorGroup = groups.find((g) => g.name === colorKey);
  const colorName = colorGroup?.name;
  const colorValue = colorName ? choice[colorName] : undefined;
  useEffect(() => {
    if (!onColorImage || !colorName || !colorValue) return;
    const v = product.variants.find((x) => hasValue(x, colorName, colorValue) && x.image);
    if (v?.image) onColorImage(v.image);
  }, [colorName, colorValue, product.variants, onColorImage]);

  const missing = groups.filter((g) => !choice[g.name]);
  const selected = single
    ? (product.variants[0].availableForSale ? product.variants[0] : null)
    : missing.length === 0
      ? (product.variants.find((v) => matches(v, choice)) ?? null)
      : null;

  const soldOut = product.variants.every((v) => !v.availableForSale);
  const price = selected?.price ?? product.price;
  const compareAt = selected ? selected.compareAt : product.compareAt;

  // English reads "Select a color"; other languages keep the option name exactly as Shopify spells it (German nouns are capitalised).
  const optName = (n: string) => (locale === "en" ? n.toLowerCase() : n);
  const buttonLabel = soldOut
    ? t("pdp.soldout")
    : busy
      ? t("pdp.adding")
      : selected
        ? t("pdp.add")
        : missing.length === 1
          ? t("pdp.selectOne", { option: optName(missing[0].name) })
          : t("pdp.selectMany", { list: new Intl.ListFormat(locale, { type: "conjunction" }).format(missing.map((g) => optName(g.name))) });

  return (
    <>
      <p className="pdp__price">
        {formatMoney(price, locale)}
        {compareAt && compareAt.amount > price.amount && <s>{formatMoney(compareAt, locale)}</s>}
      </p>

      {product.description && (
        <details className="pdp__details">
          <summary>{t("pdp.description")}</summary>
          <div className="pdp__details-body">{product.description}</div>
        </details>
      )}

      {!single &&
        groups.map((g, i) => (
          <div className="opt" key={g.name} id={`opt-wrap-${i}`}>
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

      <div className="pdp__bar">
        <button
          className="btn btn--light btn--block"
          disabled={soldOut || busy}
          onClick={() => {
            if (selected) return add(selected.id);
            const first = groups.findIndex((g) => !choice[g.name]);
            if (first >= 0) document.getElementById(`opt-wrap-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          {buttonLabel}
        </button>
      </div>
      <p className="pdp__note">{t("pdp.note", { amount: formatMoney(FREE_SHIPPING_THRESHOLD, locale) })}</p>
    </>
  );
}
