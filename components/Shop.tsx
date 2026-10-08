"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import Price from "./Price";
import ProductVisual from "./ProductVisual";

const LABELS: Record<string, string> = { tee: "T-shirts", hoodie: "Hoodies", other: "Other" };

export default function Shop({ products, title = "New arrivals" }: { products: Product[]; title?: string }) {
  const [filter, setFilter] = useState("all");
  const kinds = Array.from(new Set(products.map((p) => p.kind)));
  const visible = products.filter((p) => filter === "all" || p.kind === filter);

  return (
    <section className="shop" id="shop" aria-labelledby="shop-title">
      <div className="shop__head">
        <h2 id="shop-title">{title}</h2>
        {kinds.length > 1 && (
          <div className="filters" role="group" aria-label="Filter products">
            {["all", ...kinds].map((k) => (
              <button
                key={k}
                className={`chip${filter === k ? " is-active" : ""}`}
                aria-pressed={filter === k}
                onClick={() => setFilter(k)}
              >
                {k === "all" ? "All" : LABELS[k]}
              </button>
            ))}
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No products yet – check back soon.</p>
      ) : (
        <div className="grid">
          {visible.map((p) => {
            const soldOut = p.variants.every((v) => !v.availableForSale);
            const tag = soldOut ? "Sold out" : p.tag;
            return (
              <Link key={p.id} href={`/products/${p.handle}`} className="card">
                <div className="card__media" style={{ "--tile": p.tile } as CSSProperties}>
                  {tag && <span className="card__tag">{tag}</span>}
                  <ProductVisual product={p} />
                  <span className="card__cta">{soldOut ? "View" : "Choose size"}</span>
                </div>
                <div className="card__info">
                  <h3 className="card__name">{p.title}</h3>
                  <p className="card__price">
                    <Price money={p.price} />
                    {p.compareAt && <s><Price money={p.compareAt} /></s>}
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
