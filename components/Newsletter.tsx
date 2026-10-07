"use client";

import { useState, type FormEvent } from "react";

/** Demo only: nothing is stored yet. Hook up to Shopify Email / Klaviyo / Mailchimp before launch. */
export default function Newsletter() {
  const [msg, setMsg] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("Thanks! You're on the list (demo – nothing is saved yet).");
    e.currentTarget.reset();
  };

  return (
    <form className="newsletter" onSubmit={onSubmit}>
      <label htmlFor="email">Get notified about the next drop</label>
      <div className="newsletter__row">
        <input id="email" name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
        <button className="btn btn--light" type="submit">Subscribe</button>
      </div>
      <p className="newsletter__msg" role="status">{msg}</p>
    </form>
  );
}
