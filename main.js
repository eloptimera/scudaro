// Produktdata – byt ut mot riktig katalog (t.ex. Shopify/Stripe) när det är dags.
const PRODUCTS = [
  { id: 1, name: "Apex – Oversized Tee",       type: "tee",    price: 599, was: 749, tile: "#1d4f91", shirt: "#0e0e10", ink: "#f4f4f2", word: "APEX",   tag: "Nytt" },
  { id: 2, name: "Paddock – Oversized Tee",    type: "tee",    price: 599, was: null, tile: "#7a0f14", shirt: "#c4161c", ink: "#f4f4f2", word: "PADDOCK" },
  { id: 3, name: "Slipstream – Oversized Tee", type: "tee",    price: 599, was: 749, tile: "#1d4f91", shirt: "#0e0e10", ink: "#e8a317", word: "SLIP",   tag: "Nytt" },
  { id: 4, name: "Parc Fermé – Hoodie",        type: "hoodie", price: 1149, was: null, tile: "#2a2a2e", shirt: "#e9e9e7", ink: "#0e0e10", word: "PARC" },
  { id: 5, name: "Chicane – Hoodie",           type: "hoodie", price: 1149, was: null, tile: "#0f0f10", shirt: "#c4161c", ink: "#f4f4f2", word: "CHICANE" },
  { id: 6, name: "Pit Lane – Oversized Tee",   type: "tee",    price: 599, was: null, tile: "#4a4f57", shirt: "#0e0e10", ink: "#f4f4f2", word: "PIT" },
];

const fmt = (n) => new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(n);

// Platshållargrafik: tröja/hoodie sedd bakifrån med tryck. Byts mot riktiga produktbilder.
function garment(p) {
  const hood = p.type === "hoodie";
  const body = hood
    ? `<path d="M70 70 Q100 20 130 70 L170 82 L190 230 L158 238 L152 150 L152 330 L48 330 L48 150 L42 238 L10 230 L30 82 Z" fill="${p.shirt}"/>
       <path d="M70 70 Q100 100 130 70 Q100 30 70 70Z" fill="rgba(0,0,0,.25)"/>`
    : `<path d="M62 40 Q100 62 138 40 L188 62 L172 120 L150 110 L150 320 L50 320 L50 110 L28 120 L12 62 Z" fill="${p.shirt}"/>`;
  return `<svg viewBox="0 0 200 340" role="img" aria-label="${p.name}" xmlns="http://www.w3.org/2000/svg">
    ${body}
    <text x="100" y="${hood ? 190 : 170}" text-anchor="middle" font-family="Barlow Condensed, Impact, sans-serif" font-weight="800" font-style="italic" font-size="${p.word.length > 5 ? 30 : 44}" fill="${p.ink}">${p.word}</text>
    <text x="100" y="${hood ? 208 : 188}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="6" letter-spacing="2" fill="${p.ink}" opacity=".7">SCUDARO · KOLLEKTION 01</text>
  </svg>`;
}

const grid = document.getElementById("grid");

function render(filter = "alla") {
  grid.innerHTML = PRODUCTS
    .filter((p) => filter === "alla" || p.type === filter)
    .map((p) => `
      <article class="card">
        <div class="card__media" style="--tile:${p.tile}">
          ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
          ${garment(p)}
          <button class="card__add" data-id="${p.id}">Lägg i varukorg</button>
        </div>
        <div class="card__info">
          <h3 class="card__name">${p.name}</h3>
          <p class="card__price">${fmt(p.price)}${p.was ? `<s>${fmt(p.was)}</s>` : ""}</p>
        </div>
      </article>`)
    .join("");
}

// Filter
document.querySelector(".filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
  render(chip.dataset.filter);
});

// Varukorg (endast räknare i utkastet)
let cart = 0;
grid.addEventListener("click", (e) => {
  if (!e.target.closest(".card__add")) return;
  cart += 1;
  document.getElementById("cart-count").textContent = cart;
});

// Nyhetsbrev (ingen backend ännu)
document.getElementById("newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("newsletter-msg").textContent = "Tack! Du är med på listan (demo – inget sparas ännu).";
  e.target.reset();
});

render();
