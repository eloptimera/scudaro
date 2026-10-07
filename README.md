# SCUDARO

First draft of the web shop. Plain HTML/CSS/JS, no build step.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

- `index.html` – page structure
- `styles.css` – dark theme, red accent, responsive grid (3 → 2 columns)
- `main.js` – product data, scroll-driven 3D carousel, filters and cart counter
- `assets/` – logos (white and black, transparent background)

## Placeholders

- **Product images:** the garments are SVG graphics. Replace them with real photos (3:4) in `main.js`.
- **3D carousel:** the garments are SVG rotated in 3D with CSS. Real product images (ideally PNGs with a transparent background, seen from behind, 3:4) make the effect much stronger. Swap `garment()` in `main.js` for an `<img>`.
- **Product names and prices:** made up. Use your own names that don't contain other people's trademarks (team names, drivers, logos) without a licence.
- **Cart, login, search and newsletter:** not connected to anything. Next step is a payment solution (e.g. Shopify or Stripe).
