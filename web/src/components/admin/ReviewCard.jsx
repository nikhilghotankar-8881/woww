import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { DiffView } from '../alerts/DiffView';
import { SimulationTag } from '../alerts/SimulationTag';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  Send,
  MessageCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function ReviewCard({ change = {}, onApprove = () => {}, onReject = () => {} }) {
  const { t } = useTranslation();
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showOutboundPreview, setShowOutboundPreview] = useState(false);

  const isGrounded = change.grounding === 'grounded';
  const isConflict = change.grounding === 'conflict';
  const isUngrounded = change.grounding === 'ungrounded';

  const handleApprove = async () => {
    setSubmitting(true);
    await onApprove(change.id, reviewNote);
    setSubmitting(false);
  };

  const handleReject = async () => {
    setSubmitting(true);
    await onReject(change.id, reviewNote);
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-800 text-white">
            {change.source_id}
          </span>
          <SimulationTag synthetic={change.synthetic} />
          <span className="text-xs text-slate-500">
            Detected: {new Date(change.detected_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </span>
        </div>

        {/* Grounding Status Pill */}
        <div>
          {isGrounded && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('admin.grounded')}</span>
            </span>
          )}
          {isConflict && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t('admin.conflict')}</span>
            </span>
          )}
          {isUngrounded && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>{t('admin.ungrounded')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Summary Headline */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
          Draft Alert Headline ({change.summary_method || 'template'})
        </span>
        <p className="text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
          {change.summary}
        </p>
      </div>

      {/* Extracted Fields */}
      {change.fields && change.fields.length > 0 && (
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Extracted Factual Fields ({change.fields.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {change.fields.map((f, i) => (
              <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700 capitalize">{f.name.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{f.method}</span>
                </div>
                <p className="font-semibold text-brand-700">{f.value}</p>
                <p className="text-[11px] text-slate-500 mt-1 italic">Evidence: "{f.evidence}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diff View */}
      <div className="mb-5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
          Full Line Diff
        </span>
        <DiffView diff={change.diff || []} />
      </div>

      {/* Outbound WhatsApp & SMS Broadcast Preview */}
      <div className="mb-5 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
        <button
          type="button"
          onClick={() => setShowOutboundPreview(!showOutboundPreview)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Outbound Broadcast Preview (WhatsApp & SMS)</span>
          </div>
          {showOutboundPreview ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showOutboundPreview && (
          <div className="p-4 pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* WhatsApp Card Preview */}
            <div className="bg-[#E7F8ED] border border-emerald-300 rounded-lg p-3 text-slate-800 font-sans shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1 mb-2">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Template Message</span>
              </span>
              <p className="font-bold text-emerald-950 mb-1">📢 शेतकरी सूचना सेतू | अधिकृत शासकीय सूचना बदल</p>
              <p className="text-xs mb-1">🌾 <strong>योजना:</strong> {change.source_id?.toUpperCase()}</p>
              <p className="text-xs mb-2">⚡ <strong>नवीन बदल:</strong> {change.summary}</p>
              <div className="bg-white/80 p-2 rounded border border-emerald-200 text-[11px] text-emerald-900 mb-2">
                🔗 अधिकृत पोर्टल: {change.source_id === 'pmkisan-home' ? 'https://pmkisan.gov.in/' : 'https://pmfby.gov.in/'}
              </div>
              <span className="text-[10px] text-slate-500 italic block">Delivered via WhatsApp Business Cloud API</span>
            </div>

            {/* SMS Message Preview */}
            <div className="bg-white border border-slate-300 rounded-lg p-3 text-slate-800 font-mono shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center space-x-1 mb-2 font-sans">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SMS Alert (GSM-7 &lt; 160 Chars)</span>
              </span>
              <p className="text-xs leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                [शेतकरी सूचनासेतू] {change.source_id?.toUpperCase()}: {(change.summary || '').slice(0, 85)}. खात्री करा: pmkisan.gov.in
              </p>
              <span className="text-[10px] text-slate-500 italic block mt-2 font-sans">Delivered via Twilio / MSG91</span>
            </div>
          </div>
        )}
      </div>

      {/* Grounding Notes / Warnings */}
      {change.grounding_notes && change.grounding_notes.length > 0 && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
          <strong className="block font-bold mb-1">Grounding Warning:</strong>
          <ul className="list-disc list-inside">
            {change.grounding_notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reviewer Note & Actions */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder={t('admin.reviewNote')}
          className="w-full sm:w-80 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleReject}
            disabled={submitting}
            className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
          >
            <XCircle className="w-4 h-4" />
            <span>{t('admin.reject')}</span>
          </button>

          <button
            onClick={handleApprove}
            disabled={submitting || (isUngrounded && !reviewNote)}
            title={isUngrounded && !reviewNote ? 'Ungrounded changes require an override note to approve' : ''}
            className={`px-5 py-2 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1 ${
              isUngrounded && !reviewNote
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('admin.approve')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

