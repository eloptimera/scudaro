import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Stores a newsletter lead in Supabase (table `newsletter_leads`).
 * Uses the secret key server-side only; the table has RLS on and no public policies.
 */
export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Newsletter is not configured." }, { status: 503 });
  }

  let body: { email?: unknown; consent?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ ok: false, error: "Please tick the box to subscribe." }, { status: 400 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/newsletter_leads`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ email, source: "footer" }),
      cache: "no-store",
    });

    // 409 = already on the list (unique index). Same answer as success, so the list can't be probed.
    if (res.ok || res.status === 409) return NextResponse.json({ ok: true });

    console.error("newsletter insert failed", res.status, await res.text());
  } catch (err) {
    console.error("newsletter insert error", err);
  }
  return NextResponse.json({ ok: false, error: "Something went wrong. Please try again later." }, { status: 502 });
}
