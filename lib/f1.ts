import "server-only";
import circuits from "./data/circuits.json";

/**
 * Race data from Jolpica-F1 (the open successor of the Ergast API): https://api.jolpi.ca
 * Everything here is best-effort: any failure returns null and the UI simply hides the strip.
 */
const BASE = "https://api.jolpi.ca/ergast/f1";

export type Session = { label: string; startsAt: string };

export type NextRace = {
  name: string;
  round: string;
  circuit: string;
  country: string;
  startsAt: string; // ISO, UTC
  sessions: Session[];
  /** Outline of the circuit (x/z in a ±50 box) for the 3D view, or null if we have no geometry for it. */
  track: [number, number][] | null;
};

export type ResultRow = { pos: string; driverId: string; driver: string; team: string; time: string };

export type LastRace = {
  /** Session shown, e.g. "Sprint Qualifying". "Race" for a finished grand prix. */
  session: string;
  name: string;
  round: string;
  date: string;
  results: ResultRow[];
};

type RawSession = { date?: string; time?: string };
type RawRace = {
  raceName: string;
  round: string;
  date: string;
  time?: string;
  Circuit?: { circuitName?: string; Location?: { country?: string; lat?: string; long?: string } };
  FirstPractice?: RawSession;
  SecondPractice?: RawSession;
  ThirdPractice?: RawSession;
  Qualifying?: RawSession;
  Sprint?: RawSession;
  SprintQualifying?: RawSession;
  SprintShootout?: RawSession;
  Results?: {
    position: string;
    positionText?: string;
    Driver: { driverId: string; givenName: string; familyName: string };
    Constructor?: { name: string };
    Time?: { time: string };
    status?: string;
  }[];
};

/* ---------- OpenF1: sessions of the current race weekend (practice, sprint quali, quali, sprint) ---------- */
const OPENF1 = "https://api.openf1.org/v1";

async function openf1<T>(path: string): Promise<T[] | null> {
  try {
    const res = await fetch(`${OPENF1}${path}`, { signal: AbortSignal.timeout(6000), next: { revalidate: 120, tags: ["f1"] } });
    if (!res.ok) {
      console.error(`OpenF1 ${path} -> HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (!Array.isArray(json)) console.error(`OpenF1 ${path} -> not an array`, JSON.stringify(json).slice(0, 200));
    return Array.isArray(json) ? (json as T[]) : null;
  } catch (err) {
    console.error(`OpenF1 ${path} failed`, err);
    return null;
  }
}

const SESSION_LABEL: Record<string, string> = {
  "Practice 1": "Practice 1",
  "Practice 2": "Practice 2",
  "Practice 3": "Practice 3",
  "Sprint Qualifying": "Sprint Qualifying",
  "Sprint Shootout": "Sprint Qualifying",
  Sprint: "Sprint",
  Qualifying: "Qualifying",
};

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
const fmtLap = (sec: number) => {
  const m = Math.floor(sec / 60);
  const r = (sec - m * 60).toFixed(3).padStart(6, "0");
  return m > 0 ? `${m}:${r}` : r;
};

/** Latest finished session of the race weekend that starts at `raceStart`. Null if none or on any failure. */
async function getWeekendSession(raceName: string, raceStart: string): Promise<LastRace | null> {
  type OSession = { session_key: number; session_name: string; date_start: string; date_end: string };
  const race = new Date(raceStart).getTime();
  // Only this weekend's sessions (small, fast answer): started within 4 days before the race.
  const from = new Date(race - 4 * 864e5).toISOString().slice(0, 10);
  const to = new Date(race + 864e5).toISOString().slice(0, 10);
  const all = await openf1<OSession>(`/sessions?date_start>=${from}&date_start<=${to}`);
  if (!all) return null;
  const nowMs = Date.now();
  const finished = all
    .filter((x) => SESSION_LABEL[x.session_name])
    .filter((x) => {
      const st = new Date(x.date_start).getTime();
      const en = new Date(x.date_end).getTime();
      // belongs to this weekend: starts within 4 days before the race, and is over (+10 min for results to settle)
      return st <= race && race - st < 4 * 864e5 && en + 10 * 6e4 < nowMs;
    })
    .sort((a, b) => b.date_end.localeCompare(a.date_end));
  const sess = finished[0];
  if (!sess) return null;

  type OResult = { position: number | null; driver_number: number; duration?: number | (number | null)[] | null; gap_to_leader?: number | string | null; dnf?: boolean; dns?: boolean; dsq?: boolean };
  type ODriver = { driver_number: number; full_name?: string; team_name?: string };
  const [res, drivers] = await Promise.all([
    openf1<OResult>(`/session_result?session_key=${sess.session_key}`),
    openf1<ODriver>(`/drivers?session_key=${sess.session_key}`),
  ]);
  if (!res?.length || !drivers) return null;
  const byNo = new Map(drivers.map((d) => [d.driver_number, d]));
  const isRace = sess.session_name === "Sprint";
  const rows = res
    .filter((r) => typeof r.position === "number")
    .sort((a, b) => (a.position as number) - (b.position as number))
    .slice(0, 10)
    .map((r) => {
      const d = byNo.get(r.driver_number);
      const dur = Array.isArray(r.duration) ? [...r.duration].reverse().find((v) => typeof v === "number") : r.duration;
      let time = "";
      if (r.dnf) time = "DNF";
      else if (r.dns) time = "DNS";
      else if (r.dsq) time = "DSQ";
      else if (isRace && r.position !== 1 && r.gap_to_leader != null) time = typeof r.gap_to_leader === "number" ? `+${r.gap_to_leader.toFixed(3)}` : String(r.gap_to_leader);
      else if (typeof dur === "number") time = fmtLap(dur);
      return {
        pos: String(r.position),
        driverId: String(r.driver_number),
        driver: d?.full_name ? titleCase(d.full_name) : `#${r.driver_number}`,
        team: d?.team_name ?? "",
        time,
      };
    });
  if (!rows.length) return null;
  return { session: SESSION_LABEL[sess.session_name], name: raceName, round: "", date: sess.date_end, results: rows };
}

