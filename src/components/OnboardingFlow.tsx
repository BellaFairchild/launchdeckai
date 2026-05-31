import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  User, 
  Layers, 
  Flag, 
  Compass, 
  HelpCircle, 
  Smartphone, 
  Globe, 
  Brain, 
  Database, 
  Coins, 
  Heart, 
  Sliders, 
  Bookmark,
  Calendar,
  Apple,
  Mail
} from 'lucide-react';

export type OnboardingData = {
  appName?: string;
  appType?: string;
  currentStage?: string;
  helpPriorities: string[];
  launchGoalType?: "exact_date" | "rough_month" | "not_sure" | "already_launched";
  targetLaunchDate?: string;
  targetLaunchMonth?: string;
  targetAudience?: string;
  problemSolved?: string;
  mainBenefit?: string;
  topFeatures: string[];
};

interface OnboardingFlowProps {
  onFinish?: (data: OnboardingData) => void;
  onAlreadyHaveAccount?: () => void;
  initialAppName?: string;
}

// ==========================================
// 1. REUSABLE ATOMIC COMPONENTS
// ==========================================

interface OnboardingScreenWrapperProps {
  children: React.ReactNode;
}
export function OnboardingScreenWrapper({ children }: OnboardingScreenWrapperProps) {
  return (
    <div className="flex-1 w-full bg-[#070A1F] text-[#FFF7EA] flex flex-col justify-between px-6 py-6 overflow-y-auto overflow-x-hidden min-h-0 relative select-none">
      {/* Decorative Warm Accent Ambient Glow Vector */}
      <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-[#18D6C8]/5 blur-[70px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 left-0 w-[200px] h-[200px] bg-[#FF6FAE]/5 blur-[80px] rounded-full pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col justify-between h-full w-full min-h-0">
        {children}
      </div>
    </div>
  );
}

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}
export function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-between px-1 py-2 w-full select-none" id="onboarding-progress-dots-bar">
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          
          return (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isCompleted 
                  ? 'bg-[#18D6C8] w-4' 
                  : isActive 
                    ? 'bg-[#18D6C8] w-6 shadow-[0_0_8px_#18D6C8]' 
                    : 'bg-white/10 w-2.5'
              }`}
            />
          );
        })}
      </div>
      <div className="font-mono text-[10px] text-[#AAB2D5] font-black tracking-widest uppercase">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}

interface OptionCardProps {
  key?: React.Key | string | number;
  label: string;
  selected: boolean;
  onPress: () => void;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
}
export function OptionCard({ label, selected, onPress, description, icon, badge }: OptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <button
        onClick={onPress}
        style={{ touchAction: 'manipulation' }}
        className={`w-full text-left p-4 rounded-xl transition-all duration-200 border cursor-pointer select-none active:scale-[0.98] ${
          selected 
            ? 'bg-white/10 border-[#18D6C8] shadow-[0_0_15px_rgba(24,214,200,0.15)] text-[#FFF7EA]' 
            : 'bg-white/5 border-white/10 hover:border-white/20 text-[#AAB2D5] hover:text-[#FFF7EA]'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`p-2 rounded-lg ${selected ? 'bg-[#18D6C8]/25 text-[#18D6C8]' : 'bg-white/5 text-white/50'}`}>
                {icon}
              </div>
            )}
            <div>
              <div className="font-body font-bold text-sm tracking-wide text-white">{label}</div>
              {description && <div className="text-xs text-[#AAB2D5]/85 mt-0.5">{description}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-[9px] font-mono font-bold leading-none py-1 px-1.5 rounded bg-white/10 text-[#FF6FAE] uppercase">
                {badge}
              </span>
            )}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
              selected 
                ? 'border-[#18D6C8] bg-[#18D6C8] text-[#070A1F]' 
                : 'border-white/20 bg-black/10'
            }`}>
              {selected && <Check size={12} className="stroke-[3]" />}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

interface MultiSelectOptionProps {
  key?: React.Key | string | number;
  label: string;
  selected: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}
export function MultiSelectOption({ label, selected, onToggle, icon }: MultiSelectOptionProps) {
  return (
    <button
      onClick={onToggle}
      style={{ touchAction: 'manipulation' }}
      className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.98] ${
        selected 
          ? 'bg-white/10 border-[#18D6C8] shadow-[0_0_15px_rgba(24,214,200,0.1)]' 
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`text-base ${selected ? 'text-[#18D6C8]' : 'text-[#AAB2D5]'}`}>
            {icon}
          </div>
        )}
        <span className={`font-body text-sm font-semibold tracking-wide ${selected ? 'text-[#FFF7EA]' : 'text-[#AAB2D5]'}`}>
          {label}
        </span>
      </div>
      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
        selected 
          ? 'border-[#18D6C8] bg-[#18D6C8] text-[#070A1F]' 
          : 'border-white/20 bg-black/20'
      }`}>
        {selected && <Check size={12} className="stroke-[3]" />}
      </div>
    </button>
  );
}

