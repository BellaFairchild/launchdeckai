export interface LaunchResource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}

export const RESOURCE_CATEGORIES = [
  "All",
  "App Store",
  "Google Play",
  "Legal & Privacy",
  "Marketing",
  "Beta Testing",
  "Analytics",
  "Monetization",
  "Design",
  "AI Tools",
] as const;

/** A small curated starter set (Docs/06). Expandable; "Saved" comes with backend. */
export const LAUNCH_RESOURCES: LaunchResource[] = [
  { id: "r1", title: "App Store Review Guidelines", description: "Apple's rules for approval.", category: "App Store", url: "https://developer.apple.com/app-store/review/guidelines/" },
  { id: "r2", title: "App Store Connect Help", description: "Manage your iOS listing & builds.", category: "App Store", url: "https://developer.apple.com/help/app-store-connect/" },
  { id: "r3", title: "Play Console Launch Checklist", description: "Google's pre-launch checklist.", category: "Google Play", url: "https://developer.android.com/distribute/best-practices/launch/launch-checklist" },
  { id: "r4", title: "Play Data Safety Form", description: "Declare your data practices.", category: "Google Play", url: "https://support.google.com/googleplay/android-developer/answer/10787469" },
  { id: "r5", title: "Privacy Policy Generator", description: "Generate a compliant policy.", category: "Legal & Privacy", url: "https://www.termsfeed.com/privacy-policy-generator/" },
  { id: "r6", title: "Apple Privacy Nutrition Labels", description: "What to disclose on the store.", category: "Legal & Privacy", url: "https://developer.apple.com/app-store/app-privacy-details/" },
  { id: "r7", title: "Product Hunt Launch Guide", description: "How to launch well on PH.", category: "Marketing", url: "https://www.producthunt.com/launch" },
  { id: "r8", title: "Indie Hackers", description: "Community + launch playbooks.", category: "Marketing", url: "https://www.indiehackers.com/" },
  { id: "r9", title: "TestFlight", description: "Beta test your iOS app.", category: "Beta Testing", url: "https://developer.apple.com/testflight/" },
  { id: "r10", title: "PostHog", description: "Product analytics for builders.", category: "Analytics", url: "https://posthog.com/" },
  { id: "r11", title: "RevenueCat", description: "In-app subscriptions made easy.", category: "Monetization", url: "https://www.revenuecat.com/" },
  { id: "r12", title: "Figma", description: "Design your screens & assets.", category: "Design", url: "https://www.figma.com/" },
  { id: "r13", title: "Claude", description: "AI help for copy & strategy.", category: "AI Tools", url: "https://claude.ai/" },
];
