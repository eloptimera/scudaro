import { readConsent } from "./consent";

/** The Meta Pixel ID is public (it is visible in any page that uses the pixel), so it is safe in client code. */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1848885802939682";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[][]; loaded?: boolean; version?: string; push?: unknown };
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    __pixelQueue?: [string, Record<string, unknown>][];
  }
}

/** `gid://shopify/Product/123` → `123` */
export const numericId = (gid: string) => gid.split("/").pop() ?? gid;

/**
 * Standard event. Sent straight away when the pixel is running; held (max 20) while the visitor has not
 * chosen yet, and dropped if they reject. Never sends anything without consent.
 */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const consent = readConsent();
  if (consent === "denied") return;
  if (consent === "granted" && window.fbq) {
    window.fbq("track", event, params);
    return;
  }
  const q = (window.__pixelQueue ??= []);
  if (q.length < 20) q.push([event, params]);
}

/** Loads Meta's script and initialises the pixel. Call only after consent. */
export function loadPixel() {
  if (typeof window === "undefined" || window.fbq) return;
  const f = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else (n.queue as unknown[][]).push(args);
  } as Fbq;
  const n = f;
  window.fbq = f;
  window._fbq = f;
  n.push = (...a: unknown[]) => (n.queue as unknown[][]).push(a);
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq("init", META_PIXEL_ID);
}

/** Removes the pixel's own cookies when a visitor withdraws consent. */
export function clearPixelCookies() {
  for (const name of ["_fbp", "_fbc"]) {
    for (const domain of [location.hostname, `.${location.hostname.replace(/^www\./, "")}`]) {
      document.cookie = `${name}=; path=/; domain=${domain}; max-age=0`;
    }
    document.cookie = `${name}=; path=/; max-age=0`;
  }
}
