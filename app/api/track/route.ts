import { NextResponse } from "next/server";
import { adminQuery, isAdminConfigured } from "@/lib/shopifyAdmin";
import { isPlausibleEmail, orderNameCandidates, pickMatch, toResult } from "@/lib/track";

export const dynamic = "force-dynamic";

const QUERY = /* GraphQL */ `
  query TrackOrder($q: String!) {
    orders(first: 3, query: $q) {
      nodes {
        name
        email
        cancelledAt
        fulfillments {
          displayStatus
          trackingInfo { company number url }
        }
      }
    }
  }
`;

// Best-effort limit per IP (in memory, so it resets per server instance). It slows guessing; it is not a hard guarantee.
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 8;
}

/** POST { order, email } → { status, shipments } | { error }. Both fields must match; every miss looks the same. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "rate" }, { status: 429 });
  if (!isAdminConfigured) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  let body: { order?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const order = typeof body.order === "string" ? body.order : "";
  const email = typeof body.email === "string" ? body.email : "";
  const names = orderNameCandidates(order);
  if (names.length === 0 || !isPlausibleEmail(email)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    for (const name of names) {
      const data = await adminQuery<{ orders: { nodes: Parameters<typeof pickMatch>[0] } }>(QUERY, {
        q: `name:"${name}"`,
      });
      const match = pickMatch(data.orders.nodes, email);
      if (match) return NextResponse.json(toResult(match));
    }
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  } catch (e) {
    console.error("[track] lookup failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
