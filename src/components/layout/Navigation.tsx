import React from 'react';
import { BookOpen, Dumbbell, Bot, Trophy } from 'lucide-react';
import { playClick } from '../../utils/audio';
import { useLearner } from '../../context/LearnerContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { progress } = useLearner();

  const handleSelect = (tab: string) => {
    playClick(progress.soundEffectsEnabled);
    onTabChange(tab);
  };

  const isCurriculum = activeTab === 'curriculum' || activeTab === 'dashboard';
  const isPractice = activeTab === 'practice' || activeTab === 'skills_labs';
  const isAiTutor = activeTab === 'ai_tutor';
  const isProgress = activeTab === 'progress';

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#131f24]/95 backdrop-blur-md border-t-2 border-[#e5e5e5] dark:border-[#37464f] py-2 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="max-w-xl mx-auto grid grid-cols-4 gap-2 items-center">
        {/* Curriculum Tab */}
        <button
          type="button"
          onClick={() => handleSelect('curriculum')}
          className={`min-h-[58px] px-2 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer select-none border-2 ${
            isCurriculum
              ? 'bg-[#58cc02] text-white border-[#58cc02] border-b-4 border-b-[#46a302] shadow-sm translate-y-[-2px]'
              : 'border-transparent text-[#777777] dark:text-[#afafaf] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36] active:translate-y-1'
          }`}
        >
          <BookOpen className={`w-5 h-5 shrink-0 transition-transform ${isCurriculum ? 'scale-110' : ''}`} />
          <span className="text-[11px] font-black mt-1 text-center truncate max-w-full">
            تعلم
          </span>
        </button>

        {/* Practice Hub Tab */}
        <button
          type="button"
          onClick={() => handleSelect('practice')}
          className={`min-h-[58px] px-2 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer select-none border-2 ${
            isPractice
              ? 'bg-[#1cb0f6] text-white border-[#1cb0f6] border-b-4 border-b-[#1899d6] shadow-sm translate-y-[-2px]'
              : 'border-transparent text-[#777777] dark:text-[#afafaf] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36] active:translate-y-1'
          }`}
        >
          <Dumbbell className={`w-5 h-5 shrink-0 transition-transform ${isPractice ? 'scale-110' : ''}`} />
          <span className="text-[11px] font-black mt-1 text-center truncate max-w-full">
            تدرّب
          </span>
        </button>

        {/* AI Tutor Tab */}
        <button
          type="button"
          onClick={() => handleSelect('ai_tutor')}
          className={`min-h-[58px] px-2 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer select-none border-2 ${
            isAiTutor
              ? 'bg-[#ce82ff] text-white border-[#ce82ff] border-b-4 border-b-[#af67e6] shadow-sm translate-y-[-2px]'
              : 'border-transparent text-[#777777] dark:text-[#afafaf] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36] active:translate-y-1'
          }`}
        >
          <Bot className={`w-5 h-5 shrink-0 transition-transform ${isAiTutor ? 'scale-110' : ''}`} />
          <span className="text-[11px] font-black mt-1 text-center truncate max-w-full">
            مستر فارس
          </span>
        </button>

        {/* Progress Tab */}
        <button
          type="button"
          onClick={() => handleSelect('progress')}
          className={`min-h-[58px] px-2 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer select-none border-2 ${
            isProgress
              ? 'bg-[#ffc800] text-[#4b4b4b] border-[#ffc800] border-b-4 border-b-[#e5b400] shadow-sm translate-y-[-2px]'
              : 'border-transparent text-[#777777] dark:text-[#afafaf] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36] active:translate-y-1'
          }`}
        >
          <Trophy className={`w-5 h-5 shrink-0 transition-transform ${isProgress ? 'scale-110' : ''}`} />
          <span className="text-[11px] font-black mt-1 text-center truncate max-w-full">
            اللوحة
          </span>
        </button>
      </div>
    </nav>
  );
};
