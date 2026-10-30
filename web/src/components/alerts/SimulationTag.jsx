import React from 'react';
import { FlaskConical } from 'lucide-react';
import { useTranslation } from '../../i18n';

export function SimulationTag({ synthetic = false }) {
  const { t } = useTranslation();

  if (!synthetic) return null;

  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs">
      <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
      <span>{t('alerts.simulation')}</span>
    </span>
  );
}

