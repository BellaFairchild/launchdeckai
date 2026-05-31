import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ArrowRight, Sparkles, CheckCircle2, AlertCircle, Save, 
  ChevronRight, RefreshCw, Copy, Check, ChevronDown, ChevronUp, FileText, Info,
  Users, Shield, Zap, ListTodo, ClipboardCheck
} from 'lucide-react';
import { useToast } from './ToastContext';
import { playClick, playSuccess, playPopup } from '../lib/audio';

// ==========================================
// 1. TYPE DEFINITIONS (TypeScript)
// ==========================================
export type StatusType = 'Not Started' | 'In Progress' | 'Needs Review' | 'Complete' | 'Locked';
export type PriorityType = 'High' | 'Medium' | 'Low';

export interface BlueprintPrompt {
  id: string;
  title: string;
  helper: string;
  fillSentence: string;
  example: string;
  placeholder: string;
  currentValue: string;
}

export interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  priority: PriorityType;
  completed: boolean;
}

export interface BlueprintSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  status: StatusType;
  completionRate: number;
  guidanceText: string;
  guidanceTip: string;
  prompts: BlueprintPrompt[];
  checklist: ChecklistTask[];
  suggestedSummary: string;
}

interface BlueprintDetailScreenProps {
  sectionId: string;
  onBack: () => void;
  onSaveAll?: (sectionId: string, prompts: BlueprintPrompt[], checklist: ChecklistTask[], isComplete: boolean) => void;
}

