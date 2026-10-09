"use client";

import { useId, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import ProductVisual from "./ProductVisual";

const LABELS: Record<string, string> = { tee: "T-shirts", hoodie: "Hoodies", other: "Other" };
const KIND_NAME: Record<string, string> = { tee: "T-shirt", hoodie: "Hoodie", other: "Accessory" };

type Sort = "featured" | "low" | "high";

export default function Shop({
  products,
  title = "New arrivals",
  crumb,
}: {
  products: Product[];
  title?: string;
  /** Back link shown above the title. */
  crumb?: { href: string; label: string };
}) {
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
          <Link href={crumb.href} className="shop__crumb">
            <span aria-hidden="true">&larr;</span> {crumb.label}
          </Link>
        )}
        <p className="shop__eyebrow">Scudaro · Race-day streetwear</p>
        <h1 id="shop-title">{title}</h1>
        <p className="shop__lead">
          Made to order, printed per piece. Free shipping over {formatMoney(FREE_SHIPPING_THRESHOLD)}.
        </p>
      </header>

      {products.length > 0 && (
        <div className="shop__bar">
          {kinds.length > 1 ? (
            <div className="filters" role="group" aria-label="Filter products">
              {["all", ...kinds].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`chip${filter === k ? " is-active" : ""}`}
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                >
                  {k === "all" ? "All" : LABELS[k]}
                  <span className="chip__n">{count(k)}</span>
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          <div className="shop__tools">
            <p className="shop__count" role="status" aria-live="polite">
              {visible.length} {visible.length === 1 ? "product" : "products"}
            </p>
            <label className="sort" htmlFor={sortId}>
              <span>Sort</span>
              <select id={sortId} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No products yet – check back soon.</p>
      ) : (
        <div className="grid" key={`${filter}-${sort}`}>
          {visible.map((p, i) => {
            const soldOut = p.variants.every((v) => !v.availableForSale);
            const tag = soldOut ? "Sold out" : p.tag;
            return (
              <Link
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
                  <p className="card__kind">{KIND_NAME[p.kind] ?? ""}</p>
                  <h2 className="card__name">{p.title}</h2>
                  <p className="card__price">
                    <span>{formatMoney(p.price)}</span>
                    {p.compareAt && <s>{formatMoney(p.compareAt)}</s>}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
