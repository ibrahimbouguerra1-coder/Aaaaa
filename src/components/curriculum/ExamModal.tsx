import React, { useState } from 'react';
import { X, Award, CheckCircle, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { CEFRLevel } from '../../types';
import { getExamByLevel, PromotionExam } from '../../data/curriculum';
import { useLearner } from '../../context/LearnerContext';
import { playClick, playError, playLevelUp, playSuccess } from '../../utils/audio';

interface ExamModalProps {
  level: CEFRLevel;
  isOpen: boolean;
  onClose: () => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({ level, isOpen, onClose }) => {
  const { progress, setEstimatedLevel } = useLearner();
  const exam = getExamByLevel(level);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen || !exam) return null;

  const currentQ = exam.questions[currentQIndex];

  const handleSelect = (idx: number) => {
    playClick(progress.soundEffectsEnabled);
    setSelectedOption(idx);
  };

  const handleConfirmNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQIndex < exam.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Calculate score
      let score = 0;
      exam.questions.forEach((q, i) => {
        if (newAnswers[i] === q.correctIndex) {
          score++;
        }
      });

      const passed = score >= exam.passingScore;
      setIsFinished(true);

      if (passed) {
        playLevelUp(progress.soundEffectsEnabled);
        // Promote learner!
        setEstimatedLevel(exam.nextLevel);
      } else {
        playError(progress.soundEffectsEnabled);
      }
    }
  };

  const handleRetry = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setIsFinished(false);
  };

  // Score calculation
  const totalScore = userAnswers.reduce((acc, ans, i) => {
    return ans === exam.questions[i]?.correctIndex ? acc + 1 : acc;
  }, 0);
  const isPassed = totalScore >= exam.passingScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-b-6 border-slate-200 border-b-slate-300 dark:border-slate-800 dark:border-b-slate-950 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-850 dark:to-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-en text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500 text-white">
                {exam.level} ➔ {exam.nextLevel}
              </span>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                اختبار الترقية المعتمد
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {exam.titleAr}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isFinished ? (
            <>
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  السؤال {currentQIndex + 1} من {exam.questions.length}
                </span>
                <span>المطلوب للنجاح: {exam.passingScore} إجابات صحيحة</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{
                    width: `${((currentQIndex + 1) / exam.questions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-right">
                <p className="text-xs text-slate-500 font-bold">{currentQ.questionAr}</p>
                {currentQ.questionEn && (
                  <h3 className="font-en font-black text-slate-900 dark:text-white text-base">
                    {currentQ.questionEn}
                  </h3>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelect(i)}
                      className={`p-3.5 rounded-2xl border-2 border-b-4 text-start font-en text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 border-b-amber-600 text-amber-900 dark:text-amber-200 ring-2 ring-amber-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 border-b-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleConfirmNext}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-sm border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>{currentQIndex < exam.questions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار وتقييم المستوى'}</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-4 space-y-5">
              <div
                className={`w-20 h-20 mx-auto rounded-3xl border-2 border-b-4 flex items-center justify-center ${
                  isPassed
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 border-b-emerald-600 text-emerald-600 animate-bounce'
                    : 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 border-b-rose-600 text-rose-600'
                }`}
              >
                {isPassed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {isPassed ? `مبروك! تم ترقيتك رسمياً للمستوى ${exam.nextLevel}` : 'تحتاج لمراجعة بعض المفاهيم'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  حصلت على {totalScore} إجابات صحيحة من أصل {exam.questions.length} سؤالاً (المطلوب {exam.passingScore}).
                </p>
              </div>

              {isPassed ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
                  تم فتح وحدات المستوى الجديد {exam.nextLevel} تلقائياً وإضافتها لمنهجك التعليمي!
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold">
                  أعد مراجعة دروس المستوى {exam.level} ثم جرّب الاختبار مرة أخرى، المحاولة مجانية وغير محدودة.
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                {!isPassed && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-5 py-3 rounded-2xl border-2 border-b-4 border-slate-200 border-b-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة الاختبار</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white border-b-4 border-[#46a302] text-xs font-black cursor-pointer shadow-md"
                >
                  العودة للمنهج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
