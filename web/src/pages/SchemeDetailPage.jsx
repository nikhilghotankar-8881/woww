import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { FactRow } from '../components/schemes/FactRow';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import localSchemes from '../../../data/schemes.seed.json';
import {
  ArrowLeft,
  Building,
  ExternalLink,
  FileCheck,
  ListOrdered,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export function SchemeDetailPage() {
  const { id } = useParams();
  const { lang, t } = useTranslation();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-lg font-bold text-slate-800">Scheme Not Found</h2>
        <Link to="/" className="mt-4 inline-flex items-center text-sm font-semibold text-brand-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Schemes
        </Link>
      </div>
    );
  }

  const displayName = lang === 'mr' && scheme.name_mr
    ? scheme.name_mr
    : (lang === 'hi' && scheme.name_hi ? scheme.name_hi : scheme.name);

  const facts = scheme.facts || {};
  const factKeys = Object.keys(facts);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Schemes List
      </Link>

      {/* Scheme Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            scheme.level === 'central'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {scheme.level || 'Central'} Scheme
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {scheme.category?.toUpperCase() || 'AGRICULTURE'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {scheme.rule_set ? 'Rule Match Active' : 'Information Only'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {displayName}
        </h1>

        {scheme.nodal_body && (
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600 mt-2">
            <Building className="w-4 h-4 text-slate-400" />
            <span>Nodal Authority: {scheme.nodal_body}</span>
          </div>
        )}

        {/* Official Links */}
        {scheme.official_links && scheme.official_links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            {scheme.official_links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                <span>{link.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Verified Facts Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{t('schemes.verifiedFacts')} ({factKeys.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each fact is independently linked to its primary official notification or portal.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {factKeys.map(k => (
            <FactRow key={k} label={k} fact={facts[k]} />
          ))}
        </div>
      </div>

      {/* Documents & Application Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
            <FileCheck className="w-4 h-4 text-brand-600" />
            <span>{t('schemes.documents')}</span>
          </h3>
          {scheme.documents && scheme.documents.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-700">
              {scheme.documents.map((doc, idx) => (
                <li key={idx} className="flex items-start space-x-2 p-2 bg-slate-50 rounded-lg">
                  <span className="text-brand-600 font-bold">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific document checklist registered yet.</p>
          )}
        </div>

        {/* Steps */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
            <ListOrdered className="w-4 h-4 text-brand-600" />
            <span>{t('schemes.steps')}</span>
          </h3>
          {scheme.steps && scheme.steps.length > 0 ? (
            <ol className="space-y-2 text-xs text-slate-700">
              {scheme.steps.map((st, idx) => (
                <li key={idx} className="flex items-start space-x-2 p-2 bg-slate-50 rounded-lg">
                  <span className="font-bold text-brand-700 bg-brand-100 rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-500 italic">Refer to official portal for step-by-step application walkthrough.</p>
          )}
        </div>
      </div>
    </div>
  );
}

