"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export default function AddToCart({ product }: { product: Product }) {
  const { add, busy } = useCart();
  const single = product.variants.length === 1 && product.variants[0].title === "Default Title";
  const [selectedId, setSelectedId] = useState<string | null>(
    single && product.variants[0].availableForSale ? product.variants[0].id : null,
  );

  const selected = product.variants.find((v) => v.id === selectedId) ?? null;
  const soldOut = product.variants.every((v) => !v.availableForSale);
  const price = selected?.price ?? product.price;
  const compareAt = selected ? selected.compareAt : product.compareAt;

  return (
    <>
      <p className="pdp__price">
        {formatMoney(price)}
        {compareAt && compareAt.amount > price.amount && <s>{formatMoney(compareAt)}</s>}
      </p>

      <div className="pdp__desc">{product.description}</div>

      {!single && (
        <>
          <p className="pdp__label" id="size-label">Size</p>
          <div className="sizes" role="group" aria-labelledby="size-label">
            {product.variants.map((v) => (
              <button
                key={v.id}
                className="size"
                disabled={!v.availableForSale}
                aria-pressed={v.id === selectedId}
                onClick={() => setSelectedId(v.id)}
              >
                {v.title}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        className="btn btn--light btn--block"
        disabled={soldOut || !selected || busy}
        onClick={() => selected && add(selected.id)}
      >
        {soldOut ? "Sold out" : !selected ? "Select a size" : busy ? "Adding…" : "Add to cart"}
      </button>
      <p className="pdp__note">Free shipping over SEK 799 · 30-day returns</p>
    </>
  );
}
