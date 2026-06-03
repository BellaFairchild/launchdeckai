/**
 * Domain types for LaunchDeckAI (source of truth: Docs/09_DATA_SCHEMA_AND_BACKEND_RULES.md).
 * These mirror the eventual Convex schema so the mock data layer can be swapped
 * for Convex queries/mutations with minimal churn.
 */
import type { Plan } from "@/constants/plans";

export type { Plan };

export type Platform = "ios" | "android" | "both";
export type MissionStage = "building" | "testing" | "store_prep" | "ready_to_submit";
export type MissionStatus = "active" | "launched" | "archived";

export interface Mission {
  id: string;
  appName: string;
  appDescription: string;
  oneLiner: string;
  targetAudience: string;
  platform: Platform;
  launchDate?: number;
  stage: MissionStage;
  status: MissionStatus;
  readinessScore: number;
}

export type MilestoneCategory =
  | "foundation"
  | "store"
  | "assets"
  | "marketing"
  | "launch"
  | "post_launch";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  completed: boolean;
  fuelReward: number;
  requiredPlan: Plan;
  isLocked: boolean;
  /** Optional deep link target within the app. */
  linkedTool?: string;
}

export type BlueprintSection =
  | "app_info"
  | "app_store"
  | "legal_compliance"
  | "marketing"
  | "beta_testing"
  | "pre_launch"
  | "launch_day"
  | "post_launch";

export interface Blueprint {
  section: BlueprintSection;
  fields: Record<string, string>;
  completionStatus: number; // 0-100
}

export type AssetType =
  | "app_store_copy"
  | "social_blast"
  | "email_sequence"
  | "video_script"
  | "press_kit"
  | "product_hunt_copy"
  | "image"
  | "legal"
  | "signal_asset";

export type AssetStatus =
  | "not_loaded"
  | "in_prep"
  | "needs_clearance"
  | "flight_ready"
  | "exported";

export type AssetCategory =
  | "app_store"
  | "social"
  | "media"
  | "pr"
  | "legal"
  | "files";

export interface Asset {
  id: string;
  type: AssetType;
  title: string;
  content?: string;
  status: AssetStatus;
  category: AssetCategory;
  tone?: string;
  signalId?: string;
  signalLabel?: string;
  signalPhase?: SignalPhase;
  updatedAt: number;
}

export type SignalPhase = "pre_launch" | "launch_day" | "post_launch";

export interface SignalTemplate {
  id: string;
  phase: SignalPhase;
  label: string;
  platform: string;
  assetType: AssetType;
  relativeTiming: string;
  order: number;
}

/**
 * A scheduled broadcast for a single signal: where to post + when. The
 * device-local reminder is keyed by `broadcast:{signalId}`, so no notification
 * id is stored here.
 */
export interface Broadcast {
  signalId: string;
  destinationUrl: string;
  scheduledAt: number; // epoch ms
}
