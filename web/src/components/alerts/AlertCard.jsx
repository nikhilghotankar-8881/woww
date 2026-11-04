import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { DiffView } from './DiffView';
import { SimulationTag } from './SimulationTag';
import { VoiceReader } from '../common/VoiceReader';
import {
  Bell,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export function AlertCard({ alert = {}, onMarkRead = () => {} }) {
  const { lang, t } = useTranslation();
  const [showDiff, setShowDiff] = useState(false);

  const isMarathi = lang === 'mr';
  const change = alert.changes || {};
  const isRead = Boolean(alert.read_at);

  const formatIST = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' IST';
    } catch {
      return dateStr;
    }
  };

  const headlineText = alert.headline || change.summary || 'Official notification update published.';

  return (
    <div className={`rounded-3xl border transition-all p-5 sm:p-6 ${
      isRead
        ? 'bg-white border-slate-200 opacity-90'
        : 'bg-white border-brand-500 shadow-sm ring-1 ring-brand-500/20'
    }`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-brand-100 text-brand-800">
            {alert.scheme_id?.toUpperCase() || 'OFFICIAL NOTICE'}
          </span>
          <SimulationTag synthetic={change.synthetic} />
        </div>

        <div className="flex items-center space-x-2">
          <VoiceReader
            title={alert.scheme_id?.toUpperCase()}
            text={headlineText}
            size="sm"
          />

          {!isRead && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="inline-flex items-center space-x-1 text-xs text-brand-700 hover:text-brand-900 font-bold px-3 py-1 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>{t('alerts.markRead')}</span>
            </button>
          )}
          {isRead && (
            <span className="text-xs text-slate-400 font-bold flex items-center">
              ✓ {t('alerts.read')}
            </span>
          )}
        </div>
      </div>

      {/* Headline */}
      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-3">
        {headlineText}
      </h3>

      {/* Match Reason for this farmer */}
      {alert.reasons && alert.reasons.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-3 text-xs sm:text-sm text-slate-700">
          <span className="font-bold text-slate-900 block mb-1">
            {isMarathi ? 'तुमच्यासाठी हा बदल का महत्त्वाचा आहे?' : 'Why this matters to your profile:'}
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            {alert.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timing and Source Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100 mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('alerts.checkedAt')}: {formatIST(change.detected_at || alert.created_at)}</span>
          </div>
        </div>

        <button
          onClick={() => setShowDiff(!showDiff)}
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-slate-900"
        >
          <span>{showDiff ? 'मूळ बदल लपवा (Hide Diff)' : 'शासकीय बदल पहा (View Diff)'}</span>
          {showDiff ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible Source Diff */}
      {showDiff && (
        <div className="mt-3">
          <DiffView diff={change.diff || []} />
        </div>
      )}

      {/* Grounding & Official Verification Badge */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isMarathi ? 'अधिकाऱ्यांनी पडताळून पाठवलेली सूचना' : 'Reviewed by human before dispatch'}</span>
        </div>
        <span className="text-slate-400 italic">{isMarathi ? 'अधिकृत पोर्टलवर खात्री करा' : 'Always verify on official portal'}</span>
      </div>
    </div>
  );
}

export default AlertCard;
