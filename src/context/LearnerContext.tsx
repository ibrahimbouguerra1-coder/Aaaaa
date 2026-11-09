import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { CEFRLevel, LearnerProgress, MistakeItem, VocabularyWord } from '../types';
import seedVocabularyJson from '../data/seedVocabulary.json';
import initialMistakesJson from '../data/initialMistakes.json';
import { playClick, playLevelUp, playSuccess } from '../utils/audio';

const STORAGE_KEY = 'fares_english_learner_state_v1';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

const defaultProgress: LearnerProgress = {
  hasCompletedOnboarding: false,
  name: 'متعلم جديد',
  estimatedLevel: 'A0',
  skills: {
    grammar: 'A0',
    vocabulary: 'A0',
    reading: 'A0',
    listening: 'A0',
    speaking: 'A0',
    writing: 'A0',
  },
  primaryGoal: 'fluent_speaking',
  dailyGoalMinutes: 15,
  learningMode: 'arabic_assisted',
  preferredAccent: 'US',
  activeFocusAreas: ['p_vs_b', 'v_vs_f', 'th_sounds'],
  arabicDialect: 'fusha',
  industryInterests: ['tech', 'business', 'daily'],
  soundEffectsEnabled: true,
  theme: 'light',
  speechPace: 0.75,
  xp: 40,
  streakDays: 1,
  lastActiveDate: getTodayString(),
  completedLessonIds: [],
  savedVocabulary: seedVocabularyJson as unknown as VocabularyWord[],
  todayMinutesSpent: 0,
  personalMistakes: initialMistakesJson as unknown as MistakeItem[],
  completedWorkoutsCount: 0,
  badges: [
    {
      id: 'welcome',
      titleAr: 'بداية الرحلة',
      descriptionAr: 'الانضمام لمنصة فارس لتعليم الإنجليزية',
      unlockedAt: new Date().toISOString(),
    },
  ],
};

interface LearnerContextType {
  progress: LearnerProgress;
  isLoading: boolean;
  isSyncing: boolean;
  isCloudSynced: boolean;
  markLessonComplete: (lessonId: string, earnedXp?: number) => void;
  markWordMastered: (wordText: string, mastered: boolean) => void;
  addVocabularyWord: (word: Partial<VocabularyWord>) => void;
  recordPersonalMistake: (mistake: Omit<MistakeItem, 'id' | 'createdAt'>) => void;
  setEstimatedLevel: (level: CEFRLevel) => void;
  setPreferredAccent: (accent: 'US' | 'UK') => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  toggleTheme: () => void;
  completeOnboarding: (data: Partial<LearnerProgress>) => void;
  resetProgress: () => void;
  syncNow: () => Promise<void>;
  exportProgressJson: () => void;
  importProgressJson: (jsonStr: string) => boolean;
}

const LearnerContext = createContext<LearnerContextType | undefined>(undefined);

