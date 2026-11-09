import React, { useState } from 'react';
import { X, Compass, CheckCircle, ArrowRight, Sparkles, Award } from 'lucide-react';
import { placementQuestions } from '../../data/practiceData';
import { useLearner } from '../../context/LearnerContext';
import { CEFRLevel } from '../../types';
import { playClick, playError, playLevelUp, playSuccess } from '../../utils/audio';
import { FaresMascot } from '../common/FaresMascot';

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClose?: boolean;
}

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  isOpen,
  onClose,
  canClose = true,
}) => {
  const { progress, completeOnboarding, setEstimatedLevel } = useLearner();
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [assignedLevel, setAssignedLevel] = useState<CEFRLevel>('A0');

  // Goals
  const [name, setName] = useState(progress.name || 'متعلم جديد');
  const [goal, setGoal] = useState(progress.primaryGoal);
  const [accent, setAccent] = useState<'US' | 'UK'>(progress.preferredAccent);

  if (!isOpen) return null;

  const currentQ = placementQuestions[currentQIndex];

  const handleStartQuiz = () => {
    playClick(progress.soundEffectsEnabled);
    setStep('quiz');
    setCurrentQIndex(0);
    setSelectedOption(null);
    setAnswers([]);
  };

  const handleSelectDirectLevel = (lvl: CEFRLevel) => {
    playClick(progress.soundEffectsEnabled);
    setEstimatedLevel(lvl);
    completeOnboarding({ name, primaryGoal: goal, preferredAccent: accent, estimatedLevel: lvl });
    onClose();
  };

  const handleAnswerConfirm = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQIndex < placementQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      let score = 0;
      placementQuestions.forEach((q, i) => {
        if (newAnswers[i] === q.correctIndex) {
          score++;
        }
      });

      let calculatedLevel: CEFRLevel = 'A0';
      if (score === 1) calculatedLevel = 'A1';
      else if (score === 2) calculatedLevel = 'A2';
      else if (score === 3) calculatedLevel = 'B1';
      else if (score === 4) calculatedLevel = 'B2';
      else if (score >= 5) calculatedLevel = 'C1';

      setAssignedLevel(calculatedLevel);
      setEstimatedLevel(calculatedLevel);
      setStep('result');
      playLevelUp(progress.soundEffectsEnabled);
    }
  };

  const handleFinishOnboarding = () => {
    completeOnboarding({
      name,
      primaryGoal: goal,
      preferredAccent: accent,
      estimatedLevel: assignedLevel,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] shadow-2xl overflow-hidden p-6 text-right space-y-6"
      >
        {canClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#afafaf] hover:text-slate-900 dark:hover:text-white font-black cursor-pointer absolute top-4 left-4"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 1. Intro Step */}
        {step === 'intro' && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <FaresMascot size="md" mood="happy" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                تحديد مستواك وهدفك في الإنجليزية
              </h2>
              <p className="text-xs sm:text-sm text-[#777777] dark:text-[#afafaf] font-bold max-w-sm mx-auto">
                أجب على 5 أسئلة تشخيصية سريعة لتحديد مستواك من A0 حتى C2، أو اختر مستواك المستهدف مباشرة.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block mb-1">
                  اسمك أو كنيتك:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-[#f7f7f7] dark:bg-[#202f36] font-black text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#58cc02]"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block mb-1">
                  اللهجة المفضلة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccent('US')}
                    className={`p-3 rounded-2xl border-2 border-b-4 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 active:border-b-2 ${
                      accent === 'US'
                        ? 'border-[#1cb0f6] border-b-[#1482b7] bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6]'
                        : 'border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-white dark:bg-[#202f36] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🇺🇸 أمريكية (US)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccent('UK')}
                    className={`p-3 rounded-2xl border-2 border-b-4 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 active:border-b-2 ${
                      accent === 'UK'
                        ? 'border-[#1cb0f6] border-b-[#1482b7] bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6]'
                        : 'border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-white dark:bg-[#202f36] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🇬🇧 بريطانية (UK)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleStartQuiz}
                className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] text-white font-black text-sm border-2 border-b-4 border-[#46a302] cursor-pointer shadow-md active:translate-y-1 active:border-b-0 transition-all"
              >
                بدء الاختبار التشخيصي (5 أسئلة)
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-[#afafaf] font-black block mb-2">أو اختر مستواك مباشرة:</span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleSelectDirectLevel(lvl)}
                      className="px-3 py-1.5 rounded-xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-xs font-black text-slate-800 dark:text-slate-200 hover:border-[#58cc02] cursor-pointer font-en"
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Diagnostic Quiz Step */}
        {step === 'quiz' && currentQ && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs font-black text-[#afafaf]">
              <span>السؤال {currentQIndex + 1} من {placementQuestions.length}</span>
              <span className="font-en px-2 py-0.5 rounded-lg bg-[#e5f6ff] text-[#1cb0f6]">{currentQ.level} Difficulty</span>
            </div>

            <div className="w-full h-3 rounded-full bg-[#e5e5e5] dark:bg-[#37464f] overflow-hidden p-0.5">
              <div
                className="h-full bg-[#58cc02] rounded-full transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / placementQuestions.length) * 100}%` }}
              />
            </div>

            <div className="p-4 rounded-3xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] space-y-1.5">
              <span className="text-xs font-black text-[#afafaf]">{currentQ.questionAr}</span>
              <h3 className="font-en font-black text-slate-900 dark:text-white text-base sm:text-lg">
                {currentQ.sentenceEn}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedOption(i)}
                  className={`p-4 rounded-2xl border-2 border-b-4 text-start font-en text-sm font-black transition-all cursor-pointer active:translate-y-1 active:border-b-2 ${
                    selectedOption === i
                      ? 'bg-[#e5f6ff] dark:bg-[#183648] border-[#1cb0f6] border-b-[#1482b7] text-[#1cb0f6]'
                      : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] text-slate-800 dark:text-slate-200 hover:border-[#1cb0f6]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handleAnswerConfirm}
              className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] disabled:opacity-40 text-white font-black text-sm border-2 border-b-4 border-[#46a302] cursor-pointer shadow-md flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all"
            >
              <span>{currentQIndex < placementQuestions.length - 1 ? 'السؤال التالي' : 'إنهاء وتحديد المستوى'}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* 3. Result Step */}
        {step === 'result' && (
          <div className="text-center py-4 space-y-5">
            <div className="flex justify-center">
              <FaresMascot size="lg" mood="cheering" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-[#afafaf]">مستواك المقترح بدقة:</span>
              <h3 className="text-4xl font-black text-[#58cc02] font-en">
                {assignedLevel}
              </h3>
              <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold max-w-xs mx-auto">
                تم تخصيص مسار المنهج والتمارين الصوتية ومحادثات مستر فارس بناءً على مستواك!
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] text-white font-black text-sm border-2 border-b-4 border-[#46a302] cursor-pointer shadow-md active:translate-y-1 active:border-b-0 transition-all"
            >
              دخول المنصة وبدء التعلم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
