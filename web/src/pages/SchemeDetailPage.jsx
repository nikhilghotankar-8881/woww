import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { FactRow } from '../components/schemes/FactRow';
import { VoiceReader } from '../components/common/VoiceReader';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import localSchemes from '../../../data/schemes.seed.json';
import {
  ArrowLeft,
  Building,
  ExternalLink,
  FileCheck,
  ListOrdered,
  ShieldCheck,
  AlertTriangle,
  Banknote,
  FileText,
  Sparkles
} from 'lucide-react';

export function SchemeDetailPage() {
  const { id } = useParams();
  const { lang, t } = useTranslation();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  useEffect(() => {
    async function fetchScheme() {
      if (!isSupabaseConfigured()) {
        const found = localSchemes.find(s => s.id === id);
        setScheme(found || null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('schemes')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setScheme(data);
        } else {
          const fallback = localSchemes.find(s => s.id === id);
          setScheme(fallback || null);
        }
      } catch {
        const fallback = localSchemes.find(s => s.id === id);
        setScheme(fallback || null);
      } finally {
        setLoading(false);
      }
    }

    fetchScheme();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
        <h2 className="text-lg font-bold text-slate-800">Scheme Not Found</h2>
        <Link to="/" className="mt-4 inline-flex items-center text-sm font-bold text-brand-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Schemes
        </Link>
      </div>
    );
  }

  const displayName = isMarathi && scheme.name_mr
    ? scheme.name_mr
    : (isHindi && scheme.name_hi ? scheme.name_hi : scheme.name);

  const facts = scheme.facts || {};
  const factKeys = Object.keys(facts);
  const speechText = `${displayName}. ${facts.annual_benefit?.value || ''} ${facts.ekyc_mandatory?.value || ''}`;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>{isMarathi ? 'मागे जा (सर्व योजना)' : 'Back to Schemes List'}</span>
      </Link>

      {/* Scheme Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              scheme.level === 'central'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {scheme.level === 'central' ? (isMarathi ? 'केंद्र शासन' : 'Central') : (isMarathi ? 'महाराष्ट्र शासन' : 'State MH')}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 capitalize">
              {scheme.category?.replace('-', ' ') || 'AGRICULTURE'}
            </span>
          </div>

          <VoiceReader
            title={displayName}
            text={speechText}
            size="lg"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          {displayName}
        </h1>

        {scheme.nodal_body && (
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{isMarathi ? 'नोडल प्राधिकारी:' : 'Nodal Authority:'} {scheme.nodal_body}</span>
          </div>
        )}

        {/* Official Links */}
        {scheme.official_links && scheme.official_links.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {scheme.official_links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>{link.label}</span>
                <ExternalLink className="w-4 h-4 text-white/80" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Documents & Application Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Documents */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
            <FileCheck className="w-5 h-5 text-brand-600" />
            <span>{t('schemes.documents')}</span>
          </h3>
          {scheme.documents && scheme.documents.length > 0 ? (
            <ul className="space-y-2.5">
              {scheme.documents.map((doc, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="font-medium">{doc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific documents enumerated.</p>
          )}
        </div>

        {/* Application Steps */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
            <ListOrdered className="w-5 h-5 text-emerald-600" />
            <span>{t('schemes.steps')}</span>
          </h3>
          {scheme.steps && scheme.steps.length > 0 ? (
            <ol className="space-y-2.5">
              {scheme.steps.map((st, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{st}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-500 italic">No steps enumerated.</p>
          )}
        </div>
      </div>

      {/* Verified Facts Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{t('schemes.verifiedFacts')} ({factKeys.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isMarathi
                ? 'प्रत्येक मुद्दा थेट शासकीय राजपत्राशी जोडलेला आहे. मानवी तपासणीशिवाय कोणतीही माहिती जोडली जात नाही.'
                : 'Each fact is independently grounded to its primary official notification or portal.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {factKeys.map(k => (
            <FactRow key={k} label={k} fact={facts[k]} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SchemeDetailPage;
