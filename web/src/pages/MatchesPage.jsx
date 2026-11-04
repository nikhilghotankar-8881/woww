import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { MatchChip } from '../components/match/MatchChip';
import { VoiceReader } from '../components/common/VoiceReader';
import { matchProfileToScheme } from '../../../worker/lib/match.mjs';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import localSchemes from '../../../data/schemes.seed.json';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  ArrowRight,
  Info,
  Banknote,
  ShieldCheck,
  Edit3,
  ExternalLink,
  Sparkles,
  MapPin,
  Sprout,
  FileCheck2,
  Calendar
} from 'lucide-react';

export function MatchesPage() {
  const { lang, t } = useTranslation();
  const { profile } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('ALL');

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured()) {
        setSchemes(localSchemes);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.from('schemes').select('*');
        setSchemes(data && data.length > 0 ? data : localSchemes);
      } catch {
        setSchemes(localSchemes);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute matched items
  const matchedSchemes = schemes.map(scheme => {
    const matchResult = matchProfileToScheme(profile || {}, scheme.id, schemes);
    return {
      ...scheme,
      matchResult
    };
  });

  const mayApplyCount = matchedSchemes.filter(s => s.matchResult.state === 'MAY_APPLY').length;
  const needInfoCount = matchedSchemes.filter(s => s.matchResult.state === 'NEED_INFO').length;
  const notMatchingCount = matchedSchemes.filter(s => s.matchResult.state === 'NOT_MATCHING').length;

  const filteredList = matchedSchemes.filter(s => {
    if (filterState === 'ALL') return true;
    return s.matchResult.state === filterState;
  });

  // Action step guidance generator
  const getActionAdvice = (schemeId) => {
    switch (schemeId) {
      case 'pm-kisan':
        return isMarathi
          ? 'पुढील पायरी: जवळच्या सीएससी केंद्रात जाऊन ई-केवायसी (Biometric e-KYC) पूर्ण करा किंवा pmkisan.gov.in वर ओटीपी तपासा.'
          : (isHindi ? 'अगला कदम: नजदीकी सीएससी केंद्र पर जाकर बायोमेट्रिक ई-केवाईसी पूरा करें या पोर्टल पर ओटीपी जांचें।' : 'Next step: Complete biometric or OTP e-KYC at nearest CSC center or on pmkisan.gov.in.');
      case 'nsmny':
        return isMarathi
          ? 'पुढील पायरी: पीएम-किसानची ई-केवायसी पूर्ण असल्यास महाराष्ट्र शासनाचा ६,००० रुपयांचा अतिरिक्त लाभ आपोआप जमा होतो.'
          : (isHindi ? 'अगला कदम: पीएम-किसान ई-केवाईसी पूर्ण होने पर महाराष्ट्र सरकार की सहायता स्वतः खाते में जमा होती है।' : 'Next step: Automatic transfer once PM-KISAN Aadhaar DBT linkage is active in Maharashtra.');
      case 'pmfby':
        return isMarathi
          ? 'पुढील पायरी: ३१ डिसेंबरपूर्वी ७/१२ उतारा व पीक पेरणी स्वयंघोषणापत्र घेऊन १ रुपयात पीक विमा भरा.'
          : (isHindi ? 'अगला कदम: 31 दिसंबर से पहले 7/12 खतौनी एवं फसल बुवाई प्रमाण लेकर ₹1 में फसल बीमा करवाएं।' : 'Next step: Apply with 7/12 land extract before 31 December deadline with ₹1 token premium.');
      default:
        return isMarathi
          ? 'पुढील पायरी: महाडीबीटी शेतकरी पोर्टलवर ७/१२ उतारा जोडून ऑनलाइन अर्ज सादर करा.'
          : 'Next step: Submit online application on MahaDBT Farmer Portal with 7/12 land record.';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Profile Status Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>{isMarathi ? 'वैयक्तिक योजना जुळवणी केंद्र' : 'Farmer Matching Engine'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('match.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {isMarathi
                ? 'तुमच्या शेतातील पिके, जमीन व हंगामानुसार तुम्हाला मिळणारे लाभ खालीलप्रमाणे आहेत.'
                : t('match.subtitle')}
            </p>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs sm:text-sm font-bold border border-brand-200 transition-colors shrink-0 shadow-2xs"
          >
            <Edit3 className="w-4 h-4 text-brand-600" />
            <span>{isMarathi ? 'माझी पिके / शेती माहिती बदला' : 'Update Crops & Farm Info'}</span>
          </Link>
        </div>

        {/* Current Farm Details Chips */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isMarathi ? 'तुमची नोंदणीकृत माहिती:' : 'Current Farm Profile:'}
          </span>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>{profile?.district || 'Pune (पुणे)'}</span>
          </span>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>{(profile?.crops || ['Wheat', 'Gram']).join(', ')}</span>
          </span>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{isMarathi ? 'जमीन मालक' : 'Land Owner'}</span>
          </span>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isMarathi ? 'रब्बी हंगाम' : 'Rabi Season'}</span>
          </span>
        </div>
      </div>

      {/* 2. Filter Tabs (May Apply / Need Info / All) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterState('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            filterState === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {isMarathi ? 'सर्व योजना' : 'All Schemes'} ({matchedSchemes.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterState('MAY_APPLY')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
            filterState === 'MAY_APPLY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <span>🟢 {isMarathi ? 'थेट अर्ज करू शकता' : 'May Apply Now'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs">
            {mayApplyCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterState('NEED_INFO')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
            filterState === 'NEED_INFO'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-amber-800 hover:bg-amber-50'
          }`}
        >
          <span>🟡 {isMarathi ? 'माहिती / ई-केवायसी बाकी' : 'Need Action'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs">
            {needInfoCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterState('NOT_MATCHING')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
            filterState === 'NOT_MATCHING'
              ? 'bg-slate-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>⚪ {isMarathi ? 'इतर निकष' : 'Other'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
            {notMatchingCount}
          </span>
        </button>
      </div>

      {/* 3. Matched Schemes List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredList.map((scheme) => {
            const displayName = isMarathi && scheme.name_mr
              ? scheme.name_mr
              : (isHindi && scheme.name_hi ? scheme.name_hi : scheme.name);

            const adviceText = getActionAdvice(scheme.id);
            const speechText = `${displayName}. ${scheme.matchResult.reasons.join('. ')}. ${adviceText}`;

            return (
              <div
                key={scheme.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 hover:border-brand-400 hover:shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {scheme.level === 'central' ? (isMarathi ? 'केंद्र शासन' : 'Central') : (isMarathi ? 'महाराष्ट्र शासन' : 'State MH')}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 capitalize">
                      {scheme.category?.replace('-', ' ')}
                    </span>
                  </div>

                  <VoiceReader
                    title={displayName}
                    text={speechText}
                    size="sm"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {displayName}
                </h3>

                {/* Match Evaluation Chip */}
                <MatchChip
                  state={scheme.matchResult.state}
                  reasons={scheme.matchResult.reasons}
                />

                {/* Farmer Next Step Guidance Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                  <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">
                      {isMarathi ? 'शेतकऱ्यांनी काय करावे?' : 'Action Step for Farmer:'}
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {adviceText}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <Link
                    to={`/schemes/${scheme.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-colors"
                  >
                    <span>{isMarathi ? 'योजनेचा संपूर्ण तपशील पहा' : 'View Scheme Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                  {scheme.official_links?.[0]?.url && (
                    <a
                      href={scheme.official_links[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <span>{isMarathi ? 'अधिकृत पोर्टलवर अर्ज करा' : 'Apply on Official Portal'}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimers & Integrity Note */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start space-x-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>{isMarathi ? 'महत्त्वाची नोंद:' : 'Important Principle:'}</strong> {t('match.note')} {isMarathi ? 'हे निष्कर्ष तुमच्या शेतातील नोंदणीकृत पिके व जमिनीच्या माहितीवर आधारित मार्गदर्शन आहेत. अंतिम मंजुरी अधिकृत शासकीय पोर्टल आणि स्थानिक कृषी अधिकाऱ्यांच्या तपासणीवर अवलंबून असते.' : 'These determinations are guides based on primary criteria. Official sanctions require verification by government officers.'}
        </span>
      </div>
    </div>
  );
}

export default MatchesPage;
