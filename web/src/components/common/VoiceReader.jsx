import React, { useState, useEffect } from 'react';
import { Volume2, Square, Loader2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

export function VoiceReader({ text = '', title = '', size = 'sm', className = '' }) {
  const { lang } = useTranslation();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const textToRead = title ? `${title}. ${text}` : text;
    if (!textToRead.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Map language code
    if (lang === 'mr') {
      utterance.lang = 'mr-IN';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // Try finding a matching native voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.startsWith(lang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.rate = 0.95; // slightly slower for better clarity for rural listeners
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (err) => {
      console.warn('Speech synthesis error:', err);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!supported) return null;

  const buttonLabel = speaking
    ? (lang === 'mr' ? 'थांबवा' : (lang === 'hi' ? 'रोकें' : 'Stop'))
    : (lang === 'mr' ? 'ऐका' : (lang === 'hi' ? 'सुनें' : 'Listen'));

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={speaking ? 'Stop Voice' : 'Listen to scheme details in audio'}
      aria-label={buttonLabel}
      className={`inline-flex items-center space-x-1.5 rounded-full font-bold transition-all shadow-xs ${
        speaking
          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 hover:border-emerald-400'
      } ${size === 'lg' ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-xs'} ${className}`}
    >
      {speaking ? (
        <>
          <Square className={`${size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} fill-rose-700 text-rose-700`} />
          <span>{buttonLabel}</span>
          <span className="flex space-x-0.5 ml-1">
            <span className="w-1 h-2.5 bg-rose-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-3.5 bg-rose-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-2 bg-rose-600 rounded-full animate-bounce"></span>
          </span>
        </>
      ) : (
        <>
          <Volume2 className={`${size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-emerald-700`} />
          <span>{buttonLabel}</span>
        </>
      )}
    </button>
  );
}

export default VoiceReader;