interface TextInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  helper?: string;
  icon?: React.ReactNode;
}
export function TextInputField({ label, value, onChangeText, placeholder, helper, icon }: TextInputFieldProps) {
  return (
    <div className="w-full flex flex-col gap-1.5 select-none text-left">
      <label className="text-[11px] font-mono uppercase tracking-wider text-[#AAB2D5] font-black pl-1">{label}</label>
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 text-[#AAB2D5] pointer-events-none">
            {icon}
          </div>
        )}
        <input 
          type="text"
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pl-${icon ? '10' : '4'} text-sm text-[#FFF7EA] placeholder-[#AAB2D5]/40 outline-none focus:border-[#18D6C8] focus:bg-white/10 transition-all font-body`}
        />
      </div>
      {helper && <span className="text-[10px] text-[#AAB2D5]/70 pl-1">{helper}</span>}
    </div>
  );
}

interface StepHeaderProps {
  title: string;
  subtitle: string;
}
export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div className="flex flex-col gap-2 text-left mb-6 select-none" id="onboarding-step-header">
      <h1 className="font-display font-extrabold text-2xl tracking-tight leading-tight text-[#FFF7EA]">
        {title}
      </h1>
      <p className="font-body text-sm text-[#AAB2D5] leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  color?: string; // Optional custom background
}
export function PrimaryButton({ label, onPress, disabled = false, icon, color }: PrimaryButtonProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={{ touchAction: 'manipulation' }}
      className={`h-12 w-full rounded-2xl flex items-center justify-center gap-2 font-display text-[15px] font-bold tracking-wide transition-all duration-200 shadow-lg cursor-pointer active:scale-95 ${
        disabled 
          ? 'bg-white/5 border border-white/5 text-[#AAB2D5]/35 cursor-not-allowed shadow-none' 
          : color 
            ? `${color} hover:opacity-90 shadow-[#FF6FAE]/10`
            : 'bg-[#1500FD] hover:bg-blue-600 border border-transparent text-[#FFF7EA] shadow-[#1500FD]/25'
      }`}
    >
      <span className="text-center">{label}</span>
      {icon && <span className="ml-1">{icon}</span>}
    </button>
  );
}

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}
export function SecondaryButton({ label, onPress, icon }: SecondaryButtonProps) {
  return (
    <button
      onClick={onPress}
      style={{ touchAction: 'manipulation' }}
      className="h-12 w-full rounded-2xl flex items-center justify-center gap-2 font-body text-sm font-semibold tracking-wide border border-white/10 hover:border-white/20 bg-transparent hover:bg-white/5 text-[#FFF7EA] transition-all cursor-pointer select-none active:scale-95"
    >
      {icon && <span className="mr-0.5">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

interface BottomActionBarProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
}
export function BottomActionBar({ onBack, onNext, nextLabel = "Continue", nextDisabled = false, onSkip, skipLabel = "Skip" }: BottomActionBarProps) {
  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-white/5 w-full select-none" id="onboarding-bottom-navigation-bar">
      <div className="flex gap-2.5 items-center w-full">
        {onBack && (
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/20 bg-white/5 text-[#FFF7EA] active:scale-95 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="flex-1">
          <PrimaryButton 
            label={nextLabel} 
            onPress={onNext} 
            disabled={nextDisabled} 
            icon={<ArrowRight size={15} className="inline ml-0.5" />} 
          />
        </div>
      </div>
      
      {onSkip && (
        <button 
          onClick={onSkip} 
          className="text-xs text-[#AAB2D5]/70 hover:text-white/95 transition-all text-center pb-1 self-center cursor-pointer mt-0.5"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}

// ==========================================
// 2. MASTER FLUID ONBOARDING ENGINE
// ==========================================

export default function OnboardingFlow({ onFinish, onAlreadyHaveAccount, initialAppName = "" }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  
  // Local answers state using exact requested typescript type
  const [data, setData] = useState<OnboardingData>({
    appName: initialAppName || localStorage.getItem('onboarding_app_name') || "",
    appType: "",
    currentStage: "",
    helpPriorities: [],
    launchGoalType: undefined,
    targetLaunchDate: "",
    targetLaunchMonth: "",
    targetAudience: "",
    problemSolved: "",
    mainBenefit: "",
    topFeatures: []
  });

  const updateData = (fields: Partial<OnboardingData>) => {
    setData(prev => {
      const merged = { ...prev, ...fields };
      // Keep synchronized with local storage mock persistence
      if (merged.appName) {
        localStorage.setItem('onboarding_app_name', merged.appName);
      }
      return merged;
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      console.log("Onboarding completed with final payload:", data);
      if (onFinish) {
        onFinish(data);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // State buffers for fields
  const [feat1, setFeat1] = useState("");
  const [feat2, setFeat2] = useState("");
  const [feat3, setFeat3] = useState("");

  const syncAppFeatures = () => {
    const list: string[] = [];
    if (feat1.trim()) list.push(feat1.trim());
    if (feat2.trim()) list.push(feat2.trim());
    if (feat3.trim()) list.push(feat3.trim());
    updateData({ topFeatures: list });
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-[#070A1F]" id="onboarding-flow-container">
      {/* Immersive Slide Transition Frame */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -25 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex-1 w-full flex flex-col min-h-0"
        >
          {currentStep === 1 && (
            <WelcomeScreen 
              onNext={handleNext}
              onAlreadyHaveAccount={onAlreadyHaveAccount || (() => console.log("Already custom logs"))}
            />
          )}

          {currentStep === 2 && (
            <AppTypeScreen 
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <CurrentStageScreen 
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <HelpPrioritiesScreen 
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <LaunchGoalScreen 
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 6 && (
            <AccountPromptScreen 
              onNext={(method) => {
                console.log(`Mock sign in completed via ${method}`);
                handleNext();
              }}
              onSkip={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 7 && (
            <AppInfoStarterScreen 
              data={data}
              onUpdate={updateData}
              feat1={feat1}
              setFeat1={setFeat1}
              feat2={feat2}
              setFeat2={setFeat2}
              feat3={feat3}
              setFeat3={setFeat3}
              syncFeatures={syncAppFeatures}
              onNext={() => {
                // Ensure features list is flushed before completing
                const list: string[] = [];
                if (feat1.trim()) list.push(feat1.trim());
                if (feat2.trim()) list.push(feat2.trim());
                if (feat3.trim()) list.push(feat3.trim());
                updateData({
                  topFeatures: list,
                  // Fall back to examples if fields empty
                  targetAudience: data.targetAudience?.trim() || "First-time app creators",
                  problemSolved: data.problemSolved?.trim() || "Feel overwhelmed by launch tasks",
                  mainBenefit: data.mainBenefit?.trim() || "A clear step-by-step launch plan"
                });
                handleNext();
              }}
              onSkip={() => {
                updateData({
                  targetAudience: "First-time app creators",
                  problemSolved: "They feel overwhelmed by launch tasks",
                  mainBenefit: "A clear step-by-step launch plan",
                  topFeatures: ["Guided blueprints", "Launch checklist", "Writing help"]
                });
                handleNext();
              }}
              onBack={handleBack}
            />
          )}

          {currentStep === 8 && (
            <OnboardingCompleteScreen 
              data={data}
              onNext={() => {
                if (onFinish) onFinish(data);
              }}
              onReviewAppInfo={() => {
                // Navigate back to Screen 7 (App Info starter)
                setCurrentStep(7);
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// SCREEN 1: WELCOME SCREEN (Visually Elegant Intro)
// ==========================================

interface WelcomeScreenProps {
  onNext: () => void;
  onAlreadyHaveAccount: () => void;
}
function WelcomeScreen({ onNext, onAlreadyHaveAccount }: WelcomeScreenProps) {
  return (
    <OnboardingScreenWrapper>
      {/* Top Brand Logo Plate */}
      <div className="flex flex-col items-center justify-center text-center mt-6 select-none">
        <div className="w-14 h-14 bg-gradient-to-tr from-[#1500FD] to-[#18D6C8] rounded-2xl flex items-center justify-center shadow-lg border border-white/10 mb-3.5 relative">
          <Sparkles className="text-[#FFF7EA] w-6 h-6 animate-pulse" />
          {/* subtle gold accent button */}
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF6FAE] border-2 border-[#070A1F]" />
        </div>
        <div className="font-display font-extrabold text-lg uppercase tracking-[0.25em] text-[#FFF7EA] flex items-center gap-1.5 pl-1">
          LaunchDeck<span className="text-[#18D6C8]">AI</span>
        </div>
        <span className="font-mono text-[9px] text-[#AAB2D5] tracking-widest mt-0.5 uppercase">BUILDER COMPANION</span>
      </div>

      {/* Main Copy Elements */}
      <div className="flex flex-col gap-4 text-center my-6">
        <h2 className="font-display font-black text-3xl text-[#FFF7EA] tracking-tight leading-tight px-1 drop-shadow-md">
          Plan your app launch with <span className="text-[#18D6C8] underline decoration-[#FF6FAE]/40 underline-offset-4">less overwhelm</span>
        </h2>
        
        <p className="font-body text-[14px] text-[#AAB2D5] leading-relaxed px-2">
          Organize your app idea, launch tasks, store details, marketing, and next steps in one guided workspace.
        </p>

        {/* Benefits Segment */}
        <div className="flex flex-wrap justify-center gap-2 mt-3 px-1">
          {[
            { text: "📋 App Plan", color: "bg-white/5 border-white/10" },
            { text: "✅ Checklists", color: "bg-white/5 border-white/10" },
            { text: "✍️ Writing Help", color: "bg-[#18D6C8]/10 border-[#18D6C8]/25 text-[#18D6C8]" }
          ].map((benefit, i) => (
            <span 
              key={i} 
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border tracking-wide select-none ${benefit.color}`}
            >
              {benefit.text}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Button Layout Area */}
      <div className="flex flex-col gap-3 mt-auto">
        <PrimaryButton 
          label="Get Started" 
          onPress={onNext}
          icon={<ArrowRight size={16} className="inline" />}
        />
        <button 
          onClick={onAlreadyHaveAccount}
          className="h-11 w-full rounded-2xl font-body text-xs text-[#AAB2D5] hover:text-[#FFF7EA] transition-all bg-transparent focus:underline flex items-center justify-center gap-1.5 cursor-pointer"
        >
          I already have an account
        </button>
      </div>
    </OnboardingScreenWrapper>
  );
}

