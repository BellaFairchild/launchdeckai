import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ASSETS, Asset } from '../types';
import { 
  Search, Plus, Upload, Download, Loader2,
  Store, Hash, Video, Megaphone, Scale, File, 
  CheckCircle2, Sparkles, Clock, AlertCircle, Circle,
  Eye, X, ZoomIn, ZoomOut, ShieldAlert
} from 'lucide-react';
import { useToast } from './ToastContext';
import { playClick, playSuccess, playPopup } from '../lib/audio';

export function CargoScreen() {
  const [filter, setFilter] = useState<'all' | 'flight_ready' | 'in_prep' | 'not_loaded' | 'needs_clearance'>('all');
  const [selectedAssetForUpload, setSelectedAssetForUpload] = useState<Asset | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStep, setDownloadStep] = useState<string>('');
  const { addToast } = useToast();

  const clearedAssets = MOCK_ASSETS.filter(a => a.status === 'flight_ready' || a.status === 'cleared');

  const handleDownloadAssets = () => {
    if (clearedAssets.length === 0 || isDownloading) return;
    
    playClick();
    setIsDownloading(true);
    setDownloadStep('Packaging bundle...');
    addToast('Starting Asset Download', `Preparing ZIP bundle for ${clearedAssets.length} cleared assets.`);

    // Visual sequence simulating packing a zip file with professional operational logs
    setTimeout(() => {
      setDownloadStep('Compiling manifest...');
    }, 800);

    setTimeout(() => {
      setDownloadStep('Generating file checksums...');
    }, 1600);

    setTimeout(() => {
      setDownloadStep('Verifying payload signatures...');
    }, 2400);

    setTimeout(() => {
      try {
        const manifestText = `======================================================
LAUNCHDECK AI - FLIGHT CARGO MANIFEST
======================================================
Compiled: ${new Date().toLocaleString()}
Source: LaunchDeck Ground Operations
Payload Status: VERIFIED FLIGHT READY
Plan Category: Commander Level Clearance
Total Core Cargo Modules: ${MOCK_ASSETS.length}
Cleared Payload Units: ${clearedAssets.length}

======================================================
COMPILED FILES IN THIS ZIP BUNDLE:
======================================================
${clearedAssets.map((asset, idx) => {
  return `[FILE ${idx + 1}/${clearedAssets.length}]
Filename: ${asset.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_v1.bin
Category: ${asset.category.toUpperCase()}
Title: ${asset.title}
Asset ID: ${asset.id}
Payload Hash: SHA-256_${Math.random().toString(16).substring(2, 10).toUpperCase()}${Math.random().toString(16).substring(2, 10).toUpperCase()}
Security Status: CLEARED BY LAUNCHDECK AI`;
}).join('\n\n')}

======================================================
METADATA CHECKSUM LOGS:
------------------------------------------------------
Uplink verification tag: LD-SECURE-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}
All checklist tasks are completed for pre-flight launch configuration.
Enjoy your mission!
======================================================
`;

        const blob = new Blob([manifestText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `launchdeck-flight-payload.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        playSuccess();
        addToast('Download Completed', `${clearedAssets.length} assets packaged and downloaded successfully.`);
      } catch (err) {
        addToast('Download Failed', 'Could not assemble the local bundle.');
      } finally {
        setIsDownloading(false);
        setDownloadStep('');
      }
    }, 3200);
  };

  const totalAssets = MOCK_ASSETS.length;
  const flightReadyCount = MOCK_ASSETS.filter(a => a.status === 'flight_ready' || a.status === 'cleared').length;
  const needsAttentionCount = MOCK_ASSETS.filter(a => a.status === 'not_loaded' || a.status === 'needs_clearance').length;

  const categories = [
    { id: 'app_store', label: 'App Store', icon: Store, color: 'text-brand-teal', bgColor: 'bg-brand-teal/10', borderColor: 'border-brand-teal/30' },
    { id: 'social', label: 'Social Content', icon: Hash, color: 'text-brand-blue', bgColor: 'bg-brand-blue/10', borderColor: 'border-brand-blue/30' },
    { id: 'media', label: 'Video & Media', icon: Video, color: 'text-brand-gold', bgColor: 'bg-brand-gold/10', borderColor: 'border-brand-gold/30' },
    { id: 'pr', label: 'Press & PR', icon: Megaphone, color: 'text-[#E91E8C]', bgColor: 'bg-[#E91E8C]/10', borderColor: 'border-[#E91E8C]/30' },
    { id: 'legal', label: 'Legal Docs', icon: Scale, color: 'text-status-warning', bgColor: 'bg-status-warning/10', borderColor: 'border-status-warning/30' },
    { id: 'files', label: 'Files & Other', icon: File, color: 'text-text-tertiary', bgColor: 'bg-text-tertiary/10', borderColor: 'border-text-tertiary/30' },
  ];

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'flight_ready': return <span className="flex items-center gap-1 font-mono text-[10px] text-status-success bg-status-success/10 px-2 py-0.5 rounded-full uppercase"><CheckCircle2 size={12}/> Flight Ready</span>;
      case 'cleared': return <span className="flex items-center gap-1 font-mono text-[10px] text-status-success bg-status-success/10 px-2 py-0.5 rounded-full uppercase"><CheckCircle2 size={12}/> Cleared</span>;
      case 'in_prep': return <span className="flex items-center gap-1 font-mono text-[10px] text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full uppercase"><Sparkles size={12}/> In Prep</span>;
      case 'needs_clearance': return <span className="flex items-center gap-1 font-mono text-[10px] text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full uppercase"><Clock size={12}/> Review</span>;
      case 'not_loaded': return <span className="flex items-center gap-1 font-mono text-[10px] text-text-tertiary bg-bg-surface border border-border-med px-2 py-0.5 rounded-full uppercase"><Circle size={12}/> Not Loaded</span>;
    }
  };

  const getCategoryIcon = (categoryId: string, extraClass: string = '') => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return null;
    const Icon = category.icon;
    return (
      <div className={`p-2 rounded-lg transition-all duration-300 ${category.bgColor} ${extraClass}`}>
        <Icon size={16} className={category.color} />
      </div>
    );
  };

  const renderPreviewContent = (asset: Asset) => {
    switch (asset.type) {
      case 'screenshots':
        return (
          <div className="w-[280px] sm:w-[320px] h-[560px] sm:h-[620px] rounded-[44px] bg-[#020617] border-[9px] border-[#1e293b] shadow-[0_0_40px_rgba(16,183,214,0.35)] overflow-hidden flex flex-col relative select-none">
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-center border border-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 ml-auto mr-3 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-blue-500/80"></span>
              </span>
            </div>

            {/* Simulated status bar */}
            <div className="pt-3.5 px-6 pb-1 flex justify-between text-[9px] font-mono text-text-tertiary z-20">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span className="border border-text-tertiary/40 rounded px-0.5 text-[7px]">100%</span>
              </div>
            </div>

            {/* Outer space background image container */}
            <div className="flex-1 p-5 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0B1528] to-[#040814]">
              {/* Stars & Grid Lines */}
              <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px]" />

              {/* Galactic Core Reactor Visuals */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-brand-blue/5 border border-brand-teal/15 flex items-center justify-center animate-spin-slow" style={{ animationDuration: '40s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full border border-dashed border-brand-teal/10 animate-spin-slow" style={{ animationDuration: '15s' }} />

              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                {/* 3D App Icon / Logo mockup */}
                <div className="relative p-1 bg-gradient-to-tr from-brand-teal to-brand-blue rounded-3xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="w-[72px] h-[72px] rounded-2l bg-[#070D19] flex items-center justify-center overflow-hidden border border-[#ffffff]/10 relative">
                    <img 
                      src="/logo.png" 
                      alt="Logo Preview" 
                      className="w-14 h-14 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const el = e.currentTarget.nextElementSibling as HTMLElement;
                        if (el) el.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 hidden flex-col items-center justify-center bg-bg-deep text-brand-teal font-display font-black text-xs">
                      <span>LD</span>
                      <span className="text-[8px] text-text-primary">AI</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <h3 className="font-display font-black text-lg text-text-primary tracking-tight">LaunchDeck AI</h3>
                  <p className="font-mono text-[9px] text-[#10B7D6] uppercase tracking-widest">SUBORBITAL DECK FLIGHT CONTROL</p>
                </div>

                {/* Simulated Readiness gauge */}
                <div className="mt-2 w-[180px] bg-bg-card/95 border border-border-med rounded-2xl p-3 flex flex-col gap-2 shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-text-tertiary uppercase">READINESS STATUS</span>
                    <span className="font-mono text-[10px] text-status-success font-bold">100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1F2E47] rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-brand-teal to-[#10B7D6] rounded-full shadow-[0_0_10px_#10B7D6]" />
                  </div>
                </div>

                {/* Countdown clock */}
                <div className="flex flex-col items-center mt-2">
                  <span className="font-mono text-[8px] text-text-tertiary mb-1 uppercase tracking-widest">T-MINUS DECK DISPATCH</span>
                  <div className="flex gap-1 justify-center">
                    {['02', '14', '35', '09'].map((unit, i) => (
                      <React.Fragment key={i}>
                        <div className="bg-bg-card/75 border border-[#10B7D6]/20 px-1.5 py-0.5 rounded-md font-mono text-xs font-bold text-text-primary">
                          {unit}
                        </div>
                        {i < 3 && <span className="font-mono text-xs text-[#10B7D6]/50">:</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1.5 py-1 px-3 bg-brand-teal/10 border border-brand-teal/35 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                  <span className="font-mono text-[8px] text-brand-teal tracking-wider uppercase font-semibold">ALL ENGINES ENGAGED</span>
                </div>
              </div>

              {/* Visual simulated device screen graphics */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] flex items-center justify-between px-3 text-[8.5px] font-mono text-text-tertiary">
                <span>ORBIT: SUCCESS</span>
                <span>SECURE COMMS v2.4</span>
              </div>
            </div>
          </div>
        );

      case 'social_blast':
        return (
          <div className="w-[320px] sm:w-[410px] bg-black border border-border-med rounded-3xl p-5 shadow-2xl font-sans text-left text-[#f5f7fa] select-none">
            {/* Post Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-brand-teal/30 bg-[#0B1021] flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Logo avatar" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const el = e.currentTarget.nextElementSibling as HTMLElement;
                    if (el) el.style.display = 'flex';
                  }}
                />
                <div className="hidden text-[10px] font-bold text-brand-teal">LD</div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-text-primary">LaunchDeck AI</span>
                  <span className="bg-[#1D9BF0] text-black w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]">✓</span>
                </div>
                <span className="text-[11px] text-text-tertiary font-medium">@LaunchDeck_AI • 2h</span>
              </div>
            </div>

            {/* Post Content */}
            <p className="mt-3.5 text-xs sm:text-sm font-body leading-relaxed text-text-primary whitespace-pre-line">
              🚀 <span className="text-brand-teal font-semibold">THE REACTOR IGNITION VECTORS ARE CONVERGED</span>. We are officially flight-cleared and approaching our scheduled liftoff sequence.
              {"\n\n"}
              All 12 suborbital checks have passed with 100% readiness scores. Cargo payload is packed and locked! 🦅
              {"\n\n"}
              <span className="text-[#1D9BF0] hover:underline">#LaunchDeckAI</span>{' '}
              <span className="text-[#1D9BF0] hover:underline">#VentureLaunch</span>{' '}
              <span className="text-[#1D9BF0] hover:underline">#DynamicOperations</span>
            </p>

            {/* Simulated Attachment Card */}
            <div className="mt-4 border border-border-med/60 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F1E38] to-[#040812] relative aspect-video flex flex-col justify-end p-5 shadow-inner">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px]" />
              <div className="absolute top-4 right-4 bg-brand-teal/15 border border-brand-teal/40 text-brand-teal text-[9px] font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                PRE-FLIGHT STATUS: SECURED
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-bg-deep/90 border border-brand-teal/20 flex items-center justify-center p-1 shadow-md">
                  <img 
                    src="/logo.png" 
                    alt="Logo preview image" 
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const el = e.currentTarget.nextElementSibling as HTMLElement;
                      if (el) el.style.display = 'flex';
                    }}
                  />
                  <div className="hidden text-[8px] font-bold text-brand-teal">LD</div>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-sm text-[#ffffff] tracking-tight">LaunchDeck AI</span>
                  <span className="font-mono text-[9px] text-[#10B7D6] tracking-widest uppercase">ALL REQUISITE CHECKS IN PERFECT GREEN</span>
                </div>
              </div>
            </div>

            {/* Reactions Bar */}
            <div className="mt-4 pt-3 border-t border-border-med/40 flex items-center justify-between text-text-tertiary font-mono text-[11px]">
              <div className="flex items-center gap-1 hover:text-brand-teal transition-colors cursor-pointer">
                <span>💬</span> <span>42</span>
              </div>
              <div className="flex items-center gap-1 hover:text-[#00BA7C] transition-colors cursor-pointer">
                <span>🔁</span> <span>183</span>
              </div>
              <div className="flex items-center gap-1 hover:text-[#F91880] transition-colors cursor-pointer">
                <span>❤️</span> <span className="text-[#F91880] font-semibold">2,341</span>
              </div>
              <div className="flex items-center gap-1 hover:text-brand-blue transition-colors cursor-pointer">
                <span>📊</span> <span>48.2K</span>
              </div>
            </div>
          </div>
        );

      case 'email_sequence':
        return (
          <div className="w-[320px] sm:w-[420px] bg-[#0A0F1D] border border-border-med rounded-2xl overflow-hidden shadow-2xl font-sans text-left flex flex-col select-none">
            {/* Window bar */}
            <div className="bg-[#050811] px-4 py-2 border-b border-border-med/30 flex items-center justify-between shrink-0">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-error/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-status-success/70" />
              </div>
              <span className="font-mono text-[9px] text-text-tertiary">SECURE TRANSMISSION ENVELOPE</span>
              <div className="w-10" />
            </div>

            {/* Headers */}
            <div className="p-4 border-b border-border-med/30 flex flex-col gap-2 bg-[#080C16] text-[11px] font-mono text-text-secondary">
              <div><span className="text-text-tertiary">FROM:</span> command@launchdeck.ai</div>
              <div><span className="text-text-tertiary">TO:</span> subscriber@venturecapital.co</div>
              <div><span className="text-text-tertiary">SUBJECT:</span> [COMMAND DECK] Orbital clearance approved for LaunchDeck AI</div>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto max-h-[300px] space-y-4 text-text-primary text-xs sm:text-sm font-body leading-relaxed bg-[#060A13]">
              <div className="flex items-center justify-center p-3 border-b border-border-med/15 pb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo mini" className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="font-display font-bold text-brand-teal text-base">LaunchDeck AI</span>
                </div>
              </div>

              <h4 className="font-display font-bold text-xs text-text-primary text-center">FLIGHT DECK CLEARANCE IS OFFICIALLY CO-VERGED</h4>
              
              <p>
                Esteemed Strategic Pilot,
                {"\n\n"}
                Our automatic subsystems have processed the flight-cargo manifest and verified the central core coordinates! Dynamic checklist items are completely locked in perfect green, registering a <span className="text-brand-teal font-semibold font-mono">100% readiness indicator</span>.
              </p>

              {/* Box */}
              <div className="bg-[#0B1222] border border-[#10B7D6]/20 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-[9px] text-brand-teal uppercase">
                  <span>METADATA TRACKING</span>
                  <span>v4.0.0-SECURE</span>
                </div>
                <div className="font-mono text-xs text-text-secondary flex flex-col gap-1">
                  <div>• Payload Count: 6 core vectors</div>
                  <div>• Encryption: SHA-256 secure hash</div>
                  <div>• Status: CERTIFIED READY</div>
                </div>
              </div>

              <p>
                Get ready for ignition booster lift-off. See you on the high orbit.
                {"\n\n"}
                Commander,
                {"\n"}
                LaunchHQ operations team.
              </p>
            </div>
          </div>
        );

      case 'privacy_tos':
        return (
          <div className="w-[320px] sm:w-[420px] bg-[#0E1325] border border-border-med rounded-2xl p-6 shadow-2xl font-mono text-left text-text-secondary text-[11px] whitespace-pre-wrap leading-relaxed select-none relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none text-[32px] font-black uppercase tracking-widest text-text-primary rotate-12">
              LAUNCHDECK APPROVED
            </div>

            <div className="flex justify-between items-start border-b border-[#3b82f6]/20 pb-4 mb-4">
              <div className="flex flex-col">
                <span className="font-bold text-[#ffffff] text-sm uppercase">SECURITY PROTOCOL v4.9</span>
                <span className="text-[8px] text-brand-teal tracking-widest uppercase mt-1">DATA PROCESSING DISCLOSURE</span>
              </div>
              <span className="text-right text-[8px] text-text-tertiary">HNL_SEC_CODE-82A</span>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              <div>
                <span className="text-brand-teal font-bold uppercase">1. ENCRYPTED FIELD STORAGE</span>
                <p className="mt-1 text-text-tertiary text-[10px]">
                  All subspace signals and command logs compiled in LaunchDeck AI use high-intensity cryptographic loops. No plain secrets are logged across telemetry channels.
                </p>
              </div>

              <div>
                <span className="text-brand-teal font-bold uppercase">2. REFUEL SHIELD GUARANTEE</span>
                <p className="mt-1 text-text-tertiary text-[10px]">
                  Fuel balancing mechanics registered in the Refuel Station adhere strictly to local device persistence parameters, guarding operational budgets.
                </p>
              </div>

              <div>
                <span className="text-brand-teal font-bold uppercase">3. CONSENT AND LIFTOFF VECTORS</span>
                <p className="mt-1 text-text-tertiary text-[10px]">
                  By triggering the master rocket booster, pilots accept direct orbital payload liability. Any telemetry charts emitted during the flight is cleared automatically.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border-med/30 flex justify-between items-center text-[9px] text-text-tertiary">
              <span>CERTIFICATE CODE: LD-662</span>
              <span className="flex items-center gap-1 text-status-success font-semibold px-2 py-0.5 bg-status-success/15 border border-status-success/30 rounded-full font-bold uppercase">
                SECURE
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-[320px] sm:w-[420px] bg-[#0A0D1A] border border-border-med rounded-2xl overflow-hidden p-6 shadow-2xl text-left select-none relative">
            <div className="absolute top-4 right-4 text-brand-gold/10 select-none">
              <Sparkles size={48} />
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl border border-brand-gold/30 bg-[#0F1E38] flex items-center justify-center text-brand-gold">
                {asset.category === 'media' ? <Video size={24} /> : <File size={24} />}
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-[#ffffff] text-base">{asset.title}</span>
                <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider">{asset.category} MODULE</span>
              </div>
            </div>

            <div className="bg-[#050811] border border-border-med/60 rounded-xl p-4 flex flex-col gap-3 mb-5">
              <div className="flex justify-between items-center text-[10px] font-mono text-text-tertiary">
                <span>DOCUMENT REVISION_v1.0</span>
                <span className="text-status-success uppercase font-bold px-1.5 py-0.2 bg-status-success/10 rounded">VERIFIED</span>
              </div>
              <p className="font-body text-xs sm:text-sm text-text-secondary leading-relaxed">
                Source material, guidelines, and pre-formatted operational text designed for optimal launch parameters. Undergoes automated system checklist alignments prior to docking with orbital modules.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-widest">VERIFICATION LOGS</span>
              <div className="bg-[#0E1528] rounded-xl p-3 border border-border-med/30 font-mono text-[10px] text-text-secondary flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Sign-off:</span> <span className="text-[#6ee7b7]">Commander Clear</span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span> <span className="text-brand-teal">App Store v1</span>
                </div>
                <div className="flex justify-between">
                  <span>Signature:</span> <span className="text-text-tertiary">LD-SHA256_A0CB</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const filteredAssets = filter === 'all' 
    ? MOCK_ASSETS 
    : filter === 'flight_ready'
      ? MOCK_ASSETS.filter(a => a.status === 'flight_ready' || a.status === 'cleared')
      : MOCK_ASSETS.filter(a => a.status === filter);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-6 relative h-full">
      {/* Header Array / Actions Panel */}
      <div className="glass-card p-5 border-border-med flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative overflow-hidden bg-gradient-to-r from-bg-card to-[#0A1628]/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex gap-4 items-center z-10">
          <div className="w-12 h-12 rounded-xl border border-brand-teal/20 bg-brand-teal/5 flex items-center justify-center shrink-0 relative">
            <Store size={22} className="text-brand-teal" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-display font-bold text-lg text-text-primary tracking-tight">Cargo Payload Hub</h2>
            <p className="font-body text-xs text-text-tertiary">Package and download all cleared mission files.</p>
          </div>
        </div>

        <button 
          onClick={handleDownloadAssets}
          disabled={isDownloading || clearedAssets.length === 0}
          className="relative z-10 w-full sm:w-auto overflow-hidden group flex items-center justify-center gap-2.5 px-5 py-3 bg-brand-teal text-bg-deep rounded-xl font-body text-xs font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(77,200,192,0.4)] disabled:opacity-40 disabled:hover:shadow-none disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isDownloading ? (
            <>
              <Loader2 className="animate-spin text-bg-deep" size={15} />
              <span className="font-mono tracking-wider uppercase text-[10px]">{downloadStep}</span>
            </>
          ) : (
            <>
              <Download size={15} className="text-bg-deep group-hover:translate-y-0.5 transition-transform" />
              <span>DOWNLOAD ASSETS ({clearedAssets.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 flex flex-col items-center justify-center border-border-med hover:-translate-y-1 hover:border-brand-teal/40 transition-all duration-300 cursor-pointer">
          <span className="font-mono text-2xl text-text-primary">{totalAssets}</span>
          <span className="font-body text-[11px] text-text-secondary mt-1 text-center">Total Assets</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center border-status-success/30 bg-status-success/5 hover:-translate-y-1 hover:border-brand-teal/40 transition-all duration-300 cursor-pointer">
          <span className="font-mono text-2xl text-status-success">{flightReadyCount}</span>
          <span className="font-body text-[11px] text-status-success mt-1 text-center">Flight Ready</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center border-status-warning/30 bg-status-warning/5 hover:-translate-y-1 hover:border-brand-teal/40 transition-all duration-300 cursor-pointer">
          <span className="font-mono text-2xl text-status-warning">{needsAttentionCount}</span>
          <span className="font-body text-[11px] text-status-warning mt-1 text-center">Needs Attention</span>
        </div>
      </div>

      {/* Asset Category Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => {
          const count = MOCK_ASSETS.filter(a => a.category === cat.id).length;
          
          const categoryGradients: Record<string, string> = {
             app_store: 'from-brand-teal/60 to-brand-teal/10 hover:from-brand-teal/90 hover:to-brand-teal/40',
             social: 'from-brand-blue/60 to-brand-blue/10 hover:from-brand-blue/90 hover:to-brand-blue/40',
             media: 'from-brand-gold/60 to-brand-gold/10 hover:from-brand-gold/90 hover:to-brand-gold/40',
             pr: 'from-[#E91E8C]/60 to-[#E91E8C]/10 hover:from-[#E91E8C]/90 hover:to-[#E91E8C]/40',
             legal: 'from-status-warning/60 to-status-warning/10 hover:from-status-warning/90 hover:to-status-warning/40',
             files: 'from-text-tertiary/60 to-text-tertiary/10 hover:from-text-tertiary/90 hover:to-text-tertiary/40',
          };
          const gradientBase = categoryGradients[cat.id] || categoryGradients.files;
          
          let categoryHoverBg = 'hover:bg-text-tertiary/[0.02]';
          let categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(156,163,175,0.3)] border border-transparent group-hover:border-text-tertiary/50';

          if (cat.id === 'app_store') {
            categoryHoverBg = 'hover:bg-brand-teal/[0.02]';
            categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(77,200,192,0.3)] border border-transparent group-hover:border-brand-teal/50';
          }
          else if (cat.id === 'social') {
            categoryHoverBg = 'hover:bg-brand-blue/[0.02]';
            categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] border border-transparent group-hover:border-brand-blue/50';
          }
          else if (cat.id === 'media') {
            categoryHoverBg = 'hover:bg-brand-gold/[0.02]';
            categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] border border-transparent group-hover:border-brand-gold/50';
          }
          else if (cat.id === 'pr') {
            categoryHoverBg = 'hover:bg-[#E91E8C]/[0.02]';
            categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(233,30,140,0.3)] border border-transparent group-hover:border-[#E91E8C]/50';
          }
          else if (cat.id === 'legal') {
            categoryHoverBg = 'hover:bg-status-warning/[0.02]';
            categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(255,152,0,0.3)] border border-transparent group-hover:border-status-warning/50';
          }

          return (
            <div key={cat.id} className={`p-[1px] rounded-[24px] bg-gradient-to-r transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-signal-border ${gradientBase}`}>
               <div className={`glass-card group p-3 flex flex-col items-start gap-2 h-full !border-0 bg-[#060B14]/90 backdrop-blur-xl rounded-[24px] transition-colors ${categoryHoverBg}`}>
              <div className="w-full flex justify-between items-start">
                <div className={`p-2 rounded-xl transition-all duration-300 ${cat.bgColor} ${categoryHoverShadow}`}>
                  <cat.icon size={20} className={cat.color} />
                </div>
                <span className="font-mono text-lg text-text-primary">{count}</span>
              </div>
              <span className="font-display font-bold text-sm text-text-primary">{cat.label}</span>
            </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search cargo..." 
            className="w-full bg-bg-card border border-border-med rounded-xl py-3 pl-10 pr-4 text-sm font-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/50"
          />
        </div>
        
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-body text-xs border transition-colors ${filter === 'all' ? 'bg-text-secondary text-bg-deep border-text-secondary' : 'bg-transparent text-text-secondary border-border-med'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('flight_ready')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-body text-xs border transition-colors ${filter === 'flight_ready' ? 'bg-status-success/20 text-status-success border-status-success/30' : 'bg-transparent text-status-success border-border-med'}`}
          >
            Flight Ready
          </button>
          <button 
            onClick={() => setFilter('in_prep')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-body text-xs border transition-colors ${filter === 'in_prep' ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/30' : 'bg-transparent text-brand-gold border-border-med'}`}
          >
            In Prep
          </button>
          <button 
            onClick={() => setFilter('needs_clearance')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-body text-xs border transition-colors ${filter === 'needs_clearance' ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/30' : 'bg-transparent text-brand-gold border-border-med'}`}
          >
            Review
          </button>
          <button 
            onClick={() => setFilter('not_loaded')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-body text-xs border transition-colors ${filter === 'not_loaded' ? 'bg-bg-surface text-text-tertiary border-text-tertiary/50' : 'bg-transparent text-text-tertiary border-border-med'}`}
          >
            Not Loaded
          </button>
        </div>
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        {filteredAssets.map(asset => {
          const categoryGradients: Record<string, string> = {
             app_store: 'from-brand-teal/60 to-brand-teal/10 hover:from-brand-teal/90 hover:to-brand-teal/40',
             social: 'from-brand-blue/60 to-brand-blue/10 hover:from-brand-blue/90 hover:to-brand-blue/40',
             media: 'from-brand-gold/60 to-brand-gold/10 hover:from-brand-gold/90 hover:to-brand-gold/40',
             pr: 'from-[#E91E8C]/60 to-[#E91E8C]/10 hover:from-[#E91E8C]/90 hover:to-[#E91E8C]/40',
             legal: 'from-status-warning/60 to-status-warning/10 hover:from-status-warning/90 hover:to-status-warning/40',
             files: 'from-text-tertiary/60 to-text-tertiary/10 hover:from-text-tertiary/90 hover:to-text-tertiary/40',
          };
          const gradientBase = categoryGradients[asset.category] || categoryGradients.files;
          const isActive = expandedAssetId === asset.id;
          
          let categoryBorder = 'border-border-default';
          let categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(156,163,175,0.3)] border border-transparent';

          if (isActive) {
             if (asset.category === 'app_store') categoryBorder = 'border-brand-teal shadow-[0_0_15px_rgba(77,200,192,0.15)] bg-brand-teal/5';
             else if (asset.category === 'social') categoryBorder = 'border-brand-blue shadow-[0_0_15px_rgba(56,189,248,0.15)] bg-brand-blue/5';
             else if (asset.category === 'media') categoryBorder = 'border-brand-gold shadow-[0_0_15px_rgba(250,204,21,0.15)] bg-brand-gold/5';
             else if (asset.category === 'pr') categoryBorder = 'border-[#E91E8C] shadow-[0_0_15px_rgba(233,30,140,0.15)] bg-[#E91E8C]/5';
             else if (asset.category === 'legal') categoryBorder = 'border-status-warning shadow-[0_0_15px_rgba(255,152,0,0.15)] bg-status-warning/5';
             else categoryBorder = 'border-text-tertiary shadow-[0_0_15px_rgba(156,163,175,0.15)] bg-text-tertiary/5';
          } else {
             if (asset.category === 'app_store') {
                categoryBorder = 'border-border-default hover:border-brand-teal/50 hover:bg-brand-teal/[0.02]';
                categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(77,200,192,0.3)] group-hover:border-brand-teal/50 border border-transparent';
             }
             else if (asset.category === 'social') {
                categoryBorder = 'border-border-default hover:border-brand-blue/50 hover:bg-brand-blue/[0.02]';
                categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] group-hover:border-brand-blue/50 border border-transparent';
             }
             else if (asset.category === 'media') {
                categoryBorder = 'border-border-default hover:border-brand-gold/50 hover:bg-brand-gold/[0.02]';
                categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] group-hover:border-brand-gold/50 border border-transparent';
             }
             else if (asset.category === 'pr') {
                categoryBorder = 'border-border-default hover:border-[#E91E8C]/50 hover:bg-[#E91E8C]/[0.02]';
                categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(233,30,140,0.3)] group-hover:border-[#E91E8C]/50 border border-transparent';
             }
             else if (asset.category === 'legal') {
                categoryBorder = 'border-border-default hover:border-status-warning/50 hover:bg-status-warning/[0.02]';
                categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(255,152,0,0.3)] group-hover:border-status-warning/50 border border-transparent';
             }
             else {
                categoryBorder = 'border-border-default hover:border-text-tertiary/50 hover:bg-text-tertiary/[0.02]';
                categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(156,163,175,0.3)] group-hover:border-text-tertiary/50 border border-transparent';
             }
          }

          return (
          <div key={asset.id} className={`p-[1px] rounded-2xl bg-gradient-to-r transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-signal-border ${gradientBase}`}>
            <div className={`glass-card flex flex-col group transition-all duration-300 h-full !border-0 bg-[#060B14]/90 backdrop-blur-xl rounded-2xl ${categoryBorder}`}>
              <div className="p-4 flex items-center justify-between" onClick={() => setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)}>
              <div className="flex items-center gap-3">
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedAssetForUpload(asset.id === selectedAssetForUpload?.id ? null : asset); 
                  }}
                >
                  {getCategoryIcon(asset.category, categoryHoverShadow)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-body font-medium text-sm text-text-primary group-hover:text-brand-teal transition-colors">{asset.title}</span>
                  <span className="font-mono text-[10px] text-text-tertiary">Updated today</span>
                </div>
              </div>
              <div>
                {getStatusBadge(asset.status)}
              </div>
            </div>
            
            {/* Expanded Details Area */}
            {expandedAssetId === asset.id && (
              <div className={`border-t border-border-med p-4 bg-bg-surface/30 ${selectedAssetForUpload?.id === asset.id ? '' : 'rounded-b-[24px]'}`}>
                <div className="flex flex-col gap-3">
                  <p className="font-body text-sm text-text-secondary">
                    {asset.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} asset details and configuration options.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        playPopup();
                        setPreviewAsset(asset);
                        setZoomLevel(1);
                      }}
                      className="flex-1 min-w-[120px] bg-brand-teal/15 border border-brand-teal/35 text-brand-teal px-3 py-2 rounded-xl font-body text-xs hover:bg-brand-teal/25 hover:border-brand-teal/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye size={13} className="text-brand-teal" /> Quick Preview
                    </button>
                    <button className="flex-1 min-w-[120px] bg-bg-card border border-border-med text-text-primary px-3 py-2 rounded-xl font-body text-xs hover:border-brand-teal/50 transition-colors flex items-center justify-center gap-2">
                      <File size={13} /> View Details
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssetForUpload(asset.id === selectedAssetForUpload?.id ? null : asset);
                      }}
                      className="flex-1 min-w-[120px] bg-bg-card border border-border-med text-text-secondary px-3 py-2 rounded-xl font-body text-xs hover:border-brand-teal/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={13} /> {asset.status === 'not_loaded' ? 'Upload' : 'Re-upload'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Drag and Drop Area */}
            {selectedAssetForUpload?.id === asset.id && (
              <div className="border-t border-border-med p-4 bg-bg-surface/50 rounded-b-[24px] flex flex-col gap-3">
                 <div className="border-2 border-dashed border-border-med rounded-xl flex flex-col items-center justify-center py-6 hover:border-brand-teal/50 transition-colors bg-bg-card cursor-pointer" onClick={() => document.getElementById(`file-upload-${asset.id}`)?.click()}>
                    <Upload size={24} className="text-text-tertiary mb-2" />
                    <p className="font-body text-sm text-text-primary">Drag and drop file here</p>
                 </div>
                 <div className="flex justify-center w-full">
                    <input type="file" id={`file-upload-${asset.id}`} className="hidden" />
                    <label htmlFor={`file-upload-${asset.id}`} className="w-full text-center cursor-pointer font-body font-medium text-sm text-bg-deep bg-brand-teal px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                      Browse Files
                    </label>
                 </div>
              </div>
            )}
          </div>
          </div>
        )})}
      </div>

      {/* Quick Preview Modal Overlay */}
      <AnimatePresence>
        {previewAsset && (
          <div className="fixed inset-0 bg-[#02050D]/95 backdrop-blur-md z-50 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between w-full max-w-2xl mx-auto border-b border-border-med/40 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-teal/10 border border-brand-teal/25 text-brand-teal">
                  <Eye size={20} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display font-bold text-text-primary text-base">{previewAsset.title}</span>
                  <span className="font-mono text-[9px] text-[#10B7D6] uppercase tracking-widest">{previewAsset.category} // PREVIEW SYSTEM</span>
                </div>
              </div>
              <button 
                onClick={() => { playClick(); setPreviewAsset(null); }}
                className="p-2 hover:bg-bg-card border border-border-med hover:border-brand-teal/40 rounded-xl transition-all cursor-pointer text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Workspace */}
            <div className="flex-1 w-full flex items-center justify-center p-4 overflow-auto scrollbar-hide">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: zoomLevel, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                className="relative transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
              >
                {renderPreviewContent(previewAsset)}
              </motion.div>
            </div>

            {/* Modal Actions Footer */}
            <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-border-med/40 pt-4 shrink-0 pb-2 sm:pb-0">
              <div className="flex items-center gap-3 bg-bg-card/90 backdrop-blur-md border border-border-med rounded-2xl px-3 py-1.5 shadow-xl">
                <button 
                  disabled={zoomLevel <= 0.7}
                  onClick={() => { playClick(); setZoomLevel(prev => Math.max(0.6, prev - 0.15)); }}
                  className="p-1.5 hover:bg-bg-surface text-text-secondary disabled:opacity-30 rounded-lg cursor-pointer transition-colors"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="font-mono text-xs text-text-primary min-w-[3.5ch] text-center">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  disabled={zoomLevel >= 1.6}
                  onClick={() => { playClick(); setZoomLevel(prev => Math.min(1.8, prev + 0.15)); }}
                  className="p-1.5 hover:bg-bg-surface text-text-secondary disabled:opacity-30 rounded-lg cursor-pointer transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    playSuccess();
                    addToast('Signature Verified', `Secure payload certificate verified for "${previewAsset.title}".`);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#0e1628]/85 hover:bg-[#15243e] border border-border-med hover:border-brand-teal/40 text-text-primary font-body text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  Verify Signature
                </button>
                <button 
                  onClick={() => {
                    playSuccess();
                    addToast('Starting Asset Download', `Targeting: ${previewAsset.title}`);
                    // Trigger download
                    const textContent = `LAUNCHDECK PRE-FLIGHT CARGO PAYLOAD PREVIEW\nAsset Name: ${previewAsset.title}\nCategory: ${previewAsset.category}\nPre-flight Status Indicator: CLEARED VERIFIED\nVerification Tag: LD-SECURE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${previewAsset.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_source_payload.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-brand-teal/15 hover:bg-brand-teal/25 border border-brand-teal/40 text-brand-teal font-body text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download size={14} className="text-brand-teal" /> Download Payload
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
