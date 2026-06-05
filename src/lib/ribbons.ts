export interface RibbonInput {
  completedMilestones: number;
  forgedAssets: number;
  signalsReady: number;
  streak: number;
}

export interface Ribbon {
  id: "first_launch" | "forge_master" | "comms_online" | "streak_keeper";
  icon: string;
  label: string;
  earned: boolean;
}

export function deriveRibbons(input: RibbonInput): Ribbon[] {
  return [
    { id: "first_launch", icon: "🚀", label: "First Launch", earned: input.completedMilestones >= 1 },
    { id: "forge_master", icon: "🔨", label: "Forge Master", earned: input.forgedAssets >= 3 },
    { id: "comms_online", icon: "📡", label: "Comms Online", earned: input.signalsReady >= 1 },
    { id: "streak_keeper", icon: "🔥", label: "Streak Keeper", earned: input.streak >= 3 },
  ];
}