// ==========================================
// 2. DETAILED SECTIONS MOCK ARCHITECTURE (No Sci-Fi Jargon!)
// ==========================================
const INITIAL_SECTIONS_DATA: Record<string, Omit<BlueprintSection, 'id'>> = {
  app_info: {
    title: 'App Info & Identity',
    subtitle: 'Add the basic details for your app.',
    icon: '💡',
    status: 'In Progress',
    completionRate: 25,
    guidanceText: 'Define your app core promise, ideal user personas, and branding constraints.',
    guidanceTip: 'Rough answers are perfect. Use our AI Assist to refine and polish them later.',
    prompts: [
      {
        id: 'app_name',
        title: 'App Name',
        helper: 'What will your app be called?',
        fillSentence: 'Our app is named [App Name].',
        example: 'LaunchDeckAI',
        placeholder: 'e.g., My Fitness Tracker',
        currentValue: 'LaunchDeckAI'
      },
      {
        id: 'app_type',
        title: 'App Type',
        helper: 'What kind of app are you building?',
        fillSentence: 'We are building a [App Type] application.',
        example: 'Guided checklist assistant for indie creators',
        placeholder: 'e.g., Mobile workout tracker, journaling SaaS, etc.',
        currentValue: ''
      },
      {
        id: 'current_stage',
        title: 'Current Stage',
        helper: 'Where are you in the build process?',
        fillSentence: 'We are currently in the [Current Stage] stage.',
        example: 'UI design and initial prototype code phase',
        placeholder: 'e.g., Idea stage, MVP built, Design phase',
        currentValue: ''
      },
      {
        id: 'target_audience',
        title: 'Target Audience',
        helper: 'Who is this app mainly for?',
        fillSentence: 'Our target audience is [Target Audience].',
        example: 'First-time mobile app creators and solo indie developers',
        placeholder: 'e.g., Solo founders, busy parents, students',
        currentValue: ''
      },
      {
        id: 'user_goal',
        title: 'User Goal',
        helper: 'What are they trying to do?',
        fillSentence: 'Trained users seek to [User Goal].',
        example: 'Organize listing assets and prepare App Store files without stress',
        placeholder: 'e.g., Track daily hydration, find design inspiration',
        currentValue: ''
      },
      {
        id: 'current_alternative',
        title: 'Current Alternative',
        helper: 'What do they use now?',
        fillSentence: 'Typically, users currently rely on [Current Alternative].',
        example: 'Scattered general notes, Trello cards, and complex spreadsheets',
        placeholder: 'e.g., Notebooks, Excel sheets, ignoring the problem',
        currentValue: ''
      },
      {
        id: 'problem_solved',
        title: 'Problem Solved',
        helper: 'What problem does your app solve?',
        fillSentence: 'We solve the problem of [Problem Solved].',
        example: 'Overwhelming rules, unfamiliar guidelines, and complex submission jargon',
        placeholder: 'e.g., Tired of forgetting tasks, confusing setups',
        currentValue: ''
      },
      {
        id: 'main_benefit',
        title: 'Main Benefit',
        helper: 'What result does your app help users get?',
        fillSentence: 'The chief benefit we deliver is helping them [Main Benefit].',
        example: 'Stay calm, progress step-by-step, and submit their apps with confidence',
        placeholder: 'e.g., Drink water consistently, feel less anxious',
        currentValue: ''
      },
      {
        id: 'difference',
        title: 'Difference',
        helper: 'What makes your app different?',
        fillSentence: 'What sets us apart is [Difference].',
        example: 'Extremely simple language, interactive guide steps, and helpful automation tools',
        placeholder: 'e.g., Simpler UI, offline-first, group challenges',
        currentValue: ''
      },
      {
        id: 'feature_1',
        title: 'Key Feature 1',
        helper: 'Keep your first version focused. Choose the three most important features.',
        fillSentence: 'Feature 1 allows users to [Key Feature 1].',
        example: 'Actionable, plain-English app launch checklist templates',
        placeholder: 'e.g., Drag & drop todo builder',
        currentValue: ''
      },
      {
        id: 'feature_2',
        title: 'Key Feature 2',
        helper: 'Keep your first version focused. Choose the three most important features.',
        fillSentence: 'Feature 2 allows users to [Key Feature 2].',
        example: 'Writing assistance to automatically draft listing copy',
        placeholder: 'e.g., Automatic reminders',
        currentValue: ''
      },
      {
        id: 'feature_3',
        title: 'Key Feature 3',
        helper: 'Keep your first version focused. Choose the three most important features.',
        fillSentence: 'Feature 3 allows users to [Key Feature 3].',
        example: 'Interactive progress trackers to monitor submission readiness',
        placeholder: 'e.g., Offline data backup',
        currentValue: ''
      }
    ],
    checklist: [
      { id: 'ai_1', title: 'Confirm your app name is available', description: 'Check trademark lists and store directories to make sure your name is clear.', priority: 'High', completed: true },
      { id: 'ai_2', title: 'Identify your target audience', description: 'Specify exactly who your ideal early adopters are.', priority: 'High', completed: false },
      { id: 'ai_3', title: 'Write a one-sentence pitch', description: 'Explain clearly what your app does in plain English.', priority: 'Medium', completed: true },
      { id: 'ai_4', title: 'Identify core launch features', description: 'Select the primary three capabilities to avoid feature creep.', priority: 'Medium', completed: false }
    ],
    suggestedSummary: 'Our app is called LaunchDeckAI. It is a step-by-step assistant designed for first-time mobile app developers and indie creators. Our target audience is first-time mobile app creators and solo indie developers. Their main goal is to organize listing assets and prepare App Store files without stress. Currently, they use scattered notes. We solve the problem of overwhelming rules and confusing submission steps. The main benefit is helping them submit their apps with confidence. Unique differentiator: extremely simple language and intuitive progress trackers.'
  },

  app_store: {
    title: 'App Store Info',
    subtitle: 'Prepare your listing details, keyword strategy, and descriptions.',
    icon: '📝',
    status: 'In Progress',
    completionRate: 20,
    guidanceText: 'This section helps you prepare your App Store title, subtitle, keywords, and description before you submit your app.',
    guidanceTip: 'Simple draft summaries are perfect. You can use our AI Assist to refine and polish them later.',
    prompts: [
      {
        id: 'as_title',
        title: 'App Store Title',
        helper: 'Max 30 characters. Include your app name and a main keyword.',
        fillSentence: 'Our App Store title will be [App Store Title].',
        example: 'LaunchDeckAI: Easy App Release',
        placeholder: 'e.g., My Fitness Tracker: Active Plan',
        currentValue: 'LaunchDeckAI: Release Assistant'
      },
      {
        id: 'as_subtitle',
        title: 'Subtitle',
        helper: 'Max 30 characters. Focus on your primary benefit or a key difference.',
        fillSentence: 'Our app listing subtitle is [Subtitle explicando core reward].',
        example: 'Plan and launch apps stress-free',
        placeholder: 'e.g., Step-by-step release checklists',
        currentValue: ''
      },
      {
        id: 'as_keywords',
        title: 'Keywords List',
        helper: 'Comma-separated keywords (100 char limit). No spaces after commas.',
        fillSentence: 'Our primary search keywords are: [comma-separated words].',
        example: 'indie,launcher,checklist,deploy,appstore,developer,expo,helper,tracker',
        placeholder: 'e.g. app,launch,manager,checklist,task,streak',
        currentValue: 'indie,app,launch,checklist,deploy'
      },
      {
        id: 'as_description',
        title: 'Description',
        helper: 'A compelling description about what your app does and who it helps.',
        fillSentence: 'The main App Store copy description explains [Description details].',
        example: 'LaunchDeckAI is designed for busy creators who want to step-by-step prepare app details.',
        placeholder: 'e.g., This hydration app notifies you to drink water and logs metrics...',
        currentValue: ''
      },
      {
        id: 'as_support_url',
        title: 'Support Website Website URL',
        helper: 'The link where users can contact you for bug reports and support questions.',
        fillSentence: 'Our primary support and landing domain url is hosted at [Support URL].',
        example: 'https://launchdeckai.com/support',
        placeholder: 'e.g., https://myhealthapp.com/contact',
        currentValue: ''
      }
    ],
    checklist: [
      { id: 'as_c1', title: 'Write an App Store title (30 chars max)', description: 'Perfect the keywords inside your title.', priority: 'High', completed: true },
      { id: 'as_c2', title: 'Write an optimized subtitle (30 chars max)', description: 'Clearly call out your main benefits.', priority: 'High', completed: false },
      { id: 'as_c3', title: 'Compile high-relevance search terms', description: 'Gather up to 100 characters of comma-separated terms.', priority: 'Medium', completed: false },
      { id: 'as_c4', title: 'Prepare screens Mock Layouts', description: 'Detail visual themes and copies for 5 promo screenshots.', priority: 'Medium', completed: false }
    ],
    suggestedSummary: 'App Store listing: Title is styled as "LaunchDeckAI: Release Assistant". Subtitle focuses on stress-free release guides. Keywords list targets planners.'
  },

  legal: {
    title: 'Legal & Privacy Compliance',
    subtitle: 'Identify standard legal agreements, privacy policy links, and data safety needs.',
    icon: '🛡️',
    status: 'Not Started',
    completionRate: 0,
    guidanceText: 'Make sure your mobile application complies with standard legal provisions including privacy statements and age ratings.',
    guidanceTip: 'Having these links ready in advance keeps your App Store review timeline brief and safe.',
    prompts: [
      {
        id: 'leg_entity',
        title: 'Developer / Publisher Entity Name',
        helper: 'Name of the individual or company registering the app accounts.',
        fillSentence: 'Our developer account and intellectual assets reside under [Entity Name].',
        example: 'Jane Doe Developer',
        placeholder: 'e.g., My Company LLC',
        currentValue: ''
      },
      {
        id: 'leg_privacy',
        title: 'Privacy Policy URL Link',
        helper: 'A link to your privacy policy page (required for all reviews).',
        fillSentence: 'Our live privacy statement document is available at [Privacy Link].',
        example: 'https://minehealthapp.com/privacy-policy',
        placeholder: 'e.g., https://yourbrand.com/privacy',
        currentValue: ''
      },
      {
        id: 'leg_privacy_draft',
        title: 'Privacy Policy Draft',
        helper: 'Full text for your privacy policy (compliant with standard store reviews).',
        fillSentence: 'Privacy Policy Document:\n\n[Privacy Policy Full Text].',
        example: 'Privacy Policy\n\n1. Data Collection: We do not collect personally identifiable information without explicit user consent. Analytics data is anonymized.\n2. Usage: Data is strictly used to improve application performance and reliability. Local storage is used for offline features.\n3. Third Parties: User data is never sold or shared with external advertising agencies. Standard analytics tools (e.g., Crashlytics) follow App Store / Play Store data safety rules.\n4. User Rights: Users may request data deletion or account removal at any time through our support channels or directly within the app.\n\nThis policy complies with standard Apple App Store and Google Play data safety disclosures.',
        placeholder: 'e.g., We take your privacy seriously...',
        currentValue: 'Privacy Policy\n\n1. Data Collection: We do not collect personally identifiable information without explicit user consent. Analytics data is anonymized.\n2. Usage: Data is strictly used to improve application performance and reliability. Local storage is used for offline features.\n3. Third Parties: User data is never sold or shared with external advertising agencies. Standard analytics tools (e.g., Crashlytics) follow App Store / Play Store data safety rules.\n4. User Rights: Users may request data deletion or account removal at any time through our support channels or directly within the app.\n\nThis policy complies with standard Apple App Store and Google Play data safety disclosures.'
      },
      {
        id: 'leg_data_use',
        title: 'User Data Gathered',
        helper: 'What user information do you request or track inside the app?',
        fillSentence: 'We request user permission to gather [List of collected data, e.g., email, photos].',
        example: 'Name, email addresses for account sync, and local device notification permission.',
        placeholder: 'e.g., No account register required, completely local...',
        currentValue: ''
      },
      {
        id: 'leg_eula',
        title: 'Terms of Service Link',
        helper: 'URL pointing to your terms and conditions (optional but highly recommended).',
        fillSentence: 'Our Terms of Service rules are available at [Terms URL].',
        example: 'https://myhealthapp.com/terms',
        placeholder: 'e.g., https://yourbrand.com/terms',
        currentValue: ''
      },
      {
        id: 'leg_age_rating',
        title: 'Target Age Rating Category',
        helper: 'Are there content elements (e.g. violent references) requiring an older age tier?',
        fillSentence: 'The app is rated for ages [Target Age Rating] and older.',
        example: 'Ages 4+, completely clean and safe for all segments',
        placeholder: 'e.g., 12+ due to community forums support',
        currentValue: ''
      }
    ],
    checklist: [
      { id: 'lg_c1', title: 'Publish your live Privacy Policy page', description: 'Must be public and accessible at all times.', priority: 'High', completed: false },
      { id: 'lg_c2', title: 'Draft standard Terms & Conditions agreement', description: 'Sets clear ownership criteria for in-app assets and features.', priority: 'Medium', completed: false },
      { id: 'lg_c3', title: 'Prepare Data Safety disclosures questionnaire', description: 'Be ready to explain exactly what user details you store or share.', priority: 'High', completed: false }
    ],
    suggestedSummary: 'The development assets will be owned by Jane Doe. Privacy statement will be hosted at a custom static site link. Data usage is restricted to local caches.'
  },

  marketing: {
    title: 'Public Launch Plan',
    subtitle: 'Prepare your landing page, waitlist sequence, and public promotional threads.',
    icon: '📢',
    status: 'Not Started',
    completionRate: 10,
    guidanceText: 'Ensure people know about your app. Prepare simple teaser banners, waitlist landing pages, and announcement social posts.',
    guidanceTip: 'Launch day goes smoother if you build up a list of interested users a few weeks beforehand.',
    prompts: [
      {
        id: 'mkt_tagline',
        title: 'One-Sentence Pitch Tagline',
        helper: 'What is the attention-grabbing summary of what your app does?',
        fillSentence: 'The primary headline tagline is: [My Tagline].',
        example: 'The stress-free release assistant for solo app developers.',
        placeholder: 'e.g. Build better habits without complex tracking.',
        currentValue: ''
      },
      {
        id: 'mkt_landing_page',
        title: 'Landing Page URL or Workspace',
        helper: 'The website address where people can join your waitlist.',
        fillSentence: 'Our main waitlist site resides at [Landing Page URL].',
        example: 'https://launchdeckai.com',
        placeholder: 'e.g. https://myhabitsapp.webflow.io',
        currentValue: ''
      },
      {
        id: 'mkt_ph_pitch',
        title: 'Product Hunt Slogan',
        helper: 'A catchy tagline for your Product Hunt launch post.',
        fillSentence: 'Our Product Hunt pitch summary reads: [PH Slogan].',
        example: 'LaunchDeckAI: No more rocket-science app store guides. Step-by-step launch checklist!',
        placeholder: 'e.g. Calm Hydrator: Simple widget tracking for your water intake.',
        currentValue: ''
      },
      {
        id: 'mkt_email_sequence',
        title: 'Waitlist Email Welcome Line',
        helper: 'The very first sentence in the confirmation email sent to waitlist signups.',
        fillSentence: 'The greeting sent to signups is: [Welcome email intro line].',
        example: 'Thanks for joining our waitlist! We are building LaunchDeckAI to make app releases simple.',
        placeholder: 'e.g. You are on the list! Prepare your hydration tracking goals with us.',
        currentValue: ''
      },
      {
        id: 'mkt_social_channel',
        title: 'Primary Marketing Channel',
        helper: 'The main online channel where you will build excitement (e.g. Twitter/X, Reddit).',
        fillSentence: 'We will mainly connect with early supporters via [Social Channel].',
        example: 'Twitter/X sharing our builder progress and community feedback',
        placeholder: 'e.g. Reddit r/indiebiz and r/socialhabit',
        currentValue: ''
      }
    ],
    checklist: [
      { id: 'mk_c1', title: 'Set up a basic landing page', description: 'A simple page containing a waitlist signup field is all you need.', priority: 'High', completed: false },
      { id: 'mk_c2', title: 'Draft your welcome email text', description: 'Provide a clean message explaining what early adopters get.', priority: 'Medium', completed: false },
      { id: 'mk_c3', title: 'Prepare promotional share images', description: 'Create basic screenshots showing off high-value app widgets.', priority: 'Low', completed: false }
    ],
    suggestedSummary: 'Launching with Product Hunt and Twitter builder diaries. Landing page hosted dynamically to accept early waitlist emails.'
  },

  beta: {
    title: 'Beta Testing Setup',
    subtitle: 'Prepare feedback channels, TestFlight limitations, and welcome steps.',
    icon: '👥',
    status: 'Not Started',
    completionRate: 0,
    guidanceText: 'Enlist helpful early testers to check your app. Set up clean forms to collect reports and bug lists.',
    guidanceTip: 'Be encouraging. Listening to how users test your app is the best way to make it pristine.',
    prompts: [
      {
        id: 'bt_count',
        title: 'Target Tester Count Limit',
        helper: 'How many external testers do you want to recruit for the initial phase?',
        fillSentence: 'We seek to enroll [Tester count] testers in our beta group.',
        example: '50 passionate early adopters and fellow builders',
        placeholder: 'e.g., 20 close friends and mailing list contacts',
        currentValue: ''
      },
      {
        id: 'bt_channel',
        title: 'Tester Feedback Route',
        helper: 'How should testers submit their comments (e.g. Google Form, direct email)?',
        fillSentence: 'Testers should file feedback items using [Feedback Channel].',
        example: 'An inline feedback form link and a direct support email at support@launchdeck.com',
        placeholder: 'e.g., A simple Google Form link shared with the test build',
        currentValue: ''
      },
      {
        id: 'bt_welcome',
        title: 'Beta User Warm Greeting',
        helper: 'What instructions will users see when they open your TestFlight build?',
        fillSentence: 'When they launch the test package, users see: [Welcome greeting].',
        example: 'Welcome! Tap on the Blueprints menu to test adding a new app details profile, and report any bugs.',
        placeholder: 'e.g., Try adding a daily goal and let us know if notifications trigger!',
        currentValue: ''
      },
      {
        id: 'bt_key_test',
        title: 'Primary Test Focus Key Feature',
        helper: 'Which core capability do you need users to test most thoroughly?',
        fillSentence: 'We specifically ask testers to pay close attention to [Key Feature Area].',
        example: 'Completing form steps, editing inputs, and copying the draft summaries.',
        placeholder: 'e.g., Notification triggers and widget updates...',
        currentValue: ''
      },
      {
        id: 'bt_duration',
        title: 'Testing Window Duration',
        helper: 'How long will your beta run before you organize results?',
        fillSentence: 'The beta test period is planned for [Beta duration].',
        example: '2 weeks, after which we will refine layouts and launch officially',
        placeholder: 'e.g., 10 days of active checking',
        currentValue: ''
      }
    ],
    checklist: [
      { id: 'bt_c1', title: 'Publish TestFlight internal check build', description: 'Test the build on your own devices to make sure it loads cleanly.', priority: 'High', completed: false },
      { id: 'bt_c2', title: 'Configure basic crash tracking', description: 'Connect simple error reports so you can trace crashes automatically.', priority: 'High', completed: false },
      { id: 'bt_c3', title: 'Build a standard feedback intake form', description: 'Make it easy for testers to submit issues and comments.', priority: 'Medium', completed: false }
    ],
    suggestedSummary: 'The test plan seeks 50 testers. Feedback gathered via direct helper link inside active tabs. Window scheduled for 14 days.'
  },

  pre_launch: {
    title: 'Store Submission Checklist',
    subtitle: 'Check pricing options, bundle identifiers, and global configurations.',
    icon: '🎯',
    status: 'Not Started',
    completionRate: 0,
    guidanceText: 'Assemble the final details of your app listing package. Check pricing models, app bundle identifiers, and screenshots formats.',
    guidanceTip: 'Accuracy here avoids minor store review rejections.',
    prompts: [
      {
        id: 'pl_bundle',
        title: 'App Bundle Identifier ID',
        helper: 'Unique system identifier using reverse domain format (e.g. com.yourname.appname).',
        fillSentence: 'Our registered App Store bundle package ID is [Bundle ID].',
        example: 'com.launchdeckai.assistant',
        placeholder: 'e.g., com.myname.habitapp',
        currentValue: ''
      },
      {
        id: 'pl_pricing',
        title: 'App Pricing Model',
        helper: 'Is the app free, paid, or using subscription options?',
        fillSentence: 'This app is offered as a [Pricing Model] service.',
        example: 'Free download with custom monthly subscription tier to unlock writing assists',
        placeholder: 'e.g., Completely free with no in-app purchases',
        currentValue: ''
      },
      {
        id: 'pl_icon_ready',
        title: 'App Icon Details',
        helper: 'Do you have a simple, high-res icon prepared (1024x1024 flat format)?',
        fillSentence: 'Our app icon is designed as a [Icon Design description].',
        example: 'Clean geometric checklist icon with slate and cobalt gradients',
        placeholder: 'e.g., Rounded drop shape with white text',
        currentValue: ''
      },
      {
        id: 'pl_regions',
        title: 'Target Country Distribution',
        helper: 'Do you plan to release globally or restrict to specific countries?',
        fillSentence: 'We are distributing our app store package in [Regions].',
        example: 'Globally across all regions supporting primary in-app stores',
        placeholder: 'e.g., Only in English-speaking territories initially',
        currentValue: ''
      },
      {
        id: 'pl_trigger',
        title: 'Release Action Option',
        helper: 'Should the store publish your app immediately on review approval, or hold for manual trigger?',
        fillSentence: 'We will configure our app release to trigger [Release Option] after approval.',
        example: 'Manually, so we can align announcements and landing page updates perfectly',
        placeholder: 'e.g., Automatically as soon as store reviewers approve it',
        currentValue: ''
      }
    ],
    checklist: [
      { id: 'pl_c1', title: 'Check package bundle and naming matches', description: 'Verify setup matches registered developer profiles.', priority: 'High', completed: false },
      { id: 'pl_c2', title: 'Export all icon formats', description: 'Prepare sizes ranging from 20px up to 1024px inside assets.', priority: 'High', completed: false },
      { id: 'pl_c3', title: 'Complete store compliance surveys', description: 'Fill out age ratings surveys inside developer consoles.', priority: 'Medium', completed: false }
    ],
    suggestedSummary: 'Bundle ID registered as com.launchdeckai.app. Single monthly option configured for premium help services.'
  },

  launch_day: {
    title: 'Launch Day Checklist',
    subtitle: 'Activate waitlist alert emails, post public stories, and monitor reviews.',
    icon: '🚀',
    status: 'Not Started',
    completionRate: 0,
    guidanceText: 'Coordinate live updates. Press release buttons, email waitlist contacts, publish social announcements, and review initial metrics.',
    guidanceTip: 'Relax! Have support links easily reachable so you can answer early user questions.',
    prompts: [
      {
        id: 'ld_ann_slogan',
        title: 'Launch Announcement Title',
        helper: 'Your main, punchy headline to announce your release.',
        fillSentence: 'The main announcement headline is: [Slogan Header].',
        example: 'LaunchDeckAI is officially live! Plan and prepare your mobile app with a clear guide.',
        placeholder: 'e.g., The simplest hydration assistant is now available for download!',
        currentValue: ''
      },
      {
        id: 'ld_outreach',
        title: 'Product Communities Post List',
        helper: 'List the platforms where you will post (e.g., Product Hunt, Reddit, Hacker News).',
        fillSentence: 'Our core launch posts will go active on [Submission platforms].',
        example: 'Product Hunt, Twitter/X, and the r/indiebiz developer forum',
        placeholder: 'e.g., Hacker News Show section, Product Hunt, Twitter',
        currentValue: ''
      },
      {
        id: 'ld_checks',
        title: 'First-Day App Stability Check',
        helper: 'How will you check for initial runtime bugs (e.g., hourly analytics review)?',
        fillSentence: 'We monitor launch stability by [Stability check steps].',
        example: 'Reviewing crash reports hourly and monitoring our support inbox closely',
        placeholder: 'e.g., checking Sentry alerts twice on launch day',
        currentValue: ''
      },
      {
        id: 'ld_support',
        title: 'Early Review Response Plan',
        helper: 'How will you handle early user bugs or ratings questions?',
        fillSentence: 'We handle early feedback by [Response strategy].',
        example: 'Answering questions with gratitude, fixing critical bugs, and posting quick updates',
        placeholder: 'e.g. Replying to reviews within 24 hours to build trust',
        currentValue: ''
      },
      {
        id: 'ld_milestone',
        title: 'Launch Day Goal Tracker',
        helper: 'What simple milestone defines a successful day one (e.g., signup count, first review)?',
        fillSentence: 'Our simple launch success goal is [Launch goal].',
        example: 'Enrolling 100 waitlisted signups and receiving our first 5 construction reviews',
        placeholder: 'e.g., 50 active tool test checks',
        currentValue: ''
      }
    ],
    checklist: [
      { id: 'ld_c1', title: 'Press the release button in developer console', description: 'Approve final listing package releases inside dev accounts.', priority: 'High', completed: false },
      { id: 'ld_c2', title: 'Publish your Product Hunt post', description: 'Set your pitch live and welcome early backers and reviewers.', priority: 'High', completed: false },
      { id: 'ld_c3', title: 'Send out waitlist announcement emails', description: 'Send direct, appreciative links to let waitlisted readers download the app.', priority: 'High', completed: false }
    ],
    suggestedSummary: 'The launch channels will publish product cards across Product Hunt. Alert email sequences will coordinate download flows.'
  },

  post_launch: {
    title: 'Post-Launch Optimization',
    subtitle: 'Track user active rates, collect feedback, write patches, and plan updates.',
    icon: '📈',
    status: 'Not Started',
    completionRate: 0,
    guidanceText: 'Plan the days after your launch. Track user retention benchmarks, schedule rating prompts, and prioritize early bug hotfixes.',
    guidanceTip: 'Great apps are built on feedback. Treat each user report as a chance to make something amazing.',
    prompts: [
      {
        id: 'po_prompt',
        title: 'Rating Prompt Schedule',
        helper: 'When should users be prompted to rate your app (e.g. after 3 complete checklist items)?',
        fillSentence: 'We trigger the in-app Store Feedback popup when users [Rating Trigger Condition].',
        example: 'Mark at least two milestones complete, ensuring they appreciate early value first',
        placeholder: 'e.g., log hydration target trends for 3 consecutive days',
        currentValue: ''
      },
      {
        id: 'po_roadmap',
        title: 'Priority v1.1 Feature Update',
        helper: 'What addition or update is most requested by early audiences?',
        fillSentence: 'Our planned v1.1 app update focuses on [v1.1 feature].',
        example: 'A clean template sharing option to let creators export blueprints to standard formats',
        placeholder: 'e.g., Dark mode options and localized calendars support',
        currentValue: ''
      },
      {
        id: 'po_retention',
        title: 'User Retention Metric Goal',
        helper: 'What percentage of users do you want returning in week 2 (e.g., 30% retention)?',
        fillSentence: 'We aim for a week-2 active retention benchmark of [Retention percent].',
        example: '35% active tool usage metric within the first two weeks of download',
        placeholder: 'e.g., 20% returning habit builders',
        currentValue: ''
      },
      {
        id: 'po_hotfixes',
        title: 'Bug Patch Window Schedule',
        helper: 'How quickly will you compile and deploy minor bug fixes?',
        fillSentence: 'We schedule minor issue updates to publish within [Hotfix SLA].',
        example: '48 hours, keeping the platform fast, responsive, and clear of early errors',
        placeholder: 'e.g., 3 days for general cosmetic adjustments',
        currentValue: ''
      },
      {
        id: 'po_referral',
        title: 'Referral Incentive Plan',
        helper: 'How can users invite friends (e.g. unlock custom icons, share PDF guides)?',
        fillSentence: 'We reward users for sharing our app with friends by [Referral reward].',
        example: 'Unlocking custom color theme options and providing a clean downloadable guide checklist',
        placeholder: 'e.g., Unlocking premium reminder styles',
        currentValue: ''
      }
    ],
    checklist: [
      { id: 'po_c1', title: 'Schedule review trigger popup logic', description: 'Trigger ratings popups after the user has success experiences.', priority: 'High', completed: false },
      { id: 'po_c2', title: 'Establish bug patch templates pipeline', description: 'Be ready to bundle and deploy updates containing early feedback.', priority: 'Medium', completed: false },
      { id: 'po_c3', title: 'Audit week-1 active retention lists', description: 'Identify where early users might get stuck or lost.', priority: 'Medium', completed: false }
    ],
    suggestedSummary: 'Review alerts are scheduled for the third milestone event. Next roadmap items emphasize template exports.'
  }
};

