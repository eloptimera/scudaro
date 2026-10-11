import "server-only";
import { API_VERSION, storeDomain } from "./shopify";

/**
 * Admin API access, used ONLY by the order lookup. Two ways to configure it (server-side env vars):
 *  - SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET: an app made in the Shopify Dev Dashboard. A token is fetched with the
 *    client-credentials grant and renewed automatically (it lasts ~24 h).
 *  - SHOPIFY_ADMIN_TOKEN: a static token from an older custom app.
 * The app needs the `read_orders` scope and nothing else.
 */
let cached: { token: string; exp: number } | null = null;

export const isAdminConfigured = Boolean(
  storeDomain &&
    (process.env.SHOPIFY_ADMIN_TOKEN?.trim() ||
      (process.env.SHOPIFY_CLIENT_ID?.trim() && process.env.SHOPIFY_CLIENT_SECRET?.trim())),
);

async function adminToken(): Promise<string> {
  const fixed = process.env.SHOPIFY_ADMIN_TOKEN?.trim();
  if (fixed) return fixed;
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;

  const res = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SHOPIFY_CLIENT_ID!.trim(),
      client_secret: process.env.SHOPIFY_CLIENT_SECRET!.trim(),
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin token request failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error("Admin token response had no access_token");
  cached = { token: json.access_token, exp: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return cached.token;
}

export async function adminQuery<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${storeDomain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Shopify-Access-Token": await adminToken() },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin API ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors || !json.data) throw new Error(`Admin API error: ${JSON.stringify(json.errors).slice(0, 300)}`);
  return json.data;
}
