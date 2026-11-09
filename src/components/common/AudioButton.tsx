import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakText, stopSpeech } from '../../utils/audio';
import { useLearner } from '../../context/LearnerContext';

export interface AudioButtonProps {
  textToSpeak: string;
  size?: 'sm' | 'md' | 'lg';
  rate?: number;
  className?: string;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
  accent?: 'US' | 'UK';
  title?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  size = 'md',
  rate,
  className = '',
  isPlaying: externalPlaying,
  onPlayStateChange,
  onClick,
  accent,
  title = 'استمع للنطق الإنجليزي',
}) => {
  const { progress } = useLearner();
  const [internalPlaying, setInternalPlaying] = useState(false);
  const isPlaying = externalPlaying !== undefined ? externalPlaying : internalPlaying;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
      return;
    }

    if (isPlaying) {
      stopSpeech();
      setInternalPlaying(false);
      onPlayStateChange?.(false);
      return;
    }

    setInternalPlaying(true);
    onPlayStateChange?.(true);

    const chosenAccent = accent || progress.preferredAccent || 'US';
    const chosenRate = rate || progress.speechPace || 0.85;

    speakText(textToSpeak, {
      accent: chosenAccent,
      rate: chosenRate,
      onStart: () => {
        setInternalPlaying(true);
        onPlayStateChange?.(true);
      },
      onEnd: () => {
        setInternalPlaying(false);
        onPlayStateChange?.(false);
      },
      onError: () => {
        setInternalPlaying(false);
        onPlayStateChange?.(false);
      },
    });
  };

  const sizeStyles = {
    sm: 'w-9 h-9 rounded-2xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-14 h-14 rounded-3xl',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size];

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={title}
      className={`inline-flex items-center justify-center shrink-0 border-2 border-b-4 transition-all cursor-pointer select-none active:border-b-2 active:translate-y-0.5 shadow-xs ${
        isPlaying
          ? 'bg-[#1cb0f6] text-white border-[#1899d6] border-b-[#1482b7] ring-4 ring-[#1cb0f6]/25 animate-pulse'
          : 'bg-[#1cb0f6] hover:bg-[#1899d6] text-white border-[#1899d6] border-b-[#1482b7]'
      } ${sizeStyles} ${className}`}
    >
      <Volume2 className={`${iconSizes} ${isPlaying ? 'animate-bounce' : ''}`} />
    </button>
  );
};
