import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, HelpCircle, Send, MessageSquare, Mail, Radio, 
  ChevronDown, ChevronUp, Bot, ExternalLink, ShieldAlert,
  Terminal, Sparkles, SendToBack, CheckCircle2, Search, Database
} from 'lucide-react';
import { MOCK_USER } from '../types';

interface SupportModalProps {
  onClose: () => void;
}

interface FAQItem {
  id: string;
  category: 'fuel' | 'mission' | 'billing' | 'foundry';
  question: string;
  answer: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'fuel',
    question: 'How do I top up my Fuel balance?',
    answer: 'Fuel balance is critical for forging mission variables. Access the "Refuel Station" via your side drawer profile menu, or tap on the Fuel icon in the header. On the Free Cadet plan, you receive 25 fuel units with a 5/day drip. Upgrading to Commander or Admiral clears these bottlenecks immediately.'
  },
  {
    id: 'faq_2',
    category: 'mission',
    question: 'What does "Readiness Score" represent?',
    answer: 'Your Readiness Score measures app store survival chances. It is computed in real-time based on your currently cleared milestones. By naming your app, writing store copy, and uploading screenshots in your active Mission screen, you fuel the launch calculation upward.'
  },
  {
    id: 'faq_3',
    category: 'foundry',
    question: 'Why are some physical tools in the Foundry locked?',
    answer: 'High-yield tools like the Social Thread Generator or Launch Video Script tools require higher command authorization. You must have clearances at the "Commander" level or above to run these. Toggle your clearance at the Refuel Station.'
  },
  {
    id: 'faq_4',
    category: 'billing',
    question: 'What forms of payment are accepted on Subspace?',
    answer: 'Our payment node currently accepts all major interstellar credit units (Stripe, Apple Pay, Google Pay). All billing is fully self-encrypted and protected by military-grade security relays.'
  },
  {
    id: 'faq_5',
    category: 'mission',
    question: 'Can I export my compiled signals?',
    answer: 'Yes! Officers with "Commander" clearance or above can export complete Signal Packs as self-contained ZIP containers to load directly into standard app distribution hubs.'
  }
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'init_1',
    sender: 'agent',
    text: 'Greetings, Officer. I am Support Unit OSD-4. Telemetry streams indicate your systems are functional, but I am standing by for specific questions or troubleshooting relays. What assistance node can I boot up?',
    timestamp: '15:45'
  }
];

