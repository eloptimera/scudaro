import Link from "next/link";
import CarZoom from "@/components/CarZoom";
import RaceStrip from "@/components/RaceStrip";
import Stage from "@/components/Stage";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { formatMoney } from "@/lib/format";
import { getF1 } from "@/lib/f1";
import { getCollections } from "@/lib/shopify";

// Rendered per request (Shopify data itself is cached 5 min) so a Shopify hiccup can never fail a deploy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [collections, f1] = await Promise.all([getCollections(), getF1()]);

  return (
    <>
      <h1 className="sr-only">SCUDARO – streetwear with racing in its blood</h1>

      <Stage collections={collections} />

      <div className="announce">
        Free shipping over {formatMoney(FREE_SHIPPING_THRESHOLD)} &nbsp;•&nbsp; Collection 01 is out now
      </div>
      <CarZoom />
      <RaceStrip next={f1.next} last={f1.last} />
      <section className="cta" aria-labelledby="cta-title">
        <p className="cta__eyebrow">The full grid</p>
        <h2 id="cta-title">Wear the grid</h2>
        <p>Every tee, hoodie and cap from the current collections. Limited runs, no reprints.</p>
        <Link href="/products" className="btn btn--light">Shop all products</Link>
      </section>

      <section className="about" id="about">
        <h2>Racing is a feeling, not a sport.</h2>
        <p>
          SCUDARO is made for people who love speed, garage culture and Saturdays at the track. Heavyweight cotton,
          oversized fits and prints on the back – because that&apos;s where they see you when you leave everyone else behind.
        </p>
      </section>

      <section className="usp" aria-label="Our promises">
        <div><strong>Limited runs</strong><span>Sold out is sold out. No reprints.</span></div>
        <div><strong>Oversized fit</strong><span>Heavyweight cotton, boxy cut.</span></div>
        <div><strong>30-day returns</strong><span>Doesn&apos;t fit? Send it back.</span></div>
      </section>
    </>
  );
}
