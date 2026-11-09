import lessonsJson from './lessons.json';
import cefrLevelsJson from './cefrLevels.json';
import promotionExamsRaw from './promotionExamsRaw.js';
import { CEFRLevel, Lesson, LevelMetadata } from '../types';

export interface PromotionExamQuestion {
  questionAr: string;
  questionEn?: string;
  options: string[];
  correctIndex: number;
}

export interface PromotionExam {
  level: CEFRLevel;
  nextLevel: CEFRLevel;
  titleAr: string;
  titleEn: string;
  passingScore: number;
  questions: PromotionExamQuestion[];
}

export const allLessons: Lesson[] = lessonsJson as unknown as Lesson[];

export const cefrLevels: LevelMetadata[] = [
  {
    id: 'A0',
    badge: 'A0 مبتدئ من الصفر',
    titleAr: 'تأسيس من الصفر - A0',
    descAr: 'الأبجدية الإنجليزية، مخارج الحروف، التمييز بين P و B، والأرقام والتحيات الأساسية.',
    chatDifficultyAr: 'جمل بسيطة وقصيرة (3-5 كلمات مع ترجمة فورية).',
    color: '#58cc02',
    border: '#46a302',
  },
  {
    id: 'A1',
    badge: 'A1 مبتدئ مكتسب',
    titleAr: 'المبتدئ المكتسب - A1',
    descAr: 'فعل الكينونة To Be، المضارع البسيط، أدوات النكرة a/an، والسؤال عن المعلومات اليومية.',
    chatDifficultyAr: 'جمل واضحة حول الروتين والحياة اليومية.',
    color: '#1cb0f6',
    border: '#1899d6',
  },
  {
    id: 'A2',
    badge: 'A2 ابتدائي',
    titleAr: 'المستوى الابتدائي - A2',
    descAr: 'الماضي البسيط والأفعال الشاذة، حروف الجر in/on/at، وصيغ المقارنة والمستقبل.',
    chatDifficultyAr: 'محادثة ممتدة حول المواقف الحياتية والعمل.',
    color: '#ff9600',
    border: '#e58500',
  },
  {
    id: 'B1',
    badge: 'B1 متوسط',
    titleAr: 'المستوى المتوسط - B1',
    descAr: 'المضارع التام، الماضي المستمر، الشروط، الأفعال المركبة، والمبني للمجهول.',
    chatDifficultyAr: 'محادثات متقدمة في بيئة العمل والنقاشات المهنية.',
    color: '#ce82ff',
    border: '#b85eff',
  },
  {
    id: 'B2',
    badge: 'B2 فوق المتوسط',
    titleAr: 'فوق المتوسط - B2',
    descAr: 'الماضي التام، الشرطية الثالثة، الكلام المنقول، وجمل الوصل المتقدمة وتجنب الضمير العائد.',
    chatDifficultyAr: 'نقاشات معمقة ومفاوضات باللغة الإنجليزية المتخصصة.',
    color: '#ff4b4b',
    border: '#e03b3b',
  },
  {
    id: 'C1',
    badge: 'C1 متقدم واحترافي',
    titleAr: 'المستوى المتقدم - C1',
    descAr: 'القلب النحوي البلاغي (Inversion)، صيغة Subjunctive، والدبلوماسية اللغوية والتحفظ الأكاديمي.',
    chatDifficultyAr: 'لغة أكاديمية واحترافية رصينة ومفردات اصطلاحية متقدمة.',
    color: '#00cd9c',
    border: '#00a880',
  },
  {
    id: 'C2',
    badge: 'C2 طلاقة مطلقة وإتقان',
    titleAr: 'إتقان تام وطلاقة مطلقة - C2',
    descAr: 'البلاغة الرفيعة، توازن الجمل المتوازية، التعبيرات المجازية العميقة، ونثر النخبة العالمية.',
    chatDifficultyAr: 'أسلوب راقٍ شبيه بالمتحدث الأصلي المثقف والنخبوي.',
    color: '#f59e0b',
    border: '#d97706',
  },
];

export const promotionExams: PromotionExam[] = promotionExamsRaw as unknown as PromotionExam[];

export function getLessonsByLevel(level: CEFRLevel): Lesson[] {
  return allLessons.filter((l) => l.level === level);
}

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

export function getExamByLevel(level: CEFRLevel): PromotionExam | undefined {
  return promotionExams.find((e) => e.level === level);
}

export function getNextLessonId(completedIds: string[], targetLevel?: CEFRLevel): string {
  const filtered = targetLevel ? allLessons.filter((l) => l.level === targetLevel) : allLessons;
  const next = filtered.find((l) => !completedIds.includes(l.id));
  return next ? next.id : filtered[0]?.id || allLessons[0].id;
}
