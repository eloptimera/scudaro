// Product data – replace with a real catalogue (e.g. Shopify/Stripe) when the time comes.
const PRODUCTS = [
  { id: 1, name: "Apex – Oversized Tee",       type: "tee",    price: 599,  was: 749,  tile: "#1d4f91", shirt: "#0e0e10", ink: "#f4f4f2", word: "APEX",    tag: "New",
    desc: "Heavyweight cotton, boxy fit and a back print you can spot from the first corner." },
  { id: 2, name: "Paddock – Oversized Tee",    type: "tee",    price: 599,  was: null, tile: "#c4161c", shirt: "#c4161c", ink: "#f4f4f2", word: "PADDOCK",
    desc: "Racing red in a proper heavyweight weave. Oversized, soft but substantial." },
  { id: 3, name: "Slipstream – Oversized Tee", type: "tee",    price: 599,  was: 749,  tile: "#e8a317", shirt: "#0e0e10", ink: "#e8a317", word: "SLIP",    tag: "New",
    desc: "Black tee with a gold back print. Limited run, no reprints." },
  { id: 4, name: "Parc Fermé – Hoodie",        type: "hoodie", price: 1149, was: null, tile: "#4a4f57", shirt: "#d9d9d4", ink: "#0e0e10", word: "PARC",
    desc: "After the finish line. Heavyweight off-white hoodie with a large back print." },
  { id: 5, name: "Chicane – Hoodie",           type: "hoodie", price: 1149, was: null, tile: "#c4161c", shirt: "#c4161c", ink: "#f4f4f2", word: "CHICANE",
    desc: "Red hoodie for cold mornings in the pits. Boxy, sturdy and built to last." },
  { id: 6, name: "Pit Lane – Oversized Tee",   type: "tee",    price: 599,  was: null, tile: "#4a4f57", shirt: "#0e0e10", ink: "#f4f4f2", word: "PIT",
    desc: "The essential. Black, heavy and as good in the garage as in the city." },
];

const fmt = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(n);

// Placeholder graphic: tee/hoodie seen from behind with a print. Replace with real product images.
function garment(p, uid) {
  const hood = p.type === "hoodie";
  const shape = hood
    ? "M70 70 Q100 20 130 70 L170 82 L190 230 L158 238 L152 150 L152 330 L48 330 L48 150 L42 238 L10 230 L30 82 Z"
    : "M62 40 Q100 62 138 40 L188 62 L172 120 L150 110 L150 320 L50 320 L50 110 L28 120 L12 62 Z";
  const hoodInner = hood ? `<path d="M70 70 Q100 100 130 70 Q100 30 70 70Z" fill="rgba(0,0,0,.25)"/>` : "";
  return `<svg viewBox="0 0 200 340" role="img" aria-label="${p.name}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sh-${uid}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity=".38"/>
        <stop offset=".35" stop-color="#fff" stop-opacity=".12"/>
        <stop offset=".62" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity=".42"/>
      </linearGradient>
    </defs>
    <path d="${shape}" fill="${p.shirt}"/>
    ${hoodInner}
    <path d="${shape}" fill="url(#sh-${uid})"/>
    <text x="100" y="${hood ? 190 : 170}" text-anchor="middle" font-family="Barlow Condensed, Impact, sans-serif" font-weight="800" font-style="italic" font-size="${p.word.length > 5 ? 30 : 44}" fill="${p.ink}">${p.word}</text>
    <text x="100" y="${hood ? 208 : 188}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="6" letter-spacing="2" fill="${p.ink}" opacity=".7">SCUDARO · COLLECTION 01</text>
  </svg>`;
}

/* ---------- Product grid ---------- */
const grid = document.getElementById("grid");

function render(filter = "all") {
  grid.innerHTML = PRODUCTS
    .filter((p) => filter === "all" || p.type === filter)
    .map((p) => `
      <article class="card">
        <div class="card__media" style="--tile:${p.tile}">
          ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
          ${garment(p, "g" + p.id)}
          <button class="card__add" data-id="${p.id}">Add to cart</button>
        </div>
        <div class="card__info">
          <h3 class="card__name">${p.name}</h3>
          <p class="card__price">${fmt(p.price)}${p.was ? `<s>${fmt(p.was)}</s>` : ""}</p>
        </div>
      </article>`)
    .join("");
}

document.querySelector(".filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
  render(chip.dataset.filter);
});

let cart = 0;
grid.addEventListener("click", (e) => {
  if (!e.target.closest(".card__add")) return;
  cart += 1;
  document.getElementById("cart-count").textContent = cart;
});

