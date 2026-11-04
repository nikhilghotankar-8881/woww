import React from 'react';
import { useTranslation } from '../../i18n';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

export function MatchChip({ state = 'NEED_INFO', reasons = [] }) {
  const { lang, t } = useTranslation();
  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  if (state === 'MAY_APPLY') {
    return (
      <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center space-x-2 text-emerald-900 font-black text-sm sm:text-base">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{isMarathi ? '🟢 तुम्ही या योजनेसाठी अर्ज करू शकता' : (isHindi ? '🟢 आप इस योजना के लिए आवेदन कर सकते हैं' : '🟢 May apply')}</span>
        </div>
        {reasons.length > 0 && (
          <ul className="mt-2 text-xs sm:text-sm text-emerald-900/90 space-y-1 pl-6 list-disc">
            {reasons.map((r, i) => (
              <li key={i} className="leading-relaxed">{r}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (state === 'NOT_MATCHING') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
          <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{isMarathi ? '⚪ सध्याचे निकष पूर्ण होत नाहीत' : (isHindi ? '⚪ वर्तमान मानदंड मेल नहीं खाते' : 'Doesn\'t meet stated criteria')}</span>
        </div>
        {reasons.length > 0 && (
          <ul className="mt-2 text-xs text-slate-600 space-y-1 pl-6 list-disc">
            {reasons.map((r, i) => (
              <li key={i} className="leading-relaxed">{r}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>{isMarathi ? '🟡 अधिक माहिती किंवा ई-केवायसी आवश्यक' : (isHindi ? '🟡 अधिक जानकारी या ई-केवाईसी आवश्यक' : 'Need more info / action')}</span>
      </div>
      {reasons.length > 0 && (
        <ul className="mt-2 text-xs sm:text-sm text-amber-900/90 space-y-1 pl-6 list-disc">
          {reasons.map((r, i) => (
            <li key={i} className="leading-relaxed">{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MatchChip;
