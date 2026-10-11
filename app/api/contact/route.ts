import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/content/info";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";
import { sendMail, startSubscription } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
/** One line only: a subject or name must never be able to add mail headers. */
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim(); // \s covers CR, LF and the Unicode line separators

// Simple per-instance limit (5 messages per 10 minutes per IP). Enough to blunt a bot on one serverless instance.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

/**
 * Contact form: emails the message to the shop inbox with the sender as reply-to.
 * If the visitor ticked the newsletter box, a double opt-in subscription is started as well.
 * Answers with a code, and the page shows it in the visitor's language.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  // Honeypot: people never see this field. Pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true, newsletter: "none" });

  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return NextResponse.json({ ok: false, code: "rate" }, { status: 429 });

  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const name = oneLine(str(body.name));
  const email = oneLine(str(body.email)).toLowerCase();
  const subject = oneLine(str(body.subject));
  const message = str(body.message).replace(/\r\n/g, "\n").trim();
  if (!name || name.length > 100 || !subject || subject.length > 150 || !message || message.length > 4000 || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  const locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;
  const wantsNews = body.newsletter === true;

  try {
    const to = process.env.CONTACT_TO || CONTACT_EMAIL;
    await sendMail({
      to,
      replyTo: email,
      subject: `[Scudaro contact] ${subject}`,
      text: `From: ${name} <${email}>\nLanguage: ${locale}\nNewsletter: ${wantsNews ? "asked to subscribe (confirmation email sent)" : "no"}\n\n${message}`,
      html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.6">
<p style="margin:0 0 4px"><strong>${esc(name)}</strong> &lt;${esc(email)}&gt;</p>
<p style="margin:0 0 16px;color:#666;font-size:13px">Language: ${esc(locale)} · Newsletter: ${wantsNews ? "asked to subscribe (confirmation email sent)" : "no"}</p>
<p style="margin:0 0 8px"><strong>${esc(subject)}</strong></p>
<div style="white-space:pre-wrap">${esc(message)}</div></body></html>`,
    });
  } catch (err) {
    console.error("[contact] send failed", err);
    return NextResponse.json({ ok: false, code: "error" }, { status: 502 });
  }

  let newsletter: "none" | "sent" | "failed" = "none";
  if (wantsNews) {
    const t = await getT(locale);
    const started = await startSubscription({
      email,
      locale,
      origin: new URL(request.url).origin,
      source: "contact",
      consentText: t("news.consent"),
    });
    newsletter = started ? "sent" : "failed";
  }
  return NextResponse.json({ ok: true, newsletter });
}