async function getRaces(path: string): Promise<RawRace[] | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(4000), next: { revalidate: 600, tags: ["f1"] } });
    if (!res.ok) return null;
    const json = (await res.json()) as { MRData?: { RaceTable?: { Races?: RawRace[] } } };
    return json.MRData?.RaceTable?.Races ?? null;
  } catch {
    return null;
  }
}

/**
 * Circuit outlines come from the open dataset bacinger/f1-circuits (real-world coordinates, simplified).
 * We match by the circuit's location (nearest within ~25 km) because Jolpica and the dataset use different ids.
 */
function trackFor(lat?: string, long?: string): [number, number][] | null {
  const la = Number(lat);
  const lo = Number(long);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  let best: { d: number; pts: [number, number][] } | null = null;
  for (const c of circuits as unknown as { lat: number; lon: number; pts: [number, number][] }[]) {
    const dy = (c.lat - la) * 110.5;
    const dx = (c.lon - lo) * 111.3 * Math.cos((la * Math.PI) / 180);
    const d = Math.hypot(dx, dy);
    if (!best || d < best.d) best = { d, pts: c.pts };
  }
  return best && best.d < 25 ? best.pts : null;
}

const iso = (s?: RawSession): string | null => {
  if (!s?.date) return null;
  const t = s.time ?? "12:00:00Z";
  const d = new Date(`${s.date}T${t.endsWith("Z") ? t : `${t}Z`}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export async function getF1(): Promise<{ next: NextRace | null; last: LastRace | null }> {
  const [nextRaces, lastRaces] = await Promise.all([getRaces("/current/next.json"), getRaces("/current/last/results.json")]);

  let next: NextRace | null = null;
  const n = nextRaces?.[0];
  const start = n ? iso(n) : null;
  if (n && start) {
    const candidates: [string, RawSession | undefined][] = [
      ["Practice 1", n.FirstPractice],
      ["Sprint qualifying", n.SprintQualifying ?? n.SprintShootout],
      ["Practice 2", n.SecondPractice],
      ["Practice 3", n.ThirdPractice],
      ["Sprint", n.Sprint],
      ["Qualifying", n.Qualifying],
    ];
    const sessions = candidates
      .map(([label, s]) => ({ label, startsAt: iso(s) }))
      .filter((s): s is Session => Boolean(s.startsAt))
      .concat([{ label: "Race", startsAt: start }])
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    next = {
      name: n.raceName,
      round: n.round,
      circuit: n.Circuit?.circuitName ?? "",
      country: n.Circuit?.Location?.country ?? "",
      startsAt: start,
      sessions,
      track: trackFor(n.Circuit?.Location?.lat, n.Circuit?.Location?.long),
    };
  }

  let last: LastRace | null = null;
  const l = lastRaces?.[0];
  if (l?.Results?.length) {
    last = {
      session: "Race",
      name: l.raceName,
      round: l.round,
      date: l.date,
      results: l.Results.slice(0, 10).map((r) => ({
        pos: r.positionText && /^\d+$/.test(r.positionText) ? r.positionText : r.position,
        driverId: r.Driver.driverId,
        driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
        team: r.Constructor?.name ?? "",
        time: r.Time?.time ?? r.status ?? "",
      })),
    };
  }

  // During a race weekend, prefer the latest finished session (practice, quali, sprint) over last weekend's race.
  if (next) {
    const weekend = await getWeekendSession(next.name, next.startsAt).catch(() => null);
    if (weekend) last = weekend;
  }

  return { next, last };
}
