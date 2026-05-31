import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_USER, Plan } from '../types';
import { 
  Zap, Lock, ArrowRight, CirclePlus, ChevronDown, ChevronUp, Info, Loader2, 
  CheckCircle2, Copy, X, Folder, Download, CloudLightning, FileText, ExternalLink, RefreshCw, Eye, Twitter, Linkedin, Mail, Share2, Apple
} from 'lucide-react';
import { useToast } from './ToastContext';
import { jsPDF } from 'jspdf';
import { initAuth, googleSignIn, logout, listDriveFiles, uploadFileToDrive } from '../lib/firebase';

export const TOOLS = [
  { 
    id: 'app_store_copy', 
    name: 'App Store Copy', 
    platform: 'apple',
    description: 'Title, subtitle, keywords, and app description.', 
    details: 'Generates a fully optimized metadata package tailored for iOS App Store and Google Play, including high-converting titles, subtitles, and ASO-friendly descriptions based on your specific app context.',
    fuelCost: 3, 
    minPlan: 'cadet' as Plan,
    mockOutput: `**Title:** FocusFlow - Zen Task Tracker\n**Subtitle:** Track tasks, avoid burnout\n**Keywords:** focus, adhd timer, pomodoro, calm planner\n\n**Description:**\nFocusFlow is the calmest way to track your daily progress and avoid burnout. Designed explicitly for solo founders, indie hackers, and freelancers who need mindful task tracking without the overwhelming features of traditional enterprise tools.`
  },
  { 
    id: 'social_blast', 
    name: 'Social Blaster', 
    platform: 'twitter',
    description: 'X thread, LinkedIn post, and TikTok script.', 
    details: 'Creates platform-native content designed for maximum engagement. Includes a structured X/Twitter thread, a professional LinkedIn announcement, and a hook-driven TikTok/Reels video script.',
    fuelCost: 3, 
    minPlan: 'cadet' as Plan,
    mockOutput: `**Twitter Thread:**\n1/ I was burning out managing my startup tasks. Today, I'm launching FocusFlow to fix that... \n\n**LinkedIn:**\nI'm thrilled to announce FocusFlow. Over the past 6 months...`
  },
  { 
    id: 'email_sequence', 
    name: 'Email Sequence',
    platform: 'email',
    description: 'A 3-part comprehensive launch email series.', 
    details: 'Drafts a complete email sequence for your waitlist or audience: an anticipation-building teaser sent before launch, a high-urgency launch day announcement, and a follow-up review request.',
    fuelCost: 4, 
    minPlan: 'cadet' as Plan,
    mockOutput: `**Email 1: Teaser (T-7)**\nSubject: Something structured is coming...\n\n**Email 2: Launch**\nSubject: We are live on Product Hunt! 🚀\n...`
  },
  { 
    id: 'aso_keyword', 
    name: 'ASO Keyword Pack', 
    platform: 'linkedin',
    description: 'Keyword clusters, competitor gaps, and metadata.', 
    details: 'Delivers a deep dive into App Store Optimization (ASO) with keyword search intent clusters, analysis of competitor metadata gaps, and tactical recommendations for naming and category selection.',
    fuelCost: 4, 
    minPlan: 'commander' as Plan,
    mockOutput: `**Keyword Clusters Focus:**\n1. "ADHD Planner" (High intent, Med difficulty)\n2. "Aesthetic Pomodoro" (Niche intent, Low difficulty)\n\n**Title Strategy:**\nLead with "Zen" and "Focus" to appeal to the calm tracking niche.`
  },
  { 
    id: 'press_kit', 
    name: 'Press Kit', 
    platform: 'producthunt',
    description: 'Founder bio, media pitch, and Product Hunt comment.', 
    details: 'Builds your public relations foundation. Includes a compelling founder bio, a concise media pitch for journalists/bloggers, and an Maker comment optimized for Product Hunt launches.',
    fuelCost: 5, 
    minPlan: 'commander' as Plan,
    mockOutput: `**Founder Bio:**\nHi, I'm the solo developer behind FocusFlow. After suffering burnout in 2024...\n\n**Product Hunt Maker Comment:**\nHey Product Hunt! 👋 I built FocusFlow to solve my own problem with overwhelming task managers...`
  },
  { 
    id: 'video_script', 
    name: 'Video Script', 
    platform: 'tiktok',
    description: 'TikTok hook and App Store preview voiceover.', 
    details: 'Produces a ready-to-record script for your app preview videos and short-form social content. Features strong visual cues, an attention-grabbing hook, and an effective call-to-action.',
    fuelCost: 5, 
    minPlan: 'commander' as Plan,
    mockOutput: `**TikTok Hook [0:00-0:03]:**\n(Visual: User looking stressed looking at Jira)\n"If your task manager makes you MORE stressed..."\n\n**Body [0:03-0:15]:**\n"...you need FocusFlow. It's a calm tracker that doesn't yell at you."`
  },
  { 
    id: 'privacy_tos', 
    name: 'Privacy Policy & ToS', 
    platform: 'web',
    description: 'Store-submission ready privacy policy and terms.', 
    details: 'Generates a customized Privacy Policy and Terms of Service document required for App Store and Google Play submissions, tailored to your app\'s specific data collection and usage practices.',
    fuelCost: 4, 
    minPlan: 'commander' as Plan,
    mockOutput: `**Privacy Policy (Draft)**\nLast Updated: Today\n\n1. Data Collection\nFocusFlow collects minimal data necessary to provide its services. We do not sell your task data...`
  },
];

