import type { Locale } from "@/lib/i18n/config";

/**
 * Editorial pages (FAQ, About, Size guide, Care). Written by hand in English and Swedish only:
 * every other language shows the English text, so the site is not filled with thin machine translations.
 * Facts here come from the owners (delivery, returns) and the print partner's product sheets (materials, sizes, care).
 */

export type Cta = { href: string; label: string };
export type Faq = { q: string; a: string; cta?: Cta };
export type SizeTable = { title: string; head: string[]; rows: { label: string; cells: string[] }[] };
export type CareTable = { title: string; rows: [string, string][] };

export type Info = {
  nav: { faq: string; about: string; size: string; care: string };
  faq: { title: string; description: string; items: Faq[] };
  about: { title: string; description: string; paragraphs: string[]; disclaimer: string; ctas: Cta[] };
  size: { title: string; description: string; intro: string; tables: SizeTable[]; note: string; cta: Cta };
  care: { title: string; description: string; intro: string; tables: CareTable[]; cta: Cta };
};

export const CONTACT_EMAIL = "hello@scudaro.com";

const en: Info = {
  nav: { faq: "FAQ", about: "About", size: "Size guide", care: "Care instructions" },
  faq: {
    title: "FAQ",
    description: "Answers about delivery, returns, sizing, materials and care for Scudaro streetwear.",
    items: [
      {
        q: "How long does delivery take?",
        a: "Delivery usually takes less than 7 days, wherever in the world you are. Timing can vary because of external factors such as carrier delays, customs or public holidays.",
        cta: { href: "/products", label: "Shop the collection" },
      },
      {
        q: "Are the pieces made to order?",
        a: "Yes. Every Scudaro piece is produced on demand after you place your order, so nothing sits unsold in a warehouse and there are no minimums.",
      },
      {
        q: "What is your return policy?",
        a: `You can return your order within 30 days. Contact us at ${CONTACT_EMAIL} and we will help you with the next steps. The full terms are in the return policy linked in the footer.`,
      },
      {
        q: "How do the sizes fit?",
        a: "Our tees and hoodies have a unisex fit. Compare your measurements with the garment measurements in our size guide before you order.",
        cta: { href: "/size-guide", label: "Open the size guide" },
      },
      {
        q: "What are the garments made of?",
        a: "The T-shirt is a heavyweight unisex tee with taped shoulders, no side seams and a ribbed collar. Solid colors are 100% cotton; Ash Grey is 99% cotton and 1% polyester; Sport Grey and Antique colors are 90% cotton and 10% polyester; Heather colors are 50% cotton and 50% polyester. The hoodie is made from a blend of ringspun cotton and polyester, with the ratio varying by color, and has a soft feel for all-day wear.",
        cta: { href: "/products", label: "See the products" },
      },
      {
        q: "How do I wash my Scudaro pieces?",
        a: "Machine wash cold (max 30 °C), tumble dry on low and do not dry clean. Never iron directly on the print. See the full care instructions for the T-shirt and the hoodie.",
        cta: { href: "/care", label: "Read the care instructions" },
      },
      {
        q: "Is Scudaro affiliated with Formula 1?",
        a: "No. Scudaro is an independent streetwear brand inspired by Formula 1 fans and culture. We are not affiliated with, or endorsed by, Formula 1 or any team or driver.",
        cta: { href: "/about", label: "About Scudaro" },
      },
      {
        q: "How do I contact you?",
        a: `Email us at ${CONTACT_EMAIL}. We read every message.`,
      },
    ],
  },
  about: {
    title: "About Scudaro",
    description: "Scudaro is Formula 1-inspired streetwear, founded by Alexander and Nikolaj.",
    paragraphs: [
      "Scudaro is a streetwear brand founded by Alexander and Nikolaj, two friends united by a passion for Formula 1 and fashion.",
      "We were tired of the classic, heavily branded Formula 1 apparel: big logos that tell the world who you support, and little about who you are. So we took matters into our own hands.",
      "Scudaro is our answer: Formula 1-inspired streetwear designed for fans who care how they look, without the official branding.",
      "Every piece is made on demand and delivered to your door, usually in less than 7 days.",
    ],
    disclaimer: "Scudaro is an independent brand and is not affiliated with, or endorsed by, Formula 1 or any team or driver.",
    ctas: [
      { href: "/products", label: "Shop the collection" },
      { href: "/faq", label: "Read the FAQ" },
    ],
  },
  size: {
    title: "Size guide",
    description: "Garment measurements in centimetres for the Scudaro T-shirt and hoodie.",
    intro: "All measurements are garment measurements in centimetres. Lay a piece you already own flat and compare. If you are between two sizes, choose the larger one for a relaxed fit.",
    tables: [
      {
        title: "T-shirt",
        head: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
        rows: [
          { label: "Length", cells: ["71.1", "73.7", "76.2", "78.7", "81.3", "83.8", "86.4", "88.9"] },
          { label: "Width", cells: ["91.4", "101.6", "111.8", "122", "132.2", "142.2", "152.4", "162.6"] },
          { label: "Half chest", cells: ["45.7", "50.8", "55.9", "61", "66.1", "71.1", "76.2", "81.3"] },
          { label: "Sleeve length", cells: ["39.7", "43.2", "47", "50.8", "54.6", "58.1", "61.6", "64.5"] },
        ],
      },
      {
        title: "Hoodie",
        head: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        rows: [
          { label: "Length", cells: ["64", "67", "70", "73", "76", "79", "82"] },
          { label: "Width", cells: ["98", "102", "112", "122", "130", "138", "146"] },
          { label: "Half chest", cells: ["49", "51", "56", "61", "65", "69", "73"] },
          { label: "Sleeve length", cells: ["57.5", "59", "60.5", "62", "63.5", "65", "66.5"] },
        ],
      },
    ],
    note: "Measurements may vary slightly between production batches.",
    cta: { href: "/products", label: "Shop the collection" },
  },
  care: {
    title: "Care instructions",
    description: "How to wash, dry and iron the Scudaro T-shirt and hoodie so they last.",
    intro: "Follow these instructions to keep the fabric and the print looking good.",
    tables: [
      {
        title: "T-shirt",
        rows: [
          ["Wash", "Machine wash cold (max 30 °C / 90 °F)"],
          ["Bleach", "Only non-chlorine"],
          ["Tumble dry", "Low"],
          ["Dry clean", "Do not dry clean"],
          ["Iron the print", "Do not iron the print"],
          ["Iron", "Iron or steam with medium heat"],
        ],
      },
      {
        title: "Hoodie",
        rows: [
          ["Wash", "Machine washable, easy to maintain without special requirements"],
          ["Store", "Store in a cool, dry place away from direct sunlight to maintain the fabric and colors"],
          ["Dry", "Tumble dry low is recommended to preserve the integrity and softness of the fabric"],
        ],
      },
    ],
    cta: { href: "/size-guide", label: "Open the size guide" },
  },
};

