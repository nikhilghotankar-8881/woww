import React from 'react';
import { CheckCircle2, HelpCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n';

export function ProvenanceBadge({ status = 'unverified', verifiedOn, verifiedBy }) {
  const { t } = useTranslation();

  if (status === 'verified') {
    return (
      <span
        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
        title={verifiedOn ? `Verified by ${verifiedBy || 'Reviewer'} on ${verifiedOn}` : t('badges.verified')}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Verified</span>
      </span>
    );
  }

  if (status === 'conflict') {
    return (
      <span
        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
        title={t('badges.conflict')}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        <span>Conflict</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
      title={t('badges.unverified')}
    >
      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
      <span>Unverified</span>
    </span>
  );
}

