import React from 'react';
import { useTranslation } from '../../i18n';
import {
  Banknote,
  ShieldCheck,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function FarmerMetricsWidget({ totalBenefit = 12000, activeDeadlines = 1, totalSchemes = 5 }) {
  const { lang } = useTranslation();

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>{isMarathi ? 'शेतकरी डॅशबोर्ड व आर्थिक फायदे' : isHindi ? 'किसान डैशबोर्ड एवं आर्थिक लाभ' : 'Farmer Dashboard & Benefits'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {isMarathi ? 'तुमच्यासाठी उपलब्ध महत्त्वाचे लाभ' : isHindi ? 'आपके लिए उपलब्ध महत्वपूर्ण लाभ' : 'Key Agricultural Benefits Summary'}
          </h2>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{isMarathi ? 'रब्बी हंगाम २०२६ चालू' : isHindi ? 'रबी सत्र 2026 सक्रिय' : 'Rabi Season 2026 Active'}</span>
        </div>
      </div>

      {/* 4 Large Farmer Visual Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cash Benefit */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800">
              {isMarathi ? 'थेट वार्षिक मदत' : isHindi ? 'वार्षिक नकद सहायता' : 'Direct Annual Cash'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              ₹{totalBenefit.toLocaleString('en-IN')}
              <span className="text-xs font-bold text-emerald-700 ml-1">/ {isMarathi ? 'वर्ष' : 'yr'}</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">
              {isMarathi
                ? 'पीएम-किसान (₹6,000) + नमो शेतकरी (₹6,000)'
                : 'PM-Kisan (₹6k) + Namo Shetkari (₹6k)'}
            </p>
          </div>
        </div>

        {/* Metric 2: ₹1 Crop Insurance */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-800">
              {isMarathi ? 'पीक विमा संरक्षण' : isHindi ? 'फसल बीमा सुरक्षा' : 'Crop Insurance'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
              ₹1 <span className="text-xs font-bold text-blue-700">{isMarathi ? 'टोकन भरून' : 'Token'}</span>
            </div>
            <p className="text-[11px] text-blue-700 mt-1 font-medium">
              {isMarathi
                ? 'अवकाळी पाऊस व दुष्काळात १००% नुकसान भरपाई'
                : '100% loss coverage against hail/drought'}
            </p>
          </div>
        </div>

        {/* Metric 3: Active Deadlines */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-200 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800">
              {isMarathi ? 'अंतिम मुदत घड्याळ' : isHindi ? 'सक्रिय अंतिम तिथियां' : 'Active Deadlines'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 animate-spin [animation-duration:12s]" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
              {activeDeadlines} <span className="text-xs font-bold text-rose-600">({isMarathi ? '६ दिवस बाकी' : '6 Days Left'})</span>
            </div>
            <p className="text-[11px] text-amber-800 mt-1 font-medium">
              {isMarathi ? 'रब्बी पीक विमा शेवटची तारीख ३१ डिसेंबर' : 'PMFBY Rabi Cut-off: 31 Dec 2026'}
            </p>
          </div>
        </div>

        {/* Metric 4: Verified Provenance */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-800">
              {isMarathi ? 'शासकीय खात्री' : isHindi ? 'सरकारी प्रमाण' : 'Official Grounding'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">
              100%
            </div>
            <p className="text-[11px] text-purple-700 mt-1 font-medium">
              {isMarathi ? 'सर्व ५ योजना अधिकृत राजपत्राशी तपासलेल्या' : 'All 5 schemes verified from state & central GR'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Agricultural Season Calendar Progress */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>{isMarathi ? 'वार्षिक शेती व योजना हंगाम चक्र (Agricultural Seasons)' : 'Agricultural Season Timeline'}</span>
          </div>
          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            {isMarathi ? 'सध्या रब्बी चालू' : 'Current: Rabi'}
          </span>
        </div>

        {/* Visual 3-Stage Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {/* Kharif */}
          <div className="p-2.5 rounded-xl border border-slate-200 bg-white/70 text-slate-400">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{isMarathi ? '१. खरीप हंगाम' : '1. Kharif'}</span>
              <span className="text-[10px] text-slate-400">✓ {isMarathi ? 'पूर्ण' : 'Passed'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isMarathi ? 'जून — ऑक्टोबर' : 'Jun — Oct'}
            </span>
          </div>

          {/* Rabi (ACTIVE) */}
          <div className="p-2.5 rounded-xl border-2 border-brand-500 bg-brand-50 text-brand-900 shadow-xs relative">
            <div className="flex items-center justify-between text-xs font-black">
              <span>{isMarathi ? '२. रब्बी हंगाम' : '2. Rabi'}</span>
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping"></span>
            </div>
            <span className="text-[10px] font-bold text-brand-700 block mt-0.5">
              {isMarathi ? 'ऑक्टोबर — मार्च (सध्या चालू)' : 'Oct — Mar (ACTIVE NOW)'}
            </span>
          </div>

          {/* Summer */}
          <div className="p-2.5 rounded-xl border border-slate-200 bg-white/70 text-slate-500">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{isMarathi ? '३. उन्हाळी हंगाम' : '3. Summer'}</span>
              <span className="text-[10px] text-slate-400">{isMarathi ? 'आगामी' : 'Upcoming'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isMarathi ? 'मार्च — मे' : 'Mar — May'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerMetricsWidget;

