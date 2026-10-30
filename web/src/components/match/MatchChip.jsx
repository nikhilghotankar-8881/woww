import React from 'react';
import { useTranslation } from '../../i18n';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function MatchChip({ state = 'NEED_INFO', reasons = [] }) {
  const { t } = useTranslation();

  if (state === 'MAY_APPLY') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('match.may_apply')}</span>
        </div>
        {reasons.length > 0 && (
          <ul className="mt-1.5 list-disc list-inside text-xs text-emerald-900 space-y-0.5">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (state === 'NOT_MATCHING') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
        <div className="flex items-center space-x-1.5 text-rose-800 font-bold text-sm">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{t('match.not_matching')}</span>
        </div>
        {reasons.length > 0 && (
          <ul className="mt-1.5 list-disc list-inside text-xs text-rose-900 space-y-0.5">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-sm">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{t('match.need_info')}</span>
      </div>
      {reasons.length > 0 && (
        <ul className="mt-1.5 list-disc list-inside text-xs text-amber-900 space-y-0.5">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

