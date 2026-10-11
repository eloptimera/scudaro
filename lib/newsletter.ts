import "server-only";
import { randomBytes } from "node:crypto";
import { localePath, dirOf, type Locale } from "./i18n/config";
import { getT } from "./i18n/server";

export const FROM = process.env.NEWSLETTER_FROM || "Scudaro <hello@scudaro.com>";
const REPLY_TO = process.env.NEWSLETTER_REPLY_TO || undefined;

export const newToken = () => randomBytes(24).toString("hex");
export const TOKEN_RE = /^[a-f0-9]{48}$/;

/** Supabase REST helper (server only, secret key). Returns null when Supabase is not configured. */
export function supabase() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  return { url: `${url}/rest/v1/newsletter_leads`, headers };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

/** Sends one email through Resend. Throws on failure so callers can roll back. */
export async function sendMail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text, ...((opts.replyTo ?? REPLY_TO) ? { reply_to: opts.replyTo ?? REPLY_TO } : {}) }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/** The double opt-in email, in the visitor's language. */
export async function confirmationEmail(locale: Locale, origin: string, token: string) {
  const t = await getT(locale);
  const link = `${origin}${localePath(locale, "/newsletter/confirm")}?token=${token}`;
  const dir = dirOf(locale);
  const subject = t("email.confirm.subject");
  const html = `<!doctype html><html lang="${locale}" dir="${dir}"><body style="margin:0;background:#f4f4f2;padding:32px 16px;font-family:Inter,Arial,Helvetica,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:18px;padding:36px 32px">
<tr><td align="center" style="padding-bottom:24px"><img src="${origin}/logo-black.png" width="140" alt="SCUDARO" style="display:block;height:auto;border:0"></td></tr>
<tr><td style="font-size:16px;line-height:1.6;padding-bottom:28px;text-align:${dir === "rtl" ? "right" : "left"}">${esc(t("email.confirm.text"))}</td></tr>
<tr><td align="center" style="padding-bottom:28px"><a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.06em;text-transform:uppercase;padding:15px 30px;border-radius:999px">${esc(t("email.confirm.button"))}</a></td></tr>
<tr><td style="font-size:13px;line-height:1.5;color:#666;text-align:${dir === "rtl" ? "right" : "left"}">${esc(t("email.confirm.ignore"))}</td></tr>
</table>
<p style="max-width:480px;font-size:12px;line-height:1.5;color:#888;margin:20px 0 0">${esc(t("email.footer"))}</p>
</td></tr></table></body></html>`;
  const text = `${t("email.confirm.text")}\n\n${link}\n\n${t("email.confirm.ignore")}\n\n${t("email.footer")}`;
  return { subject, html, text };
}

/**
 * Starts a double opt-in subscription (stores the lead with proof of consent, emails the confirmation link).
 * Returns false when it could not be started. An address that is already on the list counts as success,
 * so the list cannot be probed and no second email is sent.
 */
export async function startSubscription(opts: { email: string; locale: Locale; origin: string; source: string; consentText: string }): Promise<boolean> {
  const db = supabase();
  if (!db) return false;
  const token = newToken();
  try {
    const res = await fetch(db.url, {
      method: "POST",
      headers: { ...db.headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        email: opts.email,
        source: opts.source,
        token,
        locale: opts.locale,
        consent_text: opts.consentText,
        consent_at: new Date().toISOString(),
      }),
      cache: "no-store",
    });
    if (res.status === 409) return true;
    if (!res.ok) {
      console.error("newsletter insert failed", res.status, await res.text());
      return false;
    }
    try {
      await sendMail({ to: opts.email, ...(await confirmationEmail(opts.locale, opts.origin, token)) });
      return true;
    } catch (err) {
      console.error("newsletter confirmation email failed", err);
      await fetch(`${db.url}?token=eq.${token}`, { method: "DELETE", headers: db.headers, cache: "no-store" }).catch(() => {});
      return false;
    }
  } catch (err) {
    console.error("newsletter error", err);
    return false;
  }
}
