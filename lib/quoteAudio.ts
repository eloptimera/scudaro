/**
 * Spoken quote shown as a "Hear it" button on product pages.
 * `match` is a lowercase fragment of the product handle (the part after /products/), so one
 * file can cover several products (e.g. the tee AND the hoodie of the same quote).
 * Files live in /public/audio. To add one: drop the mp3 there and add a line below.
 */
export const QUOTE_AUDIO: { match: string; file: string }[] = [
  // Most specific first: the first matching entry wins.
  { match: "smooth-operator", file: "/audio/smooth-operator.mp3" },
  { match: "balls-3", file: "/audio/balls-3.mp3" },
  { match: "i-am-stupid", file: "/audio/i-am-stupid.mp3" },
  { match: "tripod", file: "/audio/tripod-10.mp3" },
  { match: "maria-carey-55", file: "/audio/maria-carey-55.mp3" },
  { match: "maria-careyy-55", file: "/audio/maria-carey-55.mp3" },
  { match: "mariah-carey-55", file: "/audio/maria-carey-55.mp3" },
  { match: "engine-14", file: "/audio/engine-14.mp3" },
  { match: "engiene-14", file: "/audio/engine-14.mp3" },
  { match: "gp2", file: "/audio/gp2-engine.mp3" },
];

export function quoteAudioFor(handle: string): string | null {
  const h = handle.toLowerCase();
  return QUOTE_AUDIO.find((q) => h.includes(q.match))?.file ?? null;
}
