import React, { useState, useEffect } from 'react';
import { X, User, Flame, Key, CreditCard, Bell, Shield, LogOut, RefreshCcw, Rocket, Hammer, Radio, Lock, Fuel, CheckCircle2, Circle, Award, Sparkles, Activity, DollarSign, ChevronDown, ChevronUp, Check, Eye, EyeOff } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { MOCK_USER } from '../types';
import { StreakProgressRing } from './StreakProgressRing';
import { useToast } from './ToastContext';

interface ProfileModalProps {
  onClose: () => void;
  onOpenStreak?: () => void;
}

export function ProfileModal({ onClose, onOpenStreak }: ProfileModalProps) {
  const { addToast } = useToast();

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('subspace_user_streak');
    return saved ? parseInt(saved, 10) : MOCK_USER.currentStreak;
  });

  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem('subspace_user_level');
    return saved ? parseInt(saved, 10) : MOCK_USER.level;
  });

  // Section toggle state
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // States for user details
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem('subspace_user_name') || MOCK_USER.displayName;
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('subspace_user_email') || 'Pugalina@gmail.com';
  });

  // States for notifications
  const [notifTelemetry, setNotifTelemetry] = useState(() => {
    const s = localStorage.getItem('subspace_notif_telemetry');
    return s !== null ? s === 'true' : true;
  });
  const [notifMilestones, setNotifMilestones] = useState(() => {
    const s = localStorage.getItem('subspace_notif_milestones');
    return s !== null ? s === 'true' : true;
  });
  const [notifAstro, setNotifAstro] = useState(() => {
    const s = localStorage.getItem('subspace_notif_astro');
    return s !== null ? s === 'true' : false;
  });
  const [notifWeekly, setNotifWeekly] = useState(() => {
    const s = localStorage.getItem('subspace_notif_weekly');
    return s !== null ? s === 'true' : true;
  });

  // States for security
  const [syncData, setSyncData] = useState(() => {
    const s = localStorage.getItem('subspace_sync_data');
    return s !== null ? s === 'true' : true;
  });
  const [biometricLock, setBiometricLock] = useState(() => {
    const s = localStorage.getItem('subspace_biometric_lock');
    return s !== null ? s === 'true' : false;
  });
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [securityToken, setSecurityToken] = useState("ssp_live_demo_placeholder");

  const handleSaveDisplayName = (name: string) => {
    setDisplayName(name);
    localStorage.setItem('subspace_user_name', name);
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveEmail = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('subspace_user_email', email);
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleNotif = (notifType: string, val: boolean) => {
    if (notifType === 'telemetry') {
      setNotifTelemetry(val);
      localStorage.setItem('subspace_notif_telemetry', String(val));
    } else if (notifType === 'milestones') {
      setNotifMilestones(val);
      localStorage.setItem('subspace_notif_milestones', String(val));
    } else if (notifType === 'astro') {
      setNotifAstro(val);
      localStorage.setItem('subspace_notif_astro', String(val));
    } else if (notifType === 'weekly') {
      setNotifWeekly(val);
      localStorage.setItem('subspace_notif_weekly', String(val));
    }
    addToast('Preferences Synced', 'Notification routing updated.');
  };

  const handleToggleSecurity = (secType: string, val: boolean) => {
    if (secType === 'sync') {
      setSyncData(val);
      localStorage.setItem('subspace_sync_data', String(val));
    } else if (secType === 'biometric') {
      setBiometricLock(val);
      localStorage.setItem('subspace_biometric_lock', String(val));
    }
    addToast('Security Hardened', 'System parameters encrypted.');
  };

  const regenerateToken = () => {
    const randomHex = Math.random().toString(36).substring(2, 12);
    const newToken = `ssp_live_${randomHex}`;
    setSecurityToken(newToken);
    addToast('Access Token Rotated', 'Regenerated cockpit terminal API key.');
  };

  const handleResetApp = () => {
    if (confirm('Are you sure you want to clear your cockpit logs and telemetry blueprint cache? This resets your streak.')) {
      localStorage.clear();
      addToast('System Reset', 'All cached data purged. Reloading ship...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const [dailyTasks, setDailyTasks] = useState<{ id: string; title: string; category: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('subspace_daily_tasks_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: 'dt_1', title: 'Verify active roadblock node', category: 'ROADMAP', completed: false },
      { id: 'dt_2', title: 'Calibrate propellant block supply', category: 'REFUEL', completed: false },
      { id: 'dt_3', title: 'Forge structural copy in Foundry', category: 'ASSETS', completed: false },
    ];
  });

  const [streakClaimed, setStreakClaimed] = useState<boolean>(() => {
    const todayStr = new Date().toDateString();
    const lastClaim = localStorage.getItem('subspace_last_streak_claim_date');
    return lastClaim === todayStr;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const savedStreak = localStorage.getItem('subspace_user_streak');
      setStreak(savedStreak ? parseInt(savedStreak, 10) : MOCK_USER.currentStreak);
      
      const savedLevel = localStorage.getItem('subspace_user_level');
      setLevel(savedLevel ? parseInt(savedLevel, 10) : MOCK_USER.level);

      const savedTasks = localStorage.getItem('subspace_daily_tasks_state');
      if (savedTasks) {
        try {
          setDailyTasks(JSON.parse(savedTasks));
        } catch (e) {
          // ignore
        }
      }

      const todayStr = new Date().toDateString();
      const lastClaim = localStorage.getItem('subspace_last_streak_claim_date');
      setStreakClaimed(lastClaim === todayStr);
    };
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const handleToggleTask = (id: string) => {
    if (streakClaimed) return;
    const updated = dailyTasks.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setDailyTasks(updated);
    localStorage.setItem('subspace_daily_tasks_state', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    
    // Play subtle digital sound
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {}
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Custom sliding modal */}
      <div className="relative w-full h-[90%] bg-bg-surface rounded-t-3xl border-t border-border-med flex flex-col pt-2 shadow-2xl">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-border-med rounded-full mx-auto mb-2" />
        
        {/* Header */}
        <div className="px-4 pb-2 flex justify-between items-center bg-bg-surface">
           <h2 className="font-display font-bold text-xl text-text-primary">
              Commander Profile
           </h2>
           <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary rounded-full bg-bg-card border border-border-default">
              <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-12 space-y-6 pt-4">
           {/* Profile Header Card */}
           <div className="flex flex-col items-center justify-center p-6 bg-bg-card border border-border-med rounded-3xl relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-brand-teal/5 blur-[50px] rounded-full pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-brand-blue/5 blur-[50px] rounded-full pointer-events-none" />

               <div className="w-20 h-20 rounded-full bg-border-med mb-4 flex items-center justify-center border-4 border-bg-surface shadow-xl relative z-10">
                  <User className="text-text-secondary" size={40} />
                  
                  {/* Recharts-Powered Progress Ring surrounding Streak badge */}
                  <div className="absolute -bottom-3 -right-3 p-1 bg-[#040812] rounded-full border border-border-med shadow-[0_0_15px_rgba(255,100,50,0.2)] flex items-center justify-center z-20">
                     <StreakProgressRing size={32} iconSize={12} />
                     
                     {/* Flame count number overlay */}
                     <div className="absolute -top-1.5 -right-1.5 bg-[#FF4B4B] text-white text-[8px] font-mono font-bold px-1 py-0.5 rounded-full border border-bg-card leading-none font-sans min-w-[14px] text-center">
                        {streak}
                     </div>
                  </div>
               </div>
               
               <h3 className="font-display font-bold text-xl text-text-primary relative z-10">{displayName}</h3>
               <p className="font-body text-sm text-text-secondary relative z-10 mb-4">{userEmail}</p>
               
               <div className="grid grid-cols-2 gap-3 w-full relative z-10 mt-2">
                  <div className="bg-bg-surface border border-border-default rounded-2xl p-3 flex flex-col items-center justify-center">
                     <span className="font-body text-xs text-text-tertiary mb-1 uppercase tracking-wider">Level</span>
                     <span className="font-mono text-2xl text-text-primary">
                        {level}
                     </span>
                  </div>
                  <div className="bg-bg-surface border border-border-default rounded-2xl p-3 flex flex-col items-center justify-center">
                     <span className="font-body text-xs text-text-tertiary mb-1 uppercase tracking-wider">Plan</span>
                     <span className="font-mono text-[14px] leading-[32px] text-brand-teal uppercase tracking-tight font-bold">{MOCK_USER.plan}</span>
                  </div>
               </div>

               {/* Badges Section */}
               <div className="w-full mt-5 pt-4 border-t border-white/5 relative z-10">
                  <span className="font-body text-[10px] text-text-tertiary uppercase tracking-wider block text-center mb-3">Service Ribbons</span>
                  <div className="flex justify-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-blue-light shadow-[0_0_10px_rgba(77,200,192,0.2)]">
                        <Rocket size={18} />
                     </div>
                     <div className="w-10 h-10 rounded-full bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal shadow-[0_0_10px_rgba(77,200,192,0.2)]">
                        <Hammer size={18} />
                     </div>
                     <div className="w-10 h-10 rounded-full bg-status-success/20 border border-status-success/30 flex items-center justify-center text-status-success">
                        <Radio size={18} />
                     </div>
                     <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 border-dashed">
                        <Lock size={16} />
                     </div>
                  </div>
               </div>
           </div>

           {/* Interactive Daily Streak Telemetry Card */}
           <div className="space-y-3 font-sans" id="daily-streak-telemetry">
              <div className="flex justify-between items-center px-1">
                 <h4 className="font-display font-black text-xs text-[#10B7D6] uppercase tracking-widest flex items-center gap-1.5">
                    <Flame size={12} className="text-[#FF5533]" /> Daily Streak
                 </h4>
                 <span className="font-mono text-[9px] text-[#F5F7FA]/40 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase font-bold">
                    IGNITION CORE
                 </span>
              </div>

              <div className="bg-[#07114A]/10 border border-[#10B7D6]/20 rounded-2xl p-4 relative overflow-hidden space-y-4 shadow-[0_4px_24px_rgba(16,183,214,0.03)] text-left">
                 {/* Background Nebula highlights */}
                 <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[#10B7D6]/5 blur-[40px] rounded-full pointer-events-none" />

                 {/* Head section with animated indicator and real count banner */}
                 <div className="flex items-center gap-4">
                    <div className="p-0.5 bg-[#050816] rounded-full border border-[#10B7D6]/30 shadow-[inset_0_0_12px_rgba(16,183,214,0.15)] relative z-10">
                       <StreakProgressRing size={48} iconSize={18} />
                    </div>
                    
                    <div className="flex-1">
                       <div className="flex items-baseline gap-1">
                          <span className="font-display font-black text-2xl text-[#F5F7FA] tracking-tight">
                             {streak}
                          </span>
                          <span className="font-mono text-[10px] text-[#FF9B42] font-black uppercase tracking-wider">
                             Days Consecutive
                          </span>
                       </div>
                       <p className="font-body text-[11px] text-[#F5F7FA]/60 mt-0.5 leading-snug">
                          {streakClaimed 
                             ? "✓ Active check-in secured for today. System fully established." 
                             : "Calibrate daily routine tasks below to lock in today's ignition."}
                       </p>
                    </div>
                 </div>

                 {/* 7-Segment Ignition Forecasting Grid */}
                 <div className="pt-3 border-t border-white/5">
                    <span className="font-mono text-[9px] text-[#F5F7FA]/45 uppercase tracking-wider block mb-2 px-0.5 font-bold">
                       Segment Ignition Chain
                    </span>
                    <div className="grid grid-cols-7 gap-1.5">
                       {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                          const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
                          const isPast = idx < todayIdx;
                          const isToday = idx === todayIdx;

                          // Dynamic check condition
                          const isCheckedIn = isPast || (isToday && (streakClaimed || dailyTasks.every(t => t.completed)));
                          const isPartial = isToday && !streakClaimed && dailyTasks.some(t => t.completed) && !dailyTasks.every(t => t.completed);

                          return (
                             <div 
                                key={idx} 
                                className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                                   isToday 
                                     ? 'bg-[#10B7D6]/10 border-[#10B7D6]/35 shadow-[0_0_10px_rgba(16,183,214,0.1)]' 
                                     : isCheckedIn 
                                       ? 'bg-[#050816]/60 border-[#FFD65A]/15' 
                                       : 'bg-[#050816]/30 border-white/5'
                                }`}
                             >
                                <span className={`font-mono text-[9px] font-black ${
                                   isToday ? 'text-[#10B7D6]' : 'text-[#F5F7FA]/30'
                                }`}>
                                   {day}
                                </span>
                                
                                <div className="mt-1.5 flex items-center justify-center">
                                   {isCheckedIn ? (
                                      <Flame size={11} className="text-[#FF5533] fill-[#FF5533]/20 drop-shadow-[0_0_3px_rgba(255,85,51,0.45)] animate-pulse" />
                                   ) : isPartial ? (
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B7D6] animate-ping" />
                                   ) : (
                                      <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-[#F5F7FA]/50' : 'bg-white/5'}`} />
                                   )}
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>


                 {/* Claim trigger action */}
                 {onOpenStreak && (
                    <div className="pt-1">
                       <button
                          onClick={() => {
                             onClose();
                             onOpenStreak();
                          }}
                          className="w-full bg-gradient-to-r from-[#FFD65A]/10 to-[#FF9B42]/10 hover:from-[#FFD65A]/15 hover:to-[#FF9B42]/15 border border-[#FFD65A]/25 text-[#FFD65A] rounded-xl py-2.5 font-mono text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,214,90,0.03)]"
                       >
                          <Sparkles size={11} className="animate-spin-slow" /> Claim Multiplier & Booster
                       </button>
                    </div>
                 )}
              </div>
           </div>



           {/* Settings List */}
           <div className="space-y-2">
              <h4 className="font-display font-bold text-sm text-text-secondary mb-3 px-1 uppercase tracking-wider">Account</h4>
              
              <div className="glass-card flex flex-col overflow-hidden divide-y divide-border-default bg-[#0A0E1A]/40">
                 {/* --- 1. Account Details --- */}
                 <div className="flex flex-col">
                    <button 
                       onClick={() => {
                          try {
                            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                            if (AudioContext) {
                              const ctx = new AudioContext();
                              const osc = ctx.createOscillator();
                              const gain = ctx.createGain();
                              osc.type = 'sine';
                              osc.frequency.setValueAtTime(400, ctx.currentTime);
                              gain.gain.setValueAtTime(0.01, ctx.currentTime);
                              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                              osc.connect(gain);
                              gain.connect(ctx.destination);
                              osc.start();
                              osc.stop(ctx.currentTime + 0.05);
                            }
                          } catch (e) {}
                          setActiveItem(activeItem === 'details' ? null : 'details');
                       }}
                       className={`flex items-center gap-3 p-4 w-full text-left transition-colors cursor-pointer ${activeItem === 'details' ? 'bg-[#0E1528]/85' : 'hover:bg-white/5'}`}
                    >
                       <Key size={18} className={activeItem === 'details' ? 'text-brand-teal' : 'text-text-tertiary'} />
                       <span className="font-body font-semibold text-[15px] text-text-primary flex-1">Account details</span>
                       {activeItem === 'details' ? <ChevronUp size={16} className="text-brand-teal" /> : <ChevronDown size={16} className="text-text-tertiary" />}
                    </button>
                    
                    {activeItem === 'details' && (
                       <div className="p-4 bg-[#050811]/60 text-left space-y-4 border-t border-border-default">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 font-sans text-xs">
                             {/* Name input */}
                             <div className="space-y-1">
                                <label className="font-mono text-[9px] text-[#A5B2DC] uppercase block font-bold">Commander Designation</label>
                                <input 
                                   type="text" 
                                   value={displayName}
                                   onChange={(e) => handleSaveDisplayName(e.target.value)}
                                   className="w-full bg-[#03060C] border border-[#10B7D6]/20 hover:border-[#10B7D6]/40 focus:border-[#10B7D6] rounded-xl px-3 py-2 text-text-primary text-xs font-body focus:outline-none transition-all"
                                   placeholder="Enter commander code name..."
                                />
                             </div>

                             {/* Email input */}
                             <div className="space-y-1">
                                <label className="font-mono text-[9px] text-[#A5B2DC] uppercase block font-bold font-mono">Registered Coordinates (Email)</label>
                                <input 
                                   type="email" 
                                   value={userEmail}
                                   onChange={(e) => handleSaveEmail(e.target.value)}
                                   className="w-full bg-[#03060C] border border-[#10B7D6]/20 hover:border-[#10B7D6]/40 focus:border-[#10B7D6] rounded-xl px-3 py-2 text-text-primary text-xs font-body focus:outline-none transition-all"
                                   placeholder="youremail@example.com"
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                             <div className="bg-[#03060C]/90 p-2.5 rounded-xl border border-white/5 text-center">
                                <span className="font-mono text-[8px] text-[#A5B2DC] uppercase block mb-0.5 animate-pulse">Vessel</span>
                                <span className="font-body text-[11px] font-bold text-brand-teal">NOMINAL</span>
                             </div>
                             <div className="bg-[#03060C]/90 p-2.5 rounded-xl border border-white/5 text-center">
                                <span className="font-mono text-[8px] text-[#A5B2DC] uppercase block mb-0.5">Comm ID</span>
                                <span className="font-mono text-[10px] text-text-secondary font-bold">#SSP-8842</span>
                             </div>
                             <div className="bg-[#03060C]/90 p-2.5 rounded-xl border border-white/5 text-center">
                                <span className="font-mono text-[8px] text-[#A5B2DC] uppercase block mb-0.5 font-bold">Registered</span>
                                <span className="font-body text-[11px] text-text-primary font-sans">May 2026</span>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* --- 2. Billing & Plan --- */}
                 <div className="flex flex-col">
                    <button 
                       onClick={() => {
                          try {
                            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                            if (AudioContext) {
                              const ctx = new AudioContext();
                              const osc = ctx.createOscillator();
                              const gain = ctx.createGain();
                              osc.type = 'sine';
                              osc.frequency.setValueAtTime(400, ctx.currentTime);
                              gain.gain.setValueAtTime(0.01, ctx.currentTime);
                              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                              osc.connect(gain);
                              gain.connect(ctx.destination);
                              osc.start();
                              osc.stop(ctx.currentTime + 0.05);
                            }
                          } catch (e) {}
                          setActiveItem(activeItem === 'billing' ? null : 'billing');
                       }}
                       className={`flex items-center gap-3 p-4 w-full text-left transition-colors cursor-pointer ${activeItem === 'billing' ? 'bg-[#0E1528]/85' : 'hover:bg-white/5'}`}
                    >
                       <DollarSign size={18} className={activeItem === 'billing' ? 'text-brand-teal' : 'text-text-tertiary'} />
                       <span className="font-body font-semibold text-[15px] text-text-primary flex-1">Billing & Plan</span>
                       {activeItem === 'billing' ? <ChevronUp size={16} className="text-brand-teal" /> : <ChevronDown size={16} className="text-text-tertiary" />}
                    </button>
                    
                    {activeItem === 'billing' && (
                       <div className="p-4 bg-[#050811]/60 text-left space-y-4 border-t border-border-default font-sans text-xs">
                          <div className="bg-[#03060C] border border-[#10B7D6]/20 rounded-2xl p-3.5 flex items-center justify-between">
                             <div>
                                <span className="font-mono text-[9px] text-[#10B7D6] bg-[#10B7D6]/10 px-2 py-0.5 rounded border border-[#10B7D6]/20 font-bold uppercase tracking-wider">Active Plan</span>
                                <h5 className="font-display font-black text-sm text-text-primary mt-1.5 uppercase">Commander Prime Pro</h5>
                                <p className="font-body text-[11px] text-text-tertiary mt-0.5">Complimentary sandbox-tiered flight ticket.</p>
                             </div>
                             <div className="text-right">
                                <span className="font-mono text-xs text-[#A5B2DC] block">Monthly rate</span>
                                <span className="font-display font-extrabold text-lg text-brand-teal">$0.00</span>
                             </div>
                          </div>

                          <div className="space-y-1.5 font-sans">
                             <span className="font-mono text-[9px] text-[#A5B2DC] uppercase block px-1 font-bold">Authority Clearance Perks</span>
                             <div className="bg-[#03060C] p-3 rounded-2xl border border-white/5 space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                                   <CheckCircle2 size={12} className="text-brand-teal" />
                                   <span>Full multi-channel blueprint auto-generation suite</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                                   <CheckCircle2 size={12} className="text-brand-teal" />
                                   <span>Unlimited diagnostic AI Assist runs & PDF compilations</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                                   <CheckCircle2 size={12} className="text-brand-teal" />
                                   <span>Class III Launch Command Authority License included</span>
                                </div>
                             </div>
                          </div>

                          <div className="pt-1">
                             <button 
                                onClick={() => addToast('License Sync', 'You already have maximum authority scope for this cockpit.')}
                                className="w-full bg-[#10B7D6]/10 hover:bg-[#10B7D6]/15 border border-[#10B7D6]/30 text-[#10B7D6] hover:text-white rounded-xl py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                             >
                                Manage Subscription Invoices
                             </button>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* --- 3. Notifications --- */}
                 <div className="flex flex-col">
                    <button 
                       onClick={() => {
                          try {
                            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                            if (AudioContext) {
                              const ctx = new AudioContext();
                              const osc = ctx.createOscillator();
                              const gain = ctx.createGain();
                              osc.type = 'sine';
                              osc.frequency.setValueAtTime(400, ctx.currentTime);
                              gain.gain.setValueAtTime(0.01, ctx.currentTime);
                              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                              osc.connect(gain);
                              gain.connect(ctx.destination);
                              osc.start();
                              osc.stop(ctx.currentTime + 0.05);
                            }
                          } catch (e) {}
                          setActiveItem(activeItem === 'notifs' ? null : 'notifs');
                       }}
                       className={`flex items-center gap-3 p-4 w-full text-left transition-colors cursor-pointer ${activeItem === 'notifs' ? 'bg-[#0E1528]/85' : 'hover:bg-white/5'}`}
                    >
                       <Bell size={18} className={activeItem === 'notifs' ? 'text-brand-teal' : 'text-text-tertiary'} />
                       <span className="font-body font-semibold text-[15px] text-text-primary flex-1">Notifications</span>
                       {activeItem === 'notifs' ? <ChevronUp size={16} className="text-brand-teal" /> : <ChevronDown size={16} className="text-text-tertiary" />}
                    </button>
                    
                    {activeItem === 'notifs' && (
                       <div className="p-4 bg-[#050811]/60 text-left space-y-3.5 border-t border-border-default font-sans text-xs">
                          <p className="font-body text-[11px] text-text-tertiary mb-1">Toggle cockpit alarm triggers and telemetry warning routing:</p>

                          <div className="space-y-2">
                             {/* Telemetry Switch */}
                             <div className="flex items-center justify-between p-2.5 bg-[#03060C] rounded-xl border border-white/5">
                                <div>
                                   <span className="text-xs font-semibold text-text-primary block">Telemetry Warning System</span>
                                   <span className="text-[10px] text-text-tertiary block font-body">Visual alarms when critical trajectory limits exceed bounds.</span>
                                </div>
                                <button 
                                   onClick={() => handleToggleNotif('telemetry', !notifTelemetry)}
                                   className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${notifTelemetry ? 'bg-brand-teal' : 'bg-[#151D33]'}`}
                                >
                                   <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${notifTelemetry ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                </button>
                             </div>

                             {/* Milestone Switch */}
                             <div className="flex items-center justify-between p-2.5 bg-[#03060C] rounded-xl border border-white/5">
                                <div>
                                   <span className="text-xs font-semibold text-text-primary block">Mission Progress Signals</span>
                                   <span className="text-[10px] text-text-tertiary block font-body">Toast notifications when checkpoints achieve completion status.</span>
                                </div>
                                <button 
                                   onClick={() => handleToggleNotif('milestones', !notifMilestones)}
                                   className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${notifMilestones ? 'bg-brand-teal' : 'bg-[#151D33]'}`}
                                >
                                   <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${notifMilestones ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                </button>
                             </div>

                             {/* Astro Switch */}
                             <div className="flex items-center justify-between p-2.5 bg-[#03060C] rounded-xl border border-white/5">
                                <div>
                                   <span className="text-xs font-semibold text-text-primary block">Daily AI Assist Prompts</span>
                                   <span className="text-[10px] text-text-tertiary block font-body font-normal font-sans">Receive prompt notification snippets from Copilot onboard.</span>
                                </div>
                                <button 
                                   onClick={() => handleToggleNotif('astro', !notifAstro)}
                                   className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${notifAstro ? 'bg-brand-teal' : 'bg-[#151D33]'}`}
                                >
                                   <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${notifAstro ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                </button>
                             </div>

                             {/* Weekly Summary Switch */}
                             <div className="flex items-center justify-between p-2.5 bg-[#03060C] rounded-xl border border-white/5">
                                <div>
                                   <span className="text-xs font-semibold text-text-primary block">Weekly Vessel Briefings</span>
                                   <span className="text-[10px] text-text-tertiary block font-body font-normal">Compilation diagnostics detailing flight points and streak metrics.</span>
                                </div>
                                <button 
                                   onClick={() => handleToggleNotif('weekly', !notifWeekly)}
                                   className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${notifWeekly ? 'bg-brand-teal' : 'bg-[#151D33]'}`}
                                 >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${notifWeekly ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                 </button>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* --- 4. Privacy & Security --- */}
                 <div className="flex flex-col">
                    <button 
                       onClick={() => {
                          try {
                            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                            if (AudioContext) {
                              const ctx = new AudioContext();
                              const osc = ctx.createOscillator();
                              const gain = ctx.createGain();
                              osc.type = 'sine';
                              osc.frequency.setValueAtTime(400, ctx.currentTime);
                              gain.gain.setValueAtTime(0.01, ctx.currentTime);
                              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                              osc.connect(gain);
                              gain.connect(ctx.destination);
                              osc.start();
                              osc.stop(ctx.currentTime + 0.05);
                            }
                          } catch (e) {}
                          setActiveItem(activeItem === 'privacy' ? null : 'privacy');
                       }}
                       className={`flex items-center gap-3 p-4 w-full text-left transition-colors cursor-pointer ${activeItem === 'privacy' ? 'bg-[#0E1528]/85' : 'hover:bg-white/5'}`}
                    >
                       <Shield size={18} className={activeItem === 'privacy' ? 'text-brand-teal' : 'text-text-tertiary'} />
                       <span className="font-body font-semibold text-[15px] text-text-primary flex-1">Privacy & Security</span>
                       {activeItem === 'privacy' ? <ChevronUp size={16} className="text-brand-teal" /> : <ChevronDown size={16} className="text-text-tertiary" />}
                    </button>
                    
                    {activeItem === 'privacy' && (
                       <div className="p-4 bg-[#050811]/60 text-left space-y-3.5 border-t border-border-default font-sans text-xs">
                          <div className="space-y-2">
                             {/* Sync toggle */}
                             <div className="flex items-center justify-between p-2.5 bg-[#03060C] rounded-xl border border-white/5">
                                <div>
                                   <span className="text-xs font-semibold text-text-primary block">Private Cloud Synchronization</span>
                                   <span className="text-[10px] text-text-tertiary block font-body font-normal">Keep checklists mirrored securely in sandbox memory.</span>
                                </div>
                                <button 
                                   onClick={() => handleToggleSecurity('sync', !syncData)}
                                   className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${syncData ? 'bg-brand-teal' : 'bg-[#151D33]'}`}
                                >
                                   <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${syncData ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                </button>
                             </div>

                             {/* Biometric toggle */}
                             <div className="flex items-center justify-between p-2.5 bg-[#03060C] rounded-xl border border-white/5">
                                <div>
                                   <span className="text-xs font-semibold text-text-primary block">Biometric Lock Verification</span>
                                   <span className="text-[10px] text-text-tertiary block font-body font-normal">Simulated passcode verification when entering the cockpit.</span>
                                </div>
                                <button 
                                   onClick={() => handleToggleSecurity('biometric', !biometricLock)}
                                   className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${biometricLock ? 'bg-brand-teal' : 'bg-[#151D33]'}`}
                                >
                                   <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${biometricLock ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                </button>
                             </div>
                          </div>

                          {/* API Key section */}
                          <div className="bg-[#03060C] border border-white/5 rounded-xl p-3 space-y-1.5 font-mono">
                             <span className="font-mono text-[8px] text-[#A5B2DC] uppercase block font-bold">ACTIVE SECURITY TOKEN</span>
                             <div className="flex items-center gap-2">
                                <div className="flex-1 bg-[#050914] px-2.5 py-1.5 rounded-lg text-[11px] text-[#10B7D6] border border-white/[0.03] select-all overflow-x-auto truncate">
                                   {isTokenVisible ? securityToken : "••••••••••••••••••••••••••••"}
                                </div>
                                <button 
                                   onClick={() => setIsTokenVisible(!isTokenVisible)}
                                   className="p-1 px-2.5 bg-[#111827] border border-slate-800 text-[10px] text-text-secondary hover:text-text-primary rounded-xl cursor-pointer"
                                >
                                   {isTokenVisible ? "Hide" : "Show"}
                                </button>
                                <button 
                                   onClick={regenerateToken}
                                   title="Regenerate Token"
                                   className="p-2 bg-[#111827] border border-[#10B7D6]/20 hover:border-[#10B7D6]/55 text-[#10B7D6] rounded-xl hover:scale-105 transition-all cursor-pointer"
                                >
                                   <RefreshCcw size={12} />
                                </button>
                             </div>
                          </div>

                          {/* Clear Storage */}
                          <div className="pt-1.5 border-t border-white/5">
                             <button 
                                onClick={handleResetApp}
                                className="w-full bg-status-error/10 hover:bg-status-error/15 border border-status-error/25 text-status-error hover:text-white rounded-xl py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                             >
                                ❌ Purge All Cockpit Logs
                             </button>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Danger Zone */}
           <div className="pt-4 pb-8 space-y-3">
              <button className="w-full bg-status-error/10 border border-status-error/30 text-status-error rounded-2xl p-4 font-body font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-status-error/20 transition-colors">
                 <LogOut size={18} />
                 Sign Out
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
