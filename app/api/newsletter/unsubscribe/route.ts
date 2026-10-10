import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";
import { TOKEN_RE, supabase } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

/**
 * Unsubscribes. POST only: the unsubscribe page has a button, and the same endpoint serves the
 * one-click `List-Unsubscribe-Post` header (RFC 8058) that mailbox providers use for marketing emails.
 * The token comes from the form body or the query string.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") ?? url.searchParams.get("token") ?? "");
  const db = supabase();
  let locale = DEFAULT_LOCALE;
  let ok = false;

  if (db && TOKEN_RE.test(token)) {
    try {
      const res = await fetch(`${db.url}?token=eq.${token}`, {
        method: "PATCH",
        headers: { ...db.headers, Prefer: "return=representation" },
        body: JSON.stringify({ unsubscribed_at: new Date().toISOString() }),
        cache: "no-store",
      });
      const rows = res.ok ? ((await res.json()) as { locale?: string }[]) : [];
      if (rows.length > 0) {
        ok = true;
        if (isLocale(rows[0].locale)) locale = rows[0].locale;
      }
    } catch (err) {
      console.error("newsletter unsubscribe error", err);
    }
  }
  return NextResponse.redirect(new URL(localePath(locale, ok ? "/newsletter/unsubscribed" : "/newsletter/invalid"), request.url), 303);
}
