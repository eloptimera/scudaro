import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/**
 * Shopify webhook → refresh product and collection data immediately.
 * In Shopify Admin → Settings → Notifications → Webhooks add products/create,
 * products/update, products/delete, collections/create, collections/update and
 * collections/delete pointing at https://<your-domain>/api/revalidate
 * (JSON format) and put the signing secret in SHOPIFY_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret not configured", { status: 503 });

  const body = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const expected = createHmac("sha256", secret).update(body, "utf8").digest("base64");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response("Invalid signature", { status: 401 });
  }

  // expire: 0 = drop the cache right now. "max" would be stale-while-revalidate, i.e. the first
  // visitor after a webhook still gets the OLD data and only the next one sees the new.
  revalidateTag("products", { expire: 0 });
  revalidateTag("collections", { expire: 0 });
  return Response.json({ revalidated: true });
}