export function SupportModal({ onClose }: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'dispatch'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dispatch state
  const [dispatchName, setDispatchName] = useState(MOCK_USER.displayName);
  const [dispatchEmail, setDispatchEmail] = useState(MOCK_USER.email);
  const [dispatchCategory, setDispatchCategory] = useState('tech_support');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionStatus, setTransmissionStatus] = useState<string>('');
  const [isSent, setIsSent] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, isTyping, activeTab]);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Dynamic responses matching sci-fi context
    setTimeout(() => {
      let replyText = "Query indexed. Standard resolution instructions are as follows: check telemetry, align database matrices, and reload your device cache. If problems persist, dispatch an encrypted signal with our Dispatch Form.";
      const query = userMsg.text.toLowerCase();

      if (query.includes('fuel') || query.includes('refuel')) {
        replyText = "Fuel reserves sync automatically with central ledger relays. However, if stellar solar flares cause a localized lag in updates, simply switch to the 'Deck' view, pull to refresh, or toggle main engines. You can upgrade clearance levels in the Refuel Station.";
      } else if (query.includes('blueprints') || query.includes('screenshot') || query.includes('asset')) {
        replyText = "Negative/Missing assets represent a priority class-1 launch warning! Go to 'Mission' or use the 'Copilot' tab. Astro contains preloaded launch patterns designed to generate premium visuals and copy directly.";
      } else if (query.includes('premium') || query.includes('commander') || query.includes('price') || query.includes('pay')) {
        replyText = "Commander Clearance requires localized currency top-ups. Upgrades trigger unlimited Copilot and unlock high-yield tools like TikTok voiceovers in the Foundry. Tap 'Refuel Station' in your drawer menu to initialize the contract.";
      } else if (query.includes('broken') || query.includes('error') || query.includes('bug')) {
        replyText = "Warning: system anomaly reported. I am logging this traceback in local station logs. Our engineering fleet operates out of HQ-Delta. Dispatch a subspace mail directly for deeper manual repairs.";
      }

      setChatMessages(prev => [...prev, {
        id: `chat_${Date.now() + 1}`,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const startSubspaceTransmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchMessage.trim()) return;

    setIsTransmitting(true);
    setTransmissionProgress(5);
    setTransmissionStatus('Aligning subspace transmitter dishes...');

    // Simulate spectacular transmission progression stage
    const stages = [
      { p: 25, status: 'Negotiating carrier frequency...' },
      { p: 45, status: 'Encrypting signal packets with military grade security blocks...' },
      { p: 70, status: 'Optimizing transmission routing through Earth relays...' },
      { p: 90, status: 'Broadcasting subspace data burst...' },
      { p: 100, status: 'Transmission complete! Station confirmation code secured.' }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setTransmissionProgress(stages[currentStage].p);
        setTransmissionStatus(stages[currentStage].status);
        currentStage++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsTransmitting(false);
          setIsSent(true);
        }, 500);
      }
    }, 600);
  };

  const resetDispatch = () => {
    setDispatchMessage('');
    setIsSent(false);
    setTransmissionProgress(0);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Content Container */}
      <div className="relative w-full h-[90%] bg-bg-surface rounded-t-3xl border-t border-border-med flex flex-col pt-2 shadow-2xl overflow-hidden">
        {/* Slide bar handle */}
        <div className="w-12 h-1.5 bg-border-med rounded-full mx-auto mb-2 shrink-0" />
        
        {/* Header */}
        <div className="px-4 pb-4 flex justify-between items-center border-b border-border-default shrink-0 bg-bg-surface">
          <div>
            <h2 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
              <Radio size={20} className="text-brand-teal animate-pulse" />
              Subspace Support
            </h2>
            <p className="font-body text-xs text-text-secondary mt-0.5">
              Secure emergency relay link established
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-text-secondary hover:text-text-primary rounded-full bg-bg-card border border-border-default transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-4 py-2 border-b border-border-default flex gap-2 shrink-0 bg-bg-surface">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 rounded-xl text-xs font-body font-bold flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'faq' 
                ? 'bg-border-med border-brand-teal text-brand-teal shadow-[0_0_10px_rgba(77,200,192,0.15)]' 
                : 'bg-bg-card border-border-default text-text-secondary hover:text-text-primary hover:border-border-med'
            }`}
          >
            <HelpCircle size={14} />
            Diagnostics (FAQ)
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 rounded-xl text-xs font-body font-bold flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'chat' 
                ? 'bg-border-med border-brand-teal text-brand-teal shadow-[0_0_10px_rgba(77,200,192,0.15)]' 
                : 'bg-bg-card border-border-default text-text-secondary hover:text-text-primary hover:border-border-med'
            }`}
          >
            <MessageSquare size={14} />
            Live Assistant
          </button>
          
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex-1 py-2 rounded-xl text-xs font-body font-bold flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'dispatch' 
                ? 'bg-border-med border-brand-teal text-brand-teal shadow-[0_0_10px_rgba(77,200,192,0.15)]' 
                : 'bg-bg-card border-border-default text-text-secondary hover:text-text-primary hover:border-border-med'
            }`}
          >
            <Mail size={14} />
            Subspace Mail
          </button>
        </div>

        {/* Main scrollable body area */}
        <div className="flex-1 overflow-y-auto bg-bg-deep p-4 relative flex flex-col">
          
          {/* FAQ Tab Content */}
          {activeTab === 'faq' && (() => {
            const query = faqSearchQuery.toLowerCase().trim();
            const filteredFAQ = FAQ_ITEMS.filter(faq => {
              if (!query) return true;
              return faq.question.toLowerCase().includes(query) || 
                     faq.answer.toLowerCase().includes(query) || 
                     faq.category.toLowerCase().includes(query);
            });

            return (
              <div className="space-y-4 flex-1">
                <div className="bg-[#0B1021] border border-border-med rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden mb-2">
                  <Terminal size={20} className="text-brand-teal mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-display font-medium text-sm text-text-primary uppercase tracking-wide">Command Diagnostics Mode</h4>
                    <p className="font-body text-xs text-text-secondary mt-1 leading-relaxed">
                      Review automated answers for standard station systems. Select any query to align telemetry guides.
                    </p>
                  </div>
                  {/* Visual background gradient circle */}
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-brand-teal/5 rounded-full blur-2xl pointer-events-none" />
                </div>

                {/* Search Bar Input */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                    <Search size={15} />
                  </span>
                  <input
                    type="text"
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    placeholder="Search diagnostic databases / topics..."
                    className="w-full h-10 bg-bg-card hover:bg-bg-card/80 focus:bg-bg-card border border-border-default focus:border-brand-teal rounded-xl pl-9 pr-12 text-xs font-body text-text-primary outline-none transition-all placeholder:text-text-tertiary"
                  />
                  {faqSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFaqSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-tertiary hover:text-brand-teal transition-colors bg-bg-card border border-border-default px-2 py-0.5 rounded-md"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {filteredFAQ.length > 0 ? (
                  <div className="space-y-2.5">
                    {filteredFAQ.map((faq) => (
                      <div 
                        key={faq.id} 
                        className="glass-card overflow-hidden border border-border-default transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full px-4 py-3.5 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                            <span className="font-body font-medium text-[14px] text-text-primary">{faq.question}</span>
                          </div>
                          {expandedFAQ === faq.id ? (
                            <ChevronUp size={16} className="text-brand-teal" />
                          ) : (
                            <ChevronDown size={16} className="text-text-tertiary" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedFAQ === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-border-default/50"
                            >
                              <div className="px-5 py-3.5 bg-bg-surface/50 font-body text-xs text-text-secondary leading-relaxed">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center glass-card border border-border-default rounded-xl">
                    <HelpCircle size={24} className="text-text-tertiary mb-2.5 animate-pulse" />
                    <span className="font-display font-medium text-xs text-text-primary uppercase tracking-wider">No matching telemetry found</span>
                    <p className="font-body text-[11px] text-text-secondary max-w-[280px] mt-1.5 leading-relaxed">
                      Your query didn't trigger any automated support nodes. Try a different search string, or switch to the Live Assistant or Subspace Mail tabs.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFaqSearchQuery('')}
                      className="mt-4 border border-border-default hover:border-brand-teal px-4 py-1.5 rounded-lg font-body text-[10.5px] text-text-primary transition-colors hover:text-brand-teal"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                )}

                {/* Direct Help Shortcut */}
                <div className="flex justify-between items-center bg-[#0d1527] border border-brand-teal/20 px-4 py-3 rounded-xl gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-brand-teal uppercase tracking-wider">Fast-Track Inquiry</span>
                    <span className="text-xs text-text-secondary mt-0.5 mt-none">
                      {faqSearchQuery ? `Email support about "${faqSearchQuery.slice(0, 24)}${faqSearchQuery.length > 24 ? '...' : ''}"` : 'Pre-fill emergency email with topic'}
                    </span>
                  </div>
                  <a
                    href={`mailto:support@launchdeck.ai?subject=${encodeURIComponent(faqSearchQuery ? `Support Inquiry: ${faqSearchQuery}` : 'Support Inquiry')}&body=${encodeURIComponent(faqSearchQuery ? `Hello Support Crew,\n\nI am contacting support with the following topic:\n"${faqSearchQuery}"\n\n[Please enter any additional details or context here]` : 'Hello Support Crew,\n\nI have a query regarding Subspace Launch Deck.\n\n[Please describe your inquiry or issue here]')}`}
                    className="h-8 shrink-0 px-3.5 bg-gradient-to-r from-brand-teal/20 to-brand-blue/20 hover:from-brand-teal/30 hover:to-brand-blue/30 text-brand-teal-light hover:text-brand-teal border border-brand-teal/30 rounded-lg text-xs font-medium font-display flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(77,200,192,0.1)]"
                  >
                    <Mail size={13} />
                    Direct Help
                  </a>
                </div>

                {/* Space Emergency Coordinates Card */}
                <div className="pt-6">
                  <h4 className="font-display font-bold text-xs text-text-secondary uppercase tracking-wider mb-3">Direct Secure Coordinates</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="glass-card p-3 border border-border-default flex flex-col">
                      <span className="font-mono text-[10px] text-brand-gold uppercase">Subspace Freq</span>
                      <span className="font-mono text-xs font-bold text-text-primary mt-1">144.20 MHz (EMG)</span>
                      <span className="font-body text-[10.5px] text-text-tertiary mt-0.5">Primary distress orbit</span>
                    </div>
                    <div className="glass-card p-3 border border-border-default flex flex-col">
                      <span className="font-mono text-[10px] text-brand-teal uppercase">HQ Email Link</span>
                      <a href="mailto:support@launchdeck.ai" className="font-mono text-xs font-bold text-brand-teal-light hover:underline mt-1 flex items-center gap-0.5">
                        support@launchdeck.ai <ExternalLink size={10} />
                      </a>
                      <span className="font-body text-[10.5px] text-text-tertiary mt-0.5">Response T-Minus 2 hrs</span>
                    </div>
                  </div>
                  
                  {/* Center station coordinate address */}
                  <div className="glass-card p-3 mt-2.5 border border-border-default flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-[9px] text-[#A78BFA] uppercase">Physical Core Station</span>
                    <span className="font-body text-xs text-text-secondary mt-1">Sector 7-Beta, Ring Horizon Core, Lagrange-13</span>
                    <span className="font-body text-[10.5px] text-text-tertiary mt-0.5">Operational Window: 24/7 Galactic Standard time</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Interactive Live Support Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-[300px]">

              {/* Message History area */}
              <div className="flex-1 space-y-3 mb-4 overflow-y-auto pr-1">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[85%] flex items-start gap-2">
                      {msg.sender === 'agent' && (
                        <div className="w-8 h-8 rounded-full border border-brand-teal/40 bg-brand-teal/10 flex items-center justify-center shrink-0">
                          <Bot size={16} className="text-brand-teal" />
                        </div>
                      )}
                      
                      <div className={`p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-brand-blue/90 border border-brand-blue text-white rounded-tr-none'
                          : 'bg-bg-card border border-border-default text-text-primary rounded-tl-none'
                      }`}>
                        <p className="font-body text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <span className="font-mono text-[9px] text-text-tertiary mt-1.5 block text-right">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full border border-brand-teal/40 bg-brand-teal/20 flex items-center justify-center">
                        <Bot size={16} className="text-brand-teal animate-pulse" />
                      </div>
                      <div className="p-3 rounded-2xl bg-bg-card border border-border-default rounded-tl-none flex items-center gap-1 py-4">
                        <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleChatSend} className="relative mt-auto shrink-0 border-t border-border-default pt-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Transmit support query to OSD-4 Unit..."
                  maxLength={150}
                  className="w-full h-11 bg-bg-card hover:bg-bg-card/80 focus:bg-bg-card border border-border-default focus:border-brand-teal rounded-xl px-4 pr-12 text-xs font-body text-text-primary outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-1 top-[15px] p-2 hover:text-brand-teal text-text-tertiary transition-colors disabled:opacity-30 disabled:hover:text-text-tertiary"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {/* Subspace Mail Form Tab */}
          {activeTab === 'dispatch' && (
            <div className="flex-1 flex flex-col justify-between">
              
              {!isSent ? (
                <form onSubmit={startSubspaceTransmission} className="space-y-4">
                  {isTransmitting ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                      <div className="relative">
                        {/* Orbiting spinner rings */}
                        <div className="w-16 h-16 border-[3px] border-brand-teal/25 border-t-brand-teal rounded-full animate-spin" />
                        <div className="absolute inset-2 border-[3px] border-brand-blue/10 border-b-brand-blue rounded-full animate-spin reverse-spin" />
                        <Radio className="absolute inset-0 m-auto text-brand-teal animate-pulse" size={20} />
                      </div>
                      
                      <div className="space-y-2">
                        <span className="font-mono text-sm text-[11px] text-brand-teal uppercase animate-pulse">{transmissionStatus}</span>
                        <div className="w-[200px] h-1.5 bg-border-default rounded-full overflow-hidden mx-auto">
                          <motion.div 
                            className="bg-gradient-to-r from-brand-teal to-brand-blue h-full"
                            style={{ width: `${transmissionProgress}%` }}
                            transition={{ ease: 'easeInOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[#10192A] border border-brand-blue/20 rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden mb-2">
                        <Terminal size={18} className="text-brand-blue mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-display font-medium text-xs text-brand-blue-light uppercase tracking-wide">Secure Signal Dispatcher</h4>
                          <p className="font-body text-xs text-text-secondary mt-1 leading-relaxed">
                            Encode a structured feedback capsule or detailed support ticket to our human development division.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="font-mono text-[10px] text-text-secondary uppercase">Officer Name</label>
                          <input
                            type="text"
                            required
                            value={dispatchName}
                            onChange={(e) => setDispatchName(e.target.value)}
                            className="w-full h-10 bg-bg-card border border-border-default focus:border-brand-teal rounded-xl px-3 outline-none text-xs font-body text-text-primary"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-[10px] text-text-secondary uppercase">Secure Comm Address</label>
                          <input
                            type="email"
                            required
                            value={dispatchEmail}
                            onChange={(e) => setDispatchEmail(e.target.value)}
                            className="w-full h-10 bg-bg-card border border-border-default focus:border-brand-teal rounded-xl px-3 outline-none text-xs font-body text-text-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-text-secondary uppercase">Encryption Topic</label>
                        <select
                          value={dispatchCategory}
                          onChange={(e) => setDispatchCategory(e.target.value)}
                          className="w-full h-10 bg-bg-card border border-border-default focus:border-brand-teal rounded-xl px-3 outline-none text-xs font-body text-text-primary text-text-primary cursor-pointer"
                        >
                          <option value="tech_support">Technical Anomaly (Engine Lockupout)</option>
                          <option value="fuel_sync">Fuel Refuel System Delay</option>
                          <option value="billing">Subspace Clearance Agreement (Billing)</option>
                          <option value="blueprint">Blueprint customization support</option>
                          <option value="general">Telemetry query</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-text-secondary uppercase">Encrypted Comm Message</label>
                        <textarea
                          required
                          value={dispatchMessage}
                          onChange={(e) => setDispatchMessage(e.target.value)}
                          placeholder="Provide all transmission details, current telemetry traces, and steps taken..."
                          rows={4}
                          className="w-full bg-bg-card border border-border-default focus:border-brand-teal rounded-xl p-3 outline-none text-xs font-body text-text-primary leading-relaxed resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-brand-blue to-brand-teal hover:opacity-90 transition-opacity text-white font-display font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(77,200,192,0.2)] mt-4"
                      >
                        <Send size={16} />
                        Transmit Command Dispatch
                      </button>
                    </>
                  )}
                </form>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-status-success/10 border border-status-success/30 flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} className="text-status-success" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-text-primary">
                    Subspace Wave Dispatched
                  </h3>
                  <p className="font-body text-xs text-text-secondary max-w-[280px] mt-2.5 leading-relaxed font-normal">
                    Clearance confirmation code recorded. Support crew will decrypt your signal and respond within T-Minus 2 hours at <span className="text-brand-teal">{dispatchEmail}</span>.
                  </p>
                  
                  <button 
                    onClick={resetDispatch}
                    className="mt-8 border border-border-med hover:border-brand-teal px-6 py-2.5 rounded-xl font-body text-xs text-text-primary transition-colors hover:text-brand-teal"
                  >
                    Reset & Prepare New Transmission
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
