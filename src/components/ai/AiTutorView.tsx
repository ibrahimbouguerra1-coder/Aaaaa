import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Coffee,
  Briefcase,
  Plane,
  Activity,
  MessageCircle,
} from 'lucide-react';
import { AI_SCENARIOS, MOTHER_TONGUE_RULES } from '../../data/aiTutorData';
import { AiScenario, ChatMessage } from '../../types';
import { AudioButton } from '../common/AudioButton';
import { FaresMascot } from '../common/FaresMascot';
import { useLearner } from '../../context/LearnerContext';
import { playClick, playError, playSuccess, speakText, stopSpeech } from '../../utils/audio';

export const AiTutorView: React.FC = () => {
  const { progress, recordPersonalMistake } = useLearner();
  const [selectedScenario, setSelectedScenario] = useState<AiScenario>(AI_SCENARIOS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'fares',
      text: AI_SCENARIOS[0].initialMessageEn,
      arabicTranslation: AI_SCENARIOS[0].initialMessageAr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = progress.preferredAccent === 'UK' ? 'en-GB' : 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            playClick(progress.soundEffectsEnabled);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [progress.preferredAccent]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('التعرف الصوتي غير مدعوم في هذا المتصفح. يمكنك كتابة النص مباشرة.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      setInputText('');
      recognitionRef.current.start();
      setIsListening(true);
      playClick(progress.soundEffectsEnabled);
    }
  };

  const handleScenarioChange = (scenario: AiScenario) => {
    playClick(progress.soundEffectsEnabled);
    setSelectedScenario(scenario);
    setMessages([
      {
        id: `init-${scenario.id}`,
        sender: 'fares',
        text: scenario.initialMessageEn,
        arabicTranslation: scenario.initialMessageAr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const checkMotherTongueTransfer = (text: string) => {
    for (const rule of MOTHER_TONGUE_RULES) {
      if (rule.pattern.test(text)) {
        return {
          original: text.match(rule.pattern)?.[0] || text,
          corrected: rule.correctedText,
          explanationAr: rule.explanationAr,
          errorTypeAr: rule.errorTypeAr,
        };
      }
    }
    return null;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isGenerating) return;

    playClick(progress.soundEffectsEnabled);
    setInputText('');

    // 1. Check local mother-tongue syntactic transfer
    const localError = checkMotherTongueTransfer(text);
    if (localError) {
      recordPersonalMistake({
        original: localError.original,
        corrected: localError.corrected,
        errorTypeAr: localError.errorTypeAr,
        explanationAr: localError.explanationAr,
        source: 'المعلم الذكي - مستر فارس',
      });
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      detectedError: localError
        ? {
            original: localError.original,
            corrected: localError.corrected,
            explanationAr: localError.explanationAr,
          }
        : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          scenarioId: selectedScenario.id,
          systemPrompt: selectedScenario.systemPrompt,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          userLevel: progress.estimatedLevel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.replyEn || data.reply || "Good job! Keep going.";
        const replyAr = data.replyAr || undefined;
        const coachingTipAr = data.coachingTipAr || undefined;

        const faresMsg: ChatMessage = {
          id: `fares-${Date.now()}`,
          sender: 'fares',
          text: replyText,
          arabicTranslation: replyAr,
          coachingTipAr,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([...newMessages, faresMsg]);

        if (autoSpeakReplies) {
          speakText(replyText, {
            accent: progress.preferredAccent,
            rate: progress.speechPace,
          });
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.warn('Using offline tutor fallback:', err);
      let fallbackReply = `That is very clear! Let's continue discussing this in English. What else can you add?`;
      let fallbackTip: string | undefined = undefined;

      if (localError) {
        fallbackTip = `ملاحظة تدريبية: تذكر أن نقول "${localError.corrected}" بدلاً من "${localError.original}". ${localError.explanationAr}`;
      }

      if (selectedScenario.id === 'coffee_shop') {
        fallbackReply = `Great choice! That will be $4.50. Would you like to pay with cash or card?`;
      } else if (selectedScenario.id === 'job_interview') {
        fallbackReply = `Thank you for sharing that. Could you describe a challenging project you handled successfully?`;
      } else if (selectedScenario.id === 'airport_travel') {
        fallbackReply = `Here is your boarding pass. Gate B12 starts boarding in 45 minutes. Have a pleasant flight!`;
      }

      const faresMsg: ChatMessage = {
        id: `fares-${Date.now()}`,
        sender: 'fares',
        text: fallbackReply,
        coachingTipAr: fallbackTip,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newMessages, faresMsg]);

      if (autoSpeakReplies) {
        speakText(fallbackReply, {
          accent: progress.preferredAccent,
          rate: progress.speechPace,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-4 h-4 text-[#ff9600]" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-[#1cb0f6]" />;
      case 'Plane':
        return <Plane className="w-4 h-4 text-[#58cc02]" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-[#ff4b4b]" />;
      default:
        return <MessageCircle className="w-4 h-4 text-[#ce82ff]" />;
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-8">
      {/* 1. Tutor Header (Duolingo Tactile 3D Banner) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <FaresMascot size="md" mood={isGenerating ? 'thinking' : 'happy'} />
          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-2">
              <span className="font-en text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-[#f2e6ff] dark:bg-[#2c1b3f] text-[#ce82ff] border border-[#ce82ff]/30">
                AI Coach
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                مستر فارس | المدرب الصوتي التفاعلي
              </h2>
            </div>
            <p className="text-xs text-[#777777] dark:text-[#afafaf] font-bold">
              تحدث بالصوت أو اكتب، وسيقوم مستر فارس بتصويب قواعدك وتدريبك على الإنجليزية الطبيعية.
            </p>
          </div>
        </div>

        {/* Audio auto-speak toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={() => setAutoSpeakReplies(!autoSpeakReplies)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 border-b-4 text-xs font-black transition-all cursor-pointer ${
              autoSpeakReplies
                ? 'bg-[#f2e6ff] dark:bg-[#2c1b3f] border-[#ce82ff] border-b-[#af67e6] text-[#ce82ff]'
                : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-[#777777]'
            }`}
            title="نطق الردود الصوتية تلقائياً"
          >
            {autoSpeakReplies ? <Volume2 className="w-4 h-4 text-[#ce82ff]" /> : <VolumeX className="w-4 h-4" />}
            <span>النطق التلقائي</span>
          </button>
        </div>
      </div>

      {/* 2. Scenarios Duolingo Pills */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {AI_SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleScenarioChange(sc)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-b-4 text-xs font-black transition-all cursor-pointer select-none active:translate-y-1 active:border-b-2 ${
                  isSelected
                    ? 'bg-[#ce82ff] border-[#ce82ff] border-b-[#af67e6] text-white shadow-xs translate-y-[-1px]'
                    : 'bg-white dark:bg-[#202f36] border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] text-slate-800 dark:text-slate-200 hover:border-[#ce82ff]/50'
                }`}
              >
                {getScenarioIcon(sc.icon)}
                <span>{sc.titleAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Duolingo Chat Dialogue Stage */}
      <div className="rounded-3xl bg-white dark:bg-[#131f24] border-2 border-b-6 border-[#e5e5e5] dark:border-[#37464f] border-b-[#cecece] dark:border-b-[#263137] shadow-sm flex flex-col h-[540px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#fafafa] dark:bg-[#0e161a]">
          {messages.map((msg) => {
            const isFares = msg.sender === 'fares';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${isFares ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {isFares ? (
                  <div className="shrink-0 mt-1">
                    <FaresMascot size="sm" mood="happy" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-[#58cc02] border-2 border-b-4 border-[#46a302] text-white flex items-center justify-center font-black text-xs shrink-0 mt-1 shadow-xs">
                    أنت
                  </div>
                )}

                <div className={`space-y-2 max-w-[84%] sm:max-w-[74%] ${isFares ? 'text-start' : 'text-end'}`}>
                  {/* Duolingo Speech Bubble */}
                  <div
                    className={`relative p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${
                      isFares
                        ? 'bg-white dark:bg-[#202f36] text-slate-900 dark:text-white border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] shadow-xs'
                        : 'bg-[#1cb0f6] text-white border-2 border-b-4 border-[#1482b7] font-en font-black shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-en text-sm sm:text-base font-black whitespace-pre-wrap">{msg.text}</p>
                      {isFares && <AudioButton textToSpeak={msg.text} size="sm" />}
                    </div>

                    {msg.arabicTranslation && (
                      <p className="text-xs text-[#777777] dark:text-[#afafaf] pt-2 mt-2 border-t border-[#f0f0f0] dark:border-[#2f3d45] text-right font-bold">
                        {msg.arabicTranslation}
                      </p>
                    )}
                  </div>

                  {/* Coaching Note if Error Detected */}
                  {msg.detectedError && (
                    <div className="p-3.5 rounded-2xl bg-[#fff4e5] dark:bg-[#392415] border-2 border-[#ff9600] text-[#7a4100] dark:text-[#ffd699] text-xs text-right space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-black">
                        <AlertCircle className="w-4 h-4 text-[#ff9600]" />
                        <span>تنبيه تدريبي من مستر فارس:</span>
                      </div>
                      <p className="leading-relaxed font-bold">
                        الصيغة الطبيعية هي{' '}
                        <strong className="font-en text-[#58cc02] font-black">
                          {msg.detectedError.corrected}
                        </strong>{' '}
                        بدلاً من "{msg.detectedError.original}". {msg.detectedError.explanationAr}
                      </p>
                    </div>
                  )}

                  {msg.coachingTipAr && (
                    <div className="p-3.5 rounded-2xl bg-[#e5f6ff] dark:bg-[#183648] border-2 border-[#1cb0f6] text-[#0f5478] dark:text-[#a0ddff] text-xs text-right leading-relaxed font-black animate-in fade-in">
                      💡 {msg.coachingTipAr}
                    </div>
                  )}

                  <span className="text-[10px] text-[#afafaf] font-black block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-center gap-3">
              <FaresMascot size="sm" mood="thinking" className="shrink-0" />
              <div className="px-4 py-3 rounded-2xl bg-white dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] text-xs text-[#777777] dark:text-[#afafaf] font-black flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#58cc02] animate-ping" />
                <span>مستر فارس يجهز الرد المناسب...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample Suggestions Chips */}
        <div className="px-4 py-2.5 bg-white dark:bg-[#131f24] border-t-2 border-[#e5e5e5] dark:border-[#37464f] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-black text-[#afafaf] shrink-0">اقتراحات:</span>
          {selectedScenario.sampleReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(reply)}
              className="px-3.5 py-1.5 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] text-xs font-en font-black text-slate-800 dark:text-slate-200 hover:border-[#1cb0f6] whitespace-nowrap cursor-pointer active:translate-y-0.5 active:border-b-2 transition-all"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Message Input Box (Duolingo 3D Styling) */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#131f24] border-t-2 border-[#e5e5e5] dark:border-[#37464f] flex items-center gap-2.5">
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 border-b-4 transition-all cursor-pointer active:translate-y-1 active:border-b-0 ${
              isListening
                ? 'bg-[#ff4b4b] border-[#e03d3d] border-b-[#c42b2b] text-white animate-bounce'
                : 'bg-[#1cb0f6] border-[#1899d6] border-b-[#1482b7] text-white hover:bg-[#2bc0ff]'
            }`}
            title={isListening ? 'اضغط للإيقاف' : 'اضغط للتحدث بالإنجليزية'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            dir="ltr"
            placeholder={
              isListening
                ? 'جاري الاستماع لصوتك بالإنجليزية...'
                : 'Type your message in English...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#f7f7f7] dark:bg-[#202f36] border-2 border-b-4 border-[#e5e5e5] border-b-[#cecece] dark:border-[#37464f] dark:border-b-[#263137] font-en text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#58cc02] focus:border-b-[#46a302]"
          />

          {/* Send Button (Duolingo Green) */}
          <button
            type="button"
            disabled={!inputText.trim() || isGenerating}
            onClick={() => handleSendMessage()}
            className="w-12 h-12 rounded-2xl bg-[#58cc02] hover:bg-[#61e002] disabled:opacity-40 text-white flex items-center justify-center shrink-0 border-2 border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