// ==========================================
// SCREEN 2: WHAT ARE YOU BUILDING?
// ==========================================

interface AppTypeScreenProps {
  data: OnboardingData;
  onUpdate: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}
function AppTypeScreen({ data, onUpdate, onNext, onBack }: AppTypeScreenProps) {
  const options = [
    { label: "Mobile app", icon: <Smartphone size={16} /> },
    { label: "Web app", icon: <Globe size={16} /> },
    { label: "AI app", icon: <Brain size={16} /> },
    { label: "SaaS product", icon: <Layers size={16} /> },
    { label: "Marketplace", icon: <Database size={16} /> },
    { label: "Wellness app", icon: <Heart size={16} /> },
    { label: "Productivity app", icon: <Sliders size={16} /> },
    { label: "Other", icon: <HelpCircle size={16} /> }
  ];

  const handleSelect = (val: string) => {
    onUpdate({ appType: val });
  };

  const isNextDisabled = !data.appType;

  return (
    <OnboardingScreenWrapper>
      <div>
        <ProgressDots currentStep={2} totalSteps={8} />
        
        <StepHeader 
          title="What are you building?"
          subtitle="This helps personalize your launch preparation plan."
        />

        {/* Dense Grid of Options */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer active:scale-95 ${
                data.appType === opt.label 
                  ? 'bg-white/10 border-[#18D6C8] text-[#18D6C8] shadow-[0_0_12px_rgba(24,214,200,0.1)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-[#AAB2D5]'
              }`}
            >
              <span className={data.appType === opt.label ? "text-[#18D6C8]" : "text-[#AAB2D5]"}>
                {opt.icon}
              </span>
              <span className={`text-xs font-bold tracking-wide mt-1 ${data.appType === opt.label ? "text-white" : ""}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Optional Name Input */}
        <div className="mt-5">
          <TextInputField 
            label="App name, if you have one"
            value={data.appName || ""}
            onChangeText={(text) => onUpdate({ appName: text })}
            placeholder="Working app name (optional)"
            helper="A working name is totally fine. You can change it later."
            icon={<Bookmark size={15} />}
          />
        </div>
      </div>

      <BottomActionBar 
        onBack={onBack}
        onNext={onNext}
        nextDisabled={isNextDisabled}
      />
    </OnboardingScreenWrapper>
  );
}

