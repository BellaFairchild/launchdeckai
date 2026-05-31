import type { SignalTemplate, SignalPhase } from "@/types";
import { colors } from "./colors";

/** The fixed 16-step promotional sequence (Docs/07_SIGNAL_DECK_SPEC.md). */
export const SIGNAL_TEMPLATES: SignalTemplate[] = [
  // Phase 01 · Pre-Launch (T-14 to T-1)
  { id: "pre_1", phase: "pre_launch", label: "Dev log thread", platform: "X/Twitter", assetType: "social_blast", relativeTiming: "T-14", order: 1 },
  { id: "pre_2", phase: "pre_launch", label: "App reveal teaser", platform: "Instagram", assetType: "social_blast", relativeTiming: "T-10", order: 2 },
  { id: "pre_3", phase: "pre_launch", label: "TikTok behind-the-scenes", platform: "TikTok", assetType: "video_script", relativeTiming: "T-7", order: 3 },
  { id: "pre_4", phase: "pre_launch", label: "Waitlist email teaser", platform: "Email", assetType: "email_sequence", relativeTiming: "T-5", order: 4 },
  { id: "pre_5", phase: "pre_launch", label: "Product Hunt pre-registration", platform: "Product Hunt", assetType: "product_hunt_copy", relativeTiming: "T-3", order: 5 },
  { id: "pre_6", phase: "pre_launch", label: "Final countdown post", platform: "X/Twitter", assetType: "social_blast", relativeTiming: "T-1", order: 6 },

  // Phase 02 · Launch Day (06:00 -> 18:00)
  { id: "day_1", phase: "launch_day", label: "Product Hunt submission", platform: "Product Hunt", assetType: "product_hunt_copy", relativeTiming: "06:00", order: 7 },
  { id: "day_2", phase: "launch_day", label: "Launch email blast", platform: "Email", assetType: "email_sequence", relativeTiming: "09:00", order: 8 },
  { id: "day_3", phase: "launch_day", label: "X/Twitter launch thread", platform: "X/Twitter", assetType: "social_blast", relativeTiming: "10:00", order: 9 },
  { id: "day_4", phase: "launch_day", label: "LinkedIn post", platform: "LinkedIn", assetType: "social_blast", relativeTiming: "12:00", order: 10 },
  { id: "day_5", phase: "launch_day", label: "TikTok launch video", platform: "TikTok", assetType: "video_script", relativeTiming: "15:00", order: 11 },
  { id: "day_6", phase: "launch_day", label: "Reddit / Indie Hackers post", platform: "Reddit", assetType: "social_blast", relativeTiming: "18:00", order: 12 },

  // Phase 03 · Post-Launch (+1d to +30d)
  { id: "post_1", phase: "post_launch", label: "Thank you email", platform: "Email", assetType: "email_sequence", relativeTiming: "+1d", order: 13 },
  { id: "post_2", phase: "post_launch", label: "Social proof post", platform: "X/Twitter", assetType: "social_blast", relativeTiming: "+3d", order: 14 },
  { id: "post_3", phase: "post_launch", label: "First-week results thread", platform: "X/Twitter", assetType: "social_blast", relativeTiming: "+7d", order: 15 },
  { id: "post_4", phase: "post_launch", label: "Day-30 review request email", platform: "Email", assetType: "email_sequence", relativeTiming: "+30d", order: 16 },
];

export const SIGNAL_PHASES: {
  id: SignalPhase;
  title: string;
  subtitle: string;
  color: string;
}[] = [
  { id: "pre_launch", title: "Phase 01 · Pre-Launch", subtitle: "T-14 to T-1 days", color: colors.signalPre },
  { id: "launch_day", title: "Phase 02 · Launch Day", subtitle: "06:00 → 18:00", color: colors.signalLaunch },
  { id: "post_launch", title: "Phase 03 · Post-Launch", subtitle: "+1d to +30d", color: colors.signalPost },
];

export const TOTAL_SIGNALS = SIGNAL_TEMPLATES.length; // 16
