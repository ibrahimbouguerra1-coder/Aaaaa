import React from 'react';
import { Flame, Sparkles, Sun, Moon, Cloud, Settings, Compass, Heart, Shield } from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { FaresMascot } from '../common/FaresMascot';

interface HeaderProps {
  onOpenStreak: () => void;
  onOpenLevelSelector: () => void;
  onOpenSettings: () => void;
  onOpenSync: () => void;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStreak,
  onOpenLevelSelector,
  onOpenSettings,
  onOpenSync,
  onSelectTab,
}) => {
  const { progress, toggleTheme, isSyncing, isCloudSynced, setPreferredAccent } = useLearner();

  const handleAccentToggle = () => {
    setPreferredAccent(progress.preferredAccent === 'US' ? 'UK' : 'US');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#131f24]/95 backdrop-blur-md border-b-2 border-[#e5e5e5] dark:border-[#37464f] transition-colors">
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={() => onSelectTab('curriculum')}
          className="flex items-center gap-2.5 cursor-pointer text-right group active:scale-95 transition-transform shrink-0 select-none"
        >
          <FaresMascot size="sm" mood="happy" />
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-[#58cc02] text-xl sm:text-2xl tracking-wide uppercase">
                فارس
              </span>
              <span className="font-en text-xs sm:text-sm font-black text-[#afafaf] uppercase tracking-wider">
                FARES
              </span>
            </div>
            <span className="text-[10px] text-[#afafaf] font-black hidden sm:inline">
              تعلم الإنجليزية مجاناً وبمتعة
            </span>
          </div>
        </button>

        {/* Duolingo Gamification Stats Bar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Target CEFR Flag/Level */}
          <button
            type="button"
            onClick={onOpenLevelSelector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6] border-2 border-b-4 border-[#1cb0f6]/30 border-b-[#1cb0f6] active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer select-none"
            title="المستوى الحالي واختبار تحديد المستوى"
          >
            <Compass className="w-4 h-4 text-[#1cb0f6] shrink-0" />
            <span className="font-en font-black text-xs sm:text-sm">{progress.estimatedLevel}</span>
          </button>

          {/* Streak Flame */}
          <button
            type="button"
            onClick={onOpenStreak}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#fff4e5] dark:bg-[#392415] text-[#ff9600] border-2 border-b-4 border-[#ff9600]/30 border-b-[#ff9600] active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer select-none"
            title="أيام الحماس المتتالية (Streak)"
          >
            <Flame className="w-4 h-4 fill-[#ff9600] text-[#ff9600] animate-bounce shrink-0" />
            <span className="font-en font-black text-xs sm:text-sm">{progress.streakDays || 1}</span>
          </button>

          {/* XP Gems/Points */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#f2e6ff] dark:bg-[#2c1b3f] text-[#ce82ff] border-2 border-b-4 border-[#ce82ff]/30 border-b-[#ce82ff]"
            title="نقاط الخبرة XP"
          >
            <Sparkles className="w-4 h-4 fill-[#ce82ff] text-[#ce82ff] shrink-0" />
            <span className="font-en font-black text-xs sm:text-sm">{progress.xp}</span>
          </div>

          {/* Hearts / Full Health Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-[#ffe6e6] dark:bg-[#381616] text-[#ff4b4b] border-2 border-b-4 border-[#ff4b4b]/30 border-b-[#ff4b4b]"
            title="قلوب الطاقة (غير محدودة)"
          >
            <Heart className="w-4 h-4 fill-[#ff4b4b] text-[#ff4b4b] shrink-0" />
            <span className="font-en font-black text-xs sm:text-sm">∞</span>
          </div>

          {/* Accent US/UK Button */}
          <button
            type="button"
            onClick={handleAccentToggle}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36] text-[#777777] dark:text-[#afafaf] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] active:translate-y-0.5 active:border-b-2 transition-all font-en text-xs font-black cursor-pointer"
            title="تبديل اللهجة (US/UK)"
          >
            <span>{progress.preferredAccent === 'US' ? '🇺🇸' : '🇬🇧'}</span>
            <span>{progress.preferredAccent}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-[#202f36] text-[#777777] dark:text-[#afafaf] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
            title="تبديل المظهر"
          >
            {progress.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#ffc800]" />
            ) : (
              <Moon className="w-4 h-4 text-[#4b4b4b]" />
            )}
          </button>

          {/* Settings Modal */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-[#202f36] text-[#777777] dark:text-[#afafaf] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
            title="الإعدادات"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
