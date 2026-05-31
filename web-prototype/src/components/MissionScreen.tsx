import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, animate } from 'motion/react';
import { MOCK_MISSION, MOCK_MILESTONES, MOCK_TASKS, BETA_TEST_CHECKLIST_TEMPLATE, BetaTestingTask } from '../types';
import { useToast } from './ToastContext';
import { CheckCircle2, Sparkles, Square, Lock, Calendar, Rocket, Minus, Compass, Info, CalendarDays, List, TrendingUp, AlertTriangle, Map, Flag, Zap, Target, Beaker, Plus, Trash2 } from 'lucide-react';

// Motion variants for high-fidelity staggered task animations
const taskContainerVariants = {
  unchecked: {},
  checked: {
    transition: {
      staggerChildren: 0.08,
    }
  }
};

const taskIconVariants = {
  unchecked: { 
    scale: 0.9, 
    opacity: 0.7 
  },
  checked: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 15 
    } 
  }
};

const taskTextVariants = {
  unchecked: { 
    opacity: 1,
    x: 0,
  },
  checked: { 
    opacity: 0.55,
    x: 4,
    transition: { 
      duration: 0.35,
      ease: "easeOut" 
    }
  }
};

function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const controls = animate(start, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // OutExpo
      onUpdate: (latest) => setDisplayValue(Math.round(latest))
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{displayValue}</>;
}

// Play a high-conversion plucky ascending completion chime
const playSuccessSound = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('subspace_cached_sound_enabled') === 'false') {
    return;
  }
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const dest = ctx.destination;

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, startTime);
      filter.frequency.exponentialRampToValueAtTime(300, startTime + duration);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(523.25, now, 0.3);          // C5
    playTone(659.25, now + 0.1, 0.3);    // E5
    playTone(783.99, now + 0.2, 0.3);    // G5
    playTone(1046.50, now + 0.3, 0.5);   // C6
  } catch (err) {
    console.error('Core audio chime failed:', err);
  }
};

// Play a quick physical tactile click-feedback beep
const playToggleSound = (isChecked: boolean) => {
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
    if (isChecked) {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
    }

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (err) {
    console.error(err);
  }
};

