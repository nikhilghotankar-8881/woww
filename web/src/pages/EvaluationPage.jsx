import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { ExtractionChart } from '../components/evaluation/ExtractionChart';
import { DetectionChart } from '../components/evaluation/DetectionChart';
import { MatchingChart } from '../components/evaluation/MatchingChart';
import { LatencyChart } from '../components/evaluation/LatencyChart';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import localEvalRuns from '../../../data/eval/eval-results.json';
import { BarChart3, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export function EvaluationPage() {
  const { t } = useTranslation();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvalRuns = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setRuns(localEvalRuns || []);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('eval_runs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setRuns(data);
      } else {
        setRuns(localEvalRuns || []);
      }
    } catch {
      setRuns(localEvalRuns || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvalRuns();
  }, []);

  const extractionRun = runs.find(r => r.type === 'extraction');
  const detectionRun = runs.find(r => r.type === 'detection');
  const matchingRun = runs.find(r => r.type === 'matching');
  const latencyRun = runs.find(r => r.type === 'latency');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Published & Ground-Truth Benchmarks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('eval.title')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {t('eval.subtitle')}
            </p>
          </div>

          <button
            onClick={fetchEvalRuns}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Metrics</span>
          </button>
        </div>

        {/* Evaluation Disclaimer */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800 block mb-1">What these numbers prove (and what they do not):</strong>
          These charts show algorithmic accuracy on hand-labelled government notices, synthetic profiles, and replayed snapshots. They demonstrate that extraction, classification, and grounding behave as specified. They do <em>not</em> represent real-world farmer adoption or socio-economic outcomes.
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Evaluation Runs Recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {t('eval.empty')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {extractionRun && <ExtractionChart run={extractionRun} />}
          {detectionRun && <DetectionChart run={detectionRun} />}
          {matchingRun && <MatchingChart run={matchingRun} />}
          {latencyRun && <LatencyChart run={latencyRun} />}
        </div>
      )}
    </div>
  );
}

