import React from 'react';
import { useTranslation } from '../../i18n';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  const options = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  return (
    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
      <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5" />
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLang(opt.code)}
          className={`px-2 py-1 rounded transition-colors ${
            lang === opt.code
              ? 'bg-brand-600 text-white font-medium shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

