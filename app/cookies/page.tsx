import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cookies" };

/**
 * Keep this page in step with what the site really does. If analytics or advertising pixels are
 * added later, this page needs updating and a consent banner is required.
 */
export default function CookiesPage() {
  return (
    <article className="policy">
      <Link href="/" className="pdp__crumbs">&larr; Back to the shop</Link>
      <h1>Cookies</h1>
      <div className="prose">
        <p>
          This website only uses cookies that are strictly necessary for the shop to work. We do not use
          analytics, advertising or tracking cookies.
        </p>

        <h2>Cookies we set</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Purpose</th><th>Lifetime</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>scudaro_cart</code></td>
              <td>Remembers the contents of your shopping cart. Only set once you add something to the cart.</td>
              <td>30 days</td>
            </tr>
          </tbody>
        </table>

        <h2>Checkout</h2>
        <p>
          When you go to checkout you move to our checkout page, which is run by Shopify. Shopify sets its own
          cookies there that are needed to process your order, keep your session and prevent fraud. See the
          privacy policy for how your personal data is handled.
        </p>

        <h2>Control over cookies</h2>
        <p>
          You can delete or block cookies in your browser settings. If you block the cart cookie, the shopping
          cart will not work.
        </p>
      </div>
    </article>
  );
}
