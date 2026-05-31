import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimation } from 'motion/react';
import confetti from 'canvas-confetti';
import { MOCK_MISSION, MOCK_TASKS, MOCK_MILESTONES, MOCK_ASSETS, MOCK_USER } from '../types';
import { useToast } from './ToastContext';
import { playClick, playNavigate, playSuccess, playPopup } from '../lib/audio';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Rocket, 
  Compass, 
  Calendar, 
  Info, 
  Play,
  RotateCcw,
  CalendarDays,
  List,
  Radar,
  RadioTower,
  Cpu,
  Wifi,
  Network,
  Crosshair,
  Zap,
  PieChart,
  HelpCircle,
  MessageSquareOff,
  Terminal,
  ArrowUpRight
} from 'lucide-react';

// Soft slider chime sound for stepping navigations
const playSlideSound = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('subspace_cached_sound_enabled') === 'false') {
    return;
  }
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.07);
    
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch (err) {
    console.warn('Audio feedback offset:', err);
  }
};

// Plucky chime sound for interactive node changes
const payoutChime = (isChecking: boolean) => {
  if (typeof window !== 'undefined' && localStorage.getItem('subspace_cached_sound_enabled') === 'false') {
    return;
  }
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const dest = ctx.destination;

    if (isChecking) {
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = ctx.currentTime;
      playTone(523.25, now, 0.18);      // C5
      playTone(659.25, now + 0.06, 0.18); // E5
      playTone(783.99, now + 0.12, 0.25); // G5
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (err) {
    console.warn('Click audio offset:', err);
  }
};

// Web Audio synthesizer simulating a deep rocket booster rumble and low hissed sweeps
const playLaunchEngineRumble = (durationSec = 4.5) => {
  if (typeof window !== 'undefined' && localStorage.getItem('subspace_cached_sound_enabled') === 'false') {
    return;
  }
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const dest = ctx.destination;
    
    // Low frequency rumbler
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(45, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(65, ctx.currentTime + durationSec);
    
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.09, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, ctx.currentTime);
    filter.Q.setValueAtTime(10, ctx.currentTime);
    
    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(dest);
    
    // Noise/Sweep hiss
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(120, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(280, ctx.currentTime + durationSec);
    
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.04, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    
    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(300, ctx.currentTime);
    filter2.frequency.linearRampToValueAtTime(900, ctx.currentTime + durationSec);
    
    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(dest);
    
    osc1.start();
    osc1.stop(ctx.currentTime + durationSec);
    osc2.start();
    osc2.stop(ctx.currentTime + durationSec);
  } catch (err) {
    console.warn('Explosion audio simulation unsupported:', err);
  }
};

interface DeckScreenProps {
  onNavigateToTab?: (tabId: string) => void;
}

export function DeckScreen({ onNavigateToTab }: DeckScreenProps) {
  const { addToast } = useToast();
  const [isProceeding, setIsProceeding] = useState(false);
  
  // Custom Starfield data cached via useMemo
  const stars = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => {
      const colors = ['#F5F7FA', '#10B7D6', '#315DFF', '#FFD65A', '#FF9B42', '#FF5E5E'];
      const color = colors[Math.floor(Math.random() * (i % 4 === 0 ? colors.length : 3))]; 
      return {
        id: i,
        top: `${(Math.random() * 100).toFixed(2)}%`,
        left: `${(Math.random() * 100).toFixed(2)}%`,
        size: Math.random() < 0.15 ? '3px' : Math.random() < 0.4 ? '2px' : '1px',
        delay: `${(Math.random() * 6).toFixed(2)}s`,
        duration: `${(4 + Math.random() * 6).toFixed(2)}s`,
        opacity: (0.15 + Math.random() * 0.85).toFixed(2),
        color,
      };
    });
  }, []);
  
  // 1. Live Chronometer Ticking states
  const [timeLeft, setTimeLeft] = useState(() => {
    const launchTime = typeof window !== 'undefined' && localStorage.getItem('subspace_cached_launch_date') 
      ? parseInt(localStorage.getItem('subspace_cached_launch_date') as string, 10) 
      : MOCK_MISSION.launchDate;
    return Math.max(0, launchTime - Date.now());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const launchTime = typeof window !== 'undefined' && localStorage.getItem('subspace_cached_launch_date') 
        ? parseInt(localStorage.getItem('subspace_cached_launch_date') as string, 10) 
        : MOCK_MISSION.launchDate;
      setTimeLeft(Math.max(0, launchTime - Date.now()));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const h = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((timeLeft % (1000 * 60)) / 1000);

  // Blastoff Ignition sequence states
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStage, setLaunchStage] = useState(0);
  const [launchLogs, setLaunchLogs] = useState<string[]>([]);
  const [isLaunched, setIsLaunched] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('subspace_mission_launched') === 'true';
    }
    return false;
  });

  // State synchronized with Mission milestones cached inside localStorage
  const [milestones, setMilestones] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_milestones');
      return saved ? JSON.parse(saved) : MOCK_MILESTONES;
    }
    return MOCK_MILESTONES;
  });

  const [tasks, setTasks] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_tasks');
      return saved ? JSON.parse(saved) : MOCK_TASKS;
    }
    return MOCK_TASKS;
  });

  const [assets, setAssets] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_assets');
      return saved ? JSON.parse(saved) : MOCK_ASSETS;
    }
    return MOCK_ASSETS;
  });

  const [appName, setAppName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('subspace_cached_app_name') || MOCK_MISSION.appName;
    }
    return MOCK_MISSION.appName;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedMilestones = localStorage.getItem('subspace_cached_milestones');
      if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
      
      const savedTasks = localStorage.getItem('subspace_cached_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));

      const savedAssets = localStorage.getItem('subspace_cached_assets');
      if (savedAssets) setAssets(JSON.parse(savedAssets));

      const savedName = localStorage.getItem('subspace_cached_app_name');
      if (savedName) setAppName(savedName);
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Compute Assets flight ready counts (removed for now)

  const timelineSteps = [
    { id: 'step_1', type: 'milestone', refId: 'ms_1', dayLabel: 'T-28', title: 'Name your app', category: 'Foundation', description: 'Establish the core app identity. Choose a memorable, distinct, and clear platform title.' },
    { id: 'step_2', type: 'milestone', refId: 'ms_2', dayLabel: 'T-25', title: 'Write one-liner', category: 'Foundation', description: 'Distill your value proposition into a single high-conversion description statement.' },
    { id: 'step_3', type: 'task', refId: 't_1', dayLabel: 'T-14', title: 'Upload logo draft', category: 'Assets', description: 'Publish initial branding parameters. Vector logos help solidify system visibility.' },
    { id: 'step_4', type: 'milestone', refId: 'ms_3', dayLabel: 'T-10', title: 'Store screenshots', category: 'Assets', description: 'Upload device frames capturing pristine layouts. Visual assets convey standard utilities.' },
    { id: 'step_5', type: 'task', refId: 't_2', dayLabel: 'T-5', title: 'Storefront text', category: 'Store', description: 'Finalize targeted search-tag-ready storefront bios for deep organic user aquisition.' },
    { id: 'step_6', type: 'milestone', refId: 'ms_4', dayLabel: 'T-2', title: 'Video promo script', category: 'Marketing', description: 'Create interactive scripts matching standard media formats to hook external users.' },
    { id: 'step_7', type: 'task', refId: 't_3', dayLabel: 'T-1', title: 'Social media campaign', category: 'Marketing', description: 'Stage launch announcement blast clusters to drive immediate day-one orbital traffic.' },
    { id: 'step_8', type: 'milestone', refId: 'ms_5', dayLabel: 'T-0', title: 'Trigger Blastoff!', category: 'Launch', description: 'Clear all orbital limits! Successfully finalize pre-flight checklists and launch fully.' }
  ];

  const getStepStatus = (step: typeof timelineSteps[0]) => {
    if (step.type === 'milestone') {
      const match = milestones.find(m => m.id === step.refId);
      return {
        completed: match?.status === 'cleared' || match?.completed,
        status: match?.status || 'scheduled',
        isLocked: match?.isLocked || false,
        requiredPlan: match?.requiredPlan || 'cadet'
      };
    } else {
      const match = tasks.find(t => t.id === step.refId);
      return {
        completed: match?.status === 'completed',
        status: match?.status === 'completed' ? 'cleared' : match?.status || 'active',
        isLocked: match?.isLocked || false,
        requiredPlan: 'cadet'
      };
    }
  };

  const totalStepsCount = timelineSteps.length;
  const completedStepsCount = timelineSteps.filter(s => getStepStatus(s).completed).length;
  
  // Real dynamic readiness score evaluated dynamically
  const readinessScore = Math.min(100, Math.round((completedStepsCount / totalStepsCount) * 100));

  const confettiTriggered = useRef(false);
  useEffect(() => {
    if (readinessScore === 100 && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 8,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10B7D6', '#013D5E', '#F3B233', '#FF5E5E', '#FFFFFF']
        });
        confetti({
          particleCount: 8,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10B7D6', '#013D5E', '#F3B233', '#FF5E5E', '#FFFFFF']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    } else if (readinessScore < 100) {
      confettiTriggered.current = false;
    }
  }, [readinessScore]);

  const prevReadinessRef = useRef(readinessScore);
  const countdownControls = useAnimation();

  useEffect(() => {
    if (readinessScore > prevReadinessRef.current) {
      countdownControls.start({
        scale: [1, 1.03, 1],
        boxShadow: [
          "0 0 20px rgba(16,183,214,0.15)", 
          "0 0 60px rgba(16,183,214,0.7)", 
          "0 0 20px rgba(16,183,214,0.15)"
        ],
        borderColor: [
          "rgba(16,183,214,0.25)", 
          "rgba(16,183,214,0.9)", 
          "rgba(16,183,214,0.25)"
        ],
        backgroundColor: [
          "rgba(5,8,22,0.8)",
          "rgba(16,183,214,0.2)",
          "rgba(5,8,22,0.8)"
        ],
        transition: { duration: 0.8, ease: "easeOut" }
      });
    }
    prevReadinessRef.current = readinessScore;
  }, [readinessScore, countdownControls]);

  // Determine reactive status line message based on rules:
  // - If launch date is more than 14 days away: status = "Building momentum"
  // - If launch date is 14 days or less: status = "Launch window approaching"
  // - If launch date is 7 days or less: status = "Final systems check"
  // - If launch date is 3 days or less and readiness < 80: status = "Critical prep needed"
  // - If readiness >= 90: status = "Launch ready"
  const computedStatusMessage = useMemo(() => {
    if (readinessScore >= 90) return "Launch ready";
    if (d <= 3 && readinessScore < 80) return "Critical prep needed";
    if (d <= 7) return "Final systems check";
    if (d <= 14) return "Launch window approaching";
    return "Building momentum";
  }, [d, readinessScore]);

  // Determine Launch Risk based on readiness and time remaining
  const { riskLabel, riskColor, riskText } = useMemo(() => {
    if (readinessScore >= 80) {
      return { riskLabel: "LOW", riskColor: "text-[#10B7D6] bg-[#10B7D6]/10 border-[#10B7D6]/20", riskText: "Telemetry parameters nominal" };
    }
    if (d <= 7 && readinessScore < 60) {
      return { riskLabel: "HIGH", riskColor: "text-[#FF5E5E] bg-[#FF5E5E]/10 border-[#FF5E5E]/20", riskText: "Close launch window, high deficit" };
    }
    return { riskLabel: "MED", riskColor: "text-[#F3B233] bg-[#F3B233]/10 border-[#F3B233]/20", riskText: "Store assets need attention" };
  }, [readinessScore, d]);

  // Filter tasks to compute protocols completed
  const totalTasks = tasks.length || MOCK_TASKS.length;
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.completed).length;
  const pendingTasksCount = totalTasks - completedTasks;

  // Retrieve upcoming pending action
  const nextPendingAction = useMemo(() => {
    const nextTask = tasks.find(t => t.status !== 'completed' && !t.completed);
    if (nextTask) return nextTask.title;
    const nextMilestone = milestones.find(m => m.status !== 'cleared' && !m.completed);
    if (nextMilestone) return nextMilestone.title;
    return "All routine diagnostics clear";
  }, [tasks, milestones]);

  // Compute 5 visual phase Categories dynamically
  const categoryProgress = useMemo(() => {
    const categories = ['Foundation', 'Assets', 'Store', 'Marketing', 'Launch'];
    return categories.map(cat => {
      const matchCat = timelineSteps.filter(s => s.category === cat);
      const cleared = matchCat.filter(s => getStepStatus(s).completed).length;
      const countLabel = `${cleared}/${matchCat.length}`;
      return { 
        name: cat,
        total: matchCat.length,
        cleared,
        percent: matchCat.length > 0 ? Math.round((cleared / matchCat.length) * 100) : 0,
        countLabel
      };
    });
  }, [milestones, tasks]);

  // Waypoint indexing to show exactly 3 nodes: Previous, Active, Next
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Automatically center-focus on first incomplete step
    const firstIncompleteIdx = timelineSteps.findIndex(s => !getStepStatus(s).completed);
    if (firstIncompleteIdx !== -1) {
      setSelectedIndex(firstIncompleteIdx);
    } else {
      setSelectedIndex(0);
    }
  }, []);

  const waypoints = useMemo(() => {
    const idx = selectedIndex;
    const prev = idx > 0 ? idx - 1 : null;
    const active = idx;
    const next = idx < timelineSteps.length - 1 ? idx + 1 : null;
    return { prev, active, next };
  }, [selectedIndex, timelineSteps]);

  const activeWaypoint = timelineSteps[waypoints.active];
  const activeWaypointStatus = getStepStatus(activeWaypoint);

  const handleStepClick = (idx: number) => {
    setSelectedIndex(idx);
    playSlideSound();
  };

  const handleToggleStep = (stepId: string) => {
    const step = timelineSteps.find(s => s.id === stepId);
    if (!step) return;

    if (step.type === 'milestone') {
      const updated = milestones.map(m => {
        if (m.id === step.refId) {
          const nextCleared = m.status !== 'cleared';
          return {
            ...m,
            status: nextCleared ? 'cleared' : 'scheduled',
            completed: nextCleared,
            date: nextCleared ? new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }) : undefined
          };
        }
        return m;
      });
      setMilestones(updated);
      localStorage.setItem('subspace_cached_milestones', JSON.stringify(updated));
      payoutChime(!(milestones.find((m: any) => m.id === step.refId)?.status === 'cleared'));
      addToast('Milestone Status Updated', `${step.title} calibrated successfully.`);
    } else {
      const updated = tasks.map(t => {
        if (t.id === step.refId) {
          const nextCompleted = t.status !== 'completed';
          return {
            ...t,
            status: nextCompleted ? 'completed' : 'active',
            completed: nextCompleted,
            date: nextCompleted ? 'Today' : undefined
          };
        }
        return t;
      });
      setTasks(updated);
      localStorage.setItem('subspace_cached_tasks', JSON.stringify(updated));
      payoutChime(!(tasks.find((t: any) => t.id === step.refId)?.status === 'completed'));
      addToast('Task Protocols Updated', `${step.title} verification marked.`);
    }
    // Dispatch instant synchronized local storage event
    window.dispatchEvent(new Event('storage'));
  };

  // Recharts telemetry gradient mock dataset reflecting current dynamic state scaling
  const chartData = useMemo(() => {
    return [
      { day: "D-13", readiness: 42 },
      { day: "D-12", readiness: 48 },
      { day: "D-11", readiness: 54 },
      { day: "D-10", readiness: 59 },
      { day: "D-9", readiness: 66 },
      { day: "D-8", readiness: 74 },
      { day: "Today", readiness: readinessScore }
    ];
  }, [readinessScore]);

  // Ignition Sequences
  const triggerLaunchSequence = () => {
    if (isLaunching || isLaunched) return;
    setIsLaunching(true);
    setLaunchStage(1);
    setLaunchLogs(['[0.1s] PILOT INSTRUCTIONS SECURED — ALL TELEMETRY ARMED']);
    
    playLaunchEngineRumble(4.5);

    const userLevel = typeof window !== 'undefined' && localStorage.getItem('subspace_user_level')
      ? parseInt(localStorage.getItem('subspace_user_level') as string, 10)
      : MOCK_USER.level || 4;

    const chosenColors = ['#10B7D6', '#F3B233', '#315DFF', '#FF5E5E', '#FFD65A', '#F5F7FA'];
    const sparkDensity = 50 + (userLevel * 15);

    confetti({
      particleCount: sparkDensity,
      spread: 75,
      origin: { y: 0.85 },
      colors: chosenColors,
    });

    setTimeout(() => {
      setLaunchStage(2);
      setLaunchLogs(prev => [...prev, '[0.9s] MAIN FORGING MATRIX: ONLINE & STABILIZED']);
    }, 900);

    setTimeout(() => {
      setLaunchStage(3);
      setLaunchLogs(prev => [...prev, '[1.8s] DEEP SPACE ION PROPULSION: FIRED']);
    }, 1800);

    setTimeout(() => {
      setLaunchStage(4);
      setLaunchLogs(prev => [...prev, '[2.7s] FLIGHT RADAR & SIGNALS COGNITION: LOCKED']);
    }, 2700);

    setTimeout(() => {
      setLaunchStage(5);
      setLaunchLogs(prev => [...prev, '[3.6s] BLASTOFF SEQUENCE NOMINAL — DETACHING COCKPIT CLAMPS']);
    }, 3600);

    setTimeout(() => {
      setIsLaunching(false);
      setIsLaunched(true);
      setLaunchStage(6);
      
      const nextLevel = Math.max(5, userLevel + 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem('subspace_mission_launched', 'true');
        localStorage.setItem('subspace_user_level', String(nextLevel));
        window.dispatchEvent(new Event('storage'));
      }

      const end = Date.now() + 2 * 1000;
      (function frame() {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.8 },
          colors: chosenColors
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.8 },
          colors: chosenColors
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      addToast('Launch Process Complete', `${MOCK_MISSION.appName} is successfully cruising in orbital geosync! 🌌🛰️`);
    }, 4500);
  };

  // Open Copilot dialog sequence
  const handleOpenCopilot = () => {
    // Dispatch event to activate Copilot overlay in App.tsx
    playPopup();
    const clickEvent = new CustomEvent('subspace_trigger_copilot_assistant');
    window.dispatchEvent(clickEvent);
    addToast('Uplink Activated', 'Establishing secure high-frequency stream with onboard AI...');
  };

  // Perspective-based tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2deg", "2deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      id="mission-command-deck" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d"
      }}
      whileHover={{ scale: 1.01 }}
      className={`flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-5 transition-colors duration-300 relative z-10 border border-transparent deck-glow ${
        isLaunching ? 'animate-intense-shake' : ''
      }`}
    >
      
      {/* Background Decor - Cinema space cockpit backdrop */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#050816]">
        {/* Particle Stars */}
        <div className="absolute inset-0 overflow-hidden opacity-90">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full animate-twinkle"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
                opacity: star.opacity,
                boxShadow: star.size === '3px' 
                  ? `0 0 10px ${star.color}` 
                  : `0 0 3px ${star.color}`,
                animationDelay: star.delay,
                animationDuration: star.duration,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Structural Cockpit Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: `linear-gradient(#10B7D6 1px, transparent 1px), linear-gradient(90deg, #10B7D6 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }}
        />
        
        {/* Glowing Nebula nodes */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#315DFF]/5 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[450px] h-[450px] bg-[#10B7D6]/5 blur-[110px] rounded-full pointer-events-none" />
      </div>

      {/* Hero Holographic Display - Launch Reactor Card */}
      <motion.div 
        id="launch-reactor-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ 
          opacity: 1, 
          y: [0, -6, 0]
        }}
        whileHover={{ 
          scale: 1.02,
          borderColor: 'rgba(16, 183, 214, 0.70)',
          boxShadow: '0 0 50px rgba(16, 183, 214, 0.35)'
        }}
        transition={{ 
          opacity: { duration: 0.5, ease: 'easeOut' },
          y: {
            repeat: Infinity,
            repeatType: 'mirror',
            duration: 6,
            ease: 'easeInOut'
          },
          scale: { duration: 0.25, ease: 'easeOut' },
          borderColor: { duration: 0.25, ease: 'easeOut' },
          boxShadow: { duration: 0.25, ease: 'easeOut' }
        }}
        className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#07114A]/90 to-[#050816]/95 p-5 border border-[#10B7D6]/35 shadow-[0_0_35px_rgba(16,183,214,0.12)] flex flex-col justify-between"
        style={{ minHeight: '235px' }}
      >
        {/* Luminous Nebula Orbit Background (layered diagonal cyan-teal dust matching uploaded telemetry) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          {/* Celestial background starry galaxy plate */}
          <img 
            src="/src/assets/images/vessels_hangar_bay_1780103205223.png" 
            alt="Vessels Hangar Bay"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-45 brightness-[0.7] contrast-[1.1] scale-105 select-none pointer-events-none transition-all duration-700 hover:scale-100"
          />
          {/* Upgraded diagonal luminous cyan-teal nebula dust clouds for high-fidelity cosmic glow */}
          <div className="absolute -inset-16 bg-[radial-gradient(ellipse_at_center,rgba(77,200,192,0.30)_0%,rgba(7,17,74,0)_65%)] -rotate-12 blur-[55px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[-25%] left-[-25%] right-[-15%] bottom-[-25%] bg-[radial-gradient(ellipse_at_center,rgba(16,183,214,0.22)_0%,rgba(0,0,0,0)_55%)] -rotate-30 blur-[80px]" />
          <div className="absolute bottom-[-15%] right-[-15%] w-[350px] h-[350px] bg-[#4DC8C0]/15 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute top-[10%] left-[20%] w-[250px] h-[250px] bg-[#3B82F6]/10 rounded-full blur-[70px]" />
          
          {/* Advanced Orbital Space Structure with Rotating Vessel Indicators */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.35]">
            {/* Outer Orbit Path & Gold Node */}
            <motion.div 
              className="absolute w-[350px] h-[350px] rounded-full border border-dashed border-[#4DC8C0]/30"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              {/* Gold orbiting spacecraft/node */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#F3B233] shadow-[0_0_10px_#F3B233] border border-[#0A1220]" />
            </motion.div>

            {/* Inner Main Teal Orbit Path & Pulsing Teal Node */}
            <motion.div 
              className="absolute w-[270px] h-[270px] rounded-full border border-[#4DC8C0]/40"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            >
              {/* Glowing teal telemetry beacon node */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#4DC8C0] shadow-[0_0_15px_#4DC8C0,0_0_5px_#fff] border border-[#0A1220] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>
            </motion.div>

            {/* Micro inner tracking circle */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-[#3B82F6]/15 animate-spin-slow" style={{ animationDuration: '40s' }} />
          </div>

          {/* Launch Ready 100% Orbital Animation */}
          {readinessScore === 100 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 z-10"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.7, 0.5], scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* Outer Launch Ring */}
              <motion.div 
                className="absolute w-[380px] h-[380px] rounded-full border border-t-[#F3B233] border-r-transparent border-b-[#F3B233] border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ boxShadow: '0 0 45px rgba(243,178,51,0.35), inset 0 0 25px rgba(243,178,51,0.25)' }}
              />
              {/* Inner Focus Ring */}
              <motion.div 
                className="absolute w-[220px] h-[220px] rounded-full border-[1.5px] border-dotted border-[#4DC8C0]"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ boxShadow: '0 0 35px rgba(77,200,192,0.5)' }}
              />
            </motion.div>
          )}
        </div>

        {/* Alignment corner crossbrackets */}
        <div className="absolute top-3 left-3 border-t border-l border-[#10B7D6]/30 w-3 h-3" />
        <div className="absolute top-3 right-3 border-t border-r border-[#10B7D6]/30 w-3 h-3" />
        <div className="absolute bottom-3 left-3 border-b border-l border-[#10B7D6]/30 w-3 h-3" />
        <div className="absolute bottom-3 right-3 border-b border-r border-[#10B7D6]/30 w-3 h-3" />

        {/* Dynamic Walnut & Burnished Gold glowing accent indicator strip at bottom edge of card */}
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#8B5327] via-[#F3B233] to-[#8B5327] shadow-[0_0_10px_rgba(243,178,51,0.25)]" />

        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          
          {/* Top Info section */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] text-[#10B7D6] bg-[#10B7D6]/10 border border-[#10B7D6]/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  DESIGNATION: {MOCK_MISSION.platform.toUpperCase()}
                </span>
                <span className="font-mono text-[9px] text-[#F3B233] bg-[#F3B233]/15 border border-[#F3B233]/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {readinessScore}% READINESS
                </span>
              </div>
              <h2 className="font-display font-black text-2xl text-[#F5F7FA] tracking-tight mt-1">
                {appName}
              </h2>
            </div>
          </div>

          {/* Countdown Clock or Orbit state */}
          {isLaunched ? (
            <div className="flex flex-col items-center justify-center py-4" id="countdown-completed-orb">
              <span className="font-display font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#10B7D6] via-[#F5F7FA] to-[#315DFF] tracking-widest uppercase filter drop-shadow-[0_0_10px_rgba(16,183,214,0.45)]">
                ORBIT ESTABLISHED
              </span>
              <span className="font-mono text-[10px] text-[#10B7D6] tracking-[0.25em] h-5 uppercase mt-1 animate-pulse">
                ✓ FLIGHT ENVELOPE NOMINAL // GREEN CAPABLE
              </span>
            </div>
          ) : isLaunching ? (
            <div className="flex flex-col items-center justify-center py-4" id="countdown-ignition-orb">
              <span className="font-display font-black text-3xl sm:text-4xl text-[#FFD65A] tracking-widest uppercase drop-shadow-[0_0_12px_rgba(255,214,90,0.6)]">
                IGNITION PULSE
              </span>
              <span className="font-mono text-[10px] text-[#FF5E5E] tracking-[0.2em] uppercase mt-1">
                G-FORCE EXTREME DELTA
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center relative w-full" id="countdown-interactive-clocks">
              <div className="absolute inset-0 bg-[#10B7D6]/5 rounded-2xl blur-lg pointer-events-none" />
              <span className="font-mono text-[9px] text-[#10B7D6] tracking-[0.3em] uppercase mb-2">T-MINUS COUNTDOWN</span>
              
              {/* Chronological Clock units */}
              <motion.div 
                animate={countdownControls}
                className="flex items-baseline gap-1.5 sm:gap-2 px-4 py-1.5 bg-[#050816]/80 border border-[#10B7D6]/25 rounded-xl shadow-[0_0_20px_rgba(16,183,214,0.15)] backdrop-blur-md"
              >
                <div className="flex flex-col items-center">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-[#F5F7FA] tracking-tighter w-[2ch] text-center">{String(d).padStart(2, '0')}</span>
                  <span className="font-mono text-[8.5px] text-[#F5F7FA]/40 font-bold uppercase mt-0.5">DAYS</span>
                </div>
                <span className="font-mono text-xl text-[#10B7D6]/35">:</span>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-[#F5F7FA] tracking-tighter w-[2ch] text-center">{String(h).padStart(2, '0')}</span>
                  <span className="font-mono text-[8.5px] text-[#F5F7FA]/40 font-bold uppercase mt-0.5">HRS</span>
                </div>
                <span className="font-mono text-xl text-[#10B7D6]/35">:</span>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-[#F5F7FA] tracking-tighter w-[2ch] text-center">{String(m).padStart(2, '0')}</span>
                  <span className="font-mono text-[8.5px] text-[#F5F7FA]/40 font-bold uppercase mt-0.5">MIN</span>
                </div>
                <span className="font-mono text-xl text-[#10B7D6]/35">:</span>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-[#F5F7FA] tracking-tighter w-[2ch] text-center">{String(s).padStart(2, '0')}</span>
                  <span className="font-mono text-[8.5px] text-[#F5F7FA]/40 font-bold uppercase mt-0.5">SEC</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Bottom Dynamic Status Line */}
          <div className="w-full text-center">
            <span className="font-mono text-[10px] text-[#F5F7FA]/70 tracking-[0.1em] uppercase border-t border-dashed border-[#10B7D6]/20 pt-2 w-full block">
              STATUS STATUS: <span className="font-bold text-[#FFD65A] drop-shadow-[0_0_5px_rgba(255,214,90,0.3)]">{computedStatusMessage.toUpperCase()}</span>
            </span>
          </div>

        </div>
      </motion.div>

      {/* AI Deck Brief Card (Moved here) */}
      <div 
        id="ai-deck-brief-card" 
        className="glass-card bg-gradient-to-r from-[#07114A]/40 to-[#050816]/90 border border-[#10B7D6]/20 rounded-xl p-4 text-left relative overflow-hidden shadow-[0_4px_15px_rgba(16,183,214,0.02)]"
      >
        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#10B7D6]" />
        
        <div className="flex items-center gap-2 mb-2 pl-1.5">
          <Sparkles size={13} className="text-[#10B7D6] animate-pulse" />
          <span className="font-mono text-[9px] text-[#10B7D6] font-bold uppercase tracking-[0.2em]">AI DECK BRIEF</span>
        </div>

        <p className="font-mono text-[10px] text-[#F5F7FA]/75 leading-relaxed pl-1.5 mb-3.5">
          Your mission is on track. The fastest readiness gain is finishing Cargo Bay assets before moving deeper into Signals. Keep fuel burning at regular cycles to maximize engine velocity.
        </p>

        <button 
          id="btn-deck-brief-copilot"
          onClick={handleOpenCopilot}
          className="ml-1.5 h-8 px-3.5 rounded-lg border border-[#10B7D6]/30 bg-[#10B7D6]/5 hover:bg-[#10B7D6]/20 hover:border-[#10B7D6]/50 text-[#10B7D6] font-mono text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          Ask Copilot for Next Move <ArrowUpRight size={11} />
        </button>
      </div>

      {/* Card D: LAUNCH RISK (Moved under AI Brief) */}
      <div 
        id="vitals-launch-risk" 
        className="glass-card bg-[#07114A]/30 p-4 rounded-xl border border-[#10B7D6]/15 hover:border-[#FF5E5E]/40 transition-all duration-300 flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <Lock size={13} className="text-[#FF5E5E]" />
              <span className="font-mono text-[9px] text-[#F5F7FA]/60 tracking-wider uppercase">LAUNCH RISK</span>
            </div>
            
            <span className={`text-[8.5px] font-mono font-black border px-1.5 py-0.5 rounded uppercase ${riskColor}`}>
              {riskLabel} RISK
            </span>
        </div>

        <div className="flex flex-col text-left justify-between h-full mt-1.5">
            <div>
              <span className={`font-display text-2.5xl font-black ${
                  riskLabel === 'LOW' ? 'text-[#10B7D6]' : riskLabel === 'MED' ? 'text-[#FFD65A]' : 'text-[#FF5E5E]'
              }`}>
                  {riskLabel}
              </span>
            </div>
            <p className="font-mono text-[9px] text-[#F5F7FA]/60 leading-snug mt-1.5 line-clamp-2">
              {riskText}
            </p>
        </div>
      </div>

      {/* 3. Launch Vitals Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4" id="vitals-bento-layout">
        
         {/* Card C: TASK PROTOCOLS */}
         <div 
           id="vitals-task-protocols" 
           className="glass-card bg-[#07114A]/30 p-4 rounded-xl border border-[#10B7D6]/15 hover:border-[#FFD65A]/40 transition-all duration-300 flex flex-col justify-between group col-span-2 sm:col-span-1"
         >
            <div className="flex flex-col text-left justify-between h-full pt-1.5">
               <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2.5xl font-black text-[#F5F7FA] group-hover:text-[#FFD65A] transition-colors">
                      {completedTasks}
                    </span>
                    <span className="font-mono text-xs text-[#F5F7FA]/45">/ {totalTasks}</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#FFD65A] truncate max-w-[100px]" title={nextPendingAction}>
                     Next: {nextPendingAction.length > 20 ? nextPendingAction.slice(0, 18) + '...' : nextPendingAction}
                  </span>
               </div>

               {/* Inline Action CTA */}
               <button 
                  id="btn-resume-task"
                  onClick={() => {
                    const tasksTab = onNavigateToTab ? () => onNavigateToTab('mission') : () => {};
                    tasksTab();
                    addToast('Protocols Triggered', 'Opening tactical milestones index to complete tasks.');
                  }}
                  className="mt-3.5 w-full h-8 bg-[#10B7D6]/10 border border-[#10B7D6]/30 text-[#10B7D6] hover:bg-[#10B7D6]/20 transition-colors font-mono text-[9px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-1 cursor-pointer"
               >
                  <Play size={10} className="fill-current" /> Resume Task
               </button>
            </div>
         </div>
      </div>

      {/* 5. Phase Progress Upgrade */}
      <div 
        id="phase-progress-panel" 
        className="glass-card bg-[#07114A]/15 border border-[#10B7D6]/20 rounded-2xl p-5 text-left space-y-4 relative"
      >
        <div className="absolute top-3 right-3 opacity-[0.25] text-[#10B7D6] pointer-events-none">
           <Cpu size={24} />
        </div>

        <div className="border-b border-white/5 pb-2.5">
           <h3 className="font-display font-medium text-sm text-[#F5F7FA] mt-0.5">Phase Completion Gauges</h3>
        </div>

        <div className="space-y-3">
          {categoryProgress.map((cat) => {
             // Stylings: Teal for completed/healthy, Gold for partial progress needing attention, Muted blue-gray for inactive.
             const isCompleted = cat.percent === 100;
             const isStarted = cat.percent > 0 && cat.percent < 100;
             
             const ringColor = isCompleted 
               ? 'bg-[#10B7D6]' 
               : isStarted 
                 ? 'bg-[#F3B233]' 
                 : 'bg-white/10';

             const badgeTextColor = isCompleted 
               ? 'text-[#10B7D6]' 
               : isStarted 
                 ? 'text-[#F3B233]' 
                 : 'text-[#F5F7FA]/30';

             return (
               <div key={cat.name} className="flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                     <span className={`font-mono text-[11px] font-bold tracking-wider uppercase ${
                       isCompleted ? 'text-[#F5F7FA]' : isStarted ? 'text-[#F5F7FA]/80' : 'text-[#F5F7FA]/40'
                     }`}>
                        {cat.name}
                     </span>
                     <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-[#F5F7FA]/40 uppercase">
                          {cat.countLabel} SECURED
                        </span>
                        <span className={`font-mono text-[11px] font-bold ${badgeTextColor}`}>
                           {cat.percent}%
                        </span>
                     </div>
                  </div>
                  
                  {/* Premium bar meter mapping */}
                  <div className="w-full h-1.5 bg-black/40 rounded-full border border-white/5 overflow-hidden relative">
                     <div 
                        className={`h-full rounded-full transition-all duration-1000 ${ringColor} ${
                          isCompleted ? 'shadow-[0_0_8px_rgba(16,183,214,0.6)]' : ''
                        }`} 
                        style={{ width: `${cat.percent}%` }} 
                     />
                  </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* 6. Navigation Waypoints Simplification (3 visible nodes ONLY: previous, active, next) */}
      <div 
        id="waypoints-panel" 
        className="glass-card border border-[#10B7D6]/25 rounded-2xl p-5 bg-[#07114A]/10 backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,183,214,0.03)_0%,_transparent_75%)] pointer-events-none" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col text-left">
            <span className="font-mono text-[9.5px] text-[#10B7D6] uppercase tracking-[0.25em] flex items-center gap-1.5 font-bold">
              <Crosshair size={12} className="text-[#10B7D6] animate-pulse" />
              FLIGHT VECTOR PATH
            </span>
            <span className="font-body text-xs text-[#F5F7FA]/55 mt-0.5">Tactical timeline milestones</span>
          </div>

          {/* Navigation sliders control */}
          <div className="flex gap-1.5">
            <button 
              onClick={() => {
                if (selectedIndex > 0) {
                  setSelectedIndex(prev => prev - 1);
                  playSlideSound();
                }
              }}
              disabled={selectedIndex === 0}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                selectedIndex === 0 
                  ? 'border-white/5 text-white/10 cursor-not-allowed' 
                  : 'border-[#10B7D6]/30 bg-[#10B7D6]/5 text-[#10B7D6] hover:bg-[#10B7D6]/15 hover:scale-105 active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              onClick={() => {
                if (selectedIndex < timelineSteps.length - 1) {
                  setSelectedIndex(prev => prev + 1);
                  playSlideSound();
                }
              }}
              disabled={selectedIndex === timelineSteps.length - 1}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                selectedIndex === timelineSteps.length - 1 
                  ? 'border-white/5 text-white/10 cursor-not-allowed' 
                  : 'border-[#10B7D6]/30 bg-[#10B7D6]/5 text-[#10B7D6] hover:bg-[#10B7D6]/15 hover:scale-105 active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Simplified 3-Waypoint nodes structure */}
        <div className="flex items-center justify-between px-3 pb-4 border-b border-white/5 relative">
          {/* Horizontal tracking conduit line */}
          <div className="absolute top-[28px] inset-x-0 h-[0.5px] bg-[#10B7D6]/20 z-0 pointer-events-none" />

          {/* Previous Node */}
          <div className="w-[80px] flex flex-col items-center flex-shrink-0 z-10">
            {waypoints.prev !== null ? (
              <button 
                onClick={() => handleStepClick(waypoints.prev!)}
                className="group flex flex-col items-center text-center focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-[#050816] border border-[#10B7D6]/35 flex items-center justify-center text-[#10B7D6]/60 hover:border-[#10B7D6] transition-colors relative">
                  {getStepStatus(timelineSteps[waypoints.prev]).completed ? (
                    <CheckCircle2 size={15} className="text-[#10B7D6]" />
                  ) : (
                    <span className="font-mono text-[9px] font-bold">{timelineSteps[waypoints.prev].dayLabel}</span>
                  )}
                </div>
                <span className="text-[10px] text-[#F5F7FA]/45 truncate w-[75px] mt-1.5 font-sans block">
                  {timelineSteps[waypoints.prev].title}
                </span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full border border-dashed border-white/5 flex items-center justify-center opacity-20">
                <span className="font-mono text-[9px]">-</span>
              </div>
            )}
          </div>

          {/* Center-focused Active Node with orbiting glowing indicator ring */}
          <div className="flex flex-col items-center flex-shrink-0 z-10">
            <div className="relative w-15 h-15 flex items-center justify-center">
              {/* Spinning Orbit Ring around focus node */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#10B7D6] animate-spin-slow" />
              <div className="absolute -inset-1 rounded-full border border-[#10B7D6]/20 animate-pulse pointer-events-none" />
              
              <div className="w-11 h-11 rounded-full bg-[#07114A] border-2 border-[#10B7D6] flex items-center justify-center text-[#10B7D6] shadow-[0_0_15px_rgba(16,183,214,0.4)] relative">
                {activeWaypointStatus.completed ? (
                  <CheckCircle2 size={16} className="text-[#10B7D6]" />
                ) : activeWaypointStatus.isLocked ? (
                  <Lock size={13} className="text-[#F3B233]" />
                ) : (
                  <span className="font-mono text-[11px] font-black">{activeWaypoint.dayLabel}</span>
                )}
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <span className="text-[12px] font-display font-bold text-[#F5F7FA] block leading-tight">
                {activeWaypoint.title}
              </span>
              <span className="text-[8.5px] font-mono font-bold tracking-wider text-[#10B7D6] bg-[#10B7D6]/10 px-1.5 py-0.5 rounded border border-[#10B7D6]/25 uppercase mt-1 inline-block">
                {activeWaypoint.category}
              </span>
            </div>
          </div>

          {/* Next Node */}
          <div className="w-[80px] flex flex-col items-center flex-shrink-0 z-10">
            {waypoints.next !== null ? (
              <button 
                onClick={() => handleStepClick(waypoints.next!)}
                className="group flex flex-col items-center text-center focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-[#050816] border border-[#F5F7FA]/10 flex items-center justify-center text-[#F5F7FA]/40 hover:border-[#10B7D6]/50 transition-colors relative">
                  {getStepStatus(timelineSteps[waypoints.next]).completed ? (
                     <CheckCircle2 size={15} className="text-[#10B7D6]" />
                  ) : getStepStatus(timelineSteps[waypoints.next]).isLocked ? (
                     <Lock size={12} className="text-[#F3B233]/50" />
                  ) : (
                     <span className="font-mono text-[9px] font-bold">{timelineSteps[waypoints.next].dayLabel}</span>
                  )}
                </div>
                <span className="text-[10px] text-[#F5F7FA]/45 truncate w-[75px] mt-1.5 font-sans block">
                  {timelineSteps[waypoints.next].title}
                </span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full border border-dashed border-white/5 flex items-center justify-center opacity-20">
                <span className="font-mono text-[9px]">-</span>
              </div>
            )}
          </div>

        </div>

        {/* Selected Reading Terminal under nodes */}
        <div className="mt-4 bg-[#050816]/95 border border-[#10B7D6]/20 rounded-xl p-4 text-left space-y-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-25" />
          
          <div className="flex justify-between items-start">
             <div className="space-y-0.5">
                <span className="font-mono text-[8.5px] text-[#10B7D6] uppercase tracking-wider block font-bold">MILESTONE SEQUENCE</span>
                <h4 className="font-display font-bold text-[#F5F7FA] text-sm">{activeWaypoint.title}</h4>
             </div>
             <span className="font-mono text-[9px] text-[#10B7D6] font-bold">
                {activeWaypointStatus.completed ? "SECURED ✓" : activeWaypointStatus.isLocked ? "LOCK STATE" : "ACTIVE TASK"}
             </span>
          </div>

          <p className="font-mono text-[10px] text-[#F5F7FA]/65 leading-relaxed">
             {activeWaypoint.description}
          </p>

          <div className="flex gap-2.5 pt-1.5">
             {activeWaypointStatus.isLocked ? (
               <button className="h-8 px-4 rounded bg-[#F3B233]/15 border border-[#F3B233] text-[#F3B233] text-[9.5px] font-mono uppercase tracking-widest hover:bg-[#F3B233]/25 transition-colors">
                  Aquire License
               </button>
             ) : (
               <button 
                  onClick={() => handleToggleStep(activeWaypoint.id)}
                  className={`h-8 px-4 rounded text-[9.5px] font-mono uppercase tracking-widest cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                     activeWaypointStatus.completed
                       ? 'bg-[#10B7D6]/10 border border-[#10B7D6]/50 text-[#10B7D6] hover:bg-[#10B7D6]/20'
                       : 'bg-[#10B7D6] hover:bg-[#10B7D6]/90 text-[#050816] font-bold'
                  }`}
               >
                  {activeWaypointStatus.completed ? "Rollback State" : "Authenticate Task"}
               </button>
             )}

             <button 
                id="btn-ask-copilot-waypoint"
                onClick={handleOpenCopilot}
                className="h-8 px-3.5 rounded bg-[#050816] border border-white/15 text-[#F5F7FA] hover:border-[#10B7D6]/50 hover:bg-[#10B7D6]/5 transition-colors text-[9.5px] font-mono uppercase tracking-widest cursor-pointer"
             >
                Ask Copilot
             </button>
          </div>
        </div>

      </div>

      {/* Reactor Ignition Main Booster Burn */}
      {readinessScore === 100 || isLaunched || isLaunching ? (
         <div className="border border-[#FF5E5E]/40 bg-[linear-gradient(45deg,#050816,#1426A8)] p-5 relative overflow-hidden rounded-xl shadow-[0_0_25px_rgba(255,94,94,0.15)] flex flex-col gap-3 text-left">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FF5E5E, #FF5E5E 8px, transparent 8px, transparent 16px)' }} />
            
            <div className="flex items-center justify-between relative z-10">
               <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#FF5E5E] font-bold tracking-widest uppercase">CRITICAL LAUNCH THRUST</span>
                  <h3 className="font-display font-extrabold text-[#F5F7FA] text-base uppercase tracking-wider mt-0.5">COCKPIT PROPULSION ACTIVE</h3>
               </div>
               
               <span className={`font-mono text-[9.5px] px-2.5 py-0.5 border rounded uppercase font-bold ${
                 isLaunched 
                   ? 'border-[#10B7D6] text-[#10B7D6]' 
                   : 'border-[#FFD65A] text-[#FFD65A] animate-pulse'
               }`}>
                  {isLaunched ? 'Orbit Nominal' : 'Thrust Burning'}
               </span>
            </div>

            {isLaunched ? (
              <div className="relative z-10 bg-[#050816] border border-[#10B7D6]/20 p-3.5 rounded">
                <p className="font-mono text-[11px] text-[#F5F7FA]/80 leading-relaxed">
                   Mission authorized, Pilot. **{MOCK_MISSION.appName}** has completed escape velocity and logged nominal orbits. System is self-sustaining.
                </p>
              </div>
            ) : (
              <div className="relative z-10 border border-[#10B7D6]/20 bg-[#050816]/95 p-3 rounded space-y-3">
                 <div className="h-[80px] font-mono text-[9.5px] text-[#FFD65A] space-y-1.5 overflow-hidden flex flex-col justify-end">
                    {launchLogs.map((log, idx) => (
                       <div key={idx} className="flex gap-1.5">
                          <span className="text-[#10B7D6]">❯</span>
                          <span>{log}</span>
                       </div>
                    ))}
                 </div>
                 <div className="w-full bg-white/5 h-[3px] relative overflow-hidden rounded">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#10B7D6] transition-all duration-1000 ease-out shadow-[0_0_8px_#10B7D6]"
                      style={{ width: `${(launchStage / 5) * 100}%` }}
                    />
                 </div>
              </div>
            )}
         </div>
      ) : (
         <button 
           onClick={() => {
             setIsProceeding(true);
             setTimeout(() => setIsProceeding(false), 250);
             if (onNavigateToTab) {
               onNavigateToTab('mission');
             } else {
               const idx = timelineSteps.findIndex(s => !getStepStatus(s).completed);
               setSelectedIndex(idx !== -1 ? idx : 0);
             }
             playSlideSound();
           }}
           className="w-full h-13 rounded-xl bg-gradient-to-r from-[#10B7D6]/20 via-[#315DFF]/20 to-[#10B7D6]/10 border border-[#10B7D6]/40 text-[#10B7D6] font-mono text-[11.5px] font-bold uppercase tracking-widest hover:bg-[#10B7D6]/20 hover:border-[#10B7D6]/60 transition-colors flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(16,183,214,0.1)] cursor-pointer"
         >
           <Crosshair size={14} />
           Proceed to Roadmap
         </button>
      )}

      {/* Footer system disclaimer warnings */}
      {readinessScore < 100 && !isLaunched && !isLaunching && (
        <div className="flex items-center gap-2 justify-center pb-4 opacity-50">
           <AlertTriangle size={12} className="text-[#FF9B42]" />
           <span className="font-mono text-[8.5px] text-[#FF9B42] uppercase tracking-widest">
              Escape clamps armed. Milestone authorizations required for full launch triggers.
           </span>
        </div>
      )}

    </motion.div>
  );
}
