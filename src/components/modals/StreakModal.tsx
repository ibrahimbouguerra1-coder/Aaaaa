import React from 'react';
import { X, Flame, Shield, Calendar, Sparkles } from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose }) => {
  const { progress } = useLearner();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border-2 border-b-6 border-slate-200 border-b-slate-300 dark:border-slate-800 dark:border-b-slate-950 shadow-2xl p-6 text-center space-y-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/60 border-2 border-b-4 border-amber-300 border-b-amber-500 flex items-center justify-center text-amber-500">
          <Flame className="w-9 h-9 fill-amber-500 animate-bounce" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            أيام الحماس: {progress.streakDays || 1} يوم
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            أنت مستمر في التعلم يومياً! التدرب اليومي لمدة 15 دقيقة يضاعف سرعة إتقان الإنجليزية ويحافظ على حماسك.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2 justify-center">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>حماية الحماس (Streak Freeze) مفعّلة تلقائياً</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md"
        >
          متابعة التعلم
        </button>
      </div>
    </div>
  );
};