export const LearnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<LearnerProgress>(() => {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultProgress, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse learner state from localStorage:', e);
    }
    return defaultProgress;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const [, startTransition] = useTransition();

  // Save to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error('LocalStorage write failed:', err);
    }
  }, [progress]);

  // Sync theme to DOM
  useEffect(() => {
    const isDark = progress.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [progress.theme]);

  // Check and maintain streak
  useEffect(() => {
    const today = getTodayString();
    if (progress.lastActiveDate !== today) {
      const last = new Date(progress.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

      setProgress((prev) => {
        let newStreak = prev.streakDays;
        if (diffDays === 1) {
          // Continued streak
          newStreak = (prev.streakDays || 0) + 1;
        } else if (diffDays > 1) {
          // Reset streak if gap > 1 day
          newStreak = 1;
        }
        return {
          ...prev,
          streakDays: newStreak,
          lastActiveDate: today,
          todayMinutesSpent: 0,
        };
      });
    }
  }, [progress.lastActiveDate]);

  const markLessonComplete = (lessonId: string, earnedXp = 25) => {
    setProgress((prev) => {
      const isAlreadyCompleted = prev.completedLessonIds.includes(lessonId);
      const newCompleted = isAlreadyCompleted ? prev.completedLessonIds : [...prev.completedLessonIds, lessonId];
      const newXp = prev.xp + (isAlreadyCompleted ? 5 : earnedXp);

      const updatedBadges = [...prev.badges];
      if (newCompleted.length >= 1 && !updatedBadges.some((b) => b.id === 'first_lesson')) {
        updatedBadges.push({
          id: 'first_lesson',
          titleAr: 'الخطوة الأولى',
          descriptionAr: 'إكمال أول درس بنجاح في منصة فارس',
          unlockedAt: new Date().toISOString(),
        });
      }
      if (newCompleted.length >= 5 && !updatedBadges.some((b) => b.id === 'five_lessons')) {
        updatedBadges.push({
          id: 'five_lessons',
          titleAr: 'شعلة الاستمرار',
          descriptionAr: 'إتمام 5 دروس متتالية بجدارة',
          unlockedAt: new Date().toISOString(),
        });
      }

      return {
        ...prev,
        completedLessonIds: newCompleted,
        xp: newXp,
        badges: updatedBadges,
      };
    });
    playSuccess(progress.soundEffectsEnabled);
  };

  const markWordMastered = (wordText: string, mastered: boolean) => {
    setProgress((prev) => {
      const updatedVocab = prev.savedVocabulary.map((item) => {
        if (item.word.toLowerCase() === wordText.toLowerCase()) {
          return {
            ...item,
            mastered,
            repetitions: (item.repetitions || 0) + 1,
            nextReviewDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          };
        }
        return item;
      });
      return {
        ...prev,
        savedVocabulary: updatedVocab,
        xp: prev.xp + 5,
      };
    });
    playClick(progress.soundEffectsEnabled);
  };

  const addVocabularyWord = (word: Partial<VocabularyWord>) => {
    const wordStr = word.word;
    if (!wordStr) return;
    setProgress((prev) => {
      const exists = prev.savedVocabulary.some((w) => w.word.toLowerCase() === wordStr.toLowerCase());
      if (exists) return prev;
      const newWord: VocabularyWord = {
        id: `custom-word-${Date.now()}`,
        word: wordStr,
        ipa: word.ipa || '',
        arabicPhonetic: word.arabicPhonetic || '',
        partOfSpeech: word.partOfSpeech || 'noun',
        arabicMeaning: word.arabicMeaning || '',
        englishDefinition: word.englishDefinition || '',
        exampleEn: word.exampleEn || '',
        exampleAr: word.exampleAr || '',
        level: word.level || prev.estimatedLevel,
        mastered: false,
        repetitions: 0,
      };
      return {
        ...prev,
        savedVocabulary: [newWord, ...prev.savedVocabulary],
      };
    });
  };

  const recordPersonalMistake = (item: Omit<MistakeItem, 'id' | 'createdAt'>) => {
    setProgress((prev) => {
      const newMistake: MistakeItem = {
        ...item,
        id: `mistake-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      // Keep latest 25 mistakes
      return {
        ...prev,
        personalMistakes: [newMistake, ...prev.personalMistakes].slice(0, 25),
      };
    });
  };

  const setEstimatedLevel = (level: CEFRLevel) => {
    setProgress((prev) => ({
      ...prev,
      estimatedLevel: level,
      skills: {
        grammar: level,
        vocabulary: level,
        reading: level,
        listening: level,
        speaking: level,
        writing: level,
      },
    }));
    playLevelUp(progress.soundEffectsEnabled);
  };

  const setPreferredAccent = (accent: 'US' | 'UK') => {
    setProgress((prev) => ({ ...prev, preferredAccent: accent }));
    playClick(progress.soundEffectsEnabled);
  };

  const setSoundEffectsEnabled = (enabled: boolean) => {
    setProgress((prev) => ({ ...prev, soundEffectsEnabled: enabled }));
  };

  const toggleTheme = () => {
    setProgress((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const completeOnboarding = (data: Partial<LearnerProgress>) => {
    setProgress((prev) => ({
      ...prev,
      ...data,
      hasCompletedOnboarding: true,
    }));
    playSuccess(progress.soundEffectsEnabled);
  };

  const resetProgress = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setProgress({ ...defaultProgress });
  };

  const syncNow = async () => {
    setIsSyncing(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsSyncing(false);
    setIsCloudSynced(true);
    playSuccess(progress.soundEffectsEnabled);
  };

  const exportProgressJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fares_english_backup_${getTodayString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importProgressJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        setProgress((prev) => ({ ...prev, ...parsed }));
        playSuccess(progress.soundEffectsEnabled);
        return true;
      }
    } catch (e) {
      console.warn('Import failed:', e);
    }
    return false;
  };

  return (
    <LearnerContext.Provider
      value={{
        progress,
        isLoading,
        isSyncing,
        isCloudSynced,
        markLessonComplete,
        markWordMastered,
        addVocabularyWord,
        recordPersonalMistake,
        setEstimatedLevel,
        setPreferredAccent,
        setSoundEffectsEnabled,
        toggleTheme,
        completeOnboarding,
        resetProgress,
        syncNow,
        exportProgressJson,
        importProgressJson,
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export function useLearner(): LearnerContextType {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
}
