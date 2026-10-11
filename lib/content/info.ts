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
  nav: { about: string; size: string; care: string; track: string };
  faq: { title: string; description: string; items: Faq[] };
  about: { title: string; description: string; eyebrow: string; paragraphs: string[]; delivery: string; imageAlt: string; disclaimer: string; ctas: Cta[] };
  size: { title: string; description: string; intro: string; tables: SizeTable[]; note: string; cta: Cta };
  care: { title: string; description: string; intro: string; tables: CareTable[]; cta: Cta };
  track: TrackText;
};

export type TrackText = {
  title: string; description: string; intro: string;
  eyebrow: string; steps: [string, string, string, string]; orderLabel: string; orderHint: string; emailLabel: string; button: string; loading: string;
  notFound: string; invalid: string; unavailable: string; rate: string;
  orderTitle: string; statusLabel: string; trackLabel: string; carrierLabel: string; numberLabel: string;
  status: { processing: string; shipped: string; delivered: string; cancelled: string };
  statusText: { processing: string; shipped: string; delivered: string; cancelled: string };
  help: string;
};

export const CONTACT_EMAIL = "hello@scudaro.com";

const en: Info = {
  nav: { about: "About", size: "Size guide", care: "Care instructions", track: "Track order" },
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
        q: "Where is my order?",
        a: "Enter your order number and email on the tracking page to see its status and a tracking link once it has shipped.",
        cta: { href: "/track-order", label: "Track your order" },
      },
      {
        q: "Are the pieces limited?",
        a: "Yes. Every Scudaro collection is released in limited runs and we do not reprint. When a design is gone, it is gone.",
      },
      {
        q: "What is your return policy?",
        a: `You can return an unused item within 14 days of receiving it. Email ${CONTACT_EMAIL} first to let us know. Return shipping is paid by you; if we sent the wrong item or it arrived damaged, we cover it. The full terms are in the return policy linked in the footer.`,
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
    eyebrow: "Our story",
    imageAlt: "A person walking down an evening street in a white Scudaro hoodie with the back print “We win and we lose together – 44”",
    delivery: "Delivered to your door, usually in less than 7 days.",
    paragraphs: [
      "Scudaro is a streetwear brand founded by Alexander and Nikolaj, two friends united by a passion for Formula 1 and fashion.",
      "We were tired of the classic, heavily branded Formula 1 apparel: big logos that tell the world who you support, and little about who you are. So we took matters into our own hands.",
      "Scudaro is our answer: Formula 1-inspired streetwear designed for fans who care how they look, without the official branding.",
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
  track: {
    title: "Track your order",
    description: "Enter your order number and email to see where your Scudaro order is.",
    intro: "Enter the order number from your confirmation email and the email address you ordered with.",
    orderLabel: "Order number",
    eyebrow: "Delivery",
    steps: ["Order received", "Being prepared", "On its way", "Delivered"],
    orderHint: "You'll find it in your confirmation email, e.g. #1001",
    emailLabel: "Email address",
    button: "Track order",
    loading: "Looking up your order…",
    notFound: "We couldn't find an order that matches those details. Check the order number and the email address you used at checkout.",
    invalid: "Enter a valid order number and email address.",
    unavailable: "Order tracking is temporarily unavailable. Please try again later or email us.",
    rate: "Too many attempts. Please wait a minute and try again.",
    orderTitle: "Order",
    statusLabel: "Status",
    trackLabel: "Track shipment",
    carrierLabel: "Carrier",
    numberLabel: "Tracking number",
    status: { processing: "Being prepared", shipped: "On its way", delivered: "Delivered", cancelled: "Cancelled" },
    statusText: {
      processing: "Your order has been received and your pieces are being prepared. You will get an email with tracking once it ships.",
      shipped: "Your order has shipped. Use the tracking link below to follow it.",
      delivered: "Your order has been delivered.",
      cancelled: "This order has been cancelled.",
    },
    help: `Need help? Email ${CONTACT_EMAIL}.`,
  },
};

const sv: Info = {
  nav: { about: "Om oss", size: "Storleksguide", care: "Tvättråd", track: "Spåra order" },
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
        q: "Var är min order?",
        a: "Ange ordernummer och e-postadress på spårningssidan för att se status och en spårningslänk när ordern har skickats.",
        cta: { href: "/track-order", label: "Spåra din order" },
      },
      {
        q: "Är plaggen limiterade?",
        a: "Ja. Varje Scudaro-kollektion släpps i begränsade upplagor och vi trycker inte om. När en design är slut är den slut.",
      },
      {
        q: "Hur fungerar returer?",
        a: `Du kan returnera en oanvänd vara inom 14 dagar efter att du fått den. Mejla först ${CONTACT_EMAIL} och meddela oss. Du betalar returfrakten, men om vi skickat fel vara eller den kommit skadad står vi för kostnaden. De fullständiga villkoren finns i returpolicyn som du når via sidfoten.`,
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
    eyebrow: "Vår historia",
    imageAlt: "En person som går längs en kvällsgata i en vit Scudaro-hoodie med ryggtrycket ”We win and we lose together – 44”",
    delivery: "Levereras hem till dörren, oftast på under 7 dagar.",
    paragraphs: [
      "Scudaro är ett streetwearmärke grundat av Alexander och Nikolaj, två vänner som delar en passion för Formel 1 och mode.",
      "Vi var trötta på de klassiska, hårt brandade Formel 1-tröjorna: stora loggor som visar vem du hejar på, men säger lite om vem du är. Så vi tog saken i egna händer.",
      "Scudaro är vårt svar: Formel 1-inspirerad streetwear för fans som bryr sig om hur de ser ut, utan den officiella brandingen.",
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
  track: {
    title: "Spåra din order",
    description: "Ange ordernummer och e-postadress för att se var din Scudaro-order är.",
    intro: "Ange ordernumret från din orderbekräftelse och e-postadressen du beställde med.",
    orderLabel: "Ordernummer",
    eyebrow: "Leverans",
    steps: ["Order mottagen", "Förbereds", "På väg", "Levererad"],
    orderHint: "Du hittar det i orderbekräftelsen, t.ex. #1001",
    emailLabel: "E-postadress",
    button: "Spåra order",
    loading: "Söker efter din order…",
    notFound: "Vi hittade ingen order som matchar uppgifterna. Kontrollera ordernumret och e-postadressen du använde i kassan.",
    invalid: "Ange ett giltigt ordernummer och en giltig e-postadress.",
    unavailable: "Orderspårningen är tillfälligt otillgänglig. Försök igen senare eller mejla oss.",
    rate: "För många försök. Vänta en minut och försök igen.",
    orderTitle: "Order",
    statusLabel: "Status",
    trackLabel: "Spåra paketet",
    carrierLabel: "Transportör",
    numberLabel: "Spårningsnummer",
    status: { processing: "Förbereds", shipped: "På väg", delivered: "Levererad", cancelled: "Avbruten" },
    statusText: {
      processing: "Din order är mottagen och dina plagg förbereds. Du får ett mejl med spårning när den skickas.",
      shipped: "Din order har skickats. Följ den med spårningslänken nedan.",
      delivered: "Din order har levererats.",
      cancelled: "Den här ordern har avbrutits.",
    },
    help: `Behöver du hjälp? Mejla ${CONTACT_EMAIL}.`,
  },
};

/** Swedish for sv, English for everything else. */
export function info(locale: Locale): Info {
  return locale === "sv" ? sv : en;
}

/** Locales that have their own written text for these pages. */
export const INFO_LOCALES: Locale[] = ["en", "sv"];
