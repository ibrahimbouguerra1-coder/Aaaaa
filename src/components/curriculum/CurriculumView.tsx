import React, { useState } from 'react';
import { Check, Star, Lock, Award, BookOpen, Sparkles, ChevronLeft, Volume2, Compass, Play } from 'lucide-react';
import { CEFRLevel, Lesson } from '../../types';
import { allLessons, cefrLevels, getLessonsByLevel, getNextLessonId } from '../../data/curriculum';
import { useLearner } from '../../context/LearnerContext';
import { LessonModal } from './LessonModal';
import { ExamModal } from './ExamModal';
import { FaresMascot } from '../common/FaresMascot';
import { playClick } from '../../utils/audio';

interface CurriculumViewProps {
  onOpenPhonicsStudio?: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onOpenPhonicsStudio }) => {
  const { progress } = useLearner();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(progress.estimatedLevel);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isExamOpen, setIsExamOpen] = useState(false);

  const levelLessons = getLessonsByLevel(selectedLevel);
  const completedInLevel = levelLessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;
  const levelPercent =
    levelLessons.length > 0 ? Math.round((completedInLevel / levelLessons.length) * 100) : 0;

  const currentActiveLessonId = getNextLessonId(progress.completedLessonIds, selectedLevel);
  const currentLevelMeta = cefrLevels.find((lvl) => lvl.id === selectedLevel) || cefrLevels[0];

  // Group lessons by Chapter
  const chapters: Record<string, Lesson[]> = {};
  levelLessons.forEach((lesson) => {
    const chTitle = lesson.chapterTitleAr || 'الوحدة التعليمية';
    if (!chapters[chTitle]) chapters[chTitle] = [];
    chapters[chTitle].push(lesson);
  });

  const handleLevelSelect = (lvl: CEFRLevel) => {
    playClick(progress.soundEffectsEnabled);
    setSelectedLevel(lvl);
  };

  // Sinusoidal horizontal offset for the classic Duolingo winding stepping-stone path
  const getOffsetClass = (index: number) => {
    const mod = index % 4;
    if (mod === 0) return 'translate-x-0';
    if (mod === 1) return '-translate-x-10 sm:-translate-x-14';
    if (mod === 2) return 'translate-x-0';
    return 'translate-x-10 sm:translate-x-14';
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* CEFR Level Bar Switcher (Duolingo unit pills) */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center justify-center gap-2 min-w-max px-2">
          {cefrLevels.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            const isUserLevel = progress.estimatedLevel === lvl.id;
            const levelDone =
              getLessonsByLevel(lvl.id).filter((l) =>
                progress.completedLessonIds.includes(l.id)
              ).length === getLessonsByLevel(lvl.id).length;

            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleLevelSelect(lvl.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 border-b-4 transition-all cursor-pointer select-none text-xs font-black ${
                  isSelected
                    ? 'bg-[#58cc02] text-white border-[#58cc02] border-b-[#46a302] translate-y-[-2px] shadow-sm'
                    : 'bg-white dark:bg-[#202f36] text-[#777777] dark:text-[#afafaf] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] hover:bg-[#f7f7f7]'
                }`}
              >
                <span className="font-en text-sm font-black">{lvl.id}</span>
                {levelDone ? (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                ) : isUserLevel ? (
                  <span className="w-2 h-2 rounded-full bg-[#ffc800]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duolingo Section Guidebook / Unit Header */}
      <div className="rounded-3xl bg-[#58cc02] text-white p-5 sm:p-6 border-b-6 border-[#46a302] shadow-sm relative overflow-hidden text-right space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#d7ffb8] block font-en">
              SECTION {selectedLevel} • GUIDEBOOK
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-snug">
              {currentLevelMeta.titleAr}
            </h2>
            <p className="text-xs text-[#f1ffeb] font-bold leading-relaxed line-clamp-2">
              {currentLevelMeta.descAr}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExamOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white text-[#46a302] font-black text-xs border-b-4 border-[#e5e5e5] active:translate-y-0.5 active:border-b-0 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Award className="w-4 h-4 text-[#ffc800]" />
              <span>اختبار الترقية</span>
            </button>
          </div>
        </div>

        {/* Progress bar inside unit header */}
        <div className="space-y-1 pt-1 border-t border-white/20">
          <div className="flex items-center justify-between text-[11px] font-black text-[#d7ffb8]">
            <span>{completedInLevel} من أصل {levelLessons.length} دروس مكتملة</span>
            <span className="font-en">{levelPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#46a302] overflow-hidden p-0.5">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Duolingo Stepping-Stone Winding Path Roadmap */}
      <div className="py-6 space-y-12">
        {Object.entries(chapters).map(([chapterTitle, lessons], chIdx) => (
          <div key={chIdx} className="space-y-6">
            {/* Chapter Milestone Divider Banner */}
            <div className="flex items-center gap-3 justify-center py-2">
              <div className="h-0.5 flex-1 bg-[#e5e5e5] dark:bg-[#37464f]" />
              <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] text-center shadow-2xs">
                <span className="text-[10px] font-black text-[#afafaf] block">الوحدة {chIdx + 1}</span>
                <span className="text-xs sm:text-sm font-black text-[#4b4b4b] dark:text-[#f7f7f7]">
                  {chapterTitle}
                </span>
              </div>
              <div className="h-0.5 flex-1 bg-[#e5e5e5] dark:bg-[#37464f]" />
            </div>

            {/* Stepping-stone circle buttons */}
            <div className="flex flex-col items-center gap-8 py-2 relative">
              {lessons.map((lesson, lIdx) => {
                const isCompleted = progress.completedLessonIds.includes(lesson.id);
                const isCurrent = lesson.id === currentActiveLessonId;
                const offsetClass = getOffsetClass(lIdx);

                return (
                  <div
                    key={lesson.id}
                    className={`flex flex-col items-center gap-2 transition-transform duration-300 ${offsetClass}`}
                  >
                    {/* Floating Speech bubble prompt for the current lesson */}
                    {isCurrent && (
                      <div className="relative mb-1 animate-bounce">
                        <div className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] shadow-md text-[11px] font-black text-[#58cc02] whitespace-nowrap">
                          ابدأ هنا!
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#cecece] dark:border-t-[#37464f]" />
                      </div>
                    )}

                    {/* Stepping-Stone 3D Circle Node */}
                    <button
                      type="button"
                      onClick={() => {
                        playClick(progress.soundEffectsEnabled);
                        setActiveLesson(lesson);
                      }}
                      className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full border-4 flex items-center justify-center transition-all cursor-pointer select-none relative ${
                        isCompleted
                          ? 'bg-[#ffc800] border-[#ffc800] border-b-8 border-b-[#e5b400] text-[#7d5d00] active:translate-y-1 active:border-b-4'
                          : isCurrent
                          ? 'bg-[#58cc02] border-[#58cc02] border-b-8 border-b-[#46a302] text-white active:translate-y-1 active:border-b-4 duo-active-node'
                          : 'bg-[#e5e5e5] dark:bg-[#202f36] border-[#cecece] border-b-8 border-b-[#afafaf] dark:border-[#37464f] dark:border-b-[#26333a] text-[#afafaf] active:translate-y-1 active:border-b-4'
                      }`}
                      title={lesson.titleAr}
                    >
                      {isCompleted ? (
                        <Check className="w-9 h-9 stroke-[4] text-white drop-shadow-xs" />
                      ) : isCurrent ? (
                        <Star className="w-9 h-9 fill-white stroke-[2.5]" />
                      ) : (
                        <Lock className="w-7 h-7 stroke-[2.5]" />
                      )}

                      {/* Lesson number badge */}
                      <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-white dark:bg-[#131f24] border-2 border-[#e5e5e5] dark:border-[#37464f] text-[10px] font-black text-[#777777] dark:text-[#afafaf] flex items-center justify-center font-en">
                        {lIdx + 1}
                      </span>
                    </button>

                    {/* Title label underneath node */}
                    <span className="text-xs font-black text-[#4b4b4b] dark:text-[#f7f7f7] max-w-[140px] text-center leading-tight">
                      {lesson.titleAr.replace(/^الدرس \d+:\s*/, '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Big End-of-Level Promotion Chest */}
        <div className="flex flex-col items-center gap-3 pt-4 text-center">
          <div className="w-24 h-24 rounded-3xl bg-[#ff9600] border-4 border-b-8 border-[#ff9600] border-b-[#e58500] text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:translate-y-1 transition-all"
            onClick={() => setIsExamOpen(true)}
          >
            <Award className="w-12 h-12 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-base text-[#4b4b4b] dark:text-[#f7f7f7]">
              اختبار الترقية للمستوى التالي
            </h4>
            <p className="text-xs text-[#afafaf] font-bold">
              تجاوز الامتحان لتحصل على كأس المستوى وشهادة الإتقان!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsExamOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm border-b-4 border-[#46a302] active:translate-y-1 active:border-b-0 transition-all cursor-pointer shadow-md"
          >
            بدء الاختبار النهائي
          </button>
        </div>
      </div>

      {/* Lesson View Modal */}
      <LessonModal
        lesson={activeLesson}
        isOpen={activeLesson !== null}
        onClose={() => setActiveLesson(null)}
        onOpenPhonicsStudio={onOpenPhonicsStudio}
      />

      {/* Promotion Exam Modal */}
      <ExamModal
        level={selectedLevel}
        isOpen={isExamOpen}
        onClose={() => setIsExamOpen(false)}
      />
    </div>
  );
};
