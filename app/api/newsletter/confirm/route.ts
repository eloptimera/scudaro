import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";
import { TOKEN_RE, supabase } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

/** Confirms a subscription. POST only (the page has a button), so mail scanners that open links can't confirm for people. */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");
  const db = supabase();
  let locale = DEFAULT_LOCALE;
  let ok = false;

  if (db && TOKEN_RE.test(token)) {
    try {
      const res = await fetch(`${db.url}?token=eq.${token}&unsubscribed_at=is.null&confirmed_at=is.null`, {
        method: "PATCH",
        headers: { ...db.headers, Prefer: "return=representation" },
        body: JSON.stringify({ confirmed_at: new Date().toISOString() }),
        cache: "no-store",
      });
      const rows = res.ok ? ((await res.json()) as { locale?: string }[]) : [];
      if (rows.length > 0) {
        ok = true;
        if (isLocale(rows[0].locale)) locale = rows[0].locale;
      } else {
        // Already confirmed earlier? Then show the same friendly result.
        const again = await fetch(`${db.url}?token=eq.${token}&unsubscribed_at=is.null&select=locale,confirmed_at`, { headers: db.headers, cache: "no-store" });
        const found = again.ok ? ((await again.json()) as { locale?: string; confirmed_at?: string | null }[]) : [];
        if (found[0]?.confirmed_at) {
          ok = true;
          if (isLocale(found[0].locale)) locale = found[0].locale;
        }
      }
    } catch (err) {
      console.error("newsletter confirm error", err);
    }
  }
  return NextResponse.redirect(new URL(localePath(locale, ok ? "/newsletter/done" : "/newsletter/invalid"), request.url), 303);
}