// ==========================================
// 3. MAIN REDESIGNED DETAIL SCREEN COMPONENT
// ==========================================
export function BlueprintDetailScreen({ sectionId, onBack, onSaveAll }: BlueprintDetailScreenProps) {
  const { addToast } = useToast();

  const [activeSecId, setActiveSecId] = useState(sectionId);

  // --- Dynamic State Hydration with fallback data & backward-compatibility mapping ---
  const [section, setSection] = useState<BlueprintSection>(() => {
    const saved = localStorage.getItem(`ld_blueprint_sec_${sectionId}`);
    const defaultData = INITIAL_SECTIONS_DATA[sectionId] || INITIAL_SECTIONS_DATA['app_info'];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Backward-compatibility: if saved data structure is old, carry over values correctly
        if (sectionId === 'app_info' && parsed.prompts?.length !== 12) {
          const mergedPrompts = defaultData.prompts.map(dp => {
            // Map old Name prompts
            if (dp.id === 'app_name') {
              const oldAppName = parsed.prompts?.find((p: any) => p.id === 'inf_1' || p.id === 'as_title')?.currentValue;
              if (oldAppName) return { ...dp, currentValue: oldAppName };
            }
            // Map old Target Audience prompts
            if (dp.id === 'target_audience') {
              const oldAudience = parsed.prompts?.find((p: any) => p.id === 'inf_2')?.currentValue;
              if (oldAudience) return { ...dp, currentValue: oldAudience };
            }
            return dp;
          });
          return {
            id: sectionId,
            ...defaultData,
            status: parsed.status || 'In Progress',
            completionRate: parsed.completionRate || 25,
            prompts: mergedPrompts,
            checklist: parsed.checklist || defaultData.checklist,
            suggestedSummary: parsed.suggestedSummary || defaultData.suggestedSummary
          };
        }
        
        return {
          id: sectionId,
          ...defaultData,
          ...parsed
        };
      } catch (e) {
        console.error("Failed to parse saved state, fallback to default", e);
      }
    }

    return {
      id: sectionId,
      ...defaultData
    };
  });

  // Sync state if activeSecId changes
  useEffect(() => {
    const savedNext = localStorage.getItem(`ld_blueprint_sec_${activeSecId}`);
    const defaultData = INITIAL_SECTIONS_DATA[activeSecId] || INITIAL_SECTIONS_DATA['app_info'];

    if (savedNext) {
      try {
        const parsed = JSON.parse(savedNext);
        if (activeSecId === 'app_info' && parsed.prompts?.length !== 12) {
          const mergedPrompts = defaultData.prompts.map(dp => {
            if (dp.id === 'app_name') {
              const oldAppName = parsed.prompts?.find((p: any) => p.id === 'inf_1' || p.id === 'as_title')?.currentValue;
              if (oldAppName) return { ...dp, currentValue: oldAppName };
            }
            if (dp.id === 'target_audience') {
              const oldAudience = parsed.prompts?.find((p: any) => p.id === 'inf_2')?.currentValue;
              if (oldAudience) return { ...dp, currentValue: oldAudience };
            }
            return dp;
          });
          setSection({
            id: activeSecId,
            ...defaultData,
            status: parsed.status || 'In Progress',
            completionRate: parsed.completionRate || 25,
            prompts: mergedPrompts,
            checklist: parsed.checklist || defaultData.checklist,
            suggestedSummary: parsed.suggestedSummary || defaultData.suggestedSummary
          });
        } else {
          setSection({
            id: activeSecId,
            ...defaultData,
            ...parsed
          });
        }
        setActiveStepIndex(0);
        return;
      } catch (e) {
        console.error("Failed to parse saved state, fallback to default", e);
      }
    }

    setSection({
      id: activeSecId,
      ...defaultData
    });
    setActiveStepIndex(0);
  }, [activeSecId]);

  // Handle saving the state to local and updating parent
  const handleSaveWorkspaceState = (silent: boolean = false) => {
    localStorage.setItem(`ld_blueprint_sec_${activeSecId}`, JSON.stringify(section));
    
    if (onSaveAll) {
      const isComplete = section.status === 'Complete';
      onSaveAll(activeSecId, section.prompts, section.checklist, isComplete);
    }

    if (!silent) {
      playSuccess();
      addToast('Progress Saved', `Your fields and status parameters have been saved.`);
    }
  };

  // Switch to next section ID (e.g. from app_info to app_store)
  const handleTransitionToSection = (nextId: string) => {
    handleSaveWorkspaceState(true);
    setActiveSecId(nextId);
    setActiveStepIndex(0);
    addToast('Segment Loaded', `Successfully loaded the ${INITIAL_SECTIONS_DATA[nextId]?.title || nextId} details screen.`);
  };

  // Inner navigation and form state
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isWritingHelpOpen, setIsWritingHelpOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [aiHelperLogs, setAiHelperLogs] = useState<string[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeExamplePromptId, setActiveExamplePromptId] = useState<string | null>(null);

  // Content Organization variables
  const isAppInfo = section.id === 'app_info';
  const stepsList = isAppInfo 
    ? ['Basics', 'Audience', 'Value', 'Features', 'Summary']
    : ['Details 1', 'Details 2', 'Key Info', 'Requirements', 'Summary'];

  // Calculate field completion count
  const completedFieldsCount = section.prompts.filter(p => p.currentValue.trim().length > 2).length;
  const totalFieldsCount = section.prompts.length;

  const completedChecklistCount = section.checklist.filter(t => t.completed).length;
  const totalChecklistCount = section.checklist.length;

  // Sync state save on prompt or checklist updates
  useEffect(() => {
    handleSaveWorkspaceState(true);
  }, [section.prompts, section.checklist]);

  // Handle individual value changes
  const handlePromptChange = (promptId: string, value: string) => {
    setSection(prev => {
      const updatedPrompts = prev.prompts.map(p => p.id === promptId ? { ...p, currentValue: value } : p);
      const nextScore = calculateCompletionRate(updatedPrompts, prev.checklist);
      const nextStatus = determineStatus(nextScore, prev.status);
      return {
        ...prev,
        prompts: updatedPrompts,
        completionRate: nextScore,
        status: nextStatus
      };
    });
  };

  // Toggle checklist completed state
  const handleChecklistToggle = (taskId: string) => {
    playClick();
    setSection(prev => {
      const updatedChecklist = prev.checklist.map(t => {
        if (t.id === taskId) {
          const nextVal = !t.completed;
          if (nextVal) playSuccess();
          return { ...t, completed: nextVal };
        }
        return t;
      });
      const nextScore = calculateCompletionRate(prev.prompts, updatedChecklist);
      const nextStatus = determineStatus(nextScore, prev.status);
      return {
        ...prev,
        checklist: updatedChecklist,
        completionRate: nextScore,
        status: nextStatus
      };
    });
  };

  // Weight calculators: prompts (50%) + checklist (50%)
  const calculateCompletionRate = (prompts: BlueprintPrompt[], checklist: ChecklistTask[]) => {
    const totalPrompts = prompts.length;
    const completedPrompts = prompts.filter(p => p.currentValue.trim().length > 2).length;

    const totalChecklist = checklist.length;
    const completedChecklist = checklist.filter(t => t.completed).length;

    if (totalPrompts + totalChecklist === 0) return 0;
    
    const promptWeightRate = totalPrompts > 0 ? (completedPrompts / totalPrompts) * 50 : 50;
    const checklistWeightRate = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 50 : 50;

    return Math.round(promptWeightRate + checklistWeightRate);
  };

  const determineStatus = (score: number, currentStatus: StatusType): StatusType => {
    if (currentStatus === 'Locked') return 'Locked';
    if (score === 100) return 'Complete';
    if (score > 0) return 'In Progress';
    return 'Not Started';
  };

  // Retrieve field array matching active step
  const getFieldsForStep = (stepIdx: number) => {
    if (isAppInfo) {
      switch (stepIdx) {
        case 0: // Basics
          return section.prompts.slice(0, 3);
        case 1: // Audience
          return section.prompts.slice(3, 6);
        case 2: // Value
          return section.prompts.slice(6, 9);
        case 3: // Features
          return section.prompts.slice(9, 12);
        default:
          return [];
      }
    } else {
      // Generic 5 prompt section splitter
      switch (stepIdx) {
        case 0:
          return [section.prompts[0], section.prompts[1]].filter(Boolean);
        case 1:
          return [section.prompts[2]].filter(Boolean);
        case 2:
          return [section.prompts[3]].filter(Boolean);
        case 3:
          return [section.prompts[4]].filter(Boolean);
        default:
          return [];
      }
    }
  };

  // Instantly populates prompt fields using their guided examples
  const runSingleFieldAutoDraft = (promptId: string) => {
    playPopup();
    addToast('AI Assist Active', 'Formulating your draft suggestion...');
    
    setTimeout(() => {
      setSection(prev => {
        const updated = prev.prompts.map(p => {
          if (p.id === promptId) {
            return { ...p, currentValue: p.example };
          }
          return p;
        });
        const score = calculateCompletionRate(updated, prev.checklist);
        return {
          ...prev,
          prompts: updated,
          completionRate: score,
          status: determineStatus(score, prev.status)
        };
      });
      playSuccess();
      addToast('Draft Injected', 'Injected a clear, helpful baseline draft in the text block.');
    }, 600);
  };

  // Compares and compiles final App Summary paragraph output
  const handleCreateAppSummary = () => {
    playPopup();
    setIsAiProcessing(true);
    setAiHelperLogs([]);
    addToast('Creating App Summary', 'Compounding your answers into a clear plan...');

    const logList = [
      'Gleaning details from your answers...',
      'Pruning administrative guidelines and formatting blocks...',
      'Refining tone to sound supportive, clear, and professional...',
      'Compiling plain-English summary document package...'
    ];

    logList.forEach((msg, idx) => {
      setTimeout(() => {
        setAiHelperLogs(prev => [...prev, msg]);
      }, (idx + 1) * 280);
    });

    setTimeout(() => {
      setIsAiProcessing(false);
      playSuccess();

      const getValue = (id: string, defVal: string) => {
        const item = section.prompts.find(p => p.id === id);
        return item && item.currentValue.trim() ? item.currentValue.trim() : defVal;
      };

      let completedOutput = '';
      if (isAppInfo) {
        const appName = getValue('app_name', 'My App');
        const appType = getValue('app_type', 'Custom Mobile App');
        const stage = getValue('current_stage', 'initial concept');
        const audience = getValue('target_audience', 'interested users');
        const goal = getValue('user_goal', 'solve daily needs');
        const alt = getValue('current_alternative', 'manual sheets and checklists');
        const prob = getValue('problem_solved', 'unclear instructions or confusing workflows');
        const benefit = getValue('main_benefit', 'make operations smooth and stress-free');
        const difference = getValue('difference', 'very simple language and interactive guided widgets');
        const f1 = getValue('feature_1', 'Practical tasks check list');
        const f2 = getValue('feature_2', 'Polished onboarding text helper');
        const f3 = getValue('feature_3', 'Easy progress tracers block');

        completedOutput = `App Name: ${appName}\n` +
          `App Type: ${appType} (Current Stage: ${stage})\n` +
          `Primary Audience: ${audience}\n\n` +
          `App Summary:\n` +
          `${appName} is a brand new ${appType} created specifically for ${audience} who want to ${goal}. ` +
          `Currently, they must deal with ${alt} to get this done. ` +
          `Our app solves this by addressing ${prob}, letting users ${benefit}.\n\n` +
          `What makes us different:\n` +
          `${difference}\n\n` +
          `Core Focus Features:\n` +
          `• ${f1}\n` +
          `• ${f2}\n` +
          `• ${f3}`;
      } else {
        const lines = section.prompts.map(p => `${p.title}: ${p.currentValue || '(No answer provided)'}`).join('\n');
        completedOutput = `${section.title} Plan Outline:\n` +
          `==========================================\n` +
          `${lines}\n\n` +
          `Completed Checklist: ${completedChecklistCount} of ${totalChecklistCount} items checked.`;
      }

      setSection(prev => ({
        ...prev,
        suggestedSummary: completedOutput
      }));

      // Automatically expand preview so they see it!
      setIsSummaryOpen(true);
      addToast('App Summary Completed', 'Generated your new plain-English app summary. View preview below!');
    }, 1200);
  };

  // Mass draft compilation (fills empty fields with good suggestions)
  const handleBulkAutoDraft = () => {
    playPopup();
    addToast('AI Assist', 'Filling empty fields with supportive example templates...');
    setSection(prev => {
      const updatedPrompts = prev.prompts.map(p => {
        if (!p.currentValue.trim()) {
          return { ...p, currentValue: p.example };
        }
        return p;
      });
      const nextScore = calculateCompletionRate(updatedPrompts, prev.checklist);
      return {
        ...prev,
        prompts: updatedPrompts,
        completionRate: nextScore,
        status: determineStatus(nextScore, prev.status)
      };
    });
    playSuccess();
    addToast('Guided Templates Ready', 'Filled all empty parameters. You can edit or rewrite them!');
  };

  // Clean-up existing drafts to sound crisp and plain
  const handlePolishDraftTone = () => {
    playPopup();
    addToast('Polishing Tone', 'Refining current inputs to use simple, welcoming language...');
    setSection(prev => {
      const polished = prev.prompts.map(p => {
        if (p.currentValue.trim() && !p.currentValue.includes('(Simple draft completed)')) {
          return { ...p, currentValue: `${p.currentValue} (Simple draft completed)` };
        }
        return p;
      });
      return { ...prev, prompts: polished };
    });
    addToast('Tone Completed', 'Polished all existing text blocks to sound clear and friendly.');
  };

  // Directly sets completion status, fills fields and checklist
  const handleMarkDirectlyComplete = () => {
    playSuccess();
    setSection(prev => {
      const filledPrompts = prev.prompts.map(p => p.currentValue.trim() ? p : { ...p, currentValue: p.example });
      const checkedChecklist = prev.checklist.map(t => ({ ...t, completed: true }));
      return {
        ...prev,
        prompts: filledPrompts,
        checklist: checkedChecklist,
        completionRate: 100,
        status: 'Complete'
      };
    });
    addToast('Section Complete', `Awesome! Marked "${section.title}" as 100% complete.`);
  };

  // Count empty fields in current workspace
  const missingFieldsList = section.prompts.filter(p => p.currentValue.trim().length < 3);

  return (
    <div className="absolute inset-0 z-40 bg-[#03040C] flex flex-col items-center justify-start overflow-y-auto px-0 sm:px-4 py-0 sm:py-6 selection:bg-teal-500/20 selection:text-white">
      
      {/* Centered Device Wrapper Frame */}
      <div className="w-full max-w-lg bg-[#070A1F] border border-white/[0.04] sm:rounded-3xl shadow-2xl relative flex flex-col min-h-full overflow-hidden pb-28">
        
        {/* Soft Ambient Radiance spread */}
        <div className="absolute top-0 left-[-20%] w-[400px] h-[350px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

        {/* 1. COMPACT HEADER */}
        <CompactHeader 
          title={section.title}
          status={section.status}
          onBack={() => { playClick(); onBack(); }}
        />

        {/* 2. PROGRESS STRIP */}
        <ProgressStrip 
          completedCount={completedFieldsCount}
          totalCount={totalFieldsCount}
          percentage={section.completionRate}
        />

        <div className="px-4 py-1 space-y-4">
          
          {/* 3. STEP TABS PANEL */}
          <StepSelector 
            sectionId={section.id}
            steps={stepsList}
            activeIndex={activeStepIndex}
            onSelect={(idx) => { playClick(); setActiveStepIndex(idx); }}
          />

          {/* 4. CURRENT STEP CARD CONTENT */}
          <StepContentCard>
            {activeStepIndex < stepsList.length - 1 ? (
              <div className="space-y-4.5">
                {/* Features Helper Text Block banner */}
                {isAppInfo && activeStepIndex === 3 && (
                  <div className="p-3 bg-[#1500FD]/10 border border-blue-500/10 rounded-xl flex items-start gap-2 text-xs text-[#AAB2D5]/90">
                    <Info size={14} className="text-[#18D6C8] mt-0.5 shrink-0" />
                    <p>Keep your first version focused. Choose the three most important features.</p>
                  </div>
                )}

                {getFieldsForStep(activeStepIndex).map((prompt) => (
                  <CompactInputField 
                    key={prompt.id}
                    label={prompt.title}
                    helper={prompt.helper}
                    value={prompt.currentValue}
                    placeholder={prompt.placeholder}
                    onChange={(val) => handlePromptChange(prompt.id, val)}
                    example={prompt.example}
                    showExample={activeExamplePromptId === prompt.id}
                    onToggleExample={() => {
                      playClick();
                      setActiveExamplePromptId(activeExamplePromptId === prompt.id ? null : prompt.id);
                    }}
                    onHelpMeWrite={() => runSingleFieldAutoDraft(prompt.id)}
                  />
                ))}
              </div>
            ) : (
              /* Step 5: Summary step rendering */
              <div className="space-y-4">
                <div className="text-center py-2">
                  <span className="text-3xl">🎉</span>
                  <h3 className="font-semibold text-white mt-1 text-sm">Review Your Information</h3>
                  <p className="text-xs text-[#AAB2D5] mt-0.5">Check completed sections and build your plain text app summary.</p>
                </div>

                {/* Sub-Check on Missing Empty Fields progress indicator */}
                {missingFieldsList.length > 0 ? (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={15} className="text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Missing Fields Remaining ({missingFieldsList.length})</span>
                    </div>
                    <p className="text-[11px] text-[#AAB2D5] mb-2 leading-relaxed">
                      For a complete plan summary, try writing a sentence for these remaining parts:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {missingFieldsList.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            playClick();
                            // Locate which step contains this field and jump back
                            if (isAppInfo) {
                              const idx = section.prompts.indexOf(f);
                              if (idx !== -1) {
                                if (idx < 3) setActiveStepIndex(0);
                                else if (idx < 6) setActiveStepIndex(1);
                                else if (idx < 9) setActiveStepIndex(2);
                                else setActiveStepIndex(3);
                              }
                            } else {
                              const idx = section.prompts.indexOf(f);
                              if (idx !== -1) {
                                if (idx < 2) setActiveStepIndex(0);
                                else if (idx === 2) setActiveStepIndex(1);
                                else if (idx === 3) setActiveStepIndex(2);
                                else setActiveStepIndex(3);
                              }
                            }
                          }}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-[10px] text-amber-200 border border-amber-500/10 rounded-md transition-all font-medium"
                        >
                          {f.title} →
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Fantastic work! You have provided answers for all fields in this section.</span>
                  </div>
                )}

                {/* Direct buttons inside summary card panel */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    onClick={handleCreateAppSummary}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-[0.99] border border-blue-500/30 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10"
                  >
                    <RefreshCw size={13} className={isAiProcessing ? 'animate-spin' : ''} />
                    <span>Create App Summary</span>
                  </button>

                  <button
                    onClick={handleMarkDirectlyComplete}
                    disabled={section.status === 'Complete'}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 border ${
                      section.status === 'Complete'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-70'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white active:scale-[0.99]'
                    }`}
                  >
                    <Check size={13} />
                    <span>{section.status === 'Complete' ? 'Verification Complete' : 'Mark App Info Complete'}</span>
                  </button>
                </div>
              </div>
            )}
          </StepContentCard>

          {/* 5. LIVE COMPILER INTERACTIVE STATUS FEEDBACK PANEL */}
          <AnimatePresence>
            {isAiProcessing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-black/40 border border-[#18D6C8]/30 rounded-2xl p-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-2 mb-2 border-b border-white/[0.04] pb-1.5">
                  <span className="w-1.5 h-1.5 bg-[#18D6C8] rounded-full animate-ping" />
                  <span className="font-mono text-[9px] text-[#18D6C8] uppercase font-bold tracking-wide">AI Assist Compiler Terminal</span>
                </div>
                <div className="space-y-1 font-mono text-[9.5px] text-[#AAB2D5] leading-relaxed">
                  {aiHelperLogs.map((log, lIdx) => (
                    <div key={lIdx} className="flex gap-1.5 items-start">
                      <span className="text-[#18D6C8] select-none">&gt;&gt;</span>
                      <span className="break-all">{log}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6. COLLAPSED SECONDARY SECTIONS */}
          <div className="space-y-2.5 pt-2">
            
            {/* Checklist items section */}
            <CollapsibleSection
              title="Checklist & To-Dos"
              icon="✔️"
              isOpen={isChecklistOpen}
              onToggle={() => { playClick(); setIsChecklistOpen(!isChecklistOpen); }}
            >
              <div className="space-y-2 pt-1">
                {section.checklist.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      task.completed 
                        ? 'bg-emerald-500/5 border-emerald-500/10 opacity-80' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                    }`}
                  >
                    <button
                      onClick={() => handleChecklistToggle(task.id)}
                      className="mt-0.5 focus:outline-none shrink-0"
                    >
                      {task.completed ? (
                        <div className="w-4.5 h-4.5 rounded bg-gradient-to-br from-emerald-400 to-[#18D6C8] flex items-center justify-center text-black">
                          <Check size={11} strokeWidth={4} />
                        </div>
                      ) : (
                        <div className="w-4.5 h-4.5 rounded border border-white/20 bg-black/40 hover:border-teal-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${task.completed ? 'text-zinc-550 line-through' : 'text-white'}`}>
                          {task.title}
                        </span>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                          task.completed 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : task.priority === 'High' 
                            ? 'bg-rose-500/10 text-rose-300' 
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {task.completed ? 'COMPLETED' : task.priority}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#AAB2D5] mt-0.5 leading-normal">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* AI Assist Section */}
            <CollapsibleSection
              title="AI Assist"
              icon="✏️"
              isOpen={isWritingHelpOpen}
              onToggle={() => { playClick(); setIsWritingHelpOpen(!isWritingHelpOpen); }}
            >
              <WritingHelpPanel 
                onFillBlanks={handleBulkAutoDraft}
                onPolishTone={handlePolishDraftTone}
                onGenerateSummary={handleCreateAppSummary}
              />
            </CollapsibleSection>

            {/* App Summary Preview Section */}
            <CollapsibleSection
              title="Summary Preview"
              icon="📄"
              isOpen={isSummaryOpen}
              onToggle={() => { playClick(); setIsSummaryOpen(!isSummaryOpen); }}
            >
              <AppSummaryPreview 
                summary={section.suggestedSummary}
                onCopy={() => {
                  playClick();
                  navigator.clipboard.writeText(section.suggestedSummary);
                  addToast('Copied to Clipboard', 'Successfully copied app summary draft!');
                }}
                onRegenerate={handleCreateAppSummary}
              />
            </CollapsibleSection>

          </div>
        </div>

        {/* 7. STICKY BOTTOM ACTION BAR */}
        <BottomActionBar 
          activeStep={activeStepIndex}
          totalSteps={stepsList.length}
          onSecondaryAction={() => {
            playClick();
            setIsWritingHelpOpen(true);
            // Scroll to AI Assist or expand smoothly
            addToast('AI Assist Opened', 'Scrolled to copywriting tools assistance.');
          }}
          onPrimaryAction={() => {
            playClick();
            if (activeStepIndex < stepsList.length - 1) {
              setActiveStepIndex(prev => prev + 1);
            } else {
              handleCreateAppSummary();
            }
          }}
        />

      </div>

      {/* Decorative desktop-only prompt guidelines helper info footer */}
      <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#AAB2D5]/70 mt-3 font-mono">
        <span>Press</span>
        <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-400">Esc</kbd>
        <span>to exit blueprint details view at any time.</span>
      </div>

    </div>
  );
}

// ==========================================
// 4. MODULAR CORE SUB-COMPONENTS
// ==========================================

// --- COMPACT HEADER ---
interface CompactHeaderProps {
  title: string;
  status: StatusType;
  onBack: () => void;
}

function CompactHeader({ title, status, onBack }: CompactHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.04] bg-slate-950/20 relative z-10 w-full shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <button 
          onClick={onBack}
          className="p-1.5 hover:bg-white/[0.04] active:scale-95 text-white/90 rounded-lg cursor-pointer transition-all flex items-center justify-center shrink-0"
          id="btn-app-info-back"
        >
          <ArrowLeft size={16} />
        </button>
        
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#AAB2D5] font-semibold uppercase tracking-wider block">Blueprints</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
              status === 'Complete' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-indigo-500/15 border-indigo-500/20 text-[#18D6C8]'
            }`}>
              {status}
            </span>
          </div>
          <h1 className="font-bold text-base text-white tracking-tight leading-tight truncate">
            {title === 'App Info & Identity' ? 'App Info' : title}
          </h1>
        </div>
      </div>
      
      <p className="text-[10px] text-zinc-400 italic hidden xs:block shrink-0">
        Launch Plan Section
      </p>
    </div>
  );
}

// --- PROGRESS STRIP ---
interface ProgressStripProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
}

function ProgressStrip({ completedCount, totalCount, percentage }: ProgressStripProps) {
  return (
    <div className="px-4 py-2 border-b border-white/[0.03] bg-black/10 flex items-center justify-between gap-4 w-full shrink-0">
      <div className="flex-1 min-w-0 max-w-[65%]">
        <div className="flex items-center justify-between text-[10.5px] text-[#AAB2D5] mb-1 font-mono">
          <span className="truncate">{completedCount} of {totalCount} fields complete</span>
          <span className="font-bold text-white shrink-0">{percentage}%</span>
        </div>
        <ProgressBar progress={percentage} />
      </div>

      <div className="bg-white/[0.03] border border-white/5 px-2.5 py-1.5 rounded-xl text-center shrink-0 min-w-[70px]">
        <span className="text-[9px] font-mono tracking-widest text-[#18D6C8] uppercase block leading-none font-bold">Progress</span>
        <span className="text-base font-bold text-white block mt-0.5 font-sans leading-none">{percentage}%</span>
      </div>
    </div>
  );
}

// --- PROGRESS BAR ---
interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
      <motion.div 
        className="h-full bg-gradient-to-r from-teal-400 to-[#18D6C8] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

// --- STEP SELECTOR ---
const getStepMetadata = (sectionId: string, idx: number) => {
  const defaults = [
    { icon: Info, sub: 'Setup' },
    { icon: FileText, sub: 'Details' },
    { icon: Zap, sub: 'Core Data' },
    { icon: Shield, sub: 'Guidelines' },
    { icon: ClipboardCheck, sub: 'Summary' }
  ];

  const map: Record<string, { icon: React.ComponentType<any>; sub: string }[]> = {
    app_info: [
      { icon: Info, sub: 'Name & Type' },
      { icon: Users, sub: 'Target Users' },
      { icon: Zap, sub: 'Core Reward' },
      { icon: ListTodo, sub: 'Key Features' },
      { icon: ClipboardCheck, sub: 'Review' }
    ],
    app_store: [
      { icon: Info, sub: 'Title & Sub' },
      { icon: FileText, sub: 'Keywords' },
      { icon: Zap, sub: 'Descriptions' },
      { icon: Shield, sub: 'Support URL' },
      { icon: ClipboardCheck, sub: 'Store Summary' }
    ],
    legal: [
      { icon: Info, sub: 'Entity Name' },
      { icon: Shield, sub: 'Privacy URL' },
      { icon: Users, sub: 'Data Gathered' },
      { icon: FileText, sub: 'Terms & Age' },
      { icon: ClipboardCheck, sub: 'Compliance' }
    ],
    marketing: [
      { icon: Info, sub: 'Launch Tagline' },
      { icon: FileText, sub: 'Landing Link' },
      { icon: Zap, sub: 'PH Slogan' },
      { icon: Users, sub: 'Channels' },
      { icon: ClipboardCheck, sub: 'Marketing Plan' }
    ],
    beta: [
      { icon: Users, sub: 'Tester count' },
      { icon: Shield, sub: 'Feedback link' },
      { icon: Info, sub: 'Welcome line' },
      { icon: Zap, sub: 'Beta Duration' },
      { icon: ClipboardCheck, sub: 'Testing Plan' }
    ],
    pre_launch: [
      { icon: Shield, sub: 'Bundle ID' },
      { icon: Zap, sub: 'Pricing model' },
      { icon: Info, sub: 'Icon details' },
      { icon: FileText, sub: 'Distribution' },
      { icon: ClipboardCheck, sub: 'Pre-launch plan' }
    ],
    launch_day: [
      { icon: Zap, sub: 'Hype slogan' },
      { icon: Users, sub: 'Communities' },
      { icon: Shield, sub: 'Support checks' },
      { icon: Info, sub: 'Success goals' },
      { icon: ClipboardCheck, sub: 'Launch Plan' }
    ],
    post_launch: [
      { icon: Info, sub: 'Rating prompt' },
      { icon: Zap, sub: 'v1.1 features' },
      { icon: Users, sub: 'Retention rate' },
      { icon: Shield, sub: 'Referral plan' },
      { icon: ClipboardCheck, sub: 'Scale Plan' }
    ]
  };

  return map[sectionId]?.[idx] || defaults[idx] || defaults[4];
};

interface StepSelectorProps {
  sectionId: string;
  steps: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function StepSelector({ sectionId, steps, activeIndex, onSelect }: StepSelectorProps) {
  return (
    <div className="w-full select-none py-2 relative overflow-hidden bg-white/[0.01] border border-white/[0.03] rounded-2xl p-3 shrink-0">
      {/* Horizontal Connector Line running behind */}
      <div className="absolute top-[31px] left-[12%] right-[12%] h-[2px] bg-white/[0.04] pointer-events-none rounded-full" />
      
      {/* Active Line Progress Tracker (smooth transition) */}
      <motion.div 
        className="absolute top-[31px] left-[12%] h-[2px] bg-gradient-to-r from-[#1500FD] to-[#18D6C8] pointer-events-none rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(activeIndex / (steps.length - 1)) * 76}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      />

      <div className="flex items-start justify-between relative z-10 w-full gap-1">
        {steps.map((step, idx) => {
          const isActive = activeIndex === idx;
          const isCompleted = idx < activeIndex;
          const metadata = getStepMetadata(sectionId, idx);
          const StepIcon = metadata.icon;
          const subLabel = metadata.sub;

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className="flex flex-col items-center flex-1 cursor-pointer group focus:outline-none min-w-[58px]"
            >
              {/* The Step Icon inside Circle */}
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all bg-[#070A1F] border ${
                  isActive 
                    ? 'border-[#18D6C8] text-[#18D6C8] shadow-[0_0_12px_rgba(24,214,200,0.2)] scale-110'
                    : isCompleted
                      ? 'border-[#1500FD]/60 text-[#18D6C8]/80'
                      : 'border-white/[0.08] text-[#AAB2D5]/40 group-hover:border-white/20 group-hover:text-[#AAB2D5]/80'
                }`}
              >
                <StepIcon size={14} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* Step Main Title label */}
              <span 
                className={`text-[9px] font-bold mt-2 tracking-wide text-center truncate w-full px-0.5 transition-colors ${
                  isActive 
                    ? 'text-white font-extrabold' 
                    : isCompleted 
                      ? 'text-white/60' 
                      : 'text-[#AAB2D5]/50 group-hover:text-[#AAB2D5]/80'
                }`}
              >
                {step}
              </span>

              {/* Small descriptive text label beneath */}
              <span 
                className={`text-[8px] mt-0.5 leading-none px-0.5 text-center font-mono w-full truncate uppercase tracking-widest transition-colors ${
                  isActive 
                    ? 'text-[#18D6C8] font-semibold' 
                    : isCompleted 
                      ? 'text-[#18D6C8]/40' 
                      : 'text-[#AAB2D5]/30'
                }`}
              >
                {subLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- STEP CONTENT CARD ---
interface StepContentCardProps {
  children: React.ReactNode;
}

function StepContentCard({ children }: StepContentCardProps) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.05] rounded-2xl p-4.5 w-full shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
      {children}
    </div>
  );
}

