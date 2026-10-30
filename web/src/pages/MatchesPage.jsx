import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { MatchChip } from '../components/match/MatchChip';
import { matchProfileToScheme } from '../../../worker/lib/match.mjs';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import localSchemes from '../../../data/schemes.seed.json';
import { Link } from 'react-router-dom';
import { CheckSquare, ArrowRight, Info, ShieldAlert } from 'lucide-react';

export function MatchesPage() {
  const { lang, t } = useTranslation();
  const { profile } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
          <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>Rule-Based Determination Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('match.title')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          {t('match.subtitle')}
        </p>

        {/* Honesty Callout */}
        <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Important principle:</strong> {t('match.note')} Every determination explains the exact criteria evaluated from your profile (land, crop, season, e-KYC).
          </span>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((scheme) => {
            const matchResult = matchProfileToScheme(profile || {}, scheme.id, schemes);
            const displayName = lang === 'mr' && scheme.name_mr
              ? scheme.name_mr
              : (lang === 'hi' && scheme.name_hi ? scheme.name_hi : scheme.name);

            return (
              <div
                key={scheme.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {scheme.level || 'Central'} Scheme
                    </span>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {scheme.category?.replace('-', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-3">
                    {displayName}
                  </h3>

                  <MatchChip
                    state={matchResult.state}
                    reasons={matchResult.reasons}
                  />
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <Link
                    to={`/schemes/${scheme.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <span>View Scheme Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

