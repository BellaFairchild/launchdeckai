export type Plan = "cadet" | "commander" | "admiral";

export interface User {
  clerkId: string;
  email: string;
  displayName: string;
  plan: Plan;
  fuelBalance: number;
  currentStreak: number;
  level: number;
}

export interface Mission {
  id: string;
  appName: string;
  appDescription: string;
  oneLiner: string;
  targetAudience: string;
  platform: "ios" | "android" | "both";
  launchDate: number;
  stage: "building" | "testing" | "store_prep" | "ready_to_submit";
  status: "active" | "launched" | "archived";
  readinessScore: number;
}

export interface Milestone {
  id: string;
  title: string;
  category: "foundation" | "assets" | "store" | "marketing" | "launch";
  completed: boolean;
  requiredPlan: Plan;
  status?: "cleared" | "in_prep" | "scheduled";
  date?: string;
  isLocked?: boolean;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  status: "completed" | "active" | "scheduled";
  date?: string;
  isLocked?: boolean;
  dueDate?: string;
}

export interface BetaTestingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  tag: string;
}

export const BETA_TEST_CHECKLIST_TEMPLATE: BetaTestingTask[] = [
  { id: "beta_1", title: "Set up TestFlight/Play Console Internal Testing", description: "Deploy initial build and invite internal team or trusted users.", completed: false, priority: "High", tag: "STAGING" },
  { id: "beta_2", title: "Configure Crashlytics & Real-time Telemetry", description: "Set up tools like Firebase Crashlytics to catch bugs before external testers do.", completed: false, priority: "High", tag: "TELEMETRY" },
  { id: "beta_3", title: "Create Feedback Submission Channels", description: "Provide a simple form or automated in-app channel for bug reports and ratings.", completed: false, priority: "Medium", tag: "FEEDBACK" },
  { id: "beta_4", title: "Distribute Tester Invitations (First 100 users)", description: "Invite early access waitlist founders and external audiences to download.", completed: false, priority: "Medium", tag: "OUTREACH" },
  { id: "beta_5", title: "Analyze Testing Sessions & Prepare Hotfix v1.0.1", description: "Consolidate active crash issues and formulate fix patches promptly.", completed: false, priority: "Low", tag: "HOTFIX" }
];

export interface Asset {
  id: string;
  type: string;
  title: string;
  status: "not_loaded" | "in_prep" | "needs_clearance" | "flight_ready" | "cleared";
  category: "app_store" | "social" | "media" | "pr" | "legal" | "files";
}

export const MOCK_MILESTONES: Milestone[] = [
  { id: "ms_1", title: "Name your app", category: "foundation", completed: true, requiredPlan: "cadet", status: "cleared", date: "T-28", description: "Choose a memorable and clear name for your application." },
  { id: "ms_2", title: "Write your one-liner", category: "foundation", completed: true, requiredPlan: "cadet", status: "cleared", date: "T-28", description: "Craft a single sentence that explains the exact value of your app." },
  { id: "ms_3", title: "Upload screenshots (min 3)", category: "assets", completed: false, requiredPlan: "cadet", status: "in_prep", description: "Get your app store visuals ready to show off your interface." },
  { id: "ms_4", title: "Generate Video Script", category: "marketing", completed: false, requiredPlan: "commander", status: "scheduled", isLocked: true, description: "Launch with a high-conversion TikTok hook and voiceover script." },
  { id: "ms_5", title: "Mark Mission as Launched", category: "launch", completed: false, requiredPlan: "cadet", status: "scheduled", description: "The final step to complete your mission and celebrate Blastoff." },
];

// Mock Data
export const MOCK_USER: User = {
  clerkId: "user_123",
  email: "founder@indiehacker.com",
  displayName: "Indie Founder",
  plan: "cadet",
  fuelBalance: 420,
  currentStreak: 3,
  level: 4,
};

export const MOCK_MISSION: Mission = {
  id: "m_1",
  appName: "FocusFlow",
  appDescription: "The calmest way to track your daily progress and avoid burnout.",
  oneLiner: "Mindful task tracking for overwhelmed builders.",
  targetAudience: "Solo founders, indie hackers, and freelancers",
  platform: "ios",
  launchDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // T-14
  stage: "store_prep",
  status: "active",
  readinessScore: 68,
};

export const MOCK_TASKS: Task[] = [
  { id: "t_1", title: "Upload your logo", status: "completed", date: "Today" },
  { id: "t_2", title: "Write your store description", status: "active", dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() },
  { id: "t_3", title: "Generate Social Media Blast", status: "scheduled", isLocked: true },
];

export const MOCK_ASSETS: Asset[] = [
  { id: "a_1", title: "App Store Screenshots", type: "screenshots", status: "not_loaded", category: "app_store" },
  { id: "a_2", title: "Store Description", type: "app_store_copy", status: "in_prep", category: "app_store" },
  { id: "a_3", title: "Email Teaser", type: "email_sequence", status: "flight_ready", category: "pr" },
  { id: "a_4", title: "Privacy Policy", type: "privacy_tos", status: "flight_ready", category: "legal" },
  { id: "a_5", title: "Launch Video Script", type: "video_script", status: "needs_clearance", category: "media" },
  { id: "a_6", title: "X/Twitter Thread", type: "social_blast", status: "cleared", category: "social" },
];
