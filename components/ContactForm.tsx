"use client";

import { useState, type FormEvent } from "react";
import type { ContactText } from "@/lib/content/info";
import { useI18n } from "./I18nProvider";
import LocalLink from "./LocalLink";

type View = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; message: string };

export default function ContactForm({ text }: { text: ContactText }) {
  const { t, locale } = useI18n();
  const [view, setView] = useState<View>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setView({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          newsletter: data.get("newsletter") === "on",
          website: data.get("website"),
          locale,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; newsletter?: string };
      if (res.ok && json.ok) {
        form.reset();
        const message = json.newsletter === "sent" ? text.successNews : json.newsletter === "failed" ? text.newsFailed : text.success;
        return setView({ kind: "done", message });
      }
      setView({ kind: "error", message: json.code === "invalid" ? text.invalid : json.code === "rate" ? text.rate : text.error });
    } catch {
      setView({ kind: "error", message: text.error });
    }
  }

  const busy = view.kind === "sending";

  return (
    <form className="contact__form" onSubmit={onSubmit}>
      <div className="contact__row">
        <div className="track__field">
          <label htmlFor="contact-name">{text.nameLabel}</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" maxLength={100} required />
        </div>
        <div className="track__field">
          <label htmlFor="contact-email">{text.emailLabel}</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required />
        </div>
      </div>
      <div className="track__field">
        <label htmlFor="contact-subject">{text.subjectLabel}</label>
        <input id="contact-subject" name="subject" type="text" maxLength={150} required />
      </div>
      <div className="track__field">
        <label htmlFor="contact-message">{text.messageLabel}</label>
        <textarea id="contact-message" name="message" rows={7} maxLength={4000} required />
      </div>

      {/* Honeypot for bots: hidden from people and assistive tech. */}
      <input className="newsletter__hp" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <label className="contact__consent">
        <input type="checkbox" name="newsletter" />
        <span>{t("news.consent")}</span>
      </label>

      <p className="contact__notice">
        {text.notice} <LocalLink href="/policies/privacy-policy">{t("news.privacy")}</LocalLink>
      </p>

      <button type="submit" className="btn btn--light" disabled={busy}>
        {busy ? text.sending : text.button}
      </button>

      <div className="contact__out" aria-live="polite">
        {view.kind === "error" && <p className="track__error" role="alert">{view.message}</p>}
        {view.kind === "done" && <p className="contact__done" role="status">{view.message}</p>}
      </div>
    </form>
  );
}
