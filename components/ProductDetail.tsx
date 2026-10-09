"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Img, Product } from "@/lib/types";
import AddToCart from "./AddToCart";
import Garment from "./Garment";

/** Product page: swipeable images on top (full width on phones), details and the add-to-cart bar below. */
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
  const startIndex = useMemo(() => {
    const url = product.variants.find((v) => v.availableForSale && v.image)?.image?.url;
    return Math.max(0, gallery.findIndex((g) => g.url === url));
  }, [product, gallery]);

  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);

  const goTo = useCallback((i: number, smooth = true) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    goTo(startIndex, false);
  }, [startIndex, goTo]);

  const onScroll = () => {
    const el = trackRef.current;
    if (el && el.clientWidth) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  // Choosing a colour jumps to that colour's image.
  const onColorImage = useCallback(
    (img: Img) => {
      const i = gallery.findIndex((g) => g.url === img.url);
      if (i >= 0) goTo(i);
    },
    [gallery, goTo],
  );

  const many = gallery.length > 1;

  return (
    <article className="pdp">
      <div className="pdp__media" style={{ "--tile": product.tile } as CSSProperties}>
        <div className="pdp__track" ref={trackRef} onScroll={onScroll} aria-label="Product images">
          {gallery.length === 0 ? (
            <div className="pdp__slide"><Garment product={product} /></div>
          ) : (
            gallery.map((img, i) => (
              <div className="pdp__slide" key={img.url} aria-hidden={i !== index}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} decoding="async" draggable={false} />
              </div>
            ))
          )}
        </div>

        {many && (
          <>
            <button className="pdp__arrow pdp__arrow--prev" aria-label="Previous image" onClick={() => goTo(Math.max(0, index - 1))}>&larr;</button>
            <button className="pdp__arrow pdp__arrow--next" aria-label="Next image" onClick={() => goTo(Math.min(gallery.length - 1, index + 1))}>&rarr;</button>
            <div className="pdp__dots" aria-hidden="true">
              {gallery.map((img, i) => (
                <span key={img.url} className={i === index ? "is-active" : undefined} />
              ))}
            </div>
          </>
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
