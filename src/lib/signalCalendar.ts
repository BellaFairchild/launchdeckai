/**
 * Maps the fixed 16-step Signal Deck onto real calendar dates, anchored to the
 * mission launch day. Pure helpers (no React) consumed by the Signal Deck
 * calendar view. Timing strings come from constants/signalTemplates:
 *   "T-14" / "T-1"  → that many days BEFORE launch day
 *   "06:00".."18:00" → launch day, at that local time
 *   "+1d" / "+30d"  → that many days AFTER launch day
 */
import type { SignalPhase, SignalTemplate } from "@/types";

const DAY = 24 * 60 * 60 * 1000;

/** Local midnight for a timestamp, so day grouping ignores time-of-day. */
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Absolute timestamp for a signal given the launch date, or null if the launch
 * date is unset or the timing string is unrecognized.
 */
export function signalTimestamp(
  timing: string,
  launchDate?: number,
): number | null {
  if (!launchDate) return null;

  const before = /^T-(\d+)$/.exec(timing);
  if (before) return startOfDay(launchDate) - Number(before[1]) * DAY;

  const after = /^\+(\d+)d$/.exec(timing);
  if (after) return startOfDay(launchDate) + Number(after[1]) * DAY;

  const time = /^(\d{1,2}):(\d{2})$/.exec(timing);
  if (time) {
    return startOfDay(launchDate) + Number(time[1]) * 3600_000 + Number(time[2]) * 60_000;
  }

  return null;
}

export type SignalDay = {
  /** Local-midnight timestamp identifying the day. */
  dateMs: number;
  /** "MON", "TUE"… (upper, locale short). */
  weekday: string;
  /** Day-of-month number, e.g. 24. */
  dayNum: number;
  /** "JUN", short month, for cross-month clarity. */
  month: string;
  /** Signals scheduled that day, in template order. */
  signals: SignalTemplate[];
};

/**
 * Group a phase's signals by calendar day, sorted ascending. Pre/Post phases
 * spread across distinct days; this also tolerates two signals sharing a day.
 */
export function groupSignalsByDay(
  signals: SignalTemplate[],
  launchDate?: number,
): SignalDay[] {
  const byDay = new Map<number, SignalTemplate[]>();
  for (const s of signals) {
    const ts = signalTimestamp(s.relativeTiming, launchDate);
    if (ts == null) continue;
    const key = startOfDay(ts);
    const list = byDay.get(key);
    if (list) list.push(s);
    else byDay.set(key, [s]);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dateMs, daySignals]) => {
      const d = new Date(dateMs);
      return {
        dateMs,
        weekday: d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(),
        dayNum: d.getDate(),
        month: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
        signals: [...daySignals].sort((x, y) => x.order - y.order),
      };
    });
}

/** Launch-day signals sorted by their scheduled time (06:00 → 18:00). */
export function sortByTime(
  signals: SignalTemplate[],
  launchDate?: number,
): SignalTemplate[] {
  return [...signals].sort((a, b) => {
    const ta = signalTimestamp(a.relativeTiming, launchDate) ?? a.order;
    const tb = signalTimestamp(b.relativeTiming, launchDate) ?? b.order;
    return ta - tb;
  });
}

/** Which phase is "live" right now, to pick the default calendar tab. */
export function activePhase(launchDate?: number, now: number = Date.now()): SignalPhase {
  if (!launchDate) return "pre_launch";
  const today = startOfDay(now);
  const launch = startOfDay(launchDate);
  if (today < launch) return "pre_launch";
  if (today === launch) return "launch_day";
  return "post_launch";
}

/**
 * The day in `days` a user should be oriented to: the soonest day that is today
 * or upcoming, else the last past day. Used to highlight the "you are here" cell.
 */
export function focusDay(days: SignalDay[], now: number = Date.now()): number | null {
  if (days.length === 0) return null;
  const today = startOfDay(now);
  const upcoming = days.find((d) => d.dateMs >= today);
  return (upcoming ?? days[days.length - 1]).dateMs;
}

/** True if a day is in the past (before today), for dimming launched runs. */
export function isPastDay(dateMs: number, now: number = Date.now()): boolean {
  return dateMs < startOfDay(now);
}
