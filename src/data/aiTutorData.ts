import { AiScenario } from '../types';

export interface MotherTongueRule {
  pattern: RegExp;
  errorTypeAr: string;
  correctedText: string;
  explanationAr: string;
  motherTongueInfluence: string;
  quickQuiz?: {
    questionAr: string;
    options: string[];
    correctIndex: number;
  };
}

export const MOTHER_TONGUE_RULES: MotherTongueRule[] = [
  {
    pattern: /\b(?:i\s+am|i'm)\s+agree\b/i,
    errorTypeAr: 'فعل الكينونة الزائد مع agree',
    correctedText: 'I agree',
    explanationAr: 'الفعل agree فعل صريح ولا يسبقه am. نقول I agree وليس I am agree.',
    motherTongueInfluence: 'في العربية الجملة الاسمية (أنا أوافق) تبدأ بضمير بلا فعل، فيُترجم أنا إلى I am.',
    quickQuiz: {
      questionAr: 'اختر الصيغة الصحيحة لقول "أنا أتفق معك":',
      options: ['I agree with you.', 'I am agree with you.', 'I agreeing with you.'],
      correctIndex: 0,
    },
  },
  {
    pattern: /\b(?:i|he|she|we|they)\s+have\s+\d+\s+years\b/i,
    errorTypeAr: 'استخدام have بدل be مع العمر',
    correctedText: 'I am ... years old',
    explanationAr: 'العمر في الإنجليزية يُذكر بفعل الكينونة (am / is / are) وليس فعل الملكية have.',
    motherTongueInfluence: 'في العربية نقول (عندي 25 سنة) أو (لدي)، فيظن المتعلم أنها have.',
    quickQuiz: {
      questionAr: 'اختر الطريقة الإنجليزية الصحيحة للتعبير عن العمر:',
      options: ['She is 25 years old.', 'She has 25 years.', 'She have 25 years old.'],
      correctIndex: 0,
    },
  },
  {
    pattern: /\bdidn't\s+(went|saw|ate|had|came|bought|wrote|took)\b/i,
    errorTypeAr: 'استخدام صيغة الماضي بعد didn\'t',
    correctedText: "didn't + المصدر (go, see, eat...)",
    explanationAr: "الأداة didn't تعبر عن الماضي بالفعل، لذا يعود الفعل بعدها لمصدره المجرد (Base Form).",
    motherTongueInfluence: 'في العربية نقول (ما ذهبَ) فنكرر صيغة الماضي ذهنياً.',
    quickQuiz: {
      questionAr: 'اختر النفي الصحيح في الماضي:',
      options: ["He didn't go to work yesterday.", "He didn't went to work yesterday."],
      correctIndex: 0,
    },
  },
  {
    pattern: /\bmarried\s+with\b/i,
    errorTypeAr: 'حرف الجر مع married',
    correctedText: 'married to',
    explanationAr: 'في الإنجليزية نقول married to شخص ما، ولا نستخدم with.',
    motherTongueInfluence: 'في العربية نقول "متزوج مع/من فلانه"، فنترجمها حرفياً إلى with.',
    quickQuiz: {
      questionAr: 'اختر حرف الجر الصحيح:',
      options: ['He is married to Sarah.', 'He is married with Sarah.'],
      correctIndex: 0,
    },
  },
  {
    pattern: /\b(?:open|close)\s+the\s+(?:light|lamp|tv|computer)\b/i,
    errorTypeAr: 'ترجمة فتح/إغلاق الأجهزة والكهرباء',
    correctedText: 'turn on / turn off',
    explanationAr: 'الأجهزة الكهربائية والأنوار تستخدم turn on / turn off أو switch on / off، وكلمة open مخصصة للأبواب والنوافذ والكتب.',
    motherTongueInfluence: 'في الدارجة العربية نقول (افتح النور / سكّر التلفزيون).',
  },
  {
    pattern: /\blisten\s+(?:the\s+)?(?:music|radio|teacher|podcast)\b/i,
    errorTypeAr: 'إغفال حرف الجر to بعد listen',
    correctedText: 'listen to',
    explanationAr: 'الفعل listen يحتاج دائماً إلى حرف الجر to عند الاستماع لشيء محدد.',
    motherTongueInfluence: 'في العربية نقول (استمع الموسيقا) كفعل متعدٍ مباشرة.',
  },
  {
    pattern: /\b(?:i\s+am|he\s+is|she\s+is)\s+(?:doctor|engineer|teacher|student)\b/i,
    errorTypeAr: 'إغفال أداة النكرة a / an قبل المهن',
    correctedText: 'a / an + المهنة',
    explanationAr: 'في الإنجليزية كل اسم مهنة مفرد معدود يجب أن يسبق بـ a أو an: I am a teacher.',
    motherTongueInfluence: 'في العربية نقول مباشرة: "أنا مهندس" دون أدوات نكرة.',
  },
];

export const AI_SCENARIOS: AiScenario[] = [
  {
    id: 'free_chat',
    titleAr: 'محادثة حرة ومفتوحة',
    descAr: 'تحدث مع مستر فارس في أي موضوع بالإنجليزية وتلقّ تصويباً فورياً لطيفاً',
    icon: 'MessageCircle',
    initialMessageEn: "Hello! I am Mr. Fares, your personal English coach. How are you feeling today? Tell me what you did or what you want to practice!",
    initialMessageAr: 'أهلاً بك! أنا مستر فارس، مدربك الخاص. كيف حالك اليوم؟ أخبرني عما فعلته اليوم أو ما ترغب بالتدرب عليه!',
    systemPrompt: `You are Mr. Fares (مستر فارس), an enthusiastic, warm, culturally attuned Master English Instructor who specializes in teaching native Arabic speakers. 
Your tone is encouraging, polite, concise, and pedagogical.
Speak natural, clear English suited to the user's level.
If the learner makes a grammar, preposition, or pronunciation mistake typical for Arabic speakers (like "I am agree", "married with", omitting "to be", confusing P and B), gently provide:
1. A warm conversational reply in natural English.
2. A short Arabic coaching note explaining the mistake, the Arabic interference reason, and the correct natural alternative.
Keep responses concise (2-4 sentences in English, 1-2 lines in Arabic if correcting).`,
    sampleReplies: [
      "Hello Mr. Fares! Today was a busy day at work.",
      "I want to practice speaking about my hobbies.",
      "Can you help me improve my vocabulary?",
    ],
  },
  {
    id: 'coffee_shop',
    titleAr: 'طلب قهوة ومأكولات في مقهى',
    descAr: 'تمثيل دور طلب المشروب، الحجم، نوع الحليب، والدفع في مقهى عالمي',
    icon: 'Coffee',
    initialMessageEn: "Hi there! Welcome to Coffee Central. What can I get started for you today?",
    initialMessageAr: 'مرحباً! أهلاً بك في مقهى كوفي سنترال. ماذا تحب أن أطلب لك اليوم؟',
    systemPrompt: `You are the friendly barista at an artisanal international coffee shop named Coffee Central.
Engage the user in a realistic ordering roleplay: ask about coffee size (small, medium, large), iced or hot, milk preferences (oat, almond, whole), and food pastries.
Correct any unnatural English or Arabic transfer habits gently with an Arabic tip.`,
    sampleReplies: [
      "I would like a medium iced latte with oat milk, please.",
      "Do you have fresh croissants today?",
      "How much is a cappuccino and a bottle of water?",
    ],
  },
  {
    id: 'job_interview',
    titleAr: 'مقابلة عمل مهنية بالإنجليزية',
    descAr: 'محاكاة مقابلة توظيف: التعريف بالخبرات، نقاط القوة، والمشاريع السابقة',
    icon: 'Briefcase',
    initialMessageEn: "Welcome! Thank you for coming in today. To start, could you please introduce yourself and walk me through your professional background?",
    initialMessageAr: 'أهلاً بك! شكراً لحضورك المقابلة اليوم. كبداية، هل يمكنك التفضل بالتعريف بنفسك وسرد خلفيتك المهنية باختصار؟',
    systemPrompt: `You are an executive hiring manager conducting a professional, respectful job interview in English.
Ask realistic interview questions one by one.
Guide the user to sound confident, articulate, and natural in business English.
If they make mistakes with past tenses, present perfect, or prepositions, provide a subtle Arabic refinement tip.`,
    sampleReplies: [
      "Sure! I have over four years of experience in project management.",
      "My greatest strength is solving complex problems under tight deadlines.",
      "I led a cross-functional team to launch a digital transformation project.",
    ],
  },
  {
    id: 'airport_travel',
    titleAr: 'في المطار وحجز الفندق',
    descAr: 'تسجيل الدخول في المطار، الجوازات، والتعامل مع الفندق والمواصلات',
    icon: 'Plane',
    initialMessageEn: "Good afternoon, sir/madam. May I see your passport and flight confirmation code, please?",
    initialMessageAr: 'مساء الخير. هل يمكنني رؤية جواز سفرك ورمز تأكيد الرحلة من فضلك؟',
    systemPrompt: `You are an airline check-in officer and airport immigration officer.
Roleplay airport scenarios: luggage check, window vs aisle seat, boarding gate, immigration questions ("Purpose of your visit?").
Correct Arabic speaker travel phrasing traps.`,
    sampleReplies: [
      "Here is my passport and boarding pass.",
      "I would prefer a window seat, please.",
      "I have one piece of check-in luggage and a carry-on bag.",
    ],
  },
  {
    id: 'clinic_visit',
    titleAr: 'في عيادة الطبيب والصيدلية',
    descAr: 'وصف الأعراض الطبية، الألم، وتلقي تعليمات العلاج والجرعات بالإنجليزية',
    icon: 'Activity',
    initialMessageEn: "Hello, please take a seat. What seems to be the problem today? Where is the pain?",
    initialMessageAr: 'أهلاً بك، تفضل بالجلوس. ما المشكلة التي تعاني منها اليوم؟ وأين موضع الألم؟',
    systemPrompt: `You are a caring doctor at an international clinic.
Help the patient describe symptoms (headache, sore throat, fever, nausea, sprained ankle).
Teach accurate medical vocabulary (e.g. difference between pain, ache, hurt, prescribe, dosage).`,
    sampleReplies: [
      "I have had a severe headache and fever since yesterday.",
      "My throat hurts when I swallow food.",
      "Do I need a prescription for this medicine?",
    ],
  },
];
