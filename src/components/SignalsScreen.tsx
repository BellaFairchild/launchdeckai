import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Activity, Share2, CheckCircle2, TrendingUp, Twitter, Linkedin, Mail, Search, Filter, GripVertical, ArrowDownUp, Sparkles, Bookmark, Copy, CalendarDays, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { MOCK_MISSION } from '../types';
import { playClick, playToggle, playSuccess, playNavigate } from '../lib/audio';

const INITIAL_SIGNALS = [
  { id: 'sig_1', title: 'Pre-launch Teaser', platform: 'twitter', type: 'social', status: 'broadcasted', dateStr: '2 days ago', targetDate: Date.now() - 172800000, engagement: { views: '1.2k', clicks: 45 }, content: "We're building something special. Can't wait to show you all next week! 🚀 #buildinpublic" },
  { id: 'sig_2', title: 'Beta Announcement', platform: 'linkedin', type: 'social', status: 'broadcasted', dateStr: 'Yesterday', targetDate: Date.now() - 86400000, engagement: { views: '3.4k', clicks: 120 }, content: "We are officially opening our waitlist! First 100 signups get lifetime priority access." },
  { id: 'sig_3', title: 'Waitlist Email #1', platform: 'email', type: 'email', status: 'scheduled', dateStr: 'In 5 seconds', targetDate: Date.now() + 5000, engagement: null, content: "Subject: You're on the list!\n\nHi there,\n\nThanks for joining the waitlist! We are working hard to bring you the best experience." },
  { id: 'sig_4', title: 'Product Hunt Launch', platform: 'producthunt', type: 'community', status: 'scheduled', dateStr: 'In 15 seconds', targetDate: Date.now() + 15000, engagement: null, content: "We're live on Product Hunt! 🚀🔥 Come check us out and let us know what you think." },
  { id: 'sig_5', title: 'Launch Day Thread', platform: 'twitter', type: 'social', status: 'draft', dateStr: 'T-14 Days', targetDate: Date.now() + 1209600000, engagement: null, content: "1/ Today is the day. We are launching out of stealth.\n\nA thread on how we got here 👇" },
  { id: 'sig_6', title: 'Follow-up Sequence', platform: 'email', type: 'email', status: 'draft', dateStr: 'T-12 Days', targetDate: Date.now() + 1036800000, engagement: null, content: "Subject: Checking in\n\nHow are you enjoying the app so far? Reply to this email with any feedback!" },
];

const MOCK_CHART_DATA: Record<string, any[]> = {
  'sig_1': [
    { time: '0h', users: 10 },
    { time: '4h', users: 50 },
    { time: '8h', users: 150 },
    { time: '12h', users: 320 },
    { time: '16h', users: 510 },
    { time: '20h', users: 800 },
    { time: '24h', users: 1200 },
  ],
  'sig_2': [
    { time: '0h', users: 50 },
    { time: '4h', users: 300 },
    { time: '8h', users: 800 },
    { time: '12h', users: 1500 },
    { time: '16h', users: 2400 },
    { time: '20h', users: 2900 },
    { time: '24h', users: 3400 },
  ],
};

const playSignalTransmitChime = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('subspace_cached_sound_enabled') === 'false') {
    return;
  }
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const dest = ctx.destination;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.35);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn('Click audio offset:', err);
  }
};

