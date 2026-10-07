import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/**
 * Shopify webhook → refresh product data immediately.
 * In Shopify Admin → Settings → Notifications → Webhooks add products/create,
 * products/update and products/delete pointing at https://<your-domain>/api/revalidate
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

  revalidateTag("products", "max");
  return Response.json({ revalidated: true });
}
