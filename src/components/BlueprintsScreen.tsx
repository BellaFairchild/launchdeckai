import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Lock, CheckCircle2, Rocket, 
  FileText, Shield, Megaphone, Users, ListChecks, 
  HelpCircle, ChevronRight, Activity, Cpu, Calendar,
  Check, ArrowUpRight, Zap, Target, BookOpen, AlertCircle,
  Undo2, Settings, Compass, Info, FileCode2, Award, Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { BlueprintDetailScreen } from './BlueprintDetailScreen';
import { useToast } from './ToastContext';
import { playClick, playSuccess, playPopup } from '../lib/audio';

// --- TS Types ---
interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

interface BlueprintSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'Complete' | 'In Progress' | 'Needs Review' | 'Locked' | 'Not Started';
  color: string;       // Text & highlights color
  bgColor: string;     // bg pill color
  borderColor: string; // border custom color
  glowColor: string;   // shadow / glow pulse
  tasks: TaskItem[];
}

// Custom Counter for smooth number changes
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const duration = 500; // ms
    const startTime = performance.now();
    const startValue = displayValue;

    let frameId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo formula
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (value - startValue) * ease;
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

export function BlueprintsScreen() {
  const { addToast } = useToast();

  // --- 1. Interactive Mission Customization States ---
  const [appName, setAppName] = useState(() => localStorage.getItem('ld_blueprint_appName') || 'LaunchDeckAI');
  const [targetLaunch, setTargetLaunch] = useState(() => localStorage.getItem('ld_blueprint_targetLaunch') || 'October 2026');
  const [missionStatement, setMissionStatement] = useState(() => localStorage.getItem('ld_blueprint_missionStatement') || 'An AI-powered launch control deck for first-time app creators to publish without the overwhelm.');
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);

  // Keep state synced
  useEffect(() => {
    localStorage.setItem('ld_blueprint_appName', appName);
  }, [appName]);
  useEffect(() => {
    localStorage.setItem('ld_blueprint_targetLaunch', targetLaunch);
  }, [targetLaunch]);
  useEffect(() => {
    localStorage.setItem('ld_blueprint_missionStatement', missionStatement);
  }, [missionStatement]);

  // --- 2. Dynamic Blueprint Sections State ---
  const [sections, setSections] = useState<BlueprintSection[]>(() => {
    const saved = localStorage.getItem('ld_blueprint_sections_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map icon component back
        return parsed.map((s: any) => {
          let icon = Info;
          if (s.id === 'app_info') icon = FileText;
          if (s.id === 'app_store') icon = Rocket;
          if (s.id === 'legal') icon = Shield;
          if (s.id === 'marketing') icon = Megaphone;
          if (s.id === 'beta') icon = Users;
          if (s.id === 'pre_launch') icon = ListChecks;
          if (s.id === 'launch_day') icon = Target;
          if (s.id === 'post_launch') icon = Award;
          return { ...s, icon };
        });
      } catch (e) {
        console.error("Failed to load saved blueprints, fallback to default", e);
      }
    }

    // Default configuration matching user requirements
    return [
      {
        id: 'app_info',
        title: 'App Info',
        description: 'Define your app name structure, unique promise, and brand audience values.',
        icon: FileText,
        status: 'Complete',
        color: 'text-brand-teal',
        bgColor: 'bg-brand-teal/10',
        borderColor: 'border-brand-teal/30',
        glowColor: 'rgba(77, 200, 192, 0.4)',
        tasks: [
          { id: 'ai_1', title: 'Lock down final app name structure', completed: true, notes: 'LaunchDeckAI (Clear & descriptive)' },
          { id: 'ai_2', title: 'Refine core target audience group', completed: true, notes: 'Developers, indie hackers, solo creators' },
          { id: 'ai_3', title: 'Draft high-impact 1-liner pitch', completed: true, notes: 'Mission control center for launching apps' },
          { id: 'ai_4', title: 'Confirm value-proposition checklist', completed: true, notes: 'Reduce launch time by 80% with automated kits' },
          { id: 'ai_5', title: 'Define visual brand & color scheme', completed: true, notes: 'Slate & Deep Space themed UI' }
        ]
      },
      {
        id: 'app_store',
        title: 'App Store Set',
        description: 'Prepare your title, localized keyword strategy, descriptions, and mock screens.',
        icon: Rocket,
        status: 'In Progress',
        color: 'text-brand-blue-light',
        bgColor: 'bg-brand-blue/20',
        borderColor: 'border-brand-blue/40',
        glowColor: 'rgba(59, 130, 246, 0.4)',
        tasks: [
          { id: 'as_1', title: 'Write optimized app store title (30 chars max)', completed: true, notes: 'LaunchDeckAI: Easy App Publishing' },
          { id: 'as_2', title: 'Write keyword-rich subtitle (30 chars max)', completed: false, notes: 'Launch checklists & templates' },
          { id: 'as_3', title: 'Compile set of 100 high-relevance search terms', completed: true, notes: 'indie hacker, app store optimizer, launch day' },
          { id: 'as_4', title: 'Map full design layouts for 5 core screenshots', completed: false, notes: 'Focus on dark, premium cockpit visuals' },
          { id: 'as_5', title: 'Draft comprehensive promotional description', completed: false, notes: 'Explain streak trackers and asset tools' }
        ]
      },
      {
        id: 'legal',
        title: 'Legal & Privacy',
        description: 'Track secure privacy links, user terms, and basic data safety audits.',
        icon: Shield,
        status: 'Needs Review',
        color: 'text-brand-flame',
        bgColor: 'bg-brand-flame/10',
        borderColor: 'border-brand-flame/30',
        glowColor: 'rgba(255, 214, 90, 0.3)',
        tasks: [
          { id: 'lg_1', title: 'Draft custom Privacy Policy document link', completed: true, notes: 'Validated via auto-generator tool' },
          { id: 'lg_2', title: 'Complete standard Terms & Conditions agreement', completed: false, notes: 'Needs custom intellectual property clause' },
          { id: 'lg_3', title: 'Fill out Apple / Google Data Safety disclosures', completed: true, notes: 'Tracks analytics & streak history' },
          { id: 'lg_4', title: 'Complete Child protection privacy assessments', completed: false, notes: 'App requires age rating above 13+' },
          { id: 'lg_5', title: 'Audit AI contents & external asset compliance', completed: false, notes: 'Confirm licenses of sound effects and AI guides' }
        ]
      },
      {
        id: 'marketing',
        title: 'Launch Marketing',
        description: 'Design waitlist grids, Product Hunt teaser assets, and social threads.',
        icon: Megaphone,
        status: 'Not Started',
        color: 'text-[#FF6FAE]',
        bgColor: 'bg-[#FF6FAE]/10',
        borderColor: 'border-[#FF6FAE]/30',
        glowColor: 'rgba(255, 110, 174, 0.4)',
        tasks: [
          { id: 'mk_1', title: 'Create high-conversion product landing page', completed: false },
          { id: 'mk_2', title: 'Write 3-part email launch sequence for waitlist', completed: false },
          { id: 'mk_3', title: 'Storyboard high-impact Product Hunt launch text', completed: false },
          { id: 'mk_4', title: 'Design social promotion image banners and covers', completed: false },
          { id: 'mk_5', title: 'Draft initial X/Twitter drop thread structure', completed: false }
        ]
      },
      {
        id: 'beta',
        title: 'Beta Telemetry',
        description: 'Recruit first 100 beta testers, feedback forms, and crash analytics logs.',
        icon: Users,
        status: 'Not Started',
        color: 'text-[#E91E8C]',
        bgColor: 'bg-[#E91E8C]/10',
        borderColor: 'border-[#E91E8C]/30',
        glowColor: 'rgba(233, 30, 140, 0.3)',
        tasks: [
          { id: 'bt_1', title: 'Set up TestFlight external beta group limit', completed: false },
          { id: 'bt_2', title: 'Connect feedback forms or contact address links', completed: false },
          { id: 'bt_3', title: 'Configure real-time crash error analytics logs', completed: false },
          { id: 'bt_4', title: 'Draft bug tracking dashboard or workspace document', completed: false },
          { id: 'bt_5', title: 'Write detailed onboarding manual for early testers', completed: false }
        ]
      },
      {
        id: 'pre_launch',
        title: 'Pre-Launch Checks',
        description: 'Complete package validations, certificates, and final store submission drafts.',
        icon: ListChecks,
        status: 'Locked',
        color: 'text-text-secondary',
        bgColor: 'bg-white/5',
        borderColor: 'border-white/10',
        glowColor: 'rgba(255, 255, 255, 0.05)',
        tasks: [
          { id: 'pl_1', title: 'Perform final app package store build validation', completed: false },
          { id: 'pl_2', title: 'Verify custom app icon visuals and formats', completed: false },
          { id: 'pl_3', title: 'Configure in-app store pricing & subscription options', completed: false },
          { id: 'pl_4', title: 'Configure release option settings (manual vs auto)', completed: false },
          { id: 'pl_5', title: 'Request dynamic store content age ratings', completed: false }
        ]
      },
      {
        id: 'launch_day',
        title: 'Launch Blastoff',
        description: 'Coordinate live URLs, social media drops, and server monitoring dashboards.',
        icon: Target,
        status: 'Locked',
        color: 'text-text-secondary',
        bgColor: 'bg-white/5',
        borderColor: 'border-white/10',
        glowColor: 'rgba(255, 255, 255, 0.05)',
        tasks: [
          { id: 'ld_1', title: 'Unlock public App Store & Play Store URL links', completed: false },
          { id: 'ld_2', title: 'Dispatch launch day announcement posts & emails', completed: false },
          { id: 'ld_3', title: 'Set up real-time server and performance dashboards', completed: false },
          { id: 'ld_4', title: 'Respond to launch reviews & early customer feedback', completed: false },
          { id: 'ld_5', title: 'Trigger PR outreach and indie product board submissions', completed: false }
        ]
      },
      {
        id: 'post_launch',
        title: 'Post-Launch Orbit',
        description: 'Integrate App Store rating prompts, track organic retention, and design referral logic.',
        icon: Award,
        status: 'Locked',
        color: 'text-text-secondary',
        bgColor: 'bg-white/5',
        borderColor: 'border-white/10',
        glowColor: 'rgba(255, 255, 255, 0.05)',
        tasks: [
          { id: 'po_1', title: 'Implement in-app rating reminder prompt script', completed: false },
          { id: 'po_2', title: 'Monitor early-stage retention metrics and metrics', completed: false },
          { id: 'po_3', title: 'Publish early v1.0.1 hotfix patches as required', completed: false },
          { id: 'po_4', title: 'Map future product growth features list', completed: false },
          { id: 'po_5', title: 'Design referral viral booster rewards structures', completed: false }
        ]
      }
    ];
  });

  // Calculate dynamic statistics
  const totalTasks = sections.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedTasks = sections.reduce((sum, s) => sum + s.tasks.filter(t => t.completed).length, 0);
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Let's compute completed sections count (a section is Complete if all its tasks are completed)
  const completedSectionsCount = sections.filter(s => s.tasks.every(t => t.completed)).length;
  // Needs Attention are sections that are In Progress or Needs Review or Not Started but have at least one completed task OR are flagged.
  const needsAttentionCount = sections.filter(s => s.status === 'In Progress' || s.status === 'Needs Review').length;

  // Save changes to localStorage helper
  const saveSections = (updated: BlueprintSection[]) => {
    setSections(updated);
    // Strip icon key before serializing
    const stripped = updated.map(s => {
      const { icon, ...rest } = s;
      return rest;
    });
    localStorage.setItem('ld_blueprint_sections_v2', JSON.stringify(stripped));
  };

  // --- Task toggle helper (Updates individual sub-tasks, recalculates status, supports locking/unlocking downstream) ---
  const handleToggleTask = (sectionId: string, taskId: string) => {
    playClick();

    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const targetSection = sections[sectionIndex];
    
    // Check if locked
    if (targetSection.status === 'Locked') {
      addToast('Section Engaged', 'This launch phase is currently locked. Complete previous checklists to open.');
      return;
    }

    const updatedTasks = targetSection.tasks.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          playSuccess();
        }
        return { ...t, completed: nextState };
      }
      return t;
    });

    const completedInSec = updatedTasks.filter(t => t.completed).length;
    const totalInSec = updatedTasks.length;
    
    // Determine new status for this section
    let newStatus: BlueprintSection['status'] = 'Not Started';
    if (completedInSec === totalInSec) {
      newStatus = 'Complete';
    } else if (completedInSec > 0) {
      newStatus = 'In Progress';
    } else {
      newStatus = 'Not Started';
    }
    
    // Maintain "Needs Review" label if it had no completed tasks but was flagged
    if (targetSection.status === 'Needs Review' && completedInSec > 0 && completedInSec < totalInSec) {
      newStatus = 'Needs Review';
    }

    // Build absolute new array
    let updatedSections = sections.map((sec, idx) => {
      if (idx === sectionIndex) {
        return {
          ...sec,
          tasks: updatedTasks,
          status: newStatus,
          // Sync visually
          color: newStatus === 'Complete' ? 'text-brand-teal' : (newStatus === 'In Progress' ? 'text-brand-blue-light' : sec.color),
          bgColor: newStatus === 'Complete' ? 'bg-brand-teal/10' : (newStatus === 'In Progress' ? 'bg-brand-blue/20' : sec.bgColor),
          borderColor: newStatus === 'Complete' ? 'border-brand-teal/30' : (newStatus === 'In Progress' ? 'border-brand-blue/40' : sec.borderColor),
          glowColor: newStatus === 'Complete' ? 'rgba(77,200,192,0.4)' : (newStatus === 'In Progress' ? 'rgba(59,130,246,0.4)' : sec.glowColor)
        };
      }
      return sec;
    });

    // --- Dynamic Phase Unlock Engine ---
    // If the first 3 sections (App Info, App Store, Legal) has certain progress, unlock Marketing & Beta Testing!
    const coreCompletedCount = updatedSections.slice(0, 3).reduce((sum, s) => sum + s.tasks.filter(t => t.completed).length, 0);
    const coreTotalCount = updatedSections.slice(0, 3).reduce((sum, s) => sum + s.tasks.length, 0);
    const coreCompleteness = coreCompletedCount / coreTotalCount;

    updatedSections = updatedSections.map((sec, idx) => {
      // Unlock Marketing & Beta if Core is > 40% complete
      if ((sec.id === 'marketing' || sec.id === 'beta') && sec.status === 'Locked' && coreCompleteness >= 0.4) {
        addToast('Sector Unlocked', `Mission progress cleared: ${sec.title} phase in launch sequence is now ACTIVE!`);
        return {
          ...sec,
          status: 'Not Started',
          color: sec.id === 'marketing' ? 'text-[#FF6FAE]' : 'text-[#E91E8C]',
          bgColor: sec.id === 'marketing' ? 'bg-[#FF6FAE]/10' : 'bg-[#E91E8C]/10',
          borderColor: sec.id === 'marketing' ? 'border-[#FF6FAE]/30' : 'border-[#E91E8C]/30',
          glowColor: sec.id === 'marketing' ? 'rgba(255,110,174,0.4)' : 'rgba(233,30,140,0.3)'
        };
      }

      // Unlock Pre-Launch, Launch Day, Post-Launch sequential stages if all previous parts are in progress or finished!
      if (sec.id === 'pre_launch' && sec.status === 'Locked') {
        const previousAllStarted = updatedSections.slice(0, 5).every(s => s.status !== 'Not Started' && s.status !== 'Locked');
        if (previousAllStarted) {
          addToast('Ready for Pre-Launch', 'Telemetry clear for Final Pre-Launch Checks!');
          return {
            ...sec,
            status: 'Not Started',
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            borderColor: 'border-brand-teal/30',
            glowColor: 'rgba(77,200,192,0.4)'
          };
        }
      }

      if (sec.id === 'launch_day' && sec.status === 'Locked') {
        const preLaunchDone = updatedSections.find(s => s.id === 'pre_launch')?.status === 'Complete';
        if (preLaunchDone) {
          addToast('Blastoff Protocol Ready', 'SYSTEM STATUS: Clear for Launch Day execution!');
          return {
            ...sec,
            status: 'Not Started',
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10',
            borderColor: 'border-brand-gold/30',
            glowColor: 'rgba(243,178,51,0.4)'
          };
        }
      }

      if (sec.id === 'post_launch' && sec.status === 'Locked') {
        const launchDayDone = updatedSections.find(s => s.id === 'launch_day')?.status === 'Complete';
        if (launchDayDone) {
          addToast('Post-Launch Core Sync', 'Orbit attained. Post-Launch checklist is now online!');
          return {
            ...sec,
            status: 'Not Started',
            color: 'text-[#E91E8C]',
            bgColor: 'bg-[#E91E8C]/10',
            borderColor: 'border-[#E91E8C]/30',
            glowColor: 'rgba(233,30,140,0.3)'
          };
        }
      }

      return sec;
    });

    saveSections(updatedSections);
  };

  // --- 3. Interactive Checklist Details Panel States ---
  const [activeChecklistSecId, setActiveChecklistSecId] = useState<string | null>(null);
  const [selectedDetailSecId, setSelectedDetailSecId] = useState<string | null>(null);

  // --- 4. Astro AI Assistance Simulations ---
  const [astroProcessing, setAstroProcessing] = useState(false);
  const [astroOutput, setAstroOutput] = useState<string | null>(null);
  const [astroActionType, setAstroActionType] = useState<'fill' | 'improve' | 'checklist' | 'steps' | 'ask'>('fill');
  const [astroLogStack, setAstroLogStack] = useState<string[]>([]);
  const [customAstroPrompt, setCustomAstroPrompt] = useState('');

  // Auto-generator simulated suggestions helper
  const triggerAstroAssistant = (action: 'fill' | 'improve' | 'checklist' | 'steps' | 'ask') => {
    playPopup();
    setAstroActionType(action);
    setAstroProcessing(true);
    setAstroOutput(null);
    setAstroLogStack([]);

    const logMessages: string[] = [];
    const pushLog = (msg: string, delay: number) => {
      setTimeout(() => {
        setAstroLogStack(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
      }, delay);
    };

    pushLog('Engaging Astro AI Core engine...', 100);
    pushLog('Analyzing app parameters: ' + appName, 400);
    pushLog('Checking mission brief completion telemetry: ' + overallPercentage + '%', 850);
    pushLog('Scanning target keywords checklist databases...', 1300);
    pushLog('Running launch preparedness criteria matrix...', 1750);
    pushLog('Formulating professional tailored recommendations...', 2100);

    setTimeout(() => {
      setAstroProcessing(false);
      let answer = '';
      if (action === 'fill') {
        // Try to complete one random active task
        let found = false;
        const updated = sections.map(sec => {
          if (found || sec.status === 'Locked') return sec;
          const unfinishedOpt = sec.tasks.find(t => !t.completed);
          if (unfinishedOpt) {
            found = true;
            addToast('Astro Filled Blank', `Generated assets & locked checklist: "${unfinishedOpt.title}"!`);
            return {
              ...sec,
              tasks: sec.tasks.map(t => t.id === unfinishedOpt.id ? { ...t, completed: true, notes: 'Auto-completed via Astro AI suggestions' } : t)
            };
          }
          return sec;
        });

        if (found) {
          saveSections(updated);
          answer = `### 🌟 Astro Asset Completed!
I scanned your active launch checklists and automatically drafted a compliance and design model to solve an outstanding task.

**Completed Action Item**: Resolved and saved!
*   **Sub-Task Resolved**: *Drafted and optimized via simulated Astro AI.*

Your overall **Launch Readiness Score** has expanded! Check out the task updates in your dashboard.`;
        } else {
          answer = `### 🌟 Maximum Launch Readiness!
Outstanding! All active sections have been loaded and finalized. There are no remaining missing blanks for Astro to resolve in your current active trajectory!`;
        }
      } else if (action === 'improve') {
        answer = `### 🤖 Astro's Cockpit Optimization Report
Analyzing product profile for **${appName}** targeted for launch in **${targetLaunch}**.

Here is how to elevate your trajectory to professional standards:

1.  **Audience Anchoring (App Info)**: Target early adopters with high-relevance tags.
2.  **App Store SEO (App Store)**: Avoid generic labels. Insert clear key benefits in subtitle constraints.
3.  **Beta Testing Funnels (Beta)**: Establish explicit telemetry logs before inviting TestFlight users.

**Astro Assessment**: Strong flight safety metrics. Refining your screenshots layout will boost landing conversion by ~45%.`;
      } else if (action === 'checklist') {
        answer = `### 📋 Custom Launch Day Checklist Generator
Astro has coordinated this high-impact minutes timeline for **${appName}**:

1.  **T-120 mins**: Spin up server backend databases and telemetry dashboards.
2.  **T-60 mins**: Push production package builds live with manual release overrides.
3.  **T-30 mins**: Verify web page redirections and Store landing tags.
4.  **T-0 mins**: Fire launch announcements to waitlist contacts!
5.  **T+30 mins**: Post social threads and monitor user feedback cycles.`;
      } else if (action === 'steps') {
        answer = `### 🚀 Action Plan: Next Best Acceleration Steps
Based on your current checklist indexing, Astro recommends:

*   **Step 1**: Complete your App Store optimized subtitles (App Store Setup card).
*   **Step 2**: Polish intellectual property clauses in your standard Terms & Conditions.
*   **Step 3**: Design a clean, high-conversion landing page using LaunchDeck guidelines.

Focusing on these points optimizes compliance and guarantees high conversion rates!`;
      } else if (action === 'ask') {
        const prompt = customAstroPrompt.trim() || 'How to optimize App Store screenshots?';
        answer = `### 🌌 Astro Guidance Center
**Query**: "${prompt}"

Expert advice for high-converting product entries:

*   **First 3 Seconds**: Put your absolute killer feature in high-intensity, large typography on the first 2 screenshots.
*   **Framing**: Frame app screens in minimalist, clean dark device frames to retain class.
*   **Contrast**: Use Deep Cosmic Slate and Electric Teal backgrounds to maintain visual depth.`;
      }
      setAstroOutput(answer);
    }, 2400);
  };

  // --- 5. Interactive Section Navigation Focus Helper ---
  const handleContinueNextBlueprint = () => {
    // Find first incomplete and unlocked section
    const firstIncomplete = sections.find(s => s.status !== 'Complete' && s.status !== 'Locked');
    if (firstIncomplete) {
      setActiveChecklistSecId(firstIncomplete.id);
      addToast('Resuming Blueprint', `Focusing section: ${firstIncomplete.title}`);
    } else {
      addToast('Missions Clear', 'All sections are 100% completed! Ready for Blastoff.');
    }
  };

  // Get dynamic encouraging microcopy based on percentage progress
  const getMotivationalMessage = () => {
    if (overallPercentage === 0) {
      return "Ignition sequence initiated. Spark your core identity to lock in telemetry and wake up downstream systems.";
    } else if (overallPercentage < 25) {
      return "Main booster engine powered on. Set up your App Store meta and compliance variables next, Commander.";
    } else if (overallPercentage < 50) {
      return "Accelerating through the atmosphere. Mid-tier marketing checklists and test telemetry are primed to initialize soon.";
    } else if (overallPercentage < 75) {
      return "Booster separation successful. High-velocity orbital trajectory locked. Continue ticking off core assets.";
    } else if (overallPercentage < 100) {
      return "Nearing exosphere insertion. Subsystems fully hot and clearing compliance. Just a few ticks away from stable orbit!";
    } else {
      return "SECURE GEOSYNCHRONOUS ORBIT ATTAINED! All core subsystems are checked-off and fully synchronized for flight!";
    }
  };

  // Find the Next Best Action unresolved task
  const getNextBestActionTask = () => {
    // Find the first unlocked section that is not complete
    const targetSec = sections.find(s => s.status !== 'Complete' && s.status !== 'Locked');
    if (!targetSec) return null;
    const task = targetSec.tasks.find(t => !t.completed);
    if (!task) return null;
    return {
      sectionId: targetSec.id,
      sectionTitle: targetSec.title,
      sectionColor: targetSec.color,
      task: task
    };
  };

  const nextAction = getNextBestActionTask();

  // --- 6. Generate PDF Blueprint Summary Report via jsPDF ---
  const handleDownloadPDF = () => {
    try {
      playClick();
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Color scheme
      const navyDark = [4, 8, 20];      // App dark background #040814 style
      const containerColor = [10, 14, 27]; // #0A0E1B color representation
      const brandTeal = [24, 214, 200];  // Electric Teal #18D6C8
      const brandBlue = [59, 130, 246];  // Accent Blue #3B82F6
      const goldAccent = [163, 106, 61]; // Walnut brownish #A36A3D
      const whiteColor = [255, 255, 255];
      const textSecondary = [148, 163, 184]; // Slate muted #94A3B8
      const textPrimary = [241, 245, 249]; // Slate light text #F1F5F9
      const borderLine = [30, 41, 59]; // Slate border #1E293B

      let currentY = 15;

      // Draw premium dark header banner background
      doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.rect(0, 0, 210, 45, 'F');

      // Decorative premium gold/walnut cockpit line
      doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.rect(0, 0, 210, 2, 'F');

      // Teal highlight line at the bottom of header
      doc.setFillColor(brandTeal[0], brandTeal[1], brandTeal[2]);
      doc.rect(0, 44, 210, 1, 'F');

      // Logo/Header Text
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
      doc.text('LAUNCHDECK CONTROL CENTER', 15, 18);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(brandTeal[0], brandTeal[1], brandTeal[2]);
      doc.text('OFFICIAL MISSION Trajectory & Flight Blueprint Summary', 15, 24);

      // System timestamp
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
      doc.text(`Manifest Synchronization: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`, 15, 30);

      // Index Badge in header
      doc.setFillColor(containerColor[0], containerColor[1], containerColor[2]);
      doc.setDrawColor(brandTeal[0], brandTeal[1], brandTeal[2]);
      doc.roundedRect(150, 10, 45, 25, 3, 3, 'FD');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
      doc.text('READINESS INDEX', 155, 16);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(brandTeal[0], brandTeal[1], brandTeal[2]);
      doc.text(`${overallPercentage}%`, 155, 28);

      currentY = 56;

      // Section: Vessel Identification
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text('I. ACTIVE VESSEL SPECIFICATIONS', 15, currentY);
      currentY += 4;

      doc.setDrawColor(borderLine[0], borderLine[1], borderLine[2]);
      doc.setLineWidth(0.3);
      doc.line(15, currentY, 195, currentY);
      currentY += 6;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(112, 128, 144);
      doc.text('SYSTEM APPLICATIVE NAME:', 15, currentY);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text(appName, 65, currentY);
      currentY += 6;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(112, 128, 144);
      doc.text('TARGET FLIGHT WINDOW:', 15, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text(targetLaunch, 65, currentY);
      currentY += 6;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(112, 128, 144);
      doc.text('CORE TRAJECTORY STATEMENT:', 15, currentY);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      const wrappedPledge = doc.splitTextToSize(`"${missionStatement}"`, 128);
      doc.text(wrappedPledge, 65, currentY);
      currentY += (wrappedPledge.length * 4) + 6;

      // Section: Overall Metrics Status
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text('II. SUBSYSTEM STATUS ANALYTICS', 15, currentY);
      currentY += 4;
      doc.line(15, currentY, 195, currentY);
      currentY += 6;

      // Quick visual summary grid card blocks
      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(209, 213, 219);
      doc.roundedRect(15, currentY, 54, 18, 2, 2, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // Green
      doc.text('READY SECTOR CATEGORIES', 18, currentY + 5);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text(`${completedSectionsCount} Subsystems`, 18, currentY + 13);

      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(209, 213, 219);
      doc.roundedRect(74, currentY, 54, 18, 2, 2, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]); // Blue
      doc.text('CHALLENGED SECTORS', 77, currentY + 5);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text(`${needsAttentionCount} In-Progress`, 77, currentY + 13);

      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(209, 213, 219);
      doc.roundedRect(133, currentY, 62, 18, 2, 2, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // gray
      doc.text('LOCKED DORMANT SUB-BLOCKS', 136, currentY + 5);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text(`${sections.filter(s => s.status === 'Locked').length} Categories`, 136, currentY + 13);

      currentY += 26;

      // Section: Deep checklists
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text('III. DETAILED BLUEPRINT TRAJECTORY', 15, currentY);
      currentY += 4;
      doc.line(15, currentY, 195, currentY);
      currentY += 8;

      sections.forEach((sec) => {
        if (currentY > 255) {
          doc.addPage();
          currentY = 20;
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`Detailed Trajectory - ${appName} (Page Continued)`, 15, 12);
          doc.line(15, 14, 195, 14);
          currentY = 20;
        }

        // Section header
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
        doc.text(sec.title.toUpperCase(), 15, currentY);

        // Subsystem completion indicator & status
        const compTasks = sec.tasks.filter(t => t.completed).length;
        const totTasks = sec.tasks.length;
        const subPercent = Math.round((compTasks / totTasks) * 100);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        if (sec.status === 'Complete') {
          doc.setTextColor(16, 185, 129); // Green
        } else if (sec.status === 'In Progress' || sec.status === 'Needs Review') {
          doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]); // Blue
        } else if (sec.status === 'Locked') {
          doc.setTextColor(156, 163, 175); // Gray
        } else {
          doc.setTextColor(239, 68, 68); // Red
        }
        
        doc.text(`[ STATUS: ${sec.status.toUpperCase()} - ${subPercent}% ]`, 140, currentY);
        currentY += 4.5;

        // Section description
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        const wrappedDesc = doc.splitTextToSize(sec.description, 175);
        doc.text(wrappedDesc, 15, currentY);
        currentY += (wrappedDesc.length * 4) + 2.5;

        // Tasks checklist
        sec.tasks.forEach((task) => {
          if (currentY > 265) {
            doc.addPage();
            currentY = 20;
            doc.setFont('Helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`Detailed Trajectory - ${appName} (Page Continued)`, 15, 12);
            doc.line(15, 14, 195, 14);
            currentY = 20;
          }

          // Checkmark box state
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          if (task.completed) {
            doc.setTextColor(16, 185, 129); // Green check mark
            doc.text('[X]', 18, currentY);
          } else {
            doc.setTextColor(156, 163, 175); // Empty check mark
            doc.text('[ ]', 18, currentY);
          }

          // Task details
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(55, 65, 81);
          
          let titleX = 25;
          doc.text(task.title, titleX, currentY);

          if (task.notes) {
            const calculatedTextWidth = doc.getTextWidth(task.title);
            doc.setFont('Helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
            doc.text(` (Parameter Note: ${task.notes})`, titleX + calculatedTextWidth + 1.5, currentY);
          }

          currentY += 4.5;
        });

        currentY += 4.5; // Gap between sections
      });

      // Signature/Authorization Section at the bottom of report
      if (currentY > 245) {
        doc.addPage();
        currentY = 20;
      }
      currentY += 6;
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.2);
      doc.line(15, currentY, 195, currentY);
      currentY += 8;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('LAUNCHDECK FLIGHT AUTH CODE:', 15, currentY);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(31, 41, 55);
      doc.text(`LD-${overallPercentage}-OCTM-${Math.floor(100000 + Math.random() * 900000)}`, 68, currentY);
      currentY += 5;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('VERIFICATION STAMP:', 15, currentY);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(16, 185, 129);
      doc.text('APPROVED TRAJECTORY ACTIVE - ALL SUBSYSTEMS CLEAR FOR LAUNCH', 68, currentY);

      // Save PDF document
      const docFilename = `${appName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_launch_blueprint.pdf`;
      doc.save(docFilename);
      
      addToast('Download Completed', `Successfully exported and downloaded "${docFilename}"!`);
    } catch (error: any) {
      console.error("PDF Compilation Failed Error:", error);
      addToast('Download Failed', error.message || 'We could not compile client-side PDF document.');
    }
  };

  if (selectedDetailSecId) {
    return (
      <BlueprintDetailScreen 
        sectionId={selectedDetailSecId} 
        onBack={() => {
          setSelectedDetailSecId(null);
          const cached = localStorage.getItem(`ld_blueprint_sec_${selectedDetailSecId}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setSections(prev => prev.map(s => {
                if (s.id === selectedDetailSecId) {
                  const updatedTasks = s.tasks.map(t => {
                    const match = parsed.checklist?.find((c: any) => c.title === t.title) || parsed.checklist?.find((c: any) => c.id === t.id);
                    return match ? { ...t, completed: match.completed } : t;
                  });
                  return {
                    ...s,
                    tasks: updatedTasks,
                    status: parsed.status
                  };
                }
                return s;
              }));
            } catch (e) {
              console.error(e);
            }
          }
        }}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-28 bg-[#040814] text-[#AAB2D5] relative font-body selection:bg-brand-teal/30 selection:text-white">
      {/* --- PREMIUM COZY NEBULA GLOW EFFECTS --- */}
      <div className="absolute top-[-5%] left-[20%] w-[450px] h-[450px] rounded-full bg-brand-teal/15 blur-[130px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute top-[35%] right-[-10%] w-[380px] h-[380px] rounded-full bg-brand-blue/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#FF6FAE]/10 blur-[130px] pointer-events-none" />
      
      {/* Decorative Cosmic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,37,60,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(24,37,60,0.08)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* --- HEADER AREA --- */}
      <div className="border-b border-white/[0.04] pb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display font-extrabold text-3xl text-text-primary tracking-tight uppercase">
              Blueprints
            </h1>
            <span className="bg-[#091523] text-[#18D6C8] text-[10px] font-mono uppercase px-3 py-1 rounded-full border border-[#18D6C8]/30 flex items-center gap-1.5 font-bold shadow-[0_0_15px_rgba(24,214,200,0.15)]">
              <Activity size={10} className="animate-pulse text-brand-teal" />
              8 Core Launch Subsystems
            </span>
          </div>
          <p className="font-body text-xs text-text-secondary leading-relaxed">
            Configure metadata, verify compliance benchmarks, and unlock your flight manifest.
          </p>
        </div>
      </div>


      {/* --- SECTION 3: STRONG NEXT BEST ACTION CARD --- */}
      {nextAction && (
        <div className="relative p-5 overflow-hidden border border-brand-teal/30 rounded-3xl bg-gradient-to-r from-[#0C152F]/70 via-[#0A122E]/80 to-[#120F2D]/70 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative z-10 group">
          {/* Neon side strip highlight */}
          <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-brand-teal" />
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center shrink-0 text-brand-teal mt-0.5 shadow-[0_0_12px_rgba(77,200,192,0.15)] animate-pulse">
              <Zap size={20} />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono font-bold">
                <span className="text-brand-teal tracking-widest uppercase">COMMAND PROTOCOL</span>
                <span className="text-text-tertiary">•</span>
                <span className={`${nextAction.sectionColor} tracking-wide uppercase`}>{nextAction.sectionTitle}</span>
                <span className="font-mono text-[8px] bg-brand-gold/15 border border-brand-gold/30 text-brand-gold px-1.5 rounded uppercase leading-none">PRIORITY</span>
              </div>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-text-primary tracking-tight leading-snug">
                {nextAction.task.title}
              </h3>
              <p className="font-body text-[11px] text-text-secondary leading-normal">
                Finish this high-priority telemetry sector to unlock additional launch readiness milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button 
              onClick={() => {
                playClick();
                setActiveChecklistSecId(nextAction.sectionId);
              }}
              className="w-full md:w-auto px-5 py-2.5 bg-brand-teal hover:bg-brand-teal-light text-[#040814] rounded-xl font-mono text-[10px] font-black uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_rgba(77,200,192,0.45)] cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
            >
              <span>ENGAGE CHECKLIST</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}



      {/* --- SECTION 5: THE 8 SUBSYSTEM SECTIONS PATH GRID --- */}
      <div className="space-y-4 relative z-10">
        <div className="flex flex-col gap-4">
          {sections.map((sec, index) => {
            const SecIcon = sec.icon;
            const completedInSec = sec.tasks.filter(t => t.completed).length;
            const totalInSec = sec.tasks.length;
            const percentInSec = Math.round((completedInSec / totalInSec) * 100);
            const isLocked = sec.status === 'Locked';

            return (
              <div 
                key={sec.id}
                onClick={() => {
                  if (isLocked) {
                    playClick();
                    addToast('Sector Locked', `${sec.title} is locked. Solve preceding milestones to secure authorization.`);
                  } else {
                    playClick();
                    setSelectedDetailSecId(sec.id);
                  }
                }}
                className={`p-5 rounded-3xl border relative overflow-hidden transition-all duration-300 group cursor-pointer ${
                  isLocked 
                    ? 'opacity-[0.45] bg-[#0A0D15]/40 border-slate-900 hover:border-slate-900 shadow-none grayscale-[40%]' 
                    : sec.status === 'Complete'
                    ? 'bg-[#0E1B23]/70 backdrop-blur-xl border-brand-teal/40 shadow-[0_0_15px_rgba(77,200,192,0.1)] hover:border-brand-teal'
                    : 'bg-[#0A0E1B]/70 backdrop-blur-xl border-white/[0.04] hover:border-slate-700 hover:bg-[#0E1529]/80 shadow-[0_4px_24px_rgba(0,0,0,0.35)]'
                }`}
              >
                {/* Visual Glow Spotlight for Unlocked elements */}
                {!isLocked && (
                  <div 
                    className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[40px] opacity-15 pointer-events-none transition-all duration-500 group-hover:scale-125"
                    style={{ backgroundColor: sec.glowColor }}
                  />
                )}

                {/* Card header */}
                <div className="flex items-start justify-between relative z-10">
                  <div className={`p-3 rounded-2xl ${isLocked ? 'bg-slate-900/60 text-slate-500' : sec.bgColor} transition-transform group-hover:scale-[1.05] duration-300`}>
                    {isLocked ? (
                      <Lock size={16} className="text-slate-500" />
                    ) : (
                      <SecIcon size={16} className={sec.color} />
                    )}
                  </div>

                  {/* Redesigned avionics status badge */}
                  <div className="flex items-center">
                    <span className={`text-[8px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded border tracking-widest ${
                      isLocked 
                        ? 'bg-slate-950/20 border-slate-900 text-slate-600'
                        : sec.status === 'Complete'
                        ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                        : sec.status === 'Needs Review'
                        ? 'bg-brand-flame/10 border-brand-flame/30 text-brand-flame'
                        : sec.status === 'In Progress'
                        ? 'bg-brand-blue/15 border-brand-blue/30 text-brand-blue-light shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}>
                      {isLocked ? 'LOCKED' : sec.status}
                    </span>
                  </div>
                </div>

                {/* Title and Short descriptions */}
                <div className="mt-4 space-y-1 relative z-10">
                  <h4 className="font-display font-extrabold text-[#F1F5F9] text-[13px] uppercase tracking-wide flex items-center gap-1 group-hover:text-brand-teal transition-colors">
                    <span>{sec.title}</span>
                    {!isLocked && <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 duration-200 transition-all text-brand-teal" />}
                  </h4>
                  <p className="font-body text-[11px] text-[#94A3B8] h-[34px] line-clamp-2 leading-normal">
                    {sec.description}
                  </p>
                </div>

                {/* Telemetry Progress Bar indicator */}
                <div className="mt-5 space-y-1.5 relative z-10">
                  <div className="flex justify-between items-center text-[8px] font-mono">
                    <span className="text-text-secondary uppercase">METRIC INDEX {completedInSec}/{totalInSec} VERIFIED</span>
                    <span className={`${isLocked ? 'text-slate-600' : sec.color} font-bold`}>{isLocked ? 0 : percentInSec}%</span>
                  </div>
                  
                  <div className="h-1.5 bg-[#050914] rounded-full overflow-hidden border border-white/[0.03]">
                    <div 
                      className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ease-out ${
                        isLocked 
                          ? 'bg-slate-900' 
                          : sec.status === 'Complete'
                          ? 'from-emerald-500 to-brand-teal' 
                          : 'from-brand-blue to-brand-teal'
                      }`}
                      style={{ width: `${isLocked ? 0 : percentInSec}%` }}
                    />
                  </div>
                </div>

                {/* Subtle base visual walnut indicator representing completed blocks */}
                {sec.status === 'Complete' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#A36A3D]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SECTION 6: ASTRO ADVANCED ASSIST COCKPIT PANEL --- */}
      <div className="bg-[#0A0E1B]/60 backdrop-blur-xl border border-slate-800/60 p-5 rounded-3xl relative overflow-hidden z-10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* Soft Walnut Side trim accent */}
        <div className="absolute top-0 right-0 bottom-0 w-[4px] bg-[#A36A3D] rounded-l-md" />
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-teal/15 rounded-2xl border border-brand-teal/30 text-brand-teal relative shrink-0">
              <Cpu size={18} className="animate-spin-slow text-brand-teal" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#040814] animate-ping" />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-[#FFFAF0] text-sm uppercase tracking-wide">
                Astro Assistance Terminal
              </h4>
              <p className="font-body text-xs text-text-secondary leading-normal">
                Let AI complete missing benchmarks, analyze SEO meta, or storyboard stores automatically.
              </p>
            </div>
          </div>

          <p className="font-body text-xs text-[#A5B2DC] leading-relaxed max-w-xl">
            Our AI auto-generator aggregates checklists, aligns compliance protocols against Apple / Google reviewer specifications, and templates copywriting logs to prevent storefront rejection.
          </p>

          {/* Quick Pre-filled triggers */}
          <div className="flex flex-wrap gap-2 pt-1.5">
            {[
              "Complete One Random Blank",
              "Diagnose Store Trajectory",
              "Generate Day-0 Blueprint",
            ].map((label, idx) => {
              const action = idx === 0 ? 'fill' : idx === 1 ? 'improve' : 'checklist';
              return (
                <button
                  key={idx}
                  onClick={() => triggerAstroAssistant(action)}
                  className="px-3 py-2 bg-white/[0.02] hover:bg-slate-900 border border-slate-850 hover:border-brand-teal/30 rounded-xl font-mono text-[9px] font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  ⚡ {label}
                </button>
              )
            })}
          </div>

          {/* Core Input ask query wrapper */}
          <div className="flex gap-2 bg-[#050914] p-1.5 rounded-2xl border border-slate-850">
            <input 
              type="text"
              placeholder="Query Astro: Write an optimized keyword-rich subtitle strategy..."
              value={customAstroPrompt}
              onChange={(e) => setCustomAstroPrompt(e.target.value)}
              className="flex-1 bg-transparent px-3 text-white text-xs font-body focus:outline-none placeholder:text-text-tertiary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') triggerAstroAssistant('ask');
              }}
            />
            <button 
              onClick={() => triggerAstroAssistant('ask')}
              className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-light text-[#040814] rounded-xl font-mono text-[10px] font-black tracking-wider uppercase cursor-pointer"
            >
              DISPATCH
            </button>
          </div>

          {/* Astro Interactive Output screen */}
          {(astroProcessing || astroOutput) && (
            <div className="bg-[#050A15]/90 rounded-2xl border border-slate-850 overflow-hidden">
              <div className="px-4 py-2 bg-white/[0.02] border-b border-slate-850 flex justify-between items-center text-[8px] font-mono text-text-tertiary">
                <span>ONBOARD ASTRO GROUND CONSOLE RECEIVER</span>
                {astroProcessing && <span className="text-brand-teal animate-pulse font-bold">CALCULATING PROJECTIONS...</span>}
              </div>
              
              <div className="p-4 space-y-3 font-mono text-xs text-[#A5B2DC] leading-relaxed">
                {/* Simulated telemetry diagnostic stack logs */}
                {astroLogStack.map((log, i) => (
                  <div key={i} className="text-[10px] text-brand-teal/70">
                    {log}
                  </div>
                ))}
                
                {/* Beautiful custom formatted solution output */}
                {!astroProcessing && astroOutput && (
                  <div className="text-slate-100 whitespace-pre-line border-t border-slate-800/40 pt-3 text-[11px] prose prose-invert">
                    {astroOutput}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- DETAIL BLUEPRINT DRAWER PANEL (Scrollable checkout modal checklist overlay) --- */}
      <AnimatePresence>
        {activeChecklistSecId && (() => {
          const sec = sections.find(s => s.id === activeChecklistSecId);
          if (!sec) return null;
          const SecIcon = sec.icon;
          const completedInSec = sec.tasks.filter(t => t.completed).length;
          const totalInSec = sec.tasks.length;
          const percentInSec = Math.round((completedInSec / totalInSec) * 100);

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-3"
            >
              <div className="absolute inset-0" onClick={() => setActiveChecklistSecId(null)} />
              
              <motion.div 
                initial={{ y: 220, scale: 0.96 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 220, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                className="relative w-full max-w-lg bg-[#070B16] border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col pt-8"
              >
                {/* Walnut wood styling top trim decoration inside bottom drawer popup */}
                <div className="absolute top-0 left-0 right-0 h-[5px] bg-[#A36A3D] rounded-t-2xl" />
                
                {/* Drawer handle drag bar visually */}
                <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-4" />

                {/* Drawer header */}
                <div className="flex items-start justify-between border-b border-slate-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${sec.bgColor}`}>
                      <SecIcon size={20} className={sec.color} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-display font-extrabold text-sm uppercase tracking-wide text-text-primary">
                        {sec.title} Manifest
                      </h4>
                      <p className="font-body text-xs text-text-secondary leading-normal max-w-[280px]">
                        Checkoff flight milestones below to synchronize target coordinates.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveChecklistSecId(null)}
                    className="p-1 px-3 bg-[#0C1224] hover:bg-[#141B33] border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono cursor-pointer uppercase font-bold"
                  >
                    CLOSE
                  </button>
                </div>

                {/* Subsystem Completion Rating progress meter */}
                <div className="py-4 space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-text-secondary uppercase">METRIC ACCERELATION CAPABILITY</span>
                    <span className={`${sec.color} font-bold`}>{percentInSec}% COMPLETE</span>
                  </div>
                  <div className="h-2 bg-[#050914] rounded-full overflow-hidden border border-white/[0.04]">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-brand-blue to-brand-teal rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentInSec}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Sub-Checklist Tasks Container */}
                <div className="flex-1 space-y-3.5 py-3 overflow-y-auto">
                  {sec.tasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => handleToggleTask(sec.id, task.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                        task.completed 
                          ? 'bg-brand-teal/[0.04] border-brand-teal/30 hover:border-brand-teal/60' 
                          : 'bg-white/[0.01] border-slate-900 hover:border-slate-800 hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Interactive checkbox indicator */}
                      <button className="focus:outline-none mt-0.5 shrink-0">
                        {task.completed ? (
                          <div className="w-5 h-5 rounded bg-brand-teal flex items-center justify-center text-[#040814]">
                            <Check size={14} strokeWidth={3.5} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded border border-slate-800 bg-[#050914] hover:border-brand-teal/40 transition-colors" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <span className={`font-body text-xs font-bold leading-normal block ${task.completed ? 'text-text-primary line-through opacity-70' : 'text-text-primary'}`}>
                          {task.title}
                        </span>
                        
                        {/* Task Notes details tags */}
                        {task.notes && (
                          <span className="inline-block font-mono text-[9px] text-brand-gold bg-brand-gold/5 rounded px-2 py-0.5 border border-brand-gold/10">
                            COORD: {task.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Automated fill checklist trigger with Astro assistant */}
                <button 
                  onClick={() => triggerAstroAssistant('fill')}
                  className="mt-4 flex items-center justify-center gap-2 py-3 bg-brand-teal/15 hover:bg-brand-teal/25 border border-brand-teal/35 rounded-xl font-mono text-[10px] font-extrabold text-brand-teal uppercase cursor-pointer"
                >
                  <Sparkles size={13} className="text-brand-teal animate-spin-slow" />
                  <span>Request Astro to finalize outstanding task</span>
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* --- STAMP DIALOG MODAL VIEW --- */}
      <AnimatePresence>
        {showBriefModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowBriefModal(false)} />
            
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0C1123] border-2 border-[#A36A3D]/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Cockpit corner gold validation stamp */}
              <div className="absolute top-0 right-0 bg-[#A36A3D] text-bg-deep text-[8px] font-mono uppercase px-4 py-1.5 font-bold rounded-bl-xl tracking-widest text-[#040814]">
                LOGGED ON COMMAND BLOCK
              </div>

              {/* Framing background cosmetic lines */}
              <div className="absolute inset-2.5 pointer-events-none border border-white/[0.03] rounded-2xl" />

              <div className="space-y-5 pb-1 relative z-10">
                <div className="flex flex-col gap-0.5 border-b border-slate-800 pb-3">
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-wide text-text-primary">
                    COMMAND MANIFEST CERTIFICATION
                  </h4>
                  <span className="font-mono text-[9px] text-[#A36A3D] font-extrabold">LAUNCHDECK SYSTEM FLIGHT DATA v1.4.0</span>
                </div>

                <div className="space-y-3.5 text-xs font-body">
                  <div className="grid grid-cols-2 gap-3 bg-[#050914] p-3 rounded-2xl border border-slate-850">
                    <div>
                      <span className="text-text-tertiary font-mono text-[8.5px] uppercase block tracking-wider">VESSEL IDENTIFIER</span>
                      <span className="font-bold text-text-primary">{appName}</span>
                    </div>
                    <div>
                      <span className="text-text-tertiary font-mono text-[8.5px] uppercase block tracking-wider">COMMAND OFFICER</span>
                      <span className="font-bold text-text-primary">Solo Indie Creator</span>
                    </div>
                  </div>

                  <div className="bg-[#050914] p-3 rounded-2xl border border-slate-850 space-y-1">
                    <span className="text-text-tertiary font-mono text-[8.5px] uppercase block tracking-wider">SUBSYSTEM MISSION FOCUS</span>
                    <p className="text-slate-200 italic font-semibold text-[11px] leading-relaxed">
                      "{missionStatement}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[#050914] p-3 rounded-2xl border border-slate-850">
                    <div>
                      <span className="text-text-tertiary font-mono text-[8.5px] uppercase block tracking-wider">LAUNCH ESTIMATE</span>
                      <span className="font-bold text-brand-gold">{targetLaunch}</span>
                    </div>
                    <div>
                      <span className="text-text-tertiary font-mono text-[8.5px] uppercase block tracking-wider">REGISTRATION CLEARANCE</span>
                      <span className="font-bold text-brand-teal">Commander Level v4</span>
                    </div>
                  </div>

                  {/* Red stamp visualization */}
                  <div className="pt-3 flex items-center justify-between gap-3">
                    <div className="border-2 border-[#18D6C8]/40 border-dashed rounded p-2 text-[9px] font-mono text-brand-teal text-center rotate-[-3.5deg] uppercase max-w-[120px] font-bold">
                      COCKPIT VERIFIED
                      <span className="block font-black text-[10px]">INDEX: {overallPercentage}%</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { handleDownloadPDF(); }}
                        className="px-3.5 py-2 bg-brand-teal text-[#040814] hover:bg-brand-teal-light rounded-xl font-mono text-[9px] font-bold tracking-wide cursor-pointer uppercase flex items-center gap-1"
                      >
                        <Download size={11} />
                        <span>DOWNLOAD</span>
                      </button>
                      
                      <button 
                        onClick={() => setShowBriefModal(false)}
                        className="px-3.5 py-2 bg-[#050914] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[#FFFAF0] rounded-xl font-mono text-[9px] font-bold tracking-wide cursor-pointer uppercase"
                      >
                        DISMISS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