export function SignalsScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'scheduled' | 'broadcasted' | 'template'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [signals, setSignals] = useState<Array<typeof INITIAL_SIGNALS[0] & { justBroadcasted?: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_signals');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed restoring signals:', e);
        }
      }
    }
    return INITIAL_SIGNALS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subspace_cached_signals', JSON.stringify(signals));
    }
  }, [signals]);

  // Composer Form inputs
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState<'twitter' | 'linkedin' | 'email' | 'producthunt'>('twitter');
  const [newContent, setNewContent] = useState('');
  const [newScheduleMode, setNewScheduleMode] = useState<'now' | 'future'>('now');
  const [newScheduleDate, setNewScheduleDate] = useState('');

  const charLimits = {
    twitter: 280,
    linkedin: 1000,
    email: 3000,
    producthunt: 150
  };

  const handleCreateSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const targetTime = newScheduleMode === 'now' ? Date.now() + 1000 : new Date(newScheduleDate).getTime();
    if (newScheduleMode === 'future' && isNaN(targetTime)) {
      return;
    }

    const newSigId = `sig_${Date.now()}`;
    const newSignalElement = {
      id: newSigId,
      title: newTitle.trim(),
      platform: newPlatform,
      type: newPlatform === 'email' ? 'email' : newPlatform === 'producthunt' ? 'community' : 'social',
      status: newScheduleMode === 'now' ? 'broadcasted' as const : 'scheduled' as const,
      dateStr: newScheduleMode === 'now' ? 'Just now' : 'Scheduled',
      targetDate: targetTime,
      engagement: newScheduleMode === 'now' ? { views: '1.2K', clicks: 64 } : null,
      content: newContent
    };

    setSignals(prev => [newSignalElement, ...prev]);
    setIsComposerOpen(false);
    setNewTitle('');
    setNewContent('');
    playSignalTransmitChime();
  };

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);


  const handleCopyContent = (id: string, content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (content) {
      navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShareContent = async (signal: typeof signals[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share && signal.content) {
      try {
        await navigator.share({
          title: signal.title,
          text: signal.content,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyContent(signal.id, signal.content, e);
    }
  };

  const handleAnalyze = (id: string, platform: string) => {
    setAnalyzing(prev => ({ ...prev, [id]: true }));
    // Simulate AI analysis delay
    setTimeout(() => {
      setAnalyzing(prev => ({ ...prev, [id]: false }));
      
      let suggestion = "Consider adding stronger calls to action to boost engagement.";
      if (platform === 'twitter') {
        suggestion = "This tweet had good visibility but low link clicks. Next time, try posing a question or moving the link higher in the thread.";
      } else if (platform === 'linkedin') {
        suggestion = "Professional tone worked well. Adding a short video or carousel could increase dwell time and engagement further.";
      }
      
      setAnalysisResults(prev => ({ ...prev, [id]: suggestion }));
    }, 1500);
  };

  const handleSaveAsTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSignals(prev => {
      const original = prev.find(s => s.id === id);
      if (!original) return prev;
      const template = {
        ...original,
        id: `template_${Date.now()}`,
        status: 'template',
        title: `${original.title} (Template)`,
        targetDate: 0,
        engagement: null,
        dateStr: 'Template',
        justBroadcasted: false
      };
      return [template, ...prev];
    });
  };

  const handleUseTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSignals(prev => {
      const template = prev.find(s => s.id === id);
      if (!template) return prev;
      const newSignal = {
        ...template,
        id: `draft_${Date.now()}`,
        status: 'draft',
        title: template.title.replace(' (Template)', ''),
        targetDate: Date.now() + 86400000, // Schedule for tomorrow by default
        dateStr: 'T-1 Day',
      };
      return [...prev, newSignal];
    });
    setActiveTab('draft');
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragOverId === id) setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setSignals(prev => {
      const draggedIdx = prev.findIndex(s => s.id === draggedId);
      const targetIdx = prev.findIndex(s => s.id === targetId);
      
      if (draggedIdx === -1 || targetIdx === -1) return prev;
      
      const newSignals = [...prev];
      const [draggedItem] = newSignals.splice(draggedIdx, 1);
      newSignals.splice(targetIdx, 0, draggedItem);
      return newSignals;
    });
    setDraggedId(null);
    setDragOverId(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSignals((prev) => {
        let changed = false;
        const newSignals = prev.map(sig => {
          if (sig.status === 'scheduled' && sig.targetDate && sig.targetDate <= now) {
            changed = true;
            return {
              ...sig,
              status: 'broadcasted',
              dateStr: 'Just now',
              engagement: { views: '0', clicks: 0 },
              justBroadcasted: true
            };
          }
          if (sig.justBroadcasted && sig.targetDate && (now - sig.targetDate > 5000)) {
            changed = true;
            return {
              ...sig,
              justBroadcasted: false
            };
          }
          return sig;
        });
        return changed ? newSignals : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredSignals = signals
    .filter(sig => activeTab === 'all' || sig.status === activeTab);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter size={16} className="text-[#1DA1F2]" />;
      case 'linkedin': return <Linkedin size={16} className="text-[#0A66C2]" />;
      case 'email': return <Mail size={16} className="text-brand-teal" />;
      case 'producthunt': return <div className="w-4 h-4 rounded-full bg-[#DA552F] flex items-center justify-center text-white text-[10px] font-bold">P</div>;
      default: return <Share2 size={16} className="text-text-secondary" />;
    }
  };

  const getStatusBadge = (status: string, justBroadcasted?: boolean) => {
    switch (status) {
      case 'broadcasted':
        return (
          <span 
            className={`flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-brand-teal border px-2 py-0.5 rounded-full transition-all duration-500 ${
              justBroadcasted 
                ? 'bg-brand-teal/20 border-brand-teal/50 animate-pulse shadow-[0_0_8px_rgba(0,255,170,0.25)]' 
                : 'bg-brand-teal/10 border-brand-teal/20'
            }`}
          >
            <CheckCircle2 size={10} /> Live
          </span>
        );
      case 'scheduled':
        return <span className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded-full">Scheduled</span>;
      case 'template':
        return <span className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded-full text-[#A855F7] border-[#A855F7]/30 bg-[#A855F7]/10">Template</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-text-tertiary bg-bg-surface border border-border-med px-2 py-0.5 rounded-full">Draft</span>;
    }
  };

  const renderCalendarView = () => {
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    
    const dayOfWeek = todayDate.getDay() || 7; 
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - dayOfWeek + 1); 
    
    const days = Array.from({length: 28}).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d;
    });
    
    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const currentMonthName = todayDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="glass-card border-border-default rounded-3xl overflow-hidden mt-4"
        >
            <div className="p-5 flex justify-between items-center bg-bg-surface border-b border-border-default">
                <span className="font-display font-medium text-lg text-text-primary">
                    {currentMonthName}
                </span>
                <div className="flex gap-2">
                   <button className="p-1.5 rounded-full hover:bg-white/5 text-text-tertiary hover:text-text-primary transition-colors">
                      <ChevronLeft size={18} />
                   </button>
                   <button className="p-1.5 rounded-full hover:bg-white/5 text-text-tertiary hover:text-text-primary transition-colors">
                      <ChevronRight size={18} />
                   </button>
                </div>
            </div>
            
            <div className="px-5 pb-5 pt-3">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekdays.map(day => (
                        <div key={day} className="text-center text-[10px] sm:text-[11px] font-mono font-medium text-text-tertiary">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {days.map((day, i) => {
                        const dayStart = day.getTime();
                        const dayEnd = dayStart + 86400000;
                        const matches = filteredSignals.filter(s => s.status === 'scheduled' && s.targetDate >= dayStart && s.targetDate < dayEnd);
                        const isToday = day.getTime() === todayDate.getTime();
                        const isCurrentMonth = day.getMonth() === todayDate.getMonth();
                        
                        return (
                            <div 
                              key={i} 
                              onClick={() => {
                                  if (matches.length > 0) {
                                      setActiveTab('scheduled'); 
                                      setViewMode('list'); 
                                      setTimeout(() => setExpandedSignalId(matches[0].id), 100);
                                  }
                              }}
                              className={`aspect-[3/4] sm:aspect-square rounded-lg sm:rounded-xl p-1.5 flex flex-col items-center justify-center relative transition-all 
                                          ${matches.length > 0 ? 'cursor-pointer hover:border-brand-teal/50 hover:bg-white/5' : ''}
                                          ${isToday ? 'bg-brand-teal/5 border border-brand-teal/30 shadow-[0_0_15px_rgba(45,212,191,0.1)]' : 
                                            isCurrentMonth ? 'bg-bg-card border border-border-default hover:bg-white-[0.02]' : 'bg-transparent border border-transparent opacity-30'}
                                         `}
                            >
                                {matches.length > 0 ? (
                                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-1">
                                        {matches.slice(0, 4).map((s) => {
                                            const Icon = s.platform === 'twitter' ? Twitter : s.platform === 'linkedin' ? Linkedin : s.platform === 'email' ? Mail : Share2;
                                            const bgColor = s.platform === 'twitter' ? 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20' : 
                                                            s.platform === 'linkedin' ? 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20' : 
                                                            s.platform === 'email' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                                            'bg-brand-teal/10 text-brand-teal border-brand-teal/20';
                                                            
                                            // Make a single icon larger and full-width if alone
                                            const isSingle = matches.length === 1;
                                            const iconSize = isSingle ? 18 : 10;
                                            const containerClasses = isSingle 
                                                ? 'w-full h-full rounded-md sm:rounded-lg' 
                                                : 'w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-sm sm:rounded-md';
                                            
                                            return (
                                                <div key={s.id} title={s.title} className={`${containerClasses} flex flex-col items-center justify-center border ${bgColor} backdrop-blur-sm z-10 transition-transform hover:scale-[1.03]`}>
                                                    <Icon size={iconSize} />
                                                    {isSingle && (
                                                       <span className="text-[10px] mt-1 font-mono font-bold opacity-80">{day.getDate()}</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                        {matches.length > 4 && (
                                            <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-sm sm:rounded-md flex items-center justify-center border border-brand-teal/30 bg-brand-teal/10 text-[8px] sm:text-[9px] text-brand-teal font-medium">
                                                +{matches.length - 4}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className={`text-xs sm:text-[13px] font-mono ${isToday ? 'text-brand-teal font-bold' : 'text-text-secondary font-medium'}`}>
                                        {day.getDate()}
                                    </span>
                                )}
                                
                                {matches.length > 1 && matches.length <= 4 && (
                                    <div className="absolute top-1 left-1.5 text-[9px] font-mono text-text-primary z-20 font-bold drop-shadow-md bg-bg-deep/50 rounded-sm px-0.5">
                                        {day.getDate()}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            
            {/* Scheduled Upcoming list below */}
            <div className="p-5 border-t border-border-default bg-bg-deep">
               <h3 className="font-display font-medium text-sm text-text-secondary mb-3 uppercase tracking-wider">Scheduled Posts</h3>
               <div className="space-y-2">
                 {filteredSignals.filter(s => s.status === 'scheduled').slice(0, 3).map(signal => (
                    <div 
                        key={signal.id} 
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border-default hover:border-brand-teal/50 transition-colors cursor-pointer"
                        onClick={() => {
                            setActiveTab('scheduled'); 
                            setViewMode('list'); 
                            setTimeout(() => setExpandedSignalId(signal.id), 100);
                        }}
                    >
                        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border 
                              ${signal.platform === 'twitter' ? 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20' : 
                                signal.platform === 'linkedin' ? 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20' : 
                                signal.platform === 'email' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                'bg-brand-teal/10 text-brand-teal border-brand-teal/20'}`}
                          >
                              {signal.platform === 'twitter' ? <Twitter size={18} /> : 
                               signal.platform === 'linkedin' ? <Linkedin size={18} /> : 
                               signal.platform === 'email' ? <Mail size={18} /> : <Share2 size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                              <h4 className="font-body font-medium text-text-primary text-sm truncate">{signal.title}</h4>
                              <p className="text-xs text-text-secondary mt-0.5 truncate hidden sm:block">{new Date(signal.targetDate).toLocaleDateString()} at {new Date(signal.targetDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:ml-auto w-full sm:w-auto text-xs font-mono text-text-tertiary px-1 border-t border-border-default/50 sm:border-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                           <span className="sm:hidden">{new Date(signal.targetDate).toLocaleDateString()}</span>
                           <span className="bg-bg-card px-2 py-1 rounded-md border border-border-med">{new Date(signal.targetDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                 ))}
                 {filteredSignals.filter(s => s.status === 'scheduled').length === 0 && (
                     <div className="text-sm text-text-tertiary text-center py-6 bg-bg-surface border border-dashed border-border-med rounded-xl">
                        No signals scheduled for this period.
                     </div>
                 )}
               </div>
            </div>
        </motion.div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-6">
      
      {/* Immersive, colorful, futuristic banner section for Broadcast Signals */}
      <div className="relative w-full h-[140px] sm:h-[180px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-end" id="signals-banner-header">
        <img 
          src="/src/assets/images/space_beacons_radar_1780103248903.png" 
          alt="Space Beacons Radar" 
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.7] contrast-[1.15] scale-105 hover:scale-100 transition-all duration-1000 select-none"
          referrerPolicy="no-referrer"
        />
        {/* Subtle overlay gradients for high content readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B1F] via-[#080B1F]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#080B1F] to-transparent" />
        
        {/* Banner content */}
        <div className="relative p-5 w-full flex justify-between items-end gap-3 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 select-none">
              <span className="font-mono text-[9px] text-[#2dd4bf] font-extrabold tracking-widest bg-[#14B8A6]/20 px-2.5 py-0.5 rounded-md border border-[#14B8A6]/30 shadow-[0_0_15px_rgba(20,184,166,0.25)] uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-ping" />
                TELEMETRY LINK: NOMINAL
              </span>
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 backdrop-blur-sm px-2 py-0.5 rounded-md">
                <Radio size={10} className="text-white fill-[#14B8A6] animate-pulse" />
                <span className="font-sans text-[8.5px] tracking-wide text-white font-extrabold uppercase">COCKPIT SIGNALS</span>
              </div>
            </div>
            
            <h1 className="font-display font-black text-2.5xl sm:text-4xl text-white tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Broadcast Signals
            </h1>
          </div>

          {/* Clean integrated telemetry stat counts */}
          <div className="flex flex-col gap-1 items-end bg-black/45 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl shrink-0">
             <div className="flex items-center gap-2 text-[10px] font-mono text-white select-none">
                 <span className="flex items-center gap-1.5 font-bold text-[#1da1f2]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1da1f2]" />
                    {signals.filter(s => s.status === 'broadcasted').length} TX
                 </span>
                 <span className="opacity-30">|</span>
                 <span className="flex items-center gap-1.5 font-bold text-[#14B8A6]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                    {signals.filter(s => s.status === 'scheduled').length} SCH
                 </span>
             </div>
             <span className="font-mono text-[7.5px] text-[#AAB2D5]/60 uppercase tracking-widest select-none">
                Uplink Transmissions
             </span>
          </div>
        </div>
      </div>

      {/* Signal Composer Toggle */}
      <button
         onClick={() => { playToggle(!isComposerOpen); setIsComposerOpen(!isComposerOpen); }}
         id="toggle-signal-composer"
         className={isComposerOpen 
           ? "w-full py-3 rounded-xl font-body text-sm font-semibold select-none flex items-center justify-center gap-2 cursor-pointer uppercase transition-all border bg-status-error/15 text-[#FF4D6D] border-status-error/30 hover:bg-[#FF4D6D]/15"
           : "w-full btn-primary h-[52px] text-[15px] flex items-center justify-center gap-2 cursor-pointer font-display uppercase tracking-widest hover:opacity-95 transition-all text-white border-0"
         }
      >
         <Sparkles size={16} className={isComposerOpen ? "rotate-45" : ""} />
         {isComposerOpen ? 'Close Composer' : 'Compose New Signal'}
      </button>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border-default pb-2 gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['all', 'draft', 'scheduled', 'broadcasted', 'template'].map((t) => (
            <button
              key={t}
              onClick={() => { playClick(); setActiveTab(t as any); }}
              className={`px-4 py-1.5 rounded-full font-body text-xs whitespace-nowrap transition-colors border ${
                activeTab === t 
                  ? 'bg-text-primary text-bg-deep border-text-primary' 
                  : 'bg-transparent text-text-secondary border-transparent hover:bg-white/5'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <div className="flex bg-bg-surface border border-border-default rounded-md overflow-hidden mr-1">
            <button 
                onClick={() => { playToggle(false); setViewMode('list'); }}
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-text-primary text-bg-deep' : 'text-text-tertiary hover:bg-white/5'}`}
                title="List View"
            >
                <List size={16} />
            </button>
            <button 
                onClick={() => { playToggle(true); setViewMode('calendar'); }}
                className={`p-1.5 transition-colors ${viewMode === 'calendar' ? 'bg-text-primary text-bg-deep' : 'text-text-tertiary hover:bg-white/5'}`}
                title="Calendar View"
            >
                <CalendarDays size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Signal Composer Form */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
             initial={{ opacity: 0, height: 0, marginBottom: 0 }}
             animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
             exit={{ opacity: 0, height: 0, marginBottom: 0 }}
             className="overflow-hidden"
          >
            <form 
               onSubmit={handleCreateSignal}
               className="glass-card p-5 border border-brand-teal/40 bg-gradient-to-b from-bg-card to-brand-teal/[0.02] flex flex-col gap-4 rounded-3xl"
            >
               <div className="flex justify-between items-center border-b border-border-default pb-3">
                  <div className="flex items-center gap-2">
                     <Radio size={18} className="text-brand-teal animate-pulse" />
                     <h3 className="font-display font-bold text-xs tracking-wider text-text-primary uppercase">SIGNAL BROADCAST SYSTEM</h3>
                  </div>
                  <span className="font-mono text-[9px] text-[#A855F7] bg-[#A855F7]/10 border border-[#A855F7]/20 px-2 py-0.5 rounded uppercase font-semibold">T-MINUS SYNC</span>
               </div>

               <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] text-text-secondary uppercase">Campaign Identifier / Title</label>
                  <input 
                     type="text"
                     placeholder="e.g. Launch Day Thread #1, Core Teaser Email"
                     value={newTitle}
                     onChange={(e) => setNewTitle(e.target.value)}
                     className="w-full bg-bg-surface border border-border-default rounded-xl px-4 py-2 text-xs font-body text-text-primary focus:border-brand-teal outline-none transition-colors"
                     required
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                     <label className="font-mono text-[9px] text-text-secondary uppercase">Platform Channel</label>
                     <div className="grid grid-cols-4 bg-bg-surface border border-border-default rounded-xl p-1 gap-1">
                        {['twitter', 'linkedin', 'email', 'producthunt'].map((plat) => {
                           const iconMap = {
                              twitter: <Twitter size={14} />,
                              linkedin: <Linkedin size={14} />,
                              email: <Mail size={14} />,
                              producthunt: <span className="font-bold text-[10px] font-mono leading-none">PH</span>
                           };
                           const activeClass = plat === newPlatform 
                             ? 'bg-brand-teal/20 text-brand-teal border-brand-teal/30' 
                             : 'text-text-secondary border-transparent hover:bg-white/5';
                           return (
                              <button
                                 key={plat}
                                 type="button"
                                 onClick={() => setNewPlatform(plat as any)}
                                 className={`py-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${activeClass}`}
                                 title={plat}
                              >
                                 {iconMap[plat as keyof typeof iconMap]}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="font-mono text-[9px] text-text-rose uppercase">Dispatch Scheduling</label>
                     <div className="grid grid-cols-2 bg-bg-surface border border-border-default rounded-xl p-1 gap-1">
                        <button
                           type="button"
                           onClick={() => setNewScheduleMode('now')}
                           className={`py-1.5 rounded-lg border text-xs font-body transition-all cursor-pointer ${
                             newScheduleMode === 'now' 
                               ? 'bg-status-success/20 text-status-success border-status-success/30 font-semibold' 
                               : 'text-text-secondary border-transparent hover:bg-white/5'
                           }`}
                        >
                           Instant Blast
                        </button>
                        <button
                           type="button"
                           onClick={() => setNewScheduleMode('future')}
                           className={`py-1.5 rounded-lg border text-xs font-body transition-all cursor-pointer ${
                             newScheduleMode === 'future' 
                               ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/30 font-semibold' 
                               : 'text-text-secondary border-transparent hover:bg-white/5'
                           }`}
                        >
                           Time Delay
                        </button>
                     </div>
                  </div>
               </div>

               {newScheduleMode === 'future' && (
                  <div className="flex flex-col gap-1">
                     <label className="font-mono text-[9px] text-text-secondary uppercase">Schedule Date & Time</label>
                     <input 
                        type="datetime-local"
                        value={newScheduleDate}
                        onChange={(e) => setNewScheduleDate(e.target.value)}
                        className="w-full bg-bg-surface border border-border-default rounded-xl px-4 py-2 text-xs font-mono text-text-primary focus:border-brand-teal outline-none transition-colors"
                        required={newScheduleMode === 'future'}
                     />
                  </div>
               )}

               <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline">
                     <label className="font-mono text-[9px] text-text-secondary uppercase">Draft Campaign Text Body</label>
                     <span className={`font-mono text-[9px] ${
                        newContent.length > charLimits[newPlatform] ? 'text-status-error font-bold' : 'text-text-tertiary'
                     }`}>
                        {newContent.length} / {charLimits[newPlatform]} CHARS
                     </span>
                  </div>
                  <textarea 
                     rows={3}
                     placeholder={
                       newPlatform === 'twitter' ? "What's launching today? Keep under 280 characters..." :
                       newPlatform === 'linkedin' ? "Write a professional announcement for your professional network..." :
                       newPlatform === 'email' ? "Subject: Teasing something amazing...\n\nHi founder," :
                       "We are launching FocusFlow! What are your absolute favorite parts of tracking focus?"
                     }
                     value={newContent}
                     onChange={(e) => setNewContent(e.target.value)}
                     className="w-full bg-bg-surface border border-border-default rounded-xl px-4 py-2.5 text-xs font-body text-text-primary focus:border-brand-teal outline-none transition-colors resize-none"
                     required
                  />
               </div>

               <button
                  type="submit"
                  disabled={newContent.length > charLimits[newPlatform] || !newTitle.trim() || !newContent.trim()}
                  className="w-full h-10 btn-primary text-xs font-display font-extrabold tracking-widest uppercase hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer text-white"
               >
                  <Radio size={13} className="animate-pulse" />
                  {newScheduleMode === 'now' ? 'TRANSMIT BROADCAST NOW' : 'COMMIT TO QUEUE'}
               </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'list' ? (
        <motion.div 
           key={activeTab}
           initial="hidden"
           animate="visible"
           variants={{
              hidden: { opacity: 0 },
              visible: {
                 opacity: 1,
                 transition: { staggerChildren: 0.1 }
              }
           }}
           className="space-y-3"
        >
         {filteredSignals.map(signal => {
            const platformGradients = {
               twitter: 'from-[#1DA1F2]/60 to-[#1DA1F2]/10 hover:from-[#1DA1F2]/90 hover:to-[#1DA1F2]/40',
               linkedin: 'from-[#0A66C2]/60 to-[#0A66C2]/10 hover:from-[#0A66C2]/90 hover:to-[#0A66C2]/40',
               email: 'from-orange-500/60 to-orange-500/10 hover:from-orange-500/90 hover:to-orange-500/40',
               producthunt: 'from-[#DA552F]/60 to-[#DA552F]/10 hover:from-[#DA552F]/90 hover:to-[#DA552F]/40',
               default: 'from-brand-teal/60 to-brand-teal/10 hover:from-brand-teal/90 hover:to-brand-teal/40'
            };
            const gradientBase = platformGradients[signal.platform as keyof typeof platformGradients] || platformGradients.default;

            let platformHoverBg = 'hover:bg-text-tertiary/[0.02]';
            let platformHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(156,163,175,0.3)] group-hover:border-text-tertiary/50 border border-transparent';

            if (signal.platform === 'twitter') {
                platformHoverBg = 'hover:bg-[#1DA1F2]/[0.02]';
                platformHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(29,161,242,0.3)] group-hover:border-[#1DA1F2]/50 border border-transparent';
            } else if (signal.platform === 'linkedin') {
                platformHoverBg = 'hover:bg-[#0A66C2]/[0.02]';
                platformHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(10,102,194,0.3)] group-hover:border-[#0A66C2]/50 border border-transparent';
            } else if (signal.platform === 'email') {
                platformHoverBg = 'hover:bg-orange-500/[0.02]';
                platformHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:border-orange-500/50 border border-transparent';
            } else if (signal.platform === 'producthunt') {
                platformHoverBg = 'hover:bg-[#DA552F]/[0.02]';
                platformHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(218,85,47,0.3)] group-hover:border-[#DA552F]/50 border border-transparent';
            } else {
                platformHoverBg = 'hover:bg-brand-teal/[0.02]';
                platformHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(77,200,192,0.3)] group-hover:border-brand-teal/50 border border-transparent';
            }

            return (
               <motion.div 
                  layout
                  key={signal.id}
                  variants={{
                     hidden: { opacity: 0, y: 10 },
                     visible: { opacity: 1, y: 0 }
                  }}
                  className={`p-[1px] rounded-[2rem] bg-gradient-to-r transform hover:scale-[1.02] transition-all duration-300 animate-signal-border ${
                     signal.status === 'scheduled' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                  } ${draggedId === signal.id ? 'opacity-50' : ''} ${gradientBase}`}
                  draggable={signal.status === 'scheduled'}
                  onDragStart={(e) => signal.status === 'scheduled' && handleDragStart(e as unknown as React.DragEvent, signal.id)}
                  onDragOver={(e) => signal.status === 'scheduled' && handleDragOver(e as unknown as React.DragEvent)}
                  onDragEnter={(e) => signal.status === 'scheduled' && handleDragEnter(e as unknown as React.DragEvent, signal.id)}
                  onDragLeave={(e) => signal.status === 'scheduled' && handleDragLeave(e as unknown as React.DragEvent, signal.id)}
                  onDrop={(e) => signal.status === 'scheduled' && handleDrop(e as unknown as React.DragEvent, signal.id)}
                  onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                  onClick={() => {
                    if (draggedId) return; // Prevent expanding when dropping
                    setExpandedSignalId(prev => prev === signal.id ? null : signal.id);
                  }}
               >
                  <div className={`glass-card p-4 rounded-[2rem] flex flex-col gap-3 h-full group transition-colors !border-0 bg-[#060B14]/90 backdrop-blur-xl relative overflow-hidden ${
                     dragOverId === signal.id ? '!bg-brand-teal/10' : ''
                  } ${platformHoverBg}`}>
                     <div className="absolute top-3 right-3 opacity-20 pointer-events-none transform transition-transform group-hover:scale-110">
                        {getPlatformIcon(signal.platform)}
                     </div>
                     <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2">
                     {signal.status === 'scheduled' && (
                        <GripVertical size={16} className="text-text-tertiary mr-1 cursor-grab shrink-0" />
                     )}
                     <div className={`w-8 h-8 rounded-full bg-bg-surface border border-border-default flex items-center justify-center shrink-0 animate-signal-icon transition-all duration-300 ${platformHoverShadow}`}>
                        {getPlatformIcon(signal.platform)}
                     </div>
                     <div className="flex flex-col">
                        <span className="font-display font-medium text-[15px] text-text-primary">{signal.title}</span>
                        {signal.status === 'scheduled' ? (
                           <input
                              type="datetime-local"
                              className="font-body text-[11px] text-text-secondary bg-transparent border-none outline-none cursor-pointer mt-0.5"
                              value={new Date(signal.targetDate - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                              onChange={(e) => {
                                 const timestamp = new Date(e.target.value).getTime();
                                 if (!isNaN(timestamp)) {
                                    setSignals(prev => prev.map(s => s.id === signal.id ? { ...s, targetDate: timestamp } : s));
                                 }
                              }}
                              onClick={(e) => e.stopPropagation()}
                           />
                        ) : (
                           <span className="font-body text-[11px] text-text-secondary">{signal.dateStr}</span>
                        )}
                     </div>
                  </div>
                  {getStatusBadge(signal.status, signal.justBroadcasted)}
               </div>
               
               {expandedSignalId === signal.id && signal.content && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="mt-2 text-sm font-body text-text-primary whitespace-pre-wrap bg-bg-surface p-3 rounded-lg border border-border-default overflow-hidden"
                 >
                   {signal.content}
                 </motion.div>
               )}

               {signal.engagement && (
                 <div className="mt-1 pt-3 border-t border-border-default flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                       <div className="flex gap-4">
                          <div className="flex flex-col">
                             <span className="font-mono text-[10px] uppercase text-text-tertiary">Views</span>
                             <span className="font-mono text-sm text-text-primary">{signal.engagement.views}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="font-mono text-[10px] uppercase text-text-tertiary">Clicks</span>
                             <span className="font-mono text-sm text-text-primary">{signal.engagement.clicks}</span>
                          </div>
                       </div>
                       {expandedSignalId === signal.id && (
                          <button
                             onClick={(e) => { e.stopPropagation(); playSuccess(); handleAnalyze(signal.id, signal.platform); }}
                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-teal/10 hover:bg-brand-teal/20 border border-brand-teal/30 text-brand-teal transition-colors text-xs font-body font-medium"
                             disabled={analyzing[signal.id]}
                          >
                             <Sparkles size={12} className={analyzing[signal.id] ? "animate-pulse" : ""} />
                             {analyzing[signal.id] ? "Analyzing..." : "Analyze Performance"}
                          </button>
                       )}
                    </div>
                    {expandedSignalId === signal.id && MOCK_CHART_DATA[signal.id] && (
                       <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 120 }} 
                          className="w-full mt-4 -ml-2 select-none"
                       >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_CHART_DATA[signal.id]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`colorUsers${signal.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4FD1C5" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#4FD1C5" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC' }}
                                itemStyle={{ color: '#4FD1C5' }}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                              />
                              <Area type="monotone" dataKey="users" stroke="#4FD1C5" strokeWidth={2} fillOpacity={1} fill={`url(#colorUsers${signal.id})`} />
                            </AreaChart>
                          </ResponsiveContainer>
                       </motion.div>
                    )}
                    {analysisResults[signal.id] && expandedSignalId === signal.id && (
                       <motion.div 
                          initial={{ opacity: 0, y: -5 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          className="bg-brand-teal/5 border border-brand-teal/20 rounded-lg p-3 mt-1 flex gap-2 items-start"
                       >
                          <Sparkles size={14} className="text-brand-teal mt-0.5 shrink-0" />
                          <p className="text-xs font-body text-text-primary/90 leading-relaxed">
                             <span className="font-medium text-brand-teal mr-1">AI Insight:</span>
                             {analysisResults[signal.id]}
                          </p>
                       </motion.div>
                    )}
                 </div>
               )}
               {expandedSignalId === signal.id && (
                 <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border-default/50">
                    <button
                       onClick={(e) => { playClick(); handleShareContent(signal, e); }}
                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-surface hover:bg-white/5 border border-border-med text-text-secondary transition-colors text-xs font-body font-medium"
                    >
                       <Share2 size={12} />
                       Share
                    </button>
                    <button
                       onClick={(e) => { playSuccess(); handleCopyContent(signal.id, signal.content, e); }}
                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-surface hover:bg-white/5 border border-border-med text-text-secondary transition-colors text-xs font-body font-medium"
                    >
                       {copiedId === signal.id ? <CheckCircle2 size={12} className="text-brand-teal" /> : <Copy size={12} />}
                       {copiedId === signal.id ? "Copied!" : "Copy Content"}
                    </button>
                    {signal.status === 'template' ? (
                       <button
                          onClick={(e) => { playSuccess(); handleUseTemplate(signal.id, e); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/30 text-[#A855F7] transition-colors text-xs font-body font-medium"
                       >
                          <Copy size={12} />
                          Use Template
                       </button>
                    ) : (
                       <button
                          onClick={(e) => { playSuccess(); handleSaveAsTemplate(signal.id, e); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-surface hover:bg-white/5 border border-border-med text-text-secondary transition-colors text-xs font-body font-medium"
                       >
                          <Bookmark size={12} />
                          Save as Template
                       </button>
                    )}
                 </div>
               )}
                  </div>
               </motion.div>
            );
         })}

         {filteredSignals.length === 0 && (
           <motion.div 
              variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
              }}
              className="py-12 flex flex-col items-center justify-center text-center gap-2"
           >
              <Search size={32} className="text-text-tertiary mb-2" />
              <p className="font-body text-sm text-text-primary">No signals found</p>
              <p className="font-body text-xs text-text-secondary">Try switching your filter or generate new signals in the Foundry.</p>
           </motion.div>
         )}
      </motion.div>
      ) : (
        renderCalendarView()
      )}

    </div>
  );
}
