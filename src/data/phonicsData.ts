import alphabetLettersJson from './alphabetLetters.json';
import phonicsDigraphsJson from './phonicsDigraphs.json';
import survivalPhrasesJson from './survivalPhrases.json';
import phonicsQuizJson from './phonicsQuiz.json';
import { AlphabetLetter, PhonicsDigraph, PhonicsQuizItem } from '../types';

export interface SurvivalPhraseCategory {
  id: string;
  titleAr: string;
  phrases: Array<{
    en: string;
    phoneticAr: string;
    ar: string;
  }>;
}

export const alphabetLetters: AlphabetLetter[] = alphabetLettersJson as AlphabetLetter[];
export const phonicsDigraphs: PhonicsDigraph[] = phonicsDigraphsJson as PhonicsDigraph[];
export const survivalPhrases: SurvivalPhraseCategory[] = survivalPhrasesJson as SurvivalPhraseCategory[];
export const phonicsQuizItems: PhonicsQuizItem[] = phonicsQuizJson as PhonicsQuizItem[];
