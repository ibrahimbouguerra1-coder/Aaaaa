import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Sparkles, BookOpen, Volume2, ArrowRight, RotateCcw, Heart, Flag } from 'lucide-react';
import { Lesson, LessonExercise } from '../../types';
import { AudioButton } from '../common/AudioButton';
import { FaresMascot } from '../common/FaresMascot';
import { useLearner } from '../../context/LearnerContext';
import { playClick, playError, playSuccess } from '../../utils/audio';

interface LessonModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPhonicsStudio?: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onOpenPhonicsStudio,
}) => {
  const { progress, markLessonComplete, recordPersonalMistake } = useLearner();
  const [activeTab, setActiveTab] = useState<'content' | 'exercises'>('content');

  // Exercise runner state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [fillBlankInput, setFillBlankInput] = useState('');
  const [scrambleWords, setScrambleWords] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [exercisesCompleted, setExercisesCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  if (!isOpen || !lesson) return null;

  const exercises = lesson.exercises || [];
  const currentExercise = exercises[currentExerciseIndex] as LessonExercise | undefined;

  const handleStartExercises = () => {
    setActiveTab('exercises');
    setCurrentExerciseIndex(0);
    resetExerciseState(0);
    setCorrectCount(0);
    setExercisesCompleted(false);
  };

  const resetExerciseState = (index: number) => {
    setSelectedAnswer(null);
    setFillBlankInput('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    const ex = exercises[index];
    if (ex?.type === 'sentence_scramble' && ex.question) {
      setScrambleWords([]);
    }
  };

  const handleScrambleWordClick = (word: string) => {
    playClick(progress.soundEffectsEnabled);
    if (scrambleWords.includes(word)) {
      setScrambleWords(scrambleWords.filter((w) => w !== word));
    } else {
      setScrambleWords([...scrambleWords, word]);
    }
  };

  const handleCheckAnswer = () => {
    if (!currentExercise || isAnswerChecked) return;

    let correct = false;
    if (currentExercise.type === 'multiple_choice') {
      correct = selectedAnswer === currentExercise.correctAnswer;
    } else if (currentExercise.type === 'fill_blank' || currentExercise.type === 'error_hunt') {
      const answers = Array.isArray(currentExercise.correctAnswer)
        ? currentExercise.correctAnswer
        : [currentExercise.correctAnswer];
      correct = answers.some(
        (ans) => ans.toString().trim().toLowerCase() === fillBlankInput.trim().toLowerCase()
      );
    } else if (currentExercise.type === 'sentence_scramble') {
      const formed = scrambleWords.join(' ').trim().toLowerCase();
      const target = (currentExercise.correctAnswer as string).trim().toLowerCase();
      correct = formed === target;
    } else if (currentExercise.type === 'arabic_to_english') {
      const answers = Array.isArray(currentExercise.correctAnswer)
        ? currentExercise.correctAnswer
        : [currentExercise.correctAnswer];
      correct = answers.some(
        (ans) => ans.toString().trim().toLowerCase() === fillBlankInput.trim().toLowerCase()
      );
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      playSuccess(progress.soundEffectsEnabled);
    } else {
      playError(progress.soundEffectsEnabled);
      recordPersonalMistake({
        original: fillBlankInput || scrambleWords.join(' ') || `Option ${selectedAnswer}`,
        corrected: Array.isArray(currentExercise.correctAnswer)
          ? currentExercise.correctAnswer[0]
          : String(currentExercise.correctAnswer),
        errorTypeAr: currentExercise.instructionAr,
        explanationAr: currentExercise.explanationAr,
        source: lesson.titleAr,
      });
    }
  };

  const handleNextExercise = () => {
    playClick(progress.soundEffectsEnabled);
    if (currentExerciseIndex < exercises.length - 1) {
      const nextIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIdx);
      resetExerciseState(nextIdx);
    } else {
      setExercisesCompleted(true);
      markLessonComplete(lesson.id, 35);
    }
  };

  const progressPercent = Math.round(((currentExerciseIndex + 1) / Math.max(1, exercises.length)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        dir="rtl"
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Duolingo Quiz Header Bar */}
        <div className="p-4 sm:p-5 border-b-2 border-[#e5e5e5] dark:border-[#37464f] flex items-center justify-between gap-4 shrink-0 bg-white dark:bg-[#131f24]">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#afafaf] hover:text-[#4b4b4b] dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Duolingo Top Green Juice Progress Bar */}
          <div className="flex-1 max-w-md h-4 rounded-full bg-[#e5e5e5] dark:bg-[#37464f] overflow-hidden p-0.5">
            <div
              className="h-full bg-[#58cc02] rounded-full transition-all duration-300 relative shadow-inner"
              style={{
                width: activeTab === 'content' ? '20%' : `${progressPercent}%`,
              }}
            >
              {/* Highlight gleam on juice bar */}
              <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/35 rounded-full" />
            </div>
          </div>

          {/* Infinite Heart */}
          <div className="flex items-center gap-1 text-[#ff4b4b] font-black text-sm">
            <Heart className="w-5 h-5 fill-[#ff4b4b]" />
            <span className="font-en">∞</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'content' ? (
            <>
              {/* Lesson Title Banner */}
              <div className="space-y-1 text-right">
                <span className="text-[11px] font-black uppercase text-[#58cc02] font-en">
                  {lesson.level} • {lesson.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#4b4b4b] dark:text-[#f7f7f7]">
                  {lesson.titleAr}
                </h2>
                <p className="font-en text-xs text-[#afafaf] font-black">
                  {lesson.titleEn}
                </p>
              </div>

              {/* Special shortcut for Alphabet Phonics */}
              {lesson.id === 'lesson-a0-0-alphabet-and-phonics' && onOpenPhonicsStudio && (
                <div className="p-4 rounded-2xl bg-[#1cb0f6] text-white border-b-4 border-[#1899d6] flex items-center justify-between gap-3 shadow-sm">
                  <div className="space-y-0.5 text-right">
                    <h4 className="font-black text-sm">استوديو مخارج الحروف التفاعلي (26 حرفاً)</h4>
                    <p className="text-xs text-[#e5f6ff]">
                      انتقل لمختبر الحروف التفاعلي مع تشريح المخارج والنطق الصوتي المباشر.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPhonicsStudio();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white text-[#1cb0f6] text-xs font-black hover:bg-[#f7f7f7] active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    فتح الاستوديو
                  </button>
                </div>
              )}

              {/* Explanation Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-[#e5e5e5] dark:border-[#37464f] text-xs sm:text-sm text-[#4b4b4b] dark:text-[#f7f7f7] leading-relaxed font-sans whitespace-pre-line text-right">
                {lesson.explanationMarkdownAr}
              </div>

              {/* Arabic Contrast Point (Crucial for Arab learners) */}
              {lesson.arabicContrastPoint && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#fff4e5] dark:bg-[#392415] border-2 border-b-4 border-[#ff9600] border-b-[#e58500] space-y-2 text-right">
                  <div className="flex items-center gap-2 text-[#ff9600] font-black text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{lesson.arabicContrastPoint.titleAr}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4b4b4b] dark:text-[#f7f7f7] leading-relaxed font-medium">
                    {lesson.arabicContrastPoint.descriptionAr}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#202f36] border-2 border-[#ff4b4b]/40 text-[#ff4b4b]">
                      <span className="text-[11px] font-black block">❌ خطأ شائع:</span>
                      <span className="font-en text-xs sm:text-sm font-bold">{lesson.arabicContrastPoint.badArabicHabit}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#202f36] border-2 border-[#58cc02]/40 text-[#58cc02]">
                      <span className="text-[11px] font-black block">✅ الصياغة الطبيعية:</span>
                      <span className="font-en text-xs sm:text-sm font-bold">{lesson.arabicContrastPoint.correctEnglishWay}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Examples with Duolingo Blue Audio Buttons */}
              {lesson.examples && lesson.examples.length > 0 && (
                <div className="space-y-3 text-right">
                  <h4 className="text-sm font-black text-[#4b4b4b] dark:text-[#f7f7f7] flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#1cb0f6]" />
                    <span>أمثلة ناطقة مع تفصيل النطق:</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {lesson.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 text-right flex-1">
                          <p className="font-en font-black text-[#4b4b4b] dark:text-[#f7f7f7] text-sm sm:text-base">
                            {ex.en}
                          </p>
                          <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
                            {ex.ar}
                          </p>
                          {ex.phoneticAr && (
                            <p className="text-[11px] font-black text-[#58cc02]">
                              ({ex.phoneticAr})
                            </p>
                          )}
                        </div>
                        <AudioButton textToSpeak={ex.en} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Duolingo Exercise Screen */
            <div className="space-y-6">
              {exercisesCompleted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#58cc02] border-4 border-b-8 border-[#46a302] flex items-center justify-center text-white">
                    <CheckCircle className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-[#58cc02]">
                    مكتمل 100%! رائع جداً
                  </h3>
                  <p className="text-xs sm:text-sm text-[#777777] dark:text-[#afafaf] max-w-sm mx-auto font-bold">
                    لقد أجبت بشكل صحيح وحصدت +35 نقطة خبرة XP وأضفتها لسجلك!
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleStartExercises}
                      className="px-4 py-2.5 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-xs font-black cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة التمارين</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white border-b-4 border-[#46a302] text-xs font-black cursor-pointer shadow-sm"
                    >
                      متابعة التعلم
                    </button>
                  </div>
                </div>
              ) : currentExercise ? (
                <div className="space-y-6">
                  {/* Mascot Speech Bubble Question Box */}
                  <div className="flex items-start gap-3 justify-end text-right">
                    <div className="relative p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] max-w-lg space-y-2">
                      <span className="text-[11px] font-black text-[#afafaf] block">
                        {currentExercise.instructionAr}
                      </span>
                      <h3 className="font-en font-black text-lg sm:text-xl text-[#4b4b4b] dark:text-[#f7f7f7]">
                        {currentExercise.question}
                      </h3>
                      <div className="absolute top-5 -right-2.5 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-[#cecece] dark:border-l-[#37464f]" />
                      <div className="absolute top-5 -right-2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-white dark:border-l-[#202f36]" />
                    </div>
                    <FaresMascot size="sm" mood="happy" className="shrink-0 mt-1" />
                  </div>

                  {/* Multiple Choice Tiles */}
                  {currentExercise.type === 'multiple_choice' && currentExercise.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentExercise.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswer === optIdx;
                        let optionStyle =
                          'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] text-[#4b4b4b] dark:text-[#f7f7f7] hover:bg-[#f7f7f7]';

                        if (isAnswerChecked) {
                          if (optIdx === currentExercise.correctAnswer) {
                            optionStyle =
                              'bg-[#d7ffb8] dark:bg-[#1a3818] border-[#58cc02] border-b-[#46a302] text-[#46a302] dark:text-[#d7ffb8] font-black';
                          } else if (isSelected) {
                            optionStyle =
                              'bg-[#ffdfe0] dark:bg-[#381616] border-[#ff4b4b] border-b-[#ea2b2b] text-[#ea2b2b] font-black';
                          }
                        } else if (isSelected) {
                          optionStyle =
                            'bg-[#ddf4ff] dark:bg-[#183648] border-[#1cb0f6] border-b-[#1899d6] text-[#1cb0f6] ring-2 ring-[#1cb0f6]/30';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isAnswerChecked}
                            onClick={() => {
                              playClick(progress.soundEffectsEnabled);
                              setSelectedAnswer(optIdx);
                            }}
                            className={`p-4 rounded-2xl border-2 border-b-4 text-start font-en text-sm sm:text-base font-black transition-all cursor-pointer ${optionStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Sentence Scramble */}
                  {currentExercise.type === 'sentence_scramble' && (
                    <div className="space-y-4">
                      <div className="min-h-16 p-3 rounded-2xl border-2 border-dashed border-[#e5e5e5] dark:border-[#37464f] flex flex-wrap gap-2 items-center justify-start bg-[#f7f7f7] dark:bg-[#182329]">
                        {scrambleWords.length === 0 ? (
                          <span className="text-xs text-[#afafaf] font-black">
                            اضغط على الكلمات بالترتيب الصحيح...
                          </span>
                        ) : (
                          scrambleWords.map((word, wIdx) => (
                            <button
                              key={wIdx}
                              type="button"
                              onClick={() => handleScrambleWordClick(word)}
                              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#202f36] text-[#4b4b4b] dark:text-white font-en font-black text-sm border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                              {word}
                            </button>
                          ))
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {currentExercise.question.split('/').map((rawWord, rwIdx) => {
                          const clean = rawWord.trim();
                          const isUsed = scrambleWords.includes(clean);
                          return (
                            <button
                              key={rwIdx}
                              type="button"
                              disabled={isUsed || isAnswerChecked}
                              onClick={() => handleScrambleWordClick(clean)}
                              className={`px-3.5 py-2 rounded-xl border-2 border-b-4 font-en text-sm font-black transition-all cursor-pointer ${
                                isUsed
                                  ? 'opacity-25 border-[#e5e5e5] bg-[#e5e5e5]'
                                  : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-[#4b4b4b] dark:text-white hover:border-[#1cb0f6]'
                              }`}
                            >
                              {clean}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fill in Blank or Translation Input */}
                  {(currentExercise.type === 'fill_blank' ||
                    currentExercise.type === 'error_hunt' ||
                    currentExercise.type === 'arabic_to_english') && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        dir="ltr"
                        disabled={isAnswerChecked}
                        value={fillBlankInput}
                        onChange={(e) => setFillBlankInput(e.target.value)}
                        placeholder="Type in English..."
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-white dark:bg-[#202f36] font-en text-base font-black text-[#4b4b4b] dark:text-white focus:outline-none focus:border-[#58cc02]"
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Duolingo Classic Bottom Action Drawer */}
        <div
          className={`p-4 sm:p-5 border-t-2 transition-colors shrink-0 flex items-center justify-between gap-4 ${
            isAnswerChecked
              ? isCorrect
                ? 'bg-[#d7ffb8] dark:bg-[#18361b] border-[#58cc02]'
                : 'bg-[#ffdfe0] dark:bg-[#381616] border-[#ff4b4b]'
              : 'bg-white dark:bg-[#131f24] border-[#e5e5e5] dark:border-[#37464f]'
          }`}
        >
          {activeTab === 'content' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-xs font-black text-[#777777] dark:text-[#afafaf] cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handleStartExercises}
                className="px-8 py-3.5 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <span>ابدأ التمرين</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </>
          ) : !exercisesCompleted ? (
            <>
              {isAnswerChecked ? (
                <div className="flex items-center gap-3 text-right flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isCorrect ? 'bg-[#58cc02] text-white' : 'bg-[#ff4b4b] text-white'
                    }`}
                  >
                    {isCorrect ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span
                      className={`font-black text-base ${
                        isCorrect ? 'text-[#46a302] dark:text-[#58cc02]' : 'text-[#ea2b2b]'
                      }`}
                    >
                      {isCorrect ? 'أحسنت! إجابة صحيحة' : 'تحتاج لمراجعة:'}
                    </span>
                    <p className="text-xs text-[#4b4b4b] dark:text-[#f7f7f7] font-bold line-clamp-1">
                      {currentExercise?.explanationAr}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#afafaf] font-black hidden sm:block">
                  اختر الإجابة الصحيحة للمتابعة
                </div>
              )}

              {isAnswerChecked ? (
                <button
                  type="button"
                  onClick={handleNextExercise}
                  className={`px-8 py-3.5 rounded-2xl font-black text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md shrink-0 ${
                    isCorrect
                      ? 'bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302]'
                      : 'bg-[#ff4b4b] hover:bg-[#ea2b2b] text-white border-[#ea2b2b]'
                  }`}
                >
                  {currentExerciseIndex < exercises.length - 1 ? 'متابعة' : 'إنهاء'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    selectedAnswer === null &&
                    !fillBlankInput.trim() &&
                    scrambleWords.length === 0
                  }
                  onClick={handleCheckAnswer}
                  className="px-8 py-3.5 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] disabled:opacity-40 text-white font-black text-sm border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md shrink-0"
                >
                  تحقق
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-[#58cc02] text-white font-black text-sm border-b-4 border-[#46a302] cursor-pointer shadow-md"
            >
              متابعة الدروس
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
