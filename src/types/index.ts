export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LessonExample {
  en: string;
  ar: string;
  phoneticAr?: string;
  noteAr?: string;
}

export interface LessonVocabularyItem {
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  meaningAr: string;
  exampleEn?: string;
  exampleAr?: string;
}

export interface CommonMistake {
  wrong: string;
  correct: string;
  reasonAr: string;
}

export interface LessonExercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'sentence_scramble' | 'error_hunt' | 'arabic_to_english';
  instructionAr: string;
  instructionEn?: string;
  question: string;
  options?: string[];
  correctAnswer: number | string | string[];
  explanationAr: string;
}

export interface ArabicContrastPoint {
  titleAr: string;
  descriptionAr: string;
  badArabicHabit: string;
  correctEnglishWay: string;
}

export interface Lesson {
  id: string;
  level: CEFRLevel;
  order: number;
  chapterOrder: number;
  chapterTitleAr: string;
  chapterTitleEn: string;
  titleAr: string;
  titleEn: string;
  category: string;
  iconName?: string;
  estimatedMinutes: number;
  objectivesAr: string[];
  explanationMarkdownAr: string;
  quickTakeawayAr?: string;
  arabicContrastPoint?: ArabicContrastPoint;
  examples: LessonExample[];
  vocabulary?: LessonVocabularyItem[];
  commonMistakes?: CommonMistake[];
  realWorldChallengeAr?: string;
  exercises: LessonExercise[];
}

export interface VocabularyWord {
  id?: string;
  word: string;
  ipa?: string;
  arabicPhonetic?: string;
  partOfSpeech?: string;
  arabicMeaning: string;
  englishDefinition?: string;
  exampleEn?: string;
  exampleAr?: string;
  collocations?: string[];
  arabicMistakeWarning?: string;
  level: CEFRLevel;
  category?: string;
  mastered?: boolean;
  repetitions?: number;
  intervalDays?: number;
  easeFactor?: number;
  nextReviewDate?: string;
}

export interface VocabularyDeck {
  id: string;
  level: CEFRLevel;
  category: string;
  titleAr: string;
  descriptionAr: string;
  items: VocabularyWord[];
}

export interface PronunciationMinimalPairItem {
  wordA: string;
  wordB: string;
  ipaA?: string;
  ipaB?: string;
  meaningA?: string;
  meaningB?: string;
  meaningArA?: string;
  meaningArB?: string;
}

export interface PronunciationPair {
  id: string;
  titleAr: string;
  titleEn: string;
  phonemePair: string;
  summaryAr: string;
  mouthPositionAr: string;
  arabicTransferWarningAr: string;
  minimalPairs?: PronunciationMinimalPairItem[];
  audioPairs?: PronunciationMinimalPairItem[];
}

export interface ListeningSentence {
  id: string;
  level: CEFRLevel;
  sentenceEn: string;
  translationAr: string;
  phoneticAr: string;
  hintAr: string;
  wordsBank: string[];
}

export interface ReadingSentencePair {
  en: string;
  ar: string;
}

export interface ReadingQuestion {
  questionAr: string;
  options: string[];
  correctIndex: number;
  explanationAr: string;
}

export interface ReadingPassage {
  id: string;
  level: CEFRLevel;
  topic: string;
  titleAr: string;
  titleEn: string;
  textEn: string;
  translationAr: string;
  sentencePairs?: ReadingSentencePair[];
  comprehensionQuestions: ReadingQuestion[];
}

export interface SentenceChallenge {
  id: string;
  level: CEFRLevel;
  promptAr: string;
  grammarFocusAr: string;
  wordTiles: string[];
  correctSentence: string;
  explanationAr: string;
}

export interface ArabicMistakeItem {
  wrong: string;
  correct: string;
  type: string;
  explanationAr: string;
  whyArabsMakeIt?: string;
}

export interface AlphabetLetter {
  upper: string;
  lower: string;
  nameAr: string;
  soundAr: string;
  isVowel: boolean;
  exampleWord: string;
  examplePhoneticAr: string;
  exampleMeaningAr: string;
  arabicNote?: string;
}

export interface PhonicsDigraph {
  id: string;
  combination: string;
  soundAr: string;
  titleAr: string;
  explanationAr: string;
  examples: Array<{
    word: string;
    phoneticAr: string;
    meaningAr: string;
  }>;
}

export interface PhonicsQuizItem {
  id: string;
  questionAr: string;
  options: string[];
  correctIndex: number;
  explanationAr: string;
}

export interface PlacementQuestion {
  id: number;
  skill: string;
  level: CEFRLevel;
  questionAr: string;
  sentenceEn: string;
  options: string[];
  correctIndex: number;
}

export interface LevelMetadata {
  id: CEFRLevel;
  badge: string;
  titleAr: string;
  descAr: string;
  chatDifficultyAr?: string;
  color?: string;
  border?: string;
}

export interface MistakeItem {
  id: string;
  original: string;
  corrected: string;
  naturalAlternative?: string;
  errorTypeAr: string;
  explanationAr: string;
  source: string;
  createdAt: string;
}

export interface BadgeItem {
  id: string;
  titleAr: string;
  descriptionAr: string;
  unlockedAt: string;
}

export interface LearnerProgress {
  hasCompletedOnboarding: boolean;
  name: string;
  estimatedLevel: CEFRLevel;
  skills: {
    grammar: CEFRLevel;
    vocabulary: CEFRLevel;
    reading: CEFRLevel;
    listening: CEFRLevel;
    speaking: CEFRLevel;
    writing: CEFRLevel;
  };
  primaryGoal: 'fluent_speaking' | 'travel' | 'business_english' | 'academic' | 'ielts';
  dailyGoalMinutes: number;
  learningMode: 'arabic_assisted' | 'english_immersion';
  preferredAccent: 'US' | 'UK';
  activeFocusAreas: string[];
  arabicDialect: 'fusha' | 'egyptian' | 'gulf' | 'levantine' | 'north_african';
  industryInterests: string[];
  soundEffectsEnabled: boolean;
  theme: 'light' | 'dark';
  speechPace: number;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessonIds: string[];
  savedVocabulary: VocabularyWord[];
  todayMinutesSpent: number;
  personalMistakes: MistakeItem[];
  completedWorkoutsCount: number;
  badges: BadgeItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'fares';
  text: string;
  arabicTranslation?: string;
  coachingTipAr?: string;
  detectedError?: {
    original: string;
    corrected: string;
    explanationAr: string;
  };
  timestamp: string;
}

export interface AiScenario {
  id: string;
  titleAr: string;
  descAr: string;
  icon: string;
  initialMessageEn: string;
  initialMessageAr: string;
  systemPrompt: string;
  sampleReplies: string[];
}
