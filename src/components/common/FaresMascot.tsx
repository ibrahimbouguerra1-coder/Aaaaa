import React from 'react';

export interface FaresMascotProps {
  mood?: 'happy' | 'cheering' | 'wave' | 'proud' | 'thinking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  speechText?: string;
  onClick?: () => void;
}

export const FaresMascot: React.FC<FaresMascotProps> = ({
  mood = 'happy',
  size = 'md',
  className = '',
  speechText,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  }[size];

  return (
    <div className={`relative inline-flex items-center gap-3 select-none ${className}`}>
      {speechText && (
        <div className="relative px-4 py-2.5 rounded-2xl bg-white dark:bg-[#202f36] text-[#4b4b4b] dark:text-[#f7f7f7] text-xs sm:text-sm font-black border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#26333a] shadow-md max-w-xs animate-in fade-in zoom-in-95 duration-200 text-right">
          <span>{speechText}</span>
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-[#e5e5e5] dark:border-l-[#37464f]" />
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-0 h-0 border-y-7 border-y-transparent border-l-7 border-l-white dark:border-l-[#202f36]" />
        </div>
      )}

      <div className={`relative shrink-0 ${sizeClasses}`} onClick={onClick}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-sm hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shadow */}
          <ellipse cx="60" cy="112" rx="36" ry="6" fill="#000000" fillOpacity="0.12" />

          {/* Duolingo Bright Green Owl Body */}
          <ellipse cx="60" cy="66" rx="40" ry="38" fill="#58cc02" />
          <path d="M22 66 C22 40 40 28 60 28 C80 28 98 40 98 66 Z" fill="#58cc02" />

          {/* Feather tufts / Owl ears */}
          <path d="M28 34 Q 38 18 48 30 Z" fill="#46a302" />
          <path d="M92 34 Q 82 18 72 30 Z" fill="#46a302" />

          {/* Belly */}
          <ellipse cx="60" cy="74" rx="28" ry="26" fill="#79db14" />

          {/* Feet */}
          <ellipse cx="44" cy="104" rx="10" ry="6" fill="#ff9600" />
          <ellipse cx="76" cy="104" rx="10" ry="6" fill="#ff9600" />

          {/* Eyes - signature large Duolingo cartoon eyes */}
          {mood === 'cheering' ? (
            <>
              <path d="M40 54 Q 50 42, 60 54" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M60 54 Q 70 42, 80 54" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'thinking' ? (
            <>
              <circle cx="44" cy="54" r="12" fill="#ffffff" stroke="#46a302" strokeWidth="2.5" />
              <circle cx="46" cy="52" r="6" fill="#1f2937" />
              <circle cx="76" cy="54" r="12" fill="#ffffff" stroke="#46a302" strokeWidth="2.5" />
              <circle cx="78" cy="52" r="6" fill="#1f2937" />
            </>
          ) : (
            <>
              <circle cx="44" cy="54" r="13" fill="#ffffff" stroke="#46a302" strokeWidth="2.5" />
              <circle cx="45" cy="54" r="6" fill="#1f2937" />
              <circle cx="43" cy="51" r="2.5" fill="#ffffff" />

              <circle cx="76" cy="54" r="13" fill="#ffffff" stroke="#46a302" strokeWidth="2.5" />
              <circle cx="75" cy="54" r="6" fill="#1f2937" />
              <circle cx="73" cy="51" r="2.5" fill="#ffffff" />
            </>
          )}

          {/* Cheeks */}
          <ellipse cx="32" cy="66" rx="5" ry="3.5" fill="#ff4b4b" fillOpacity="0.35" />
          <ellipse cx="88" cy="66" rx="5" ry="3.5" fill="#ff4b4b" fillOpacity="0.35" />

          {/* Orange Beak */}
          <path d="M52 64 Q 60 74, 68 64 Q 60 60, 52 64 Z" fill="#ff9600" stroke="#e58500" strokeWidth="1.5" />

          {/* Wings */}
          {mood === 'wave' ? (
            <>
              <path d="M22 62 C14 74 24 86 32 78 Z" fill="#46a302" />
              <path d="M96 50 C106 38 116 46 104 64 Z" fill="#46a302" />
            </>
          ) : mood === 'proud' ? (
            <>
              <path d="M22 64 C14 74 26 84 32 76 Z" fill="#46a302" />
              <path d="M98 64 C106 74 94 84 88 76 Z" fill="#46a302" />
            </>
          ) : (
            <>
              <path d="M22 66 C16 76 26 84 32 78 Z" fill="#46a302" />
              <path d="M98 66 C104 76 94 84 88 78 Z" fill="#46a302" />
            </>
          )}

          {/* Tiny Yellow Graduation/Star Badge */}
          <polygon
            points="60,82 62,86 66,87 63,90 64,94 60,92 56,94 57,90 54,87 58,86"
            fill="#ffc800"
            stroke="#e5b400"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};