// ==========================================
// SCREEN 3: CURRENT STAGE
// ==========================================

interface CurrentStageScreenProps {
  data: OnboardingData;
  onUpdate: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}
function CurrentStageScreen({ data, onUpdate, onNext, onBack }: CurrentStageScreenProps) {
  const options = [
    { label: "I only have an idea", info: "Perfect time to design the blueprint & features list." },
    { label: "I’m designing the app", info: "Focusing on user flow, app layout, and branding look." },
    { label: "I’m building the first version", info: "Coding the core MVP and validating product tech." },
    { label: "I’m testing with users", info: "Gathering early beta feedback for critical polish iterations." },
    { label: "I’m preparing for the App Store", info: "Formatting screenshot rules and writing copy metadata." },
    { label: "I already launched", info: "Optimizing discovery rankings and tracking user onboarding." }
  ];

  return (
    <OnboardingScreenWrapper>
      <div className="flex-1">
        <ProgressDots currentStep={3} totalSteps={8} />
        
        <StepHeader 
          title="Where are you now?"
          subtitle="Choose the stage that fits best for active personalization."
        />

        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {options.map((opt) => (
            <OptionCard 
              key={opt.label}
              label={opt.label}
              selected={data.currentStage === opt.label}
              onPress={() => onUpdate({ currentStage: opt.label })}
              description={opt.info}
              icon={<Flag size={15} />}
            />
          ))}
        </div>
      </div>

      <BottomActionBar 
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!data.currentStage}
      />
    </OnboardingScreenWrapper>
  );
}

