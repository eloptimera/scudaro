"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "./I18nProvider";
import LocalLink from "./LocalLink";

export default function Newsletter() {
  const { t } = useI18n();
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setState("done");
        setMsg(t("news.ok"));
        form.reset();
      } else {
        setState("error");
        setMsg(json.error ?? t("news.error"));
      }
    } catch {
      setState("error");
      setMsg(t("news.error"));
    }
  };

  return (
    <form className="newsletter" onSubmit={onSubmit}>
      <label htmlFor="email">{t("news.label")}</label>
      <div className="newsletter__row">
        <input id="email" name="email" type="email" placeholder={t("news.placeholder")} autoComplete="email" required />
        <button className="btn btn--light" type="submit" disabled={state === "sending"}>
          {state === "sending" ? t("news.sending") : t("news.send")}
        </button>
      </div>
      {/* Honeypot for bots – hidden from people and assistive tech. */}
      <input className="newsletter__hp" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="newsletter__consent">
        <input type="checkbox" name="consent" required />
        <span>
          {t("news.consent")}{" "}
          <LocalLink href="/policies/privacy-policy">{t("news.privacy")}</LocalLink>
        </span>
      </label>
      <p className="newsletter__msg" role="status">{msg}</p>
    </form>
  );
}
