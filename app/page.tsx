import Shop from "@/components/Shop";
import Stage from "@/components/Stage";
import { getProducts } from "@/lib/shopify";

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <h1 className="sr-only">SCUDARO – streetwear with racing in its blood</h1>

      <Stage products={products} />
      <Shop products={products} />

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
