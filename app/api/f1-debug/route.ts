// TEMPORARY diagnostics: shows what OpenF1 answers from the server. Remove once the race board works.
export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = {};
  const urls = {
    sessionsSince: `https://api.openf1.org/v1/sessions?date_start>=${new Date(Date.now() - 4 * 864e5).toISOString().slice(0, 10)}`,
    sessionsYear: "https://api.openf1.org/v1/sessions?year=2026&session_name=Sprint%20Qualifying",
  };
  for (const [k, u] of Object.entries(urls)) {
    const t = Date.now();
    try {
      const r = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(10000) });
      const text = await r.text();
      out[k] = { status: r.status, ms: Date.now() - t, body: text.slice(0, 900) };
    } catch (e) {
      out[k] = { error: String(e), ms: Date.now() - t };
    }
  }
  return Response.json(out);
}
