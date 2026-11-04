import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { VoiceCallSimulatorModal } from './VoiceCallSimulatorModal';
import { WhatsAppAlertModal } from './WhatsAppAlertModal';
import { VoiceReader } from '../common/VoiceReader';
import {
  AlertTriangle,
  Clock,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function DeadlineAlertBanner({ scheme, onOpenDetails }) {
  const { lang, t } = useTranslation();
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  const alertTitle = isMarathi
    ? '🚨 तातडीची सूचना: रब्बी पीक विमा (PMFBY) अर्ज करण्याची शेवटची मुदत वाढवली!'
    : isHindi
    ? '🚨 महत्वपूर्ण चेतावनी: रबी फसल बीमा (PMFBY) आवेदन की अंतिम तिथि बढ़ाई गई!'
    : '🚨 Urgent Advisory: PMFBY Rabi Crop Insurance Application Cut-off Extended!';

  const alertDesc = isMarathi
    ? 'महाराष्ट्र शासनाच्या कृषी विभागाच्या ताज्या आदेशानुसार रब्बी हंगामातील गहू, हरभरा व रब्बी ज्वारीसाठी १ रुपयात पीक विमा अर्ज करण्याची अंतिम मुदत ३१ डिसेंबर २०२६ पर्यंत वाढवण्यात आली आहे.'
    : isHindi
    ? 'कृषि विभाग के नवीनतम आदेशानुसार रबी सीजन में गेहूं, चना एवं रबी ज्वार के लिए ₹1 में फसल बीमा कराने की अंतिम तिथि 31 दिसंबर 2026 तक बढ़ा दी गई है।'
    : 'According to the latest agriculture department circular, the cut-off for ₹1 crop insurance enrollment for Rabi season has been extended to 31 December 2026.';

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 rounded-3xl p-1 text-white shadow-lg animate-in slide-in-from-top-2 duration-300">
        <div className="bg-slate-950/90 rounded-[22px] p-4 sm:p-6 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left side: Alert Details */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                  <span>{isMarathi ? 'मुदत बदल सूचना' : isHindi ? 'अंतिम तिथि विस्तार' : 'Deadline Extended'}</span>
                </span>

                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isMarathi ? '६ दिवस शिल्लक (31 डिसे अंतिम)' : isHindi ? '6 दिन शेष (31 दिसं)' : '6 Days Left (31 Dec)'}</span>
                </span>

                {/* Inline Voice Reader */}
                <VoiceReader
                  title={alertTitle}
                  text={alertDesc}
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                />
              </div>

              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {alertTitle}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {alertDesc}
              </p>
            </div>

            {/* Right side: Action Triggers (Call, WhatsApp, Apply) */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              {/* Voice Call Simulation */}
              <button
                type="button"
                onClick={() => setCallModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-sm transition-all hover:scale-105"
                title="Hear automated voice call alert simulation"
              >
                <PhoneCall className="w-4 h-4 text-emerald-200 animate-bounce" />
                <span>{isMarathi ? 'कॉल ऐका' : isHindi ? 'कॉल सुनें' : 'Listen to Call'}</span>
              </button>

              {/* WhatsApp Alert Simulation */}
              <button
                type="button"
                onClick={() => setWaModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-sm transition-all hover:scale-105"
                title="Preview WhatsApp alert sent to farmer's mobile"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#25d366]" />
                <span>{isMarathi ? 'व्हॉट्सॲप' : 'WhatsApp'}</span>
              </button>

              {/* Direct Official Apply Link */}
              <a
                href="https://pmfby.gov.in"
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-black flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <span>{isMarathi ? 'अर्ज करा' : isHindi ? 'आवेदन करें' : 'Apply Now'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <VoiceCallSimulatorModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        schemeName={isMarathi ? 'प्रधानमंत्री पीक विमा योजना (रब्बी हंगाम)' : 'Pradhan Mantri Fasal Bima Yojana (Rabi)'}
        deadlineText={isMarathi ? '३१ डिसेंबर २०२६' : '31st December 2026'}
      />

      <WhatsAppAlertModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        schemeName="PMFBY Rabi Season 2026"
      />
    </>
  );
}

export default DeadlineAlertBanner;

