import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { FarmerGuideModal } from '../components/common/FarmerGuideModal';
import { DeadlineAlertBanner } from '../components/alerts/DeadlineAlertBanner';
import { FarmerMetricsWidget } from '../components/dashboard/FarmerMetricsWidget';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import localSchemes from '../../../data/schemes.seed.json';
import {
  BookOpen,
  ShieldCheck,
  Search,
  Sparkles,
  HelpCircle,
  Banknote,
  Shield,
  Droplets,
  Tractor,
  Layers
} from 'lucide-react';

export function SchemesPage() {
  const { lang, t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

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
    const matchesSearch = s.name.toLowerCase().includes(q) ||
      (s.name_mr && s.name_mr.includes(q)) ||
      (s.name_hi && s.name_hi.includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Urgent Deadline Alert Banner with Call & WhatsApp Dispatch Simulator */}
      <DeadlineAlertBanner />

      {/* 2. Hero Header with Farmer Guide Brochure Trigger */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isMarathi ? '१००% अधिकृत शासकीय स्रोत पडताळणी' : '100% Primary Source Grounding'}</span>
              </span>

              <button
                type="button"
                onClick={() => setGuideModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 transition-colors shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                <span>{isMarathi ? '📖 कसे वापरावे? (माहिती पुस्तिका)' : isHindi ? '📖 उपयोग कैसे करें? (विवरणिका)' : '📖 How to Use (Brochure)'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {t('schemes.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              {isMarathi
                ? 'कोणतीही खोटी बातमी नाही — सर्व योजनांची माहिती थेट शासकीय राजपत्रावरून तपासलेली आहे. आपल्या हक्काचा लाभ वेळेत मिळवा.'
                : t('schemes.subtitle')}
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full lg:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder={isMarathi ? 'योजना किंवा पीक शोधा...' : isHindi ? 'योजना या फसल खोजें...' : 'Search scheme or crop...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              categoryFilter === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'सर्व योजना' : 'All Schemes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('income-support')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              categoryFilter === 'income-support'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>{isMarathi ? '💰 थेट खात्यात मदत (₹12,000)' : 'Income Support'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('insurance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              categoryFilter === 'insurance'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isMarathi ? '🛡️ पीक विमा (₹1)' : 'Crop Insurance'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('irrigation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              categoryFilter === 'irrigation'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{isMarathi ? '💧 ठिबक सिंचन अनुदान' : 'Irrigation'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('mechanization')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              categoryFilter === 'mechanization'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Tractor className="w-3.5 h-3.5" />
            <span>{isMarathi ? '🚜 कृषी अवजारे अनुदान' : 'Mechanization'}</span>
          </button>
        </div>
      </div>

      {/* 3. Farmer Mental Model Metrics & Visual Graphs */}
      <FarmerMetricsWidget totalBenefit={12000} activeDeadlines={1} totalSchemes={schemes.length || 5} />

      {/* 4. Schemes Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <p className="text-slate-500 text-sm">
            {isMarathi ? 'कोणतीही योजना आढळली नाही.' : 'No schemes match your filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}

      {/* Visual Brochure Modal */}
      <FarmerGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </div>
  );
}

export default SchemesPage;
