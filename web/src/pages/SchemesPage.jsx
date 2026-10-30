import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import localSchemes from '../../../data/schemes.seed.json';
import { BookOpen, ShieldCheck, Search } from 'lucide-react';

export function SchemesPage() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadSchemes() {
      if (!isSupabaseConfigured()) {
        setSchemes(localSchemes);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('schemes')
          .select('*')
          .order('name');

        if (error || !data || data.length === 0) {
          setSchemes(localSchemes);
        } else {
          setSchemes(data);
        }
      } catch {
        setSchemes(localSchemes);
      } finally {
        setLoading(false);
      }
    }

    loadSchemes();
  }, []);

  const filteredSchemes = schemes.filter(s => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
      (s.name_mr && s.name_mr.includes(q)) ||
      (s.name_hi && s.name_hi.includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Primary Source Grounding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('schemes.title')}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              {t('schemes.subtitle')}
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
}