// ==========================================
// SCREEN 4: HELP PRIORITIES (Multi-Select)
// ==========================================

interface HelpPrioritiesScreenProps {
  data: OnboardingData;
  onUpdate: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}
function HelpPrioritiesScreen({ data, onUpdate, onNext, onBack }: HelpPrioritiesScreenProps) {
  const multiOptions = [
    { label: "Organizing my app idea", emoji: "💡" },
    { label: "Choosing MVP features", emoji: "🎯" },
    { label: "Preparing App Store details", emoji: "📱" },
    { label: "Writing marketing copy", emoji: "✍️" },
    { label: "Planning beta testing", emoji: "🧪" },
    { label: "Knowing what to do next", emoji: "🏁" },
    { label: "Staying on track", emoji: "📈" }
  ];

  const handleToggle = (val: string) => {
    let currentPriorities = [...data.helpPriorities];
    if (currentPriorities.includes(val)) {
      currentPriorities = currentPriorities.filter(item => item !== val);
    } else {
      currentPriorities.push(val);
    }
    onUpdate({ helpPriorities: currentPriorities });
  };

  const isNextDisabled = data.helpPriorities.length === 0;

  return (
    <OnboardingScreenWrapper>
      <div className="flex-1">
        <ProgressDots currentStep={4} totalSteps={8} />
        
        <StepHeader 
          title="What do you want help with first?"
          subtitle="Pick all that apply to set your prioritised blueprint checklists."
        />

        <div className="flex flex-col gap-2 max-h-[410px] overflow-y-auto pr-1">
          {multiOptions.map((opt) => (
            <MultiSelectOption 
              key={opt.label}
              label={opt.label}
              selected={data.helpPriorities.includes(opt.label)}
              onToggle={() => handleToggle(opt.label)}
              icon={<span className="text-sm select-none">{opt.emoji}</span>}
            />
          ))}
        </div>
      </div>

      <BottomActionBar 
        onBack={onBack}
        onNext={onNext}
        nextDisabled={isNextDisabled}
        skipLabel="Select all remaining & skip"
        onSkip={() => {
          onUpdate({ helpPriorities: multiOptions.map(o => o.label) });
          onNext();
        }}
      />
    </OnboardingScreenWrapper>
  );
}

// ==========================================
// SCREEN 5: LAUNCH GOAL
// ==========================================

interface LaunchGoalScreenProps {
  data: OnboardingData;
  onUpdate: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}
