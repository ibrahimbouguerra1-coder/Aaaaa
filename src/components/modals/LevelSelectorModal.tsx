import React from 'react';
import { X, Compass, Check } from 'lucide-react';
import { cefrLevels } from '../../data/curriculum';
import { useLearner } from '../../context/LearnerContext';
import { CEFRLevel } from '../../types';

interface LevelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlacementTest: () => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  isOpen,
  onClose,
  onOpenPlacementTest,
}) => {
  const { progress, setEstimatedLevel } = useLearner();
  if (!isOpen) return null;

  const handleSelect = (lvl: CEFRLevel) => {
    setEstimatedLevel(lvl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] shadow-2xl p-6 text-right space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-[#263137] pb-3">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#1cb0f6]" />
              <span>تحديد المستوى المستهدف</span>
            </h3>
            <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
              اختر المستوى الذي ترغب بالتركيز عليه أو ابدأ الاختبار.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#afafaf] hover:text-slate-900 dark:hover:text-white font-black cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {cefrLevels.map((lvl) => {
            const isCurrent = progress.estimatedLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleSelect(lvl.id)}
                className={`w-full p-3.5 rounded-2xl border-2 border-b-4 flex items-center justify-between gap-3 text-right transition cursor-pointer select-none active:translate-y-0.5 active:border-b-2 ${
                  isCurrent
                    ? 'bg-[#eefbe7] dark:bg-[#1a3818] border-[#58cc02] border-b-[#46a302] text-[#2d6600] dark:text-[#a5ff6b]'
                    : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-slate-800 dark:text-slate-200 hover:border-[#58cc02]'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-en font-black text-sm px-2.5 py-0.5 rounded-lg bg-[#f7f7f7] dark:bg-[#131f24] text-slate-700 dark:text-slate-300 border border-[#e5e5e5] dark:border-[#37464f]">
                      {lvl.id}
                    </span>
                    <span className="text-sm font-black">{lvl.titleAr}</span>
                  </div>
                  <p className="text-[11px] text-[#777777] dark:text-[#afafaf] line-clamp-1 font-bold">
                    {lvl.descAr}
                  </p>
                </div>
                {isCurrent && <Check className="w-5 h-5 text-[#58cc02] shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenPlacementTest();
          }}
          className="w-full py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#2bc0ff] text-white font-black text-xs border-2 border-b-4 border-[#1482b7] transition cursor-pointer text-center active:translate-y-1 active:border-b-0 shadow-md"
        >
          إجراء اختبار تشخيصي دقيق (5 أسئلة)
        </button>
      </div>
    </div>
  );
};
