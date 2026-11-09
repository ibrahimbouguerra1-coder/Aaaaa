import { CEFRLevel } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const LEVEL_SPEED_MAP: Record<CEFRLevel, number> = {
  A0: 0.75,
  A1: 0.8,
  A2: 0.85,
  B1: 0.9,
  B2: 0.95,
  C1: 1.0,
  C2: 1.05,
};

function playTone(freq: number, startDelay: number, duration: number, gainVal: number, waveType: OscillatorType) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + startDelay;

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  } catch (err) {
    console.debug('Audio context tone error:', err);
  }
}

/**
 * Cheerful UI click tone
 */
export function playClick(enabled = true) {
  if (!enabled) return;
  playTone(523.25, 0, 0.09, 0.12, 'triangle');
}

/**
 * 3-note ascending success chime (C5 -> E5 -> G5)
 */
export function playSuccess(enabled = true) {
  if (!enabled) return;
  playTone(523.25, 0, 0.14, 0.14, 'sine');
  playTone(659.25, 0.1, 0.14, 0.14, 'sine');
  playTone(783.99, 0.2, 0.22, 0.16, 'sine');
}

/**
 * Low pitch error tone
 */
export function playError(enabled = true) {
  if (!enabled) return;
  playTone(196.0, 0, 0.18, 0.16, 'sawtooth');
  playTone(146.83, 0.12, 0.24, 0.14, 'sawtooth');
}

/**
 * Fanfare level up chime
 */
export function playLevelUp(enabled = true) {
  if (!enabled) return;
  playTone(523.25, 0.0, 0.12, 0.15, 'sine');
  playTone(659.25, 0.08, 0.12, 0.15, 'sine');
  playTone(783.99, 0.16, 0.14, 0.15, 'sine');
  playTone(1046.5, 0.26, 0.35, 0.18, 'sine');
}

export interface SpeakOptions {
  accent?: 'US' | 'UK';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speak English text using Web Speech API with native accent selection and custom speech rate
 */
export function speakText(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    options.onEnd?.();
    return;
  }

  // Cancel prior utterance
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore cancel error
  }

  const cleanText = text.replace(/[/`*_#~]/g, ' ').trim();
  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = options.accent === 'UK' ? 'en-GB' : 'en-US';
  utterance.rate = options.rate ?? 0.85;
  utterance.pitch = options.pitch ?? 1.0;

  // Attempt to select high quality native voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const targetLang = utterance.lang.toLowerCase();
    const matchingVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith(targetLang) || (targetLang.includes('us') && v.name.includes('Natural'))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    if (e.error !== 'interrupted' && e.error !== 'canceled') {
      console.warn('Speech synthesis error:', e);
    }
    activeUtterance = null;
    options.onError?.();
    options.onEnd?.();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
  activeUtterance = null;
}
