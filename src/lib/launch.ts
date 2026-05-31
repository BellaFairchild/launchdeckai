/** Launch timing + readiness helpers (used by Deck, Missions, Signal Deck). */

export type TMinus = {
  hasDate: boolean;
  days: number;
  /** e.g. "T-14", "T-0", "Launched" */
  label: string;
};

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
