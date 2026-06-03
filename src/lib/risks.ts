import type { Href } from "expo-router";

import type { Asset, Milestone, Mission } from "@/types";

/**
 * Mission risk engine. Surfaces the most pressing gaps between the commander's
 * current state and a clean launch — derived entirely from real mission data so
 * the Deck's risk alert is honest, not decorative. Each risk knows where the
 * commander should go to clear it.
 */

export type RiskSeverity = "high" | "med";

export type Risk = {
  id: string;
  /** Short, scannable description of what's wrong. */
  label: string;
  severity: RiskSeverity;
  /** Route to push when the commander acts on this risk. */
  target: Href;
};

const DAY = 24 * 60 * 60 * 1000;

const isReady = (a: Asset): boolean =>
  a.status === "flight_ready" || a.status === "exported";

/** Compute the active risks for a mission, highest severity first. */
export function deriveRisks(
  mission: Mission,
  milestones: Milestone[],
  assets: Asset[],
): Risk[] {
  const risks: Risk[] = [];

  const storePrep =
    mission.stage === "store_prep" || mission.stage === "ready_to_submit";

  // Screenshots: store submission is rejected without them.
  const hasScreenshots = assets.some((a) => a.type === "image" && isReady(a));
  if (storePrep && !hasScreenshots) {
    risks.push({
      id: "app_store_screenshots",
      label: "App Store metadata missing screenshots",
      severity: "high",
      target: "/(modals)/cargo",
    });
  }

  // Email sequence: the pre-launch waitlist needs a flight-ready teaser.
  const hasEmail = assets.some((a) => a.type === "email_sequence" && isReady(a));
  if (!hasEmail) {
    risks.push({
      id: "email_sequence",
      label: "Email sequence not configured",
      severity: "med",
      target: "/(modals)/cargo",
    });
  }

  // Store copy staged but not cleared for flight.
  const storeCopy = assets.find((a) => a.type === "app_store_copy");
  if (storePrep && storeCopy && !isReady(storeCopy)) {
    risks.push({
      id: "store_copy",
      label: "Store description still in prep",
      severity: "med",
      target: "/(modals)/cargo",
    });
  }

  // Launch is close but readiness is lagging.
  if (mission.launchDate) {
    const days = Math.ceil((mission.launchDate - Date.now()) / DAY);
    if (days >= 0 && days <= 7 && mission.readinessScore < 70) {
      risks.push({
        id: "launch_readiness",
        label: `Launch in ${days}d — readiness at ${mission.readinessScore}%`,
        severity: "high",
        target: "/(tabs)/missions",
      });
    }
  }

  const order: Record<RiskSeverity, number> = { high: 0, med: 1 };
  return risks.sort((a, b) => order[a.severity] - order[b.severity]);
}

/** Contextual CTA label for a target route. */
export function riskActionLabel(target: Href): string {
  const route = String(target);
  if (route.includes("cargo")) return "Open Cargo Bay →";
  if (route.includes("missions")) return "Review Mission Plan →";
  if (route.includes("blueprints")) return "Open Blueprints →";
  return "Resolve Now →";
}
