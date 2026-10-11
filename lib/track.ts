/** Pure helpers for the "track your order" lookup (no I/O, so they can be tested on their own). */

export type TrackStatus = "processing" | "shipped" | "delivered" | "cancelled";
export type Shipment = { carrier: string; number: string; url: string | null };
export type TrackResult = { order: string; status: TrackStatus; shipments: Shipment[] };

/** What a customer might type for order #1001: "1001", "#1001", " # 1001 ". Prefixed names (e.g. "SC1001") are tried as typed. */
export function orderNameCandidates(raw: string): string[] {
  const s = raw.trim().replace(/\s+/g, "");
  if (!s || s.length > 30 || !/^[#A-Za-z0-9-]+$/.test(s)) return [];
  const bare = s.replace(/^#/, "");
  if (!bare) return [];
  return [...new Set([`#${bare}`, bare])];
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isPlausibleEmail(raw: string): boolean {
  const e = raw.trim();
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/** Only ever link to a real https carrier page. */
export function safeUrl(u: unknown): string | null {
  if (typeof u !== "string") return null;
  try {
    const url = new URL(u);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

type AdminOrder = {
  name?: string | null;
  email?: string | null;
  cancelledAt?: string | null;
  fulfillments?: Array<{
    displayStatus?: string | null;
    trackingInfo?: Array<{ company?: string | null; number?: string | null; url?: string | null }> | null;
  }> | null;
};

/** Reduces a Shopify order to the few fields that are safe to show: status and tracking. No address, items or prices. */
export function toResult(o: AdminOrder): TrackResult {
  const fulfillments = o.fulfillments ?? [];
  const shipments: Shipment[] = [];
  for (const f of fulfillments) {
    for (const t of f.trackingInfo ?? []) {
      if (t?.number) shipments.push({ carrier: t.company ?? "", number: t.number, url: safeUrl(t.url) });
    }
  }
  const delivered = fulfillments.length > 0 && fulfillments.every((f) => f.displayStatus === "DELIVERED");
  const status: TrackStatus = o.cancelledAt
    ? "cancelled"
    : delivered
      ? "delivered"
      : fulfillments.length > 0
        ? "shipped"
        : "processing";
  return { order: o.name ?? "", status, shipments };
}

/** The order only counts as a match if the email on it equals the email the customer typed. */
export function pickMatch(orders: AdminOrder[], emailRaw: string): AdminOrder | null {
  const want = normalizeEmail(emailRaw);
  return orders.find((o) => o.email && normalizeEmail(o.email) === want) ?? null;
}