document.getElementById("newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("newsletter-msg").textContent = "Thanks! You're on the list (demo – nothing is saved yet).";
  e.target.reset();
});

render();

/* ---------- Scroll-driven 3D carousel ----------
   The page scrolls normally. The stage sticks while you scroll past it, and the scroll progress
   (0 → n-1) decides which item sits in the middle. No scroll hijacking: after the last item
   the page simply continues down. */
(() => {
  const wrap = document.getElementById("stage-wrap");
  const stage = document.getElementById("stage");
  const track = document.getElementById("track");
  const ghost = document.getElementById("ghost");
  const textBox = document.getElementById("stage-text");
  const header = document.querySelector(".site-header");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const n = PRODUCTS.length;
  wrap.style.setProperty("--n", n);

  const items = PRODUCTS.map((p, i) => {
    const b = document.createElement("button");
    b.className = "stage__item";
    b.style.setProperty("--tile", p.tile);
    b.setAttribute("aria-label", `View ${p.name}`);
    b.innerHTML = garment(p, "s" + p.id);
    b.addEventListener("click", () => goTo(i));
    track.appendChild(b);
    return b;
  });

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let pos = 0;          // current (smoothed) position
  let target = 0;       // position according to scroll
  let shown = -1;       // index the text is showing
  let raf = null;
  let snapTimer = null;

  function metrics() {
    const top = header.offsetHeight;
    document.documentElement.style.setProperty("--header-h", top + "px");
    const total = wrap.offsetHeight - stage.offsetHeight;
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
    return { top, total, wrapTop };
  }

  function readScroll() {
    const { top, total, wrapTop } = metrics();
    const scrolled = clamp(window.scrollY - (wrapTop - top), 0, total);
    target = total > 0 ? (scrolled / total) * (n - 1) : 0;
    return { scrolled, total };
  }

  function layout() {
    const w = stage.clientWidth;
    const spacing = w < 700 ? w * 0.5 : Math.min(w * 0.27, 360);
    items.forEach((el, i) => {
      const d = i - pos, ad = Math.abs(d), s = Math.sign(d);
      const x = s * (Math.min(ad, 1) * spacing + Math.max(ad - 1, 0) * spacing * 0.7);
      const z = -Math.min(ad, 2) * 260;
      const rot = -clamp(d, -1.5, 1.5) * 32;
      const scale = 1 - Math.min(ad, 1) * 0.08;
      const opacity = clamp(1 - Math.max(ad - 0.3, 0) * 0.55, 0, 1);
      const blur = Math.min(ad, 1) * 2.5;
      el.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg) scale(${scale})`;
      el.style.opacity = opacity;
      el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "none";
      el.style.zIndex = Math.round(100 - ad * 10);
      el.style.pointerEvents = opacity < 0.05 ? "none" : "auto";
      if (Math.round(pos) === i) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    const idx = clamp(Math.round(pos), 0, n - 1);
    if (idx !== shown) updateText(idx);
  }

  function updateText(idx) {
    shown = idx;
    const p = PRODUCTS[idx];
    document.getElementById("st-eyebrow").textContent = `Collection 01 — ${idx + 1} / ${n}`;
    document.getElementById("st-title").textContent = p.name;
    document.getElementById("st-desc").textContent = p.desc;
    document.getElementById("st-price").textContent = fmt(p.price);
    ghost.textContent = p.word;
    textBox.classList.remove("swap");
    void textBox.offsetWidth; // restart the animation
    textBox.classList.add("swap");
  }

  function tick() {
    const diff = target - pos;
    pos = reduceMotion || Math.abs(diff) < 0.001 ? target : pos + diff * 0.14;
    layout();
    raf = pos === target ? null : requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  function goTo(i) {
    const { top, total, wrapTop } = metrics();
    const y = wrapTop - top + (clamp(i, 0, n - 1) / (n - 1)) * total;
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  }

  // Gentle snap to the nearest item once scrolling stops inside the stage.
  function scheduleSnap() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      const { scrolled, total } = readScroll();
      if (scrolled <= 0 || scrolled >= total) return;
      if (Math.abs(target - Math.round(target)) > 0.02) goTo(Math.round(target));
    }, 160);
  }

  window.addEventListener("scroll", () => {
    readScroll();
    kick();
    scheduleSnap();
    document.getElementById("hint").classList.toggle("is-gone", window.scrollY > 40);
  }, { passive: true });
  window.addEventListener("resize", () => { readScroll(); layout(); });

  document.getElementById("prev").addEventListener("click", () => goTo(Math.round(target) - 1));
  document.getElementById("next").addEventListener("click", () => goTo(Math.round(target) + 1));

  readScroll();
  pos = target;
  layout();
})();
