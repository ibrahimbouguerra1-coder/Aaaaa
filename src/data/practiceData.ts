import vocabularyDecksJson from './vocabularyDecks.json';
import pronunciationPairsJson from './pronunciationPairs.json';
import sentenceBuilderJson from './sentenceBuilder.json';
import readingPassagesJson from './readingPassages.json';
import arabicMistakesJson from './arabicMistakes.json';
import listeningSentencesJson from './listeningSentences.json';
import placementQuestionsJson from './placementQuestions.json';
import {
  VocabularyDeck,
  PronunciationPair,
  SentenceChallenge,
  ReadingPassage,
  ArabicMistakeItem,
  ListeningSentence,
  PlacementQuestion,
} from '../types';

export const vocabularyDecks: VocabularyDeck[] = vocabularyDecksJson as unknown as VocabularyDeck[];
export const pronunciationPairs: PronunciationPair[] = pronunciationPairsJson as unknown as PronunciationPair[];
export const sentenceChallenges: SentenceChallenge[] = sentenceBuilderJson as unknown as SentenceChallenge[];
export const readingPassages: ReadingPassage[] = readingPassagesJson as unknown as ReadingPassage[];
export const arabicMistakes: ArabicMistakeItem[] = arabicMistakesJson as unknown as ArabicMistakeItem[];
export const listeningSentences: ListeningSentence[] = listeningSentencesJson as unknown as ListeningSentence[];
export const placementQuestions: PlacementQuestion[] = placementQuestionsJson as unknown as PlacementQuestion[];
