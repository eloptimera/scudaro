import type { Collection } from "@/lib/types";
import Garment from "./Garment";

/** The collection's image (own image, else its first product's), or the SVG placeholder when there is none. */
export default function CollectionVisual({ collection, priority = false }: { collection: Collection; priority?: boolean }) {
  const img = collection.image;
  if (!img) return <Garment product={collection} />;
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
