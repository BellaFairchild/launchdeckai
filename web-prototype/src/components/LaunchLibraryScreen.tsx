import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Shield, 
  Rocket, 
  Search, 
  Bookmark, 
  ExternalLink, 
  CheckSquare, 
  BarChart3, 
  Palette, 
  Megaphone, 
  Check, 
  ChevronRight, 
  X, 
  BookmarkCheck, 
  ArrowUpRight, 
  Info,
  SlidersHorizontal,
  Compass,
  Star
} from 'lucide-react';
import { useToast } from './ToastContext';
import { playClick, playNavigate, playSuccess } from '../lib/audio';

// Standard Linking representation for static HTML routing
const Linking = {
  openURL: (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noreferrer,noopener');
    }
  }
};

function escapeRegExp(val: string) {
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, query: string) {
  if (!query || !query.trim()) return <>{text}</>;
  const cleanQuery = query.trim();
  const regex = new RegExp(`(${escapeRegExp(cleanQuery)})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === cleanQuery.toLowerCase() ? (
          <mark key={i} className="bg-[#14B8A6]/30 text-[#2dd4bf] font-extrabold rounded-sm px-0.5 style-none decoration-none">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export type LaunchResource = {
  id: string;
  title: string;
  description: string;
  url: string;
  provider: "Apple" | "Google" | "Firebase" | "Sentry" | "Product Hunt" | "LaunchDeckAI";
  category:
    | "App Store & Play Store"
    | "Legal & Compliance"
    | "Store Listing Assets"
    | "Beta Testing & QA"
    | "Analytics & Stability"
    | "Design Systems"
    | "Launch Marketing";
  platform: "iOS" | "Android" | "Cross-platform";
  phase:
    | "App Info"
    | "App Store"
    | "Legal & Compliance"
    | "Marketing"
    | "Beta Testing"
    | "Pre Launch"
    | "Launch Day"
    | "Post-Launch";
  type: "Guide" | "Checklist" | "Policy" | "Tool" | "Template";
  isOfficial: boolean;
  isRequired: boolean;
  estimatedReadMinutes: number;
  tags: string[];
};

// 24 masterfully curated seed resources with supportive, friendly human-written descriptions
export const launchResources: LaunchResource[] = [
  {
    id: "apple-review-guidelines",
    title: "Apple App Review Guidelines",
    description: "Official guide for preparing your app before submission and understanding approval rules.",
    url: "https://developer.apple.com/app-store/review/guidelines/",
    provider: "Apple",
    category: "App Store & Play Store",
    platform: "iOS",
    phase: "App Store",
    type: "Policy",
    isOfficial: true,
    isRequired: true,
    estimatedReadMinutes: 15,
    tags: ["Guidelines", "Review", "App Store", "Policy", "Mandatory"]
  },
  {
    id: "apple-submit-app",
    title: "Submitting to the App Store",
    description: "A friendly step-by-step guide to uploading your build, configuration inside App Store Connect, and final submission.",
    url: "https://developer.apple.com/app-store/submitting/",
    provider: "Apple",
    category: "App Store & Play Store",
    platform: "iOS",
    phase: "App Store",
    type: "Guide",
    isOfficial: true,
    isRequired: true,
    estimatedReadMinutes: 12,
    tags: ["Builds", "Xcode", "Bundles", "Apple", "Release"]
  },
  {
    id: "apple-app-privacy",
    title: "Apple App Privacy Details",
    description: "Helps you declare your app's privacy practices, tracking data, and safety disclosures accurately on your product page.",
    url: "https://developer.apple.com/app-store/app-privacy-details/",
    provider: "Apple",
    category: "Legal & Compliance",
    platform: "iOS",
    phase: "Legal & Compliance",
    type: "Guide",
    isOfficial: true,
    isRequired: true,
    estimatedReadMinutes: 8,
    tags: ["Privacy", "Laws", "Cookies", "Apple", "Required"]
  },
  {
    id: "google-play-review",
    title: "Google Play Prepare Your App for Review",
    description: "A step-by-step console guide to avoid common review rejections and declare target audience metrics.",
    url: "https://support.google.com/googleplay/android-developer/answer/9859455",
    provider: "Google",
    category: "App Store & Play Store",
    platform: "Android",
    phase: "Pre Launch",
    type: "Checklist",
    isOfficial: true,
    isRequired: true,
    estimatedReadMinutes: 10,
    tags: ["Play Console", "Rules", "Safety", "Android", "Checklist"]
  },
  {
    id: "google-play-data-safety",
    title: "Google Play Data Safety",
    description: "Helps you easily complete the Play Console privacy and data safety questionnaire.",
    url: "https://support.google.com/googleplay/android-developer/answer/10787469",
    provider: "Google",
    category: "Legal & Compliance",
    platform: "Android",
    phase: "Legal & Compliance",
    type: "Guide",
    isOfficial: true,
    isRequired: true,
    estimatedReadMinutes: 9,
    tags: ["Data Safety", "Rules", "Security", "Android", "Required"]
  },
  {
    id: "google-play-developer-policy",
    title: "Google Play Developer Policy Center",
    description: "Our simplified breakdown of the Play Store safety, pricing, and content restrictions to keep your account safe.",
    url: "https://play.google/developer-content-policy/",
    provider: "Google",
    category: "Legal & Compliance",
    platform: "Android",
    phase: "Legal & Compliance",
    type: "Policy",
    isOfficial: true,
    isRequired: true,
    estimatedReadMinutes: 14,
    tags: ["Policy", "Developer Rules", "Security", "Android"]
  },
  {
    id: "apple-product-page",
    title: "Apple Product Page Design",
    description: "Curated design tactics for screenshots, descriptions, and app icon elements to get more organic downloads.",
    url: "https://developer.apple.com/app-store/product-page/",
    provider: "Apple",
    category: "Store Listing Assets",
    platform: "iOS",
    phase: "App Info",
    type: "Guide",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 6,
    tags: ["ASO", "Assets", "Product Page", "Metadata", "Marketing"]
  },
  {
    id: "apple-product-page-optimization",
    title: "Product Page A/B Testing",
    description: "Official guide for creating custom live tests to find out which screenshot layouts convert best.",
    url: "https://developer.apple.com/app-store/product-page-optimization/",
    provider: "Apple",
    category: "Store Listing Assets",
    platform: "iOS",
    phase: "Marketing",
    type: "Tool",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 8,
    tags: ["A/B Testing", "Experiments", "Screenshots", "ASO"]
  },
  {
    id: "apple-app-previews",
    title: "Apple App Store Video Previews",
    description: "Format and quality rules for adding video previews that showcase your app's main interactions in action.",
    url: "https://developer.apple.com/app-store/app-previews/",
    provider: "Apple",
    category: "Store Listing Assets",
    platform: "iOS",
    phase: "App Info",
    type: "Guide",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 5,
    tags: ["Video Previews", "Clips", "Specs", "Promo", "iOS"]
  },
  {
    id: "google-store-listing",
    title: "Google Play Store Listing",
    description: "Learn how to showcase your app features, upload key banners, and translate metadata for localized regions.",
    url: "https://support.google.com/googleplay/android-developer/answer/13393723",
    provider: "Google",
    category: "Store Listing Assets",
    platform: "Android",
    phase: "App Info",
    type: "Guide",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 7,
    tags: ["ASO", "Play Store", "Listing", "Assets"]
  },
  {
    id: "google-pre-launch-reports",
    title: "Google Play Pre-Launch Testing",
    description: "How to use automated lab reports to catch crash bugs and layout problems across multiple real Android devices.",
    url: "https://support.google.com/googleplay/android-developer/answer/9842757",
    provider: "Google",
    category: "Beta Testing & QA",
    platform: "Android",
    phase: "Beta Testing",
    type: "Tool",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 8,
    tags: ["Automated Tests", "Reports", "Beta Console", "QA"]
  },
  {
    id: "android-core-app-quality",
    title: "Android Core App Quality Guidelines",
    description: "A simple quality check to ensure your gestures, layout scaling, and loading state transitions feel right.",
    url: "https://developer.android.com/docs/quality-guidelines/core-app-quality",
    provider: "Google",
    category: "Beta Testing & QA",
    platform: "Android",
    phase: "Beta Testing",
    type: "Guide",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 11,
    tags: ["Standards", "Responsive", "Layout", "Android", "Quality"]
  },
  {
    id: "firebase-test-lab",
    title: "Firebase Test Lab Cloud Rules",
    description: "Simulates real user behavior with automated crawlers to check your app performance on multiple screen sizes.",
    url: "https://firebase.google.com/docs/test-lab",
    provider: "Firebase",
    category: "Beta Testing & QA",
    platform: "Cross-platform",
    phase: "Beta Testing",
    type: "Tool",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 8,
    tags: ["Firebase", "Matrix", "Cloud Testing", "Robo Tests"]
  },
  {
    id: "firebase-crashlytics",
    title: "Crashlytics Analytics Config",
    description: "Keep your app stable by setting up real-time crash reporting alerts and detailed error logs from actual users.",
    url: "https://firebase.google.com/docs/crashlytics",
    provider: "Firebase",
    category: "Analytics & Stability",
    platform: "Cross-platform",
    phase: "Post-Launch",
    type: "Tool",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 9,
    tags: ["Telemetry", "Crashes", "Firebase", "Health", "Analytics"]
  },
  {
    id: "sentry-react-native",
    title: "Sentry Performance Monitor",
    description: "Enables real-time alerts for slow screens, API timeouts, and JS error stacks in production builds.",
    url: "https://sentry.io/for/react-native/",
    provider: "Sentry",
    category: "Analytics & Stability",
    platform: "Cross-platform",
    phase: "Post-Launch",
    type: "Tool",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 10,
    tags: ["Sentry", "Bugs", "Sourcemaps", "Monitoring"]
  },
  {
    id: "apple-human-interface-guidelines",
    title: "Apple Human Interface Guidelines",
    description: "Official design spec to make your app's typography, navigation bars, widgets, and gestures native to iOS.",
    url: "https://developer.apple.com/design/human-interface-guidelines",
    provider: "Apple",
    category: "Design Systems",
    platform: "iOS",
    phase: "App Info",
    type: "Guide",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 14,
    tags: ["Design spec", "Guidelines", "iOS", "Aesthetics", "Apple"]
  },
  {
    id: "apple-design-resources",
    title: "iOS Figma UI Kits & Templates",
    description: "Download pre-compiled Figma templates containing standard menus and vector frame templates.",
    url: "https://developer.apple.com/design/resources/",
    provider: "Apple",
    category: "Design Systems",
    platform: "iOS",
    phase: "App Info",
    type: "Template",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 5,
    tags: ["Figma Kits", "Mockups", "Assets", "Apple"]
  },
  {
    id: "material-design-3",
    title: "Android Material 3 Themes",
    description: "Spec overview for setting up cohesive styling, accent colors, and responsive container grids on Android.",
    url: "https://m3.material.io/",
    provider: "Google",
    category: "Design Systems",
    platform: "Android",
    phase: "App Info",
    type: "Guide",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 11,
    tags: ["M3", "Android", "Dynamic Colors", "Theming"]
  },
  {
    id: "product-hunt-launch-guide",
    title: "Product Hunt Launch Playbook",
    description: "Practical scheduling, outreach, and post-writing templates to achieve a top spot on your product hunt day.",
    url: "https://www.producthunt.com/launch",
    provider: "Product Hunt",
    category: "Launch Marketing",
    platform: "Cross-platform",
    phase: "Launch Day",
    type: "Guide",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 10,
    tags: ["Product Hunt", "Viral Marketing", "Launch day"]
  },
  {
    id: "product-hunt-preparing-for-launch",
    title: "Product Hunt Asset Checklist",
    description: "A friendly calendar checklist to help prepare badges, catchy teasers, and discount codes.",
    url: "https://www.producthunt.com/launch/preparing-for-launch",
    provider: "Product Hunt",
    category: "Launch Marketing",
    platform: "Cross-platform",
    phase: "Pre Launch",
    type: "Checklist",
    isOfficial: true,
    isRequired: false,
    estimatedReadMinutes: 8,
    tags: ["Pre-Launch", "Strategy", "Marketing", "Checklist"]
  },
  {
    id: "launchday-checklist",
    title: "Launch Day Sequence Checklist",
    description: "A cohesive 12-checkpoint routine covering system telemetry, server load, and live socials.",
    url: "launchdeckai://template/launch-day-checklist",
    provider: "LaunchDeckAI",
    category: "Launch Marketing",
    platform: "Cross-platform",
    phase: "Launch Day",
    type: "Checklist",
    isOfficial: false,
    isRequired: false,
    estimatedReadMinutes: 5,
    tags: ["Team coordination", "Release Check", "Internal"]
  },
  {
    id: "presskit-template",
    title: "Your Complete Press Kit Bundle",
    description: "Elegantly structured press templates ready to modify with your logos, team bio, and feature reviews.",
    url: "launchdeckai://template/press-kit",
    provider: "LaunchDeckAI",
    category: "Launch Marketing",
    platform: "Cross-platform",
    phase: "Pre Launch",
    type: "Template",
    isOfficial: false,
    isRequired: false,
    estimatedReadMinutes: 5,
    tags: ["Press Release", "Templates", "Kits", "Boilerplate", "Assets"]
  },
  {
    id: "waitlist-email-templates",
    title: "Waitlist Engagement Campaign Templates",
    description: "Pre-composed email sequences designed to keep early subscribers excited and convert them at launch.",
    url: "launchdeckai://template/waitlist-emails",
    provider: "LaunchDeckAI",
    category: "Launch Marketing",
    platform: "Cross-platform",
    phase: "Pre Launch",
    type: "Template",
    isOfficial: false,
    isRequired: false,
    estimatedReadMinutes: 4,
    tags: ["Marketing", "Waitlist", "Copy", "Emails"]
  },
  {
    id: "privacy-policy-template",
    title: "Privacy Policy Compliant Template",
    description: "A compliant policy skeleton detailing required data-safety points suitable for both stores.",
    url: "launchdeckai://template/privacy-policy",
    provider: "LaunchDeckAI",
    category: "Legal & Compliance",
    platform: "Cross-platform",
    phase: "Legal & Compliance",
    type: "Template",
    isOfficial: false,
    isRequired: true,
    estimatedReadMinutes: 6,
    tags: ["Privacy Policy", "Legal Framework", "Compliance", "Required"]
  }
];

// REUSABLE BADGE COMPONENT FOR CLEAN DESIGN RHYTHM
interface BadgeProps {
  id?: string;
  text: string;
  variant: "indigo" | "teal" | "pink" | "wood" | "muted" | "red" | "emerald";
}

export function Badge({ id, text, variant }: BadgeProps) {
  const baseStyle = "text-[8.5px] font-mono px-2.5 py-0.5 rounded-full font-black select-none whitespace-nowrap uppercase tracking-wider border transition-all duration-300";
  
  const stylesByVariant = {
    indigo: "bg-[#1500FD]/15 text-[#9fa6ff] border-[#1500FD]/35 shadow-[0_0_12px_rgba(21,0,253,0.15)]",
    teal: "bg-[#14B8A6]/15 text-[#2dd4bf] border-[#14B8A6]/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]",
    pink: "bg-[#EC5BAA]/15 text-[#f472b6] border-[#EC5BAA]/30 shadow-[0_0_12px_rgba(236,91,170,0.15)]",
    wood: "bg-[#8B5E3C]/20 text-[#fda4af] border-[#8B5E3C]/40",
    muted: "bg-[#1d244e] text-[#cbd5e1] border-white/5",
    red: "bg-red-500/15 text-red-300 border-red-500/25",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
  };

  return (
    <span id={id || `badge-${text}`} className={`${baseStyle} ${stylesByVariant[variant]}`}>
      {text}
    </span>
  );
}

// THE COMPREHENSIVE REUSABLE BADGE DISPLAY FILTER HELPER
export function ResourceBadges({ resource }: { resource: LaunchResource }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 select-none shrink-0" id={`badges-container-${resource.id}`}>
      {resource.isRequired && (
        <Badge text="Mandatory 🚨" variant="pink" />
      )}
      {resource.isOfficial ? (
        <Badge text="Official Guide" variant="indigo" />
      ) : (
        <Badge text="Community Tool" variant="wood" />
      )}
      <Badge text={resource.platform} variant={resource.platform === "iOS" ? "muted" : resource.platform === "Android" ? "teal" : "indigo"} />
    </div>
  );
}

// 2. REUSABLE LAUNCH LIBRARY HEADER COMPONENT
interface LibraryHeaderProps {
  totalCount: number;
  officialCount: number;
  savedCount: number;
  onBookmarkClick: () => void;
  isFilteringSaved: boolean;
}

export function LaunchLibraryHeader({ totalCount, officialCount, savedCount, onBookmarkClick, isFilteringSaved }: LibraryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 text-left border-b border-white/10 pb-5 relative" id="launch-library-header">
      {/* Dynamic Cockpit Top Ribbon Pin */}
      <div className="absolute top-0 right-3 flex gap-1 select-none pointer-events-none opacity-40">
        <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#1500FD]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#EC5BAA]" />
      </div>

      {/* Immersive, colorful, futuristic banner section */}
      <div className="relative w-full h-[140px] sm:h-[180px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-end">
        <img 
          src="/src/assets/images/cosmic_command_center_1780102718779.png" 
          alt="Cosmic Command Center" 
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.75] contrast-[1.1] scale-105 hover:scale-100 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Subtle overlay gradients for high content readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B1F] via-[#080B1F]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#080B1F] to-transparent" />
        
        {/* Banner content */}
        <div className="relative p-5 w-full flex justify-between items-end gap-3 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 select-none">
              <span className="font-mono text-[9px] text-[#2dd4bf] font-extrabold tracking-widest bg-[#14B8A6]/20 px-2.5 py-0.5 rounded-md border border-[#14B8A6]/30 shadow-[0_0_15px_rgba(20,184,166,0.3)] uppercase">
                LAUNCHDECK INTELLIGENCE
              </span>
            </div>
            
            <h1 className="font-display font-black text-2.5xl sm:text-4xl text-white tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Launch Library
            </h1>
          </div>

          {/* Gorgeous bookmark selector */}
          <button
            onClick={onBookmarkClick}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center text-white shrink-0 relative bg-black/40 backdrop-blur-md shadow-2xl transition-all duration-300 group cursor-pointer active:scale-95 ${
              isFilteringSaved 
                ? "bg-[#14B8A6]/20 border-[#14B8A6] text-[#2dd4bf] shadow-[0_0_15px_rgba(20,184,166,0.3)] mr-0.5" 
                : "border-white/10 hover:border-[#14B8A6]/40 hover:bg-[#15193f]/80 text-[#AAB2D5]"
            }`}
            title="Toggle Saved Bookmarks Filter"
            id="header-saved-bookmark-button"
          >
            <Bookmark className={`w-5 h-5 transition-transform group-hover:scale-110 ${isFilteringSaved ? "text-[#14B8A6] fill-[#14B8A6]" : "text-white group-hover:text-[#14B8A6]"}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full bg-gradient-to-r from-[#EC5BAA] to-[#f472b6] border-2 border-[#080B1F] text-[9px] font-mono font-black text-white flex items-center justify-center px-1 shadow-[0_2px_8px_rgba(236,91,170,0.4)] animate-bounce" />
            )}
          </button>
        </div>
      </div>

      <p className="font-sans text-xs sm:text-sm text-[#cbd5e1]/90 mt-1 leading-relaxed px-1">
        Our masterfully curated database of legal guidelines, app store submission requirements, design assets, and marketing campaigns to prepare your app for its big debut.
      </p>

      {/* Dynamic Stat Chip telemetry bar - Cockpit status monitor */}
      <div className="w-full bg-[#11142e]/70 border border-[#1e2555]/60 p-3 rounded-2xl flex flex-wrap gap-3 items-center justify-between text-xs font-mono select-none" id="stat-chip-container">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#14B8A6] relative flex">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14B8A6] opacity-75" />
          </span>
          <span className="text-[#AAB2D5] text-[9.5px] tracking-widest uppercase font-extrabold">COCKPIT INTEL FEED:</span>
          <span className="text-[#14B8A6] font-black tracking-wider text-[11px]">OPTIMAL</span>
        </div>
        
        <div className="flex items-center gap-3.5 text-[11px] text-[#AAB2D5]/95">
          <div className="flex items-center gap-1 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">
            <span className="text-white font-black">{totalCount}</span>
            <span className="text-[#AAB2D5]/54 text-[10px]">curations</span>
          </div>
          <span className="text-white/10">|</span>
          <div className="flex items-center gap-1 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">
            <span className="text-[#14B8A6] font-black">{officialCount}</span>
            <span className="text-[#AAB2D5]/54 text-[10px]">official</span>
          </div>
          <span className="text-white/10">|</span>
          <div className="flex items-center gap-1 bg-[#EC5BAA]/10 px-2 py-0.5 rounded-md border border-[#EC5BAA]/20">
            <span className="text-[#EC5BAA] font-black">{savedCount}</span>
            <span className="text-[#EC5BAA]/70 text-[10px]">saved</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10.5px] font-sans text-[#AAB2D5]/60 pl-1 select-none leading-none -mt-1.5">
        <Info size={11} className="text-[#14B8A6]" />
        <span>Official resources are marked with <strong className="text-white font-semibold">Official Guide</strong> so you know what rules to trust.</span>
      </div>
    </div>
  );
}

// 3. REUSABLE SEARCH BAR COMPONENT - Easy to tap, high tap target with glowing action inputs
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

const SUGGESTION_CATEGORIES = [
  "App Store & Play Store",
  "Legal & Compliance",
  "Store Listing Assets",
  "Beta Testing & QA",
  "Analytics & Stability",
  "Design Systems",
  "Launch Marketing"
];

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const q = value.trim().toLowerCase();
  const matchingCategories = useMemo(() => {
    return q ? SUGGESTION_CATEGORIES.filter(cat => 
      cat.toLowerCase().includes(q)
    ) : [];
  }, [q]);

  const matchingResources = useMemo(() => {
    return q ? launchResources.filter(res => 
      res.title.toLowerCase().includes(q) ||
      res.tags.some(tag => tag.toLowerCase().includes(q))
    ).slice(0, 4) : [];
  }, [q]);

  const totalLength = matchingCategories.length + matchingResources.length;

  useEffect(() => {
    setFocusedIndex(-1);
  }, [value]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "App Store & Play Store": return Rocket;
      case "Legal & Compliance": return Shield;
      case "Store Listing Assets": return Palette;
      case "Beta Testing & QA": return CheckSquare;
      case "Analytics & Stability": return BarChart3;
      case "Design Systems": return Book;
      case "Launch Marketing": return Megaphone;
      default: return Compass;
    }
  };

  const selectItem = (index: number) => {
    if (index < 0 || index >= totalLength) return;
    if (index < matchingCategories.length) {
      onChange(matchingCategories[index]);
    } else {
      onChange(matchingResources[index - matchingCategories.length].title);
    }
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (totalLength === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % totalLength);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => (prev - 1 + totalLength) % totalLength);
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < totalLength) {
        e.preventDefault();
        selectItem(focusedIndex);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <div className="w-full relative" id="library-search-component">
      <div className="relative flex items-center w-full group">
        <div className="absolute left-4.5 text-[#AAB2D5]/60 flex items-center justify-center pointer-events-none group-focus-within:text-[#14B8A6] transition-colors">
          <Search className="w-4.5 h-4.5" />
        </div>
        <input 
          id="inputs-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search guidelines, privacy compliance, iOS review guidelines, TestFlight..."
          className="w-full h-12 bg-[#0e112a]/90 border border-[#1e2555]/80 rounded-2xl px-5 pl-12 pr-11 text-xs sm:text-sm text-white placeholder-[#AAB2D5]/40 outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6]/20 transition-all font-sans shadow-2xl"
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Slight delay to allow clicked suggestions to register
            setTimeout(() => {
              setIsFocused(false);
            }, 200);
          }}
          onKeyDown={handleKeyDown}
        />
        {value ? (
          <button 
            onClick={() => { playClick(); onChange(""); }}
            className="absolute right-3.5 text-[#AAB2D5]/80 hover:text-white p-1.5 rounded-full hover:bg-white/15 transition-all select-none cursor-pointer"
            title="Clear search text"
          >
            <X size={15} />
          </button>
        ) : (
          <div className="absolute right-4 text-[#AAB2D5]/35 select-none pointer-events-none">
            <SlidersHorizontal size={14} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFocused && value && totalLength > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-[#0c0f2b]/95 border border-[#1e2555] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] z-50 overflow-hidden backdrop-blur-md"
          >
            {/* Category Suggestions */}
            {matchingCategories.length > 0 && (
              <div className="p-2 border-b border-[#1e2555]/60">
                <div className="px-3 py-1 text-[10px] font-mono font-extrabold tracking-widest text-[#14B8A6]/80 uppercase">
                  Matching Categories
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  {matchingCategories.map((cat, idx) => {
                    const Icon = getCategoryIcon(cat);
                    const isSuggestionFocused = idx === focusedIndex;
                    return (
                      <button
                        key={`cat-${cat}`}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents blur before click
                          playClick();
                          onChange(cat);
                          setIsFocused(false);
                        }}
                        className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs text-white transition-all font-sans cursor-pointer group ${
                          isSuggestionFocused ? 'bg-[#1500FD]/35' : 'hover:bg-[#1500FD]/20'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#1500FD]/15 flex items-center justify-center text-[#14B8A6] group-hover:bg-[#14B8A6]/20 transition-all">
                          <Icon size={12} />
                        </div>
                        <div className="flex-1 font-bold">
                          {highlightText(cat, value)}
                        </div>
                        <span className="text-[9px] font-mono tracking-widest text-[#AAB2D5]/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          [ SELECT CATEGORY ]
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resource Suggestions */}
            {matchingResources.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1 text-[10px] font-mono font-extrabold tracking-widest text-[#EC5BAA]/80 uppercase">
                  Matching Guidelines & Checklists
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  {matchingResources.map((res, idx) => {
                    const absoluteIndex = idx + matchingCategories.length;
                    const Icon = getCategoryIcon(res.category);
                    const isSuggestionFocused = absoluteIndex === focusedIndex;
                    return (
                      <button
                        key={`res-${res.id}`}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents blur before click
                          playClick();
                          onChange(res.title);
                          setIsFocused(false);
                        }}
                        className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs text-white transition-all font-sans cursor-pointer group ${
                          isSuggestionFocused ? 'bg-[#EC5BAA]/20' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[#AAB2D5] group-hover:text-white transition-all">
                          <Icon size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-[12px]">
                            {highlightText(res.title, value)}
                          </div>
                          <div className="text-[10px] text-[#AAB2D5]/60 truncate mt-0.5">
                            {res.category} • {res.platform}
                          </div>
                        </div>
                        <ArrowUpRight size={13} className="text-[#AAB2D5]/40 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 4. REUSABLE FILTER CHIP COMPONENT
interface FilterChipProps {
  key?: React.Key;
  id: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function FilterChip({ id, label, isActive, onPress }: FilterChipProps) {
  return (
    <button
      id={`filter-chip-${id}`}
      onClick={() => {
        playClick();
        onPress();
      }}
      className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 border cursor-pointer select-none flex items-center gap-1.5 ${
        isActive 
          ? 'bg-gradient-to-r from-[#1500FD] to-[#14B8A6] border-transparent text-white shadow-[0_4px_16px_rgba(21,0,253,0.3)] scale-[1.04]' 
          : 'bg-[#121535]/50 border-white/5 text-[#AAB2D5] hover:text-white hover:border-white/20'
      }`}
    >
      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      {label}
    </button>
  );
}

