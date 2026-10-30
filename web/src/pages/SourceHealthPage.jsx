import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import localSources from '../../../data/sources.seed.json';
import {
  Activity,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ExternalLink,
  Shield,
  AlertTriangle,
  FileQuestion
} from 'lucide-react';

const CONFLICT_LEDGER = [
  {
    topic: 'PMFBY Kharif vs Rabi Farmer Share',
    valueA: 'Kharif 2% / Rabi 1.5%',
    valueB: 'Kharif 1.5% / Rabi 2% (seen on one explainer)',
    source: 'National Guidelines vs Aggregator',
    status: 'Resolved in favor of National Operational Guidelines'
  },
  {
    topic: 'NSMNY Annual Amount',
    valueA: '₹6,000 / year (3 instalments of ₹2,000)',
    valueB: '₹9,000 / year (wire news snippet)',
    source: 'MahaDBT vs Wire Report',
    status: 'Pending official Government Resolution (GR)'
  },
  {
    topic: 'PDMC Micro-Irrigation Parent Scheme',
    valueA: 'PMKSY-PDMC (historical label)',
    valueB: 'PM-RKVY-PDMC (2022-23 onwards)',
    source: '2026 Operational Guidelines',
    status: 'Confirmed under PM-RKVY framework'
  },
  {
    topic: 'PM-KISAN Latest Instalment',
    valueA: '22nd instalment (13 Mar 2026 on home banner)',
    valueB: '23rd instalment (20 Jun 2026 secondary report)',
    source: 'PM-KISAN Portal vs News Aggregator',
    status: 'Retaining 22nd from primary portal copy'
  },
  {
    topic: 'PMFBY Maharashtra Rabi Cut-off',
    valueA: '15 Dec (guidelines indicative)',
    valueB: '31 Dec (most states notification)',
    source: 'State Agriculture Dept Notification',
    status: 'Binding on District & Crop notification'
  }
];

export function SourceHealthPage() {
  const { t } = useTranslation();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSources() {
      if (!isSupabaseConfigured()) {
        setSources(localSources);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.from('sources').select('*').order('id');
        if (!error && data && data.length > 0) {
          setSources(data);
        } else {
          setSources(localSources);
        }
      } catch {
        setSources(localSources);
      } finally {
        setLoading(false);
      }
    }
    fetchSources();
  }, []);

  const getStatusBadge = (status, mode) => {
    if (mode === 'manual' || status === 'manual') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Manual Review</span>
        </span>
      );
    }
    if (status === 'ok') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Operational (Auto)</span>
        </span>
      );
    }
    if (status === 'structure-changed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Structure Changed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
        <span>Blocked / Error</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>Crawler Health & Source Integrity</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('sources.title')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          {t('sources.subtitle')}
        </p>
      </div>

      {/* Sources Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900">Monitored Official Endpoints ({sources.length})</h2>
          <span className="text-xs text-slate-500">Polite User-Agent • 60-min intervals</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600 mx-auto"></div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sources.map((src) => (
              <div key={src.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-400">[{src.id}]</span>
                    <h3 className="font-bold text-sm text-slate-900">{src.name}</h3>
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-brand-700 hover:underline"
                  >
                    <span>{src.url}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  {src.tos_note && (
                    <p className="text-xs text-slate-500 pt-1">
                      <span className="font-medium text-slate-700">Etiquette:</span> {src.tos_note}
                    </p>
                  )}

                  {src.last_error && (
                    <p className="text-xs text-rose-600 font-medium">
                      Last error: {src.last_error}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex sm:flex-col sm:items-end justify-between gap-2">
                  {getStatusBadge(src.status, src.mode)}
                  <span className="text-[11px] text-slate-400">
                    Interval: {src.interval_min}m • Mode: {src.mode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Conflict Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Public Conflict Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregator pages frequently contradict each other. We track and publish discrepancies rather than presenting unverified assumptions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Topic / Policy</th>
                <th className="px-4 py-3">Value A</th>
                <th className="px-4 py-3">Value B</th>
                <th className="px-4 py-3">Resolution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {CONFLICT_LEDGER.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{row.topic}</td>
                  <td className="px-4 py-3 text-slate-600">{row.valueA}</td>
                  <td className="px-4 py-3 text-slate-600">{row.valueB}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

