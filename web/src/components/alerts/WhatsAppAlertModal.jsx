import React from 'react';
import { useTranslation } from '../../i18n';
import { X, MessageSquare, CheckCheck, ExternalLink, ShieldCheck, Share2 } from 'lucide-react';

export function WhatsAppAlertModal({ isOpen, onClose, schemeName, headline, diffText }) {
  const { lang } = useTranslation();

  if (!isOpen) return null;

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  const defaultHeadline = isMarathi
    ? '🚨 महत्त्वाची शासकीय सूचना: प्रधानमंत्री पीक विमा (PMFBY) रब्बी अंतिम मुदत वाढवली!'
    : isHindi
    ? '🚨 महत्वपूर्ण सरकारी सूचना: प्रधानमंत्री फसल बीमा (PMFBY) रबी अंतिम तिथि बढ़ाई गई!'
    : '🚨 Official Advisory: PMFBY Rabi Crop Insurance Application Deadline Extended!';

  const sampleDiff = isMarathi
    ? '• पूर्वीची शेवटची तारीख: 15 डिसेंबर 2026\n• नवीन अधिकृत मुदत: 31 डिसेंबर 2026\n• कोणासाठी: गहू, हरभरा व रब्बी ज्वारी उत्पादक शेतकरी\n• आवश्यक कागदपत्र: 7/12 उतारा + बँक पासबुक'
    : isHindi
    ? '• पुरानी अंतिम तिथि: 15 दिसंबर 2026\n• नई आधिकारिक तिथि: 31 दिसंबर 2026\n• किसके लिए: गेहूं, चना और रबी ज्वार उत्पादक किसान\n• जरूरी दस्तावेज: 7/12 खतौनी + बैंक पासबुक'
    : '• Previous Cut-off: 15 December 2026\n• New Official Deadline: 31 December 2026\n• Eligible Crops: Wheat, Gram, and Rabi Jowar\n• Documents: 7/12 Land Extract + Bank Passbook';

  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#efeae2] rounded-3xl max-w-sm w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
        {/* WhatsApp Top Header Bar */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm">शेतकरी सूचना सेतू</span>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex items-center justify-center text-[10px] text-[#075e54] font-black">
                  ✓
                </span>
              </div>
              <span className="text-[11px] text-emerald-200 block">
                Official Verified Business
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Chat Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[320px] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
          {/* Security Banner */}
          <div className="bg-[#ffeecd] border border-[#f5d99f] rounded-xl p-2 text-center text-[10px] text-amber-900 shadow-2xs font-medium">
            🔒 {isMarathi ? 'अधिकृत शासकीय सूचनेची पडताळणी झाली आहे.' : 'End-to-end verified government advisory.'}
          </div>

          {/* Incoming Message Bubble */}
          <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm border border-slate-200 max-w-[95%] relative">
            {/* Header tag */}
            <div className="flex items-center space-x-1 text-emerald-700 text-[11px] font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'शासकीय निर्णय / परिपत्रक' : 'Government Gazette Alert'}</span>
            </div>

            {/* Headline */}
            <p className="font-bold text-xs text-slate-900 mb-2 leading-snug">
              {headline || defaultHeadline}
            </p>

            {/* Body */}
            <div className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 font-sans">
              {diffText || sampleDiff}
            </div>

            {/* CTA Link Button */}
            <a
              href="https://pmfby.gov.in"
              target="_blank"
              rel="noreferrer"
              className="block w-full py-2 bg-[#25d366] hover:bg-[#20ba59] text-white text-center rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1"
            >
              <span>{isMarathi ? 'अधिकृत पोर्टलवर अर्ज करा' : 'Open Official Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Time & Double Check */}
            <div className="flex items-center justify-end space-x-1 text-[10px] text-slate-400 mt-2">
              <span>{timeString}</span>
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-white p-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isMarathi ? 'शेतकऱ्यांना विनामूल्य पाठवलेला मेसेज' : 'Live WhatsApp dispatch simulation'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
          >
            {isMarathi ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppAlertModal;

