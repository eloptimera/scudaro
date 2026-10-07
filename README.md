# SCUDARO

Headless web shop: **Next.js (App Router)** on Vercel, **Shopify** as the commerce backend.

Without Shopify credentials the site runs on built-in demo products so you can design and test locally.
With credentials it reads products from the Shopify Storefront API, keeps the cart in Shopify and sends
customers to Shopify's hosted checkout.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional – leave empty for demo mode
npm run dev                  # http://localhost:3000
```

## Connect Shopify

1. In Shopify Admin create the products (title, description, images, variants – e.g. option "Size": S/M/L/XL).
2. Create a Storefront API token: **Settings → Apps and sales channels → Develop apps** (or the Headless channel).
   Enable Storefront API scopes for products, cart and checkout. Use the **Storefront** token – never an Admin token.
3. Add these variables in `.env.local` and in Vercel (**Project → Settings → Environment Variables**):

   | Variable | Value |
   | --- | --- |
   | `SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` |
   | `SHOPIFY_STOREFRONT_TOKEN` | Storefront access token |
   | `SHOPIFY_API_VERSION` | optional, defaults to `2026-04` – check Shopify's docs for supported versions |
   | `SHOPIFY_WEBHOOK_SECRET` | signing secret for the webhook below |

4. **Keep products fresh:** in Shopify Admin → Settings → Notifications → Webhooks add `products/create`,
   `products/update` and `products/delete` (JSON) pointing to `https://<your-domain>/api/revalidate`.
   Without it, product data refreshes every 5 minutes.
5. Redeploy on Vercel. Make sure the project's **Framework Preset is Next.js**.

### Product images and the 3D carousel

The carousel uses each product's **first image**. For the best effect upload a PNG with a **transparent
background**, garment seen from behind, roughly 3:4, as the first image. Products without images fall back
to the SVG placeholder.

### Optional styling via Shopify tags

| Tag | Effect |
| --- | --- |
| `tile:#1d4f91` | glow colour behind the garment |
| `word:APEX` | big faded word in the carousel (defaults to the first word of the title) |
| `badge:New` | label on the product card |

Product type or title containing "hoodie" / "tee" drives the filter chips.

## Structure

```
app/                 routes: / , /products/[handle], /api/revalidate, server actions (cart)
components/          Stage (scroll-driven 3D carousel), Shop grid, cart drawer, header, footer
lib/shopify.ts       Storefront API client (products + cart)
lib/cart.ts          cart logic for live mode and demo mode
lib/mock.ts          demo catalogue
public/              logos
```

## Not built yet

- Search, customer accounts (the "Log in" link goes to Shopify's hosted account page when connected)
- Newsletter sign-up is a demo form – connect Shopify Email, Klaviyo or Mailchimp
- Multi-currency / languages (Shopify Markets)
- Real product photography