const sv: Info = {
  nav: { faq: "Vanliga frågor", about: "Om oss", size: "Storleksguide", care: "Tvättråd" },
  faq: {
    title: "Vanliga frågor",
    description: "Svar om leverans, retur, storlekar, material och skötsel för Scudaros streetwear.",
    items: [
      {
        q: "Hur lång är leveranstiden?",
        a: "Leveransen tar oftast under 7 dagar, oavsett var i världen du bor. Tiden kan variera på grund av externa faktorer som förseningar hos transportören, tull eller helgdagar.",
        cta: { href: "/products", label: "Se kollektionen" },
      },
      {
        q: "Tillverkas plaggen på beställning?",
        a: "Ja. Varje Scudaro-plagg tillverkas på beställning efter att du lagt din order. Därför står inget osålt på ett lager, och det finns inga minimikrav.",
      },
      {
        q: "Hur fungerar returer?",
        a: `Du kan returnera din order inom 30 dagar. Kontakta oss på ${CONTACT_EMAIL} så hjälper vi dig med nästa steg. De fullständiga villkoren finns i returpolicyn som du når via sidfoten.`,
      },
      {
        q: "Hur är passformen?",
        a: "Våra t-shirts och hoodies har unisex-passform. Jämför dina mått med plaggens mått i storleksguiden innan du beställer.",
        cta: { href: "/size-guide", label: "Öppna storleksguiden" },
      },
      {
        q: "Vad är plaggen gjorda av?",
        a: "T-shirten är en tung unisex-tröja med tejpade axlar, utan sidosömmar och med ribbad krage. Enfärgade modeller är 100 % bomull. Ash Grey är 99 % bomull och 1 % polyester. Sport Grey och Antique-färgerna är 90 % bomull och 10 % polyester. Heather-färgerna är 50 % bomull och 50 % polyester. Hoodien är gjord av en blandning av ringspunnen bomull och polyester, där blandningen varierar med färgen, och är len och skön att ha på sig hela dagen.",
        cta: { href: "/products", label: "Se produkterna" },
      },
      {
        q: "Hur tvättar jag mina plagg från Scudaro?",
        a: "Maskintvätta kallt (max 30 °C), torktumla på låg värme och kemtvätta inte. Stryk aldrig direkt på trycket. Se de fullständiga tvättråden för t-shirten och hoodien.",
        cta: { href: "/care", label: "Läs tvättråden" },
      },
      {
        q: "Är Scudaro kopplat till Formel 1?",
        a: "Nej. Scudaro är ett oberoende streetwearmärke, inspirerat av Formel 1-fans och kultur. Vi är inte anslutna till, eller godkända av, Formula 1 eller något stall eller någon förare.",
        cta: { href: "/about", label: "Om Scudaro" },
      },
      {
        q: "Hur kontaktar jag er?",
        a: `Mejla oss på ${CONTACT_EMAIL}. Vi läser alla meddelanden.`,
      },
    ],
  },
  about: {
    title: "Om Scudaro",
    description: "Scudaro är streetwear inspirerad av Formel 1, grundat av Alexander och Nikolaj.",
    paragraphs: [
      "Scudaro är ett streetwearmärke grundat av Alexander och Nikolaj, två vänner som delar en passion för Formel 1 och mode.",
      "Vi var trötta på de klassiska, hårt brandade Formel 1-tröjorna: stora loggor som visar vem du hejar på, men säger lite om vem du är. Så vi tog saken i egna händer.",
      "Scudaro är vårt svar: Formel 1-inspirerad streetwear för fans som bryr sig om hur de ser ut, utan den officiella brandingen.",
      "Varje plagg tillverkas på beställning och levereras hem till dig, oftast på under 7 dagar.",
    ],
    disclaimer: "Scudaro är ett oberoende märke och är inte anslutet till, eller godkänt av, Formula 1 eller något stall eller någon förare.",
    ctas: [
      { href: "/products", label: "Se kollektionen" },
      { href: "/faq", label: "Läs de vanliga frågorna" },
    ],
  },
  size: {
    title: "Storleksguide",
    description: "Plaggens mått i centimeter för Scudaros t-shirt och hoodie.",
    intro: "Alla mått är plaggens mått i centimeter. Lägg ett plagg du redan äger platt och jämför. Om du är mellan två storlekar, välj den större för en avslappnad passform.",
    tables: [
      {
        title: "T-shirt",
        head: en.size.tables[0].head,
        rows: [
          { label: "Längd", cells: en.size.tables[0].rows[0].cells },
          { label: "Bredd", cells: en.size.tables[0].rows[1].cells },
          { label: "Halv bröstvidd", cells: en.size.tables[0].rows[2].cells },
          { label: "Ärmlängd", cells: en.size.tables[0].rows[3].cells },
        ],
      },
      {
        title: "Hoodie",
        head: en.size.tables[1].head,
        rows: [
          { label: "Längd", cells: en.size.tables[1].rows[0].cells },
          { label: "Bredd", cells: en.size.tables[1].rows[1].cells },
          { label: "Halv bröstvidd", cells: en.size.tables[1].rows[2].cells },
          { label: "Ärmlängd", cells: en.size.tables[1].rows[3].cells },
        ],
      },
    ],
    note: "Måtten kan variera något mellan produktionsomgångar.",
    cta: { href: "/products", label: "Se kollektionen" },
  },
  care: {
    title: "Tvättråd",
    description: "Så tvättar, torkar och stryker du Scudaros t-shirt och hoodie så att de håller länge.",
    intro: "Följ råden nedan så håller både tyget och trycket sig fint.",
    tables: [
      {
        title: "T-shirt",
        rows: [
          ["Tvätt", "Maskintvätta kallt (max 30 °C)"],
          ["Blekmedel", "Endast klorfritt"],
          ["Torktumling", "Låg värme"],
          ["Kemtvätt", "Kemtvätta inte"],
          ["Tryck", "Stryk inte på trycket"],
          ["Strykning", "Stryk eller ånga på medelvarm temperatur"],
        ],
      },
      {
        title: "Hoodie",
        rows: [
          ["Tvätt", "Maskintvättbar, enkel att sköta utan särskilda krav"],
          ["Förvaring", "Förvara svalt och torrt, skyddat från direkt solljus, så bevaras tyg och färger"],
          ["Torkning", "Torktumla på låg värme för att bevara tygets form och mjukhet"],
        ],
      },
    ],
    cta: { href: "/size-guide", label: "Öppna storleksguiden" },
  },
};

/** Swedish for sv, English for everything else. */
export function info(locale: Locale): Info {
  return locale === "sv" ? sv : en;
}

/** Locales that have their own written text for these pages. */
export const INFO_LOCALES: Locale[] = ["en", "sv"];
