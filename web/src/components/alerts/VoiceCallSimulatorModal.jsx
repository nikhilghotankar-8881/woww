import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { Phone, PhoneOff, Volume2, ShieldCheck, Play, Pause, Sparkles, MessageCircle } from 'lucide-react';

export function VoiceCallSimulatorModal({ isOpen, onClose, schemeName, deadlineText }) {
  const { lang } = useTranslation();
  const [callActive, setCallActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  const callerName = isMarathi
    ? 'शेतकरी सूचना सेतू — स्वयंचलित कॉल सेवा'
    : isHindi
    ? 'किसान सूचना सेतु — स्वचालित कॉल सेवा'
    : 'Shetkari Suchna Setu — Automated Voice Alert';

  const speechScript = isMarathi
    ? `नमस्कार शेतकरी बंधूंनो! शेतकरी सूचना सेतूवरून ही तातडीची सूचना आहे. ${schemeName || 'प्रधानमंत्री पीक विमा योजना'} ची अर्ज करण्याची शेवटची मुदत वाढवून ${deadlineText || '३१ डिसेंबर २०२६'} करण्यात आली आहे. धावपळ करू नका, कृपया आपल्या जवळच्या सीएससी केंद्रावर जाऊन किंवा मोबाईलवरून १ रुपयात विमा अर्ज पूर्ण करा. कोणत्याही मदतीसाठी आमची मोफत हेल्पलाइन उपलब्ध आहे. धन्यवाद!`
    : isHindi
    ? `नमस्कार किसान भाइयों! किसान सूचना सेतु से यह महत्वपूर्ण चेतावनी है। ${schemeName || 'प्रधानमंत्री फसल बीमा योजना'} की आवेदन की अंतिम तिथि बढ़ाकर ${deadlineText || '31 दिसंबर 2026'} कर दी गई है। कृपया समय रहते अपने नजदीकी सीएससी केंद्र या ऑनलाइन पोर्टल पर आवेदन पूरा करें। धन्यवाद!`
    : `Hello respected farmer! Urgent alert from Shetkari Suchna Setu. The application deadline for ${schemeName || 'Pradhan Mantri Fasal Bima Yojana'} has been officially extended to ${deadlineText || '31st December 2026'}. Please complete your registration at your nearest CSC center or online. Thank you!`;

  useEffect(() => {
    let timer;
    if (callActive) {
      timer = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  useEffect(() => {
    if (isOpen) {
      startVoiceCall();
    } else {
      stopVoiceCall();
    }
    return () => {
      stopVoiceCall();
    };
  }, [isOpen]);

  const startVoiceCall = () => {
    setCallActive(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechScript);
      utterance.lang = isMarathi ? 'mr-IN' : (isHindi ? 'hi-IN' : 'en-IN');
      utterance.rate = 0.92; // Clear phone call pacing
      utterance.pitch = 1.0;
      utterance.onend = () => {
        // keep call UI open so farmer can see transcript or replay
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopVoiceCall = () => {
    setCallActive(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleEndCall = () => {
    stopVoiceCall();
    onClose();
  };

  if (!isOpen) return null;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand-500/20 to-transparent pointer-events-none"></div>

        {/* Status */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{callActive ? (isMarathi ? 'कॉल चालू आहे...' : 'Call in progress...') : 'Call Ended'}</span>
          <span className="font-mono ml-1">{formatTime(seconds)}</span>
        </div>

        {/* Caller Avatar */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white shadow-lg ring-4 ring-white/10">
            <Phone className="w-10 h-10 animate-bounce [animation-duration:2s]" />
          </div>
          {callActive && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none opacity-40"></div>
          )}
        </div>

        {/* Caller Identity */}
        <h3 className="text-lg font-black text-center text-white mb-1">
          {callerName}
        </h3>
        <p className="text-xs text-slate-400 text-center mb-6">
          +91 1800-SETU-ALERT (Toll-Free Automated Dispatch)
        </p>

        {/* Audio Waveform visualization */}
        {callActive && (
          <div className="flex items-center justify-center space-x-1 mb-6 h-8">
            <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.1s]"></span>
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.3s]"></span>
            <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
            <span className="w-1.5 h-7 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.25s]"></span>
            <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.15s]"></span>
          </div>
        )}

        {/* Audio Message Transcript in clean box */}
        <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed mb-6 max-h-40 overflow-y-auto">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mb-1 text-[11px]">
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'कॉलमधील संदेश (मराठी):' : 'Spoken Voice Message:'}</span>
          </div>
          <p className="text-slate-200">
            "{speechScript}"
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-6 w-full">
          <button
            type="button"
            onClick={startVoiceCall}
            className="flex flex-col items-center space-y-1 text-slate-300 hover:text-white transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <span className="text-[11px] font-medium">{isMarathi ? 'पुन्हा ऐका' : 'Replay'}</span>
          </button>

          <button
            type="button"
            onClick={handleEndCall}
            className="flex flex-col items-center space-y-1 text-rose-400 hover:text-rose-300 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-lg">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold">{isMarathi ? 'कॉल बंद करा' : 'End Call'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceCallSimulatorModal;

