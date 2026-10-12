import { timingSafeEqual } from "node:crypto";
import { debugCartCompare } from "@/lib/shopify";

// TEMPORARY diagnostics. Disabled (404) unless DEBUG_CART_KEY is set in the environment.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.DEBUG_CART_KEY;
  if (!secret) return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  const a = Buffer.from(url.searchParams.get("key") ?? "");
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response("Not found", { status: 404 });

  const titles = (url.searchParams.get("titles") ?? "Together 44,Scudaro Tee - Fuck")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  try {
    const out = await debugCartCompare(titles);
    console.log("[cart-debug]", JSON.stringify(out));
    return Response.json(out, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
