"use client";

import { useId, useState, type CSSProperties } from "react";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { useI18n } from "./I18nProvider";
import LocalLink from "./LocalLink";
import ProductVisual from "./ProductVisual";

type Sort = "featured" | "low" | "high";

export default function Shop({
  products,
  title,
  crumb,
}: {
  products: Product[];
  title: string;
  /** Back link shown above the title. */
  crumb?: { href: string; label: string };
}) {
  const { t, plural, locale } = useI18n();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("featured");
  const sortId = useId();

  const kinds = Array.from(new Set(products.map((p) => p.kind)));
  const count = (k: string) => (k === "all" ? products.length : products.filter((p) => p.kind === k).length);

  const visible = products
    .filter((p) => filter === "all" || p.kind === filter)
    .slice()
    .sort((a, b) => (sort === "low" ? a.price.amount - b.price.amount : sort === "high" ? b.price.amount - a.price.amount : 0));

  return (
    <section className="shop" id="shop" aria-labelledby="shop-title">
      <header className="shop__hero">
        {crumb && (
          <LocalLink href={crumb.href} className="shop__crumb">
            <span className="dir-arrow" aria-hidden="true">&larr;</span> {crumb.label}
          </LocalLink>
        )}
        <p className="shop__eyebrow">{t("shop.eyebrow")}</p>
        <h1 id="shop-title">{title}</h1>
        <p className="shop__lead">
          {t("shop.lead", { amount: formatMoney(FREE_SHIPPING_THRESHOLD, locale) })}
        </p>
      </header>

      {products.length > 0 && (
        <div className="shop__bar">
          {kinds.length > 1 ? (
            <div className="filters" role="group" aria-label={t("shop.filter")}>
              {["all", ...kinds].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`chip${filter === k ? " is-active" : ""}`}
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                >
                  {k === "all" ? t("shop.filterAll") : t(`shop.kind.${k}`)}
                  <span className="chip__n">{count(k)}</span>
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          <div className="shop__tools">
            <p className="shop__count" role="status" aria-live="polite">
              {plural("shop.count", visible.length)}
            </p>
            <label className="sort" htmlFor={sortId}>
              <span>{t("shop.sort")}</span>
              <select id={sortId} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="featured">{t("shop.sort.featured")}</option>
                <option value="low">{t("shop.sort.low")}</option>
                <option value="high">{t("shop.sort.high")}</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>{t("shop.empty")}</p>
      ) : (
        <div className="grid" key={`${filter}-${sort}`}>
          {visible.map((p, i) => {
            const soldOut = p.variants.every((v) => !v.availableForSale);
            const tag = soldOut ? t("card.soldout") : p.tag;
            return (
              <LocalLink
                key={p.id}
                href={`/products/${p.handle}`}
                className={`card${soldOut ? " is-soldout" : ""}`}
                style={{ "--i": Math.min(i, 8) } as CSSProperties}
              >
                <div className="card__media">
                  {tag && <span className={`card__tag${soldOut ? " card__tag--out" : ""}`}>{tag}</span>}
                  <ProductVisual product={p} priority={i < 4} />
                </div>
                <div className="card__info">
                  <p className="card__kind">{t(`shop.name.${p.kind}`)}</p>
                  <h2 className="card__name">{p.title}</h2>
                  <p className="card__price">
                    <span>{formatMoney(p.price, locale)}</span>
                    {p.compareAt && <s>{formatMoney(p.compareAt, locale)}</s>}
                  </p>
                </div>
              </LocalLink>
            );
          })}
        </div>
      )}
    </section>
  );
}