// --- COMPACT INPUT FIELD ---
interface CompactInputFieldProps {
  label: string;
  helper: string;
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  example: string;
  showExample: boolean;
  onToggleExample: () => void;
  onHelpMeWrite: () => void;
  key?: string;
}

function CompactInputField({
  label,
  helper,
  value,
  placeholder,
  onChange,
  example,
  showExample,
  onToggleExample,
  onHelpMeWrite
}: CompactInputFieldProps) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-baseline justify-between gap-2.5">
        <label className="text-xs font-bold text-[#FFF7EA] block">
          {label}
        </label>
        <span className="text-[10px] text-zinc-500 font-mono tracking-tight leading-none">Optional</span>
      </div>
      
      <p className="text-[10.5px] text-[#AAB2D5] leading-normal font-sans">
        {helper}
      </p>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={value ? Math.min(Math.max(value.split('\n').length, 2), 15) : 2}
          className="w-full bg-[#040815]/90 text-white text-xs border border-white/10 rounded-xl px-3 py-2.5 focus:border-[#18D6C8]/50 focus:outline-none transition-all placeholder-zinc-650 resize-y min-h-[60px] font-bold shadow-inner"
        />
      </div>

      <div className="flex items-center justify-between gap-4 text-[10.5px] font-sans px-0.5">
        <button
          type="button"
          onClick={onToggleExample}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer select-none py-0.5 focus:outline-none"
        >
          {showExample ? 'Hide example ▲' : 'Show example ▼'}
        </button>

        <button
          type="button"
          onClick={onHelpMeWrite}
          className="text-[#18D6C8] hover:text-[#18D6C8]/80 transition-colors cursor-pointer select-none py-0.5 flex items-center gap-1 focus:outline-none font-semibold"
        >
          <Sparkles size={11} />
          <span>Help me write this</span>
        </button>
      </div>

      <AnimatePresence>
        {showExample && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2.5 bg-black/40 border border-white/[0.04] rounded-xl text-[10.5px] italic text-zinc-300 leading-relaxed font-mono">
              <span className="font-sans font-bold text-zinc-400 not-italic block mb-0.5">Guided Template:</span>
              "{example}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COLLAPSIBLE SECTION ---
interface CollapsibleSectionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="bg-[#0b0e24]/60 border border-white/[0.04] rounded-2xl overflow-hidden shadow-sm transition-colors hover:border-white/[0.08] w-full shrink-0">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="font-bold text-[#FFF7EA] text-xs uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <span className="text-[10px] uppercase font-mono tracking-widest">{isOpen ? 'Hide' : 'Show'}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 pb-3.5 border-t border-white/[0.02] bg-black/10 overflow-hidden"
          >
            <div className="pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- AI ASSIST PANEL ---
interface WritingHelpPanelProps {
  onFillBlanks: () => void;
  onPolishTone: () => void;
  onGenerateSummary: () => void;
}

function WritingHelpPanel({ onFillBlanks, onPolishTone, onGenerateSummary }: WritingHelpPanelProps) {
  return (
    <div className="space-y-3 pt-1">
      <p className="text-[10.5px] text-[#AAB2D5] leading-relaxed">
        Stuck on what to write? We can help you create baseline drafts or polish your current style.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={onFillBlanks}
          className="p-2.5 bg-[#040815] border border-white/5 hover:border-[#18D6C8]/40 hover:bg-[#070e28] text-left rounded-xl transition-all cursor-pointer group/card flex flex-col justify-between"
          id="btn-help-fill"
        >
          <div className="w-5 h-5 rounded bg-teal-500/10 text-[#18D6C8] flex items-center justify-center border border-teal-500/20 mb-1.5 shrink-0">
            <Sparkles size={11} />
          </div>
          <div>
            <span className="font-bold text-[11px] text-white block truncate uppercase tracking-tight group-hover/card:text-[#18D6C8]">Fill Empty Fields</span>
            <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">Fills blank areas with example responses</span>
          </div>
        </button>

        <button
          onClick={onPolishTone}
          className="p-2.5 bg-[#040815] border border-white/5 hover:border-purple-500/40 hover:bg-[#070e28] text-left rounded-xl transition-all cursor-pointer group/card flex flex-col justify-between"
          id="btn-help-polish"
        >
          <div className="w-5 h-5 rounded bg-purple-500/10 text-purple-300 flex items-center justify-center border border-purple-500/20 mb-1.5 shrink-0">
            <RefreshCw size={11} />
          </div>
          <div>
            <span className="font-bold text-[11px] text-white block truncate uppercase tracking-tight group-hover/card:text-purple-300">Polish Tone</span>
            <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">Refines current drafts for maximum clarity</span>
          </div>
        </button>

        <button
          onClick={onGenerateSummary}
          className="p-2.5 bg-[#040815] border border-white/5 hover:border-blue-500/40 hover:bg-[#070e28] text-left rounded-xl transition-all cursor-pointer group/card flex flex-col justify-between"
          id="btn-help-summary"
        >
          <div className="w-5 h-5 rounded bg-blue-500/10 text-brand-blue-light flex items-center justify-center border border-blue-500/20 mb-1.5 shrink-0">
            <FileText size={11} />
          </div>
          <div>
            <span className="font-bold text-[11px] text-white block truncate uppercase tracking-tight group-hover/card:text-blue-300">Review Summary</span>
            <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">Compiles your inputs to a final report text</span>
          </div>
        </button>
      </div>
    </div>
  );
}

// --- APP SUMMARY PREVIEW ---
interface AppSummaryPreviewProps {
  summary: string;
  onCopy: () => void;
  onRegenerate: () => void;
}

function AppSummaryPreview({ summary, onCopy, onRegenerate }: AppSummaryPreviewProps) {
  return (
    <div className="space-y-3 pt-1">
      <div className="bg-[#040815] border border-white/5 p-3 rounded-xl select-all">
        <pre className="font-mono text-[10.5px] text-indigo-100/95 leading-relaxed whitespace-pre-wrap">
          {summary || 'No summary generated yet. Answer fields on active tabs and click "Create App Summary" to generate details!'}
        </pre>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={onRegenerate}
          className="flex-1 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <RefreshCw size={11} className="text-[#18D6C8]" />
          <span>Regenerate Summary</span>
        </button>

        <button
          onClick={onCopy}
          className="flex-1 py-1.5 bg-gradient-to-r from-teal-400/20 to-teal-400/10 border border-[#18D6C8]/30 hover:border-[#18D6C8]/60 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <Copy size={11} className="text-[#18D6C8]" />
          <span>Copy to Clipboard</span>
        </button>
      </div>
    </div>
  );
}

// --- BOTTOM ACTION BAR ---
interface BottomActionBarProps {
  activeStep: number;
  totalSteps: number;
  onSecondaryAction: () => void;
  onPrimaryAction: () => void;
}

function BottomActionBar({ activeStep, totalSteps, onSecondaryAction, onPrimaryAction }: BottomActionBarProps) {
  const isLast = activeStep === totalSteps - 1;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-xl border-t border-white/[0.05] p-3 flex items-center justify-between gap-3 px-4 w-full h-[64px] shrink-0">
      <button 
        onClick={onSecondaryAction}
        className="px-3.5 h-10 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[#FFF7EA] rounded-xl text-xs font-semibold select-none cursor-pointer transition-all flex items-center justify-center gap-1 focus:outline-none"
        id="btn-sticky-secondary-action"
      >
        <Sparkles size={12} className="text-[#18D6C8]" />
        <span>AI Assist</span>
      </button>

      <button 
        onClick={onPrimaryAction}
        className="flex-1 max-w-[190px] h-10 bg-[#1500FD] hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider select-none cursor-pointer transition-all flex items-center justify-center gap-1 focus:outline-none shadow-md"
        id="btn-sticky-primary-action"
      >
        <span>{isLast ? 'Create App Summary' : 'Save & Continue'}</span>
        {!isLast && <ArrowRight size={12} />}
      </button>
    </div>
  );
}
