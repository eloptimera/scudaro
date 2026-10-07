import Link from "next/link";

export default function NotFound() {
  return (
    <section className="about">
      <h2>Off the track.</h2>
      <p>We couldn&apos;t find that page.</p>
      <p><Link className="btn btn--light" href="/">Back to the start</Link></p>
    </section>
  );
}
