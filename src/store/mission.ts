import { create } from "zustand";

import type { Mission, Milestone, Blueprint, Asset, BlueprintSection } from "@/types";
import { MILESTONE_TEMPLATES } from "@/constants/milestoneTemplates";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { useUIStore } from "./ui";

/**
 * TEMP in-memory mission store (mock data). Mirrors the eventual Convex shape so
 * screens can be built now and swapped to `useQuery`/`useMutation` later.
 * Readiness is recomputed here the same way the backend will (Docs/09).
 */

const DAY = 24 * 60 * 60 * 1000;

const INITIAL_MISSION: Mission = {
  id: "m_1",
  appName: "FocusFlow",
  appDescription: "The calmest way to track daily progress and avoid burnout.",
  oneLiner: "Mindful task tracking for overwhelmed builders.",
  targetAudience: "Solo founders, indie hackers, and freelancers",
  platform: "ios",
  // ~14 days out. Fixed offset (Date.now unavailable at import is fine at runtime).
  launchDate: Date.now() + 14 * DAY,
  stage: "store_prep",
  status: "active",
  readinessScore: 0,
};

const COMPLETED_AT_START = new Set(["ms_name", "ms_oneliner", "ms_audience"]);

function buildMilestones(): Milestone[] {
  return MILESTONE_TEMPLATES.map((t) => ({
    ...t,
    completed: COMPLETED_AT_START.has(t.id),
    isLocked: false, // recomputed against plan in selectors
  }));
}

function computeReadiness(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.completed).length;
  return Math.round((done / milestones.length) * 100);
}

function buildBlueprints(mission: Mission): Record<BlueprintSection, Blueprint> {
  const out = {} as Record<BlueprintSection, Blueprint>;
  for (const section of BLUEPRINT_SECTIONS) {
    const fields: Record<string, string> = {};
    // Seed app_info from the mission so there's visible early progress.
    if (section.id === "app_info") {
      fields.appName = mission.appName;
      fields.oneLiner = mission.oneLiner;
    }
    const filled = section.fields.filter((f) => fields[f.key]?.trim()).length;
    out[section.id] = {
      section: section.id,
      fields,
      completionStatus: Math.round((filled / section.fields.length) * 100),
    };
  }
  return out;
}

const INITIAL_ASSETS: Asset[] = [
  { id: "a_1", type: "app_store_copy", title: "Store Description", status: "in_prep", category: "app_store", updatedAt: Date.now() },
  { id: "a_2", type: "email_sequence", title: "Email Teaser", status: "flight_ready", category: "pr", signalId: "pre_4", signalLabel: "Waitlist email teaser", signalPhase: "pre_launch", updatedAt: Date.now() },
  { id: "a_3", type: "video_script", title: "Launch Video Script", status: "needs_clearance", category: "media", updatedAt: Date.now() },
  { id: "a_4", type: "social_blast", title: "X/Twitter Launch Thread", status: "flight_ready", category: "social", signalId: "day_3", signalLabel: "X/Twitter launch thread", signalPhase: "launch_day", updatedAt: Date.now() },
];

type MissionState = {
  mission: Mission;
  milestones: Milestone[];
  blueprints: Record<BlueprintSection, Blueprint>;
  assets: Asset[];
  completeMilestone: (id: string) => void;
  saveBlueprint: (section: BlueprintSection, fields: Record<string, string>) => void;
  /** Add a generated/forged asset (Foundry, Signal forge). Returns the new id. */
  addAsset: (asset: Omit<Asset, "id" | "updatedAt">) => string;
  updateAssetStatus: (id: string, status: Asset["status"]) => void;
};

let assetCounterSeed = 100;
function nextAssetId(): string {
  assetCounterSeed += 1;
  return `a_${assetCounterSeed}`;
}

const initialMilestones = buildMilestones();

export const useMissionStore = create<MissionState>((set, get) => ({
  mission: { ...INITIAL_MISSION, readinessScore: computeReadiness(initialMilestones) },
  milestones: initialMilestones,
  blueprints: buildBlueprints(INITIAL_MISSION),
  assets: INITIAL_ASSETS,

  completeMilestone: (id) => {
    const target = get().milestones.find((m) => m.id === id);
    if (!target || target.completed) return;
    const milestones = get().milestones.map((m) =>
      m.id === id ? { ...m, completed: true } : m,
    );
    set({
      milestones,
      mission: { ...get().mission, readinessScore: computeReadiness(milestones) },
    });
    // Award Fuel (backend will also write fuelHistory in Phase 7).
    useUIStore.getState().addFuel(target.fuelReward);
  },

  saveBlueprint: (section, fields) => {
    const meta = BLUEPRINT_SECTIONS.find((s) => s.id === section);
    const filled = meta
      ? meta.fields.filter((f) => fields[f.key]?.trim()).length
      : 0;
    const completionStatus = meta
      ? Math.round((filled / meta.fields.length) * 100)
      : 0;
    set({
      blueprints: {
        ...get().blueprints,
        [section]: { section, fields, completionStatus },
      },
    });
  },

  addAsset: (asset) => {
    const id = nextAssetId();
    set({
      assets: [{ ...asset, id, updatedAt: Date.now() }, ...get().assets],
    });
    return id;
  },

  updateAssetStatus: (id, status) => {
    set({
      assets: get().assets.map((a) =>
        a.id === id ? { ...a, status, updatedAt: Date.now() } : a,
      ),
    });
  },
}));
