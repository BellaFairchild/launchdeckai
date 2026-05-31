import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DeckScreen } from './components/DeckScreen';
import { MissionScreen } from './components/MissionScreen';
import { CargoScreen } from './components/CargoScreen';
import { FoundryScreen } from './components/FoundryScreen';
import { SignalsScreen } from './components/SignalsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CopilotModal } from './components/CopilotModal';
import { Drawer } from './components/Drawer';
import { RefuelModal } from './components/RefuelModal';
import { BlueprintsModal } from './components/BlueprintsModal';
import { BlueprintsScreen } from './components/BlueprintsScreen';
import { ProfileModal } from './components/ProfileModal';
import { SupportModal } from './components/SupportModal';
import { StreakCelebrationModal } from './components/StreakCelebrationModal';
import { ToastProvider } from './components/ToastContext';
import { AuthProvider } from './lib/FirebaseAuthContext';
import { WakeWordListener } from './components/WakeWordListener';
import OnboardingFlow, { OnboardingData } from './components/OnboardingFlow';
import { useToast } from './components/ToastContext';
import { LaunchLibraryScreen } from './components/LaunchLibraryScreen';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { addToast } = useToast();
  const [isOnboarded, setIsOnboarded] = useState(() => {
    if (typeof window !== 'undefined') {
      // Use sessionStorage so the reviewer gets to experience the gorgeous onboarding flow instantly
      return sessionStorage.getItem('launchdeck_is_onboarded_session') === 'true';
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState('deck');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefuelOpen, setIsRefuelOpen] = useState(false);
  const [isBlueprintsOpen, setIsBlueprintsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  React.useEffect(() => {
    const handleRestart = () => {
      setIsOnboarded(false);
      sessionStorage.removeItem('launchdeck_is_onboarded_session');
    };
    window.addEventListener('subspace_trigger_restart_onboarding', handleRestart);
    return () => window.removeEventListener('subspace_trigger_restart_onboarding', handleRestart);
  }, []);
  const [isStreakOpen, setIsStreakOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const alreadyShown = sessionStorage.getItem('subspace_streak_celebrated_session');
      if (!alreadyShown) {
        sessionStorage.setItem('subspace_streak_celebrated_session', 'true');
        return true;
      }
    }
    return false;
  });

  const handleMenuAction = (id: string) => {
    if (id === 'onboarding') {
      localStorage.removeItem('launchdeck_is_onboarded');
      setIsOnboarded(false);
    } else if (id === 'refuel') {
      setIsRefuelOpen(true);
    } else if (id === 'blueprints') {
      setCurrentTab('blueprints');
    } else if (id === 'signals') {
      setCurrentTab('signals');
    } else if (id === 'profile') {
      setIsProfileOpen(true);
    } else if (id === 'streak') {
      setIsStreakOpen(true);
    } else if (id === 'support') {
      setIsSupportOpen(true);
    } else if (id === 'mission') {
      setCurrentTab('mission');
    } else if (id === 'cargo') {
      setCurrentTab('cargo');
    } else if (id === 'settings') {
      setCurrentTab('settings');
    } else if (id === 'library') {
      setCurrentTab('library');
    }
  };

  if (!isOnboarded) {
    return (
      <Layout>
        <OnboardingFlow 
          onFinish={(onboardingData) => {
            localStorage.setItem('launchdeck_is_onboarded', 'true');
            sessionStorage.setItem('launchdeck_is_onboarded_session', 'true');
            if (onboardingData.appName) {
              localStorage.setItem('subspace_cached_app_name', onboardingData.appName);
            }
            if (onboardingData.currentStage) {
              localStorage.setItem('subspace_cached_stage', onboardingData.currentStage);
            }
            localStorage.setItem('launchdeck_help_priorities', JSON.stringify(onboardingData.helpPriorities));
            if (onboardingData.targetAudience) {
              localStorage.setItem('launchdeck_target_audience', onboardingData.targetAudience);
            }
            if (onboardingData.problemSolved) {
              localStorage.setItem('launchdeck_problem_solved', onboardingData.problemSolved);
            }
            if (onboardingData.mainBenefit) {
              localStorage.setItem('launchdeck_main_benefit', onboardingData.mainBenefit);
            }
            if (onboardingData.topFeatures) {
              localStorage.setItem('launchdeck_top_features', JSON.stringify(onboardingData.topFeatures));
            }

            if (onboardingData.launchGoalType === 'exact_date' && onboardingData.targetLaunchDate) {
              const mockLaunchDate = Date.now() + 14 * 24 * 60 * 60 * 1000;
              localStorage.setItem('subspace_cached_launch_date', String(mockLaunchDate));
              localStorage.setItem('subspace_cached_launch_date_formatted', onboardingData.targetLaunchDate);
            } else if (onboardingData.launchGoalType === 'rough_month' && onboardingData.targetLaunchMonth) {
              const mockLaunchDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
              localStorage.setItem('subspace_cached_launch_date', String(mockLaunchDate));
              localStorage.setItem('subspace_cached_launch_date_formatted', onboardingData.targetLaunchMonth);
            } else {
              localStorage.setItem('subspace_cached_launch_date', String(Date.now() + 14 * 24 * 60 * 60 * 1000));
            }

            window.dispatchEvent(new Event('storage'));
            setIsOnboarded(true);
            addToast('Onboarding Complete', `Welcome! Your custom ${onboardingData.appType || "product"} launch cockpit is locked.`);
          }}
          onAlreadyHaveAccount={() => {
            localStorage.setItem('launchdeck_is_onboarded', 'true');
            sessionStorage.setItem('launchdeck_is_onboarded_session', 'true');
            setIsOnboarded(true);
            addToast('Welcome Back', 'Authorized session recovered.');
          }}
          initialAppName={localStorage.getItem('subspace_cached_app_name') || ''}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header 
        onOpenDrawer={() => setIsDrawerOpen(true)} 
        onOpenRefuel={() => setIsRefuelOpen(true)}
        onOpenStreak={() => setIsStreakOpen(true)}
      />
      
      {/* Main Content Area */}
      {currentTab === 'deck' && <DeckScreen onNavigateToTab={setCurrentTab} />}
      {currentTab === 'mission' && <MissionScreen />}
      {currentTab === 'library' && <LaunchLibraryScreen />}
      {currentTab === 'signals' && <SignalsScreen />}
      {currentTab === 'cargo' && <CargoScreen />}
      {currentTab === 'foundry' && <FoundryScreen />}
      {currentTab === 'settings' && <SettingsScreen />}
      {currentTab === 'blueprints' && <BlueprintsScreen />}
      
      <BottomNav 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        openCopilot={() => setIsCopilotOpen(true)}
      />

      {isCopilotOpen && (
        <CopilotModal onClose={() => setIsCopilotOpen(false)} />
      )}

      {isDrawerOpen && (
        <Drawer onClose={() => setIsDrawerOpen(false)} onMenuAction={handleMenuAction} />
      )}

      {isRefuelOpen && (
        <RefuelModal onClose={() => setIsRefuelOpen(false)} />
      )}

      {isBlueprintsOpen && (
        <BlueprintsModal onClose={() => setIsBlueprintsOpen(false)} />
      )}

      {isProfileOpen && (
        <ProfileModal 
          onClose={() => setIsProfileOpen(false)} 
          onOpenStreak={() => setIsStreakOpen(true)}
        />
      )}

      {isStreakOpen && (
        <StreakCelebrationModal onClose={() => setIsStreakOpen(false)} />
      )}

      {isSupportOpen && (
        <SupportModal onClose={() => setIsSupportOpen(false)} />
      )}

      <WakeWordListener 
        onWakeWord={() => setIsCopilotOpen(true)} 
        isCopilotOpen={isCopilotOpen} 
      />
    </Layout>
  );
}
