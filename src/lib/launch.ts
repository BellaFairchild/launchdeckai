/** Launch timing + readiness helpers (used by Deck, Missions, Signal Deck). */

const MS_SECOND = 1000;
const MS_MINUTE = 60 * MS_SECOND;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;

export type TMinus = {
  hasDate: boolean;
  days: number;
  /** e.g. "T-14", "T-0", "Launched" */
  label: string;
};

/** Live T-minus clock parts for the Deck hero (days · hrs · min · sec). */
export type LaunchCountdownParts = {
  hasDate: boolean;
  launched: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function launchCountdownParts(
  launchDate: number | undefined,
  now: number = Date.now(),
): LaunchCountdownParts {
  if (!launchDate) {
    return {
      hasDate: false,
      launched: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  const diff = launchDate - now;
  if (diff <= 0) {
    return {
      hasDate: true,
      launched: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  return {
    hasDate: true,
    launched: false,
    days: Math.floor(diff / MS_DAY),
    hours: Math.floor((diff % MS_DAY) / MS_HOUR),
    minutes: Math.floor((diff % MS_HOUR) / MS_MINUTE),
    seconds: Math.floor((diff % MS_MINUTE) / MS_SECOND),
  };
}

export function platformDesignation(platform: string): string {
  return platform === "both" ? "BOTH" : platform.toUpperCase();
}

/** True when launch is within the next 48 hours (Deck launch-eve ambient). */
export function isLaunchEve(
  launchDate?: number,
  now: number = Date.now(),
): boolean {
  if (!launchDate) return false;
  const diff = launchDate - now;
  return diff > 0 && diff < 48 * MS_HOUR;
}

export function tMinus(launchDate?: number, now: number = Date.now()): TMinus {
  if (!launchDate) return { hasDate: false, days: 0, label: "Set a date" };
  const days = Math.ceil((launchDate - now) / (24 * 60 * 60 * 1000));
  if (days < 0) return { hasDate: true, days, label: "Launched" };
  return { hasDate: true, days, label: `T-${days}` };
}

export function readinessLabel(score: number): string {
  if (score >= 90) return "Launch ready!";
  if (score >= 60) return "Building momentum";
  if (score >= 30) return "Getting organized";
  return "Just getting started";
}

export function formatLaunchDate(launchDate?: number): string {
  if (!launchDate) return "No date set";
  const d = new Date(launchDate);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
