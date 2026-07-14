export const SALES_COPY = {
  tagline: "Your AI-Powered Launch Deck",
  hero: {
    eyebrow: "Early access · App launch clarity",
    headline: "Your launch doesn't have to feel like",
    headlineEmphasis: "guesswork.",
    subhead:
      "LaunchDeckAI turns launch confusion into launch readiness — with Astro coaching, guided Blueprints, and a Signal Deck that shows you the next move without the whole mountain at once.",
    audience:
      "For indie React Native, Flutter, and solo founders shipping their first app.",
    primaryCta: "Join the waitlist",
    secondaryCta: "See how it works",
  },
  trust: {
    reassurance: "No noise, just your next move toward launch.",
    badges: [
      { label: "React Native", icon: "/icons/react.png" },
      { label: "Flutter", icon: "/icons/smartphone.png" },
      { label: "App Store", icon: "/icons/app-store-platform.png" },
      { label: "Google Play", icon: "/icons/play-store-platform.png" },
    ],
  },
  problem: {
    title: "You built the app. Now you're staring at the mountain.",
    cards: [
      {
        title: "Store requirements feel like a maze",
        body: "Screenshots, metadata, privacy policies — every platform wants something different.",
      },
      {
        title: "Marketing feels vague",
        body: "You know you should promote, but what to post, when, and where?",
      },
      {
        title: "Progress is invisible",
        body: "Without a clear next move, launch prep becomes late-night anxiety.",
      },
    ],
    relief: {
      title: "LaunchDeckAI is relief, not another checklist.",
      body: "One calm mission control that shows your next move, tracks readiness, and keeps Astro in your ear until launch day.",
    },
  },
  features: {
    title: "Everything in one launch world",
    subtitle:
      "Deck, Missions, Blueprints, Foundry, Cargo Bay, and Signal Deck — one coherent system for first-time app creators.",
    pillars: [
      {
        id: "deck",
        name: "The Deck",
        icon: "/icons/deck-blue.png",
        description:
          "Your mission control home. See readiness at a glance, fuel remaining, and the single next move that matters right now.",
      },
      {
        id: "missions",
        name: "Missions",
        icon: "/icons/missions.png",
        description:
          "Structured launch projects with milestones you can actually finish. Progress you can feel, not a endless todo list.",
      },
      {
        id: "blueprints",
        name: "Blueprints",
        icon: "/icons/blueprints-blue.png",
        description:
          "Guided forms for store listings, privacy policies, and launch assets — one clear field at a time with Astro coaching.",
      },
      {
        id: "foundry",
        name: "The Foundry",
        icon: "/icons/foundry-blue.png",
        description:
          "AI asset generation for subtitles, descriptions, screenshots copy, and promotional content — forge what's missing.",
      },
      {
        id: "cargo",
        name: "Cargo Bay",
        icon: "/icons/cargo.png",
        description:
          "Your asset vault. Every generated file, uploaded screenshot, and launch document in one organized hangar.",
      },
      {
        id: "signal",
        name: "Signal Deck",
        icon: "/icons/signal.png",
        description:
          "A 16-step promotional timeline. Know exactly what to post, when, and where — stop scrambling before launch.",
      },
    ],
  },
  showcase: {
    title: "See it in action",
    items: [
      {
        id: "deck",
        title: "See the next move",
        body: "Open the Deck and know exactly where you stand — readiness ring, fuel gauge, and your highest-priority milestone.",
        shot: "deck" as const,
      },
      {
        id: "foundry",
        title: "Forge what's missing",
        body: "Astro drafts App Store subtitles, descriptions, and promotional copy while you focus on shipping.",
        shot: "foundry" as const,
      },
      {
        id: "signal",
        title: "Stage the signal",
        body: "Your 16-step promotional timeline with signal bars showing what's ready, in progress, or needs attention.",
        shot: "signal" as const,
      },
    ],
  },
  howItWorks: {
    title: "Progress you can feel",
    steps: [
      {
        number: "01",
        title: "Start a Mission",
        body: "Tell LaunchDeckAI about your app. Your Deck becomes mission control with a readiness baseline.",
      },
      {
        number: "02",
        title: "Follow Blueprints",
        body: "Complete guided forms one field at a time. Astro coaches you through store listings and launch assets.",
      },
      {
        number: "03",
        title: "Launch with Signal Deck",
        body: "Stage your promotional timeline. Export your Signal Pack when you're ready to go live.",
      },
    ],
  },
  roadmap: {
    title: "Mission Roadmap",
    subtitle: "What's live now and what's coming next on the launch deck.",
    phases: [
      {
        phase: "Now" as const,
        items: [
          "Guided Blueprints for store listings",
          "AI Foundry asset generation",
          "16-step Signal Deck timeline",
          "Cargo Bay asset vault",
          "Astro coaching & Copilot",
        ],
      },
      {
        phase: "Next" as const,
        items: [
          "Signal Pack ZIP export",
          "Custom Signal Deck slots",
          "Web dashboard companion",
          "PDF mission reports",
        ],
      },
      {
        phase: "Later" as const,
        items: [
          "Public Launch Deck pages",
          "Team missions",
          "Direct social scheduling",
          "Advanced analytics",
          "Full automation (Zapier, Make, n8n)",
        ],
      },
    ],
  },
  pricing: {
    title: "Start free as a Cadet",
    subtitle:
      "Get organized and follow your first Mission at no cost. Upgrade when you're ready to export and go all-in on launch.",
    disclaimer:
      "Pricing shown for planning. Checkout opens when the app launches.",
    toggleMonthly: "Monthly",
    toggleYearly: "Yearly",
  },
  faq: {
    title: "Questions from the flight deck",
    astroCallout:
      "Still unsure? Astro's here to walk you through it — no pressure, no jargon.",
    items: [
      {
        question: "Who is LaunchDeckAI for?",
        answer:
          "First-time mobile app creators preparing for App Store or Google Play — indie React Native, Flutter, and no-code builders who built the app but feel overwhelmed by launch prep.",
      },
      {
        question: "Do I need a finished app to start?",
        answer:
          "No. Start a Mission as soon as you have a clear app idea. Blueprints and the Signal Deck help you prepare store assets and promotional content alongside development.",
      },
      {
        question: "What is Fuel?",
        answer:
          "Fuel powers AI generations in the Foundry and Astro coaching sessions. Cadets get a daily drip; Commander and Admiral tiers include monthly Fuel allowances.",
      },
      {
        question: "Can I export my launch materials?",
        answer:
          "Commander and Admiral tiers include Signal Pack ZIP export — your full promotional timeline, copy, and assets bundled for launch day.",
      },
      {
        question: "When does checkout open?",
        answer:
          "We're in early access. Join the waitlist and we'll reach out when LaunchDeckAI opens its doors — no noise, just your next move toward launch.",
      },
    ],
  },
  finalCta: {
    title: "Ready when you are, Commander.",
    body: "Join the early access list. We'll reach out when LaunchDeckAI opens its doors — no noise, just your next move toward launch.",
  },
} as const;

export type ShowcaseShotId = (typeof SALES_COPY.showcase.items)[number]["shot"];

export const PROMO_VARIANTS = [
  {
    id: "mission-control",
    name: "Mission Control",
    description:
      "Immersive cinematic layout — full-bleed hero, floating phone mock, vertical timeline.",
    href: "/promo/mission-control",
    preview: "/images/hero-bg.jpg",
  },
  {
    id: "bento",
    name: "Bento Editorial",
    description:
      "Modern bento grid — tile-based hero, mixed icon & mockup features, comparison matrix.",
    href: "/promo/bento",
    preview: "/images/star-hero-bg.jpg",
  },
  {
    id: "classic",
    name: "Long-form Classic",
    description:
      "Centered narrative — stacked screenshots, stepped how-it-works, classic pricing columns.",
    href: "/promo/classic",
    preview: "/images/hero-bg.jpg",
  },
] as const;
