import React, { useState } from 'react';
import { LearnerProvider, useLearner } from './context/LearnerContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { CurriculumView } from './components/curriculum/CurriculumView';
import { PracticeHub } from './components/practice/PracticeHub';
import { AiTutorView } from './components/ai/AiTutorView';
import { ProgressView } from './components/progress/ProgressView';
import { PlacementTestModal } from './components/modals/PlacementTestModal';
import { LevelSelectorModal } from './components/modals/LevelSelectorModal';
import { StreakModal } from './components/modals/StreakModal';
import { SettingsModal } from './components/modals/SettingsModal';

function MainApp() {
  const { progress } = useLearner();
  const [activeTab, setActiveTab] = useState<string>('curriculum');

  // Modal dialog states
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);

  const shouldShowOnboarding = !progress.hasCompletedOnboarding;

  return (
    <div className="min-h-screen bg-white dark:bg-[#131f24] text-slate-900 dark:text-white flex flex-col font-sans transition-colors pb-24 selection:bg-[#58cc02]/30 selection:text-[#58cc02]">
      {/* Top Application Header */}
      <Header
        onOpenStreak={() => setIsStreakOpen(true)}
        onOpenLevelSelector={() => setIsLevelSelectorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSync={() => setIsSettingsOpen(true)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Container View */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {activeTab === 'curriculum' && (
          <CurriculumView onOpenPhonicsStudio={() => setActiveTab('practice')} />
        )}
        {activeTab === 'practice' && <PracticeHub />}
        {activeTab === 'ai_tutor' && <AiTutorView />}
        {activeTab === 'progress' && <ProgressView />}
      </main>

      {/* Bottom Tactile Navigation Bar */}
      <Navigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Modals & Dialogs */}
      <StreakModal isOpen={isStreakOpen} onClose={() => setIsStreakOpen(false)} />

      <LevelSelectorModal
        isOpen={isLevelSelectorOpen}
        onClose={() => setIsLevelSelectorOpen(false)}
        onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <PlacementTestModal
        isOpen={isPlacementTestOpen || shouldShowOnboarding}
        onClose={() => setIsPlacementTestOpen(false)}
        canClose={progress.hasCompletedOnboarding}
      />
    </div>
  );
}

export default function App() {
  return (
    <LearnerProvider>
      <MainApp />
    </LearnerProvider>
  );
}
