"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Img, Product } from "@/lib/types";
import AddToCart from "./AddToCart";
import Garment from "./Garment";

/** Product page: image(s) on top (full width on phones), details and the add-to-cart bar below. */
export default function ProductDetail({ product }: { product: Product }) {
  // Product images plus any variant (colour) images that are not already in the list.
  const gallery = useMemo<Img[]>(() => {
    const seen = new Set<string>();
    const out: Img[] = [];
    for (const img of [...product.images, ...product.variants.map((v) => v.image)]) {
      if (img && !seen.has(img.url)) {
        seen.add(img.url);
        out.push(img);
      }
    }
    return out;
  }, [product]);

  // Start on the image of the first in-stock variant, which is the colour AddToCart preselects.
  const [activeUrl, setActiveUrl] = useState<string | undefined>(
    () => product.variants.find((v) => v.availableForSale && v.image)?.image?.url ?? gallery[0]?.url,
  );
  const onColorImage = useCallback((img: Img) => setActiveUrl(img.url), []);
  const active = gallery.find((i) => i.url === activeUrl) ?? gallery[0];

  return (
    <article className="pdp">
      <div className="pdp__media" style={{ "--tile": product.tile } as CSSProperties}>
        {active ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active.url} alt={active.alt} decoding="async" draggable={false} />
        ) : (
          <Garment product={product} />
        )}
        {gallery.length > 1 && (
          <div className="pdp__thumbs" role="group" aria-label="Product images">
            {gallery.map((img, i) => (
              <button
                key={img.url}
                className="pdp__thumb"
                aria-label={`Show image ${i + 1}`}
                aria-pressed={img.url === active?.url}
                onClick={() => setActiveUrl(img.url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" loading="lazy" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp__info">
        <Link href="/#shop" className="pdp__crumbs">&larr; All products</Link>
        <h1 className="pdp__title">{product.title}</h1>
        <AddToCart product={product} onColorImage={onColorImage} />
      </div>
    </article>
  );
}