function LaunchGoalScreen({ data, onUpdate, onNext, onBack }: LaunchGoalScreenProps) {
  const options = [
    { id: "exact_date", label: "I have a date", detail: "Perfect for scheduling checklist tasks." },
    { id: "rough_month", label: "I have a rough month", detail: "Keeps you focused on hitting a month target." },
    { id: "not_sure", label: "Not sure yet", detail: "No dates. Just draft plan basics." },
    { id: "already_launched", label: "I already launched", detail: "Optimize post-launch marketing parameters." }
  ] as const;

  const handleSelectGoal = (type: typeof options[number]["id"]) => {
    onUpdate({ launchGoalType: type });
  };

  const isNextDisabled = !data.launchGoalType;

  return (
    <OnboardingScreenWrapper>
      <div className="flex-1">
        <ProgressDots currentStep={5} totalSteps={8} />
        
        <StepHeader 
          title="Do you have a launch goal?"
          subtitle="A rough date target helps create structured next steps and milestones."
        />

        <div className="flex flex-col gap-2 mb-4">
          {options.map((opt) => (
            <OptionCard 
              key={opt.id}
              label={opt.label}
              selected={data.launchGoalType === opt.id}
              onPress={() => handleSelectGoal(opt.id)}
              description={opt.detail}
              icon={<Calendar size={15} />}
            />
          ))}
        </div>

        {/* Conditional Field Renderings with gorgeous transitions */}
        <AnimatePresence>
          {data.launchGoalType === "exact_date" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 text-left"
            >
              <TextInputField 
                label="Target Launch Date"
                value={data.targetLaunchDate || ""}
                onChangeText={(text) => onUpdate({ targetLaunchDate: text })}
                placeholder="Example: September 15, 2026"
                helper="You can change details at any point later."
              />
            </motion.div>
          )}

          {data.launchGoalType === "rough_month" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 text-left"
            >
              <TextInputField 
                label="Target Month & Year"
                value={data.targetLaunchMonth || ""}
                onChangeText={(text) => onUpdate({ targetLaunchMonth: text })}
                placeholder="Example: September 2026"
                helper="This establishes month-wide action parameters."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomActionBar 
        onBack={onBack}
        onNext={onNext}
        nextDisabled={isNextDisabled}
      />
    </OnboardingScreenWrapper>
  );
}

// ==========================================
// SCREEN 6: ACCOUNT PROMPT SCREEN (No telemetry, clean buttons)
// ==========================================

