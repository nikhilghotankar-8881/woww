import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { VoiceReader } from '../common/VoiceReader';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building,
  Banknote,
  ShieldCheck,
  FileText,
  ExternalLink,
  Sparkles,
  Droplets,
  Tractor
} from 'lucide-react';

export function SchemeCard({ scheme = {} }) {
  const { lang, t } = useTranslation();

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  const displayName = isMarathi && scheme.name_mr
    ? scheme.name_mr
    : (isHindi && scheme.name_hi ? scheme.name_hi : scheme.name);

  // Provenance metrics
  const facts = scheme.facts || {};
  const factKeys = Object.keys(facts);
  const verifiedCount = factKeys.filter(k => facts[k]?.status === 'verified').length;
  const conflictCount = factKeys.filter(k => facts[k]?.status === 'conflict').length;

  // Benefit spotlight mapping
  const getBenefitSpotlight = () => {
    switch (scheme.id) {
      case 'pm-kisan':
        return {
          amount: '₹6,000',
          frequency: isMarathi ? 'दरवर्षी थेट खात्यात' : (isHindi ? 'प्रति वर्ष खाते में' : 'Per Year in 3 instalments'),
          icon: Banknote,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      case 'nsmny':
        return {
          amount: '₹6,000',
          frequency: isMarathi ? 'महाराष्ट्र शासन अतिरिक्त' : (isHindi ? 'महाराष्ट्र सरकार सहायता' : 'MH State Cash Addition'),
          icon: Banknote,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      case 'pmfby':
        return {
          amount: '₹1 टोकन',
          frequency: isMarathi ? '१००% पीक नुकसान भरपाई' : (isHindi ? '100% फसल नुकसान भरपाई' : 'Complete Crop Insurance'),
          icon: ShieldCheck,
          color: 'text-blue-700 bg-blue-50 border-blue-200'
        };
      case 'pdmc-mh':
        return {
          amount: '75% - 80%',
          frequency: isMarathi ? 'ठिबक व तुषार सिंचन अनुदान' : (isHindi ? 'ड्रिप एवं स्प्रिंकलर सब्सिडी' : 'Drip Irrigation Subsidy'),
          icon: Droplets,
          color: 'text-cyan-700 bg-cyan-50 border-cyan-200'
        };
      case 'smam-mh':
        return {
          amount: '40% - 50%',
          frequency: isMarathi ? 'ट्रॅक्टर व कृषी यंत्र अनुदान' : (isHindi ? 'ट्रैक्टर एवं कृषि यंत्र सब्सिडी' : 'Farm Machinery Subsidy'),
          icon: Tractor,
          color: 'text-amber-700 bg-amber-50 border-amber-200'
        };
      default:
        return {
          amount: isMarathi ? 'शासकीय लाभ' : 'Govt Subsidy',
          frequency: scheme.category?.replace('-', ' '),
          icon: Banknote,
          color: 'text-slate-700 bg-slate-50 border-slate-200'
        };
    }
  };

  const benefit = getBenefitSpotlight();
  const BenefitIcon = benefit.icon;

  // Speech summary text
  const speechSummary = facts.annual_benefit?.value || facts.ekyc_mandatory?.value || displayName;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between p-5 sm:p-6 group">
      <div>
        {/* Top Tag & Voice Reader */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
            scheme.level === 'central'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {scheme.level === 'central' ? (isMarathi ? 'केंद्र शासन' : 'Central') : (isMarathi ? 'महाराष्ट्र शासन' : 'State MH')}
          </span>

          <VoiceReader
            title={displayName}
            text={speechSummary}
            size="sm"
          />
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-2 group-hover:text-brand-700 transition-colors">
          {displayName}
        </h3>

        {/* Nodal Body */}
        {scheme.nodal_body && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-4">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{scheme.nodal_body}</span>
          </div>
        )}

        {/* Big Benefit Spotlight Box */}
        <div className={`p-3.5 rounded-2xl border ${benefit.color} mb-4 flex items-center space-x-3`}>
          <div className="w-10 h-10 rounded-xl bg-white/80 shadow-2xs flex items-center justify-center shrink-0">
            <BenefitIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight leading-none">
              {benefit.amount}
            </div>
            <div className="text-xs font-semibold mt-1 opacity-90">
              {benefit.frequency}
            </div>
          </div>
        </div>

        {/* Key Requirements / Documents Pills */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isMarathi ? 'आवश्यक कागदपत्रे:' : 'Documents Needed:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium flex items-center space-x-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>{isMarathi ? '७/१२ व ८-अ उतारा' : '7/12 Land Record'}</span>
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium flex items-center space-x-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>{isMarathi ? 'बँक पासबुक' : 'Bank Passbook'}</span>
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium flex items-center space-x-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>{isMarathi ? 'आधार कार्ड' : 'Aadhaar Card'}</span>
            </span>
          </div>
        </div>

        {/* Verified Facts Badges */}
        <div className="flex items-center space-x-2 text-xs mb-2">
          <div className="flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{verifiedCount} {isMarathi ? 'मुद्दे पडताळलेले' : 'Verified Facts'}</span>
          </div>

          {conflictCount > 0 && (
            <div className="flex items-center space-x-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px]">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>{conflictCount} {isMarathi ? 'विसंगती नोंद' : 'Conflict'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action links */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <Link
          to={`/schemes/${scheme.id}`}
          className="flex-1 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
        >
          <span>{isMarathi ? 'कसा अर्ज करावा?' : 'How to Apply'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
        </Link>

        {scheme.official_links?.[0]?.url && (
          <a
            href={scheme.official_links[0].url}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
            title={isMarathi ? 'अधिकृत पोर्टल उघडा' : 'Open Official Portal'}
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        )}
      </div>
    </div>
  );
}

export default SchemeCard;
