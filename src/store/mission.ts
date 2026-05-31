import { create } from "zustand";

import type { Mission, Milestone, Blueprint, Asset, BlueprintSection } from "@/types";
import { MILESTONE_TEMPLATES } from "@/constants/milestoneTemplates";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { useUIStore } from "./ui";

/**
 * Mission data store. In demo mode it holds mock data and mutates locally. When
 * signed in, DataSync hydrates it from Convex and injects a `convex` adapter, so
 * mutations delegate to Convex mutations (and the live query re-hydrates state).
 * Screens read this store either way — they don't know the source.
 */

const DAY = 24 * 60 * 60 * 1000;

const INITIAL_MISSION: Mission = {
  id: "m_1",
  appName: "FocusFlow",
  appDescription: "The calmest way to track daily progress and avoid burnout.",
  oneLiner: "Mindful task tracking for overwhelmed builders.",
  targetAudience: "Solo founders, indie hackers, and freelancers",
  platform: "ios",
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
    isLocked: false,
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

export type FoundryAssetArgs = {
  tool: string;
  assetType: string;
  category: string;
  title: string;
  content: string;
  signalId?: string;
  signalLabel?: string;
  signalPhase?: Asset["signalPhase"];
};

/** Convex-backed mutation adapter injected by DataSync when signed in. */
export type ConvexAdapter = {
  completeMilestone: (id: string) => void;
  saveBlueprint: (
    section: BlueprintSection,
    fields: Record<string, string>,
    completionStatus: number,
  ) => void;
  updateAssetStatus: (id: string, status: Asset["status"]) => void;
  createFoundryAsset: (args: FoundryAssetArgs) => Promise<void>;
};

type MissionState = {
  mission: Mission;
  milestones: Milestone[];
  blueprints: Record<BlueprintSection, Blueprint>;
  assets: Asset[];
  convex: ConvexAdapter | null;

  setConvex: (adapter: ConvexAdapter | null) => void;
  hydrate: (data: {
    mission: Mission;
    milestones: Milestone[];
    blueprints: Record<BlueprintSection, Blueprint>;
    assets: Asset[];
  }) => void;

  completeMilestone: (id: string) => void;
  saveBlueprint: (section: BlueprintSection, fields: Record<string, string>) => void;
  updateMission: (partial: Partial<Mission>) => void;
  addAsset: (asset: Omit<Asset, "id" | "updatedAt">) => string;
  updateAssetStatus: (id: string, status: Asset["status"]) => void;
};

let assetCounterSeed = 100;
function nextAssetId(): string {
  assetCounterSeed += 1;
  return `a_${assetCounterSeed}`;
}

function blueprintCompletion(
  section: BlueprintSection,
  fields: Record<string, string>,
): number {
  const meta = BLUEPRINT_SECTIONS.find((s) => s.id === section);
  if (!meta) return 0;
  const filled = meta.fields.filter((f) => fields[f.key]?.trim()).length;
  return Math.round((filled / meta.fields.length) * 100);
}

const initialMilestones = buildMilestones();

export const useMissionStore = create<MissionState>((set, get) => ({
  mission: { ...INITIAL_MISSION, readinessScore: computeReadiness(initialMilestones) },
  milestones: initialMilestones,
  blueprints: buildBlueprints(INITIAL_MISSION),
  assets: INITIAL_ASSETS,
  convex: null,

  setConvex: (adapter) => set({ convex: adapter }),
  hydrate: (data) =>
    set({
      mission: data.mission,
      milestones: data.milestones,
      blueprints: data.blueprints,
      assets: data.assets,
    }),

  completeMilestone: (id) => {
    const convex = get().convex;
    if (convex) {
      convex.completeMilestone(id);
      return;
    }
    const target = get().milestones.find((m) => m.id === id);
    if (!target || target.completed) return;
    const milestones = get().milestones.map((m) =>
      m.id === id ? { ...m, completed: true } : m,
    );
    set({
      milestones,
      mission: { ...get().mission, readinessScore: computeReadiness(milestones) },
    });
    useUIStore.getState().addFuel(target.fuelReward);
  },

  saveBlueprint: (section, fields) => {
    const completionStatus = blueprintCompletion(section, fields);
    const convex = get().convex;
    if (convex) {
      convex.saveBlueprint(section, fields, completionStatus);
      return;
    }
    set({
      blueprints: {
        ...get().blueprints,
        [section]: { section, fields, completionStatus },
      },
    });
  },

  addAsset: (asset) => {
    const id = nextAssetId();
    set({ assets: [{ ...asset, id, updatedAt: Date.now() }, ...get().assets] });
    return id;
  },

  updateAssetStatus: (id, status) => {
    const convex = get().convex;
    if (convex) {
      convex.updateAssetStatus(id, status);
      return;
    }
    set({
      assets: get().assets.map((a) =>
        a.id === id ? { ...a, status, updatedAt: Date.now() } : a,
      ),
    });
  },

  updateMission: (partial) => {
    set({ mission: { ...get().mission, ...partial } });
  },
}));
