import React, { useState } from 'react';
import { Volume2, Sparkles, Check, X, HelpCircle, Layers, MessageSquare } from 'lucide-react';
import { alphabetLetters, phonicsDigraphs, survivalPhrases, phonicsQuizItems } from '../../data/phonicsData';
import { AudioButton } from '../common/AudioButton';
import { playClick, playError, playSuccess, speakText } from '../../utils/audio';
import { useLearner } from '../../context/LearnerContext';

export const AlphabetPhonicsStudio: React.FC = () => {
  const { progress } = useLearner();
  const [subTab, setSubTab] = useState<'letters' | 'digraphs' | 'survival' | 'quiz'>('letters');
  const [vowelOnly, setVowelOnly] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const filteredLetters = vowelOnly ? alphabetLetters.filter((l) => l.isVowel) : alphabetLetters;

  const handleQuizAnswer = (qId: string, optIdx: number, correctIdx: number) => {
    if (quizAnswers[qId] !== undefined) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    if (optIdx === correctIdx) {
      playSuccess(progress.soundEffectsEnabled);
    } else {
      playError(progress.soundEffectsEnabled);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2">
            <span className="font-en text-xs font-black px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
              A0 Phonetics
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              استوديو الصوتيات والأبجدية الإنجليزية
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            أتقن مخارج الحروف الإنجليزية، والتمييز بين اسم الحرف وصوته، والحروف المركبة والأزواج الدقيقة.
          </p>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => {
              playClick(progress.soundEffectsEnabled);
              setSubTab('letters');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'letters'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            الأبجدية (26 حرفاً)
          </button>
          <button
            type="button"
            onClick={() => {
              playClick(progress.soundEffectsEnabled);
              setSubTab('digraphs');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'digraphs'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            المقاطع المركبة (SH, CH, TH...)
          </button>
          <button
            type="button"
            onClick={() => {
              playClick(progress.soundEffectsEnabled);
              setSubTab('survival');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'survival'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            عبارات النجاة
          </button>
          <button
            type="button"
            onClick={() => {
              playClick(progress.soundEffectsEnabled);
              setSubTab('quiz');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            اختبار الصوتيات
          </button>
        </div>
      </div>

      {/* 1. Letters Tab */}
      {subTab === 'letters' && (
        <div className="space-y-4">
          {/* Vowel Filter Button */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500">
              عرض {filteredLetters.length} حرفاً
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVowelOnly(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !vowelOnly
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                جميع الحروف (26)
              </button>
              <button
                type="button"
                onClick={() => setVowelOnly(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  vowelOnly
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                الحروف المتحركة (A, E, I, O, U)
              </button>
            </div>
          </div>

          {/* Letter Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLetters.map((l) => (
              <div
                key={l.upper}
                className="p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3.5 text-right transition-all hover:border-sky-300 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-en text-3xl font-black text-sky-600 dark:text-sky-400">
                        {l.upper} {l.lower}
                      </span>
                      {l.isVowel && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                          حرف متحرك Vowel
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      اسم الحرف: {l.nameAr}
                    </p>
                  </div>

                  <AudioButton textToSpeak={`${l.upper}. ${l.exampleWord}`} size="sm" />
                </div>

                {/* Example Word */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-en text-base font-black text-slate-900 dark:text-white">
                      {l.exampleWord}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      ({l.examplePhoneticAr})
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                    {l.exampleMeaningAr}
                  </span>
                </div>

                {/* Sound description and note */}
                <div className="text-xs space-y-1">
                  <p className="text-slate-600 dark:text-slate-300 font-semibold">
                    صوت الحرف في الكلمة:{' '}
                    <span className="font-bold text-slate-900 dark:text-white">{l.soundAr}</span>
                  </p>
                  {l.arabicNote && (
                    <p className="text-sky-700 dark:text-sky-300 text-[11px] font-medium leading-relaxed">
                      💡 {l.arabicNote}
                    </p>
                  )}
                </div>

                {/* Interactive Pronounce Buttons */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => speakText(l.upper)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-200 hover:text-sky-700 text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
                  >
                    نطق اسم الحرف
                  </button>
                  <button
                    type="button"
                    onClick={() => speakText(l.exampleWord)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-200 hover:text-sky-700 text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
                  >
                    نطق الكلمة الدالة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Digraphs Tab */}
      {subTab === 'digraphs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {phonicsDigraphs.map((dg) => (
            <div
              key={dg.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-right"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">{dg.titleAr}</span>
                <div className="flex items-baseline gap-3">
                  <span className="font-en text-2xl font-black text-sky-600 dark:text-sky-400">
                    {dg.combination}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    = صوت ({dg.soundAr})
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {dg.explanationAr}
              </p>

              {/* Example words */}
              <div className="space-y-2 pt-1">
                {dg.examples.map((ex, i) => (
                  <div
                    key={i}
                    onClick={() => speakText(ex.word)}
                    className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3 cursor-pointer hover:border-sky-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <AudioButton textToSpeak={ex.word} size="sm" />
                      <span className="font-en font-black text-sm text-slate-900 dark:text-white">
                        {ex.word}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ({ex.phoneticAr})
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{ex.meaningAr}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Survival Phrases Tab */}
      {subTab === 'survival' && (
        <div className="space-y-6">
          {survivalPhrases.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-right"
            >
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                <span>{cat.titleAr}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.phrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-en font-black text-sm text-slate-900 dark:text-white">
                        {phrase.en}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {phrase.ar}
                      </p>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {phrase.phoneticAr}
                      </p>
                    </div>
                    <AudioButton textToSpeak={phrase.en} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Quiz Tab */}
      {subTab === 'quiz' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-right">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              اختبار الفهم الصوتي السريع (A0)
            </h3>
          </div>

          <div className="space-y-6">
            {phonicsQuizItems.map((q, idx) => {
              const selected = quizAnswers[q.id];
              const isAnswered = selected !== undefined;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {idx + 1}. {q.questionAr}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selected === optIdx;
                      const isCorrect = optIdx === q.correctIndex;

                      let btnStyle =
                        'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle =
                            'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (isSelected) {
                          btnStyle =
                            'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleQuizAnswer(q.id, optIdx, q.correctIndex)}
                          className={`p-3 rounded-xl border-2 text-start text-xs sm:text-sm font-bold flex items-center justify-between gap-2 transition cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && isCorrect && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <X className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 leading-relaxed font-medium">
                      💡 {q.explanationAr}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
