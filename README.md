# SCUDARO

Första utkastet av webbshopen. Ren HTML/CSS/JS utan byggsteg.

## Kör lokalt

```bash
python3 -m http.server 8000
# öppna http://localhost:8000
```

## Struktur

- `index.html` – sidans struktur
- `styles.css` – mörkt tema, rödaccent, responsiv grid (3 → 2 kolumner)
- `main.js` – produktdata, scroll-styrd 3D-karusell, filter och varukorgsräknare
- `assets/` – logotyper (vit och svart, transparent bakgrund)

## Det som är placeholder

- **Produktbilder:** tröjorna är SVG-grafik. Byt ut mot riktiga foton (3:4) i `main.js`.
- **3D-karusellen:** plaggen är SVG som vrids i 3D med CSS. Med riktiga produktbilder (helst PNG med transparent bakgrund, bakifrån, 3:4) blir effekten mycket starkare. Byt ut `garment()` i `main.js` mot `<img>`.
- **Produktnamn och priser:** påhittade. Använd egna namn som inte innehåller andras varumärken (stallnamn, förare, loggor) utan licens.
- **Varukorg, inloggning, sök och nyhetsbrev:** inte kopplade till något. Nästa steg är en betalningslösning (t.ex. Shopify eller Stripe).