function InteractiveMilestoneWrapper({ children, className, isLocked, onClick }: { children: React.ReactNode, className?: string, isLocked: boolean, onClick?: () => void, key?: any }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    if (isLocked) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: isLocked ? 0 : rotateX,
        rotateY: isLocked ? 0 : rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MissionScreen() {
  const { addToast } = useToast();

  const [milestones, setMilestones] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_milestones');
      return saved ? JSON.parse(saved) : MOCK_MILESTONES;
    }
    return MOCK_MILESTONES;
  });
  
  const [launchDate, setLaunchDate] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_launch_date');
      return saved ? parseInt(saved, 10) : MOCK_MISSION.launchDate;
    }
    return MOCK_MISSION.launchDate;
  });

  const [tasks, setTasks] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_tasks');
      return saved ? JSON.parse(saved) : MOCK_TASKS;
    }
    return MOCK_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('subspace_cached_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedTasks = localStorage.getItem('subspace_cached_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [betaTasks, setBetaTasks] = useState<BetaTestingTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_beta_tasks');
      return saved ? JSON.parse(saved) : BETA_TEST_CHECKLIST_TEMPLATE;
    }
    return BETA_TEST_CHECKLIST_TEMPLATE;
  });

  const [newBetaTitle, setNewBetaTitle] = useState("");
  const [newBetaPriority, setNewBetaPriority] = useState<"High" | "Medium" | "Low">("High");

  useEffect(() => {
    localStorage.setItem('subspace_cached_beta_tasks', JSON.stringify(betaTasks));
  }, [betaTasks]);

  const handleToggleBetaTask = (id: string) => {
    const updated = betaTasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted
        };
      }
      return t;
    });
    setBetaTasks(updated);
    const match = updated.find(t => t.id === id);
    if (match?.completed) {
      playSuccessSound();
      addToast('Beta Objective Cleared', `Successfully executed: ${match.title}`);
    } else {
      playToggleSound(false);
    }
  };

  const handleDeleteBetaTask = (id: string) => {
    const match = betaTasks.find(t => t.id === id);
    const updated = betaTasks.filter(t => t.id !== id);
    setBetaTasks(updated);
    addToast('Beta Task Removed', `Deleted custom objective: ${match?.title || ""}`);
  };

  const handleAddBetaTaskSubmit = () => {
    if (!newBetaTitle.trim()) {
      addToast('Error', 'Please enter a valid objective title');
      return;
    }
    const newTask: BetaTestingTask = {
      id: `custom_beta_${Date.now()}`,
      title: newBetaTitle.trim(),
      description: "Custom beta testing objective added by mission commander.",
      completed: false,
      priority: newBetaPriority,
      tag: "WIDGET"
    };
    setBetaTasks(prev => [...prev, newTask]);
    setNewBetaTitle("");
    addToast('Task Created', `Initiated custom beta telemetry target: ${newTask.title}`);
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if(t.id === id) {
        const nextCompleted = t.status !== 'completed';
        return {
          ...t,
          status: nextCompleted ? 'completed' : 'active',
          date: nextCompleted ? 'Today' : undefined
        };
      }
      return t;
    });
    setTasks(updated);
    const matchAfter = updated.find(t => t.id === id);
    if (matchAfter?.status === 'completed') {
      playSuccessSound();
      addToast('Task Completed', `Protocol executed: ${matchAfter.title}.`);
    } else {
      playToggleSound(false);
    }
  };

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
      const match = milestones.find((m: any) => m.id === step.refId);
      return {
        completed: match?.status === 'cleared' || match?.completed,
        status: match?.status || 'scheduled',
        isLocked: match?.isLocked || false,
        requiredPlan: match?.requiredPlan || 'cadet'
      };
    } else {
      const match = tasks.find((t: any) => t.id === step.refId);
      return {
        completed: match?.status === 'completed',
        status: match?.status === 'completed' ? 'cleared' : match?.status || 'active',
        isLocked: match?.isLocked || false,
        requiredPlan: 'cadet'
      };
    }
  };

  const handleToggleStep = (stepId: string) => {
    const step = timelineSteps.find(s => s.id === stepId);
    if (!step) return;

    if (step.type === 'milestone') {
      const updated = milestones.map((m: any) => {
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
      const matchAfter = updated.find((m: any) => m.id === step.refId);
      if (matchAfter?.status === 'cleared') {
        playSuccessSound();
        addToast('Milestone Cleared', `Telemetry updated: ${step.title}.`);
      } else {
        playToggleSound(false);
      }
    } else {
      const updated = tasks.map((t: any) => {
        if (t.id === step.refId) {
          const nextCompleted = t.status !== 'completed';
          return {
            ...t,
            status: nextCompleted ? 'completed' : 'active',
            date: nextCompleted ? 'Today' : undefined
          };
        }
        return t;
      });
      setTasks(updated);
      const matchAfter = updated.find((t: any) => t.id === step.refId);
      if (matchAfter?.status === 'completed') {
        playSuccessSound();
        addToast('Task Completed', `Protocol executed: ${step.title}.`);
      } else {
        playToggleSound(false);
      }
    }
  };

  const upcomingIncompleteMilestones = timelineSteps
    .map((step, originalIndex) => ({ step, originalIndex }))
    .filter(({ step }) => step.type === 'milestone' && !getStepStatus(step).completed);

  const jumpToStep = (idx: number) => {
    console.log("Jumping omitted in MissionScreen", idx);
  };

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'cleared').length;
  const readiness = Math.round((completedMilestones / totalMilestones) * 100);
  const tMinus = Math.ceil((launchDate - Date.now()) / (1000 * 60 * 60 * 24));

  // Category statistics matching standard phase groups
  const fTotal = milestones.filter(m => m.category === 'foundation').length;
  const fCleared = milestones.filter(m => m.category === 'foundation' && m.status === 'cleared').length;
  
  const aTotal = milestones.filter(m => m.category === 'assets').length;
  const aCleared = milestones.filter(m => m.category === 'assets' && m.status === 'cleared').length;

  const oTotal = milestones.filter(m => m.category !== 'foundation' && m.category !== 'assets').length;
  const oCleared = milestones.filter(m => m.category !== 'foundation' && m.category !== 'assets' && m.status === 'cleared').length;

  // Determine readiness status text and color based on standard breakpoints 
  let statusText = "Launch gaps need attention.";
  let statusColor = "text-status-error";
  if (readiness >= 100) {
    statusText = "Launch ready! All systems nominal.";
    statusColor = "text-[#10B981]";
  } else if (readiness >= 70) {
    statusText = "Cleared for launch soon.";
    statusColor = "text-brand-teal";
  } else if (readiness >= 40) {
    statusText = "You are on track.";
    statusColor = "text-brand-blue";
  } else {
    statusText = "You are building momentum.";
    statusColor = "text-status-warning";
  }

  const toggleMilestone = (id: string) => {
    const updated = milestones.map(m => {
      if (m.id === id) {
        const nextCleared = m.status !== 'cleared';
        const nextStatus = nextCleared ? 'cleared' : 'scheduled';
        return {
          ...m,
          status: nextStatus as "cleared" | "in_prep" | "scheduled",
          completed: nextCleared,
          date: nextCleared ? new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }) : undefined
        };
      }
      return m;
    });

    const allCompletedAfter = updated.every(m => m.status === 'cleared');
    const wasAlreadyAllCompleted = milestones.every(m => m.status === 'cleared');

    setMilestones(updated);
    localStorage.setItem('subspace_cached_milestones', JSON.stringify(updated));

    if (allCompletedAfter && !wasAlreadyAllCompleted) {
      playSuccessSound();
      addToast('Mission Ready', 'All orbital requirements have been successfully passed!');
    } else {
      const matchAfter = updated.find(m => m.id === id);
      const isNowChecked = matchAfter?.status === 'cleared';
      playToggleSound(isNowChecked);
      if (isNowChecked && matchAfter) {
        addToast('Sector Secured', `Milestone Cleared: ${matchAfter.title}`);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-6">
      {/* Immersive Combined Mission Command Dashboard Banner */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col md:flex-row p-5 sm:p-6 md:p-8 gap-6 z-10" id="mission-commander-dashboard">
        <img 
          src="/src/assets/images/mission_flight_path_1780103940827.png" 
          alt="Mission Flight Path" 
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.45] contrast-[1.1] scale-102 hover:scale-100 transition-all duration-1000 select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        {/* Sleek multi-layer cyberpunk shadows and overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B1F] via-[#080B1F]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080B1F]/80 via-transparent to-[#080B1F]/70 pointer-events-none" />

        {/* Left Side: Mission Info, Platform & Actions */}
        <div className="relative z-10 flex-2 flex flex-col justify-between gap-5 text-left w-full">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5 select-none">
              <span className="font-mono text-[9px] text-[#2dd4bf] font-extrabold tracking-widest bg-[#14B8A6]/20 px-2.5 py-0.5 rounded-md border border-[#14B8A6]/30 shadow-[0_0_15px_rgba(20,184,166,0.3)] uppercase">
                COMMAND BRIDGE ACTIVE
              </span>
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 backdrop-blur-sm px-2.5 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B7D6] animate-pulse" />
                <span className="font-sans text-[8.5px] tracking-wide text-white font-extrabold uppercase">{MOCK_MISSION.platform} Sector</span>
              </div>
            </div>

            <h1 className="font-display font-black text-2.5xl sm:text-4xl text-white tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {MOCK_MISSION.appName}
            </h1>
            <p className="font-sans text-xs text-[#cbd5e1]/85 mt-1.5 max-w-sm drop-shadow-md leading-relaxed">
              {MOCK_MISSION.appDescription || "Consolidate the readiness criteria of your next global launch."}
            </p>
          </div>

          {/* Integrated T-Minus Countdown with Elegant Picker inline */}
          <div className="flex flex-row items-center gap-5 bg-black/45 backdrop-blur-md rounded-2xl p-3 border border-white/5 shadow-inner w-fit">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] text-[#AAB2D5]/70 uppercase tracking-widest">Countdown</span>
              <span className="font-mono font-black text-2.5xl text-brand-teal leading-none mt-1">
                T-{tMinus > 0 ? tMinus : 0}d
              </span>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div className="flex flex-col relative group">
              <span className="font-mono text-[8px] text-[#AAB2D5]/70 uppercase tracking-widest mb-1">Launch Date</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10.5px] text-white font-semibold flex items-center pr-1">
                  {new Date(launchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="relative cursor-pointer flex items-center">
                  <input 
                    type="date" 
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                    onClick={(e) => {
                      try {
                        if ('showPicker' in HTMLInputElement.prototype) {
                          (e.target as HTMLInputElement).showPicker();
                        }
                      } catch (err) {}
                    }}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value + 'T12:00:00Z').getTime();
                      if (!isNaN(newDate)) {
                         setLaunchDate(newDate);
                         localStorage.setItem('subspace_cached_launch_date', newDate.toString());
                         MOCK_MISSION.launchDate = newDate; 
                      }
                    }}
                    value={new Date(launchDate).toISOString().split('T')[0]}
                  />
                  <div className="w-6 h-6 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/40 flex items-center justify-center hover:bg-[#14B8A6]/30 transition-colors pointer-events-none">
                    <Calendar size={11} className="text-[#2dd4bf]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Actions */}
          <div className="flex items-center gap-2.5 w-full max-w-sm mt-1">
             <button className="flex-1 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white px-3 py-2 rounded-xl font-sans font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-white/10 active:scale-95 cursor-pointer">
                <Rocket size={12} fill="currentColor" className="text-[#2dd4bf]" /> New App
             </button>
             <button className="flex-1 bg-status-error/20 hover:bg-status-error/35 backdrop-blur-md text-[#FF5E5E] px-3 py-2 rounded-xl font-sans font-extrabold text-[10px] uppercase tracking-wider transition-all border border-status-error/30 flex justify-center items-center gap-1.5 active:scale-95 cursor-pointer">
                <Minus size={12} strokeWidth={3} /> Reset
             </button>
          </div>
        </div>
      </div>

      {/* Mission Readiness Card */}
      <div className="glass-card flex flex-col items-center justify-center p-8 mt-2 mb-2 border border-white/10 relative overflow-hidden rounded-3xl w-full">
         <div className="absolute inset-0 bg-gradient-to-t from-brand-teal/5 to-transparent pointer-events-none" />
         <div className="relative w-[200px] h-[100px] overflow-hidden flex flex-col items-center mb-6 mt-4">
             {/* Semi circle arc track */}
             <div className="w-[200px] h-[200px] border-[16px] border-white/5 rounded-full border-b-transparent border-r-transparent absolute top-0 transform rotate-45" />
             {/* Active arc */}
             <motion.div 
                  className="w-[200px] h-[200px] border-[16px] border-brand-teal rounded-full border-b-transparent border-r-transparent absolute top-0 origin-center"
                  initial={{ rotate: -45 }}
                  animate={{ rotate: -45 + (readiness/100)*180 }}
                  transition={{ type: "spring", stiffness: 60, damping: 12, mass: 0.8 }}
             />
             <div className="absolute bottom-2 flex flex-col items-center">
                <span className="font-mono text-4xl text-white font-black drop-shadow-md">
                  <AnimatedCounter value={readiness} />%
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#AAB2D5]/70 mt-1">READINESS</span>
             </div>
         </div>
         <p className={`font-mono font-bold text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 px-4 py-1.5 rounded-lg shadow-sm ${statusColor} transition-colors duration-300 animate-pulse`}>
            {statusText}
         </p>
      </div>

      {/* Visual Roadmap Chart */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Map size={16} className="text-brand-purple" />
          <h3 className="font-display font-bold text-[14px] uppercase tracking-wider text-text-primary">Launch Roadmap</h3>
        </div>
        <div className="glass-card p-6 border-border-med relative overflow-hidden rounded-3xl">
           {/* Background grid/dots */}
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B7D6_1px,transparent_1px)] [background-size:16px_16px]" />
           
           <div className="relative z-10 w-full max-w-lg mx-auto">
             {/* Line */}
             <div className="absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-border-med rounded-full" />
             <div className="absolute top-[28px] left-[15%] h-[2px] bg-brand-teal rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(16,183,214,0.5)]" style={{ width: `${Math.min((readiness / 100) * 70, 70)}%` }} />
             
             <div className="flex justify-between items-start relative w-full">
                {[
                  { icon: Flag, label: "Foundation", status: fCleared === fTotal && fTotal > 0 ? 'cleared' : (fCleared > 0 ? 'active' : 'pending') },
                  { icon: Compass, label: "Assets", status: aCleared === aTotal && aTotal > 0 ? 'cleared' : (aCleared > 0 ? 'active' : 'pending') },
                  { icon: Zap, label: "Marketing", status: oCleared === oTotal && oTotal > 0 ? 'cleared' : (oCleared > 0 ? 'active' : 'pending') },
                  { icon: Target, label: "Launch", status: readiness >= 100 ? 'cleared' : 'pending' },
                ].map((phase, idx) => {
                   const Icon = phase.icon;
                   const isCleared = phase.status === 'cleared';
                   const isActive = phase.status === 'active';
                   return (
                     <div key={idx} className="flex flex-col items-center gap-2 group w-1/4">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 relative z-10 ${
                         isCleared ? 'bg-[#0A1628] border-brand-teal text-brand-teal shadow-[0_0_15px_rgba(16,183,214,0.3)]' :
                         isActive ? 'bg-brand-teal/10 border-brand-teal/50 text-brand-teal animate-pulse' :
                         'bg-bg-surface border-border-med text-text-tertiary'
                       }`}>
                         <Icon size={24} strokeWidth={isCleared || isActive ? 2.5 : 1.5} />
                         {isCleared && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-status-success rounded-full flex items-center justify-center border-2 border-bg-deep shadow-sm"><CheckCircle2 size={12} className="text-bg-deep" /></div>}
                       </div>
                       <span className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${isCleared ? 'text-brand-teal' : isActive ? 'text-text-primary' : 'text-text-tertiary'}`}>
                         {phase.label}
                       </span>
                     </div>
                   )
                })}
             </div>
           </div>
        </div>
      </div>

      {/* Milestone Checklist */}
      <div className="mt-8 relative pt-2">
         <h3 className="font-display font-black text-lg text-white tracking-tight mb-4 flex items-center gap-2">
           <Map size={18} className="text-brand-teal" />
           Mission Objectives
         </h3>
         
         <div className="space-y-4">
           {milestones.map((milestone, index) => {
             const isCleared = milestone.status === 'cleared';
             const isInPrep = milestone.status === 'in_prep';
             const isScheduled = milestone.status === 'scheduled';
             const isLocked = milestone.isLocked;
             
             // Visual config for different categories
             const cat = milestone.category || 'foundation';
             let iconElement = <Flag size={14} />;
             let colorTextClass = 'text-indigo-400';
             let badgeBg = 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
             let cardBg = 'from-[#0C112C] to-[#060B1F]/65 hover:from-[#131C44]';
             let borderCol = 'border-indigo-500/15 hover:border-indigo-500/40';
             let glowCol = 'shadow-[0_4px_24px_rgba(99,102,241,0.06)]';

             if (cat === 'foundation') {
               iconElement = <Flag size={14} className="text-[#38BDF8]" />;
               colorTextClass = 'text-[#38BDF8]';
               badgeBg = 'bg-[#38BDF8]/10 border-[#38BDF8]/35 text-[#38BDF8]';
               cardBg = 'from-[#07172C] to-[#060B1F]/65 hover:from-[#0B2544]';
               borderCol = 'border-[#38BDF8]/15 hover:border-[#38BDF8]/45';
               glowCol = 'shadow-[0_4px_24px_rgba(56,189,248,0.08)]';
             } else if (cat === 'assets') {
               iconElement = <Compass size={14} className="text-[#CBD5E1]" />;
               colorTextClass = 'text-[#CBD5E1]';
               badgeBg = 'bg-white/5 border-white/10 text-[#94A3B8]';
               cardBg = 'from-[#131826] to-[#060B1F]/65 hover:from-[#1D253A]';
               borderCol = 'border-white/5 hover:border-white/20';
               glowCol = 'shadow-[0_4px_24px_rgba(255,255,255,0.03)]';
             } else if (cat === 'marketing') {
               iconElement = <TrendingUp size={14} className="text-[#F43F5E]" />;
               colorTextClass = 'text-[#F43F5E]';
               badgeBg = 'bg-[#F43F5E]/10 border-[#F43F5E]/30 text-[#F43F5E]';
               cardBg = 'from-[#220B19] to-[#060B1F]/65 hover:from-[#351228]';
               borderCol = 'border-[#F43F5E]/15 hover:border-[#F43F5E]/45';
               glowCol = 'shadow-[0_4px_24px_rgba(244,63,94,0.08)]';
             } else if (cat === 'launch') {
               iconElement = <Rocket size={14} className="text-[#10B981]" />;
               colorTextClass = 'text-[#10B981]';
               badgeBg = 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]';
               cardBg = 'from-[#051C17] to-[#060B1F]/65 hover:from-[#0B332A]';
               borderCol = 'border-[#10B981]/15 hover:border-[#10B981]/45';
               glowCol = 'shadow-[0_4px_24px_rgba(16,185,129,0.08)]';
             } else if (cat === 'store') {
               iconElement = <Calendar size={14} className="text-[#F59E0B]" />;
               colorTextClass = 'text-[#F59E0B]';
               badgeBg = 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]';
               cardBg = 'from-[#1E1404] to-[#060B1F]/65 hover:from-[#302107]';
               borderCol = 'border-[#F59E0B]/15 hover:border-[#F59E0B]/45';
               glowCol = 'shadow-[0_4px_24px_rgba(245,158,11,0.08)]';
             }

             // Override visual feedback for completed items
             let activeBorder = borderCol;
             let activeBg = 'bg-gradient-to-br ' + cardBg;
             if (isCleared) {
               activeBorder = 'border-[#10B981]/35 hover:border-[#10B981]/60';
               activeBg = 'bg-[#10B981]/5 backdrop-blur-md';
               glowCol = 'shadow-[0_4px_30px_rgba(16,185,129,0.12)]';
             } else if (isInPrep) {
               activeBorder = 'border-brand-teal/40 hover:border-brand-teal/70';
               glowCol = 'shadow-[0_4px_30px_rgba(20,184,166,0.15)]';
             }

             return (
               <motion.div 
                 key={milestone.id} 
                 onClick={() => toggleMilestone(milestone.id)}
                 animate={{
                   scale: isCleared ? 1.012 : 1,
                 }}
                 transition={{ type: "spring", stiffness: 220, damping: 18 }}
                 className={`group relative z-10 p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${activeBg} ${activeBorder} ${glowCol}`}
               >
                 {/* Decorative background grid elements for a highly premium layout */}
                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 pointer-events-none" />
                 
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   {/* Left Side: Dynamic Status Icon Box and Info */}
                   <div className="flex items-center gap-4 flex-1 min-w-0">
                     {/* Immersive interactive checkbox button wrapper */}
                     <div className="relative shrink-0 flex items-center justify-center">
                       {isInPrep && (
                         <div className="absolute inset-[-10px] border-2 border-brand-teal/40 rounded-full animate-ping opacity-25 pointer-events-none" />
                       )}
                       
                       <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                         isCleared 
                           ? 'border-[#10B981] bg-[#10B981]/20 text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.45)] scale-[1.08]' 
                           : isLocked 
                           ? 'border-dashed border-white/10 bg-[#0C121E]/65 text-[#94A3B8]/60' 
                           : isInPrep 
                           ? 'border-brand-teal bg-brand-teal/20 text-[#2dd4bf] shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-105' 
                           : 'border-white/10 bg-black/40 text-[#94A3B8]/80 group-hover:border-white/20'
                       }`}>
                         {isCleared ? (
                           <motion.svg
                             width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="stroke-[3]" strokeLinecap="round" strokeLinejoin="round"
                           >
                             <motion.circle cx="12" cy="12" r="10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} />
                             <motion.path d="m9 12 2 2 4-4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }} />
                           </motion.svg>
                         ) : isLocked ? (
                           <Lock size={14} className="text-[#F59E0B]" />
                         ) : isInPrep ? (
                           <Sparkles size={14} className="animate-[spin_4s_linear_infinite]" />
                         ) : (
                           <Square size={10} className="text-white/30 fill-white/10" />
                         )}
                       </div>
                     </div>

                     {/* Content: Title & Metainfo */}
                     <div className="flex flex-col flex-1 min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 select-none">
                          <span className={`px-2 py-0.5 border rounded-md text-[9px] font-mono uppercase tracking-wider font-extrabold ${badgeBg}`}>
                            {cat}
                          </span>
                          
                          {/* Locked or Time Badges */}
                          {isLocked ? (
                            <span className="flex items-center gap-1 bg-[#1E110A]/85 border border-[#EA580C]/40 text-[#F97316] text-[9.5px] font-mono uppercase px-2 py-0.5 rounded-md">
                              <Lock size={9} /> REQUIRES COMMANDER
                            </span>
                          ) : (
                            <span className={`font-mono text-[10px] uppercase font-bold tracking-wider ${isCleared ? 'text-white/35' : 'text-white/60'}`}>
                              {isCleared && milestone.date ? `Cleared ${milestone.date}` : milestone.date ? `${milestone.date}` : 'Awaiting Prep'}
                            </span>
                          )}
                        </div>

                        <h4 className={`font-display font-bold text-[14.5px] tracking-tight leading-snug transition-all ${
                          isCleared 
                            ? 'text-[#94A3B8] stroke-white line-through opacity-70 group-hover:text-white/80' 
                            : 'text-white group-hover:text-brand-teal'
                        }`}>
                          {milestone.title}
                        </h4>
                     </div>
                   </div>

                   {/* Right Side: Description Summary */}
                   {milestone.description && (
                     <div className="text-left sm:text-right shrink-0 max-w-[280px]">
                       <p className="font-sans text-[11.5px] leading-relaxed text-[#94A3B8] pr-2">
                         {milestone.description}
                       </p>
                     </div>
                   )}
                 </div>
               </motion.div>
             );
           })}
         </div>
      </div>



      {/* Signal Deck Entry */}
      <button className="w-full glass-card p-5 mt-4 flex justify-between items-center bg-gradient-to-r from-bg-card to-[#1E3A5F]/20 hover:from-bg-card hover:to-[#1E3A5F]/40 hover:-translate-y-1 active:scale-[0.98] hover:shadow-[0_4px_20px_rgba(30,58,95,0.4)] transition-all duration-300 border-brand-blue/30 cursor-pointer">
         <div className="flex flex-col items-start gap-1">
            <span className="font-display font-bold text-lg text-text-primary">Stage Your Launch Sequence →</span>
            <span className="font-mono text-xs text-brand-blue-light">12/16 signals ready</span>
         </div>
      </button>

    </div>
  );
}