// 5. REUSABLE REQUIRED BEFORE LAUNCH CARD - Masterfully designed high-contrast stage block
interface RequiredCardProps {
  onPressCTA: () => void;
  onOpenResource: (url: string) => void;
}

export function RequiredBeforeLaunchCard({ onPressCTA, onOpenResource }: RequiredCardProps) {
  const priorityItems = [
    {
      id: "apple-review-guidelines",
      title: "Apple App Review Guidelines",
      badgeText: "iOS SACRED POLICY",
      url: "https://developer.apple.com/app-store/review/guidelines/",
      time: "15 min"
    },
    {
      id: "google-play-review",
      title: "Google Play Store Pre-Submission review",
      badgeText: "ANDROID VERIFICATION",
      url: "https://support.google.com/googleplay/android-developer/answer/9859455",
      time: "10 min"
    },
    {
      id: "privacy-policy-template",
      title: "Legal Privacy Policy Generator Checklist",
      badgeText: "COMPLIANCE LAWS",
      url: "launchdeckai://template/privacy-policy",
      time: "6 min"
    }
  ];

  return (
    <div 
      className="w-full bg-gradient-to-br from-[#121430] via-[#161a46] to-[#2c1d2e] border border-[#14B8A6]/35 p-6 rounded-3xl shadow-xl relative overflow-hidden text-left mb-4"
      id="required-before-launch"
    >
      {/* Decorative vertical light strip along the side */}
      <div className="absolute top-0 bottom-0 left-0 w-[5px] bg-gradient-to-b from-[#EC5BAA] via-[#14B8A6] to-[#1500FD]" />
      
      {/* Decorative radial top highlight shadow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#14B8A6]/5 blur-[55px] rounded-full pointer-events-none" />

      <div className="flex flex-wrap items-center gap-2 mb-3.5 select-none pl-1">
        <span className="text-sm">🚀</span>
        <span className="font-mono text-[9px] text-[#EC5BAA] font-black tracking-widest uppercase bg-[#EC5BAA]/10 px-2.5 py-0.5 rounded-full border border-[#EC5BAA]/20">
          REQUIRED BEFORE LAUNCH
        </span>
        <span className="text-[9px] text-[#AAB2D5]/70 font-mono tracking-wider uppercase flex items-center gap-1 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
          <span>STAGES: 1 & 2 FIXED DIRECTIVE</span>
        </span>
      </div>

      <h2 className="font-display font-black text-2xl text-white tracking-tight leading-tight pl-1">
        Required Before Launch
      </h2>
      <p className="font-sans text-xs sm:text-sm text-[#cbd5e1] mt-1 pl-1 leading-normal">
        Start here before you submit to the app stores.
      </p>
      <p className="font-sans text-[11.5px] text-[#AAB2D5]/80 leading-relaxed mt-1 mb-5 pl-1">
        These resources help prevent common launch blockers. Completing these modules is crucial to pass store review on the first attempt without rejections.
      </p>

      {/* Priority clickable checklist block with active indicators */}
      <div className="flex flex-col gap-2 mb-5 select-none text-left pl-1" id="required-checklist-block">
        {priorityItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => onOpenResource(item.url)}
            className="flex justify-between items-center p-3.5 bg-[#090b1c]/90 border border-white/5 rounded-2xl hover:border-[#14B8A6] hover:bg-[#11143c] transition-all duration-300 cursor-pointer group shadow-inner"
          >
            <div className="flex-1 min-w-0 pr-3 flex items-center gap-3">
              <div className="w-6.5 h-6.5 rounded-xl bg-[#14B8A6]/10 border border-[#14B8A6]/25 flex items-center justify-center text-[#14B8A6] shrink-0 group-hover:scale-105 group-hover:bg-[#14B8A6]/20 transition-all">
                <Check size={13} className="stroke-[3.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-extrabold text-xs sm:text-[13px] group-hover:text-[#14B8A6] transition-colors truncate">
                    {item.title}
                  </span>
                  <span className="text-[8px] font-mono text-white bg-gradient-to-r from-[#EC5BAA] to-[#f472b6] font-black px-1.5 py-0.5 rounded-md uppercase border border-none tracking-widest">
                    CRITICAL
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-mono text-[#AAB2D5]/50 tracking-widest uppercase font-extrabold">{item.badgeText}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <span className="text-[9.5px] font-mono text-[#14B8A6]/70 group-hover:text-[#14B8A6] font-black tracking-widest transition-colors">ACCESS</span>
              <ArrowUpRight size={14} className="text-[#AAB2D5]/60 group-hover:text-[#14B8A6] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* Primary cockpit CTA action button */}
      <button
        onClick={() => {
          playClick();
          onPressCTA();
        }}
        className="w-full h-11 bg-gradient-to-r from-[#14B8A6] via-[#14B8A6]/80 to-[#1500FD] hover:brightness-115 text-white rounded-2xl font-display font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-[#14B8A6]/15"
      >
        <span>View Required Resources</span>
        <ChevronRight size={15} className="stroke-[3]" />
      </button>
    </div>
  );
}

// 6. REUSABLE CATEGORY CARD COMPONENT - Premium Glass Panel matching styling variables
interface CategoryCardProps {
  key?: React.Key;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
  accent: string;
  resourceCount: number;
  isSelected: boolean;
  onPress: () => void;
  bgImage?: string;
}

export function CategoryCard({ 
  title, 
  description, 
  icon: IconComponent, 
  color, 
  accent, 
  resourceCount, 
  isSelected, 
  onPress,
  bgImage
}: CategoryCardProps) {
  return (
    <button
      onClick={() => {
        playClick();
        onPress();
      }}
      className={`p-4 rounded-2xl text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[145px] border active:scale-95 cursor-pointer select-none ${
        isSelected 
          ? "bg-[#11143c]/95 border-[#14B8A6] shadow-xl shadow-[#14B8A6]/10" 
          : "bg-[#0b0e27]/80 border-white/5 hover:border-[#14B8A6]/45 hover:bg-[#131846] hover:shadow-xl hover:shadow-black/25"
      }`}
      id={`cat-card-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      {/* Immersive background imagery for a premium console dashboard feel */}
      {bgImage && (
        <>
          <img 
            src={bgImage} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.24] brightness-[0.5] mix-blend-screen group-hover:scale-108 group-hover:opacity-[0.38] transition-all duration-700 select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
          {/* Custom vignette gradient shroud */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B1F] via-[#080B1F]/40 to-transparent pointer-events-none" />
        </>
      )}

      {/* Dynamic corner abstract graphics */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.01] rounded-bl-3xl pointer-events-none group-hover:bg-white/[0.03] transition-colors" />

      {/* Decorative mini status ribbon indicator at the bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2.5px] transition-all duration-300 rounded-b-2xl" 
        style={{ 
          background: isSelected ? accent : "transparent",
          opacity: isSelected ? 1 : 0 
        }}
      />
      
      <div className="flex justify-between items-start w-full gap-2 mb-3.5 relative z-10">
        {/* Rounded interactive Icon container with glowing colored shadow */}
        <div 
          className="p-2.5 rounded-xl bg-gradient-to-br from-[#121535] to-[#121535]/40 border border-white/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{ 
            color: accent,
            boxShadow: `0 0 15px ${accent}30`
          }}
        >
          <IconComponent size={16} className="stroke-[2.5]" />
        </div>
        
        {/* Compact count Badge */}
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full shrink-0 select-none group-hover:border-[#14B8A6]/40 transition-colors">
          <span className="font-mono text-[9.5px] text-white font-black">
            {resourceCount}
          </span>
          <span className="text-[8px] text-[#AAB2D5]/70 font-bold uppercase tracking-wider">Guides</span>
        </div>
      </div>

      <div className="w-full text-left relative z-10">
        <h4 className="font-sans font-black text-xs sm:text-[13px] text-white tracking-tight leading-tight mb-1 group-hover:text-[#2dd4bf] transition-colors flex items-center justify-between gap-1">
          <span className="truncate">{title}</span>
          <ChevronRight size={12} className="text-[#AAB2D5]/50 shrink-0 group-hover:translate-x-1 duration-200" />
        </h4>
        <p className="text-[10.5px] text-[#AAB2D5]/80 leading-snug line-clamp-2 pr-0.5 font-sans">
          {description}
        </p>
      </div>
    </button>
  );
}

// 7. REUSABLE RESOURCE CARD COMPONENT - Elegant Glass Card with Tactile Feedback and Brand Color Logos
interface ResourceCardProps {
  key?: React.Key;
  resource: LaunchResource;
  isSaved: boolean;
  isBlueprint: boolean;
  onToggleSave: () => void;
  onToggleBlueprint: () => void;
  onOpen: () => void;
  searchQuery?: string;
}

export function ResourceCard({ 
  resource, 
  isSaved, 
  isBlueprint, 
  onToggleSave, 
  onToggleBlueprint, 
  onOpen,
  searchQuery = ""
}: ResourceCardProps) {
  // Generates dedicated branding highlights for publishers (Vaporized plain initials with glowing color vectors)
  const getBrandingMeta = (provider: string) => {
    switch (provider) {
      case "Apple":
        return {
          logo: (
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-current text-white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.68-1.12 1.82-.98 2.92.1.25.07.13.51.13.91 0 1.98-.56 2.3-1.44z"/>
            </svg>
          ),
          bg: "bg-slate-350/[0.12] border-slate-350/25 shadow-[0_0_12px_rgba(255,255,255,0.06)]"
        };
      case "Google":
        return {
          logo: (
            <svg viewBox="0 0 24 24" className="w-[13px] h-[13px]">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          ),
          bg: "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_12px_rgba(20,184,166,0.06)]"
        };
      case "Firebase":
        return {
          logo: (
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]">
              <path d="M3.89 15.1l.03-.02L11 2.21a.5.5 0 01.88-.03l2.84 4.88zM18.77 15.3l-.04-.04-4.85-9.15a.5.5 0 00-.83-.07L3.6 15.25a.5.5 0 00-.03.49l2.89 4.39a.5.5 0 00.61.16L18.7 15.7a.5.5 0 00.07-.4z" fill="#FFA611"/>
              <path d="M12.44 1.3c-.22-.38-.77-.38-.99 0L4.31 14.12l8.13-11.44zm.01 11.4l5.3 9.07c.22.38-.1.85-.53.76l-9.92-2.1c-.24-.05-.44-.2-.55-.42L3.38 15.2l9.07-2.5z" fill="#FFA611" />
            </svg>
          ),
          bg: "bg-amber-500/10 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.06)]"
        };
      case "Sentry":
        return {
          logo: (
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-current text-[#EC5BAA]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm-5 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm9.5-6c-.82 0-1.58.26-2.21.7l-1.42-1.42C14.63 9.17 15 8.63 15 8c0-1.66-1.34-3-3-3S9 6.34 9 8c0 .63.37 1.17.91 1.48L8.49 10.9c-.63-.44-1.39-.7-2.21-.7C4.46 10.2 3.1 11.56 3.1 13.3c0 1.74 1.36 3.1 3.18 3.1.82 0 1.58-.26 2.21-.7l1.42 1.42C9.37 17.65 9 18.19 9 18.8c0 1.66 1.34 3 3 3s3-1.34 3-3c0-.61-.37-1.15-.91-1.46l1.42-1.42c.63.44 1.39.7 2.21.7 1.82 0 3.18-1.36 3.18-3.1 0-1.74-1.36-3.12-3.18-3.12zM12 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
          ),
          bg: "bg-[#EC5BAA]/10 border-[#EC5BAA]/25 shadow-[0_0_12px_rgba(236,91,170,0.06)]"
        };
      case "Product Hunt":
        return {
          logo: (
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-current text-orange-500">
              <path d="M12.5 1C6.15 1 1 6.15 1 12.5S6.15 24 12.5 24 24 18.85 24 12.5 18.85 1 12.5 1zm1.18 15.68h-2.12v-3.79H9.38v3.79H7.26V7.32h4.5c2.4 0 3.65 1.15 3.65 3.12 0 2.21-1.33 3.06-2.73 3.24v.05c1.4.15 2.1 1.05 2.1 2.37v.58zm-2.12-5.71H9.38v-2.3h2.18c.95 0 1.5.4 1.5 1.15 0 .76-.55 1.15-1.5 1.15z"/>
            </svg>
          ),
          bg: "bg-orange-500/10 border-orange-500/25 shadow-[0_0_12px_rgba(249,115,22,0.06)]"
        };
      default:
        return {
          logo: <Rocket size={14} className="text-[#2dd4bf]" />,
          bg: "bg-[#1500FD]/10 border-[#1500FD]/25 shadow-[0_0_12px_rgba(21,0,253,0.06)]"
        };
    }
  };

  const brand = getBrandingMeta(resource.provider);

  // Platform-specific premium shadow and glow config
  const platformShadowColor =
    resource.platform === "iOS"
      ? "rgba(11, 132, 255, 0.06)"
      : resource.platform === "Android"
        ? "rgba(61, 220, 132, 0.05)"
        : "rgba(139, 92, 246, 0.06)";

  const platformHoverShadowColor =
    resource.platform === "iOS"
      ? "rgba(11, 132, 255, 0.24)"
      : resource.platform === "Android"
        ? "rgba(61, 220, 132, 0.22)"
        : "rgba(139, 92, 246, 0.24)";

  const hoverBorderClass =
    resource.platform === "iOS"
      ? "hover:border-[#0b84ff]/50"
      : resource.platform === "Android"
        ? "hover:border-[#3DDC84]/50"
        : "hover:border-[#8B5CF6]/50";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.015, 
        y: -1.5,
        boxShadow: `0 12px 30px -4px ${platformHoverShadowColor}, 0 4px 12px -2px ${platformHoverShadowColor}`
      }}
      style={{
        boxShadow: `0 4px 12px -2px ${platformShadowColor}, 0 1px 3px -1px ${platformShadowColor}`
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`w-full bg-[#0d1028]/95 border border-[#1e2555]/50 ${hoverBorderClass} p-4 sm:p-5 rounded-2xl flex flex-col transition-all duration-300 relative overflow-hidden text-left`}
    >
      {/* Neon left-edge bar representing mandatory state */}
      <div className={`absolute top-0 bottom-0 left-0 w-[4.5px] transition-all duration-300 ${
        resource.isRequired 
          ? 'bg-gradient-to-b from-[#EC5BAA] to-[#EC5BAA]/50 shadow-[0_0_12px_#EC5BAA]' 
          : isSaved 
            ? 'bg-gradient-to-b from-[#14B8A6] to-[#14B8A6]/50 shadow-[0_0_12px_#14B8A6]' 
            : 'bg-white/[0.08]'
      }`} />

      {/* Structured top label with Brand Logo & Badges */}
      <div className="flex items-start justify-between gap-3 mb-3.5 pl-2.5 w-full">
        <ResourceBadges resource={resource} />
      </div>

      {/* Main Core Presentation block with Brand Avatar */}
      <div className="flex gap-3.5 pl-2.5 items-start mb-4">
        {/* Brand visual circle avatar with customized glowing vector logos */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border select-none transition-all duration-300 group-hover:scale-105 ${brand.bg}`}>
          {brand.logo}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <h4 className="font-sans font-black text-[14px] sm:text-[15px] text-white hover:text-[#14B8A6] transition-colors leading-snug">
            {highlightText(resource.title, searchQuery)}
          </h4>
          <p className="font-sans text-[11.5px] sm:text-xs text-[#cbd5e1]/85 mt-1 leading-relaxed">
            {highlightText(resource.description, searchQuery)}
          </p>

          {/* Sub context details line */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-[#AAB2D5]/60 font-mono select-none">
            <span className="text-white font-extrabold bg-[#1500FD]/10 border border-[#1500FD]/20 py-0.5 px-2 rounded-md uppercase tracking-widest">
              {resource.type}
            </span>
            <span>•</span>
            <span className="truncate">Phase: <strong className="text-white">{resource.phase}</strong></span>
          </div>
        </div>
      </div>

      {/* Clean Compact Premium Actions Row */}
      <div className="flex items-center gap-2 pt-3.5 border-t border-[#1e2555]/43 mt-auto select-none pl-2.5">
        
        {/* Save/Unsave bookmark toggle button */}
        <button 
          onClick={onToggleSave}
          className={`flex-1 min-h-[38px] px-3.5 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
            isSaved 
              ? "bg-[#14B8A6]/20 text-[#2dd4bf] border-[#14B8A6] shadow-[0_0_12px_rgba(20,184,166,0.15)]" 
              : "bg-transparent border-white/10 text-[#AAB2D5]/90 hover:text-white hover:border-white/20 hover:bg-white/[0.03]"
          }`}
          title={isSaved ? "Remove from saved launch kit" : "Save reference to launch kit"}
        >
          {isSaved ? <BookmarkCheck size={13.5} className="stroke-[2.5]" /> : <Bookmark size={13.5} />}
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>

        {/* Blueprint checklist tasks injector trigger */}
        <button 
          onClick={onToggleBlueprint}
          className={`flex-1 min-h-[38px] px-3.5 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
            isBlueprint 
              ? "bg-[#1500FD]/15 text-[#9fa6ff] border-[#1500FD]/40 shadow-[0_0_12px_rgba(21,0,253,0.1)]" 
              : "bg-transparent border-white/10 text-[#AAB2D5]/90 hover:text-white hover:border-white/20 hover:bg-white/[0.03]"
          }`}
          title={isBlueprint ? "Decheck blueprint map objectives" : "Inject this task guide into your system active blueprint list"}
        >
          <CheckSquare size={13.5} className={isBlueprint ? "text-[#14B8A6]" : "text-[#AAB2D5]/70"} />
          <span>{isBlueprint ? "In Blueprint" : "Add Task"}</span>
        </button>

        {/* External Redirect Trigger Link */}
        <button 
          onClick={onOpen}
          className="min-h-[38px] px-4 bg-[#11142e] border border-white/5 hover:bg-white/5 hover:border-[#14B8A6]/30 text-white rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer active:scale-95 shadow-md"
          title="Open official documentation web link"
        >
          <span>Open</span>
          <ExternalLink size={12} className="text-[#14B8A6]" />
        </button>
      </div>
    </motion.div>
  );
}

// 8. REUSABLE EMPTY STATE COMPONENT
interface EmptyStateProps {
  title: string;
  message: string;
  buttonText: string;
  onPressButton: () => void;
  type: "search" | "saved";
}

export function EmptyState({ title, message, buttonText, onPressButton, type }: EmptyStateProps) {
  return (
    <div 
      className="w-full bg-[#11142e]/60 border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center justify-center select-none shadow-inner" 
      id={`empty-state-${type}`}
    >
      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#121535] to-[#121535]/30 border border-white/10 flex items-center justify-center text-white mb-3.5 shadow-md relative">
        {type === "saved" ? (
          <Bookmark size={22} className="text-[#EC5BAA] rotate-3 animate-pulse" />
        ) : (
          <Search size={22} className="text-[#14B8A6] animate-pulse" />
        )}
      </div>
      
      <h4 className="font-sans font-black text-sm sm:text-base text-white mb-1.5 tracking-tight">
        {title}
      </h4>
      <p className="font-sans text-xs text-[#AAB2D5]/85 max-w-xs mx-auto leading-relaxed mb-4.5">
        {message}
      </p>

      <button
        onClick={() => {
          playSuccess();
          onPressButton();
        }}
        className="h-10 px-5 bg-[#1500FD] hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
      >
        <span>{buttonText}</span>
      </button>
    </div>
  );
}

// MAIN EXPORTED COMPONENT - LAUNCH LIBRARY SCREEN
export function LaunchLibraryScreen() {
  const { addToast } = useToast();

  // Navigation filtering indices
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Local storage bookmarks cache setup (seeding 5 default items for elegant Cockpit synchronization metrics)
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('deck_saved_resources_cache');
      if (stored) {
        return JSON.parse(stored);
      }
      const initialSeed = [
        "apple-review-guidelines", 
        "apple-submit-app", 
        "google-play-review", 
        "google-play-data-safety", 
        "apple-product-page-optimization"
      ];
      localStorage.setItem('deck_saved_resources_cache', JSON.stringify(initialSeed));
      return initialSeed;
    }
    return [];
  });

  // Local storage active blueprints list cache
  const [blueprintIds, setBlueprintIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('deck_blueprint_resources_cache');
      return stored ? JSON.parse(stored) : ["apple-review-guidelines", "google-play-review", "privacy-policy-template"];
    }
    return [];
  });

  // Sync state modifications correctly across storage contexts
  useEffect(() => {
    const syncLocalStorage = () => {
      const storedSaved = localStorage.getItem('deck_saved_resources_cache');
      if (storedSaved) {
        setSavedResourceIds(JSON.parse(storedSaved));
      }
      const storedBlueprints = localStorage.getItem('deck_blueprint_resources_cache');
      if (storedBlueprints) {
        setBlueprintIds(JSON.parse(storedBlueprints));
      }
    };
    window.addEventListener('storage', syncLocalStorage);
    return () => window.removeEventListener('storage', syncLocalStorage);
  }, []);

  // Standard static Category mapping parameters list
  const categoriesList = [
    {
      title: "App Store & Play Store" as const,
      description: "Submission guidelines, review checklists, and publishing requirements.",
      icon: Rocket,
      color: "from-blue-600/20 to-indigo-600/20 shadow-blue-500/5",
      accent: "#1500FD",
      bgImage: "/src/assets/images/mission_flight_path_1780103940827.png"
    },
    {
      title: "Legal & Compliance" as const,
      description: "Privacy policies, data safety forms, GDPR compliance, and legal declarations.",
      icon: Shield,
      color: "from-teal-600/20 to-emerald-600/20 shadow-teal-500/5",
      accent: "#14B8A6",
      bgImage: "/src/assets/images/space_beacons_radar_1780103248903.png"
    },
    {
      title: "Store Listing Assets" as const,
      description: "App screenshot specifications, preview mockups, keywords, and app clips.",
      icon: Palette,
      color: "from-pink-600/20 to-rose-600/20 shadow-rose-500/5",
      accent: "#EC5BAA",
      bgImage: "/src/assets/images/fusion_forge_reactor_1780103223105.png"
    },
    {
      title: "Beta Testing & QA" as const,
      description: "TestFlight channels, Google testing requirements, Robo runs, and pre-launch reports.",
      icon: CheckSquare,
      color: "from-amber-600/20 to-orange-600/20 shadow-amber-500/5",
      accent: "#8B5E3C",
      bgImage: "/src/assets/images/vessels_hangar_bay_1780103205223.png"
    },
    {
      title: "Analytics & Stability" as const,
      description: "Crash reporting plugins, performance tracking tools, and sourcemaps.",
      icon: BarChart3,
      color: "from-purple-600/20 to-violet-600/20 shadow-purple-500/5",
      accent: "#A78BFA",
      bgImage: "/src/assets/images/analytics_stability_1780105169282.png"
    },
    {
      title: "Design Systems" as const,
      description: "Human Interface Guidelines, Material themes, Figma frameworks, and system styling.",
      icon: Book,
      color: "from-cyan-600/20 to-blue-600/20 shadow-cyan-500/5",
      accent: "#14B8A6",
      bgImage: "/src/assets/images/design_systems_1780105190852.png"
    },
    {
      title: "Launch Marketing" as const,
      description: "Product Hunt plans, waitlist systems, press kits, and promotional boilerplates.",
      icon: Megaphone,
      color: "from-pink-600/20 to-rose-600/20 shadow-pink-500/5",
      accent: "#EC5BAA",
      bgImage: "/src/assets/images/launch_marketing_1780105207650.png"
    }
  ];

  // Saved resources kit modifications handler
  const handleToggleSave = (id: string, name: string) => {
    playClick();
    let updated;
    if (savedResourceIds.includes(id)) {
      updated = savedResourceIds.filter((item) => item !== id);
      addToast('Bookmark Removed', `Removed "${name}" from saved list.`);
    } else {
      updated = [...savedResourceIds, id];
      addToast('Bookmark Saved', `Saved "${name}" inside your offline launch kit.`);
    }
    setSavedResourceIds(updated);
    localStorage.setItem('deck_saved_resources_cache', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // Blueprint Objectives additions handler - custom alert warning system
  const handleToggleBlueprint = (id: string, name: string) => {
    playSuccess();
    
    // Explicit requested custom visual behavior of "Add Task" blueprint checklist action
    alert("Added to Blueprint placeholder. Connect this to the Blueprints feature later.");
    
    let updated;
    if (blueprintIds.includes(id)) {
      updated = blueprintIds.filter((item) => item !== id);
      addToast('Blueprint Unregistered', `Removed "${name}" from blueprint targets.`);
    } else {
      updated = [...blueprintIds, id];
      addToast('Blueprint Registered', `Assigned "${name}" as a task in blueprint objectives.`);
    }
    setBlueprintIds(updated);
    localStorage.setItem('deck_blueprint_resources_cache', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleOpenLink = (url: string) => {
    playNavigate();
    if (url.startsWith("launchdeckai://")) {
      alert("The template will open when connected to the templates feature");
    } else if (url.startsWith("https")) {
      Linking.openURL(url);
    } else {
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noreferrer,noopener');
      }
    }
  };

  const handleBookmarkHeaderToggle = () => {
    playClick();
    if (selectedFilter === "Saved") {
      setSelectedFilter("All");
    } else {
      setSelectedFilter("Saved");
      setSelectedCategory(null);
      addToast("Offline Kit Activated", "Displaying only your saved guides.");
    }
  };

  // Pure memoized resource pipeline matching query, category, and filter chips
  const filteredResources = useMemo(() => {
    return launchResources.filter(res => {
      // 1. Search Query matcher
      const query = searchQuery.trim().toLowerCase();
      if (query !== "") {
        const matchesTags = res.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesField = 
          res.title.toLowerCase().includes(query) ||
          res.description.toLowerCase().includes(query) ||
          res.provider.toLowerCase().includes(query) ||
          res.platform.toLowerCase().includes(query) ||
          res.category.toLowerCase().includes(query) ||
          res.phase.toLowerCase().includes(query) ||
          res.type.toLowerCase().includes(query) ||
          matchesTags;

        if (!matchesField) return false;
      }

      // 2. Click category filter on 2-column list
      if (selectedCategory && res.category !== selectedCategory) {
        return false;
      }

      // 3. Main horizontal filters scroller choice
      switch(selectedFilter) {
        case "Saved":
          return savedResourceIds.includes(res.id);
        case "Required":
          return res.isRequired;
        case "iOS":
          return res.platform === "iOS" || res.platform === "Cross-platform";
        case "Android":
          return res.platform === "Android" || res.platform === "Cross-platform";
        case "Legal":
          return res.category === "Legal & Compliance";
        case "Marketing":
          return res.category === "Launch Marketing" || res.category === "Store Listing Assets";
        case "Testing":
          return res.category === "Beta Testing & QA";
        case "Design":
          return res.category === "Design Systems";
        case "Stability":
          return res.category === "Analytics & Stability" || res.phase === "Post-Launch";
        default:
          return true;
      }
    });
  }, [searchQuery, selectedFilter, selectedCategory, savedResourceIds]);

  const clearAllFilters = () => {
    playClick();
    setSearchQuery("");
    setSelectedFilter("All");
    setSelectedCategory(null);
  };

  // Dynamic values parsed inside the cockpit stats panel
  const totalCount = launchResources.length;
  const officialCount = launchResources.filter(r => r.isOfficial).length;
  const savedCount = savedResourceIds.length;

  return (
    <div className="w-full flex-1 bg-[#080B1F] text-[#FFF7EA] flex flex-col min-h-0 select-none pb-24 overflow-y-auto overflow-x-hidden relative" id="launch-library-screen">
      {/* Visual Cockpit Ambient Neon Vectors simulating control boards */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#1500FD]/10 blur-[80px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[35%] right-0 w-[240px] h-[240px] bg-[#14B8A6]/8 blur-[70px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[10%] w-[280px] h-[280px] bg-[#EC5BAA]/5 blur-[90px] rounded-full pointer-events-none z-0" />

      {/* Futuristic dashboard Grid accent backdrop */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_40%_at_50%_-15%,rgba(21,0,253,0.1),rgba(0,0,0,0))] pointer-events-none z-0" />

      <div className="relative z-10 w-full px-4 sm:px-6 pt-6 flex flex-col gap-5 max-w-4xl mx-auto">
        
        {/* PREMIUM CURATED HEADER */}
        <LaunchLibraryHeader 
          totalCount={totalCount} 
          officialCount={officialCount} 
          savedCount={savedCount}
          onBookmarkClick={handleBookmarkHeaderToggle}
          isFilteringSaved={selectedFilter === "Saved"}
        />

        {/* COMPACT SENSOR SEARCH ELEMENT */}
        <SearchBar 
          value={searchQuery} 
          onChange={(val) => setSearchQuery(val)} 
        />



        {/* HIGH-CONTRAST SECURE HORIZONTAL FILTER CHIPS */}
        <div className="w-full flex flex-col gap-1.5 text-left" id="navigation-filters-bar">
          <div className="flex items-center justify-between text-[9.5px] font-mono font-extrabold tracking-widest text-[#AAB2D5]/70 px-0.5 select-none">
            <span>FILTER SPECIALTY SPHERES</span>
            {(selectedFilter !== "All" || selectedCategory !== null || searchQuery !== "") && (
              <button 
                onClick={clearAllFilters} 
                className="text-[#14B8A6] hover:text-white uppercase tracking-wider text-[9px] font-mono cursor-pointer select-none"
              >
                [ Clear Filters ]
              </button>
            )}
          </div>
          
          {/* Natural horizontal scrolling container for mobile device displays */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:-mx-6 sm:px-6 scroll-smooth select-none">
            {[
              { id: "All", label: "All Curations" },
              { id: "Saved", label: "Saved Guides ⭐" },
              { id: "Required", label: "Mandatory 🚨" },
              { id: "iOS", label: "iOS Guides" },
              { id: "Android", label: "Android Guides" },
              { id: "Legal", label: "Legal & Privacy" },
              { id: "Marketing", label: "Launch Marketing" },
              { id: "Testing", label: "Beta Testing & QA" },
              { id: "Design", label: "Design Systems" },
              { id: "Stability", label: "Stability & Crashes" }
            ].map((chip) => (
              <FilterChip 
                key={chip.id}
                id={chip.id}
                label={chip.label}
                isActive={selectedFilter === chip.id}
                onPress={() => {
                  setSelectedFilter(chip.id);
                  setSelectedCategory(null);
                }}
              />
            ))}
          </div>
        </div>

        {/* LAUNCH CATEGORIES LIST (2-COLUMN GRID ON MOBILE) */}
        <div className="w-full flex flex-col gap-3 text-left" id="launch-categories-section">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[9.5px] tracking-widest text-[#AAB2D5]/70 font-extrabold uppercase">
              {selectedCategory ? `ACTIVE SUB-SPHERE RESOURCE DIRECTORY` : "COCKPIT LAUNCH CATEGORIES"}
            </h3>
            {selectedCategory && (
              <button 
                onClick={() => { playClick(); setSelectedCategory(null); }}
                className="text-[11px] text-[#14B8A6] hover:underline flex items-center gap-1 font-bold cursor-pointer select-none"
              >
                Show All Categories
              </button>
            )}
          </div>

          {!selectedCategory ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5" id="categories-grid-container">
              {categoriesList.map((cat) => {
                const countOfCat = launchResources.filter(res => res.category === cat.title).length;
                return (
                  <CategoryCard 
                    key={cat.title}
                    title={cat.title}
                    description={cat.description}
                    icon={cat.icon}
                    color={cat.color}
                    accent={cat.accent}
                    resourceCount={countOfCat}
                    isSelected={false}
                    bgImage={cat.bgImage}
                    onPress={() => {
                      setSelectedCategory(cat.title);
                      addToast("Index Active", `Displaying guidelines under "${cat.title}"`);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="w-full bg-[#131735]/85 border border-[#14B8A6]/25 p-4 rounded-xl flex items-center justify-between select-none text-left shadow-md">
              <div className="flex items-center gap-3.5 pr-2 min-w-0">
                <div className="p-2.5 bg-[#14B8A6]/10 text-[#14B8A6] rounded-lg border border-[#14B8A6]/20 shrink-0">
                  {React.createElement(categoriesList.find(c => c.title === selectedCategory)?.icon || Book, { size: 16 })}
                </div>
                <div className="min-w-0">
                  <h4 className="font-sans font-extrabold text-[12px] text-white leading-tight truncate">
                    ACTIVE SPHERE: {selectedCategory}
                  </h4>
                  <p className="text-[10px] text-[#AAB2D5]/60 leading-snug truncate mt-0.5">
                    {categoriesList.find(c => c.title === selectedCategory)?.description}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { playClick(); setSelectedCategory(null); }}
                className="py-1 px-3 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 text-[10.5px] font-bold transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* REUSABLE REQUIRED BEFORE LAUNCH CHECKLIST */}
        <AnimatePresence>
          {!selectedCategory && searchQuery === "" && (selectedFilter === "All" || selectedFilter === "Required") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <RequiredBeforeLaunchCard 
                onPressCTA={() => {
                  setSelectedFilter("Required");
                  addToast("Roadmap Activated", "Zeroing focus to regulatory mandatory guides.");
                }}
                onOpenResource={handleOpenLink}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CORE RECOMMENDED RESOURCES COLLECTION VIEW */}
        <div className="w-full flex flex-col gap-3 text-left mb-6" id="library-resource-results">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 select-none">
            <h3 className="font-mono text-[9.5px] tracking-widest text-[#AAB2D5]/70 font-extrabold uppercase">
              RECOMMENDED CURATIONS ({filteredResources.length})
            </h3>
            <span className="text-[10px] text-[#AAB2D5]/50 italic shrink-0">
              Saved links stay in your launch kit.
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-2.5">
              {filteredResources.map((res) => (
                <ResourceCard 
                  key={res.id}
                  resource={res}
                  isSaved={savedResourceIds.includes(res.id)}
                  isBlueprint={blueprintIds.includes(res.id)}
                  onToggleSave={() => handleToggleSave(res.id, res.title)}
                  onToggleBlueprint={() => handleToggleBlueprint(res.id, res.title)}
                  onOpen={() => handleOpenLink(res.url)}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* DYNAMIC CALM EMPTY STATES */}
          {filteredResources.length === 0 && (
            <>
              {selectedFilter === "Saved" ? (
                <EmptyState 
                  title="No saved resources yet"
                  message="Save useful guides so they’re ready when you need them during launch."
                  buttonText="Browse Resources"
                  onPressButton={clearAllFilters}
                  type="saved"
                />
              ) : (
                <EmptyState 
                  title="No resources found"
                  message="Try searching “privacy,” “screenshots,” “TestFlight,” or “Product Hunt.”"
                  buttonText="Clear Search"
                  onPressButton={clearAllFilters}
                  type="search"
                />
              )}
            </>
          )}
        </div>

        {/* Dynamic Launch Tips Footer Bar - Helpful contextual microcopy and alerts */}
        <div className="p-4 bg-gradient-to-r from-[#121735] via-[#121735] to-[#8B5E3C]/8 border border-white/5 rounded-xl text-left font-sans text-xs text-[#AAB2D5] flex items-start gap-3.5 select-none my-1 shadow-inner md:-mx-1">
          <Info className="text-[#14B8A6] w-4.5 h-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white uppercase tracking-wider text-[9px] font-mono">LaunchDeck Intelligence Advisory</p>
            <p className="mt-0.5 leading-relaxed text-[11px] text-[#AAB2D5]/75">
              Add useful guides to a Blueprint so they’re ready when you need them. Triggering <strong className="text-white">"Add Task"</strong> integrates them instantly inside your active submission map checkpoints.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
