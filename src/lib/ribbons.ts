import type { IconName } from "@/components/ui/Icon";

export interface RibbonInput {
  completedMilestones: number;
  forgedAssets: number;
  signalsReady: number;
  streak: number;
}

export interface Ribbon {
  id: "first_launch" | "forge_master" | "comms_online" | "streak_keeper";
  /** SVG glyph key (see components/ui/Icon). */
  icon: IconName;
  label: string;
  earned: boolean;
}

export function deriveRibbons(input: RibbonInput): Ribbon[] {
  return [
    { id: "first_launch", icon: "rocket", label: "First Launch", earned: input.completedMilestones >= 1 },
    { id: "forge_master", icon: "hammer", label: "Forge Master", earned: input.forgedAssets >= 3 },
    { id: "comms_online", icon: "signal", label: "Comms Online", earned: input.signalsReady >= 1 },
    { id: "streak_keeper", icon: "flame", label: "Streak Keeper", earned: input.streak >= 3 },
  ];
}
