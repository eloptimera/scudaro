import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";
import { confirmationEmail, newToken, sendMail, supabase } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter sign-up with double opt-in.
 * Stores the lead in Supabase (table `newsletter_leads`) together with proof of consent, then emails a
 * confirmation link through Resend. Nobody is subscribed until they click it (see /api/newsletter/confirm).
 * Uses the secret key server-side only; the table has RLS on and no public policies.
 */
export async function POST(request: Request) {
  const db = supabase();
  if (!db) return NextResponse.json({ ok: false, error: "Newsletter is not configured." }, { status: 503 });

  let body: { email?: unknown; consent?: unknown; website?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;
  const t = await getT(locale);

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ ok: false, error: "Please tick the box to subscribe." }, { status: 400 });
  }

  const token = newToken();
  try {
    const res = await fetch(db.url, {
      method: "POST",
      headers: { ...db.headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        email,
        source: "footer",
        token,
        locale,
        consent_text: t("news.consent"),
        consent_at: new Date().toISOString(),
      }),
      cache: "no-store",
    });

    // 409 = already on the list (unique index). Same answer as success, so the list can't be probed.
    // No second email is sent, which also stops this form being used to mail-bomb an address.
    if (res.status === 409) return NextResponse.json({ ok: true });

    if (res.ok) {
      try {
        const origin = new URL(request.url).origin;
        await sendMail({ to: email, ...(await confirmationEmail(locale, origin, token)) });
        return NextResponse.json({ ok: true });
      } catch (err) {
        console.error("newsletter confirmation email failed", err);
        // Roll the lead back so the visitor can simply try again.
        await fetch(`${db.url}?token=eq.${token}`, { method: "DELETE", headers: db.headers, cache: "no-store" }).catch(() => {});
      }
    } else {
      console.error("newsletter insert failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("newsletter error", err);
  }
  return NextResponse.json({ ok: false, error: "Something went wrong. Please try again later." }, { status: 502 });
}
