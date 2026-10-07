import { useId } from "react";
import type { Product } from "@/lib/types";

/**
 * Placeholder artwork: a tee/hoodie seen from behind with a print.
 * Shown only for products that have no image in Shopify yet.
 */
export default function Garment({ product }: { product: Pick<Product, "title" | "kind" | "word" | "shirt" | "ink"> }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const hood = product.kind === "hoodie";
  const shape = hood
    ? "M70 70 Q100 20 130 70 L170 82 L190 230 L158 238 L152 150 L152 330 L48 330 L48 150 L42 238 L10 230 L30 82 Z"
    : "M62 40 Q100 62 138 40 L188 62 L172 120 L150 110 L150 320 L50 320 L50 110 L28 120 L12 62 Z";
  const word = product.word.slice(0, 8);

  return (
    <svg viewBox="0 0 200 340" role="img" aria-label={product.title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`sh-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".38" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".12" />
          <stop offset=".62" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".42" />
        </linearGradient>
      </defs>
      <path d={shape} fill={product.shirt} />
      {hood && <path d="M70 70 Q100 100 130 70 Q100 30 70 70Z" fill="rgba(0,0,0,.25)" />}
      <path d={shape} fill={`url(#sh-${uid})`} />
      <text
        x="100" y={hood ? 190 : 170} textAnchor="middle"
        fontFamily="Barlow Condensed, Impact, sans-serif" fontWeight={800} fontStyle="italic"
        fontSize={word.length > 5 ? 30 : 44} fill={product.ink}
      >
        {word}
      </text>
      <text
        x="100" y={hood ? 208 : 188} textAnchor="middle"
        fontFamily="Inter, sans-serif" fontWeight={600} fontSize="6" letterSpacing="2" fill={product.ink} opacity=".7"
      >
        SCUDARO · COLLECTION 01
      </text>
    </svg>
  );
}
