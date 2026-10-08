import "server-only";

/** Used when the rate service is unreachable (≈ SEK→EUR). Prices are shown as approximate anyway. */
const FALLBACK_EUR_PER_SEK = 0.089;

/**
 * SEK → EUR rate (ECB reference rates via Frankfurter), cached for 12 h. Never throws: a slow or
 * failing rate service must not break a page, so it falls back to a fixed approximation.
 */
export async function getEurPerSek(): Promise<number> {
  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=SEK&symbols=EUR", {
      next: { revalidate: 60 * 60 * 12, tags: ["fx"] },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return FALLBACK_EUR_PER_SEK;
    const json = (await res.json()) as { rates?: { EUR?: number } };
    const rate = json.rates?.EUR;
    return typeof rate === "number" && rate > 0.03 && rate < 0.3 ? rate : FALLBACK_EUR_PER_SEK;
  } catch {
    return FALLBACK_EUR_PER_SEK;
  }
}
