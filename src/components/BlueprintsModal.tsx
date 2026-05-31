import React from 'react';
import { X, LayoutTemplate, ArrowRight, Zap, CheckCircle2, Rocket, FileCode2, BookOpen, Presentation, Users } from 'lucide-react';
import { MOCK_USER } from '../types';
import { playClick, playSuccess } from '../lib/audio';

interface BlueprintsModalProps {
  onClose: () => void;
}

const BLUEPRINTS = [
  {
    id: 'ios_indie',
    title: 'iOS Indie App Launch',
    icon: Rocket,
    color: 'text-brand-teal',
    bgColor: 'bg-brand-teal/10',
    borderColor: 'border-brand-teal/30',
    description: 'Perfect for solo founders launching their first or next iOS app on the App Store.',
    features: ['ASO Keyword Pack', 'Store Screenshots', 'TikTok Hooks', 'Product Hunt Post'],
    popularity: 'Most Popular',
    plan: 'cadet'
  },
  {
    id: 'b2b_saas',
    title: 'B2B SaaS Launch',
    icon: Presentation,
    color: 'text-brand-blue-light',
    bgColor: 'bg-brand-blue/20',
    borderColor: 'border-brand-blue/40',
    description: 'A structured blueprint for launching a B2B product to early access beta users.',
    features: ['LinkedIn Carousel', 'Waitlist Email Sequence', 'Sales One-Pager', 'Cold Email Template'],
    plan: 'commander'
  },
  {
    id: 'creator_presale',
    title: 'Creator Pre-sale',
    icon: Users,
    color: 'text-brand-gold',
    bgColor: 'bg-brand-gold/10',
    borderColor: 'border-brand-gold/30',
    description: 'Designed for creators launching a course, community, or digital product to their audience.',
    features: ['Twitter/X Thread', 'Email Sequence (3-part)', 'Landing Page Copy', 'Gumroad Setup Guide'],
    plan: 'cadet'
  },
  {
    id: 'open_source',
    title: 'Open Source Drop',
    icon: FileCode2,
    color: 'text-[#E91E8C]',
    bgColor: 'bg-[#E91E8C]/10',
    borderColor: 'border-[#E91E8C]/30',
    description: 'Maximize visibility for your open source repository on GitHub and Hacker News.',
    features: ['README.md Template', 'Hacker News Pitch', 'Twitter Drop Thread', 'Dev.to Article'],
    plan: 'commander'
  },
  {
    id: 'newsletter',
    title: 'Newsletter Growth',
    icon: BookOpen,
    color: 'text-[#F3B233]',
    bgColor: 'bg-[#F3B233]/10',
    borderColor: 'border-[#F3B233]/30',
    description: 'A dedicated playbook to launch and scale your first email newsletter past 1,000 subscribers.',
    features: ['Lead Magnet Ideas', 'Welcome Email Series', 'Growth Platform Guide', 'Cross-promo Strategy'],
    plan: 'cadet'
  }
];

export function BlueprintsModal({ onClose }: BlueprintsModalProps) {
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
        <div className="px-4 pb-4 border-b border-border-default flex justify-between items-start">
           <div className="flex flex-col gap-1 mt-1">
             <div className="flex items-center gap-2">
               <div className="p-2 bg-brand-teal/10 rounded-xl w-fit">
                   <LayoutTemplate size={24} className="text-brand-teal" />
               </div>
               <h2 className="font-display font-bold text-xl text-text-primary">
                  Launch Blueprints
               </h2>
             </div>
             <p className="font-body text-sm text-text-secondary mt-1 max-w-[280px]">
                Pre-configured mission templates to fast-track your launch preparation.
             </p>
           </div>
           
           <button onClick={() => { playClick(); onClose(); }} className="p-2 text-text-secondary hover:text-text-primary rounded-full bg-bg-card border border-border-default cursor-pointer">
              <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {BLUEPRINTS.map((blueprint) => {
             const Icon = blueprint.icon;
             const isLocked = blueprint.plan === 'commander' && MOCK_USER.plan === 'cadet';
             
             return (
               <div 
                 key={blueprint.id} 
                 className={`glass-card p-5 border-[1px] ${blueprint.borderColor} flex flex-col gap-4 relative overflow-hidden transition-all group ${isLocked ? 'opacity-80 grayscale-[20%]' : 'hover:border-white/20'}`}
               >
                  {/* Popularity Badge */}
                  {blueprint.popularity && (
                    <div className="absolute top-0 right-0 bg-brand-teal text-bg-deep text-[10px] font-mono uppercase px-3 py-1 rounded-bl-xl font-bold z-10">
                      {blueprint.popularity}
                    </div>
                  )}

                  {/* Header row */}
                  <div className="flex items-start gap-4 text-text-primary">
                    <div className={`p-3 rounded-2xl ${blueprint.bgColor}`}>
                      <Icon size={24} className={blueprint.color} />
                    </div>
                    <div className="flex-1 flex flex-col pt-1">
                       <h3 className="font-display font-bold text-[18px] text-text-primary leading-tight">
                         {blueprint.title}
                       </h3>
                       {isLocked ? (
                         <span className="font-mono text-[10px] text-brand-blue-light uppercase tracking-wider mt-1 flex items-center gap-1">
                           Requires Commander
                         </span>
                       ) : (
                         <span className="font-mono text-[10px] text-status-success uppercase tracking-wider mt-1 flex items-center gap-1">
                           Ready to Deploy
                         </span>
                       )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                     {blueprint.description}
                  </p>
                  
                  {/* Features list */}
                  <div className="bg-bg-deep/40 rounded-xl p-3">
                     <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                       {blueprint.features.map(feature => (
                         <div key={feature} className="flex items-start gap-1.5">
                           <CheckCircle2 size={12} className="text-text-tertiary mt-0.5 shrink-0" />
                           <span className="font-body text-[11px] text-text-secondary leading-tight">{feature}</span>
                         </div>
                       ))}
                     </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => { if (isLocked) { playClick(); } else { playSuccess(); } }}
                    className={`mt-1 w-full h-[44px] rounded-xl font-body font-medium text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isLocked 
                        ? 'bg-bg-card border border-border-med text-text-secondary hover:text-text-primary' 
                        : `bg-bg-surface border border-border-med text-text-primary hover:${blueprint.bgColor} hover:${blueprint.borderColor}`
                    }`}
                  >
                    {isLocked ? 'Upgrade to Unlock' : 'Select Blueprint'}
                    {!isLocked && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
               </div>
             )
          })}
          
          <div className="pt-4 pb-8">
             <div className="glass-card p-5 border-dashed border-border-med flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 bg-bg-surface rounded-full flex items-center justify-center mb-1 border border-border-default">
                  <Zap size={20} className="text-text-tertiary" />
                </div>
                <h4 className="font-display font-medium text-text-primary">Need a custom blueprint?</h4>
                <p className="font-body text-xs text-text-secondary">
                   Use the Copilot to generate a custom launch plan tailored exactly to your product\'s unique needs.
                </p>
                <button onClick={() => playClick()} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full font-body text-xs text-text-primary mt-2 hover:bg-white/10 transition-colors cursor-pointer">
                   Ask Copilot
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
