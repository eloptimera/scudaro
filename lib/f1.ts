import "server-only";

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
};

export type ResultRow = { pos: string; driverId: string; driver: string; team: string; time: string };

export type LastRace = {
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
  Circuit?: { circuitName?: string; Location?: { country?: string } };
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

async function getRaces(path: string): Promise<RawRace[] | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate: 600, tags: ["f1"] } });
    if (!res.ok) return null;
    const json = (await res.json()) as { MRData?: { RaceTable?: { Races?: RawRace[] } } };
    return json.MRData?.RaceTable?.Races ?? null;
  } catch {
    return null;
  }
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
    };
  }

  let last: LastRace | null = null;
  const l = lastRaces?.[0];
  if (l?.Results?.length) {
    last = {
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

  return { next, last };
}
