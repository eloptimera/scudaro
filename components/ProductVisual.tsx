import type { Product } from "@/lib/types";
import Garment from "./Garment";

/** The product's first Shopify image, or the SVG placeholder when it has none. */
export default function ProductVisual({ product, priority = false }: { product: Product; priority?: boolean }) {
  const img = product.images[0];
  if (!img) return <Garment product={product} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.url}
      alt={img.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
