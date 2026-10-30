import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { CheckCircle2, AlertTriangle, ArrowRight, Building, Award } from 'lucide-react';

export function SchemeCard({ scheme = {} }) {
  const { lang, t } = useTranslation();

  const displayName = lang === 'mr' && scheme.name_mr
    ? scheme.name_mr
    : (lang === 'hi' && scheme.name_hi ? scheme.name_hi : scheme.name);

  // Compute provenance metrics
  const facts = scheme.facts || {};
  const factKeys = Object.keys(facts);
  const verifiedCount = factKeys.filter(k => facts[k]?.status === 'verified').length;
  const conflictCount = factKeys.filter(k => facts[k]?.status === 'conflict').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-brand-500/50 hover:shadow-md transition-all flex flex-col justify-between p-5">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
            scheme.level === 'central'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {scheme.level || 'Central'} Scheme
          </span>

          <span className="text-xs text-slate-500 capitalize">
            {scheme.category?.replace('-', ' ') || 'Agriculture'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
          {displayName}
        </h3>

        {/* Nodal Body */}
        {scheme.nodal_body && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-4">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{scheme.nodal_body}</span>
          </div>
        )}

        {/* Summary if available */}
        {scheme.summary_mr && lang === 'mr' && (
          <p className="text-xs text-slate-600 mb-4 line-clamp-2 bg-slate-50 p-2 rounded">
            {scheme.summary_mr.text}
          </p>
        )}
        {scheme.summary_hi && lang === 'hi' && (
          <p className="text-xs text-slate-600 mb-4 line-clamp-2 bg-slate-50 p-2 rounded">
            {scheme.summary_hi.text}
          </p>
        )}

        {/* Provenance Stat Badges */}
        <div className="flex items-center space-x-3 text-xs text-slate-600 mb-4">
          <div className="flex items-center space-x-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{verifiedCount} Verified</span>
          </div>

          {conflictCount > 0 && (
            <div className="flex items-center space-x-1 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{conflictCount} Conflict</span>
            </div>
          )}
        </div>
      </div>

      {/* Action link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-700">
          {scheme.rule_set ? 'Rule-Guided' : 'Info-Only'}
        </span>
        <Link
          to={`/schemes/${scheme.id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-brand-700 transition-colors"
        >
          <span>{t('schemes.viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>
    </div>
  );
}

