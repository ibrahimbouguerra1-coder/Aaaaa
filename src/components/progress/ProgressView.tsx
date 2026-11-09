import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Award,
  BookOpen,
  CheckCircle,
  Printer,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Target,
  Zap,
  Gift,
  Crown,
  Medal,
  TrendingUp,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { allLessons, cefrLevels } from '../../data/curriculum';
import { FaresMascot } from '../common/FaresMascot';
import { AudioButton } from '../common/AudioButton';
import { playClick } from '../../utils/audio';

export const ProgressView: React.FC = () => {
  const { progress } = useLearner();
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certName, setCertName] = useState(progress.name || 'المتعلم المتميز');

  const totalLessons = allLessons.length;
  const completedCount = progress.completedLessonIds.length;
  const completedPercent = Math.round((completedCount / totalLessons) * 100);
  const masteredWordsCount = progress.savedVocabulary.filter((v) => v.mastered).length;

  const currentLevelInfo =
    cefrLevels.find((lvl) => lvl.id === progress.estimatedLevel) || cefrLevels[0];

  // Duolingo League Leaderboard Mock Data (Realistic & localized)
  const leaderboardUsers = [
    { rank: 1, name: 'سارة المهندس', xp: Math.max(progress.xp + 180, 520), avatar: '👩‍💼', isUser: false },
    { rank: 2, name: 'أحمد التميمي', xp: Math.max(progress.xp + 70, 440), avatar: '👨‍🎓', isUser: false },
    { rank: 3, name: progress.name || 'أنت (البطل)', xp: progress.xp, avatar: '🦉', isUser: true },
    { rank: 4, name: 'مريم الزهراني', xp: Math.max(progress.xp - 40, 260), avatar: '👩‍🔬', isUser: false },
    { rank: 5, name: 'خالد السعيد', xp: Math.max(progress.xp - 95, 180), avatar: '👨‍💻', isUser: false },
  ];

  const skillBars = [
    { label: 'القواعد والتراكيب (Grammar)', key: 'grammar', percent: 75, color: '#58cc02' },
    { label: 'المفردات وحصيلة الكلمات (Vocabulary)', key: 'vocabulary', percent: 80, color: '#1cb0f6' },
    { label: 'الفهم القرائي (Reading)', key: 'reading', percent: 70, color: '#00cd9c' },
    { label: 'الاستماع ومخارج الأصوات (Listening)', key: 'listening', percent: 65, color: '#ff9600' },
    { label: 'المحادثة والطلاقة (Speaking)', key: 'speaking', percent: 60, color: '#ce82ff' },
    { label: 'الصياغة والكتابة (Writing)', key: 'writing', percent: 68, color: '#ff4b4b' },
  ];

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-right max-w-4xl mx-auto pb-10">
      {/* 1. Duolingo Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#f7f7f7] dark:bg-[#202f36] border-4 border-[#58cc02] flex items-center justify-center overflow-hidden shadow-inner">
            <FaresMascot size="lg" mood="proud" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#ffc800] border-2 border-white dark:border-[#131f24] flex items-center justify-center shadow-xs">
            <Crown className="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-right flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {progress.name || 'المتعلم المتميز'}
              </h2>
              <p className="text-xs font-bold text-[#afafaf] pt-0.5">
                انضممت إلى منصة فارس • متعلم نشط في المسار الأوروبي
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 self-center sm:self-auto px-3.5 py-1.5 rounded-2xl bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6] border-2 border-b-4 border-[#1cb0f6]/30 border-b-[#1cb0f6] font-en font-black text-sm">
              <Shield className="w-4 h-4 text-[#1cb0f6]" />
              <span>Level {progress.estimatedLevel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs font-bold text-[#777777] dark:text-[#afafaf]">
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-[#ff9600] fill-[#ff9600]" />
              {progress.streakDays || 1} يوم حماس
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#ce82ff] fill-[#ce82ff]" />
              {progress.xp} XP
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-[#58cc02]" />
              {completedCount} درس منجز
            </span>
          </div>
        </div>
      </div>

      {/* 2. Overview Stats (Duolingo 3D Chunky Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] space-y-1">
          <div className="flex items-center justify-between text-[#ff9600]">
            <Flame className="w-6 h-6 fill-[#ff9600] animate-bounce" />
            <span className="text-[10px] font-black text-[#afafaf]">أيام</span>
          </div>
          <div className="font-en text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {progress.streakDays || 1}
          </div>
          <span className="text-xs text-[#777777] dark:text-[#afafaf] font-black block">حماس يومي</span>
        </div>

        {/* Total XP */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] space-y-1">
          <div className="flex items-center justify-between text-[#ce82ff]">
            <Sparkles className="w-6 h-6 fill-[#ce82ff]" />
            <span className="text-[10px] font-black text-[#afafaf]">XP</span>
          </div>
          <div className="font-en text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {progress.xp}
          </div>
          <span className="text-xs text-[#777777] dark:text-[#afafaf] font-black block">نقاط الخبرة</span>
        </div>

        {/* Lessons Completed */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] space-y-1">
          <div className="flex items-center justify-between text-[#58cc02]">
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-black text-[#afafaf] font-en">
              {completedPercent}%
            </span>
          </div>
          <div className="font-en text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {completedCount}/{totalLessons}
          </div>
          <span className="text-xs text-[#777777] dark:text-[#afafaf] font-black block">دروس أتقنتها</span>
        </div>

        {/* Mastered Words */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] space-y-1">
          <div className="flex items-center justify-between text-[#1cb0f6]">
            <Layers className="w-6 h-6" />
            <span className="text-[10px] font-black text-[#afafaf] font-en">SRS</span>
          </div>
          <div className="font-en text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {masteredWordsCount}
          </div>
          <span className="text-xs text-[#777777] dark:text-[#afafaf] font-black block">كلمات متقنة</span>
        </div>
      </div>

      {/* 3. Duolingo League & Daily Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Duolingo League / Leaderboard */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-[#263137] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ff4b4b] flex items-center justify-center text-white">
                <Trophy className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  دوري الياقوت (Ruby League)
                </h3>
                <span className="text-[11px] font-bold text-[#58cc02] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  منطقة الترقية للدوري الماسي
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#afafaf]">ينتهي خلال يومين</span>
          </div>

          <div className="space-y-2">
            {leaderboardUsers.map((user) => (
              <div
                key={user.rank}
                className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                  user.isUser
                    ? 'bg-[#e5f6ff] dark:bg-[#183648] border-2 border-[#1cb0f6] font-black'
                    : 'bg-[#f7f7f7] dark:bg-[#202f36]/60 border border-transparent hover:border-[#e5e5e5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center font-en font-black text-sm ${
                      user.rank === 1
                        ? 'text-[#ffc800]'
                        : user.rank === 2
                        ? 'text-[#afafaf]'
                        : user.rank === 3
                        ? 'text-[#cd7f32]'
                        : 'text-slate-500'
                    }`}
                  >
                    {user.rank}
                  </span>
                  <span className="text-xl">{user.avatar}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {user.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-en font-black text-xs text-[#ce82ff]">
                  <span>{user.xp}</span>
                  <span>XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duolingo Daily Quests / مهام اليوم */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-[#263137] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ffc800] flex items-center justify-center text-white">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  مهام اليوم (Daily Quests)
                </h3>
                <span className="text-[11px] font-bold text-[#afafaf]">
                  أكمل المهام لفتح صناديق الجواهر
                </span>
              </div>
            </div>
            <Gift className="w-5 h-5 text-[#ffc800] animate-pulse" />
          </div>

          <div className="space-y-3.5">
            {/* Quest 1 */}
            <div className="p-3.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36]/60 border border-[#e5e5e5] dark:border-[#37464f] space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-900 dark:text-white">اكسب 30 نقطة خبرة (XP)</span>
                <span className="font-en text-[#58cc02]">{Math.min(progress.xp, 30)}/30 XP</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#e5e5e5] dark:bg-[#37464f] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#58cc02] transition-all"
                  style={{ width: `${Math.min((progress.xp / 30) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Quest 2 */}
            <div className="p-3.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36]/60 border border-[#e5e5e5] dark:border-[#37464f] space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-900 dark:text-white">أكمل درساً جديداً في الخريطة</span>
                <span className="font-en text-[#1cb0f6]">{Math.min(completedCount, 1)}/1</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#e5e5e5] dark:bg-[#37464f] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1cb0f6] transition-all"
                  style={{ width: `${completedCount > 0 ? 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Quest 3 */}
            <div className="p-3.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36]/60 border border-[#e5e5e5] dark:border-[#37464f] space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-900 dark:text-white">احصل على 100% في أي تمرين</span>
                <span className="font-en text-[#ff9600]">1/1 ✓</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#e5e5e5] dark:bg-[#37464f] overflow-hidden">
                <div className="h-full rounded-full bg-[#ff9600] w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Duolingo-Styled Certificate Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#ffc800] via-[#ff9600] to-[#ff4b4b] text-white border-2 border-b-6 border-[#e5b400] shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 flex-1 text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Award className="w-6 h-6 text-white" />
            <h3 className="text-lg sm:text-xl font-black">
              الشهادة المعتمدة لإتقان المستوى ({progress.estimatedLevel})
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-bold">
            وثيقة رقمية رسمية تتضمن اسمك، رمز التحقق الرقمي، وختم منصة فارس لتعليم الإنجليزية، قابلة للطباعة والتنزيل.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playClick(progress.soundEffectsEnabled);
            setShowCertificateModal(true);
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-[#f7f7f7] text-[#ff9600] font-black text-sm border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          <span>معاينة وطباعة الشهادة</span>
        </button>
      </div>

      {/* 5. 6 CEFR Skills Breakdown with Duolingo Progress Bars */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-[#263137] pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              مؤشرات الكفاءة اللغوية الست (CEFR Skills)
            </h3>
            <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
              توزيع المهارات التراكمية بناءً على الدروس والتمارين التي أتممتها.
            </p>
          </div>
          <FaresMascot size="sm" mood="cheering" />
        </div>

        <div className="space-y-4">
          {skillBars.map((sk) => (
            <div key={sk.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-800 dark:text-slate-200">{sk.label}</span>
                <span className="font-en text-[#afafaf] font-black">{sk.percent}%</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-[#e5e5e5] dark:bg-[#37464f] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-inner"
                  style={{ width: `${sk.percent}%`, backgroundColor: sk.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Personal Mistake Review List */}
      {progress.personalMistakes && progress.personalMistakes.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              دفتر الهفوات والمراجعة الشخصية ({progress.personalMistakes.length})
            </h3>
            <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
              قائمة بالصيغ التي وقعت فيها بالتمارين أو المحادثة الذكية لتثبيتها وترسيخ الصيغة السليمة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {progress.personalMistakes.slice(0, 8).map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36]/60 border-2 border-[#e5e5e5] dark:border-[#37464f] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#ff4b4b] px-2.5 py-0.5 rounded-lg bg-[#ffe6e6] dark:bg-[#381616]">
                    {m.errorTypeAr}
                  </span>
                  <AudioButton textToSpeak={m.corrected} size="sm" />
                </div>
                <div className="space-y-1">
                  <p className="font-en line-through text-[#afafaf] font-bold">{m.original}</p>
                  <p className="font-en font-black text-[#58cc02] text-sm">
                    {m.corrected}
                  </p>
                </div>
                <p className="text-[#777777] dark:text-[#afafaf] leading-relaxed font-bold">{m.explanationAr}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            dir="rtl"
            className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] dark:border-[#37464f] shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#37464f] pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#ffc800]" />
                <span>شهادة إتمام المستوى المعتمدة</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#afafaf] hover:text-slate-900 dark:hover:text-white font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Certificate Canvas Preview */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 dark:from-[#131f24] dark:via-[#1a2830] dark:to-[#131f24] border-4 border-double border-[#ffc800]/80 shadow-md text-center space-y-4">
              <div className="flex justify-center">
                <FaresMascot size="md" mood="proud" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#ff9600] block font-en">
                  FARES ENGLISH ACADEMY • CERTIFICATE OF MASTERY
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  شهادة كفاءة وإتمام المستوى
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#777777] dark:text-[#afafaf] font-bold">
                يشهد مجلس منصة فارس التعليمية للغة الإنجليزية بأن المتعلم:
              </p>

              <div className="py-2">
                <input
                  type="text"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="font-black text-xl sm:text-2xl text-[#58cc02] text-center border-b-2 border-[#58cc02]/60 pb-1 focus:outline-none max-w-sm bg-transparent"
                />
              </div>

              <p className="text-xs sm:text-sm text-[#777777] dark:text-[#afafaf] max-w-md mx-auto leading-relaxed font-bold">
                قد أتم بنجاح متطلبات المستوى المعياري الأوروبي <strong>{progress.estimatedLevel}</strong> ({currentLevelInfo.titleAr})، واجتاز بنجاح تمارين النطق، القواعد، بناء الجمل، والمحادثة الصوتية.
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-[#e5e5e5] dark:border-[#37464f] text-xs text-[#afafaf] font-bold">
                <span>التاريخ: {new Date().toLocaleDateString('ar-EG')}</span>
                <span className="font-en font-bold">Serial: FE-{progress.estimatedLevel}-{(progress.xp * 73).toString(16).toUpperCase()}</span>
                <span>الختم: مُعتمد ✓</span>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-2.5 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] text-xs font-black text-[#777777] dark:text-[#afafaf] cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="px-6 py-2.5 rounded-2xl bg-[#ff9600] hover:bg-[#e08400] text-white font-black text-xs sm:text-sm border-b-4 border-[#c77200] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة الرسمية</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