const PLAN_RANK: Record<Plan, number> = { cadet: 0, commander: 1, admiral: 2 };

export function FoundryScreen() {
  const { addToast } = useToast();
  
  // Basic states
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [localFuel, setLocalFuel] = useState(MOCK_USER.fuelBalance);
  const [forgingId, setForgingId] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<{ toolName: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Google Integration states
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);

  // Subscribe to Authentication state on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setIsSyncEnabled(true);
        // Pre-fetch files when sync is enabled
        fetchFilesSilently();
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setIsSyncEnabled(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchFilesSilently = async () => {
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (err) {
      console.error('Silent drive list error:', err);
    }
  };

  const handleFetchDriveFiles = async () => {
    setIsLoadingDrive(true);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
      addToast('Sync Completed', 'Successfully fetched latest Google Drive backup records.');
    } catch (err: any) {
      addToast('Sync Failed', err.message || 'Unable to scan Google Drive directory.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setIsSyncEnabled(true);
        addToast('Connected to Google!', 'Your Google Drive connection is now fully active.');
        // Pull initial file list
        setIsLoadingDrive(true);
        const files = await listDriveFiles();
        setDriveFiles(files);
      }
    } catch (err: any) {
      console.error(err);
      addToast('Connection Failed', err.message || 'Google Authentication cancelled or rejected.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    const confirmSignOut = window.confirm("Are you sure you want to disconnect Google Drive? This will clear active sessions.");
    if (!confirmSignOut) return;
    
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      setDriveFiles([]);
      setIsSyncEnabled(false);
      addToast('Disconnected', 'Successfully cleared Google credentials from active cache.');
    } catch (err: any) {
      addToast('Disconnect Failed', err.message || 'An error occurred during sign out.');
    }
  };

  // Modern Styled PDF Generation & Local Download
  const handleExportPDF = () => {
    if (!generatedAsset) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // App Theme Color Block
      doc.setFillColor(15, 23, 42); // slate-900 border matching UI
      doc.rect(0, 0, 210, 42, 'F');

      // Title header
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('LAUNCHDECK AI', 15, 18);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(77, 200, 192); // Teal Accent color!
      doc.text('FORGED ASSET METADATA REPORT', 15, 26);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text('Confidential Campaign Materials', 15, 33);

      // Line
      doc.setDrawColor(77, 200, 192);
      doc.setLineWidth(0.8);
      doc.line(0, 42, 210, 42);

      // Main header info
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(`Asset Series: ${generatedAsset.toolName}`, 15, 54);

      // Metadata layout
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(15, 60, 180, 20, 'FD');

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('Engine Blueprint:', 20, 67);
      doc.text('Security Level:', 20, 74);
      doc.text('Generation Timestamp:', 110, 67);
      doc.text('Sync Status:', 110, 74);

      doc.setTextColor(30, 41, 59); // slate-800
      doc.setFont('Helvetica', 'bold');
      doc.text('Foundry v4.1', 52, 67);
      doc.text('Operational CADET+', 52, 74);
      doc.text(new Date().toLocaleString(), 150, 67);
      doc.text(googleUser ? 'CLOUD SYNCED' : 'LOCAL CACHED', 150, 74);

      // Body text starts
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.setLineHeightFactor(1.55);

      const splitLines = doc.splitTextToSize(generatedAsset.content, 180);
      
      let yCord = 92;
      const docLimit = 280; // height buffer

      for (let j = 0; j < splitLines.length; j++) {
        if (yCord > docLimit) {
          doc.addPage();
          // Running page header
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 210, 12, 'F');
          doc.setTextColor(77, 200, 192);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`LAUNCHDECK HQ - FORGED ${generatedAsset.toolName.toUpperCase()}`, 15, 8);

          yCord = 22;
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(51, 65, 85);
        }
        doc.text(splitLines[j], 15, yCord);
        yCord += 7;
      }

      doc.save(`${generatedAsset.toolName.toLowerCase().replace(/\s+/g, '_')}_forged.pdf`);
      addToast('Document Generated', 'Successfully created and downloaded custom PDF!');
    } catch (err: any) {
      addToast('Export Failed', err.message || 'We could not compilation client-side PDF.');
    }
  };

  // Forwards & Sync Branded PDF copy directly on user's Google Drive
  const handleUploadPDFToDrive = async () => {
    if (!generatedAsset) return;
    if (!googleUser) {
      addToast('Google Drive Required', 'Please connect your Google Drive account first below.');
      return;
    }
    
    setIsUploadingToDrive(true);
    addToast('Google Drive Backup', 'Compiling PDF document and archiving to cloud vault...');
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // App Theme Color Block
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, 'F');

      // Title header
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('LAUNCHDECK AI', 15, 18);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(77, 200, 192);
      doc.text('FORGED ASSET METADATA REPORT', 15, 26);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Confidential Campaign Materials', 15, 33);

      doc.setDrawColor(77, 200, 192);
      doc.setLineWidth(0.8);
      doc.line(0, 42, 210, 42);

      // Main header info
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(`Asset Series: ${generatedAsset.toolName}`, 15, 54);

      // Metadata layout
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 60, 180, 20, 'FD');

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Engine Blueprint:', 20, 67);
      doc.text('Security Level:', 20, 74);
      doc.text('Generation Timestamp:', 110, 67);
      doc.text('Sync Status:', 110, 74);

      doc.setTextColor(30, 41, 59);
      doc.setFont('Helvetica', 'bold');
      doc.text('Foundry v4.1', 52, 67);
      doc.text('Operational CADET+', 52, 74);
      doc.text(new Date().toLocaleString(), 150, 67);
      doc.text('CLOUD ARCHIVED', 150, 74);

      // Body text starts
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.setLineHeightFactor(1.55);

      const splitLines = doc.splitTextToSize(generatedAsset.content, 180);
      
      let yCord = 92;
      const docLimit = 280;

      for (let j = 0; j < splitLines.length; j++) {
        if (yCord > docLimit) {
          doc.addPage();
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 210, 12, 'F');
          doc.setTextColor(77, 200, 192);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`LAUNCHDECK HQ - FORGED ${generatedAsset.toolName.toUpperCase()}`, 15, 8);

          yCord = 22;
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(51, 65, 85);
        }
        doc.text(splitLines[j], 15, yCord);
        yCord += 7;
      }

      const pdfBlob = doc.output('blob');
      const filename = `${generatedAsset.toolName.toLowerCase().replace(/\s+/g, '_')}_forged_${Date.now()}.pdf`;
      
      const response = await uploadFileToDrive(filename, pdfBlob, 'application/pdf');
      if (response) {
        addToast('Back-up Secure', `Archived safely on your Google Drive as "${filename}"!`);
        // Refresh local listings
        fetchFilesSilently();
      }
    } catch (err: any) {
      addToast('Backup Failed', err.message || 'Could not save PDF copy to Google Drive.');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const maxFuel = MOCK_USER.plan === 'cadet' ? 25 : MOCK_USER.plan === 'commander' ? 1500 : 5000;
  const fuelPct = localFuel / maxFuel;
  
  let fuelColorClass = 'bg-brand-teal text-white border-brand-teal/20';
  let fuelTextClass = 'text-brand-teal';
  let isPulsing = false;
  
  if (fuelPct <= 0) {
    fuelColorClass = 'bg-bg-depleted text-text-tertiary border-border-med';
    fuelTextClass = 'text-status-error';
    isPulsing = true;
  } else if (fuelPct <= 0.1) {
    fuelColorClass = 'bg-status-error/20 text-status-error border-status-error/30';
    fuelTextClass = 'text-status-error';
    isPulsing = true;
  } else if (fuelPct <= 0.3) {
    fuelColorClass = 'bg-status-warning/20 text-status-warning border-status-warning/30';
    fuelTextClass = 'text-status-warning';
  }

  const toggleExpand = (id: string) => {
    setExpandedToolId(expandedToolId === id ? null : id);
  };

  const handleForge = (tool: typeof TOOLS[0]) => {
    if (localFuel < tool.fuelCost) return;
    
    setForgingId(tool.id);
    
    // Simulate forging process
    setTimeout(() => {
      setLocalFuel(prev => Math.max(0, prev - tool.fuelCost));
      setForgingId(null);
      setGeneratedAsset({ toolName: tool.name, content: tool.mockOutput });
    }, 2000);
  };

  const handleCopy = () => {
    if (!generatedAsset) return;
    navigator.clipboard.writeText(generatedAsset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter local drive search files
  const filteredFiles = driveFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-6">
      {/* Immersive, colorful, futuristic banner section with fuel status */}
      <div className={`relative w-full h-[140px] sm:h-[180px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-end ${isPulsing ? 'animate-pulse' : ''}`} id="foundry-banner-capsule">
        <img 
          src="/src/assets/images/fusion_forge_reactor_1780103223105.png" 
          alt="Fusion Forge Reactor" 
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.7] contrast-[1.1] scale-105 hover:scale-100 transition-all duration-1000 select-none"
          referrerPolicy="no-referrer"
        />
        {/* Subtle overlay gradients for high content readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B1F] via-[#080B1F]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#080B1F] to-transparent" />
        
        {/* Banner content */}
        <div className="relative p-5 w-full flex justify-between items-end gap-3 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 select-none">
              <span className="font-mono text-[9px] text-[#DDA15E] font-extrabold tracking-widest bg-[#DDA15E]/15 px-2.5 py-0.5 rounded-md border border-[#DDA15E]/35 shadow-[0_0_15px_rgba(221,161,94,0.15)] uppercase">
                REACTOR STATUS: ACTIVE
              </span>
              <div className="flex items-center gap-1 bg-[#14B8A6]/20 border border-[#14B8A6]/35 backdrop-blur-sm px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
                <span className="font-sans text-[8.5px] tracking-wide text-white font-extrabold uppercase">FORGE FOUNDRY</span>
              </div>
            </div>
            
            <h1 className="font-display font-black text-2.5xl sm:text-4xl text-white tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Asset Foundry
            </h1>
          </div>

          {/* Clean integrated Fuel display */}
          <div className="flex flex-col items-end text-right shrink-0 bg-black/45 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border border-white/10 shadow-xl">
             <span className={`font-mono text-2xl sm:text-3xl font-extrabold flex items-center gap-1.5 leading-none ${fuelTextClass}`}>
                <Zap size={18} className="fill-current animate-bounce" />
                {localFuel}
             </span>
             <span className="font-mono text-[8.5px] text-[#AAB2D5]/70 uppercase tracking-wider mt-1 select-none">
                {MOCK_USER.plan === 'cadet' ? '25 max' : `${MOCK_USER.plan.toUpperCase()} max`}
             </span>
          </div>
        </div>
      </div>

       {/* Tools List */}
      <div className="space-y-4">
        {TOOLS.map((tool) => {
          const getPlatformIcon = (platform: string) => {
            switch (platform) {
              case 'twitter': return <Twitter size={18} className="text-[#1DA1F2]" />;
              case 'linkedin': return <Linkedin size={18} className="text-[#0A66C2]" />;
              case 'email': return <Mail size={18} className="text-orange-500" />;
              case 'producthunt': return <div className="w-[18px] h-[18px] rounded-full bg-[#DA552F] flex items-center justify-center text-white text-[11px] font-bold">P</div>;
              case 'apple': return <Apple size={18} className="text-white" />;
              default: return <Share2 size={18} className="text-text-secondary" />;
            }
          };

          const isUnlocked = PLAN_RANK[MOCK_USER.plan] >= PLAN_RANK[tool.minPlan];
          const hasEnoughFuel = localFuel >= tool.fuelCost;
          const isExpanded = expandedToolId === tool.id;
          const isForging = forgingId === tool.id;
          
          const platformGradients: Record<string, string> = {
             twitter: 'from-[#1DA1F2]/60 to-[#1DA1F2]/10 hover:from-[#1DA1F2]/90 hover:to-[#1DA1F2]/40',
             linkedin: 'from-[#0A66C2]/60 to-[#0A66C2]/10 hover:from-[#0A66C2]/90 hover:to-[#0A66C2]/40',
             email: 'from-orange-500/60 to-orange-500/10 hover:from-orange-500/90 hover:to-orange-500/40',
             producthunt: 'from-[#DA552F]/60 to-[#DA552F]/10 hover:from-[#DA552F]/90 hover:to-[#DA552F]/40',
             apple: 'from-white/60 to-white/10 hover:from-white/90 hover:to-white/40',
             default: 'from-brand-teal/60 to-brand-teal/10 hover:from-brand-teal/90 hover:to-brand-teal/40'
          };
          const gradientBase = platformGradients[tool.platform] || platformGradients.default;

          let categoryHoverBg = 'hover:bg-text-tertiary/[0.02]';
          let categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(156,163,175,0.3)] text-text-tertiary'; // default

          if (tool.platform === 'twitter') {
             categoryHoverBg = 'hover:bg-[#1DA1F2]/[0.02]';
             categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(29,161,242,0.3)] group-hover:border-[#1DA1F2]/50';
          } else if (tool.platform === 'linkedin') {
             categoryHoverBg = 'hover:bg-[#0A66C2]/[0.02]';
             categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(10,102,194,0.3)] group-hover:border-[#0A66C2]/50';
          } else if (tool.platform === 'email') {
             categoryHoverBg = 'hover:bg-orange-500/[0.02]';
             categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:border-orange-500/50';
          } else if (tool.platform === 'producthunt') {
             categoryHoverBg = 'hover:bg-[#DA552F]/[0.02]';
             categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(218,85,47,0.3)] group-hover:border-[#DA552F]/50';
          } else if (tool.platform === 'apple') {
             categoryHoverBg = 'hover:bg-white/[0.02]';
             categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:border-white/50';
          } else {
             categoryHoverBg = 'hover:bg-brand-teal/[0.02]';
             categoryHoverShadow = 'group-hover:shadow-[0_0_15px_rgba(77,200,192,0.3)] group-hover:border-brand-teal/50';
          }

          return (
            <div key={tool.id} className={`group p-[1px] rounded-[24px] bg-gradient-to-r transition-all duration-300 transform hover:scale-[1.02] animate-signal-border ${gradientBase}`}>
               <div className={`glass-card p-5 flex flex-col gap-4 h-full !border-0 bg-[#060B14]/90 backdrop-blur-xl rounded-[24px] transition-colors ${categoryHoverBg}`}>
               <div>
                  <div className="flex justify-between items-start mb-1">
                     <div className="flex items-center gap-2">
                       <div className={`w-8 h-8 rounded-full bg-bg-surface border border-border-default flex items-center justify-center shrink-0 transition-all duration-300 ${categoryHoverShadow}`}>
                         {getPlatformIcon(tool.platform)}
                       </div>
                       <h3 className="font-display font-bold text-[17px] text-text-primary tracking-tight">
                          {tool.name}
                       </h3>
                       <button 
                          onClick={() => toggleExpand(tool.id)}
                          className="text-text-tertiary hover:text-brand-blue-light transition-colors"
                       >
                          {isExpanded ? <ChevronUp size={16} /> : <Info size={16} />}
                       </button>
                     </div>
                     <span className="flex items-center gap-1 font-mono text-[11px] text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                        <Zap size={10} /> {tool.fuelCost}
                     </span>
                  </div>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                     {tool.description}
                  </p>
                  
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-bg-surface/50 border border-border-med rounded-xl transition-all animate-in fade-in slide-in-from-top-2">
                       <p className="font-body text-xs text-text-primary/90 leading-relaxed">
                          {tool.details}
                       </p>
                    </div>
                  )}
               </div>
               
               {isUnlocked ? (
                  hasEnoughFuel ? (
                    <button 
                       onClick={() => handleForge(tool)}
                       disabled={forgingId !== null} 
                       className={`w-full h-[44px] text-[15px] group ${forgingId !== null && !isForging ? 'bg-bg-card border border-border-med text-text-tertiary opacity-50' : 'btn-primary'}`}
                    >
                       {isForging ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Forging Asset...
                          </span>
                       ) : (
                          <span className="flex items-center">
                            Forge Asset 
                            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </span>
                       )}
                    </button>
                  ) : (
                    <button disabled className="w-full h-[44px] text-[15px] bg-bg-depleted border border-border-med text-text-tertiary rounded-full font-body font-medium flex justify-center items-center opacity-70">
                       Not Enough Fuel
                    </button>
                  )
               ) : (
                 <button className="w-full h-[44px] text-[15px] bg-bg-card border border-border-med text-text-secondary rounded-full font-body font-medium flex justify-center items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-brand-gold font-mono text-xs uppercase flex items-center gap-1">
                       <Lock size={12} /> {tool.minPlan} Unlock
                    </span>
                 </button>
               )}
            </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Refuel Card */}
      {MOCK_USER.plan !== 'admiral' && (
        <div className="bg-[#1A1200] border border-brand-gold/30 rounded-2xl p-4 flex justify-between items-center mt-4">
           <div className="flex flex-col">
              <span className="font-display font-bold text-[15px] text-brand-gold">Quick Refuel</span>
              <span className="font-body text-xs text-brand-gold/70">+100 Fuel to Forge more</span>
           </div>
           <button className="font-body font-medium text-sm border border-brand-gold/50 text-brand-gold px-4 py-2 rounded-xl bg-brand-gold/10 hover:bg-brand-gold/20 transition-colors flex items-center gap-1">
              $1.99
           </button>
        </div>
      )}

      {/* Google Connected Hub / Custom Pick & Back Up Vault */}
      <div className="glass-card p-5 border border-border-default space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <CloudLightning size={18} className="text-brand-teal" />
            <h3 className="font-display font-bold text-[15px] text-text-primary tracking-tight">
              Google Workspace Vault
            </h3>
          </div>
          {googleUser ? (
            <span className="font-mono text-[9px] bg-brand-teal/15 text-brand-teal border border-brand-teal/30 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
              Sync Active
            </span>
          ) : (
            <span className="font-mono text-[9px] bg-white/5 text-text-tertiary border border-border-default px-2 py-0.5 rounded uppercase font-semibold">
              Offline Cache
            </span>
          )}
        </div>

        {!googleUser ? (
          <div className="py-4 text-center space-y-3 flex flex-col items-center">
            <Folder size={32} className="text-text-tertiary mx-auto mb-1 animate-bounce" style={{ animationDuration: '3s' }} />
            <div>
              <p className="font-display font-bold text-sm text-text-primary">
                Activate Google Drive Vault
              </p>
              <p className="font-body text-xs text-text-secondary mt-1 max-w-[280px] mx-auto leading-relaxed">
                Connect your account to save forged plans, back up assets as beautifully rendered PDFs, and search folders.
              </p>
            </div>
            
            <button 
              onClick={handleConnectGoogle}
              className="mt-2 flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-full py-2 px-5 font-body font-semibold text-xs transition-all shadow-md group hover:scale-[1.02] cursor-pointer"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* User credentials banner */}
            <div className="flex justify-between items-center p-3 bg-bg-surface/60 rounded-xl border border-border-med">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal font-display font-bold font-mono text-xs uppercase shrink-0">
                  {googleUser.displayName ? googleUser.displayName.charAt(0) : 'G'}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-xs text-text-primary truncate">{googleUser.displayName || 'Google Account'}</p>
                  <p className="font-mono text-[10px] text-text-tertiary truncate">{googleUser.email}</p>
                </div>
              </div>
              <button 
                onClick={handleDisconnectGoogle}
                className="p-1 px-2.5 bg-status-error/10 hover:bg-status-error/15 text-status-error border border-status-error/20 rounded-lg text-[10px] uppercase font-mono tracking-wider transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>

            {/* In-app Custom Google Picker/File Explorer */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-text-tertiary tracking-wider font-bold">Drive Picker Explorer</span>
                <button 
                  onClick={handleFetchDriveFiles}
                  disabled={isLoadingDrive}
                  className="flex items-center gap-1 text-[10px] font-mono text-brand-teal uppercase font-bold hover:text-brand-teal-light transition-colors"
                >
                  <RefreshCw size={10} className={isLoadingDrive ? "animate-spin" : ""} />
                  {isLoadingDrive ? 'Fetching...' : 'Scan Directory'}
                </button>
              </div>

              {/* Search input inside Picker */}
              <input 
                type="text" 
                placeholder="Search Drive files..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-bg-card border border-border-med rounded-lg px-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-teal/60 font-body transition-colors"
              />

              {/* Files explorer container */}
              <div className="bg-bg-card rounded-xl border border-border-med overflow-hidden">
                {isLoadingDrive ? (
                  <div className="p-8 text-center text-text-tertiary text-xs space-y-2">
                    <Loader2 size={20} className="animate-spin text-brand-teal mx-auto" />
                    <p className="font-body">Querying Google Workspace...</p>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="p-8 text-center text-text-tertiary text-xs leading-relaxed">
                    <FileText size={24} className="opacity-40 mx-auto mb-2" />
                    <p className="font-body font-medium text-text-secondary">No files found</p>
                    <p className="font-body text-[10px] mt-0.5">Use "Archive to Drive" in the modal tools to store forged plans.</p>
                  </div>
                ) : (
                  <div className="max-h-[180px] overflow-y-auto divide-y divide-white/5 no-scrollbar">
                    {filteredFiles.map((file) => {
                      const isPdf = file.mimeType?.includes('pdf');
                      const sizeKb = file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'Dynamic size';
                      const formattedTime = file.createdTime 
                        ? new Date(file.createdTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '';

                      return (
                        <div key={file.id} className="p-3 hover:bg-white/5 flex items-center justify-between gap-3 group transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? 'bg-[#FF4D6D]/15 text-[#FF4D6D]' : 'bg-brand-teal/15 text-brand-teal'}`}>
                              <FileText size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-medium text-xs text-text-primary truncate">{file.name}</p>
                              <p className="font-mono text-[9px] text-text-tertiary flex items-center gap-1.5 mt-0.5">
                                <span>{sizeKb}</span>
                                <span>•</span>
                                <span>{formattedTime}</span>
                              </p>
                            </div>
                          </div>
                          
                          {file.webViewLink && (
                            <a 
                              href={file.webViewLink} 
                              target="_blank" 
                              rel="noreferrer noopener"
                              className="w-7 h-7 bg-bg-surface hover:bg-brand-teal/15 hover:text-brand-teal border border-border-med rounded-md flex items-center justify-center text-text-secondary transition-all shrink-0 cursor-pointer"
                              title="Open on Google Drive"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Modal */}
      <AnimatePresence>
        {generatedAsset && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-bg-surface border border-brand-teal/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-border-default flex justify-between items-center bg-brand-teal/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-text-primary">Asset Forged</h3>
                    <p className="font-body text-xs text-brand-teal">{generatedAsset.toolName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setGeneratedAsset(null)}
                  className="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-full hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto no-scrollbar bg-bg-card">
                <div className="font-mono text-sm tracking-tight text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {generatedAsset.content}
                </div>
              </div>

              {/* Export Panel Options */}
              <div className="px-5 py-3.5 bg-bg-surface/50 border-t border-border-default flex gap-3 overflow-x-auto no-scrollbar justify-between">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 p-2 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal rounded-lg font-mono text-[10px] uppercase font-bold transition-all border border-brand-teal/20 cursor-pointer"
                  title="Export formatted PDF document to downloads"
                >
                  <Download size={12} /> export PDF
                </button>

                {googleUser ? (
                  <button
                    onClick={handleUploadPDFToDrive}
                    disabled={isUploadingToDrive}
                    className="flex items-center gap-1.5 p-2 bg-[#4285F4]/15 hover:bg-[#4285F4]/25 text-[#7daef8] rounded-lg font-mono text-[10px] uppercase font-bold transition-all border border-[#4285F4]/30 cursor-pointer"
                    title="Send beautifully designed PDF straight to your connected Google Drive folder"
                  >
                    {isUploadingToDrive ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> saving...
                      </>
                    ) : (
                      <>
                        <Folder size={12} /> Archive to Drive
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    className="flex items-center gap-1.5 p-2 bg-border-med hover:bg-border-med/80 text-text-secondary rounded-lg font-mono text-[10px] uppercase font-bold transition-all cursor-pointer"
                    title="Connect Google account to push blueprints on your cloud folder"
                  >
                    <Folder size={12} /> Sync with Drive
                  </button>
                )}
              </div>
              
              <div className="p-5 border-t border-border-default bg-bg-surface flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex justify-center items-center gap-2 h-11 rounded-full border border-border-med bg-bg-card hover:bg-white/5 font-body font-medium text-sm text-text-primary transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 size={16} className="text-brand-teal" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Plain'}
                </button>
                <button
                  onClick={() => setGeneratedAsset(null)}
                  className="flex-1 btn-primary h-11 cursor-pointer"
                >
                  Send to Cargo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
