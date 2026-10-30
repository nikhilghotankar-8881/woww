import React from 'react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { ExternalLink } from 'lucide-react';

export function FactRow({ label, fact = {} }) {
  const { value, sourceUrl, verifiedOn, verifiedBy, status } = fact;

  const formatKey = (str) => {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="py-3 px-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {formatKey(label)}
        </span>
        <div className="flex items-center space-x-2">
          <ProvenanceBadge
            status={status}
            verifiedOn={verifiedOn}
            verifiedBy={verifiedBy}
          />
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-brand-700 hover:text-brand-800 font-medium hover:underline"
            >
              <span>Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-800 leading-relaxed font-medium">
        {value || 'Details pending verification from primary source.'}
      </p>
      {verifiedOn && (
        <span className="text-[11px] text-slate-400 block mt-1">
          Last verified on {verifiedOn} by {verifiedBy || 'Reviewer Team'}
        </span>
      )}
    </div>
  );
}

