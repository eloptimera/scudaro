import { API_VERSION, storeDomain } from "@/lib/shopify";

// TEMPORARY diagnostics – remove once Shopify is confirmed working. Exposes no secrets.
export const dynamic = "force-dynamic";

async function probe(version: string, query: string) {
  const res = await fetch(`https://${storeDomain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  return { version, status: res.status, body: (await res.text()).slice(0, 600) };
}

export async function GET() {
  const small = "{ shop { name } }";
  const products = "{ products(first: 3) { nodes { title handle variants(first: 3) { nodes { title availableForSale } } } } }";
  const results = [
    await probe(API_VERSION, small),
    await probe(API_VERSION, products),
    await probe("2026-07", small),
    await probe("2026-04", small),
  ];
  return Response.json({ configuredVersion: API_VERSION, storeDomain, results }, { status: 200 });
}
