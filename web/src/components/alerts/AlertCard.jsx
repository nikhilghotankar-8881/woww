import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { DiffView } from './DiffView';
import { SimulationTag } from './SimulationTag';
import {
  Bell,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export function AlertCard({ alert = {}, onMarkRead = () => {} }) {
  const { t } = useTranslation();
  const [showDiff, setShowDiff] = useState(false);

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

  return (
    <div className={`rounded-xl border transition-all p-5 ${
      isRead
        ? 'bg-white border-slate-200 opacity-90'
        : 'bg-white border-brand-500 shadow-xs ring-1 ring-brand-500/20'
    }`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100 text-brand-800">
            {alert.scheme_id?.toUpperCase() || 'OFFICIAL NOTICE'}
          </span>
          <SimulationTag synthetic={change.synthetic} />
        </div>

        <div className="flex items-center space-x-2">
          {!isRead && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="inline-flex items-center space-x-1 text-xs text-brand-700 hover:text-brand-900 font-semibold px-2.5 py-1 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>{t('alerts.markRead')}</span>
            </button>
          )}
          {isRead && (
            <span className="text-xs text-slate-400 font-medium flex items-center">
              ✓ {t('alerts.read')}
            </span>
          )}
        </div>
      </div>

      {/* Headline */}
      <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
        {alert.headline || change.summary || 'Official notification update published.'}
      </h3>

      {/* Match Reason for this farmer */}
      {alert.reasons && alert.reasons.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 mb-3 text-xs text-slate-700">
          <span className="font-semibold text-slate-900 block mb-0.5">Why this matters to your profile:</span>
          <ul className="list-disc list-inside space-y-0.5">
            {alert.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timing and Source Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100 mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('alerts.checkedAt')}: {formatIST(change.detected_at || alert.created_at)}</span>
          </div>
        </div>

        <button
          onClick={() => setShowDiff(!showDiff)}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <span>{showDiff ? 'Hide Source Diff' : 'View Source Diff'}</span>
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
        <span>Reviewed by human before sending</span>
        <span className="text-slate-400 italic">Always confirm on official portal</span>
      </div>
    </div>
  );
}

