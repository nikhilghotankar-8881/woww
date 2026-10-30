import React from 'react';
import { useTranslation } from '../../i18n';
import { AlertCircle, ShieldAlert, Lock } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Honesty Box */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 sm:p-5 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-amber-300 block mb-1 font-semibold">
                Honesty & Accuracy Statement
              </strong>
              {t('footer.honesty')}
            </div>
          </div>
        </div>

        {/* Badges & Disclaimers */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 space-y-4 sm:space-y-0 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span>{t('footer.notOfficial')}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>{t('footer.privacy')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

