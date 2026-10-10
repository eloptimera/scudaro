"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useI18n } from "./I18nProvider";
import LocalLink from "./LocalLink";
import ProductVisual from "./ProductVisual";

const COUNT = 6;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** "You may also like": a different random pick of other products on every visit. */
export default function RelatedProducts({ products }: { products: Product[] }) {
  const { t, locale } = useI18n();
  // Server render + first paint use a fixed order (no hydration mismatch); we shuffle once mounted.
  const [shown, setShown] = useState(() => products.slice(0, COUNT));
  useEffect(() => {
    setShown(shuffle(products).slice(0, COUNT));
  }, [products]);

  if (shown.length === 0) return null;

  return (
    <section className="shop related" aria-labelledby="related-title">
      <div className="shop__head">
        <h2 id="related-title">{t("related.title")}</h2>
      </div>
      <div className="related__row">
        {shown.map((p) => (
          <LocalLink key={p.id} href={`/products/${p.handle}`} className="card">
            <div className="card__media" style={{ "--tile": p.tile } as CSSProperties}>
              {p.tag && <span className="card__tag">{p.tag}</span>}
              <ProductVisual product={p} />
            </div>
            <div className="card__info">
              <h3 className="card__name">{p.title}</h3>
              <p className="card__price">
                {formatMoney(p.price, locale)}
                {p.compareAt && <s>{formatMoney(p.compareAt, locale)}</s>}
              </p>
            </div>
          </LocalLink>
        ))}
      </div>
    </section>
  );
}
