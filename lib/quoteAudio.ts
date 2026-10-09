/**
 * Spoken quote shown as a "Hear it" button on product pages.
 * `match` is a lowercase fragment of the product handle (the part after /products/), so one
 * file can cover several products (e.g. the tee AND the hoodie of the same quote).
 * Files live in /public/audio. To add one: drop the mp3 there and add a line below.
 */
export const QUOTE_AUDIO: { match: string; file: string }[] = [
  { match: "gp2", file: "/audio/gp2-engine.mp3" },
];

export function quoteAudioFor(handle: string): string | null {
  const h = handle.toLowerCase();
  return QUOTE_AUDIO.find((q) => h.includes(q.match))?.file ?? null;
}
