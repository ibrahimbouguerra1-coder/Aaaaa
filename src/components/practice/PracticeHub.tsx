import React, { useState, useEffect } from 'react';
import {
  Volume2,
  BookOpen,
  Sparkles,
  Layers,
  Mic,
  MicOff,
  FileText,
  Edit3,
  CheckCircle,
  RotateCcw,
  Search,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Headphones,
  PenTool,
  Send,
  Loader2,
  Repeat,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  vocabularyDecks,
  pronunciationPairs,
  sentenceChallenges,
  readingPassages,
  arabicMistakes,
  listeningSentences,
} from '../../data/practiceData';
import { AlphabetPhonicsStudio } from './AlphabetPhonicsStudio';
import { AudioButton } from '../common/AudioButton';
import { FaresMascot } from '../common/FaresMascot';
import { playClick, playError, playSuccess, speakText, stopSpeech } from '../../utils/audio';
import { useLearner } from '../../context/LearnerContext';
import { CEFRLevel, VocabularyWord, ListeningSentence } from '../../types';

export const PracticeHub: React.FC = () => {
  const { progress, markWordMastered, recordPersonalMistake } = useLearner();
  const [activeLab, setActiveLab] = useState<
    'vocabulary' | 'phonics' | 'pronunciation' | 'listening' | 'sentence' | 'reading' | 'writing'
  >('vocabulary');

  // ===================== 1. Vocabulary Lab State =====================
  const [vocabLevelFilter, setVocabLevelFilter] = useState<CEFRLevel | 'all' | 'due'>('all');
  const [vocabSearch, setVocabSearch] = useState('');
  const [flippedWords, setFlippedWords] = useState<Record<string, boolean>>({});

  // ===================== 2. Sentence Builder State =====================
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [sentenceChecked, setSentenceChecked] = useState(false);
  const [isSentenceCorrect, setIsSentenceCorrect] = useState(false);

  // ===================== 3. Reading Passage State =====================
  const [activePassageIndex, setActivePassageIndex] = useState(0);
  const [activeSentencePairIndex, setActiveSentencePairIndex] = useState<number | null>(null);
  const [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({});

  // ===================== 4. Listening Dictation Lab State =====================
  const [activeDictationIndex, setActiveDictationIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationWords, setDictationWords] = useState<string[]>([]);
  const [dictationChecked, setDictationChecked] = useState(false);
  const [isDictationCorrect, setIsDictationCorrect] = useState(false);

  // ===================== 5. Writing Coach State =====================
  const [writingTab, setWritingTab] = useState<'mistakes' | 'coach'>('mistakes');
  const [userWritingInput, setUserWritingInput] = useState('');
  const [writingTone, setWritingTone] = useState<'business' | 'casual' | 'academic'>('business');
  const [isAnalyzingWriting, setIsAnalyzingWriting] = useState(false);
  const [writingAnalysisResult, setWritingAnalysisResult] = useState<{
    improvedText: string;
    formalAlternative: string;
    casualAlternative: string;
    arabicExplanation: string;
    detectedMistakes: string[];
  } | null>(null);

  // ===================== 6. Pronunciation Test & Scoring State =====================
  const [listeningTargetWord, setListeningTargetWord] = useState<string | null>(null);
  const [pronounceScore, setPronounceScore] = useState<{
    word: string;
    result: 'correct' | 'near' | 'incorrect';
    spoken: string;
  } | null>(null);

  // Vocabulary aggregator
  const allVocabWords: VocabularyWord[] = React.useMemo(() => {
    const list: VocabularyWord[] = [];
    vocabularyDecks.forEach((deck) => {
      deck.items.forEach((item) => {
        list.push({ ...item, level: deck.level });
      });
    });
    return list;
  }, []);

  const filteredVocab = allVocabWords.filter((w) => {
    if (vocabLevelFilter === 'due') {
      const saved = progress.savedVocabulary.find(
        (v) => v.word.toLowerCase() === w.word.toLowerCase()
      );
      return saved ? !saved.mastered : true;
    }
    const matchesLevel = vocabLevelFilter === 'all' || w.level === vocabLevelFilter;
    const matchesSearch =
      !vocabSearch.trim() ||
      w.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      w.arabicMeaning.includes(vocabSearch);
    return matchesLevel && matchesSearch;
  });

  const currentSentence = sentenceChallenges[activeSentenceIndex];
  const currentPassage = readingPassages[activePassageIndex];
  const currentDictation = listeningSentences[activeDictationIndex] as ListeningSentence | undefined;

  // Handlers for Sentence Builder
  const handleTileClick = (word: string) => {
    playClick(progress.soundEffectsEnabled);
    if (assembledWords.includes(word)) {
      setAssembledWords(assembledWords.filter((w) => w !== word));
    } else {
      setAssembledWords([...assembledWords, word]);
    }
  };

  const handleCheckSentence = () => {
    if (!currentSentence || sentenceChecked) return;
    const formed = assembledWords.join(' ').trim().toLowerCase();
    const target = currentSentence.correctSentence.trim().toLowerCase();
    const correct = formed === target;

    setIsSentenceCorrect(correct);
    setSentenceChecked(true);

    if (correct) {
      playSuccess(progress.soundEffectsEnabled);
    } else {
      playError(progress.soundEffectsEnabled);
    }
  };

  const handleNextSentence = () => {
    playClick(progress.soundEffectsEnabled);
    const nextIdx = (activeSentenceIndex + 1) % sentenceChallenges.length;
    setActiveSentenceIndex(nextIdx);
    setAssembledWords([]);
    setSentenceChecked(false);
    setIsSentenceCorrect(false);
  };

  // Handlers for Listening Dictation
  const handleDictationWordClick = (word: string) => {
    playClick(progress.soundEffectsEnabled);
    if (dictationWords.includes(word)) {
      setDictationWords(dictationWords.filter((w) => w !== word));
    } else {
      setDictationWords([...dictationWords, word]);
    }
  };

  const handleCheckDictation = () => {
    if (!currentDictation || dictationChecked) return;
    const cleanStr = (s: string) => s.replace(/[.,?!]/g, '').trim().toLowerCase();
    const candidate = dictationInput.trim()
      ? cleanStr(dictationInput)
      : cleanStr(dictationWords.join(' '));
    const target = cleanStr(currentDictation.sentenceEn);
    const isOk = candidate === target;

    setIsDictationCorrect(isOk);
    setDictationChecked(true);

    if (isOk) {
      playSuccess(progress.soundEffectsEnabled);
    } else {
      playError(progress.soundEffectsEnabled);
    }
  };

  const handleNextDictation = () => {
    playClick(progress.soundEffectsEnabled);
    const nextIdx = (activeDictationIndex + 1) % listeningSentences.length;
    setActiveDictationIndex(nextIdx);
    setDictationInput('');
    setDictationWords([]);
    setDictationChecked(false);
    setIsDictationCorrect(false);
  };

  // Speech Recognition for Pronunciation Lab
  const handleTestPronunciation = (targetWord: string) => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('التعرف الصوتي غير مدعوم في متصفحك الحالي.');
      return;
    }

    stopSpeech();
    setListeningTargetWord(targetWord);
    setPronounceScore(null);
    playClick(progress.soundEffectsEnabled);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = progress.preferredAccent === 'UK' ? 'en-GB' : 'en-US';

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript.toLowerCase().trim();
      const target = targetWord.toLowerCase().trim();

      let result: 'correct' | 'near' | 'incorrect' = 'incorrect';
      if (spoken === target) {
        result = 'correct';
        playSuccess(progress.soundEffectsEnabled);
      } else if (spoken.includes(target) || target.includes(spoken)) {
        result = 'near';
        playClick(progress.soundEffectsEnabled);
      } else {
        result = 'incorrect';
        playError(progress.soundEffectsEnabled);
      }

      setPronounceScore({ word: targetWord, result, spoken });
      setListeningTargetWord(null);
    };

    recognition.onerror = () => {
      setListeningTargetWord(null);
    };

    recognition.onend = () => {
      setListeningTargetWord(null);
    };

    recognition.start();
  };

  // AI Writing Coach Submission
  const handleAnalyzeWriting = async () => {
    if (!userWritingInput.trim() || isAnalyzingWriting) return;
    playClick(progress.soundEffectsEnabled);
    setIsAnalyzingWriting(true);
    setWritingAnalysisResult(null);

    try {
      const res = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userWritingInput,
          tone: writingTone,
          userLevel: progress.estimatedLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWritingAnalysisResult(data);
        playSuccess(progress.soundEffectsEnabled);

        if (data.detectedMistakes && data.detectedMistakes.length > 0) {
          data.detectedMistakes.forEach((mistakeStr: string) => {
            recordPersonalMistake({
              original: userWritingInput,
              corrected: data.improvedText,
              errorTypeAr: 'مدرب الصياغة والكتابة',
              explanationAr: mistakeStr,
              source: 'مدرب الكتابة الذكي',
            });
          });
        }
      }
    } catch (err) {
      console.warn('Writing analysis error:', err);
    } finally {
      setIsAnalyzingWriting(false);
    }
  };

  const labsNav = [
    { id: 'vocabulary', title: 'بنك المفردات SRS', icon: Layers, color: '#58cc02' },
    { id: 'phonics', title: 'الأبجدية والصوتيات', icon: Volume2, color: '#1cb0f6' },
    { id: 'pronunciation', title: 'مخارج الحروف واللفظ', icon: Mic, color: '#ff9600' },
    { id: 'listening', title: 'الاستماع والإملاء', icon: Headphones, color: '#00cd9c' },
    { id: 'sentence', title: 'بناء الجمل التفاعلي', icon: Edit3, color: '#ce82ff' },
    { id: 'reading', title: 'القراءة والفهم', icon: FileText, color: '#10b981' },
    { id: 'writing', title: 'مدرب الكتابة والأخطاء', icon: PenTool, color: '#ff4b4b' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Skill Labs Navigation (Duolingo 3D Chunky Pills) */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {labsNav.map((lab) => {
            const Icon = lab.icon;
            const isSelected = activeLab === lab.id;

            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => {
                  playClick(progress.soundEffectsEnabled);
                  setActiveLab(lab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-b-4 transition-all cursor-pointer select-none text-xs font-black shadow-xs active:translate-y-1 active:border-b-2 ${
                  isSelected
                    ? 'bg-[#58cc02] text-white border-[#58cc02] border-b-[#46a302] translate-y-[-2px]'
                    : 'bg-white dark:bg-[#131f24] text-slate-800 dark:text-slate-200 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] hover:border-[#58cc02]/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: isSelected ? '#ffffff' : lab.color }} />
                <span>{lab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Alphabet & Phonics Lab */}
      {activeLab === 'phonics' && <AlphabetPhonicsStudio />}

      {/* 2. Vocabulary & Spaced Repetition (SRS) Lab */}
      {activeLab === 'vocabulary' && (
        <div className="space-y-5 text-right">
          {/* Filter & Search Bar (Duolingo Card) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="ابحث عن كلمة إنجليزية أو معنى..."
                value={vocabSearch}
                onChange={(e) => setVocabSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#58cc02]"
              />
              <Search className="w-4 h-4 text-[#afafaf] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  playClick(progress.soundEffectsEnabled);
                  setVocabLevelFilter('due');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 border-2 border-b-4 active:translate-y-0.5 active:border-b-2 ${
                  vocabLevelFilter === 'due'
                    ? 'bg-[#ff9600] border-[#ff9600] border-b-[#c77200] text-white shadow-xs'
                    : 'bg-[#fff4e5] dark:bg-[#392415] border-[#ff9600]/30 border-b-[#ff9600] text-[#ff9600]'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>مراجعة اليوم (SRS)</span>
              </button>

              {(['all', 'A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    playClick(progress.soundEffectsEnabled);
                    setVocabLevelFilter(lvl);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-en text-xs font-black transition cursor-pointer border-2 border-b-4 active:translate-y-0.5 active:border-b-2 ${
                    vocabLevelFilter === lvl
                      ? 'bg-[#58cc02] border-[#58cc02] border-b-[#46a302] text-white shadow-xs'
                      : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Vocabulary Flashcard Grid (Duolingo 3D Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocab.map((w, idx) => {
              const isFlipped = flippedWords[w.word] || false;
              const isMastered = progress.savedVocabulary.some(
                (v) => v.word.toLowerCase() === w.word.toLowerCase() && v.mastered
              );

              return (
                <div
                  key={idx}
                  className="p-5 rounded-3xl border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] bg-white dark:bg-[#131f24] shadow-xs space-y-4 flex flex-col justify-between transition-all hover:border-[#58cc02]"
                >
                  {/* Card Front */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-en text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6] border border-[#1cb0f6]/30">
                        {w.level}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <AudioButton textToSpeak={w.word} size="sm" />
                      </div>
                    </div>

                    <div
                      className="cursor-pointer"
                      onClick={() => setFlippedWords((prev) => ({ ...prev, [w.word]: !isFlipped }))}
                    >
                      <h4 className="font-en text-2xl font-black text-slate-900 dark:text-white">
                        {w.word}
                      </h4>
                      {w.ipa && (
                        <p className="font-en text-xs text-[#afafaf] font-bold">{w.ipa}</p>
                      )}
                      {w.arabicPhonetic && (
                        <p className="text-xs font-black text-[#1cb0f6] pt-0.5">
                          نطق بالعربية: ({w.arabicPhonetic})
                        </p>
                      )}
                    </div>

                    {/* Flipped or toggled meaning */}
                    <div className="p-3.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36]/70 border-2 border-[#e5e5e5] dark:border-[#37464f] text-xs sm:text-sm space-y-1">
                      <p className="font-black text-slate-900 dark:text-white">{w.arabicMeaning}</p>
                      {w.exampleEn && (
                        <p className="font-en text-xs text-[#777777] dark:text-[#afafaf] pt-1 font-bold">
                          "{w.exampleEn}"
                        </p>
                      )}
                    </div>

                    {w.arabicMistakeWarning && (
                      <p className="text-[11px] text-[#ff9600] font-black leading-relaxed bg-[#fff4e5] dark:bg-[#392415] p-3 rounded-2xl border border-[#ff9600]/40">
                        💡 {w.arabicMistakeWarning}
                      </p>
                    )}
                  </div>

                  {/* SRS Mastered Button (Duolingo 3D Button) */}
                  <div className="pt-2 border-t border-[#f0f0f0] dark:border-[#263137]">
                    <button
                      type="button"
                      onClick={() => markWordMastered(w.word, !isMastered)}
                      className={`w-full py-2.5 px-3 rounded-2xl border-2 border-b-4 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 select-none active:border-b-0 active:translate-y-1 ${
                        isMastered
                          ? 'bg-[#58cc02] border-[#58cc02] border-b-[#46a302] text-white shadow-xs'
                          : 'bg-[#f7f7f7] dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] text-slate-800 dark:text-slate-200 hover:border-[#58cc02]'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isMastered ? 'أتقنتها بنجاح ✓' : 'تحديد كمتقنة (+5 XP)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Pronunciation & Phonetics Pairs Lab */}
      {activeLab === 'pronunciation' && (
        <div className="space-y-6 text-right">
          {pronounceScore && (
            <div
              className={`p-4 rounded-3xl border-2 border-b-4 flex items-center justify-between gap-3 animate-in fade-in ${
                pronounceScore.result === 'correct'
                  ? 'bg-[#eefbe7] dark:bg-[#1a3818] border-[#58cc02] border-b-[#46a302] text-[#2d6600] dark:text-[#a5ff6b]'
                  : pronounceScore.result === 'near'
                  ? 'bg-[#fff4e5] dark:bg-[#392415] border-[#ff9600] border-b-[#c77200] text-[#7a4100] dark:text-[#ffd699]'
                  : 'bg-[#ffe6e6] dark:bg-[#381616] border-[#ff4b4b] border-b-[#c42b2b] text-[#8f1919] dark:text-[#ffa8a8]'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-black text-sm block">
                  {pronounceScore.result === 'correct'
                    ? '🎉 نطق دقيق 100%! مخرج الصوت ممتاز.'
                    : pronounceScore.result === 'near'
                    ? '👍 نطق قريب جداً، استمع مرة أخرى وحاول تمييز اندفاع الهواء.'
                    : '⚠️ النطق لم يتطابق مع الكلمة المستهدفة، استمع للمقارنة.'}
                </span>
                <p className="text-xs font-en font-black">
                  Target: {pronounceScore.word} | Heard: "{pronounceScore.spoken}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPronounceScore(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 font-black cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pronunciationPairs.map((pair) => (
              <div
                key={pair.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-xs space-y-4"
              >
                <div className="border-b border-[#f0f0f0] dark:border-[#263137] pb-3 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-en text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#fff4e5] dark:bg-[#392415] text-[#ff9600] border border-[#ff9600]/30">
                      {pair.phonemePair}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {pair.titleAr}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#777777] dark:text-[#afafaf] leading-relaxed font-bold">
                  {pair.summaryAr}
                </p>

                {/* Mouth & Tongue Position Guide */}
                <div className="p-3.5 rounded-2xl bg-[#e5f6ff] dark:bg-[#183648] border-2 border-[#1cb0f6] text-[#0f5478] dark:text-[#a0ddff] text-xs space-y-1 font-bold">
                  <span className="font-black block">👄 ميكانيكا الشفتين واللسان:</span>
                  <p className="leading-relaxed">{pair.mouthPositionAr}</p>
                </div>

                {/* Arabic speaker warning */}
                <div className="p-3 rounded-2xl bg-[#fff4e5] dark:bg-[#392415] border border-[#ff9600] text-[#7a4100] dark:text-[#ffd699] text-xs leading-relaxed font-black">
                  ⚠️ {pair.arabicTransferWarningAr}
                </div>

                {/* Audio Minimal Pairs with Mic Pronunciation Test */}
                <div className="space-y-2 pt-2 border-t border-[#f0f0f0] dark:border-[#263137]">
                  <span className="text-xs font-black text-[#afafaf] block">
                    أزواج المقارنة الصوتية مع اختبار نطقك بالميكروفون:
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {(pair.minimalPairs || pair.audioPairs || []).map((item, i) => {
                      const meaningA = item.meaningArA || item.meaningA || '';
                      const meaningB = item.meaningArB || item.meaningB || '';

                      return (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36]/60 border-2 border-[#e5e5e5] dark:border-[#37464f] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
                        >
                          {/* Word A */}
                          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                            <AudioButton textToSpeak={item.wordA} size="sm" />
                            <button
                              type="button"
                              onClick={() => handleTestPronunciation(item.wordA)}
                              className={`p-2 rounded-xl border-2 border-b-4 transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 ${
                                listeningTargetWord === item.wordA
                                  ? 'bg-[#ff4b4b] border-[#c42b2b] text-white animate-bounce'
                                  : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-[#777777] hover:text-[#ff4b4b]'
                              }`}
                              title={`انطق كلمة "${item.wordA}" لاختبار دقة مخارجك`}
                            >
                              <Mic className="w-3.5 h-3.5" />
                            </button>
                            <div>
                              <span className="font-en font-black text-sm text-slate-900 dark:text-white block">
                                {item.wordA}
                              </span>
                              <span className="text-[#afafaf] font-black text-[11px]">{meaningA}</span>
                            </div>
                          </div>

                          <span className="text-[#afafaf] font-black px-2">vs</span>

                          {/* Word B */}
                          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto justify-end">
                            <div className="text-left">
                              <span className="font-en font-black text-sm text-slate-900 dark:text-white block">
                                {item.wordB}
                              </span>
                              <span className="text-[#afafaf] font-black text-[11px]">{meaningB}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTestPronunciation(item.wordB)}
                              className={`p-2 rounded-xl border-2 border-b-4 transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 ${
                                listeningTargetWord === item.wordB
                                  ? 'bg-[#ff4b4b] border-[#c42b2b] text-white animate-bounce'
                                  : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-[#777777] hover:text-[#ff4b4b]'
                              }`}
                              title={`انطق كلمة "${item.wordB}" لاختبار دقة مخارجك`}
                            >
                              <Mic className="w-3.5 h-3.5" />
                            </button>
                            <AudioButton textToSpeak={item.wordB} size="sm" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Listening & Dictation Lab (Duolingo Style Runner) */}
      {activeLab === 'listening' && currentDictation && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-sm space-y-6 text-right">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-[#263137] pb-3">
            <span className="font-en text-xs font-black px-3 py-1 rounded-xl bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6] border border-[#1cb0f6]/30">
              {currentDictation.level} Dictation
            </span>
            <span className="text-xs text-[#afafaf] font-black">
              تمرين {activeDictationIndex + 1} من {listeningSentences.length}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              استمع للجملة واكتبها أو رتب بنك كلماتها:
            </h3>
            <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
              تلميح نحوي: {currentDictation.hintAr}
            </p>
          </div>

          {/* Big Duolingo Audio Button */}
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-[#e5f6ff]/40 dark:bg-[#183648]/40 border-2 border-[#1cb0f6] space-y-3">
            <AudioButton textToSpeak={currentDictation.sentenceEn} size="lg" />
            <span className="text-xs font-black text-[#1cb0f6] pt-1">
              اضغط للاستماع بالسرعة الطبيعية
            </span>
            <button
              type="button"
              onClick={() => speakText(currentDictation.sentenceEn, { rate: 0.65 })}
              className="text-xs font-black text-[#777777] dark:text-[#afafaf] hover:text-[#1cb0f6] cursor-pointer"
            >
              🐢 استماع ببطء (Slow Speed)
            </button>
          </div>

          {/* User Input or Click Tiles */}
          <div className="space-y-4">
            <input
              type="text"
              dir="ltr"
              disabled={dictationChecked}
              value={dictationInput}
              onChange={(e) => setDictationInput(e.target.value)}
              placeholder="اكتب ما سمعته بالإنجليزية هنا أو اضغط الكلمات بالأسفل..."
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-white dark:bg-[#202f36] font-en text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#1cb0f6]"
            />

            {/* Word Tiles from wordsBank */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(currentDictation.wordsBank || []).map((word, wIdx) => {
                const isSelected = dictationWords.includes(word);
                return (
                  <button
                    key={wIdx}
                    type="button"
                    disabled={isSelected || dictationChecked}
                    onClick={() => handleDictationWordClick(word)}
                    className={`px-4 py-2.5 rounded-2xl border-2 border-b-4 font-en text-xs font-black transition-all cursor-pointer active:translate-y-1 active:border-b-2 ${
                      isSelected
                        ? 'opacity-30 border-[#e5e5e5] bg-[#f7f7f7] dark:bg-[#202f36]'
                        : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] hover:border-[#1cb0f6]'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {dictationChecked && (
            <div
              className={`p-4 rounded-2xl border-2 border-b-4 space-y-2 animate-in fade-in ${
                isDictationCorrect
                  ? 'bg-[#eefbe7] dark:bg-[#1a3818] border-[#58cc02] border-b-[#46a302] text-[#2d6600] dark:text-[#a5ff6b]'
                  : 'bg-[#ffe6e6] dark:bg-[#381616] border-[#ff4b4b] border-b-[#c42b2b] text-[#8f1919] dark:text-[#ffa8a8]'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm">
                {isDictationCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-[#58cc02]" />
                    <span>إملاء دقيق وممتاز! 🎉</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-[#ff4b4b]" />
                    <span>تحتاج لمراجعة الإملاء:</span>
                  </>
                )}
              </div>
              <div className="space-y-1 pt-1 font-en text-sm">
                <p className="font-black text-[#58cc02] dark:text-[#79db14]">
                  {currentDictation.sentenceEn}
                </p>
                <p className="font-sans text-xs text-[#777777] dark:text-[#afafaf] font-bold">
                  الترجمة: {currentDictation.translationAr} ({currentDictation.phoneticAr})
                </p>
              </div>
            </div>
          )}

          {/* Action Button (Duolingo 3D Button) */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setDictationInput('');
                setDictationWords([]);
                setDictationChecked(false);
              }}
              className="px-4 py-2.5 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-xs font-black text-[#777777] dark:text-[#afafaf] cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 active:border-b-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة</span>
            </button>

            {dictationChecked ? (
              <button
                type="button"
                onClick={handleNextDictation}
                className="px-8 py-3.5 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] text-white font-black text-sm border-2 border-b-4 border-[#46a302] cursor-pointer shadow-md active:translate-y-1 active:border-b-0"
              >
                الجملة التالية
              </button>
            ) : (
              <button
                type="button"
                disabled={!dictationInput.trim() && dictationWords.length === 0}
                onClick={handleCheckDictation}
                className="px-8 py-3.5 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] disabled:opacity-40 text-white font-black text-sm border-2 border-b-4 border-[#46a302] cursor-pointer shadow-md active:translate-y-1 active:border-b-0"
              >
                تحقق من الإملاء
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Sentence Builder Lab (Iconic Duolingo Puzzle) */}
      {activeLab === 'sentence' && currentSentence && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-sm space-y-6 text-right">
          <div className="flex items-center justify-between">
            <span className="font-en text-xs font-black px-3 py-1 rounded-xl bg-[#f2e6ff] dark:bg-[#2c1b3f] text-[#ce82ff] border border-[#ce82ff]/30">
              {currentSentence.level} Challenge
            </span>
            <span className="text-xs text-[#afafaf] font-black">
              تحدي {activeSentenceIndex + 1} من {sentenceChallenges.length}
            </span>
          </div>

          {/* Mascot Prompt */}
          <div className="flex items-start gap-4">
            <FaresMascot size="sm" mood="happy" className="shrink-0 mt-1" />
            <div className="p-4 rounded-3xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] space-y-1 flex-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {currentSentence.promptAr}
              </h3>
              <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
                قاعدة التركيز: {currentSentence.grammarFocusAr}
              </p>
            </div>
          </div>

          {/* Drop & Assembled Word Slot Area */}
          <div className="min-h-20 p-4 rounded-3xl border-2 border-dashed border-[#cecece] dark:border-[#37464f] bg-[#fafafa] dark:bg-[#0e161a] flex flex-wrap gap-2.5 items-center justify-start">
            {assembledWords.length === 0 ? (
              <span className="text-xs text-[#afafaf] font-black px-2">
                اضغط على الكلمات بالأسفل لتكوين الجملة الإنجليزية بالترتيب الصحيح...
              </span>
            ) : (
              assembledWords.map((word, wIdx) => (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => handleTileClick(word)}
                  className="px-4 py-2.5 rounded-2xl bg-[#1cb0f6] text-white font-en font-black text-sm border-2 border-b-4 border-[#1482b7] active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {word}
                </button>
              ))
            )}
          </div>

          {/* Word Tiles Bank (Duolingo Style Tiles) */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {(currentSentence.wordTiles || []).map((tile, tIdx) => {
              const isUsed = assembledWords.includes(tile);
              return (
                <button
                  key={tIdx}
                  type="button"
                  disabled={isUsed || sentenceChecked}
                  onClick={() => handleTileClick(tile)}
                  className={`px-4 py-2.5 rounded-2xl border-2 border-b-4 font-en text-sm font-black transition-all cursor-pointer select-none active:translate-y-1 active:border-b-2 ${
                    isUsed
                      ? 'opacity-25 border-[#e5e5e5] bg-[#e5e5e5] text-transparent'
                      : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] text-slate-900 dark:text-white hover:bg-[#f7f7f7]'
                  }`}
                >
                  {tile}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {sentenceChecked && (
            <div
              className={`p-4 rounded-2xl border-2 border-b-4 space-y-2 animate-in fade-in ${
                isSentenceCorrect
                  ? 'bg-[#eefbe7] dark:bg-[#1a3818] border-[#58cc02] border-b-[#46a302] text-[#2d6600] dark:text-[#a5ff6b]'
                  : 'bg-[#ffe6e6] dark:bg-[#381616] border-[#ff4b4b] border-b-[#c42b2b] text-[#8f1919] dark:text-[#ffa8a8]'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm">
                {isSentenceCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-[#58cc02]" />
                    <span>ترتيب متقن وجملة صحيحة! 🎉</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-[#ff4b4b]" />
                    <span>الجملة تحتاج إعادة ترتيب:</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed font-bold">{currentSentence.explanationAr}</p>
              <div className="flex items-center gap-2 pt-1 font-en font-black text-sm">
                <span>الصيغة السليمة:</span>
                <span className="text-[#58cc02]">{currentSentence.correctSentence}</span>
                <AudioButton textToSpeak={currentSentence.correctSentence} size="sm" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setAssembledWords([]);
                setSentenceChecked(false);
              }}
              className="px-4 py-2.5 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-xs font-black text-[#777777] dark:text-[#afafaf] cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 active:border-b-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>

            {sentenceChecked ? (
              <button
                type="button"
                onClick={handleNextSentence}
                className="px-8 py-3.5 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] text-white font-black text-sm border-2 border-b-4 border-[#46a302] cursor-pointer shadow-md active:translate-y-1 active:border-b-0"
              >
                التحدي التالي
              </button>
            ) : (
              <button
                type="button"
                disabled={assembledWords.length === 0}
                onClick={handleCheckSentence}
                className="px-8 py-3.5 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] disabled:opacity-40 text-white font-black text-sm border-2 border-b-4 border-[#46a302] cursor-pointer shadow-md active:translate-y-1 active:border-b-0"
              >
                تحقق من الترتيب
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Reading & Listening Comprehension Lab */}
      {activeLab === 'reading' && currentPassage && (
        <div className="max-w-3xl mx-auto space-y-6 text-right">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-[#263137] pb-3">
              <span className="font-en text-xs font-black px-3 py-1 rounded-xl bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6] border border-[#1cb0f6]/30">
                {currentPassage.level} • {currentPassage.topic}
              </span>
              <AudioButton textToSpeak={currentPassage.textEn} size="sm" title="استمع للنص كاملاً" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {currentPassage.titleAr} ({currentPassage.titleEn})
              </h3>
              <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
                اضغط على أي جملة بالإنجليزية للاستماع لنطقها وعرض ترجمتها الفورية بالعربية.
              </p>
            </div>

            {/* Interactive Sentence Pairs */}
            <div className="space-y-3">
              {(currentPassage.sentencePairs && currentPassage.sentencePairs.length > 0) ? (
                currentPassage.sentencePairs.map((pair, pIdx) => {
                  const isSelected = activeSentencePairIndex === pIdx;
                  return (
                    <div
                      key={pIdx}
                      onClick={() => {
                        playClick(progress.soundEffectsEnabled);
                        setActiveSentencePairIndex(isSelected ? null : pIdx);
                        speakText(pair.en);
                      }}
                      className={`p-4 rounded-2xl border-2 border-b-4 transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 ${
                        isSelected
                          ? 'bg-[#e5f6ff] dark:bg-[#183648] border-[#1cb0f6] border-b-[#1482b7]'
                          : 'bg-[#f7f7f7] dark:bg-[#202f36]/60 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] hover:border-[#1cb0f6]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-en text-base font-black text-slate-900 dark:text-white">
                          {pair.en}
                        </p>
                        <AudioButton textToSpeak={pair.en} size="sm" />
                      </div>
                      {isSelected && (
                        <p className="text-xs sm:text-sm font-black text-[#1cb0f6] pt-2 border-t border-[#1cb0f6]/30 animate-in fade-in">
                          {pair.ar}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36]/60 border-2 border-[#e5e5e5] dark:border-[#37464f] space-y-3">
                  <p className="font-en text-base font-black text-slate-900 dark:text-white leading-relaxed">
                    {currentPassage.textEn}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#777777] dark:text-[#afafaf] pt-2 border-t border-[#e5e5e5] dark:border-[#37464f] leading-relaxed">
                    {currentPassage.translationAr}
                  </p>
                </div>
              )}
            </div>

            {/* Comprehension Questions */}
            {currentPassage.comprehensionQuestions && (
              <div className="space-y-4 pt-4 border-t border-[#f0f0f0] dark:border-[#263137]">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#58cc02]" />
                  <span>أسئلة الفهم والاستيعاب:</span>
                </h4>
                {currentPassage.comprehensionQuestions.map((q, qIdx) => {
                  const selectedOpt = readingAnswers[qIdx];
                  const isAnswered = selectedOpt !== undefined;

                  return (
                    <div
                      key={qIdx}
                      className="p-4 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36]/60 border-2 border-[#e5e5e5] dark:border-[#37464f] space-y-3"
                    >
                      <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {qIdx + 1}. {q.questionAr}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctIndex;
                          const isSelected = selectedOpt === oIdx;
                          let btnStyle =
                            'bg-white dark:bg-[#131f24] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-slate-800 dark:text-slate-200';
                          if (isAnswered) {
                            if (isCorrect) {
                              btnStyle =
                                'bg-[#eefbe7] dark:bg-[#1a3818] border-[#58cc02] border-b-[#46a302] text-[#2d6600] dark:text-[#a5ff6b] font-black';
                            } else if (isSelected) {
                              btnStyle =
                                'bg-[#ffe6e6] dark:bg-[#381616] border-[#ff4b4b] border-b-[#c42b2b] text-[#8f1919] dark:text-[#ffa8a8]';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => {
                                setReadingAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                                if (isCorrect) {
                                  playSuccess(progress.soundEffectsEnabled);
                                } else {
                                  playError(progress.soundEffectsEnabled);
                                }
                              }}
                              className={`p-3 rounded-2xl border-2 border-b-4 text-xs font-black text-start transition cursor-pointer active:translate-y-0.5 active:border-b-2 ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {isAnswered && (
                        <p className="text-[11px] text-[#777777] dark:text-[#afafaf] pt-1 border-t border-[#e5e5e5] dark:border-[#37464f] font-bold">
                          💡 {q.explanationAr}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Writing Coach & Arabic Speakers Mistakes Lab */}
      {activeLab === 'writing' && (
        <div className="space-y-6 text-right">
          {/* Sub-Tabs for Writing Lab */}
          <div className="flex p-1.5 bg-[#f7f7f7] dark:bg-[#131f24] rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] max-w-sm">
            <button
              type="button"
              onClick={() => {
                playClick(progress.soundEffectsEnabled);
                setWritingTab('mistakes');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                writingTab === 'mistakes'
                  ? 'bg-[#ff4b4b] text-white shadow-xs'
                  : 'text-[#777777] dark:text-[#afafaf] hover:text-slate-900'
              }`}
            >
              الأخطاء الشائعة للعرب
            </button>
            <button
              type="button"
              onClick={() => {
                playClick(progress.soundEffectsEnabled);
                setWritingTab('coach');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                writingTab === 'coach'
                  ? 'bg-[#58cc02] text-white shadow-xs'
                  : 'text-[#777777] dark:text-[#afafaf] hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>مدرب الكتابة الذكي</span>
            </button>
          </div>

          {writingTab === 'coach' ? (
            /* AI Writing Coach Tool */
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[#58cc02]" />
                  <span>مدرب الصياغة والبريد المهني الذكي</span>
                </h3>
                <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
                  الصق جملتك أو مسودة بريدك الإنجليزي، وسيقوم المحلل برصد أي تداخل لغوي عربي وترقية النص للأسلوب الطبيعي الأصيل.
                </p>
              </div>

              {/* Tone Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#afafaf]">نبرة الصياغة:</span>
                {(['business', 'casual', 'academic'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setWritingTone(t)}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border-2 border-b-4 transition cursor-pointer active:translate-y-0.5 active:border-b-2 ${
                      writingTone === t
                        ? 'bg-[#1cb0f6] border-[#1cb0f6] border-b-[#1482b7] text-white'
                        : 'bg-[#f7f7f7] dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-[#777777]'
                    }`}
                  >
                    {t === 'business' ? 'مهني / عمل' : t === 'casual' ? 'ودي / محادثة' : 'أكاديمي / رصين'}
                  </button>
                ))}
              </div>

              {/* Text Area */}
              <textarea
                dir="ltr"
                rows={4}
                value={userWritingInput}
                onChange={(e) => setUserWritingInput(e.target.value)}
                placeholder="Paste or type your English sentence here (e.g. 'I am agree with your proposal and I will send email in Friday')..."
                className="w-full p-4 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-[#f7f7f7] dark:bg-[#202f36] font-en text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#58cc02]"
              />

              <button
                type="button"
                disabled={!userWritingInput.trim() || isAnalyzingWriting}
                onClick={handleAnalyzeWriting}
                className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] disabled:opacity-40 text-white font-black text-sm border-2 border-b-4 border-[#46a302] cursor-pointer shadow-md flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0"
              >
                {isAnalyzingWriting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تحليل وترقية الصياغة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تحليل وترقية الصياغة فورياً</span>
                  </>
                )}
              </button>

              {/* Analysis Result */}
              {writingAnalysisResult && (
                <div className="space-y-4 pt-4 border-t border-[#f0f0f0] dark:border-[#263137] animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-[#eefbe7] dark:bg-[#1a3818] border-2 border-[#58cc02] space-y-1.5">
                    <span className="text-xs font-black text-[#58cc02] block">
                      ✨ الصياغة الطبيعية المطورة:
                    </span>
                    <p className="font-en text-base font-black text-slate-900 dark:text-white">
                      {writingAnalysisResult.improvedText}
                    </p>
                    <div className="pt-2">
                      <AudioButton textToSpeak={writingAnalysisResult.improvedText} size="sm" />
                    </div>
                  </div>

                  {writingAnalysisResult.formalAlternative && (
                    <div className="p-3.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-[#e5e5e5] dark:border-[#37464f] space-y-1">
                      <span className="text-[11px] font-black text-[#afafaf] block">بديل مهني رسمي:</span>
                      <p className="font-en text-xs font-black text-slate-800 dark:text-slate-200">
                        {writingAnalysisResult.formalAlternative}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#fff4e5] dark:bg-[#392415] border-2 border-[#ff9600] text-xs text-[#7a4100] dark:text-[#ffd699] space-y-2 font-bold">
                    <span className="font-black block">💡 توجيهات فارس اللغوية:</span>
                    <p className="leading-relaxed">{writingAnalysisResult.arabicExplanation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Common Mistakes Pre-made Guide */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {arabicMistakes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-[#263137] pb-2">
                    <span className="text-xs font-black text-[#ff4b4b] px-3 py-0.5 rounded-xl bg-[#ffe6e6] dark:bg-[#381616]">
                      {item.type}
                    </span>
                    <AudioButton textToSpeak={item.correct} size="sm" />
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-2xl bg-[#ffe6e6]/60 dark:bg-[#381616]/40 border border-[#ff4b4b]/30">
                      <span className="text-[11px] font-black text-[#ff4b4b] block">❌ خطأ شائع:</span>
                      <span className="font-en text-sm font-bold text-slate-900 dark:text-white">
                        {item.wrong}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#eefbe7]/60 dark:bg-[#1a3818]/40 border border-[#58cc02]/30">
                      <span className="text-[11px] font-black text-[#58cc02] block">✅ الصياغة الطبيعية:</span>
                      <span className="font-en text-sm font-black text-slate-900 dark:text-white">
                        {item.correct}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#777777] dark:text-[#afafaf] leading-relaxed font-bold">
                    {item.explanationAr}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