interface AccountPromptScreenProps {
  onNext: (method: string) => void;
  onSkip: () => void;
  onBack: () => void;
}
function AccountPromptScreen({ onNext, onSkip, onBack }: AccountPromptScreenProps) {
  const [emailAddress, setEmailAddress] = useState("");

  return (
    <OnboardingScreenWrapper>
      <div className="flex-1">
        <ProgressDots currentStep={6} totalSteps={8} />
        
        <StepHeader 
          title="Save your app plan"
          subtitle="Create an account so your answers, checklists, and plan details stay saved securely."
        />

        {/* Clean responsive CTA social/email list buttons with minimum 44px high layout */}
        <div className="flex flex-col gap-2.5 mt-2" id="onboarding-auth-mock-block">
          
          <button 
            onClick={() => onNext("Google")}
            className="h-11 w-full bg-white text-gray-900 rounded-xl font-body font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
          >
            {/* Custom high-contrast human standard Google G logo */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold">Continue with Google</span>
          </button>

          <button 
            onClick={() => onNext("Apple")}
            className="h-11 w-full bg-[#111] hover:bg-[#222] border border-white/10 text-white rounded-xl font-body font-extrabold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all text-center cursor-pointer"
          >
            <Apple size={16} className="text-white relative top-[-0.5px]" />
            <span>Continue with Apple</span>
          </button>

          <div className="flex items-center gap-2.5 my-1.5 select-none text-center">
            <div className="flex-1 h-[0.5px] bg-white/10" />
            <span className="font-mono text-[9px] text-[#AAB2D5]/50 tracking-wider">OR EMAIL</span>
            <div className="flex-1 h-[0.5px] bg-white/10" />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <TextInputField 
              label="Email Address"
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholder="name@example.com"
              icon={<Mail size={14} />}
            />
            {emailAddress.trim().length > 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-1"
              >
                <PrimaryButton 
                  label="Continue with Email"
                  onPress={() => onNext(`Email: ${emailAddress}`)}
                />
              </motion.div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-[#AAB2D5]/60 text-center select-none mt-5">
          Your plan is strictly <span className="text-[#FFF7EA]">private</span>, secure, and editable anytime.
        </p>
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-white/5 w-full select-none justify-center">
        {/* Requested alternate action button */}
        <PrimaryButton 
          label="Continue for now" 
          onPress={onSkip}
        />
        <button 
          onClick={onBack}
          className="text-xs text-[#AAB2D5]/70 hover:text-white/95 mt-2 transition-all text-center cursor-pointer font-bold select-none h-8 flex items-center justify-center"
        >
          Go Back
        </button>
      </div>
    </OnboardingScreenWrapper>
  );
}

// ==========================================
// SCREEN 7: APP INFO STARTER
// ==========================================

interface AppInfoStarterScreenProps {
  data: OnboardingData;
  onUpdate: (fields: Partial<OnboardingData>) => void;
  feat1: string;
  setFeat1: (text: string) => void;
  feat2: string;
  setFeat2: (text: string) => void;
  feat3: string;
  setFeat3: (text: string) => void;
  syncFeatures: () => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}
function AppInfoStarterScreen({ 
  data, 
  onUpdate,
  feat1, setFeat1,
  feat2, setFeat2,
  feat3, setFeat3,
  syncFeatures,
  onNext, 
  onSkip, 
  onBack 
}: AppInfoStarterScreenProps) {
  return (
    <OnboardingScreenWrapper>
      <div className="flex-1">
        <ProgressDots currentStep={7} totalSteps={8} />
        
        <StepHeader 
          title="Set up your App Info"
          subtitle="Add a few details we’ll use to formulate your starting plan structure."
        />

        <div className="flex flex-col gap-4 max-h-[430px] overflow-y-auto pr-1 text-left select-none">
          
          <TextInputField 
            label="Target Audience"
            value={data.targetAudience || ""}
            onChangeText={(text) => onUpdate({ targetAudience: text })}
            placeholder="First-time app creators, indie hackers"
            helper="Who is the primary person using your app?"
          />

          <TextInputField 
            label="Problem Solved"
            value={data.problemSolved || ""}
            onChangeText={(text) => onUpdate({ problemSolved: text })}
            placeholder="They feel overwhelmed by launch tasks"
            helper="What pain point does the app immediately eliminate?"
          />

          <TextInputField 
            label="Main Benefit"
            value={data.mainBenefit || ""}
            onChangeText={(text) => onUpdate({ mainBenefit: text })}
            placeholder="A clear step-by-step launch plan"
            helper="What is the key promise or takeaway?"
          />

          <div className="flex flex-col gap-1 text-left mt-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#AAB2D5] font-black pl-1">Top Features (Up to 3)</span>
            <div className="flex flex-col gap-2">
              <input 
                type="text"
                value={feat1}
                onChange={(e) => { setFeat1(e.target.value); syncFeatures(); }}
                placeholder="Example: Guided blueprints"
                className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-[#FFF7EA] placeholder-[#AAB2D5]/40 outline-none focus:border-[#18D6C8] font-body"
              />
              <input 
                type="text"
                value={feat2}
                onChange={(e) => { setFeat2(e.target.value); syncFeatures(); }}
                placeholder="Example: Launch checklist"
                className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-[#FFF7EA] placeholder-[#AAB2D5]/40 outline-none focus:border-[#18D6C8] font-body"
              />
              <input 
                type="text"
                value={feat3}
                onChange={(e) => { setFeat3(e.target.value); syncFeatures(); }}
                placeholder="Example: Writing help"
                className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-[#FFF7EA] placeholder-[#AAB2D5]/40 outline-none focus:border-[#18D6C8] font-body"
              />
            </div>
            <span className="text-[10px] text-[#AAB2D5]/70 pl-1 mt-1">Short clear labels look best in storefront blueprints.</span>
          </div>
          
        </div>
      </div>

      <BottomActionBar 
        onBack={onBack}
        onNext={onNext}
        nextLabel="Create My App Plan"
        skipLabel="Skip for now (fill default info)"
        onSkip={onSkip}
      />
    </OnboardingScreenWrapper>
  );
}

// ==========================================
// SCREEN 8: ONBOARDING COMPLETE
// ==========================================

interface OnboardingCompleteScreenProps {
  data: OnboardingData;
  onNext: () => void;
  onReviewAppInfo: () => void;
}
function OnboardingCompleteScreen({ data, onNext, onReviewAppInfo }: OnboardingCompleteScreenProps) {
  // Select a contextual starting recommended next step based on the step 3 current stage answer
  const getContextualNextStep = () => {
    switch(data.currentStage) {
      case "I only have an idea":
        return "Flesh out Feature 1 in your Blueprints tab.";
      case "I’m designing the app":
        return "Calibrate visual screenshots inside the Assets deck.";
      case "I’m building the first version":
        return "Establish MVP priorities and lock features.";
      case "I’m preparing for the App Store":
        return "Complete store descriptions & legal policies.";
      default:
        return "Complete your App Info section details.";
    }
  };

  const getContextualChecklist = () => {
    if (data.helpPriorities && data.helpPriorities.length > 0) {
      return `Review guidelines for: ${data.helpPriorities.slice(0, 2).join(', ')}`;
    }
    return "Review your app basics, audience, and top features.";
  };

  return (
    <OnboardingScreenWrapper>
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <ProgressDots currentStep={8} totalSteps={8} />
          
          <div className="flex items-center gap-3 mt-4 mb-3" id="onboarding-completion-congrats-header">
            <div className="w-10 h-10 rounded-full bg-[#18D6C8]/10 text-[#18D6C8] flex items-center justify-center border border-[#18D6C8]/25 select-none animate-bounce">
              <Check size={20} className="stroke-[3]" />
            </div>
            <div className="text-left">
              <span className="font-mono text-[9px] text-[#FF6FAE] uppercase tracking-widest font-extrabold">CREATION LOCKED IN</span>
              <h1 className="font-display font-black text-2xl text-[#FFF7EA] tracking-tight leading-none mt-0.5">
                Your app plan is ready!
              </h1>
            </div>
          </div>
          
          <p className="font-body text-sm text-[#AAB2D5] text-left leading-relaxed mb-5 select-none">
            We formulated a starting plan based on your answers for <span className="text-white font-bold">{data.appName || "Your App"}</span>. Feel safe importing or rewriting anything at any point.
          </p>

          {/* Prompt 3 Summary Cards */}
          <div className="flex flex-col gap-3 my-4 text-left select-none" id="onboarding-summary-cards-container">
            
            <div className="p-4 bg-white/5 border border-[#18D6C8]/25 hover:border-[#18D6C8]/50 rounded-xl relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#18D6C8]" />
              <div className="font-mono text-[8.5px] text-[#18D6C8] font-bold uppercase tracking-wider mb-1">Recommended next step</div>
              <p className="font-body text-xs text-[#FFF7EA] font-semibold leading-snug">
                {getContextualNextStep()}
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl relative overflow-hidden transition-all">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#1500FD]" />
              <div className="font-mono text-[8.5px] text-[#AAB2D5] font-bold uppercase tracking-wider mb-1">Starting checklist</div>
              <p className="font-body text-xs text-[#FFF7EA] font-semibold leading-snug">
                {getContextualChecklist()}
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl relative overflow-hidden transition-all">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#FF6FAE]" />
              <div className="font-mono text-[8.5px] text-[#FF6FAE] font-bold uppercase tracking-wider mb-1">Blueprint progress</div>
              <p className="font-body text-xs text-[#FFF7EA] font-semibold leading-snug">
                App Info section initialized • <span className="font-mono text-[10px] text-[#18D6C8] font-bold">1/5 Phase Ready</span>
              </p>
            </div>

          </div>

          {/* Interactive Micro Dashboard preview segment showing what was created */}
          <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl text-left font-mono select-none my-4">
            <div className="text-[10px] text-[#AAB2D5]/50 border-b border-white/10 pb-1.5 mb-2.5 flex justify-between items-center">
              <span>ACTIVE DECK TELEMETRY</span>
              <span className="text-[#18D6C8] text-[9px] font-bold">● ONLINE</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-[#AAB2D5]">
              <div>
                <span className="text-[9px] text-[#AAB2D5]/40 block select-none mb-0.5">APP NAME</span>
                <span className="text-[#FFF7EA] font-semibold truncate block">{data.appName || "Unnamed App"}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#AAB2D5]/40 block select-none mb-0.5">STAGE</span>
                <span className="text-[#FFF7EA] font-semibold truncate block">{data.currentStage || "Not set"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[9px] text-[#AAB2D5]/40 block select-none mb-0.5 animate-pulse">AUDIENCE TARGET</span>
                <span className="text-[#18D6C8] font-black truncate block">{data.targetAudience || "General creators"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-white/5 w-full select-none justify-center">
          <PrimaryButton 
            label="Go to Dashboard" 
            onPress={onNext}
            color="bg-gradient-to-r from-[#1500FD] to-[#18D6C8] text-white"
          />
          <button 
            onClick={onReviewAppInfo}
            className="h-11 w-full rounded-2xl font-body text-xs text-[#AAB2D5] hover:text-[#FFF7EA] transition-all bg-transparent focus:underline flex items-center justify-center gap-1.5 cursor-pointer font-bold select-none border border-white/10 hover:border-white/25 mt-1"
          >
            Review App Info
          </button>
        </div>
      </div>
    </OnboardingScreenWrapper>
  );
}
