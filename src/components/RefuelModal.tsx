import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MOCK_USER, MOCK_MISSION } from '../types';
import { TOOLS } from './FoundryScreen';
import { X, AlertTriangle, Zap, Check, Rocket } from 'lucide-react';
import { playClick, playSuccess, playToggle, playPopup } from '../lib/audio';

interface RefuelModalProps {
  onClose: () => void;
}

export function RefuelModal({ onClose }: RefuelModalProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const currentFuel = MOCK_USER.fuelBalance;
  const maxFuel = MOCK_USER.plan === 'cadet' ? 25 : MOCK_USER.plan === 'commander' ? 1500 : 5000;
  const fuelPct = Math.min(Math.max(currentFuel / maxFuel, 0), 1);
  
  let fuelColorClass = 'text-brand-teal';
  let gaugeColorClass = 'border-brand-teal';
  let isCritical = false;
  
  if (fuelPct <= 0.1) {
    fuelColorClass = 'text-status-error';
    gaugeColorClass = 'border-status-error';
    isCritical = true;
  } else if (fuelPct <= 0.3) {
    fuelColorClass = 'text-status-warning';
    gaugeColorClass = 'border-status-warning';
  }

  const launchDate = typeof window !== 'undefined' && localStorage.getItem('subspace_cached_launch_date') 
    ? parseInt(localStorage.getItem('subspace_cached_launch_date') as string, 10) 
    : MOCK_MISSION.launchDate;
  const tMinus = Math.ceil((launchDate - Date.now()) / (1000 * 60 * 60 * 24));
  const showFleetSupply = tMinus <= 7;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm transition-opacity"
        onClick={() => { playClick(); onClose(); }}
      />
      
      {/* Custom sliding modal */}
      <div className="relative w-full h-[90%] bg-bg-surface rounded-t-3xl border-t border-border-med flex flex-col pt-2 shadow-2xl">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-border-med rounded-full mx-auto mb-2" />
        
        {/* Header */}
        <div className="px-4 pb-2 flex justify-between items-center bg-bg-surface">
           <h2 className="font-display font-bold text-xl text-text-primary">
              Refuel Station
           </h2>
           <button onClick={() => { playClick(); onClose(); }} className="p-2 text-text-secondary hover:text-text-primary rounded-full bg-bg-card border border-border-default cursor-pointer">
              <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-12 space-y-6">
          {/* Top Fuel Card matching the visual */}
          <div className="bg-[#0B1021] rounded-3xl p-6 flex flex-col items-center relative overflow-hidden shadow-2xl mb-6 mt-2 border border-brand-blue/20">
             
             {/* Gauge Container (Domed window) */}
             <div className="w-[260px] h-[130px] bg-[#050B14] rounded-t-[100px] rounded-b-xl relative overflow-hidden flex flex-col items-center justify-end mb-8 shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)] border-[3px] border-[#1f2A3D]/40">
                
                {/* SVG Gauge */}
                <svg viewBox="0 0 200 100" className="w-[180px] h-[90px] z-10 absolute bottom-3">
                  <defs>
                    <mask id="dash-mask">
                      <motion.path 
                        d="M 20 100 A 80 80 0 0 1 180 100" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="24" 
                        strokeDasharray={`${Math.PI * 80} ${Math.PI * 80}`}
                        initial={{ strokeDashoffset: Math.PI * 80 }}
                        animate={{ strokeDashoffset: Math.PI * 80 - (fuelPct * Math.PI * 80) }}
                        transition={{ type: "spring", stiffness: 35, damping: 10, mass: 1 }}
                      />
                    </mask>
                  </defs>

                  {/* Background Track with tick marks */}
                  <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="#1E2D45" 
                    strokeWidth="14" 
                    strokeDasharray="5 7" 
                  />
                  
                  {/* Active Fuel Track masked by solid animated path */}
                  <motion.path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    animate={{ stroke: fuelPct <= 0.1 ? "#ff4b4b" : "#6ee7b7" }}
                    transition={{ duration: 0.5 }}
                    strokeWidth="14" 
                    strokeDasharray="5 7" 
                    mask="url(#dash-mask)"
                    style={{ filter: fuelPct <= 0.1 ? "drop-shadow(0px 0px 8px rgba(255,75,75,0.7))" : "drop-shadow(0px 0px 8px rgba(110,231,183,0.7))" }}
                  />
                </svg>

                {/* Rocket Icon in center with engine glow */}
                <div className="relative z-20 flex flex-col items-center mb-1 drop-[0_4px_10px_rgba(0,0,0,0.5)]">
                   <div className="w-6 h-12 bg-gradient-to-t from-[#ff4b4b] to-transparent absolute -bottom-5 blur-[12px] opacity-90" />
                   <div className="w-2 h-6 bg-gradient-to-t from-white to-transparent absolute -bottom-2 blur-[3px] opacity-100" />
                   <Rocket size={32} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] fill-white" />
                </div>
                
                {/* Faint starry background inside dome */}
                <div className="absolute inset-0 opacity-[0.15] mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjAuNSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]" />
             </div>

             {/* Text Info */}
             <div className="flex flex-col items-center mb-6 z-10 w-full">
                <motion.span 
                   animate={{ 
                     color: fuelPct <= 0.1 ? '#ff4b4b' : '#6ee7b7',
                     textShadow: fuelPct <= 0.1 ? "0px 0px 15px rgba(255,75,75,0.6)" : "0px 0px 15px rgba(110,231,183,0.6)"
                   }}
                   transition={{ duration: 0.8 }}
                   className="font-mono text-[42px] tracking-tight mb-1"
                >
                   {currentFuel} <span className="tracking-normal">Fuel</span>
                </motion.span>
                <span className="font-body text-[13px] text-text-tertiary">
                   {currentFuel} / {maxFuel} Fuel • {MOCK_USER.plan.charAt(0).toUpperCase() + MOCK_USER.plan.slice(1)} Plan • Resets May 1
                </span>
             </div>

             {/* Warning Alert */}
             {isCritical && (
               <div className="w-full bg-[#1e101a] border border-[#ff4b4b]/30 rounded-xl p-4 flex items-start gap-4 mb-6 z-10">
                  <AlertTriangle size={20} className="text-[#ff4b4b] shrink-0 mt-0.5" />
                  <p className="font-body text-[14px] text-[#ff4b4b] leading-tight">
                    Reserve Critical: Your next generation may be your last before launch.
                  </p>
               </div>
             )}

             {/* Button */}
             <button onClick={() => playSuccess()} className="w-full h-[54px] bg-gradient-to-r from-[#6ee7b7] to-[#34d399] rounded-[14px] font-display font-medium text-[#064e3b] text-[16px] z-10 hover:opacity-90 transition-opacity flex items-center justify-center shadow-[0_4px_20px_rgba(52,211,153,0.3)] cursor-pointer">
                Refuel Mission
             </button>
             
             {/* Background glow effects for the card */}
             <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[#6ee7b7]/5 blur-[70px] rounded-full pointer-events-none" />
          </div>

          {/* Quick Refuel CTA (Cadet/Commander) */}
          {MOCK_USER.plan !== 'admiral' && (
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-text-secondary">One-Time Top Ups</h3>
              <div className="space-y-2">
                <div className="glass-card p-3 flex justify-between items-center hover:bg-white/5 cursor-pointer transition-colors">
                  <div className="flex flex-col">
                    <span className="font-body font-medium text-text-primary text-[15px] flex items-center gap-1.5"><Zap size={14} className="text-brand-teal"/> Quick Refuel</span>
                    <span className="font-mono text-xs text-text-tertiary mt-0.5">+100 Fuel</span>
                  </div>
                  <button className="bg-bg-surface border border-border-med text-text-primary px-4 py-1.5 rounded-xl font-body text-sm hover:border-brand-teal/50 transition-colors">
                    $1.99
                  </button>
                </div>
                
                <div className="glass-card p-3 flex justify-between items-center bg-[#1A1200] border-brand-gold/30 hover:bg-[#1A1200]/80 cursor-pointer transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-body font-medium text-brand-gold text-[15px] flex items-center gap-1.5"><Zap size={14} className="text-brand-gold"/> Mission Boost</span>
                      <span className="bg-brand-gold/20 text-brand-gold text-[9px] font-mono uppercase px-1.5 py-0.5 rounded">Best value</span>
                    </div>
                    <span className="font-mono text-xs text-brand-gold/70 mt-0.5">+300 Fuel</span>
                  </div>
                  <button className="bg-brand-gold/10 border border-brand-gold/50 text-brand-gold px-4 py-1.5 rounded-xl font-body text-sm hover:bg-brand-gold/20 transition-colors">
                    $4.99
                  </button>
                </div>

                {showFleetSupply && (
                  <div className="glass-card p-3 flex justify-between items-center bg-[#1E3A5F]/20 border-brand-blue/30 hover:bg-[#1E3A5F]/40 cursor-pointer transition-colors">
                    <div className="flex flex-col">
                      <span className="font-body font-medium text-brand-blue-light text-[15px] flex items-center gap-1.5"><Zap size={14} className="text-brand-blue-light"/> Fleet Supply</span>
                      <span className="font-mono text-xs text-brand-blue-light/70 mt-0.5">+1,000 Fuel</span>
                    </div>
                    <button className="bg-brand-blue/10 border border-brand-blue/50 text-brand-blue-light px-4 py-1.5 rounded-xl font-body text-sm hover:bg-brand-blue/20 transition-colors">
                      $12.99
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          <div className="space-y-4 pt-4 border-t border-border-default">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-text-primary">Clearance Level</h3>
              
              {/* Annual Toggle */}
              <div className="flex items-center bg-bg-card p-1 rounded-full border border-border-med">
                <button 
                  onClick={() => setIsAnnual(false)}
                  className={`px-3 py-1 font-body text-xs rounded-full transition-colors ${!isAnnual ? 'bg-border-med text-text-primary' : 'text-text-secondary'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setIsAnnual(true)}
                  className={`px-3 py-1 font-body text-xs rounded-full transition-colors ${isAnnual ? 'bg-[#1E3A5F] text-brand-blue-light' : 'text-text-secondary'}`}
                >
                  Annual <span className="opacity-80">(-$4M)</span>
                </button>
              </div>
            </div>

            {/* Cadet */}
            <div className="glass-card p-5 border-border-med relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-display font-bold text-[17px] text-text-primary">Cadet</h4>
                  <span className="font-body text-sm text-text-secondary">Free</span>
                </div>
                {MOCK_USER.plan === 'cadet' && (
                  <span className="text-[10px] font-mono text-[#60A5FA] bg-[#1E3A5F] px-2 py-1 rounded-full uppercase">Current Plan</span>
                )}
              </div>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-status-success mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-secondary">1 Active Mission</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-status-success mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-secondary">25 Fuel (5/day drip)</span>
                </li>
              </ul>
              
              <div className="pt-3 border-t border-border-default/50">
                <span className="font-display font-medium text-xs text-text-primary uppercase tracking-wider mb-2 block">Included Foundry Tools</span>
                <ul className="flex flex-wrap gap-1.5">
                  {TOOLS.filter(t => t.minPlan === 'cadet').map(tool => (
                    <li key={tool.id} className="bg-bg-surface border border-border-default px-2 py-1 flex items-center rounded text-[10px] font-body text-text-secondary">
                      <Rocket size={10} className="mr-1 text-text-tertiary" /> {tool.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Commander */}
            <div className="glass-card p-5 border-[2px] border-brand-blue/60 bg-gradient-to-br from-bg-card to-brand-blue/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] font-mono uppercase px-3 py-1 rounded-bl-xl font-bold">
                Most Popular
              </div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h4 className="font-display font-bold text-[19px] text-brand-blue-light">Commander</h4>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-xl text-text-primary">${isAnnual ? '152' : '19'}</span>
                    <span className="font-body text-sm text-text-secondary">/{isAnnual ? 'yr' : 'mo'}</span>
                    {isAnnual && <span className="ml-2 font-body text-xs text-brand-teal px-2 py-0.5 bg-brand-teal/10 rounded-full border border-brand-teal/20">4 months free</span>}
                  </div>
                </div>
                {MOCK_USER.plan === 'commander' && (
                  <span className="text-[10px] font-mono text-brand-blue-light bg-[#1E3A5F] px-2 py-1 rounded-full uppercase">Current</span>
                )}
              </div>
              <p className="font-body text-xs text-text-primary/70 mb-4 italic">"For founders with a launch date and no room for chaos."</p>
              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-brand-blue-light mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-primary leading-tight">3 Active Missions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-brand-blue-light mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-primary leading-tight">1,500 Fuel / month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-brand-blue-light mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-primary leading-tight">Export Signal Pack ZIP</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-brand-blue-light mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-primary leading-tight">Unlimited Copilot</span>
                </li>
              </ul>
              
              <div className="pt-3 border-t border-brand-blue/20 mb-5">
                <span className="font-display font-medium text-xs text-brand-blue-light uppercase tracking-wider mb-2 block">Included Foundry Tools</span>
                <ul className="flex flex-wrap gap-1.5">
                  {TOOLS.filter(t => t.minPlan === 'cadet' || t.minPlan === 'commander').map(tool => (
                    <li key={tool.id} className="bg-brand-blue/10 border border-brand-blue/30 px-2 py-1 flex items-center rounded text-[10px] font-body text-brand-blue-light/90">
                      <Rocket size={10} className="mr-1 opacity-70" /> {tool.name}
                    </li>
                  ))}
                </ul>
              </div>
              
              {MOCK_USER.plan !== 'commander' && MOCK_USER.plan !== 'admiral' && (
                <button onClick={() => playSuccess()} className="w-full h-[44px] bg-gradient-to-r from-brand-blue to-brand-teal rounded-full font-body font-medium text-[15px] text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] cursor-pointer">
                  Initialize Commander →
                </button>
              )}
            </div>

            {/* Admiral */}
            <div className="glass-card p-5 border-[1px] border-brand-gold/40 bg-gradient-to-br from-[#1A1200] to-bg-card relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-display font-bold text-[19px] text-brand-gold">Admiral</h4>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-xl text-text-primary">${isAnnual ? '390' : '49'}</span>
                    <span className="font-body text-sm text-text-secondary">/{isAnnual ? 'yr' : 'mo'}</span>
                    {isAnnual && <span className="ml-2 font-body text-xs text-brand-gold px-2 py-0.5 bg-brand-gold/10 rounded-full border border-brand-gold/20">4 months free</span>}
                  </div>
                </div>
                {MOCK_USER.plan === 'admiral' && (
                  <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-2 py-1 rounded-full uppercase">Current</span>
                )}
              </div>
              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-brand-gold mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-primary/90">Unlimited Missions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-brand-gold mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-primary/90">5,000 Fuel / month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-brand-gold mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-text-primary/90">Everything in Commander</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-brand-gold/20 mb-5">
                <span className="font-display font-medium text-xs text-brand-gold uppercase tracking-wider mb-2 block">Included Foundry Tools</span>
                <ul className="flex flex-wrap gap-1.5">
                  <li className="bg-brand-gold/10 border border-brand-gold/30 px-2 py-1 flex items-center rounded text-[10px] font-body text-brand-gold">
                    <Rocket size={10} className="mr-1 opacity-70" /> All Current and Future Tools
                  </li>
                </ul>
              </div>
              {MOCK_USER.plan !== 'admiral' && (
                <button onClick={() => playSuccess()} className="w-full h-[44px] bg-brand-gold/10 border border-brand-gold/50 text-brand-gold rounded-full font-body font-medium text-[15px] hover:bg-brand-gold/20 transition-colors cursor-pointer">
                  Command the Fleet →
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
