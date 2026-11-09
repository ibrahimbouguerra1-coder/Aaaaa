import React, { useRef } from 'react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Moon,
  Sun,
  Shield,
  Flag,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { playClick } from '../../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    progress,
    setSoundEffectsEnabled,
    setPreferredAccent,
    toggleTheme,
    resetProgress,
    exportProgressJson,
    importProgressJson,
    syncNow,
    isSyncing,
  } = useLearner();

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importProgressJson(content);
        if (success) {
          alert('تم استعادة بيانات التعلم بنجاح!');
          onClose();
        } else {
          alert('تعذر قراءة ملف النسخة الاحتياطية. يرجى التأكد من صحة الملف.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    if (
      window.confirm(
        'هل أنت متأكد من رغبتك في إعادة تعيين كل التقدم المحفوظ؟ سيتم تصفير الدروس والكلمات والنقاط.'
      )
    ) {
      resetProgress();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] shadow-2xl p-6 text-right space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[#f0f0f0] dark:border-[#263137] pb-3">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#afafaf]" />
            <span>الإعدادات والتفضيلات</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#afafaf] hover:text-slate-900 dark:hover:text-white font-black cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-[#e5e5e5] dark:border-[#37464f]">
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                المؤثرات الصوتية للأزرار والنجاح
              </span>
              <span className="text-[11px] text-[#afafaf] font-bold">نغمات التشجيع والإجابة الصحيحة</span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEffectsEnabled(!progress.soundEffectsEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer border-2 ${
                progress.soundEffectsEnabled ? 'bg-[#58cc02] border-[#46a302]' : 'bg-[#e5e5e5] border-[#cecece] dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
                  progress.soundEffectsEnabled ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Accent Preference */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              اللهجة المفضلة للنطق الصوتي:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreferredAccent('US')}
                className={`p-3 rounded-2xl border-2 border-b-4 text-xs font-black flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 active:border-b-2 ${
                  progress.preferredAccent === 'US'
                    ? 'border-[#1cb0f6] border-b-[#1482b7] bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6]'
                    : 'border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-white dark:bg-[#202f36] text-[#777777]'
                }`}
              >
                <span>🇺🇸 الأمريكية</span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredAccent('UK')}
                className={`p-3 rounded-2xl border-2 border-b-4 text-xs font-black flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 active:border-b-2 ${
                  progress.preferredAccent === 'UK'
                    ? 'border-[#1cb0f6] border-b-[#1482b7] bg-[#e5f6ff] dark:bg-[#183648] text-[#1cb0f6]'
                    : 'border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-white dark:bg-[#202f36] text-[#777777]'
                }`}
              >
                <span>🇬🇧 البريطانية</span>
              </button>
            </div>
          </div>

          {/* Cloud Sync & Backup Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#f0f0f0] dark:border-[#263137]">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
              النسخ الاحتياطي والمزامنة:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={exportProgressJson}
                className="p-3 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-white dark:bg-[#202f36] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200 active:translate-y-0.5 active:border-b-2"
              >
                <Download className="w-4 h-4 text-[#58cc02]" />
                <span>تصدير JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] bg-white dark:bg-[#202f36] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200 active:translate-y-0.5 active:border-b-2"
              >
                <Upload className="w-4 h-4 text-[#1cb0f6]" />
                <span>استعادة نسخة</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <button
              type="button"
              disabled={isSyncing}
              onClick={syncNow}
              className="w-full p-3 rounded-2xl bg-[#e5f6ff] dark:bg-[#183648] border-2 border-b-4 border-[#1cb0f6] border-b-[#1482b7] text-[#1cb0f6] text-xs font-black flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 active:border-b-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة التقدم الآن'}</span>
            </button>
          </div>

          {/* Reset Progress */}
          <div className="pt-2 border-t border-[#f0f0f0] dark:border-[#263137]">
            <button
              type="button"
              onClick={handleResetConfirm}
              className="w-full p-3 rounded-2xl border-2 border-b-4 border-[#ff4b4b]/30 border-b-[#ff4b4b] text-[#ff4b4b] bg-white dark:bg-[#202f36] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 active:border-b-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>إعادة تعيين التقدم للصفر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
